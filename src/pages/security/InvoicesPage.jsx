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
  Plus, Receipt, CheckCircle, Clock, AlertTriangle,
  Eye, Download, X, Save, Edit, Trash2, Search,
} from "lucide-react";

const db = getFirestore();

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const statusStyle = {
  Paid: "bg-[#dcfce7] text-[#166534]",
  Outstanding: "bg-[#eff6ff] text-[#1d4ed8]",
  Overdue: "bg-[#fef2f2] text-[#dc2626]",
  Draft: "bg-[#f1f5f9] text-[#475569]",
};

const EMPTY_INVOICE = {
  client: "", amount: "", date: new Date().toISOString().split("T")[0],
  due: "", status: "Outstanding", description: "", notes: "",
};

const generateInvoiceNumber = (count) => {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
};

export default function InvoicesPage({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [form, setForm] = useState(EMPTY_INVOICE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "users", user.uid, "invoices"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const parseAmount = (str) => {
    if (!str) return 0;
    return parseFloat(String(str).replace(/[^0-9.]/g, "")) || 0;
  };

  const stats = {
    total: invoices.reduce((a, i) => a + parseAmount(i.amount), 0),
    paid: invoices.filter((i) => i.status === "Paid").reduce((a, i) => a + parseAmount(i.amount), 0),
    outstanding: invoices.filter((i) => i.status === "Outstanding").reduce((a, i) => a + parseAmount(i.amount), 0),
    overdue: invoices.filter((i) => i.status === "Overdue").reduce((a, i) => a + parseAmount(i.amount), 0),
  };

  const fmt = (n) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.client?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditInvoice(null);
    setForm({ ...EMPTY_INVOICE, date: new Date().toISOString().split("T")[0] });
    setShowModal(true);
  };
  const openEdit = (inv) => { setEditInvoice(inv); setForm({ ...inv }); setShowModal(true); };

  const handleSave = async () => {
    if (!user?.uid || !form.client.trim()) return;
    setSaving(true);
    try {
      if (editInvoice) {
        await updateDoc(doc(db, "users", user.uid, "invoices", editInvoice.id), {
          ...form, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "invoices"), {
          ...form,
          invoiceNumber: generateInvoiceNumber(invoices.length),
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
    await deleteDoc(doc(db, "users", user.uid, "invoices", id));
    setDeleteConfirm(null);
  };

  const updateStatus = async (inv, status) => {
    await updateDoc(doc(db, "users", user.uid, "invoices", inv.id), {
      status, updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Invoices</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Billing and payment management</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Invoiced", value: fmt(stats.total), icon: Receipt, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
          { label: "Paid", value: fmt(stats.paid), icon: CheckCircle, bg: "bg-[#f0fdf4]", color: "text-[#059669]" },
          { label: "Outstanding", value: fmt(stats.outstanding), icon: Clock, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
          { label: "Overdue", value: fmt(stats.overdue), icon: AlertTriangle, bg: "bg-[#fef2f2]", color: "text-[#dc2626]" },
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
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices…"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563eb]" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg bg-white focus:outline-none">
            {["All", "Paid", "Outstanding", "Overdue", "Draft"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <h3 className="text-sm font-semibold text-[#1e293b] ml-auto">Recent Invoices</h3>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#f8fafc] rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">No invoices yet</p>
            <p className="text-xs text-[#94a3b8] mb-3">Create your first invoice</p>
            <button onClick={openAdd} className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium">Create Invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  {["Invoice #", "Client", "Amount", "Date", "Due Date", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-[#2563eb]">{inv.invoiceNumber || "—"}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{inv.client}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[#1e293b]">{inv.amount || "—"}</td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{inv.date || "—"}</td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{inv.due || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={inv.status}
                        onChange={(e) => updateStatus(inv, e.target.value)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold border-0 cursor-pointer focus:outline-none ${statusStyle[inv.status] || "bg-[#f1f5f9] text-[#475569]"}`}
                      >
                        {["Paid", "Outstanding", "Overdue", "Draft"].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(inv)} className="p-1.5 text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(inv)} className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-[#1e293b]">{editInvoice ? "Edit Invoice" : "Create Invoice"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Client Name *</label>
                  <input className={inputCls} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="ABC Corporation" />
                </div>
                <div>
                  <label className={labelCls}>Amount</label>
                  <input className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="R 48 000.00" />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {["Outstanding", "Paid", "Overdue", "Draft"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Invoice Date</label>
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Due Date</label>
                  <input type="date" className={inputCls} value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Security services for May 2024" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes…" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.client.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : editInvoice ? "Update Invoice" : "Create Invoice"}
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
            <h3 className="text-base font-semibold text-[#1e293b] text-center mb-2">Delete Invoice?</h3>
            <p className="text-sm text-[#64748b] text-center mb-6">Remove invoice <strong>{deleteConfirm.invoiceNumber}</strong>?</p>
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