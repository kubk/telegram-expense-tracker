import { Telegraf } from 'telegraf';
import { getEnvSafe, isTesting } from '../lib/env/env';

export const createBot = (config: { logTelegram: boolean }) => {
  const bot = new Telegraf(isTesting() ? '' : getEnvSafe('TELEGRAM_BOT_TOKEN'));

  if (config.logTelegram) {
    bot.use(Telegraf.log());
  }

  return bot;
};
