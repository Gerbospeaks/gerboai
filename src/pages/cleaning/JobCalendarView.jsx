import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Plus, Sparkles, Clock, MapPin, User } from "lucide-react";
import { db } from "../../firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";

const STATUS_COLORS = {
  scheduled:    "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
  "in-progress":"bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
  completed:    "bg-[#dcfce7] text-[#166534] border-[#86efac]",
  cancelled:    "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]",
  pending:      "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function JobCalendarView({ user, businessInfo }) {
  const [jobs, setJobs] = useState([]);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState("month"); // "month" | "week"

  useEffect(() => { loadJobs(); }, [user]);

  const loadJobs = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "users", user.uid, "jobs"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const getJobsForDate = (dateStr) => jobs.filter(j => j.date === dateStr);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedJobs = selectedDay ? getJobsForDate(formatDate(year, month, selectedDay)) : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0891b2]" /> Job Calendar
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">{jobs.length} jobs scheduled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <button onClick={prevMonth} className="p-1.5 hover:bg-[#e2e8f0] rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4 text-[#64748b]" />
            </button>
            <h2 className="text-base font-semibold text-[#1e293b]">{MONTHS[month]} {year}</h2>
            <button onClick={nextMonth} className="p-1.5 hover:bg-[#e2e8f0] rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4 text-[#64748b]" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-[#f1f5f9] bg-[#fafafa]" />;
              const dateStr = formatDate(year, month, day);
              const dayJobs = getJobsForDate(dateStr);
              const selected = selectedDay === day;
              return (
                <div key={day} onClick={() => setSelectedDay(selected ? null : day)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-[#f1f5f9] cursor-pointer transition-colors
                    ${selected ? "bg-[#ecfeff]" : "hover:bg-[#f8fafc]"}
                    ${isToday(day) ? "ring-2 ring-inset ring-[#0891b2]" : ""}`}>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1
                    ${isToday(day) ? "bg-[#0891b2] text-white" : "text-[#374151]"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayJobs.slice(0, 2).map(job => (
                      <div key={job.id} className={`text-[10px] px-1 py-0.5 rounded truncate border ${STATUS_COLORS[job.status] || STATUS_COLORS.pending}`}>
                        {job.time && `${job.time} · `}{job.clientName}
                      </div>
                    ))}
                    {dayJobs.length > 2 && (
                      <div className="text-[10px] text-[#94a3b8] pl-1">+{dayJobs.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h3 className="text-sm font-semibold text-[#374151]">
              {selectedDay ? `${MONTHS[month]} ${selectedDay}` : "Select a day"}
            </h3>
            <p className="text-xs text-[#94a3b8] mt-0.5">{selectedJobs.length} job{selectedJobs.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
            {!selectedDay ? (
              <p className="text-sm text-[#94a3b8] text-center py-8">Click a day to view jobs</p>
            ) : selectedJobs.length === 0 ? (
              <p className="text-sm text-[#94a3b8] text-center py-8">No jobs this day</p>
            ) : selectedJobs.map(job => (
              <div key={job.id} className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${STATUS_COLORS[job.status] || STATUS_COLORS.pending}`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#1e293b]">{job.clientName}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{job.serviceType}</p>
                {job.time && <p className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5"><Clock className="w-3 h-3" />{job.time}{job.duration && ` · ${job.duration}h`}</p>}
                {job.address && <p className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5"><MapPin className="w-3 h-3" />{job.address}</p>}
                {job.assignedStaff && <p className="flex items-center gap-1 text-xs text-[#64748b] mt-0.5"><User className="w-3 h-3" />{job.assignedStaff}</p>}
              </div>
            ))}
          </div>

          {/* Upcoming */}
          <div className="border-t border-[#e2e8f0] px-4 py-3">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Upcoming (7 days)</p>
            <div className="space-y-1.5">
              {jobs.filter(j => {
                if (!j.date) return false;
                const d = new Date(j.date); const now = new Date();
                const diff = (d - now) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 7 && j.status !== "cancelled";
              }).slice(0, 5).map(j => (
                <div key={j.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#0891b2] flex-shrink-0" />
                  <span className="text-[#374151] truncate">{j.clientName}</span>
                  <span className="text-[#94a3b8] ml-auto flex-shrink-0">{j.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}