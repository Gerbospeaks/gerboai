import React from "react";
import { FileText, Check } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getGradeFromMark = (mark) => {
  const m = Number(mark);
  if (m >= 80) return { code: "7", label: "Outstanding", color: "#15803d" };
  if (m >= 70) return { code: "6", label: "Meritorious", color: "#1d4ed8" };
  if (m >= 60) return { code: "5", label: "Substantial", color: "#0369a1" };
  if (m >= 50) return { code: "4", label: "Adequate", color: "#ca8a04" };
  if (m >= 40) return { code: "3", label: "Moderate", color: "#ea580c" };
  if (m >= 30) return { code: "2", label: "Elementary", color: "#dc2626" };
  return { code: "1", label: "Not Achieved", color: "#991b1b" };
};

const getBarColor = (mark) => {
  const m = Number(mark);
  if (m >= 80) return "#15803d";
  if (m >= 70) return "#1d4ed8";
  if (m >= 60) return "#0369a1";
  if (m >= 50) return "#ca8a04";
  if (m >= 40) return "#ea580c";
  return "#dc2626";
};

const AttendanceRate = ({ present, total }) => {
  if (!total || !present) return "0";
  return ((present / total) * 100).toFixed(1);
};


export const TemplateSelector = ({ user, selectedTemplate, onTemplateChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [purchasedTemplates, setPurchasedTemplates] = React.useState(["classic"]);
  const [loadingTemplates, setLoadingTemplates] = React.useState(true);

  const templateNames = {
    classic: "Foundation Phase (Gr R–3)",
    modern: "Intermediate Phase (Gr 4–6)",
    professional: "Formal Academic",
    colorful: "Early Childhood (Pre-School)",
  };

 
  const templatePurchaseMap = {
    classic: "professional",   
    modern: "modern",         
    professional: "premium",   
    colorful: "course",        
  };

  React.useEffect(() => {
    const loadPurchased = async () => {
      if (!user?.uid) { setLoadingTemplates(false); return; }
      try {
        const { getFirestore, doc, getDoc } = await import("firebase/firestore");
        const db = getFirestore();
        const snap = await getDoc(doc(db, "users", user.uid, "settings", "templates"));
        if (snap.exists()) {
          setPurchasedTemplates(snap.data().purchased || ["professional"]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTemplates(false);
      }
    };
    loadPurchased();
  }, [user]);

  const isUnlocked = (templateId) => {
    const requiredPurchase = templatePurchaseMap[templateId];
    return purchasedTemplates.includes(requiredPurchase);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
      >
        <FileText className="w-4 h-4 text-indigo-600" />
        <span>{templateNames[selectedTemplate] || "Select Template"}</span>
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
            <div className="p-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
                SA Curriculum Templates
              </div>
              {Object.entries(templateNames).map(([id, name]) => {
                const unlocked = isUnlocked(id);
                const isSelected = selectedTemplate === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      if (!unlocked) return; // blocked
                      onTemplateChange(id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-sm transition-colors
                      ${!unlocked ? "opacity-60 cursor-not-allowed bg-gray-50" : "hover:bg-indigo-50 cursor-pointer"}
                      ${isSelected && unlocked ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700"}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {!unlocked && (
                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      <span>{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!unlocked && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          Purchase
                        </span>
                      )}
                      {isSelected && unlocked && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  </button>
                );
              })}
              <div className="px-3 py-2 mt-1 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  🔒 Locked templates require purchase from the{" "}
                  <span className="text-indigo-500 font-medium">Templates</span> section.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── TEMPLATE 1: Foundation Phase (Gr R–3) ────────────────────────────────────
// Clean, warm, child-friendly but still professional. SA green/gold palette.
export const ClassicTemplate = ({
  businessInfo = {},
  reportCardNumber,
  term,
  academicYear,
  studentName,
  studentId,
  gradeLevel,
  dateOfBirth,
  parentName,
  parentPhone,
  parentEmail,
  subjects = [],
  attendanceDays,
  attendancePresent,
  teacherComments,
  calculateAverage,
}) => {
  const safeSubjects = subjects || [];
  const avg = calculateAverage ? calculateAverage() : 0;
  const attRate = AttendanceRate({
    present: attendancePresent,
    total: attendanceDays,
  });

  return (
    <div
      style={{
        fontFamily: "'Georgia', serif",
        background: "#fff",
        color: "#1a1a1a",
        minHeight: "297mm",
      }}
    >
      {/* SA Flag-inspired top bar */}
      <div style={{ display: "flex", height: 8 }}>
        {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
          (c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ),
        )}
      </div>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a3c5e 0%, #0f2540 100%)",
          padding: "28px 36px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark circles */}
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 30,
            top: 20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="logo"
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                  background: "#fff",
                  borderRadius: 10,
                  padding: 4,
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 28, color: "#fff" }}>🏫</span>
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                {businessInfo.businessName || "SCHOOL NAME"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 2,
                }}
              >
                {businessInfo.addressLine1}
                {businessInfo.city ? `, ${businessInfo.city}` : ""}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                Tel: {businessInfo.primaryPhone || "—"}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                background: "#FFB612",
                color: "#1a1a1a",
                padding: "6px 16px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: "bold",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              LEARNER PROGRESS REPORT
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
              Foundation Phase · {gradeLevel || "Grade"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
              {term} · {academicYear}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 36px" }}>
        {/* Learner info strip */}
        <div
          style={{
            background: "#f0f7f4",
            border: "1px solid #c6e0d4",
            borderRadius: 10,
            padding: "14px 20px",
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {[
            { label: "Learner Name", value: studentName },
            { label: "Grade", value: gradeLevel },
            { label: "Student No.", value: studentId },
            { label: "Date of Birth", value: dateOfBirth },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: "#007A4D",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 600 }}>
                {value || "—"}
              </div>
            </div>
          ))}
        </div>

        {/* Parent info */}
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "12px 20px",
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {[
            { label: "Parent / Guardian", value: parentName },
            { label: "Contact Number", value: parentPhone },
            { label: "Email Address", value: parentEmail },
          ].map(({ label, value }) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: "bold",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 12, color: "#374151" }}>
                {value || "—"}
              </div>
            </div>
          ))}
        </div>

        {/* Performance summary bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg,#007A4D,#00a362)",
              borderRadius: 10,
              padding: "14px 18px",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 10,
                opacity: 0.8,
                marginBottom: 4,
                fontWeight: "bold",
                letterSpacing: 0.5,
              }}
            >
              OVERALL AVERAGE
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", lineHeight: 1 }}>
              {avg}%
            </div>
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
              {getGradeFromMark(avg).label}
            </div>
          </div>
          <div
            style={{
              background: "#1a3c5e",
              borderRadius: 10,
              padding: "14px 18px",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 10,
                opacity: 0.8,
                marginBottom: 4,
                fontWeight: "bold",
                letterSpacing: 0.5,
              }}
            >
              ATTENDANCE
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", lineHeight: 1 }}>
              {attRate}%
            </div>
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>
              {attendancePresent}/{attendanceDays} days
            </div>
          </div>
          <div
            style={{
              background: "#FFB612",
              borderRadius: 10,
              padding: "14px 18px",
              color: "#1a1a1a",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: 0.5,
                marginBottom: 4,
                opacity: 0.7,
              }}
            >
              SUBJECTS
            </div>
            <div style={{ fontSize: 32, fontWeight: "bold", lineHeight: 1 }}>
              {safeSubjects.length}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
              Learning areas
            </div>
          </div>
        </div>

        {/* Subjects table */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 4,
                height: 18,
                background: "#007A4D",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: "#1a3c5e",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Academic Performance
            </div>
          </div>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ background: "#1a3c5e" }}>
                {[
                  "Learning Area / Subject",
                  "Mark (%)",
                  "Level",
                  "Achievement",
                  "Comments",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 12px",
                      color: "#fff",
                      textAlign:
                        h === "Mark (%)" || h === "Level" ? "center" : "left",
                      fontWeight: "bold",
                      fontSize: 10,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "16px 12px",
                      color: "#9ca3af",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    No subjects added yet
                  </td>
                </tr>
              ) : (
                safeSubjects.map((s, i) => {
                  const g = getGradeFromMark(s.mark);
                  return (
                    <tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? "#f9fafb" : "#fff",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td style={{ padding: "9px 12px", fontWeight: 600 }}>
                        {s.name}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: getBarColor(s.mark),
                        }}
                      >
                        {s.mark}%
                      </td>
                      <td style={{ padding: "9px 12px", textAlign: "center" }}>
                        <span
                          style={{
                            background: g.color,
                            color: "#fff",
                            borderRadius: 4,
                            padding: "2px 8px",
                            fontWeight: "bold",
                            fontSize: 11,
                          }}
                        >
                          {g.code}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          color: g.color,
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      >
                        {g.label}
                      </td>
                      <td
                        style={{
                          padding: "9px 12px",
                          color: "#6b7280",
                          fontSize: 11,
                        }}
                      >
                        {s.comments || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
              <tr style={{ background: "#1a3c5e" }}>
                <td
                  style={{
                    padding: "9px 12px",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  TOTAL AVERAGE
                </td>
                <td
                  style={{
                    padding: "9px 12px",
                    textAlign: "center",
                    color: "#FFB612",
                    fontWeight: "bold",
                    fontSize: 14,
                  }}
                  colSpan={4}
                >
                  {avg}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Achievement scale legend */}
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: "bold",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Achievement Level Scale (CAPS)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              {
                code: 7,
                label: "Outstanding",
                range: "80–100%",
                color: "#15803d",
              },
              {
                code: 6,
                label: "Meritorious",
                range: "70–79%",
                color: "#1d4ed8",
              },
              {
                code: 5,
                label: "Substantial",
                range: "60–69%",
                color: "#0369a1",
              },
              { code: 4, label: "Adequate", range: "50–59%", color: "#ca8a04" },
              { code: 3, label: "Moderate", range: "40–49%", color: "#ea580c" },
              {
                code: 2,
                label: "Elementary",
                range: "30–39%",
                color: "#dc2626",
              },
              {
                code: 1,
                label: "Not Achieved",
                range: "0–29%",
                color: "#991b1b",
              },
            ].map((l) => (
              <div
                key={l.code}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <span
                  style={{
                    background: l.color,
                    color: "#fff",
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: "bold",
                  }}
                >
                  {l.code}
                </span>
                <span style={{ fontSize: 10, color: "#374151" }}>
                  {l.label}{" "}
                  <span style={{ color: "#9ca3af" }}>({l.range})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher comments */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 18,
                background: "#FFB612",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: "#1a3c5e",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Educator's Remarks
            </div>
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 16px",
              minHeight: 60,
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.7,
              background: "#fafafa",
            }}
          >
            {teacherComments || "No remarks recorded."}
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            marginTop: 24,
            paddingTop: 16,
            borderTop: "2px solid #e5e7eb",
          }}
        >
          {[
            { role: "Class Educator", name: "" },
            { role: "Principal", name: businessInfo.principalName },
            { role: "Parent / Guardian", name: "" },
          ].map(({ role, name }) => (
            <div key={role} style={{ textAlign: "center" }}>
              <div
                style={{
                  borderTop: "1px solid #9ca3af",
                  marginTop: 36,
                  paddingTop: 8,
                }}
              >
                {name && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: "bold",
                      color: "#1a3c5e",
                      marginBottom: 2,
                    }}
                  >
                    {name}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#6b7280" }}>{role}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                  Date: _______________
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 9,
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: 10,
          }}
        >
          This report is issued in accordance with the South African National
          Curriculum Assessment Policy Statement (CAPS) ·{" "}
          {businessInfo.businessName} · {term} {academicYear}
        </div>
      </div>

      {/* Bottom colour bar */}
      <div style={{ display: "flex", height: 6 }}>
        {["#007A4D", "#FFB612", "#DE3008", "#002395", "#007A4D", "#FFB612"].map(
          (c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ),
        )}
      </div>
    </div>
  );
};

