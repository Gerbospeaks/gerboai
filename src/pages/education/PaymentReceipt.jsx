// src/components/education/PaymentReceipt.jsx
// Shows a printable receipt modal + WhatsApp PDF share
// Usage: <PaymentReceipt open={open} onClose={onClose} payment={payment} businessInfo={businessInfo} />

import React, { useRef } from "react";
import { X, Printer, Send, CheckCircle, Download } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `R${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

const today = () =>
  new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// ── Receipt document (print-ready) ───────────────────────────────────────────
const ReceiptDoc = React.forwardRef(({ payment, businessInfo }, ref) => {
  const {
    receiptNumber = "RCP-000001",
    studentName = "",
    amount = 0,
    method = "cash",
    term = "Term 1",
    notes = "",
    createdAt,
  } = payment || {};

  const dateStr = createdAt?.toDate
    ? createdAt.toDate().toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : today();

  const methodLabel =
    {
      cash: "Cash",
      eft: "EFT / Bank Transfer",
      card: "Card",
      "stop-order": "Stop Order",
    }[method] || method;

  return (
    <div
      ref={ref}
      id="receipt-print-area"
      style={{
        width: 520,
        background: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        padding: "36px 40px",
        color: "#1a2133",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "2px solid #f0f3f9",
        }}
      >
        <div>
          {businessInfo?.logoUrl && (
            <img
              src={businessInfo.logoUrl}
              alt="logo"
              style={{ height: 44, marginBottom: 8, objectFit: "contain" }}
            />
          )}
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
            {businessInfo?.businessName || businessInfo?.name || "SCHOOL"}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {businessInfo?.addressLine1}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {businessInfo?.city} {businessInfo?.postalCode}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {businessInfo?.primaryPhone}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#dcfce7",
              color: "#16a34a",
              padding: "4px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            <CheckCircle style={{ width: 13, height: 13 }} />
            PAYMENT RECEIVED
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.5px",
            }}
          >
            RECEIPT
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {receiptNumber}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 24px",
          marginBottom: 24,
        }}
      >
        {[
          { label: "Issued To", value: studentName },
          { label: "Date", value: dateStr },
          { label: "Term / Period", value: term },
          { label: "Payment Method", value: methodLabel },
        ].map(({ label, value }) => (
          <div key={label}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 3,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Amount box */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 4,
            }}
          >
            Amount Paid
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-1px",
            }}
          >
            {fmt(amount)}
          </div>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle style={{ width: 28, height: 28, color: "#fff" }} />
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "#475569",
            marginBottom: 20,
          }}
        >
          <span style={{ fontWeight: 700, color: "#64748b" }}>Notes: </span>
          {notes}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: "1px dashed #e2e8f0",
          paddingTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 10, color: "#94a3b8" }}>
          This is an official payment receipt.
          <br />
          Please retain for your records.
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#94a3b8",
            textAlign: "right",
          }}
        >
          Issued by {businessInfo?.principalName || "School Admin"}
          <br />
          {dateStr}
        </div>
      </div>
    </div>
  );
});

// ── Modal shell ───────────────────────────────────────────────────────────────
const PaymentReceipt = ({ open, onClose, payment, businessInfo }) => {
  const printRef = useRef();

  if (!open || !payment) return null;

  // ── Print ────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const style = document.createElement("style");
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #receipt-print-area, #receipt-print-area * { visibility: visible !important; }
        #receipt-print-area {
          position: absolute !important; left: 0 !important; top: 0 !important;
          width: 100% !important; padding: 20mm !important;
        }
        @page { size: A5 portrait; margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1200);
  };

  // ── WhatsApp share ───────────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `🏫 *${businessInfo?.businessName || businessInfo?.name || "School"} — Payment Receipt*\n\n` +
        `📋 Receipt No: *${payment.receiptNumber}*\n` +
        `👤 Student: *${payment.studentName}*\n` +
        `💳 Amount Paid: *R${Number(payment.amount).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}*\n` +
        `🗓️ Term: ${payment.term}\n` +
        `💵 Method: ${payment.method?.toUpperCase()}\n` +
        `📅 Date: ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}\n\n` +
        `_Thank you for your payment! Please retain this message as your receipt._\n` +
        `_${businessInfo?.primaryPhone || ""}_`,
    );

    // If parent phone is on the payment object, send direct
    if (payment.parentPhone) {
      const cleaned = payment.parentPhone
        .replace(/\s+/g, "")
        .replace(/-/g, "")
        .replace(/^\+/, "")
        .replace(/^0/, "27");
      window.open(`https://wa.me/${cleaned}?text=${msg}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${msg}`, "_blank");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#f8fafc",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
            Payment Receipt
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Printer style={{ width: 14, height: 14 }} />
              Print
            </button>
            <button
              onClick={handleWhatsApp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                background: "#16a34a",
                color: "#fff",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg
                style={{ width: 14, height: 14 }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.549 4.107 1.51 5.84L.057 23.902a.75.75 0 00.956.899l6.305-1.647A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.962-1.357l-.356-.211-3.688.964.981-3.595-.232-.37A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
              </svg>
              WhatsApp Receipt
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#f1f5f9",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Receipt preview */}
        <div style={{ padding: 16 }}>
          <ReceiptDoc
            ref={printRef}
            payment={payment}
            businessInfo={businessInfo}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
