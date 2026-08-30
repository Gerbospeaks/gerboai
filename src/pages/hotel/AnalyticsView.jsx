// pages/hotel/AnalyticsView.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Clock,
  CircleDollarSign,
  Receipt,
  Gauge,
  Users,
  UserPlus,
  Repeat,
  Trophy,
  BarChart3,
} from "lucide-react";

// ── Palette — matches ReportsView / dashboard KPI cards ─────────────────────
const C = {
  navy: "#0f1623",
  textMuted: "#64748b",
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

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const toDate = (v) => {
  if (!v) return null;
  if (typeof v?.toDate === "function") return v.toDate();
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

const fmtR = (n) =>
  `R${Number(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const lastMonths = (n) => {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()] });
  }
  return out;
};

const growthBadge = (pct) => {
  if (pct == null || !isFinite(pct)) return null;
  const up = pct >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
      style={{ background: up ? C.greenLight : C.redLight, color: up ? C.green : C.red }}
    >
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
};

// ── Shared bits ──────────────────────────────────────────────────────────
function Tabs({ active, setActiveView }) {
  const tabs = [
    { key: "analytics-bookings", label: "Booking Trends" },
    { key: "analytics-revenue", label: "Revenue Trends" },
    { key: "analytics-guests", label: "Guest Insights" },
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

function StatCard({ icon: Icon, label, value, sub, badge, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
          <Icon size={16} color={iconColor} />
        </div>
        {badge}
      </div>
      <p className="text-xs font-medium text-[#64748b]">{label}</p>
      <p className="text-xl font-bold text-[#0f1623] mt-0.5">{value}</p>
      {sub && <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
      <h3 className="text-sm font-semibold text-[#0f1623] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="w-8 h-8 text-[#cbd5e1] mb-2" />
      <p className="text-sm text-[#94a3b8]">{text}</p>
    </div>
  );
}

// ── Booking Trends ───────────────────────────────────────────────────────
function BookingTrends({ savedInvoices }) {
  const data = useMemo(() => {
    const bookings = savedInvoices.filter((i) => i.booking?.checkInDate);

    const months = lastMonths(12);
    const byMonth = Object.fromEntries(months.map((m) => [m.key, 0]));
    bookings.forEach((b) => {
      const d = toDate(b.booking?.checkInDate);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in byMonth) byMonth[key] += 1;
    });
    const monthlyData = months.map((m) => ({ label: m.label, bookings: byMonth[m.key] }));

    const last = monthlyData[monthlyData.length - 1]?.bookings || 0;
    const prev = monthlyData[monthlyData.length - 2]?.bookings || 0;
    const momGrowth = prev > 0 ? ((last - prev) / prev) * 100 : last > 0 ? 100 : 0;

    const total12mo = monthlyData.reduce((s, m) => s + m.bookings, 0);

    // lead time: invoice created → check-in date
    const leadTimes = bookings
      .map((b) => {
        const created = toDate(b.dates?.invoiceDate) || toDate(b.createdAt);
        const checkIn = toDate(b.booking?.checkInDate);
        if (!created || !checkIn) return null;
        const days = Math.round((checkIn - created) / 86400000);
        return days >= 0 ? days : null;
      })
      .filter((d) => d != null);
    const avgLeadTime = leadTimes.length
      ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length)
      : 0;

    // check-ins by weekday
    const weekdayCounts = Array(7).fill(0);
    bookings.forEach((b) => {
      const d = toDate(b.booking?.checkInDate);
      if (d) weekdayCounts[d.getDay()] += 1;
    });
    const weekdayData = WEEKDAYS.map((label, i) => ({ label, count: weekdayCounts[i] }));

    return { monthlyData, momGrowth, total12mo, avgLeadTime, weekdayData, thisMonth: last };
  }, [savedInvoices]);

  if (!savedInvoices.length) {
    return <EmptyState text="No booking history yet — trends will appear once you have invoices." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarClock} label="Bookings (12mo)" value={data.total12mo} iconBg={C.blueLight} iconColor={C.blue} />
        <StatCard
          icon={TrendingUp}
          label="This Month"
          value={data.thisMonth}
          badge={growthBadge(data.momGrowth)}
          sub="vs. last month"
          iconBg={C.greenLight}
          iconColor={C.green}
        />
        <StatCard icon={Clock} label="Avg. Lead Time" value={`${data.avgLeadTime} days`} sub="Booking to check-in" iconBg={C.purpleLight} iconColor={C.purple} />
        <StatCard icon={Gauge} label="Monthly Avg." value={(data.total12mo / 12).toFixed(1)} sub="Bookings / month" iconBg={C.amberLight} iconColor={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="Booking trend — 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.monthlyData}>
                <defs>
                  <linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke={C.navy} strokeWidth={2} fill="url(#bookingFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <Panel title="Check-ins by weekday">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="count" fill={C.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

// ── Revenue Trends ───────────────────────────────────────────────────────
function RevenueTrends({ savedInvoices }) {
  const data = useMemo(() => {
    const months = lastMonths(12);
    const byMonth = Object.fromEntries(months.map((m) => [m.key, { revenue: 0, count: 0 }]));
    savedInvoices.forEach((i) => {
      const d = toDate(i.dates?.invoiceDate) || toDate(i.createdAt);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key in byMonth) {
        byMonth[key].revenue += i.totals?.total || 0;
        byMonth[key].count += 1;
      }
    });
    const monthlyData = months.map((m) => ({
      label: m.label,
      revenue: Math.round(byMonth[m.key].revenue),
      count: byMonth[m.key].count,
    }));

    const last = monthlyData[monthlyData.length - 1]?.revenue || 0;
    const prev = monthlyData[monthlyData.length - 2]?.revenue || 0;
    const momGrowth = prev > 0 ? ((last - prev) / prev) * 100 : last > 0 ? 100 : 0;

    const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
    const totalCount = monthlyData.reduce((s, m) => s + m.count, 0);
    const avgPerBooking = totalCount > 0 ? totalRevenue / totalCount : 0;

    const last3 = monthlyData.slice(-3).map((m) => m.revenue);
    const estNextMonth = last3.length ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

    // revenue by room type
    const typeRevenue = {};
    savedInvoices.forEach((i) => {
      const t = i.booking?.roomType || "Unspecified";
      typeRevenue[t] = (typeRevenue[t] || 0) + (i.totals?.total || 0);
    });
    const roomTypeData = Object.entries(typeRevenue)
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return { monthlyData, momGrowth, thisMonth: last, avgPerBooking, estNextMonth, roomTypeData };
  }, [savedInvoices]);

  if (!savedInvoices.length) {
    return <EmptyState text="No invoice history yet — revenue trends will appear once you have invoices." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CircleDollarSign}
          label="This Month"
          value={fmtR(data.thisMonth)}
          badge={growthBadge(data.momGrowth)}
          sub="vs. last month"
          iconBg={C.purpleLight}
          iconColor={C.purple}
        />
        <StatCard icon={Receipt} label="Avg. per Booking" value={fmtR(data.avgPerBooking)} iconBg={C.blueLight} iconColor={C.blue} />
        <StatCard icon={TrendingUp} label="Est. Next Month" value={fmtR(data.estNextMonth)} sub="3-month rolling avg." iconBg={C.greenLight} iconColor={C.green} />
        <StatCard icon={Gauge} label="12-Month Total" value={fmtR(data.monthlyData.reduce((s, m) => s + m.revenue, 0))} iconBg={C.amberLight} iconColor={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="Revenue trend — 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={(v) => `R${v}`} />
                <Tooltip formatter={(v) => fmtR(v)} />
                <Line type="monotone" dataKey="revenue" stroke={C.navy} strokeWidth={2.5} dot={{ fill: C.accent, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <Panel title="Revenue by room type">
          {data.roomTypeData.length === 0 ? (
            <EmptyState text="No room type data yet." />
          ) : (
            <div className="space-y-3">
              {data.roomTypeData.map((r) => {
                const max = data.roomTypeData[0].revenue || 1;
                return (
                  <div key={r.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#374151] truncate">{r.name}</span>
                      <span className="font-semibold text-[#0f1623] flex-shrink-0 ml-2">{fmtR(r.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(r.revenue / max) * 100}%`, background: C.accent }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ── Guest Insights ───────────────────────────────────────────────────────
function GuestInsights({ savedGuests, savedInvoices }) {
  const data = useMemo(() => {
    // classify each invoice as "new" or "returning" guest, in chronological order
    const dated = savedInvoices
      .map((i) => ({ name: i.guest?.name, total: i.totals?.total || 0, date: toDate(i.dates?.invoiceDate) || toDate(i.createdAt) }))
      .filter((i) => i.name && i.date)
      .sort((a, b) => a.date - b.date);

    const seen = new Set();
    const months = lastMonths(12);
    const byMonth = Object.fromEntries(months.map((m) => [m.key, { new: 0, returning: 0 }]));
    let returningCount = 0;

    dated.forEach((i) => {
      const key = `${i.date.getFullYear()}-${i.date.getMonth()}`;
      const isReturning = seen.has(i.name);
      if (isReturning) returningCount += 1;
      if (key in byMonth) {
        byMonth[key][isReturning ? "returning" : "new"] += 1;
      }
      seen.add(i.name);
    });

    const monthlyData = months.map((m) => ({ label: m.label, New: byMonth[m.key].new, Returning: byMonth[m.key].returning }));

    const totalGuests = savedGuests.length;
    const totalInvoiceCount = dated.length;
    const repeatRate = totalInvoiceCount > 0 ? (returningCount / totalInvoiceCount) * 100 : 0;

    const totalRevenue = dated.reduce((s, i) => s + i.total, 0);
    const uniqueGuestCount = seen.size || 1;
    const avgSpendPerGuest = totalRevenue / uniqueGuestCount;
    const avgStaysPerGuest = uniqueGuestCount > 0 ? totalInvoiceCount / uniqueGuestCount : 0;

    // lifetime value ranking
    const ltv = {};
    dated.forEach((i) => {
      ltv[i.name] = ltv[i.name] || { name: i.name, total: 0, stays: 0 };
      ltv[i.name].total += i.total;
      ltv[i.name].stays += 1;
    });
    const topLTV = Object.values(ltv).sort((a, b) => b.total - a.total).slice(0, 5);

    return { monthlyData, totalGuests, repeatRate, avgSpendPerGuest, avgStaysPerGuest, topLTV };
  }, [savedGuests, savedInvoices]);

  if (!savedGuests.length) {
    return <EmptyState text="No guest history yet — insights will appear once you have guests and invoices." />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Guests" value={data.totalGuests} iconBg={C.blueLight} iconColor={C.blue} />
        <StatCard icon={Repeat} label="Repeat Rate" value={`${data.repeatRate.toFixed(0)}%`} sub="Of all stays" iconBg={C.purpleLight} iconColor={C.purple} />
        <StatCard icon={CircleDollarSign} label="Avg. Spend / Guest" value={fmtR(data.avgSpendPerGuest)} iconBg={C.greenLight} iconColor={C.green} />
        <StatCard icon={UserPlus} label="Avg. Stays / Guest" value={data.avgStaysPerGuest.toFixed(1)} iconBg={C.amberLight} iconColor={C.amber} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Panel title="New vs. returning guests — 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: C.textMuted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="New" stackId="g" fill={C.accent} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Returning" stackId="g" fill={C.navy} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <Panel title="Guest lifetime value">
          {data.topLTV.length === 0 ? (
            <EmptyState text="No spend history yet." />
          ) : (
            <div className="space-y-2">
              {data.topLTV.map((g, i) => (
                <div key={g.name} className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {i === 0 ? (
                      <Trophy size={14} color={C.amber} className="flex-shrink-0" />
                    ) : (
                      <span className="w-5 text-center text-xs font-bold text-[#94a3b8] flex-shrink-0">{i + 1}</span>
                    )}
                    <span className="text-sm text-[#374151] truncate">{g.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-semibold text-[#0f1623]">{fmtR(g.total)}</p>
                    <p className="text-[10px] text-[#94a3b8]">{g.stays} stay{g.stays > 1 ? "s" : ""}</p>
                  </div>
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
export default function AnalyticsView({
  activeView,
  setActiveView,
  savedInvoices = [],
  savedGuests = [],
}) {
  const tab = ["analytics-bookings", "analytics-revenue", "analytics-guests"].includes(activeView)
    ? activeView
    : "analytics-bookings";

  const titles = {
    "analytics-bookings": ["Booking Trends", "How your booking volume is moving over time"],
    "analytics-revenue": ["Revenue Trends", "Growth, run-rate, and where the revenue comes from"],
    "analytics-guests": ["Guest Insights", "Acquisition, retention, and lifetime value"],
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

      {tab === "analytics-bookings" && <BookingTrends savedInvoices={savedInvoices} />}
      {tab === "analytics-revenue" && <RevenueTrends savedInvoices={savedInvoices} />}
      {tab === "analytics-guests" && <GuestInsights savedGuests={savedGuests} savedInvoices={savedInvoices} />}
    </div>
  );
}