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
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  ChevronDown,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  BarChart3,
  ArrowDownRight,
  Wrench,
  Car,
  Monitor,
  Building2,
  Archive,
} from "lucide-react";

// ── Shared styles (matching dashboard) ───────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-ZA") : "—";
const today = () => new Date().toISOString().split("T")[0];

// ── Asset categories ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Vehicles", icon: Car, color: "#2563eb", bg: "#eff6ff" },
  { label: "Equipment", icon: Wrench, color: "#7c3aed", bg: "#faf5ff" },
  { label: "IT & Computers", icon: Monitor, color: "#0891b2", bg: "#ecfeff" },
  { label: "Furniture", icon: Package, color: "#d97706", bg: "#fffbeb" },
  { label: "Buildings", icon: Building2, color: "#059669", bg: "#f0fdf4" },
  { label: "Other", icon: Archive, color: "#64748b", bg: "#f8fafc" },
];

// ── Depreciation methods ──────────────────────────────────────────────────────
const DEPRECIATION_METHODS = [
  { value: "straight-line", label: "Straight Line" },
  { value: "declining-balance", label: "Declining Balance" },
  { value: "units-of-production", label: "Units of Production" },
  { value: "none", label: "No Depreciation" },
];

// ── SA SARS standard useful lives ────────────────────────────────────────────
const USEFUL_LIFE_PRESETS = [
  { label: "Vehicles (5 yrs)", years: 5 },
  { label: "Computers (3 yrs)", years: 3 },
  { label: "Furniture (6 yrs)", years: 6 },
  { label: "Buildings (25 yrs)", years: 25 },
  { label: "Plant & Equipment (5 yrs)", years: 5 },
  { label: "Custom", years: 0 },
];

// ── Depreciation engine ───────────────────────────────────────────────────────
function calcDepreciation(asset) {
  const {
    purchaseDate,
    cost,
    residualValue = 0,
    usefulLifeYears,
    depreciationMethod,
    annualRatePercent,
  } = asset;

  if (!purchaseDate || !cost || depreciationMethod === "none") {
    return {
      annualDep: 0,
      accumDep: 0,
      bookValue: Number(cost || 0),
      fullyDepreciated: false,
    };
  }

  const costNum = Number(cost || 0);
  const residual = Number(residualValue || 0);
  const depBase = costNum - residual;
  const yearsLife = Number(usefulLifeYears || 5);
  const startDate = new Date(purchaseDate);
  const now = new Date();
  const yearsElapsed = Math.max(
    0,
    (now - startDate) / (1000 * 60 * 60 * 24 * 365.25),
  );

  let annualDep = 0,
    accumDep = 0;

  if (depreciationMethod === "straight-line") {
    annualDep = depBase / yearsLife;
    accumDep = Math.min(depBase, annualDep * yearsElapsed);
  } else if (depreciationMethod === "declining-balance") {
    const rate = Number(annualRatePercent || 0) / 100;
    let book = costNum;
    let accum = 0;
    const years = Math.floor(yearsElapsed);
    for (let i = 0; i < years && book > residual; i++) {
      const dep = (book - residual) * rate;
      accum += dep;
      book -= dep;
    }
    // Partial year
    const partial = yearsElapsed - years;
    if (partial > 0 && book > residual) {
      const dep = (book - residual) * rate * partial;
      accum += dep;
    }
    annualDep = (costNum - residual) * rate;
    accumDep = Math.min(depBase, accum);
  }

  const bookValue = Math.max(residual, costNum - accumDep);
  const fullyDepreciated = bookValue <= residual;

  return { annualDep, accumDep, bookValue, fullyDepreciated, yearsElapsed };
}

