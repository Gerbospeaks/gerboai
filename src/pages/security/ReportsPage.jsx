import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Plus, FileBarChart, Activity, UserCheck, AlertTriangle,
  Eye, Download, X, Save, Trash2, Search,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const typeColor = {
  Activity: "bg-[#eff6ff] text-[#2563eb]",
  Performance: "bg-[#f0fdf4] text-[#059669]",
  Incident: "bg-[#fef2f2] text-[#dc2626]",
  Risk: "bg-[#fef3c7] text-[#d97706]",
  Financial: "bg-[#faf5ff] text-[#7c3aed]",
  Other: "bg-[#f1f5f9] text-[#475569]",
};

const EMPTY_REPORT = {
  title: "", desc: "", type: "Activity", notes: "",
};

export default function ReportsPage({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_REPORT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewReport, setViewReport] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "reports"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const stats = {
    total: reports.length,
    activity: reports.filter((r) => r.type === "Activity").length,
    performance: reports.filter((r) => r.type === "Performance").length,
    incident: reports.filter((r) => r.type === "Incident").length,
  };

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.desc?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSave = async () => {
    if (!user?.uid || !form.title.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "reports"), {
        ...form,
        date: new Date().toISOString().split("T")[0],
        size: "—",
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setForm(EMPTY_REPORT);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "reports", id));
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Reports</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Activity, guard performance & incident reports</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: stats.total, icon: FileBarChart, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
          { label: "Activity Reports", value: stats.activity, icon: Activity, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
          { label: "Performance Reports", value: stats.performance, icon: UserCheck, bg: "bg-[#faf5ff]", color: "text-[#7c3aed]" },
          { label: "Incident Reports", value: stats.incident, icon: AlertTriangle, bg: "bg-[#fef2f2]", color: "text-[#dc2626]" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            {loading ? <div className="h-7 bg-[#f1f5f9] rounded animate-pulse mb-1" /> : <p className="text-xl font-bold text-[#1e293b]">{value}</p>}
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg bg-white focus:outline-none">
          {["All", "Activity", "Performance", "Incident", "Risk", "Financial", "Other"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Report list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-xl border border-[#e2e8f0] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <FileBarChart className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">No reports yet</p>
          <p className="text-xs text-[#94a3b8] mb-3">Generate your first report</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium">Generate Report</button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileBarChart className="w-5 h-5 text-[#64748b]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b]">{r.title}</h3>
                  <p className="text-xs text-[#64748b]">{r.desc}{r.size && r.size !== "—" ? ` · ${r.size}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeColor[r.type] || typeColor.Other}`}>
                  {r.type}
                </span>
                <span className="text-xs text-[#94a3b8] hidden sm:block">{r.date || "—"}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setViewReport(r)} className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(r)} className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">Generate Report</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Report Title *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Monthly Activity Report" />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input className={inputCls} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="May 2024 — All Sites" />
              </div>
              <div>
                <label className={labelCls}>Report Type</label>
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {["Activity", "Performance", "Incident", "Risk", "Financial", "Other"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes / Content</label>
                <textarea rows={4} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Report content, observations, findings…" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {viewReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div>
                <h2 className="text-base font-semibold text-[#1e293b]">{viewReport.title}</h2>
                <p className="text-xs text-[#64748b] mt-0.5">{viewReport.desc} · {viewReport.date}</p>
              </div>
              <button onClick={() => setViewReport(null)} className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${typeColor[viewReport.type] || typeColor.Other}`}>{viewReport.type}</span>
              </div>
              {viewReport.notes ? (
                <div className="bg-[#f8fafc] rounded-xl p-4 text-sm text-[#374151] whitespace-pre-wrap border border-[#e2e8f0]">
                  {viewReport.notes}
                </div>
              ) : (
                <p className="text-sm text-[#94a3b8] italic">No content recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-[#e2e8f0] p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-[#dc2626]" />
            </div>
            <h3 className="text-base font-semibold text-[#1e293b] text-center mb-2">Delete Report?</h3>
            <p className="text-sm text-[#64748b] text-center mb-6">Remove <strong>{deleteConfirm.title}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}