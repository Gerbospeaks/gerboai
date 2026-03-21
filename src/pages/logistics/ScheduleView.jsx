import React, { useState } from "react";
import { Calendar, Clock, Truck, Plus, ChevronLeft, ChevronRight, MapPin, User, Package } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY_IDX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

const SCHEDULE = {
  0: [
    { id: 1, time: "06:00", duration: 2, type: "pickup", label: "Pickup – FreshMart", location: "Johannesburg", driver: "Bongani Zulu", color: "bg-[#dbeafe] border-[#bfdbfe] text-[#1e40af]" },
    { id: 2, time: "09:30", duration: 1, type: "delivery", label: "Delivery – Acme Corp", location: "Midrand", driver: "Sipho Ndlovu", color: "bg-[#dcfce7] border-[#bbf7d0] text-[#166534]" },
    { id: 3, time: "14:00", duration: 3, type: "transit", label: "Transit JHB → Cape Town", location: "N1 South", driver: "Bongani Zulu", color: "bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]" },
  ],
  1: [
    { id: 4, time: "07:00", duration: 1.5, type: "pickup", label: "Pickup – StyleCo", location: "Sandton", driver: "Lerato Mokoena", color: "bg-[#dbeafe] border-[#bfdbfe] text-[#1e40af]" },
    { id: 5, time: "11:00", duration: 2, type: "maintenance", label: "Scheduled service – V003", location: "Depot Wynberg", driver: "—", color: "bg-[#fef3c7] border-[#fde68a] text-[#92400e]" },
  ],
  2: [
    { id: 6, time: "08:30", duration: 6, type: "transit", label: "Transit PTA → Durban", location: "N3 East", driver: "Thabo Dlamini", color: "bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]" },
  ],
  3: [
    { id: 7, time: "06:30", duration: 1, type: "pickup", label: "Pickup – AutoWorld", location: "Pretoria", driver: "Sipho Ndlovu", color: "bg-[#dbeafe] border-[#bfdbfe] text-[#1e40af]" },
    { id: 8, time: "10:00", duration: 2, type: "delivery", label: "Delivery – CleanInc", location: "Germiston", driver: "Lerato Mokoena", color: "bg-[#dcfce7] border-[#bbf7d0] text-[#166534]" },
  ],
  4: [
    { id: 9, time: "07:00", duration: 8, type: "transit", label: "Transit JHB → East London", location: "N10 East", driver: "Bongani Zulu", color: "bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]" },
    { id: 10, time: "09:00", duration: 1, type: "delivery", label: "Delivery – MegaFurn", location: "Johannesburg CBD", driver: "Thabo Dlamini", color: "bg-[#dcfce7] border-[#bbf7d0] text-[#166534]" },
  ],
  5: [],
  6: [],
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 6); // 06:00 to 18:00

const timeToY = (time) => {
  const [h, m] = time.split(":").map(Number);
  return ((h - 6) + m / 60) * 48;
};

export default function ScheduleView() {
  const [dayIdx, setDayIdx] = useState(TODAY_IDX);
  const events = SCHEDULE[dayIdx] || [];

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Schedule</h1>
          <p className="text-xs text-[#64748b] mt-0.5">Week view · {new Date().toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Add Event
        </button>
      </div>

      {/* Day selector */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-2 flex gap-1">
        {DAYS.map((day, i) => {
          const isToday = i === TODAY_IDX;
          const isSelected = i === dayIdx;
          const count = (SCHEDULE[i] || []).length;
          return (
            <button
              key={day}
              onClick={() => setDayIdx(i)}
              className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-lg transition-all ${
                isSelected ? "bg-[#ea580c] text-white" : isToday ? "bg-[#fff7ed] text-[#ea580c]" : "text-[#64748b] hover:bg-[#f8fafc]"
              }`}
            >
              <span className="text-xs font-medium mb-1">{day}</span>
              <span className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>{i + 16}</span>
              {count > 0 && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-[#ea580c]"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs">
        {[
          { label: "Pickup", color: "bg-[#dbeafe]" },
          { label: "Delivery", color: "bg-[#dcfce7]" },
          { label: "Transit", color: "bg-[#fff7ed]" },
          { label: "Maintenance", color: "bg-[#fef3c7]" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-[#64748b]">{label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
        <div className="flex">
          {/* Hour labels */}
          <div className="w-14 flex-shrink-0 border-r border-[#e2e8f0]">
            {HOURS.map((h) => (
              <div key={h} className="h-12 flex items-start justify-end pr-2 pt-1">
                <span className="text-xs text-[#94a3b8]">{String(h).padStart(2, "0")}:00</span>
              </div>
            ))}
          </div>

          {/* Event area */}
          <div className="flex-1 relative" style={{ height: `${HOURS.length * 48}px` }}>
            {/* Hour grid lines */}
            {HOURS.map((_, i) => (
              <div key={i} className="absolute w-full border-b border-[#f1f5f9]" style={{ top: `${i * 48}px` }} />
            ))}

            {events.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
                  <p className="text-sm text-[#94a3b8]">No events scheduled for {DAYS[dayIdx]}</p>
                </div>
              </div>
            ) : (
              events.map((ev) => {
                const top = timeToY(ev.time);
                const height = Math.max(ev.duration * 48, 40);
                return (
                  <div
                    key={ev.id}
                    className={`absolute left-2 right-2 rounded-lg border p-2 cursor-pointer hover:opacity-90 transition-all ${ev.color}`}
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <p className="text-xs font-bold truncate">{ev.label}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs opacity-80">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{ev.time}</span>
                      <span className="flex items-center gap-0.5 truncate"><MapPin className="w-2.5 h-2.5" />{ev.location}</span>
                    </div>
                    {height > 60 && (
                      <p className="text-xs mt-1 opacity-70 flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5" />{ev.driver}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}