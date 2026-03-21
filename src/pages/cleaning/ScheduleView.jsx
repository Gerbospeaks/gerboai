import React, { useState, useEffect } from "react";
import { CheckSquare, Truck, Calendar, Star, Bell, Plus, X, Save, Edit2, Trash2, AlertTriangle, Check, Clock } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
export function ScheduleView({ user, businessInfo }) {
  // Re-export as the full day-view schedule using jobs + staff schedules
  const [jobs, setJobs] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
 
  useEffect(() => { if (user?.uid) load(); }, [user]);
  const load = async () => {
    setLoading(true);
    try {
      const [jobsSnap, shiftsSnap] = await Promise.all([
        getDocs(query(collection(db, "users", user.uid, "jobs"))),
        getDocs(query(collection(db, "users", user.uid, "schedules"))),
      ]);
      setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setShifts(shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
 
  const dayJobs = jobs.filter(j => j.date === selectedDate);
  const dayShifts = shifts.filter(s => s.date === selectedDate);
 
  const STATUS_DOT = { scheduled: "bg-[#2563eb]", "in-progress": "bg-[#d97706]", completed: "bg-[#059669]", cancelled: "bg-[#dc2626]" };
 
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2"><Calendar className="w-5 h-5 text-[#0891b2]" />Schedule</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Daily view — jobs and staff shifts</p>
        </div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2] bg-white" />
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Jobs */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#374151]">Jobs</p>
            <span className="text-xs bg-[#dbeafe] text-[#1d4ed8] px-2 py-0.5 rounded font-semibold">{dayJobs.length}</span>
          </div>
          {loading ? <div className="py-8 text-center text-sm text-[#94a3b8]">Loading…</div>
            : dayJobs.length === 0 ? <div className="py-8 text-center text-sm text-[#94a3b8]">No jobs scheduled</div>
            : <div className="divide-y divide-[#f1f5f9]">
              {dayJobs.sort((a,b) => (a.time||"").localeCompare(b.time||"")).map(j => (
                <div key={j.id} className="p-3 flex items-start gap-3">
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[j.status] || "bg-[#94a3b8]"}`} />
                  <div>
                    <p className="text-sm font-medium text-[#374151]">{j.clientName}</p>
                    <p className="text-xs text-[#64748b]">{j.time && `${j.time} · `}{j.serviceType}</p>
                    {j.address && <p className="text-xs text-[#94a3b8]">{j.address}</p>}
                    {j.assignedStaff && <p className="text-xs text-[#0891b2]">👤 {j.assignedStaff}</p>}
                  </div>
                </div>
              ))}
            </div>}
        </div>
 
        {/* Staff shifts */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#374151]">Staff on Duty</p>
            <span className="text-xs bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded font-semibold">{dayShifts.length}</span>
          </div>
          {loading ? <div className="py-8 text-center text-sm text-[#94a3b8]">Loading…</div>
            : dayShifts.length === 0 ? <div className="py-8 text-center text-sm text-[#94a3b8]">No shifts assigned</div>
            : <div className="divide-y divide-[#f1f5f9]">
              {dayShifts.map(s => (
                <div key={s.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#ecfeff] rounded-full flex items-center justify-center text-[#0891b2] font-bold text-xs flex-shrink-0">
                    {s.staffName?.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#374151]">{s.staffName}</p>
                    <p className="text-xs text-[#64748b]">{s.shift}</p>
                    {s.jobAddress && <p className="text-xs text-[#94a3b8]">{s.jobAddress}</p>}
                  </div>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  );
}

export default ScheduleView;