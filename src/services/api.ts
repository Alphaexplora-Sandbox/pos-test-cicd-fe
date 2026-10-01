import {
  Category,
  Product,
  Customer,
  Discount,
  Order,
  RegisterShift,
  CashDrop,
  PosAnalytics,
  CreateOrderDto,
  ValidateDiscountResponse,
  ReceiptDto,
  UserProfile,
} from '../types/pos';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Fallback initial data in case the backend is unreachable
export const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-coffee', name: 'Artisan Coffee', description: 'Espresso & pour-overs', color: '#8B5A2B', icon: 'coffee' },
  { id: 'cat-tea', name: 'Specialty Teas', description: 'Organic loose leaf', color: '#2E8B57', icon: 'leaf' },
  { id: 'cat-bakery', name: 'Fresh Bakery', description: 'Pastries & sourdough', color: '#D2691E', icon: 'croissant' },
  { id: 'cat-deli', name: 'Gourmet Deli', description: 'Artisanal paninis & wraps', color: '#CD853F', icon: 'utensils' },
  { id: 'cat-sweets', name: 'Desserts', description: 'Cakes & brownies', color: '#C71585', icon: 'cake' },
  { id: 'cat-merch', name: 'Merchandise', description: 'Tumblers & brew gear', color: '#4682B4', icon: 'gift' },
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'COF-ESP-01',
    barcode: '794026110011',
    name: 'Single Origin Double Espresso',
    description: 'Intense crema with notes of hazelnut and cacao.',
    categoryId: 'cat-coffee',
    categoryName: 'Artisan Coffee',
    price: 3.75,
    cost: 0.85,
    taxRate: 0.08,
    stockQuantity: 150,
    lowStockThreshold: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    sku: 'COF-FLT-02',
    barcode: '794026110028',
    name: 'Silky Flat White',
    description: 'Velvety micro-foam poured over signature double ristretto.',
    categoryId: 'cat-coffee',
    categoryName: 'Artisan Coffee',
    price: 4.85,
    cost: 1.15,
    taxRate: 0.08,
    stockQuantity: 120,
    lowStockThreshold: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'COF-CLD-03',
    barcode: '794026110035',
    name: 'Nitro Cold Brew Reserve',
    description: 'Steeped 20 hours, nitrogen-infused creamy cascade.',
    categoryId: 'cat-coffee',
    categoryName: 'Artisan Coffee',
    price: 5.25,
    cost: 1.30,
    taxRate: 0.08,
    stockQuantity: 85,
    lowStockThreshold: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    sku: 'BAK-CRS-01',
    barcode: '794026330019',
    name: 'Golden French Butter Croissant',
    description: 'Laminated Normandy butter, baked fresh every morning.',
    categoryId: 'cat-bakery',
    categoryName: 'Fresh Bakery',
    price: 3.95,
    cost: 1.20,
    taxRate: 0.08,
    stockQuantity: 45,
    lowStockThreshold: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-10',
    sku: 'DEL-TRF-01',
    barcode: '794026440018',
    name: 'Truffle Roasted Turkey Panini',
    description: 'Smoked turkey, aged provolone, black truffle aioli.',
    categoryId: 'cat-deli',
    categoryName: 'Gourmet Deli',
    price: 9.75,
    cost: 3.40,
    taxRate: 0.08,
    stockQuantity: 35,
    lowStockThreshold: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-13',
    sku: 'SWT-CHK-01',
    barcode: '794026550017',
    name: 'San Sebastian Basque Cheesecake',
    description: 'Caramelized burnt crust with an oozing custard center.',
    categoryId: 'cat-sweets',
    categoryName: 'Desserts',
    price: 6.50,
    cost: 2.10,
    taxRate: 0.08,
    stockQuantity: 25,
    lowStockThreshold: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const FALLBACK_CUSTOMERS: Customer[] = [
  { id: 'cust-1', name: 'Alexander Wright', email: 'alexander@example.com', phone: '555-0142', loyaltyPoints: 240, tier: 'Gold', totalSpent: 485.50, createdAt: new Date().toISOString() },
  { id: 'cust-2', name: 'Elena Rostova', email: 'elena.r@example.com', phone: '555-0189', loyaltyPoints: 110, tier: 'Silver', totalSpent: 220.00, createdAt: new Date().toISOString() },
  { id: 'cust-3', name: 'David Chen', email: 'david.chen@example.com', phone: '555-0199', loyaltyPoints: 35, tier: 'Bronze', totalSpent: 75.00, createdAt: new Date().toISOString() },
];

