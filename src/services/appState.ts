import { Category, Product, Customer, Order, RegisterShift, PosAnalytics } from '../types/pos';
import {
  PosApiClient,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_ORDERS,
  FALLBACK_SHIFT,
  FALLBACK_ANALYTICS,
} from './api';

export interface AppStateData {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  currentShift: RegisterShift | null;
  analytics: PosAnalytics;
  isOnline: boolean;
}

export async function fetchInitialAppData(api: PosApiClient): Promise<AppStateData> {
  try {
    const [cats, prods, custs, ords, shift, anal] = await Promise.all([
      api.getCategories(),
      api.getProducts(),
      api.getCustomers(),
      api.getOrders(),
      api.getCurrentShift(),
      api.getAnalytics(),
    ]);

    return {
      categories: cats && cats.length > 0 ? cats : FALLBACK_CATEGORIES,
      products: prods && prods.length > 0 ? prods : FALLBACK_PRODUCTS,
      customers: custs && custs.length > 0 ? custs : FALLBACK_CUSTOMERS,
      orders: ords || FALLBACK_ORDERS,
      currentShift: shift || FALLBACK_SHIFT,
      analytics: anal || FALLBACK_ANALYTICS,
      isOnline: true,
    };
  } catch {
    return {
      categories: FALLBACK_CATEGORIES,
      products: FALLBACK_PRODUCTS,
      customers: FALLBACK_CUSTOMERS,
      orders: FALLBACK_ORDERS,
      currentShift: FALLBACK_SHIFT,
      analytics: FALLBACK_ANALYTICS,
      isOnline: false,
    };
  }
}

export async function refreshProductsList(
  api: PosApiClient,
  current: Product[]
): Promise<Product[]> {
  try {
    const prods = await api.getProducts();
    return prods && prods.length > 0 ? prods : current;
  } catch {
    return current;
  }
}

export async function refreshOrdersAndAnalytics(
  api: PosApiClient,
  currentOrders: Order[],
  currentAnalytics: PosAnalytics
): Promise<{ orders: Order[]; analytics: PosAnalytics }> {
  try {
    const [ords, anal] = await Promise.all([api.getOrders(), api.getAnalytics()]);
    return {
      orders: ords || currentOrders,
      analytics: anal || currentAnalytics,
    };
  } catch {
    return { orders: currentOrders, analytics: currentAnalytics };
  }
}

export async function refreshShiftStatus(
  api: PosApiClient,
  current: RegisterShift | null
): Promise<RegisterShift | null> {
  try {
    const shift = await api.getCurrentShift();
    return shift !== undefined ? shift : current;
  } catch {
    return current;
  }
}

export async function refreshCustomersList(
  api: PosApiClient,
  current: Customer[]
): Promise<Customer[]> {
  try {
    const custs = await api.getCustomers();
    return custs && custs.length > 0 ? custs : current;
  } catch {
    return current;
  }
}
