import {
  productCreateSchema,
  customerCreateSchema,
  supplierCreateSchema,
  createSaleSchema,
} from '../validation';

describe('Validation Schemas (Zod)', () => {
  const companyId = '11111111-1111-4111-8111-111111111111';
  const fyId = '22222222-2222-4222-8222-222222222222';
  const customerId = '33333333-3333-4333-8333-333333333333';
  const idempotencyKey = '44444444-4444-4444-8444-444444444444';

  test('productCreateSchema validates correct product and rejects negative prices', () => {
    const validProduct = {
      company_id: companyId,
      name: 'Toor Dal 1kg',
      sku: 'DAL-TOOR',
      cost_price: 130,
      selling_price: 165,
      minimum_stock: 10,
    };
    expect(productCreateSchema.safeParse(validProduct).success).toBe(true);

    const invalidProduct = {
      ...validProduct,
      selling_price: -5,
    };
    expect(productCreateSchema.safeParse(invalidProduct).success).toBe(false);
  });

  test('customerCreateSchema validates customer with optional email', () => {
    const validCustomer = {
      company_id: companyId,
      name: 'Ramesh Patel',
      phone: '9876543210',
      email: 'ramesh@example.com',
      opening_balance: 0,
    };
    expect(customerCreateSchema.safeParse(validCustomer).success).toBe(true);

    const validCustomerEmptyEmail = {
      ...validCustomer,
      email: '',
    };
    expect(customerCreateSchema.safeParse(validCustomerEmptyEmail).success).toBe(true);
  });

  test('createSaleSchema requires at least 1 item and positive quantity', () => {
    const validSale = {
      company_id: companyId,
      financial_year_id: fyId,
      date: '2026-08-19',
      customer_id: customerId,
      payment_mode: 'cash' as const,
      idempotency_key: idempotencyKey,
      items: [
        {
          product_name: 'Basmati Rice 5kg',
          quantity: 2,
          rate: 400,
          discount_amount: 50,
        },
      ],
    };
    expect(createSaleSchema.safeParse(validSale).success).toBe(true);

    const emptyItemsSale = {
      ...validSale,
      items: [],
    };
    expect(createSaleSchema.safeParse(emptyItemsSale).success).toBe(false);

    const zeroQtySale = {
      ...validSale,
      items: [{ product_name: 'Item', quantity: 0, rate: 100 }],
    };
    expect(createSaleSchema.safeParse(zeroQtySale).success).toBe(false);
  });
});
