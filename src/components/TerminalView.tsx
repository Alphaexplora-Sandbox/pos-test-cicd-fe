import React, { useState } from 'react';
import { Product, Category, Customer, Order, ReceiptDto } from '../types/pos';
import { colors, cardStyle, primaryBtnStyle, secondaryBtnStyle, inputStyle, badgeStyle } from './styles';
import { posApi } from '../services/api';
import { applyDiscountAction, executeCheckoutAction } from '../services/viewActions';

import {
  CartItem,
  calculateCartTotals,
  addOrUpdateCartItem,
  removeCartItem,
  computeChangeDue,
  filterProductsList,
} from '../services/posLogic';

interface TerminalViewProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  onOrderCompleted?: (order: Order) => void;
  initialCheckingOut?: boolean;
  initialReceipt?: ReceiptDto | null;
  initialPaymentMethod?: 'Cash' | 'Card' | 'MobilePay';
  initialAmountTendered?: string;
  initialCart?: CartItem[];
  initialDiscountCode?: string;
  initialDiscountAmount?: number;
  initialDiscountMessage?: string;
  initialSearchQuery?: string;
  onRenderTree?: (tree: unknown) => void;
}

export function TerminalView({
  products,
  categories,
  customers,
  onOrderCompleted,
  initialCheckingOut = false,
  initialReceipt = null,
  initialPaymentMethod = 'Cash',
  initialAmountTendered = '',
  initialCart = [],
  initialDiscountCode = '',
  initialDiscountAmount = 0,
  initialDiscountMessage = '',
  initialSearchQuery = '',
  onRenderTree,
}: TerminalViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>(initialDiscountCode);
  const [discountAmount, setDiscountAmount] = useState<number>(initialDiscountAmount);
  const [discountMessage, setDiscountMessage] = useState<string>(initialDiscountMessage);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(initialCheckingOut);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'MobilePay'>(initialPaymentMethod);
  const [amountTendered, setAmountTendered] = useState<string>(initialAmountTendered);
  const [latestReceipt, setLatestReceipt] = useState<ReceiptDto | null>(initialReceipt);
  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);

  // Filtered products via logic helper
  const filteredProducts = filterProductsList(products, selectedCategory, searchQuery);

  const addToCart = (product: Product) => {
    setCart((prev) => executeTerminalAddToCart(prev, product));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => executeTerminalUpdateQuantity(prev, products, productId, delta));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => executeTerminalRemoveFromCart(prev, productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountCode('');
    setDiscountAmount(0);
    setDiscountMessage('');
    setSelectedCustomerId('');
    setLatestReceipt(null);
  };

  // Calculations via logic helper
  const { subtotal, taxTotal, grandTotal } = calculateCartTotals(cart, discountAmount, 0.08);
  const tenderedNum = parseFloat(amountTendered) || grandTotal;
  const changeGiven = paymentMethod === 'Cash' ? computeChangeDue(tenderedNum, grandTotal) : 0;

  const handleApplyDiscount = async () => {
    const res = await executeTerminalApplyDiscount(posApi, discountCode, subtotal);
    setDiscountAmount(res.amount);
    setDiscountMessage(res.message);
  };

  const handleCompletePayment = async () => {
    setOrderProcessing(true);
    const res = await executeTerminalCompletePayment(
      posApi,
      cart,
      selectedCustomerId || null,
      discountAmount > 0 ? discountCode : null,
      paymentMethod,
      tenderedNum,
      customers,
      onOrderCompleted
    );
    setOrderProcessing(false);
    if (res.success && res.data) {
      setLatestReceipt(res.data.receipt);
      setIsCheckingOut(false);
    }
  };

  const content = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.25rem', height: 'calc(100vh - 72px)', boxSizing: 'border-box', padding: '1rem 1.5rem' }}>
      {/* LEFT COLUMN: Catalog & Products */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'hidden' }}>
        {/* Search & Barcode Scan Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search product name, SKU, or scan barcode..."
              data-testid="terminal-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ ...secondaryBtnStyle, padding: '0.625rem 0.85rem' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '9999px',
              border: `1px solid ${selectedCategory === 'all' ? colors.primary : colors.border}`,
              backgroundColor: selectedCategory === 'all' ? 'rgba(6, 182, 212, 0.2)' : colors.cardBg,
              color: selectedCategory === 'all' ? colors.primary : colors.textMuted,
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => {
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '9999px',
                  border: `1px solid ${isSel ? colors.primary : colors.border}`,
                  backgroundColor: isSel ? 'rgba(6, 182, 212, 0.2)' : colors.cardBg,
                  color: isSel ? colors.primary : colors.textMuted,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div
          data-testid="terminal-product-grid"
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.85rem',
            alignContent: 'start',
            paddingRight: '0.25rem',
          }}
        >
          {filteredProducts.map((p) => {
            const isLowStock = p.stockQuantity <= p.lowStockThreshold;
            const inCart = cart.find((i) => i.product.id === p.id);

            return (
              <div
                key={p.id}
                data-testid={`product-card-${p.id}`}
                onClick={() => addToCart(p)}
                style={{
                  ...cardStyle,
                  padding: '1rem',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: inCart ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
                  transition: 'transform 0.1s ease, border-color 0.15s ease',
                }}
              >
                {inCart && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: colors.primary,
                      color: '#000',
                      borderRadius: '50%',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {inCart.quantity}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.7rem', color: colors.textSubtle, marginBottom: '0.2rem' }}>
                    {p.categoryName} · {p.sku}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.text, marginBottom: '0.5rem', lineHeight: '1.25' }}>
                    {p.name}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.primary }}>
                    ${p.price.toFixed(2)}
                  </div>
                  <span style={badgeStyle(isLowStock ? 'warning' : 'success')}>
                    {p.stockQuantity} left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Cart & Checkout */}
      <div
        style={{
          ...cardStyle,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          boxSizing: 'border-box',
          padding: '1.25rem',
        }}
      >
        {/* Receipt Screen (if just completed) */}
        {latestReceipt ? (
          <div data-testid="receipt-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div style={{ overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: `1px dashed ${colors.border}` }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: colors.success }}>✓ Payment Approved</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.text, marginTop: '0.25rem' }}>
                  {latestReceipt.storeName}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>{latestReceipt.storeAddress}</div>
                <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>Receipt: {latestReceipt.orderNumber}</div>
              </div>

              <div style={{ padding: '1rem 0', borderBottom: `1px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {latestReceipt.items.map((it) => (
                  <div key={it.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: colors.text }}>{it.quantity}x </span>
                      <span style={{ color: colors.textMuted }}>{it.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: colors.text }}>${it.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                  <span>Subtotal</span>
                  <span>${latestReceipt.subtotal.toFixed(2)}</span>
                </div>
                {latestReceipt.discountTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.success }}>
                    <span>Discount</span>
                    <span>-${latestReceipt.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                  <span>Tax (8%)</span>
                  <span>${latestReceipt.taxTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: colors.primary, marginTop: '0.25rem' }}>
                  <span>Grand Total</span>
                  <span>${latestReceipt.grandTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textSubtle, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <span>Method: {latestReceipt.paymentMethod}</span>
                  {latestReceipt.paymentMethod === 'Cash' && (
                    <span>Change: ${latestReceipt.changeGiven.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              data-testid="new-sale-btn"
              onClick={clearCart}
              style={{ ...primaryBtnStyle, width: '100%', padding: '0.85rem' }}
            >
              Start New Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Header: Customer Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: colors.text }}>Current Ticket</div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div style={{ marginBottom: '0.75rem' }}>
                <select
                  data-testid="customer-select"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{ ...inputStyle, padding: '0.5rem', cursor: 'pointer' }}
                >
                  <option value="">👤 Walk-in Customer (No Loyalty)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      ★ {c.name} ({c.tier} · {c.loyaltyPoints} pts)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line Items List */}
            <div
              data-testid="cart-items-container"
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                margin: '0.5rem 0',
                paddingRight: '0.25rem',
              }}
            >
              {cart.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.textSubtle, textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cart is empty</div>
                  <div style={{ fontSize: '0.75rem' }}>Tap products or scan barcode to add items</div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    data-testid={`cart-item-${item.product.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.75rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.primary }}>
                        ${item.product.price.toFixed(2)} each
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: `1px solid ${colors.border}`,
                          backgroundColor: colors.cardBg,
                          color: colors.text,
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: '18px', textAlign: 'center', color: colors.text }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: `1px solid ${colors.border}`,
                          backgroundColor: colors.cardBg,
                          color: colors.text,
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        style={{
                          marginLeft: '0.25rem',
                          background: 'none',
                          border: 'none',
                          color: colors.textSubtle,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Checkout Action */}
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '0.75rem' }}>
              {/* Promo Code Input */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Promo Code (e.g. WELCOME10)"
                  data-testid="promo-input"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                />
                <button
                  data-testid="apply-promo-btn"
                  onClick={handleApplyDiscount}
                  style={{ ...secondaryBtnStyle, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Apply
                </button>
              </div>
              {discountMessage && (
                <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: discountAmount > 0 ? colors.success : colors.danger }}>
                  {discountMessage}
                </div>
              )}

              {/* Totals Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.success }}>
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                  <span>Tax (8%)</span>
                  <span>${taxTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: colors.primary, marginTop: '0.25rem' }}>
                  <span>Total</span>
                  <span data-testid="cart-grand-total">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                data-testid="checkout-btn"
                disabled={cart.length === 0}
                onClick={() => setIsCheckingOut(true)}
                style={{
                  ...primaryBtnStyle,
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1rem',
                  opacity: cart.length === 0 ? 0.5 : 1,
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Charge ${grandTotal.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckingOut && (
        <div
          data-testid="checkout-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ ...cardStyle, width: '480px', maxWidth: '90%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.text }}>Collect Payment</div>
              <button
                onClick={() => setIsCheckingOut(false)}
                style={{ background: 'none', border: 'none', color: colors.textSubtle, fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>Total Amount Due</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: colors.primary }}>${grandTotal.toFixed(2)}</div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {(['Cash', 'Card', 'MobilePay'] as const).map((method) => {
                const isSel = paymentMethod === method;
                return (
                  <button
                    key={method}
                    data-testid={`pay-method-${method.toLowerCase()}`}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      border: `1px solid ${isSel ? colors.primary : colors.border}`,
                      backgroundColor: isSel ? 'rgba(6, 182, 212, 0.2)' : colors.cardBg,
                      color: isSel ? colors.primary : colors.textMuted,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {method === 'Cash' && '💵 '}
                    {method === 'Card' && '💳 '}
                    {method === 'MobilePay' && '📱 '}
                    {method}
                  </button>
                );
              })}
            </div>

            {/* Cash Tender Input & Presets */}
            {paymentMethod === 'Cash' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>
                  Cash Tendered
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={grandTotal.toFixed(2)}
                  data-testid="tendered-input"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 600 }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[10, 20, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmountTendered(amt.toString())}
                      style={{ ...secondaryBtnStyle, flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                    >
                      ${amt}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmountTendered(grandTotal.toString())}
                    style={{ ...secondaryBtnStyle, flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                  >
                    Exact
                  </button>
                </div>
                {changeGiven > 0 && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', color: colors.success, fontWeight: 700 }}>
                    <span>Change Due:</span>
                    <span>${changeGiven.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setIsCheckingOut(false)}
                style={{ ...secondaryBtnStyle, flex: 1 }}
              >
                Back
              </button>
              <button
                data-testid="confirm-payment-btn"
                disabled={orderProcessing}
                onClick={handleCompletePayment}
                style={{ ...primaryBtnStyle, flex: 2 }}
              >
                {orderProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  onRenderTree?.(content);
  return content;
}

export function executeTerminalAddToCart(cart: CartItem[], product: Product): CartItem[] {
  return addOrUpdateCartItem(cart, product, 1);
}

export function executeTerminalUpdateQuantity(
  cart: CartItem[],
  products: Product[],
  productId: string,
  delta: number
): CartItem[] {
  const prod = products.find((p) => p.id === productId);
  return prod ? addOrUpdateCartItem(cart, prod, delta) : cart;
}

export function executeTerminalRemoveFromCart(cart: CartItem[], productId: string): CartItem[] {
  return removeCartItem(cart, productId);
}

export async function executeTerminalApplyDiscount(api: typeof posApi, code: string, subtotal: number) {
  return applyDiscountAction(api, code, subtotal);
}

export async function executeTerminalCompletePayment(
  api: typeof posApi,
  cart: CartItem[],
  customerId: string | null,
  discountCode: string | null,
  paymentMethod: 'Cash' | 'Card' | 'MobilePay',
  amountTendered: number,
  customers: Customer[],
  onComplete?: (order: Order) => void
) {
  const res = await executeCheckoutAction(
    api,
    cart,
    customerId,
    discountCode,
    paymentMethod,
    amountTendered,
    customers
  );
  if (res.success && res.data) {
    onComplete?.(res.data.order);
  }
  return res;
}

