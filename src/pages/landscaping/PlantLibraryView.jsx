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
  Leaf,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  Sun,
  Droplets,
  Thermometer,
  Package,
  Filter,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLANT_TYPES = [
  "Tree",
  "Shrub",
  "Groundcover",
  "Grass / Lawn",
  "Perennial",
  "Annual",
  "Succulent / Cactus",
  "Fern",
  "Climber / Vine",
  "Aquatic",
  "Bulb",
  "Herb",
  "Vegetable",
  "Fruit Tree",
  "Palm",
  "Bamboo",
  "Other",
];

const WATER_NEEDS = ["Low", "Moderate", "High"];
const SUN_NEEDS = ["Full Shade", "Partial Shade", "Full Sun"];
const GROWTH_RATES = ["Slow", "Moderate", "Fast"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "Year-round"];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const EMPTY_FORM = {
  commonName: "",
  botanicalName: "",
  type: "Shrub",
  waterNeeds: "Moderate",
  sunNeeds: "Full Sun",
  growthRate: "Moderate",
  matureHeight: "",
  matureSpread: "",
  floweringSeason: [],
  bestPlantingMonths: [],
  qty: "",
  minStock: "",
  unitCost: "",
  sellingPrice: "",
  supplier: "",
  notes: "",
  status: "available",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatZAR = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    Number(n) || 0
  );

const isLowStock = (p) =>
  p.minStock != null && Number(p.minStock) > 0 && Number(p.qty) <= Number(p.minStock);

const stockBadge = (p) => {
  if (Number(p.qty) === 0)
    return { label: "Out of Stock", cls: "bg-[#fef2f2] text-[#dc2626]" };
  if (isLowStock(p))
    return { label: "Low Stock", cls: "bg-[#fef3c7] text-[#92400e]" };
  return { label: "In Stock", cls: "bg-[#dcfce7] text-[#166534]" };
};

const waterColor = { Low: "text-[#d97706]", Moderate: "text-[#2563eb]", High: "text-[#0891b2]" };
const sunColor = {
  "Full Shade": "text-[#64748b]",
  "Partial Shade": "text-[#d97706]",
  "Full Sun": "text-[#f59e0b]",
};

