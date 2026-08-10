import { NextResponse } from 'next/server';

export async function POST(request) {
  // 1. Verifica API Key dalle Environment Variables di Vercel
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey || apiKey !== process.env.HONEYNET_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // 2. Formattazione dell'evento
    const logData = {
      source: payload.source,
      timestamp: payload.timestamp || new Date().toISOString(),
      event: payload.event,
      details: payload.details,
      src_ip: payload.src_ip || 'N/A'
    };

    // 3. Qui inserirai la chiamata al tuo DB cloud (es. Neon o Supabase)
    // await db.insert(logData);

    console.log('Nuovo attacco registrato su Vercel:', logData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}