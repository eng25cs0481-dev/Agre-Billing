import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductWithStock,
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerWithBalance,
  Supplier,
  SupplierCreate,
  SupplierUpdate,
  SupplierWithBalance,
  Voucher,
  VoucherWithItems,
  CreateSaleInput,
  CreatePurchaseInput,
  CreateReceiptInput,
  CreatePaymentInput,
  CreateExpenseInput,
  Ledger,
  LedgerGroup,
  LedgerStatementRow,
  DayBookEntry,
  StockSummary,
} from '../types';

export interface IProductRepository {
  list(companyId: string, search?: string): Promise<ProductWithStock[]>;
  getById(id: string): Promise<ProductWithStock | null>;
  create(data: ProductCreate): Promise<Product>;
  update(id: string, data: ProductUpdate): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface ICustomerRepository {
  list(companyId: string, search?: string): Promise<CustomerWithBalance[]>;
  getById(id: string): Promise<CustomerWithBalance | null>;
  create(data: CustomerCreate): Promise<Customer>;
  update(id: string, data: CustomerUpdate): Promise<Customer>;
  delete(id: string): Promise<void>;
}

export interface ISupplierRepository {
  list(companyId: string, search?: string): Promise<SupplierWithBalance[]>;
  getById(id: string): Promise<SupplierWithBalance | null>;
  create(data: SupplierCreate): Promise<Supplier>;
  update(id: string, data: SupplierUpdate): Promise<Supplier>;
  delete(id: string): Promise<void>;
}

export interface IVoucherRepository {
  createSale(input: CreateSaleInput): Promise<{ voucher_id: string; voucher_number: string }>;
  createPurchase(input: CreatePurchaseInput): Promise<{ voucher_id: string; voucher_number: string }>;
  createReceipt(input: CreateReceiptInput): Promise<{ voucher_id: string; voucher_number: string }>;
  createPayment(input: CreatePaymentInput): Promise<{ voucher_id: string; voucher_number: string }>;
  createExpense(input: CreateExpenseInput): Promise<{ voucher_id: string; voucher_number: string }>;
  cancelVoucher(voucherId: string, reason?: string): Promise<void>;
  getVoucherWithItems(voucherId: string): Promise<VoucherWithItems | null>;
  getDayBook(companyId: string, fromDate: string, toDate: string): Promise<DayBookEntry[]>;
}

export interface ILedgerRepository {
  listGroups(companyId: string): Promise<LedgerGroup[]>;
  listLedgers(companyId: string): Promise<Ledger[]>;
  getStatement(ledgerId: string, fromDate: string, toDate: string): Promise<LedgerStatementRow[]>;
}

export interface IReportRepository {
  getStockSummary(companyId: string): Promise<StockSummary[]>;
  getReceivables(companyId: string): Promise<CustomerWithBalance[]>;
  getPayables(companyId: string): Promise<SupplierWithBalance[]>;
}
