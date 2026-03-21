import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  Users,
  Loader2,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00–18:00

const PROJECT_COLORS = {
  "Smith Kitchen": {
    bg: "bg-[#dbeafe]",
    text: "text-[#1d4ed8]",
    bar: "bg-[#3b82f6]",
  },
  "Riverside Office": {
    bg: "bg-[#f3e8ff]",
    text: "text-[#7c3aed]",
    bar: "bg-[#a855f7]",
  },
  "Ndlovu Bedroom": {
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    bar: "bg-[#22c55e]",
  },
  "Van der Berg": {
    bg: "bg-[#fff7ed]",
    text: "text-[#c2410c]",
    bar: "bg-[#f97316]",
  },
  Workshop: { bg: "bg-[#f1f5f9]", text: "text-[#475569]", bar: "bg-[#94a3b8]" },
  Admin: { bg: "bg-[#fef3c7]", text: "text-[#92400e]", bar: "bg-[#f59e0b]" },
  Delivery: { bg: "bg-[#fdf4ff]", text: "text-[#86198f]", bar: "bg-[#d946ef]" },
};
const PROJECT_KEYS = Object.keys(PROJECT_COLORS);

const fmt = (h) => `${h < 10 ? "0" : ""}${h}:00`;

const getMonday = (base) => {
  const d = new Date(base);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

// Seed events are stored relative to current Monday (dayIndex = 0..5)
const buildSeed = () => [
  {
    title: "Cabinet Installation",
    project: "Smith Kitchen",
    dayIndex: 0,
    startHour: 8,
    endHour: 16,
    crew: "Pieter, Johan",
  },
  {
    title: "Cabinet Installation",
    project: "Smith Kitchen",
    dayIndex: 1,
    startHour: 8,
    endHour: 13,
    crew: "Pieter, Johan",
  },
  {
    title: "Riverside Site Meeting",
    project: "Riverside Office",
    dayIndex: 1,
    startHour: 14,
    endHour: 16,
    crew: "Manager",
  },
  {
    title: "Finishing & Sanding",
    project: "Ndlovu Bedroom",
    dayIndex: 2,
    startHour: 9,
    endHour: 15,
    crew: "Sipho, Andile",
  },
  {
    title: "Cabinet Machining",
    project: "Workshop",
    dayIndex: 3,
    startHour: 7,
    endHour: 17,
    crew: "All crew",
  },
  {
    title: "Timber City Delivery",
    project: "Delivery",
    dayIndex: 3,
    startHour: 14,
    endHour: 15,
    crew: "",
  },
  {
    title: "Site Measure",
    project: "Van der Berg",
    dayIndex: 4,
    startHour: 9,
    endHour: 11,
    crew: "Pieter",
  },
  {
    title: "Quote Preparation",
    project: "Admin",
    dayIndex: 4,
    startHour: 14,
    endHour: 16,
    crew: "Manager",
  },
  {
    title: "Workshop Clean-up",
    project: "Workshop",
    dayIndex: 5,
    startHour: 8,
    endHour: 12,
    crew: "All crew",
  },
];

const BLANK = {
  title: "",
  project: "Smith Kitchen",
  dayIndex: 0,
  startHour: 8,
  endHour: 10,
  crew: "",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#b45309]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScheduleView({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);

  const eventsCol = () => collection(db, "users", user.uid, "scheduleEvents");

  // ── Load from Firestore, seed on first visit ──────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const q = query(eventsCol(), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);

        if (snap.empty) {
          const batch = writeBatch(db);
          buildSeed().forEach((ev) => {
            batch.set(doc(eventsCol()), {
              ...ev,
              createdAt: serverTimestamp(),
            });
          });
          await batch.commit();
          const snap2 = await getDocs(
            query(eventsCol(), orderBy("createdAt", "asc")),
          );
          setEvents(snap2.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error("Schedule load:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  // ── Week dates ────────────────────────────────────────────────────
  const baseMonday = getMonday(new Date());
  baseMonday.setDate(baseMonday.getDate() + weekOffset * 7);
  const weekDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    return d;
  });

  const todayTs = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const isToday = (date) => date.getTime() === todayTs;
  const weekLabel = `${weekDates[0].getDate()} ${MONTH_NAMES[weekDates[0].getMonth()]} – ${weekDates[5].getDate()} ${MONTH_NAMES[weekDates[5].getMonth()]} ${weekDates[0].getFullYear()}`;

  const dayEvents = (dayIdx) =>
    events
      .filter((e) => e.dayIndex === dayIdx)
      .sort((a, b) => a.startHour - b.startHour);

  // ── CRUD ──────────────────────────────────────────────────────────
  const openAdd = (dayIndex = 0) => {
    setForm({ ...BLANK, dayIndex });
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (ev) => {
    setForm({ ...ev });
    setEditId(ev.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      project: form.project,
      dayIndex: Number(form.dayIndex),
      startHour: Number(form.startHour),
      endHour: Number(form.endHour),
      crew: form.crew.trim(),
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "scheduleEvents", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setEvents((prev) =>
          prev.map((e) => (e.id === editId ? { id: editId, ...payload } : e)),
        );
      } else {
        const ref = await addDoc(eventsCol(), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setEvents((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Save event:", e);
      alert("Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "scheduleEvents", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setShowModal(false);
    } catch (e) {
      alert("Failed to delete event.");
    }
  };

  const totalJobHours = events.reduce(
    (s, e) => s + (e.endHour - e.startHour),
    0,
  );

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading schedule…</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Schedule</h1>
          <p className="text-xs text-[#64748b] mt-0.5">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 text-xs font-medium border border-[#e2e8f0] bg-white text-[#374151] rounded-lg hover:bg-[#f8fafc]"
          >
            This week
          </button>
          <div className="flex border border-[#e2e8f0] rounded-lg overflow-hidden">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="px-2.5 py-1.5 bg-white text-[#64748b] hover:bg-[#f8fafc] border-r border-[#e2e8f0]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-2.5 py-1.5 bg-white text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-medium rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Jobs this week",
            value: events.length,
            color: "text-[#1e293b]",
            bg: "bg-[#f8fafc]",
          },
          {
            label: "Scheduled hours",
            value: `${totalJobHours}h`,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
          },
          {
            label: "Active projects",
            value: [...new Set(events.map((e) => e.project))].length,
            color: "text-[#b45309]",
            bg: "bg-[#fff7ed]",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(6, minmax(150px, 1fr))",
            minHeight: 500,
          }}
        >
          {weekDates.map((date, dayIdx) => {
            const today_ = isToday(date);
            const evs = dayEvents(dayIdx);
            const dayHours = evs.reduce(
              (s, e) => s + (e.endHour - e.startHour),
              0,
            );
            return (
              <div
                key={dayIdx}
                className={`flex flex-col rounded-xl border overflow-hidden ${today_ ? "border-[#b45309] shadow-lg ring-1 ring-[#b45309]/20" : "border-[#e2e8f0]"}`}
              >
                {/* Day header */}
                <div
                  className={`px-3 py-2.5 flex items-center justify-between flex-shrink-0 border-b ${today_ ? "bg-[#b45309] border-[#92400e]" : "bg-[#f8fafc] border-[#e2e8f0]"}`}
                >
                  <div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${today_ ? "text-[#fef3c7]" : "text-[#94a3b8]"}`}
                    >
                      {DAY_NAMES[dayIdx]}
                    </p>
                    <p
                      className={`text-xl font-bold leading-tight ${today_ ? "text-white" : "text-[#1e293b]"}`}
                    >
                      {date.getDate()}
                    </p>
                    {dayHours > 0 && (
                      <p
                        className={`text-[10px] ${today_ ? "text-[#fde68a]" : "text-[#94a3b8]"}`}
                      >
                        {dayHours}h booked
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openAdd(dayIdx)}
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${today_ ? "bg-white/20 text-white hover:bg-white/30" : "bg-white border border-[#e2e8f0] text-[#94a3b8] hover:text-[#b45309] hover:border-[#b45309]"}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Events */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-white min-h-[280px]">
                  {evs.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-6">
                      <p className="text-xs text-[#cbd5e1]">No jobs</p>
                    </div>
                  ) : (
                    evs.map((ev) => {
                      const colors =
                        PROJECT_COLORS[ev.project] ||
                        PROJECT_COLORS["Workshop"];
                      const duration = ev.endHour - ev.startHour;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => openEdit(ev)}
                          className={`${colors.bg} rounded-lg p-2.5 cursor-pointer hover:opacity-75 transition-opacity border-l-[3px] ${colors.bar.replace("bg-", "border-")}`}
                        >
                          <p
                            className={`text-xs font-bold ${colors.text} leading-tight truncate`}
                          >
                            {ev.title}
                          </p>
                          <p className="text-[10px] text-[#64748b] mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {fmt(ev.startHour)} – {fmt(ev.endHour)}
                            <span className="ml-1 text-[#94a3b8]">
                              ({duration}h)
                            </span>
                          </p>
                          {ev.crew && (
                            <p className="text-[10px] text-[#64748b] mt-0.5 flex items-center gap-1 truncate">
                              <Users className="w-2.5 h-2.5 flex-shrink-0" />
                              {ev.crew}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3">
        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mr-1">
          Projects
        </span>
        {Object.entries(PROJECT_COLORS).map(([proj, colors]) => (
          <div key={proj} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors.bar}`} />
            <span className="text-xs text-[#64748b]">{proj}</span>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editId ? "Edit Event" : "Add Event"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Cabinet Installation"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Project</label>
                <select
                  value={form.project}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, project: e.target.value }))
                  }
                  className={inputCls}
                >
                  {PROJECT_KEYS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Day</label>
                <select
                  value={form.dayIndex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dayIndex: Number(e.target.value) }))
                  }
                  className={inputCls}
                >
                  {DAY_NAMES.map((d, i) => (
                    <option key={d} value={i}>
                      {d} — {weekDates[i]?.getDate()}{" "}
                      {MONTH_NAMES[weekDates[i]?.getMonth()]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start</label>
                  <select
                    value={form.startHour}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        startHour: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {fmt(h)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>End</label>
                  <select
                    value={form.endHour}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        endHour: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  >
                    {HOURS.filter((h) => h > Number(form.startHour)).map(
                      (h) => (
                        <option key={h} value={h}>
                          {fmt(h)}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Crew / Assigned</label>
                <input
                  value={form.crew}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, crew: e.target.value }))
                  }
                  placeholder="e.g. Pieter, Johan"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between">
              {editId ? (
                <button
                  onClick={() => handleDelete(editId)}
                  className="px-4 py-2 text-sm font-medium text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2]"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#b45309] hover:bg-[#92400e] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Update" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
