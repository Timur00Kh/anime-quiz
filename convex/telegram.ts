import { httpAction } from "./_generated/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GAME_SHORT_NAME = process.env.TELEGRAM_GAME_SHORT_NAME;

// Обработчик сообщений от Telegram
export const handleMessage = httpAction(async (ctx, { chatId, messageId }) => {
  if (!BOT_TOKEN || !GAME_SHORT_NAME) {
    throw new Error('Missing Telegram bot configuration');
  }

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendGame`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        game_short_name: GAME_SHORT_NAME,
      }),
    }
  );
  
  return await response.json();
});

// Обработчик callback query от Telegram
export const handleCallbackQuery = httpAction(async (ctx, { callbackQuery }) => {
  if (!BOT_TOKEN || !GAME_SHORT_NAME) {
    throw new Error('Missing Telegram bot configuration');
  }

  if (callbackQuery.game_short_name === GAME_SHORT_NAME) {
    const params = [
      ['chat_id', callbackQuery.message?.chat.id],
      ['message_id', callbackQuery.message?.message_id],
      ['user_id', callbackQuery.from.id]
    ].filter(([_, value]) => value !== undefined);
    
    const paramsString = params.map(([key, value]) => `${key}=${value}`).join('&');

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          url: `https://anime-quiz-virid.vercel.app/ost-quiz-tg#${paramsString}`,
        }),
      }
    );
    
    return await response.json();
  }
  
  throw new Error('Unknown game');
});

// Установка счета игры
export const setGameScore = httpAction(async (ctx, args) => {
  if (!BOT_TOKEN) {
    throw new Error('Missing Telegram bot token');
  }

  const { score, userId, chatId, messageId } = args;
  
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setGameScore`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        score: Math.round(score),
        force: true,
        chat_id: chatId,
        message_id: messageId
      }),
    }
  );

  return await response.json();
});
