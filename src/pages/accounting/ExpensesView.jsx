import React, { useState, useEffect, useCallback } from "react";
import { useCurrency as useAppCurrency } from "../../contexts/CurrencyContext";
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
  TrendingDown,
  Plus,
  X,
  Edit2,
  Trash2,
  Search,
  Receipt,
  Filter,
  Download,
  ArrowLeft,
  Users,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Rent & Premises",
  "Salaries & Wages",
  "Utilities",
  "Travel & Fuel",
  "Office Supplies",
  "Professional Fees",
  "Marketing & Advertising",
  "Insurance",
  "Maintenance & Repairs",
  "Bank Charges",
  "Telephone & Internet",
  "Depreciation",
  "Cost of Sales",
  "Subscriptions & Software",
  "Entertainment",
  "Training & Development",
  "Other",
];

const VAT_OPTIONS = [
  { label: "Standard (15%)", rate: 15 },
  { label: "Zero-rated (0%)", rate: 0 },
  { label: "Exempt (N/A)", rate: -1 },
];

const CATEGORY_COLORS = {
  "Rent & Premises": { bg: "bg-[#eff6ff]", text: "text-[#2563eb]" },
  "Salaries & Wages": { bg: "bg-[#f0fdf4]", text: "text-[#059669]" },
  Utilities: { bg: "bg-[#fff7ed]", text: "text-[#ea580c]" },
  "Travel & Fuel": { bg: "bg-[#faf5ff]", text: "text-[#7c3aed]" },
  "Office Supplies": { bg: "bg-[#fef2f2]", text: "text-[#dc2626]" },
  "Professional Fees": { bg: "bg-[#ecfeff]", text: "text-[#0891b2]" },
  "Marketing & Advertising": { bg: "bg-[#fdf4ff]", text: "text-[#a21caf]" },
  Insurance: { bg: "bg-[#f0fdf4]", text: "text-[#15803d]" },
  "Maintenance & Repairs": { bg: "bg-[#fff7ed]", text: "text-[#c2410c]" },
  "Bank Charges": { bg: "bg-[#fef2f2]", text: "text-[#b91c1c]" },
  "Telephone & Internet": { bg: "bg-[#eff6ff]", text: "text-[#1d4ed8]" },
  Depreciation: { bg: "bg-[#f8fafc]", text: "text-[#475569]" },
  "Cost of Sales": { bg: "bg-[#faf5ff]", text: "text-[#6d28d9]" },
  "Subscriptions & Software": { bg: "bg-[#ecfdf5]", text: "text-[#047857]" },
  Entertainment: { bg: "bg-[#fff1f2]", text: "text-[#e11d48]" },
  "Training & Development": { bg: "bg-[#eff6ff]", text: "text-[#3b82f6]" },
  Other: { bg: "bg-[#f1f5f9]", text: "text-[#64748b]" },
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const CURR_YEAR = new Date().getFullYear();
const YEAR_OPTS = [CURR_YEAR, CURR_YEAR - 1, CURR_YEAR - 2];

// ── Shared styles (match rest of dashboard) ───────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-[#2563eb]",
  "bg-[#059669]",
  "bg-[#7c3aed]",
  "bg-[#ea580c]",
  "bg-[#0891b2]",
  "bg-[#d97706]",
  "bg-[#dc2626]",
  "bg-[#0d9488]",
];
const avatarColor = (name = "") =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ── Amount calculator ─────────────────────────────────────────────────────────
const calcAmounts = (amountExcl, vatRate) => {
  const excl = Number(amountExcl) || 0;
  const vatAmt = vatRate >= 0 ? excl * (vatRate / 100) : 0;
  return { amountExcl: excl, vatAmount: vatAmt, amountIncl: excl + vatAmt };
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — client picker → expenses workspace
// ══════════════════════════════════════════════════════════════════════════════
export default function ExpensesView({ user }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState("");
  const db = getFirestore();

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      setLoadingClients(true);
      try {
        const snap = await getDocs(
          query(
            collection(db, "users", user.uid, "clients"),
            orderBy("createdAt", "desc"),
          ),
        );
        setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setLoadingClients(false);
      }
    };
    load();
  }, [user]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  });

  if (!selectedClient) {
    return (
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[#ea580c]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1e293b]">Expenses</h1>
              <p className="text-xs text-[#64748b]">
                Select a client to manage their expenses
              </p>
            </div>
          </div>
          <span className="text-xs text-[#94a3b8] bg-[#f1f5f9] px-2.5 py-1 rounded-full">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
            />
          </div>

          {loadingClients ? (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              Loading clients…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[#cbd5e1]" />
              </div>
              <p className="text-sm font-medium text-[#94a3b8]">
                No clients found
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Add clients first in the Clients section
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setSearch("");
                    setSelectedClient(client);
                  }}
                  className="group bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#ea580c] transition-all text-left w-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-11 h-11 ${avatarColor(client.name)} rounded-xl flex items-center justify-center`}
                    >
                      <span className="text-sm font-bold text-white">
                        {initials(client.name)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#cbd5e1] group-hover:text-[#ea580c] transition-colors mt-1" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-2">
                    {client.name}
                  </h3>
                  <div className="space-y-1.5">
                    {client.email && (
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                        <Mail className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                        <Phone className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                        <MapPin className="w-3 h-3 text-[#94a3b8] flex-shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
                    <span className="text-xs text-[#ea580c] font-medium group-hover:underline">
                      View expenses →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ExpensesWorkspace
      user={user}
      client={selectedClient}
      onBack={() => setSelectedClient(null)}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPENSES WORKSPACE
// ══════════════════════════════════════════════════════════════════════════════
function ExpensesWorkspace({ user, client, onBack }) {
  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const fmt = (n) => formatVisitorCurrency(n, "ZAR");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterYear, setFilterYear] = useState(CURR_YEAR);
  const [filterMonth, setFilterMonth] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const blankForm = () => ({
    date: new Date().toISOString().split("T")[0],
    description: "",
    supplier: "",
    category: "Other",
    amountExcl: "",
    vatRate: 15,
    reference: "",
    notes: "",
    isRecurring: false,
  });
  const [form, setForm] = useState(blankForm());

  const db = getFirestore();
  const base = ["users", user.uid, "clients", client.id, "expenses"];
  const col = () => collection(db, ...base);
  const expDoc = (id) => doc(db, ...base, id);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(col(), orderBy("date", "desc")));
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [client.id, user.uid]);

  useEffect(() => {
    load();
  }, [load]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(blankForm());
    setShowModal(true);
  };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      date: e.date || "",
      description: e.description || "",
      supplier: e.supplier || "",
      category: e.category || "Other",
      amountExcl: e.amountExcl ?? "",
      vatRate: e.vatRate ?? 15,
      reference: e.reference || "",
      notes: e.notes || "",
      isRecurring: e.isRecurring || false,
    });
    setShowModal(true);
  };
  const handleSave = async () => {
    if (!form.description.trim() || !form.amountExcl) return;
    setSaving(true);
    const amounts = calcAmounts(form.amountExcl, form.vatRate);
    const payload = { ...form, ...amounts };
    try {
      editing
        ? await updateDoc(expDoc(editing.id), {
            ...payload,
            updatedAt: serverTimestamp(),
          })
        : await addDoc(col(), { ...payload, createdAt: serverTimestamp() });
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    await deleteDoc(expDoc(id));
    load();
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    const dt = e.date || "";
    return (
      (!q ||
        e.description?.toLowerCase().includes(q) ||
        e.supplier?.toLowerCase().includes(q) ||
        e.reference?.toLowerCase().includes(q)) &&
      (filterCat === "All" || e.category === filterCat) &&
      Number(dt.slice(0, 4)) === filterYear &&
      (filterMonth === "All" || Number(dt.slice(5, 7)) === Number(filterMonth))
    );
  });

  const totalExcl = filtered.reduce((s, e) => s + (e.amountExcl || 0), 0);
  const totalVat = filtered.reduce((s, e) => s + (e.vatAmount || 0), 0);
  const totalIncl = filtered.reduce((s, e) => s + (e.amountIncl || 0), 0);
  const vatClaim = filtered
    .filter((e) => e.vatRate === 15)
    .reduce((s, e) => s + (e.vatAmount || 0), 0);

  // Category breakdown (for summary tab - uses year-level data, not filtered)
  const yearExp = expenses.filter(
    (e) => Number((e.date || "").slice(0, 4)) === filterYear,
  );
  const yearIncl = yearExp.reduce((s, e) => s + (e.amountIncl || 0), 0);
  const byCat = CATEGORIES.reduce((acc, cat) => {
    const items = yearExp.filter((e) => e.category === cat);
    if (items.length)
      acc[cat] = {
        count: items.length,
        total: items.reduce((s, e) => s + (e.amountIncl || 0), 0),
        vat: items.reduce((s, e) => s + (e.vatAmount || 0), 0),
      };
    return acc;
  }, {});

  // Monthly
  const byMonth = Array.from({ length: 12 }, (_, i) => {
    const mo = String(i + 1).padStart(2, "0");
    const items = expenses.filter((e) =>
      (e.date || "").startsWith(`${filterYear}-${mo}`),
    );
    return {
      month: MONTHS[i],
      count: items.length,
      excl: items.reduce((s, e) => s + (e.amountExcl || 0), 0),
      vat: items.reduce((s, e) => s + (e.vatAmount || 0), 0),
      incl: items.reduce((s, e) => s + (e.amountIncl || 0), 0),
    };
  });
  const maxMo = Math.max(...byMonth.map((m) => m.incl), 1);

  // CSV export
  const handleExport = () => {
    const hdrs = [
      "Date",
      "Description",
      "Supplier",
      "Category",
      "Excl VAT",
      "VAT Rate",
      "VAT Amount",
      "Incl VAT",
      "Reference",
      "Notes",
    ];
    const rows = filtered.map((e) => [
      e.date,
      `"${e.description}"`,
      `"${e.supplier || ""}"`,
      `"${e.category}"`,
      (e.amountExcl || 0).toFixed(2),
      e.vatRate >= 0 ? e.vatRate + "%" : "Exempt",
      (e.vatAmount || 0).toFixed(2),
      (e.amountIncl || 0).toFixed(2),
      `"${e.reference || ""}"`,
      `"${e.notes || ""}"`,
    ]);
    const csv = [hdrs, ...rows].map((r) => r.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: `expenses_${client.name.replace(/\s+/g, "_")}_${filterYear}.csv`,
    });
    a.click();
  };

  // Preview amounts in modal
  const preview = form.amountExcl
    ? calcAmounts(form.amountExcl, form.vatRate)
    : null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Client bar */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-5 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          className={`w-8 h-8 ${avatarColor(client.name)} rounded-full flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-xs font-bold text-white">
            {initials(client.name)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1e293b] truncate">
            {client.name}
          </p>
          <p className="text-xs text-[#64748b]">Expenses</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors flex-shrink-0"
        >
          <Users className="w-3.5 h-3.5" />
          Change Client
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 bg-white border-b border-[#e2e8f0] px-5">
        <div className="flex gap-1">
          {[
            { id: "list", label: "Expense List" },
            { id: "summary", label: "Summary & Breakdown" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${activeTab === id ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* ── LIST ─────────────────────────────────────────────────────────── */}
        {activeTab === "list" && (
          <div className="max-w-6xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-[#ea580c]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1e293b]">
                    Expenses
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    {client.name} · {filtered.length} records · {filterYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] text-sm rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              </div>
            </div>

            {/* KPI tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Total (Excl. VAT)",
                  value: `${fmt(totalExcl)}`,
                  sub: `${filtered.length} items`,
                  bg: "bg-[#fff7ed]",
                  border: "border-[#fed7aa]",
                  color: "text-[#ea580c]",
                },
                {
                  label: "VAT Amount",
                  value: `${fmt(totalVat)}`,
                  sub: "15% standard",
                  bg: "bg-[#fef2f2]",
                  border: "border-[#fecaca]",
                  color: "text-[#dc2626]",
                },
                {
                  label: "Total (Incl. VAT)",
                  value: `${fmt(totalIncl)}`,
                  sub: "Gross spend",
                  bg: "bg-[#f8fafc]",
                  border: "border-[#e2e8f0]",
                  color: "text-[#1e293b]",
                },
                {
                  label: "Claimable VAT Input",
                  value: `${fmt(vatClaim)}`,
                  sub: "Standard-rated only",
                  bg: "bg-[#f0fdf4]",
                  border: "border-[#bbf7d0]",
                  color: "text-[#059669]",
                },
              ].map(({ label, value, sub, bg, border, color }) => (
                <div
                  key={label}
                  className={`${bg} border ${border} rounded-xl p-4`}
                >
                  <p className="text-xs font-semibold text-[#64748b]">
                    {label}
                  </p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                  <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search description, supplier, reference…"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                  />
                </div>
                <select
                  className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                >
                  {YEAR_OPTS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
                <select
                  className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="All">All months</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>
                      {m}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters((p) => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? "bg-[#fff7ed] border-[#fed7aa] text-[#ea580c]" : "border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
                >
                  <Filter className="w-4 h-4" />
                  Category
                  {filterCat !== "All" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="px-4 pb-3 border-t border-[#f1f5f9] pt-3 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterCat("All")}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${filterCat === "All" ? "bg-[#ea580c] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => {
                    const { bg, text } =
                      CATEGORY_COLORS[cat] || CATEGORY_COLORS["Other"];
                    const active = filterCat === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilterCat(cat)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${active ? `${bg} ${text} ring-1 ring-current` : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] hover:bg-[#f1f5f9]"}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-16 text-[#94a3b8] text-sm">
                Loading expenses…
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
                <Receipt className="w-10 h-10 text-[#cbd5e1] mb-3" />
                <p className="text-sm font-medium text-[#94a3b8]">
                  No expenses found
                </p>
                <p className="text-xs text-[#cbd5e1] mt-1">
                  Add an expense or adjust your filters
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      {[
                        "Date",
                        "Description / Supplier",
                        "Category",
                        "Excl. VAT",
                        "VAT",
                        "Incl. VAT",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((exp) => {
                      const { bg, text } =
                        CATEGORY_COLORS[exp.category] ||
                        CATEGORY_COLORS["Other"];
                      return (
                        <tr
                          key={exp.id}
                          className="border-b border-[#f8fafc] hover:bg-[#fafafa] transition-colors group"
                        >
                          <td className="px-4 py-3 text-sm text-[#64748b] whitespace-nowrap">
                            {fmtDate(exp.date)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#1e293b]">
                              {exp.description}
                            </p>
                            {exp.supplier && (
                              <p className="text-xs text-[#94a3b8]">
                                {exp.supplier}
                              </p>
                            )}
                            {exp.reference && (
                              <p className="text-xs font-mono text-[#cbd5e1]">
                                {exp.reference}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${bg} ${text}`}
                            >
                              {exp.category}
                            </span>
                            {exp.isRecurring && (
                              <span className="ml-1.5 text-[10px] font-bold text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                                REC
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                            {fmt(exp.amountExcl)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#94a3b8]">
                            {exp.vatRate >= 0 ? (
                              `${fmt(exp.vatAmount)}`
                            ) : (
                              <span className="text-xs italic">Exempt</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                            {fmt(exp.amountIncl)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(exp)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(exp.id)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                      <td
                        className="px-4 py-3 text-sm font-bold text-[#374151]"
                        colSpan={3}
                      >
                        Total ({filtered.length} items)
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#374151]">
                        {fmt(totalExcl)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#dc2626]">
                        {fmt(totalVat)}
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-[#1e293b]">
                        {fmt(totalIncl)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SUMMARY ──────────────────────────────────────────────────────── */}
        {activeTab === "summary" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-[#ea580c]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1e293b]">
                    Expense Summary
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    {client.name} · {filterYear}
                  </p>
                </div>
              </div>
              <select
                className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-1.5 bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
              >
                {YEAR_OPTS.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Annual KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Annual Excl. VAT",
                  value: `${fmt(yearExp.reduce((s, e) => s + (e.amountExcl || 0), 0))}`,
                  color: "text-[#ea580c]",
                },
                {
                  label: "Annual VAT",
                  value: `${fmt(yearExp.reduce((s, e) => s + (e.vatAmount || 0), 0))}`,
                  color: "text-[#dc2626]",
                },
                {
                  label: "Annual Incl. VAT",
                  value: `${fmt(yearIncl)}`,
                  color: "text-[#1e293b]",
                },
                {
                  label: "Claimable VAT Input",
                  value: `${fmt(yearExp.filter((e) => e.vatRate === 15).reduce((s, e) => s + (e.vatAmount || 0), 0))}`,
                  color: "text-[#059669]",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-[#64748b]">
                    {label}
                  </p>
                  <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Monthly bar chart */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5">
              <p className="text-sm font-semibold text-[#374151] mb-5">
                Monthly Spend — {filterYear}
              </p>
              <div
                className="flex items-end gap-1.5"
                style={{ height: "140px" }}
              >
                {byMonth.map((m) => (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-[#fed7aa] hover:bg-[#fb923c] rounded-t transition-colors"
                      style={{
                        height: `${(m.incl / maxMo) * 110}px`,
                        minHeight: m.incl > 0 ? "4px" : "0",
                      }}
                      title={`${fmt(m.incl)}`}
                    />
                    <span className="text-[10px] text-[#94a3b8]">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
              <table className="w-full mt-4 border-t border-[#f1f5f9] pt-4">
                <thead>
                  <tr className="border-b border-[#f1f5f9]">
                    {["Month", "Items", "Excl. VAT", "VAT", "Total Incl."].map(
                      (h) => (
                        <th
                          key={h}
                          className="pb-2 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {byMonth
                    .filter((m) => m.count > 0)
                    .map((m) => (
                      <tr
                        key={m.month}
                        className="border-b border-[#f8fafc] hover:bg-[#fafafa] transition-colors"
                      >
                        <td className="py-2.5 text-sm font-semibold text-[#374151]">
                          {m.month}
                        </td>
                        <td className="py-2.5 text-sm text-[#64748b]">
                          {m.count}
                        </td>
                        <td className="py-2.5 text-sm text-[#374151]">
                          {fmt(m.excl)}
                        </td>
                        <td className="py-2.5 text-sm text-[#dc2626]">
                          {fmt(m.vat)}
                        </td>
                        <td className="py-2.5 text-sm font-bold text-[#1e293b]">
                          {fmt(m.incl)}
                        </td>
                      </tr>
                    ))}
                  {byMonth.every((m) => m.count === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-sm text-[#94a3b8]"
                      >
                        No expenses for {filterYear}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Category breakdown */}
            {Object.keys(byCat).length > 0 && (
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <span className="text-sm font-semibold text-[#374151]">
                    Spend by Category — {filterYear}
                  </span>
                </div>
                <div className="divide-y divide-[#f8fafc]">
                  {Object.entries(byCat)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([cat, { count, total, vat }]) => {
                      const pct =
                        yearIncl > 0
                          ? ((total / yearIncl) * 100).toFixed(1)
                          : "0";
                      const { bg, text } =
                        CATEGORY_COLORS[cat] || CATEGORY_COLORS["Other"];
                      return (
                        <div
                          key={cat}
                          className="px-5 py-3.5 hover:bg-[#fafafa] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${bg} ${text}`}
                              >
                                {cat}
                              </span>
                              <span className="text-xs text-[#94a3b8]">
                                {count} item{count !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-[#1e293b]">
                                {fmt(total)}
                              </span>
                              <span className="text-xs text-[#94a3b8] ml-2">
                                {pct}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden mb-1.5">
                            <div
                              className="h-full bg-[#fb923c] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-[#94a3b8]">
                              VAT: {fmt(vat)}
                            </span>
                            <span className="text-xs text-[#94a3b8]">
                              Excl: {fmt(total - vat)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-[#e2e8f0] my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div>
                <h2 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Expense" : "Add Expense"}
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">{client.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Date + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Date *</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    className={selectCls}
                    value={form.category}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category: e.target.value }))
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description *</label>
                <input
                  className={inputCls}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="e.g. Office rent — January 2025"
                />
              </div>

              {/* Supplier */}
              <div>
                <label className={labelCls}>Supplier / Payee</label>
                <input
                  className={inputCls}
                  value={form.supplier}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                  placeholder="e.g. Growthpoint Properties"
                />
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Amount (Excl. VAT) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8] font-semibold">
                      R
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      className={`${inputCls} pl-7`}
                      value={form.amountExcl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, amountExcl: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>VAT Treatment</label>
                  <select
                    className={selectCls}
                    value={form.vatRate}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        vatRate: Number(e.target.value),
                      }))
                    }
                  >
                    {VAT_OPTIONS.map((v) => (
                      <option key={v.rate} value={v.rate}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live preview */}
              {preview && (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">
                    Amount Breakdown
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      {
                        label: "Excl. VAT",
                        value: `${fmt(preview.amountExcl)}`,
                        color: "text-[#374151]",
                      },
                      {
                        label: "VAT",
                        value:
                          form.vatRate >= 0
                            ? `${fmt(preview.vatAmount)}`
                            : "Exempt",
                        color: "text-[#dc2626]",
                      },
                      {
                        label: "Incl. VAT",
                        value: `${fmt(preview.amountIncl)}`,
                        color: "text-[#1e293b] font-black",
                      },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <p className="text-xs text-[#64748b]">{label}</p>
                        <p className={`text-base font-bold mt-0.5 ${color}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference */}
              <div>
                <label className={labelCls}>Reference / Invoice #</label>
                <input
                  className={inputCls}
                  value={form.reference}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reference: e.target.value }))
                  }
                  placeholder="e.g. SUP-2025-001"
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Any additional notes…"
                />
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center gap-3 py-1">
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, isRecurring: !p.isRecurring }))
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.isRecurring ? "bg-[#2563eb]" : "bg-[#d1d5db]"}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form.isRecurring ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-[#374151]">
                    Recurring expense
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    Mark as a regular monthly expense
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[#64748b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving || !form.description.trim() || !form.amountExcl
                }
                className="flex items-center gap-2 px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving
                  ? "Saving…"
                  : editing
                    ? "Update Expense"
                    : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
