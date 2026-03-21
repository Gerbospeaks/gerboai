import React, { useState, useEffect } from "react";
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
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Plus, Search, X, Edit2, Loader2, Truck } from "lucide-react";

const SUPPLIER_SEED = [
  {
    name: "Floor Depot",
    contact: "Mike Botha",
    phone: "+27 11 444 0001",
    email: "orders@floordepot.co.za",
    category: "Flooring Materials",
    area: "Gauteng",
    rating: 5,
    leadDays: 3,
    notes: "Main hardwood and LVT supplier. Volume discounts above 500sqm.",
  },
  {
    name: "Tile Africa",
    contact: "Priya Nair",
    phone: "+27 11 555 0002",
    email: "trade@tileafrica.co.za",
    category: "Ceramic/Porcelain",
    area: "National",
    rating: 4,
    leadDays: 5,
    notes: "Good range of large-format tiles. Credit account available.",
  },
  {
    name: "Wood House SA",
    contact: "Jaco van Wyk",
    phone: "+27 21 666 0003",
    email: "jaco@woodhouse.co.za",
    category: "Hardwood",
    area: "Cape Town",
    rating: 5,
    leadDays: 7,
    notes: "Premium engineered and solid wood. Ships nationwide.",
  },
  {
    name: "IVC Group SA",
    contact: "Sandra Lee",
    phone: "+27 11 777 0004",
    email: "sa@ivcgroup.com",
    category: "LVT/Vinyl",
    area: "Gauteng",
    rating: 4,
    leadDays: 5,
    notes: "Exclusive LVT importer. Large stock of 5mm click range.",
  },
  {
    name: "Builders Warehouse",
    contact: "Trade Desk",
    phone: "+27 11 888 0005",
    email: "tradedesk@bw.co.za",
    category: "Adhesives/Screed",
    area: "National",
    rating: 3,
    leadDays: 1,
    notes: "Good for consumables, screed and sundries. Trade account required.",
  },
  {
    name: "Flooring Accessories",
    contact: "Themba Dlamini",
    phone: "+27 12 999 0006",
    email: "themba@flooracc.co.za",
    category: "Accessories",
    area: "Gauteng",
    rating: 4,
    leadDays: 2,
    notes: "Skirting, beading, T-moulds, stair nosings. Fast delivery.",
  },
];

const SUP_CATEGORIES = [
  "Flooring Materials",
  "Hardwood",
  "LVT/Vinyl",
  "Ceramic/Porcelain",
  "Adhesives/Screed",
  "Accessories",
  "Tools",
];
const BLANK = {
  name: "",
  contact: "",
  phone: "",
  email: "",
  category: "Flooring Materials",
  area: "",
  rating: "4",
  leadDays: "",
  notes: "",
};

const iCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#d97706]";
const lCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1";

export default function FlooringSuppliersView({ user }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(BLANK);

  const col = () => collection(db, "users", user.uid, "flooringSuppliers");

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(col(), orderBy("createdAt", "asc")));
        if (snap.empty) {
          const batch = writeBatch(db);
          SUPPLIER_SEED.forEach((s) =>
            batch.set(doc(col()), { ...s, createdAt: serverTimestamp() }),
          );
          await batch.commit();
          const snap2 = await getDocs(
            query(col(), orderBy("createdAt", "asc")),
          );
          setSuppliers(snap2.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setSuppliers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  const filtered = suppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.area?.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (s) => {
    setForm({ ...s, rating: String(s.rating), leadDays: String(s.leadDays) });
    setEditId(s.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      rating: Number(form.rating) || 4,
      leadDays: Number(form.leadDays) || 0,
    };
    try {
      if (editId) {
        await updateDoc(
          doc(db, "users", user.uid, "flooringSuppliers", editId),
          { ...payload, updatedAt: serverTimestamp() },
        );
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editId ? { id: editId, ...payload } : s)),
        );
      } else {
        const ref = await addDoc(col(), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setSuppliers((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowModal(false);
    } catch (e) {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this supplier?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "flooringSuppliers", id));
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setShowModal(false);
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-[#64748b]">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading suppliers…</span>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Suppliers</h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Manage flooring material suppliers
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers, categories or areas…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#d97706]"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#1e293b]">{s.name}</h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  {s.category} · {s.area}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {Array.from({ length: s.rating || 0 }).map((_, i) => (
                  <span key={i} className="text-[#f59e0b] text-xs">
                    ★
                  </span>
                ))}
                {Array.from({ length: 5 - (s.rating || 0) }).map((_, i) => (
                  <span key={i} className="text-[#e2e8f0] text-xs">
                    ★
                  </span>
                ))}
                <button
                  onClick={() => openEdit(s)}
                  className="ml-2 p-1 text-[#94a3b8] hover:text-[#2563eb] hover:bg-[#eff6ff] rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#64748b] mb-3">
              <div>
                <span className="font-semibold text-[#374151]">Contact: </span>
                {s.contact}
              </div>
              <div>
                <span className="font-semibold text-[#374151]">
                  Lead time:{" "}
                </span>
                {s.leadDays} day{s.leadDays !== 1 ? "s" : ""}
              </div>
              <div>
                <span className="font-semibold text-[#374151]">Phone: </span>
                {s.phone}
              </div>
              <div className="truncate">
                <span className="font-semibold text-[#374151]">Email: </span>
                {s.email}
              </div>
            </div>
            {s.notes && (
              <p className="text-xs text-[#64748b] bg-[#f8fafc] rounded-lg px-3 py-2">
                {s.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#e2e8f0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] sticky top-0 bg-white">
              <h2 className="text-base font-semibold text-[#1e293b]">
                {editId ? "Edit Supplier" : "Add Supplier"}
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
                <label className={lCls}>Supplier Name *</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Floor Depot"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className={iCls}
                >
                  {SUP_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lCls}>Area</label>
                <input
                  value={form.area}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, area: e.target.value }))
                  }
                  placeholder="e.g. Gauteng / National"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Contact Name</label>
                <input
                  value={form.contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contact: e.target.value }))
                  }
                  placeholder="Contact person"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+27 11 000 0000"
                  className={iCls}
                />
              </div>
              <div className="col-span-2">
                <label className={lCls}>Email</label>
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="orders@supplier.co.za"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Lead Time (days)</label>
                <input
                  type="number"
                  value={form.leadDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, leadDays: e.target.value }))
                  }
                  placeholder="5"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Rating (1–5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rating: e.target.value }))
                  }
                  className={iCls}
                />
              </div>
              <div className="col-span-2">
                <label className={lCls}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Payment terms, discounts, delivery info…"
                  rows={3}
                  className={`${iCls} resize-none`}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#e2e8f0] flex items-center justify-between sticky bottom-0 bg-white">
              {editId ? (
                <button
                  onClick={() => handleDelete(editId)}
                  className="px-4 py-2 text-sm font-medium text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg hover:bg-[#fee2e2]"
                >
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#d97706] hover:bg-[#b45309] rounded-lg shadow-sm disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editId ? "Update" : "Add Supplier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
