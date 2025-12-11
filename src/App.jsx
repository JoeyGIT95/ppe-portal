import { useState } from 'react';
import Home from './pages/Home';
import NewRequest from './pages/NewRequest';
import StoremanIssuance from './pages/StoremanIssuance';
import Acknowledge from './pages/Acknowledge';

export default function App() {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    if (page === 'new') return <NewRequest onBack={() => setPage('home')} />;
    if (page === 'storeman') return <StoremanIssuance onBack={() => setPage('home')} />;
    if (page === 'ack') return <Acknowledge onBack={() => setPage('home')} />;
    return <Home onNavigate={setPage} />;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16, fontFamily: 'Arial, sans-serif' }}>
      {renderPage()}
    </div>
  );
}
