import React from 'react';
import { colors, badgeStyle } from './styles';

export type PosView = 'terminal' | 'orders' | 'inventory' | 'shifts' | 'customers' | 'analytics';

interface HeaderProps {
  currentView: PosView;
  onSelectView: (view: PosView) => void;
  cashierName?: string;
  isOnline?: boolean;
}

export function Header({
  currentView,
  onSelectView,
  cashierName = 'Emma Watson (Head Cashier)',
  isOnline = true,
}: HeaderProps) {
  const navItems: { id: PosView; label: string; icon: string }[] = [
    { id: 'terminal', label: 'Terminal', icon: '⚡' },
    { id: 'orders', label: 'Orders & Receipts', icon: '🧾' },
    { id: 'inventory', label: 'Inventory & Stock', icon: '📦' },
    { id: 'shifts', label: 'Cash Drawer', icon: '💰' },
    { id: 'customers', label: 'Loyalty CRM', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  return (
    <header
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div
          data-testid="brand-logo"
          onClick={() => onSelectView('terminal')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)',
            }}
          >
            N
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: colors.text }}>
                Nova<span style={{ color: colors.primary }}>POS</span>
              </span>
              <span style={badgeStyle('info')}>ENTERPRISE v2.6</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: colors.textSubtle }}>Flagship Cafe & Retail Terminal</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => onSelectView(item.id)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  color: isActive ? colors.primary : colors.textMuted,
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                  borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? colors.success : colors.warning,
              boxShadow: isOnline ? `0 0 8px ${colors.success}` : `0 0 8px ${colors.warning}`,
            }}
          />
          <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
            {isOnline ? 'REST API Connected' : 'Local Fallback'}
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: colors.border }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: `1px solid rgba(99, 102, 241, 0.4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              color: colors.accent,
            }}
          >
            EW
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{cashierName}</div>
            <div style={{ fontSize: '0.7rem', color: colors.textSubtle }}>Register #REG-01</div>
          </div>
        </div>
      </div>
    </header>
  );
}