// Generate year-by-year depreciation schedule
function generateSchedule(asset) {
  const {
    purchaseDate,
    cost,
    residualValue = 0,
    usefulLifeYears,
    depreciationMethod,
    annualRatePercent,
  } = asset;

  if (!purchaseDate || !cost || depreciationMethod === "none") return [];

  const costNum = Number(cost || 0);
  const residual = Number(residualValue || 0);
  const depBase = costNum - residual;
  const yearsLife = Number(usefulLifeYears || 5);
  const startYear = new Date(purchaseDate).getFullYear();
  const rows = [];

  let book = costNum,
    accum = 0;

  for (let y = 0; y < yearsLife; y++) {
    let dep = 0;
    if (depreciationMethod === "straight-line") {
      dep = depBase / yearsLife;
    } else if (depreciationMethod === "declining-balance") {
      const rate = Number(annualRatePercent || 0) / 100;
      dep = (book - residual) * rate;
    }
    dep = Math.min(dep, book - residual);
    accum += dep;
    book -= dep;

    rows.push({
      year: startYear + y,
      openBook: book + dep,
      depreciation: dep,
      accumDep: accum,
      closeBook: Math.max(residual, book),
    });

    if (book <= residual) break;
  }
  return rows;
}

// ── Status helpers ────────────────────────────────────────────────────────────
const assetStatus = (asset) => {
  if (asset.disposalDate) return "disposed";
  const { fullyDepreciated } = calcDepreciation(asset);
  if (fullyDepreciated) return "fully-depreciated";
  return "active";
};

