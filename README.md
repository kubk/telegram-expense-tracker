# Telegram expense tracker

A Telegram bot for tracking expenses. The goal was to create a unified way to track expenses across different bank cards / currencies and family members,  with an option to exclude specific transactions from statistics. Useful if you're traveller and live in different countries.

 Available features:
- Multi user account support. You can give access to your family's budget to anyone from your family
- Multi bank account support with different currencies
- Montly and weekly expense / income statistics
- Allow to exclude specific transactions from statistics. Example use case - your friends asked you to pay for something online and then returned you this amount in cash or in crypto. You don't want to count this transaction as a spending. Or you'd like to exclude all the cash withdrawals from the statistics because they're not spendings.
- Parsing bank statements (currently only for Yapı Kredi Bankası, but other banks can be added)
- Manual transacton entries for tracking cash
- Smooth app-like bot experience using [editMessageReplyMarkup](https://core.telegram.org/bots/api#editmessagereplymarkup)

### Screenshots

<div float="left">
<img width="205" alt="Screen Shot 2022-04-23 at 23 26 52" src="https://user-images.githubusercontent.com/22447849/164944999-b32acb46-cb23-4d6d-b128-64c5b47b0239.png">
<img width="200" alt="Screen Shot 2022-04-23 at 23 10 34" src="https://user-images.githubusercontent.com/22447849/164944660-5bd8b731-0fbf-4ab4-b73b-3cab46a89d28.png">
<img width="200" alt="Screen Shot 2022-04-23 at 23 11 15" src="https://user-images.githubusercontent.com/22447849/164944648-9e483011-d590-4d3d-abdf-553f138e52cf.png">
</p>

### Finite state machine visualization

The visualization is generated using [mermaid.js](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/)
```mermaid
stateDiagram-v2
    bal : Bank account list
    aba: Adding bank account
    aan: Adding account name
    aac: Adding account currency
    bas: Bank account selected
    amttype: Selection transaction type
    ubs: Uploading bank statement
    msl: Monthly statistics - month list
    mss: Monthly statistics - month selected
    wsl: Weekly statistics - week list
    wss: Weekly statistics - week selected
    amta: Selection transaction amount
    ts: Transaction selected
    amttitle: Selection transaction title
    [*] --> bal 
    bal --> aba : Add bank account
    aba --> bal : Back
    aba --> aan : Add account name
    aba --> bal : Cancel
    aan --> aba : Back
    aan --> aac : Adding account currency
    aac --> aan : Back
    aan --> bal : Cancel
    aac --> bal : Added bank account
    aac --> bal : Cancel
    bal --> bas : Select bank account
    bas --> bal : Back
    bas --> amttype : Select add manual transaction
    amttype --> bas: Cancel
    amttype --> amta: Select transaction amount
    amta --> bas: Cancel
    amta --> amttitle: Select transaction title
    amta --> amttitle: Type transaction title
    amttitle --> bas: Cancel
    amttitle --> bas: Finish adding transaction
    bas --> msl: Select monthly statistics
    msl --> bas: Back
    msl --> msl: Change page
    msl --> mss: Select month
    mss --> msl: Back
    mss --> ts: Select transaction
    ts --> ts: Change transaction visibility
    ts --> ts: Change transaction type 
    ts --> mss: Transaction remove
    ts --> mss: Back
    bas --> wsl: Select weekly statistics
    wsl --> bas: Back
    wsl --> wsl: Change page
    wsl --> wss: Select week
    wss --> wsl: Back
    ts --> wss: Back
    bas --> ubs : Select upload bank statement
    ubs --> bas : Cancel
    ubs --> bas : Bank statement uploaded    
    
```
