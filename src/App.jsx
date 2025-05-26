import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupByUser, setGroupByUser] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: itemData, error: itemError }, { data: userData, error: userError }] = await Promise.all([
        supabase.from('items').select('*').order('item_name', { ascending: true }),
        supabase.from('users').select('*')
      ]);

      if (itemData) setItems(itemData);
      if (userData) setUsers(userData);
      if (itemError || userError) console.error('Fetch error:', itemError || userError);

      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return '#4CAF50';
      case 'Checked Out': return '#FAB12F';
      case 'Damaged': return '#FA4032';
      default: return '#6b7280';
    }
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = users.map(user => ({
    ...user,
    items: filteredItems.filter(item => item.current_user === user.id)
  }));

  const overdueCount = items.filter(i => isOverdue(i.due_date)).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <aside style={{ width: '240px', background: '#333', color: '#fff', padding: '2rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Neofox</h2>
        <nav>
          <p style={{ marginBottom: '1rem', cursor: 'pointer' }}>📦 Dashboard</p>
          <p style={{ marginBottom: '1rem', cursor: 'pointer' }}>📝 Logs</p>
          <p style={{ marginBottom: '1rem', cursor: 'pointer' }}>⚙️ Settings</p>
        </nav>
      </aside>

      <main style={{ flex: 1, background: 'linear-gradient(to bottom, #FEF3E2, #ffffff)', padding: '2rem' }}>
        {overdueCount > 0 && (
          <div style={{ backgroundColor: '#FA4032', color: '#fff', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
            ⚠️ {overdueCount} item{overdueCount > 1 ? 's are' : ' is'} overdue! Return them ASAP.
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
          <StatCard title="Total Items" value={items.length} />
          <StatCard title="Available" value={items.filter(i => i.status === 'Available').length} />
          <StatCard title="Checked Out" value={items.filter(i => i.status === 'Checked Out').length} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            style={{ width: '100%', maxWidth: '400px', padding: '0.75rem 1rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
          />

          <button onClick={() => setGroupByUser(!groupByUser)} style={{ marginLeft: '1rem', padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#FA812F', color: '#fff', fontWeight: 'bold' }}>
            {groupByUser ? '🔄 Show All' : '👤 Group by User'}
          </button>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.25rem' }}>Gear Overview</h2>

        {loading ? (
          <p>Loading items...</p>
        ) : groupByUser ? (
          groupedItems.map(user => (
            <div key={user.id} style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>👤 {user.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {user.items.map(item => <ItemCard key={item.uid} item={item} getStatusColor={getStatusColor} isOverdue={isOverdue} />)}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filteredItems.map(item => <ItemCard key={item.uid} item={item} getStatusColor={getStatusColor} isOverdue={isOverdue} />)}
          </div>
        )}
      </main>
    </div>
  );
}

const StatCard = ({ title, value }) => (
  <div style={{ flex: 1, background: '#fff', padding: '1rem', borderRadius: '14px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
    <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{title}</p>
    <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</p>
  </div>
);

const ItemCard = ({ item, getStatusColor, isOverdue }) => (
  <div style={{ background: '#FA812F', borderRadius: '20px', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: '#fff', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' }}>
    {item.image_url && <img src={item.image_url} alt={item.item_name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px' }} />}
    <h3 style={{ fontSize: '1.15rem', fontWeight: '600', margin: 0 }}>{item.item_name}</h3>
    <span style={{ fontSize: '0.95rem', opacity: 0.9 }}>{item.category}</span>
    <span style={{ fontSize: '0.85rem', backgroundColor: getStatusColor(item.status), color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '6px', width: 'fit-content', fontWeight: 'bold' }}>{item.status}</span>
    {item.due_date && (
      <span style={{ fontSize: '0.85rem', color: isOverdue(item.due_date) ? '#fff' : '#fefefe', backgroundColor: isOverdue(item.due_date) ? '#FA4032' : '#00000033', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
        {isOverdue(item.due_date) ? '⚠️ Overdue: ' : 'Due: '} {new Date(item.due_date).toLocaleDateString()}
      </span>
    )}
  </div>
);
