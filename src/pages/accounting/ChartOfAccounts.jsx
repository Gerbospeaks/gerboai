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
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  BookOpen,
  ChevronDown,
} from "lucide-react";

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const TYPE_META = {
  Asset: {
    bg: "bg-[#eff6ff]",
    text: "text-[#2563eb]",
    border: "border-[#bfdbfe]",
    dot: "bg-[#2563eb]",
  },
  Liability: {
    bg: "bg-[#fef2f2]",
    text: "text-[#dc2626]",
    border: "border-[#fecaca]",
    dot: "bg-[#dc2626]",
  },
  Equity: {
    bg: "bg-[#f0fdf4]",
    text: "text-[#059669]",
    border: "border-[#bbf7d0]",
    dot: "bg-[#059669]",
  },
  Revenue: {
    bg: "bg-[#faf5ff]",
    text: "text-[#7c3aed]",
    border: "border-[#e9d5ff]",
    dot: "bg-[#7c3aed]",
  },
  Expense: {
    bg: "bg-[#fff7ed]",
    text: "text-[#ea580c]",
    border: "border-[#fed7aa]",
    dot: "bg-[#ea580c]",
  },
};
const SEED_ACCOUNTS = [
  {
    code: "1000",
    name: "Cash and Cash Equivalents",
    type: "Asset",
    subtype: "Current Asset",
  },
  {
    code: "1100",
    name: "Accounts Receivable",
    type: "Asset",
    subtype: "Current Asset",
  },
  { code: "1200", name: "Inventory", type: "Asset", subtype: "Current Asset" },
  {
    code: "1500",
    name: "Property, Plant & Equipment",
    type: "Asset",
    subtype: "Fixed Asset",
  },
  {
    code: "2000",
    name: "Accounts Payable",
    type: "Liability",
    subtype: "Current Liability",
  },
  {
    code: "2100",
    name: "VAT Payable",
    type: "Liability",
    subtype: "Current Liability",
  },
  {
    code: "2200",
    name: "PAYE Payable",
    type: "Liability",
    subtype: "Current Liability",
  },
  {
    code: "2500",
    name: "Long-term Debt",
    type: "Liability",
    subtype: "Long-term Liability",
  },
  { code: "3000", name: "Owner's Equity", type: "Equity", subtype: "Equity" },
  {
    code: "3100",
    name: "Retained Earnings",
    type: "Equity",
    subtype: "Equity",
  },
  {
    code: "4000",
    name: "Service Revenue",
    type: "Revenue",
    subtype: "Operating Revenue",
  },
  {
    code: "4100",
    name: "Product Sales",
    type: "Revenue",
    subtype: "Operating Revenue",
  },
  {
    code: "5000",
    name: "Cost of Goods Sold",
    type: "Expense",
    subtype: "Direct Cost",
  },
  {
    code: "5100",
    name: "Salaries & Wages",
    type: "Expense",
    subtype: "Operating Expense",
  },
  {
    code: "5200",
    name: "Rent Expense",
    type: "Expense",
    subtype: "Operating Expense",
  },
  {
    code: "5300",
    name: "Utilities",
    type: "Expense",
    subtype: "Operating Expense",
  },
  {
    code: "5400",
    name: "Marketing & Advertising",
    type: "Expense",
    subtype: "Operating Expense",
  },
  {
    code: "5500",
    name: "Depreciation",
    type: "Expense",
    subtype: "Non-cash Expense",
  },
];

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 });

