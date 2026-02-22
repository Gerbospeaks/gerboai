// src/components/admin/DashboardPreview.js
import React, { useState, useEffect, useRef, Suspense, lazy, useCallback } from 'react';

// ─── Dashboard registry ───────────────────────────────────────────────────────
const DASHBOARD_LIST = [
  { id: 'mechanics',          label: 'Mechanics',          icon: '🔧', path: () => import('../../pages/mechanics/MechanicsDashboard') },
  { id: 'security',           label: 'Security',           icon: '🛡️', path: () => import('../../pages/security/SecurityDashboard') },
  { id: 'healthcare',         label: 'Healthcare',         icon: '🏥', path: () => import('../../pages/health/HealthcareDashboard') },
  { id: 'electrical',         label: 'Electrical',         icon: '⚡', path: () => import('../../pages/electrical/ElectricalDashboard') },
  { id: 'restaurant',         label: 'Restaurant',         icon: '🍽️', path: () => import('../../pages/restaurants/RestaurantDashboard') },
  { id: 'construction',       label: 'Construction',       icon: '🏗️', path: () => import('../../pages/construction/ConstructionDashboard') },
  { id: 'cleaning',           label: 'Cleaning',           icon: '🧹', path: () => import('../../pages/cleaning/CleaningDashboard') },
  { id: 'education',          label: 'Education',          icon: '🎓', path: () => import('../../pages/education/EducationDashboard') },
  { id: 'hotel',              label: 'Hotel',              icon: '🏨', path: () => import('../../pages/hotel/HotelDashboard') },
  { id: 'legal',              label: 'Legal',              icon: '⚖️', path: () => import('../../pages/legal/LegalDashboard') },
  { id: 'plumbing',           label: 'Plumbing',           icon: '🔩', path: () => import('../../pages/plumbing/PlumbingDashboard') },
  { id: 'retail',             label: 'Retail',             icon: '🛒', path: () => import('../../pages/retail/RetailDashboard') },
  { id: 'landscaping',        label: 'Landscaping',        icon: '🌿', path: () => import('../../pages/landscaping/LandscapingDashboard') },
  { id: 'logistics',          label: 'Logistics',          icon: '🚛', path: () => import('../../pages/logistics/LogisticsDashboard') },
  { id: 'photography',        label: 'Photography',        icon: '📸', path: () => import('../../pages/photography/PhotographyDashboard') },
  { id: 'realestate',         label: 'Real Estate',        icon: '🏠', path: () => import('../../pages/realEstate/RealEstateDashboard') },
  { id: 'flooring',           label: 'Flooring',           icon: '🪵', path: () => import('../../pages/flooring/FlooringDashboard') },
  { id: 'hvac',               label: 'HVAC',               icon: '❄️', path: () => import('../../pages/hvac/HVACDashboard') },
  { id: 'accounting',         label: 'Accounting',         icon: '📊', path: () => import('../../pages/accounting/AccountingDashboard') },
  { id: 'painting',           label: 'Painting',           icon: '🎨', path: () => import('../../pages/painting/PaintingDashboard') },
  { id: 'pest-control',       label: 'Pest Control',       icon: '🐛', path: () => import('../../pages/pest-contrrol/PestcontrolDashboard') },
  { id: 'pool-services',      label: 'Pool Services',      icon: '🏊', path: () => import('../../pages/pool-services/PoolservicesDashboard') },
  { id: 'solar-installation', label: 'Solar Installation', icon: '☀️', path: () => import('../../pages/solar-installation/SolarDashboard') },
  { id: 'towing',             label: 'Towing',             icon: '🚗', path: () => import('../../pages/towing/TowingDashboard') },
  { id: 'welding',            label: 'Welding',            icon: '🔥', path: () => import('../../pages/welding/WeldingDashboard') },
  { id: 'carpentry',          label: 'Carpentry',          icon: '🪚', path: () => import('../../pages/carpentry/CarpentryDashboard') },
  { id: 'window-repair',      label: 'Window Repair',      icon: '🪟', path: () => import('../../pages/window-repair/WindowrepairDashboard') },
];

