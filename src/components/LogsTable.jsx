// src/components/LogsTable.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function LogsTable() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error);
      } else {
        setLogs(data);
      }
    }

    fetchLogs();
  }, []);

  return (
    <div className="overflow-x-auto p-4">
      <h1 className="text-2xl font-bold mb-4">RFID Inventory Logs</h1>
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">UID</th>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-left">Action</th>
            <th className="px-4 py-2 text-left">User</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-4 py-2 border-t border-gray-200">{log.uid}</td>
              <td className="px-4 py-2 border-t border-gray-200">{log.item_name}</td>
              <td className="px-4 py-2 border-t border-gray-200">{log.action}</td>
              <td className="px-4 py-2 border-t border-gray-200">{log.user_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogsTable;
