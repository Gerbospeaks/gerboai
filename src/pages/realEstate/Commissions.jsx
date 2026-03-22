import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  MoreVertical,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  Download,
} from "lucide-react";
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

const commissionStatusConfig = {
  pending: {
    label: "Pending",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#d97706]",
  },
  invoiced: {
    label: "Invoiced",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#2563eb]",
  },
  received: {
    label: "Received",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#059669]",
  },
  disputed: {
    label: "Disputed",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    dot: "bg-[#dc2626]",
  },
  written_off: {
    label: "Written Off",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
};

const dealTypes = [
  "Sale",
  "Letting",
  "Commercial Sale",
  "Commercial Letting",
  "New Build",
  "Other",
];

const EMPTY_FORM = {
  dealType: "Sale",
  propertyAddress: "",
  clientName: "",
  agentName: "",
  dealValue: "",
  commissionPercent: "",
  commissionAmount: "",
  status: "pending",
  completionDate: "",
  invoiceNumber: "",
  notes: "",
};

const fmt = (n) =>
  `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "—");

export default function Commissions({ user }) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    if (user?.uid) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const q = query(
        collection(db, "users", user.uid, "commissions"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setCommissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      ...EMPTY_FORM,
      completionDate: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditingItem(c);
    setForm({ ...EMPTY_FORM, ...c });
    setShowModal(true);
    setMenuOpen(null);
  };

  // Auto-calc commission amount from percent
  const handleFormChange = (key, val) => {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "commissionPercent" || key === "dealValue") {
        const pct =
          parseFloat(
            key === "commissionPercent" ? val : next.commissionPercent,
          ) || 0;
        const dv = parseFloat(key === "dealValue" ? val : next.dealValue) || 0;
        if (pct && dv) next.commissionAmount = ((pct / 100) * dv).toFixed(2);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.propertyAddress && !form.clientName)
      return alert("Property address or client name is required");
    setSaving(true);
    try {
      const db = getFirestore();
      const data = {
        ...form,
        dealValue: Number(form.dealValue) || 0,
        commissionPercent: Number(form.commissionPercent) || 0,
        commissionAmount: Number(form.commissionAmount) || 0,
        updatedAt: serverTimestamp(),
      };
      if (editingItem) {
        await updateDoc(
          doc(db, "users", user.uid, "commissions", editingItem.id),
          data,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "commissions"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (e) {
      alert("Failed to save commission");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this commission record?")) return;
    await deleteDoc(doc(getFirestore(), "users", user.uid, "commissions", id));
    setMenuOpen(null);
    load();
  };

  const filtered = commissions.filter((c) => {
    const s = search.toLowerCase();
    return (
      (!search ||
        c.propertyAddress?.toLowerCase().includes(s) ||
        c.clientName?.toLowerCase().includes(s) ||
        c.agentName?.toLowerCase().includes(s)) &&
      (filterStatus === "all" || c.status === filterStatus)
    );
  });

  const stats = {
    total: commissions.length,
    pending: commissions.filter((c) => c.status === "pending").length,
    received: commissions.reduce(
      (s, c) =>
        c.status === "received" ? s + Number(c.commissionAmount || 0) : s,
      0,
    ),
    projected: commissions.reduce(
      (s, c) =>
        ["pending", "invoiced"].includes(c.status)
          ? s + Number(c.commissionAmount || 0)
          : s,
      0,
    ),
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white";
  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Records",
            value: stats.total,
            icon: CreditCard,
            iconBg: "bg-[#eff6ff]",
            iconColor: "text-[#2563eb]",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            iconBg: "bg-[#fffbeb]",
            iconColor: "text-[#d97706]",
          },
          {
            label: "Received",
            value: fmt(stats.received),
            icon: CheckCircle,
            iconBg: "bg-[#f0fdf4]",
            iconColor: "text-[#059669]",
          },
          {
            label: "Projected Income",
            value: fmt(stats.projected),
            icon: TrendingUp,
            iconBg: "bg-[#faf5ff]",
            iconColor: "text-[#7c3aed]",
          },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} mb-3`}
            >
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
            <p className="text-lg font-bold text-[#1e293b]">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by property, client or agent…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={inputCls + " sm:w-40"}
          >
            <option value="all">All Statuses</option>
            {Object.entries(commissionStatusConfig).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Commission
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-[#f8fafc] rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">
              No commissions found
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              Track your first commission
            </p>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Commission
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    {[
                      "Property / Client",
                      "Deal Type",
                      "Deal Value",
                      "Commission",
                      "Completion",
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
                <tbody>
                  {filtered.map((c) => {
                    const sc =
                      commissionStatusConfig[c.status] ||
                      commissionStatusConfig.pending;
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-[#1e293b] truncate max-w-[200px]">
                            {c.propertyAddress || "—"}
                          </p>
                          {c.clientName && (
                            <p className="text-xs text-[#64748b]">
                              {c.clientName}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#374151]">
                          {c.dealType}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-[#1e293b]">
                          {fmt(c.dealValue)}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-bold text-[#059669]">
                            {fmt(c.commissionAmount)}
                          </p>
                          {c.commissionPercent > 0 && (
                            <p className="text-xs text-[#94a3b8]">
                              {c.commissionPercent}%
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#374151]">
                          {fmtDate(c.completionDate)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                            />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuOpen(menuOpen === c.id ? null : c.id)
                              }
                              className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {menuOpen === c.id && (
                              <div className="absolute right-0 top-8 bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-10 py-1 w-36">
                                <button
                                  onClick={() => {
                                    setViewItem(c);
                                    setMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View
                                </button>
                                <button
                                  onClick={() => openEdit(c)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc]"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(c.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#f1f5f9]">
              {filtered.map((c) => {
                const sc =
                  commissionStatusConfig[c.status] ||
                  commissionStatusConfig.pending;
                return (
                  <div
                    key={c.id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1e293b] truncate">
                        {c.propertyAddress || c.clientName || "—"}
                      </p>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {c.dealType} · {fmtDate(c.completionDate)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-bold text-[#059669]">
                          {fmt(c.commissionAmount)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                        >
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editingItem ? "Edit Commission" : "Add Commission"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Field label="Property Address">
                <input
                  value={form.propertyAddress}
                  onChange={(e) =>
                    handleFormChange("propertyAddress", e.target.value)
                  }
                  placeholder="Address"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Client Name">
                  <input
                    value={form.clientName}
                    onChange={(e) =>
                      handleFormChange("clientName", e.target.value)
                    }
                    placeholder="Client"
                    className={inputCls}
                  />
                </Field>
                <Field label="Agent Name">
                  <input
                    value={form.agentName}
                    onChange={(e) =>
                      handleFormChange("agentName", e.target.value)
                    }
                    placeholder="Agent"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Deal Type">
                  <select
                    value={form.dealType}
                    onChange={(e) =>
                      handleFormChange("dealType", e.target.value)
                    }
                    className={inputCls}
                  >
                    {dealTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                    className={inputCls}
                  >
                    {Object.entries(commissionStatusConfig).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Deal Value (£)">
                <input
                  type="number"
                  value={form.dealValue}
                  onChange={(e) =>
                    handleFormChange("dealValue", e.target.value)
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Commission % (auto-calc)">
                  <input
                    type="number"
                    step="0.01"
                    value={form.commissionPercent}
                    onChange={(e) =>
                      handleFormChange("commissionPercent", e.target.value)
                    }
                    placeholder="e.g. 1.5"
                    className={inputCls}
                  />
                </Field>
                <Field label="Commission Amount (£)">
                  <input
                    type="number"
                    step="0.01"
                    value={form.commissionAmount}
                    onChange={(e) =>
                      handleFormChange("commissionAmount", e.target.value)
                    }
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Completion Date">
                  <input
                    type="date"
                    value={form.completionDate}
                    onChange={(e) =>
                      handleFormChange("completionDate", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Invoice Number">
                  <input
                    value={form.invoiceNumber}
                    onChange={(e) =>
                      handleFormChange("invoiceNumber", e.target.value)
                    }
                    placeholder="RE-2026-0001"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Additional notes…"
                  className={inputCls + " resize-none"}
                />
              </Field>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#d1d5db] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : editingItem
                    ? "Save Changes"
                    : "Add Commission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0] overflow-hidden">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => setViewItem(null)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-white font-bold text-lg mt-4">
                {viewItem.propertyAddress ||
                  viewItem.clientName ||
                  "Commission"}
              </h2>
              <p className="text-white/60 text-sm mt-1">{viewItem.dealType}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748b]">Deal Value</p>
                  <p className="text-xl font-bold text-[#1e293b]">
                    {fmt(viewItem.dealValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#64748b]">Commission</p>
                  <p className="text-xl font-bold text-[#059669]">
                    {fmt(viewItem.commissionAmount)}
                  </p>
                  {viewItem.commissionPercent > 0 && (
                    <p className="text-xs text-[#94a3b8]">
                      {viewItem.commissionPercent}%
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${commissionStatusConfig[viewItem.status]?.bg} ${commissionStatusConfig[viewItem.status]?.text}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${commissionStatusConfig[viewItem.status]?.dot}`}
                />
                {commissionStatusConfig[viewItem.status]?.label}
              </span>
              <div className="space-y-2 text-sm border-t border-[#f1f5f9] pt-3">
                {viewItem.clientName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#94a3b8]" />
                    <span className="text-[#374151]">
                      {viewItem.clientName}
                    </span>
                  </div>
                )}
                {viewItem.agentName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#94a3b8]" />
                    <span className="text-[#374151]">
                      {viewItem.agentName} (Agent)
                    </span>
                  </div>
                )}
                {viewItem.completionDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#94a3b8]" />
                    <span className="text-[#374151]">
                      {fmtDate(viewItem.completionDate)}
                    </span>
                  </div>
                )}
                {viewItem.invoiceNumber && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#94a3b8]" />
                    <span className="text-[#374151]">
                      Invoice: {viewItem.invoiceNumber}
                    </span>
                  </div>
                )}
              </div>
              {viewItem.notes && (
                <p className="text-sm text-[#374151] bg-[#f8fafc] rounded-lg p-3 border border-[#e2e8f0]">
                  {viewItem.notes}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setViewItem(null);
                    openEdit(viewItem);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
