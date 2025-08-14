'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

// ---- Your screens map ----
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
  phoneHeight = 980,    // <<— make this bigger/smaller to taste
}: {
  initialRole?: RoleKey;
  phoneHeight?: number;
}) {
  const [role, setRole] = useState<RoleKey>(initialRole);
  const [index, setIndex] = useState(0);

  const roleCfg = useMemo(() => ROLES[role], [role]);
  const total = roleCfg.screens.length;
  const cur = roleCfg.screens[index];

  // nav helpers (also used by iframe postMessage bridge)
  const goTo = (id: string) => {
    const i = roleCfg.screens.findIndex((s) => s.id === id);
    if (i >= 0) setIndex(i);
  };
  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // fixed desired phone height, independent of viewport (page can scroll)
  // 19.5:9 ratio => width = height * (9 / 19.5)
  const BEZEL = 14 * 2; // padding inside outer phone container
  const phoneH = clamp(phoneHeight, 720, 1200);
  const phoneW = Math.round(phoneH * (9 / 19.5));
  const screenH = phoneH - BEZEL;

  // keyboard shortcuts (interactive only)
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
  }, [total]);

  // swipe
  const startX = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) setIndex((i) => (dx < 0 ? (i + 1) % total : (i - 1 + total) % total));
    startX.current = null;
  };

  // iframe -> parent bridge
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as unknown;
      if (typeof data === 'object' && data && (data as any).type === 'conexus-nav') {
        const to = (data as any).to as string | undefined;
        if (to) goTo(to);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleCfg]);

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
      <div className="relative mx-auto" style={{ width: phoneW, height: phoneH }}>
        <div
          className="relative rounded-[42px] border border-black/10 bg-black/5 shadow-xl overflow-hidden"
          style={{ padding: 14, width: '100%', height: '100%', background: '#0B0B0B' }}
        >
          {/* notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black/80 rounded-b-2xl" />

          {/* screen */}
          <div
            className="relative bg-black rounded-[30px] overflow-hidden"
            style={{ width: '100%', height: screenH }}
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

            {/* helper */}
            <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[11px] text-white/70">
              Swipe ⟷ or use ←/→ · 1/2/3 to switch roles
            </div>
          </div>
        </div>
      </div>

      {/* caption */}
      <div className="mt-3 text-center text-xs text-gray-600 dark:text-gray-300">
        {roleCfg.displayName} · {cur.label}
      </div>
    </div>
  );
}
