// src/app/api/waitlist/route.ts
// src/app/api/waitlist/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const runtime = 'nodejs';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Read and trim env vars at request time (resilient to whitespace)
    const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE || '').trim();

    if (!supabaseUrl || !serviceRole) {
      console.error('Missing envs', {
        hasUrl: !!supabaseUrl, hasService: !!serviceRole,
      });
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from('waitlist').insert({ email, name, role });

    if (error) {
      const isDuplicate =
        (error as any)?.code === '23505' ||
        error.message.toLowerCase().includes('duplicate');
      if (isDuplicate) {
        return NextResponse.json({ ok: true, note: 'Already joined' }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected error' },
      { status: 500 }
    );
  }
}
