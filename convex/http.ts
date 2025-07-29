import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Telegram webhook endpoint
http.route({
  path: "/telegram-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const update = await request.json();
      
      if (update.message) {
        await ctx.runAction(api.telegram.handleMessage, { 
          chatId: update.message.chat.id,
          messageId: update.message.message_id,
        });
      }
      
      if (update.callback_query) {
        await ctx.runAction(api.telegram.handleCallbackQuery, {
          callbackQuery: update.callback_query,
        });
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      return new Response("Error", { status: 500 });
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(JSON.stringify({ 
      status: "ok", 
      timestamp: Date.now() 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }),
});

export default http;
