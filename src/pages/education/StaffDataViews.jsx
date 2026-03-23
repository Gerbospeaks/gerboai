import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  ShieldAlert,
  BarChart2,
  ClipboardList,
  Heart,
  Package,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Flag,
  Clock,
  CheckCircle,
  Search,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  RefreshCw,
} from "lucide-react";

// ── Shared tokens ─────────────────────────────────────────────────────────────
const C = {
  brand: "#4f46e5",
  brandLight: "#eef2ff",
  green: "#10b981",
  greenLight: "#dcfce7",
  red: "#ef4444",
  redLight: "#fee2e2",
  amber: "#f59e0b",
  amberLight: "#fef9c3",
  purple: "#8b5cf6",
  purpleLight: "#ede9fe",
  pink: "#ec4899",
  pinkLight: "#fdf2f8",
  teal: "#14b8a6",
  tealLight: "#ccfbf1",
  text: "#0f172a",
  textMid: "#475569",
  textSoft: "#94a3b8",
  border: "#e2e8f0",
  surface: "#ffffff",
  bg: "#f8fafc",
};

const pill = (bg, color, text) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      background: bg,
      color,
    }}
  >
    {text}
  </span>
);

const SectionHeader = ({
  title,
  subtitle,
  count,
  color = C.brand,
  icon: Icon,
}) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>
          {title}
        </h2>
        {subtitle && (
          <p
            style={{ margin: 0, fontSize: 12, color: C.textSoft, marginTop: 2 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {count !== undefined && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 12,
            fontWeight: 700,
            background: color + "18",
            color,
            padding: "4px 12px",
            borderRadius: 99,
          }}
        >
          {count} records
        </span>
      )}
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, message, color = C.textSoft }) => (
  <div
    style={{
      textAlign: "center",
      padding: "48px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon style={{ width: 24, height: 24, color }} />
    </div>
    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>
      {title}
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 13,
        color: C.textSoft,
        maxWidth: 260,
        lineHeight: 1.6,
      }}
    >
      {message}
    </p>
  </div>
);