// ─── Multi-select pill component ──────────────────────────────────────────────
function PillSelector({ options, selected, onChange, colorFn }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter((o) => o !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              active
                ? "bg-[#059669] text-white border-[#059669]"
                : "bg-white text-[#64748b] border-[#d1d5db] hover:border-[#059669] hover:text-[#059669]"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Plant Card ───────────────────────────────────────────────────────────────
function PlantCard({ plant, onEdit, onDelete }) {
  const badge = stockBadge(plant);
  const low = isLowStock(plant);

  return (
    <div
      className={`bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
        low ? "border-[#fcd34d]" : "border-[#e2e8f0]"
      }`}
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-[#f0fdf4] to-[#f8fafc] px-4 pt-4 pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-[#dcfce7] rounded-lg flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#1e293b] truncate leading-tight">
                {plant.commonName}
              </h3>
              {plant.botanicalName && (
                <p className="text-xs text-[#64748b] italic truncate">
                  {plant.botanicalName}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${badge.cls}`}
          >
            {badge.label}
          </span>
        </div>

        <div className="mt-2">
          <span className="inline-block px-2 py-0.5 bg-[#f1f5f9] rounded text-xs text-[#374151] font-medium">
            {plant.type}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Care icons */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Droplets className={`w-3.5 h-3.5 ${waterColor[plant.waterNeeds] || "text-[#64748b]"}`} />
            <span className="text-[#374151]">{plant.waterNeeds}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun className={`w-3.5 h-3.5 ${sunColor[plant.sunNeeds] || "text-[#64748b]"}`} />
            <span className="text-[#374151]">{plant.sunNeeds}</span>
          </div>
          {plant.growthRate && (
            <div className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="text-[#374151]">{plant.growthRate}</span>
            </div>
          )}
        </div>

        {/* Size */}
        {(plant.matureHeight || plant.matureSpread) && (
          <div className="flex gap-4 text-xs text-[#64748b]">
            {plant.matureHeight && (
              <span>
                <span className="text-[#94a3b8]">Height: </span>
                <span className="font-medium text-[#374151]">{plant.matureHeight}</span>
              </span>
            )}
            {plant.matureSpread && (
              <span>
                <span className="text-[#94a3b8]">Spread: </span>
                <span className="font-medium text-[#374151]">{plant.matureSpread}</span>
              </span>
            )}
          </div>
        )}

        {/* Seasons */}
        {plant.floweringSeason?.length > 0 && (
          <div className="text-xs">
            <span className="text-[#94a3b8]">Flowers: </span>
            <span className="text-[#374151] font-medium">
              {plant.floweringSeason.join(", ")}
            </span>
          </div>
        )}
        {plant.bestPlantingMonths?.length > 0 && (
          <div className="text-xs">
            <span className="text-[#94a3b8]">Best planting: </span>
            <span className="text-[#374151] font-medium">
              {plant.bestPlantingMonths.join(", ")}
            </span>
          </div>
        )}

        {/* Stock & price */}
        <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Package className={`w-3.5 h-3.5 ${low ? "text-[#d97706]" : "text-[#94a3b8]"}`} />
              <span className={`font-semibold ${low ? "text-[#d97706]" : "text-[#374151]"}`}>
                {plant.qty ?? 0} in stock
              </span>
            </div>
            {plant.minStock > 0 && (
              <span className="text-[#94a3b8]">min {plant.minStock}</span>
            )}
          </div>
          <div className="text-right text-xs">
            {plant.sellingPrice && (
              <p className="font-bold text-[#059669]">{formatZAR(plant.sellingPrice)}</p>
            )}
            {plant.unitCost && (
              <p className="text-[#94a3b8]">Cost: {formatZAR(plant.unitCost)}</p>
            )}
          </div>
        </div>

        {plant.supplier && (
          <p className="text-xs text-[#94a3b8]">
            <span>Supplier: </span>
            <span className="text-[#374151]">{plant.supplier}</span>
          </p>
        )}

        {plant.notes && (
          <p className="text-xs text-[#94a3b8] italic leading-relaxed line-clamp-2">
            {plant.notes}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-4 pb-3 flex gap-2 border-t border-[#f1f5f9] pt-3">
        <button
          onClick={() => onEdit(plant)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors font-medium"
        >
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(plant)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#dc2626] bg-[#fef2f2] hover:bg-[#fee2e2] rounded-lg transition-colors font-medium"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PlantLibraryView({ user }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("details");

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "users", user.uid, "plants"), orderBy("createdAt", "desc"))
      );
      setPlants(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setActiveTab("details");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      commonName: p.commonName || "",
      botanicalName: p.botanicalName || "",
      type: p.type || "Shrub",
      waterNeeds: p.waterNeeds || "Moderate",
      sunNeeds: p.sunNeeds || "Full Sun",
      growthRate: p.growthRate || "Moderate",
      matureHeight: p.matureHeight || "",
      matureSpread: p.matureSpread || "",
      floweringSeason: p.floweringSeason || [],
      bestPlantingMonths: p.bestPlantingMonths || [],
      qty: p.qty ?? "",
      minStock: p.minStock ?? "",
      unitCost: p.unitCost ?? "",
      sellingPrice: p.sellingPrice ?? "",
      supplier: p.supplier || "",
      notes: p.notes || "",
      status: p.status || "available",
    });
    setErrors({});
    setActiveTab("details");
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.commonName.trim()) e.commonName = "Common name is required";
    if (form.qty !== "" && isNaN(Number(form.qty))) e.qty = "Must be a number";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    const payload = {
      ...form,
      qty: form.qty !== "" ? Number(form.qty) : 0,
      minStock: form.minStock !== "" ? Number(form.minStock) : 0,
      unitCost: form.unitCost !== "" ? Number(form.unitCost) : 0,
      sellingPrice: form.sellingPrice !== "" ? Number(form.sellingPrice) : 0,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "users", user.uid, "plants", editing.id), {
          ...payload, updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "plants"), {
          ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "plants", deleteConfirm.id));
      load();
    } catch (_) { alert("Failed to delete."); }
    finally { setDeleting(false); setDeleteConfirm(null); }
  };

  // Derived stats
  const totalValue = plants.reduce((s, p) => s + Number(p.qty || 0) * Number(p.unitCost || 0), 0);
  const lowCount = plants.filter(isLowStock).length;
  const outCount = plants.filter((p) => Number(p.qty) === 0).length;
  const allTypes = [...new Set(plants.map((p) => p.type).filter(Boolean))];

  const filtered = plants.filter((p) => {
    const matchSearch = [p.commonName, p.botanicalName, p.type, p.supplier].some(
      (v) => v?.toLowerCase().includes(search.toLowerCase())
    );
    const matchType = filterType === "all" || p.type === filterType;
    const matchStock =
      filterStock === "all"
        ? true
        : filterStock === "low"
        ? isLowStock(p)
        : filterStock === "out"
        ? Number(p.qty) === 0
        : true;
    return matchSearch && matchType && matchStock;
  });

  const f = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">Plant Library</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {plants.length} species · Stock value{" "}
            <span className="font-semibold text-[#059669]">{formatZAR(totalValue)}</span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Species", value: plants.length, color: "text-[#1e293b]", bg: "bg-[#f0fdf4]", icon: Leaf, iconColor: "text-[#059669]" },
          { label: "Low Stock", value: lowCount, color: lowCount > 0 ? "text-[#d97706]" : "text-[#1e293b]", bg: lowCount > 0 ? "bg-[#fef3c7]" : "bg-[#f1f5f9]", icon: AlertTriangle, iconColor: lowCount > 0 ? "text-[#d97706]" : "text-[#94a3b8]" },
          { label: "Out of Stock", value: outCount, color: outCount > 0 ? "text-[#dc2626]" : "text-[#1e293b]", bg: outCount > 0 ? "bg-[#fef2f2]" : "bg-[#f1f5f9]", icon: Package, iconColor: outCount > 0 ? "text-[#dc2626]" : "text-[#94a3b8]" },
          { label: "Stock Value", value: formatZAR(totalValue), color: "text-[#2563eb]", bg: "bg-[#eff6ff]", icon: Package, iconColor: "text-[#2563eb]" },
        ].map(({ label, value, color, bg, icon: Icon, iconColor }) => (
          <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
            <p className={`text-base font-bold ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants, species, supplier…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#059669]"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">All Types</option>
              {allTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#059669]"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-[#f1f5f9] rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-[#e2e8f0]">
          <div className="w-12 h-12 bg-[#f0fdf4] rounded-full flex items-center justify-center mb-3">
            <Leaf className="w-6 h-6 text-[#059669]" />
          </div>
          <p className="text-sm font-semibold text-[#1e293b] mb-1">
            {search || filterType !== "all" || filterStock !== "all" ? "No matching plants" : "No plants yet"}
          </p>
          <p className="text-xs text-[#94a3b8] mb-4">
            {search || filterType !== "all" || filterStock !== "all"
              ? "Try adjusting your search or filters"
              : "Start building your plant library"}
          </p>
          {!(search || filterType !== "all" || filterStock !== "all") && (
            <button onClick={openAdd} className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium">
              Add First Plant
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PlantCard key={p.id} plant={p} onEdit={openEdit} onDelete={setDeleteConfirm} />
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Plant" : "Add Plant"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              {[
                { key: "details", label: "Plant Details" },
                { key: "growth", label: "Growth & Season" },
                { key: "stock", label: "Stock & Pricing" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-5 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all ${
                    activeTab === key
                      ? "border-[#059669] text-[#059669] bg-white"
                      : "border-transparent text-[#64748b] hover:text-[#374151]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5">

              {/* ── Tab: Plant Details ── */}
              {activeTab === "details" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Common Name *</label>
                    <input
                      value={form.commonName}
                      onChange={(e) => { f("commonName")(e.target.value); setErrors((er) => ({ ...er, commonName: undefined })); }}
                      placeholder="e.g. Cape Honeysuckle"
                      className={`${inputCls} ${errors.commonName ? "border-[#dc2626]" : ""}`}
                    />
                    {errors.commonName && <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.commonName}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className={labelCls}>Botanical Name</label>
                    <input
                      value={form.botanicalName}
                      onChange={(e) => f("botanicalName")(e.target.value)}
                      placeholder="e.g. Tecomaria capensis"
                      className={`${inputCls} italic`}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Plant Type</label>
                    <select value={form.type} onChange={(e) => f("type")(e.target.value)} className={inputCls}>
                      {PLANT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Supplier</label>
                    <input value={form.supplier} onChange={(e) => f("supplier")(e.target.value)} placeholder="Nursery / supplier name" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Water Needs</label>
                    <select value={form.waterNeeds} onChange={(e) => f("waterNeeds")(e.target.value)} className={inputCls}>
                      {WATER_NEEDS.map((w) => <option key={w}>{w}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>Sun Requirements</label>
                    <select value={form.sunNeeds} onChange={(e) => f("sunNeeds")(e.target.value)} className={inputCls}>
                      {SUN_NEEDS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={labelCls}>Notes / Care Instructions</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => f("notes")(e.target.value)}
                      rows={3}
                      placeholder="Pruning, fertilising, special care requirements…"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* ── Tab: Growth & Season ── */}
              {activeTab === "growth" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Growth Rate</label>
                      <select value={form.growthRate} onChange={(e) => f("growthRate")(e.target.value)} className={inputCls}>
                        {GROWTH_RATES.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Mature Height</label>
                      <input value={form.matureHeight} onChange={(e) => f("matureHeight")(e.target.value)} placeholder="e.g. 2–3m" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Mature Spread</label>
                      <input value={form.matureSpread} onChange={(e) => f("matureSpread")(e.target.value)} placeholder="e.g. 1.5m" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Flowering Season</label>
                    <p className="text-xs text-[#94a3b8] mb-2">Select all that apply</p>
                    <PillSelector
                      options={SEASONS}
                      selected={form.floweringSeason}
                      onChange={(val) => f("floweringSeason")(val)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Best Planting Months</label>
                    <p className="text-xs text-[#94a3b8] mb-2">Select optimal planting months for South Africa</p>
                    <PillSelector
                      options={MONTHS}
                      selected={form.bestPlantingMonths}
                      onChange={(val) => f("bestPlantingMonths")(val)}
                    />
                  </div>

                  {/* Visual calendar strip */}
                  {form.bestPlantingMonths.length > 0 && (
                    <div>
                      <label className={labelCls}>Planting Calendar</label>
                      <div className="grid grid-cols-12 gap-0.5 mt-1">
                        {MONTHS.map((m) => {
                          const active = form.bestPlantingMonths.includes(m);
                          return (
                            <div
                              key={m}
                              className={`flex flex-col items-center py-1.5 rounded text-center text-[10px] font-medium cursor-pointer transition-colors ${
                                active
                                  ? "bg-[#059669] text-white"
                                  : "bg-[#f1f5f9] text-[#94a3b8]"
                              }`}
                              onClick={() => {
                                const cur = form.bestPlantingMonths;
                                f("bestPlantingMonths")(
                                  cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]
                                );
                              }}
                            >
                              {m}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: Stock & Pricing ── */}
              {activeTab === "stock" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Quantity in Stock</label>
                    <input
                      type="number" min="0"
                      value={form.qty}
                      onChange={(e) => { f("qty")(e.target.value); setErrors((er) => ({ ...er, qty: undefined })); }}
                      placeholder="0"
                      className={`${inputCls} ${errors.qty ? "border-[#dc2626]" : ""}`}
                    />
                    {errors.qty && <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.qty}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Min Stock Alert</label>
                    <input
                      type="number" min="0"
                      value={form.minStock}
                      onChange={(e) => f("minStock")(e.target.value)}
                      placeholder="Low-stock threshold"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Unit Cost (R)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.unitCost}
                      onChange={(e) => f("unitCost")(e.target.value)}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Selling Price (R)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.sellingPrice}
                      onChange={(e) => f("sellingPrice")(e.target.value)}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>

                  {/* Margin preview */}
                  {form.unitCost && form.sellingPrice && Number(form.unitCost) > 0 && (
                    <div className="col-span-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                      <p className="text-xs font-semibold text-[#166534] mb-2">Margin Preview</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                          { label: "Cost", value: formatZAR(form.unitCost) },
                          { label: "Sell", value: formatZAR(form.sellingPrice) },
                          {
                            label: "Margin",
                            value: `${(((Number(form.sellingPrice) - Number(form.unitCost)) / Number(form.sellingPrice)) * 100).toFixed(1)}%`,
                          },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-xs text-[#64748b]">{label}</p>
                            <p className="text-sm font-bold text-[#166534]">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className={labelCls}>Status</label>
                    <select value={form.status} onChange={(e) => f("status")(e.target.value)} className={inputCls}>
                      <option value="available">Available</option>
                      <option value="seasonal">Seasonal Only</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc] flex-shrink-0">
              <div className="flex gap-1">
                {["details", "growth", "stock"].map((t, i) => (
                  <div
                    key={t}
                    className={`w-2 h-2 rounded-full transition-colors ${activeTab === t ? "bg-[#059669]" : "bg-[#d1d5db]"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-[#059669] hover:bg-[#047857] rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? "Saving…" : editing ? "Update Plant" : "Add Plant"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">Delete Plant</h3>
            <p className="text-xs text-[#64748b] text-center mb-5 leading-relaxed">
              Delete{" "}
              <span className="font-semibold text-[#1e293b]">{deleteConfirm.commonName}</span>{" "}
              from the library? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 text-sm text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded-lg font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}