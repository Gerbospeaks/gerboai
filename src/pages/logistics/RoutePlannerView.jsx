import React, { useState } from "react";
import {
  Navigation,
  MapPin,
  Plus,
  Clock,
  Truck,
  ChevronRight,
  ArrowRight,
  X,
  CheckCircle,
  Circle,
  MoreVertical,
  Search,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const MOCK_ROUTES = [
  {
    id: "RT-001",
    name: "Pretoria → Cape Town",
    stops: [
      "Pretoria",
      "Johannesburg",
      "Bloemfontein",
      "Colesburg",
      "Cape Town",
    ],
    driver: "Bongani Zulu",
    vehicle: "GP 567-890",
    distance: "1430 km",
    eta: "14h 20m",
    status: "active",
    cargo: "General Freight",
    departureTime: "06:00",
    progress: 38,
  },
  {
    id: "RT-002",
    name: "Sandton → Durban",
    stops: ["Sandton", "Midrand", "Harrismith", "Durban"],
    driver: "Sipho Ndlovu",
    vehicle: "GP 123-456",
    distance: "580 km",
    eta: "6h 05m",
    status: "completed",
    cargo: "Perishables",
    departureTime: "08:30",
    progress: 100,
  },
  {
    id: "RT-003",
    name: "Wynberg Loop",
    stops: [
      "Depot Wynberg",
      "Randburg",
      "Roodepoort",
      "Soweto",
      "Depot Wynberg",
    ],
    driver: "Lerato Mokoena",
    vehicle: "GP 901-234",
    distance: "88 km",
    eta: "2h 10m",
    status: "scheduled",
    cargo: "Last-mile parcels",
    departureTime: "10:00",
    progress: 0,
  },
  {
    id: "RT-004",
    name: "JHB → East London",
    stops: ["Johannesburg", "Bethal", "Queenstown", "East London"],
    driver: "Thabo Dlamini",
    vehicle: "GP 789-012",
    distance: "960 km",
    eta: "9h 45m",
    status: "delayed",
    cargo: "Electronics",
    departureTime: "05:00",
    progress: 22,
  },
];

const statusConfig = {
  active: { label: "Active", bg: "bg-[#dbeafe]", text: "text-[#1e40af]" },
  completed: { label: "Completed", bg: "bg-[#dcfce7]", text: "text-[#166534]" },
  scheduled: { label: "Scheduled", bg: "bg-[#f1f5f9]", text: "text-[#475569]" },
  delayed: { label: "Delayed", bg: "bg-[#fef2f2]", text: "text-[#991b1b]" },
};

export default function RoutePlannerView() {
  const [selected, setSelected] = useState(MOCK_ROUTES[0]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-[#e2e8f0] flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Route Planner</h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            {MOCK_ROUTES.length} routes ·{" "}
            {MOCK_ROUTES.filter((r) => r.status === "active").length} active
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Plan Route
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex min-h-0">
        {/* Route list */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0 overflow-y-auto border-r border-[#e2e8f0] bg-[#f8fafc]">
          {MOCK_ROUTES.map((r) => {
            const sc = statusConfig[r.status];
            const isSelected = selected?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className={`p-4 border-b border-[#e2e8f0] cursor-pointer transition-all ${isSelected ? "bg-white border-l-2 border-l-[#ea580c]" : "hover:bg-white"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#ea580c] font-bold">
                    {r.id}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}
                  >
                    {sc.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#1e293b] mb-1">
                  {r.name}
                </p>
                <p className="text-xs text-[#64748b] mb-2">
                  {r.driver} · {r.vehicle}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {r.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {r.eta}
                  </span>
                </div>
                {r.status === "active" && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-[#64748b] mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{r.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[#e2e8f0] rounded-full">
                      <div
                        className="h-full bg-[#3b82f6] rounded-full"
                        style={{ width: `${r.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Route detail */}
        {selected && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Map placeholder */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <div className="h-52 bg-gradient-to-br from-[#e0f2fe] via-[#dbeafe] to-[#ede9fe] flex items-center justify-center relative">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 50%, #3b82f6 1px, transparent 1px), radial-gradient(circle at 70% 30%, #8b5cf6 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="text-center z-10">
                  <Navigation className="w-10 h-10 text-[#3b82f6] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#1e40af]">
                    Interactive map
                  </p>
                  <p className="text-xs text-[#3b82f6] mt-0.5">
                    Connect a maps API to enable live tracking
                  </p>
                </div>
                {/* Fake route dots */}
                {selected.stops.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2.5 h-2.5 rounded-full border-2 border-white bg-[#3b82f6]"
                    style={{
                      left: `${15 + (i * 70) / (selected.stops.length - 1)}%`,
                      top: `${30 + Math.sin(i) * 20}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Route info */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-[#1e293b]">
                    {selected.name}
                  </h2>
                  <p className="text-xs text-[#64748b]">{selected.cargo}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-lg ${statusConfig[selected.status].bg} ${statusConfig[selected.status].text}`}
                >
                  {statusConfig[selected.status].label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                {[
                  { label: "Distance", value: selected.distance },
                  { label: "ETA", value: selected.eta },
                  { label: "Departs", value: selected.departureTime },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f8fafc] rounded-lg p-2.5">
                    <p className="text-xs text-[#64748b] mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-[#1e293b]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 text-xs text-[#64748b]">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  {selected.vehicle}
                </span>
                <span>
                  Driver:{" "}
                  <span className="font-semibold text-[#1e293b]">
                    {selected.driver}
                  </span>
                </span>
              </div>
            </div>

            {/* Stops timeline */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
                Route stops
              </h3>
              <div className="space-y-0">
                {selected.stops.map((stop, i) => {
                  const isPast =
                    selected.status === "active" &&
                    (i / (selected.stops.length - 1)) * 100 < selected.progress;
                  const isCurrent =
                    selected.status === "active" &&
                    Math.abs(
                      (i / (selected.stops.length - 1)) * 100 -
                        selected.progress,
                    ) < 15;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        {isCurrent ? (
                          <div className="w-5 h-5 rounded-full bg-[#3b82f6] border-2 border-white ring-2 ring-[#3b82f6] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          </div>
                        ) : isPast ? (
                          <CheckCircle className="w-5 h-5 text-[#22c55e]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#cbd5e1]" />
                        )}
                        {i < selected.stops.length - 1 && (
                          <div
                            className={`w-0.5 h-6 mt-0.5 ${isPast ? "bg-[#22c55e]" : "bg-[#e2e8f0]"}`}
                          />
                        )}
                      </div>
                      <p
                        className={`text-sm py-1 ${isCurrent ? "font-bold text-[#1e40af]" : isPast ? "text-[#64748b] line-through" : "text-[#374151]"}`}
                      >
                        {stop}
                        {isCurrent && (
                          <span className="ml-2 text-xs text-[#3b82f6] font-normal">
                            ← current
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
