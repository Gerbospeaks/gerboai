import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Bell,
  Menu,
  Plus,
  LogOut,
  Sparkles,
  Zap,
  X,
  Edit,
  Trash2,
  Save,
} from "lucide-react";
import { db } from "../../firebase";

// ─── Theme ────────────────────────────────────────────────────────────────────
const TEAL = "#2a8296";
const AMBER = "#f59e0b";
const INDIGO = "#6366f1";

// ─── Formatting helpers ───────────────────────────────────────────────────────
const group = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
const money = (n = 0) => "R " + group(Number(n || 0).toFixed(2));
const money0 = (n = 0) => "R " + group(String(Math.round(Number(n || 0))));
const compact = (n) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(Math.round(n)));
const cap = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);
const todayISO = () => new Date().toISOString().split("T")[0];

// ─── Date helpers ─────────────────────────────────────────────────────────────
const toDate = (v) => {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate();
  if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
  const d = new Date(v);
  return isNaN(d) ? null : d;
};
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const inRange = (d, from, to) => !!d && d >= from && d < to;

const formatLongDate = (d) =>
  `${d.toLocaleDateString("en-GB", { weekday: "long" })} ${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr`;
  return `${Math.floor(h / 24)} d`;
};

// ─── Data helpers (used by the dashboard) ─────────────────────────────────────
// Merges POS sales and online orders into one list for the widgets.
export const normalizeOrders = (posSales = [], onlineOrders = []) => {
  const label = (o) =>
    o.orderNo ? `#${o.orderNo}` : `#${String(o.id).slice(0, 4).toUpperCase()}`;
  return [
    ...posSales.map((s) => ({
      id: s.id,
      label: label(s),
      customer: s.customer || "Walk-in",
      itemsCount: (s.items || []).reduce((a, i) => a + (Number(i.qty) || 0), 0),
      total: Number(s.total) || 0,
      status: s.status || "paid",
      type: s.orderType || "In-store",
      date: toDate(s.createdAt),
    })),
    ...onlineOrders.map((o) => ({
      id: o.id,
      label: label(o),
      customer: o.customer || "Guest",
      itemsCount: Number(o.itemsCount) || 0,
      total: Number(o.total) || 0,
      status: o.status || "pending",
      type: "Online",
      date: toDate(o.createdAt),
    })),
  ]
    .filter((o) => o.date)
    .sort((a, b) => b.date - a.date);
};

// Rule-based alerts for the bell, sidebar footer and the Smart Alert card.
export const buildAlerts = ({ products = [], invoices = [], onlineOrders = [] }) => [
  ...products
    .filter((p) => p.stock <= (p.minStock || 5))
    .map((p) => ({
      id: `stock-${p.id}`,
      tone: p.stock === 0 ? "red" : "amber",
      title: p.stock === 0 ? `${p.name} is out of stock` : `${p.name} stock is low`,
      detail: `${p.stock} left · alert below ${p.minStock || 5}`,
      view: "products",
    })),
  ...invoices
    .filter((i) => i.status === "overdue")
    .map((i) => ({
      id: `inv-${i.id}`,
      tone: "red",
      title: `Invoice ${i.number || ""} is overdue`.replace("  ", " "),
      detail: `${i.customer || "Customer"} · ${money(i.total)}`,
      view: "invoices",
    })),
  ...onlineOrders
    .filter((o) => (o.status || "pending") === "pending")
    .map((o) => ({
      id: `online-${o.id}`,
      tone: "amber",
      title: `Online order from ${o.customer || "a customer"} is pending`,
      detail: money(o.total),
      view: "online-orders",
    })),
];

