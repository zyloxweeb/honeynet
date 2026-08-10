export const metadata = {
  title: 'Zylox HoneyNet Telemetry',
  description: 'Live Threat Monitoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#020617', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}