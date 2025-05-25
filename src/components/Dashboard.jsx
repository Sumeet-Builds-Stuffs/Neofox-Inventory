import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRealtimeLogs } from '../hooks/useRealtimeLogs'

export default function Dashboard() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('timestamp', { ascending: false })

      if (data) setLogs(data)
    }

    fetchLogs()
  }, [])

  useRealtimeLogs(setLogs)

  return (
    <div className="dashboard">
      <h2>📦 Gear Log (Live)</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.item_name}</strong> checked {log.status} by {log.user_name} at {new Date(log.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}