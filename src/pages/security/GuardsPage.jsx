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
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  CheckCircle,
  Clock,
  Calendar,
  Star,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const EMPTY_GUARD = {
  name: "",
  site: "Unassigned",
  shift: "",
  status: "Off Duty",
  psira: "",
  phone: "",
  rating: 5.0,
};

const statusColors = {
  "On Duty": "bg-[#dcfce7] text-[#166534]",
  "Off Duty": "bg-[#f1f5f9] text-[#475569]",
  Leave: "bg-[#fef3c7] text-[#92400e]",
};

export default function GuardsPage({ user }) {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editGuard, setEditGuard] = useState(null);
  const [form, setForm] = useState(EMPTY_GUARD);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "guards"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setGuards(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const stats = {
    total: guards.length,
    onDuty: guards.filter((g) => g.status === "On Duty").length,
    offDuty: guards.filter((g) => g.status === "Off Duty").length,
    onLeave: guards.filter((g) => g.status === "Leave").length,
  };

  const filtered = guards.filter((g) => {
    const matchSearch =
      g.name?.toLowerCase().includes(search.toLowerCase()) ||
      g.site?.toLowerCase().includes(search.toLowerCase()) ||
      g.psira?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditGuard(null);
    setForm(EMPTY_GUARD);
    setShowModal(true);
  };

  const openEdit = (guard) => {
    setEditGuard(guard);
    setForm({ ...guard });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user?.uid || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editGuard) {
        await updateDoc(doc(db, "users", user.uid, "guards", editGuard.id), {
          ...form,
          updatedAt: serverTimestamp(),
        });
      } else {
        const count = guards.length + 1;
        await addDoc(collection(db, "users", user.uid, "guards"), {
          ...form,
          guardId: `GRD-${String(count).padStart(3, "0")}`,
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
    if (!user?.uid) return;
    await deleteDoc(doc(db, "users", user.uid, "guards", id));
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Security Guards</h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Manage your guard roster and assignments
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Guard
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Guards",
            value: stats.total,
            icon: UserCheck,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "On Duty",
            value: stats.onDuty,
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Off Duty",
            value: stats.offDuty,
            icon: Clock,
            bg: "bg-[#f8fafc]",
            color: "text-[#64748b]",
          },
          {
            label: "On Leave",
            value: stats.onLeave,
            icon: Calendar,
            bg: "bg-[#fef9c3]",
            color: "text-[#ca8a04]",
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

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guards…"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] bg-white focus:outline-none"
          >
            {["All", "On Duty", "Off Duty", "Leave"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-[#f8fafc] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserCheck className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#374151] mb-1">
                No guards found
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Add your first guard to get started
              </p>
              <button
                onClick={openAdd}
                className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium"
              >
                Add Guard
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {[
                    "Guard ID",
                    "Name",
                    "Assigned Site",
                    "Shift",
                    "PSIRA",
                    "Contact",
                    "Rating",
                    "Status",
                    "",
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
                {filtered.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-[#64748b]">
                      {g.guardId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {g.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-[#1e293b]">
                          {g.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {g.site || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                      {g.shift || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b] font-mono">
                      {g.psira || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {g.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
                        <span className="text-sm font-semibold text-[#1e293b]">
                          {g.rating || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[g.status] || "bg-[#f1f5f9] text-[#475569]"}`}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(g)}
                          className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(g)}
                          className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editGuard ? "Edit Guard" : "Add New Guard"}
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
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="James Mokoena"
                  />
                </div>
                <div>
                  <label className={labelCls}>PSIRA Number</label>
                  <input
                    className={inputCls}
                    value={form.psira}
                    onChange={(e) =>
                      setForm({ ...form, psira: e.target.value })
                    }
                    placeholder="PSIRA-A12345"
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="082 111 2233"
                  />
                </div>
                <div>
                  <label className={labelCls}>Assigned Site</label>
                  <input
                    className={inputCls}
                    value={form.site}
                    onChange={(e) => setForm({ ...form, site: e.target.value })}
                    placeholder="Sandton City Mall"
                  />
                </div>
                <div>
                  <label className={labelCls}>Shift Hours</label>
                  <input
                    className={inputCls}
                    value={form.shift}
                    onChange={(e) =>
                      setForm({ ...form, shift: e.target.value })
                    }
                    placeholder="06:00–18:00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    {["On Duty", "Off Duty", "Leave"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Rating (0–5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className={inputCls}
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: parseFloat(e.target.value) })
                    }
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
                {saving ? "Saving…" : editGuard ? "Update Guard" : "Add Guard"}
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
              Delete Guard?
            </h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              Remove <strong>{deleteConfirm.name}</strong> from the roster? This
              cannot be undone.
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
