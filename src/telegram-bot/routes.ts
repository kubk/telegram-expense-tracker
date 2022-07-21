import { BotButtons, BotCallbackQuery } from './bot-action';
import { startHandler } from './command-handlers/start-handler';
import { cancelHandler } from './command-handlers/cancel-handler';
import { bankAccountListButtonHandler } from './command-handlers/bank-account-list-button-handler';
import { bankAccountAddButtonHandler } from './command-handlers/bank-account-add-button-handler';
import { statsMonthHandler } from './command-handlers/stats-month-handler';
import { selectBankAccountHandler } from './command-handlers/select-bank-account-handler';
import { transactionListHandler } from './command-handlers/transaction-list-handler';
import { transactionAddManualSelectTypeHandler } from './command-handlers/transaction-add-manual-select-type-handler';
import { textHandler } from './command-handlers/text-handler';
import { transactionSelectHandler } from './command-handlers/transaction-select-handler';
import { transactionDeleteAskHandler } from './command-handlers/transaction-delete-ask-handler';
import { transactionDeleteDoHandler } from './command-handlers/transaction-delete-do-handler';
import { transactionAddManualSelectAmountHandler } from './command-handlers/transaction-add-manual-select-amount-handler';
import { bankStatementUploadedHandler } from './command-handlers/bank-statement-uploaded-handler';
import { goToUploadBankStatementHandler } from './command-handlers/go-to-upload-bank-statement-handler';
import { TransactionType } from '../repository/transaction-repository';
import { createBot } from './create-bot';

const bot = createBot({ logTelegram: false });

bot.command('start', startHandler);
bot.command('cancel', cancelHandler);
bot.action(
  new RegExp(`${BotButtons.BankAccountListButton}:?(.*)`),
  bankAccountListButtonHandler
);
bot.action(BotButtons.BankAccountAddButton, bankAccountAddButtonHandler);
bot.action(
  new RegExp(`${BotButtons.UploadBankStatementButton}:(.+)`),
  goToUploadBankStatementHandler
);
bot.action(
  new RegExp(`${BotCallbackQuery.SelectBankAccount}:(.+)`),
  selectBankAccountHandler
);
bot.action(
  new RegExp(
    `${BotCallbackQuery.TransactionSelect}:(.+):(.+):(\\d{4}):(\\d+):(.+):(.+):(.+):(.+):(.+):(.+):(\\d+):?(.*)`
  ),
  transactionSelectHandler
);
bot.action(
  new RegExp(`${BotCallbackQuery.TransactionDeleteAsk}:(.+)`),
  transactionDeleteAskHandler
);
bot.action(
  new RegExp(`${BotCallbackQuery.TransactionDeleteDo}:(.+)`),
  transactionDeleteDoHandler
);
bot.action(
  new RegExp(
    `${BotCallbackQuery.TransactionAddManualAmount}:(${TransactionType.Expense}|${TransactionType.TopUp})`
  ),
  transactionAddManualSelectAmountHandler
);
bot.action(
  new RegExp(`${BotButtons.StatisticMonthsButton}:(.+)`),
  statsMonthHandler
);
bot.action(
  new RegExp(`(.+):(\\d{4}):(\\d+):(.+):(.+):(.+):(.+):(.+):(.+):(.+)`),
  transactionListHandler
);
bot.action(
  new RegExp(`${BotButtons.TransactionAddManualButton}:(.+)`),
  transactionAddManualSelectTypeHandler
);
bot.on('text', textHandler);
bot.on('document', bankStatementUploadedHandler);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
