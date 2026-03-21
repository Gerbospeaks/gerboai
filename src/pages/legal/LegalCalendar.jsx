import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Calendar,
  Plus,
  X,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Scale,
  FileText,
  Briefcase,
} from "lucide-react";

const EVENT_TYPES = {
  court: {
    label: "Court Appearance",
    color: "#7c3aed",
    bg: "bg-[#ede9fe]",
    text: "text-[#5b21b6]",
    dot: "bg-[#7c3aed]",
  },
  deadline: {
    label: "Deadline",
    color: "#dc2626",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
  meeting: {
    label: "Client Meeting",
    color: "#059669",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#059669]",
  },
  consultation: {
    label: "Consultation",
    color: "#0891b2",
    bg: "bg-[#f0fdfa]",
    text: "text-[#0e7490]",
    dot: "bg-[#0891b2]",
  },
  filing: {
    label: "Filing",
    color: "#d97706",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  discovery: {
    label: "Discovery",
    color: "#ea580c",
    bg: "bg-[#fff7ed]",
    text: "text-[#9a3412]",
    dot: "bg-[#ea580c]",
  },
  other: {
    label: "Other",
    color: "#64748b",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-colors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMPTY_FORM = {
  title: "",
  type: "court",
  date: "",
  time: "",
  endTime: "",
  location: "",
  caseNumber: "",
  clientName: "",
  description: "",
  allDay: false,
  reminder: "none",
};

export default function LegalCalendar({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [view, setView] = useState("month"); // month | week | agenda

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "calendarEvents"),
          orderBy("date", "asc"),
        ),
      );
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };

  const openAdd = (date = null) => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, date: date ? toDateStr(date) : "" });
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ ...EMPTY_FORM, ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.date) return alert("Title and date are required.");
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editItem) {
        await updateDoc(
          doc(db, "users", user.uid, "calendarEvents", editItem.id),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "calendarEvents"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Save failed.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "calendarEvents", id));
      setDeleteConfirm(null);
      load();
    } catch (_) {}
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toDateStr = (d) => d.toISOString().split("T")[0];
  const today = toDateStr(new Date());

  // Calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const getEventsForDate = (dateStr) =>
    events.filter((e) => e.date === dateStr);

  const allDayCells = [];
  // Prev month filler
  for (let i = firstDay - 1; i >= 0; i--) {
    allDayCells.push({
      day: daysInPrevMonth - i,
      current: false,
      dateStr: toDateStr(new Date(year, month - 1, daysInPrevMonth - i)),
    });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    allDayCells.push({
      day: d,
      current: true,
      dateStr: toDateStr(new Date(year, month, d)),
    });
  }
  // Next month filler
  const remaining = 42 - allDayCells.length;
  for (let d = 1; d <= remaining; d++) {
    allDayCells.push({
      day: d,
      current: false,
      dateStr: toDateStr(new Date(year, month + 1, d)),
    });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(today);
  };

  // Upcoming events (next 30 days)
  const upcoming = events.filter((e) => e.date >= today).slice(0, 10);

  // Events for selected date
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const todayEvents = getEventsForDate(today);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ede9fe] rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#7c3aed]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1e293b]">Calendar</h1>
              <p className="text-xs text-[#64748b]">
                Court dates, deadlines and appointments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-xs border border-[#e2e8f0] rounded-lg text-[#374151] hover:bg-[#f8fafc]"
            >
              Today
            </button>
            <button
              onClick={() => openAdd()}
              className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>
        </div>

        {/* Today alert */}
        {todayEvents.length > 0 && (
          <div className="bg-[#ede9fe] border border-[#c4b5fd] rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#5b21b6]">
                {todayEvents.length} event{todayEvents.length > 1 ? "s" : ""}{" "}
                today
              </p>
              {todayEvents.map((e) => {
                const t = EVENT_TYPES[e.type] || EVENT_TYPES.other;
                return (
                  <p key={e.id} className="text-xs text-[#5b21b6] mt-0.5">
                    {e.time && `${e.time} — `}
                    <span className="font-medium">{e.title}</span>
                    {e.location && ` @ ${e.location}`}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Main calendar */}
          <div className="xl:col-span-3 bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            {/* Nav */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <button
                onClick={prevMonth}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-bold text-[#1e293b]">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-semibold text-[#94a3b8] uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {allDayCells.map((cell, idx) => {
                const dayEvents = getEventsForDate(cell.dateStr);
                const isToday = cell.dateStr === today;
                const isSelected = cell.dateStr === selectedDate;
                const isWeekend = idx % 7 === 0 || idx % 7 === 6;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDate(cell.dateStr);
                    }}
                    className={`min-h-[80px] p-1.5 border-b border-r border-[#f1f5f9] cursor-pointer transition-colors
                      ${!cell.current ? "bg-[#fafafa]" : isSelected ? "bg-[#ede9fe]" : isWeekend ? "bg-[#f8fafc]" : "bg-white hover:bg-[#f8fafc]"}
                    `}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1
                      ${isToday ? "bg-[#7c3aed] text-white" : cell.current ? "text-[#374151]" : "text-[#cbd5e1]"}
                    `}
                    >
                      {cell.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const t = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(ev);
                            }}
                            className={`text-xs px-1 py-0.5 rounded truncate font-medium cursor-pointer hover:opacity-80 ${t.bg} ${t.text}`}
                          >
                            {ev.time && `${ev.time} `}
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-[#94a3b8] px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 px-5 py-3 border-t border-[#e2e8f0] bg-[#f8fafc]">
              {Object.entries(EVENT_TYPES).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${v.dot}`} />
                  <span className="text-xs text-[#64748b]">{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Selected date events */}
            {selectedDate && (
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <h3 className="text-xs font-semibold text-[#374151]">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "en-ZA",
                      { weekday: "long", day: "numeric", month: "long" },
                    )}
                  </h3>
                  <button
                    onClick={() =>
                      openAdd(new Date(selectedDate + "T00:00:00"))
                    }
                    className="p-1 text-[#7c3aed] hover:bg-[#ede9fe] rounded"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedEvents.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-[#94a3b8]">No events</p>
                    <button
                      onClick={() =>
                        openAdd(new Date(selectedDate + "T00:00:00"))
                      }
                      className="mt-2 text-xs text-[#7c3aed] hover:underline"
                    >
                      + Add event
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f1f5f9]">
                    {selectedEvents.map((ev) => {
                      const t = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                      return (
                        <div key={ev.id} className="px-4 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dot}`}
                                />
                                <span className="text-xs font-semibold text-[#1e293b] truncate">
                                  {ev.title}
                                </span>
                              </div>
                              {ev.time && (
                                <p className="text-xs text-[#64748b] flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {ev.time}
                                  {ev.endTime && ` – ${ev.endTime}`}
                                </p>
                              )}
                              {ev.location && (
                                <p className="text-xs text-[#64748b] flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3" />
                                  {ev.location}
                                </p>
                              )}
                              {ev.caseNumber && (
                                <p className="text-xs text-[#94a3b8]">
                                  Case: {ev.caseNumber}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openEdit(ev)}
                                className="p-1 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#ede9fe] rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(ev.id)}
                                className="p-1 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
                <h3 className="text-xs font-semibold text-[#374151]">
                  Upcoming Events
                </h3>
              </div>
              {upcoming.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-[#94a3b8]">No upcoming events</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f1f5f9] max-h-80 overflow-y-auto">
                  {upcoming.map((ev) => {
                    const t = EVENT_TYPES[ev.type] || EVENT_TYPES.other;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => openEdit(ev)}
                        className="px-4 py-3 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.dot}`}
                          />
                          <span className="text-xs font-semibold text-[#1e293b] truncate">
                            {ev.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748b]">
                          {new Date(ev.date + "T00:00:00").toLocaleDateString(
                            "en-ZA",
                            { day: "numeric", month: "short" },
                          )}
                          {ev.time && ` at ${ev.time}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-2">
              Delete Event
            </h3>
            <p className="text-xs text-[#64748b] mb-5">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-[#dc2626] text-white text-sm rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editItem ? "Edit Event" : "Add Event"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className={labelCls}>Event Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Smith v Jones – Trial"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Event Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                    className={selectCls}
                  >
                    {Object.entries(EVENT_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => set("endTime", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Location / Court Room</label>
                <input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="e.g. High Court WCC, Court Room 3"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Case Number</label>
                  <input
                    value={form.caseNumber}
                    onChange={(e) => set("caseNumber", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Client Name</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => set("clientName", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Notes / Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div>
                <label className={labelCls}>Reminder</label>
                <select
                  value={form.reminder}
                  onChange={(e) => set("reminder", e.target.value)}
                  className={selectCls}
                >
                  <option value="none">No reminder</option>
                  <option value="1_day">1 day before</option>
                  <option value="2_days">2 days before</option>
                  <option value="1_week">1 week before</option>
                  <option value="2_weeks">2 weeks before</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#e2e8f0] text-[#374151] text-sm rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : editItem ? "Update" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
