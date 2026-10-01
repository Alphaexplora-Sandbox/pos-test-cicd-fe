/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToString } from 'react-dom/server';
import { Header } from '../../src/components/Header';
import {
  TerminalView,
  executeTerminalAddToCart,
  executeTerminalUpdateQuantity,
  executeTerminalRemoveFromCart,
  executeTerminalApplyDiscount,
  executeTerminalCompletePayment,
} from '../../src/components/TerminalView';
import {
  OrdersView,
  findAndFormatReceipt,
  executeOrderRefund,
  executeOrderVoid,
} from '../../src/components/OrdersView';
import {
  InventoryView,
  executeInventoryStockAdjust,
} from '../../src/components/InventoryView';
import {
  ShiftView,
  executeShiftCashDrop,
  executeShiftClose,
  executeShiftOpen,
} from '../../src/components/ShiftView';
import {
  CustomersView,
  executeCustomerCreate,
} from '../../src/components/CustomersView';
import { AnalyticsView } from '../../src/components/AnalyticsView';
import {
  posApi,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  FALLBACK_CUSTOMERS,
  FALLBACK_ORDERS,
  FALLBACK_SHIFT,
  FALLBACK_ANALYTICS,
} from '../../src/services/api';
import { formatReceiptData } from '../../src/services/posLogic';

