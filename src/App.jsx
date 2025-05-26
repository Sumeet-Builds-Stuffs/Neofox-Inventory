import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <header className="dashboard-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard title="Total Items" value={items.length} />
        <StatCard title="Available" value={items.filter(i => i.status === 'Available').length} />
        <StatCard title="Checked Out" value={items.filter(i => i.status === 'Checked Out').length} />
      </header>

      <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>

      <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.25rem' }}>Gear Overview</h2>

        {loading ? (
          <p>Loading items...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filteredItems.map(item => (
              <div key={item.uid} className="gear-card" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'transform 0.2s', cursor: 'pointer' }}>
                {item.image_url && (
                  <img src={item.image_url} alt={item.item_name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />
                )}
                <h3 style={{ fontSize: '1.15rem', fontWeight: '600', margin: 0 }}>{item.item_name}</h3>
                <span style={{ fontSize: '0.95rem', color: '#666' }}>{item.category}</span>
                <span style={{ fontSize: '0.85rem', backgroundColor: getStatusColor(item.status), color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', width: 'fit-content' }}>{item.status}</span>
                {item.due_date && (
                  <span style={{ fontSize: '0.85rem', color: isOverdue(item.due_date) ? '#dc2626' : '#6b7280' }}>
                    {isOverdue(item.due_date) ? '⚠️ Overdue: ' : 'Due: '} {new Date(item.due_date).toLocaleDateString()}
                  </span>
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
