export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  taxRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  tier: string;
  totalSpent: number;
  createdAt: string;
}

export interface Discount {
  id: string;
  code: string;
  description: string;
  type: 'Percentage' | 'FixedAmount';
  value: number;
  minOrderAmount: number;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  registerId: string;
  cashierId: string;
  cashierName: string;
  customerId?: string | null;
  customerName?: string | null;
  items: OrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: string;
  amountTendered: number;
  changeGiven: number;
  status: 'Completed' | 'Refunded' | 'Voided' | 'Pending';
  notes?: string | null;
  createdAt: string;
}

export interface RegisterShift {
  id: string;
  registerId: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string | null;
  startingFloat: number;
  expectedCash: number;
  countedCash?: number | null;
  variance?: number | null;
  status: 'Open' | 'Closed';
  totalSales: number;
  totalTransactions: number;
}

export interface CashDrop {
  id: string;
  shiftId: string;
  type: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
}

export interface TopProductDto {
  productId: string;
  name: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
}

export interface CategorySalesDto {
  categoryId: string;
  categoryName: string;
  itemsSold: number;
  revenue: number;
}

export interface PosAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  activeShifts: number;
  averageOrderValue: number;
  topProducts: TopProductDto[];
  categorySales: CategorySalesDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  registerId: string;
  cashierId: string;
  customerId?: string | null;
  items: CreateOrderItemDto[];
  discountCode?: string | null;
  paymentMethod: string;
  amountTendered: number;
  notes?: string | null;
}

export interface ValidateDiscountResponse {
  isValid: boolean;
  discountAmount: number;
  message?: string;
}

export interface ReceiptDto {
  orderNumber: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  timestamp: string;
  cashierName: string;
  customerName?: string | null;
  items: OrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: string;
  amountTendered: number;
  changeGiven: number;
  status: string;
}
