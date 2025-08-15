// src/components/PhoneDemo.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

export type RoleKey = 'landlord' | 'tenant' | 'contractor';

type ScreenProps = { role: RoleKey; goTo: (id: string) => void; next: () => void; prev: () => void; };
type Screen = { id: string; label: string; component?: (p: ScreenProps) => React.JSX.Element; src?: string; iframeSrc?: string; };
type RoleConfig = { displayName: string; color: string; screens: Screen[] };

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

/** Build a fresh iframe URL so role/screen changes always reload (and defeat caching). */
const buildIframeSrc = (base?: string, role?: RoleKey, screenId?: string) => {
  if (!base) return undefined;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}role=${encodeURIComponent(role ?? '')}&screen=${encodeURIComponent(
    screenId ?? ''
  )}&t=${Date.now()}`;
};

export default function PhoneDemo({
  initialRole = 'landlord',
  maxPhoneWidth = 420, // never exceed this
}: {
  initialRole?: RoleKey;
  maxPhoneWidth?: number;
}) {
  const [role, setRole] = useState<RoleKey>(initialRole);
  const roleCfg = useMemo(() => ROLES[role], [role]);

  // screen index per role
  const [index, setIndex] = useState(0);
  const total = roleCfg.screens.length;
  const cur = roleCfg.screens[index];

  // navigation helpers
  const goTo = useCallback(
    (id: string) => {
      const i = roleCfg.screens.findIndex((s) => s.id === id);
      if (i >= 0) setIndex(i);
    },
    [roleCfg.screens]
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

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

  // iframe -> React bridge
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data as unknown;
      if (isBridgeMessage(data) && data.to) goTo(data.to);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [goTo]);

  // --- phone sizing (iPhone-ish 19.5:9) ---
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [deviceW, setDeviceW] = useState(360);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = Math.floor(entries[0].contentRect.width);
        // Fit within container, clamp between 300px and maxPhoneWidth, and avoid 1px overflow
        const ideal = Math.min(maxPhoneWidth, Math.max(300, cw - 1));
        setDeviceW(ideal);
      }
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [maxPhoneWidth]);

  const deviceH = Math.round(deviceW * (19.5 / 9));
  const bezel = 14; // frame padding
  const screenH = deviceH - bezel * 2;

  // persistent ring (gold)
  const ringShadowActive = '0 0 0 2px #F0A202';

  const goToDot = (i: number) => setIndex(clamp(i, 0, total - 1));

  return (
    <div ref={wrapRef} className="w-full" style={{ overflow: 'visible' }}>
      {/* Role switcher (now a 3-col grid sized to phone width, so it cannot overflow) */}
      <div
        className="mx-auto mb-4 pt-2"
        style={{
          width: deviceW,
          maxWidth: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          overflow: 'visible', // let the glow show if needed (doesn't affect layout)
        }}
      >
        {(['landlord', 'tenant', 'contractor'] as RoleKey[]).map((r) => {
          const active = r === role;
          return (
            <button
              key={r}
              onClick={() => { setRole(r); setIndex(0); }}
              className={`rounded-full text-sm font-semibold transition
                ${active ? 'bg-[#14213D] text-white' : 'bg-white/40 text-white hover:bg-white/50'}`}
              aria-pressed={active}
              aria-label={ROLES[r].displayName}
              style={{
                width: '100%',                // fill grid cell
                padding: '10px 12px',         // compact so all 3 fit at small widths
                boxShadow: active ? ringShadowActive : 'none', // persistent gold ring
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {ROLES[r].displayName}
            </button>
          );
        })}
      </div>

      {/* Phone frame */}
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: deviceW }}>
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
                  key={`${role}-${cur.id}`} // force remount when role/screen changes
                  title={cur.label}
                  src={buildIframeSrc(cur.iframeSrc, role, cur.id)} // cache-busted URL
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
        <div className="mt-3 flex items-center justify-between" style={{ width: '100%' }}>
          <button
            onClick={prev}
            className="px-3 py-1.5 rounded-md bg-[#14213D] text-white focus:ring-2 focus:ring-[#F0A202] hover:bg-[#2f4982] transition text-sm"
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
            className="px-3 py-1.5 rounded-md bg-[#14213D] text-white focus:ring-2 focus:ring-[#F0A202] hover:bg-[#2f4982] transition text-sm"
          >
            Next →
          </button>
        </div>

        <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-300" style={{ width: '100%' }}>
          {roleCfg.displayName} · {cur.label}
        </div>
      </div>
    </div>
  );
}
