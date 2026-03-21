import React, { useState, useEffect } from "react";
import { CheckSquare, Truck, Calendar, Star, Bell, Plus, X, Save, Edit2, Trash2, AlertTriangle, Check, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const FLEET_EMPTY = { make: "", model: "", year: "", registration: "", assignedTo: "", status: "Available", fuelType: "Petrol", lastService: "", nextService: "", odometer: "", insurance: "", notes: "" };
const FLEET_STATUS = { Available: "bg-[#dcfce7] text-[#166534]", "In Use": "bg-[#dbeafe] text-[#1d4ed8]", Maintenance: "bg-[#fef3c7] text-[#92400e]", Inactive: "bg-[#fee2e2] text-[#991b1b]" };

export function FleetView({ user }) {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(FLEET_EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user?.uid) load(); }, [user]);
  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users", user.uid, "fleet"), orderBy("createdAt", "desc")));
      setFleet(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.make || !form.registration) return alert("Make and registration required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "fleet", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "fleet"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Truck className="w-5 h-5 text-[#0891b2]" />Fleet / Vehicles</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{fleet.length} vehicle{fleet.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(FLEET_EMPTY); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
          : fleet.length === 0 ? (
            <div className="col-span-3 bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm">
              <Truck className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No vehicles registered</p>
              <button onClick={() => { setEditItem(null); setForm(FLEET_EMPTY); setShowModal(true); }} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Add First Vehicle</button>
            </div>
          ) : fleet.map(v => (
            <div key={v.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] p-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{v.make} {v.model}</p>
                    <p className="text-[#a5f3fc] text-sm">{v.year}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${FLEET_STATUS[v.status] || "bg-white/20 text-white"}`}>{v.status}</span>
                </div>
                <p className="font-mono text-lg mt-2 text-white">{v.registration}</p>
              </div>
              <div className="p-4 space-y-1.5">
                {v.assignedTo && <p className="text-xs text-[#64748b]">👤 Assigned to: <span className="font-semibold text-[#374151]">{v.assignedTo}</span></p>}
                {v.odometer && <p className="text-xs text-[#64748b]">🔢 Odometer: {v.odometer} km</p>}
                {v.lastService && <p className="text-xs text-[#64748b]">🔧 Last service: {v.lastService}</p>}
                {v.nextService && <p className="text-xs text-[#d97706]">⚠️ Next service: {v.nextService}</p>}
                {v.insurance && <p className="text-xs text-[#64748b]">🛡️ Insurance: {v.insurance}</p>}
              </div>
              <div className="border-t border-[#f1f5f9] px-4 py-2.5 flex justify-end gap-2 bg-[#f8fafc]">
                <button onClick={() => { setEditItem(v); setForm({ ...FLEET_EMPTY, ...v }); setShowModal(true); }} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3 h-3" />Edit</button>
                <button onClick={async () => { if (!window.confirm("Remove vehicle?")) return; await deleteDoc(doc(db, "users", user.uid, "fleet", v.id)); load(); }} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3 h-3" />Remove</button>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Vehicle" : "Add Vehicle"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[["Make *","make","Toyota"],["Model *","model","Corolla"],["Year","year","2022"],["Registration *","registration","CA 123-456"],["Assigned To","assignedTo","Team member"],["Odometer (km)","odometer","50000"]].map(([l,k,p])=>(
                  <div key={k}><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                    <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {Object.keys(FLEET_STATUS).map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Fuel Type</label>
                  <select value={form.fuelType} onChange={e=>setForm({...form,fuelType:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {["Petrol","Diesel","Electric","Hybrid"].map(f=><option key={f}>{f}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Last Service Date</label>
                  <input type="date" value={form.lastService} onChange={e=>setForm({...form,lastService:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Next Service Date</label>
                  <input type="date" value={form.nextService} onChange={e=>setForm({...form,nextService:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Insurance Details</label>
                <input value={form.insurance} onChange={e=>setForm({...form,insurance:e.target.value})} placeholder="Policy number, expiry date…" className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50"><Save className="w-4 h-4" />{saving?"Saving…":"Save Vehicle"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FleetView;