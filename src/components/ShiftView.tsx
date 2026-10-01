import React, { useState } from 'react';
import { RegisterShift } from '../types/pos';
import { colors, cardStyle, primaryBtnStyle, secondaryBtnStyle, inputStyle, badgeStyle } from './styles';
import { posApi } from '../services/api';
import { recordCashDropAction, closeShiftAction, openShiftAction } from '../services/viewActions';

interface ShiftViewProps {
  currentShift: RegisterShift | null;
  onRefreshShift?: () => void;
  initialModal?: 'drop' | 'close' | 'open' | null;
}

export function ShiftView({
  currentShift,
  onRefreshShift,
  initialModal = null,
}: ShiftViewProps) {
  const [isDroppingCash, setIsDroppingCash] = useState<boolean>(initialModal === 'drop');
  const [dropType, setDropType] = useState<'Drop' | 'Payout'>('Drop');
  const [dropAmount, setDropAmount] = useState<number>(50);
  const [dropReason, setDropReason] = useState<string>('Midday safe drop');

  const [isClosingShift, setIsClosingShift] = useState<boolean>(initialModal === 'close');
  const [countedCash, setCountedCash] = useState<number>(currentShift?.expectedCash || 200);
  const [closeNotes] = useState<string>('Shift balanced without discrepancies');

  const [isOpeningShift, setIsOpeningShift] = useState<boolean>(initialModal === 'open');
  const [startingFloat, setStartingFloat] = useState<number>(200);

  const [loading, setLoading] = useState<boolean>(false);

  const handleCashDrop = async () => {
    setLoading(true);
    const res = await executeShiftCashDrop(posApi, currentShift, dropAmount, dropReason, onRefreshShift);
    setLoading(false);
    if (res.success) {
      setIsDroppingCash(false);
    }
  };

  const handleCloseShift = async () => {
    setLoading(true);
    const res = await executeShiftClose(posApi, currentShift, countedCash, closeNotes, onRefreshShift);
    setLoading(false);
    if (res.success) {
      setIsClosingShift(false);
    }
  };

  const handleOpenShift = async () => {
    setLoading(true);
    const res = await executeShiftOpen(posApi, startingFloat, onRefreshShift);
    setLoading(false);
    if (res.success) {
      setIsOpeningShift(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: colors.text }}>Cash Drawer & Shift Control</div>
          <div style={{ fontSize: '0.85rem', color: colors.textSubtle }}>Manage register floats, cash drops, and end-of-shift reconciliation</div>
        </div>

        {currentShift?.status === 'Open' ? (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setIsDroppingCash(true)}
              style={secondaryBtnStyle}
            >
              💸 Cash Drop / Payout
            </button>
            <button
              onClick={() => {
                setCountedCash(currentShift.expectedCash);
                setIsClosingShift(true);
              }}
              style={{ ...primaryBtnStyle, backgroundColor: colors.warning }}
            >
              🔒 Close Shift
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpeningShift(true)}
            style={primaryBtnStyle}
          >
            🔓 Open Register Shift
          </button>
        )}
      </div>

      {currentShift ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Shift Status</div>
              <span style={badgeStyle(currentShift.status === 'Open' ? 'success' : 'danger')}>
                {currentShift.status}
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.text, marginTop: '0.5rem' }}>
              {currentShift.registerId}
            </div>
            <div style={{ fontSize: '0.8rem', color: colors.textSubtle, marginTop: '0.25rem' }}>
              Operator: {currentShift.cashierName}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.textSubtle }}>
              Opened: {new Date(currentShift.openedAt).toLocaleTimeString()} · {new Date(currentShift.openedAt).toLocaleDateString()}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Expected Cash In Drawer</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.primary, marginTop: '0.5rem' }}>
              ${currentShift.expectedCash.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: colors.textSubtle, marginTop: '0.25rem' }}>
              Starting Float: ${currentShift.startingFloat.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>Shift Sales Volume</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: colors.success, marginTop: '0.5rem' }}>
              ${currentShift.totalSales.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: colors.textSubtle, marginTop: '0.25rem' }}>
              Total Completed: {currentShift.totalTransactions} transactions
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: colors.textSubtle }}>
          No active shift on register REG-01. Click "Open Register Shift" to start trading.
        </div>
      )}

      {/* Cash Drop / Payout Modal */}
      {isDroppingCash && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ ...cardStyle, width: '400px', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.text, marginBottom: '1rem' }}>
              Record Cash Drop or Payout
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['Drop', 'Payout'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDropType(t)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: `1px solid ${dropType === t ? colors.primary : colors.border}`,
                    backgroundColor: dropType === t ? 'rgba(6, 182, 212, 0.2)' : colors.cardBg,
                    color: dropType === t ? colors.primary : colors.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {t === 'Drop' ? 'Safe Drop (-)' : 'Supplier Payout (-)'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={dropAmount}
                onChange={(e) => setDropAmount(parseFloat(e.target.value) || 0)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>Reason / Memo</label>
              <input
                type="text"
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsDroppingCash(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
              <button disabled={loading} onClick={handleCashDrop} style={{ ...primaryBtnStyle, flex: 1 }}>
                {loading ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {isClosingShift && currentShift && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ ...cardStyle, width: '420px', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' }}>
              Close Shift & Drawer Reconciliation
            </div>
            <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '1.25rem' }}>
              Shift #{currentShift.id} · Register {currentShift.registerId}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: colors.textMuted }}>Expected Drawer Total:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.primary }}>${currentShift.expectedCash.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>
                Actual Counted Cash In Drawer
              </label>
              <input
                type="number"
                step="0.01"
                value={countedCash}
                onChange={(e) => setCountedCash(parseFloat(e.target.value) || 0)}
                style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            {/* Variance indicator */}
            <div style={{ padding: '0.6rem 0.75rem', borderRadius: '6px', backgroundColor: countedCash === currentShift.expectedCash ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: countedCash === currentShift.expectedCash ? colors.success : colors.danger, fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
              Variance: ${(countedCash - currentShift.expectedCash).toFixed(2)} {countedCash === currentShift.expectedCash ? '(Balanced)' : countedCash > currentShift.expectedCash ? '(Overage)' : '(Shortage)'}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsClosingShift(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
              <button disabled={loading} onClick={handleCloseShift} style={{ ...primaryBtnStyle, backgroundColor: colors.warning, flex: 1 }}>
                {loading ? 'Closing...' : 'Close & Lock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Shift Modal */}
      {isOpeningShift && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ ...cardStyle, width: '380px', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.text, marginBottom: '0.25rem' }}>
              Open Register Shift
            </div>
            <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginBottom: '1rem' }}>
              Enter the starting cash float for Register REG-01
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', color: colors.textMuted, display: 'block', marginBottom: '0.35rem' }}>Starting Cash Float</label>
              <input
                type="number"
                step="0.01"
                value={startingFloat}
                onChange={(e) => setStartingFloat(parseFloat(e.target.value) || 0)}
                style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsOpeningShift(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
              <button disabled={loading} onClick={handleOpenShift} style={{ ...primaryBtnStyle, flex: 1 }}>
                {loading ? 'Opening...' : 'Start Shift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function executeShiftCashDrop(
  api: typeof posApi,
  shift: RegisterShift | null,
  amount: number,
  reason: string,
  onRefresh?: () => void
) {
  if (!shift) return { success: false, error: 'No active shift' };
  const res = await recordCashDropAction(api, shift.id, amount, reason);
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

export async function executeShiftClose(
  api: typeof posApi,
  shift: RegisterShift | null,
  countedCash: number,
  notes: string,
  onRefresh?: () => void
) {
  if (!shift) return { success: false, error: 'No active shift' };
  const res = await closeShiftAction(api, shift.id, countedCash, notes);
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

export async function executeShiftOpen(
  api: typeof posApi,
  startingFloat: number,
  onRefresh?: () => void
) {
  const res = await openShiftAction(api, startingFloat);
  if (res.success) {
    onRefresh?.();
  }
  return res;
}

