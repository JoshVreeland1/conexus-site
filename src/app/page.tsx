'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PhoneDemo from '@/components/PhoneDemo'; // make sure this path matches your file

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
      setEmail(''); setName(''); setRole('Landlord / PM');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setStatus('error'); setMessage(msg);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <main className="bg-gradient-to-br from-[#14213D] to-[#1F1F1F] text-white">
      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: brand + value + primary CTA */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <Image src="/logo2.png" alt="Conexus" width={400} height={400} />
              </div>

              <h1 className="text-[42px] sm:text-6xl font-semibold leading-[1.05] tracking-tight mb-4">
                Faster multifamily maintenance—
                <span className="block text-[#EDDC0B]">without the chaos</span>
              </h1>

              <p className="text-base sm:text-lg text-white/85 max-w-xl mb-6">
                Post a repair, auto‑dispatch a vetted pro, track progress, and pay instantly.
                Owners, PMs, and trades get a reliable, modern workflow.
              </p>

              {/* Credibility bullets (user + investor POV) */}
              <ul className="grid sm:grid-cols-2 gap-3 text-white/90 mb-7">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">⚡</span>
                  <span><strong>Instant dispatch</strong> to trusted contractors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">🔒</span>
                  <span><strong>Secure payments</strong> and transparent pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">📊</span>
                  <span><strong>Portfolio analytics</strong> for owners & PMs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">📱</span>
                  <span><strong>Mobile‑first experience</strong> tenants love</span>
                </li>
              </ul>

              {/* Primary form */}
              <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-w-[220px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#EDDC0B]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-[260px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#EDDC0B]"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#EDDC0B]"
                >
                  <option className="text-black">Landlord / PM</option>
                  <option className="text-black">Contractor</option>
                  <option className="text-black">Investor</option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-[#EDDC0B] px-5 py-3 font-bold text-[#1F1F1F] hover:brightness-95 active:brightness-90 transition"
                >
                  Join the Waitlist
                </button>
              </form>

              {/* Form feedback */}
              <div className="mt-3 min-h-[28px]">
                {status === 'error' && (
                  <div className="inline-block rounded-md border border-[#FFB3B3] bg-[#FFE8E8] px-3 py-2 text-[#7F1D1D]">
                    {message || 'Something went wrong.'}
                  </div>
                )}
                {status === 'success' && (
                  <div className="inline-block rounded-md border border-[#B7E4C7] bg-[#E8F9EE] px-3 py-2 text-[#064E3B]">
                    🎉 You’re on the list! We’ll be in touch.
                  </div>
                )}
              </div>

              {/* Social proof strip */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Stripe payouts</span>
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Supabase security</span>
                <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">Contractor vetting</span>
              </div>
            </div>

            {/* Right: Interactive phone in a neat frame */}
            <div className="order-1 lg:order-2">
              <div className="rounded-3xl bg-white/5 p-4 sm:p-6 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                  </div>
                  <Link href="/prototype" className="text-sm text-white/80 hover:text-white underline underline-offset-4">
                    Open full screen →
                  </Link>
                </div>

                {/* PhoneDemo sized to fully show the device. Adjust height if you want bigger/smaller. */}
                <PhoneDemo phoneHeight={800} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (mentor POV: clarity of flow) */}
      <section className="bg-white text-[#1F1F1F]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">How Conexus Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 p-6 bg-white">
              <div className="text-2xl mb-2">1️⃣ Create a request</div>
              <p className="text-black/70">
                Tenants or PMs submit the issue in seconds, with photos and priority level.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6 bg-white">
              <div className="text-2xl mb-2">2️⃣ Auto‑dispatch & updates</div>
              <p className="text-black/70">
                We match the job to a vetted pro, notify stakeholders, and keep everyone in the loop.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6 bg-white">
              <div className="text-2xl mb-2">3️⃣ Close & pay instantly</div>
              <p className="text-black/70">
                Approve work, capture proof, and issue payment instantly—clean records ready for accounting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR (user POV: clear segments) */}
      <section className="bg-[#0E1528] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">Made for every side of maintenance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
              <h3 className="font-semibold text-xl mb-2">Owners & PMs</h3>
              <ul className="space-y-2 text-white/85">
                <li>• Centralized work orders</li>
                <li>• ETA & SLA visibility</li>
                <li>• Unit‑level analytics</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
              <h3 className="font-semibold text-xl mb-2">Tenants</h3>
              <ul className="space-y-2 text-white/85">
                <li>• Modern, simple requests</li>
                <li>• Real‑time updates</li>
                <li>• Photo/video proofs</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
              <h3 className="font-semibold text-xl mb-2">Contractors</h3>
              <ul className="space-y-2 text-white/85">
                <li>• Steady, vetted jobs</li>
                <li>• Clear scope & checklists</li>
                <li>• Fast payouts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECONDARY CTA (investor POV: traction signal via waitlist) */}
      <section className="bg-white text-[#1F1F1F]">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            Be first to try Conexus
          </h2>
          <p className="text-black/70 mb-6">
            We’re onboarding pilot customers now. Join the waitlist and we’ll reach out with details.
          </p>

          <form onSubmit={submit} className="flex flex-wrap items-center justify-center gap-3">
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-[220px] rounded-xl border border-black/10 bg-white px-4 py-3"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-[260px] rounded-xl border border-black/10 bg-white px-4 py-3"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3"
            >
              <option>Landlord / PM</option>
              <option>Contractor</option>
              <option>Investor</option>
              <option>Tenant</option>
            </select>
            <button
              type="submit"
              className="rounded-xl bg-[#14213D] px-5 py-3 font-bold text-white hover:opacity-90 transition"
            >
              Join the Waitlist
            </button>
          </form>

          <p className="mt-3 text-sm text-black/60">
            No spam. We’ll only email about early access and product updates.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B0F1E] text-white/80">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo2.png" alt="Conexus" width={28} height={28} />
              <span>© {new Date().getFullYear()} Conexus. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/prototype" className="hover:text-white">Prototype</Link>
              <a href="mailto:hello@conexusfix.com" className="hover:text-white">Contact</a>
              <span className="rounded-full bg-white/10 px-3 py-1 border border-white/10">Built on Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

