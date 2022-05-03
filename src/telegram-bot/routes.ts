import { bot } from '../container';
import { BotButtons } from './bot-action';
import { startHandler } from './command-handlers/start-handler';
import { cancelHandler } from './command-handlers/cancel-handler';
import { bankAccountListButtonHandler } from './command-handlers/bank-account-list-button-handler';
import { bankAccountAddButtonHandler } from './command-handlers/bank-account-add-button-handler';
import { statsMonthHandler } from './command-handlers/stats-month-handler';
import { statsWeekHandler } from './command-handlers/stats-week-handler';
import { selectBankAccountHandler } from './command-handlers/select-bank-account-handler';
import { transactionListHandler } from './command-handlers/transaction-list-handler';
import { transactionAddManualHandler } from './command-handlers/transaction-add-manual-handler';
import { textHandler } from './command-handlers/text-handler';
import { selectTransactionHandler } from './command-handlers/select-transaction-handler';

bot.command('start', startHandler);
bot.command('cancel', cancelHandler);
bot.action(/bank_account_list:(.*)/, bankAccountListButtonHandler);
bot.action(BotButtons.BankAccountAddButton, bankAccountAddButtonHandler);
bot.action(/select_bank_account:(.+)/, selectBankAccountHandler);
bot.action(/select_transaction:(.+)/, selectTransactionHandler);
bot.action(/stats_months:(.+)/, statsMonthHandler);
bot.action(/stats_weeks:(.+)/, statsWeekHandler);
bot.action(/([wm]):(.+):(\d{4}):(\d+):(.+):(.+)/, transactionListHandler);
bot.action(/transaction_add_manual:(.+)/, transactionAddManualHandler);
bot.on('text', textHandler);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