// ═════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═════════════════════════════════════════════════════════════════════════════
export function RetailSidebar({
  navItems,
  activeView,
  sidebarOpen,
  onNav,
  businessInfo,
  alertCount = 0,
}) {
  const name = businessInfo?.name || "My Store";
  return (
    <aside
      className={`${sidebarOpen ? "w-56" : "w-0 overflow-hidden"} bg-gradient-to-b from-[#0f1b33] to-[#172a52] flex flex-col transition-all duration-200 flex-shrink-0 print:hidden`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div
          className="w-11 h-11 rounded-full text-white text-lg font-bold flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white/10"
          style={{ background: TEAL }}
        >
          {businessInfo?.logoUrl ? (
            <img src={businessInfo.logoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">{name}</div>
          <div className="text-[11px] text-slate-400">POS Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-2 overflow-y-auto space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeView === id && id !== "pos";
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              style={active ? { background: TEAL } : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI insights */}
      <div
        className="m-3 rounded-lg bg-white/5 px-3 py-2.5 border"
        style={{ borderColor: TEAL + "80" }}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
          <Zap className="w-3 h-3" />
          AI Insights Active
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {alertCount} smart alert{alertCount === 1 ? "" : "s"} today
        </div>
      </div>
    </aside>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HEADER
// ═════════════════════════════════════════════════════════════════════════════
export function RetailHeader({
  activeView,
  viewLabel,
  user,
  businessInfo,
  onToggleSidebar,
  lastSync,
  onSync,
  alerts = [],
  onOpenAlert,
  onNewInvoice,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 30s so "Last sync" stays accurate
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const raw = user?.displayName || user?.name || user?.email?.split("@")[0] || "there";
  const first = cap(raw.split(" ")[0]);
  const branch = businessInfo?.name;

  const title =
    activeView === "overview"
      ? `${greeting()}, ${first}${branch ? ` — ${branch}` : ""}`
      : viewLabel;

  const syncLabel = () => {
    if (!lastSync) return "syncing…";
    const m = Math.floor((Date.now() - lastSync.getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    return `${Math.floor(m / 60)} hr ago`;
  };

  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0 print:hidden">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-bold text-slate-900 truncate">{title}</h1>
          <p className="text-xs text-slate-400 truncate">
            {formatLongDate(new Date())} ·{" "}
            <button
              onClick={onSync}
              title="Sync now"
              className="hover:text-[#2a8296] transition-colors"
            >
              Last sync {syncLabel()} ✓
            </button>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={onNewInvoice}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
          style={{ background: TEAL }}
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative w-10 h-10 rounded-full bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-amber-600 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {alerts.length > 9 ? "9+" : alerts.length}
              </span>
            )}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-12 z-40 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 text-sm font-semibold text-slate-800">
                  Smart alerts
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {alerts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                      You're all caught up
                    </div>
                  ) : (
                    alerts.slice(0, 10).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setOpen(false);
                          onOpenAlert(a.view);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-3"
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.tone === "red" ? "bg-red-500" : "bg-amber-500"}`}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-800 truncate">
                            {a.title}
                          </span>
                          <span className="block text-xs text-slate-400">{a.detail}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full text-white font-semibold flex items-center justify-center"
          style={{ background: TEAL }}
          title={user?.email}
        >
          {first.charAt(0)}
        </div>

        <button
          onClick={onLogout}
          title="Log out"
          className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// OVERVIEW WIDGETS
// ═════════════════════════════════════════════════════════════════════════════
function StatCard({ label, value, delta, color }) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 border-t-4 shadow-sm p-4"
      style={{ borderTopColor: color }}
    >
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900 truncate">{value}</div>
      <div className={`text-[11px] mt-1.5 ${delta.cls}`}>{delta.text}</div>
    </div>
  );
}

function SmartAlertCard({ item, onReorder }) {
  return (
    <div
      className="rounded-xl border-2 border-dashed bg-white p-4"
      style={{ borderColor: TEAL }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <Sparkles className="w-3.5 h-3.5" style={{ color: TEAL }} />
        AI Smart Alert
      </div>
      {item ? (
        <>
          <div className="text-[15px] font-bold text-slate-900 mt-1.5 leading-snug">
            {item.name} {item.stock === 0 ? "is out of stock!" : "stock low!"}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {item.stock === 0 ? "None left" : `Only ${item.stock} left`}
          </div>
          <button
            onClick={onReorder}
            className="text-xs font-medium mt-1.5 hover:underline"
            style={{ color: TEAL }}
          >
            → Reorder suggested
          </button>
        </>
      ) : (
        <>
          <div className="text-[15px] font-bold text-slate-900 mt-1.5">
            Stock looks healthy
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Nothing needs reordering</div>
        </>
      )}
    </div>
  );
}

const niceCeil = (max) => {
  if (max <= 0) return 1000;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
};

function WeeklySalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.total), 0);
  const top = niceCeil(max);
  const ticks = [top, top / 2, 0];
  const bestIdx = max > 0 ? data.findIndex((d) => d.total === max) : -1;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between text-[10px] text-slate-400 h-36 w-9 text-right">
        {ticks.map((t) => (
          <span key={t}>{compact(t)}</span>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <div className="relative h-36">
          {[0, 50, 100].map((p) => (
            <div
              key={p}
              className="absolute left-0 right-0 border-t border-slate-100"
              style={{ top: `${p}%` }}
            />
          ))}
          <div className="absolute inset-0 flex items-end gap-3 px-2">
            {data.map((d, i) => (
              <div key={d.day} className="flex-1 h-full flex flex-col justify-end">
                <div
                  title={`${d.day}: ${money(d.total)}`}
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(2, (d.total / top) * 100)}%`,
                    background:
                      d.total === 0 ? "#e2e8f0" : i === bestIdx ? TEAL : "#8fc3d0",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 px-2 mt-1.5">
          {data.map((d, i) => (
            <span
              key={d.day}
              className={`flex-1 text-center text-[11px] ${i === bestIdx ? "font-semibold" : "text-slate-400"}`}
              style={i === bestIdx ? { color: TEAL } : undefined}
            >
              {d.day}
              {i === bestIdx ? " ★" : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const ORDER_STATUS = {
  paid: ["✓ Paid", "bg-emerald-50 text-emerald-700 border-emerald-200"],
  pending: ["⏳ Pending", "bg-amber-50 text-amber-700 border-amber-200"],
  cancelled: ["✕ Cancelled", "bg-slate-100 text-slate-500 border-slate-200"],
};
const TYPE_CLS = {
  "In-store": "text-blue-600",
  Takeaway: "text-violet-600",
  Delivery: "text-teal-600",
  Online: "text-orange-500",
};

const vsAvg = (diff) =>
  diff > 0
    ? { text: `▲ ${diff} above average`, cls: "text-emerald-600" }
    : diff < 0
      ? { text: `▼ ${Math.abs(diff)} below average`, cls: "text-red-500" }
      : { text: "~ Same as average", cls: "text-amber-500" };

export function OverviewHero({ orders, posSales, customers, lowStockItems, onReorder }) {
  const [range, setRange] = useState("today");

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);
  const weekAgo = addDays(today, -7);
  const monday = addDays(today, -((today.getDay() + 6) % 7));

  const live = orders.filter((o) => o.status !== "cancelled");
  const paid = live.filter((o) => o.status === "paid");
  const sum = (list, from, to) =>
    list.filter((o) => inRange(o.date, from, to)).reduce((a, o) => a + o.total, 0);
  const count = (list, from, to) => list.filter((o) => inRange(o.date, from, to)).length;

  // Revenue vs yesterday
  const revToday = sum(paid, today, tomorrow);
  const revYesterday = sum(paid, yesterday, today);
  let revDelta;
  if (revYesterday > 0) {
    const pct = ((revToday - revYesterday) / revYesterday) * 100;
    revDelta = {
      text: `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}% vs yesterday`,
      cls: pct >= 0 ? "text-emerald-600" : "text-red-500",
    };
  } else {
    revDelta = {
      text: revToday > 0 ? "No sales yesterday to compare" : "No sales yet today",
      cls: "text-slate-400",
    };
  }

  // Orders vs 7-day average
  const ordersToday = count(live, today, tomorrow);
  const ordersDiff = Math.round(ordersToday - count(live, weekAgo, today) / 7);

  // New customers vs 7-day average
  const custAt = (from, to) =>
    customers.filter((c) => inRange(toDate(c.createdAt), from, to)).length;
  const newCust = custAt(today, tomorrow);
  const custDiff = Math.round(newCust - custAt(weekAgo, today) / 7);

  // Weekly chart
  const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
    const from = addDays(monday, i);
    return { day, total: sum(paid, from, addDays(from, 1)) };
  });

  // Top sellers
  const from = range === "today" ? today : monday;
  const to = range === "today" ? tomorrow : addDays(monday, 7);
  const tally = {};
  posSales.forEach((s) => {
    if (!inRange(toDate(s.createdAt), from, to)) return;
    (s.items || []).forEach((i) => {
      tally[i.name] = (tally[i.name] || 0) + (Number(i.qty) || 0);
    });
  });
  const top = Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topMax = top[0]?.[1] || 1;

  // Smart alert: the most depleted product
  const ratio = (p) => p.stock / (p.minStock || 5);
  const worst = [...lowStockItems].sort((a, b) => ratio(a) - ratio(b))[0];

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={money0(revToday)} delta={revDelta} color={TEAL} />
        <StatCard label="Orders Today" value={ordersToday} delta={vsAvg(ordersDiff)} color={AMBER} />
        <StatCard label="New Customers" value={newCust} delta={vsAvg(custDiff)} color={INDIGO} />
        <SmartAlertCard item={worst} onReorder={onReorder} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly sales */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="text-sm font-bold text-slate-900">Weekly Sales</div>
          <div className="text-[11px] text-slate-400 mb-4">Revenue by day · This week</div>
          <WeeklySalesChart data={week} />
        </div>

        {/* Top selling */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">Top Selling Items</div>
              <div className="text-[11px] text-slate-400 mb-3">
                {range === "today" ? "Today's best performers" : "This week's best performers"}
              </div>
            </div>
            <div className="flex text-[11px] border border-slate-200 rounded-md overflow-hidden">
              {[
                ["today", "Today"],
                ["week", "Week"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`px-2 py-1 ${range === k ? "text-white" : "text-slate-500 hover:bg-slate-50"}`}
                  style={range === k ? { background: TEAL } : undefined}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {top.length === 0 ? (
            <div className="text-xs text-slate-400 py-6 text-center">
              No POS sales {range === "today" ? "yet today" : "this week"}.
            </div>
          ) : (
            <div className="space-y-3">
              {top.map(([name, qty], i) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 truncate pr-2">
                      {i + 1}. {name}
                    </span>
                    <span className="font-semibold text-slate-600">{qty}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(qty / topMax) * 100}%`,
                        background: TEAL,
                        opacity: [1, 0.85, 0.7, 0.55, 0.4][i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 text-sm font-bold text-slate-900">Recent Orders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-slate-400 bg-slate-50">
                <th className="text-left py-2.5 px-5 font-medium">ORDER</th>
                <th className="text-left py-2.5 px-3 font-medium">CUSTOMER</th>
                <th className="text-left py-2.5 px-3 font-medium">ITEMS</th>
                <th className="text-left py-2.5 px-3 font-medium">AMOUNT</th>
                <th className="text-left py-2.5 px-3 font-medium">STATUS</th>
                <th className="text-left py-2.5 px-3 font-medium">TYPE</th>
                <th className="text-left py-2.5 px-5 font-medium">TIME</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => {
                const st = ORDER_STATUS[o.status] || [
                  cap(o.status),
                  "bg-slate-100 text-slate-600 border-slate-200",
                ];
                return (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="py-3 px-5 font-medium text-slate-800">{o.label}</td>
                    <td className="py-3 px-3 text-slate-600">{o.customer}</td>
                    <td className="py-3 px-3 text-slate-600">{o.itemsCount || "—"}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{money(o.total)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${st[1]}`}
                      >
                        {st[0]}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-xs font-medium ${TYPE_CLS[o.type] || "text-slate-500"}`}>
                      {o.type}
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-400">{timeAgo(o.date)}</td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    No orders yet. Sales from the POS Terminal and Online Orders show up here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GENERIC LIST + FORM VIEW (Purchases, Online Orders, Expenses, Branches)
// ═════════════════════════════════════════════════════════════════════════════
const PILL = {
  paid: "bg-emerald-50 text-emerald-700",
  received: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  ordered: "bg-blue-50 text-blue-700",
  cancelled: "bg-slate-100 text-slate-500",
};
const Pill = ({ value }) => (
  <span
    className={`text-xs px-2 py-0.5 rounded-full font-medium ${PILL[String(value).toLowerCase()] || "bg-slate-100 text-slate-600"}`}
  >
    {cap(String(value || ""))}
  </span>
);

const inputCls =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a8296]/30 focus:border-[#2a8296]";

function CrudView({
  user,
  collectionName,
  itemName,
  fields,
  columns,
  summary,
  emptyText,
  beforeSave,
  onChanged,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // "new" | row | null
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const colRef = () => collection(db, "users", user.uid, collectionName);

  const load = async () => {
    if (!user?.uid) return;
    try {
      const snap = await getDocs(query(colRef(), orderBy("createdAt", "desc")));
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user?.uid, collectionName]);

  const blank = () =>
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        f.type === "date" ? todayISO() : f.type === "select" ? f.options[0] : "",
      ]),
    );

  const openNew = () => {
    setForm(blank());
    setEditing("new");
  };
  const openEdit = (row) => {
    setForm({ ...blank(), ...row });
    setEditing(row);
  };

  const handleSave = async () => {
    const missing = fields.find((f) => f.required && !String(form[f.key] ?? "").trim());
    if (missing) {
      alert(`${missing.label} is required`);
      return;
    }
    setSaving(true);
    try {
      let data = {};
      fields.forEach((f) => {
        const v = form[f.key] ?? "";
        data[f.key] = f.type === "number" ? parseFloat(v) || 0 : String(v).trim();
      });
      if (beforeSave) data = beforeSave(data, editing === "new");
      if (editing === "new") {
        await addDoc(colRef(), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, "users", user.uid, collectionName, editing.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      }
      setEditing(null);
      await load();
      if (onChanged) onChanged();
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete this ${itemName}?`)) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, collectionName, row.id));
      await load();
      if (onChanged) onChanged();
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {summary(rows).map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90"
          style={{ background: TEAL }}
        >
          <Plus className="w-4 h-4" />
          Add {itemName}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-100">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`py-3 px-4 font-medium ${c.align === "right" ? "text-right" : "text-left"}`}
                >
                  {c.label}
                </th>
              ))}
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`py-3 px-4 text-slate-700 ${c.align === "right" ? "text-right" : ""}`}
                  >
                    {c.render ? c.render(r) : r[c.key] || "—"}
                  </td>
                ))}
                <td className="py-3 px-4">
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => openEdit(r)}
                      className="px-2 py-1 border border-slate-200 rounded hover:bg-slate-50"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="px-2 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-10 text-slate-400 text-sm">
                  {emptyText}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-10 text-slate-400 text-sm">
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-900">
                {editing === "new" ? "Add" : "Edit"} {itemName}
              </span>
              <button onClick={() => setEditing(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 grid grid-cols-2 gap-3">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "col-span-2" : ""}>
                  <label className="block text-xs text-slate-500 mb-1">
                    {f.label}
                    {f.required && " *"}
                  </label>
                  {f.type === "select" ? (
                    <select
                      className={inputCls}
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    >
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {cap(o)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type || "text"}
                      step={f.type === "number" ? "0.01" : undefined}
                      className={inputCls}
                      placeholder={f.placeholder}
                      value={form[f.key] ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex gap-2 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-60"
                style={{ background: TEAL }}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sumOf = (rows, pick) => rows.reduce((a, r) => a + (Number(pick(r)) || 0), 0);

export const PurchasesView = ({ user }) => (
  <CrudView
    user={user}
    collectionName="purchases"
    itemName="purchase"
    emptyText="No purchases yet. Record the stock you order from suppliers."
    fields={[
      { key: "supplier", label: "Supplier", required: true },
      { key: "reference", label: "PO / reference" },
      { key: "date", label: "Order date", type: "date" },
      { key: "amount", label: "Amount (R)", type: "number", required: true },
      { key: "status", label: "Status", type: "select", options: ["ordered", "received", "paid", "cancelled"] },
      { key: "notes", label: "Notes", full: true },
    ]}
    columns={[
      { key: "date", label: "Date" },
      { key: "supplier", label: "Supplier" },
      { key: "reference", label: "Reference" },
      { key: "amount", label: "Amount", align: "right", render: (r) => money(r.amount) },
      { key: "status", label: "Status", render: (r) => <Pill value={r.status} /> },
    ]}
    summary={(rows) => [
      {
        label: "Awaiting delivery",
        value: money(sumOf(rows.filter((r) => r.status === "ordered"), (r) => r.amount)),
      },
      {
        label: "Received, unpaid",
        value: money(sumOf(rows.filter((r) => r.status === "received"), (r) => r.amount)),
      },
      { label: "Total purchases", value: rows.length },
    ]}
  />
);

export const ExpensesView = ({ user }) => (
  <CrudView
    user={user}
    collectionName="expenses"
    itemName="expense"
    emptyText="No expenses yet. Track rent, utilities, salaries and other running costs."
    fields={[
      { key: "description", label: "Description", required: true, full: true },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: ["Rent", "Utilities", "Salaries", "Stock", "Transport", "Marketing", "Other"],
      },
      { key: "date", label: "Date", type: "date" },
      { key: "amount", label: "Amount (R)", type: "number", required: true },
    ]}
    columns={[
      { key: "date", label: "Date" },
      { key: "description", label: "Description" },
      { key: "category", label: "Category" },
      { key: "amount", label: "Amount", align: "right", render: (r) => money(r.amount) },
    ]}
    summary={(rows) => {
      const month = todayISO().slice(0, 7);
      return [
        {
          label: "This month",
          value: money(sumOf(rows.filter((r) => (r.date || "").startsWith(month)), (r) => r.amount)),
        },
        { label: "All time", value: money(sumOf(rows, (r) => r.amount)) },
        { label: "Entries", value: rows.length },
      ];
    }}
  />
);

export const BranchesView = ({ user }) => (
  <CrudView
    user={user}
    collectionName="branches"
    itemName="branch"
    emptyText="No branches yet. Add your main store and any other locations."
    fields={[
      { key: "name", label: "Branch name", required: true },
      { key: "manager", label: "Manager" },
      { key: "phone", label: "Phone" },
      { key: "address", label: "Address", full: true },
    ]}
    columns={[
      { key: "name", label: "Branch" },
      { key: "manager", label: "Manager" },
      { key: "phone", label: "Phone" },
      { key: "address", label: "Address" },
    ]}
  />
);

export const OnlineOrdersView = ({ user, onChanged }) => (
  <CrudView
    user={user}
    collectionName="online_orders"
    itemName="online order"
    onChanged={onChanged}
    emptyText="No online orders yet. Add orders that come in through your website, WhatsApp or delivery apps."
    beforeSave={(d, isNew) =>
      isNew ? { ...d, orderNo: "OL-" + Date.now().toString().slice(-5) } : d
    }
    fields={[
      { key: "customer", label: "Customer", required: true },
      { key: "phone", label: "Phone" },
      { key: "source", label: "Source", type: "select", options: ["website", "whatsapp", "delivery app", "other"] },
      { key: "itemsCount", label: "Items", type: "number" },
      { key: "total", label: "Total (R)", type: "number", required: true },
      { key: "status", label: "Status", type: "select", options: ["pending", "paid", "cancelled"] },
    ]}
    columns={[
      { key: "orderNo", label: "Order" },
      { key: "customer", label: "Customer" },
      { key: "source", label: "Source", render: (r) => cap(r.source || "") || "—" },
      { key: "itemsCount", label: "Items" },
      { key: "total", label: "Total", align: "right", render: (r) => money(r.total) },
      { key: "status", label: "Status", render: (r) => <Pill value={r.status} /> },
    ]}
    summary={(rows) => [
      { label: "Pending", value: rows.filter((r) => r.status === "pending").length },
      {
        label: "Paid revenue",
        value: money(sumOf(rows.filter((r) => r.status === "paid"), (r) => r.total)),
      },
      { label: "Orders", value: rows.length },
    ]}
  />
);