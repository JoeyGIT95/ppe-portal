import { useState } from 'react';
import { createRequest } from '../api';

const PPE_OPTIONS = [
  'Safety Helmet',
  'Safety Shoes',
  'Reflective Vest',
  'Safety Goggles',
  'Gloves (Cotton / Nitrile / Cut-resistant)',
  'Hearing Protection (Ear Plug / Ear Muff)',
  'Respirator Mask',
  'Coverall',
  'Harness / Lanyard',
  'Other',
];

export default function NewRequest({ onBack }) {
  const [form, setForm] = useState({
    requestorName: '',
    nric: '',
    department: '',
    designation: '',
    contact: '',
    email: '',
    reason: '',
    safetyName: '',
    safetyPassword: '',
    safetyDecision: 'Approved',
    safetyComments: '',
  });

  // 👇 NEW: multiple PPE items, each with name + qty
  const [items, setItems] = useState([{ name: '', qty: '' }]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new empty PPE row
  const addItemRow = () => {
    setItems((prev) => [...prev, { name: '', qty: '' }]);
  };

  // Remove one PPE row
  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Change item name / qty
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Clean items: trim names, convert qty to number, remove empty rows
    const cleanedItems = items
      .map((it) => ({
        name: (it.name || '').trim(),
        qty: it.qty ? Number(it.qty) : '',
      }))
      .filter((it) => it.name && it.qty); // only keep rows with both fields

    if (cleanedItems.length === 0) {
      alert('Please enter at least one PPE item and quantity.');
      setLoading(false);
      return;
    }

    // For backwards compatibility + DEBUG columns
    const flatNames = cleanedItems.map((it) => it.name).join(', ');
    const flatQtys = cleanedItems.map((it) => String(it.qty)).join(', ');

    const payload = {
      safetyPassword: form.safetyPassword,
      safetyName: form.safetyName,
      safetyDecision: form.safetyDecision,
      safetyComments: form.safetyComments,

      requestorName: form.requestorName,
      nric: form.nric,
      department: form.department,
      designation: form.designation,
      contact: form.contact,
      email: form.email,

      reason: form.reason,

      // 🔴 New multi-row structure
      items: cleanedItems,

      // 🟡 Extra fields so Apps Script can still read older names if needed
      ppeTypes: cleanedItems.map((it) => it.name),
      ppeTypesRequested: flatNames,
      quantity: flatQtys,
      requestedQuantity: flatQtys,
    };

    try {
      const res = await createRequest(payload);
      setResult(res);

      // Optional: reset form & items on success
      if (res.success) {
        setForm({
          requestorName: '',
          nric: '',
          department: '',
          designation: '',
          contact: '',
          email: '',
          reason: '',
          safetyName: '',
          safetyPassword: '',
          safetyDecision: 'Approved',
          safetyComments: '',
        });
        setItems([{ name: '', qty: '' }]);
      }
    } catch (err) {
      setResult({ success: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>New PPE Request (Safety + Requestor)</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
      >
        <h3>Section 1: Requestor Information</h3>

        <label>
          Name
          <input
            name="requestorName"
            value={form.requestorName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          NRIC / FIN No
          <input name="nric" value={form.nric} onChange={handleChange} required />
        </label>

        <label>
          Department
          <input name="department" value={form.department} onChange={handleChange} required />
        </label>

        <label>
          Designation
          <input name="designation" value={form.designation} onChange={handleChange} required />
        </label>

        <label>
          Contact No.
          <input name="contact" value={form.contact} onChange={handleChange} required />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <h3>Section 2: PPE Request Details</h3>

        <p style={{ fontSize: 14, marginBottom: 4 }}>
          Enter one PPE item per row. You can add multiple rows for the same request.
        </p>
        <p style={{ fontSize: 12, marginBottom: 8 }}>
          Common PPE:&nbsp;
          {PPE_OPTIONS.map((opt, i) => (
            <span key={opt}>
              {opt}
              {i < PPE_OPTIONS.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginBottom: 6,
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="PPE item (e.g. Safety Helmet)"
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              required
              style={{ flex: '2 1 200px' }}
            />
            <input
              type="number"
              min="1"
              placeholder="Qty"
              value={item.qty}
              onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
              required
              style={{ flex: '1 1 80px' }}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItemRow(index)}
                style={{ flex: '0 0 auto' }}
              >
                −
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItemRow} style={{ width: 'fit-content' }}>
          + Add another PPE item
        </button>

        <label>
          Reason for Request
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Replacement (Damaged / Lost) or Additional PPE for task"
            required
          />
        </label>

        <h3>Section 3: Safety Approval</h3>

        <label>
          Safety Name
          <input
            name="safetyName"
            value={form.safetyName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Safety Access Password
          <input
            type="password"
            name="safetyPassword"
            value={form.safetyPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Safety Review Decision
          <select
            name="safetyDecision"
            value={form.safetyDecision}
            onChange={handleChange}
          >
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>

        <label>
          Comments
          <textarea
            name="safetyComments"
            value={form.safetyComments}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 16 }}>
          {result.success ? (
            result.requestId ? (
              <p>
                ✅ Saved. Request ID: <strong>{result.requestId}</strong>
              </p>
            ) : (
              <p>Saved. Status: {result.status}</p>
            )
          ) : (
            <p>❌ Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
