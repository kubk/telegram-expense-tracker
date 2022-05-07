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
import { transactionAddManualSelectTypeHandler } from './command-handlers/transaction-add-manual-select-type-handler';
import { textHandler } from './command-handlers/text-handler';
import { transactionSelectHandler } from './command-handlers/transaction-select-handler';
import { transactionIsCountableToggleCommand } from './command-handlers/transaction-is-countable-toggle-command';
import { transactionDeleteAskHandler } from './command-handlers/transaction-delete-ask-handler';
import { transactionDeleteDoHandler } from './command-handlers/transaction-delete-do-handler';
import { transactionAddManualSelectAmountHandler } from './command-handlers/transaction-add-manual-select-amount-handler';
import { bankStatementUploadedHandler } from './command-handlers/bank-statement-uploaded-handler';
import { goToUploadBankStatementHandler } from './command-handlers/go-to-upload-bank-statement-handler';

bot.command('start', startHandler);
bot.command('cancel', cancelHandler);
bot.action(/bank_account_list:?(.*)/, bankAccountListButtonHandler);
bot.action(BotButtons.BankAccountAddButton, bankAccountAddButtonHandler);
bot.action(/upload_bank_statement:(.+)/, goToUploadBankStatementHandler);
bot.action(/select_bank_account:(.+)/, selectBankAccountHandler);
bot.action(/select_transaction:(.+)/, transactionSelectHandler);
bot.action(/transaction_is_count:(.+)/, transactionIsCountableToggleCommand);
bot.action(/transaction_del_ask:(.+)/, transactionDeleteAskHandler);
bot.action(/transaction_del_do:(.+)/, transactionDeleteDoHandler);
bot.action(/transaction_manual:(.+)/, transactionAddManualSelectAmountHandler);
bot.action(/stats_months:(.+)/, statsMonthHandler);
bot.action(/stats_weeks:(.+)/, statsWeekHandler);
bot.action(/([wm]):(.+):(\d{4}):(\d+):(.+):(.+)/, transactionListHandler);
bot.action(
  /transaction_add_manual:(.+)/,
  transactionAddManualSelectTypeHandler
);
bot.on('text', textHandler);
bot.on('document', bankStatementUploadedHandler);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