const Card = ({ children, style }) => (
  <div
    style={{
      background: C.surface,
      borderRadius: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,.07),0 4px 16px rgba(0,0,0,.04)",
      ...style,
    }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// 1. BEHAVIOUR LOG VIEWER
// ─────────────────────────────────────────────────────────────────────────────
export const BehaviourLogView = ({ uid }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | low | medium | high
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", uid, "incidents"),
            orderBy("createdAt", "desc"),
          ),
        );
        setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  const severityConfig = {
    low: { label: "Minor", bg: C.amberLight, color: C.amber },
    medium: { label: "Moderate", bg: C.redLight, color: C.red },
    high: { label: "Serious", bg: "#fee2e2", color: "#7f1d1d" },
  };

  const filtered = incidents
    .filter((i) => filter === "all" || i.severity === filter)
    .filter(
      (i) =>
        !search ||
        i.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        i.type?.toLowerCase().includes(search.toLowerCase()),
    );

  const counts = {
    low: incidents.filter((i) => i.severity === "low").length,
    medium: incidents.filter((i) => i.severity === "medium").length,
    high: incidents.filter((i) => i.severity === "high").length,
  };

  return (
    <div>
      <SectionHeader
        title="Behaviour Log"
        subtitle="All incidents recorded by staff"
        count={incidents.length}
        color={C.red}
        icon={ShieldAlert}
      />

      {/* Summary pills */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[
          {
            key: "all",
            label: "All",
            count: incidents.length,
            color: C.textMid,
            bg: C.bg,
          },
          {
            key: "high",
            label: "Serious",
            count: counts.high,
            color: "#7f1d1d",
            bg: "#fee2e2",
          },
          {
            key: "medium",
            label: "Moderate",
            count: counts.medium,
            color: C.red,
            bg: C.redLight,
          },
          {
            key: "low",
            label: "Minor",
            count: counts.low,
            color: C.amber,
            bg: C.amberLight,
          },
        ].map(({ key, label, count, color, bg }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              border: `1.5px solid ${filter === key ? color : C.border}`,
              background: filter === key ? bg : "#fff",
              color: filter === key ? color : C.textMid,
              cursor: "pointer",
              transition: "all .12s",
            }}
          >
            {label} ({count})
          </button>
        ))}
        <div style={{ marginLeft: "auto", position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 14,
              color: C.textSoft,
            }}
          />
          <input
            placeholder="Search student or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              paddingLeft: 32,
              paddingRight: 12,
              paddingTop: 7,
              paddingBottom: 7,
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
              color: C.text,
              minWidth: 200,
            }}
          />
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: C.textSoft,
            fontSize: 13,
          }}
        >
          Loading incidents…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShieldAlert}
            title="No incidents"
            message="No behaviour incidents have been logged yet."
          />
        </Card>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          {filtered.map((inc, i) => {
            const sc = severityConfig[inc.severity] || severityConfig.low;
            const isOpen = expanded === inc.id;
            return (
              <div
                key={inc.id}
                style={{
                  borderBottom:
                    i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : inc.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    cursor: "pointer",
                    background: isOpen ? "#fafbff" : "transparent",
                    transition: "background .12s",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: sc.color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{ fontSize: 14, fontWeight: 700, color: C.text }}
                      >
                        {inc.studentName}
                      </span>
                      <span style={{ fontSize: 12, color: C.textSoft }}>
                        {inc.grade}
                      </span>
                      <span
                        style={{
                          padding: "1px 8px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sc.bg,
                          color: sc.color,
                        }}
                      >
                        {sc.label}
                      </span>
                      {inc.parentNotified && (
                        <span
                          style={{
                            padding: "1px 8px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            background: C.greenLight,
                            color: C.green,
                          }}
                        >
                          Parent notified
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}
                    >
                      {inc.type} · {inc.date} · Logged by {inc.recordedBy}
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp
                      style={{
                        width: 16,
                        height: 16,
                        color: C.textSoft,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <ChevronDown
                      style={{
                        width: 16,
                        height: 16,
                        color: C.textSoft,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
                {/* Expanded detail */}
                {isOpen && (
                  <div
                    style={{
                      padding: "0 18px 16px 38px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.textSoft,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        Description
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: C.textMid,
                          lineHeight: 1.6,
                        }}
                      >
                        {inc.description || "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.textSoft,
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        Action Taken
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: C.textMid,
                          lineHeight: 1.6,
                        }}
                      >
                        {inc.actionTaken || "No action logged"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. MARK BOOK OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
export const MarkBookView = ({ uid }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", uid, "markbook"),
            orderBy("createdAt", "desc"),
          ),
        );
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  const grades = ["All", ...Array.from(new Set(entries.map((e) => e.grade)))];
  const subjects = [
    "All",
    ...Array.from(new Set(entries.map((e) => e.subject))),
  ];

  const filtered = entries
    .filter((e) => selectedGrade === "All" || e.grade === selectedGrade)
    .filter((e) => selectedSubject === "All" || e.subject === selectedSubject);

  const getAvg = (scores, total) => {
    const vals = Object.values(scores || {})
      .filter((v) => v !== "" && !isNaN(v))
      .map(Number);
    if (!vals.length) return null;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return total ? ((avg / total) * 100).toFixed(1) : avg.toFixed(1);
  };

  const avgColor = (pct) => (pct >= 75 ? C.green : pct >= 50 ? C.amber : C.red);

  return (
    <div>
      <SectionHeader
        title="Mark Book"
        subtitle="Assessment results recorded by teachers"
        count={entries.length}
        color={C.brand}
        icon={BarChart2}
      />

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.textSoft,
              display: "block",
              marginBottom: 4,
            }}
          >
            GRADE
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
              color: C.text,
            }}
          >
            {grades.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.textSoft,
              display: "block",
              marginBottom: 4,
            }}
          >
            SUBJECT
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 12,
              outline: "none",
              fontFamily: "inherit",
              color: C.text,
            }}
          >
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: C.textSoft,
            fontSize: 13,
          }}
        >
          Loading marks…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart2}
            title="No assessments yet"
            message="Teachers haven't recorded any marks yet."
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((entry) => {
            const avg = getAvg(entry.scores, entry.total);
            const isOpen = expanded === entry.id;
            const scores = entry.scores || {};
            const studentCount = Object.keys(scores).length;

            return (
              <Card key={entry.id} style={{ overflow: "hidden" }}>
                {/* Header row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : entry.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: C.brandLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen
                      style={{ width: 20, height: 20, color: C.brand }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{ fontSize: 14, fontWeight: 800, color: C.text }}
                      >
                        {entry.assessment}
                      </span>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: C.brandLight,
                          color: C.brand,
                        }}
                      >
                        {entry.subject}
                      </span>
                      <span style={{ fontSize: 12, color: C.textSoft }}>
                        {entry.grade}
                      </span>
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}
                    >
                      {entry.date} · {studentCount} students · out of{" "}
                      {entry.total} · By {entry.recordedBy}
                    </div>
                  </div>
                  {avg !== null && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: avgColor(parseFloat(avg)),
                          lineHeight: 1,
                        }}
                      >
                        {avg}%
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: C.textSoft,
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        CLASS AVG
                      </div>
                    </div>
                  )}
                  {isOpen ? (
                    <ChevronUp
                      style={{ width: 16, height: 16, color: C.textSoft }}
                    />
                  ) : (
                    <ChevronDown
                      style={{ width: 16, height: 16, color: C.textSoft }}
                    />
                  )}
                </div>

                {/* Expanded scores table */}
                {isOpen && Object.keys(scores).length > 0 && (
                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      padding: "14px 18px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: 8,
                      }}
                    >
                      {Object.entries(scores).map(([studentId, score]) => {
                        const pct =
                          score !== "" && entry.total
                            ? (parseFloat(score) / entry.total) * 100
                            : null;
                        const sc = pct === null ? C.textSoft : avgColor(pct);
                        return (
                          <div
                            key={studentId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              borderRadius: 10,
                              background: C.bg,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.textMid,
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {studentId}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: sc,
                                marginLeft: 8,
                              }}
                            >
                              {score}/{entry.total}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. PERMISSION SLIP TRACKER
// ─────────────────────────────────────────────────────────────────────────────
export const PermissionSlipView = ({ uid }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", uid, "permissionEvents"),
          orderBy("createdAt", "desc"),
        ),
      );
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [uid]);

  const slipStatus = (slips) => {
    const vals = Object.values(slips || {});
    const returned = vals.filter((v) => v === "returned").length;
    const pending = vals.filter((v) => v === "pending").length;
    const missing = vals.filter((v) => v === "absent").length;
    return { returned, pending, missing, total: vals.length };
  };

  const statusConfig = {
    returned: { label: "✓ Returned", bg: C.greenLight, color: C.green },
    pending: { label: "Pending", bg: C.amberLight, color: C.amber },
    absent: { label: "Missing", bg: C.redLight, color: C.red },
  };

  return (
    <div>
      <SectionHeader
        title="Permission Slips"
        subtitle="Track consent slips for outings and events"
        count={events.length}
        color={C.teal}
        icon={ClipboardList}
      />

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: C.textSoft,
            fontSize: 13,
          }}
        >
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No events created"
            message="Teachers haven't created any permission slip events yet."
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {events.map((evt) => {
            const { returned, pending, missing, total } = slipStatus(evt.slips);
            const isOpen = expanded === evt.id;
            const pct = total > 0 ? Math.round((returned / total) * 100) : 0;

            return (
              <Card key={evt.id} style={{ overflow: "hidden" }}>
                <div
                  onClick={() => setExpanded(isOpen ? null : evt.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: C.tealLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ClipboardList
                      style={{ width: 20, height: 20, color: C.teal }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{ fontSize: 14, fontWeight: 800, color: C.text }}
                    >
                      {evt.eventName}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}
                    >
                      {evt.grade} · {evt.eventDate || "No date set"} · Created
                      by {evt.createdBy}
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        marginTop: 8,
                        height: 5,
                        background: C.border,
                        borderRadius: 99,
                        overflow: "hidden",
                        maxWidth: 260,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: pct === 100 ? C.green : C.teal,
                          borderRadius: 99,
                          transition: "width .3s",
                        }}
                      />
                    </div>
                  </div>
                  {/* Stats */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      flexShrink: 0,
                      alignItems: "center",
                    }}
                  >
                    {[
                      { val: returned, label: "Returned", color: C.green },
                      { val: pending, label: "Pending", color: C.amber },
                      { val: missing, label: "Missing", color: C.red },
                    ].map(({ val, label, color }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color,
                            lineHeight: 1,
                          }}
                        >
                          {val}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: C.textSoft,
                            letterSpacing: ".04em",
                          }}
                        >
                          {label.toUpperCase()}
                        </div>
                      </div>
                    ))}
                    {isOpen ? (
                      <ChevronUp
                        style={{
                          width: 16,
                          height: 16,
                          color: C.textSoft,
                          marginLeft: 8,
                        }}
                      />
                    ) : (
                      <ChevronDown
                        style={{
                          width: 16,
                          height: 16,
                          color: C.textSoft,
                          marginLeft: 8,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Expanded student list */}
                {isOpen && total > 0 && (
                  <div
                    style={{
                      borderTop: `1px solid ${C.border}`,
                      padding: "12px 18px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 6,
                      }}
                    >
                      {Object.entries(evt.slips || {}).map(
                        ([studentId, status]) => {
                          const sc =
                            statusConfig[status] || statusConfig.pending;
                          return (
                            <div
                              key={studentId}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "7px 11px",
                                borderRadius: 9,
                                background: C.bg,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: C.textMid,
                                }}
                              >
                                {studentId}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                  background: sc.bg,
                                  color: sc.color,
                                }}
                              >
                                {sc.label}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. WELFARE FLAGS (confidential)
// ─────────────────────────────────────────────────────────────────────────────
export const WelfareFlagsView = ({ uid }) => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [revealed, setRevealed] = useState({});

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", uid, "welfareFlags"),
          orderBy("createdAt", "desc"),
        ),
      );
      setFlags(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [uid]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "users", uid, "welfareFlags", id), {
      status,
      resolvedAt: serverTimestamp(),
    });
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  const filtered = flags.filter((f) => filter === "all" || f.status === filter);

  const urgencyConfig = {
    low: { label: "Monitor", bg: C.greenLight, color: C.green },
    moderate: { label: "Urgent", bg: C.amberLight, color: C.amber },
    high: { label: "Immediate", bg: C.redLight, color: C.red },
  };

  const counts = {
    open: flags.filter((f) => f.status === "open").length,
    resolved: flags.filter((f) => f.status === "resolved").length,
  };

  return (
    <div>
      {/* Confidential notice */}
      <div
        style={{
          padding: "12px 16px",
          background: C.pinkLight,
          borderRadius: 12,
          border: "1.5px solid #fbcfe8",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <Heart
          style={{
            width: 18,
            height: 18,
            color: C.pink,
            flexShrink: 0,
            marginTop: 1,
          }}
        />
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 800,
              color: "#9d174d",
            }}
          >
            Confidential — Principal Access Only
          </p>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: "#be185d",
              lineHeight: 1.6,
            }}
          >
            These welfare flags were submitted by staff members. Student details
            are hidden by default. Handle with care and follow your school's
            safeguarding protocol.
          </p>
        </div>
      </div>

      <SectionHeader
        title="Student Welfare Flags"
        subtitle="Safeguarding concerns flagged by staff"
        color={C.pink}
        icon={Heart}
      />

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[
          { key: "open", label: `Open (${counts.open})`, color: C.red },
          {
            key: "resolved",
            label: `Resolved (${counts.resolved})`,
            color: C.green,
          },
          { key: "all", label: `All (${flags.length})`, color: C.textMid },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              border: `1.5px solid ${filter === key ? color : C.border}`,
              background:
                filter === key
                  ? key === "open"
                    ? C.redLight
                    : key === "resolved"
                      ? C.greenLight
                      : C.bg
                  : "#fff",
              color: filter === key ? color : C.textMid,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: C.textSoft,
            fontSize: 13,
          }}
        >
          Loading welfare flags…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Heart}
            title="No welfare flags"
            message={
              filter === "open"
                ? "No open welfare concerns at this time."
                : "No records found."
            }
            color={C.pink}
          />
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((flag) => {
            const uc = urgencyConfig[flag.urgency] || urgencyConfig.moderate;
            const isRevealed = revealed[flag.id];

            return (
              <Card
                key={flag.id}
                style={{
                  overflow: "hidden",
                  border:
                    flag.status === "open" && flag.urgency === "high"
                      ? `2px solid ${C.red}`
                      : `1px solid ${C.border}`,
                }}
              >
                <div style={{ padding: "14px 18px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    {/* Urgency dot */}
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: uc.color,
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            background: uc.bg,
                            color: uc.color,
                          }}
                        >
                          {uc.label}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text,
                          }}
                        >
                          {flag.category}
                        </span>
                        {flag.status === "resolved" && (
                          <span
                            style={{
                              padding: "2px 10px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              background: C.greenLight,
                              color: C.green,
                            }}
                          >
                            Resolved
                          </span>
                        )}
                      </div>
                      {/* Student name — hidden by default */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 12, color: C.textSoft }}>
                          Student:
                        </span>
                        {isRevealed ? (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: C.text,
                            }}
                          >
                            {flag.studentName} · {flag.grade}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.textSoft,
                              fontStyle: "italic",
                              letterSpacing: ".1em",
                            }}
                          >
                            ●●●●● ●●●●●●●
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setRevealed((r) => ({
                              ...r,
                              [flag.id]: !isRevealed,
                            }))
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 6,
                            border: `1px solid ${C.border}`,
                            background: "#fff",
                            color: C.textSoft,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {isRevealed ? (
                            <EyeOff style={{ width: 11, height: 11 }} />
                          ) : (
                            <Eye style={{ width: 11, height: 11 }} />
                          )}
                          {isRevealed ? "Hide" : "Reveal"}
                        </button>
                      </div>
                      {/* Notes */}
                      <div
                        style={{
                          padding: "10px 12px",
                          background: C.bg,
                          borderRadius: 9,
                          fontSize: 13,
                          color: C.textMid,
                          lineHeight: 1.6,
                          marginBottom: 8,
                        }}
                      >
                        {flag.notes}
                      </div>
                      <div style={{ fontSize: 11, color: C.textSoft }}>
                        Flagged by: {flag.flaggedBy} · {flag.date}
                      </div>
                    </div>
                    {/* Action buttons */}
                    {flag.status === "open" && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => updateStatus(flag.id, "resolved")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 9,
                            background: C.greenLight,
                            color: C.green,
                            border: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <CheckCircle style={{ width: 13, height: 13 }} />{" "}
                          Resolve
                        </button>
                        <button
                          onClick={() => updateStatus(flag.id, "escalated")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            borderRadius: 9,
                            background: C.redLight,
                            color: C.red,
                            border: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Flag style={{ width: 13, height: 13 }} /> Escalate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. RESOURCE REQUESTS INBOX
// ─────────────────────────────────────────────────────────────────────────────
export const ResourceRequestsView = ({ uid }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", uid, "resourceRequests"),
          orderBy("createdAt", "desc"),
        ),
      );
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [uid]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "users", uid, "resourceRequests", id), {
      status,
      updatedAt: serverTimestamp(),
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  };

  const deleteRequest = async (id) => {
    await deleteDoc(doc(db, "users", uid, "resourceRequests", id));
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = requests.filter(
    (r) => filter === "all" || r.status === filter,
  );

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const urgencyConfig = {
    low: { label: "When possible", bg: C.greenLight, color: C.green },
    normal: { label: "This week", bg: C.brandLight, color: C.brand },
    urgent: { label: "Today", bg: C.redLight, color: C.red },
  };

  const statusConfig = {
    pending: { label: "Pending", bg: C.amberLight, color: C.amber },
    approved: { label: "Approved", bg: C.brandLight, color: C.brand },
    completed: { label: "Completed", bg: C.greenLight, color: C.green },
    rejected: { label: "Declined", bg: "#f1f5f9", color: C.textMid },
  };

  const categoryIcons = {
    "Stationery & supplies": "✏️",
    "Printing / photocopying": "🖨️",
    "Maintenance / repairs": "🔧",
    "IT / technology": "💻",
    Cleaning: "🧹",
    Furniture: "🪑",
    Other: "📦",
  };

  return (
    <div>
      <SectionHeader
        title="Resource Requests"
        subtitle="Staff requests for supplies and maintenance"
        color={C.amber}
        icon={Package}
      />

      {/* Summary strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          {
            key: "pending",
            label: "Pending",
            count: counts.pending,
            color: C.amber,
            bg: C.amberLight,
          },
          {
            key: "approved",
            label: "Approved",
            count: counts.approved,
            color: C.brand,
            bg: C.brandLight,
          },
          {
            key: "completed",
            label: "Completed",
            count: counts.completed,
            color: C.green,
            bg: C.greenLight,
          },
        ].map(({ key, label, count, color, bg }) => (
          <div
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: filter === key ? bg : "#fff",
              border: `1.5px solid ${filter === key ? color : C.border}`,
              cursor: "pointer",
              textAlign: "center",
              transition: "all .12s",
            }}
          >
            <div
              style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}
            >
              {count}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: filter === key ? color : C.textSoft,
                marginTop: 4,
              }}
            >
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pending", "approved", "completed", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              border: `1.5px solid ${filter === f ? C.brand : C.border}`,
              background: filter === f ? C.brandLight : "#fff",
              color: filter === f ? C.brand : C.textMid,
              cursor: "pointer",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
            {f !== "all" && `(${counts[f] || 0})`}
          </button>
        ))}
        <button
          onClick={load}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            border: `1px solid ${C.border}`,
            background: "#fff",
            color: C.textMid,
            cursor: "pointer",
          }}
        >
          <RefreshCw style={{ width: 11, height: 11 }} /> Refresh
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: C.textSoft,
            fontSize: 13,
          }}
        >
          Loading requests…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No requests"
            message={
              filter === "pending"
                ? "No pending resource requests — you're all caught up!"
                : "No requests found for this filter."
            }
          />
        </Card>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          {filtered.map((req, i) => {
            const uc = urgencyConfig[req.urgency] || urgencyConfig.normal;
            const sc = statusConfig[req.status] || statusConfig.pending;
            const emoji = categoryIcons[req.category] || "📦";

            return (
              <div
                key={req.id}
                style={{
                  borderBottom:
                    i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
                  padding: "14px 18px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
                >
                  {/* Category icon */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: C.amberLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{ fontSize: 14, fontWeight: 700, color: C.text }}
                      >
                        {req.item}
                      </span>
                      {req.quantity && (
                        <span style={{ fontSize: 12, color: C.textSoft }}>
                          × {req.quantity}
                        </span>
                      )}
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: uc.bg,
                          color: uc.color,
                        }}
                      >
                        {uc.label}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sc.bg,
                          color: sc.color,
                        }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textSoft }}>
                      {req.category} · Requested by {req.requestedBy} ·{" "}
                      {req.date}
                    </div>
                    {req.notes && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "7px 10px",
                          background: C.bg,
                          borderRadius: 8,
                          fontSize: 12,
                          color: C.textMid,
                          lineHeight: 1.5,
                        }}
                      >
                        {req.notes}
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexShrink: 0,
                      alignItems: "flex-start",
                    }}
                  >
                    {req.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(req.id, "approved")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 11px",
                            borderRadius: 9,
                            background: C.brandLight,
                            color: C.brand,
                            border: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <Check style={{ width: 12, height: 12 }} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, "rejected")}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 11px",
                            borderRadius: 9,
                            background: "#f1f5f9",
                            color: C.textMid,
                            border: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <X style={{ width: 12, height: 12 }} /> Decline
                        </button>
                      </>
                    )}
                    {req.status === "approved" && (
                      <button
                        onClick={() => updateStatus(req.id, "completed")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "6px 11px",
                          borderRadius: 9,
                          background: C.greenLight,
                          color: C.green,
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle style={{ width: 12, height: 12 }} /> Mark
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => deleteRequest(req.id)}
                      style={{
                        padding: "7px",
                        borderRadius: 9,
                        background: "#fff",
                        border: `1px solid ${C.border}`,
                        color: C.textSoft,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};
