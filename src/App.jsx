import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('item_name', { ascending: true });

      if (data) {
        setItems(data);
      } else {
        console.error('Error fetching items:', error);
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return '#22c55e';
      case 'Checked Out': return '#f97316';
      case 'Damaged': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <header className="dashboard-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Total Items" value={items.length} />
        <StatCard title="Available" value={items.filter(i => i.status === 'Available').length} />
        <StatCard title="Checked Out" value={items.filter(i => i.status === 'Checked Out').length} />
      </header>

      <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.25rem' }}>Gear Overview</h2>

        {loading ? (
          <p>Loading items...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {items.map(item => (
              <div key={item.uid} className="gear-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.item_name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{item.item_name}</h3>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>{item.category}</span>
                <span style={{ fontSize: '0.85rem', backgroundColor: getStatusColor(item.status), color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '6px', width: 'fit-content' }}>{item.status}</span>
                {item.due_date && (
                  <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const StatCard = ({ title, value }) => (
  <div
    className="stat-card"
    style={{
      flex: '1',
      background: '#fff',
      padding: '1rem',
      borderRadius: '14px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}
  >
    <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{title}</p>
    <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</p>
  </div>
);
