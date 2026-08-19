# Agre Billing — Testing & Verification

## 1. Automated Test Suite

### Shared Package Tests (Jest + TypeScript)
- **Billing Calculations**: Validates line amount, bulk cart totals, discounts, profit margins, and rounding logic against real shop billing scenarios.
- **Ledger Math**: Validates double-entry balancing ($Debit = Credit$), opening vs closing balance calculations, and continuous statement generation.
- **Stock Movements**: Validates flow directions (sales = out, purchases = in, returns = reverse) and inventory valuation.
- **Validation**: Enforces strict Zod schema validation rules.

Run tests:
```bash
npm run test:shared
```

## 2. Desktop Type Checking & Build Verification
```bash
npm run build:desktop
```
