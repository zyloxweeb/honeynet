'use client';
import { useEffect, useState } from 'react';

export default function AttackTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/threats');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Errore recupero log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>
          Live Threat Telemetry
        </h2>
        <span style={{ fontSize: '0.875rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ height: '8px', width: '8px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
          Monitoring Active
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
              <th style={{ padding: '12px 8px' }}>Timestamp</th>
              <th style={{ padding: '12px 8px' }}>Sorgente</th>
              <th style={{ padding: '12px 8px' }}>Evento</th>
              <th style={{ padding: '12px 8px' }}>IP Origine</th>
              <th style={{ padding: '12px 8px' }}>Dettagli</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Caricamento eventi...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Nessun attacco registrato al momento.</td></tr>
            ) : (
              logs.map((log, idx) => {
                const source = log.source || 'UNKNOWN';
                return (
                  <tr key={log.id || idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600',
                        backgroundColor: source.includes('ELEGOO') ? '#ef4444' : '#3b82f6',
                        color: '#ffffff'
                      }}>
                        {source}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: '600', color: '#f8fafc' }}>{log.event || '—'}</td>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#cbd5e1' }}>{log.src_ip || 'LOCAL'}</td>
                    <td style={{ padding: '12px 8px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {typeof log.details === 'object' && log.details !== null ? JSON.stringify(log.details) : (log.details ?? '—')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}