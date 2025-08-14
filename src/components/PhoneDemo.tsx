// src/components/PhoneDemo.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type RoleKey = 'landlord' | 'tenant' | 'contractor';

type ScreenProps = {
  role: RoleKey;
  goTo: (id: string) => void;
  next: () => void;
  prev: () => void;
};

type Screen = {
  id: string;
  label: string;
  component?: (props: ScreenProps) => React.JSX.Element;
  src?: string;
  iframeSrc?: string; // /public path
};

type RoleConfig = {
  displayName: string;
  color: string;
  screens: Screen[];
};

type BridgeMessage = {
  type: 'conexus-nav';
  to?: string;
};

function isBridgeMessage(v: unknown): v is BridgeMessage {
  if (typeof v !== 'object' || v === null) return false;
  const rec = v as Record<string, unknown>;
  return rec.type === 'conexus-nav';
}

const ROLES: Record<RoleKey, RoleConfig> = {
  landlord: {
    displayName: 'Landlords',
    color: '#EDDC0B',
    screens: [
      { id: 'l-01', label: 'PM Dashboard', iframeSrc: '/interactive/landlord/pm-dashboard-mobile.html' },
      { id: 'l-02', label: 'Work Order',   iframeSrc: '/interactive/landlord/pm-job.html' },
      { id: 'l-03', label: 'Messages',     iframeSrc: '/interactive/landlord/pm-messages.html' },
      { id: 'l-04', label: 'Analytics',    iframeSrc: '/interactive/landlord/pm-analytics.html' },
    ],
  },
  tenant: {
    displayName: 'Tenants',
    color: '#4ADE80',
    screens: [
      { id: 't-01', label: 'Home',        iframeSrc: '/interactive/tenant/tenant-home.html' },
      { id: 't-02', label: 'New Request', iframeSrc: '/interactive/tenant/tenant-form.html' },
    ],
  },
  contractor: {
    displayName: 'Contractors',
    color: '#60A5FA',
    screens: [
      { id: 'c-01', label: 'Feed',      iframeSrc: '/interactive/contractor/contractor-feed.html' },
      { id: 'c-02', label: 'Profile',   iframeSrc: '/interactive/contractor/contractor-profile.html' },
      { id: 'c-03', label: 'Job',       iframeSrc: '/interactive/contractor/contractor-job.html' },
      { id: 'c-04', label: 'Earnings',  iframeSrc: '/interactive/contractor/contractor-earnings.html' },
      { id: 'c-05', label: 'Quote',     iframeSrc: '/interactive/contractor/contractor-quote.html' },
    ],
  },
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function PhoneDemo({
  initialRole = 'landlord',
}: {
  initialRole?: RoleKey;
}) {
  const [role, setRole] = useState<RoleKey>(initialRole);
  const [index, setIndex] = useState(0);

  const roleCfg = useMemo(() => ROLES[role], [role]);
  const total = roleCfg.screens.length;
  const cur = roleCfg.screens[index];

  const goTo = useCallback((id: string) => {
    const i = roleCfg.screens.findIndex((s) => s.id === id);
    if (i >= 0) setIndex(i);
  }, [roleCfg.screens]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
  }, [total]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === '1') { setRole('landlord'); setIndex(0); }
      if (e.key === '2') { setRole('tenant'); setIndex(0); }
      if (e.key === '3') { setRole('contractor'); setIndex(0); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // swipe
  const startX = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) setIndex((i) => (dx < 0 ? (i + 1) % total : (i - 1 + total) % total));
    startX.current = null;
  };

  // bridge from iframes
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as unknown;
      if (isBridgeMessage(data) && data.to) {
        goTo(data.to);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [goTo]);

  const goToDot = (i: number) => setIndex(clamp(i, 0, total - 1));

  return (
    <div className="w-full">
      {/* Role switcher */}
      <div className="flex items-center gap-2 mb-4">
        {(['landlord', 'tenant', 'contractor'] as RoleKey[]).map((r) => {
          const active = r === role;
          return (
            <button
              key={r}
              onClick={() => { setRole(r); setIndex(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition
                ${active ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-200/70 hover:bg-gray-300'}`}
              aria-pressed={active}
            >
              {ROLES[r].displayName}
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto w-[320px] sm:w-[360px]">
        <div
          className="relative rounded-[42px] border border-black/10 bg-black/5 shadow-xl overflow-hidden"
          style={{ padding: 14, background: '#0B0B0B' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black/80 rounded-b-2xl" />
          <div
            className="relative bg-black rounded-[30px] overflow-hidden"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            role="region"
            aria-label={`${roleCfg.displayName} screen: ${cur.label}`}
          >
            <div className="bg-white">
              {cur.iframeSrc ? (
                <iframe
                  title={cur.label}
                  src={cur.iframeSrc}
                  style={{ width: '100%', height: 560, border: 0 }}
                  allow="clipboard-write; autoplay"
                />
              ) : cur.src ? (
                <Image
                  priority
                  src={cur.src}
                  alt={cur.label}
                  width={1170}
                  height={2532}
                  className="w-full h-auto select-none pointer-events-none"
                />
              ) : cur.component ? (
                <cur.component role={role} goTo={goTo} next={next} prev={prev} />
              ) : null}
            </div>

            <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[11px] text-white/70">
              Swipe ⟷ or use ←/→ · 1/2/3 to switch roles
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between">
          <button onClick={prev} className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition text-sm">← Prev</button>
          <div className="flex items-center gap-2">
            {roleCfg.screens.map((s, i) => (
              <button key={s.id} onClick={() => goToDot(i)} aria-label={`Go to ${s.label}`}>
                <span
                  className="block h-2 w-2 rounded-full transition"
                  style={{ background: i === index ? roleCfg.color : 'rgba(0,0,0,0.25)', transform: i === index ? 'scale(1.25)' : 'scale(1)' }}
                />
              </button>
            ))}
          </div>
          <button onClick={next} className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition text-sm">Next →</button>
        </div>

        <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300">
          {roleCfg.displayName} · {cur.label}
        </div>
      </div>
    </div>
  );
}


