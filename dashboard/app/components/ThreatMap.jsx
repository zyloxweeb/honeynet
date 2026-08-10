'use client';

export default function ThreatMap() {
  return (
    <div style={{
      backgroundColor: '#0f172a',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #1e293b',
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '220px',
      position: 'relative'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '2px solid #38bdf8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#38bdf8',
          borderRadius: '50%',
          boxShadow: '0 0 10px #38bdf8'
        }} />
      </div>

      <h3 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '1rem' }}>
        Zylox Deception Node: Active
      </h3>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
        Ascolto attivo su Docker Containers e Hardware IoT (Elegoo R3)
      </p>
    </div>
  );
}