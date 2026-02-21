import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ─── Firebase Config ───────────────────────────────────────────────────────────
// Use the SAME config as your dashboard
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Prevent re-initializing if already done (e.g. if used inside same React app)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// ─── YOUR Doctor/Practice UID from Firebase Auth ───────────────────────────────
const DOCTOR_USER_ID = "YOUR_UID_FROM_FIREBASE_AUTH";

// ─── Appointment Types ─────────────────────────────────────────────────────────
const APPOINTMENT_TYPES = [
  {
    value: "consultation",
    label: "Consultation",
    icon: "🩺",
    desc: "First-time or general visit",
  },
  {
    value: "follow-up",
    label: "Follow-up",
    icon: "🔄",
    desc: "Continuing care visit",
  },
  {
    value: "checkup",
    label: "Check-up",
    icon: "✅",
    desc: "Routine wellness exam",
  },
  {
    value: "procedure",
    label: "Procedure",
    icon: "⚕️",
    desc: "Scheduled procedure",
  },
];

const DURATIONS = ["15", "30", "45", "60", "90"];

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        marginBottom: "2.5rem",
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < total - 1 ? 1 : "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: done
                  ? "#1a1a2e"
                  : active
                    ? "#e63946"
                    : "transparent",
                border: done || active ? "none" : "2px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Mono', monospace",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                color: done || active ? "#fff" : "#999",
                transition: "all 0.3s ease",
              }}
            >
              {done ? "✓" : stepNum}
            </div>
            {i < total - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: done ? "#1a1a2e" : "#e5e5e5",
                  transition: "background 0.3s ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Booking Form ─────────────────────────────────────────────────────────
export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    date: "",
    time: "",
    duration: "30",
    type: "consultation",
    notes: "",
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.patientName.trim()) e.patientName = "Name is required";
      if (!form.patientPhone.trim()) e.patientPhone = "Phone is required";
      if (form.patientEmail && !/\S+@\S+\.\S+/.test(form.patientEmail))
        e.patientEmail = "Invalid email address";
    }
    if (s === 2) {
      if (!form.date) e.date = "Please select a date";
      if (!form.time) e.time = "Please select a time";
      if (
        form.date &&
        new Date(form.date) < new Date(new Date().toDateString())
      )
        e.date = "Date must be in the future";
    }
    return e;
  };

  const nextStep = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate(3);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "users", DOCTOR_USER_ID, "aiAppointments"), {
        ...form,
        status: "scheduled",
        source: "website",
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setErrors({
        submit: "Booking failed. Please try again or call us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      date: "",
      time: "",
      duration: "30",
      type: "consultation",
      notes: "",
    });
    setStep(1);
    setSuccess(false);
    setErrors({});
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle = (field) => ({
    width: "100%",
    padding: "0.85rem 1rem",
    border: `2px solid ${errors[field] ? "#e63946" : "#e5e5e5"}`,
    borderRadius: 10,
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    background: "#fafafa",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    color: "#1a1a2e",
  });

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#555",
    marginBottom: 6,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const errorStyle = {
    color: "#e63946",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "'DM Sans', sans-serif",
  };

  const btnPrimary = {
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    padding: "0.9rem 2rem",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const btnSecondary = {
    background: "transparent",
    color: "#555",
    border: "2px solid #e5e5e5",
    padding: "0.9rem 2rem",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  // ── Today's date for min attribute ────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];

  // ── Confirm summary helpers ───────────────────────────────────────────────
  const selectedType = APPOINTMENT_TYPES.find((t) => t.value === form.type);
  const formatDate = (d) =>
    d
      ? new Date(d + "T00:00").toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus {
          border-color: #e63946 !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(230,57,70,0.08);
        }
        .type-card:hover { border-color: #1a1a2e !important; transform: translateY(-2px); }
        .type-card.selected { border-color: #1a1a2e !important; background: #1a1a2e !important; }
        .type-card.selected * { color: #fff !important; }
        .btn-primary:hover { background: #e63946 !important; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(230,57,70,0.25); }
        .btn-secondary:hover { border-color: #999 !important; color: #1a1a2e !important; }
        .time-btn { padding: 0.65rem 1rem; border: 2px solid #e5e5e5; border-radius: 8px; background: #fafafa; font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 600; color: #555; cursor: pointer; transition: all 0.15s; }
        .time-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
        .time-btn.active { background: #1a1a2e; border-color: #1a1a2e; color: #fff; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8f8f6 0%, #f0ede8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Brand Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#1a1a2e",
                color: "#fff",
                padding: "0.5rem 1.25rem",
                borderRadius: 100,
                fontSize: 13,
                fontFamily: "'DM Mono', monospace",
                fontWeight: 600,
                letterSpacing: "0.08em",
                marginBottom: "1.25rem",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#e63946" }}>●</span> Online Booking
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 2.75rem)",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: 0,
                lineHeight: 1.15,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Book Your
              <br />
              <span style={{ color: "#e63946" }}>Appointment</span>
            </h1>
            <p style={{ color: "#777", marginTop: "0.75rem", fontSize: 16 }}>
              Quick, easy scheduling — we'll confirm within 24 hours.
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              padding: "clamp(1.5rem, 5vw, 2.5rem)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* ── SUCCESS STATE ─────────────────────────────────────────── */}
            {success ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1a1a2e, #e63946)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                    margin: "0 auto 1.5rem",
                    boxShadow: "0 8px 24px rgba(230,57,70,0.3)",
                  }}
                >
                  ✓
                </div>
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: 12,
                  }}
                >
                  Booking Received!
                </h2>
                <p
                  style={{
                    color: "#777",
                    fontSize: 16,
                    lineHeight: 1.6,
                    maxWidth: 360,
                    margin: "0 auto 2rem",
                  }}
                >
                  Thank you, <strong>{form.patientName}</strong>. We've received
                  your request for <strong>{formatDate(form.date)}</strong> at{" "}
                  <strong>{formatTime(form.time)}</strong>. We'll confirm
                  shortly.
                </p>
                <div
                  style={{
                    background: "#f8f8f6",
                    borderRadius: 12,
                    padding: "1.25rem",
                    marginBottom: "1.5rem",
                    textAlign: "left",
                    border: "1px solid #eee",
                  }}
                >
                  {[
                    ["📅 Date", formatDate(form.date)],
                    ["🕐 Time", formatTime(form.time)],
                    ["⚕️ Type", selectedType?.label],
                    ["⏱ Duration", `${form.duration} minutes`],
                    ["📞 Contact", form.patientPhone],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.4rem 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <span style={{ color: "#999", fontSize: 14 }}>
                        {label}
                      </span>
                      <span
                        style={{
                          color: "#1a1a2e",
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={reset}
                  className="btn-primary"
                  style={btnPrimary}
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <>
                <StepIndicator current={step} total={3} />

                {/* ── STEP 1: Patient Info ───────────────────────────────── */}
                {step === 1 && (
                  <div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1a1a2e",
                        marginTop: 0,
                        marginBottom: 6,
                      }}
                    >
                      Your Details
                    </h3>
                    <p
                      style={{
                        color: "#999",
                        fontSize: 14,
                        marginBottom: "1.75rem",
                      }}
                    >
                      Let us know who you are so we can personalise your visit.
                    </p>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Jane Smith"
                        value={form.patientName}
                        onChange={set("patientName")}
                        style={inputStyle("patientName")}
                      />
                      {errors.patientName && (
                        <p style={errorStyle}>{errors.patientName}</p>
                      )}
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="+27 82 000 0000"
                        value={form.patientPhone}
                        onChange={set("patientPhone")}
                        style={inputStyle("patientPhone")}
                      />
                      {errors.patientPhone && (
                        <p style={errorStyle}>{errors.patientPhone}</p>
                      )}
                    </div>

                    <div style={{ marginBottom: "2rem" }}>
                      <label style={labelStyle}>
                        Email Address{" "}
                        <span style={{ color: "#bbb", fontWeight: 400 }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="email"
                        placeholder="jane@example.com"
                        value={form.patientEmail}
                        onChange={set("patientEmail")}
                        style={inputStyle("patientEmail")}
                      />
                      {errors.patientEmail && (
                        <p style={errorStyle}>{errors.patientEmail}</p>
                      )}
                    </div>

                    <button
                      onClick={nextStep}
                      className="btn-primary"
                      style={{
                        ...btnPrimary,
                        width: "100%",
                        justifyContent: "center",
                      }}
                    >
                      Continue →
                    </button>
                  </div>
                )}

                {/* ── STEP 2: Date & Type ───────────────────────────────── */}
                {step === 2 && (
                  <div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1a1a2e",
                        marginTop: 0,
                        marginBottom: 6,
                      }}
                    >
                      Date & Visit Type
                    </h3>
                    <p
                      style={{
                        color: "#999",
                        fontSize: 14,
                        marginBottom: "1.75rem",
                      }}
                    >
                      Choose when you'd like to come in and what kind of visit
                      you need.
                    </p>

                    {/* Appointment Type Cards */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={labelStyle}>Appointment Type</label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 10,
                        }}
                      >
                        {APPOINTMENT_TYPES.map((t) => (
                          <div
                            key={t.value}
                            className={`type-card${form.type === t.value ? " selected" : ""}`}
                            onClick={() =>
                              setForm((p) => ({ ...p, type: t.value }))
                            }
                            style={{
                              border: "2px solid #e5e5e5",
                              borderRadius: 12,
                              padding: "1rem",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            <div style={{ fontSize: 22, marginBottom: 4 }}>
                              {t.icon}
                            </div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#1a1a2e",
                              }}
                            >
                              {t.label}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#999",
                                marginTop: 2,
                              }}
                            >
                              {t.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Preferred Date *</label>
                      <input
                        type="date"
                        min={todayStr}
                        value={form.date}
                        onChange={set("date")}
                        style={inputStyle("date")}
                      />
                      {errors.date && <p style={errorStyle}>{errors.date}</p>}
                    </div>

                    {/* Time */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Preferred Time *</label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        {[
                          "08:00",
                          "09:00",
                          "10:00",
                          "11:00",
                          "13:00",
                          "14:00",
                          "15:00",
                          "16:00",
                        ].map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`time-btn${form.time === t ? " active" : ""}`}
                            onClick={() => setForm((p) => ({ ...p, time: t }))}
                          >
                            {formatTime(t)}
                          </button>
                        ))}
                      </div>
                      <input
                        type="time"
                        value={form.time}
                        onChange={set("time")}
                        style={{ ...inputStyle("time"), fontSize: 14 }}
                      />
                      {errors.time && <p style={errorStyle}>{errors.time}</p>}
                    </div>

                    {/* Duration */}
                    <div style={{ marginBottom: "2rem" }}>
                      <label style={labelStyle}>Duration</label>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {DURATIONS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={`time-btn${form.duration === d ? " active" : ""}`}
                            onClick={() =>
                              setForm((p) => ({ ...p, duration: d }))
                            }
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={() => setStep(1)}
                        className="btn-secondary"
                        style={btnSecondary}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={nextStep}
                        className="btn-primary"
                        style={{
                          ...btnPrimary,
                          flex: 1,
                          justifyContent: "center",
                        }}
                      >
                        Review Booking →
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Confirm ───────────────────────────────────── */}
                {step === 3 && (
                  <div>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#1a1a2e",
                        marginTop: 0,
                        marginBottom: 6,
                      }}
                    >
                      Confirm Booking
                    </h3>
                    <p
                      style={{
                        color: "#999",
                        fontSize: 14,
                        marginBottom: "1.75rem",
                      }}
                    >
                      Double-check your details before submitting.
                    </p>

                    {/* Summary Card */}
                    <div
                      style={{
                        background: "#f8f8f6",
                        borderRadius: 14,
                        padding: "1.5rem",
                        marginBottom: "1.5rem",
                        border: "1px solid #eee",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: "1.25rem",
                          paddingBottom: "1.25rem",
                          borderBottom: "1px solid #e5e5e5",
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "#1a1a2e",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                          }}
                        >
                          {selectedType?.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 16,
                              color: "#1a1a2e",
                            }}
                          >
                            {form.patientName}
                          </div>
                          <div style={{ color: "#999", fontSize: 14 }}>
                            {selectedType?.label}
                          </div>
                        </div>
                      </div>

                      {[
                        ["📅 Date", formatDate(form.date)],
                        ["🕐 Time", formatTime(form.time)],
                        ["⏱ Duration", `${form.duration} minutes`],
                        ["📞 Phone", form.patientPhone],
                        ...(form.patientEmail
                          ? [["✉️ Email", form.patientEmail]]
                          : []),
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.5rem 0",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          <span style={{ color: "#999", fontSize: 14 }}>
                            {label}
                          </span>
                          <span
                            style={{
                              color: "#1a1a2e",
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <label style={labelStyle}>
                        Additional Notes{" "}
                        <span style={{ color: "#bbb", fontWeight: 400 }}>
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={set("notes")}
                        rows={3}
                        placeholder="Any symptoms, concerns, or info we should know..."
                        style={{
                          ...inputStyle("notes"),
                          resize: "vertical",
                          lineHeight: 1.6,
                        }}
                      />
                    </div>

                    {errors.submit && (
                      <div
                        style={{
                          background: "#fff5f5",
                          border: "1px solid #fca5a5",
                          borderRadius: 10,
                          padding: "0.85rem 1rem",
                          marginBottom: "1.25rem",
                          color: "#e63946",
                          fontSize: 14,
                        }}
                      >
                        ⚠️ {errors.submit}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        onClick={() => setStep(2)}
                        className="btn-secondary"
                        style={btnSecondary}
                        disabled={loading}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={loading}
                        style={{
                          ...btnPrimary,
                          flex: 1,
                          justifyContent: "center",
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? (
                          <>
                            <span
                              style={{
                                display: "inline-block",
                                animation: "spin 1s linear infinite",
                              }}
                            >
                              ⟳
                            </span>
                            Confirming...
                          </>
                        ) : (
                          "Confirm Booking ✓"
                        )}
                      </button>
                    </div>
                    <p
                      style={{
                        textAlign: "center",
                        color: "#bbb",
                        fontSize: 12,
                        marginTop: "1rem",
                      }}
                    >
                      🔒 Your information is secure and private
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              color: "#bbb",
              fontSize: 13,
              marginTop: "1.5rem",
            }}
          >
            Need help? Call us directly or send us a message.
          </p>
        </div>
      </div>
    </>
  );
}
