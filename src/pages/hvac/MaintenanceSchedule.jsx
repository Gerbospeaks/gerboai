import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
} from "lucide-react";

const TASK_TYPES = [
  "Preventive Maintenance",
  "Repair",
  "Installation",
  "Inspection",
  "Gas Recharge",
  "Cleaning",
  "Emergency Call",
  "Other",
];
const STATUS_OPTIONS = ["Scheduled", "In Progress", "Completed", "Cancelled"];
const PRIORITY_OPTIONS = ["Low", "Normal", "High", "Urgent"];

const statusConfig = {
  Scheduled: { color: "bg-[#dbeafe] text-[#1e40af]", icon: Clock },
  "In Progress": { color: "bg-[#fef3c7] text-[#92400e]", icon: Wrench },
  Completed: { color: "bg-[#dcfce7] text-[#166534]", icon: CheckCircle },
  Cancelled: { color: "bg-[#fef2f2] text-[#991b1b]", icon: XCircle },
};

const priorityCls = {
  Low: "bg-[#f1f5f9] text-[#64748b]",
  Normal: "bg-[#dbeafe] text-[#1e40af]",
  High: "bg-[#fef3c7] text-[#92400e]",
  Urgent: "bg-[#fef2f2] text-[#991b1b]",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";

const EMPTY_FORM = {
  title: "",
  clientName: "",
  systemDescription: "",
  technicianName: "",
  scheduledDate: "",
  scheduledTime: "",
  taskType: "Preventive Maintenance",
  status: "Scheduled",
  priority: "Normal",
  notes: "",
};

const fmtDate = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function MaintenanceSchedule({ user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "maintenance"),
          orderBy("scheduledDate", "asc"),
        ),
      );
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };

  const openAdd = () => {
    setEditingJob(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (j) => {
    setEditingJob(j);
    setForm({ ...EMPTY_FORM, ...j });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.scheduledDate)
      return alert("Title and scheduled date are required");
    setSaving(true);
    try {
      const db = getFirestore();
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editingJob) {
        await updateDoc(
          doc(db, "users", user.uid, "maintenance", editingJob.id),
          data,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "maintenance"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Error saving job");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await deleteDoc(doc(getFirestore(), "users", user.uid, "maintenance", id));
    load();
  };

  const quickStatus = async (job, newStatus) => {
    const db = getFirestore();
    await updateDoc(doc(db, "users", user.uid, "maintenance", job.id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    load();
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const today = new Date().toISOString().split("T")[0];

  const filtered = jobs.filter((j) => {
    const hit =
      !search ||
      [j.title, j.clientName, j.technicianName, j.systemDescription]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
    const status = statusFilter === "All" || j.status === statusFilter;
    return hit && status;
  });

  const stats = {
    total: jobs.length,
    today: jobs.filter((j) => j.scheduledDate === today).length,
    upcoming: jobs.filter(
      (j) => j.scheduledDate > today && j.status === "Scheduled",
    ).length,
    overdue: jobs.filter(
      (j) => j.scheduledDate < today && j.status === "Scheduled",
    ).length,
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">
            Maintenance Schedule
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Track and manage all service jobs
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Schedule Job
        </button>
      </div>

      {/* ── Overdue alert ── */}
      {stats.overdue > 0 && (
        <div className="flex items-center gap-3 bg-[#fef2f2] border border-[#fca5a5] rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
          <p className="text-sm text-[#991b1b] font-medium">
            {stats.overdue} overdue job{stats.overdue > 1 ? "s" : ""} — please
            reschedule or mark as completed
          </p>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Jobs",
            value: stats.total,
            bg: "bg-[#eff6ff]",
            ic: "text-[#2563eb]",
            val: "text-[#1e293b]",
          },
          {
            label: "Today",
            value: stats.today,
            bg: "bg-[#f0fdf4]",
            ic: "text-[#059669]",
            val: "text-[#1e293b]",
          },
          {
            label: "Upcoming",
            value: stats.upcoming,
            bg: "bg-[#dbeafe]",
            ic: "text-[#2563eb]",
            val: "text-[#1e40af]",
          },
          {
            label: "Overdue",
            value: stats.overdue,
            bg: stats.overdue > 0 ? "bg-[#fef2f2]" : "bg-[#f0fdf4]",
            ic: stats.overdue > 0 ? "text-[#dc2626]" : "text-[#059669]",
            val: stats.overdue > 0 ? "text-[#dc2626]" : "text-[#059669]",
          },
        ].map(({ label, value, bg, ic, val }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Calendar className={`w-4 h-4 ${ic}`} />
            </div>
            <p className="text-xs text-[#64748b]">{label}</p>
            <p className={`text-xl font-bold ${val}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, client, technician…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white text-[#1e293b] placeholder-[#9ca3af]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* ── Job table ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-[#94a3b8]">
            Loading schedule…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151]">No jobs found</p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Schedule your first maintenance job
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-xs font-medium transition-colors"
            >
              Schedule Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Job",
                    "Client / System",
                    "Date & Time",
                    "Technician",
                    "Priority",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((j) => {
                  const cfg =
                    statusConfig[j.status] || statusConfig["Scheduled"];
                  const Icon = cfg.icon;
                  const isOverdue =
                    j.scheduledDate < today && j.status === "Scheduled";
                  const isToday = j.scheduledDate === today;

                  return (
                    <tr
                      key={j.id}
                      className={`hover:bg-[#f8fafc] transition-colors ${
                        isOverdue
                          ? "bg-[#fff5f5]"
                          : isToday
                            ? "bg-[#f0fdf4]"
                            : ""
                      }`}
                    >
                      {/* Job */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 ${isOverdue ? "bg-[#fef2f2]" : "bg-[#f5f3ff]"} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            <Wrench
                              className={`w-4 h-4 ${isOverdue ? "text-[#dc2626]" : "text-[#7c3aed]"}`}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1e293b]">
                              {j.title}
                            </div>
                            <div className="text-xs text-[#94a3b8]">
                              {j.taskType}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Client / System */}
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-[#374151]">
                          {j.clientName || "—"}
                        </div>
                        <div className="text-xs text-[#94a3b8] truncate max-w-[180px]">
                          {j.systemDescription || "—"}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <div
                          className={`text-sm font-medium ${isOverdue ? "text-[#dc2626]" : isToday ? "text-[#059669]" : "text-[#374151]"}`}
                        >
                          {fmtDate(j.scheduledDate)}
                        </div>
                        {j.scheduledTime && (
                          <div className="text-xs text-[#94a3b8]">
                            {j.scheduledTime}
                          </div>
                        )}
                        {isOverdue && (
                          <div className="text-xs font-bold text-[#dc2626]">
                            OVERDUE
                          </div>
                        )}
                        {isToday && (
                          <div className="text-xs font-bold text-[#059669]">
                            TODAY
                          </div>
                        )}
                      </td>

                      {/* Technician */}
                      <td className="px-5 py-3.5 text-sm text-[#374151]">
                        {j.technicianName || "—"}
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityCls[j.priority] || priorityCls["Normal"]}`}
                        >
                          {j.priority || "Normal"}
                        </span>
                      </td>

                      {/* Status — hover dropdown for quick update */}
                      <td className="px-5 py-3.5">
                        <div className="relative group inline-block">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer select-none ${cfg.color}`}
                          >
                            <Icon className="w-3 h-3" /> {j.status}
                          </span>
                          <div
                            className="absolute left-0 top-full mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-20
                            opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto
                            transition-opacity duration-150 min-w-[148px] overflow-hidden"
                          >
                            {STATUS_OPTIONS.filter((s) => s !== j.status).map(
                              (s) => (
                                <button
                                  key={s}
                                  onClick={() => quickStatus(j, s)}
                                  className="w-full px-4 py-2 text-xs text-left text-[#374151] hover:bg-[#f8fafc] transition-colors"
                                >
                                  {s}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => openEdit(j)}
                            className="p-1.5 text-[#64748b] hover:text-[#7c3aed] hover:bg-[#f5f3ff] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(j.id)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-xl">
              <div>
                <h2 className="text-sm font-semibold text-[#1e293b]">
                  {editingJob ? "Edit Job" : "Schedule Maintenance Job"}
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Fill in the job details below
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Job Title *</label>
                  <input
                    value={form.title}
                    onChange={set("title")}
                    placeholder="e.g. Annual Service – Daikin Split Unit"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Task Type</label>
                  <select
                    value={form.taskType}
                    onChange={set("taskType")}
                    className={selectCls}
                  >
                    {TASK_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={set("priority")}
                    className={selectCls}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Client Name</label>
                  <input
                    value={form.clientName}
                    onChange={set("clientName")}
                    placeholder="e.g. ABC Property Mgmt"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>System / Equipment</label>
                  <input
                    value={form.systemDescription}
                    onChange={set("systemDescription")}
                    placeholder="e.g. Daikin FTXS35K – Reception"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Scheduled Date *</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={set("scheduledDate")}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Scheduled Time</label>
                  <input
                    type="time"
                    value={form.scheduledTime}
                    onChange={set("scheduledTime")}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Technician Name</label>
                  <input
                    value={form.technicianName}
                    onChange={set("technicianName")}
                    placeholder="e.g. John Dlamini"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className={selectCls}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    placeholder="Job details, parts needed, access instructions, special requirements…"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg transition-colors disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingJob
                    ? "Update Job"
                    : "Schedule Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
