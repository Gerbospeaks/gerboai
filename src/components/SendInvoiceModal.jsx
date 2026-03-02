// src/components/dashboard/SendInvoiceModal.jsx
// Triggered by the "Send" button on an invoice.
// Shows the payment link and sends an email to the customer.

import React, { useState } from "react";
import { doc, setDoc, getFirestore, serverTimestamp } from "firebase/firestore";
import { getPaymentPageUrl } from "../../utils/payfastUtils";
import {
  X,
  Send,
  Copy,
  CheckCircle,
  Link,
  Mail,
  ExternalLink,
} from "lucide-react";

export default function SendInvoiceModal({
  invoice,
  user,
  businessInfo,
  onClose,
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailBody, setEmailBody] = useState(
    buildDefaultEmail(invoice, businessInfo),
  );

  const paymentUrl = getPaymentPageUrl(invoice.id);

  // ── Copy link to clipboard ──────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = paymentUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Send email via mailto (no backend email service needed) ────────────
  //    For production replace with a Firebase Function + SendGrid/Resend
  const handleSendEmail = async () => {
    setSending(true);
    try {
      const db = getFirestore();

      // 1. Write invoice_links/{invoiceId} so the public PaymentPage can resolve it
      await setDoc(doc(db, "invoice_links", invoice.id), {
        userId: user.uid,
        collectionName:
          invoice.documentType === "quote" ? "quotations" : "invoices",
        invoiceId: invoice.id,
        customerEmail: invoice.customer?.email || "",
        createdAt: serverTimestamp(),
      });

      // 2. Open mailto (replace with API call to email service in production)
      const subject = encodeURIComponent(
        `${businessInfo?.businessName || "Invoice"} — ${invoice.jobCardNumber} — Payment Request`,
      );
      const body = encodeURIComponent(emailBody);
      window.open(
        `mailto:${invoice.customer?.email}?subject=${subject}&body=${body}`,
      );

      setSent(true);
    } catch (e) {
      alert("Failed to prepare invoice for sending: " + e.message);
    } finally {
      setSending(false);
    }
  };

  // ── Create invoice_links doc only (so link works before email is sent) ──
  const handleActivateLink = async () => {
    const db = getFirestore();
    await setDoc(doc(db, "invoice_links", invoice.id), {
      userId: user.uid,
      collectionName:
        invoice.documentType === "quote" ? "quotations" : "invoices",
      invoiceId: invoice.id,
      customerEmail: invoice.customer?.email || "",
      createdAt: serverTimestamp(),
    });
  };

  const amountDue = invoice.totals?.due ?? invoice.totals?.total ?? 0;
  const fmt = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Send Invoice
              </h2>
              <p className="text-xs text-gray-400">
                {invoice.jobCardNumber} · {fmt(amountDue)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Payment link */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Payment Link
            </label>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <Link className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="flex-1 text-xs text-blue-700 truncate font-mono">
                {paymentUrl}
              </span>
              <button
                onClick={async () => {
                  await handleActivateLink();
                  handleCopy();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Share this link via WhatsApp, SMS, or email. Customer pays without
              logging in.
            </p>
          </div>

          {/* Preview link */}
          <button
            onClick={async () => {
              await handleActivateLink();
              window.open(paymentUrl, "_blank");
            }}
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview payment page
          </button>

          {/* Email body editor */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Email Message
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={8}
              className="w-full text-xs text-gray-700 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Editable — will open your default email app
            </p>
          </div>

          {/* Customer email display */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">To:</span>
            <span className="font-medium text-gray-900">
              {invoice.customer?.email || "No email on file"}
            </span>
          </div>

          {!invoice.customer?.email && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">
              ⚠ No email address saved for this customer. Copy the payment link
              and send it manually via WhatsApp or SMS.
            </p>
          )}

          {sent && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
              <CheckCircle className="w-4 h-4" />
              Invoice sent! Payment link is now active.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSendEmail}
            disabled={sending || !invoice.customer?.email}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send via Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Default email template ────────────────────────────────────────────────
function buildDefaultEmail(invoice, businessInfo) {
  const biz = businessInfo?.businessName || "Us";
  const amount = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(invoice.totals?.due ?? invoice.totals?.total ?? 0);
  const payUrl = getPaymentPageUrl(invoice.id);
  const vehicle =
    [invoice.vehicle?.year, invoice.vehicle?.make, invoice.vehicle?.model]
      .filter(Boolean)
      .join(" ") || "your vehicle";

  return `Hi ${invoice.customer?.name || "there"},

Please find your ${invoice.documentType === "quote" ? "quote" : "invoice"} ${invoice.jobCardNumber} from ${biz} for ${vehicle}.

Amount Due: ${amount}

Pay securely online:
${payUrl}

Accepted: Credit/Debit Card, Instant EFT

If you have any questions, please don't hesitate to contact us.

Thank you for your business.

${biz}
${businessInfo?.primaryPhone || ""}`;
}
