import { Product, Order, ReceiptDto, ValidateDiscountResponse, Discount } from '../types/pos';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
}

export function calculateCartTotals(
  cart: CartItem[],
  discountAmount: number = 0,
  taxRate: number = 0.08
): CartTotals {
  const subtotal = Math.round(
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * 100
  ) / 100;

  const validDiscount = Math.min(subtotal, Math.max(0, discountAmount));
  const taxTotal = Math.round(subtotal * taxRate * 100) / 100;
  const grandTotal = Math.max(0, Math.round((subtotal - validDiscount + taxTotal) * 100) / 100);

  return {
    subtotal,
    discountTotal: validDiscount,
    taxTotal,
    grandTotal,
  };
}

export function addOrUpdateCartItem(cart: CartItem[], product: Product, quantityDelta: number = 1): CartItem[] {
  const existingIndex = cart.findIndex((item) => item.product.id === product.id);

  if (existingIndex >= 0) {
    const updatedQty = cart[existingIndex].quantity + quantityDelta;
    if (updatedQty <= 0) {
      return cart.filter((_, idx) => idx !== existingIndex);
    }
    const next = [...cart];
    next[existingIndex] = { ...next[existingIndex], quantity: updatedQty };
    return next;
  }

  if (quantityDelta <= 0) {
    return cart;
  }

  return [...cart, { product, quantity: quantityDelta }];
}

export function removeCartItem(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.product.id !== productId);
}

export function computeChangeDue(amountTendered: number, grandTotal: number): number {
  if (amountTendered < grandTotal) return 0;
  return Math.round((amountTendered - grandTotal) * 100) / 100;
}

export function calculateShiftVariance(countedCash: number, expectedCash: number): {
  variance: number;
  status: 'Balanced' | 'Overage' | 'Shortage';
} {
  const variance = Math.round((countedCash - expectedCash) * 100) / 100;
  let status: 'Balanced' | 'Overage' | 'Shortage' = 'Balanced';
  if (variance > 0) status = 'Overage';
  else if (variance < 0) status = 'Shortage';

  return { variance, status };
}

export function evaluateDiscountCode(
  discount: Discount | undefined,
  orderSubtotal: number
): ValidateDiscountResponse {
  if (!discount || !discount.isActive) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Invalid or expired promotional code.',
    };
  }

  if (discount.minOrderAmount && orderSubtotal < discount.minOrderAmount) {
    return {
      isValid: false,
      discountAmount: 0,
      message: `Minimum order amount of $${discount.minOrderAmount.toFixed(2)} required.`,
    };
  }

  const amount = discount.type === 'Percentage'
    ? Math.round(orderSubtotal * (discount.value / 100) * 100) / 100
    : Math.min(orderSubtotal, discount.value);

  return {
    isValid: true,
    discountAmount: amount,
    message: `Applied ${discount.description} (-$${amount.toFixed(2)})`,
  };
}

export function formatReceiptData(
  order: Order,
  storeInfo = {
    name: 'NovaPOS Flagship Cafe & Store',
    address: '100 Innovation Boulevard, Tech District',
    phone: '(555) 019-4822',
  }
): ReceiptDto {
  return {
    orderNumber: order.orderNumber,
    storeName: storeInfo.name,
    storeAddress: storeInfo.address,
    storePhone: storeInfo.phone,
    timestamp: order.createdAt,
    cashierName: order.cashierName,
    customerName: order.customerName,
    items: order.items,
    subtotal: order.subtotal,
    taxTotal: order.taxTotal,
    discountTotal: order.discountTotal,
    grandTotal: order.grandTotal,
    paymentMethod: order.paymentMethod,
    amountTendered: order.amountTendered,
    changeGiven: order.changeGiven,
    status: order.status,
  };
}

export function filterProductsList(
  products: Product[],
  categoryId: string = 'all',
  searchQuery: string = ''
): Product[] {
  const query = searchQuery.trim().toLowerCase();
  return products.filter((p) => {
    const matchesCat = categoryId === 'all' || p.categoryId === categoryId;
    const matchesQuery =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query);
    return matchesCat && matchesQuery && p.isActive;
  });
}

export function filterOrdersList(
  orders: Order[],
  statusFilter: string = 'all',
  searchQuery: string = ''
): Order[] {
  const query = searchQuery.trim().toLowerCase();
  return orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesQuery =
      query === '' ||
      o.orderNumber.toLowerCase().includes(query) ||
      (o.customerName && o.customerName.toLowerCase().includes(query));
    return matchesStatus && matchesQuery;
  });
}
