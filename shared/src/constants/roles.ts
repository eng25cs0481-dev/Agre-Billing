import type { RoleName, PermissionModule, PermissionAction } from '../types';

// ============================================================
// Role Definitions
// ============================================================

export interface RoleDefinition {
  name: RoleName;
  display_name: string;
  description: string;
  is_system: boolean;
}

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    name: 'admin',
    display_name: 'Administrator',
    description: 'Full access to all features and settings',
    is_system: true,
  },
  {
    name: 'manager',
    display_name: 'Manager',
    description: 'Full access except company settings and user management',
    is_system: true,
  },
  {
    name: 'accountant',
    display_name: 'Accountant',
    description: 'Access to ledgers, payments, receipts, and reports',
    is_system: true,
  },
  {
    name: 'billing_staff',
    display_name: 'Billing Staff',
    description: 'Create sales, receipts, view customers and products',
    is_system: true,
  },
  {
    name: 'viewer',
    display_name: 'Viewer',
    description: 'Read-only access to all data',
    is_system: true,
  },
];

// ============================================================
// Permission Definitions
// ============================================================

export interface PermissionDefinition {
  name: string;
  display_name: string;
  module: PermissionModule;
  action: PermissionAction;
}

const perm = (
  module: PermissionModule,
  action: PermissionAction,
  display_name: string
): PermissionDefinition => ({
  name: `${module}.${action}`,
  display_name,
  module,
  action,
});

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Company
  perm('company', 'read', 'View company settings'),
  perm('company', 'update', 'Edit company settings'),

  // Users
  perm('users', 'create', 'Create users'),
  perm('users', 'read', 'View users'),
  perm('users', 'update', 'Edit users'),
  perm('users', 'delete', 'Deactivate users'),

  // Products
  perm('products', 'create', 'Create products'),
  perm('products', 'read', 'View products'),
  perm('products', 'update', 'Edit products'),
  perm('products', 'delete', 'Deactivate products'),

  // Categories
  perm('categories', 'create', 'Create categories'),
  perm('categories', 'read', 'View categories'),
  perm('categories', 'update', 'Edit categories'),
  perm('categories', 'delete', 'Delete categories'),

  // Units
  perm('units', 'create', 'Create units'),
  perm('units', 'read', 'View units'),
  perm('units', 'update', 'Edit units'),
  perm('units', 'delete', 'Delete units'),

  // Customers
  perm('customers', 'create', 'Create customers'),
  perm('customers', 'read', 'View customers'),
  perm('customers', 'update', 'Edit customers'),
  perm('customers', 'delete', 'Deactivate customers'),

  // Suppliers
  perm('suppliers', 'create', 'Create suppliers'),
  perm('suppliers', 'read', 'View suppliers'),
  perm('suppliers', 'update', 'Edit suppliers'),
  perm('suppliers', 'delete', 'Deactivate suppliers'),

  // Sales
  perm('sales', 'create', 'Create sales'),
  perm('sales', 'read', 'View sales'),
  perm('sales', 'update', 'Edit sales'),
  perm('sales', 'cancel', 'Cancel sales'),
  perm('sales', 'print', 'Print invoices'),

  // Purchases
  perm('purchases', 'create', 'Create purchases'),
  perm('purchases', 'read', 'View purchases'),
  perm('purchases', 'update', 'Edit purchases'),
  perm('purchases', 'cancel', 'Cancel purchases'),

  // Receipts
  perm('receipts', 'create', 'Create receipts'),
  perm('receipts', 'read', 'View receipts'),
  perm('receipts', 'cancel', 'Cancel receipts'),

  // Payments
  perm('payments', 'create', 'Create payments'),
  perm('payments', 'read', 'View payments'),
  perm('payments', 'cancel', 'Cancel payments'),

  // Sales Returns
  perm('sales_returns', 'create', 'Create sales returns'),
  perm('sales_returns', 'read', 'View sales returns'),

  // Purchase Returns
  perm('purchase_returns', 'create', 'Create purchase returns'),
  perm('purchase_returns', 'read', 'View purchase returns'),

  // Expenses
  perm('expenses', 'create', 'Create expenses'),
  perm('expenses', 'read', 'View expenses'),
  perm('expenses', 'update', 'Edit expenses'),
  perm('expenses', 'cancel', 'Cancel expenses'),

  // Ledgers
  perm('ledgers', 'create', 'Create ledgers'),
  perm('ledgers', 'read', 'View ledgers'),
  perm('ledgers', 'update', 'Edit ledgers'),

  // Reports
  perm('reports', 'read', 'View reports'),

  // Settings
  perm('settings', 'read', 'View settings'),
  perm('settings', 'update', 'Edit settings'),

  // Audit
  perm('audit', 'read', 'View audit logs'),
];

// ============================================================
// Role → Permission Mapping
// ============================================================

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  admin: ALL_PERMISSIONS.map(p => p.name),

  manager: ALL_PERMISSIONS
    .filter(p => !['company.update', 'users.create', 'users.update', 'users.delete', 'settings.update'].includes(p.name))
    .map(p => p.name),

  accountant: ALL_PERMISSIONS
    .filter(p =>
      ['ledgers', 'payments', 'receipts', 'reports', 'expenses', 'audit'].includes(p.module) ||
      (p.action === 'read' && ['products', 'customers', 'suppliers', 'sales', 'purchases', 'sales_returns', 'purchase_returns', 'company'].includes(p.module))
    )
    .map(p => p.name),

  billing_staff: ALL_PERMISSIONS
    .filter(p =>
      (p.module === 'sales' && ['create', 'read', 'print'].includes(p.action)) ||
      (p.module === 'receipts' && ['create', 'read'].includes(p.action)) ||
      (p.module === 'customers' && p.action === 'read') ||
      (p.module === 'products' && p.action === 'read') ||
      (p.module === 'categories' && p.action === 'read') ||
      (p.module === 'units' && p.action === 'read') ||
      (p.module === 'company' && p.action === 'read')
    )
    .map(p => p.name),

  viewer: ALL_PERMISSIONS
    .filter(p => p.action === 'read')
    .map(p => p.name),
};
