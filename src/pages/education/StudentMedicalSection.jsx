// src/components/education/StudentMedicalSection.jsx
// Add this section inside your existing StudentModal.
// It saves medical info to the student's Firestore document.
//
// Usage inside StudentModal (replace or extend your existing form):
//   import StudentMedicalSection from './StudentMedicalSection';
//   <StudentMedicalSection data={medicalData} onChange={setMedicalData} />
//
// Then include medicalInfo in your student save payload.

import React, { useState } from "react";
import {
  Heart,
  AlertCircle,
  Pill,
  Phone,
  User,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";

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

const inputCls = {
  width: "100%",
  height: 34,
  padding: "0 10px",
  border: `1.5px solid ${Z.border}`,
  borderRadius: 7,
  fontSize: 13,
  color: Z.ink,
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
};

const labelCls = {
  fontSize: 10,
  fontWeight: 700,
  color: Z.soft,
  textTransform: "uppercase",
  letterSpacing: ".07em",
  display: "block",
  marginBottom: 5,
};

// ── Allergy badge list ────────────────────────────────────────────────────────
const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Dairy",
  "Eggs",
  "Gluten",
  "Shellfish",
  "Soy",
  "Bee Stings",
  "Penicillin",
  "Latex",
  "Dust",
  "Pollen",
  "Animal Fur",
];

const AllergyPicker = ({ selected = [], onChange }) => {
  const [custom, setCustom] = useState("");

  const toggle = (a) => {
    const next = selected.includes(a)
      ? selected.filter((x) => x !== a)
      : [...selected, a];
    onChange(next);
  };

  const addCustom = () => {
    if (!custom.trim()) return;
    if (!selected.includes(custom.trim()))
      onChange([...selected, custom.trim()]);
    setCustom("");
  };

  return (
    <div>
      {/* Preset chips */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}
      >
        {COMMON_ALLERGIES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => toggle(a)}
            style={{
              padding: "3px 11px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 600,
              border: `1.5px solid ${selected.includes(a) ? Z.red : Z.border}`,
              background: selected.includes(a) ? Z.redL : "#fff",
              color: selected.includes(a) ? Z.red : Z.mid,
              cursor: "pointer",
            }}
          >
            {selected.includes(a) ? "✓ " : ""}
            {a}
          </button>
        ))}
      </div>

      {/* Custom allergy input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Add other allergy..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addCustom())
          }
          style={{ ...inputCls, flex: 1 }}
        />
        <button
          type="button"
          onClick={addCustom}
          style={{
            height: 34,
            padding: "0 14px",
            borderRadius: 7,
            background: Z.red,
            color: "#fff",
            border: "none",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {/* Selected list */}
      {selected.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}
        >
          {selected.map((a) => (
            <span
              key={a}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                background: Z.redL,
                color: Z.red,
              }}
            >
              {a}
              <button
                type="button"
                onClick={() => toggle(a)}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: Z.red,
                  padding: 0,
                }}
              >
                <X style={{ width: 10, height: 10 }} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Medication row ────────────────────────────────────────────────────────────
const MedicationRow = ({ med, onRemove }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      background: Z.amberL,
      borderRadius: 8,
      marginBottom: 6,
      border: `1px solid ${Z.amber}33`,
    }}
  >
    <Pill style={{ width: 14, height: 14, color: Z.amber, flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: Z.ink }}>
        {med.name}
      </div>
      {med.dose && (
        <div style={{ fontSize: 11, color: Z.mid }}>
          {med.dose}
          {med.time ? ` · ${med.time}` : ""}
        </div>
      )}
      {med.notes && (
        <div style={{ fontSize: 11, color: Z.soft }}>{med.notes}</div>
      )}
    </div>
    <button
      type="button"
      onClick={onRemove}
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: Z.soft,
      }}
    >
      <X style={{ width: 12, height: 12 }} />
    </button>
  </div>
);

