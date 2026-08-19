import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Gateway from './pages/Gateway';
import PlaceholderPage from './pages/PlaceholderPage';

// Masters
import ProductsPage from './pages/masters/ProductsPage';
import ProductFormPage from './pages/masters/ProductFormPage';
import CustomersPage from './pages/masters/CustomersPage';
import CustomerFormPage from './pages/masters/CustomerFormPage';
import SuppliersPage from './pages/masters/SuppliersPage';
import SupplierFormPage from './pages/masters/SupplierFormPage';
import LedgersPage from './pages/masters/LedgersPage';
import CategoriesPage from './pages/masters/CategoriesPage';
import UnitsPage from './pages/masters/UnitsPage';

// Transactions
import SaleVoucherPage from './pages/transactions/SaleVoucherPage';
import PurchaseVoucherPage from './pages/transactions/PurchaseVoucherPage';
import ReceiptVoucherPage from './pages/transactions/ReceiptVoucherPage';
import PaymentVoucherPage from './pages/transactions/PaymentVoucherPage';
import ExpenseVoucherPage from './pages/transactions/ExpenseVoucherPage';

// Reports
import DayBookPage from './pages/reports/DayBookPage';
import StockSummaryPage from './pages/reports/StockSummaryPage';
import OutstandingPage from './pages/reports/OutstandingPage';

// Utilities & Settings
import SettingsPage from './pages/settings/SettingsPage';
import ExportImportPage from './pages/utilities/ExportImportPage';
import SyncPage from './pages/utilities/SyncPage';

import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Gateway */}
          <Route path="/" element={<Gateway />} />

          {/* Masters */}
          <Route path="/masters/products" element={<ProductsPage />} />
          <Route path="/masters/products/new" element={<ProductFormPage />} />
          <Route path="/masters/products/:id" element={<ProductFormPage />} />
          
          <Route path="/masters/customers" element={<CustomersPage />} />
          <Route path="/masters/customers/new" element={<CustomerFormPage />} />
          <Route path="/masters/customers/:id" element={<CustomerFormPage />} />
          
          <Route path="/masters/suppliers" element={<SuppliersPage />} />
          <Route path="/masters/suppliers/new" element={<SupplierFormPage />} />
          <Route path="/masters/suppliers/:id" element={<SupplierFormPage />} />
          
          <Route path="/masters/ledgers" element={<LedgersPage />} />
          <Route path="/masters/groups" element={<PlaceholderPage title="Ledger Groups" />} />
          <Route path="/masters/units" element={<UnitsPage />} />
          <Route path="/masters/categories" element={<CategoriesPage />} />

          {/* Transactions */}
          <Route path="/transactions/sale" element={<SaleVoucherPage />} />
          <Route path="/transactions/purchase" element={<PurchaseVoucherPage />} />
          <Route path="/transactions/receipt" element={<ReceiptVoucherPage />} />
          <Route path="/transactions/payment" element={<PaymentVoucherPage />} />
          <Route path="/transactions/sales-return" element={<PlaceholderPage title="Sales Return Voucher" />} />
          <Route path="/transactions/purchase-return" element={<PlaceholderPage title="Purchase Return Voucher" />} />
          <Route path="/transactions/expense" element={<ExpenseVoucherPage />} />

          {/* Reports */}
          <Route path="/reports/daybook" element={<DayBookPage />} />
          <Route path="/reports/ledger" element={<PlaceholderPage title="Ledger Statement" />} />
          <Route path="/reports/sales-register" element={<PlaceholderPage title="Sales Register" />} />
          <Route path="/reports/purchase-register" element={<PlaceholderPage title="Purchase Register" />} />
          <Route path="/reports/stock-summary" element={<StockSummaryPage />} />
          <Route path="/reports/outstanding" element={<OutstandingPage />} />
          <Route path="/reports/cash-book" element={<PlaceholderPage title="Cash Book" />} />
          <Route path="/reports/bank-book" element={<PlaceholderPage title="Bank Book" />} />

          {/* Utilities */}
          <Route path="/utilities/import" element={<ExportImportPage />} />
          <Route path="/utilities/export" element={<ExportImportPage />} />
          <Route path="/utilities/backup" element={<SyncPage />} />
          <Route path="/utilities/sync" element={<SyncPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
