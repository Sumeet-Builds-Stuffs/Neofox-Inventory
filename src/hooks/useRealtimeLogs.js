import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useRealtimeLogs(setLogs) {
  useEffect(() => {
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
          console.log('🔄 Realtime update:', payload)
          if (payload.new) {
            setLogs((prev) => [payload.new, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
