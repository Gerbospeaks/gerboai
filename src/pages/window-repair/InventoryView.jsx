import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useCurrency } from "../../contexts/CurrencyContext";
import {
  Package,
  Plus,
  Minus,
  Search,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Windscreens & Vehicle Glass",
  "Window Glass & Panes",
  "Frames & Profiles",
  "Seals & Adhesives",
  "Hardware & Fittings",
  "Tools & Equipment",
  "Consumables",
];

const UNITS = [
  "pc",
  "sheet",
  "m",
  "pair",
  "set",
  "box",
  "tube",
  "cartridge",
  "can",
  "bottle",
  "roll",
  "kg",
  "L",
];

const CAT_COLORS = {
  "Windscreens & Vehicle Glass": "bg-[#eff6ff] text-[#1d4ed8]",
  "Window Glass & Panes": "bg-[#ecfeff] text-[#0e7490]",
  "Frames & Profiles": "bg-[#f1f5f9] text-[#475569]",
  "Seals & Adhesives": "bg-[#faf5ff] text-[#7c3aed]",
  "Hardware & Fittings": "bg-[#fff7ed] text-[#c2410c]",
  "Tools & Equipment": "bg-[#f0fdf4] text-[#166534]",
  Consumables: "bg-[#fefce8] text-[#a16207]",
};

const getStatus = (qty, reorderLevel) => {
  if (qty <= 0) return "out";
  if (qty <= reorderLevel) return "low";
  return "ok";
};

const STATUS_CFG = {
  ok: { label: "In stock", cls: "bg-[#dcfce7] text-[#166534]" },
  low: { label: "Low stock", cls: "bg-[#fef3c7] text-[#92400e]" },
  out: { label: "Out of stock", cls: "bg-[#fef2f2] text-[#991b1b]" },
};

