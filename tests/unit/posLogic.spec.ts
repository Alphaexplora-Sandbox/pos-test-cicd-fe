import {
  calculateCartTotals,
  addOrUpdateCartItem,
  removeCartItem,
  computeChangeDue,
  calculateShiftVariance,
  evaluateDiscountCode,
  formatReceiptData,
  filterProductsList,
  filterOrdersList,
} from '../../src/services/posLogic';
import { FALLBACK_PRODUCTS, FALLBACK_ORDERS } from '../../src/services/api';
import { Discount } from '../../src/types/pos';

describe('posLogic pure functional tests', () => {
  const sampleProduct = FALLBACK_PRODUCTS[0]; // Price 3.75
  const sampleProduct2 = FALLBACK_PRODUCTS[1]; // Price 4.85

  describe('calculateCartTotals', () => {
    it('returns zeroes for an empty cart', () => {
      const totals = calculateCartTotals([]);
      expect(totals.subtotal).toBe(0);
      expect(totals.discountTotal).toBe(0);
      expect(totals.taxTotal).toBe(0);
      expect(totals.grandTotal).toBe(0);
    });

    it('calculates subtotal, 8% tax, and grand total accurately', () => {
      const cart = [
        { product: sampleProduct, quantity: 2 }, // 7.50
        { product: sampleProduct2, quantity: 1 }, // 4.85
      ];
      const totals = calculateCartTotals(cart, 0, 0.08);
      expect(totals.subtotal).toBe(12.35);
      expect(totals.taxTotal).toBe(0.99); // 12.35 * 0.08 = 0.988 -> 0.99
      expect(totals.grandTotal).toBe(13.34);
    });

    it('applies discount and caps it at subtotal', () => {
      const cart = [{ product: sampleProduct, quantity: 2 }]; // 7.50
      const totals = calculateCartTotals(cart, 2.0, 0.08);
      expect(totals.subtotal).toBe(7.50);
      expect(totals.discountTotal).toBe(2.0);
      expect(totals.grandTotal).toBe(6.10); // 7.50 - 2.00 + 0.60 = 6.10

      // Oversized discount capped
      const capped = calculateCartTotals(cart, 50.0, 0.08);
      expect(capped.discountTotal).toBe(7.50);
      expect(capped.grandTotal).toBe(0.60); // 7.50 - 7.50 + 0.60
    });
  });

  describe('addOrUpdateCartItem & removeCartItem', () => {
    it('adds new product to empty cart', () => {
      const cart = addOrUpdateCartItem([], sampleProduct, 2);
      expect(cart.length).toBe(1);
      expect(cart[0].product.id).toBe(sampleProduct.id);
      expect(cart[0].quantity).toBe(2);
    });

    it('increments existing item quantity', () => {
      const cart1 = [{ product: sampleProduct, quantity: 2 }];
      const cart2 = addOrUpdateCartItem(cart1, sampleProduct, 3);
      expect(cart2.length).toBe(1);
      expect(cart2[0].quantity).toBe(5);
    });

    it('decrements quantity and removes when zero or less', () => {
      const cart1 = [{ product: sampleProduct, quantity: 2 }];
      const cart2 = addOrUpdateCartItem(cart1, sampleProduct, -1);
      expect(cart2[0].quantity).toBe(1);

      const cart3 = addOrUpdateCartItem(cart2, sampleProduct, -1);
      expect(cart3.length).toBe(0);
    });

    it('ignores zero or negative addition on empty cart', () => {
      const cart = addOrUpdateCartItem([], sampleProduct, 0);
      expect(cart.length).toBe(0);
    });

    it('removeCartItem filters out specified item', () => {
      const cart = [
        { product: sampleProduct, quantity: 1 },
        { product: sampleProduct2, quantity: 2 },
      ];
      const next = removeCartItem(cart, sampleProduct.id);
      expect(next.length).toBe(1);
      expect(next[0].product.id).toBe(sampleProduct2.id);
    });
  });

  describe('computeChangeDue', () => {
    it('calculates change accurately when tendered exceeds total', () => {
      expect(computeChangeDue(20.0, 14.75)).toBe(5.25);
      expect(computeChangeDue(50.0, 50.0)).toBe(0);
    });

    it('returns 0 if tendered is less than total', () => {
      expect(computeChangeDue(10.0, 14.75)).toBe(0);
    });
  });

  describe('calculateShiftVariance', () => {
    it('detects balanced drawer', () => {
      const res = calculateShiftVariance(200.0, 200.0);
      expect(res.variance).toBe(0);
      expect(res.status).toBe('Balanced');
    });

    it('detects overage', () => {
      const res = calculateShiftVariance(215.0, 200.0);
      expect(res.variance).toBe(15.0);
      expect(res.status).toBe('Overage');
    });

    it('detects shortage', () => {
      const res = calculateShiftVariance(190.0, 200.0);
      expect(res.variance).toBe(-10.0);
      expect(res.status).toBe('Shortage');
    });
  });

  describe('evaluateDiscountCode', () => {
    const percentageDiscount: Discount = {
      id: 'd1',
      code: 'SAVE10',
      description: '10% off',
      type: 'Percentage',
      value: 10,
      minOrderAmount: 20,
      isActive: true,
    };

    const fixedDiscount: Discount = {
      id: 'd2',
      code: 'FIVEBUCKS',
      description: '$5 off',
      type: 'FixedAmount',
      value: 5,
      minOrderAmount: 15,
      isActive: true,
    };

    it('returns invalid for undefined or inactive discount', () => {
      expect(evaluateDiscountCode(undefined, 50).isValid).toBe(false);
      expect(evaluateDiscountCode({ ...percentageDiscount, isActive: false }, 50).isValid).toBe(false);
    });

    it('validates minimum order amount threshold', () => {
      const underMin = evaluateDiscountCode(percentageDiscount, 15);
      expect(underMin.isValid).toBe(false);
      expect(underMin.message).toContain('Minimum order amount');
    });

    it('calculates percentage and fixed discounts', () => {
      const pct = evaluateDiscountCode(percentageDiscount, 50);
      expect(pct.isValid).toBe(true);
      expect(pct.discountAmount).toBe(5.0);

      const fixed = evaluateDiscountCode(fixedDiscount, 30);
      expect(fixed.isValid).toBe(true);
      expect(fixed.discountAmount).toBe(5.0);
    });
  });

  describe('formatReceiptData', () => {
    it('structures receipt dto correctly', () => {
      const order = FALLBACK_ORDERS[0];
      const receipt = formatReceiptData(order);
      expect(receipt.orderNumber).toBe(order.orderNumber);
      expect(receipt.grandTotal).toBe(order.grandTotal);
      expect(receipt.items.length).toBe(order.items.length);
    });
  });

  describe('filterProductsList & filterOrdersList', () => {
    it('filters products by category and search keyword', () => {
      const all = filterProductsList(FALLBACK_PRODUCTS, 'all', '');
      expect(all.length).toBe(FALLBACK_PRODUCTS.length);

      const coffee = filterProductsList(FALLBACK_PRODUCTS, 'cat-coffee', '');
      expect(coffee.every((p) => p.categoryId === 'cat-coffee')).toBe(true);

      const searched = filterProductsList(FALLBACK_PRODUCTS, 'all', 'croissant');
      expect(searched.length).toBe(1);
      expect(searched[0].name).toContain('Croissant');
    });

    it('filters orders by status and query', () => {
      const all = filterOrdersList(FALLBACK_ORDERS, 'all', '');
      expect(all.length).toBe(FALLBACK_ORDERS.length);

      const completed = filterOrdersList(FALLBACK_ORDERS, 'completed', '');
      expect(completed.every((o) => o.status === 'Completed')).toBe(true);

      const byNum = filterOrdersList(FALLBACK_ORDERS, 'all', 'POS-2026-0001');
      expect(byNum.length).toBe(1);
    });
  });
});
