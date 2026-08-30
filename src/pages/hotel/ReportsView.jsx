// pages/hotel/ReportsView.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BedDouble,
  Percent,
  Moon,
  Building2,
  Wallet,
  TrendingUp,
  CircleDollarSign,
  AlertCircle,
  Users,
  UserPlus,
  Repeat,
  Globe2,
  FileBarChart,
} from "lucide-react";

// ── Palette — matches the rest of the dashboard's KPI cards ────────────────
const C = {
  navy: "#0f1623",
  navyMid: "#1e2535",
  textMuted: "#64748b",
  border: "#e2e8f0",
  accent: "#c6f135",
  purple: "#6d28d9",
  purpleLight: "#ede9fe",
  blue: "#2563eb",
  blueLight: "#dbeafe",
  green: "#059669",
  greenLight: "#dcfce7",
  amber: "#d97706",
  amberLight: "#fef3c7",
  red: "#dc2626",
  redLight: "#fee2e2",
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toDate = (v) => {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const fmtR = (n) =>
  `R${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// last N months as [{key:"2026-01", label:"Jan"}]
const lastMonths = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTHS[d.getMonth()],
    });
  }
  return out;
};

// ── Shared bits ──────────────────────────────────────────────────────────
function Tabs({ active, setActiveView }) {
  const tabs = [
    { key: "report-occupancy", label: "Occupancy" },
    { key: "report-revenue", label: "Revenue" },
    { key: "report-guests", label: "Guests" },
  ];
  return (
    <div className="inline-flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setActiveView(t.key)}
          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
            active === t.key
              ? "bg-white text-[#0f1623] shadow-sm"
              : "text-[#64748b] hover:text-[#0f1623]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={16} color={iconColor} />
        </div>
      </div>
      <p className="text-xs font-medium text-[#64748b]">{label}</p>
      <p className="text-xl font-bold text-[#0f1623] mt-0.5">{value}</p>
      {sub && <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>}
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#0f1623]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileBarChart className="w-8 h-8 text-[#cbd5e1] mb-2" />
      <p className="text-sm text-[#94a3b8]">{text}</p>
    </div>
  );
}

const PIE_COLORS = [C.accent, C.blue, C.purple, C.amber, C.green, C.red];

// ── Occupancy ────────────────────────────────────────────────────────────
function OccupancyReport({ savedInvoices }) {
  const data = useMemo(() => {
    const bookings = savedInvoices.filter((i) => i.booking?.checkInDate);
    const totalBookings = bookings.length;

    const nights = bookings
      .map((b) => Number(b.booking?.numberOfNights) || 0)
      .filter((n) => n > 0);
    const avgNights = nights.length
      ? (nights.reduce((a, b) => a + b, 0) / nights.length).toFixed(1)
      : "0";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentGuests = bookings.filter((b) => {
      const ci = toDate(b.booking?.checkInDate);
      const co = toDate(b.booking?.checkOutDate);
      return ci && co && ci <= today && co >= today;
    }).length;

    const upcomingCheckouts = bookings.filter((b) => {
      const co = toDate(b.booking?.checkOutDate);
      if (!co) return false;
      const diffDays = (co - today) / 86400000;
      return diffDays >= 0 && diffDays <= 2;
    }).length;

    // room type breakdown
    const typeCounts = {};
    bookings.forEach((b) => {
      const t = b.booking?.roomType || "Unspecified";
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    const roomTypeData = Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // bookings per month, last 6 months
    const months = lastMonths(6);
    const byMonth = Object.fromEntries(months.map((m) => [m.key, 0]));
    bookings.forEach((b) => {
      const d = toDate(b.booking?.checkInDate);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in byMonth) byMonth[key] += 1;
    });
    const monthlyData = months.map((m) => ({
      label: m.label,
      bookings: byMonth[m.key],
    }));

    return {
      totalBookings,
      avgNights,
      currentGuests,
      upcomingCheckouts,
      roomTypeData,
      monthlyData,
    };
  }, [savedInvoices]);

  if (!savedInvoices.length) {
    return (
      <EmptyState text="No bookings yet — occupancy stats will appear once you save invoices." />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BedDouble}
          label="Total Bookings"
          value={data.totalBookings}
          iconBg={C.blueLight}
          iconColor={C.blue}
        />
        <StatCard
          icon={Users}
          label="Guests In-House"
          value={data.currentGuests}
          sub="Checked in now"
          iconBg={C.greenLight}
          iconColor={C.green}
        />
        <StatCard
          icon={Moon}
          label="Avg. Stay Length"
          value={`${data.avgNights} nights`}
          iconBg={C.purpleLight}
          iconColor={C.purple}
        />
        <StatCard
          icon={AlertCircle}
          label="Checking Out Soon"
          value={data.upcomingCheckouts}
          sub="Next 48 hours"
          iconBg={C.amberLight}
          iconColor={C.amber}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="Bookings — last 6 months">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="bookings" fill={C.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <Panel title="Room type mix">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.roomTypeData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
              >
                {data.roomTypeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.roomTypeData.slice(0, 5).map((r, i) => (
              <div
                key={r.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1.5 text-[#374151] truncate">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {r.name}
                </span>
                <span className="font-semibold text-[#0f1623] flex-shrink-0 ml-2">
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ── Revenue ──────────────────────────────────────────────────────────────
function RevenueReport({ savedInvoices }) {
  const data = useMemo(() => {
    const total = savedInvoices.reduce((s, i) => s + (i.totals?.total || 0), 0);
    const paid = savedInvoices.reduce((s, i) => s + (i.totals?.paid || 0), 0);
    const outstanding = Math.max(total - paid, 0);

    const statusCounts = { paid: 0, partially_paid: 0, pending: 0 };
    savedInvoices.forEach((i) => {
      const s = i.status || "pending";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const statusData = [
      { name: "Paid", value: statusCounts.paid, color: C.green },
      { name: "Partial", value: statusCounts.partially_paid, color: C.amber },
      { name: "Pending", value: statusCounts.pending, color: C.red },
    ].filter((s) => s.value > 0);

    const months = lastMonths(6);
    const byMonth = Object.fromEntries(months.map((m) => [m.key, 0]));
    savedInvoices.forEach((i) => {
      const d = toDate(i.dates?.invoiceDate) || toDate(i.createdAt);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in byMonth) byMonth[key] += i.totals?.total || 0;
    });
    const monthlyData = months.map((m) => ({
      label: m.label,
      revenue: Math.round(byMonth[m.key]),
    }));

    const topGuests = Object.values(
      savedInvoices.reduce((acc, i) => {
        const name = i.guest?.name || "Unknown";
        acc[name] = acc[name] || { name, total: 0 };
        acc[name].total += i.totals?.total || 0;
        return acc;
      }, {}),
    )
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { total, paid, outstanding, statusData, monthlyData, topGuests };
  }, [savedInvoices]);

  if (!savedInvoices.length) {
    return (
      <EmptyState text="No invoices yet — revenue stats will appear once you save invoices." />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CircleDollarSign}
          label="Total Invoiced"
          value={fmtR(data.total)}
          iconBg={C.purpleLight}
          iconColor={C.purple}
        />
        <StatCard
          icon={Wallet}
          label="Collected"
          value={fmtR(data.paid)}
          iconBg={C.greenLight}
          iconColor={C.green}
        />
        <StatCard
          icon={AlertCircle}
          label="Outstanding"
          value={fmtR(data.outstanding)}
          iconBg={C.redLight}
          iconColor={C.red}
        />
        <StatCard
          icon={TrendingUp}
          label="Invoices"
          value={savedInvoices.length}
          sub="All time"
          iconBg={C.blueLight}
          iconColor={C.blue}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="Revenue — last 6 months">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R${v}`}
                />
                <Tooltip formatter={(v) => fmtR(v)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={C.navy}
                  strokeWidth={2.5}
                  dot={{ fill: C.accent, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <Panel title="Payment status">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
              >
                {data.statusData.map((s, i) => (
                  <Cell key={i} fill={s.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.statusData.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1.5 text-[#374151]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.name}
                </span>
                <span className="font-semibold text-[#0f1623]">{s.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Top guests by spend">
        {data.topGuests.length === 0 ? (
          <EmptyState text="No guest spend data yet." />
        ) : (
          <div className="space-y-2">
            {data.topGuests.map((g, i) => (
              <div
                key={g.name}
                className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#f1f5f9] text-[#64748b] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#374151]">{g.name}</span>
                </div>
                <span className="text-sm font-semibold text-[#0f1623]">
                  {fmtR(g.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ── Guests ───────────────────────────────────────────────────────────────
function GuestReport({ savedGuests, savedInvoices }) {
  const data = useMemo(() => {
    const total = savedGuests.length;

    const now = new Date();
    const newThisMonth = savedGuests.filter((g) => {
      const d = toDate(g.createdAt);
      return (
        d &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }).length;

    const nationalityCounts = {};
    savedGuests.forEach((g) => {
      const n = g.nationality || "Unspecified";
      nationalityCounts[n] = (nationalityCounts[n] || 0) + 1;
    });
    const nationalityData = Object.entries(nationalityCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const stayCounts = {};
    savedInvoices.forEach((i) => {
      const name = i.guest?.name;
      if (!name) return;
      stayCounts[name] = (stayCounts[name] || 0) + 1;
    });
    const repeatGuests = Object.entries(stayCounts)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
    const repeatCount = repeatGuests.length;
    const topRepeat = repeatGuests
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return { total, newThisMonth, nationalityData, repeatCount, topRepeat };
  }, [savedGuests, savedInvoices]);

  if (!savedGuests.length) {
    return (
      <EmptyState text="No guests yet — add a guest to start seeing stats here." />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Guests"
          value={data.total}
          iconBg={C.blueLight}
          iconColor={C.blue}
        />
        <StatCard
          icon={UserPlus}
          label="New This Month"
          value={data.newThisMonth}
          iconBg={C.greenLight}
          iconColor={C.green}
        />
        <StatCard
          icon={Repeat}
          label="Repeat Guests"
          value={data.repeatCount}
          sub="2+ stays"
          iconBg={C.purpleLight}
          iconColor={C.purple}
        />
        <StatCard
          icon={Globe2}
          label="Countries"
          value={data.nationalityData.length}
          iconBg={C.amberLight}
          iconColor={C.amber}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Guests by nationality">
          {data.nationalityData.length === 0 ? (
            <EmptyState text="No nationality data recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data.nationalityData}
                layout="vertical"
                margin={{ left: 12 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" fill={C.blue} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Most frequent guests">
          {data.topRepeat.length === 0 ? (
            <EmptyState text="No repeat guests yet." />
          ) : (
            <div className="space-y-2">
              {data.topRepeat.map((g, i) => (
                <div
                  key={g.name}
                  className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#f1f5f9] text-[#64748b] text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-[#374151]">{g.name}</span>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: C.purpleLight, color: C.purple }}
                  >
                    {g.count} stays
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ── Root component ───────────────────────────────────────────────────────
export default function ReportsView({
  activeView,
  setActiveView,
  savedInvoices = [],
  savedGuests = [],
}) {
  const tab = ["report-occupancy", "report-revenue", "report-guests"].includes(
    activeView,
  )
    ? activeView
    : "report-occupancy";

  const titles = {
    "report-occupancy": [
      "Occupancy Report",
      "Room and stay activity across your property",
    ],
    "report-revenue": ["Revenue Report", "Invoicing and payment performance"],
    "report-guests": ["Guest Report", "Who's staying, and how often"],
  };
  const [title, subtitle] = titles[tab];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#0f1623]">{title}</h1>
          <p className="text-sm text-[#64748b] mt-0.5">{subtitle}</p>
        </div>
        <Tabs active={tab} setActiveView={setActiveView} />
      </div>

      {tab === "report-occupancy" && (
        <OccupancyReport savedInvoices={savedInvoices} />
      )}
      {tab === "report-revenue" && (
        <RevenueReport savedInvoices={savedInvoices} />
      )}
      {tab === "report-guests" && (
        <GuestReport savedGuests={savedGuests} savedInvoices={savedInvoices} />
      )}
    </div>
  );
}
