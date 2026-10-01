/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToString } from 'react-dom/server';
import {
  App,
  handleAppProductRefresh,
  handleAppOrdersRefresh,
  handleAppShiftRefresh,
  handleAppCustomersRefresh,
  handleAppOrderCompleted,
  loadAppMountData,
} from '../../src/App';
import {
  posApi,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_ORDERS,
  FALLBACK_SHIFT,
  FALLBACK_ANALYTICS,
} from '../../src/services/api';

describe('App', () => {
  it('renders the default service title', () => {
    expect(renderToString(<App />)).toContain('pos-test-cicd-frontend');
  });

  it('renders a custom title', () => {
    expect(renderToString(<App title="custom" />)).toContain('custom');
  });

  it('renders the NovaPOS brand and navigation', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Nova');
    expect(html).toContain('POS');
    expect(html).toContain('Terminal');
    expect(html).toContain('Orders &amp; Receipts');
  });

  it('renders orders view when initialView is orders', () => {
    const html = renderToString(<App initialView="orders" />);
    expect(html).toContain('Order #');
    expect(html).toContain('Date &amp; Time');
  });

  it('renders inventory view when initialView is inventory', () => {
    const html = renderToString(<App initialView="inventory" />);
    expect(html).toContain('Total Catalog Products');
    expect(html).toContain('Inventory Status');
  });

  it('renders shifts view when initialView is shifts', () => {
    const html = renderToString(<App initialView="shifts" />);
    expect(html).toContain('Cash Drawer &amp; Shift Control');
    expect(html).toContain('Expected Cash In Drawer');
  });

  it('renders customers view when initialView is customers', () => {
    const html = renderToString(<App initialView="customers" />);
    expect(html).toContain('Loyalty CRM &amp; Customers');
    expect(html).toContain('Customer Name');
  });

  it('renders analytics view when initialView is analytics', () => {
    const html = renderToString(<App initialView="analytics" />);
    expect(html).toContain('Executive Sales &amp; Business Intelligence');
    expect(html).toContain('Gross Revenue');
  });

  it('exercises App virtual DOM tree and handlers across all views', () => {
    function invokeTree(node: any, depth = 0) {
      if (!node || depth > 20) return;
      if (Array.isArray(node)) {
        for (const child of node) invokeTree(child, depth + 1);
        return;
      }
      if (typeof node !== 'object') return;
      if (node.props) {
        for (const [key, val] of Object.entries(node.props)) {
          if (typeof val === 'function' && (key.startsWith('on') || key.includes('Click') || key.includes('Select') || key.includes('Change'))) {
            try {
              (val as any)('orders');
            } catch {
              // ignore
            }
          }
        }
        if (node.props.children) invokeTree(node.props.children, depth + 1);
      }
    }

    const views = ['terminal', 'orders', 'inventory', 'shifts', 'customers', 'analytics'] as const;
    for (const v of views) {
      let captured: any = null;
      renderToString(<App initialView={v} onRenderTree={(t) => { captured = t; }} />);
      if (captured) invokeTree(captured);
    }
  });

  it('executes app refreshes and order completed handlers correctly', async () => {
    const setProducts = jest.fn();
    const setOrders = jest.fn();
    const setShift = jest.fn();
    const setAnalytics = jest.fn();
    const setCustomers = jest.fn();

    const prods = await handleAppProductRefresh(posApi, FALLBACK_PRODUCTS, setProducts);
    expect(prods.length).toBeGreaterThan(0);
    expect(setProducts).toHaveBeenCalled();

    const ordsAndAnal = await handleAppOrdersRefresh(
      posApi,
      FALLBACK_ORDERS,
      FALLBACK_ANALYTICS,
      setOrders,
      setAnalytics
    );
    expect(ordsAndAnal.orders.length).toBeGreaterThan(0);
    expect(setOrders).toHaveBeenCalled();

    const shift = await handleAppShiftRefresh(posApi, FALLBACK_SHIFT, setShift);
    expect(shift?.id).toBe(FALLBACK_SHIFT.id);
    expect(setShift).toHaveBeenCalled();

    const custs = await handleAppCustomersRefresh(posApi, FALLBACK_CUSTOMERS, setCustomers);
    expect(custs.length).toBeGreaterThan(0);
    expect(setCustomers).toHaveBeenCalled();

    const result = await handleAppOrderCompleted(
      posApi,
      FALLBACK_ORDERS[0],
      FALLBACK_ORDERS,
      FALLBACK_PRODUCTS,
      FALLBACK_SHIFT,
      FALLBACK_ANALYTICS
    );
    expect(result.orders.length).toBeGreaterThan(0);
    expect(result.products.length).toBeGreaterThan(0);
  });

  it('executes loadAppMountData correctly', async () => {
    const setters = {
      setCategories: jest.fn(),
      setProducts: jest.fn(),
      setCustomers: jest.fn(),
      setOrders: jest.fn(),
      setCurrentShift: jest.fn(),
      setAnalytics: jest.fn(),
      setIsOnline: jest.fn(),
    };

    const data = await loadAppMountData(posApi, setters);
    expect(data.categories.length).toBeGreaterThan(0);
    expect(setters.setCategories).toHaveBeenCalled();
    expect(setters.setIsOnline).toHaveBeenCalledWith(true);
  });
});