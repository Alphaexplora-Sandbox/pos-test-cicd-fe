import {
  Product,
  Customer,
  Order,
  ReceiptDto,
  RegisterShift,
} from '../types/pos';
import {
  CartItem,
  addOrUpdateCartItem,
  removeCartItem,
  formatReceiptData,
} from './posLogic';
import { posApi } from './api';

export const terminalController = {
  addToCart(
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    product: Product
  ): void {
    setCart((prev) => addOrUpdateCartItem(prev, product, 1));
  },

  updateQuantity(
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    products: Product[],
    productId: string,
    delta: number
  ): void {
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setCart((prev) => addOrUpdateCartItem(prev, prod, delta));
    }
  },

  removeFromCart(
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    productId: string
  ): void {
    setCart((prev) => removeCartItem(prev, productId));
  },

  clearCart(
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
    setDiscountCode: (val: string) => void,
    setDiscountAmount: (val: number) => void,
    setDiscountMessage: (val: string) => void,
    setSelectedCustomerId: (val: string) => void,
    setLatestReceipt: (val: ReceiptDto | null) => void
  ): void {
    setCart([]);
    setDiscountCode('');
    setDiscountAmount(0);
    setDiscountMessage('');
    setSelectedCustomerId('');
    setLatestReceipt(null);
  },

  async applyDiscount(
    discountCode: string,
    subtotal: number,
    apiClient: typeof posApi,
    setDiscountAmount: (amt: number) => void,
    setDiscountMessage: (msg: string) => void
  ): Promise<boolean> {
    if (!discountCode.trim()) return false;
    try {
      const res = await apiClient.validateDiscount(discountCode, subtotal);
      if (res.isValid) {
        setDiscountAmount(res.discountAmount);
        setDiscountMessage(`✓ ${res.message || 'Discount applied'}`);
        return true;
      } else {
        setDiscountAmount(0);
        setDiscountMessage(`✕ ${res.message || 'Invalid discount'}`);
        return false;
      }
    } catch {
      setDiscountMessage('✕ Error verifying code');
      return false;
    }
  },

  async completePayment(
    cart: CartItem[],
    selectedCustomerId: string,
    discountCode: string,
    discountAmount: number,
    paymentMethod: string,
    amountTendered: number,
    customers: Customer[],
    apiClient: typeof posApi,
    setLatestReceipt: (r: ReceiptDto) => void,
    setIsCheckingOut: (val: boolean) => void,
    onOrderCompleted?: (order: Order) => void
  ): Promise<Order | null> {
    if (cart.length === 0) return null;
    const orderPayload = {
      registerId: 'REG-01',
      cashierId: 'usr-3',
      customerId: selectedCustomerId || null,
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      discountCode: discountAmount > 0 ? discountCode : null,
      paymentMethod,
      amountTendered,
      notes: 'NovaPOS Terminal sale',
    };

    const completedOrder = await apiClient.createOrder(orderPayload);
    const customerObj = customers.find((c) => c.id === selectedCustomerId);
    const receipt = formatReceiptData(completedOrder);
    receipt.customerName = customerObj?.name || null;

    setLatestReceipt(receipt);
    setIsCheckingOut(false);
    onOrderCompleted?.(completedOrder);
    return completedOrder;
  },

  async viewReceipt(
    orderId: string,
    orders: Order[],
    apiClient: typeof posApi,
    setSelectedReceipt: (r: ReceiptDto) => void
  ): Promise<ReceiptDto | null> {
    const fetched = await apiClient.getOrderReceipt(orderId);
    if (fetched) {
      setSelectedReceipt(fetched);
      return fetched;
    }
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const receipt = formatReceiptData(order);
      setSelectedReceipt(receipt);
      return receipt;
    }
    return null;
  },

  async refundOrder(
    orderId: string,
    apiClient: typeof posApi,
    onRefreshOrders?: () => void
  ): Promise<Order | null> {
    const res = await apiClient.refundOrder(orderId, 'Cashier requested refund');
    onRefreshOrders?.();
    return res;
  },

  async voidOrder(
    orderId: string,
    apiClient: typeof posApi,
    onRefreshOrders?: () => void
  ): Promise<Order | null> {
    const res = await apiClient.voidOrder(orderId, 'Cashier voided sale');
    onRefreshOrders?.();
    return res;
  },

  async adjustStock(
    productId: string,
    delta: number,
    reason: string,
    apiClient: typeof posApi,
    setAdjustingProduct: (val: null) => void,
    onRefreshProducts?: () => void
  ): Promise<Product | null> {
    const res = await apiClient.adjustStock(productId, delta, reason);
    setAdjustingProduct(null);
    onRefreshProducts?.();
    return res;
  },

  async cashDrop(
    shiftId: string,
    dropType: string,
    dropAmount: number,
    dropReason: string,
    apiClient: typeof posApi,
    setIsDroppingCash: (val: boolean) => void,
    onRefreshShift?: () => void
  ): Promise<void> {
    await apiClient.addCashDrop(shiftId, dropType, dropAmount, dropReason);
    setIsDroppingCash(false);
    onRefreshShift?.();
  },

  async closeShift(
    shiftId: string,
    countedCash: number,
    closeNotes: string,
    apiClient: typeof posApi,
    setIsClosingShift: (val: boolean) => void,
    onRefreshShift?: () => void
  ): Promise<RegisterShift | null> {
    const res = await apiClient.closeShift(shiftId, countedCash, closeNotes);
    setIsClosingShift(false);
    onRefreshShift?.();
    return res;
  },

  async openShift(
    registerId: string,
    cashierId: string,
    startingFloat: number,
    apiClient: typeof posApi,
    setIsOpeningShift: (val: boolean) => void,
    onRefreshShift?: () => void
  ): Promise<RegisterShift> {
    const res = await apiClient.openShift({ registerId, cashierId, startingFloat });
    setIsOpeningShift(false);
    onRefreshShift?.();
    return res;
  },

  async createCustomer(
    name: string,
    email: string,
    phone: string,
    apiClient: typeof posApi,
    setName: (val: string) => void,
    setEmail: (val: string) => void,
    setPhone: (val: string) => void,
    setIsAdding: (val: boolean) => void,
    onRefreshCustomers?: () => void
  ): Promise<Customer> {
    const res = await apiClient.createCustomer({ name, email, phone });
    setName('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
    onRefreshCustomers?.();
    return res;
  },
};
