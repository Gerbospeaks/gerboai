// src/components/education/FeesViewFirebase.jsx
// Replace the existing FeesView in EducationDashboard.jsx with this component.
//
// Props:
//   userId        — from user?.uid
//   businessInfo  — school info for receipt header
//
// Dependencies:
//   useFeesFirebase  (../hooks/useFeesFirebase)
//   PaymentReceipt   (./PaymentReceipt)

import React, { useState } from "react";
import {
  Send,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useFeesFirebase } from "../../hooks/useFeesFirebase";
import PaymentReceipt from "./PaymentReceipt";

// ── Shared style tokens (matches EducationDashboard Z palette) ───────────────
const Z = {
  blue: "#0D6EFD",
  blueL: "#E8F0FE",
  green: "#0F7B3F",
  greenL: "#EBF8F1",
  red: "#C0392B",
  redL: "#FDEEEC",
  amber: "#975A00",
  amberL: "#FEF6E4",
  ink: "#1A2133",
  mid: "#4A5568",
  soft: "#8A97A8",
  border: "#DDE3ED",
  bg: "#F0F3F9",
};

const pill = (status) => {
  const map = {
    paid: { bg: Z.greenL, color: Z.green, label: "Paid" },
    partial: { bg: Z.amberL, color: Z.amber, label: "Partial" },
    unpaid: { bg: Z.redL, color: Z.red, label: "Unpaid" },
  };
  const s = map[status] || map.unpaid;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        display: "inline-block",
      }}
    >
      {s.label}
    </span>
  );
};

const fmt = (n) =>
  `R${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

// ── Record Payment Modal ─────────────────────────────────────────────────────
const RecordPaymentModal = ({ student, onClose, onSave, term }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const remaining = (student?.fees?.total || 0) - (student?.fees?.paid || 0);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await onSave({
        studentId: student.id,
        studentName: student.name || student.firstName + " " + student.lastName,
        parentPhone: student.phone || student.parentPhone || "",
        amount: Number(amount),
        method,
        notes,
        term,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: Z.bg,
            borderBottom: `1px solid ${Z.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: Z.ink }}>
              Record Payment
            </div>
            <div style={{ fontSize: 12, color: Z.soft, marginTop: 2 }}>
              {student?.name || `${student?.firstName} ${student?.lastName}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#f1f5f9",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ width: 15, height: 15, color: Z.mid }} />
          </button>
        </div>

        {/* Balance info */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 20px",
            borderBottom: `1px solid ${Z.border}`,
          }}
        >
          {[
            {
              label: "Total Fees",
              value: fmt(student?.fees?.total),
              color: Z.ink,
            },
            {
              label: "Paid So Far",
              value: fmt(student?.fees?.paid),
              color: Z.green,
            },
            {
              label: "Remaining",
              value: fmt(remaining),
              color: remaining > 0 ? Z.red : Z.green,
            },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: Z.soft,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 3,
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: "16px 20px" }}>
          {/* Quick amount buttons */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: Z.soft,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 6,
              }}
            >
              Quick Amount
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[remaining, 500, 750, 1000, 1500]
                .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                .slice(0, 5)
                .map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1.5px solid ${amount === String(v) ? Z.blue : Z.border}`,
                      background: amount === String(v) ? Z.blueL : "#fff",
                      color: amount === String(v) ? Z.blue : Z.mid,
                      cursor: "pointer",
                    }}
                  >
                    {v === remaining ? `Full (${fmt(v)})` : fmt(v)}
                  </button>
                ))}
            </div>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: Z.soft,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Amount (R) *
            </label>
            <input
              type="number"
              min="1"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                border: `1.5px solid ${Z.border}`,
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 700,
                color: Z.ink,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = Z.blue)}
              onBlur={(e) => (e.target.style.borderColor = Z.border)}
            />
          </div>

          {/* Method */}
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: Z.soft,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{
                width: "100%",
                height: 36,
                padding: "0 10px",
                border: `1.5px solid ${Z.border}`,
                borderRadius: 8,
                fontSize: 13,
                color: Z.ink,
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="cash">Cash</option>
              <option value="eft">EFT / Bank Transfer</option>
              <option value="card">Card</option>
              <option value="stop-order">Stop Order</option>
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: Z.soft,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Partial payment — balance by end of month"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: "100%",
                height: 36,
                padding: "0 12px",
                border: `1.5px solid ${Z.border}`,
                borderRadius: 8,
                fontSize: 13,
                color: Z.ink,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={!amount || Number(amount) <= 0 || saving}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 8,
                background: !amount || saving ? "#94a3b8" : Z.blue,
                color: "#fff",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: !amount ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Check style={{ width: 15, height: 15 }} />
                  Save & Generate Receipt
                </>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 8,
                background: "#f1f5f9",
                color: Z.mid,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Payment history row ───────────────────────────────────────────────────────
const PaymentRow = ({ p, onViewReceipt }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 12px",
      background: "#f8fafc",
      borderRadius: 8,
      marginBottom: 6,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: Z.greenL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <CheckCircle style={{ width: 15, height: 15, color: Z.green }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: Z.ink }}>
        {fmt(p.amount)}
      </div>
      <div style={{ fontSize: 11, color: Z.soft }}>
        {p.method?.toUpperCase()} · {p.term} · {p.receiptNumber}
      </div>
    </div>
    <button
      onClick={() => onViewReceipt(p)}
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: Z.blue,
        background: Z.blueL,
        border: "none",
        padding: "3px 10px",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      Receipt
    </button>
  </div>
);

