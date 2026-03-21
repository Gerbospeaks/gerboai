import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
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
  Edit2,
  Trash2,
  X,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const JOB_TYPES = [
  "Lawn Mowing",
  "Garden Maintenance",
  "Irrigation Install",
  "Tree Trimming",
  "Landscaping Design",
  "Planting",
  "Pest Treatment",
  "Mulching",
  "Site Inspection",
  "Quote Visit",
  "Other",
];

const DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "1.5 hr", value: 90 },
  { label: "2 hr", value: 120 },
  { label: "3 hr", value: 180 },
  { label: "4 hr", value: 240 },
  { label: "Full Day", value: 480 },
];

const STATUS_CONFIG = {
  scheduled: {
    label: "Scheduled",
    cls: "bg-[#dbeafe] text-[#1e40af]",
    icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    cls: "bg-[#fef3c7] text-[#92400e]",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    cls: "bg-[#dcfce7] text-[#166534]",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-[#fef2f2] text-[#991b1b]",
    icon: XCircle,
  },
};

const EMPTY_FORM = {
  title: "",
  type: "Lawn Mowing",
  clientName: "",
  propertyAddress: "",
  date: "",
  time: "08:00",
  duration: 60,
  crew: "",
  notes: "",
  status: "scheduled",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isToday(dateStr) {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

function isTomorrow(dateStr) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateStr === d.toISOString().split("T")[0];
}

function groupByDate(appointments) {
  const groups = {};
  appointments.forEach((a) => {
    const key = a.date || "No Date";
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function AppointmentsView({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState("upcoming"); // upcoming | all | today

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "appointments"),
          orderBy("date", "asc"),
        ),
      );
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAdd = (prefillDate = "") => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      date: prefillDate || new Date().toISOString().split("T")[0],
    });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title || "",
      type: a.type || "Lawn Mowing",
      clientName: a.clientName || "",
      propertyAddress: a.propertyAddress || "",
      date: a.date || "",
      time: a.time || "08:00",
      duration: a.duration || 60,
      crew: a.crew || "",
      notes: a.notes || "",
      status: a.status || "scheduled",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.date) e.date = "Date is required";
    if (!form.clientName.trim()) e.clientName = "Client name is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(
          doc(db, "users", user.uid, "appointments", editing.id),
          {
            ...form,
            duration: Number(form.duration),
            updatedAt: serverTimestamp(),
          },
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "appointments"), {
          ...form,
          duration: Number(form.duration),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save appointment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "appointments", deleteConfirm.id),
      );
      load();
    } catch (_) {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const quickStatus = async (a, status) => {
    try {
      await updateDoc(doc(db, "users", user.uid, "appointments", a.id), {
        status,
        updatedAt: serverTimestamp(),
      });
      load();
    } catch (_) {}
  };

  const today = new Date().toISOString().split("T")[0];
  const filtered = appointments.filter((a) => {
    if (filter === "today") return a.date === today;
    if (filter === "upcoming")
      return a.date >= today && a.status !== "cancelled";
    return true;
  });

  const grouped = groupByDate(filtered);

  const todayCount = appointments.filter((a) => a.date === today).length;
  const upcomingCount = appointments.filter(
    (a) => a.date > today && a.status === "scheduled",
  ).length;

  const durationLabel = (mins) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">Appointments</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {todayCount} today · {upcomingCount} upcoming
          </p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Schedule
        </button>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Today",
            value: todayCount,
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
          },
          {
            label: "Upcoming",
            value: upcomingCount,
            color: "text-[#059669]",
            bg: "bg-[#f0fdf4]",
          },
          {
            label: "Completed",
            value: appointments.filter((a) => a.status === "completed").length,
            color: "text-[#166534]",
            bg: "bg-[#dcfce7]",
          },
          {
            label: "Cancelled",
            value: appointments.filter((a) => a.status === "cancelled").length,
            color: "text-[#dc2626]",
            bg: "bg-[#fef2f2]",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm"
          >
            <p className="text-xs text-[#64748b] mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-lg w-fit">
        {[
          { key: "upcoming", label: "Upcoming" },
          { key: "today", label: "Today" },
          { key: "all", label: "All" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              filter === key
                ? "bg-white text-[#1e293b] shadow-sm"
                : "text-[#64748b] hover:text-[#374151]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Schedule ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 bg-[#f1f5f9] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-[#e2e8f0]">
          <div className="w-12 h-12 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-[#059669]" />
          </div>
          <p className="text-sm font-semibold text-[#1e293b] mb-1">
            No appointments{" "}
            {filter === "today"
              ? "today"
              : filter === "upcoming"
                ? "upcoming"
                : ""}
          </p>
          <p className="text-xs text-[#94a3b8] mb-4">
            Schedule your first appointment to get started
          </p>
          <button
            onClick={() => openAdd()}
            className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium"
          >
            Schedule Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, appts]) => {
            const dateLabel = isToday(date)
              ? "Today"
              : isTomorrow(date)
                ? "Tomorrow"
                : formatDate(date);

            return (
              <div key={date}>
                {/* Date heading */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isToday(date)
                        ? "bg-[#059669] text-white"
                        : isTomorrow(date)
                          ? "bg-[#2563eb] text-white"
                          : "bg-[#f1f5f9] text-[#374151]"
                    }`}
                  >
                    {dateLabel}
                  </div>
                  <div className="flex-1 h-px bg-[#e2e8f0]" />
                  <span className="text-xs text-[#94a3b8]">
                    {appts.length} job{appts.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Appointment cards */}
                <div className="space-y-3">
                  {appts.map((a) => {
                    const sc =
                      STATUS_CONFIG[a.status] || STATUS_CONFIG.scheduled;
                    const StatusIcon = sc.icon;
                    return (
                      <div
                        key={a.id}
                        className={`bg-white border rounded-xl shadow-sm overflow-hidden ${
                          a.status === "cancelled"
                            ? "border-[#fecaca] opacity-60"
                            : "border-[#e2e8f0]"
                        }`}
                      >
                        <div className="flex">
                          {/* Time column */}
                          <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center bg-[#f8fafc] border-r border-[#e2e8f0] py-4 px-2">
                            <p className="text-sm font-bold text-[#1e293b]">
                              {a.time || "—"}
                            </p>
                            {a.duration && (
                              <p className="text-xs text-[#94a3b8] mt-0.5">
                                {durationLabel(a.duration)}
                              </p>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 px-4 py-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <h4 className="text-sm font-bold text-[#1e293b]">
                                    {a.title || a.type}
                                  </h4>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${sc.cls}`}
                                  >
                                    <StatusIcon className="w-3 h-3" />
                                    {sc.label}
                                  </span>
                                  <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#374151] rounded text-xs">
                                    {a.type}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748b] mt-1">
                                  {a.clientName && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {a.clientName}
                                    </span>
                                  )}
                                  {a.propertyAddress && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {a.propertyAddress}
                                    </span>
                                  )}
                                  {a.crew && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3 text-[#059669]" />
                                      {a.crew}
                                    </span>
                                  )}
                                </div>
                                {a.notes && (
                                  <p className="text-xs text-[#94a3b8] mt-1 italic">
                                    {a.notes}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {a.status === "scheduled" && (
                                  <button
                                    onClick={() => quickStatus(a, "completed")}
                                    title="Mark complete"
                                    className="p-1.5 text-[#059669] hover:bg-[#f0fdf4] rounded-lg transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => openEdit(a)}
                                  className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(a)}
                                  className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Appointment" : "Schedule Appointment"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-2">
                  <label className={labelCls}>Job Title</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="e.g. Weekly Garden Service"
                    className={inputCls}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className={labelCls}>Job Type</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client */}
                <div className="col-span-2">
                  <label className={labelCls}>Client Name *</label>
                  <input
                    value={form.clientName}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, clientName: e.target.value }));
                      setErrors((er) => ({ ...er, clientName: undefined }));
                    }}
                    placeholder="Client name"
                    className={`${inputCls} ${errors.clientName ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.clientName}
                    </p>
                  )}
                </div>

                {/* Property */}
                <div className="col-span-2">
                  <label className={labelCls}>Property Address</label>
                  <input
                    value={form.propertyAddress}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        propertyAddress: e.target.value,
                      }))
                    }
                    placeholder="Service address"
                    className={inputCls}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={labelCls}>Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, date: e.target.value }));
                      setErrors((er) => ({ ...er, date: undefined }));
                    }}
                    className={`${inputCls} ${errors.date ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.date}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className={labelCls}>Start Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className={labelCls}>Duration</label>
                  <select
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration: Number(e.target.value),
                      }))
                    }
                    className={inputCls}
                  >
                    {DURATIONS.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Crew */}
                <div>
                  <label className={labelCls}>Assigned Crew</label>
                  <input
                    value={form.crew}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, crew: e.target.value }))
                    }
                    placeholder="e.g. Team A, John"
                    className={inputCls}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    placeholder="Special instructions, access details…"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">
              Delete Appointment
            </h3>
            <p className="text-xs text-[#64748b] text-center mb-5">
              Delete this appointment for{" "}
              <span className="font-semibold text-[#1e293b]">
                {deleteConfirm.clientName || "this client"}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 text-sm text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
