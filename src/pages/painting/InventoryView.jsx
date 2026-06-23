import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import {
  Package,
  Plus,
  Trash2,
  Edit,
  X,
  Search,
  AlertTriangle,
  Droplet,
  Filter,
} from "lucide-react";

const CATEGORIES = [
  "Interior Paint",
  "Exterior Paint",
  "Primer",
  "Sealant",
  "Brushes & Rollers",
  "Tape & Masking",
  "Sandpaper",
  "Solvents & Thinners",
  "Other Materials",
];

const UNITS = ["L", "5L", "20L", "kg", "unit", "roll", "box"];

const emptyItem = {
  name: "",
  category: "Interior Paint",
  brand: "",
  colourCode: "",
  unit: "L",
  quantity: "",
  reorderLevel: "",
  unitCost: "",
  supplier: "",
};

export default function InventoryView({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyItem);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [savingError, setSavingError] = useState("");

  useEffect(() => {
    if (user?.uid) loadItems();
  }, [user]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const db = getFirestore();
      const q = query(
        collection(db, "users", user.uid, "inventory"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyItem);
    setEditingId(null);
    setSavingError("");
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setForm({
      name: item.name || "",
      category: item.category || "Interior Paint",
      brand: item.brand || "",
      colourCode: item.colourCode || "",
      unit: item.unit || "L",
      quantity: item.quantity ?? "",
      reorderLevel: item.reorderLevel ?? "",
      unitCost: item.unitCost ?? "",
      supplier: item.supplier || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    if (!form.name.trim()) {
      setSavingError("Item name is required");
      return;
    }
    setSavingError("");

    const db = getFirestore();
    const payload = {
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim(),
      colourCode: form.colourCode.trim(),
      unit: form.unit,
      quantity: Number(form.quantity) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      unitCost: Number(form.unitCost) || 0,
      supplier: form.supplier.trim(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "users", user.uid, "inventory", editingId),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "inventory"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowForm(false);
      resetForm();
      loadItems();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      setSavingError("Failed to save item. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!user?.uid) return;
    if (!window.confirm("Remove this item from inventory?")) return;
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "users", user.uid, "inventory", id));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error deleting inventory item:", error);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase()) ||
      item.colourCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter(
    (i) =>
      Number(i.reorderLevel) > 0 &&
      Number(i.quantity) <= Number(i.reorderLevel),
  ).length;
  const totalValue = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitCost || 0),
    0,
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            Paint &amp; Materials
          </h1>
          <p className="text-slate-600 mt-1 ml-13">
            Track stock levels, suppliers, and reorder points
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:from-amber-700 hover:to-orange-700 hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 shadow-sm">
          <div className="text-sm font-medium text-amber-700 mb-1">
            Total Items
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {items.length}
          </div>
        </div>
        <div
          className={`bg-gradient-to-br p-4 rounded-xl border shadow-sm ${
            lowStockCount > 0
              ? "from-rose-50 to-rose-100 border-rose-200"
              : "from-emerald-50 to-emerald-100 border-emerald-200"
          }`}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              lowStockCount > 0 ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            Low Stock
          </div>
          <div
            className={`text-2xl font-bold ${
              lowStockCount > 0 ? "text-rose-900" : "text-emerald-900"
            }`}
          >
            {lowStockCount}
          </div>
        </div>
        <div className="bg-gradient-to-br from-stone-50 to-stone-100 p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-sm font-medium text-stone-700 mb-1">
            Stock Value
          </div>
          <div className="text-2xl font-bold text-stone-900">
            R{totalValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, or colour code..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white appearance-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">
          Loading inventory...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">
            {items.length === 0
              ? "No materials added yet"
              : "No items match your search"}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            {items.length === 0 &&
              "Add paint, primer, and supplies to start tracking stock"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Colour
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">
                  Unit Cost
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                  Supplier
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const low =
                  Number(item.reorderLevel) > 0 &&
                  Number(item.quantity) <= Number(item.reorderLevel);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">
                        {item.name}
                      </div>
                      {item.brand && (
                        <div className="text-xs text-slate-500">
                          {item.brand}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {item.colourCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {low && (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        )}
                        <span
                          className={`font-bold ${low ? "text-rose-600" : "text-slate-800"}`}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                      R{Number(item.unitCost || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {item.supplier || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-amber-600" />
                {editingId ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {savingError && (
                <div className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                  {savingError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Pure White Matt Emulsion"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    placeholder="e.g. Dulux, Plascon"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Colour Code / Name
                </label>
                <input
                  type="text"
                  value={form.colourCode}
                  onChange={(e) =>
                    setForm({ ...form, colourCode: e.target.value })
                  }
                  placeholder="e.g. Antique White / RAL 9001"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Quantity in Stock
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Unit
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={form.reorderLevel}
                    onChange={(e) =>
                      setForm({ ...form, reorderLevel: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Unit Cost (R)
                  </label>
                  <input
                    type="number"
                    value={form.unitCost}
                    onChange={(e) =>
                      setForm({ ...form, unitCost: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) =>
                      setForm({ ...form, supplier: e.target.value })
                    }
                    placeholder="e.g. Builders Warehouse"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 sticky bottom-0">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 shadow-md transition-all"
              >
                {editingId ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