// ── Main FeesView ─────────────────────────────────────────────────────────────
const FeesViewFirebase = ({ userId, businessInfo }) => {
  const {
    students,
    payments,
    loading,
    totalFees,
    collectedFees,
    recordPayment,
    getStudentPayments,
  } = useFeesFirebase(userId);

  const [feeFilter, setFeeFilter] = useState("all");
  const [payingStudent, setPayingStudent] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [currentTerm] = useState("Term 1");

  const outstanding = Number(totalFees) - Number(collectedFees);
  const filters = ["all", "paid", "partial", "unpaid"];

  const filtered =
    feeFilter === "all"
      ? students
      : students.filter((s) => s.fees?.status === feeFilter);

  // Handle record payment — show receipt after
  const handleRecordPayment = async (data) => {
    const result = await recordPayment(data);
    if (result) {
      setReceiptData({
        ...data,
        receiptNumber: result.receiptNumber,
        parentPhone: data.parentPhone,
        createdAt: { toDate: () => new Date() },
      });
    }
  };

  const studentName = (s) =>
    s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          color: Z.soft,
        }}
      >
        Loading fee data...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Summary cards ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total Collected",
            value: fmt(collectedFees),
            sub: `${Math.round((collectedFees / (totalFees || 1)) * 100)}% of total`,
            color: Z.green,
            bg: Z.greenL,
          },
          {
            label: "Outstanding",
            value: fmt(outstanding),
            sub: `${students.filter((s) => s.fees?.status !== "paid").length} students`,
            color: Z.red,
            bg: Z.redL,
          },
          {
            label: "Fully Paid",
            value: students.filter((s) => s.fees?.status === "paid").length,
            sub: `of ${students.length} students`,
            color: Z.blue,
            bg: Z.blueL,
          },
          {
            label: "Partial Pay",
            value: students.filter((s) => s.fees?.status === "partial").length,
            sub: "awaiting balance",
            color: Z.amber,
            bg: Z.amberL,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#fff",
              border: `1px solid ${Z.border}`,
              borderRadius: 12,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: Z.soft,
                textTransform: "uppercase",
                letterSpacing: ".07em",
                marginBottom: 6,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>
              {s.value}
            </div>
            {totalFees > 0 && s.label === "Total Collected" && (
              <div
                style={{
                  height: 4,
                  background: "#e2e8f0",
                  borderRadius: 99,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.round((collectedFees / totalFees) * 100)}%`,
                    height: "100%",
                    background: Z.green,
                    borderRadius: 99,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            )}
            <div style={{ fontSize: 11, color: Z.soft, marginTop: 4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFeeFilter(f)}
            style={{
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: feeFilter === f ? Z.blue : "#f1f5f9",
              color: feeFilter === f ? "#fff" : Z.mid,
            }}
          >
            {f === "all"
              ? "All Students"
              : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: 6, opacity: 0.7 }}>
              (
              {f === "all"
                ? students.length
                : students.filter((s) => s.fees?.status === f).length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* ── Student rows ───────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${Z.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: Z.soft,
              fontSize: 13,
            }}
          >
            No students in this category.
          </div>
        )}

        {filtered.map((s, i) => {
          const balance = (s.fees?.total || 0) - (s.fees?.paid || 0);
          const name = studentName(s);
          const isExpanded = expandedId === s.id;
          const studentPays = getStudentPayments(s.id);

          return (
            <div
              key={s.id}
              style={{
                borderBottom:
                  i < filtered.length - 1 ? `1px solid ${Z.border}` : "none",
              }}
            >
              {/* Main row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  flexWrap: "wrap",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: `hsl(${(name.charCodeAt(0) * 47) % 360},65%,88%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: `hsl(${(name.charCodeAt(0) * 47) % 360},45%,35%)`,
                  }}
                >
                  {name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Name + grade */}
                <div style={{ flex: "2 1 120px", minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: Z.ink }}>
                    {name}
                  </div>
                  <div style={{ fontSize: 11, color: Z.soft }}>{s.grade}</div>
                </div>

                {/* Fee amounts */}
                <div style={{ flex: "1 1 80px", textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: Z.soft, marginBottom: 1 }}>
                    Paid
                  </div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: Z.green }}
                  >
                    {fmt(s.fees?.paid)}
                  </div>
                </div>
                <div style={{ flex: "1 1 80px", textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: Z.soft, marginBottom: 1 }}>
                    Balance
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: balance > 0 ? Z.red : Z.green,
                    }}
                  >
                    {fmt(balance)}
                  </div>
                </div>

                {/* Status pill */}
                <div style={{ flexShrink: 0 }}>
                  {pill(s.fees?.status || "unpaid")}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {s.fees?.status !== "paid" && (
                    <button
                      onClick={() => setPayingStudent(s)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: Z.blue,
                        color: "#fff",
                        border: "none",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Plus style={{ width: 12, height: 12 }} />
                      Record
                    </button>
                  )}

                  {s.fees?.status !== "paid" && s.phone && (
                    <button
                      onClick={() => {
                        const cleaned = (s.phone || s.parentPhone || "")
                          .replace(/\s+/g, "")
                          .replace(/-/g, "")
                          .replace(/^\+/, "")
                          .replace(/^0/, "27");
                        const msg = encodeURIComponent(
                          `📚 *Fee Reminder — ${name}*\n\n` +
                            `Dear Parent/Guardian,\n\n` +
                            `This is a friendly reminder that a school fee balance of *${fmt(balance)}* is outstanding for ${currentTerm}.\n\n` +
                            `Please arrange payment at your earliest convenience.\n\n` +
                            `_${businessInfo?.businessName || "The School"} — ${businessInfo?.primaryPhone || ""}_`,
                        );
                        window.open(
                          `https://wa.me/${cleaned}?text=${msg}`,
                          "_blank",
                        );
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: "#f1f5f9",
                        color: Z.mid,
                        border: "none",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Send style={{ width: 12, height: 12 }} />
                      Remind
                    </button>
                  )}

                  {/* Expand toggle */}
                  {studentPays.length > 0 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        background: "#f1f5f9",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: Z.soft,
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp style={{ width: 14, height: 14 }} />
                      ) : (
                        <ChevronDown style={{ width: 14, height: 14 }} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded payment history */}
              {isExpanded && studentPays.length > 0 && (
                <div
                  style={{
                    padding: "8px 16px 14px 64px",
                    background: Z.bg,
                    borderTop: `1px solid ${Z.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: Z.soft,
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      marginBottom: 8,
                    }}
                  >
                    Payment History ({studentPays.length})
                  </div>
                  {studentPays.map((p) => (
                    <PaymentRow
                      key={p.id}
                      p={p}
                      onViewReceipt={(pay) =>
                        setReceiptData({
                          ...pay,
                          createdAt: pay.createdAt || {
                            toDate: () => new Date(),
                          },
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Record payment modal ────────────────────────────────────────── */}
      {payingStudent && (
        <RecordPaymentModal
          student={payingStudent}
          term={currentTerm}
          onClose={() => setPayingStudent(null)}
          onSave={handleRecordPayment}
        />
      )}

      {/* ── Receipt modal ───────────────────────────────────────────────── */}
      {receiptData && (
        <PaymentReceipt
          open={!!receiptData}
          onClose={() => setReceiptData(null)}
          payment={receiptData}
          businessInfo={businessInfo}
        />
      )}
    </div>
  );
};

export default FeesViewFirebase;
