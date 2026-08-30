import type { Timestamps, CompanyScoped, SoftDeletable } from './common';

// ============================================================
// Category
// ============================================================

export interface Category extends Timestamps, CompanyScoped, SoftDeletable {
  id: string;
  name: string;
  parent_id?: string;
}

export interface CategoryCreate extends CompanyScoped {
  name: string;
  parent_id?: string;
}

// ============================================================
// Unit
// ============================================================

export interface Unit extends Timestamps, CompanyScoped, SoftDeletable {
  id: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export interface UnitCreate extends CompanyScoped {
  name: string;
  symbol: string;
  decimal_places?: number;
}

// ============================================================
// Product
// ============================================================

export interface Product extends Timestamps, CompanyScoped, SoftDeletable {
  id: string;
  name: string;
  sku?: string;
  category_id?: string;
  unit_id?: string;
  cost_price: number;
  selling_price: number;
  wholesale_price?: number;
  special_price?: number;
  minimum_stock: number;
  description?: string;
  image_url?: string;
}

export interface ProductCreate extends CompanyScoped {
  name: string;
  sku?: string;
  category_id?: string;
  unit_id?: string;
  cost_price: number;
  selling_price: number;
  wholesale_price?: number;
  special_price?: number;
  minimum_stock?: number;
  description?: string;
  image_url?: string;
}

export interface ProductUpdate extends Partial<Omit<ProductCreate, 'company_id'>> {
  is_active?: boolean;
}

/** Product with computed stock quantity */
export interface ProductWithStock extends Product {
  current_stock: number;
  category_name?: string;
  unit_name?: string;
  unit_symbol?: string;
}
