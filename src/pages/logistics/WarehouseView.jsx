import React, { useState } from "react";
import {
  Warehouse, Package, Plus, Search, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, CheckCircle, Clock, Box, BarChart2, Filter, Layers,
} from "lucide-react";

const MOCK_CARGO = [
  { id: "CGO-001", description: "Electronics – Laptops x20", weight: "240 kg", bay: "A-03", status: "ready", client: "Acme Corp", waybill: "WB-2026-0892", arrival: "2026-03-18", departure: "2026-03-22", type: "outbound" },
  { id: "CGO-002", description: "Furniture – Office Chairs x50", weight: "1,200 kg", bay: "B-11", status: "stored", client: "MegaFurn", waybill: "WB-2026-0887", arrival: "2026-03-15", departure: "TBD", type: "inbound" },
  { id: "CGO-003", description: "Perishables – Dairy x180 units", weight: "320 kg", bay: "C-01 (Cold)", status: "urgent", client: "FreshMart", waybill: "WB-2026-0901", arrival: "2026-03-20", departure: "2026-03-21", type: "outbound" },
  { id: "CGO-004", description: "Chemicals – Industrial Cleaner", weight: "800 kg", bay: "D-05 (Haz)", status: "stored", client: "CleanInc", waybill: "WB-2026-0876", arrival: "2026-03-10", departure: "2026-03-25", type: "inbound" },
  { id: "CGO-005", description: "Clothing – Retail Stock x600", weight: "950 kg", bay: "A-08", status: "ready", client: "StyleCo", waybill: "WB-2026-0910", arrival: "2026-03-21", departure: "2026-03-23", type: "outbound" },
  { id: "CGO-006", description: "Auto Parts – Brake Kits x80", weight: "560 kg", bay: "B-02", status: "pending", client: "AutoWorld", waybill: "WB-2026-0855", arrival: "2026-03-19", departure: "2026-03-22", type: "inbound" },
];

const BAYS = [
  { id: "A-01", status: "empty" }, { id: "A-02", status: "empty" }, { id: "A-03", status: "occupied" }, { id: "A-04", status: "empty" },
  { id: "A-05", status: "reserved" }, { id: "A-06", status: "empty" }, { id: "A-07", status: "occupied" }, { id: "A-08", status: "occupied" },
  { id: "B-01", status: "empty" }, { id: "B-02", status: "occupied" }, { id: "B-03", status: "empty" }, { id: "B-04", status: "reserved" },
  { id: "B-05", status: "empty" }, { id: "B-06", status: "empty" }, { id: "B-07", status: "occupied" }, { id: "B-08", status: "empty" },
  { id: "B-09", status: "empty" }, { id: "B-10", status: "reserved" }, { id: "B-11", status: "occupied" }, { id: "B-12", status: "empty" },
  { id: "C-01", status: "cold" }, { id: "C-02", status: "cold" }, { id: "C-03", status: "cold-empty" },
  { id: "D-01", status: "haz-empty" }, { id: "D-02", status: "haz-empty" }, { id: "D-03", status: "haz" }, { id: "D-04", status: "haz-empty" }, { id: "D-05", status: "haz" },
];

const bayColors = {
  empty: "bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8]",
  occupied: "bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]",
  reserved: "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8]",
  cold: "bg-[#ecfeff] border-[#a5f3fc] text-[#0e7490]",
  "cold-empty": "bg-[#f0fdfa] border-[#99f6e4] text-[#0d9488]",
  haz: "bg-[#fef3c7] border-[#fcd34d] text-[#b45309]",
  "haz-empty": "bg-[#fffbeb] border-[#fde68a] text-[#d97706]",
};

const statusCfg = {
  ready: { label: "Ready", bg: "bg-[#dcfce7]", text: "text-[#166534]" },
  stored: { label: "Stored", bg: "bg-[#f1f5f9]", text: "text-[#475569]" },
  urgent: { label: "Urgent", bg: "bg-[#fef2f2]", text: "text-[#991b1b]" },
  pending: { label: "Pending", bg: "bg-[#fef3c7]", text: "text-[#92400e]" },
};

export default function WarehouseView() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("cargo");

  const filtered = MOCK_CARGO.filter(
    (c) =>
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.client.toLowerCase().includes(search.toLowerCase()) ||
      c.bay.toLowerCase().includes(search.toLowerCase())
  );

  const occupied = BAYS.filter((b) => b.status === "occupied" || b.status === "cold" || b.status === "haz").length;
  const capacity = BAYS.length;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Warehouse & Cargo</h1>
          <p className="text-xs text-[#64748b] mt-0.5">{occupied}/{capacity} bays occupied</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Log Cargo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total cargo items", value: MOCK_CARGO.length, icon: Package, bg: "bg-[#fff7ed]", color: "text-[#ea580c]" },
          { label: "Outbound today", value: MOCK_CARGO.filter(c => c.type === "outbound").length, icon: ArrowUpRight, bg: "bg-[#f0fdf4]", color: "text-[#16a34a]" },
          { label: "Inbound", value: MOCK_CARGO.filter(c => c.type === "inbound").length, icon: ArrowDownLeft, bg: "bg-[#eff6ff]", color: "text-[#2563eb]" },
          { label: "Urgent releases", value: MOCK_CARGO.filter(c => c.status === "urgent").length, icon: AlertTriangle, bg: "bg-[#fef2f2]", color: "text-[#dc2626]" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e2e8f0]">
        {[{ id: "cargo", label: "Cargo List" }, { id: "map", label: "Bay Map" }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${tab === id ? "border-[#ea580c] text-[#ea580c]" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "cargo" && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c]"
              placeholder="Search cargo, client, or bay…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-xs text-[#64748b] uppercase tracking-wide">
                  {["ID", "Description", "Bay", "Client", "Waybill", "Departure", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const sc = statusCfg[c.status];
                  return (
                    <tr key={c.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#ea580c] font-bold">{c.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1e293b] text-xs">{c.description}</p>
                        <p className="text-[#94a3b8] text-xs">{c.weight} · {c.type === "outbound" ? <span className="text-[#16a34a]">↑ Out</span> : <span className="text-[#2563eb]">↓ In</span>}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#374151]">{c.bay}</td>
                      <td className="px-4 py-3 text-xs text-[#374151]">{c.client}</td>
                      <td className="px-4 py-3 text-xs text-[#ea580c] font-mono">{c.waybill}</td>
                      <td className="px-4 py-3 text-xs text-[#374151]">{c.departure}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "map" && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            {[
              { color: "bg-[#f8fafc] border-[#e2e8f0]", label: "Empty" },
              { color: "bg-[#fff7ed] border-[#fed7aa]", label: "Occupied" },
              { color: "bg-[#eff6ff] border-[#bfdbfe]", label: "Reserved" },
              { color: "bg-[#ecfeff] border-[#a5f3fc]", label: "Cold storage" },
              { color: "bg-[#fef3c7] border-[#fcd34d]", label: "Hazardous" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded border ${color}`} />
                <span className="text-[#64748b]">{label}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
            {BAYS.map((bay) => (
              <div key={bay.id} className={`h-12 rounded-lg border flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 transition-all ${bayColors[bay.status]}`}>
                {bay.id}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94a3b8] mt-3 text-center">{occupied} of {capacity} bays in use ({Math.round((occupied / capacity) * 100)}% capacity)</p>
        </div>
      )}
    </div>
  );
}