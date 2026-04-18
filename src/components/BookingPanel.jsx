import { useState } from "react";

const T = { border: "#e2e8f0", textPri: "#0f172a", textMid: "#475569", red: "#dc2626", green: "#16a34a" };

function getLabel(id) {
  const INDUSTRIES = [
    { id: "mechanics", label: "Mechanical" }, { id: "electrical", label: "Electrical" },
    { id: "plumbing", label: "Plumbing" }, { id: "carpentry", label: "Carpentry" },
    // add others as needed
  ];
  return (INDUSTRIES.find((i) => i.id === id) || { label: id }).label;
}

export default function BookingPanel({ provider, onClose, onSubmit }) {
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("09:00");
  const [address, setAddress] = useState("");
  const [desc, setDesc]       = useState("");
  const [urgency, setUrgency] = useState("Standard (2-3 days)");
  const [doc, setDoc]         = useState("None");
  const [err, setErr]         = useState("");

  const inp = {
    fontSize: 13, padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, background: "#fff",
    color: T.textPri, width: "100%", outline: "none",
    fontFamily: "'Lato', sans-serif", boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 11, fontWeight: 700, color: T.textMid,
    textTransform: "uppercase", letterSpacing: ".05em",
    display: "block", marginBottom: 5,
  };

  return (
    <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20, boxShadow: "0 4px 24px rgba(15,23,42,.08)" }}>
      <div style={{ background: "#0f172a", padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Book — {provider.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{getLabel(provider.industry)} · {provider.loc || provider.location}</div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>{provider.rate}</span>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Service date</label>
            <input type="date" style={inp} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Preferred time</label>
            <input type="time" style={inp} value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Service address</label>
          <input type="text" style={inp} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your property or site address" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Describe what you need</label>
          <textarea style={{ ...inp, resize: "vertical", minHeight: 72 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={provider.about} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Urgency</label>
            <select style={inp} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option>Standard (2-3 days)</option>
              <option>Urgent (today/tomorrow)</option>
              <option>Flexible (within a week)</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Attach to document</label>
            <select style={inp} value={doc} onChange={(e) => setDoc(e.target.value)}>
              <option>None</option>
              <option>Current quote</option>
              <option>Current invoice</option>
              <option>New purchase order</option>
            </select>
          </div>
        </div>
        {err && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 8, background: "#f8fafc", color: T.textMid, border: `1px solid ${T.border}`, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!date || !desc.trim()) { setErr("Please fill in the date and describe what you need."); return; }
              onSubmit(provider, { date, time, address, desc, urgency, doc });
            }}
            style={{ flex: 1, fontSize: 13, fontWeight: 700, padding: 10, borderRadius: 8, background: T.green, color: "#fff", border: "none", cursor: "pointer" }}
          >
            Send Booking Request
          </button>
        </div>
      </div>
    </div>
  );
}