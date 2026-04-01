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
  Plus, Users, CheckCircle, DollarSign, Building, Mail,
  UserCheck, X, Save, AlertTriangle, Edit, Trash2, Search,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const EMPTY_CLIENT = {
  name: "", contact: "", email: "", phone: "",
  sites: 0, guards: 0, contract: "", value: "", status: "Active", notes: "",
};

export default function ClientsPage({ user }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState(EMPTY_CLIENT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "clients"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "Active").length,
    sites: clients.reduce((a, c) => a + (parseInt(c.sites) || 0), 0),
  };

  const filtered = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditClient(null);
    setForm(EMPTY_CLIENT);
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditClient(client);
    setForm({ ...client });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user?.uid || !form.name.trim()) return;
    setSaving(true);
    try {
      const count = clients.length + 1;
      if (editClient) {
        await updateDoc(doc(db, "users", user.uid, "clients", editClient.id), {
          ...form, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "clients"), {
          ...form,
          clientId: `CLT-${String(count).padStart(3, "0")}`,
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
    await deleteDoc(doc(db, "users", user.uid, "clients", id));
    setDeleteConfirm(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Clients</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Manage client contracts and relationships</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Clients", value: stats.total, icon: Users, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
          { label: "Active Contracts", value: stats.active, icon: CheckCircle, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
          { label: "Monthly Revenue", value: "—", icon: DollarSign, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
          { label: "Sites Covered", value: stats.sites, icon: Building, bg: "bg-[#faf5ff]", color: "text-[#7c3aed]" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
      </div>

      {/* Client Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-[#e2e8f0] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <Building className="w-10 h-10 text-[#cbd5e1] mb-3" />
          <p className="text-sm font-medium text-[#374151] mb-1">No clients yet</p>
          <p className="text-xs text-[#94a3b8] mb-3">Add your first client to get started</p>
          <button onClick={openAdd} className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium">
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb] to-[#7c3aed] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1e293b]">{c.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === "Active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748b]">{c.contact}{c.phone ? ` · ${c.phone}` : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#059669]">{c.value || "—"}</p>
                  {c.contract && <p className="text-xs text-[#94a3b8]">Since {c.contract}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-[#f1f5f9] pt-3 flex-wrap">
                {c.sites ? (
                  <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    <Building className="w-4 h-4" /><span>{c.sites} Sites</span>
                  </div>
                ) : null}
                {c.guards ? (
                  <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    <UserCheck className="w-4 h-4" /><span>{c.guards} Guards</span>
                  </div>
                ) : null}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-sm text-[#64748b]">
                    <Mail className="w-4 h-4" /><span className="truncate max-w-[200px]">{c.email}</span>
                  </div>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="px-3 py-1.5 text-xs font-medium text-[#2563eb] border border-[#bfdbfe] bg-[#eff6ff] rounded-lg hover:bg-[#dbeafe] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(c)}
                    className="px-3 py-1.5 text-xs font-medium text-[#dc2626] border border-[#fecaca] bg-[#fef2f2] rounded-lg hover:bg-[#fee2e2] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-[#1e293b]">{editClient ? "Edit Client" : "Add New Client"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Company Name *</label>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ABC Corporation" />
                </div>
                <div>
                  <label className={labelCls}>Contact Person</label>
                  <input className={inputCls} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Sarah Johnson" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="011 234 5678" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Email</label>
                  <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="security@company.co.za" />
                </div>
                <div>
                  <label className={labelCls}>Monthly Value</label>
                  <input className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="R 48 000/mo" />
                </div>
                <div>
                  <label className={labelCls}>Contract Start Date</label>
                  <input type="date" className={inputCls} value={form.contract} onChange={(e) => setForm({ ...form, contract: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>No. of Sites</label>
                  <input type="number" className={inputCls} value={form.sites} onChange={(e) => setForm({ ...form, sites: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelCls}>No. of Guards</label>
                  <input type="number" className={inputCls} value={form.guards} onChange={(e) => setForm({ ...form, guards: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {["Active", "Pending", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes…" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : editClient ? "Update Client" : "Add Client"}
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
            <h3 className="text-base font-semibold text-[#1e293b] text-center mb-2">Delete Client?</h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              Remove <strong>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
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