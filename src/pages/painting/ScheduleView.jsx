import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Paintbrush,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const STATUS_META = {
  scheduled: {
    label: "Scheduled",
    color: "bg-amber-500",
    text: "text-amber-400",
    icon: Circle,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-500",
    text: "text-blue-400",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500",
    text: "text-emerald-400",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-rose-500",
    text: "text-rose-400",
    icon: X,
  },
};

const JOB_TYPES = [
  "Interior Painting",
  "Exterior Painting",
  "Roof Coating",
  "Waterproofing",
  "Plastering",
  "Wallpaper",
  "Epoxy Flooring",
  "Spray Painting",
  "Touch-ups",
  "Other",
];

const COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#f97316",
  "#06b6d4",
  "#ec4899",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}
function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ── Job Modal ─────────────────────────────────────────────────────────────────
function JobModal({ date, onClose, onSave, existing }) {
  const [form, setForm] = useState(
    existing ?? {
      title: "",
      client: "",
      address: "",
      jobType: "Interior Painting",
      startTime: "08:00",
      endTime: "17:00",
      status: "scheduled",
      color: COLORS[0],
      notes: "",
      date: date || "",
    },
  );

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-700 bg-stone-800">
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            {existing ? "Edit Job" : "Schedule New Job"}
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              Job Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Interior repaint – living areas"
              className="w-full bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Client + Job Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Client
              </label>
              <input
                value={form.client}
                onChange={(e) => set("client", e.target.value)}
                placeholder="Client name"
                className="w-full bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Job Type
              </label>
              <select
                value={form.jobType}
                onChange={(e) => set("jobType", e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full bg-stone-800 border border-stone-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              Site Address
            </label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="45 Corporate Boulevard, Sandton"
              className="w-full bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-2">
              Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => set("status", key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    form.status === key
                      ? `${meta.color} text-white border-transparent`
                      : "bg-stone-800 text-stone-400 border-stone-600 hover:border-stone-400"
                  }`}
                >
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-2">
              Tag Colour
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("color", c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"}`}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-400 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Any special instructions or notes..."
              className="w-full bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-stone-700 bg-stone-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-stone-700 text-stone-300 rounded-xl text-sm font-semibold hover:bg-stone-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (form.title && form.date) onSave(form);
            }}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl text-sm font-bold hover:from-amber-700 hover:to-orange-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {existing ? "Update Job" : "Schedule Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ScheduleView ─────────────────────────────────────────────────────────
export default function ScheduleView({ user }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const colRef = user?.uid
    ? collection(db, "users", user.uid, "schedule")
    : null;

  // Load jobs
  useEffect(() => {
    if (!colRef) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const saveJob = async (form) => {
    if (!colRef) return;
    if (editingJob) {
      await updateDoc(doc(db, "users", user.uid, "schedule", editingJob.id), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      setJobs((p) =>
        p.map((j) => (j.id === editingJob.id ? { ...j, ...form } : j)),
      );
    } else {
      const ref = await addDoc(colRef, {
        ...form,
        createdAt: serverTimestamp(),
      });
      setJobs((p) => [{ id: ref.id, ...form }, ...p]);
    }
    setShowModal(false);
    setEditingJob(null);
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await deleteDoc(doc(db, "users", user.uid, "schedule", id));
    setJobs((p) => p.filter((j) => j.id !== id));
    setSelectedJob(null);
  };

  // Calendar helpers
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const cells = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const jobsOnDay = (day) => {
    if (!day) return [];
    const ds = toDateStr(year, month, day);
    return jobs.filter((j) => j.date === ds);
  };

  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Upcoming jobs (next 30 days)
  const upcoming = [...jobs]
    .filter((j) => j.date >= todayStr && j.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="h-full flex flex-col gap-6 p-1">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Job Schedule
          </h1>
          <p className="text-stone-400 text-sm mt-0.5 ml-12">
            Plan and track your painting jobs
          </p>
        </div>
        <button
          onClick={() => {
            setEditingJob(null);
            setSelectedDate(todayStr);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-sm hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-amber-500/30"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 flex-col xl:flex-row">
        {/* ── Calendar ─────────────────────────────────────────────── */}
        <div className="flex-1 bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden shadow-xl">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-700 bg-stone-800">
            <button
              onClick={() => {
                if (month === 0) {
                  setMonth(11);
                  setYear((y) => y - 1);
                } else setMonth((m) => m - 1);
              }}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => {
                if (month === 11) {
                  setMonth(0);
                  setYear((y) => y + 1);
                } else setMonth((m) => m + 1);
              }}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-stone-700">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 flex-1">
            {cells.map((day, idx) => {
              const dayJobs = jobsOnDay(day);
              const ds = day ? toDateStr(year, month, day) : "";
              const isToday = ds === todayStr;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!day) return;
                    setEditingJob(null);
                    setSelectedDate(ds);
                    setShowModal(true);
                  }}
                  className={`min-h-[80px] p-1.5 border-b border-r border-stone-800 cursor-pointer transition-colors group ${
                    day ? "hover:bg-stone-800" : "bg-stone-950/30"
                  }`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-xs font-bold inline-flex w-6 h-6 items-center justify-center rounded-full mb-1 ${
                          isToday
                            ? "bg-amber-500 text-white"
                            : "text-stone-400 group-hover:text-white"
                        }`}
                      >
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {dayJobs.slice(0, 3).map((j) => (
                          <div
                            key={j.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(j);
                            }}
                            className="text-xs truncate rounded px-1 py-0.5 text-white font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: j.color || "#f59e0b" }}
                          >
                            {j.title}
                          </div>
                        ))}
                        {dayJobs.length > 3 && (
                          <div className="text-xs text-stone-500 pl-1">
                            +{dayJobs.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar: upcoming + detail ───────────────────────────── */}
        <div className="w-full xl:w-72 flex flex-col gap-4">
          {/* Job detail panel */}
          {selectedJob && (
            <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: selectedJob.color }}
                />
                <div className="flex-1 ml-3">
                  <h3 className="font-bold text-white text-sm leading-tight">
                    {selectedJob.title}
                  </h3>
                  <span
                    className={`text-xs font-semibold ${STATUS_META[selectedJob.status]?.text || "text-stone-400"}`}
                  >
                    {STATUS_META[selectedJob.status]?.label ||
                      selectedJob.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-stone-500 hover:text-white transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-stone-400">
                {selectedJob.client && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 flex-shrink-0" />
                    {selectedJob.client}
                  </div>
                )}
                {selectedJob.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {selectedJob.address}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  {selectedJob.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {selectedJob.startTime} – {selectedJob.endTime}
                </div>
                {selectedJob.jobType && (
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-3 h-3 flex-shrink-0" />
                    {selectedJob.jobType}
                  </div>
                )}
                {selectedJob.notes && (
                  <p className="mt-2 text-stone-500 italic border-t border-stone-700 pt-2">
                    {selectedJob.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingJob(selectedJob);
                    setSelectedDate(selectedJob.date);
                    setShowModal(true);
                    setSelectedJob(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => deleteJob(selectedJob.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-rose-900/50 hover:bg-rose-800/60 text-rose-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 shadow-xl flex-1">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Upcoming Jobs
            </h3>

            {loading ? (
              <div className="text-stone-500 text-xs text-center py-8">
                Loading…
              </div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Paintbrush className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <p className="text-stone-500 text-xs">
                  No upcoming jobs scheduled
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((job) => {
                  const meta = STATUS_META[job.status] || STATUS_META.scheduled;
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="flex items-center gap-3 p-3 bg-stone-800 hover:bg-stone-750 rounded-xl cursor-pointer border border-stone-700 hover:border-stone-600 transition-all group"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: job.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {job.date} · {job.startTime}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total Jobs",
                value: jobs.length,
                color: "from-amber-900/50 to-amber-800/30 border-amber-700/50",
              },
              {
                label: "Completed",
                value: jobs.filter((j) => j.status === "completed").length,
                color:
                  "from-emerald-900/50 to-emerald-800/30 border-emerald-700/50",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`bg-gradient-to-br ${color} border rounded-xl p-4 text-center`}
              >
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────── */}
      {showModal && (
        <JobModal
          date={selectedDate}
          existing={editingJob}
          onClose={() => {
            setShowModal(false);
            setEditingJob(null);
          }}
          onSave={saveJob}
        />
      )}
    </div>
  );
}
