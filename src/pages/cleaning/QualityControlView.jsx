import React, { useState, useEffect } from "react";
import { CheckSquare, Truck, Calendar, Star, Bell, Plus, X, Save, Edit2, Trash2, AlertTriangle, Check, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";


const QC_RATINGS = ["Pass", "Fail", "Needs Improvement"];
const QC_EMPTY = { jobAddress: "", clientName: "", date: "", inspectorName: "", overallRating: "Pass", cleanlinessScore: "5", timelinessScore: "5", staffPerformanceScore: "5", issues: "", recommendations: "", followUpRequired: false };

export function QualityControlView({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(QC_EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user?.uid) load(); }, [user]);
  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users", user.uid, "qualityControl"), orderBy("createdAt", "desc")));
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.clientName) return alert("Client name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "qualityControl", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "qualityControl"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); } finally { setSaving(false); }
  };

  const STATUS_STYLES = { Pass: "bg-[#dcfce7] text-[#166534]", Fail: "bg-[#fee2e2] text-[#991b1b]", "Needs Improvement": "bg-[#fef3c7] text-[#92400e]" };
  const passRate = records.length ? Math.round((records.filter(r => r.overallRating === "Pass").length / records.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><CheckSquare className="w-5 h-5 text-[#0891b2]" />Quality Control</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{passRate}% pass rate · {records.length} inspections</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(QC_EMPTY); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />New Inspection
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Pass Rate", value: `${passRate}%`, color: "text-[#059669]" }, { label: "Total Inspections", value: records.length, color: "text-[#0891b2]" }, { label: "Follow-ups", value: records.filter(r => r.followUpRequired).length, color: "text-[#d97706]" }].map(s => (
          <div key={s.label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="py-12 text-center text-sm text-[#94a3b8]">Loading…</div>
          : records.length === 0 ? <div className="py-16 text-center"><CheckSquare className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" /><p className="text-sm text-[#94a3b8]">No inspections yet</p><button onClick={() => { setEditItem(null); setForm(QC_EMPTY); setShowModal(true); }} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Add First</button></div>
          : <div className="divide-y divide-[#f1f5f9]">
            {records.map(r => (
              <div key={r.id} className="p-4 hover:bg-[#f8fafc] flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[r.overallRating]}`}>{r.overallRating}</span>
                    {r.followUpRequired && <span className="text-xs bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded">Follow-up needed</span>}
                    <span className="text-xs text-[#94a3b8] ml-auto">{r.date}</span>
                  </div>
                  <p className="font-semibold text-sm text-[#1e293b]">{r.clientName}</p>
                  <p className="text-xs text-[#64748b]">{r.jobAddress}</p>
                  <div className="flex gap-3 mt-1 text-xs text-[#94a3b8]">
                    <span>Cleanliness: {r.cleanlinessScore}/10</span>
                    <span>Timeliness: {r.timelinessScore}/10</span>
                    <span>Staff: {r.staffPerformanceScore}/10</span>
                  </div>
                  {r.issues && <p className="text-xs text-[#dc2626] mt-1">Issues: {r.issues}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditItem(r); setForm({ ...QC_EMPTY, ...r }); setShowModal(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={async () => { if (!window.confirm("Delete?")) return; await deleteDoc(doc(db, "users", user.uid, "qualityControl", r.id)); load(); }} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">Quality Inspection</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[["Client Name *","clientName","Johnson Residence"],["Job Address","jobAddress","123 Main St"],["Inspector Name","inspectorName","Jane Smith"]].map(([l,k,p]) => (
                <div key={k}><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                  <input value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={p} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Overall Rating</label>
                  <select value={form.overallRating} onChange={e=>setForm({...form,overallRating:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {QC_RATINGS.map(r=><option key={r}>{r}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["Cleanliness","cleanlinessScore"],["Timeliness","timelinessScore"],["Staff Perf.","staffPerformanceScore"]].map(([l,k])=>(
                  <div key={k}><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l} (1-10)</label>
                    <input type="number" min="1" max="10" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                ))}
              </div>
              {[["Issues Found","issues","Describe any issues…",2],["Recommendations","recommendations","Suggestions for improvement…",2]].map(([l,k,p,r])=>(
                <div key={k}><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                  <textarea value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} rows={r} placeholder={p} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" /></div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.followUpRequired} onChange={e=>setForm({...form,followUpRequired:e.target.checked})} className="w-4 h-4 rounded" />
                <span className="text-sm text-[#374151]">Follow-up visit required</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50"><Save className="w-4 h-4" />{saving?"Saving…":"Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default QualityControlView;