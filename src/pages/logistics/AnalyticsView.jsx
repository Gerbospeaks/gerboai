import React, { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Truck,
  Users,
  FileText,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const MONTHLY = [
  { month: "Oct", waybills: 38, delivered: 35, revenue: 42000, onTime: 92 },
  { month: "Nov", waybills: 45, delivered: 43, revenue: 53000, onTime: 95 },
  { month: "Dec", waybills: 52, delivered: 49, revenue: 68000, onTime: 94 },
  { month: "Jan", waybills: 41, delivered: 38, revenue: 48000, onTime: 91 },
  { month: "Feb", waybills: 48, delivered: 46, revenue: 57000, onTime: 95 },
  { month: "Mar", waybills: 56, delivered: 53, revenue: 74000, onTime: 96 },
];

const TOP_ROUTES = [
  { route: "Johannesburg → Cape Town", count: 42, revenue: 128000 },
  { route: "Pretoria → Durban", count: 35, revenue: 87000 },
  { route: "Sandton → East London", count: 28, revenue: 76000 },
  { route: "Johannesburg → Port Elizabeth", count: 21, revenue: 61000 },
  { route: "Local Gauteng loop", count: 89, revenue: 44000 },
];

const maxWaybills = Math.max(...MONTHLY.map((m) => m.waybills));
const maxRevenue = Math.max(...MONTHLY.map((m) => m.revenue));

export default function AnalyticsView() {
  const [period, setPeriod] = useState("6m");

  const current = MONTHLY[MONTHLY.length - 1];
  const previous = MONTHLY[MONTHLY.length - 2];
  const revChange = (
    ((current.revenue - previous.revenue) / previous.revenue) *
    100
  ).toFixed(1);
  const waybillChange = (
    ((current.waybills - previous.waybills) / previous.waybills) *
    100
  ).toFixed(1);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">
            Analytics & Reports
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Performance overview · Last 6 months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#e2e8f0] overflow-hidden text-xs font-medium">
            {["1m", "3m", "6m", "1y"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 transition-colors ${period === p ? "bg-[#ea580c] text-white" : "bg-white text-[#64748b] hover:bg-[#f8fafc]"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f8fafc] transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Revenue (Mar)",
            value: `R${(current.revenue / 1000).toFixed(0)}k`,
            change: `+${revChange}%`,
            up: true,
            icon: TrendingUp,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
          {
            label: "Waybills (Mar)",
            value: current.waybills,
            change: `+${waybillChange}%`,
            up: true,
            icon: FileText,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "On-time rate",
            value: `${current.onTime}%`,
            change: "+1% vs Feb",
            up: true,
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#16a34a]",
          },
          {
            label: "Delivery failures",
            value: current.waybills - current.delivered,
            change: "-2 vs Feb",
            up: false,
            icon: AlertTriangle,
            bg: "bg-[#fef2f2]",
            color: "text-[#dc2626]",
          },
        ].map(({ label, value, change, up, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-[#16a34a]" : "text-[#dc2626]"}`}
              >
                {up ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {change}
              </span>
            </div>
            <p className="text-xl font-bold text-[#1e293b]">{value}</p>
            <p className="text-xs text-[#64748b]">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Waybills bar chart */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">
              Waybills per month
            </h3>
            <span className="text-xs text-[#94a3b8]">
              Dispatched vs Delivered
            </span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {MONTHLY.map((m) => (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-0.5"
              >
                <div className="w-full flex items-end gap-0.5 h-28">
                  <div
                    className="flex-1 rounded-t bg-[#fed7aa] transition-all"
                    style={{ height: `${(m.waybills / maxWaybills) * 100}%` }}
                    title={`Dispatched: ${m.waybills}`}
                  />
                  <div
                    className="flex-1 rounded-t bg-[#ea580c] transition-all"
                    style={{ height: `${(m.delivered / maxWaybills) * 100}%` }}
                    title={`Delivered: ${m.delivered}`}
                  />
                </div>
                <span className="text-xs text-[#94a3b8]">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#fed7aa]" />
              Dispatched
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#ea580c]" />
              Delivered
            </div>
          </div>
        </div>

        {/* Revenue line chart (SVG) */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b]">
              Revenue trend
            </h3>
            <span className="text-xs text-[#94a3b8]">USD</span>
          </div>
          <svg viewBox="0 0 300 120" className="w-full h-36">
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid */}
            {[0, 30, 60, 90].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="300"
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}
            {/* Area fill */}
            <path
              d={`M ${MONTHLY.map((m, i) => `${(i / (MONTHLY.length - 1)) * 280 + 10} ${100 - (m.revenue / maxRevenue) * 85}`).join(" L ")} L ${280 + 10} 100 L 10 100 Z`}
              fill="url(#revGrad)"
            />
            {/* Line */}
            <polyline
              fill="none"
              stroke="#ea580c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={MONTHLY.map(
                (m, i) =>
                  `${(i / (MONTHLY.length - 1)) * 280 + 10},${100 - (m.revenue / maxRevenue) * 85}`,
              ).join(" ")}
            />
            {/* Dots + labels */}
            {MONTHLY.map((m, i) => {
              const x = (i / (MONTHLY.length - 1)) * 280 + 10;
              const y = 100 - (m.revenue / maxRevenue) * 85;
              return (
                <g key={m.month}>
                  <circle cx={x} cy={y} r="3" fill="#ea580c" />
                  <text
                    x={x}
                    y={y - 7}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#94a3b8"
                  >{`R${(m.revenue / 1000).toFixed(0)}k`}</text>
                  <text
                    x={x}
                    y="115"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                  >
                    {m.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* On-time rate bars + Top routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* On-time */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            On-time delivery rate
          </h3>
          <div className="space-y-3">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-[#64748b] w-8">{m.month}</span>
                <div className="flex-1 h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${m.onTime >= 95 ? "bg-[#22c55e]" : m.onTime >= 90 ? "bg-[#f59e0b]" : "bg-[#ef4444]"}`}
                    style={{ width: `${m.onTime}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#1e293b] w-10 text-right">
                  {m.onTime}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top routes */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
            Top routes by volume
          </h3>
          <div className="space-y-3">
            {TOP_ROUTES.map((r, i) => (
              <div key={r.route} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#94a3b8] w-5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#374151] truncate">
                    {r.route}
                  </p>
                  <p className="text-xs text-[#94a3b8]">{r.count} trips</p>
                </div>
                <span className="text-xs font-bold text-[#1e293b]">
                  R{(r.revenue / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
