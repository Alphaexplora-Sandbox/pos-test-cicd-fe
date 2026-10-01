import React from 'react';
import { PosAnalytics } from '../types/pos';
import { colors, cardStyle } from './styles';

interface AnalyticsViewProps {
  analytics: PosAnalytics;
}

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  const maxRevenue = Math.max(1, ...analytics.categorySales.map((c) => c.revenue));

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 72px)', boxSizing: 'border-box', overflowY: 'auto' }}>
      <div>
        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: colors.text }}>Executive Sales & Business Intelligence</div>
        <div style={{ fontSize: '0.85rem', color: colors.textSubtle }}>Real-time revenue metrics, inventory velocities, and sales breakdowns</div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Gross Revenue</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: colors.primary, marginTop: '0.35rem' }}>
            ${analytics.totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.success, marginTop: '0.25rem' }}>↑ +14.2% vs last week</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Total Completed Orders</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: colors.text, marginTop: '0.35rem' }}>
            {analytics.totalOrders}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem' }}>Avg ticket: ${analytics.averageOrderValue.toFixed(2)}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Average Order Value</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: colors.accent, marginTop: '0.35rem' }}>
            ${analytics.averageOrderValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem' }}>Target: $12.00</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Catalog Items</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: colors.text, marginTop: '0.35rem' }}>
            {analytics.totalProducts}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem' }}>Across 6 departments</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '0.8rem', color: colors.textSubtle }}>Active Registers</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: colors.success, marginTop: '0.35rem' }}>
            {analytics.activeShifts} Open
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.25rem' }}>Register REG-01</div>
        </div>
      </div>

      {/* Two-Column Analytics Charts & Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flex: 1 }}>
        {/* Top Selling Products */}
        <div style={cardStyle}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>
            🔥 Top Selling Products by Revenue
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.topProducts.map((p, idx) => (
              <div
                key={p.productId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(6, 182, 212, 0.15)',
                      color: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.text }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>{p.categoryName} · {p.unitsSold} units sold</div>
                  </div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: colors.primary }}>
                  ${p.revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div style={cardStyle}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>
            Department Sales Contribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analytics.categorySales.map((cat) => {
              const pct = (cat.revenue / maxRevenue) * 100;
              return (
                <div key={cat.categoryId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: colors.text }}>{cat.categoryName}</span>
                    <span style={{ fontWeight: 700, color: colors.primary }}>${cat.revenue.toFixed(2)} ({cat.itemsSold} sold)</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: colors.border, borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(5, pct)}%`,
                        background: 'linear-gradient(90deg, #06b6d4 0%, #6366f1 100%)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