// ─── Viewport presets ─────────────────────────────────────────────────────────
const VIEWPORTS = {
  desktop: { key: 'desktop', label: 'Desktop', nativeWidth: 1280, previewHeight: 680 },
  tablet:  { key: 'tablet',  label: 'Tablet',  nativeWidth: 768,  previewHeight: 680 },
  mobile:  { key: 'mobile',  label: 'Mobile',  nativeWidth: 390,  previewHeight: 680 },
};

// ─── Lazy component cache ─────────────────────────────────────────────────────
const lazyCache = {};
function getLazy(id) {
  if (!lazyCache[id]) {
    const entry = DASHBOARD_LIST.find((d) => d.id === id);
    if (entry) lazyCache[id] = lazy(entry.path);
  }
  return lazyCache[id];
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const DesktopIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>
);
const TabletIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const MobileIcon = () => (
  <svg width="15" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

// ─── Device Frame ─────────────────────────────────────────────────────────────
const DeviceFrame = ({ viewport, children }) => {
  if (viewport === 'desktop') {
    return (
      <div style={df.desktopWrap}>
        {/* Browser chrome bar */}
        <div style={df.chromebar}>
          <div style={df.dots}>
            <span style={{ ...df.dot, background: '#ff5f57' }} />
            <span style={{ ...df.dot, background: '#febc2e' }} />
            <span style={{ ...df.dot, background: '#28c840' }} />
          </div>
          <div style={df.urlpill}>
            <span style={df.lock}>🔒</span>
            <span style={df.urltext}>solidflo.app/dashboard</span>
          </div>
          <div style={{ width: 52 }} />
        </div>
        {/* Screen */}
        <div style={df.desktopScreen}>{children}</div>
        {/* Stand */}
        <div style={df.standNeck} />
        <div style={df.standFoot} />
      </div>
    );
  }

  if (viewport === 'tablet') {
    return (
      <div style={df.tabletWrap}>
        <div style={df.tabletCam} />
        <div style={df.tabletScreen}>{children}</div>
        <div style={df.tabletBtn} />
      </div>
    );
  }

  // mobile
  return (
    <div style={df.phoneWrap}>
      <div style={df.phonePill} />
      <div style={df.phoneScreen}>{children}</div>
      <div style={df.phoneBar} />
    </div>
  );
};

const df = {
  // ── Desktop
  desktopWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.45))',
    width: '100%',
  },
  chromebar: {
    width: '100%', background: '#232336',
    borderRadius: '14px 14px 0 0',
    padding: '10px 16px',
    display: 'flex', alignItems: 'center', gap: 10,
    border: '2px solid #333355', borderBottom: 'none',
  },
  dots: { display: 'flex', gap: 6, flexShrink: 0 },
  dot: { width: 11, height: 11, borderRadius: '50%', display: 'block' },
  urlpill: {
    flex: 1, background: '#13131f', borderRadius: 8,
    padding: '5px 12px', display: 'flex', alignItems: 'center',
    gap: 6, justifyContent: 'center',
  },
  lock: { fontSize: 10 },
  urltext: { color: '#7070a0', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.3px' },
  desktopScreen: {
    width: '100%', border: '2px solid #333355', borderTop: 'none',
    borderRadius: '0 0 6px 6px', overflow: 'hidden',
    background: '#fff',
  },
  standNeck: {
    width: 48, height: 20,
    background: 'linear-gradient(to bottom, #3a3a5c, #2a2a45)',
  },
  standFoot: {
    width: 110, height: 7, borderRadius: 4,
    background: 'linear-gradient(to bottom, #3a3a5c, #2a2a45)',
  },

  // ── Tablet
  tabletWrap: {
    background: '#1c1c2e', borderRadius: 24, padding: '16px 10px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '2px solid #333355',
    filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.4))',
  },
  tabletCam: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#333355', marginBottom: 10,
  },
  tabletScreen: {
    width: '100%', borderRadius: 6, overflow: 'hidden',
    border: '1px solid #333355', background: '#fff',
  },
  tabletBtn: {
    width: 32, height: 32, borderRadius: '50%',
    border: '2px solid #333355', marginTop: 12,
  },

  // ── Mobile / Phone
  phoneWrap: {
    background: '#1c1c2e', borderRadius: 42, padding: '16px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '2px solid #333355',
    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))',
  },
  phonePill: {
    width: 88, height: 26, borderRadius: '0 0 16px 16px',
    background: '#13131f', border: '2px solid #333355', borderTop: 'none',
    marginBottom: 10,
  },
  phoneScreen: {
    width: '100%', borderRadius: 4, overflow: 'hidden',
    background: '#fff',
  },
  phoneBar: {
    width: 90, height: 4, borderRadius: 3,
    background: '#333355', marginTop: 14,
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
const DashboardPreview = () => {
  const [selectedId, setSelectedId]         = useState('');
  const [viewport, setViewport]             = useState('desktop');
  const [renderKey, setRenderKey]           = useState(0);
  const [scale, setScale]                   = useState(1);
  const [isTransitioning, setTransitioning] = useState(false);
  const [dropdownOpen, setDropdownOpen]     = useState(false);

  const containerRef = useRef(null);
  const vp = VIEWPORTS[viewport];

  // ── Scale calculation via ResizeObserver
  const recalcScale = useCallback(() => {
    if (!containerRef.current) return;
    // Leave room for device frame padding (≈80px total horizontal)
    const framePad = viewport === 'mobile' ? 20 : viewport === 'tablet' ? 24 : 8;
    const available = containerRef.current.clientWidth - framePad * 2 - 48;
    setScale(Math.min(available / vp.nativeWidth, 1));
  }, [vp.nativeWidth, viewport]);

  useEffect(() => {
    recalcScale();
    const ro = new ResizeObserver(recalcScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalcScale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]')) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const switchViewport = (key) => {
    if (key === viewport) return;
    setTransitioning(true);
    setTimeout(() => {
      setViewport(key);
      setRenderKey((k) => k + 1);
      setTransitioning(false);
    }, 160);
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setRenderKey((k) => k + 1);
    setDropdownOpen(false);
  };

  const SelectedDashboard = selectedId ? getLazy(selectedId) : null;
  const selectedEntry = DASHBOARD_LIST.find((d) => d.id === selectedId);

  // innerScrollHeight: how tall the dashboard "sees" the scroll container (at native px)
  const innerScrollHeight = vp.previewHeight / scale;

  return (
    <div ref={containerRef} style={s.root}>

      {/* ════════════ TOOLBAR ════════════ */}
      <div style={s.toolbar}>

        {/* — Dashboard picker dropdown — */}
        <div style={s.ddWrap} data-dropdown>
          <button style={s.ddTrigger} onClick={() => setDropdownOpen((o) => !o)}>
            <span style={s.ddIcon}>{selectedEntry?.icon ?? '🗂️'}</span>
            <span style={s.ddLabel}>{selectedEntry?.label ?? 'Select a dashboard'}</span>
            <span style={{ ...s.ddChevron, transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
              <ChevronDown />
            </span>
          </button>

          {dropdownOpen && (
            <div style={s.ddMenu}>
              {DASHBOARD_LIST.map((d) => (
                <button
                  key={d.id}
                  style={{ ...s.ddItem, ...(d.id === selectedId ? s.ddItemActive : {}) }}
                  onClick={() => handleSelect(d.id)}
                >
                  <span style={s.ddItemIcon}>{d.icon}</span>
                  {d.label}
                  {d.id === selectedId && <span style={s.ddCheck}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* — Viewport toggles — */}
        <div style={s.vpGroup}>
          {[
            { key: 'mobile',  Icon: MobileIcon,  w: '390px'  },
            { key: 'tablet',  Icon: TabletIcon,  w: '768px'  },
            { key: 'desktop', Icon: DesktopIcon, w: '1280px' },
          ].map(({ key, Icon, w }) => (
            <button
              key={key}
              title={`${VIEWPORTS[key].label} — ${w}`}
              onClick={() => switchViewport(key)}
              style={{ ...s.vpBtn, ...(viewport === key ? s.vpBtnOn : {}) }}
            >
              <Icon />
              <span style={s.vpBtnLabel}>{VIEWPORTS[key].label}</span>
              <span style={s.vpBtnWidth}>{w}</span>
            </button>
          ))}
        </div>

        {/* — Meta + refresh — */}
        <div style={s.tbRight}>
          <span style={s.scalePill}>
            {vp.nativeWidth}px &nbsp;·&nbsp; {Math.round(scale * 100)}%
          </span>
          {selectedId && (
            <button style={s.refreshBtn} onClick={() => setRenderKey((k) => k + 1)}>
              <RefreshIcon /> Remount
            </button>
          )}
        </div>
      </div>

      {/* ════════════ WARNING BAR ════════════ */}
      {selectedId && (
        <div style={s.warnBar}>
          ⚠️&nbsp; <strong>Admin Preview Mode</strong> — this dashboard renders live and may interact with real Firestore data.
        </div>
      )}

      {/* ════════════ CANVAS ════════════ */}
      <div style={s.canvas}>
        {!selectedId ? (
          /* ── Empty state ── */
          <div style={s.empty}>
            <div style={s.emptyGlow} />
            <div style={s.emptyIcon}>🗂️</div>
            <p style={s.emptyH}>Pick a dashboard to preview</p>
            <p style={s.emptySub}>Choose any industry from the dropdown, then switch between Mobile, Tablet and Desktop to test responsiveness.</p>
            <div style={s.quickPicks}>
              {DASHBOARD_LIST.slice(0, 8).map((d) => (
                <button key={d.id} style={s.quickChip} onClick={() => handleSelect(d.id)}>
                  {d.icon} {d.label}
                </button>
              ))}
              <span style={s.quickMore}>+{DASHBOARD_LIST.length - 8} more</span>
            </div>
          </div>
        ) : (
          /* ── Device preview ── */
          <div
            style={{
              ...s.frameOuter,
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(6px) scale(0.98)' : 'translateY(0) scale(1)',
              transition: 'opacity 0.16s ease, transform 0.16s ease',
            }}
          >
            <DeviceFrame viewport={viewport}>
              {/* 
                Clip box — visually sized to previewHeight × (nativeWidth * scale)
                Inside it, the content renders at native width and is scaled down.
              */}
              <div
                style={{
                  width: '100%',
                  height: vp.previewHeight,
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#f5f5f5',
                }}
              >
                {/* Scale + scroll wrapper */}
                <div
                  style={{
                    width: vp.nativeWidth,
                    height: innerScrollHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }}
                >
                  <Suspense
                    fallback={
                      <div style={s.loadBox}>
                        <div style={s.spinner} />
                        <span>Loading {selectedEntry?.label}…</span>
                      </div>
                    }
                  >
                    <SelectedDashboard key={`${selectedId}-${viewport}-${renderKey}`} />
                  </Suspense>
                </div>
              </div>
            </DeviceFrame>

            {/* Viewport label below device */}
            <div style={s.deviceLabel}>
              {selectedEntry?.icon} {selectedEntry?.label} &nbsp;·&nbsp; {VIEWPORTS[viewport].label} ({vp.nativeWidth}px)
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes dp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    display: 'flex', flexDirection: 'column',
    background: '#0d0d1a',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    minHeight: '100%',
    borderRadius: '0 0 14px 14px',
  },

  /* Toolbar */
  toolbar: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap',
    gap: 10, padding: '11px 18px',
    background: '#13131f',
    borderBottom: '1px solid #252540',
    position: 'sticky', top: 0, zIndex: 200,
  },

  /* Dropdown */
  ddWrap: { position: 'relative', zIndex: 300 },
  ddTrigger: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderRadius: 9,
    background: '#1a1a2e', border: '1px solid #333355',
    color: '#d0d0e8', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    minWidth: 210, transition: 'border-color 0.15s',
  },
  ddIcon: { fontSize: 15 },
  ddLabel: { flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  ddChevron: { color: '#555578', flexShrink: 0, transition: 'transform 0.18s' },
  ddMenu: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
    width: 250, maxHeight: 360, overflowY: 'auto',
    background: '#1a1a2e', border: '1px solid #333355',
    borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  },
  ddItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    width: '100%', padding: '8px 14px',
    background: 'none', border: 'none', textAlign: 'left',
    color: '#b0b0cc', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    transition: 'background 0.1s, color 0.1s',
  },
  ddItemActive: { background: '#252548', color: '#818cf8' },
  ddItemIcon: { fontSize: 14, width: 18, textAlign: 'center' },
  ddCheck: { marginLeft: 'auto', color: '#818cf8', fontSize: 14 },

  /* Viewport group */
  vpGroup: {
    display: 'flex', gap: 3, margin: '0 auto',
    background: '#0d0d1a', borderRadius: 10, padding: 3,
    border: '1px solid #222238',
  },
  vpBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 7,
    background: 'none', border: 'none',
    color: '#555578', cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  vpBtnOn: {
    background: '#4f46e5', color: '#fff',
    boxShadow: '0 2px 10px rgba(79,70,229,0.4)',
  },
  vpBtnLabel: { fontSize: 12, fontWeight: 600 },
  vpBtnWidth: { fontSize: 10, opacity: 0.65, fontFamily: 'monospace' },

  /* Right meta */
  tbRight: { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  scalePill: {
    background: '#1a1a2e', border: '1px solid #333355',
    color: '#5a5a80', borderRadius: 6,
    padding: '4px 10px', fontSize: 11, fontFamily: 'monospace',
  },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 7,
    background: 'none', border: '1px solid #333355',
    color: '#9090b8', cursor: 'pointer', fontSize: 11, fontWeight: 600,
    transition: 'border-color 0.15s, color 0.15s',
  },

  /* Warning */
  warnBar: {
    background: '#fffbeb', borderBottom: '1px solid #fcd34d',
    color: '#92400e', padding: '7px 18px', fontSize: 12,
  },

  /* Canvas */
  canvas: {
    flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '36px 20px 56px',
    background: 'radial-gradient(ellipse at 50% 0%, #161630 0%, #0d0d1a 70%)',
    minHeight: 600,
  },

  /* Device frame outer container */
  frameOuter: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 16, width: '100%', maxWidth: 1000,
  },
  deviceLabel: {
    color: '#444468', fontSize: 12, fontFamily: 'monospace',
    letterSpacing: '0.3px', marginTop: 4,
  },

  /* Empty state */
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 14, padding: '64px 24px', textAlign: 'center',
    maxWidth: 520, position: 'relative',
  },
  emptyGlow: {
    position: 'absolute', top: 40, left: '50%',
    transform: 'translateX(-50%)',
    width: 220, height: 220, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  emptyIcon: { fontSize: 54, lineHeight: 1, position: 'relative' },
  emptyH: { margin: 0, fontSize: 22, fontWeight: 700, color: '#c0c0d8' },
  emptySub: { margin: 0, fontSize: 13, color: '#5a5a80', lineHeight: 1.6, maxWidth: 380 },
  quickPicks: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 6 },
  quickChip: {
    padding: '7px 15px', borderRadius: 99,
    background: '#1a1a2e', border: '1px solid #333355',
    color: '#9090b8', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    transition: 'background 0.15s, color 0.15s',
  },
  quickMore: { color: '#383858', fontSize: 12, alignSelf: 'center' },

  /* Loader */
  loadBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 14,
    height: 400, color: '#5a5a80', fontSize: 14,
  },
  spinner: {
    width: 30, height: 30,
    border: '3px solid #252540', borderTopColor: '#4f46e5',
    borderRadius: '50%', animation: 'dp-spin 0.7s linear infinite',
  },
};

export default DashboardPreview;