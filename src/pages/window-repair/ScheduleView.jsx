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
  where,
  limit,
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
  MapPin,
  Loader2,
} from "lucide-react";

// Set to false to stop creating sample events for new accounts.
const SEED_DEMO_DATA = true;

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
const FIRST_HOUR = 7;
const LAST_HOUR = 18; // grid runs 07:00 – 18:00
const START_HOURS = Array.from(
  { length: LAST_HOUR - FIRST_HOUR },
  (_, i) => i + FIRST_HOUR,
);

// Full class strings are written out so Tailwind can see every one of them.
const TYPE_COLORS = {
  "Windscreen Fitting": {
    bg: "bg-[#dbeafe]",
    text: "text-[#1d4ed8]",
    bar: "bg-[#3b82f6]",
    border: "border-[#3b82f6]",
  },
  "Window Install": {
    bg: "bg-[#f3e8ff]",
    text: "text-[#7c3aed]",
    bar: "bg-[#a855f7]",
    border: "border-[#a855f7]",
  },
  "Glass Repair": {
    bg: "bg-[#cffafe]",
    text: "text-[#0e7490]",
    bar: "bg-[#06b6d4]",
    border: "border-[#06b6d4]",
  },
  "Site Measure / Quote": {
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    bar: "bg-[#f59e0b]",
    border: "border-[#f59e0b]",
  },
  "Emergency Callout": {
    bg: "bg-[#fee2e2]",
    text: "text-[#b91c1c]",
    bar: "bg-[#ef4444]",
    border: "border-[#ef4444]",
  },
  "Workshop / Cutting": {
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    bar: "bg-[#94a3b8]",
    border: "border-[#94a3b8]",
  },
  "Supplier Delivery": {
    bg: "bg-[#fdf4ff]",
    text: "text-[#86198f]",
    bar: "bg-[#d946ef]",
    border: "border-[#d946ef]",
  },
  Admin: {
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    bar: "bg-[#22c55e]",
    border: "border-[#22c55e]",
  },
};
const TYPE_KEYS = Object.keys(TYPE_COLORS);
const FALLBACK_COLORS = TYPE_COLORS["Workshop / Cutting"];

const fmt = (h) => `${h < 10 ? "0" : ""}${h}:00`;

