// src/app/api/waitlist/route.ts
import { NextResponse } from 'next/server';
import { createClient, type PostgrestError } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type SignupPayload = {
  email: string;
  name?: string;
  role?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SignupPayload>;
    const email = (body.email ?? '').trim();
    const name = body.name?.trim() || null;
    const role = body.role?.trim() || null;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE || '').trim();
    if (!supabaseUrl || !serviceRole) {
      console.error('Missing envs', { hasUrl: !!supabaseUrl, hasService: !!serviceRole });
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const { error } = await supabase.from('waitlist').insert({ email, name, role });

    if (error) {
      const pgErr = error as PostgrestError;
      const isDuplicate =
        pgErr.code === '23505' || pgErr.message.toLowerCase().includes('duplicate');
      if (isDuplicate) {
        return NextResponse.json({ ok: true, note: 'Already joined' }, { status: 200 });
      }
      return NextResponse.json({ error: pgErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

