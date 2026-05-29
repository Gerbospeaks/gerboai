import { useState, useEffect } from "react";

export default function PWAInstallPrompt({ appReady }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  

  useEffect(() => {
    if (!appReady || isInstalled) return;

   const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);
    if (ios) {
      setVisible(true);
      return;
    }

    // Android/Chrome: capture the install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
const installed = () => setVisible(false);
window.addEventListener("appinstalled", installed);
    window.addEventListener("beforeinstallprompt", handler);
   return () => {
  window.removeEventListener("beforeinstallprompt", handler);
  window.removeEventListener("appinstalled", installed);  
};
  }, [appReady]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <>
      {/* Floating install button */}
      <button
        onClick={handleInstall}
        title="Add to Home Screen"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "#6366f1",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "22px",
          boxShadow: "0 4px 16px rgba(99,102,241,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        📲
      </button>

      {/* iOS instruction modal */}
      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "16px 16px 0 0",
              padding: "28px 24px",
              width: "100%",
              maxWidth: "480px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Add to Home Screen
            </p>
            <p style={{ color: "#555", marginBottom: "16px", lineHeight: 1.5 }}>
              Tap the <strong>Share</strong> icon{" "}
              <span style={{ fontSize: "20px" }}>⎋</span> at the bottom of your
              browser, then select <strong>"Add to Home Screen"</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                background: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 28px",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
