import { useEffect, useState } from 'react';
import { Home, Package, Repeat, Users, Settings, PlusCircle, Box, DoorOpen, FileText } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (data) {
        setLogs(data);
        groupByUser(data);
      }
      setLoading(false);
    };

    fetchLogs();

    const channel = supabase
      .channel('realtime:logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logs',
        },
        (payload) => {
          if (payload.new) {
            setLogs((prev) => {
              const updated = [payload.new, ...prev];
              groupByUser(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const groupByUser = (logs) => {
    const latestByItem = new Map();
    logs.forEach(log => {
      if (!latestByItem.has(log.uid)) {
        latestByItem.set(log.uid, log);
      }
    });

    const grouped = {};
    for (let log of latestByItem.values()) {
      if (log.action === 'Check Out') {
        if (!grouped[log.user_name]) grouped[log.user_name] = [];
        grouped[log.user_name].push(log);
      }
    }
    setGroupedLogs(grouped);
  };

  const itemsInOffice = logs.filter(log => log.action === 'Check In').length;
  const itemsOutOfOffice = logs.filter(log => log.action === 'Check Out').length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString();
  };

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}>
      <header className="dashboard-header" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Items in Office" value={itemsInOffice} icon={<Box size={20} />} />
        <StatCard title="Items Checked Out" value={itemsOutOfOffice} icon={<DoorOpen size={20} />} />
        <StatCard title="Total Logs" value={logs.length} icon={<FileText size={20} />} />
      </header>

      <main className="main-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1.25rem' }}>Checked Out Items by User</h2>

        {Object.entries(groupedLogs).length === 0 && (
          <div style={{ fontSize: '1rem', color: '#888' }}>No items currently checked out.</div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(groupedLogs).map(([user, userLogs]) => (
            <div className="user-card" key={user} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'all 0.3s ease' }}>
              <div
                className="user-card-header"
                onClick={() => setExpandedUser(expandedUser === user ? null : user)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=random&color=fff`}
                    alt={user}
                    className="user-avatar"
                    style={{ width: '42px', height: '42px', borderRadius: '50%' }}
                  />
                  <div style={{ fontWeight: '600', fontSize: '1rem' }}>{user}</div>
                </div>
                <span className="item-count" style={{ fontSize: '0.9rem', color: '#555' }}>{userLogs.length} item(s)</span>
              </div>

              {expandedUser === user && (
                <ul className="user-log-list" style={{ marginTop: '1rem', paddingLeft: '1.5rem', listStyle: 'none' }}>
                  {userLogs.map((log) => (
                    <li key={log.id} className="user-log-item" style={{ padding: '0.4rem 0', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '1rem' }}>🎒 {log.item_name}</span>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>{log.uid} • {formatDate(log.timestamp)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const StatCard = ({ title, value, icon }) => (
  <div
    className="stat-card"
    style={{
      flex: '1',
      background: '#fff',
      padding: '1.25rem',
      borderRadius: '14px',
      textAlign: 'left',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
      {icon}
      {title}
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{value}</div>
  </div>
);
