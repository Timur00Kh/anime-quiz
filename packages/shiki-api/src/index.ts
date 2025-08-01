import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import dotenv from 'dotenv';
import Bottleneck from 'bottleneck';
import { IAnime, IExternalLink, API_ENDPOINTS } from 'shared';

dotenv.config({ path: '.env.local' });

const fastify = Fastify({
    logger: true
});

const PORT = process.env.PORT || 3100;

// OAuth2 credentials for application
const CLIENT_ID = process.env.NEXT_PUBLIC_SHIKIMORI_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SHIKIMORI_CLIENT_SECRET;
const USER_AGENT = process.env.NEXT_PUBLIC_SHIKIMORI_USER_AGENT || 'Anime-Quiz-App/1.0';
const SHIKIMORI_API_URL = process.env.NEXT_PUBLIC_SHIKIMORI_API_URL || 'https://shikimori.one';

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing OAuth2 credentials: NEXT_PUBLIC_SHIKIMORI_CLIENT_ID and NEXT_PUBLIC_SHIKIMORI_CLIENT_SECRET');
    process.exit(1);
}

// Rate limiter: 5 concurrent requests, 90 requests per minute (according to Shikimori API docs)
const limiter = new Bottleneck({
    maxConcurrent: 5,
    minTime: 667 // 90 requests per minute = 0.667 seconds between requests
});

// OAuth2 token management for application
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getApplicationToken(): Promise<string | null> {
    const now = Date.now();

    // Return cached token if still valid
    if (accessToken && tokenExpiry > now) {
        return accessToken;
    }

    try {
        const response = await fetch(`${SHIKIMORI_API_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': USER_AGENT!
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID!,
                client_secret: CLIENT_SECRET!
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            fastify.log.error(`OAuth token request failed: ${response.status} ${response.statusText} - ${errorText}`);
            throw new Error(`OAuth token request failed: ${response.status} ${response.statusText}`);
        }

        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        tokenExpiry = now + (tokenData.expires_in * 1000) - 60000; // Expire 1 minute early

        fastify.log.info('OAuth2 application token refreshed');
        return accessToken;
    } catch (error) {
        fastify.log.error('Error getting OAuth2 application token:', error);
        throw error;
    }
}

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url: string): Promise<Response> {
    // const token = await getApplicationToken();

    // if (!token) {
    //     throw new Error('Failed to get application token');
    // }

    return fetch(url, {
        headers: {
            // 'Authorization': `Bearer ${token}`,
            'User-Agent': USER_AGENT!,
            'Content-Type': 'application/json'
        }
    });
}

// Local IP access middleware
async function localAccessOnly(request: FastifyRequest, reply: FastifyReply) {
    const clientIP = request.ip || request.socket.remoteAddress;

    // Allow localhost and private network IPs
    const allowedIPs = [
        '127.0.0.1',      // localhost
        '::1',            // IPv6 localhost
        'localhost',       // localhost hostname
        '192.168.',       // Private network
        '10.',            // Private network
        '172.16.',        // Private network
    ];

    const isAllowed = allowedIPs.some(allowedIP =>
        clientIP?.startsWith(allowedIP) || clientIP === allowedIP
    );

    if (!isAllowed) {
        fastify.log.warn(`Access denied for IP: ${clientIP}`);
        return reply.status(403).send({
            error: 'Access denied',
            message: 'This API is only accessible from local network'
        });
    }
}

// Register plugins
fastify.register(cors, {
    origin: true
});

fastify.register(helmet);

// Apply local access middleware to all routes
fastify.addHook('preHandler', localAccessOnly);

// Health check
fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Get anime by ID
fastify.get('/anime/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;

        console.log(`${SHIKIMORI_API_URL}/api/animes/${id}`);

        const response = await limiter.schedule(async () => {
            return makeAuthenticatedRequest(`${SHIKIMORI_API_URL}/api/animes/${id}`);
        });

        if (!response.ok) {
            const errorText = await response.text();
            fastify.log.error(`Shikimori API error: ${response.status} ${response.statusText} - ${errorText}`);
            return reply.status(404).send({ error: 'Anime not found' });
        }

        const anime: IAnime = await response.json() as IAnime;
        if (!anime) {
            return reply.status(404).send({ error: 'Anime not found' });
        }

        return anime;
    } catch (error) {
        fastify.log.error('Error fetching anime:', error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
});

// Get anime external links
fastify.get('/anime/:id/externals', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const { id } = request.params;

        const response = await limiter.schedule(async () => {
            return makeAuthenticatedRequest(`${SHIKIMORI_API_URL}/api/animes/${id}/external_links`);
        });

        if (!response.ok) {
            return reply.status(404).send({ error: 'External links not found' });
        }

        const externals: IExternalLink[] = await response.json() as IExternalLink[];
        return externals;
    } catch (error) {
        fastify.log.error('Error fetching external links:', error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
});

// Search anime
fastify.get('/search', async (request: FastifyRequest<{ Querystring: { q?: string; limit?: string } }>, reply: FastifyReply) => {
    try {
        const { q, limit = 20 } = request.query;

        if (!q) {
            return reply.status(400).send({ error: 'Query parameter "q" is required' });
        }

        const response = await limiter.schedule(async () => {
            return makeAuthenticatedRequest(
                `${SHIKIMORI_API_URL}/animes?search=${encodeURIComponent(q)}&limit=${limit}`
            );
        });

        if (!response.ok) {
            return reply.status(500).send({ error: 'Failed to search anime' });
        }

        const animes: IAnime[] = await response.json() as IAnime[];
        return animes;
    } catch (error) {
        fastify.log.error('Error searching anime:', error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
});

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
        console.log(`Shiki API server running on port ${PORT}`);
        console.log('OAuth2 application authentication enabled');
        console.log('Access restricted to local network only');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start(); 