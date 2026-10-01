import React, { useState } from 'react';
import { Product, Category } from '../types/pos';
import { colors, cardStyle, primaryBtnStyle, secondaryBtnStyle, inputStyle, badgeStyle } from './styles';
import { posApi } from '../services/api';
import { adjustStockAction } from '../services/viewActions';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  onRefreshProducts?: () => void;
  initialAdjustingProduct?: Product | null;
  onRenderTree?: (tree: unknown) => void;
}

export function InventoryView({
  products,
  categories,
  onRefreshProducts,
  initialAdjustingProduct = null,
  onRenderTree,
}: InventoryViewProps) {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(initialAdjustingProduct);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Weekly supplier restock');
  const [loading, setLoading] = useState<boolean>(false);

  const filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    return matchesCat && matchesSearch;
  });

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

  const handleAdjustStock = async () => {
    setLoading(true);
    const res = await executeInventoryStockAdjust(posApi, adjustingProduct, stockDelta, adjustReason, onRefreshProducts);
    setLoading(false);
    if (res.success) {
      setAdjustingProduct(null);
    }
  };

  const content = (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Total Catalog Products</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.text, marginTop: '0.25rem' }}>
            {products.length} Items
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Total Inventory Stock</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.primary, marginTop: '0.25rem' }}>
            {products.reduce((s, p) => s + p.stockQuantity, 0)} Units
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Low Stock Warnings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: lowStockCount > 0 ? colors.warning : colors.success, marginTop: '0.25rem' }}>
            {lowStockCount} Items
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Categories Active</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.accent, marginTop: '0.25rem' }}>
            {categories.length} Departments
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ ...inputStyle, width: '220px', padding: '0.5rem 0.75rem' }}
          >
            <option value="all">All Departments ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '320px' }}>
          <input
            type="text"
            placeholder="Search by name, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, padding: '0.5rem 0.75rem' }}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ ...cardStyle, flex: 1, overflowY: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: 'rgba(15, 23, 42, 0.8)', color: colors.textMuted }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>SKU / Barcode</th>
              <th style={{ padding: '0.85rem 1rem' }}>Product Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>Category</th>
              <th style={{ padding: '0.85rem 1rem' }}>Retail Price</th>
              <th style={{ padding: '0.85rem 1rem' }}>Unit Cost</th>
              <th style={{ padding: '0.85rem 1rem' }}>Stock Quantity</th>
              <th style={{ padding: '0.85rem 1rem' }}>Inventory Status</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prod) => {
              const isLow = prod.stockQuantity <= prod.lowStockThreshold;
              const isOut = prod.stockQuantity === 0;
              const badgeType = isOut ? 'danger' : isLow ? 'warning' : 'success';
              const statusText = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal';

              return (
                <tr key={prod.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ fontWeight: 600, color: colors.text }}>{prod.sku}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>{prod.barcode}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: colors.text }}>
                    {prod.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: colors.textMuted }}>
                    {prod.categoryName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: colors.primary }}>
                    ${prod.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: colors.textMuted }}>
                    ${prod.cost.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: colors.text }}>
                    {prod.stockQuantity} units
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={badgeStyle(badgeType)}>{statusText}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setAdjustingProduct(prod);
                        setStockDelta(10);
                      }}
                      style={{ ...secondaryBtnStyle, padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
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
          <div style={{ ...cardStyle, width: '420px', maxWidth: '90%', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' }}>
              Adjust Inventory Stock
            </div>
            <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '1.25rem' }}>
              {adjustingProduct.name} ({adjustingProduct.sku})
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>
                Quantity Change (+ to add, - to deduct)
              </label>
              <input
                type="number"
                value={stockDelta}
                onChange={(e) => setStockDelta(parseInt(e.target.value) || 0)}
                style={inputStyle}
              />
              <div style={{ fontSize: '0.75rem', color: colors.textSubtle, marginTop: '0.35rem' }}>
                New estimated stock: {Math.max(0, adjustingProduct.stockQuantity + stockDelta)} units
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>
                Reason for Adjustment
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                style={inputStyle}
              >
                <option value="Weekly supplier restock">Weekly supplier restock</option>
                <option value="Customer return / undamaged">Customer return / undamaged</option>
                <option value="Damaged / Spoilage loss">Damaged / Spoilage loss</option>
                <option value="Audit recount adjustment">Audit recount adjustment</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setAdjustingProduct(null)}
                style={{ ...secondaryBtnStyle, flex: 1 }}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleAdjustStock}
                style={{ ...primaryBtnStyle, flex: 1 }}
              >
                {loading ? 'Saving...' : 'Confirm'}
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

export async function executeInventoryStockAdjust(
  api: typeof posApi,
  product: Product | null,
  delta: number,
  reason: string,
  onRefresh?: () => void
) {
  if (!product) return { success: false, error: 'No product selected' };
  const res = await adjustStockAction(api, product.id, delta, reason);
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

