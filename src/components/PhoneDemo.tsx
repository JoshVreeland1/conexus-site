// src/components/PhoneDemo.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

export type RoleKey = 'landlord' | 'tenant' | 'contractor';

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

type BridgeMessage = { type: 'conexus-nav'; to?: string };
function isBridgeMessage(v: unknown): v is BridgeMessage {
  return typeof v === 'object' && v !== null && (v as Record<string, unknown>).type === 'conexus-nav';
}

const ROLES: Record<RoleKey, RoleConfig> = {
  landlord: {
    displayName: 'Landlords',
    color: '#F0A202',
    screens: [
      { id: 'l-01', label: 'PM Dashboard', iframeSrc: '/interactive/landlord/pm-dashboard-mobile.html' },
      { id: 'l-02', label: 'Work Order',   iframeSrc: '/interactive/landlord/pm-job.html' },
      { id: 'l-03', label: 'Messages',     iframeSrc: '/interactive/landlord/pm-messages.html' },
      { id: 'l-04', label: 'Analytics',    iframeSrc: '/interactive/landlord/pm-analytics.html' },
    ],
  },
  tenant: {
    displayName: 'Tenants',
    color: '#F0A202',
    screens: [
      { id: 't-01', label: 'Home',        iframeSrc: '/interactive/tenant/tenant-home.html' },
      { id: 't-02', label: 'New Request', iframeSrc: '/interactive/tenant/tenant-new.html' },
    ],
  },
  contractor: {
    displayName: 'Contractors',
    color: '#F0A202',
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

const buildIframeSrc = (base?: string, role?: RoleKey, screenId?: string) => {
  if (!base) return undefined;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}role=${encodeURIComponent(role ?? '')}&screen=${encodeURIComponent(
    screenId ?? ''
  )}&t=${Date.now()}`;
};

export default function PhoneDemo({
  initialRole = 'landlord',
  phoneWidth = 360,
}: {
  initialRole?: RoleKey;
  phoneWidth?: number;
}) {
  const [role, setRole] = useState<RoleKey>(initialRole);
  const roleCfg = useMemo(() => ROLES[role], [role]);

  const [index, setIndex] = useState(0);
  const total = roleCfg.screens.length;
  const cur = roleCfg.screens[index];

  const goTo = useCallback(
    (id: string) => {
      const i = roleCfg.screens.findIndex((s) => s.id === id);
      if (i >= 0) setIndex(i);
    },
    [roleCfg.screens]
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

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

  const startX = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) setIndex((i) => (dx < 0 ? (i + 1) % total : (i - 1 + total) % total));
    startX.current = null;
  };

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as unknown;
      if (isBridgeMessage(data) && data.to) goTo(data.to);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [goTo]);

  const goToDot = (i: number) => setIndex(clamp(i, 0, total - 1));

  // phone sizing (iPhone-ish 19.5:9)
  const deviceW = phoneWidth;
  const deviceH = Math.round(deviceW * (19.5 / 9));
  const bezel = 14;
  const screenH = deviceH - bezel * 2;

  // persistent gold ring for active role
  const ringShadowActive = '0 0 0 2px #F0A202';

  return (
    <div className="w-full">
      {/* Role switcher centered to the phone width */}
      <div className="mx-auto mb-4 flex items-center justify-center gap-2" style={{ width: deviceW }}>
        {(['landlord', 'tenant', 'contractor'] as RoleKey[]).map((r) => {
          const active = r === role;
          return (
            <button
              key={r}
              onClick={() => { setRole(r); setIndex(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold transition
                ${active ? 'bg-[#14213D] text-white' : 'bg-gray-200/70 hover:bg-gray-300'}`}
              aria-pressed={active}
              aria-label={ROLES[r].displayName}
              style={{
                boxShadow: active ? ringShadowActive : 'none', // <-- persistent gold ring
                outline: 'none',
              }}
            >
              {ROLES[r].displayName}
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto" style={{ width: deviceW }}>
        <div
          className="relative rounded-[42px] border border-black/10 bg-black/5 shadow-xl overflow-hidden"
          style={{ padding: bezel, background: '#0B0B0B', height: deviceH }}
        >
          {/* notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-6 w-28 bg-black/80 rounded-b-2xl" />
          {/* screen */}
          <div
            className="relative bg-black rounded-[30px] overflow-hidden"
            style={{ height: screenH }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            role="region"
            aria-label={`${roleCfg.displayName} screen: ${cur.label}`}
          >
            <div className="bg-white" style={{ width: '100%', height: '100%' }}>
              {cur.iframeSrc ? (
                <iframe
                  key={`${role}-${cur.id}`}
                  title={cur.label}
                  src={buildIframeSrc(cur.iframeSrc, role, cur.id)}
                  style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
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
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center justify-between" style={{ width: deviceW, marginInline: 'auto' }}>
          <button
            onClick={prev}
            className="px-3 py-1.5 rounded-md bg-[#14213D] text-white hover:bg-[#2f4982] transition text-sm"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-2">
            {roleCfg.screens.map((s, i) => (
              <button key={s.id} onClick={() => goToDot(i)} aria-label={`Go to ${s.label}`}>
                <span
                  className="block h-2 w-2 rounded-full transition"
                  style={{
                    background: i === index ? roleCfg.color : 'rgba(0,0,0,0.25)',
                    transform: i === index ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={next}
            className="px-3 py-1.5 rounded-md bg-[#14213D] text-white hover:bg-[#2f4982] transition text-sm"
          >
            Next →
          </button>
        </div>

        <div className="mt-2 text-center text-xs text-gray-600">
          {roleCfg.displayName} · {cur.label}
        </div>
      </div>
    </div>
  );
}