// ── TEMPLATE 2: Intermediate Phase (Gr 4–6) ──────────────────────────────────
// More data-dense, bar charts per subject, percentage progress rings feel
export const ModernTemplate = (props) => {
  const safeSubjects = props.subjects || [];
  const avg = props.calculateAverage ? props.calculateAverage() : 0;
  const attRate = AttendanceRate({
    present: props.attendancePresent,
    total: props.attendanceDays,
  });

  return (
    <div
      style={{
        fontFamily: "'Arial', sans-serif",
        background: "#fff",
        color: "#1a1a1a",
        minHeight: "297mm",
      }}
    >
      {/* Header band */}
      <div style={{ background: "#1e3a5f", padding: "0 0 0 0" }}>
        <div style={{ background: "#007A4D", height: 6 }} />
        <div
          style={{
            padding: "22px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {props.businessInfo?.logoUrl ? (
              <img
                src={props.businessInfo.logoUrl}
                alt="logo"
                style={{
                  width: 56,
                  height: 56,
                  objectFit: "contain",
                  background: "#fff",
                  borderRadius: 8,
                  padding: 4,
                }}
              />
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                🏫
              </div>
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                {props.businessInfo?.businessName || "SCHOOL NAME"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  marginTop: 2,
                }}
              >
                {props.businessInfo?.addressLine1}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#FFB612",
                letterSpacing: 1,
              }}
            >
              ACADEMIC REPORT CARD
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              Intermediate Phase · {props.gradeLevel}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
              {props.term} · {props.academicYear}
            </div>
          </div>
        </div>
        <div style={{ background: "#FFB612", height: 4 }} />
      </div>

      <div style={{ padding: "20px 32px" }}>
        {/* Two-column learner + stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Learner card */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#f3f4f6",
                padding: "8px 14px",
                fontSize: 10,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 0.8,
                color: "#374151",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              Learner Information
            </div>
            <div
              style={{
                padding: "12px 14px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {[
                { l: "Full Name", v: props.studentName },
                { l: "Grade", v: props.gradeLevel },
                { l: "Student No.", v: props.studentId },
                { l: "Date of Birth", v: props.dateOfBirth },
                { l: "Parent / Guardian", v: props.parentName },
                { l: "Contact", v: props.parentPhone },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#111827",
                      marginTop: 1,
                    }}
                  >
                    {v || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Average ring-style card */}
            <div
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 36 36"
                  style={{ transform: "rotate(-90deg)", width: 64, height: 64 }}
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={getBarColor(avg)}
                    strokeWidth="3"
                    strokeDasharray={`${avg} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: "bold",
                    color: getBarColor(avg),
                  }}
                >
                  {avg}%
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Overall Average
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: "bold", color: "#111827" }}
                >
                  {getGradeFromMark(avg).label}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>
                  Level {getGradeFromMark(avg).code} · CAPS
                </div>
              </div>
            </div>
            {/* Attendance */}
            <div
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  marginBottom: 6,
                }}
              >
                Attendance
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: Number(attRate) >= 80 ? "#007A4D" : "#dc2626",
                  }}
                >
                  {attRate}%
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 6,
                      background: "#e5e7eb",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(Number(attRate), 100)}%`,
                        background:
                          Number(attRate) >= 80 ? "#007A4D" : "#dc2626",
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                    {props.attendancePresent} / {props.attendanceDays} days
                    present
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject performance with bars */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#1e3a5f",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 16,
                background: "#007A4D",
                borderRadius: 2,
              }}
            />
            Academic Performance per Subject
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "#1e3a5f" }}>
                  {["Subject", "Mark", "Progress", "Level", "Remarks"].map(
                    (h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          color: "#fff",
                          textAlign: i <= 1 || i === 3 ? "left" : "left",
                          fontSize: 10,
                          fontWeight: "bold",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {safeSubjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "16px",
                        color: "#9ca3af",
                        textAlign: "center",
                        fontStyle: "italic",
                      }}
                    >
                      No subjects added yet
                    </td>
                  </tr>
                ) : (
                  safeSubjects.map((s, i) => {
                    const g = getGradeFromMark(s.mark);
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          background: i % 2 === 0 ? "#fafafa" : "#fff",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 12px",
                            fontWeight: 600,
                            width: "22%",
                          }}
                        >
                          {s.name}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontWeight: "bold",
                            color: getBarColor(s.mark),
                            width: "10%",
                          }}
                        >
                          {s.mark}%
                        </td>
                        <td style={{ padding: "10px 12px", width: "28%" }}>
                          <div
                            style={{
                              height: 8,
                              background: "#e5e7eb",
                              borderRadius: 99,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(Number(s.mark), 100)}%`,
                                background: getBarColor(s.mark),
                                borderRadius: 99,
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", width: "14%" }}>
                          <span
                            style={{
                              background: g.color,
                              color: "#fff",
                              borderRadius: 4,
                              padding: "2px 7px",
                              fontSize: 10,
                              fontWeight: "bold",
                            }}
                          >
                            L{g.code}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            fontSize: 11,
                            color: "#6b7280",
                          }}
                        >
                          {s.comments || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    background: "#1e3a5f",
                    borderTop: "2px solid #007A4D",
                  }}
                >
                  <td
                    style={{
                      padding: "9px 12px",
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                    colSpan={2}
                  >
                    OVERALL AVERAGE
                  </td>
                  <td colSpan={3} style={{ padding: "9px 12px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          flex: 1,
                          height: 8,
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(Number(avg), 100)}%`,
                            background: "#FFB612",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          color: "#FFB612",
                          fontWeight: "bold",
                          fontSize: 14,
                        }}
                      >
                        {avg}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* CAPS Scale */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            { c: 7, l: "Outstanding", r: "80–100" },
            { c: 6, l: "Meritorious", r: "70–79" },
            { c: 5, l: "Substantial", r: "60–69" },
            { c: 4, l: "Adequate", r: "50–59" },
            { c: 3, l: "Moderate", r: "40–49" },
            { c: 2, l: "Elementary", r: "30–39" },
            { c: 1, l: "Not Achieved", r: "0–29" },
          ].map((l) => (
            <div
              key={l.c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 9,
                color: "#6b7280",
              }}
            >
              <span
                style={{
                  background: getGradeFromMark(l.c * 10 + 5).color,
                  color: "#fff",
                  padding: "1px 5px",
                  borderRadius: 3,
                  fontWeight: "bold",
                  fontSize: 9,
                }}
              >
                L{l.c}
              </span>
              {l.l} ({l.r}%)
            </div>
          ))}
        </div>

        {/* Teacher remarks */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: "bold",
              color: "#1e3a5f",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 4,
                height: 14,
                background: "#FFB612",
                borderRadius: 2,
              }}
            />
            Educator's Remarks
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 16px",
              minHeight: 60,
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.8,
              background: "#fafafa",
            }}
          >
            {props.teacherComments || "No remarks recorded."}
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            paddingTop: 16,
            borderTop: "2px solid #e5e7eb",
          }}
        >
          {[
            { role: "Class Educator", name: "" },
            {
              role: "Principal / HOD",
              name: props.businessInfo?.principalName,
            },
            { role: "Parent / Guardian", name: "" },
          ].map(({ role, name }) => (
            <div key={role} style={{ textAlign: "center" }}>
              <div style={{ height: 36 }} />
              <div style={{ borderTop: "1px solid #9ca3af", paddingTop: 6 }}>
                {name && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: "bold",
                      color: "#1e3a5f",
                    }}
                  >
                    {name}
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#6b7280" }}>{role}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                  Date: _______________
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 9,
            color: "#9ca3af",
            borderTop: "1px solid #f3f4f6",
            paddingTop: 8,
          }}
        >
          Issued in accordance with CAPS · {props.businessInfo?.businessName} ·{" "}
          {props.term} {props.academicYear} · Report No:{" "}
          {props.reportCardNumber}
        </div>
      </div>
    </div>
  );
};

