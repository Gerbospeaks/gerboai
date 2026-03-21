import React, { useState, useEffect } from "react";
import { Repeat, Plus, X, Save, Edit2, Trash2, Calendar, User, MapPin, DollarSign, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Custom"];
const SERVICE_TYPES = ["Standard Cleaning", "Deep Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning", "Specialized"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY = { clientName: "", address: "", phone: "", serviceType: "Standard Cleaning", frequency: "Weekly", dayOfWeek: "Monday", time: "09:00", duration: "2", amount: "", assignedStaff: "", notes: "", active: true, nextDate: "" };

export default function RecurringJobsView({ user }) {
  const [records, setRecords] = useState([]);
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
      const q = query(collection(db, "users", user.uid, "recurringJobs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r) => { setEditItem(r); setForm({ ...EMPTY, ...r }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.clientName) return alert("Client name is required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "recurringJobs", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "recurringJobs"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recurring job?")) return;
    await deleteDoc(doc(db, "users", user.uid, "recurringJobs", id)); load();
  };

  const toggleActive = async (item) => {
    await updateDoc(doc(db, "users", user.uid, "recurringJobs", item.id), { active: !item.active, updatedAt: serverTimestamp() });
    load();
  };

  const activeCount = records.filter(r => r.active).length;
  const monthlyValue = records.filter(r => r.active).reduce((s, r) => {
    const a = Number(r.amount) || 0;
    if (r.frequency === "Weekly") return s + a * 4;
    if (r.frequency === "Bi-weekly") return s + a * 2;
    return s + a;
  }, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Repeat className="w-5 h-5 text-[#0891b2]" />Recurring Jobs</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Automated repeat cleaning schedules</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />New Recurring Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Total Schedules</p>
          <p className="text-2xl font-bold text-[#0891b2] mt-1">{records.length}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-[#059669] mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Est. Monthly Value</p>
          <p className="text-2xl font-bold text-[#7c3aed] mt-1">R{monthlyValue.toFixed(0)}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="py-16 text-center text-sm text-[#94a3b8]">Loading…</div>
          : records.length === 0 ? (
            <div className="py-16 text-center">
              <Repeat className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No recurring jobs yet</p>
              <button onClick={openCreate} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Create First</button>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {records.map(r => (
                <div key={r.id} className="p-4 flex items-start justify-between gap-3 hover:bg-[#f8fafc]">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 w-3 h-3 rounded-full flex-shrink-0 ${r.active ? "bg-[#059669]" : "bg-[#cbd5e1]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#1e293b]">{r.clientName}</p>
                        <span className="text-xs bg-[#ecfeff] text-[#0e7490] px-2 py-0.5 rounded border border-[#a5f3fc]">{r.frequency}</span>
                        <span className="text-xs bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded">{r.serviceType}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        {r.address && <span className="flex items-center gap-1 text-xs text-[#64748b]"><MapPin className="w-3 h-3" />{r.address}</span>}
                        <span className="flex items-center gap-1 text-xs text-[#64748b]"><Calendar className="w-3 h-3" />{r.dayOfWeek} @ {r.time}</span>
                        {r.assignedStaff && <span className="flex items-center gap-1 text-xs text-[#64748b]"><User className="w-3 h-3" />{r.assignedStaff}</span>}
                        {r.amount && <span className="flex items-center gap-1 text-xs font-semibold text-[#059669]"><DollarSign className="w-3 h-3" />R{Number(r.amount).toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(r)} className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${r.active ? "bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}>
                      {r.active ? "Active" : "Paused"}
                    </button>
                    <button onClick={() => openEdit(r)} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Recurring Job" : "New Recurring Job"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[
                { label: "Client Name *", key: "clientName", placeholder: "Johnson Residence" },
                { label: "Property Address", key: "address", placeholder: "123 Main St" },
                { label: "Phone", key: "phone", placeholder: "+27 82 123 4567" },
                { label: "Assigned Staff", key: "assignedStaff", placeholder: "Team member" },
                { label: "Amount per Visit (R)", key: "amount", placeholder: "0.00", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Day of Week</label>
                  <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {DAYS_OF_WEEK.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Service Type</label>
                  <select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Special instructions…"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}