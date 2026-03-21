// StaffScheduleView.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Plus, X, Save, Edit2, Trash2, User, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";

const SHIFTS = ["Morning (06:00-14:00)", "Afternoon (14:00-22:00)", "Full Day (08:00-16:00)", "Custom"];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const EMPTY_SCHEDULE = { staffName: "", date: "", shift: "Full Day (08:00-16:00)", jobAddress: "", notes: "", startTime: "08:00", endTime: "16:00" };

export function StaffScheduleView({ user }) {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_SCHEDULE);
  const [saving, setSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [schSnap, staffSnap] = await Promise.all([
        getDocs(query(collection(db, "users", user.uid, "schedules"), orderBy("date", "asc"))),
        getDocs(query(collection(db, "users", user.uid, "staff"), orderBy("createdAt", "desc"))),
      ]);
      setSchedules(schSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStaff(staffSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Get week dates
  const getWeekDates = () => {
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  };

  const weekDates = getWeekDates();
  const getSchedulesForDate = (date) => schedules.filter(s => s.date === date);

  const handleSave = async () => {
    if (!form.staffName || !form.date) return alert("Staff name and date required");
    setSaving(true);
    try {
      const data = { ...form, updatedAt: serverTimestamp() };
      if (editItem) await updateDoc(doc(db, "users", user.uid, "schedules", editItem.id), data);
      else await addDoc(collection(db, "users", user.uid, "schedules"), { ...data, createdAt: serverTimestamp() });
      setShowModal(false); load();
    } catch (e) { alert("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this schedule entry?")) return;
    await deleteDoc(doc(db, "users", user.uid, "schedules", id)); load();
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return { day: DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1], date: d.getDate(), isToday: dateStr === new Date().toISOString().split("T")[0] };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Calendar className="w-5 h-5 text-[#0891b2]" />Staff Schedule</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Weekly shift assignments</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm(EMPTY_SCHEDULE); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-lg">
          <Plus className="w-4 h-4" />Add Shift
        </button>
      </div>

      {/* Week nav */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 hover:bg-[#e2e8f0] rounded-lg text-[#64748b]">‹</button>
          <span className="text-sm font-semibold text-[#374151]">{weekOffset === 0 ? "This Week" : weekOffset === 1 ? "Next Week" : weekOffset === -1 ? "Last Week" : `Week of ${weekDates[0]}`}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 hover:bg-[#e2e8f0] rounded-lg text-[#64748b]">›</button>
        </div>
        <div className="grid grid-cols-7 divide-x divide-[#f1f5f9]">
          {weekDates.map(date => {
            const { day, date: d, isToday } = formatDateLabel(date);
            const daySchedules = getSchedulesForDate(date);
            return (
              <div key={date} className={`min-h-[120px] p-2 ${isToday ? "bg-[#ecfeff]" : ""}`}>
                <div className={`text-center mb-2 ${isToday ? "text-[#0891b2]" : "text-[#64748b]"}`}>
                  <p className="text-[10px] font-bold uppercase">{day.slice(0, 3)}</p>
                  <p className={`text-lg font-bold ${isToday ? "text-[#0891b2]" : "text-[#374151]"}`}>{d}</p>
                </div>
                <div className="space-y-1">
                  {daySchedules.map(s => (
                    <div key={s.id} className="bg-[#dbeafe] text-[#1d4ed8] text-[10px] px-1.5 py-1 rounded truncate border border-[#93c5fd]" title={`${s.staffName} — ${s.shift}`}>
                      {s.staffName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* List view */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <p className="text-sm font-semibold text-[#374151]">All Shifts This Week ({schedules.filter(s => weekDates.includes(s.date)).length})</p>
        </div>
        <div className="divide-y divide-[#f1f5f9]">
          {loading ? <div className="py-8 text-center text-sm text-[#94a3b8]">Loading…</div>
            : schedules.filter(s => weekDates.includes(s.date)).length === 0
              ? <div className="py-8 text-center text-sm text-[#94a3b8]">No shifts scheduled this week</div>
              : schedules.filter(s => weekDates.includes(s.date)).map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f8fafc]">
                  <div className="w-8 h-8 bg-[#ecfeff] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#0891b2]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1e293b]">{s.staffName}</p>
                    <p className="text-xs text-[#64748b]">{s.date} · {s.shift}</p>
                    {s.jobAddress && <p className="text-xs text-[#94a3b8]">{s.jobAddress}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditItem(s); setForm({ ...EMPTY_SCHEDULE, ...s }); setShowModal(true); }} className="p-1.5 text-[#94a3b8] hover:text-[#374151] hover:bg-[#e2e8f0] rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-base font-semibold text-[#1e293b]">{editItem ? "Edit Shift" : "Add Shift"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#94a3b8] hover:bg-[#e2e8f0] rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Staff Member *</label>
                <select value={form.staffName} onChange={e => setForm({ ...form, staffName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                  <option value="">Select staff…</option>
                  {staff.map(s => <option key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</option>)}
                  <option value="__custom__">Enter manually…</option>
                </select>
                {form.staffName === "__custom__" && (
                  <input value={form._manualName || ""} onChange={e => setForm({ ...form, staffName: e.target.value, _manualName: e.target.value })}
                    placeholder="Staff member name" className="mt-2 w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Shift</label>
                  <select value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]">
                    {SHIFTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Job Address</label>
                <input value={form.jobAddress} onChange={e => setForm({ ...form, jobAddress: e.target.value })} placeholder="123 Client Street"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0891b2]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
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

export default StaffScheduleView;