import React, { useState, useEffect } from 'react';
import { Header, PosView } from './components/Header';
import { TerminalView } from './components/TerminalView';
import { OrdersView } from './components/OrdersView';
import { InventoryView } from './components/InventoryView';
import { ShiftView } from './components/ShiftView';
import { CustomersView } from './components/CustomersView';
import { AnalyticsView } from './components/AnalyticsView';
import {
  Product,
  Category,
  Customer,
  Order,
  RegisterShift,
  PosAnalytics,
} from './types/pos';
import {
  posApi,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_SHIFT,
  FALLBACK_ORDERS,
  FALLBACK_ANALYTICS,
} from './services/api';
import {
  fetchInitialAppData,
  refreshProductsList,
  refreshOrdersAndAnalytics,
  refreshShiftStatus,
  refreshCustomersList,
} from './services/appState';
import { colors } from './components/styles';

export interface AppProps {
  title?: string;
  initialView?: PosView;
}

export function App({
  title = 'pos-test-cicd-frontend',
  initialView = 'terminal',
}: AppProps) {
  const [currentView, setCurrentView] = useState<PosView>(initialView);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(FALLBACK_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);
  const [currentShift, setCurrentShift] = useState<RegisterShift | null>(FALLBACK_SHIFT);
  const [analytics, setAnalytics] = useState<PosAnalytics>(FALLBACK_ANALYTICS);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    loadAppMountData(posApi, {
      setCategories: (c) => { if (isMounted) setCategories(c); },
      setProducts: (p) => { if (isMounted) setProducts(p); },
      setCustomers: (c) => { if (isMounted) setCustomers(c); },
      setOrders: (o) => { if (isMounted) setOrders(o); },
      setCurrentShift: (s) => { if (isMounted) setCurrentShift(s); },
      setAnalytics: (a) => { if (isMounted) setAnalytics(a); },
      setIsOnline: (o) => { if (isMounted) setIsOnline(o); },
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshProducts = () => handleAppProductRefresh(posApi, products, setProducts);
  const refreshOrders = () => handleAppOrdersRefresh(posApi, orders, analytics, setOrders, setAnalytics);
  const refreshShift = () => handleAppShiftRefresh(posApi, currentShift, setCurrentShift);
  const refreshCustomers = () => handleAppCustomersRefresh(posApi, customers, setCustomers);
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    refreshProducts();
    refreshShift();
    refreshOrders();
  };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: '100vh',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hidden semantic header for accessibility and test suite contract */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
        {title}
      </h1>

      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        isOnline={isOnline}
      />

      <main style={{ flex: 1, overflow: 'hidden' }}>
        {currentView === 'terminal' && (
          <TerminalView
            products={products}
            categories={categories}
            customers={customers}
            onOrderCompleted={handleOrderCompleted}
          />
        )}
        {currentView === 'orders' && (
          <OrdersView
            orders={orders}
            onRefreshOrders={refreshOrders}
          />
        )}
        {currentView === 'inventory' && (
          <InventoryView
            products={products}
            categories={categories}
            onRefreshProducts={refreshProducts}
          />
        )}
        {currentView === 'shifts' && (
          <ShiftView
            currentShift={currentShift}
            onRefreshShift={refreshShift}
          />
        )}
        {currentView === 'customers' && (
          <CustomersView
            customers={customers}
            onRefreshCustomers={refreshCustomers}
          />
        )}
        {currentView === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
          />
        )}
      </main>
    </div>
  );
}

export async function handleAppProductRefresh(
  api: typeof posApi,
  products: Product[],
  setProducts?: (p: Product[]) => void
) {
  const updated = await refreshProductsList(api, products);
  setProducts?.(updated);
  return updated;
}

export async function handleAppOrdersRefresh(
  api: typeof posApi,
  orders: Order[],
  analytics: PosAnalytics,
  setOrders?: (o: Order[]) => void,
  setAnalytics?: (a: PosAnalytics) => void
) {
  const res = await refreshOrdersAndAnalytics(api, orders, analytics);
  setOrders?.(res.orders);
  setAnalytics?.(res.analytics);
  return res;
}

export async function handleAppShiftRefresh(
  api: typeof posApi,
  currentShift: RegisterShift | null,
  setShift?: (s: RegisterShift | null) => void
) {
  const shift = await refreshShiftStatus(api, currentShift);
  setShift?.(shift);
  return shift;
}

export async function handleAppCustomersRefresh(
  api: typeof posApi,
  customers: Customer[],
  setCustomers?: (c: Customer[]) => void
) {
  const custs = await refreshCustomersList(api, customers);
  setCustomers?.(custs);
  return custs;
}

export async function handleAppOrderCompleted(
  api: typeof posApi,
  newOrder: Order,
  orders: Order[],
  products: Product[],
  currentShift: RegisterShift | null,
  analytics: PosAnalytics
) {
  const [prods, shift, ordsAndAnal] = await Promise.all([
    refreshProductsList(api, products),
    refreshShiftStatus(api, currentShift),
    refreshOrdersAndAnalytics(api, [newOrder, ...orders], analytics),
  ]);
  return {
    orders: ordsAndAnal.orders,
    products: prods,
    shift,
    analytics: ordsAndAnal.analytics,
  };
}

export async function loadAppMountData(
  api: typeof posApi,
  setters: {
    setCategories: (c: Category[]) => void;
    setProducts: (p: Product[]) => void;
    setCustomers: (c: Customer[]) => void;
    setOrders: (o: Order[]) => void;
    setCurrentShift: (s: RegisterShift | null) => void;
    setAnalytics: (a: PosAnalytics) => void;
    setIsOnline: (o: boolean) => void;
  }
) {
  const data = await fetchInitialAppData(api);
  setters.setCategories(data.categories);
  setters.setProducts(data.products);
  setters.setCustomers(data.customers);
  setters.setOrders(data.orders);
  setters.setCurrentShift(data.currentShift);
  setters.setAnalytics(data.analytics);
  setters.setIsOnline(data.isOnline);
  return data;
}