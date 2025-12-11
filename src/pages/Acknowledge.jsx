import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { acknowledgeReceipt } from '../api';

export default function Acknowledge({ onBack }) {
  const [form, setForm] = useState({
    requestId: '',
    signatureName: '',
    ackDate: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  const sigRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
      setHasSigned(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    let signatureDataUrl = '';
    if (sigRef.current && !sigRef.current.isEmpty()) {
      signatureDataUrl = sigRef.current.toDataURL(); // PNG base64
    }

    const payload = {
      ...form,
      ackDate: form.ackDate
        ? new Date(form.ackDate).toISOString()
        : new Date().toISOString(),
      signatureDataUrl,
    };

    try {
      console.log("SIGNATURE WE ARE SENDING:", signatureDataUrl);
      const res = await acknowledgeReceipt(payload);
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
      <h2>Requestor Acknowledgement</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}
      >
        <label>
          Request ID
          <input
            name="requestId"
            value={form.requestId}
            onChange={handleChange}
            placeholder="e.g. PPE-2025-0001"
            required
          />
        </label>

        <label>
          Full Name (for record)
          <input
            name="signatureName"
            value={form.signatureName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Receipt Date
          <input
            type="date"
          name="ackDate"
          value={form.ackDate}
          onChange={handleChange}
          />
        </label>

        <div>
          <p>Signature (sign inside the box):</p>
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            onEnd={() => setHasSigned(true)}
            canvasProps={{
              width: 500,
              height: 200,
              style: {
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%',
              },
            }}
          />
          <button type="button" onClick={clearSignature} style={{ marginTop: 8 }}>
            Clear Signature
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !hasSigned || !form.signatureName || !form.requestId}
        >
          {loading ? 'Submitting…' : 'Confirm Receipt'}
        </button>
      </form>

      {result && (
        <p style={{ marginTop: 16 }}>
          {result.success ? '✅ Acknowledged. Thank you.' : `❌ Error: ${result.error}`}
        </p>
      )}
    </div>
  );
}