const BLANK = {
  name: "",
  category: "Window Glass & Panes",
  sku: "",
  spec: "",
  qty: "",
  unit: "pc",
  unitCost: "",
  supplier: "",
  reorderLevel: "",
  location: "",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

// ── Component ─────────────────────────────────────────────────────────────────
export default function InventoryView({ user }) {
  const { formatCurrency } = useCurrency();
  const money = (n) => formatCurrency(n || 0, "ZAR");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [formError, setFormError] = useState("");

  const inventoryCol = () => collection(db, "users", user.uid, "inventory");

  // ── Load the user's own inventory from Firestore ──────────────────
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const q = query(inventoryCol(), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Inventory load:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  // ── Derived ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (cat === "All" || i.category === cat) &&
        (!term ||
          i.name?.toLowerCase().includes(term) ||
          i.supplier?.toLowerCase().includes(term) ||
          i.sku?.toLowerCase().includes(term) ||
          i.spec?.toLowerCase().includes(term)),
    );
  }, [items, search, cat]);

  const alerts = items.filter((i) => getStatus(i.qty, i.reorderLevel) !== "ok");
  const totalValue = items.reduce(
    (s, i) => s + (i.qty || 0) * (i.unitCost || 0),
    0,
  );

  // ── Handlers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      ...BLANK,
      ...item,
      qty: String(item.qty ?? ""),
      unitCost: String(item.unitCost ?? ""),
      reorderLevel: String(item.reorderLevel ?? ""),
    });
    setEditId(item.id);
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Enter an item name.");
      return;
    }
    if (form.qty === "" || Number(form.qty) < 0) {
      setFormError("Enter a quantity of 0 or more.");
      return;
    }
    setFormError("");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      sku: (form.sku || "").trim(),
      spec: (form.spec || "").trim(),
      unit: form.unit,
      qty: Number(form.qty),
      unitCost: Number(form.unitCost) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      supplier: (form.supplier || "").trim(),
      location: (form.location || "").trim(),
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "inventory", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setItems((prev) =>
          prev.map((i) => (i.id === editId ? { ...i, ...payload } : i)),
        );
      } else {
        const ref = await addDoc(inventoryCol(), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setItems((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Save item:", e);
      setFormError("Could not save this item. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  // Quick +/- from the table, for stock used on a job or a delivery booked in
  const adjustQty = async (item, delta) => {
    const next = Math.max(0, (item.qty || 0) + delta);
    if (next === item.qty) return;
    // Optimistic update, roll back on failure
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, qty: next } : i)),
    );
    try {
      await updateDoc(doc(db, "users", user.uid, "inventory", item.id), {
        qty: next,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Adjust qty:", e);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, qty: item.qty } : i)),
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from inventory?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "inventory", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error("Delete item:", e);
      alert("Could not delete this item. Try again.");
    }
  };

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading inventory…</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Inventory & Stock</h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Glass, windscreens, seals, hardware and tools in one place
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total items",
            value: items.length,
            color: "text-[#1e293b]",
            bg: "bg-[#f8fafc]",
          },
          {
            label: "Low / out of stock",
            value: alerts.length,
            color: alerts.length > 0 ? "text-[#dc2626]" : "text-[#059669]",
            bg: alerts.length > 0 ? "bg-[#fef2f2]" : "bg-[#f0fdf4]",
          },
          {
            label: "Stock value",
            value: money(totalValue),
            color: "text-[#2563eb]",
            bg: "bg-[#eff6ff]",
          },
          {
            label: "Categories",
            value: CATEGORIES.length - 1,
            color: "text-[#7c3aed]",
            bg: "bg-[#faf5ff]",
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} border border-[#e2e8f0] rounded-xl p-4`}
          >
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Low-stock banner */}
      {alerts.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#92400e]">
              {alerts.length} item{alerts.length > 1 ? "s" : ""} need
              {alerts.length === 1 ? "s" : ""} restocking
            </p>
            <p className="text-xs text-[#b45309] mt-0.5 break-words">
              {alerts.map((i) => i.name).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, part no., size or supplier…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                cat === c
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
          <span className="text-sm font-semibold text-[#374151]">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                {[
                  "Item",
                  "Category",
                  "Qty",
                  "Unit cost",
                  "Total value",
                  "Supplier",
                  "Location",
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <Package className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">
                      {items.length === 0
                        ? "No stock yet. Add your first item to start tracking."
                        : "No items match your search or filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const status = getStatus(item.qty, item.reorderLevel);
                  const { label, cls } = STATUS_CFG[status];
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-[#1e293b]">
                          {item.name}
                        </p>
                        {(item.sku || item.spec) && (
                          <p className="text-xs text-[#94a3b8] mt-0.5">
                            {[item.sku, item.spec].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                            CAT_COLORS[item.category] ||
                            "bg-[#f1f5f9] text-[#475569]"
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => adjustQty(item, -1)}
                            disabled={(item.qty || 0) <= 0}
                            title="Use one"
                            className="w-6 h-6 flex items-center justify-center text-[#64748b] border border-[#e2e8f0] rounded-md hover:border-[#2563eb] hover:text-[#2563eb] disabled:opacity-40 disabled:hover:border-[#e2e8f0] disabled:hover:text-[#64748b]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`text-sm font-semibold min-w-[3.5rem] text-center ${
                              status === "out"
                                ? "text-[#dc2626]"
                                : status === "low"
                                  ? "text-[#d97706]"
                                  : "text-[#1e293b]"
                            }`}
                          >
                            {item.qty} {item.unit}
                          </span>
                          <button
                            onClick={() => adjustQty(item, 1)}
                            title="Add one"
                            className="w-6 h-6 flex items-center justify-center text-[#64748b] border border-[#e2e8f0] rounded-md hover:border-[#2563eb] hover:text-[#2563eb]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                        {money(item.unitCost)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b] whitespace-nowrap">
                        {money((item.qty || 0) * (item.unitCost || 0))}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b] whitespace-nowrap">
                        {item.supplier || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                        {item.location || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${cls}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit"
                            className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editId ? "Edit item" : "Add inventory item"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Item name *</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. 6mm Clear Float Glass"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={inputCls}
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
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
              <div>
                <label className={labelCls}>Part no. / SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  placeholder="e.g. DW1234 or OEM number"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Size / spec</label>
                <input
                  value={form.spec}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, spec: e.target.value }))
                  }
                  placeholder="e.g. 2440 x 1830 mm, or Hilux 2016+"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={form.qty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, qty: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Unit cost</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unitCost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unitCost: e.target.value }))
                  }
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Reorder level</label>
                <input
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reorderLevel: e.target.value }))
                  }
                  placeholder="Alert me at or below"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="e.g. Glass rack 2 / Van 1"
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Supplier</label>
                <input
                  value={form.supplier}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, supplier: e.target.value }))
                  }
                  placeholder="e.g. Local glass wholesaler"
                  className={inputCls}
                />
              </div>
              {formError && (
                <p className="col-span-2 text-xs font-medium text-[#dc2626]">
                  {formError}
                </p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg shadow-sm disabled:opacity-60"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editId ? "Save changes" : "Add item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
