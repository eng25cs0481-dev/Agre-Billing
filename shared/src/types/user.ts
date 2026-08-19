import type { Timestamps, CompanyScoped } from './common';

// ============================================================
// Roles
// ============================================================

export type RoleName = 'admin' | 'manager' | 'accountant' | 'billing_staff' | 'viewer';

export interface Role extends Timestamps, CompanyScoped {
  id: string;
  name: RoleName;
  display_name: string;
  description?: string;
  is_system: boolean;
}

// ============================================================
// Profiles (extends Supabase Auth user)
// ============================================================

export interface Profile extends Timestamps, CompanyScoped {
  id: string; // matches auth.users.id
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
}

export interface ProfileCreate {
  full_name: string;
  email?: string;
  phone?: string;
  company_id: string;
}

// ============================================================
// User Role Assignment
// ============================================================

export interface UserRole extends CompanyScoped {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

// ============================================================
// Permissions
// ============================================================

export type PermissionModule =
  | 'company'
  | 'users'
  | 'products'
  | 'categories'
  | 'units'
  | 'customers'
  | 'suppliers'
  | 'sales'
  | 'purchases'
  | 'receipts'
  | 'payments'
  | 'sales_returns'
  | 'purchase_returns'
  | 'expenses'
  | 'ledgers'
  | 'reports'
  | 'settings'
  | 'audit';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'print' | 'cancel';

export interface Permission {
  id: string;
  name: string; // e.g., 'sales.create'
  display_name: string;
  module: PermissionModule;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: string;
}

// ============================================================
// Auth types
// ============================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  books_beginning_date: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
  roles: RoleName[];
  permissions: string[];
}