// ── Emergency contact row ─────────────────────────────────────────────────────
const ContactRow = ({ contact, index, onChange, onRemove }) => (
  <div
    style={{
      background: Z.bg,
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 10,
      border: `1px solid ${Z.border}`,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: Z.soft }}>
        EMERGENCY CONTACT {index + 1}
      </div>
      {index > 0 && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: Z.redL,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: Z.red,
          }}
        >
          <X style={{ width: 12, height: 12 }} />
        </button>
      )}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {[
        {
          key: "name",
          label: "Full Name",
          placeholder: "e.g. Nomvula Dlamini",
        },
        {
          key: "relationship",
          label: "Relationship",
          placeholder: "e.g. Mother, Uncle",
        },
        {
          key: "phone",
          label: "Phone Number",
          placeholder: "e.g. 071 234 5678",
        },
        { key: "altPhone", label: "Alt Phone", placeholder: "Optional" },
      ].map(({ key, label, placeholder }) => (
        <div key={key}>
          <label style={labelCls}>{label}</label>
          <input
            type="text"
            placeholder={placeholder}
            value={contact[key] || ""}
            onChange={(e) => onChange({ ...contact, [key]: e.target.value })}
            style={inputCls}
          />
        </div>
      ))}
    </div>
  </div>
);