describe('Component Rendering & Modal States', () => {
  it('renders Header with navigation tabs in online and offline modes', () => {
    const html = renderToString(
      <Header currentView="terminal" onSelectView={() => {}} isOnline={true} />
    );
    expect(html).toContain('Nova');
    expect(html).toContain('Terminal');
    expect(html).toContain('REST API Connected');

    const offlineHtml = renderToString(
      <Header currentView="orders" onSelectView={() => {}} isOnline={false} />
    );
    expect(offlineHtml).toContain('Local Fallback');
  });

  it('triggers Header brand logo and navigation clicks', () => {
    const onSelectView = jest.fn();
    const tree = Header({ currentView: 'terminal', onSelectView, isOnline: true });
    const leftDiv = (tree as any).props.children[0];
    const brandLogo = leftDiv.props.children[0];
    brandLogo.props.onClick();
    expect(onSelectView).toHaveBeenCalledWith('terminal');

    const nav = leftDiv.props.children[1];
    const buttons = nav.props.children;
    for (const btn of buttons) {
      btn.props.onClick();
    }
    expect(onSelectView).toHaveBeenCalledTimes(7);
  });

  it('renders TerminalView with empty cart, filled cart, checkout modal, and receipt modal', () => {
    // Empty cart
    const emptyHtml = renderToString(
      <TerminalView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        customers={FALLBACK_CUSTOMERS}
      />
    );
    expect(emptyHtml).toContain('Cart is empty');

    // Filled cart with items
    const filledCartHtml = renderToString(
      <TerminalView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        customers={FALLBACK_CUSTOMERS}
        initialCart={[{ product: FALLBACK_PRODUCTS[0], quantity: 2 }]}
        initialDiscountCode="WELCOME10"
        initialDiscountAmount={1.5}
        initialDiscountMessage="10% discount applied"
      />
    );
    expect(filledCartHtml).toContain('Single Origin Double Espresso');
    expect(filledCartHtml).toContain('Charge $');

    // Checkout modal open
    const checkoutHtml = renderToString(
      <TerminalView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        customers={FALLBACK_CUSTOMERS}
        initialCart={[{ product: FALLBACK_PRODUCTS[0], quantity: 1 }]}
        initialCheckingOut={true}
        initialPaymentMethod="Cash"
        initialAmountTendered="20"
      />
    );
    expect(checkoutHtml).toContain('Collect Payment');
    expect(checkoutHtml).toContain('Cash Tendered');
    expect(checkoutHtml).toContain('Confirm Payment');

    // Card checkout mode
    const cardCheckoutHtml = renderToString(
      <TerminalView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        customers={FALLBACK_CUSTOMERS}
        initialCart={[{ product: FALLBACK_PRODUCTS[0], quantity: 1 }]}
        initialCheckingOut={true}
        initialPaymentMethod="Card"
      />
    );
    expect(cardCheckoutHtml).toContain('Collect Payment');

    // Receipt display
    const sampleReceipt = formatReceiptData(FALLBACK_ORDERS[0]);
    const receiptHtml = renderToString(
      <TerminalView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        customers={FALLBACK_CUSTOMERS}
        initialReceipt={sampleReceipt}
      />
    );
    expect(receiptHtml).toContain('Payment Approved');
    expect(receiptHtml).toContain('Start New Transaction');
  });

  it('renders OrdersView with orders list, empty state, and receipt modal', () => {
    const listHtml = renderToString(<OrdersView orders={FALLBACK_ORDERS} />);
    expect(listHtml).toContain('POS-2026-0001');
    expect(listHtml).toContain('Completed');

    const emptyHtml = renderToString(<OrdersView orders={[]} />);
    expect(emptyHtml).toContain('No orders found matching criteria');

    const sampleReceipt = formatReceiptData(FALLBACK_ORDERS[0]);
    const modalHtml = renderToString(
      <OrdersView orders={FALLBACK_ORDERS} initialSelectedReceipt={sampleReceipt} />
    );
    expect(modalHtml).toContain('Close Receipt');
    expect(modalHtml).toContain(sampleReceipt.orderNumber);
  });

  it('renders InventoryView table and adjust stock modal', () => {
    const tableHtml = renderToString(
      <InventoryView products={FALLBACK_PRODUCTS} categories={FALLBACK_CATEGORIES} />
    );
    expect(tableHtml).toContain('Total Inventory Stock');
    expect(tableHtml).toContain('Single Origin Double Espresso');

    const modalHtml = renderToString(
      <InventoryView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        initialAdjustingProduct={FALLBACK_PRODUCTS[0]}
      />
    );
    expect(modalHtml).toContain('Adjust Inventory Stock');
    expect(modalHtml).toContain('Reason for Adjustment');
    expect(modalHtml).toContain('Weekly supplier restock');
  });

  it('renders ShiftView in open, drop modal, close modal, and open modal states', () => {
    // Normal open shift
    const defaultHtml = renderToString(<ShiftView currentShift={FALLBACK_SHIFT} />);
    expect(defaultHtml).toContain('REG-01');
    expect(defaultHtml).toContain('Expected Cash In Drawer');

    // Cash drop modal
    const dropHtml = renderToString(
      <ShiftView currentShift={FALLBACK_SHIFT} initialModal="drop" />
    );
    expect(dropHtml).toContain('Record Cash Drop or Payout');
    expect(dropHtml).toContain('Safe Drop');

    // Close shift modal
    const closeHtml = renderToString(
      <ShiftView currentShift={FALLBACK_SHIFT} initialModal="close" />
    );
    expect(closeHtml).toContain('Close Shift &amp; Drawer Reconciliation');
    expect(closeHtml).toContain('Actual Counted Cash In Drawer');

    // Open shift modal
    const openHtml = renderToString(
      <ShiftView currentShift={null} initialModal="open" />
    );
    expect(openHtml).toContain('Open Register Shift');
    expect(openHtml).toContain('Starting Cash Float');

    // Null shift view
    const nullShiftHtml = renderToString(<ShiftView currentShift={null} />);
    expect(nullShiftHtml).toContain('No active shift on register REG-01');
  });

  it('renders CustomersView list and add member modal', () => {
    const listHtml = renderToString(<CustomersView customers={FALLBACK_CUSTOMERS} />);
    expect(listHtml).toContain('Alexander Wright');
    expect(listHtml).toContain('Gold');

    const modalHtml = renderToString(
      <CustomersView customers={FALLBACK_CUSTOMERS} initialAdding={true} />
    );
    expect(modalHtml).toContain('Add Loyalty Customer');
    expect(modalHtml).toContain('Enroll Member');
  });

  it('renders AnalyticsView with revenue metrics and category bars', () => {
    const html = renderToString(<AnalyticsView analytics={FALLBACK_ANALYTICS} />);
    expect(html).toContain('14.75');
    expect(html).toContain('Top Selling Products by Revenue');
    expect(html).toContain('Department Sales Contribution');
  });

  it('handles view callbacks without throwing', () => {
    const onSelectView = jest.fn();
    renderToString(<Header currentView="inventory" onSelectView={onSelectView} isOnline={true} />);

    const onOrderCompleted = jest.fn();
    renderToString(
      <TerminalView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        customers={FALLBACK_CUSTOMERS}
        onOrderCompleted={onOrderCompleted}
      />
    );

    const onRefreshOrders = jest.fn();
    renderToString(<OrdersView orders={FALLBACK_ORDERS} onRefreshOrders={onRefreshOrders} />);

    const onRefreshProducts = jest.fn();
    renderToString(
      <InventoryView
        products={FALLBACK_PRODUCTS}
        categories={FALLBACK_CATEGORIES}
        onRefreshProducts={onRefreshProducts}
      />
    );

    const onRefreshShift = jest.fn();
    renderToString(
      <ShiftView currentShift={FALLBACK_SHIFT} onRefreshShift={onRefreshShift} />
    );

    const onRefreshCustomers = jest.fn();
    renderToString(
      <CustomersView customers={FALLBACK_CUSTOMERS} onRefreshCustomers={onRefreshCustomers} />
    );
  });

  it('executes component view helper functions correctly', async () => {
    // Terminal helpers
    const cart = executeTerminalAddToCart([], FALLBACK_PRODUCTS[0]);
    expect(cart.length).toBe(1);
    const cartInc = executeTerminalUpdateQuantity(cart, FALLBACK_PRODUCTS, FALLBACK_PRODUCTS[0].id, 1);
    expect(cartInc[0].quantity).toBe(2);
    const cartEmpty = executeTerminalRemoveFromCart(cartInc, FALLBACK_PRODUCTS[0].id);
    expect(cartEmpty.length).toBe(0);

    const discRes = await executeTerminalApplyDiscount(posApi, 'WELCOME10', 50);
    expect(discRes.amount).toBe(5);

    const onComplete = jest.fn();
    const payRes = await executeTerminalCompletePayment(
      posApi,
      cart,
      null,
      null,
      'Cash',
      20,
      FALLBACK_CUSTOMERS,
      onComplete
    );
    expect(payRes.success).toBe(true);

    // Orders helpers
    const receipt = findAndFormatReceipt(FALLBACK_ORDERS, FALLBACK_ORDERS[0].id);
    expect(receipt?.orderNumber).toBe(FALLBACK_ORDERS[0].orderNumber);
    const nullReceipt = findAndFormatReceipt(FALLBACK_ORDERS, 'nonexistent');
    expect(nullReceipt).toBeNull();

    const onRefresh = jest.fn();
    await executeOrderRefund(posApi, FALLBACK_ORDERS[0].id, onRefresh);
    expect(onRefresh).toHaveBeenCalled();

    const onVoidRefresh = jest.fn();
    await executeOrderVoid(posApi, FALLBACK_ORDERS[0].id, onVoidRefresh);
    expect(onVoidRefresh).toHaveBeenCalled();

    // Inventory helpers
    const onInvRefresh = jest.fn();
    await executeInventoryStockAdjust(posApi, FALLBACK_PRODUCTS[0], 5, 'Restock', onInvRefresh);
    expect(onInvRefresh).toHaveBeenCalled();
    const nullProdRes = await executeInventoryStockAdjust(posApi, null, 5, 'Restock');
    expect(nullProdRes.success).toBe(false);

    // Shift helpers
    const onShiftRefresh = jest.fn();
    await executeShiftCashDrop(posApi, FALLBACK_SHIFT, 50, 'Safe', onShiftRefresh);
    expect(onShiftRefresh).toHaveBeenCalled();
    const nullShiftDrop = await executeShiftCashDrop(posApi, null, 50, 'Safe');
    expect(nullShiftDrop.success).toBe(false);

    await executeShiftClose(posApi, FALLBACK_SHIFT, 300, 'Reconciled', onShiftRefresh);
    const nullShiftClose = await executeShiftClose(posApi, null, 300, 'Reconciled');
    expect(nullShiftClose.success).toBe(false);

    await executeShiftOpen(posApi, 150, onShiftRefresh);

    // Customer helpers
    const onCustRefresh = jest.fn();
    await executeCustomerCreate(posApi, 'Test', 'test@example.com', '1234', onCustRefresh);
    expect(onCustRefresh).toHaveBeenCalled();
  });
});
