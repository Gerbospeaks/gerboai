import React, { useState, useEffect } from "react";
import { MapPin, Plus, X, Save, Edit2, Trash2, CheckCircle } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const EMPTY = { name: "", suburb: "", city: "Johannesburg", postalCode: "", radius: "10", travelFee: "0", active: true, notes: "" };

export default function ServiceAreasView({ user }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "users", user.uid, "serviceAreas"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setAreas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name) return alert("Area name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "serviceAreas", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "serviceAreas"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this service area?")) return;
    await deleteDoc(doc(db, "users", user.uid, "serviceAreas", id)); load();
  };

  const toggleActive = async (area) => {
    await updateDoc(doc(db, "users", user.uid, "serviceAreas", area.id), { active: !area.active });
    load();
  };

  const AREA_COLORS = ["bg-[#0891b2]","bg-[#7c3aed]","bg-[#059669]","bg-[#d97706]","bg-[#dc2626]","bg-[#0284c7]"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><MapPin className="w-5 h-5 text-[#0891b2]" />Service Areas</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{areas.filter(a => a.active).length} active areas · {areas.length} total</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(EMPTY); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />Add Area
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
          : areas.length === 0 ? (
            <div className="col-span-3 bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm">
              <MapPin className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No service areas defined</p>
              <button onClick={() => { setEditItem(null); setForm(EMPTY); setShowModal(true); }} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Add First Area</button>
            </div>
          ) : areas.map((area, i) => (
            <div key={area.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${area.active ? "border-[#e2e8f0]" : "border-[#f1f5f9] opacity-60"}`}>
              <div className={`h-2 ${AREA_COLORS[i % AREA_COLORS.length]}`} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#1e293b]">{area.name}</p>
                    <p className="text-xs text-[#64748b]">{area.suburb}{area.city ? `, ${area.city}` : ""}{area.postalCode ? ` ${area.postalCode}` : ""}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${area.active ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#64748b]"}`}>
                    {area.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-[#64748b] mb-3">
                  <span>📍 {area.radius} km radius</span>
                  {Number(area.travelFee) > 0 && <span>🚗 R{area.travelFee} travel fee</span>}
                </div>
                {area.notes && <p className="text-xs text-[#94a3b8] mb-3 italic">{area.notes}</p>}
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(area)} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${area.active ? "bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]" : "bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]"}`}>
                    {area.active ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => { setEditItem(area); setForm({ ...EMPTY, ...area }); setShowModal(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(area.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Area" : "Add Service Area"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Area Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sandton North"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[["Suburb", "suburb", "Sandton"], ["City", "city", "Johannesburg"], ["Postal Code", "postalCode", "2196"]].map(([l, k, p]) => (
                  <div key={k} className={k === "suburb" ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                    <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={p}
                      className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Service Radius (km)</label>
                  <input type="number" value={form.radius} onChange={e => setForm({ ...form, radius: e.target.value })} placeholder="10"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Travel Fee (R)</label>
                  <input type="number" value={form.travelFee} onChange={e => setForm({ ...form, travelFee: e.target.value })} placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Special access routes, timing restrictions…"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded border-[#d1d5db] text-[#0891b2] focus:ring-[#0891b2]" />
                <span className="text-sm text-[#374151]">Active (accept jobs in this area)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Area"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}