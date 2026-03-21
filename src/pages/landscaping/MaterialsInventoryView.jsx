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
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  TrendingDown,
} from "lucide-react";

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

const CATEGORIES = [
  "Fertilizers",
  "Seeds & Bulbs",
  "Pesticides / Herbicides",
  "Mulch & Compost",
  "Irrigation Supplies",
  "Hand Tools",
  "Power Tools",
  "Plants & Trees",
  "Hardscape Materials",
  "Safety Equipment",
  "Other",
];

const UNITS = [
  "kg",
  "g",
  "litre",
  "ml",
  "unit",
  "bag",
  "roll",
  "m",
  "m²",
  "box",
  "pallet",
];

const EMPTY_FORM = {
  name: "",
  category: "Fertilizers",
  quantity: "",
  unit: "kg",
  minStock: "",
  costPerUnit: "",
  supplier: "",
  notes: "",
  status: "in-stock",
};

export default function MaterialsInventoryView({ user }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const db = getFirestore();

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "users", user.uid, "materials"),
          orderBy("createdAt", "desc"),
        ),
      );
      setMaterials(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name || "",
      category: m.category || "Fertilizers",
      quantity: m.quantity ?? "",
      unit: m.unit || "kg",
      minStock: m.minStock ?? "",
      costPerUnit: m.costPerUnit ?? "",
      supplier: m.supplier || "",
      notes: m.notes || "",
      status: m.status || "in-stock",
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Material name is required";
    if (form.quantity === "" || isNaN(Number(form.quantity)))
      e.quantity = "Valid quantity required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setSaving(true);
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      minStock: form.minStock !== "" ? Number(form.minStock) : 0,
      costPerUnit: form.costPerUnit !== "" ? Number(form.costPerUnit) : 0,
    };
    try {
      if (editing) {
        await updateDoc(doc(db, "users", user.uid, "materials", editing.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "users", user.uid, "materials"), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      load();
    } catch (_) {
      alert("Failed to save material. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await deleteDoc(
        doc(db, "users", user.uid, "materials", deleteConfirm.id),
      );
      load();
    } catch (_) {
      alert("Failed to delete.");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const isLowStock = (m) =>
    m.minStock != null && m.minStock > 0 && m.quantity <= m.minStock;

  const allCategories = [
    ...new Set(materials.map((m) => m.category).filter(Boolean)),
  ];

  const filtered = materials.filter((m) => {
    const matchSearch = [m.name, m.category, m.supplier].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    );
    const matchCat = filterCat === "all" || m.category === filterCat;
    return matchSearch && matchCat;
  });

  const lowStockCount = materials.filter(isLowStock).length;
  const totalValue = materials.reduce(
    (s, m) => s + (m.quantity || 0) * (m.costPerUnit || 0),
    0,
  );

  const stockBadge = (m) => {
    if (m.quantity === 0)
      return { label: "Out of Stock", cls: "bg-[#fef2f2] text-[#dc2626]" };
    if (isLowStock(m))
      return { label: "Low Stock", cls: "bg-[#fef3c7] text-[#92400e]" };
    return { label: "In Stock", cls: "bg-[#dcfce7] text-[#166534]" };
  };

  const formatZAR = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">
            Materials Inventory
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {materials.length} items · Total value{" "}
            <span className="font-semibold text-[#059669]">
              {formatZAR(totalValue)}
            </span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Items",
            value: materials.length,
            color: "text-[#1e293b]",
            bg: "bg-[#f0fdf4]",
            icon: Package,
            iconColor: "text-[#059669]",
          },
          {
            label: "Low Stock",
            value: lowStockCount,
            color: lowStockCount > 0 ? "text-[#d97706]" : "text-[#1e293b]",
            bg: lowStockCount > 0 ? "bg-[#fef3c7]" : "bg-[#f1f5f9]",
            icon: AlertTriangle,
            iconColor: lowStockCount > 0 ? "text-[#d97706]" : "text-[#94a3b8]",
          },
          {
            label: "Out of Stock",
            value: materials.filter((m) => m.quantity === 0).length,
            color: "text-[#dc2626]",
            bg: "bg-[#fef2f2]",
            icon: TrendingDown,
            iconColor: "text-[#dc2626]",
          },
          {
            label: "Total Value",
            value: formatZAR(totalValue),
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
            icon: Package,
            iconColor: "text-[#2563eb]",
          },
        ].map(({ label, value, color, bg, icon: Icon, iconColor }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
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
            placeholder="Search materials, suppliers…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
          />
        </div>
        <div className="relative">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8] pointer-events-none" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-[#f8fafc] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151] mb-1">
              {search || filterCat !== "all"
                ? "No matching materials"
                : "No materials yet"}
            </p>
            <p className="text-xs text-[#94a3b8] mb-4">
              {search || filterCat !== "all"
                ? "Adjust your search or filter"
                : "Start adding materials to your inventory"}
            </p>
            {!(search || filterCat !== "all") && (
              <button
                onClick={openAdd}
                className="px-4 py-1.5 bg-[#059669] text-white rounded-lg text-xs font-medium"
              >
                Add Material
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {[
                    "Material",
                    "Category",
                    "Qty",
                    "Min Stock",
                    "Cost/Unit",
                    "Total Value",
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
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map((m) => {
                  const badge = stockBadge(m);
                  const low = isLowStock(m);
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-[#f8fafc] transition-colors ${
                        low ? "bg-[#fffbeb]" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {low && (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#1e293b]">
                              {m.name}
                            </p>
                            {m.supplier && (
                              <p className="text-xs text-[#94a3b8]">
                                {m.supplier}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        <span className="px-2 py-0.5 bg-[#f1f5f9] rounded text-xs font-medium">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-[#1e293b]">
                        {m.quantity} {m.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {m.minStock || "—"} {m.minStock ? m.unit : ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">
                        {m.costPerUnit ? formatZAR(m.costPerUnit) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                        {m.costPerUnit
                          ? formatZAR(m.quantity * m.costPerUnit)
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(m)}
                            className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(m)}
                            className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#059669]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  {editing ? "Edit Material" : "Add Material"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className={labelCls}>Material Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, name: e.target.value }));
                      setErrors((err) => ({ ...err, name: undefined }));
                    }}
                    placeholder="e.g. NPK Fertilizer 3:2:1"
                    className={`${inputCls} ${errors.name ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className={labelCls}>Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unit: e.target.value }))
                    }
                    className={inputCls}
                  >
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Qty */}
                <div>
                  <label className={labelCls}>Current Qty *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, quantity: e.target.value }));
                      setErrors((err) => ({ ...err, quantity: undefined }));
                    }}
                    placeholder="0"
                    className={`${inputCls} ${errors.quantity ? "border-[#dc2626]" : ""}`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-xs text-[#dc2626] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.quantity}
                    </p>
                  )}
                </div>

                {/* Min Stock */}
                <div>
                  <label className={labelCls}>Min Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minStock: e.target.value }))
                    }
                    placeholder="Low-stock threshold"
                    className={inputCls}
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className={labelCls}>Cost per Unit (R)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPerUnit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, costPerUnit: e.target.value }))
                    }
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className={labelCls}>Supplier</label>
                  <input
                    value={form.supplier}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, supplier: e.target.value }))
                    }
                    placeholder="Supplier name"
                    className={inputCls}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    placeholder="Storage instructions, expiry, etc."
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
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
                {saving
                  ? "Saving…"
                  : editing
                    ? "Update Material"
                    : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-5 h-5 text-[#dc2626]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1e293b] text-center mb-1">
              Delete Material
            </h3>
            <p className="text-xs text-[#64748b] text-center mb-5">
              Delete{" "}
              <span className="font-semibold text-[#1e293b]">
                {deleteConfirm.name}
              </span>{" "}
              from inventory? This cannot be undone.
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
