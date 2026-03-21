// ════════════════════════════════════════════════════════════════════════════
// FlooringScheduleView.jsx  →  users/{uid}/flooringSchedule
// ════════════════════════════════════════════════════════════════════════════
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
  getDocs as _getDocs,
  query as _query,
  collection as _collection,
  orderBy as _orderBy,
  limit, 
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
  FileText,
  Receipt,
  DollarSign,
  TrendingUp,
  BarChart3,
  Layers,
} from "lucide-react";

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
const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 06:00–18:00

const PROJECT_COLORS = {
  "Sandton Penthouse": {
    bg: "bg-[#fff7ed]",
    text: "text-[#c2410c]",
    bar: "bg-[#f97316]",
  },
  "Rosebank Office Fit-out": {
    bg: "bg-[#f3e8ff]",
    text: "text-[#7c3aed]",
    bar: "bg-[#a855f7]",
  },
  "Fourways Mall Retail": {
    bg: "bg-[#dbeafe]",
    text: "text-[#1d4ed8]",
    bar: "bg-[#3b82f6]",
  },
  "Hyde Park Residence": {
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    bar: "bg-[#22c55e]",
  },
  "Delivery / Offload": {
    bg: "bg-[#fdf4ff]",
    text: "text-[#86198f]",
    bar: "bg-[#d946ef]",
  },
  "Workshop / Prep": {
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    bar: "bg-[#f59e0b]",
  },
  Admin: { bg: "bg-[#f1f5f9]", text: "text-[#475569]", bar: "bg-[#94a3b8]" },
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

const buildSeed = () => [
  {
    title: "Screed levelling — Lounge",
    project: "Sandton Penthouse",
    dayIndex: 0,
    startHour: 7,
    endHour: 13,
    crew: "Pieter, Sipho",
  },
  {
    title: "Hardwood installation — Bedroom 1",
    project: "Sandton Penthouse",
    dayIndex: 1,
    startHour: 7,
    endHour: 16,
    crew: "Johan, Andile",
  },
  {
    title: "Sub-floor DPM membrane",
    project: "Rosebank Office Fit-out",
    dayIndex: 1,
    startHour: 7,
    endHour: 14,
    crew: "Crew B (3 men)",
  },
  {
    title: "Site measure & moisture test",
    project: "Hyde Park Residence",
    dayIndex: 2,
    startHour: 9,
    endHour: 11,
    crew: "Pieter",
  },
  {
    title: "Tile grout — Section A",
    project: "Fourways Mall Retail",
    dayIndex: 2,
    startHour: 7,
    endHour: 16,
    crew: "Sipho, Blessing",
  },
  {
    title: "LVT plank layout — Floor 1",
    project: "Rosebank Office Fit-out",
    dayIndex: 3,
    startHour: 6,
    endHour: 17,
    crew: "Andile, Pieter",
  },
  {
    title: "Material offload — Oak delivery",
    project: "Delivery / Offload",
    dayIndex: 3,
    startHour: 9,
    endHour: 11,
    crew: "",
  },
  {
    title: "Skirting & transition strips",
    project: "Fourways Mall Retail",
    dayIndex: 4,
    startHour: 8,
    endHour: 13,
    crew: "Blessing",
  },
  {
    title: "Hardwood sanding & finishing",
    project: "Sandton Penthouse",
    dayIndex: 4,
    startHour: 7,
    endHour: 16,
    crew: "Johan, Sipho",
  },
  {
    title: "Board cutting & prep",
    project: "Workshop / Prep",
    dayIndex: 4,
    startHour: 14,
    endHour: 17,
    crew: "Andile",
  },
  {
    title: "Site clean & quality check",
    project: "Admin",
    dayIndex: 5,
    startHour: 8,
    endHour: 12,
    crew: "All crew",
  },
];

const BLANK = {
  title: "",
  project: "Sandton Penthouse",
  dayIndex: 0,
  startHour: 7,
  endHour: 10,
  crew: "",
};
const iCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#d97706]";
const lCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

export function FlooringScheduleView({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);

  const eventsCol = () => collection(db, "users", user.uid, "flooringSchedule");

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(eventsCol(), orderBy("createdAt", "asc")),
        );
        if (snap.empty) {
          const batch = writeBatch(db);
          buildSeed().forEach((ev) =>
            batch.set(doc(eventsCol()), {
              ...ev,
              createdAt: serverTimestamp(),
            }),
          );
          await batch.commit();
          const snap2 = await getDocs(
            query(eventsCol(), orderBy("createdAt", "asc")),
          );
          setEvents(snap2.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

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
  const totalHours = events.reduce((s, e) => s + (e.endHour - e.startHour), 0);

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
      crew: form.crew.trim(),
      dayIndex: Number(form.dayIndex),
      startHour: Number(form.startHour),
      endHour: Number(form.endHour),
    };
    try {
      if (editId) {
        await updateDoc(
          doc(db, "users", user.uid, "flooringSchedule", editId),
          { ...payload, updatedAt: serverTimestamp() },
        );
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
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "flooringSchedule", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setShowModal(false);
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading schedule…</span>
      </div>
    );

  return (
    <div className="space-y-5">
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
            className="flex items-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

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
            value: `${totalHours}h`,
            color: "text-[#d97706]",
            bg: "bg-[#fffbeb]",
          },
          {
            label: "Active sites",
            value: [...new Set(events.map((e) => e.project))].length,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
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
                className={`flex flex-col rounded-xl border overflow-hidden ${today_ ? "border-[#d97706] shadow-lg ring-1 ring-[#d97706]/20" : "border-[#e2e8f0]"}`}
              >
                <div
                  className={`px-3 py-2.5 flex items-center justify-between flex-shrink-0 border-b ${today_ ? "bg-[#d97706] border-[#b45309]" : "bg-[#f8fafc] border-[#e2e8f0]"}`}
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
                        className={`text-[10px] ${today_ ? "text-[#fef3c7]" : "text-[#94a3b8]"}`}
                      >
                        {dayHours}h booked
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openAdd(dayIdx)}
                    className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${today_ ? "bg-white/20 text-white hover:bg-white/30" : "bg-white border border-[#e2e8f0] text-[#94a3b8] hover:text-[#d97706] hover:border-[#d97706]"}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-white min-h-[280px]">
                  {evs.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-6">
                      <p className="text-xs text-[#cbd5e1]">No jobs</p>
                    </div>
                  ) : (
                    evs.map((ev) => {
                      const colors =
                        PROJECT_COLORS[ev.project] || PROJECT_COLORS["Admin"];
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
                              ({ev.endHour - ev.startHour}h)
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editId ? "Edit Job" : "Add Job"}
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
                <label className={lCls}>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Hardwood installation — Bedroom 1"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Project / Site</label>
                <select
                  value={form.project}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, project: e.target.value }))
                  }
                  className={iCls}
                >
                  {PROJECT_KEYS.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lCls}>Day</label>
                <select
                  value={form.dayIndex}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dayIndex: Number(e.target.value) }))
                  }
                  className={iCls}
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
                  <label className={lCls}>Start</label>
                  <select
                    value={form.startHour}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        startHour: Number(e.target.value),
                      }))
                    }
                    className={iCls}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {fmt(h)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lCls}>End</label>
                  <select
                    value={form.endHour}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        endHour: Number(e.target.value),
                      }))
                    }
                    className={iCls}
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
                <label className={lCls}>Crew / Assigned</label>
                <input
                  value={form.crew}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, crew: e.target.value }))
                  }
                  placeholder="e.g. Johan, Sipho"
                  className={iCls}
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#d97706] hover:bg-[#b45309] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Update" : "Add Job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FlooringReportsView.jsx
// Independently fetches users/{uid}/quotes AND users/{uid}/invoices
// ════════════════════════════════════════════════════════════════════════════


