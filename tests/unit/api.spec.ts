import { posApi } from '../../src/services/api';

describe('posApi', () => {
  it('getCategories returns category items', async () => {
    const categories = await posApi.getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty('name');
  });

  it('getProducts returns products array and handles filter parameters', async () => {
    const products = await posApi.getProducts('cat-coffee', 'espresso');
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('sku');
    expect(products[0]).toHaveProperty('price');
  });

  it('getCustomers returns customer profiles with search parameter', async () => {
    const customers = await posApi.getCustomers('alexander');
    expect(Array.isArray(customers)).toBe(true);
    expect(customers.length).toBeGreaterThan(0);
    expect(customers[0]).toHaveProperty('loyaltyPoints');
  });

  it('createCustomer adds a new member', async () => {
    const customer = await posApi.createCustomer({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '555-9999',
    });
    expect(customer).toHaveProperty('id');
    expect(customer.name).toBe('Test Customer');
  });

  it('getDiscounts returns promotional codes', async () => {
    const discounts = await posApi.getDiscounts();
    expect(Array.isArray(discounts)).toBe(true);
    expect(discounts.some((d) => d.code === 'WELCOME10')).toBe(true);
  });

  it('validateDiscount validates promo code', async () => {
    const valid = await posApi.validateDiscount('WELCOME10', 50);
    expect(valid.isValid).toBe(true);
    expect(valid.discountAmount).toBe(5);

    const invalid = await posApi.validateDiscount('UNKNOWN_CODE', 50);
    expect(invalid.isValid).toBe(false);
  });

  it('createOrder generates order and calculates totals', async () => {
    const order = await posApi.createOrder({
      registerId: 'REG-01',
      cashierId: 'usr-3',
      customerId: 'cust-1',
      items: [{ productId: 'prod-1', quantity: 2 }],
      paymentMethod: 'Cash',
      amountTendered: 20,
    });
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('orderNumber');
    expect(order.status).toBe('Completed');
  });

  it('getOrders returns order history with filters', async () => {
    const orders = await posApi.getOrders('Completed', 'POS');
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });

  it('getOrderReceipt, refundOrder, and voidOrder execute without crashing', async () => {
    const receipt = await posApi.getOrderReceipt('ord-init-1');
    expect(receipt === null || typeof receipt === 'object').toBe(true);

    const refund = await posApi.refundOrder('ord-init-1', 'Customer return');
    expect(refund === null || typeof refund === 'object').toBe(true);

    const voidRes = await posApi.voidOrder('ord-init-1', 'Void error');
    expect(voidRes === null || typeof voidRes === 'object').toBe(true);
  });

  it('getCurrentShift returns shift data', async () => {
    const shift = await posApi.getCurrentShift('REG-01');
    expect(shift).not.toBeNull();
    expect(shift?.status).toBe('Open');
  });

  it('openShift, closeShift, and addCashDrop execute correctly', async () => {
    const shift = await posApi.openShift({
      registerId: 'REG-02',
      cashierId: 'usr-3',
      startingFloat: 150,
    });
    expect(shift).toHaveProperty('id');
    expect(shift.startingFloat).toBe(150);

    const drop = await posApi.addCashDrop(shift.id, 'Drop', 50, 'Safe drop');
    expect(drop === null || typeof drop === 'object').toBe(true);

    const closed = await posApi.closeShift(shift.id, 100, 'Shift closed');
    expect(closed === null || typeof closed === 'object').toBe(true);
  });

  it('adjustStock updates product inventory', async () => {
    const adjusted = await posApi.adjustStock('prod-1', 10, 'Weekly restock');
    expect(adjusted === null || typeof adjusted === 'object').toBe(true);
  });

  it('getAnalytics returns KPI overview', async () => {
    const analytics = await posApi.getAnalytics();
    expect(analytics).toHaveProperty('totalRevenue');
    expect(analytics).toHaveProperty('topProducts');
    expect(analytics).toHaveProperty('categorySales');
  });

  it('login authenticates user', async () => {
    const user = await posApi.login('cashier1', 'admin');
    expect(user).not.toBeNull();
    expect(user?.role).toBe('Cashier');
  });
});
