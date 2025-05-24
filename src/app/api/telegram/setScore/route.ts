import { NextResponse } from 'next/server';

// You'll need to set this in your environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GAME_SHORT_NAME = process.env.TELEGRAM_GAME_SHORT_NAME;

export async function POST(request: Request) {
  try {
    const { score, userId } = await request.json();

    if (!BOT_TOKEN || !GAME_SHORT_NAME) {
      throw new Error('Missing Telegram bot configuration');
    }

    // Set the game score using Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setGameScore`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          score: Math.round(score), // Telegram only accepts integer scores
          force: true, // This will force update the score even if it's lower than previous
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to set score');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting game score:', error);
    return NextResponse.json(
      { error: 'Failed to set game score' },
      { status: 500 }
    );
  }
} 