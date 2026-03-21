import React, { useState } from "react";
import {
  Navigation,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Package,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const MOCK_SHIPMENTS = [
  {
    id: "WB-2026-0901",
    sender: "FreshMart JHB",
    receiver: "FreshMart CPT",
    origin: "Johannesburg",
    destination: "Cape Town",
    currentLocation: "Bloemfontein, FS",
    driver: "Bongani Zulu",
    vehicle: "GP 567-890",
    status: "in_transit",
    eta: "Today, 18:30",
    progress: 65,
    lastUpdate: "14:22",
    events: [
      { time: "06:00", note: "Departed Johannesburg depot", done: true },
      { time: "09:45", note: "Arrived Vereeniging checkpoint", done: true },
      { time: "13:15", note: "Passed Bloemfontein weighbridge", done: true },
      { time: "16:00", note: "Estimated arrival Colesburg", done: false },
      { time: "18:30", note: "Estimated arrival Cape Town", done: false },
    ],
  },
  {
    id: "WB-2026-0898",
    sender: "AutoWorld PTA",
    receiver: "AutoWorld DBN",
    origin: "Pretoria",
    destination: "Durban",
    currentLocation: "Harrismith, KZN",
    driver: "Thabo Dlamini",
    vehicle: "GP 789-012",
    status: "delayed",
    eta: "Tomorrow, 08:00",
    progress: 48,
    lastUpdate: "13:55",
    events: [
      { time: "05:00", note: "Departed Pretoria", done: true },
      { time: "10:30", note: "Arrived Johannesburg", done: true },
      {
        time: "13:45",
        note: "Delayed — tyre change at Harrismith",
        done: true,
      },
      { time: "16:30", note: "Estimated resume travel", done: false },
      { time: "08:00+1", note: "Estimated arrival Durban", done: false },
    ],
  },
  {
    id: "WB-2026-0895",
    sender: "StyleCo SBD",
    receiver: "StyleCo EL",
    origin: "Sandton",
    destination: "East London",
    currentLocation: "Delivered",
    driver: "Sipho Ndlovu",
    vehicle: "GP 123-456",
    status: "delivered",
    eta: "Delivered",
    progress: 100,
    lastUpdate: "11:30",
    events: [
      { time: "05:30", note: "Departed Sandton", done: true },
      { time: "11:30", note: "Delivered — POD signed", done: true },
    ],
  },
];

const statusCfg = {
  in_transit: {
    label: "In Transit",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#3b82f6] animate-pulse",
  },
  delayed: {
    label: "Delayed",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#ef4444]",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#22c55e]",
  },
};

export default function TrackingView() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(MOCK_SHIPMENTS[0]);

  const filtered = MOCK_SHIPMENTS.filter(
    (s) =>
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.sender.toLowerCase().includes(search.toLowerCase()) ||
      s.receiver.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-[#e2e8f0] flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">
            Live Shipment Tracking
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            {MOCK_SHIPMENTS.filter((s) => s.status === "in_transit").length} in
            transit ·{" "}
            {MOCK_SHIPMENTS.filter((s) => s.status === "delayed").length}{" "}
            delayed
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f8fafc] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* List */}
        <div className="w-full md:w-80 flex-shrink-0 overflow-y-auto border-r border-[#e2e8f0] bg-[#f8fafc]">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                className="w-full pl-8 pr-3 py-2 text-xs border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none"
                placeholder="Search waybill or client…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {filtered.map((s) => {
            const sc = statusCfg[s.status];
            return (
              <div
                key={s.id}
                onClick={() => setSelected(s)}
                className={`p-4 border-b border-[#e2e8f0] cursor-pointer transition-all ${selected?.id === s.id ? "bg-white border-l-2 border-l-[#ea580c]" : "hover:bg-white"}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-[#ea580c]">
                    {s.id}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#1e293b] mb-0.5">
                  {s.origin} → {s.destination}
                </p>
                <p className="text-xs text-[#64748b] mb-2">
                  {s.currentLocation}
                </p>
                {s.status !== "delivered" && (
                  <div className="h-1.5 bg-[#e2e8f0] rounded-full">
                    <div
                      className={`h-full rounded-full ${s.status === "delayed" ? "bg-[#ef4444]" : "bg-[#3b82f6]"}`}
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Map placeholder */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-[#dbeafe] to-[#ede9fe] flex items-center justify-center relative">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                {/* Route line */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M10,50 Q35,20 65,55 Q80,65 90,50"
                    stroke="#3b82f6"
                    strokeWidth="0.8"
                    fill="none"
                    strokeDasharray="3 2"
                    opacity="0.5"
                  />
                  <circle cx="10" cy="50" r="2" fill="#3b82f6" />
                  <circle cx="90" cy="50" r="2" fill="#3b82f6" />
                  <circle
                    cx={10 + (selected.progress / 100) * 80}
                    cy={50 + Math.sin(selected.progress / 30) * 8}
                    r="3"
                    fill="#ea580c"
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
                <div className="text-center z-10">
                  <Navigation className="w-8 h-8 text-[#3b82f6] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[#1e40af]">
                    Live tracking map
                  </p>
                  <p className="text-xs text-[#3b82f6]">
                    Connect Google Maps API for real-time GPS
                  </p>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#1e293b]">
                    {selected.origin} → {selected.destination}
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    {selected.sender} → {selected.receiver}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-lg ${statusCfg[selected.status].bg} ${statusCfg[selected.status].text}`}
                >
                  {statusCfg[selected.status].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <p className="text-[#64748b] mb-0.5">Current location</p>
                  <p className="font-semibold text-[#1e293b]">
                    {selected.currentLocation}
                  </p>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <p className="text-[#64748b] mb-0.5">ETA</p>
                  <p
                    className={`font-semibold ${selected.status === "delayed" ? "text-[#dc2626]" : "text-[#1e293b]"}`}
                  >
                    {selected.eta}
                  </p>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <p className="text-[#64748b] mb-0.5">Driver</p>
                  <p className="font-semibold text-[#1e293b]">
                    {selected.driver}
                  </p>
                </div>
                <div className="bg-[#f8fafc] rounded-lg p-2.5">
                  <p className="text-[#64748b] mb-0.5">Vehicle</p>
                  <p className="font-semibold text-[#1e293b]">
                    {selected.vehicle}
                  </p>
                </div>
              </div>
              {selected.status !== "delivered" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748b]">Journey progress</span>
                    <span className="font-bold text-[#1e293b]">
                      {selected.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#f1f5f9] rounded-full">
                    <div
                      className={`h-full rounded-full ${selected.status === "delayed" ? "bg-[#ef4444]" : "bg-[#3b82f6]"}`}
                      style={{ width: `${selected.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Event timeline */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
                Tracking events
              </h3>
              <div className="space-y-0">
                {selected.events.map((ev, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      {ev.done ? (
                        <CheckCircle className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-dashed border-[#cbd5e1] flex-shrink-0" />
                      )}
                      {i < selected.events.length - 1 && (
                        <div
                          className={`w-0.5 h-5 my-0.5 ${ev.done ? "bg-[#bbf7d0]" : "bg-[#e2e8f0]"}`}
                        />
                      )}
                    </div>
                    <div className="pb-3">
                      <p
                        className={`text-xs font-mono mb-0.5 ${ev.done ? "text-[#64748b]" : "text-[#94a3b8]"}`}
                      >
                        {ev.time}
                      </p>
                      <p
                        className={`text-sm ${ev.done ? "text-[#374151]" : "text-[#94a3b8]"}`}
                      >
                        {ev.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
