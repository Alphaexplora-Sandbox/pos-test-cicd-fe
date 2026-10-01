import React, { useState } from 'react';
import { Order, ReceiptDto } from '../types/pos';
import { colors, cardStyle, primaryBtnStyle, secondaryBtnStyle, inputStyle, badgeStyle } from './styles';
import { posApi } from '../services/api';
import { filterOrdersList, formatReceiptData } from '../services/posLogic';
import { refundOrderAction, voidOrderAction } from '../services/viewActions';

interface OrdersViewProps {
  orders: Order[];
  onRefreshOrders?: () => void;
  initialSelectedReceipt?: ReceiptDto | null;
  onRenderTree?: (tree: unknown) => void;
}

export function OrdersView({
  orders,
  onRefreshOrders,
  initialSelectedReceipt = null,
  onRenderTree,
}: OrdersViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDto | null>(initialSelectedReceipt);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const filteredOrders = filterOrdersList(orders, filterStatus, search);

  const handleViewReceipt = (orderId: string) => {
    const receipt = findAndFormatReceipt(orders, orderId);
    if (receipt) setSelectedReceipt(receipt);
  };

  const handleRefund = async (orderId: string) => {
    setActionLoading(true);
    await executeOrderRefund(posApi, orderId, onRefreshOrders);
    setActionLoading(false);
  };

  const handleVoid = async (orderId: string) => {
    setActionLoading(true);
    await executeOrderVoid(posApi, orderId, onRefreshOrders);
    setActionLoading(false);
  };

  const content = (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'completed', 'refunded', 'voided'] as const).map((st) => {
            const isSel = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  border: `1px solid ${isSel ? colors.primary : colors.border}`,
                  backgroundColor: isSel ? 'rgba(6, 182, 212, 0.2)' : colors.cardBg,
                  color: isSel ? colors.primary : colors.textMuted,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        <div style={{ width: '300px' }}>
          <input
            type="text"
            placeholder="Search order number, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, padding: '0.5rem 0.75rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ ...cardStyle, flex: 1, overflowY: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: 'rgba(15, 23, 42, 0.8)', color: colors.textMuted }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Order #</th>
              <th style={{ padding: '0.85rem 1rem' }}>Date & Time</th>
              <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
              <th style={{ padding: '0.85rem 1rem' }}>Items</th>
              <th style={{ padding: '0.85rem 1rem' }}>Payment</th>
              <th style={{ padding: '0.85rem 1rem' }}>Total</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: colors.textSubtle }}>
                  No orders found matching criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const badgeType = ord.status === 'Completed' ? 'success' : ord.status === 'Refunded' ? 'warning' : 'danger';
                return (
                  <tr key={ord.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: colors.text }}>
                      {ord.orderNumber}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: colors.textMuted }}>
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: colors.text }}>
                      {ord.customerName || 'Walk-in'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: colors.textMuted }}>
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} items
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: colors.textMuted }}>
                      {ord.paymentMethod}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: colors.primary }}>
                      ${ord.grandTotal.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={badgeStyle(badgeType)}>{ord.status}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleViewReceipt(ord.id)}
                          style={{ ...secondaryBtnStyle, padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          Receipt
                        </button>
                        {ord.status === 'Completed' && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRefund(ord.id)}
                              style={{ ...secondaryBtnStyle, padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: colors.warning }}
                            >
                              Refund
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVoid(ord.id)}
                              style={{ ...secondaryBtnStyle, padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: colors.danger }}
                            >
                              Void
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
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
          <div style={{ ...cardStyle, width: '420px', maxWidth: '90%', padding: '1.75rem' }}>
            <div style={{ textAlign: 'center', borderBottom: `1px dashed ${colors.border}`, paddingBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: colors.text }}>{selectedReceipt.storeName}</div>
              <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>{selectedReceipt.storeAddress}</div>
              <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>Order: {selectedReceipt.orderNumber}</div>
            </div>

            <div style={{ padding: '1rem 0', borderBottom: `1px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              {selectedReceipt.items.map((i) => (
                <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>{i.quantity}x {i.name}</span>
                  <span style={{ fontWeight: 600 }}>${i.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                <span>Subtotal</span>
                <span>${selectedReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}>
                <span>Tax</span>
                <span>${selectedReceipt.taxTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: colors.primary, marginTop: '0.25rem' }}>
                <span>Total</span>
                <span>${selectedReceipt.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              style={{ ...primaryBtnStyle, width: '100%', marginTop: '1rem' }}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
  onRenderTree?.(content);
  return content;
}

export function findAndFormatReceipt(orders: Order[], orderId: string) {
  const order = orders.find((o) => o.id === orderId);
  return order ? formatReceiptData(order) : null;
}

export async function executeOrderRefund(api: typeof posApi, orderId: string, onRefresh?: () => void) {
  const res = await refundOrderAction(api, orderId, 'Cashier requested refund');
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

export async function executeOrderVoid(api: typeof posApi, orderId: string, onRefresh?: () => void) {
  const res = await voidOrderAction(api, orderId, 'Cashier voided sale');
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

