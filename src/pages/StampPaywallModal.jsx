import React, { useState } from "react";
import { X, Stamp, Check, Loader2, ShieldCheck } from "lucide-react";

export default function StampPaywallModal({
  isOpen,
  onClose,
  onUnlock,
  price = "R99",
  title = "Unlock this feature",
  subtitle = "Add a custom stamp and signature to your invoices and quotes.",
  features = [
    "Custom circular & shape stamps",
    "Upload and place your signature",
    "Apply to any page of an invoice or quote",
    "Save your stamp design for future use",
  ],
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setError(null);
    setProcessing(true);
    try {
      await onUnlock();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return; // don't let them dismiss mid-payment
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#ce1414] rounded-lg flex items-center justify-center">
              <Stamp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Stamp &amp; Signature
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={processing}
            className="p-1.5 text-[#64748b] hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#fef2f2] rounded-full flex items-center justify-center">
            <Stamp className="w-7 h-7 text-[#ce1414]" />
          </div>

          <h3 className="text-base font-semibold text-[#1e293b] mb-1.5">
  {title}
</h3>
<p className="text-sm text-[#64748b] mb-5">
  {subtitle}
</p>

          {/* Feature list */}
          <div className="text-left bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 mb-5 space-y-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-[#059669]" />
                </div>
                <span className="text-xs text-[#374151] leading-snug">{f}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-1.5 mb-5">
            <span className="text-2xl font-bold text-[#1e293b]">{price}</span>
            <span className="text-xs text-[#94a3b8]">once-off</span>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-xs text-[#991b1b] text-left">
              {error}
            </div>
          )}

          {/* Purchase button */}
          <button
            onClick={handlePurchase}
            disabled={processing}
            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing payment...
              </>
            ) : (
              `Unlock for ${price}`
            )}
          </button>

          <button
            onClick={handleClose}
            disabled={processing}
            className="w-full px-4 py-2 text-[#64748b] text-sm hover:text-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Not now
          </button>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-[#94a3b8]">
            <ShieldCheck className="w-3 h-3" />
            Secure payment · Access unlocked instantly
          </div>
        </div>
      </div>
    </div>
  );
}