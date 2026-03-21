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
  Pill,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Printer,
  User,
  Calendar,
  Hash,
  FileText,
  Filter,
} from "lucide-react";

const STATUS_CONFIG = {
  active:    { label: "Active",    bg: "bg-[#dcfce7]", text: "text-[#166534]", dot: "bg-[#22c55e]" },
  completed: { label: "Completed", bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#94a3b8]" },
  suspended: { label: "Suspended", bg: "bg-[#fef3c7]", text: "text-[#92400e]", dot: "bg-[#f59e0b]" },
  cancelled: { label: "Cancelled", bg: "bg-[#fef2f2]", text: "text-[#991b1b]", dot: "bg-[#ef4444]" },
};

const EMPTY_FORM = {
  patientName: "", patientId: "", medication: "", dosage: "",
  frequency: "", duration: "", refills: "0", instructions: "",
  prescribedBy: "", status: "active", prescribedDate: new Date().toISOString().split("T")[0],
  diagnosis: "", notes: "",
};

export default function Prescriptions({ user }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const db = getFirestore();

  useEffect(() => { if (user?.uid) fetchPrescriptions(); }, [user]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", user.uid, "prescriptions"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setPrescriptions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openNew = () => { setForm(EMPTY_FORM); setEditingId(null); setShowModal(true); };
  const openEdit = (rx) => {
    setForm({ ...EMPTY_FORM, ...rx });
    setEditingId(rx.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.patientName || !form.medication) return;
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "prescriptions", editingId), payload);
      } else {
        await addDoc(collection(db, "users", user.uid, "prescriptions"), {
          ...payload, createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      fetchPrescriptions();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "prescriptions", id));
      setDeleteConfirm(null);
      fetchPrescriptions();
    } catch (e) { console.error(e); }
  };

  const filtered = prescriptions.filter((rx) => {
    const matchSearch =
      rx.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      rx.medication?.toLowerCase().includes(search.toLowerCase()) ||
      rx.patientId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || rx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: prescriptions.length,
    active: prescriptions.filter((r) => r.status === "active").length,
    refillsDue: prescriptions.filter((r) => r.status === "active" && Number(r.refills) > 0).length,
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0e7490] focus:border-[#0e7490] transition-colors";
  const labelCls = "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#0e7490]" /> Prescriptions
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">Manage patient medication prescriptions</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] hover:bg-[#0c6578] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Prescription
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Pill, color: "text-[#0e7490]", bg: "bg-[#e0f2fe]" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "text-[#059669]", bg: "bg-[#dcfce7]" },
          { label: "Refills Due", value: stats.refillsDue, icon: RefreshCw, color: "text-[#d97706]", bg: "bg-[#fef3c7]" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{label}</span>
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, medication, ID..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0e7490] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "completed", "suspended", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-[#0e7490] text-white"
                  : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#0e7490] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Pill className="w-10 h-10 text-[#cbd5e1]" />
            <p className="text-sm text-[#94a3b8]">No prescriptions found</p>
            <button onClick={openNew} className="text-sm text-[#0e7490] font-medium hover:underline">
              Create the first one
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {["Patient", "Medication", "Dosage", "Frequency", "Refills", "Prescribed", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((rx) => {
                  const s = STATUS_CONFIG[rx.status] || STATUS_CONFIG.active;
                  return (
                    <tr key={rx.id} className="hover:bg-[#f8fafc] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-[#1e293b]">{rx.patientName}</div>
                        {rx.patientId && <div className="text-xs text-[#94a3b8]">{rx.patientId}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[#1e293b]">{rx.medication}</div>
                        {rx.diagnosis && <div className="text-xs text-[#94a3b8] truncate max-w-[140px]">{rx.diagnosis}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{rx.dosage || "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{rx.frequency || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${Number(rx.refills) > 0 ? "bg-[#e0f2fe] text-[#0369a1]" : "bg-[#f1f5f9] text-[#94a3b8]"}`}>
                          <RefreshCw className="w-2.5 h-2.5" /> {rx.refills || "0"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b] whitespace-nowrap">{rx.prescribedDate || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(rx)} className="p-1.5 text-[#64748b] hover:text-[#0e7490] hover:bg-[#e0f2fe] rounded-lg transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(rx.id)} className="p-1.5 text-[#64748b] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-all">
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

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[#ef4444]" />
            </div>
            <h3 className="text-base font-bold text-[#1e293b] text-center mb-1">Delete Prescription?</h3>
            <p className="text-sm text-[#64748b] text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#f8fafc] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-[#ef4444] text-white text-sm font-semibold rounded-xl hover:bg-[#dc2626] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
              <h2 className="text-sm font-bold text-[#1e293b]">
                {editingId ? "Edit Prescription" : "New Prescription"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient info */}
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0e7490] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
                    <User className="w-3.5 h-3.5" /> Patient Information
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Patient Name *</label>
                  <input className={inputCls} value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <label className={labelCls}>Patient ID</label>
                  <input className={inputCls} value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="PAT-2026-XXXX" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Diagnosis</label>
                  <input className={inputCls} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Reason for prescription" />
                </div>

                {/* Medication info */}
                <div className="sm:col-span-2 mt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0e7490] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
                    <Pill className="w-3.5 h-3.5" /> Medication Details
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Medication Name *</label>
                  <input className={inputCls} value={form.medication} onChange={(e) => setForm({ ...form, medication: e.target.value })} placeholder="e.g. Amoxicillin" />
                </div>
                <div>
                  <label className={labelCls}>Dosage</label>
                  <input className={inputCls} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 500mg" />
                </div>
                <div>
                  <label className={labelCls}>Frequency</label>
                  <input className={inputCls} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="e.g. Twice daily" />
                </div>
                <div>
                  <label className={labelCls}>Duration</label>
                  <input className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 7 days" />
                </div>
                <div>
                  <label className={labelCls}>Refills</label>
                  <input className={inputCls} type="number" min="0" value={form.refills} onChange={(e) => setForm({ ...form, refills: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Prescribed Date</label>
                  <input className={inputCls} type="date" value={form.prescribedDate} onChange={(e) => setForm({ ...form, prescribedDate: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Prescribed By</label>
                  <input className={inputCls} value={form.prescribedBy} onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })} placeholder="Doctor name" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Instructions / Special Notes</label>
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Take with food, avoid alcohol..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.patientName || !form.medication}
                className="flex-1 px-4 py-2.5 bg-[#0e7490] hover:bg-[#0c6578] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Save Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}