// ── TEMPLATE 3: Formal Academic (All Grades) ─────────────────────────────────
// Most formal — suits high schools too, clean black & white with SA green accents
export const ProfessionalTemplate = (props) => {
  const safeSubjects = props.subjects || [];
  const avg = props.calculateAverage ? props.calculateAverage() : 0;
  const attRate = AttendanceRate({
    present: props.attendancePresent,
    total: props.attendanceDays,
  });

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', serif",
        background: "#fff",
        color: "#111",
        minHeight: "297mm",
        border: "1px solid #d1d5db",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          height: 5,
          background:
            "linear-gradient(to right, #007A4D, #1e3a5f, #FFB612, #DE3008)",
        }}
      />

      {/* Letterhead */}
      <div
        style={{ padding: "24px 40px 16px", borderBottom: "2px solid #111" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            {props.businessInfo?.logoUrl ? (
              <img
                src={props.businessInfo.logoUrl}
                alt="logo"
                style={{ width: 70, height: 70, objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  width: 70,
                  height: 70,
                  background: "#f3f4f6",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  border: "1px solid #e5e7eb",
                }}
              >
                🏫
              </div>
            )}
            <div>
              <div
                style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 0.5 }}
              >
                {props.businessInfo?.businessName || "SCHOOL NAME"}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#374151",
                  marginTop: 3,
                  lineHeight: 1.7,
                }}
              >
                {props.businessInfo?.addressLine1}
                <br />
                {props.businessInfo?.city}
                {props.businessInfo?.postalCode
                  ? ` · ${props.businessInfo.postalCode}`
                  : ""}
                <br />
                Tel: {props.businessInfo?.primaryPhone || "—"} · Email:{" "}
                {props.businessInfo?.email || "—"}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: "bold",
                letterSpacing: 2,
                textTransform: "uppercase",
                borderBottom: "2px solid #111",
                paddingBottom: 4,
                marginBottom: 6,
              }}
            >
              Learner Academic Report
            </div>
            <div style={{ fontSize: 11, color: "#374151" }}>
              Report Number: <strong>{props.reportCardNumber || "—"}</strong>
            </div>
            <div style={{ fontSize: 11, color: "#374151" }}>
              Academic Period:{" "}
              <strong>
                {props.term} {props.academicYear}
              </strong>
            </div>
            <div style={{ fontSize: 11, color: "#374151" }}>
              Grade: <strong>{props.gradeLevel}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 40px" }}>
        {/* Learner details table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            marginBottom: 16,
            border: "1px solid #d1d5db",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={4}
                style={{
                  background: "#1e3a5f",
                  color: "#fff",
                  padding: "7px 12px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                LEARNER PARTICULARS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td
                style={{
                  padding: "7px 12px",
                  fontWeight: "bold",
                  color: "#374151",
                  width: "15%",
                  background: "#f9fafb",
                }}
              >
                Full Name
              </td>
              <td style={{ padding: "7px 12px", width: "35%" }}>
                {props.studentName || "—"}
              </td>
              <td
                style={{
                  padding: "7px 12px",
                  fontWeight: "bold",
                  color: "#374151",
                  width: "15%",
                  background: "#f9fafb",
                }}
              >
                Student No.
              </td>
              <td style={{ padding: "7px 12px", width: "35%" }}>
                {props.studentId || "—"}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td
                style={{
                  padding: "7px 12px",
                  fontWeight: "bold",
                  color: "#374151",
                  background: "#f9fafb",
                }}
              >
                Date of Birth
              </td>
              <td style={{ padding: "7px 12px" }}>
                {props.dateOfBirth || "—"}
              </td>
              <td
                style={{
                  padding: "7px 12px",
                  fontWeight: "bold",
                  color: "#374151",
                  background: "#f9fafb",
                }}
              >
                Grade
              </td>
              <td style={{ padding: "7px 12px" }}>{props.gradeLevel || "—"}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <td
                style={{
                  padding: "7px 12px",
                  fontWeight: "bold",
                  color: "#374151",
                  background: "#f9fafb",
                }}
              >
                Parent/Guardian
              </td>
              <td style={{ padding: "7px 12px" }}>{props.parentName || "—"}</td>
              <td
                style={{
                  padding: "7px 12px",
                  fontWeight: "bold",
                  color: "#374151",
                  background: "#f9fafb",
                }}
              >
                Contact
              </td>
              <td style={{ padding: "7px 12px" }}>
                {props.parentPhone || "—"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Performance table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            marginBottom: 16,
            border: "1px solid #d1d5db",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={5}
                style={{
                  background: "#1e3a5f",
                  color: "#fff",
                  padding: "7px 12px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                ACADEMIC PERFORMANCE — CAPS CURRICULUM
              </th>
            </tr>
            <tr
              style={{
                background: "#f3f4f6",
                borderBottom: "1px solid #d1d5db",
              }}
            >
              {[
                "Learning Area / Subject",
                "Mark Obtained (%)",
                "Achievement Level",
                "Descriptor",
                "Educator Comment",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "7px 12px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "#374151",
                    borderRight: "1px solid #e5e7eb",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeSubjects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "16px 12px",
                    color: "#9ca3af",
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  No learning areas recorded
                </td>
              </tr>
            ) : (
              safeSubjects.map((s, i) => {
                const g = getGradeFromMark(s.mark);
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: i % 2 === 0 ? "#fff" : "#fafafa",
                    }}
                  >
                    <td
                      style={{
                        padding: "7px 12px",
                        fontWeight: 600,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      {s.name}
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        textAlign: "center",
                        fontWeight: "bold",
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      {s.mark}
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        textAlign: "center",
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      <span
                        style={{
                          background: g.color,
                          color: "#fff",
                          padding: "1px 8px",
                          borderRadius: 3,
                          fontWeight: "bold",
                        }}
                      >
                        {g.code}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        color: g.color,
                        fontWeight: 600,
                        borderRight: "1px solid #e5e7eb",
                      }}
                    >
                      {g.label}
                    </td>
                    <td
                      style={{
                        padding: "7px 12px",
                        color: "#6b7280",
                        fontSize: 10,
                      }}
                    >
                      {s.comments || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#1e3a5f" }}>
              <td
                style={{
                  padding: "8px 12px",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                OVERALL AVERAGE
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  color: "#FFB612",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {avg}%
              </td>
              <td
                colSpan={3}
                style={{
                  padding: "8px 12px",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 11,
                }}
              >
                Achievement Level {getGradeFromMark(avg).code} —{" "}
                {getGradeFromMark(avg).label}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* CAPS scale */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 10,
            marginBottom: 16,
            border: "1px solid #d1d5db",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={7}
                style={{
                  background: "#f3f4f6",
                  padding: "5px 12px",
                  textAlign: "left",
                  fontSize: 10,
                  fontWeight: "bold",
                  color: "#374151",
                  borderBottom: "1px solid #d1d5db",
                }}
              >
                CAPS ACHIEVEMENT LEVEL DESCRIPTORS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {[
                { c: 7, l: "Outstanding", r: "80–100%" },
                { c: 6, l: "Meritorious", r: "70–79%" },
                { c: 5, l: "Substantial", r: "60–69%" },
                { c: 4, l: "Adequate", r: "50–59%" },
                { c: 3, l: "Moderate", r: "40–49%" },
                { c: 2, l: "Elementary", r: "30–39%" },
                { c: 1, l: "Not Achieved", r: "0–29%" },
              ].map((l) => (
                <td
                  key={l.c}
                  style={{
                    padding: "6px 8px",
                    borderRight: "1px solid #e5e7eb",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>{l.c}</div>
                  <div
                    style={{ fontSize: 9, color: "#374151", fontWeight: 600 }}
                  >
                    {l.l}
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af" }}>{l.r}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Attendance */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            marginBottom: 16,
            border: "1px solid #d1d5db",
          }}
        >
          <thead>
            <tr>
              <th
                colSpan={3}
                style={{
                  background: "#1e3a5f",
                  color: "#fff",
                  padding: "7px 12px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                ATTENDANCE RECORD
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Total School Days
                </div>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                  {props.attendanceDays || "—"}
                </div>
              </td>
              <td
                style={{
                  padding: "10px 16px",
                  textAlign: "center",
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Days Present
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: "bold", color: "#007A4D" }}
                >
                  {props.attendancePresent || "—"}
                </div>
              </td>
              <td style={{ padding: "10px 16px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Attendance Rate
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: Number(attRate) >= 80 ? "#007A4D" : "#dc2626",
                  }}
                >
                  {attRate}%
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Remarks */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 11,
            marginBottom: 20,
            border: "1px solid #d1d5db",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  background: "#1e3a5f",
                  color: "#fff",
                  padding: "7px 12px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                EDUCATOR'S REMARKS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "12px 16px",
                  minHeight: 70,
                  lineHeight: 1.8,
                  fontSize: 12,
                }}
              >
                {props.teacherComments || "No remarks recorded."}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 30,
            paddingTop: 12,
            borderTop: "2px solid #111",
          }}
        >
          {[
            { role: "Class Educator", name: "" },
            { role: "Principal", name: props.businessInfo?.principalName },
            { role: "Parent / Guardian", name: "" },
          ].map(({ role, name }) => (
            <div key={role}>
              <div style={{ height: 40 }} />
              <div style={{ borderTop: "1px solid #6b7280", paddingTop: 6 }}>
                {name && (
                  <div style={{ fontSize: 11, fontWeight: "bold" }}>{name}</div>
                )}
                <div style={{ fontSize: 10, color: "#6b7280" }}>{role}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                  Signature: _________________
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>
                  Date: _____________________
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 9,
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: 8,
          }}
        >
          This document is an official academic record issued by{" "}
          {props.businessInfo?.businessName || "the school"} in accordance with
          the South African Schools Act (SASA) and the National Curriculum and
          Assessment Policy Statement (CAPS).
        </div>
      </div>
    </div>
  );
};

// ── TEMPLATE 4: Early Childhood / Pre-School ─────────────────────────────────
// Playful, warm, colourful — developmental milestones focus, not just marks
export const ColorfulTemplate = (props) => {
  const safeSubjects = props.subjects || [];
  const avg = props.calculateAverage ? props.calculateAverage() : 0;

  const getStars = (mark) => {
    const m = Number(mark);
    if (m >= 80) return 5;
    if (m >= 65) return 4;
    if (m >= 50) return 3;
    if (m >= 35) return 2;
    return 1;
  };

  const getEmoji = (mark) => {
    const m = Number(mark);
    if (m >= 80) return "🌟";
    if (m >= 65) return "😊";
    if (m >= 50) return "🙂";
    if (m >= 35) return "😐";
    return "📚";
  };

  return (
    <div
      style={{
        fontFamily: "'Arial Rounded MT Bold', 'Arial', sans-serif",
        background: "#fff",
        minHeight: "297mm",
      }}
    >
      {/* Colourful top border */}
      <div
        style={{
          height: 10,
          background:
            "linear-gradient(to right, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF6B6B)",
        }}
      />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "24px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -20,
            top: -20,
            width: 150,
            height: 150,
            background: "rgba(255,255,255,0.07)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            bottom: -30,
            width: 100,
            height: 100,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {props.businessInfo?.logoUrl ? (
              <img
                src={props.businessInfo.logoUrl}
                alt="logo"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "contain",
                  background: "#fff",
                  borderRadius: 16,
                  padding: 6,
                }}
              />
            ) : (
              <div style={{ fontSize: 40 }}>🏫</div>
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
                {props.businessInfo?.businessName || "SCHOOL NAME"}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#FFD93D",
                  marginTop: 2,
                }}
              >
                ⭐ Learner Progress Report ⭐
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 2,
                }}
              >
                {props.term} · {props.academicYear}
              </div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: "12px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36 }}>🎒</div>
            <div style={{ fontSize: 11, color: "#FFD93D", fontWeight: "bold" }}>
              {props.gradeLevel || "Pre-School"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 32px" }}>
        {/* Learner banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
            border: "2px solid #7dd3fc",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 44 }}>👦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#0369a1" }}>
              {props.studentName || "Learner Name"}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
              {[
                { l: "Grade", v: props.gradeLevel },
                { l: "Student No.", v: props.studentId },
                { l: "Date of Birth", v: props.dateOfBirth },
                { l: "Parent", v: props.parentName },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}
                  >
                    {v || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Overall smiley */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>
              {avg >= 70 ? "😁" : avg >= 50 ? "😊" : "📚"}
            </div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: "#0369a1" }}>
              {avg}%
            </div>
            <div style={{ fontSize: 10, color: "#64748b" }}>Overall</div>
          </div>
        </div>

        {/* Attendance card */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Days at School 📅",
              value: props.attendancePresent || 0,
              sub: `out of ${props.attendanceDays || 0} days`,
              color: "#6BCB77",
              bg: "#f0fdf4",
            },
            {
              label: "Overall Average 📊",
              value: `${avg}%`,
              sub: getGradeFromMark(avg).label,
              color: "#4D96FF",
              bg: "#eff6ff",
            },
            {
              label: "Subjects 📚",
              value: safeSubjects.length,
              sub: "learning areas",
              color: "#FF6B6B",
              bg: "#fff1f2",
            },
          ].map(({ label, value, sub, color, bg }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `2px solid ${color}30`,
                borderRadius: 14,
                padding: "14px 16px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 26, fontWeight: "bold", color }}>
                {value}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                {sub}
              </div>
            </div>
          ))}
        </div>

        {/* Subjects with stars */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#6366f1",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>📚</span> Learning Areas & Progress
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {safeSubjects.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "#94a3b8",
                  fontStyle: "italic",
                }}
              >
                No subjects added yet
              </div>
            ) : (
              safeSubjects.map((s, i) => {
                const stars = getStars(s.mark);
                const emoji = getEmoji(s.mark);
                const colors = [
                  "#FF6B6B",
                  "#FFD93D",
                  "#6BCB77",
                  "#4D96FF",
                  "#FF9F43",
                  "#A55EEA",
                  "#26de81",
                ];
                const c = colors[i % colors.length];
                return (
                  <div
                    key={i}
                    style={{
                      background: "#fafafa",
                      border: `2px solid ${c}40`,
                      borderLeft: `5px solid ${c}`,
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{emoji}</span>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: "bold",
                              color: "#1e293b",
                            }}
                          >
                            {s.name}
                          </div>
                          {s.comments && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "#64748b",
                                marginTop: 1,
                              }}
                            >
                              {s.comments}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              color: c,
                            }}
                          >
                            {s.mark}%
                          </div>
                          <div
                            style={{ display: "flex", gap: 2, marginTop: 2 }}
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                style={{
                                  fontSize: 12,
                                  opacity: n <= stars ? 1 : 0.25,
                                }}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        marginTop: 8,
                        height: 6,
                        background: "#e2e8f0",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(Number(s.mark), 100)}%`,
                          background: c,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Teacher message */}
        <div
          style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            border: "2px solid #fbbf24",
            borderRadius: 16,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#92400e",
              marginBottom: 8,
            }}
          >
            💬 Educator's Message
          </div>
          <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.8 }}>
            {props.teacherComments || "Keep up the wonderful work! 🌟"}
          </div>
        </div>

        {/* Star key */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: "bold",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Progress Key
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { stars: 5, label: "Excellent (80–100%)" },
              { stars: 4, label: "Very Good (65–79%)" },
              { stars: 3, label: "Good (50–64%)" },
              { stars: 2, label: "Developing (35–49%)" },
              { stars: 1, label: "Needs Support (0–34%)" },
            ].map(({ stars, label }) => (
              <div
                key={stars}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <span style={{ fontSize: 11 }}>
                  {Array(stars).fill("⭐").join("")}
                </span>
                <span style={{ fontSize: 10, color: "#64748b" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            paddingTop: 16,
            borderTop: "3px dashed #e2e8f0",
          }}
        >
          {[
            { role: "Class Teacher 👩‍🏫", name: "" },
            { role: "Principal 🏫", name: props.businessInfo?.principalName },
            { role: "Parent / Guardian 👨‍👩‍👦", name: "" },
          ].map(({ role, name }) => (
            <div key={role} style={{ textAlign: "center" }}>
              <div style={{ height: 36 }} />
              <div style={{ borderTop: "2px dashed #cbd5e1", paddingTop: 8 }}>
                {name && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: "bold",
                      color: "#374151",
                    }}
                  >
                    {name}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#6b7280" }}>{role}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                  Date: _______________
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom colour bar */}
      <div
        style={{
          height: 10,
          background:
            "linear-gradient(to right, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF6B6B)",
        }}
      />
    </div>
  );
};

// ── Template Renderer ─────────────────────────────────────────────────────────
export const TemplateRenderer = ({ templateId, documentType = "reportCard", ...props }) => {
  switch (templateId) {
    case "classic":
      return <ClassicTemplate {...props} />;
    case "modern":
      return <ModernTemplate {...props} />;
    case "professional":
      return <ProfessionalTemplate {...props} />;
    case "colorful":
      return <ColorfulTemplate {...props} />;
    default:
      return <ClassicTemplate {...props} />;
  }
};

export default TemplateSelector;
