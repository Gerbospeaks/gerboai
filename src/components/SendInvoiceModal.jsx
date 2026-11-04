import React, { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  Send,
  X,
  Mail,
  Users,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronDown,
  Clock,
  Sparkles,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";

// ── AI message suggestion templates ──────────────────────────────────────────
const MESSAGE_TEMPLATES = [
  {
    label: "Standard",
    message: (inv, biz) =>
      `Dear ${inv.customer?.name || "Valued Client"},\n\nPlease find your ${inv.documentType === "estimate" ? "estimate" : "invoice"} ${inv.invoiceNumber} for R${fmt(inv.totals?.total)} attached.\n\nPayment is due by ${fmtDate(inv.dates?.dueDate)}. Please use the banking details below when making payment and use your invoice number as the reference.\n\nThank you for your business.\n\n${biz?.businessName || ""}`,
  },
  {
    label: "Friendly",
    message: (inv, biz) =>
      `Hi ${inv.customer?.name?.split(" ")[0] || "there"},\n\nHope you're well! I've attached invoice ${inv.invoiceNumber} for R${fmt(inv.totals?.total)}.\n\nWhenever you get a chance to settle it by ${fmtDate(inv.dates?.dueDate)}, that would be great. Don't hesitate to reach out if you have any questions.\n\nThanks!\n${biz?.businessName || ""}`,
  },
  {
    label: "Reminder",
    message: (inv, biz) =>
      `Dear ${inv.customer?.name || "Valued Client"},\n\nThis is a friendly reminder that invoice ${inv.invoiceNumber} for R${fmt(inv.totals?.due || inv.totals?.total)} was due on ${fmtDate(inv.dates?.dueDate)}.\n\nPlease arrange payment at your earliest convenience. If payment has already been made, please disregard this message.\n\nShould you have any queries, please do not hesitate to contact us.\n\n${biz?.businessName || ""}`,
  },
  {
    label: "Estimate",
    message: (inv, biz) =>
      `Dear ${inv.customer?.name || "Valued Client"},\n\nThank you for your enquiry. Please find the attached estimate ${inv.invoiceNumber} for R${fmt(inv.totals?.total)} for your review.\n\nThis estimate is valid for 7 days. Should you wish to proceed, please reply to this email and we will convert it to a formal invoice.\n\nWe look forward to doing business with you.\n\n${biz?.businessName || ""}`,
  },
];

// ── Email validation ──────────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
const parseEmailList = (str) =>
  str
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
const validateEmails = (str) => {
  if (!str.trim()) return { valid: false, error: "Required" };
  const list = parseEmailList(str);
  const bad = list.filter((e) => !isValidEmail(e));
  if (bad.length) return { valid: false, error: `Invalid: ${bad.join(", ")}` };
  return { valid: true, error: null };
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props:
//   invoice       — the full invoice object from Firestore
//   businessInfo  — the business settings object
//   onClose       — called when modal should close
//   onSent        — called after successful send
// ══════════════════════════════════════════════════════════════════════════════
export default function SendInvoiceModal({
  invoice,
  businessInfo,
  onClose,
  onSent,
}) {
  const bi = businessInfo || {};
  const inv = invoice || {};
  const isEst = inv.documentType === "estimate";
  const docLabel = isEst ? "Estimate" : "Invoice";

  const [to, setTo] = useState(inv.customer?.email || "");
  const [cc, setCc] = useState(bi.email ? `${bi.email}` : "");
  const [subject, setSubject] = useState(
    `${docLabel} ${inv.invoiceNumber} from ${bi.businessName || "Your Business"}`,
  );
  const [message, setMessage] = useState("");
  const [showCc, setShowCc] = useState(!!bi.email);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // null | "success" | "error"
  const [error, setError] = useState("");
  const [selectedTpl, setSelectedTpl] = useState(0);

  // Auto-fill message on mount
  useEffect(() => {
    const tpl = MESSAGE_TEMPLATES[0];
    setMessage(tpl.message(inv, bi));
  }, []);

  const applyTemplate = (idx) => {
    setSelectedTpl(idx);
    setMessage(MESSAGE_TEMPLATES[idx].message(inv, bi));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const toValidation = validateEmails(to);
  const ccValidation = cc.trim()
    ? validateEmails(cc)
    : { valid: true, error: null };
  const canSend =
    toValidation.valid && ccValidation.valid && subject.trim() && !sending;

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const functions = getFunctions();
      const sendInvoice = httpsCallable(functions, "sendInvoiceEmail");
      await sendInvoice({
        invoiceId: inv.id,
        to: to.trim(),
        cc: cc.trim(),
        subject: subject.trim(),
        message: message.trim(),
        documentType: inv.documentType || "invoice",
      });
      setResult("success");
      setTimeout(() => {
        onSent?.();
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
      setResult("error");
    } finally {
      setSending(false);
    }
  };

  // ── Keyboard shortcut ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSend)
        handleSend();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [to, cc, subject, message, canSend]);

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-[#e2e8f0] overflow-hidden">
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2563eb] rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Send {docLabel}</p>
              <p className="text-xs text-[#64748b] font-mono">
                {inv.invoiceNumber} · R{fmt(inv.totals?.total)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#475569] hover:text-white hover:bg-[#253347] rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Success state ── */}
        {result === "success" && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-[#dcfce7] rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#059669]" />
            </div>
            <h3 className="text-lg font-bold text-[#1e293b]">
              {docLabel} sent successfully
            </h3>
            <p className="text-sm text-[#64748b] mt-1">
              Delivered to{" "}
              <span className="font-semibold text-[#1e293b]">{to}</span>
            </p>
            <p className="text-xs text-[#94a3b8] mt-2">Closing in a moment…</p>
          </div>
        )}

        {/* ── Error state banner ── */}
        {result === "error" && (
          <div className="mx-6 mt-4 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#991b1b]">
                Send failed
              </p>
              <p className="text-xs text-[#dc2626] mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="ml-auto p-1 text-[#94a3b8] hover:text-[#374151] rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Compose form ── */}
        {result !== "success" && (
          <div className="p-6 space-y-4">
            {/* To field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls + " mb-0"}>To *</label>
                {!toValidation.valid && to && (
                  <span className="text-[10px] text-[#dc2626] font-semibold">
                    {toValidation.error}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  className={`${inputCls} pl-9 ${!toValidation.valid && to ? "border-[#dc2626] focus:ring-[#dc2626]" : ""}`}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="client@example.com, another@example.com"
                  type="text"
                />
              </div>
              <p className="text-[10px] text-[#94a3b8] mt-1">
                Separate multiple addresses with commas
              </p>
            </div>

            {/* CC toggle + field */}
            <div>
              {!showCc ? (
                <button
                  onClick={() => setShowCc(true)}
                  className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                >
                  + Add CC
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls + " mb-0"}>CC</label>
                    <button
                      onClick={() => {
                        setShowCc(false);
                        setCc("");
                      }}
                      className="text-[10px] text-[#94a3b8] hover:text-[#374151]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input
                      className={`${inputCls} pl-9 ${!ccValidation.valid && cc ? "border-[#dc2626]" : ""}`}
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                      placeholder="cc@example.com"
                      type="text"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className={labelCls}>Subject *</label>
              <input
                className={inputCls}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Invoice subject line"
              />
            </div>

            {/* Message templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls + " mb-0"}>Message</label>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#7c3aed]" />
                  <span className="text-[10px] font-semibold text-[#7c3aed] uppercase tracking-wide">
                    Templates
                  </span>
                  <div className="flex gap-1 ml-1">
                    {MESSAGE_TEMPLATES.map((t, i) => (
                      <button
                        key={t.label}
                        onClick={() => applyTemplate(i)}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-all ${
                          selectedTpl === i
                            ? "bg-[#7c3aed] text-white"
                            : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                className={inputCls}
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message to the client…"
              />
            </div>

            {/* Invoice summary strip */}
            <div className="flex items-center gap-4 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs">
              <div>
                <span className="text-[#94a3b8]">{docLabel}</span>
                <span className="ml-1.5 font-bold text-[#2563eb]">
                  {inv.invoiceNumber}
                </span>
              </div>
              <div className="h-3 w-px bg-[#e2e8f0]" />
              <div>
                <span className="text-[#94a3b8]">Amount</span>
                <span className="ml-1.5 font-bold text-[#1e293b]">
                  R{fmt(inv.totals?.total)}
                </span>
              </div>
              {inv.totals?.paid > 0 && (
                <>
                  <div className="h-3 w-px bg-[#e2e8f0]" />
                  <div>
                    <span className="text-[#94a3b8]">Balance</span>
                    <span className="ml-1.5 font-bold text-[#dc2626]">
                      R{fmt(inv.totals?.due || inv.totals?.total)}
                    </span>
                  </div>
                </>
              )}
              <div className="h-3 w-px bg-[#e2e8f0]" />
              <div>
                <span className="text-[#94a3b8]">Due</span>
                <span className="ml-1.5 font-semibold text-[#374151]">
                  {fmtDate(inv.dates?.dueDate)}
                </span>
              </div>
              {inv.lastSentAt && (
                <>
                  <div className="h-3 w-px bg-[#e2e8f0]" />
                  <div className="flex items-center gap-1 text-[#94a3b8]">
                    <Clock className="w-3 h-3" />
                    <span>
                      Sent {inv.sentCount || 1} time
                      {(inv.sentCount || 1) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Provider note */}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#92400e] leading-relaxed">
                Email is sent via your configured provider (Gmail / SendGrid /
                SMTP) through a Firebase Cloud Function. Make sure{" "}
                <code className="font-mono bg-[#fef3c7] px-1 rounded">
                  functions:config:set email.user
                </code>{" "}
                and{" "}
                <code className="font-mono bg-[#fef3c7] px-1 rounded">
                  email.pass
                </code>{" "}
                are set.
              </p>
            </div>
          </div>
        )}

        {/* ── Footer actions ── */}
        {result !== "success" && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#e2e8f0] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-[#94a3b8] hidden sm:block">
                ⌘↵ to send
              </p>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
                  canSend
                    ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white active:scale-[0.98]"
                    : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                }`}
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send {docLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
