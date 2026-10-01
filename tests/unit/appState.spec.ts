import {
  fetchInitialAppData,
  refreshProductsList,
  refreshOrdersAndAnalytics,
  refreshShiftStatus,
  refreshCustomersList,
} from '../../src/services/appState';
import {
  PosApiClient,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_ORDERS,
  FALLBACK_SHIFT,
  FALLBACK_ANALYTICS,
} from '../../src/services/api';

describe('appState service', () => {
  it('loads full app state when all API calls succeed', async () => {
    const mockApi: Partial<PosApiClient> = {
      getCategories: jest.fn().mockResolvedValue(FALLBACK_CATEGORIES),
      getProducts: jest.fn().mockResolvedValue(FALLBACK_PRODUCTS),
      getCustomers: jest.fn().mockResolvedValue(FALLBACK_CUSTOMERS),
      getOrders: jest.fn().mockResolvedValue(FALLBACK_ORDERS),
      getCurrentShift: jest.fn().mockResolvedValue(FALLBACK_SHIFT),
      getAnalytics: jest.fn().mockResolvedValue(FALLBACK_ANALYTICS),
    };

    const state = await fetchInitialAppData(mockApi as PosApiClient);
    expect(state.isOnline).toBe(true);
    expect(state.categories).toEqual(FALLBACK_CATEGORIES);
    expect(state.products.length).toBeGreaterThan(0);
    expect(state.customers.length).toBeGreaterThan(0);
    expect(state.orders.length).toBeGreaterThan(0);
    expect(state.currentShift?.registerId).toBe('REG-01');
    expect(state.analytics.totalOrders).toBe(FALLBACK_ANALYTICS.totalOrders);
  });

  it('falls back to local data gracefully when API throws network error', async () => {
    const mockApi: Partial<PosApiClient> = {
      getCategories: jest.fn().mockRejectedValue(new Error('Network down')),
      getProducts: jest.fn().mockRejectedValue(new Error('Network down')),
      getCustomers: jest.fn().mockRejectedValue(new Error('Network down')),
      getOrders: jest.fn().mockRejectedValue(new Error('Network down')),
      getCurrentShift: jest.fn().mockRejectedValue(new Error('Network down')),
      getAnalytics: jest.fn().mockRejectedValue(new Error('Network down')),
    };

    const state = await fetchInitialAppData(mockApi as PosApiClient);
    expect(state.isOnline).toBe(false);
    expect(state.categories).toEqual(FALLBACK_CATEGORIES);
    expect(state.products).toEqual(FALLBACK_PRODUCTS);
  });

  it('refreshes products list correctly', async () => {
    const mockApiSuccess: Partial<PosApiClient> = {
      getProducts: jest.fn().mockResolvedValue([FALLBACK_PRODUCTS[0]]),
    };
    const updated = await refreshProductsList(mockApiSuccess as PosApiClient, FALLBACK_PRODUCTS);
    expect(updated.length).toBe(1);

    const mockApiFail: Partial<PosApiClient> = {
      getProducts: jest.fn().mockRejectedValue(new Error('Failed')),
    };
    const unchanged = await refreshProductsList(mockApiFail as PosApiClient, FALLBACK_PRODUCTS);
    expect(unchanged).toEqual(FALLBACK_PRODUCTS);
  });

  it('refreshes orders and analytics correctly', async () => {
    const mockApiSuccess: Partial<PosApiClient> = {
      getOrders: jest.fn().mockResolvedValue([FALLBACK_ORDERS[0]]),
      getAnalytics: jest.fn().mockResolvedValue(FALLBACK_ANALYTICS),
    };
    const res = await refreshOrdersAndAnalytics(
      mockApiSuccess as PosApiClient,
      FALLBACK_ORDERS,
      FALLBACK_ANALYTICS
    );
    expect(res.orders.length).toBe(1);
    expect(res.analytics.totalRevenue).toBe(FALLBACK_ANALYTICS.totalRevenue);

    const mockApiFail: Partial<PosApiClient> = {
      getOrders: jest.fn().mockRejectedValue(new Error('Fail')),
      getAnalytics: jest.fn().mockRejectedValue(new Error('Fail')),
    };
    const failRes = await refreshOrdersAndAnalytics(
      mockApiFail as PosApiClient,
      FALLBACK_ORDERS,
      FALLBACK_ANALYTICS
    );
    expect(failRes.orders).toEqual(FALLBACK_ORDERS);
  });

  it('refreshes shift status correctly', async () => {
    const mockApiSuccess: Partial<PosApiClient> = {
      getCurrentShift: jest.fn().mockResolvedValue(FALLBACK_SHIFT),
    };
    const shift = await refreshShiftStatus(mockApiSuccess as PosApiClient, null);
    expect(shift?.id).toBe(FALLBACK_SHIFT.id);

    const mockApiFail: Partial<PosApiClient> = {
      getCurrentShift: jest.fn().mockRejectedValue(new Error('Fail')),
    };
    const failShift = await refreshShiftStatus(mockApiFail as PosApiClient, FALLBACK_SHIFT);
    expect(failShift).toEqual(FALLBACK_SHIFT);
  });

  it('refreshes customers list correctly', async () => {
    const mockApiSuccess: Partial<PosApiClient> = {
      getCustomers: jest.fn().mockResolvedValue([FALLBACK_CUSTOMERS[0]]),
    };
    const custs = await refreshCustomersList(mockApiSuccess as PosApiClient, FALLBACK_CUSTOMERS);
    expect(custs.length).toBe(1);

    const mockApiFail: Partial<PosApiClient> = {
      getCustomers: jest.fn().mockRejectedValue(new Error('Fail')),
    };
    const failCusts = await refreshCustomersList(mockApiFail as PosApiClient, FALLBACK_CUSTOMERS);
    expect(failCusts).toEqual(FALLBACK_CUSTOMERS);
  });
});