const STATUS_META = {
  active: {
    label: "Active",
    cls: "bg-[#f0fdf4] text-[#059669]",
    icon: CheckCircle,
  },
  "fully-depreciated": {
    label: "Fully Depreciated",
    cls: "bg-[#eff6ff] text-[#2563eb]",
    icon: Archive,
  },
  disposed: { label: "Disposed", cls: "bg-[#fef2f2] text-[#dc2626]", icon: X },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.active;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${meta.cls}`}
    >
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
};

const CategoryIcon = ({ category }) => {
  const cat = CATEGORIES.find((c) => c.label === category) || CATEGORIES[5];
  const Icon = cat.icon;
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: cat.bg }}
    >
      <Icon className="w-4 h-4" style={{ color: cat.color }} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// Props: user, clientId, clientName
// ══════════════════════════════════════════════════════════════════════════════
export default function FixedAssetRegister({ user, clientId, clientName }) {
  const { formatCurrency: formatVisitorCurrency } = useAppCurrency();
  const fmt = (n) => formatVisitorCurrency(n, "ZAR");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [view, setView] = useState("register"); // register | schedule
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const db = getFirestore();
  const clientBase = ["users", user.uid, "clients", clientId];
  const col = () => collection(db, ...clientBase, "fixedAssets");
  const docRef = (id) => doc(db, ...clientBase, "fixedAssets", id);

  const blankForm = () => ({
    name: "",
    assetNumber: "",
    category: "Equipment",
    purchaseDate: today(),
    purchasePrice: "",
    cost: "",
    residualValue: "0",
    usefulLifeYears: "5",
    depreciationMethod: "straight-line",
    annualRatePercent: "20",
    location: "",
    serialNumber: "",
    supplier: "",
    notes: "",
    disposalDate: "",
    disposalValue: "",
  });

  const [form, setForm] = useState(blankForm());

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.uid || !clientId) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(col(), orderBy("purchaseDate", "desc")));
      setAssets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  }, [user?.uid, clientId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null);
    setForm(blankForm());
    setShowModal(true);
  };

  const openEdit = (asset) => {
    setEditing(asset);
    setForm({
      name: asset.name || "",
      assetNumber: asset.assetNumber || "",
      category: asset.category || "Equipment",
      purchaseDate: asset.purchaseDate || today(),
      purchasePrice: asset.purchasePrice || "",
      cost: asset.cost || "",
      residualValue: asset.residualValue ?? "0",
      usefulLifeYears: asset.usefulLifeYears || "5",
      depreciationMethod: asset.depreciationMethod || "straight-line",
      annualRatePercent: asset.annualRatePercent || "20",
      location: asset.location || "",
      serialNumber: asset.serialNumber || "",
      supplier: asset.supplier || "",
      notes: asset.notes || "",
      disposalDate: asset.disposalDate || "",
      disposalValue: asset.disposalValue || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.cost) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        cost: Number(form.cost),
        residualValue: Number(form.residualValue || 0),
        usefulLifeYears: Number(form.usefulLifeYears || 5),
        annualRatePercent: Number(form.annualRatePercent || 20),
        purchasePrice: Number(form.purchasePrice || form.cost),
      };
      if (editing) {
        await updateDoc(docRef(editing.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Auto-generate asset number
        const count = assets.length + 1;
        payload.assetNumber =
          payload.assetNumber || `FA-${String(count).padStart(4, "0")}`;
        await addDoc(col(), { ...payload, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset? This cannot be undone.")) return;
    await deleteDoc(docRef(id));
    load();
  };

  const handleDispose = async (asset) => {
    const disposalDate = prompt("Disposal date (YYYY-MM-DD):", today());
    if (!disposalDate) return;
    const disposalValue = prompt("Disposal proceeds (R):", "0");
    await updateDoc(docRef(asset.id), {
      disposalDate,
      disposalValue: Number(disposalValue || 0),
      updatedAt: serverTimestamp(),
    });
    load();
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const status = assetStatus(a);
    const matchQ =
      a.name?.toLowerCase().includes(q) ||
      a.assetNumber?.toLowerCase().includes(q) ||
      a.supplier?.toLowerCase().includes(q);
    const matchCat = filterCat === "All" || a.category === filterCat;
    const matchSt = filterStatus === "All" || status === filterStatus;
    return matchQ && matchCat && matchSt;
  });

  const totalCost = assets.reduce((s, a) => s + (a.cost || 0), 0);
  const totalAccumDep = assets.reduce(
    (s, a) => s + calcDepreciation(a).accumDep,
    0,
  );
  const totalBookVal = assets.reduce(
    (s, a) => s + calcDepreciation(a).bookValue,
    0,
  );
  const totalAnnualDep = assets
    .filter((a) => !a.disposalDate)
    .reduce((s, a) => s + calcDepreciation(a).annualDep, 0);
  const activeCount = assets.filter((a) => assetStatus(a) === "active").length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1e293b]">
              Fixed Asset Register
            </h1>
            <p className="text-xs text-[#64748b]">
              {clientName} · {assets.length} assets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-[#f1f5f9] rounded-lg p-0.5">
            {[
              { id: "register", icon: FileText, label: "Register" },
              { id: "schedule", icon: BarChart3, label: "Schedule" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === id
                    ? "bg-white text-[#1e293b] shadow-sm"
                    : "text-[#64748b] hover:text-[#374151]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Cost",
            value: `${fmt(totalCost)}`,
            icon: DollarSign,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Accum. Depreciation",
            value: `${fmt(totalAccumDep)}`,
            icon: TrendingDown,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
          {
            label: "Net Book Value",
            value: `${fmt(totalBookVal)}`,
            icon: BarChart3,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Annual Dep. Charge",
            value: `${fmt(totalAnnualDep)}`,
            icon: Calendar,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b]">
                {label}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Category summary bar ── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => {
          const count = assets.filter((a) => a.category === cat.label).length;
          if (count === 0) return null;
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              onClick={() =>
                setFilterCat(filterCat === cat.label ? "All" : cat.label)
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                filterCat === cat.label
                  ? "shadow-sm scale-[1.02]"
                  : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]"
              }`}
              style={
                filterCat === cat.label
                  ? {
                      background: cat.bg,
                      borderColor: cat.color + "60",
                      color: cat.color,
                    }
                  : {}
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: cat.color + "20", color: cat.color }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + status filter ── */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets by name, number or supplier…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <div className="flex gap-1.5">
          {["All", "active", "fully-depreciated", "disposed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                filterStatus === s
                  ? "bg-[#ea580c] text-white"
                  : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
              }`}
            >
              {s === "All" ? "All" : STATUS_META[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ REGISTER VIEW ══ */}
      {view === "register" && (
        <>
          {loading ? (
            <div className="text-center py-16 text-[#94a3b8] text-sm">
              Loading assets…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#e2e8f0] rounded-xl">
              <Package className="w-10 h-10 text-[#cbd5e1] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">
                No assets found
              </p>
              <p className="text-xs text-[#cbd5e1] mt-1">
                Add your first fixed asset to get started
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    {[
                      "Asset",
                      "Category",
                      "Purchase Date",
                      "Cost (R)",
                      "Accum. Dep (R)",
                      "Book Value (R)",
                      "Annual Dep (R)",
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
                  {filtered.map((asset) => {
                    const dep = calcDepreciation(asset);
                    const status = assetStatus(asset);
                    const isExp = expandedRows[asset.id];
                    const schedule = isExp ? generateSchedule(asset) : [];

                    return (
                      <React.Fragment key={asset.id}>
                        <tr className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors">
                          {/* Asset name + number */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <CategoryIcon category={asset.category} />
                              <div>
                                <p className="text-sm font-semibold text-[#1e293b]">
                                  {asset.name}
                                </p>
                                <p className="text-xs text-[#94a3b8] font-mono">
                                  {asset.assetNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#f1f5f9] text-[#64748b]">
                              {asset.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#64748b]">
                            {fmtDate(asset.purchaseDate)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                            {fmt(asset.cost)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#dc2626] font-medium">
                            {fmt(dep.accumDep)}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-[#059669]">
                            {fmt(dep.bookValue)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#ea580c]">
                            {asset.depreciationMethod === "none"
                              ? "—"
                              : `${fmt(dep.annualDep)}/yr`}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setExpandedRows((p) => ({
                                    ...p,
                                    [asset.id]: !p[asset.id],
                                  }))
                                }
                                title="View depreciation schedule"
                                className={`p-1.5 rounded-lg transition-all ${isExp ? "bg-[#eff6ff] text-[#2563eb]" : "text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff]"}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEdit(asset)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#059669] hover:bg-[#f0fdf4] rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {!asset.disposalDate && (
                                <button
                                  onClick={() => handleDispose(asset)}
                                  title="Dispose asset"
                                  className="p-1.5 text-[#94a3b8] hover:text-[#ea580c] hover:bg-[#fff7ed] rounded-lg transition-all"
                                >
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(asset.id)}
                                className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline depreciation schedule */}
                        {isExp && (
                          <tr>
                            <td colSpan={9} className="px-4 py-0 bg-[#f8fafc]">
                              <div className="py-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <BarChart3 className="w-4 h-4 text-[#2563eb]" />
                                  <span className="text-xs font-bold text-[#374151] uppercase tracking-wide">
                                    Depreciation Schedule — {asset.name}
                                  </span>
                                  <span className="text-xs text-[#94a3b8]">
                                    ·{" "}
                                    {asset.depreciationMethod ===
                                    "straight-line"
                                      ? "Straight Line"
                                      : "Declining Balance"}
                                    {asset.depreciationMethod ===
                                    "declining-balance"
                                      ? ` @ ${asset.annualRatePercent}%`
                                      : ""}
                                    {" · "}Useful life {asset.usefulLifeYears}{" "}
                                    yrs
                                    {" · "}Residual {fmt(asset.residualValue)}
                                  </span>
                                </div>

                                {schedule.length === 0 ? (
                                  <p className="text-xs text-[#94a3b8]">
                                    No depreciation schedule available.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto rounded-lg border border-[#e2e8f0]">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="bg-[#eff6ff] border-b border-[#bfdbfe]">
                                          {[
                                            "Year",
                                            "Opening Book Value",
                                            "Depreciation",
                                            "Accum. Depreciation",
                                            "Closing Book Value",
                                          ].map((h) => (
                                            <th
                                              key={h}
                                              className="px-4 py-2 text-left font-semibold text-[#2563eb] uppercase tracking-wide"
                                            >
                                              {h}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {schedule.map((row, i) => {
                                          const currentYear =
                                            new Date().getFullYear();
                                          const isCurrent =
                                            row.year === currentYear;
                                          return (
                                            <tr
                                              key={row.year}
                                              className={`border-b border-[#f1f5f9] last:border-0 ${isCurrent ? "bg-[#fffbeb]" : "hover:bg-[#f8fafc]"}`}
                                            >
                                              <td className="px-4 py-2 font-semibold text-[#374151]">
                                                {row.year}
                                                {isCurrent && (
                                                  <span className="ml-1.5 px-1.5 py-0.5 bg-[#fef3c7] text-[#92400e] rounded text-[9px] font-bold">
                                                    Current
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-4 py-2 text-[#64748b]">
                                                {fmt(row.openBook)}
                                              </td>
                                              <td className="px-4 py-2 text-[#dc2626] font-medium">
                                                {fmt(row.depreciation)}
                                              </td>
                                              <td className="px-4 py-2 text-[#64748b]">
                                                {fmt(row.accumDep)}
                                              </td>
                                              <td className="px-4 py-2 font-semibold text-[#059669]">
                                                {fmt(row.closeBook)}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {/* Visual depreciation bar */}
                                {schedule.length > 0 && (
                                  <div className="mt-3 flex items-end gap-1 h-12">
                                    {schedule.map((row) => {
                                      const maxBook = Number(asset.cost);
                                      const pct =
                                        (row.closeBook / maxBook) * 100;
                                      const curr =
                                        row.year === new Date().getFullYear();
                                      return (
                                        <div
                                          key={row.year}
                                          title={`${row.year}: ${fmt(row.closeBook)}`}
                                          className="flex-1 rounded-t transition-all"
                                          style={{
                                            height: `${Math.max(4, pct)}%`,
                                            background: curr
                                              ? "#2563eb"
                                              : "#bfdbfe",
                                            minWidth: "4px",
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>

                {/* Totals footer */}
                <tfoot>
                  <tr className="bg-[#f8fafc] border-t-2 border-[#e2e8f0]">
                    <td
                      className="px-4 py-3 text-sm font-bold text-[#1e293b]"
                      colSpan={3}
                    >
                      Totals ({filtered.length} assets)
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#1e293b]">
                      {fmt(filtered.reduce((s, a) => s + (a.cost || 0), 0))}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#dc2626]">
                      R
                      {fmt(
                        filtered.reduce(
                          (s, a) => s + calcDepreciation(a).accumDep,
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#059669]">
                      R
                      {fmt(
                        filtered.reduce(
                          (s, a) => s + calcDepreciation(a).bookValue,
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#ea580c]">
                      R
                      {fmt(
                        filtered
                          .filter((a) => !a.disposalDate)
                          .reduce(
                            (s, a) => s + calcDepreciation(a).annualDep,
                            0,
                          ),
                      )}
                      /yr
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══ SCHEDULE VIEW ══ */}
      {view === "schedule" && (
        <div className="space-y-4">
          <div className="px-5 py-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-sm text-[#1e40af]">
            <span className="font-semibold">Full Depreciation Schedule</span> —
            showing all active assets across their full useful life. Current
            year highlighted in amber.
          </div>

          {assets
            .filter((a) => !a.disposalDate && a.depreciationMethod !== "none")
            .map((asset) => {
              const schedule = generateSchedule(asset);
              if (schedule.length === 0) return null;
              return (
                <div
                  key={asset.id}
                  className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={asset.category} />
                      <div>
                        <span className="text-sm font-semibold text-[#1e293b]">
                          {asset.name}
                        </span>
                        <span className="text-xs text-[#94a3b8] font-mono ml-2">
                          {asset.assetNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#64748b]">
                      <span>
                        Cost:{" "}
                        <span className="font-semibold text-[#1e293b]">
                          {fmt(asset.cost)}
                        </span>
                      </span>
                      <span>
                        Annual dep:{" "}
                        <span className="font-semibold text-[#ea580c]">
                          {fmt(calcDepreciation(asset).annualDep)}
                        </span>
                      </span>
                      <span>
                        Residual:{" "}
                        <span className="font-semibold text-[#1e293b]">
                          {fmt(asset.residualValue)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#e2e8f0]">
                        {[
                          "Year",
                          "Opening BV",
                          "Depreciation",
                          "Accum. Dep",
                          "Closing BV",
                          "% Depreciated",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left font-semibold text-[#64748b] uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => {
                        const curr = row.year === new Date().getFullYear();
                        const pctDep = (
                          (row.accumDep /
                            (Number(asset.cost) -
                              Number(asset.residualValue || 0))) *
                          100
                        ).toFixed(1);
                        return (
                          <tr
                            key={row.year}
                            className={`border-b border-[#f8fafc] last:border-0 ${curr ? "bg-[#fffbeb]" : "hover:bg-[#f8fafc]"}`}
                          >
                            <td className="px-4 py-2.5 font-semibold text-[#374151]">
                              {row.year}
                              {curr && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-[#fef3c7] text-[#92400e] rounded text-[9px] font-bold">
                                  Now
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-[#64748b]">
                              {fmt(row.openBook)}
                            </td>
                            <td className="px-4 py-2.5 text-[#dc2626] font-medium">
                              {fmt(row.depreciation)}
                            </td>
                            <td className="px-4 py-2.5 text-[#64748b]">
                              {fmt(row.accumDep)}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-[#059669]">
                              {fmt(row.closeBook)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-[#f1f5f9] rounded-full h-1.5 max-w-20">
                                  <div
                                    className="h-1.5 rounded-full bg-[#dc2626]"
                                    style={{
                                      width: `${Math.min(100, pctDep)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[#64748b]">
                                  {pctDep}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
        </div>
      )}

      {/* ══ ADD / EDIT MODAL ══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-[#e2e8f0] my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#ea580c]" />
                </div>
                <h2 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Asset" : "Add Fixed Asset"}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Asset Details */}
              <FormSection label="Asset Details">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Asset Name *</label>
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Toyota Hilux 2.8 GD-6"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Asset Number</label>
                    <input
                      className={inputCls}
                      value={form.assetNumber}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, assetNumber: e.target.value }))
                      }
                      placeholder="Auto-generated if blank"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      className={selectCls}
                      value={form.category}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.label}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Supplier</label>
                    <input
                      className={inputCls}
                      value={form.supplier}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, supplier: e.target.value }))
                      }
                      placeholder="Supplier name"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Serial / VIN Number</label>
                    <input
                      className={inputCls}
                      value={form.serialNumber}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, serialNumber: e.target.value }))
                      }
                      placeholder="Serial or VIN"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Location</label>
                    <input
                      className={inputCls}
                      value={form.location}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, location: e.target.value }))
                      }
                      placeholder="e.g. Main office, Warehouse A"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Financial Details */}
              <FormSection label="Financial Details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Purchase Date *</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.purchaseDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, purchaseDate: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Cost (R) *</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.cost}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cost: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Residual Value (R)</label>
                    <input
                      type="number"
                      className={inputCls}
                      value={form.residualValue}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          residualValue: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </FormSection>

              {/* Depreciation */}
              <FormSection label="Depreciation">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Method</label>
                    <select
                      className={selectCls}
                      value={form.depreciationMethod}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          depreciationMethod: e.target.value,
                        }))
                      }
                    >
                      {DEPRECIATION_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.depreciationMethod !== "none" && (
                    <>
                      <div>
                        <label className={labelCls}>Useful Life (Years)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className={inputCls}
                            value={form.usefulLifeYears}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                usefulLifeYears: e.target.value,
                              }))
                            }
                            placeholder="5"
                          />
                          <select
                            className="px-2 py-2 text-xs border border-[#d1d5db] rounded-md bg-white text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] flex-shrink-0"
                            onChange={(e) => {
                              if (e.target.value)
                                setForm((p) => ({
                                  ...p,
                                  usefulLifeYears: e.target.value,
                                }));
                            }}
                            defaultValue=""
                          >
                            <option value="">Preset</option>
                            {USEFUL_LIFE_PRESETS.filter((p) => p.years > 0).map(
                              (p) => (
                                <option key={p.label} value={p.years}>
                                  {p.label}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                      </div>
                      {form.depreciationMethod === "declining-balance" && (
                        <div>
                          <label className={labelCls}>Annual Rate (%)</label>
                          <input
                            type="number"
                            className={inputCls}
                            value={form.annualRatePercent}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                annualRatePercent: e.target.value,
                              }))
                            }
                            placeholder="20"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Live depreciation preview */}
                {form.cost && form.depreciationMethod !== "none" && (
                  <div className="mt-3 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
                    <p className="text-xs font-semibold text-[#64748b] mb-3 uppercase tracking-wide">
                      Depreciation Preview
                    </p>
                    {(() => {
                      const preview = calcDepreciation({
                        ...form,
                        cost: Number(form.cost),
                        residualValue: Number(form.residualValue || 0),
                        usefulLifeYears: Number(form.usefulLifeYears || 5),
                        annualRatePercent: Number(form.annualRatePercent || 20),
                      });
                      return (
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {
                              label: "Annual Dep.",
                              value: `${fmt(preview.annualDep)}`,
                              color: "text-[#ea580c]",
                            },
                            {
                              label: "To Date",
                              value: `${fmt(preview.accumDep)}`,
                              color: "text-[#dc2626]",
                            },
                            {
                              label: "Current BV",
                              value: `${fmt(preview.bookValue)}`,
                              color: "text-[#059669]",
                            },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="text-center">
                              <p className="text-xs text-[#64748b]">{label}</p>
                              <p className={`text-base font-bold ${color}`}>
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </FormSection>

              {/* Disposal (edit only) */}
              {editing && (
                <FormSection label="Disposal (if sold / scrapped)">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Disposal Date</label>
                      <input
                        type="date"
                        className={inputCls}
                        value={form.disposalDate}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            disposalDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Disposal Proceeds (R)</label>
                      <input
                        type="number"
                        className={inputCls}
                        value={form.disposalValue}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            disposalValue: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {form.disposalDate && form.disposalValue && form.cost && (
                    <div
                      className={`mt-3 px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                        Number(form.disposalValue) >=
                        calcDepreciation({ ...form, cost: Number(form.cost) })
                          .bookValue
                          ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#059669]"
                          : "bg-[#fef2f2] border-[#fecaca] text-[#dc2626]"
                      }`}
                    >
                      {Number(form.disposalValue) >=
                      calcDepreciation({ ...form, cost: Number(form.cost) })
                        .bookValue ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {Number(form.disposalValue) >=
                      calcDepreciation({ ...form, cost: Number(form.cost) })
                        .bookValue
                        ? `Gain on disposal: ${fmt(Number(form.disposalValue) - calcDepreciation({ ...form, cost: Number(form.cost) }).bookValue)}`
                        : `Loss on disposal: ${fmt(calcDepreciation({ ...form, cost: Number(form.cost) }).bookValue - Number(form.disposalValue))}`}
                    </div>
                  )}
                </FormSection>
              )}

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
                  placeholder="Any additional notes about this asset…"
                />
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
                disabled={saving || !form.name.trim() || !form.cost}
                className="px-5 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update Asset" : "Add Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Form section wrapper ──────────────────────────────────────────────────────
function FormSection({ label, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          {label}
        </span>
        <div className="flex-1 h-px bg-[#e2e8f0]" />
      </div>
      {children}
    </div>
  );
}
