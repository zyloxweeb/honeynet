import ThreatMap from './components/ThreatMap';
import AttackTable from './components/AttackTable';

export default function Home() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <h1 style={{ color: '#f8fafc', margin: '0 0 8px 0', fontSize: '2rem' }}>
          Honeynet Deception Network
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Telemetria di sicurezza e monitoraggio trappole in tempo reale per zylox.space
        </p>
      </header>
      
      <ThreatMap />
      <AttackTable />
    </main>
  );
}