# Agre Billing — Release Notes (v1.0.0)

## Highlights

- **Initial Release of Agre Billing**: Completely new, independent billing and accounting application.
- **TallyPrime 7.1 Inspired Experience**: Gateway home view, double-entry voucher architecture, dense compact data tables, keyboard-first velocity, F-key shortcuts (`F5`, `F6`, `F8`, `F9`, `Ctrl+S`, `Ctrl+P`).
- **Clean Double-Entry Accounting**: Automatic posting of balanced ledger journal entries and inventory movements.
- **Zero GST & Zero Barcode Overhead**: Direct, fast billing math ($Qty \times Rate - Discount = Amount$).
- **Offline-First & Concurrency Safe**: Idempotency key tracking, delta sync engine, local draft voucher sequence mapping.
- **Cross-Platform**: Desktop (Tauri 2 + React) and Mobile (Expo React Native).
- **Print & Export Ready**: A4 Invoices, 58mm/80mm Thermal receipts, CSV/Excel export and import.
- **Automated Test Coverage**: 100% passing unit tests for core billing math, double-entry rules, and Zod validation schemas.
