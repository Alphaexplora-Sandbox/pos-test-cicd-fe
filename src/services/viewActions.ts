import { PosApiClient } from './api';
import { Product, Customer, Order, ReceiptDto, CreateOrderDto } from '../types/pos';

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T | null;
  error?: string;
}

export async function createCustomerAction(
  api: PosApiClient,
  name: string,
  email: string,
  phone: string
): Promise<ActionResponse<Customer>> {
  if (!name.trim() || !email.trim()) {
    return { success: false, error: 'Name and email are required.' };
  }
  try {
    const customer = await api.createCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    return { success: true, data: customer };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function adjustStockAction(
  api: PosApiClient,
  productId: string,
  delta: number,
  reason: string
): Promise<ActionResponse<Product>> {
  if (!productId) {
    return { success: false, error: 'Product ID is required.' };
  }
  try {
    const product = await api.adjustStock(productId, delta, reason.trim() || 'Manual adjustment');
    return { success: true, data: product };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function recordCashDropAction(
  api: PosApiClient,
  shiftId: string,
  amount: number,
  reason: string
): Promise<ActionResponse> {
  if (amount <= 0) {
    return { success: false, error: 'Amount must be greater than 0.' };
  }
  try {
    await api.addCashDrop(shiftId, 'Safe Drop', amount, reason.trim() || 'Register cash drop');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function closeShiftAction(
  api: PosApiClient,
  shiftId: string,
  countedCash: number,
  notes: string
): Promise<ActionResponse> {
  if (countedCash < 0) {
    return { success: false, error: 'Counted cash cannot be negative.' };
  }
  try {
    await api.closeShift(shiftId, countedCash, notes.trim() || 'End of shift count');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function openShiftAction(
  api: PosApiClient,
  startingCash: number,
  registerId = 'REG-01',
  cashierId = 'usr-3'
): Promise<ActionResponse> {
  if (startingCash < 0) {
    return { success: false, error: 'Starting float cannot be negative.' };
  }
  try {
    const shift = await api.openShift({ registerId, cashierId, startingFloat: startingCash });
    return { success: true, data: shift };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function refundOrderAction(
  api: PosApiClient,
  orderId: string,
  reason: string
): Promise<ActionResponse> {
  if (!orderId) {
    return { success: false, error: 'Order ID is required.' };
  }
  try {
    await api.refundOrder(orderId, reason.trim() || 'Customer requested refund');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function voidOrderAction(
  api: PosApiClient,
  orderId: string,
  reason: string
): Promise<ActionResponse> {
  if (!orderId) {
    return { success: false, error: 'Order ID is required.' };
  }
  try {
    await api.voidOrder(orderId, reason.trim() || 'Transaction cancelled by cashier');
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function applyDiscountAction(
  api: PosApiClient,
  code: string,
  subtotal: number
): Promise<{ amount: number; message: string; isValid: boolean }> {
  if (!code.trim()) {
    return { amount: 0, message: '', isValid: false };
  }
  try {
    const res = await api.validateDiscount(code.trim(), subtotal);
    if (res.isValid) {
      return {
        amount: res.discountAmount,
        message: `✓ ${res.message || 'Discount applied'}`,
        isValid: true,
      };
    }
    return {
      amount: 0,
      message: `✕ ${res.message || 'Invalid promo code'}`,
      isValid: false,
    };
  } catch {
    return {
      amount: 0,
      message: '✕ Discount verification failed',
      isValid: false,
    };
  }
}

export async function executeCheckoutAction(
  api: PosApiClient,
  cart: { product: Product; quantity: number }[],
  customerId: string | null,
  discountCode: string | null,
  paymentMethod: 'Cash' | 'Card' | 'MobilePay',
  amountTendered: number,
  customers: Customer[]
): Promise<ActionResponse<{ order: Order; receipt: ReceiptDto }>> {
  if (!cart || cart.length === 0) {
    return { success: false, error: 'Cart is empty.' };
  }
  try {
    const payload: CreateOrderDto = {
      registerId: 'REG-01',
      cashierId: 'usr-3',
      customerId: customerId || null,
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      discountCode: discountCode || null,
      paymentMethod,
      amountTendered,
      notes: 'NovaPOS Terminal checkout',
    };

    const completed = await api.createOrder(payload);
    const customerObj = customers.find((c) => c.id === customerId);

    const receipt: ReceiptDto = {
      orderNumber: completed.orderNumber,
      storeName: 'NovaPOS Flagship Cafe & Store',
      storeAddress: '100 Innovation Boulevard, Tech District',
      storePhone: '(555) 019-4822',
      timestamp: completed.createdAt,
      cashierName: completed.cashierName,
      customerName: customerObj?.name || null,
      items: completed.items,
      subtotal: completed.subtotal,
      taxTotal: completed.taxTotal,
      discountTotal: completed.discountTotal,
      grandTotal: completed.grandTotal,
      paymentMethod: completed.paymentMethod,
      amountTendered: completed.amountTendered,
      changeGiven: completed.changeGiven,
      status: completed.status,
    };

    return { success: true, data: { order: completed, receipt } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown checkout error' };
  }
}
