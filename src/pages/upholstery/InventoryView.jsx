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
import {
  Package,
  Plus,
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
  "Fabrics & Leather",
  "Foam & Padding",
  "Frames & Timber",
  "Springs & Hardware",
  "Trims & Consumables",
  "Tools",
  "Showroom Stock",
];
const UNITS = [
  "m",
  "roll",
  "hide",
  "sheet",
  "pc",
  "pair",
  "set",
  "box",
  "can",
  "bottle",
  "kg",
  "L",
];

const CAT_COLORS = {
  "Fabrics & Leather": "bg-[#fff7ed] text-[#c2410c]",
  "Foam & Padding": "bg-[#faf5ff] text-[#7c3aed]",
  "Frames & Timber": "bg-[#fef3c7] text-[#92400e]",
  "Springs & Hardware": "bg-[#eff6ff] text-[#1d4ed8]",
  "Trims & Consumables": "bg-[#f1f5f9] text-[#475569]",
  Tools: "bg-[#f0fdf4] text-[#166534]",
  "Showroom Stock": "bg-[#ecfeff] text-[#0e7490]",
};

const getStatus = (qty, reorderLevel) => {
  if (qty <= 0) return "out";
  if (qty <= reorderLevel) return "low";
  return "ok";
};

const STATUS_CFG = {
  ok: { label: "In Stock", cls: "bg-[#dcfce7] text-[#166534]" },
  low: { label: "Low Stock", cls: "bg-[#fef3c7] text-[#92400e]" },
  out: { label: "Out of Stock", cls: "bg-[#fef2f2] text-[#991b1b]" },
};

const BLANK = {
  name: "",
  category: "Fabrics & Leather",
  qty: "",
  unit: "m",
  unitCost: "",
  supplier: "",
  reorderLevel: "",
  location: "",
};

const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#b45309]";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

// ── Component ─────────────────────────────────────────────────────────────────
export default function InventoryView({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);

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
  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (cat === "All" || i.category === cat) &&
          (i.name?.toLowerCase().includes(search.toLowerCase()) ||
            i.supplier?.toLowerCase().includes(search.toLowerCase())),
      ),
    [items, search, cat],
  );

  const alerts = items.filter((i) => getStatus(i.qty, i.reorderLevel) !== "ok");
  const totalValue = items.reduce(
    (s, i) => s + (i.qty || 0) * (i.unitCost || 0),
    0,
  );

  // ── Handlers ──────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (item) => {
    setForm({
      ...item,
      qty: String(item.qty),
      unitCost: String(item.unitCost),
      reorderLevel: String(item.reorderLevel),
    });
    setEditId(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.qty === "") return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit,
      qty: Number(form.qty),
      unitCost: Number(form.unitCost) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      supplier: form.supplier.trim(),
      location: form.location.trim(),
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "inventory", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        setItems((prev) =>
          prev.map((i) => (i.id === editId ? { id: editId, ...payload } : i)),
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
      alert("Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from inventory?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "inventory", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      alert("Failed to delete item.");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Inventory & Showroom Stock</h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Manage workshop stock, materials &amp; tools
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total SKUs",
            value: items.length,
            color: "text-[#1e293b]",
            bg: "bg-[#f8fafc]",
          },
          {
            label: "Low / Out Stock",
            value: alerts.length,
            color: alerts.length > 0 ? "text-[#dc2626]" : "text-[#059669]",
            bg: alerts.length > 0 ? "bg-[#fef2f2]" : "bg-[#f0fdf4]",
          },
          {
            label: "Stock Value",
            value: `R${totalValue.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`,
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
          <div>
            <p className="text-sm font-semibold text-[#92400e]">
              {alerts.length} item{alerts.length > 1 ? "s" : ""} need restocking
            </p>
            <p className="text-xs text-[#b45309] mt-0.5">
              {alerts.map((i) => i.name).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or suppliers…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#b45309]"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${cat === c ? "bg-[#b45309] text-white shadow-sm" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#b45309] hover:text-[#b45309]"}`}
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
                  "Unit Cost",
                  "Total Value",
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
                    <p className="text-sm text-[#94a3b8]">No items found</p>
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
                      <td className="px-4 py-3 text-sm font-medium text-[#1e293b] whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${CAT_COLORS[item.category] || "bg-[#f1f5f9] text-[#475569]"}`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${status === "out" ? "text-[#dc2626]" : status === "low" ? "text-[#d97706]" : "text-[#1e293b]"}`}
                      >
                        {item.qty} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151] whitespace-nowrap">
                        R{(item.unitCost || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1e293b] whitespace-nowrap">
                        R
                        {(
                          (item.qty || 0) * (item.unitCost || 0)
                        ).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b] whitespace-nowrap">
                        {item.supplier}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">
                        {item.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${cls}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editId ? "Edit Item" : "Add Inventory Item"}
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
                <label className={labelCls}>Item Name *</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Velvet Emerald 140cm"
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
                <label className={labelCls}>Quantity *</label>
                <input
                  type="number"
                  value={form.qty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, qty: e.target.value }))
                  }
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Unit Cost (R)</label>
                <input
                  type="number"
                  value={form.unitCost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unitCost: e.target.value }))
                  }
                  placeholder="0.00"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Reorder Level</label>
                <input
                  type="number"
                  value={form.reorderLevel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reorderLevel: e.target.value }))
                  }
                  placeholder="0"
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
                  placeholder="e.g. Rack A1 / Showroom Floor"
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
                  placeholder="e.g. Textile Wholesaler"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#b45309] hover:bg-[#92400e] rounded-lg shadow-sm disabled:opacity-60"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editId ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
