/* eslint-disable @typescript-eslint/no-explicit-any */
import { terminalController } from '../../src/services/terminalController';
import { posApi, FALLBACK_PRODUCTS, FALLBACK_CUSTOMERS, FALLBACK_ORDERS, FALLBACK_SHIFT } from '../../src/services/api';
import { CartItem, formatReceiptData } from '../../src/services/posLogic';
import { ReceiptDto } from '../../src/types/pos';

describe('terminalController unit tests', () => {
  const sampleProduct = FALLBACK_PRODUCTS[0];

  it('addToCart appends item to cart', () => {
    let cart: CartItem[] = [];
    const setCart = (action: React.SetStateAction<CartItem[]>) => {
      cart = typeof action === 'function' ? action(cart) : action;
    };

    terminalController.addToCart(setCart as any, sampleProduct);
    expect(cart.length).toBe(1);
    expect(cart[0].product.id).toBe(sampleProduct.id);
  });

  it('updateQuantity modifies item quantity or ignores invalid product', () => {
    let cart: CartItem[] = [{ product: sampleProduct, quantity: 2 }];
    const setCart = (action: React.SetStateAction<CartItem[]>) => {
      cart = typeof action === 'function' ? action(cart) : action;
    };

    terminalController.updateQuantity(setCart as any, FALLBACK_PRODUCTS, sampleProduct.id, 1);
    expect(cart[0].quantity).toBe(3);

    // Non-existent product ID
    terminalController.updateQuantity(setCart as any, FALLBACK_PRODUCTS, 'unknown-id', 1);
    expect(cart[0].quantity).toBe(3);
  });

  it('removeFromCart removes specified product', () => {
    let cart: CartItem[] = [{ product: sampleProduct, quantity: 2 }];
    const setCart = (action: React.SetStateAction<CartItem[]>) => {
      cart = typeof action === 'function' ? action(cart) : action;
    };

    terminalController.removeFromCart(setCart as any, sampleProduct.id);
    expect(cart.length).toBe(0);
  });

  it('clearCart resets all terminal state variables', () => {
    let cart = [{ product: sampleProduct, quantity: 1 }];
    let code = 'PROMO';
    let amt = 5;
    let msg = 'Applied';
    let cust = 'cust-1';
    let receipt: ReceiptDto | null = {} as any;

    terminalController.clearCart(
      ((action: any) => { cart = typeof action === 'function' ? action(cart) : action; }) as any,
      (val) => { code = val; },
      (val) => { amt = val; },
      (val) => { msg = val; },
      (val) => { cust = val; },
      (val) => { receipt = val; }
    );

    expect(cart.length).toBe(0);
    expect(code).toBe('');
    expect(amt).toBe(0);
    expect(msg).toBe('');
    expect(cust).toBe('');
    expect(receipt).toBeNull();
  });

  it('applyDiscount handles valid, invalid, empty and error flows', async () => {
    let amt = 0;
    let msg = '';
    const setAmt = (val: number) => { amt = val; };
    const setMsg = (val: string) => { msg = val; };

    // Empty code
    const emptyRes = await terminalController.applyDiscount('', 50, posApi, setAmt, setMsg);
    expect(emptyRes).toBe(false);

    // Valid code
    const validRes = await terminalController.applyDiscount('WELCOME10', 50, posApi, setAmt, setMsg);
    expect(validRes).toBe(true);
    expect(amt).toBe(5);
    expect(msg).toContain('applied');

    // Invalid code
    const invalidRes = await terminalController.applyDiscount('BAD_CODE', 50, posApi, setAmt, setMsg);
    expect(invalidRes).toBe(false);
    expect(amt).toBe(0);

    // Throwing mock API
    const throwingApi = {
      validateDiscount: async () => { throw new Error('Network error'); },
    } as any;
    const throwRes = await terminalController.applyDiscount('ANY', 50, throwingApi, setAmt, setMsg);
    expect(throwRes).toBe(false);
    expect(msg).toContain('Error');
  });

  it('completePayment processes order and generates receipt', async () => {
    // Empty cart
    const emptyRes = await terminalController.completePayment(
      [],
      '',
      '',
      0,
      'Cash',
      10,
      FALLBACK_CUSTOMERS,
      posApi,
      () => {},
      () => {}
    );
    expect(emptyRes).toBeNull();

    // Filled cart
    let receiptGenerated: ReceiptDto | null = null;
    let checkoutClosed = false;
    let orderReceived = false;

    const completed = await terminalController.completePayment(
      [{ product: sampleProduct, quantity: 2 }],
      'cust-1',
      'WELCOME10',
      1.0,
      'Cash',
      20,
      FALLBACK_CUSTOMERS,
      posApi,
      (r) => { receiptGenerated = r; },
      (val) => { checkoutClosed = !val; },
      () => { orderReceived = true; }
    );

    expect(completed).not.toBeNull();
    expect(receiptGenerated).not.toBeNull();
    expect(checkoutClosed).toBe(true);
    expect(orderReceived).toBe(true);

    // Test payment with no discount and no customer (anonymous) without callback
    const anonCompleted = await terminalController.completePayment(
      [{ product: sampleProduct, quantity: 1 }],
      '',
      '',
      0,
      'Card',
      10,
      FALLBACK_CUSTOMERS,
      posApi,
      () => {},
      () => {}
    );
    expect(anonCompleted).not.toBeNull();

    // Test payment with unmatched customer ID
    const unmatchedCustomerPayment = await terminalController.completePayment(
      [{ product: sampleProduct, quantity: 1 }],
      'unmatched-cust-id',
      '',
      0,
      'Cash',
      10,
      FALLBACK_CUSTOMERS,
      posApi,
      () => {},
      () => {}
    );
    expect(unmatchedCustomerPayment).not.toBeNull();
  });

  it('viewReceipt retrieves receipt from API or falls back to order list', async () => {
    let receipt: ReceiptDto | null = null;
    const setReceipt = (r: ReceiptDto) => { receipt = r; };

    // Fallback order list lookup
    const orderRes = await terminalController.viewReceipt(
      FALLBACK_ORDERS[0].id,
      FALLBACK_ORDERS,
      posApi,
      setReceipt
    );
    expect(orderRes).not.toBeNull();
    expect(receipt).not.toBeNull();

    // Unknown order
    const nullRes = await terminalController.viewReceipt(
      'unknown-order-id',
      [],
      posApi,
      setReceipt
    );
    expect(nullRes).toBeNull();

    // API returned receipt directly
    const mockApiReceipt = {
      ...posApi,
      getOrderReceipt: jest.fn().mockResolvedValue(formatReceiptData(FALLBACK_ORDERS[0])),
    };
    const apiDirectRes = await terminalController.viewReceipt(
      FALLBACK_ORDERS[0].id,
      [],
      mockApiReceipt as any,
      setReceipt
    );
    expect(apiDirectRes).not.toBeNull();
  });

  it('refundOrder and voidOrder trigger callbacks', async () => {
    let refreshed = false;
    await terminalController.refundOrder('ord-1', posApi, () => { refreshed = true; });
    expect(refreshed).toBe(true);

    let voidRefreshed = false;
    await terminalController.voidOrder('ord-1', posApi, () => { voidRefreshed = true; });
    expect(voidRefreshed).toBe(true);
  });

  it('adjustStock updates inventory and resets adjusting product', async () => {
    let adjusting: any = { id: 'p1' };
    let refreshed = false;
    await terminalController.adjustStock(
      'prod-1',
      10,
      'Restock',
      posApi,
      (val) => { adjusting = val; },
      () => { refreshed = true; }
    );
    expect(adjusting).toBeNull();
    expect(refreshed).toBe(true);
  });

  it('cashDrop, closeShift, and openShift update shift lifecycle', async () => {
    let dropping = true;
    let shiftRefreshed = false;
    await terminalController.cashDrop(
      FALLBACK_SHIFT.id,
      'Drop',
      50,
      'Safe drop',
      posApi,
      (val) => { dropping = val; },
      () => { shiftRefreshed = true; }
    );
    expect(dropping).toBe(false);
    expect(shiftRefreshed).toBe(true);

    let closing = true;
    await terminalController.closeShift(
      FALLBACK_SHIFT.id,
      200,
      'Balanced',
      posApi,
      (val) => { closing = val; }
    );
    expect(closing).toBe(false);

    let opening = true;
    await terminalController.openShift(
      'REG-01',
      'usr-3',
      150,
      posApi,
      (val) => { opening = val; }
    );
    expect(opening).toBe(false);
  });

  it('createCustomer adds customer and clears form inputs', async () => {
    let name = 'Alice';
    let email = 'alice@example.com';
    let phone = '555-1234';
    let isAdding = true;
    let refreshed = false;

    const res = await terminalController.createCustomer(
      name,
      email,
      phone,
      posApi,
      (v) => { name = v; },
      (v) => { email = v; },
      (v) => { phone = v; },
      (v) => { isAdding = v; },
      () => { refreshed = true; }
    );

    expect(res).toHaveProperty('id');
    expect(name).toBe('');
    expect(email).toBe('');
    expect(phone).toBe('');
    expect(isAdding).toBe(false);
    expect(refreshed).toBe(true);
  });
});