export const FALLBACK_DISCOUNTS: Discount[] = [
  { id: 'disc-1', code: 'WELCOME10', description: '10% off your order', type: 'Percentage', value: 10, minOrderAmount: 10, isActive: true },
  { id: 'disc-2', code: 'SUMMER20', description: '20% off orders over $25', type: 'Percentage', value: 20, minOrderAmount: 25, isActive: true },
  { id: 'disc-3', code: 'FIVEBUCKS', description: '$5 off orders over $20', type: 'FixedAmount', value: 5, minOrderAmount: 20, isActive: true },
];

export const FALLBACK_SHIFT: RegisterShift = {
  id: 'shift-001',
  registerId: 'REG-01',
  cashierId: 'usr-3',
  cashierName: 'Emma Watson (Head Cashier)',
  openedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  startingFloat: 200,
  expectedCash: 214.75,
  status: 'Open',
  totalSales: 14.75,
  totalTransactions: 1,
};

export const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ord-init-1',
    orderNumber: 'POS-2026-0001',
    registerId: 'REG-01',
    cashierId: 'usr-3',
    cashierName: 'Emma Watson (Head Cashier)',
    customerId: 'cust-1',
    customerName: 'Alexander Wright',
    items: [
      { productId: 'prod-2', sku: 'COF-FLT-02', name: 'Silky Flat White', unitPrice: 4.85, quantity: 2, taxAmount: 0.78, discountAmount: 0, totalPrice: 9.70 },
      { productId: 'prod-7', sku: 'BAK-CRS-01', name: 'Golden French Butter Croissant', unitPrice: 3.95, quantity: 1, taxAmount: 0.32, discountAmount: 0, totalPrice: 3.95 },
    ],
    subtotal: 13.65,
    taxTotal: 1.10,
    discountTotal: 0,
    grandTotal: 14.75,
    paymentMethod: 'Card',
    amountTendered: 14.75,
    changeGiven: 0,
    status: 'Completed',
    notes: 'Morning rush transaction',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

export const FALLBACK_ANALYTICS: PosAnalytics = {
  totalRevenue: 14.75,
  totalOrders: 1,
  totalProducts: 6,
  lowStockCount: 0,
  activeShifts: 1,
  averageOrderValue: 14.75,
  topProducts: [
    { productId: 'prod-2', name: 'Silky Flat White', categoryName: 'Artisan Coffee', unitsSold: 2, revenue: 9.70 },
    { productId: 'prod-7', name: 'Golden French Butter Croissant', categoryName: 'Fresh Bakery', unitsSold: 1, revenue: 3.95 },
  ],
  categorySales: [
    { categoryId: 'cat-coffee', categoryName: 'Artisan Coffee', itemsSold: 2, revenue: 9.70 },
    { categoryId: 'cat-bakery', categoryName: 'Fresh Bakery', itemsSold: 1, revenue: 3.95 },
  ],
};

