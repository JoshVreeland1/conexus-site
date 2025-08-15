// src/app/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PhoneDemo from '@/components/PhoneDemo';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Landlord / PM');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;
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
    // keep status (success/error) visible
  }

  return (
    <main className="bg-gradient-to-br from-[#14213D] to-[#1F1F1F] text-white">
      {/* STICKY HEADER (conversion) */}
      <header className="sticky top-0 inset-x-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/20 bg-black/10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo1.png" width={28} height={28} alt="Conexus" />
            <span className="font-semibold tracking-tight">Conexus</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/80">
            <a href="#how-it-works" className="hover:text-white">How it works</a>
            <a href="#benefits" className="hover:text-white">Benefits</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
            <Link href="/prototype" className="hover:text-white">Demo</Link>
          </nav>
          <a
            href="#waitlist"
            className="rounded-lg bg-[#F0A202] text-[#1F1F1F] font-bold px-3.5 py-2 hover:brightness-95 active:brightness-90"
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Copy + CTA */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-6">
                <Image src="/logo1.png" alt="Conexus" width={350} height={350} priority />
              </div>

              <h1 className="text-[42px] sm:text-6xl font-semibold leading-[1.05] tracking-tight mb-4">
                Fast, reliable maintenance for multifamily—
                <span className="block text-[#F0A202]">without the hassle</span>
              </h1>

              <p className="text-base sm:text-lg text-white/85 max-w-xl mb-6">
                Submit a request, receive bids, track progress, and pay instantly.
                Landlords, tenants, and contractors get a clean, modern workflow.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-7">
                <a
                  href="#waitlist"
                  className="rounded-xl bg-[#F0A202] px-5 py-3 font-bold text-[#1F1F1F] hover:brightness-95 active:brightness-90"
                >
                  Join the Waitlist
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white/90 hover:bg-white/10"
                >
                  See how it works
                </a>
              </div>

              {/* Trust metrics */}
              <div className="grid grid-cols-3 gap-4 max-w-xl mb-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">300+</div>
                  <div className="text-xs text-white/70">Early access units</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">5</div>
                  <div className="text-xs text-white/70">Major TX metros</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">Built With</div>
                  <div className="text-xs text-white/70">Contractor feedback</div>
                </div>
              </div>

              {/* Social proof bullets */}
              <ul className="grid sm:grid-cols-2 gap-3 text-white/90 mb-7">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">→</span>
                  <span><strong>Instant dispatch</strong> to trusted contractors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">→</span>
                  <span><strong>Secure payments</strong> and transparent pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">→</span>
                  <span><strong>Portfolio analytics</strong> for owners & PMs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">→</span>
                  <span><strong>Mobile‑first experience</strong> everybody loves</span>
                </li>
              </ul>

              {/* Primary form */}
              <form onSubmit={submit} className="flex flex-wrap items-center gap-3" aria-label="Join waitlist form">
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-w-[220px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F0A202]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-[260px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F0A202]"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#F0A202]"
                  aria-label="Role"
                >
                  <option className="text-black">Landlord / Property Owner</option>
                  <option className="text-black">Contractor</option>
                  <option className="text-black">Investor</option>
                </select>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-xl bg-[#F0A202] px-5 py-3 font-bold text-[#1F1F1F] hover:brightness-95 active:brightness-90 transition disabled:opacity-60"
                >
                  {status === 'loading' ? 'Joining…' : 'Join the Waitlist'}
                </button>
              </form>

              {/* Feedback */}
              <div className="mt-3 min-h-[28px]">
                {status === 'error' && (
                  <div role="alert" className="inline-block rounded-md border border-[#FFB3B3] bg-[#FFE8E8] px-3 py-2 text-[#7F1D1D]">
                    {message || 'Something went wrong.'}
                  </div>
                )}
                {status === 'success' && (
                  <div role="status" className="inline-block rounded-md border border-[#B7E4C7] bg-[#E8F9EE] px-3 py-2 text-[#064E3B]">
                    🎉 You’re on the list! We’ll be in touch.
                  </div>
                )}
              </div>
            </div>

            {/* Right: Phone card + Open prototype */}
            <div className="order-1 lg:order-2">
              <div className="rounded-3xl bg-white/5 p-4 sm:p-6 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2" aria-hidden="true" />
                  <Link href="/prototype" className="text-sm text-[#F0A202] hover:text-white underline underline-offset-4">
                    Open full screen →
                  </Link>
                </div>
                <PhoneDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION */}
      <section className="bg-[#0E1528] text-white" id="benefits">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">Stop chasing repairs. Start closing them.</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
              <h3 className="font-semibold text-xl mb-2">Before Conexus</h3>
              <ul className="text-white/85 space-y-2">
                <li>• Long wait times and phone tag</li>
                <li>• Unreliable labor and resechduling</li>
                <li>• Manual tracking and messy records</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 p-6 bg-white/5">
              <h3 className="font-semibold text-xl mb-2">With Conexus</h3>
              <ul className="text-white/85 space-y-2">
                <li>• Instant job posting & marketplace</li>
                <li>• Real‑time updates & transparent pricing</li>
                <li>• One place for submissions, tracking, and payments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white text-[#1F1F1F]" id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">How Conexus Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 p-6 bg-white">
              <div className="text-2xl mb-2">① Create a request</div>
              <p className="text-black/70">Tenants or Landlords submit the issue in seconds, with photos and severity level.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6 bg-white">
              <div className="text-2xl mb-2">② Dispatch & updates</div>
              <p className="text-black/70">Vetted pros bid on the job, stakeholders are notified, and communication opens.</p>
            </div>
            <div className="rounded-2xl border border-black/10 p-6 bg-white">
              <div className="text-2xl mb-2">③ Close & pay instantly</div>
              <p className="text-black/70">Approve work, capture proof, and issue payment instantly—clean records ready for accounting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CONEXUS (Differentiators) */}
      <section className="bg-[#081022] text-white" id="why-conexus">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">
            Why Conexus — what sets us apart
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Instant dispatch',
                body:
                  'Jobs route to qualified, available pros in minutes — not days. No phone tag, no guesswork.',
              },
              {
                title: 'Vetted contractor network',
                body:
                  'License + insurance checks, track records, and performance scores. Use our pros or bring your own.',
              },
              {
                title: 'Transparent payments',
                body:
                  'Clear pricing, digital approvals, and instant payouts when work is verified. No hidden fees.',
              },
              {
                title: 'SLA automation',
                body:
                  'ETAs, follow‑ups, and escalations handled for you. Hit your SLAs without spreadsheets.',
              },
              {
                title: 'Portfolio analytics',
                body:
                  'See trends by property, unit, and category. Predict costs and cut time‑to‑resolution.',
              },
              {
                title: 'Modern tenant UX',
                body:
                  'Simple mobile flows with photo/video evidence and status updates tenants actually read.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 p-6 bg-white/5">
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-white/85">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (no extra JS; native details/summary) */}
      <section className="bg-[#0E1528] text-white" id="faq">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8">
            Frequently asked questions
          </h2>

          <div className="space-y-3">
            {/* Differentiation */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                How is Conexus different from Thumbtack/Angi or property‑management software?
              </summary>
              <div className="mt-2 text-white/85 space-y-2">
                <p>
                  Marketplaces optimize for leads; Conexus optimizes for <em>completion</em>. We handle dispatch,
                  SLA automation, approvals, and payments end‑to‑end — no manual coordination or
                  spreadsheet wrangling. Compared to traditional PM software, Conexus delivers
                  live contractor matching, tenant‑first mobile flows, and verified payouts.
                </p>
                <ul className="list-disc ml-5">
                  <li>Instant routing to qualified pros (not just a list of leads)</li>
                  <li>Transparent pricing + proof of work before payment</li>
                  <li>Analytics at the unit & portfolio level</li>
                </ul>
              </div>
            </details>

            {/* Platform fees */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                What are your fees?
              </summary>
              <p className="mt-2 text-white/85">
                The platform is free for landlords / property owners, tenants, and contractors. We earn via a small
                platform fee on each <strong>completed</strong> job — clearly shown at checkout. No subscriptions,
                no hidden charges.
              </p>
            </details>

            {/* Contractors: payouts */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                Contractors — when do I get paid and how?
              </summary>
              <p className="mt-2 text-white/85">
                Once work is approved (with photo/video proof), payouts are released instantly to your
                connected account. A downpayment will be provided with the rest awarded after job completion. Most banks settle within 1–2 business days.
              </p>
            </details>

            {/* Landlords: own vendors */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                Can I use my own contractors?
              </summary>
              <p className="mt-2 text-white/85">
                Yes. Invite your existing vendors to Conexus and manage them alongside our vetted network.
                They’ll receive jobs, updates, and payouts in the same streamlined flow.
              </p>
            </details>

            {/* Investors: funds & protection */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                How are funds handled and protected?
              </summary>
              <p className="mt-2 text-white/85">
                Payments are processed through a PCI‑compliant provider. Funds are only released when
                jobs are approved; disputes hold payment until resolved. Full audit trails are available.
              </p>
            </details>

            {/* Launch geography */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                Where are you launching first?
              </summary>
              <p className="mt-2 text-white/85">
                We’re onboarding pilot properties beginning in Texas. Upon scaling, we will expand to select U.S. metros.
              </p>
            </details>

            {/* Vetting process */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                How do you vet contractors?
              </summary>
              <p className="mt-2 text-white/85">
                License/insurance verification, background checks, and quality scores
                based on completed jobs and property feedback.
              </p>
            </details>

            {/* Quality / redos */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                What if a job isn’t done right?
              </summary>
              <p className="mt-2 text-white/85">
                The issue reopens, the contractor is notified, and payment remains on hold until resolved.
                All communication and media stay attached to the work order for accountability.
              </p>
            </details>

            {/* Speed of dispatch */}
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer font-semibold">
                How fast is dispatch?
              </summary>
              <p className="mt-2 text-white/85">
                Qualified pros receive instant notifications. We aim for a match within minutes depending on market
                density and job type.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* SECONDARY CTA */}
      <section id="waitlist" className="bg-white text-[#1F1F1F]">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Be first to try Conexus</h2>
          <p className="text-black/70 mb-6">We’re onboarding pilot customers now. Join the waitlist and we’ll reach out with details.</p>

          <form onSubmit={submit} className="flex flex-wrap items-center justify-center gap-3" aria-label="Join waitlist form (footer)">
            <input
              type="text"
              placeholder="Name"
              required
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
              aria-label="Role"
            >
              <option>Landlord / Property Owner</option>
              <option>Contractor</option>
              <option>Investor</option>
            </select>
            <button type="submit" disabled={status === 'loading'} className="rounded-xl bg-[#14213D] px-5 py-3 font-bold text-white hover:opacity-90 transition disabled:opacity-60">
              {status === 'loading' ? 'Joining…' : 'Join the Waitlist'}
            </button>
          </form>

          <p className="mt-3 text-sm text-black/60">No spam. We’ll only email about early access and product updates.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B0F1E] text-white/80">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo1.png" alt="Conexus" width={28} height={28} />
              <span>© {new Date().getFullYear()} Conexus. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="https://www.facebook.com/profile.php?id=61579097222484" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>
              <a href="tel:+12142385159" className="hover:text-white" aria-label="Call Conexus at (214) 238-5159">(214) 238-5159</a>
              <Link href="/prototype" className="hover:text-white">Demo</Link>
              <a href="mailto:josh@conexusfix.com,hunter@conexusfix.com" className="hover:text-white">Contact</a>
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/privacy" className="hover:text-white">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

