import React, { useState, useEffect } from "react";
import { TrendingUp, Star, Plus, X, Save, Edit2, Trash2, Award, ThumbsUp, ThumbsDown } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const RATING_COLORS = { 5: "text-[#059669]", 4: "text-[#0891b2]", 3: "text-[#d97706]", 2: "text-[#ea580c]", 1: "text-[#dc2626]" };
const EMPTY = { staffName: "", period: "", jobsCompleted: "", rating: "5", feedback: "", strengths: "", improvements: "", reviewedBy: "" };

export default function StaffPerformanceView({ user }) {
  const [records, setRecords] = useState([]);
  const [staff, setStaff] = useState([]);
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
      const [perfSnap, staffSnap] = await Promise.all([
        getDocs(query(collection(db, "users", user.uid, "staffPerformance"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "users", user.uid, "staff"))),
      ]);
      setRecords(perfSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStaff(staffSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.staffName) return alert("Staff name required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "staffPerformance", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "staffPerformance"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await deleteDoc(doc(db, "users", user.uid, "staffPerformance", id)); load();
  };

  const avgRating = records.length ? (records.reduce((s, r) => s + Number(r.rating || 0), 0) / records.length).toFixed(1) : "—";

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-[#d97706] text-[#d97706]" : "text-[#e2e8f0]"}`} />
  ));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#0891b2]" />Staff Performance</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Performance reviews and ratings</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(EMPTY); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />Add Review
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Avg Rating</p>
          <p className="text-2xl font-bold text-[#d97706] mt-1">{avgRating} ★</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Total Reviews</p>
          <p className="text-2xl font-bold text-[#0891b2] mt-1">{records.length}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Top Rated</p>
          <p className="text-sm font-bold text-[#059669] mt-1 truncate">
            {records.filter(r => r.rating === "5" || r.rating === 5).length > 0
              ? records.filter(r => r.rating === "5" || r.rating === 5)[0]?.staffName?.split(" ")[0]
              : "—"}
          </p>
        </div>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {loading ? <div className="bg-white border border-[#e2e8f0] rounded-xl py-12 text-center text-sm text-[#94a3b8] shadow-sm">Loading…</div>
          : records.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-xl py-16 text-center shadow-sm">
              <Award className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8]">No reviews yet</p>
              <button onClick={() => { setEditItem(null); setForm(EMPTY); setShowModal(true); }} className="mt-3 px-4 py-2 bg-[#0891b2] text-white text-sm rounded-lg">Add First Review</button>
            </div>
          ) : records.map(r => (
            <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-[#1e293b]">{r.staffName}</p>
                    <div className="flex items-center gap-0.5">{renderStars(Number(r.rating))}</div>
                    <span className={`text-sm font-bold ${RATING_COLORS[r.rating] || "text-[#374151]"}`}>{r.rating}/5</span>
                    {r.period && <span className="text-xs text-[#94a3b8] ml-auto">{r.period}</span>}
                  </div>
                  {r.jobsCompleted && <p className="text-xs text-[#64748b]">Jobs completed: <span className="font-semibold text-[#374151]">{r.jobsCompleted}</span></p>}
                  {r.feedback && <p className="text-sm text-[#64748b] mt-2 italic">"{r.feedback}"</p>}
                  <div className="flex gap-4 mt-2">
                    {r.strengths && <p className="text-xs text-[#059669]"><span className="font-semibold">Strengths:</span> {r.strengths}</p>}
                    {r.improvements && <p className="text-xs text-[#dc2626]"><span className="font-semibold">Improve:</span> {r.improvements}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditItem(r); setForm({ ...EMPTY, ...r }); setShowModal(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Review" : "New Performance Review"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Staff Member *</label>
                <select value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                  <option value="">Select…</option>
                  {staff.map(s => <option key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Review Period</label>
                  <input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. January 2025"
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Rating (1–5)</label>
                  <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Jobs Completed</label>
                <input type="number" value={form.jobsCompleted} onChange={e => setForm({ ...form, jobsCompleted: e.target.value })} placeholder="24"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
              </div>
              {[["Overall Feedback", "feedback", "Great attitude and work quality…", 3], ["Strengths", "strengths", "Punctual, thorough, good with clients…", 2], ["Areas for Improvement", "improvements", "Speed of work, communication…", 2]].map(([l, k, p, rows]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">{l}</label>
                  <textarea value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} rows={rows} placeholder={p}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2] resize-none" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#e2e8f0]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#64748b] hover:bg-[#f8fafc]">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] text-white text-sm font-medium rounded-lg disabled:opacity-50">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}