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
  Plus,
  Building,
  AlertTriangle,
  Navigation,
  Bell,
  MapPin,
  X,
  Save,
  Edit,
  Trash2,
  Search,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const riskColor = {
  High: "bg-[#fef2f2] text-[#dc2626]",
  Medium: "bg-[#fef3c7] text-[#d97706]",
  Low: "bg-[#dcfce7] text-[#166534]",
};

const EMPTY_SITE = {
  name: "",
  client: "",
  address: "",
  guards: 0,
  risk: "Low",
  type: "Commercial",
  incidents: 0,
  notes: "",
};

export default function SitesPage({ user }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [form, setForm] = useState(EMPTY_SITE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "sites"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setSites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const stats = {
    total: sites.length,
    highRisk: sites.filter((s) => s.risk === "High").length,
    incidents: sites.reduce((a, s) => a + (parseInt(s.incidents) || 0), 0),
  };

  const filtered = sites.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.client?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "All" || s.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  const openAdd = () => {
    setEditSite(null);
    setForm(EMPTY_SITE);
    setShowModal(true);
  };
  const openEdit = (site) => {
    setEditSite(site);
    setForm({ ...site });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user?.uid || !form.name.trim()) return;
    setSaving(true);
    try {
      const count = sites.length + 1;
      if (editSite) {
        await updateDoc(doc(db, "users", user.uid, "sites", editSite.id), {
          ...form,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "sites"), {
          ...form,
          siteId: `SIT-${String(count).padStart(3, "0")}`,
          lastPatrol: "—",
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
    await deleteDoc(doc(db, "users", user.uid, "sites", id));
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Sites</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            All secured locations under your management
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Site
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Sites",
            value: stats.total,
            icon: Building,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "High Risk",
            value: stats.highRisk,
            icon: AlertTriangle,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
          {
            label: "Patrols Today",
            value: "—",
            icon: Navigation,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Total Incidents",
            value: stats.incidents,
            icon: Bell,
            bg: "bg-[#fef3c7]",
            color: "text-[#d97706]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            {loading ? (
              <div className="h-7 bg-[#f1f5f9] rounded animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            )}
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sites…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-3 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg bg-white focus:outline-none"
        >
          {["All", "High", "Medium", "Low"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Site Cards */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 bg-white rounded-xl border border-[#e2e8f0] animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <MapPin className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">
            No sites found
          </p>
          <p className="text-xs text-[#94a3b8] mb-3">
            Add your first secured site
          </p>
          <button
            onClick={openAdd}
            className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium"
          >
            Add Site
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f0f9ff] border border-[#bae6fd] rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#0284c7]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e293b]">
                      {s.name}
                    </h3>
                    <p className="text-xs text-[#64748b]">{s.client || "—"}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${riskColor[s.risk] || riskColor.Low}`}
                >
                  {s.risk} Risk
                </span>
              </div>
              {s.address && (
                <p className="text-xs text-[#94a3b8] mb-3 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {s.address}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-[#1e293b]">
                    {s.guards || 0}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Guards</p>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-[#1e293b]">
                    {s.incidents || 0}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Incidents</p>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2 text-center">
                  <p className="text-xs font-bold text-[#1e293b]">
                    {s.lastPatrol || "—"}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Last Patrol</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-[#f1f5f9] text-[#475569] rounded-full">
                  {s.type || "—"}
                </span>
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(s)}
                    className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editSite ? "Edit Site" : "Add New Site"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Site Name *</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Sandton City Mall"
                  />
                </div>
                <div>
                  <label className={labelCls}>Client / Company</label>
                  <input
                    className={inputCls}
                    value={form.client}
                    onChange={(e) =>
                      setForm({ ...form, client: e.target.value })
                    }
                    placeholder="ABC Corporation"
                  />
                </div>
                <div>
                  <label className={labelCls}>Site Type</label>
                  <select
                    className={inputCls}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {[
                      "Retail",
                      "Commercial",
                      "Industrial",
                      "Residential",
                      "Government",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Address</label>
                  <input
                    className={inputCls}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="123 Business Park, Sandton, 2196"
                  />
                </div>
                <div>
                  <label className={labelCls}>Guards Deployed</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.guards}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        guards: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Risk Level</label>
                  <select
                    className={inputCls}
                    value={form.risk}
                    onChange={(e) => setForm({ ...form, risk: e.target.value })}
                  >
                    {["Low", "Medium", "High"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Total Incidents</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={form.incidents}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        incidents: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Additional notes…"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : editSite ? "Update Site" : "Add Site"}
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
            <h3 className="text-base font-semibold text-[#1e293b] text-center mb-2">
              Delete Site?
            </h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              Remove <strong>{deleteConfirm.name}</strong>? This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
