import React, { useState, useEffect } from "react";
import { CheckSquare, Truck, Calendar, Star, Bell, Plus, X, Save, Edit2, Trash2, AlertTriangle, Check, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const PRIORITIES = { High: "bg-[#fee2e2] text-[#991b1b]", Medium: "bg-[#fef3c7] text-[#92400e]", Low: "bg-[#dcfce7] text-[#166534]" };
const REM_EMPTY = { title: "", dueDate: "", dueTime: "", priority: "Medium", category: "Follow-up", notes: "", done: false };
const CATEGORIES_REM = ["Follow-up", "Payment", "Job", "Staff", "Supplies", "Maintenance", "Other"];
 
export function RemindersView({ user }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(REM_EMPTY);
  const [saving, setSaving] = useState(false);
  const [showDone, setShowDone] = useState(false);
 
  useEffect(() => { if (user?.uid) load(); }, [user]);
  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users", user.uid, "reminders"), orderBy("createdAt", "desc")));
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
 
  const handleSave = async () => {
    if (!form.title) return alert("Title required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "reminders", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "reminders"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed"); } finally { setSaving(false); }
  };
 
  const toggleDone = async (r) => {
    await updateDoc(doc(db, "users", user.uid, "reminders", r.id), { done: !r.done, updatedAt: serverTimestamp() });
    load();
  };
 
  const isOverdue = (r) => !r.done && r.dueDate && r.dueDate < new Date().toISOString().split("T")[0];
  const filtered = reminders.filter(r => showDone ? r.done : !r.done);
 
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Bell className="w-5 h-5 text-[#0891b2]" />Reminders</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{reminders.filter(r=>!r.done).length} pending · {reminders.filter(r=>isOverdue(r)).length} overdue</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDone(!showDone)} className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${showDone ? "bg-[#0891b2] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`}>{showDone ? "Show Pending" : "Show Done"}</button>
          <button onClick={() => { setEditItem(null); setForm(REM_EMPTY); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg"><Plus className="w-4 h-4" />Add Reminder</button>
        </div>
      </div>
 
      <div className="space-y-2">
        {loading ? <div className="bg-white border border-[#e2e8f0] rounded-xl py-12 text-center text-sm text-[#94a3b8] shadow-sm">Loading…</div>
          : filtered.length === 0 ? <div className="bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm"><Bell className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" /><p className="text-sm text-[#94a3b8]">No {showDone?"completed":"pending"} reminders</p></div>
          : filtered.map(r => (
          <div key={r.id} className={`bg-white border rounded-xl shadow-sm p-4 flex items-start gap-3 ${isOverdue(r) ? "border-[#fca5a5] bg-[#fef2f2]" : "border-[#e2e8f0]"}`}>
            <button onClick={() => toggleDone(r)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${r.done ? "bg-[#059669] border-[#059669]" : isOverdue(r) ? "border-[#dc2626]" : "border-[#cbd5e1] hover:border-[#0891b2]"}`}>
              {r.done && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className={`font-semibold text-sm ${r.done ? "line-through text-[#94a3b8]" : isOverdue(r) ? "text-[#dc2626]" : "text-[#1e293b]"}`}>{r.title}</p>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${PRIORITIES[r.priority] || "bg-[#f1f5f9] text-[#475569]"}`}>{r.priority}</span>
                <span className="text-xs bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded">{r.category}</span>
                {isOverdue(r) && <span className="text-xs bg-[#fee2e2] text-[#991b1b] px-1.5 py-0.5 rounded font-semibold">OVERDUE</span>}
              </div>
              {(r.dueDate || r.dueTime) && <p className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5"><Clock className="w-3 h-3" />{r.dueDate}{r.dueTime && ` @ ${r.dueTime}`}</p>}
              {r.notes && <p className="text-xs text-[#94a3b8] mt-0.5">{r.notes}</p>}
            </div>
            <div className="flex gap-1">
              <button onClick={()=>{setEditItem(r);setForm({...REM_EMPTY,...r});setShowModal(true);}} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={async()=>{if(!window.confirm("Delete?"))return;await deleteDoc(doc(db,"users",user.uid,"reminders",r.id));load();}} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
 
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem?"Edit Reminder":"New Reminder"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Title *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Call Johnson re: next booking" className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Due Time</label>
                  <input type="time" value={form.dueTime} onChange={e=>setForm({...form,dueTime:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {CATEGORIES_REM.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50"><Save className="w-4 h-4" />{saving?"Saving…":"Save Reminder"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default RemindersView;