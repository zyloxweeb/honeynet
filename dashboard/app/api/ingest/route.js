import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // 1. Verifica API Key dalle Environment Variables di Vercel
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.HONEYNET_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();

    if (!payload.source || !payload.event) {
      return NextResponse.json({ error: 'Missing required fields (source, event)' }, { status: 400 });
    }

    // 2. Formattazione dell'evento
    const logData = {
      source: payload.source,
      timestamp: payload.timestamp || new Date().toISOString(),
      event: payload.event,
      details: payload.details ?? null,
      src_ip: payload.src_ip || 'N/A'
    };

    // 3. Scrittura effettiva su Neon Postgres
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO threat_logs (source, event, src_ip, details, timestamp)
      VALUES (
        ${logData.source},
        ${logData.event},
        ${logData.src_ip},
        ${JSON.stringify(logData.details)}::jsonb,
        ${logData.timestamp}
      )
    `;

    console.log('Nuovo attacco registrato su Vercel:', logData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Errore ingest:', err);
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}