// Props: user, clientId, clientName
export default function ChartOfAccounts({ user, clientId, clientName }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "Asset",
    subtype: "",
    description: "",
  });

  const db = getFirestore();
  const basePath = ["users", user.uid, "clients", clientId, "chartOfAccounts"];
  const col = () => collection(db, ...basePath);
  const docRef = (id) => doc(db, ...basePath, id);

  const load = async () => {
    if (!user?.uid || !clientId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(col(), orderBy("code")));
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (data.length === 0) {
        for (const acc of SEED_ACCOUNTS)
          await addDoc(col(), {
            ...acc,
            balance: 0,
            isActive: true,
            createdAt: serverTimestamp(),
          });
        const s2 = await getDocs(query(col(), orderBy("code")));
        data = s2.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user, clientId]);

  const openAdd = () => {
    setEditing(null);
    setForm({
      code: "",
      name: "",
      type: "Asset",
      subtype: "",
      description: "",
    });
    setShowModal(true);
  };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      code: a.code,
      name: a.name,
      type: a.type,
      subtype: a.subtype || "",
      description: a.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true);
    try {
      editing
        ? await updateDoc(docRef(editing.id), {
            ...form,
            updatedAt: serverTimestamp(),
          })
        : await addDoc(col(), {
            ...form,
            balance: 0,
            isActive: true,
            createdAt: serverTimestamp(),
          });
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    await deleteDoc(docRef(id));
    load();
  };

  const filtered = accounts.filter(
    (a) =>
      (a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.includes(search)) &&
      (filter === "All" || a.type === filter),
  );
  const grouped = ACCOUNT_TYPES.reduce((g, t) => {
    g[t] = filtered.filter((a) => a.type === t);
    return g;
  }, {});
  const typeTotal = (t) =>
    accounts
      .filter((a) => a.type === t)
      .reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Chart of Accounts
            </h1>
            <p className="text-xs text-[#64748b]">
              {clientName} · {accounts.length} accounts
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-5 gap-3">
        {ACCOUNT_TYPES.map((type) => {
          const { bg, text, border } = TYPE_META[type];
          return (
            <div key={type} className={`${bg} border ${border} rounded-xl p-3`}>
              <p
                className={`text-[10px] font-bold ${text} uppercase tracking-widest`}
              >
                {type}
              </p>
              <p className="text-2xl font-black text-[#1e293b] mt-1 leading-none">
                {accounts.filter((a) => a.type === type).length}
              </p>
              <p className="text-xs text-[#64748b] mt-0.5">
                R{fmt(typeTotal(type))}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or name…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["All", ...ACCOUNT_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === t ? "bg-[#2563eb] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Groups */}
      {loading ? (
        <div className="text-center py-16 text-[#94a3b8] text-sm">
          Loading accounts…
        </div>
      ) : (
        <div className="space-y-3">
          {ACCOUNT_TYPES.map((type) => {
            const list = grouped[type];
            if (!list.length) return null;
            const { bg, text, border, dot } = TYPE_META[type];
            return (
              <div
                key={type}
                className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() =>
                    setCollapsed((p) => ({ ...p, [type]: !p[type] }))
                  }
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${bg} ${text} border ${border}`}
                    >
                      {type}
                    </span>
                    <span className="text-sm font-semibold text-[#374151]">
                      {list.length} accounts
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#1e293b]">
                      R{fmt(typeTotal(type))}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#94a3b8] transition-transform duration-200 ${collapsed[type] ? "" : "rotate-180"}`}
                    />
                  </div>
                </button>
                {!collapsed[type] && (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#f1f5f9]">
                        {["Code", "Account Name", "Subtype", "Balance", ""].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-5 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((a) => (
                        <tr
                          key={a.id}
                          className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors"
                        >
                          <td className="px-5 py-3 text-sm font-mono font-semibold text-[#64748b]">
                            {a.code}
                          </td>
                          <td className="px-5 py-3 text-sm font-medium text-[#1e293b]">
                            {a.name}
                          </td>
                          <td className="px-5 py-3 text-xs text-[#94a3b8]">
                            {a.subtype}
                          </td>
                          <td className="px-5 py-3 text-sm font-semibold text-[#1e293b]">
                            R{fmt(a.balance)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => openEdit(a)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(a.id)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
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
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-sm font-semibold text-[#1e293b]">
                {editing ? "Edit Account" : "Add Account"}
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
                  <label className={labelCls}>Code *</label>
                  <input
                    className={inputCls}
                    value={form.code}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, code: e.target.value }))
                    }
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Type *</label>
                  <select
                    className={selectCls}
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Account Name *</label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Cash and Cash Equivalents"
                />
              </div>
              <div>
                <label className={labelCls}>Subtype</label>
                <input
                  className={inputCls}
                  value={form.subtype}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subtype: e.target.value }))
                  }
                  placeholder="e.g. Current Asset"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.code.trim() || !form.name.trim()}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update" : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
