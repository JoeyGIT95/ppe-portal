export default function Home({ onNavigate }) {
  return (
    <div>
      <h1>PPE Request Portal</h1>
      <p>Select what you want to do:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <button onClick={() => onNavigate('new')}>🟢 New PPE Request (Safety + Requestor)</button>
        <button onClick={() => onNavigate('storeman')}>🟡 Storeman Issuance</button>
        <button onClick={() => onNavigate('ack')}>🔵 Requestor Acknowledgement</button>
      </div>
    </div>
  );
}