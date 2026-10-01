import React from 'react';

export const colors = {
  bg: '#0a0e17',
  cardBg: '#111827',
  cardHover: '#162032',
  panelBg: '#0f172a',
  border: '#1e293b',
  borderHover: '#334155',
  primary: '#06b6d4',
  primaryHover: '#0891b2',
  accent: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textSubtle: '#64748b',
};

export const cardStyle: React.CSSProperties = {
  backgroundColor: colors.cardBg,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: '1.25rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
};

export const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: colors.primary,
  color: '#081018',
  fontWeight: 600,
  fontSize: '0.875rem',
  padding: '0.625rem 1.25rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease-in-out',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
};

export const secondaryBtnStyle: React.CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  color: colors.text,
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: '0.625rem 1.25rem',
  borderRadius: '8px',
  border: `1px solid ${colors.border}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease-in-out',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#0a0e17',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  padding: '0.625rem 0.875rem',
  color: colors.text,
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

export const badgeStyle = (type: 'success' | 'warning' | 'danger' | 'info'): React.CSSProperties => {
  const map = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    info: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  };
  const conf = map[type];
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: conf.bg,
    color: conf.text,
    border: `1px solid ${conf.border}`,
  };
};