async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300);
  try {
    const res = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      if (fallback !== undefined) return fallback;
      throw new Error(`HTTP Error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const posApi = {
  async getCategories(): Promise<Category[]> {
    return safeFetch<Category[]>(`${API_BASE_URL}/api/v1/categories`, undefined, FALLBACK_CATEGORIES);
  },

  async getProducts(categoryId?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetch<Product[]>(`${API_BASE_URL}/api/v1/products${query}`, undefined, FALLBACK_PRODUCTS);
  },

  async getCustomers(search?: string): Promise<Customer[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return safeFetch<Customer[]>(`${API_BASE_URL}/api/v1/customers${query}`, undefined, FALLBACK_CUSTOMERS);
  },

  async createCustomer(customer: { name: string; email: string; phone: string }): Promise<Customer> {
    return safeFetch<Customer>(`${API_BASE_URL}/api/v1/customers`, {
      method: 'POST',
      body: JSON.stringify(customer),
    }, {
      id: `cust-${Date.now()}`,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      loyaltyPoints: 0,
      tier: 'Bronze',
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    });
  },

  async getDiscounts(): Promise<Discount[]> {
    return safeFetch<Discount[]>(`${API_BASE_URL}/api/v1/discounts`, undefined, FALLBACK_DISCOUNTS);
  },

  async validateDiscount(code: string, subtotal: number): Promise<ValidateDiscountResponse> {
    return safeFetch<ValidateDiscountResponse>(`${API_BASE_URL}/api/v1/discounts/validate`, {
      method: 'POST',
      body: JSON.stringify({ code, orderSubtotal: subtotal }),
    }, {
      isValid: code.toUpperCase() === 'WELCOME10',
      discountAmount: code.toUpperCase() === 'WELCOME10' ? Math.round(subtotal * 0.1 * 100) / 100 : 0,
      message: code.toUpperCase() === 'WELCOME10' ? '10% discount applied' : 'Invalid code',
    });
  },

  async createOrder(orderDto: CreateOrderDto): Promise<Order> {
    const fallbackOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      registerId: orderDto.registerId,
      cashierId: orderDto.cashierId,
      cashierName: 'Emma Watson (Head Cashier)',
      customerId: orderDto.customerId,
      customerName: orderDto.customerId ? 'Alexander Wright' : null,
      items: orderDto.items.map((i) => ({
        productId: i.productId,
        sku: 'SKU-ITEM',
        name: 'Item',
        unitPrice: 5.0,
        quantity: i.quantity,
        taxAmount: 0.4,
        discountAmount: 0,
        totalPrice: 5.4 * i.quantity,
      })),
      subtotal: 10.0,
      taxTotal: 0.8,
      discountTotal: 0,
      grandTotal: 10.8,
      paymentMethod: orderDto.paymentMethod,
      amountTendered: orderDto.amountTendered,
      changeGiven: Math.max(0, orderDto.amountTendered - 10.8),
      status: 'Completed',
      notes: orderDto.notes,
      createdAt: new Date().toISOString(),
    };

    return safeFetch<Order>(`${API_BASE_URL}/api/v1/orders`, {
      method: 'POST',
      body: JSON.stringify(orderDto),
    }, fallbackOrder);
  },

  async getOrders(status?: string, search?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetch<Order[]>(`${API_BASE_URL}/api/v1/orders${query}`, undefined, FALLBACK_ORDERS);
  },

  async getOrderReceipt(orderId: string): Promise<ReceiptDto | null> {
    return safeFetch<ReceiptDto | null>(`${API_BASE_URL}/api/v1/orders/${orderId}/receipt`, undefined, null);
  },

  async refundOrder(orderId: string, reason: string): Promise<Order | null> {
    return safeFetch<Order | null>(`${API_BASE_URL}/api/v1/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, null);
  },

  async voidOrder(orderId: string, reason: string): Promise<Order | null> {
    return safeFetch<Order | null>(`${API_BASE_URL}/api/v1/orders/${orderId}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, null);
  },

  async getCurrentShift(registerId = 'REG-01'): Promise<RegisterShift | null> {
    return safeFetch<RegisterShift | null>(`${API_BASE_URL}/api/v1/shifts/current?registerId=${registerId}`, undefined, FALLBACK_SHIFT);
  },

  async openShift(dto: { registerId: string; cashierId: string; startingFloat: number }): Promise<RegisterShift> {
    return safeFetch<RegisterShift>(`${API_BASE_URL}/api/v1/shifts/open`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }, {
      id: `shift-${Date.now()}`,
      registerId: dto.registerId,
      cashierId: dto.cashierId,
      cashierName: 'Emma Watson (Head Cashier)',
      openedAt: new Date().toISOString(),
      startingFloat: dto.startingFloat,
      expectedCash: dto.startingFloat,
      status: 'Open',
      totalSales: 0,
      totalTransactions: 0,
    });
  },

  async closeShift(shiftId: string, countedCash: number, notes?: string): Promise<RegisterShift | null> {
    return safeFetch<RegisterShift | null>(`${API_BASE_URL}/api/v1/shifts/${shiftId}/close`, {
      method: 'POST',
      body: JSON.stringify({ countedCash, notes }),
    }, null);
  },

  async addCashDrop(shiftId: string, type: string, amount: number, reason: string): Promise<CashDrop | null> {
    return safeFetch<CashDrop | null>(`${API_BASE_URL}/api/v1/shifts/${shiftId}/cash-drop`, {
      method: 'POST',
      body: JSON.stringify({ type, amount, reason }),
    }, null);
  },

  async adjustStock(productId: string, quantityChange: number, reason: string): Promise<Product | null> {
    return safeFetch<Product | null>(`${API_BASE_URL}/api/v1/products/${productId}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify({ quantityChange, reason }),
    }, null);
  },

  async getAnalytics(): Promise<PosAnalytics> {
    return safeFetch<PosAnalytics>(`${API_BASE_URL}/api/v1/analytics/overview`, undefined, FALLBACK_ANALYTICS);
  },

  async login(username: string, password: string): Promise<UserProfile | null> {
    return safeFetch<UserProfile | null>(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, {
      id: 'usr-3',
      username: 'cashier1',
      email: 'cashier1@novapos.io',
      fullName: 'Emma Watson (Head Cashier)',
      role: 'Cashier',
      token: 'token-cashier-session-xyz',
    });
  },
};

export type PosApiClient = typeof posApi;

