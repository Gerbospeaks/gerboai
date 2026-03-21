import React, { useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Fuel,
  Wrench,
  User,
  ChevronRight,
  Calendar,
  TrendingUp,
} from "lucide-react";

const MOCK_VEHICLES = [
  {
    id: "V001",
    plate: "GP 123-456",
    type: "7-Ton Truck",
    driver: "Sipho Ndlovu",
    phone: "082 111 2222",
    status: "active",
    fuel: 78,
    location: "Sandton, GP",
    nextService: "2026-04-15",
    trips: 142,
    load: "3.2t / 7t",
  },
  {
    id: "V002",
    plate: "GP 789-012",
    type: "3-Ton Van",
    driver: "Thabo Dlamini",
    phone: "083 333 4444",
    status: "in_transit",
    fuel: 45,
    location: "N1 North, Pretoria",
    nextService: "2026-03-28",
    trips: 89,
    load: "1.8t / 3t",
  },
  {
    id: "V003",
    plate: "GP 345-678",
    type: "10-Ton Truck",
    driver: "Unassigned",
    phone: "—",
    status: "maintenance",
    fuel: 20,
    location: "Depot, Wynberg",
    nextService: "In service",
    trips: 201,
    load: "— / 10t",
  },
  {
    id: "V004",
    plate: "GP 901-234",
    type: "1-Ton Bakkie",
    driver: "Lerato Mokoena",
    phone: "084 555 6666",
    status: "idle",
    fuel: 91,
    location: "Depot, Wynberg",
    nextService: "2026-05-10",
    trips: 63,
    load: "0t / 1t",
  },
  {
    id: "V005",
    plate: "GP 567-890",
    type: "7-Ton Truck",
    driver: "Bongani Zulu",
    phone: "071 777 8888",
    status: "active",
    fuel: 62,
    location: "Germiston, GP",
    nextService: "2026-04-02",
    trips: 177,
    load: "5.1t / 7t",
  },
];

const statusConfig = {
  active: {
    label: "Active",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#22c55e]",
  },
  in_transit: {
    label: "In Transit",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#3b82f6]",
  },
  idle: {
    label: "Idle",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
  maintenance: {
    label: "Maintenance",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#f59e0b]",
  },
};

export default function FleetView() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = MOCK_VEHICLES.filter((v) => {
    const matchSearch =
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.driver.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: MOCK_VEHICLES.length,
    active: MOCK_VEHICLES.filter((v) => v.status === "active").length,
    in_transit: MOCK_VEHICLES.filter((v) => v.status === "in_transit").length,
    idle: MOCK_VEHICLES.filter((v) => v.status === "idle").length,
    maintenance: MOCK_VEHICLES.filter((v) => v.status === "maintenance").length,
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Fleet Management</h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            {MOCK_VEHICLES.length} vehicles registered
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Vehicles",
            value: counts.all,
            icon: Truck,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
          {
            label: "Active / Transit",
            value: counts.active + counts.in_transit,
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#16a34a]",
          },
          {
            label: "Idle",
            value: counts.idle,
            icon: Clock,
            bg: "bg-[#f8fafc]",
            color: "text-[#64748b]",
          },
          {
            label: "In Maintenance",
            value: counts.maintenance,
            icon: Wrench,
            bg: "bg-[#fefce8]",
            color: "text-[#ca8a04]",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <div
              className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
            placeholder="Search by plate, driver, or vehicle type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", "active", "in_transit", "idle", "maintenance"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                filterStatus === s
                  ? "bg-[#ea580c] text-white border-[#ea580c]"
                  : "bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#ea580c] hover:text-[#ea580c]"
              }`}
            >
              {s === "all"
                ? "All"
                : s === "in_transit"
                  ? "In Transit"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 opacity-70">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map((v) => {
          const sc = statusConfig[v.status];
          const fuelColor =
            v.fuel > 50
              ? "bg-[#22c55e]"
              : v.fuel > 25
                ? "bg-[#f59e0b]"
                : "bg-[#ef4444]";
          return (
            <div
              key={v.id}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#cbd5e1] transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#fff7ed] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e293b]">
                      {v.plate}
                    </p>
                    <p className="text-xs text-[#64748b]">{v.type}</p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs mb-3">
                <div className="flex items-center gap-1.5 text-[#64748b]">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{v.driver}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#64748b]">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{v.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#64748b] col-span-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{v.location}</span>
                </div>
              </div>

              {/* Fuel bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1 text-[#64748b]">
                    <Fuel className="w-3 h-3" />
                    Fuel level
                  </span>
                  <span className="font-semibold text-[#1e293b]">
                    {v.fuel}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${fuelColor} rounded-full transition-all`}
                    style={{ width: `${v.fuel}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748b] pt-2 border-t border-[#f1f5f9]">
                <span>
                  <span className="font-semibold text-[#1e293b]">
                    {v.trips}
                  </span>{" "}
                  total trips
                </span>
                <span>
                  Load:{" "}
                  <span className="font-semibold text-[#1e293b]">{v.load}</span>
                </span>
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" /> Service:{" "}
                  <span className="font-semibold ml-0.5">{v.nextService}</span>
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 flex flex-col items-center text-center">
            <Truck className="w-10 h-10 text-[#cbd5e1] mb-3" />
            <p className="text-sm text-[#94a3b8]">
              No vehicles match your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
