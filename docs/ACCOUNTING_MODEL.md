# Agre Billing — Accounting Model

## 1. Chart of Accounts Hierarchy

```
Primary Groups:
├── Capital Account (Nature: Capital)
├── Current Assets (Nature: Assets)
│   ├── Cash-in-Hand
│   │   └── Cash (System Ledger)
│   ├── Bank Accounts
│   │   └── [e.g. HDFC Bank, SBI Bank]
│   └── Sundry Debtors
│       └── [Customer Ledgers: Rajesh Sharma, Priya Patel, etc.]
├── Fixed Assets (Nature: Assets)
├── Current Liabilities (Nature: Liabilities)
│   └── Sundry Creditors
│       └── [Supplier Ledgers: Vishnu Traders, Ganesh Wholesale, etc.]
├── Direct Income (Nature: Income)
│   └── Sales Account (System Ledger)
├── Direct Expenses (Nature: Expense)
│   └── Purchase Account (System Ledger)
├── Indirect Income (Nature: Income)
└── Indirect Expenses (Nature: Expense)
    └── [Rent, Electricity, Stationery, Repairs, etc.]
```

## 2. Double-Entry Posting Rules

| Transaction Type | Debit Ledger | Credit Ledger | Stock Impact |
|---|---|---|---|
| **Cash Sale** | Cash-in-Hand | Sales Account | Reduces Stock |
| **Credit Sale** | Customer Ledger (Sundry Debtor) | Sales Account | Reduces Stock |
| **Cash Purchase** | Purchase Account | Cash-in-Hand | Increases Stock |
| **Credit Purchase** | Purchase Account | Supplier Ledger (Sundry Creditor) | Increases Stock |
| **Customer Receipt** | Cash-in-Hand / Bank Account | Customer Ledger | None |
| **Supplier Payment** | Supplier Ledger | Cash-in-Hand / Bank Account | None |
| **Sales Return** | Sales Return / Sales Account | Customer Ledger / Cash | Increases Stock |
| **Purchase Return** | Supplier Ledger / Cash | Purchase Return / Purchase Account | Reduces Stock |
| **Expense Payment** | Specific Expense Ledger (e.g. Rent) | Cash-in-Hand / Bank Account | None |

## 3. Balance Calculations

$$\text{Running Balance} = \text{Opening Balance} + \sum \text{Debits} - \sum \text{Credits}$$

- **Debtor / Asset Ledgers**: A positive net balance represents an Asset / Receivable (**Debit**).
- **Creditor / Liability Ledgers**: A negative net balance represents a Payable / Liability (**Credit**).