// ── Main section ──────────────────────────────────────────────────────────────
const StudentMedicalSection = ({ data = {}, onChange }) => {
  const [expanded, setExpanded] = useState(true);
  const [newMed, setNewMed] = useState({
    name: "",
    dose: "",
    time: "",
    notes: "",
  });
  const [showMedForm, setShowMedForm] = useState(false);

  const update = (patch) => onChange({ ...data, ...patch });

  const contacts = data.emergencyContacts || [
    { name: "", relationship: "", phone: "", altPhone: "" },
  ];
  const setContacts = (c) => update({ emergencyContacts: c });

  const meds = data.medications || [];
  const setMeds = (m) => update({ medications: m });

  const allergies = data.allergies || [];
  const setAllergies = (a) => update({ allergies: a });

  const addMed = () => {
    if (!newMed.name) return;
    setMeds([...meds, { ...newMed }]);
    setNewMed({ name: "", dose: "", time: "", notes: "" });
    setShowMedForm(false);
  };

  const hasMedical = allergies.length > 0 || meds.length > 0 || data.conditions;

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${hasMedical ? Z.red + "55" : Z.border}`,
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: hasMedical ? Z.redL : Z.bg,
          borderBottom: `1px solid ${Z.border}`,
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: hasMedical ? Z.red + "22" : Z.blue + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield
              style={{
                width: 14,
                height: 14,
                color: hasMedical ? Z.red : Z.blue,
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: Z.ink }}>
              Medical & Emergency Info
            </div>
            {hasMedical && (
              <div style={{ fontSize: 10, color: Z.red, fontWeight: 700 }}>
                ⚠️ Medical information on file
              </div>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp style={{ width: 16, height: 16, color: Z.soft }} />
        ) : (
          <ChevronDown style={{ width: 16, height: 16, color: Z.soft }} />
        )}
      </div>

      {expanded && (
        <div style={{ padding: "16px" }}>
          {/* ── Blood type + Dr ─────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <label style={labelCls}>Blood Type</label>
              <select
                value={data.bloodType || ""}
                onChange={(e) => update({ bloodType: e.target.value })}
                style={inputCls}
              >
                <option value="">Unknown</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelCls}>Doctor / Clinic</label>
              <input
                type="text"
                placeholder="Dr Smith / Mediclinic"
                value={data.doctor || ""}
                onChange={(e) => update({ doctor: e.target.value })}
                style={inputCls}
              />
            </div>
            <div>
              <label style={labelCls}>Doctor Phone</label>
              <input
                type="tel"
                placeholder="011 234 5678"
                value={data.doctorPhone || ""}
                onChange={(e) => update({ doctorPhone: e.target.value })}
                style={inputCls}
              />
            </div>
          </div>

          {/* ── Medical conditions ──────────────────────────────────────── */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelCls}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Heart style={{ width: 11, height: 11 }} />
                Medical Conditions / Diagnoses
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Asthma (uses Ventolin), ADHD (on medication), Type 1 Diabetes..."
              value={data.conditions || ""}
              onChange={(e) => update({ conditions: e.target.value })}
              style={{
                ...inputCls,
                height: "auto",
                padding: "8px 10px",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* ── Allergies ───────────────────────────────────────────────── */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelCls}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <AlertCircle style={{ width: 11, height: 11 }} />
                Allergies
              </span>
            </label>
            <AllergyPicker selected={allergies} onChange={setAllergies} />
          </div>

          {/* ── Medications ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <label style={{ ...labelCls, marginBottom: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Pill style={{ width: 11, height: 11 }} />
                  Daily Medications
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowMedForm(!showMedForm)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 7,
                  background: Z.amberL,
                  color: Z.amber,
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus style={{ width: 11, height: 11 }} />
                Add
              </button>
            </div>

            {meds.map((m, i) => (
              <MedicationRow
                key={i}
                med={m}
                onRemove={() => setMeds(meds.filter((_, j) => j !== i))}
              />
            ))}

            {showMedForm && (
              <div
                style={{
                  background: Z.amberL,
                  borderRadius: 10,
                  padding: "12px 14px",
                  border: `1px solid ${Z.amber}33`,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  {[
                    {
                      key: "name",
                      label: "Medication Name *",
                      placeholder: "e.g. Ritalin, Ventolin",
                    },
                    { key: "dose", label: "Dose", placeholder: "e.g. 10mg" },
                    {
                      key: "time",
                      label: "Time(s)",
                      placeholder: "e.g. Morning, Lunchtime",
                    },
                    {
                      key: "notes",
                      label: "Notes",
                      placeholder: "e.g. Keep in fridge",
                    },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={labelCls}>{label}</label>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={newMed[key] || ""}
                        onChange={(e) =>
                          setNewMed({ ...newMed, [key]: e.target.value })
                        }
                        style={inputCls}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={addMed}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      background: Z.amber,
                      color: "#fff",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Save Medication
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMedForm(false)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 7,
                      background: "#fff",
                      color: Z.soft,
                      border: `1px solid ${Z.border}`,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Special dietary needs ───────────────────────────────────── */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelCls}>Special Dietary Requirements</label>
            <input
              type="text"
              placeholder="e.g. Halaal, Kosher, Vegan, No nuts, Lactose-free"
              value={data.dietary || ""}
              onChange={(e) => update({ dietary: e.target.value })}
              style={inputCls}
            />
          </div>

          {/* ── Emergency contacts ──────────────────────────────────────── */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <label style={{ ...labelCls, marginBottom: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Phone style={{ width: 11, height: 11 }} />
                  Emergency Contacts
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setContacts([
                    ...contacts,
                    { name: "", relationship: "", phone: "", altPhone: "" },
                  ])
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 7,
                  background: Z.blueL,
                  color: Z.blue,
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus style={{ width: 11, height: 11 }} />
                Add Contact
              </button>
            </div>

            {contacts.map((c, i) => (
              <ContactRow
                key={i}
                contact={c}
                index={i}
                onChange={(updated) => {
                  const next = [...contacts];
                  next[i] = updated;
                  setContacts(next);
                }}
                onRemove={() => setContacts(contacts.filter((_, j) => j !== i))}
              />
            ))}
          </div>

          {/* ── Additional notes ────────────────────────────────────────── */}
          <div>
            <label style={labelCls}>Additional Medical Notes</label>
            <textarea
              rows={3}
              placeholder="Any other important health information staff should know..."
              value={data.additionalNotes || ""}
              onChange={(e) => update({ additionalNotes: e.target.value })}
              style={{
                ...inputCls,
                height: "auto",
                padding: "8px 10px",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Compact allergy badge for attendance screen ───────────────────────────────
// Usage: <MedicalAlert student={student} />
export const MedicalAlert = ({ student }) => {
  const info = student?.medicalInfo || student;
  const allergies = info?.allergies || [];
  const conditions = info?.conditions || "";
  const meds = info?.medications || [];

  if (!allergies.length && !conditions && !meds.length) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 99,
        fontSize: 10,
        background: "#fee2e2",
        color: "#dc2626",
        fontWeight: 700,
        border: "1px solid #fca5a5",
      }}
      title={[
        allergies.length ? `Allergies: ${allergies.join(", ")}` : "",
        conditions ? `Conditions: ${conditions}` : "",
        meds.length ? `Meds: ${meds.map((m) => m.name).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | ")}
    >
      <AlertCircle style={{ width: 9, height: 9 }} />
      Medical
    </div>
  );
};

export default StudentMedicalSection;