const fmtRv = (n) =>
  `R${(n || 0).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

export function FlooringReportsView({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const [qSnap, iSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "users", user.uid, "quotes"),
              orderBy("createdAt", "desc"),
              limit(200),
            ),
          ),
          getDocs(
            query(
              collection(db, "users", user.uid, "invoices"),
              orderBy("createdAt", "desc"),
              limit(200),
            ),
          ),
        ]);
        setQuotes(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setInvoices(iSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const partialInvoices = invoices.filter((i) => i.status === "partially_paid");
  const pendingInvoices = invoices.filter(
    (i) => !i.status || i.status === "pending",
  );
  const totalRevenue = paidInvoices.reduce(
    (s, i) => s + (i.totals?.total || 0),
    0,
  );
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.totals?.due ?? i.totals?.total ?? 0), 0);
  const conversionRate =
    quotes.length > 0
      ? Math.round(
          (quotes.filter((q) => q.convertedToInvoice).length / quotes.length) *
            100,
        )
      : 0;

  const workCategoryTotals = {};
  [...quotes, ...invoices].forEach((d) => {
    (d.items || []).forEach((item) => {
      const cat = item.workCategory || "Other";
      workCategoryTotals[cat] =
        (workCategoryTotals[cat] || 0) + (item.totalAmount || 0);
    });
  });
  const topCategories = Object.entries(workCategoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading reports…</span>
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-bold text-[#1e293b]">Reports</h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          Financial and job overview
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Quotes",
            value: quotes.length,
            icon: FileText,
            color: "text-[#d97706]",
            bg: "bg-[#fffbeb]",
            iconBg: "bg-[#fef3c7]",
          },
          {
            label: "Total Invoices",
            value: invoices.length,
            icon: Receipt,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
            iconBg: "bg-[#dbeafe]",
          },
          {
            label: "Total Revenue",
            value: fmtRv(totalRevenue),
            icon: DollarSign,
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
            iconBg: "bg-[#dcfce7]",
          },
          {
            label: "Outstanding",
            value: fmtRv(totalOutstanding),
            icon: Clock,
            color: "text-[#dc2626]",
            bg: "bg-[#fef2f2]",
            iconBg: "bg-[#fee2e2]",
          },
        ].map(({ label, value, icon: Icon, color, bg, iconBg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                {label}
              </p>
              <div
                className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Paid",
            value: paidInvoices.length,
            sub: `${fmtRv(paidInvoices.reduce((s, i) => s + (i.totals?.paid || 0), 0))} collected`,
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
          },
          {
            label: "Partial",
            value: partialInvoices.length,
            sub: "Awaiting balance",
            color: "text-[#d97706]",
            bg: "bg-[#fffbeb]",
          },
          {
            label: "Conversion",
            value: `${conversionRate}%`,
            sub: `${quotes.filter((q) => q.convertedToInvoice).length}/${quotes.length} converted`,
            color: "text-[#7c3aed]",
            bg: "bg-[#faf5ff]",
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm font-semibold text-[#374151]">
            Invoice Status Breakdown
          </span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-12 text-center">
            <Receipt className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
            <p className="text-sm text-[#94a3b8]">No invoices yet</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {[
              {
                label: "Paid",
                count: paidInvoices.length,
                amount: paidInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#059669]",
              },
              {
                label: "Partial",
                count: partialInvoices.length,
                amount: partialInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#d97706]",
              },
              {
                label: "Pending",
                count: pendingInvoices.length,
                amount: pendingInvoices.reduce(
                  (s, i) => s + (i.totals?.total || 0),
                  0,
                ),
                cls: "bg-[#2563eb]",
              },
            ].map(({ label, count, amount, cls }) => {
              const barPct =
                invoices.length > 0
                  ? Math.round((count / invoices.length) * 100)
                  : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cls}`} />
                      <span className="text-sm text-[#374151] font-medium">
                        {label}
                      </span>
                      <span className="text-xs text-[#94a3b8]">({count})</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1e293b]">
                      {fmtRv(amount)}
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                    <div
                      className={`${cls} h-2 rounded-full`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {topCategories.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d97706]" />
            <span className="text-sm font-semibold text-[#374151]">
              Top Work Categories by Revenue
            </span>
          </div>
          <div className="p-5 space-y-3">
            {topCategories.map(([cat, total], i) => {
              const barPct =
                topCategories[0][1] > 0
                  ? Math.round((total / topCategories[0][1]) * 100)
                  : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#94a3b8] w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#374151] font-medium">
                        {cat}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#1e293b]">
                      {fmtRv(total)}
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                    <div
                      className="bg-[#d97706] h-1.5 rounded-full"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#64748b]" />
          <span className="text-sm font-semibold text-[#374151]">
            Recent Invoices
          </span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#94a3b8]">
            No invoices yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Invoice #",
                    "Client",
                    "Site Type",
                    "Total",
                    "Paid",
                    "Balance",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 10).map((inv) => {
                  const statusCls =
                    inv.status === "paid"
                      ? "bg-[#dcfce7] text-[#166534]"
                      : inv.status === "partially_paid"
                        ? "bg-[#fef3c7] text-[#92400e]"
                        : "bg-[#dbeafe] text-[#1e40af]";
                  const balance =
                    (inv.totals?.due ?? inv.totals?.total ?? 0) -
                    (inv.totals?.paid ?? 0);
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#d97706]">
                        {inv.quoteNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {inv.customer?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">
                        {inv.siteDetails?.type || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                        {fmtRv(inv.totals?.total)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#059669] font-medium">
                        {fmtRv(inv.totals?.paid)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#dc2626]">
                        {fmtRv(Math.max(0, balance))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${statusCls}`}
                        >
                          {inv.status === "partially_paid"
                            ? "Partial"
                            : inv.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
