import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Plus, Navigation, CheckCircle, Activity, Clock,
  UserCheck, X, Save, AlertTriangle, Edit, Trash2, Search,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const EMPTY_ROUTE = {
  name: "", site: "", checkpoints: 0, duration: "",
  frequency: "", guard: "", status: "Active", notes: "",
};

export default function PatrolRoutesPage({ user }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [form, setForm] = useState(EMPTY_ROUTE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "patrolRoutes"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRoutes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const stats = {
    active: routes.filter((r) => r.status === "Active").length,
    checkpoints: routes.reduce((a, r) => a + (parseInt(r.checkpoints) || 0), 0),
    total: routes.length,
  };

  const filtered = routes.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.site?.toLowerCase().includes(search.toLowerCase()) ||
      r.guard?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditRoute(null); setForm(EMPTY_ROUTE); setShowModal(true); };
  const openEdit = (route) => { setEditRoute(route); setForm({ ...route }); setShowModal(true); };

  const handleSave = async () => {
    if (!user?.uid || !form.name.trim()) return;
    setSaving(true);
    try {
      const count = routes.length + 1;
      if (editRoute) {
        await updateDoc(doc(db, "users", user.uid, "patrolRoutes", editRoute.id), {
          ...form, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "patrolRoutes"), {
          ...form,
          routeId: `RT-${String(count).padStart(3, "0")}`,
          lastRun: "—",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "patrolRoutes", id));
    setDeleteConfirm(null);
  };

  const toggleStatus = async (route) => {
    const newStatus = route.status === "Active" ? "Inactive" : "Active";
    await updateDoc(doc(db, "users", user.uid, "patrolRoutes", route.id), {
      status: newStatus, updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Patrol Routes</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Define and monitor guard patrol routes</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Route
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Routes", value: stats.active, icon: Navigation, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
          { label: "Checkpoints", value: stats.checkpoints, icon: CheckCircle, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
          { label: "Total Routes", value: stats.total, icon: Activity, bg: "bg-[#faf5ff]", color: "text-[#7c3aed]" },
          { label: "Avg Duration", value: "—", icon: Clock, bg: "bg-[#fff7ed]", color: "text-[#ea580c]" },
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search routes…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]" />
      </div>

      {/* Route list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-xl border border-[#e2e8f0] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <Navigation className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">No patrol routes yet</p>
          <p className="text-xs text-[#94a3b8] mb-3">Create your first patrol route</p>
          <button onClick={openAdd} className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium">New Route</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1e293b]">{r.name}</h3>
                      <button
                        onClick={() => toggleStatus(r)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${r.status === "Active" ? "bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]" : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"}`}
                      >
                        {r.status}
                      </button>
                    </div>
                    <p className="text-xs text-[#64748b]">{r.site || "No site assigned"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 text-right">
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-[#1e293b]">{r.checkpoints || 0}</p>
                    <p className="text-xs text-[#94a3b8]">Checkpoints</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-[#1e293b]">{r.duration || "—"}</p>
                    <p className="text-xs text-[#94a3b8]">Duration</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-[#1e293b]">{r.frequency || "—"}</p>
                    <p className="text-xs text-[#94a3b8]">Frequency</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-[#1e293b]">{r.lastRun || "—"}</p>
                    <p className="text-xs text-[#94a3b8]">Last Run</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#64748b]">
                  <UserCheck className="w-3.5 h-3.5" />
                  {r.guard ? (
                    <span>Assigned to <span className="font-semibold text-[#374151]">{r.guard}</span></span>
                  ) : (
                    <span className="italic">No guard assigned</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(r)} className="px-3 py-1 text-xs font-medium text-[#2563eb] border border-[#bfdbfe] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe]">
                    <span className="flex items-center gap-1"><Edit className="w-3 h-3" /> Edit</span>
                  </button>
                  <button onClick={() => setDeleteConfirm(r)} className="px-3 py-1 text-xs font-medium text-[#dc2626] border border-[#fecaca] bg-[#fef2f2] rounded-lg hover:bg-[#fee2e2]">
                    <span className="flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-[#1e293b]">{editRoute ? "Edit Route" : "New Patrol Route"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Route Name *</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mall Perimeter Route" />
                </div>
                <div>
                  <label className={labelCls}>Site</label>
                  <input className={inputCls} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} placeholder="Sandton City Mall" />
                </div>
                <div>
                  <label className={labelCls}>Assigned Guard</label>
                  <input className={inputCls} value={form.guard} onChange={(e) => setForm({ ...form, guard: e.target.value })} placeholder="James Mokoena" />
                </div>
                <div>
                  <label className={labelCls}>Checkpoints</label>
                  <input type="number" className={inputCls} value={form.checkpoints} onChange={(e) => setForm({ ...form, checkpoints: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelCls}>Duration</label>
                  <input className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45 min" />
                </div>
                <div>
                  <label className={labelCls}>Frequency</label>
                  <input className={inputCls} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="Every 2h" />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {["Active", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Route description or instructions…" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : editRoute ? "Update Route" : "Create Route"}
              </button>
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
            <h3 className="text-base font-semibold text-[#1e293b] text-center mb-2">Delete Route?</h3>
            <p className="text-sm text-[#64748b] text-center mb-6">Remove <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
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