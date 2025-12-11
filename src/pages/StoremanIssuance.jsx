import { useState } from 'react';
import { storemanIssue, getRequestItems } from '../api';

export default function StoremanIssuance({ onBack }) {
  const [form, setForm] = useState({
    requestId: '',
    storemanName: '',
    storemanPassword: '',
    issuedDate: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // rows for this Request ID

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    if (!items.length) {
      setResult({
        success: false,
        error: 'No items loaded. Please click "Load Items" first.',
      });
      setLoading(false);
      return;
    }

    const payload = {
      storemanPassword: form.storemanPassword,
      storemanName: form.storemanName,
      issuedDate: form.issuedDate
        ? new Date(form.issuedDate).toISOString()
        : new Date().toISOString(),
      items: items.map((it) => ({
        row: it.row,
        issuedQty: Number(it.issuedQty) || 0,
      })),
    };

    try {
      const res = await storemanIssue(payload);
      setResult(res);
    } catch (err) {
      setResult({ success: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Storeman Issuance</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
      >
        {/* Request ID + Load Items */}
        <label>
          Request ID
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              name="requestId"
              value={form.requestId}
              onChange={handleChange}
              placeholder="e.g. PPE-2025-0001"
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={async () => {
                setResult(null);
                setItems([]);
                if (!form.requestId) return;

                try {
                  const res = await getRequestItems(form.requestId.trim());
                  console.log('getRequestItems response:', res);  // 👈 add this
                  if (res.success) {
                    if (!res.items || res.items.length === 0) {
                      setResult({
                        success: false,
                        error: 'No items found for this Request ID.',
                      });
                    } else {
                      // Default issuedQty = requestedQty
                      setItems(
                        res.items.map((it) => ({
                          ...it,
                          issuedQty: it.requestedQty || 0,
                        }))
                      );
                    }
                  } else {
                    setResult({
                      success: false,
                      error: res.error || 'Failed to load items.',
                    });
                  }
                } catch (err) {
                  setResult({ success: false, error: String(err) });
                }
              }}
            >
              Load Items
            </button>
          </div>
        </label>

        <label>
          Storeman Name
          <input
            name="storemanName"
            value={form.storemanName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Storeman Access Password
          <input
            type="password"
            name="storemanPassword"
            value={form.storemanPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date of Issuance
          <input
            type="date"
            name="issuedDate"
            value={form.issuedDate}
            onChange={handleChange}
          />
        </label>

        {/* Items list with per-item issued qty */}
        {items.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Items to Issue</h3>
            {items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 8,
                }}
              >
                <div>
                  <strong>PPE:</strong> {it.ppe}
                </div>
                <div>
                  <strong>Requested Qty:</strong> {it.requestedQty}
                </div>
                <label style={{ marginTop: 4, display: 'block' }}>
                  Quantity to Issue
                  <input
                    type="number"
                    min="0"
                    value={it.issuedQty ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setItems((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, issuedQty: v } : p
                        )
                      );
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save Issuance'}
        </button>
      </form>

      {result && (
        <p style={{ marginTop: 16 }}>
          {result.success ? '✅ Issuance updated.' : `❌ Error: ${result.error}`}
        </p>
      )}
    </div>
  );
}
