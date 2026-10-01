import React, { useState } from 'react';
import { Customer } from '../types/pos';
import { colors, cardStyle, primaryBtnStyle, secondaryBtnStyle, inputStyle, badgeStyle } from './styles';
import { posApi } from '../services/api';
import { createCustomerAction } from '../services/viewActions';

interface CustomersViewProps {
  customers: Customer[];
  onRefreshCustomers?: () => void;
  initialAdding?: boolean;
  onRenderTree?: (tree: unknown) => void;
}

export function CustomersView({
  customers,
  onRefreshCustomers,
  initialAdding = false,
  onRenderTree,
}: CustomersViewProps) {
  const [search, setSearch] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(initialAdding);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const filtered = customers.filter(
    (c) =>
      search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCreateCustomer = async () => {
    setLoading(true);
    const res = await executeCustomerCreate(posApi, name, email, phone, onRefreshCustomers);
    setLoading(false);
    if (res.success) {
      setName('');
      setEmail('');
      setPhone('');
      setIsAdding(false);
    }
  };

  const content = (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: colors.text }}>Loyalty CRM & Customers</div>
          <div style={{ fontSize: '0.85rem', color: colors.textSubtle }}>Track customer lifetime value, reward loyalty points, and manage members</div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '280px', padding: '0.5rem 0.75rem' }}
          />
          <button
            onClick={() => setIsAdding(true)}
            style={primaryBtnStyle}
          >
            + New Member
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, flex: 1, overflowY: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: 'rgba(15, 23, 42, 0.8)', color: colors.textMuted }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Customer Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contact Info</th>
              <th style={{ padding: '0.85rem 1rem' }}>Loyalty Tier</th>
              <th style={{ padding: '0.85rem 1rem' }}>Reward Points</th>
              <th style={{ padding: '0.85rem 1rem' }}>Lifetime Spent</th>
              <th style={{ padding: '0.85rem 1rem' }}>Member Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const badgeType = c.tier === 'Platinum' || c.tier === 'Gold' ? 'warning' : c.tier === 'Silver' ? 'info' : 'success';
              return (
                <tr key={c.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: colors.text }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ color: colors.text }}>{c.email}</div>
                    <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>{c.phone}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={badgeStyle(badgeType)}>★ {c.tier}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: colors.primary }}>
                    {c.loyaltyPoints} pts
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: colors.success }}>
                    ${c.totalSpent.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: colors.textSubtle }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ ...cardStyle, width: '400px', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>
              Add Loyalty Customer
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Liam Henderson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
              <input
                type="email"
                placeholder="liam.h@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>Phone Number</label>
              <input
                type="tel"
                placeholder="555-0103"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsAdding(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
              <button disabled={loading} onClick={handleCreateCustomer} style={{ ...primaryBtnStyle, flex: 1 }}>
                {loading ? 'Creating...' : 'Enroll Member'}
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

export async function executeCustomerCreate(
  api: typeof posApi,
  name: string,
  email: string,
  phone: string,
  onRefresh?: () => void
) {
  const res = await createCustomerAction(api, name, email, phone);
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

