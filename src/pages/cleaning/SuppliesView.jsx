import React, { useState, useEffect } from "react";
import { Package, Plus, X, Save, Edit2, Trash2, AlertTriangle, ShoppingCart } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const CATEGORIES = ["Cleaning Products", "Equipment", "PPE", "Consumables", "Detergents", "Tools", "Uniforms", "Other"];
const UNITS = ["Litres", "ml", "kg", "g", "Units", "Rolls", "Pairs", "Bottles", "Boxes"];
const EMPTY = { name: "", category: "Cleaning Products", quantity: "", unit: "Units", minStock: "5", cost: "", supplier: "", notes: "" };

export default function SuppliesView({ user }) {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users", user.uid, "supplies"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setSupplies(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name) return alert("Item name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "supplies", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "supplies"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item?")) return;
    await deleteDoc(doc(db, "users", user.uid, "supplies", id)); load();
  };

  const adjustQuantity = async (item, delta) => {
    const newQty = Math.max(0, (Number(item.quantity) || 0) + delta);
    await updateDoc(doc(db, "users", user.uid, "supplies", item.id), { quantity: String(newQty), updatedAt: serverTimestamp() });
    load();
  };

  const isLowStock = (item) => Number(item.quantity) <= Number(item.minStock || 5);

  const filtered = supplies.filter(s => {
    const matchCat = filterCat === "all" || s.category === filterCat;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStockItems = supplies.filter(isLowStock);
  const totalValue = supplies.reduce((s, i) => s + (Number(i.quantity) * Number(i.cost || 0)), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Package className="w-5 h-5 text-[#0891b2]" />Supplies & Inventory</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{supplies.length} items · {lowStockItems.length} low stock</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(EMPTY); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />Add Item
        </button>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#92400e]">Low Stock Alert</p>
            <p className="text-xs text-[#92400e] mt-0.5">{lowStockItems.map(i => i.name).join(", ")} need restocking</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Total Items</p>
          <p className="text-2xl font-bold text-[#0891b2] mt-1">{supplies.length}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Low Stock</p>
          <p className={`text-2xl font-bold mt-1 ${lowStockItems.length > 0 ? "text-[#dc2626]" : "text-[#059669]"}`}>{lowStockItems.length}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Stock Value</p>
          <p className="text-2xl font-bold text-[#7c3aed] mt-1">R{totalValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
          className="flex-1 min-w-[150px] px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-[#f8fafc]" />
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterCat("all")} className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${filterCat === "all" ? "bg-[#0891b2] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${filterCat === c ? "bg-[#0891b2] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
          : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {["Item", "Category", "Quantity", "Cost/Unit", "Supplier", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filtered.map(item => (
                    <tr key={item.id} className={`hover:bg-[#f8fafc] ${isLowStock(item) ? "bg-[#fffbeb]" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isLowStock(item) && <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0" />}
                          <div>
                            <p className="text-sm font-medium text-[#374151]">{item.name}</p>
                            {item.notes && <p className="text-xs text-[#94a3b8]">{item.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs bg-[#ecfeff] text-[#0e7490] px-2 py-0.5 rounded border border-[#a5f3fc]">{item.category}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => adjustQuantity(item, -1)} className="w-5 h-5 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded text-[#64748b] flex items-center justify-center text-xs font-bold">−</button>
                          <span className={`text-sm font-semibold w-8 text-center ${isLowStock(item) ? "text-[#dc2626]" : "text-[#374151]"}`}>{item.quantity}</span>
                          <button onClick={() => adjustQuantity(item, 1)} className="w-5 h-5 bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded text-[#64748b] flex items-center justify-center text-xs font-bold">+</button>
                          <span className="text-xs text-[#94a3b8]">{item.unit}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{item.cost ? `R${item.cost}` : "—"}</td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">{item.supplier || "—"}</td>
                      <td className="px-4 py-3 flex gap-1">
                        <button onClick={() => { setEditItem(item); setForm({ ...EMPTY, ...item }); setShowModal(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded"><Trash2 className="w-3.5 h-3.5" /></button>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Item" : "Add Supply Item"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Item Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Multi-purpose cleaner"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Current Quantity</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Min Stock Level</label>
                  <input type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} placeholder="5"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Cost per Unit (R)</label>
                  <input type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="0.00"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Supplier</label>
                  <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}