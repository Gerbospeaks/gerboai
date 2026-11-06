import React, { useState, useEffect, useMemo } from "react";
import { addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { Package, Plus, Search, AlertTriangle, FilePlus2 } from "lucide-react";
import {
  inputCls,
  labelCls,
  primaryBtn,
  ghostBtn,
  fmtR,
  toISODate,
  addDays,
  LoadingRow,
  PageHeader,
  StatCard,
  Modal,
  EmptyState,
  userCol,
  fetchAll,
  seedCollection,
} from "./VirtualViewKit";

/**
 * VirtualCatalogView – "Services & Assets" (the Virtual Services counterpart
 * of the Upholstery "Inventory & Stock" view).
 *
 * A virtual business doesn't hold physical stock. What it does hold is:
 *   • a price list of services and packages,
 *   • digital products (templates, courses, downloads) that may be capped,
 *   • software licences / seats / credits that run out or renew.
 *
 * Firestore: users/{uid}/catalog
 *   { kind, name, category, sku, price, billing, qty|null, reorderLevel,
 *     renewalDate, active }
 *
 * `onAddToDocument(item)` (optional) lets the dashboard drop an item straight
 * onto the current quote / invoice.
 */

const KINDS = ["All", "Service", "Package", "Digital Product", "Software / Licence"];
const FORM_KINDS = KINDS.slice(1);

const BILLING = ["One-off", "Per hour", "Per session", "Monthly", "Annually"];
const RECURRING = ["Monthly", "Annually"];

const KIND_COLORS = {
  Service: "bg-[#ede9fe] text-[#6d28d9]",
  Package: "bg-[#fce7f3] text-[#be185d]",
  "Digital Product": "bg-[#e0f2fe] text-[#0369a1]",
  "Software / Licence": "bg-[#f1f5f9] text-[#475569]",
};

const RENEWAL_WINDOW_DAYS = 30;

const BLANK = {
  kind: "Service",
  name: "",
  category: "",
  sku: "",
  price: "",
  billing: "One-off",
  qty: "",
  reorderLevel: "",
  renewalDate: "",
  active: true,
};

const tracked = (it) => it.qty !== null && it.qty !== undefined && it.qty !== "";

// Returns "ok" | "low" | "out" | "renewing" | "untracked"
const getStatus = (it) => {
  if (tracked(it)) {
    if (Number(it.qty) <= 0) return "out";
    if (Number(it.qty) <= (Number(it.reorderLevel) || 0)) return "low";
  }
  if (it.renewalDate) {
    const limit = toISODate(addDays(new Date(), RENEWAL_WINDOW_DAYS));
    if (it.renewalDate <= limit) return "renewing";
  }
  return tracked(it) ? "ok" : "untracked";
};

const STATUS_CFG = {
  ok: { label: "In stock", cls: "bg-[#dcfce7] text-[#166534]" },
  low: { label: "Running low", cls: "bg-[#fef3c7] text-[#92400e]" },
  out: { label: "Depleted", cls: "bg-[#fef2f2] text-[#991b1b]" },
  renewing: { label: "Renews soon", cls: "bg-[#fff7ed] text-[#c2410c]" },
  untracked: { label: "Unlimited", cls: "bg-[#f1f5f9] text-[#64748b]" },
};

const SEED = [
  { kind: "Service", name: "Discovery Call (60 min)", category: "Consulting", sku: "SVC-001", price: 950, billing: "Per session", qty: null, reorderLevel: 0, renewalDate: "", active: true },
  { kind: "Service", name: "Strategy Consulting", category: "Consulting", sku: "SVC-002", price: 1200, billing: "Per hour", qty: null, reorderLevel: 0, renewalDate: "", active: true },
  { kind: "Package", name: "6-Session Coaching Programme", category: "Coaching", sku: "PKG-001", price: 9000, billing: "One-off", qty: null, reorderLevel: 0, renewalDate: "", active: true },
  { kind: "Package", name: "Monthly SEO & Content Retainer", category: "Marketing", sku: "PKG-002", price: 12000, billing: "Monthly", qty: null, reorderLevel: 0, renewalDate: "", active: true },
  { kind: "Digital Product", name: "Brand Starter Template Pack", category: "Templates", sku: "DIG-001", price: 650, billing: "One-off", qty: 40, reorderLevel: 10, renewalDate: "", active: true },
  { kind: "Software / Licence", name: "Zoom Pro (host licences)", category: "Tools", sku: "LIC-001", price: 0, billing: "Monthly", qty: 2, reorderLevel: 1, renewalDate: toISODate(addDays(new Date(), 12)), active: true },
];

export default function VirtualCatalogView({ user, onAddToDocument }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      setItems(await fetchAll(userCol(user.uid, "catalog")));
    } catch (e) {
      console.error("Catalog load:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [user?.uid]);

  const loadSamples = async () => {
    setSeeding(true);
    try {
      await seedCollection(userCol(user.uid, "catalog"), SEED);
      await load();
    } catch (e) {
      alert("Failed to load sample data.");
    } finally {
      setSeeding(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (kind !== "All" && it.kind !== kind) return false;
      if (!q) return true;
      return [it.name, it.sku, it.category].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [items, search, kind]);

  const attention = items.filter((it) => ["low", "out", "renewing"].includes(getStatus(it)) && it.active !== false);

  const openAdd = () => {
    setForm(BLANK);
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (it) => {
    setForm({
      ...BLANK,
      ...it,
      price: String(it.price ?? ""),
      qty: tracked(it) ? String(it.qty) : "",
      reorderLevel: String(it.reorderLevel ?? ""),
    });
    setEditId(it.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      kind: form.kind,
      name: form.name.trim(),
      category: form.category.trim(),
      sku: form.sku.trim(),
      price: Number(form.price) || 0,
      billing: form.billing,
      qty: form.qty === "" ? null : Number(form.qty),
      reorderLevel: Number(form.reorderLevel) || 0,
      renewalDate: form.renewalDate,
      active: !!form.active,
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "users", user.uid, "catalog", editId), { ...payload, updatedAt: serverTimestamp() });
        setItems((prev) => prev.map((x) => (x.id === editId ? { id: editId, ...payload } : x)));
      } else {
        const ref = await addDoc(userCol(user.uid, "catalog"), { ...payload, createdAt: serverTimestamp() });
        setItems((prev) => [...prev, { id: ref.id, ...payload }]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Save catalog item:", e);
      alert("Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editId || !window.confirm("Delete this item?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "catalog", editId));
      setItems((prev) => prev.filter((x) => x.id !== editId));
      setShowModal(false);
    } catch (e) {
      alert("Failed to delete item.");
    }
  };

  if (loading) return <LoadingRow label="Loading catalogue…" />;

  return (
    <div className="space-y-5">
      <PageHeader title="Service Catalogue" subtitle="Your price list, digital products and the licences you rely on">
        <button onClick={openAdd} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Your catalogue is empty"
          hint="Add the services and packages you sell, plus any capped digital products or licences."
          onAdd={openAdd}
          addLabel="Add Item"
          onSeed={loadSamples}
          seeding={seeding}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Items" value={items.length} />
            <StatCard label="Active" value={items.filter((i) => i.active !== false).length} color="text-[#059669]" bg="bg-[#f0fdf4]" />
            <StatCard label="Needs attention" value={attention.length} color="text-[#d97706]" bg="bg-[#fffbeb]" />
            <StatCard label="Recurring" value={items.filter((i) => RECURRING.includes(i.billing)).length} color="text-[#7c3aed]" bg="bg-[#f5f3ff]" />
          </div>

          {attention.length > 0 && (
            <div className="flex items-start gap-2 px-4 py-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl text-sm text-[#92400e]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                {attention.slice(0, 3).map((i) => i.name).join(", ")}
                {attention.length > 3 ? ` and ${attention.length - 3} more` : ""} need attention (low, depleted or renewing within {RENEWAL_WINDOW_DAYS} days).
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {KINDS.map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${kind === k ? "bg-[#7c3aed] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input className={`${inputCls} pl-9`} placeholder="Search name, SKU, category" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                    {["Item", "Type", "Price", "Billing", "Availability", "Renewal", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#94a3b8]">No items match your filters</td></tr>
                  )}
                  {filtered.map((it) => {
                    const st = STATUS_CFG[getStatus(it)];
                    return (
                      <tr key={it.id} onClick={() => openEdit(it)} className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer ${it.active === false ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3 min-w-[200px]">
                          <div className="text-sm font-medium text-[#374151]">{it.name}</div>
                          <div className="text-[11px] text-[#94a3b8]">{[it.sku, it.category].filter(Boolean).join(" · ")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${KIND_COLORS[it.kind] || KIND_COLORS.Service}`}>{it.kind}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#1e293b] whitespace-nowrap">{fmtR(it.price)}</td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">{it.billing}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${st.cls}`}>
                            {tracked(it) ? `${it.qty} · ` : ""}{st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b] whitespace-nowrap">{it.renewalDate || "—"}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {onAddToDocument && it.active !== false && (
                            <button
                              onClick={() => onAddToDocument(it)}
                              title="Add to current quote / invoice"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#7c3aed] bg-[#f5f3ff] hover:bg-[#ede9fe] rounded-lg whitespace-nowrap"
                            >
                              <FilePlus2 className="w-3.5 h-3.5" />
                              Add to quote
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <Modal
          wide
          title={editId ? "Edit Item" : "Add Item"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              {editId ? <button onClick={handleDelete} className="text-sm text-[#dc2626] hover:underline">Delete</button> : <span />}
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className={ghostBtn}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name.trim()} className={primaryBtn}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Strategy Consulting" />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select className={inputCls} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                {FORM_KINDS.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Coaching" />
            </div>
            <div>
              <label className={labelCls}>Price (R)</label>
              <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Billing</label>
              <select className={inputCls} value={form.billing} onChange={(e) => setForm({ ...form, billing: e.target.value })}>
                {BILLING.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>SKU / Code</label>
              <input className={inputCls} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Renewal date</label>
              <input type="date" className={inputCls} value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Seats / copies / credits available</label>
              <input type="number" className={inputCls} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="Leave blank if unlimited" />
            </div>
            <div>
              <label className={labelCls}>Warn me at or below</label>
              <input type="number" className={inputCls} value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[#374151]">
              <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-[#7c3aed]" />
              Active (shown when adding to quotes and invoices)
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
