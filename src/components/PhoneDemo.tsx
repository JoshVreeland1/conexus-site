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
  component?: (props: ScreenProps) => JSX.Element;
  src?: string;
  iframeSrc?: string; // served from /public
};

type RoleConfig = {
  displayName: string;
  color: string;
  screens: Screen[];
};

// Typed message for iframe -> parent navigation
type ConexusNavMsg = {
  type: 'conexus-nav';
  to?: string;
};

// ---- Roles / screens ----
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
  initialRole = 'tenant',
}: {
  initialRole?: RoleKey;
}) {
  const [role, setRole] = useState<RoleKey>(initialRole);
  const [index, setIndex] = useState(0);

  const roleCfg = useMemo(() => ROLES[role], [role]);
  const total = roleCfg.screens.length;
  const cur = roleCfg.screens[index];

  // navigation (memoized so effects don't warn)
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);
  const goTo = useCallback(
    (id: string) => {
      const i = roleCfg.screens.findIndex((s) => s.id === id);
      if (i >= 0) setIndex(i);
    },
    [roleCfg.screens]
  );

  // responsive sizing based on viewport height
  const [dims, setDims] = useState(() => {
    const h = 760;
    const screenH = h * 0.86;
    const phoneH = clamp(screenH, 640, 900);
    const phoneW = Math.round(phoneH * (9 / 19.5));
    return { phoneH, phoneW, screenH: phoneH - 28 };
  });

  useEffect(() => {
    const recalc = () => {
      const vh = window.innerHeight || 800;
      const phoneH = clamp(vh * 0.86, 640, 900);
      const phoneW = Math.round(phoneH * (9 / 19.5));
      const screenH = phoneH - 28;
      setDims({ phoneH, phoneW, screenH });
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

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

  // basic swipe
  const startX = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    startX.current = null;
  };

  // listen for postMessage from iframes (typed, no any)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as unknown;
      if (typeof data === 'object' && data !== null && 'type' in (data as Record<string, unknown>)) {
        const msg = data as Partial<ConexusNavMsg>;
        if (msg.type === 'conexus-nav' && typeof msg.to === 'string') {
          goTo(msg.to);
        }
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [goTo]);

  const goToDot = (i: number) => setIndex(clamp(i, 0, total - 1));

  return (
    <div className="w-full">
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

      <div className="relative mx-auto" style={{ width: dims.phoneW, height: dims.phoneH }}>
        <div
          className="relative rounded-[42px] border border-black/10 bg-black/5 shadow-xl overflow-hidden"
          style={{ padding: 14, width: '100%', height: '100%', background: '#0B0B0B' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black/80 rounded-b-2xl" />

          <div
            className="relative bg-black rounded-[30px] overflow-hidden"
            style={{ width: '100%', height: dims.screenH }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            role="region"
            aria-label={`${roleCfg.displayName} screen: ${cur.label}`}
          >
            <div className="bg-white w-full h-full">
              {cur.iframeSrc ? (
                <iframe
                  title={cur.label}
                  src={cur.iframeSrc}
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allow="clipboard-write; autoplay"
                />
              ) : cur.src ? (
                <Image
                  priority
                  src={cur.src}
                  alt={cur.label}
                  width={1170}
                  height={2532}
                  className="w-full h-full object-contain select-none pointer-events-none"
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
      </div>

      <div className="mt-3 text-center text-xs text-gray-600 dark:text-gray-300">
        {roleCfg.displayName} · {cur.label}
      </div>
    </div>
  );
}

