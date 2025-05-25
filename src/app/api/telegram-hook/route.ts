// app/api/telegram-hook/route.ts
import { Telegraf, type Context as TelegrafContext } from "telegraf";
import { NextRequest, NextResponse } from "next/server";

const bot = new Telegraf(process.env.BOT_TOKEN!);

const GAME_SHORT_NAME = process.env.TELEGRAM_BOT_GAME_SHORT_NAME;

async function handleOnMessage(ctx: TelegrafContext) {
  const { message } = ctx;
  if (!message) return;

  await ctx.reply("🎮 Ready to play Anime OST Quiz?", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Play Now!",
            callback_game: {},
          },
        ],
      ],
    },
  });
}

bot.on("message", async (ctx) => {
  await handleOnMessage(ctx);
});

bot.on("callback_query", async (ctx) => {
  // @ts-ignore
  if (ctx.callbackQuery.game_short_name === GAME_SHORT_NAME) {
    // Telegram will handle the WebApp opening
    await ctx.answerGameQuery(
      "https://anime-quiz-virid.vercel.app/ost-quiz-tg"
    );
  } else {
    await ctx.answerCbQuery("Unknown game.", { show_alert: true });
  }
});

export async function POST(request: NextRequest) {
  await bot.handleUpdate(await request.json());
  return new NextResponse();
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const hook = `${url.protocol}//${url.host}/api/telegram-hook`;
  await bot.telegram.setWebhook(hook);
  return NextResponse.json({ message: "Webhook set to: " + hook });
}
