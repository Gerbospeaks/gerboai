import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Download,
  Share,
  Plus,
  Smartphone,
  Monitor,
  RefreshCw,
} from "lucide-react";

let _promptFired = false;
// ── Platform detection ────────────────────────────────────────────────────────
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isMobile = () => /android|iphone|ipad|ipod/i.test(navigator.userAgent);

// ── Storage ───────────────────────────────────────────────────────────────────
const DISMISSED_KEY = "solidflo_pwa_dismissed";
const INSTALL_KEY = "solidflo_pwa_installed";
const DISMISS_DAYS = 14;

const wasDismissedRecently = () => {
  try {
    const ts = localStorage.getItem(DISMISSED_KEY);
    if (!ts) return false;
    return (Date.now() - Number(ts)) / 86_400_000 < DISMISS_DAYS;
  } catch {
    return false;
  }
};

const isAlreadyInstalled = () => {
  try {
    return !!localStorage.getItem(INSTALL_KEY);
  } catch {
    return false;
  }
};


// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function PWAInstallPrompt() {
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [platform, setPlatform] = useState("");

  // Store deferred prompt in a ref — updating it never causes a re-render
  const deferredPromptRef = useRef(null);
  const timerRef = useRef(null);

  // ── Capture beforeinstallprompt ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      if (!isInStandaloneMode() && !wasDismissedRecently()) {
        setPlatform(isMobile() ? "android" : "desktop");
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── iOS platform detection ───────────────────────────────────────────────
  useEffect(() => {
    if (isIOS() && !isInStandaloneMode() && !wasDismissedRecently()) {
      setPlatform("ios");
    }
  }, []);

 

  useEffect(() => {
  if (_promptFired) return;          // ← was promptShownRef / _promptDecided
  if (isInStandaloneMode()) return;
  if (wasDismissedRecently()) return;
  if (isAlreadyInstalled()) return;

  timerRef.current = setTimeout(() => {
    _promptFired = true;
    const hasChromePrompt = !!deferredPromptRef.current;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    if (hasChromePrompt || isIos) {
      setShowPrompt(true);
    }
  }, 6000);

  return () => { if (timerRef.current) clearTimeout(timerRef.current); };
}, [platform]);
  useEffect(() => {
  const handler = () => setShowUpdateBanner(true);
  window.addEventListener('swUpdateAvailable', handler);
  return () => window.removeEventListener('swUpdateAvailable', handler);
}, []);

  // ── Dismiss ──────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {}
  }, []);

  // ── Install ──────────────────────────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) {
      if (
        platform === "ios" ||
        (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream)
      ) {
        setShowIOSGuide(true);
      }
      return;
    }
    setInstalling(true);
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        try {
          localStorage.setItem(INSTALL_KEY, "true");
        } catch {}
      }
      deferredPromptRef.current = null;
    } finally {
      setInstalling(false);
    }
  }, [platform]);

  // ── Update ───────────────────────────────────────────────────────────────
  const handleUpdate = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    } catch {}
    setShowUpdateBanner(false);
  }, []);

  // Never render anything if already a PWA
  if (isInStandaloneMode()) return null;

  return (
    <>
      {showUpdateBanner && (
        <UpdateBanner
          onUpdate={handleUpdate}
          onDismiss={() => setShowUpdateBanner(false)}
        />
      )}

      {showPrompt && !showIOSGuide && (
        <>
          <div className="md:hidden">
            <MobileSheet
              platform={platform}
              installing={installing}
              onInstall={
                platform === "ios" ? () => setShowIOSGuide(true) : handleInstall
              }
              onDismiss={dismiss}
            />
          </div>
          <div className="hidden md:block">
            <DesktopCard
              installing={installing}
              onInstall={handleInstall}
              onDismiss={dismiss}
            />
          </div>
        </>
      )}

      {showIOSGuide && <IOSGuide onDismiss={dismiss} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE BANNER
// ══════════════════════════════════════════════════════════════════════════════
function UpdateBanner({ onUpdate, onDismiss }) {
  return (
    <div
      className="fixed top-0 inset-x-0 z-[200] flex items-center justify-between gap-3 px-4 py-3 bg-[#0f172a] border-b border-[#253347] shadow-lg"
      style={{ animation: "slideDown 0.3s ease-out" }}
    >
      <style>{`@keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">
            Update available
          </p>
          <p className="text-xs text-[#64748b] truncate">
            A new version of SolidFlo is ready
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onUpdate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-[#64748b] hover:text-white hover:bg-[#253347] rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE BOTTOM SHEET
// ══════════════════════════════════════════════════════════════════════════════
function MobileSheet({ platform, installing, onInstall, onDismiss }) {
  return (
    <>
      <div
        className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />
      <div
        className="fixed bottom-0 inset-x-0 z-[200] bg-[#1a2332] border-t border-[#253347] rounded-t-2xl shadow-2xl px-5 pt-5 pb-8"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <style>{`
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        `}</style>
        <div className="w-10 h-1 bg-[#334155] rounded-full mx-auto mb-5" />
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-[#0f172a] rounded-2xl border border-[#253347] flex items-center justify-center flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="3"
                width="20"
                height="18"
                rx="3"
                fill="#2563eb"
                fillOpacity="0.15"
                stroke="#2563eb"
                strokeWidth="1.5"
              />
              <path
                d="M7 8h10M7 12h6M7 16h4"
                stroke="#2563eb"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white">SolidFlo</p>
            <p className="text-xs text-[#64748b] mt-0.5">solidflo.app</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span className="text-xs text-[#059669] font-medium">
                Free · No ads · Works offline
              </span>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-[#475569] hover:text-white hover:bg-[#253347] rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { icon: "⚡", label: "Instant access", sub: "No browser needed" },
            { icon: "🔒", label: "Secure", sub: "Your data, protected" },
            { icon: "📱", label: "Mobile-ready", sub: "Built for on-the-go" },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="bg-[#0f172a] border border-[#253347] rounded-xl p-3 text-center"
            >
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-xs font-semibold text-white leading-tight">
                {label}
              </p>
              <p className="text-[10px] text-[#64748b] mt-0.5 leading-tight">
                {sub}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={onInstall}
          disabled={installing}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
        >
          {platform === "ios" ? (
            <>
              <Share className="w-4 h-4" />
              Add to Home Screen
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {installing ? "Installing…" : "Install App"}
            </>
          )}
        </button>
        <button
          onClick={onDismiss}
          className="w-full mt-2 py-3 text-xs text-[#475569] hover:text-[#94a3b8] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP CORNER CARD
// ══════════════════════════════════════════════════════════════════════════════
function DesktopCard({ installing, onInstall, onDismiss }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[200] w-80 bg-[#1a2332] border border-[#253347] rounded-2xl shadow-2xl overflow-hidden"
      style={{ animation: "slideInRight 0.35s cubic-bezier(0.32,0.72,0,1)" }}
    >
      <style>{`@keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <div className="h-1 bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#0891b2]" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#0f172a] rounded-xl border border-[#253347] flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="18"
                  rx="3"
                  fill="#2563eb"
                  fillOpacity="0.15"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 8h10M7 12h6M7 16h4"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Install SolidFlo</p>
              <p className="text-xs text-[#64748b]">
                Desktop app · Always available
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 text-[#475569] hover:text-white hover:bg-[#253347] rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {[
            {
              icon: Monitor,
              text: "Opens in its own window — no browser tabs",
            },
            { icon: Download, text: "Works offline with cached data" },
            { icon: Smartphone, text: "Native app feel on any device" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-[#0f172a] rounded-md flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-[#2563eb]" />
              </div>
              <span className="text-xs text-[#94a3b8]">{text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onInstall}
          disabled={installing}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {installing ? "Installing…" : "Install App"}
        </button>
        <button
          onClick={onDismiss}
          className="w-full mt-1.5 py-2 text-xs text-[#475569] hover:text-[#64748b] transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// iOS GUIDE
// ══════════════════════════════════════════════════════════════════════════════
function IOSGuide({ onDismiss }) {
  const steps = [
    {
      icon: <Share className="w-5 h-5 text-[#2563eb]" />,
      label: "Tap the Share button",
      sub: "Bottom centre of Safari — the box with an arrow pointing up",
    },
    {
      icon: <Plus className="w-5 h-5 text-[#059669]" />,
      label: "Add to Home Screen",
      sub: "Scroll down and tap 'Add to Home Screen' in the share menu",
    },
    {
      icon: <Smartphone className="w-5 h-5 text-[#7c3aed]" />,
      label: "Tap Add",
      sub: "Confirm the name and tap 'Add' in the top-right corner",
    },
  ];
  return (
    <>
      <div
        className="fixed inset-0 z-[190] bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />
      <div
        className="fixed bottom-0 inset-x-0 z-[200] bg-[#1a2332] border-t border-[#253347] rounded-t-2xl shadow-2xl px-5 pt-5 pb-10"
        style={{ animation: "slideUp 0.35s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="w-10 h-1 bg-[#334155] rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">
              Add to Home Screen
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Follow these steps in Safari
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-[#475569] hover:text-white hover:bg-[#253347] rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3 mb-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-[#0f172a] border border-[#253347] rounded-xl"
            >
              <div className="w-9 h-9 bg-[#1a2332] border border-[#253347] rounded-xl flex items-center justify-center flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">
                  Step {i + 1}
                </span>
                <p className="text-sm font-semibold text-white leading-tight mt-0.5">
                  {step.label}
                </p>
                <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">
                  {step.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mb-5 p-3 bg-[#0f172a] border border-[#253347] rounded-xl">
          <span className="text-xs text-[#64748b]">
            Look for this icon in Safari:
          </span>
          <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center">
            <Share className="w-4 h-4 text-white" />
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-3 bg-[#253347] hover:bg-[#334155] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </>
  );
}