// Local-time YYYY-MM-DD. (toISOString would shift the day in UTC+ timezones.)
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const getMonday = (base) => {
  const d = new Date(base);
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Sample events for the current week (dayIndex 0 = Monday)
const buildSeed = (monday) =>
  [
    { title: "Windscreen Replacement – Hilux", type: "Windscreen Fitting", dayIndex: 0, startHour: 8, endHour: 10, crew: "Sipho", location: "Customer site" },
    { title: "Measure Bedroom Windows (x6)", type: "Site Measure / Quote", dayIndex: 0, startHour: 11, endHour: 13, crew: "Manager", location: "Greenview Flats" },
    { title: "Cut Toughened Panes", type: "Workshop / Cutting", dayIndex: 1, startHour: 7, endHour: 12, crew: "Andile, Johan", location: "" },
    { title: "Glass Supplier Delivery", type: "Supplier Delivery", dayIndex: 1, startHour: 14, endHour: 15, crew: "Johan", location: "Workshop" },
    { title: "Shopfront Glazing – Day 1", type: "Window Install", dayIndex: 2, startHour: 8, endHour: 16, crew: "Andile, Johan, Sipho", location: "Corner Cafe" },
    { title: "Cracked Pane Callout", type: "Emergency Callout", dayIndex: 2, startHour: 16, endHour: 17, crew: "Sipho", location: "" },
    { title: "Shopfront Glazing – Day 2", type: "Window Install", dayIndex: 3, startHour: 8, endHour: 14, crew: "Andile, Johan", location: "Corner Cafe" },
    { title: "Reseal Leaking Window", type: "Glass Repair", dayIndex: 3, startHour: 14, endHour: 16, crew: "Sipho", location: "" },
    { title: "Quotes & Supplier Orders", type: "Admin", dayIndex: 4, startHour: 8, endHour: 10, crew: "Manager", location: "" },
    { title: "Side Glass Replacement", type: "Windscreen Fitting", dayIndex: 4, startHour: 10, endHour: 12, crew: "Sipho", location: "Customer site" },
    { title: "Workshop Clean-up & Stock Take", type: "Workshop / Cutting", dayIndex: 5, startHour: 8, endHour: 12, crew: "All crew", location: "" },
  ].map(({ dayIndex, ...ev }) => ({
    ...ev,
    date: toISO(addDays(monday, dayIndex)),
  }));

const BLANK = {
  title: "",
  type: "Windscreen Fitting",
  dayIndex: 0,
  startHour: 8,
  endHour: 10,
  crew: "",
  location: "",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScheduleView({ user }) {
  const [events, setEvents] = useState([]);
  const [ready, setReady] = useState(false); // seed check finished
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState("");

  const eventsCol = () => collection(db, "users", user.uid, "scheduleEvents");

  // ── Week dates ────────────────────────────────────────────────────
  const baseMonday = addDays(getMonday(new Date()), weekOffset * 7);
  const weekDates = Array.from({ length: 6 }, (_, i) => addDays(baseMonday, i));
  const weekStartISO = toISO(weekDates[0]);
  const weekEndISO = toISO(weekDates[5]);

  const todayISO = toISO(new Date());
  const weekLabel = `${weekDates[0].getDate()} ${MONTH_NAMES[weekDates[0].getMonth()]} – ${weekDates[5].getDate()} ${MONTH_NAMES[weekDates[5].getMonth()]} ${weekDates[5].getFullYear()}`;

  // ── Seed sample events once per account ───────────────────────────
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        if (SEED_DEMO_DATA) {
          const flagKey = `wr_schedule_seeded_${user.uid}`;
          let alreadySeeded = false;
          try {
            alreadySeeded = localStorage.getItem(flagKey) === "1";
          } catch (_) {}
          if (!alreadySeeded) {
            const existing = await getDocs(query(eventsCol(), limit(1)));
            if (existing.empty) {
              const batch = writeBatch(db);
              buildSeed(getMonday(new Date())).forEach((ev) =>
                batch.set(doc(eventsCol()), {
                  ...ev,
                  createdAt: serverTimestamp(),
                }),
              );
              await batch.commit();
            }
            try {
              localStorage.setItem(flagKey, "1");
            } catch (_) {}
          }
        }
      } catch (e) {
        console.error("Schedule seed:", e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  // ── Load only the visible week ────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const q = query(
          eventsCol(),
          where("date", ">=", weekStartISO),
          where("date", "<=", weekEndISO),
          orderBy("date", "asc"),
        );
        const snap = await getDocs(q);
        if (!cancelled) {
          setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error("Schedule load:", e);
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, ready, weekStartISO, weekEndISO]);

  const dayEvents = (dayIdx) =>
    events
      .filter((e) => e.date === toISO(weekDates[dayIdx]))
      .sort((a, b) => a.startHour - b.startHour);

  // ── CRUD ──────────────────────────────────────────────────────────
  const openAdd = (dayIndex = 0) => {
    setForm({ ...BLANK, dayIndex });
    setEditId(null);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (ev) => {
    const idx = weekDates.findIndex((d) => toISO(d) === ev.date);
    setForm({ ...BLANK, ...ev, dayIndex: idx >= 0 ? idx : 0 });
    setEditId(ev.id);
    setFormError("");
    setShowModal(true);
  };

  const setStart = (h) =>
    setForm((f) => ({
      ...f,
      startHour: h,
      endHour: Number(f.endHour) <= h ? Math.min(h + 1, LAST_HOUR) : f.endHour,
    }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("Enter a title for this job.");
      return;
    }
    setFormError("");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      type: form.type,
      date: toISO(weekDates[Number(form.dayIndex)]),
      startHour: Number(form.startHour),
      endHour: Number(form.endHour),
      crew: (form.crew || "").trim(),
      location: (form.location || "").trim(),
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "scheduleEvents", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setEvents((prev) =>
          prev.map((e) => (e.id === editId ? { ...e, ...payload } : e)),
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
      setFormError("Could not save this job. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job from the schedule?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "scheduleEvents", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setShowModal(false);
    } catch (e) {
      console.error("Delete event:", e);
      setFormError("Could not delete this job. Try again.");
    }
  };

  // ── Stats (for the visible week) ──────────────────────────────────
  const weekEvents = events.filter(
    (e) => e.date >= weekStartISO && e.date <= weekEndISO,
  );
  const totalJobHours = weekEvents.reduce(
    (s, e) => s + (e.endHour - e.startHour),
    0,
  );
  const freeDays = weekDates.filter(
    (d) => !weekEvents.some((e) => e.date === toISO(d)),
  ).length;

  // ── Loading ───────────────────────────────────────────────────────
  if (!ready || (loading && events.length === 0)) {
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
              title="Previous week"
              className="px-2.5 py-1.5 bg-white text-[#64748b] hover:bg-[#f8fafc] border-r border-[#e2e8f0]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              title="Next week"
              className="px-2.5 py-1.5 bg-white text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add job
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Jobs this week",
            value: weekEvents.length,
            color: "text-[#1e293b]",
            bg: "bg-[#f8fafc]",
          },
          {
            label: "Hours booked",
            value: `${totalJobHours}h`,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
          },
          {
            label: "Days with no jobs",
            value: freeDays,
            color: freeDays > 0 ? "text-[#059669]" : "text-[#1e293b]",
            bg: freeDays > 0 ? "bg-[#f0fdf4]" : "bg-[#f8fafc]",
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
            gridTemplateColumns: "repeat(6, minmax(160px, 1fr))",
            minHeight: 500,
          }}
        >
          {weekDates.map((date, dayIdx) => {
            const isToday = toISO(date) === todayISO;
            const evs = dayEvents(dayIdx);
            const dayHours = evs.reduce(
              (s, e) => s + (e.endHour - e.startHour),
              0,
            );
            return (
              <div
                key={dayIdx}
                className={`flex flex-col rounded-xl border overflow-hidden ${
                  isToday
                    ? "border-[#2563eb] shadow-lg ring-1 ring-[#2563eb]/20"
                    : "border-[#e2e8f0]"
                }`}
              >
                {/* Day header */}
                <div
                  className={`px-3 py-2.5 flex items-center justify-between flex-shrink-0 border-b ${
                    isToday
                      ? "bg-[#2563eb] border-[#1d4ed8]"
                      : "bg-[#f8fafc] border-[#e2e8f0]"
                  }`}
                >
                  <div>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isToday ? "text-[#dbeafe]" : "text-[#94a3b8]"
                      }`}
                    >
                      {DAY_NAMES[dayIdx]}
                    </p>
                    <p
                      className={`text-xl font-bold leading-tight ${
                        isToday ? "text-white" : "text-[#1e293b]"
                      }`}
                    >
                      {date.getDate()}
                    </p>
                    {dayHours > 0 && (
                      <p
                        className={`text-[10px] ${
                          isToday ? "text-[#bfdbfe]" : "text-[#94a3b8]"
                        }`}
                      >
                        {dayHours}h booked
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openAdd(dayIdx)}
                    title={`Add job on ${DAY_NAMES[dayIdx]}`}
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
                      isToday
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-white border border-[#e2e8f0] text-[#94a3b8] hover:text-[#2563eb] hover:border-[#2563eb]"
                    }`}
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
                      const colors = TYPE_COLORS[ev.type] || FALLBACK_COLORS;
                      const duration = ev.endHour - ev.startHour;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => openEdit(ev)}
                          className={`${colors.bg} ${colors.border} rounded-lg p-2.5 cursor-pointer hover:opacity-75 transition-opacity border-l-[3px]`}
                        >
                          <p
                            className={`text-xs font-bold ${colors.text} leading-tight`}
                          >
                            {ev.title}
                          </p>
                          <p className="text-[10px] text-[#64748b] mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                            {fmt(ev.startHour)} – {fmt(ev.endHour)}
                            <span className="ml-1 text-[#94a3b8]">
                              ({duration}h)
                            </span>
                          </p>
                          {ev.location && (
                            <p className="text-[10px] text-[#64748b] mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                              {ev.location}
                            </p>
                          )}
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
          Job types
        </span>
        {Object.entries(TYPE_COLORS).map(([name, colors]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${colors.bar}`} />
            <span className="text-xs text-[#64748b]">{name}</span>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editId ? "Edit job" : "Add job"}
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
                  placeholder="e.g. Windscreen replacement, measure kitchen window"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Job type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value }))
                  }
                  className={inputCls}
                >
                  {TYPE_KEYS.map((k) => (
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
                      {d} — {weekDates[i].getDate()}{" "}
                      {MONTH_NAMES[weekDates[i].getMonth()]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start</label>
                  <select
                    value={form.startHour}
                    onChange={(e) => setStart(Number(e.target.value))}
                    className={inputCls}
                  >
                    {START_HOURS.map((h) => (
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
                      setForm((f) => ({ ...f, endHour: Number(e.target.value) }))
                    }
                    className={inputCls}
                  >
                    {Array.from(
                      { length: LAST_HOUR - Number(form.startHour) },
                      (_, i) => Number(form.startHour) + 1 + i,
                    ).map((h) => (
                      <option key={h} value={h}>
                        {fmt(h)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Site / vehicle</label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="e.g. 12 Oak Street, or 2019 Toyota Hilux"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Crew / assigned</label>
                <input
                  value={form.crew}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, crew: e.target.value }))
                  }
                  placeholder="e.g. Sipho, Andile"
                  className={inputCls}
                />
              </div>
              {formError && (
                <p className="text-xs font-medium text-[#dc2626]">{formError}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between sticky bottom-0 bg-white">
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Save changes" : "Add job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
