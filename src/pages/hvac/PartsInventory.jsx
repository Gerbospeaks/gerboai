import React, { useState, useEffect } from "react";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, getDocs, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { Package, Plus, Edit2, Trash2, X, Search, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  "Filter", "Refrigerant", "Electrical", "Mechanical",
  "Controls", "Ducting", "Insulation", "Tools", "Other",
];

const inputCls  = "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";
const labelCls  = "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls = "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2] focus:border-[#0891b2] transition-colors";

const EMPTY_FORM = {
  name: "", partNumber: "", category: "Filter", brand: "",
  quantity: "", minStock: "", costPrice: "", sellPrice: "",
  supplier: "", shelfLocation: "", notes: "",
};

const fmtZAR = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n || 0);

export default function PartsInventory({ user }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user?.uid) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const db   = getFirestore();
      const snap = await getDocs(
        query(collection(db, "users", user.uid, "inventory"), orderBy("createdAt", "desc"))
      );
      setParts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (_) {}
    setLoading(false);
  };

  const openAdd  = () => { setEditingPart(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => { setEditingPart(p); setForm({ ...EMPTY_FORM, ...p }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) return alert("Part name is required");
    setSaving(true);
    try {
      const db   = getFirestore();
      const data = {
        ...form,
        quantity:  Number(form.quantity)  || 0,
        minStock:  Number(form.minStock)  || 0,
        costPrice: Number(form.costPrice) || 0,
        sellPrice: Number(form.sellPrice) || 0,
        updatedAt: serverTimestamp(),
      };
      if (editingPart) {
        await updateDoc(doc(db, "users", user.uid, "inventory", editingPart.id), data);
      } else {
        await addDoc(collection(db, "users", user.uid, "inventory"), { ...data, createdAt: serverTimestamp() });
      }
      setShowModal(false);
      load();
    } catch (_) { alert("Error saving part"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this part?")) return;
    await deleteDoc(doc(getFirestore(), "users", user.uid, "inventory", id));
    load();
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const filtered = parts.filter(p => {
    const hit = !search ||
      [p.name, p.partNumber, p.brand, p.supplier].join(" ").toLowerCase().includes(search.toLowerCase());
    const cat = catFilter === "All" || p.category === catFilter;
    return hit && cat;
  });

  const lowStock   = parts.filter(p => Number(p.minStock) > 0 && Number(p.quantity) <= Number(p.minStock));
  const totalValue = parts.reduce((s, p) => s + Number(p.quantity) * Number(p.costPrice), 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1e293b]">Parts Inventory</h2>
          <p className="text-xs text-[#64748b] mt-0.5">Track stock levels and part details</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Part
        </button>
      </div>

      {/* ── Low-stock alert ── */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 bg-[#fef3c7] border border-[#fcd34d] rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-[#d97706] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#92400e] font-medium">
            {lowStock.length} item{lowStock.length > 1 ? "s" : ""} at or below minimum stock:{" "}
            <span className="font-bold">{lowStock.map(p => p.name).join(", ")}</span>
          </p>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total SKUs",       value: parts.length,   color: "text-[#1e293b]"  },
          { label: "Low Stock Items",  value: lowStock.length, color: lowStock.length > 0 ? "text-[#dc2626]" : "text-[#059669]" },
          { label: "Stock Value",      value: fmtZAR(totalValue), color: "text-[#1e293b]"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <div className="w-8 h-8 bg-[#f0fdf4] rounded-lg flex items-center justify-center mb-2">
              <Package className="w-4 h-4 text-[#059669]" />
            </div>
            <p className="text-xs text-[#64748b] mb-1">{label}</p>
            <p className={`text-xl font-bold truncate ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, part number, supplier…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white text-[#1e293b] placeholder-[#9ca3af]"
          />
        </div>
        <select
          value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[#d1d5db] rounded-md bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-[#94a3b8]">Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm font-medium text-[#374151]">No parts found</p>
            <p className="text-xs text-[#94a3b8] mb-4">Add your first part to start tracking inventory</p>
            <button onClick={openAdd} className="px-4 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-xs font-medium transition-colors">
              Add Part
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {["Part", "Part #", "Category", "Stock", "Cost Price", "Sell Price", "Supplier", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filtered.map(p => {
                  const isLow = Number(p.minStock) > 0 && Number(p.quantity) <= Number(p.minStock);
                  return (
                    <tr key={p.id} className={`hover:bg-[#f8fafc] transition-colors ${isLow ? "bg-[#fffbeb]" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${isLow ? "bg-[#fef3c7]" : "bg-[#f0fdf4]"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Package className={`w-4 h-4 ${isLow ? "text-[#d97706]" : "text-[#059669]"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1e293b]">
                              {p.name}
                              {isLow && <AlertTriangle className="w-3 h-3 text-[#d97706]" />}
                            </div>
                            <div className="text-xs text-[#94a3b8]">{p.brand || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-[#374151]">{p.partNumber || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#374151] rounded text-xs font-medium">{p.category || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`text-sm font-bold ${isLow ? "text-[#dc2626]" : "text-[#1e293b]"}`}>{p.quantity ?? 0}</div>
                        {Number(p.minStock) > 0 && (
                          <div className="text-xs text-[#94a3b8]">Min: {p.minStock}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-[#374151]">{fmtZAR(p.costPrice)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-[#1e293b]">{fmtZAR(p.sellPrice)}</td>
                      <td className="px-5 py-3.5 text-sm text-[#374151]">{p.supplier || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-[#64748b] hover:text-[#059669] hover:bg-[#f0fdf4] rounded-lg transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#64748b] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all">
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

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 border border-[#e2e8f0]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-xl">
              <div>
                <h2 className="text-sm font-semibold text-[#1e293b]">{editingPart ? "Edit Part" : "Add Part"}</h2>
                <p className="text-xs text-[#64748b] mt-0.5">Track stock, pricing, and supplier details</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Part Name *</label>
                  <input value={form.name} onChange={set("name")} placeholder="e.g. Air Filter 500×500mm G4" className={inputCls} />
                </div>

                {[
                  { label: "Part Number / SKU", key: "partNumber",    placeholder: "e.g. AF-500x500-G4"       },
                  { label: "Brand",             key: "brand",         placeholder: "e.g. Camfil"              },
                  { label: "Supplier",          key: "supplier",      placeholder: "e.g. HVAC Supplies SA"    },
                  { label: "Shelf Location",    key: "shelfLocation", placeholder: "e.g. A3-Shelf-2"          },
                  { label: "Qty in Stock",      key: "quantity",      placeholder: "0", type: "number"        },
                  { label: "Min Stock Level",   key: "minStock",      placeholder: "0", type: "number"        },
                  { label: "Cost Price (R)",    key: "costPrice",     placeholder: "0.00", type: "number"     },
                  { label: "Sell Price (R)",    key: "sellPrice",     placeholder: "0.00", type: "number"     },
                ].map(({ label, key, placeholder, type = "text" }) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder} className={inputCls} />
                  </div>
                ))}

                <div>
                  <label className={labelCls}>Category</label>
                  <select value={form.category} onChange={set("category")} className={selectCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set("notes")} rows={2}
                    placeholder="Additional notes, compatible models, storage conditions…"
                    className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors disabled:opacity-60">
                {saving ? "Saving…" : editingPart ? "Update Part" : "Add Part"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}