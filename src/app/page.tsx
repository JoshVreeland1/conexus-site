'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Landlord / PM');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const serverMsg =
          typeof data === 'object' && data && 'error' in (data as Record<string, unknown>)
            ? String((data as Record<string, unknown>).error)
            : 'Failed';
        throw new Error(serverMsg);
      }
      setStatus('success');
      setMessage("You're on the list! We'll be in touch.");
      setEmail('');
      setName('');
      setRole('Landlord / PM');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setStatus('error');
      setMessage(msg);
    }
  }

  return (
    <main>
      <section
        style={{
          background: 'linear-gradient(135deg, #14213D 0%, #1F1F1F 100%)',
          color: '#fff',
          padding: '80px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Image src="/logo.svg" alt="Conexus" width={40} height={40} />
              <span style={{ fontSize: 14, opacity: 0.9 }}>Conexus</span>
            </div>
            <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: '0 0 12px' }}>
              Faster multifamily maintenance—without the chaos
            </h1>
            <p style={{ fontSize: 18, opacity: 0.95, margin: '0 0 24px' }}>
              Post a repair, auto‑dispatch a vetted pro, track progress, and pay instantly. Owners,
              PMs, and trades get a reliable, modern workflow.
            </p>

            <form onSubmit={submit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E5E5', minWidth: 220 }}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E5E5', minWidth: 260 }}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E5E5' }}
              >
                <option>Landlord / PM</option>
                <option>Contractor</option>
                <option>Investor</option>
                <option>Tenant</option>
              </select>
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#EDDC0B',
                  color: '#1F1F1F',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {status === 'loading' ? 'Joining…' : 'Join the Waitlist'}
              </button>
            </form>

            {status === 'success' && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  background: '#E8F9EE',
                  border: '1px solid #B7E4C7',
                  borderRadius: 10,
                  color: '#064E3B',
                }}
              >
                🎉 You’re on the list! We’ll be in touch.
              </div>
            )}
            {status === 'error' && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  background: '#FFE8E8',
                  border: '1px solid #FFB3B3',
                  borderRadius: 10,
                  color: '#7F1D1D',
                }}
              >
                {message || 'Something went wrong.'}
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 320,
              background: '#FFFFFF',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Live Prototype</h3>
              <a href="/prototype" style={{ fontSize: 14 }}>
                Open full screen →
              </a>
            </div>
            <iframe
              title="Prototype"
              src="/prototype"
              style={{ width: '100%', height: 480, border: '1px solid #EEE', borderRadius: 12 }}
            />
          </div>
        </div>
      </section>

      <footer style={{ padding: '24px', textAlign: 'center', fontSize: 14, background: '#F7F7F7' }}>
        © {new Date().getFullYear()} Conexus. All rights reserved.
      </footer>
    </main>
  );
}

