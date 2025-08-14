// src/app/demo/page.tsx
import PhoneDemo from '@/components/PhoneDemo';
import Link from 'next/link';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#14213D] to-[#1F1F1F] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">Conexus Demo</h1>
          <Link href="/" className="underline underline-offset-4">← Back</Link>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              See how owners, tenants, and contractors flow through repairs
            </h2>
            <p className="text-white/90 mb-6">
              Tap through each role’s screens in the live phone. Use the tabs to switch roles,
              swipe or use your arrow keys to step through.
            </p>

            {/* internal navigation must use Link (not <a>) */}
            <Link
              href="/#waitlist"
              className="inline-block rounded-xl bg-[#EDDC0B] text-black font-bold px-5 py-3"
            >
              Join the Waitlist
            </Link>
          </div>

          <div>
            <PhoneDemo phoneHeight={800} />
          </div>
        </div>
      </div>
    </main>
  );
}

