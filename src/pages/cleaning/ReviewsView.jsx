
import React, { useState, useEffect } from "react";
import { Repeat, Plus, X, Save, Edit2, Trash2, Calendar, User, MapPin, Star, DollarSign, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";


export function ReviewsView({ user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientName: "", date: "", rating: "5", review: "", serviceType: "Standard Cleaning", staffName: "", replied: false, replyText: "" });
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
 
  useEffect(() => { if (user?.uid) load(); }, [user]);
  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users", user.uid, "reviews"), orderBy("createdAt", "desc")));
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
 
  const renderStars = (n) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < n ? "fill-[#d97706] text-[#d97706]" : "text-[#e2e8f0]"}`} />
  ));
 
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : "—";
 
  const handleSave = async () => {
    if (!form.clientName) return alert("Client name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "reviews", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "reviews"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed"); } finally { setSaving(false); }
  };
 
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Star className="w-5 h-5 text-[#d97706]" />Client Reviews</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Average: {avgRating}/5 · {reviews.length} reviews</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ clientName:"",date:"",rating:"5",review:"",serviceType:"Standard Cleaning",staffName:"",replied:false,replyText:"" }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />Add Review
        </button>
      </div>
 
      <div className="grid grid-cols-3 gap-3">
        {[{label:"Avg Rating",value:`${avgRating} ★`,color:"text-[#d97706]"},{label:"Total Reviews",value:reviews.length,color:"text-[#0891b2]"},{label:"5-Star Reviews",value:reviews.filter(r=>r.rating==="5"||r.rating===5).length,color:"text-[#059669]"}].map(s=>(
          <div key={s.label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
 
      <div className="space-y-3">
        {loading ? <div className="bg-white border border-[#e2e8f0] rounded-xl py-12 text-center text-sm text-[#94a3b8] shadow-sm">Loading…</div>
          : reviews.length === 0 ? <div className="bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm"><Star className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" /><p className="text-sm text-[#94a3b8]">No reviews yet</p></div>
          : reviews.map(r => (
          <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-[#1e293b]">{r.clientName}</p>
                  <div className="flex items-center gap-0.5">{renderStars(Number(r.rating))}</div>
                  <span className="text-xs text-[#94a3b8] ml-auto">{r.date}</span>
                </div>
                <p className="text-xs text-[#64748b] mb-2">{r.serviceType}{r.staffName ? ` · Staff: ${r.staffName}` : ""}</p>
                {r.review && <p className="text-sm text-[#374151] italic">"{r.review}"</p>}
                {r.replied && r.replyText && <div className="mt-2 pl-3 border-l-2 border-[#0891b2]"><p className="text-xs text-[#0891b2] font-semibold">Your reply:</p><p className="text-xs text-[#64748b]">{r.replyText}</p></div>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditItem(r); setForm({...r}); setShowModal(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={async()=>{if(!window.confirm("Delete?"))return;await deleteDoc(doc(db,"users",user.uid,"reviews",r.id));load();}} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
 
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">Add Review</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {[["Client Name *","clientName","Johnson Residence"],["Staff Name","staffName","Jane Smith"]].map(([l,k,p])=>(
                <div key={k}><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                  <input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={p} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" /></div>
                <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Rating</label>
                  <select value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})} className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} Star{n!==1?"s":""}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Review Text</label>
                <textarea value={form.review} onChange={e=>setForm({...form,review:e.target.value})} rows={3} placeholder="Client's feedback…" className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" /></div>
              <div><label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Your Reply (optional)</label>
                <textarea value={form.replyText} onChange={e=>setForm({...form,replyText:e.target.value,replied:!!e.target.value})} rows={2} placeholder="Thank you for your feedback…" className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#d97706] text-white text-sm font-medium rounded-lg disabled:opacity-50"><Save className="w-4 h-4" />{saving?"Saving…":"Save Review"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default ReviewsView;