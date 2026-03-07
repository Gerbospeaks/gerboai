import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import {
  BookOpen,
  Megaphone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  GraduationCap,
  School,
} from "lucide-react";

export default function ParentPortal() {
  const { schoolSlug } = useParams();
  const [homework, setHomework] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("homework");
  const [gradeFilter, setGradeFilter] = useState("All");

  useEffect(() => {
   const load = async () => {
  try {
    // 1. Look up uid from slug
    const slugDoc = await getDoc(doc(db, "schoolSlugs", schoolSlug));
    if (!slugDoc.exists()) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const uid = slugDoc.data().uid;

    // 2. Load school info from settings/businessInfo ← FIXED PATH
    const bizDoc = await getDoc(
      doc(db, "users", uid, "settings", "businessInfo")
    );
    setBusinessInfo(bizDoc.data());

    // 3. Load homework
    const hwSnap = await getDocs(
      query(
        collection(db, "users", uid, "homework"),
        orderBy("createdAt", "desc")
      )
    );
    const hwData = hwSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => !d._placeholder);
    setHomework(hwData);

    // 4. Load notices
    const nSnap = await getDocs(
      query(
        collection(db, "users", uid, "notices"),
        orderBy("createdAt", "desc")
      )
    );
    const nData = nSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => !d._placeholder);
    setNotices(nData);

    // 5. Load upcoming events
    const eSnap = await getDocs(
      query(collection(db, "users", uid, "events"), orderBy("date", "asc"))
    );
    const today = new Date().toISOString().split("T")[0];
    const eData = eSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((d) => !d._placeholder && d.date >= today);
    setEvents(eData);

  } catch (err) {
    console.error("Error loading portal:", err);
    setNotFound(true);
  } finally {
    setLoading(false);
  }
};

    load();
  }, [schoolSlug]);

  // ── Get unique grades from homework for filter ──────────────────────────
  const grades = [
    "All",
    ...new Set(homework.map((h) => h.grade).filter(Boolean)),
  ];

  const filteredHomework =
    gradeFilter === "All"
      ? homework
      : homework.filter((h) => h.grade === gradeFilter);

  // ── Loading screen ──────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center animate-pulse">
          <School className="w-5 h-5 text-white" />
        </div>
        <div className="text-slate-400 text-sm">Loading portal...</div>
      </div>
    );

  // ── Not found screen ────────────────────────────────────────────────────
  if (notFound)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-lg font-700 text-slate-800">School not found</div>
        <div className="text-sm text-slate-400 max-w-xs">
          The link you followed doesn't match any school. Please ask your school
          for the correct link.
        </div>
      </div>
    );

  const noticeTypeConfig = {
    important: {
      icon: AlertCircle,
      color: "#dc2626",
      bg: "#fee2e2",
      label: "Important",
    },
    action: {
      icon: CheckCircle,
      color: "#ca8a04",
      bg: "#fef9c3",
      label: "Action Required",
    },
    fee: {
      icon: DollarSign,
      color: "#7c3aed",
      bg: "#ede9fe",
      label: "Fee Notice",
    },
    info: { icon: Info, color: "#2563eb", bg: "#dbeafe", label: "Info" },
  };

  const priorityConfig = {
    high: { label: "Urgent", bg: "#fee2e2", color: "#dc2626" },
    medium: { label: "Medium", bg: "#fef9c3", color: "#b45309" },
    low: { label: "Low", bg: "#dcfce7", color: "#16a34a" },
  };

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          padding: "24px 20px 20px",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Parent Portal
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {businessInfo?.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  alt="logo"
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: "contain",
                    borderRadius: 6,
                  }}
                />
              ) : (
                <GraduationCap
                  style={{ width: 22, height: 22, color: "#fff" }}
                />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {businessInfo?.name || businessInfo?.businessName || "School Portal"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 2,
                }}
              >
                Stay up to date with homework &amp; notices
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                label: "Homework Tasks",
                count: homework.length,
                color: "#a5b4fc",
              },
              { label: "Notices", count: notices.length, color: "#fcd34d" },
              {
                label: "Upcoming Events",
                count: events.length,
                color: "#6ee7b7",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>
                  {s.count}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 1,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex" }}>
          {[
            { id: "homework", label: "Homework", icon: BookOpen },
            { id: "notices", label: "Notices", icon: Megaphone },
            { id: "events", label: "Events", icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "13px 8px",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                background: "none",
                cursor: "pointer",
                borderBottom:
                  activeTab === id
                    ? "2.5px solid #4f46e5"
                    : "2.5px solid transparent",
                color: activeTab === id ? "#4f46e5" : "#94a3b8",
                transition: "all .15s",
              }}
            >
              <Icon style={{ width: 15, height: 15 }} />
              {label}
              {id === "homework" && homework.length > 0 && (
                <span
                  style={{
                    background: "#4f46e5",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 99,
                  }}
                >
                  {homework.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}
      >
        {/* ── HOMEWORK TAB ── */}
        {activeTab === "homework" && (
          <div>
            {/* Grade filter */}
            {grades.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGradeFilter(g)}
                    style={{
                      padding: "5px 13px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      background: gradeFilter === g ? "#4f46e5" : "#f1f5f9",
                      color: gradeFilter === g ? "#fff" : "#475569",
                      transition: "all .15s",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}

            {filteredHomework.length === 0 ? (
              <EmptyState icon={BookOpen} message="No homework assigned yet." />
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {filteredHomework.map((hw) => {
                  const p = priorityConfig[hw.priority] || priorityConfig.low;
                  const isOverdue =
                    hw.dueDate &&
                    hw.dueDate < new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={hw.id}
                      style={{
                        background: "#fff",
                        borderRadius: 14,
                        border: "1px solid #e2e8f0",
                        padding: "14px 16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        {/* Subject icon */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 11,
                            background: "#eef2ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <BookOpen
                            style={{ width: 18, height: 18, color: "#4f46e5" }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#0f172a",
                              marginBottom: 3,
                            }}
                          >
                            {hw.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {hw.subject} · {hw.grade}
                          </div>
                          {hw.assignedBy && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                              }}
                            >
                              Assigned by {hw.assignedBy}
                            </div>
                          )}
                        </div>

                        {/* Priority badge */}
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: 99,
                            background: p.bg,
                            color: p.color,
                            flexShrink: 0,
                          }}
                        >
                          {p.label}
                        </span>
                      </div>

                      {/* Due date */}
                      {hw.dueDate && (
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 10px",
                            borderRadius: 8,
                            background: isOverdue ? "#fee2e2" : "#f8fafc",
                          }}
                        >
                          <Clock
                            style={{
                              width: 13,
                              height: 13,
                              color: isOverdue ? "#dc2626" : "#94a3b8",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: isOverdue ? "#dc2626" : "#475569",
                            }}
                          >
                            {isOverdue ? "Overdue · " : "Due · "}
                            {hw.dueDate}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── NOTICES TAB ── */}
        {activeTab === "notices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notices.length === 0 ? (
              <EmptyState icon={Megaphone} message="No notices yet." />
            ) : (
              notices.map((n) => {
                const tc = noticeTypeConfig[n.type] || noticeTypeConfig.info;
                const Icon = tc.icon;
                return (
                  <div
                    key={n.id}
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      borderLeft: `4px solid ${tc.color}`,
                      padding: "14px 16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 99,
                          background: tc.bg,
                          color: tc.color,
                        }}
                      >
                        <Icon style={{ width: 10, height: 10 }} />
                        {tc.label}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#94a3b8",
                          marginLeft: "auto",
                        }}
                      >
                        {n.date}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: 5,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.55,
                      }}
                    >
                      {n.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === "events" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {events.length === 0 ? (
              <EmptyState icon={Calendar} message="No upcoming events." />
            ) : (
              events.map((ev) => {
                const d = new Date(ev.date);
                const daysAway = Math.round((d - new Date()) / 86400000);
                return (
                  <div
                    key={ev.id}
                    style={{
                      background: "#fff",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      boxShadow: "0 1px 3px rgba(0,0,0,.05)",
                    }}
                  >
                    {/* Date block */}
                    <div
                      style={{
                        width: 48,
                        height: 52,
                        borderRadius: 12,
                        background: "#eef2ff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "#4f46e5",
                          lineHeight: 1,
                        }}
                      >
                        {d.getDate()}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "#818cf8",
                          letterSpacing: ".06em",
                        }}
                      >
                        {d
                          .toLocaleDateString("en", { month: "short" })
                          .toUpperCase()}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {ev.title}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                      >
                        {ev.time && `${ev.time} · `}
                        {ev.description}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: daysAway <= 2 ? "#fee2e2" : "#f1f5f9",
                        color: daysAway <= 2 ? "#dc2626" : "#64748b",
                        flexShrink: 0,
                      }}
                    >
                      {daysAway === 0
                        ? "Today"
                        : daysAway === 1
                          ? "Tomorrow"
                          : `In ${daysAway}d`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: 11,
          color: "#94a3b8",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        {businessInfo?.name || "School"} · Parent Portal
      </div>
    </div>
  );
}

// ── Empty state helper ────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, message }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 20px",
        color: "#94a3b8",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
        }}
      >
        <Icon style={{ width: 22, height: 22, color: "#cbd5e1" }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{message}</div>
    </div>
  );
}
