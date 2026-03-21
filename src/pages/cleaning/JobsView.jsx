import React, { useState, useEffect } from "react";
import {
  Sparkles, Plus, Search, Filter, MapPin, Clock, User,
  CheckCircle, AlertCircle, XCircle, Calendar, ChevronRight,
  MoreVertical, Phone, Edit2, Trash2, Eye, X, Save
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from "firebase/firestore";

const STATUS_CONFIG = {
  scheduled:  { label: "Scheduled",   bg: "bg-[#dbeafe]", text: "text-[#1d4ed8]", dot: "bg-[#2563eb]" },
  "in-progress": { label: "In Progress", bg: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#d97706]" },
  completed:  { label: "Completed",   bg: "bg-[#dcfce7]", text: "text-[#166534]", dot: "bg-[#059669]" },
  cancelled:  { label: "Cancelled",   bg: "bg-[#fee2e2]", text: "text-[#991b1b]", dot: "bg-[#dc2626]" },
  pending:    { label: "Pending",     bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#94a3b8]" },
};

const SERVICE_TYPES = [
  "Standard Cleaning", "Deep Cleaning", "Move In/Out", "Office Cleaning",
  "Carpet Cleaning", "Window Cleaning", "Post-Construction", "Specialized"
];

const EMPTY_JOB = {
  clientName: "", clientPhone: "", clientEmail: "",
  address: "", serviceType: "Standard Cleaning",
  date: "", time: "09:00", duration: "2",
  assignedStaff: "", status: "scheduled", notes: "",
  amount: "", frequency: "One-time"
};

export default function JobsView({ user, businessInfo, openNew = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(openNew);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => { loadJobs(); }, [user]);

  const loadJobs = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users", user.uid, "jobs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditJob(null); setForm(EMPTY_JOB); setShowModal(true); };
  const openEdit = (job) => { setEditJob(job); setForm({ ...EMPTY_JOB, ...job }); setShowModal(true); setMenuOpen(null); };

  const handleSave = async () => {
    if (!form.clientName || !form.date) return alert("Client name and date are required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editJob) {
        await updateDoc(doc(db, "users", user.uid, "jobs", editJob.id), data);
      } else {
        await addDoc(collection(db, "users", user.uid, "jobs"), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      loadJobs();
    } catch (e) { alert("Failed to save job"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await deleteDoc(doc(db, "users", user.uid, "jobs", id));
    setMenuOpen(null);
    loadJobs();
  };

  const handleStatusChange = async (id, status) => {
    await updateDoc(doc(db, "users", user.uid, "jobs", id), { status, updatedAt: serverTimestamp() });
    setMenuOpen(null);
    loadJobs();
  };

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.clientName?.toLowerCase().includes(search.toLowerCase()) || j.address?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total Jobs", value: jobs.length, color: "text-[#0891b2]", bg: "bg-[#ecfeff]" },
    { label: "Scheduled", value: jobs.filter(j => j.status === "scheduled").length, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
    { label: "In Progress", value: jobs.filter(j => j.status === "in-progress").length, color: "text-[#d97706]", bg: "bg-[#fef3c7]" },
    { label: "Completed", value: jobs.filter(j => j.status === "completed").length, color: "text-[#059669]", bg: "bg-[#dcfce7]" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#0891b2]" /> Cleaning Jobs
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">Manage and track all cleaning jobs</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-[#f8fafc]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "scheduled", "in-progress", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${filterStatus === s ? "bg-[#0891b2] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}>
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs list */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#94a3b8] text-sm">Loading jobs…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Sparkles className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#94a3b8]">No jobs found</p>
            <button onClick={openCreate} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg hover:bg-[#0e7490]">Create First Job</button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filtered.map(job => {
              const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
              return (
                <div key={job.id} className="p-4 hover:bg-[#f8fafc] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        <span className="text-xs text-[#94a3b8] bg-[#f1f5f9] px-2 py-0.5 rounded">{job.serviceType}</span>
                      </div>
                      <p className="font-semibold text-[#1e293b] truncate">{job.clientName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {job.address && <span className="flex items-center gap-1 text-xs text-[#64748b]"><MapPin className="w-3 h-3" />{job.address}</span>}
                        {job.date && <span className="flex items-center gap-1 text-xs text-[#64748b]"><Calendar className="w-3 h-3" />{job.date} {job.time && `@ ${job.time}`}</span>}
                        {job.assignedStaff && <span className="flex items-center gap-1 text-xs text-[#64748b]"><User className="w-3 h-3" />{job.assignedStaff}</span>}
                        {job.amount && <span className="text-xs font-semibold text-[#059669]">R{Number(job.amount).toFixed(2)}</span>}
                      </div>
                    </div>
                    <div className="relative flex-shrink-0">
                      <button onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === job.id && (
                        <div className="absolute right-0 top-8 z-10 bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1 min-w-[160px]">
                          <button onClick={() => openEdit(job)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"><Edit2 className="w-3.5 h-3.5" />Edit Job</button>
                          {job.status !== "in-progress" && <button onClick={() => handleStatusChange(job.id, "in-progress")} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#d97706] hover:bg-[#f8fafc]"><Clock className="w-3.5 h-3.5" />Mark In Progress</button>}
                          {job.status !== "completed" && <button onClick={() => handleStatusChange(job.id, "completed")} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#059669] hover:bg-[#f8fafc]"><CheckCircle className="w-3.5 h-3.5" />Mark Complete</button>}
                          {job.status !== "cancelled" && <button onClick={() => handleStatusChange(job.id, "cancelled")} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#dc2626] hover:bg-[#f8fafc]"><XCircle className="w-3.5 h-3.5" />Cancel Job</button>}
                          <div className="border-t border-[#f1f5f9] my-1" />
                          <button onClick={() => handleDelete(job.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2]"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editJob ? "Edit Job" : "New Job"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[
                { label: "Client Name *", key: "clientName", placeholder: "Johnson Residence" },
                { label: "Client Phone", key: "clientPhone", placeholder: "+27 82 123 4567" },
                { label: "Client Email", key: "clientEmail", placeholder: "client@email.com" },
                { label: "Property Address", key: "address", placeholder: "123 Main St, Sandton" },
                { label: "Assigned Staff", key: "assignedStaff", placeholder: "Team member name" },
                { label: "Amount (R)", key: "amount", placeholder: "0.00", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Service Type</label>
                  <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3} placeholder="Special instructions, access codes, etc."
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#374151] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}