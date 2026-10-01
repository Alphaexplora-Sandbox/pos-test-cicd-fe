import {
  createCustomerAction,
  adjustStockAction,
  recordCashDropAction,
  closeShiftAction,
  openShiftAction,
  refundOrderAction,
  voidOrderAction,
  applyDiscountAction,
  executeCheckoutAction,
} from '../../src/services/viewActions';
import {
  PosApiClient,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_ORDERS,
  FALLBACK_SHIFT,
} from '../../src/services/api';

describe('viewActions service', () => {
  const mockApi: Partial<PosApiClient> = {
    createCustomer: jest.fn().mockResolvedValue(FALLBACK_CUSTOMERS[0]),
    adjustStock: jest.fn().mockResolvedValue(FALLBACK_PRODUCTS[0]),
    addCashDrop: jest.fn().mockResolvedValue({}),
    closeShift: jest.fn().mockResolvedValue(FALLBACK_SHIFT),
    openShift: jest.fn().mockResolvedValue(FALLBACK_SHIFT),
    refundOrder: jest.fn().mockResolvedValue(FALLBACK_ORDERS[0]),
    voidOrder: jest.fn().mockResolvedValue(FALLBACK_ORDERS[0]),
    validateDiscount: jest.fn().mockResolvedValue({
      code: 'PROMO10',
      isValid: true,
      discountAmount: 2.5,
      message: '10% off',
    }),
    createOrder: jest.fn().mockResolvedValue(FALLBACK_ORDERS[0]),
  };

  it('createCustomerAction validates input and calls api', async () => {
    // Validation failures
    const blankRes = await createCustomerAction(mockApi as PosApiClient, '', '', '');
    expect(blankRes.success).toBe(false);

    // Success
    const okRes = await createCustomerAction(
      mockApi as PosApiClient,
      'Test User',
      'test@example.com',
      '555-1234'
    );
    expect(okRes.success).toBe(true);
    expect(okRes.data?.name).toBe(FALLBACK_CUSTOMERS[0].name);

    // Api error
    const errApi: Partial<PosApiClient> = {
      createCustomer: jest.fn().mockRejectedValue(new Error('Duplicate email')),
    };
    const failRes = await createCustomerAction(
      errApi as PosApiClient,
      'Test',
      'fail@example.com',
      ''
    );
    expect(failRes.success).toBe(false);
    expect(failRes.error).toBe('Duplicate email');
  });

  it('adjustStockAction validates input and calls api', async () => {
    const blankId = await adjustStockAction(mockApi as PosApiClient, '', 10, 'Restock');
    expect(blankId.success).toBe(false);

    const okRes = await adjustStockAction(mockApi as PosApiClient, 'prod-1', 5, 'Delivery');
    expect(okRes.success).toBe(true);

    const errApi: Partial<PosApiClient> = {
      adjustStock: jest.fn().mockRejectedValue(new Error('Product not found')),
    };
    const failRes = await adjustStockAction(errApi as PosApiClient, 'prod-1', -1, 'Spill');
    expect(failRes.success).toBe(false);
  });

  it('recordCashDropAction validates amount and calls api', async () => {
    const invalidAmount = await recordCashDropAction(mockApi as PosApiClient, 'shift-1', 0, 'Safe');
    expect(invalidAmount.success).toBe(false);

    const okRes = await recordCashDropAction(mockApi as PosApiClient, 'shift-1', 100, 'Drop');
    expect(okRes.success).toBe(true);

    const errApi: Partial<PosApiClient> = {
      addCashDrop: jest.fn().mockRejectedValue(new Error('Shift closed')),
    };
    const failRes = await recordCashDropAction(errApi as PosApiClient, 'shift-1', 50, 'Drop');
    expect(failRes.success).toBe(false);
  });

  it('closeShiftAction validates counted cash and calls api', async () => {
    const negativeCash = await closeShiftAction(mockApi as PosApiClient, 'shift-1', -10, 'Count');
    expect(negativeCash.success).toBe(false);

    const okRes = await closeShiftAction(mockApi as PosApiClient, 'shift-1', 350, 'Done');
    expect(okRes.success).toBe(true);

    const errApi: Partial<PosApiClient> = {
      closeShift: jest.fn().mockRejectedValue(new Error('Already closed')),
    };
    const failRes = await closeShiftAction(errApi as PosApiClient, 'shift-1', 200, '');
    expect(failRes.success).toBe(false);
  });

  it('openShiftAction validates float and calls api', async () => {
    const negativeFloat = await openShiftAction(mockApi as PosApiClient, -5);
    expect(negativeFloat.success).toBe(false);

    const okRes = await openShiftAction(mockApi as PosApiClient, 150);
    expect(okRes.success).toBe(true);

    const errApi: Partial<PosApiClient> = {
      openShift: jest.fn().mockRejectedValue(new Error('Already open')),
    };
    const failRes = await openShiftAction(errApi as PosApiClient, 150);
    expect(failRes.success).toBe(false);
  });

  it('refundOrderAction validates orderId and calls api', async () => {
    const blank = await refundOrderAction(mockApi as PosApiClient, '', 'Wrong item');
    expect(blank.success).toBe(false);

    const okRes = await refundOrderAction(mockApi as PosApiClient, 'ord-1', 'Cold coffee');
    expect(okRes.success).toBe(true);

    const errApi: Partial<PosApiClient> = {
      refundOrder: jest.fn().mockRejectedValue(new Error('Not found')),
    };
    const failRes = await refundOrderAction(errApi as PosApiClient, 'ord-1', '');
    expect(failRes.success).toBe(false);
  });

  it('voidOrderAction validates orderId and calls api', async () => {
    const blank = await voidOrderAction(mockApi as PosApiClient, '', 'Cancel');
    expect(blank.success).toBe(false);

    const okRes = await voidOrderAction(mockApi as PosApiClient, 'ord-1', 'Accidental tap');
    expect(okRes.success).toBe(true);

    const errApi: Partial<PosApiClient> = {
      voidOrder: jest.fn().mockRejectedValue(new Error('Cannot void completed')),
    };
    const failRes = await voidOrderAction(errApi as PosApiClient, 'ord-1', '');
    expect(failRes.success).toBe(false);
  });

  it('applyDiscountAction handles empty, valid, invalid, and error codes', async () => {
    const emptyRes = await applyDiscountAction(mockApi as PosApiClient, '', 20);
    expect(emptyRes.isValid).toBe(false);

    const validRes = await applyDiscountAction(mockApi as PosApiClient, 'PROMO10', 25);
    expect(validRes.isValid).toBe(true);
    expect(validRes.amount).toBe(2.5);

    const invalidApi: Partial<PosApiClient> = {
      validateDiscount: jest.fn().mockResolvedValue({ isValid: false, message: 'Expired' }),
    };
    const invalidRes = await applyDiscountAction(invalidApi as PosApiClient, 'EXPIRED', 25);
    expect(invalidRes.isValid).toBe(false);
    expect(invalidRes.message).toContain('Expired');

    const errApi: Partial<PosApiClient> = {
      validateDiscount: jest.fn().mockRejectedValue(new Error('Net error')),
    };
    const errRes = await applyDiscountAction(errApi as PosApiClient, 'ERR', 25);
    expect(errRes.isValid).toBe(false);
    expect(errRes.message).toContain('failed');
  });

  it('executeCheckoutAction validates cart and formats receipt', async () => {
    const emptyCartRes = await executeCheckoutAction(
      mockApi as PosApiClient,
      [],
      null,
      null,
      'Cash',
      10,
      FALLBACK_CUSTOMERS
    );
    expect(emptyCartRes.success).toBe(false);

    const okRes = await executeCheckoutAction(
      mockApi as PosApiClient,
      [{ product: FALLBACK_PRODUCTS[0], quantity: 2 }],
      FALLBACK_CUSTOMERS[0].id,
      'PROMO10',
      'Cash',
      20,
      FALLBACK_CUSTOMERS
    );
    expect(okRes.success).toBe(true);
    expect(okRes.data?.receipt.orderNumber).toBe(FALLBACK_ORDERS[0].orderNumber);
    expect(okRes.data?.receipt.customerName).toBe(FALLBACK_CUSTOMERS[0].name);

    const errApi: Partial<PosApiClient> = {
      createOrder: jest.fn().mockRejectedValue(new Error('Out of stock')),
    };
    const failRes = await executeCheckoutAction(
      errApi as PosApiClient,
      [{ product: FALLBACK_PRODUCTS[0], quantity: 1 }],
      null,
      null,
      'Cash',
      10,
      []
    );
    expect(failRes.success).toBe(false);
    expect(failRes.error).toBe('Out of stock');

    // Test non-Error thrown (string) and null customer checkout
    const nonErrorApi: Partial<PosApiClient> = {
      createOrder: jest.fn().mockRejectedValue('Fatal network crash'),
    };
    const stringErrRes = await executeCheckoutAction(
      nonErrorApi as PosApiClient,
      [{ product: FALLBACK_PRODUCTS[0], quantity: 1 }],
      null,
      null,
      'Cash',
      10,
      []
    );
    expect(stringErrRes.success).toBe(false);
    expect(stringErrRes.error).toBe('Unknown checkout error');

    // Test default fallback values when reason/notes is empty string
    const emptyReasonStock = await adjustStockAction(mockApi as PosApiClient, 'prod-1', 1, '');
    expect(emptyReasonStock.success).toBe(true);

    const emptyReasonDrop = await recordCashDropAction(mockApi as PosApiClient, 'shift-1', 20, '');
    expect(emptyReasonDrop.success).toBe(true);

    const emptyNotesClose = await closeShiftAction(mockApi as PosApiClient, 'shift-1', 100, '');
    expect(emptyNotesClose.success).toBe(true);

    const emptyReasonRefund = await refundOrderAction(mockApi as PosApiClient, 'ord-1', '');
    expect(emptyReasonRefund.success).toBe(true);

    const emptyReasonVoid = await voidOrderAction(mockApi as PosApiClient, 'ord-1', '');
    expect(emptyReasonVoid.success).toBe(true);

    // Test non-Error thrown in other actions
    const nonErrApi: Partial<PosApiClient> = {
      createCustomer: jest.fn().mockRejectedValue('String rejection'),
      adjustStock: jest.fn().mockRejectedValue('String rejection'),
      addCashDrop: jest.fn().mockRejectedValue('String rejection'),
      closeShift: jest.fn().mockRejectedValue('String rejection'),
      openShift: jest.fn().mockRejectedValue('String rejection'),
      refundOrder: jest.fn().mockRejectedValue('String rejection'),
      voidOrder: jest.fn().mockRejectedValue('String rejection'),
    };

    const custErr = await createCustomerAction(nonErrApi as PosApiClient, 'A', 'b@c.com', '123');
    expect(custErr.error).toBe('Unknown error');

    const stockErr = await adjustStockAction(nonErrApi as PosApiClient, 'prod-1', 1, 'note');
    expect(stockErr.error).toBe('Unknown error');

    const dropErr = await recordCashDropAction(nonErrApi as PosApiClient, 'shift-1', 10, 'note');
    expect(dropErr.error).toBe('Unknown error');

    const closeErr = await closeShiftAction(nonErrApi as PosApiClient, 'shift-1', 10, 'note');
    expect(closeErr.error).toBe('Unknown error');

    const openErr = await openShiftAction(nonErrApi as PosApiClient, 10);
    expect(openErr.error).toBe('Unknown error');

    const refundErr = await refundOrderAction(nonErrApi as PosApiClient, 'ord-1', 'note');
    expect(refundErr.error).toBe('Unknown error');

    const voidErr = await voidOrderAction(nonErrApi as PosApiClient, 'ord-1', 'note');
    expect(voidErr.error).toBe('Unknown error');
  });
});
