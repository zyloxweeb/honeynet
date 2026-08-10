import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    const logs = await sql`
      SELECT * FROM threat_logs
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Errore threats:', error);
    return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
  }
}