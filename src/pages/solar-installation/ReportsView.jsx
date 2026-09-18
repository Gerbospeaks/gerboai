import React, { useMemo, useState } from "react";
import {
  Download,
  Wallet,
  AlertTriangle,
  Percent,
  Sun,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/**
 * ReportsView
 *
 * Usage (next to <SolarSidebar />):
 *   {activeView === "reports" && (
 *     <ReportsView
 *       savedQuotes={savedQuotes}
 *       businessInfo={businessInfo}
 *       setActiveView={setActiveView}
 *       handleNewQuote={handleNewQuote}
 *     />
 *   )}
 *
 * savedQuotes may contain both quotes and invoices. Field names are read
 * tolerantly (see normalizeDoc) so you can adapt it to your data shape.
 */

const DAY = 86400000;

const RANGES = [
  { id: "3m", label: "3 months", months: 3 },
  { id: "6m", label: "6 months", months: 6 },
  { id: "12m", label: "12 months", months: 12 },
];

const BANDS = [
  { label: "Under 4 kW", test: (kw) => kw < 4 },
  { label: "4 to 7 kW", test: (kw) => kw >= 4 && kw < 8 },
  { label: "8 to 12 kW", test: (kw) => kw >= 8 && kw < 13 },
  { label: "13 kW and up", test: (kw) => kw >= 13 },
];

/* ── Data helpers ─────────────────────────────────────────────────────── */

const sum = (arr, f) => arr.reduce((t, x) => t + f(x), 0);
const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

function buildMonths(n) {
  const first = addMonths(startOfMonth(new Date()), -(n - 1));
  return Array.from({ length: n }, (_, i) => {
    const start = addMonths(first, i);
    return {
      start,
      end: addMonths(start, 1),
      label: start.toLocaleDateString("en", { month: "short" }),
      long: start.toLocaleDateString("en", { month: "long", year: "numeric" }),
    };
  });
}

// Maps whatever your saved documents look like onto one shape.
function normalizeDoc(q, i) {
  const type = String(q.documentType ?? q.type ?? "quote")
    .toLowerCase()
    .includes("invoice")
    ? "invoice"
    : "quote";
  const raw = String(q.status ?? "").toLowerCase();
  const total = num(q.total ?? q.grandTotal ?? q.totalAmount ?? q.amount);
  const dateVal = new Date(q.date ?? q.issueDate ?? q.createdAt ?? Date.now());
  const date = Number.isNaN(dateVal.getTime()) ? new Date() : dateVal;

  let status;
  let paid = 0;
  if (type === "invoice") {
    const isPaid = ["paid", "complete", "completed"].includes(raw);
    paid = isPaid ? total : num(q.amountPaid ?? q.paid);
    status = paid >= total && total > 0 ? "paid" : "unpaid";
  } else if (["accepted", "approved", "converted", "won"].includes(raw)) {
    status = "accepted";
  } else if (["declined", "rejected", "lost"].includes(raw)) {
    status = "declined";
  } else {
    status = "open";
  }

  const dueVal = q.dueDate ? new Date(q.dueDate) : null;
  const customer =
    typeof q.customer === "string"
      ? q.customer
      : (q.customerName ??
        q.clientName ??
        q.customer?.name ??
        "Unnamed client");

  return {
    id: q.id ?? q._id ?? `doc-${i}`,
    type,
    status,
    total,
    paid,
    date,
    due:
      dueVal && !Number.isNaN(dueVal.getTime())
        ? dueVal
        : new Date(date.getTime() + 30 * DAY),
    customer,
    kw: num(q.systemSizeKw ?? q.systemSize ?? q.capacityKw ?? q.kw),
  };
}

// Deterministic sample data so the page is useful before any real documents exist.
function makeDemoDocs() {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const customers = [
    "Chipo Moyo",
    "Tendai Ncube",
    "Greenfield Clinic",
    "Sunrise Bakery",
    "Farai Dube",
    "Nyasha Chikwanha",
    "Hillcrest Academy",
    "Rudo Sibanda",
    "Mbare Cold Storage",
    "Kudzai Marufu",
    "Tafara Guest Lodge",
    "Blessing Zhou",
  ];
  const sizes = [3, 5, 5, 6, 8, 10, 12, 15, 20];
  const now = Date.now();
  const docs = [];

  for (let i = 0; i < 80; i++) {
    const age = Math.floor(rnd() * 365);
    const qDate = new Date(now - age * DAY);
    const kw = pick(sizes);
    const total = Math.round(kw * (1050 + rnd() * 450));
    const customer = pick(customers);
    const won = rnd() < 0.58;
    const declined = !won && age > 30 && rnd() < 0.6;

    docs.push({
      id: `Q-${1000 + i}`,
      type: "quote",
      status: won ? "accepted" : declined ? "declined" : "open",
      total,
      paid: 0,
      date: qDate,
      due: null,
      customer,
      kw,
    });

    if (won) {
      const iDate = new Date(
        qDate.getTime() + (3 + Math.floor(rnd() * 11)) * DAY,
      );
      if (iDate.getTime() <= now) {
        const iAge = (now - iDate.getTime()) / DAY;
        const isPaid = rnd() < (iAge > 45 ? 0.88 : 0.45);
        docs.push({
          id: `INV-${1000 + i}`,
          type: "invoice",
          status: isPaid ? "paid" : "unpaid",
          total,
          paid: isPaid ? total : 0,
          date: iDate,
          due: new Date(iDate.getTime() + 30 * DAY),
          customer,
          kw,
        });
      }
    }
  }
  return docs;
}

function analyse(docs, n) {
  const months = buildMonths(n);
  const rangeStart = months[0].start;
  const rangeEnd = months[n - 1].end;
  const prevStart = addMonths(rangeStart, -n);
  const within = (d, a, b) => d.date >= a && d.date < b;

  const cur = docs.filter((d) => within(d, rangeStart, rangeEnd));
  const prev = docs.filter((d) => within(d, prevStart, rangeStart));
  const invoices = cur.filter((d) => d.type === "invoice");
  const quotes = cur.filter((d) => d.type === "quote");
  const prevInvoices = prev.filter((d) => d.type === "invoice");

  const monthly = months.map((m) => {
    const inv = invoices.filter((d) => d.date >= m.start && d.date < m.end);
    return {
      ...m,
      invoiced: sum(inv, (d) => d.total),
      collected: sum(inv, (d) => d.paid),
      kw: sum(inv, (d) => d.kw),
      jobs: inv.length,
    };
  });

  const accepted = quotes.filter((d) => d.status === "accepted").length;
  const declined = quotes.filter((d) => d.status === "declined").length;
  const paidCount = invoices.filter((d) => d.status === "paid").length;

  // Receivables look at every unpaid invoice, not only the selected range.
  const today = Date.now();
  const unpaid = docs.filter(
    (d) => d.type === "invoice" && d.total - d.paid > 0.5,
  );
  const aging = [
    { label: "Not yet due", test: (l) => l <= 0, bar: "bg-stone-400" },
    {
      label: "1 to 30 days late",
      test: (l) => l > 0 && l <= 30,
      bar: "bg-amber-400",
    },
    {
      label: "31 to 60 days late",
      test: (l) => l > 30 && l <= 60,
      bar: "bg-orange-500",
    },
    { label: "Over 60 days late", test: (l) => l > 60, bar: "bg-red-500" },
  ].map((b) => {
    const rows = unpaid.filter((d) =>
      b.test(Math.floor((today - d.due.getTime()) / DAY)),
    );
    return {
      ...b,
      count: rows.length,
      amount: sum(rows, (d) => d.total - d.paid),
    };
  });

  const byCustomer = new Map();
  invoices.forEach((d) => {
    const c = byCustomer.get(d.customer) ?? {
      name: d.customer,
      revenue: 0,
      jobs: 0,
      kw: 0,
    };
    c.revenue += d.total;
    c.jobs += 1;
    c.kw += d.kw;
    byCustomer.set(d.customer, c);
  });
  const topCustomers = [...byCustomer.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const sized = invoices.filter((d) => d.kw > 0);
  const sizeMix = BANDS.map((b) => ({
    label: b.label,
    count: sized.filter((d) => b.test(d.kw)).length,
  }));

  return {
    monthly,
    cur,
    invoices,
    quotes,
    collected: sum(invoices, (d) => d.paid),
    invoiced: sum(invoices, (d) => d.total),
    prevCollected: sum(prevInvoices, (d) => d.paid),
    kw: sum(invoices, (d) => d.kw),
    prevKw: sum(prevInvoices, (d) => d.kw),
    accepted,
    declined,
    paidCount,
    outstanding: sum(unpaid, (d) => d.total - d.paid),
    unpaidCount: unpaid.length,
    pastDue: sum(aging.slice(1), (b) => b.amount),
    aging,
    topCustomers,
    sizeMix,
    sizedCount: sized.length,
  };
}

const pctChange = (now, before) =>
  before > 0 ? ((now - before) / before) * 100 : null;

function niceScale(v) {
  if (!(v > 0)) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const raw = v / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  return { max: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => i * step) };
}

function makeFormatters(currency) {
  let cur = currency || "USD";
  try {
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur });
  } catch {
    cur = "USD";
  }
  const full = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  });
  const compact = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return { money: (v) => full.format(v), compact: (v) => compact.format(v) };
}

const kwFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function ReportsView({
  savedQuotes = [],
  businessInfo,
  setActiveView,
  handleNewQuote,
}) {
  const [rangeId, setRangeId] = useState("6m");
  const range = RANGES.find((r) => r.id === rangeId);

  const demoDocs = useMemo(makeDemoDocs, []);
  const usingSample = !savedQuotes || savedQuotes.length === 0;
  const docs = useMemo(
    () => (usingSample ? demoDocs : savedQuotes.map(normalizeDoc)),
    [usingSample, demoDocs, savedQuotes],
  );

  const r = useMemo(() => analyse(docs, range.months), [docs, range.months]);
  const { money, compact } = useMemo(
    () => makeFormatters(businessInfo?.currency),
    [businessInfo?.currency],
  );

  const decided = r.accepted + r.declined;
  const winRate = decided > 0 ? Math.round((r.accepted / decided) * 100) : null;
  const revenueDelta = pctChange(r.collected, r.prevCollected);
  const kwDelta = pctChange(r.kw, r.prevKw);

  const funnel = [
    {
      label: "Quotes created",
      short: "quotes",
      count: r.quotes.length,
      color: "bg-amber-300",
    },
    {
      label: "Quotes accepted",
      short: "quotes",
      count: r.accepted,
      color: "bg-amber-500",
      of: r.quotes.length,
    },
    {
      label: "Invoices issued",
      short: "accepted",
      count: r.invoices.length,
      color: "bg-orange-600",
      of: r.accepted,
    },
    {
      label: "Invoices paid",
      short: "invoices",
      count: r.paidCount,
      color: "bg-emerald-600",
      of: r.invoices.length,
    },
  ];

  const exportCsv = () => {
    const rows = [
      ["Type", "Date", "Client", "Status", "Total", "Paid", "System kW"],
      ...r.cur.map((d) => [
        d.type,
        d.date.toISOString().slice(0, 10),
        d.customer,
        d.status,
        d.total,
        d.paid,
        d.kw,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `solar-report-${rangeId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto bg-stone-50 print:overflow-visible">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900">
              Reports
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Sales, cash and installed capacity over the last {range.label}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <div
              role="group"
              aria-label="Report period"
              className="inline-flex rounded-xl bg-stone-200/70 p-1"
            >
              {RANGES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={opt.id === rangeId}
                  onClick={() => setRangeId(opt.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 ${
                    opt.id === rangeId
                      ? "bg-white text-orange-900 shadow-sm"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-800 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </header>

        {usingSample && (
          <div
            role="status"
            className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:hidden"
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="flex-1 min-w-[12rem]">
              You're looking at sample data. Create a quote or invoice and your
              real numbers will replace it here.
            </p>
            {(handleNewQuote || setActiveView) && (
              <button
                type="button"
                onClick={() => {
                  handleNewQuote?.();
                  setActiveView?.("quote");
                }}
                className="font-semibold underline underline-offset-2 hover:text-amber-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 rounded"
              >
                Create a quote
              </button>
            )}
          </div>
        )}

        {/* Key numbers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-stone-200 rounded-2xl overflow-hidden border border-stone-200">
          <Kpi icon={Wallet} label="Paid" value={money(r.collected)}>
            <Delta value={revenueDelta} months={range.months} />
            <p>{money(r.invoiced)} invoiced</p>
          </Kpi>
          <Kpi
            icon={AlertTriangle}
            label="Still owed"
            value={money(r.outstanding)}
          >
            <p>
              {r.unpaidCount} unpaid{" "}
              {r.unpaidCount === 1 ? "invoice" : "invoices"}
            </p>
            <p className={r.pastDue > 0 ? "text-red-600 font-medium" : ""}>
              {money(r.pastDue)} past due
            </p>
          </Kpi>
          <Kpi
            icon={Percent}
            label="Quote win rate"
            value={winRate == null ? "-" : `${winRate}%`}
          >
            <p>
              {r.accepted} of {decided} decided quotes accepted
            </p>
          </Kpi>
          <Kpi
            icon={Sun}
            label="Capacity installed"
            value={`${kwFmt.format(r.kw)} kW`}
          >
            <Delta value={kwDelta} months={range.months} />
            <p>
              {r.invoices.length}{" "}
              {r.invoices.length === 1 ? "system" : "systems"} invoiced
            </p>
          </Kpi>
        </div>

        {/* Revenue + funnel */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Revenue by month"
            note="Invoices grouped by the month they were issued."
            aside={
              <div className="flex items-center gap-4 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-300" />{" "}
                  Invoiced
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />{" "}
                  Paid
                </span>
              </div>
            }
          >
            <RevenueChart data={r.monthly} money={money} compact={compact} />
          </Panel>

          <Panel
            title="From quote to payment"
            note="How many jobs make it to each stage."
          >
            <ol className="space-y-5">
              {funnel.map((s, i) => {
                const top = Math.max(...funnel.map((f) => f.count), 1);
                const rate =
                  s.of > 0
                    ? Math.min(100, Math.round((s.count / s.of) * 100))
                    : null;
                return (
                  <li key={s.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-stone-700">{s.label}</span>
                      <span className="font-semibold tabular-nums text-stone-900">
                        {s.count}
                        {i > 0 && rate != null && (
                          <span className="ml-2 text-xs font-normal text-stone-500">
                            {rate}% of {s.short}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${(s.count / top) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>
        </div>

        {/* Capacity + size mix */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            className="lg:col-span-2"
            title="Capacity installed"
            note="Total kW across invoiced systems, by month."
          >
            <CapacityChart data={r.monthly} />
          </Panel>

          <Panel title="System sizes" note="Invoiced systems by capacity.">
            {r.sizedCount === 0 ? (
              <Empty>
                Add a system size (kW) to your invoices to see this breakdown.
              </Empty>
            ) : (
              <div className="space-y-4">
                {r.sizeMix.map((b) => (
                  <BarRow
                    key={b.label}
                    label={b.label}
                    value={`${b.count} ${b.count === 1 ? "system" : "systems"}`}
                    pct={
                      (b.count /
                        Math.max(...r.sizeMix.map((x) => x.count), 1)) *
                      100
                    }
                    bar="bg-orange-500"
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Receivables + customers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Unpaid invoices by age"
            note="Measured from each invoice's due date."
          >
            {r.unpaidCount === 0 ? (
              <Empty>Nothing owed. Every invoice has been paid.</Empty>
            ) : (
              <div className="space-y-4">
                {r.aging.map((b) => (
                  <BarRow
                    key={b.label}
                    label={b.label}
                    sub={`${b.count} ${b.count === 1 ? "invoice" : "invoices"}`}
                    value={money(b.amount)}
                    pct={
                      (b.amount /
                        Math.max(...r.aging.map((x) => x.amount), 1)) *
                      100
                    }
                    bar={b.bar}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Top clients"
            note="Ranked by invoiced amount in this period."
          >
            {r.topCustomers.length === 0 ? (
              <Empty>No invoices in this period yet.</Empty>
            ) : (
              <div className="space-y-4">
                {r.topCustomers.map((c) => (
                  <BarRow
                    key={c.name}
                    label={c.name}
                    sub={`${c.jobs} ${c.jobs === 1 ? "system" : "systems"}${
                      c.kw > 0 ? `, ${kwFmt.format(c.kw)} kW` : ""
                    }`}
                    value={money(c.revenue)}
                    pct={(c.revenue / r.topCustomers[0].revenue) * 100}
                    bar="bg-amber-500"
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ── Building blocks ──────────────────────────────────────────────────── */

function Panel({ title, note, aside, className = "", children }) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-stone-200 bg-white p-5 md:p-6 print:break-inside-avoid ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-stone-900">{title}</h2>
          {note && <p className="mt-0.5 text-sm text-stone-500">{note}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Kpi({ icon: Icon, label, value, children }) {
  return (
    <div className="min-w-0 bg-white p-5 md:p-6">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Icon className="w-4 h-4 text-orange-600" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 truncate text-2xl md:text-3xl font-bold tracking-tight tabular-nums text-stone-900">
        {value}
      </p>
      <div className="mt-1.5 space-y-0.5 text-xs text-stone-500">
        {children}
      </div>
    </div>
  );
}

function Delta({ value, months }) {
  if (value == null) return null;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <p
      className={`inline-flex items-center gap-0.5 font-medium ${
        up ? "text-emerald-700" : "text-red-600"
      }`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {Math.abs(Math.round(value))}% vs previous {months} months
    </p>
  );
}

function BarRow({ label, sub, value, pct, bar }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-stone-700">
          {label}
          {sub && <span className="ml-2 text-xs text-stone-500">{sub}</span>}
        </span>
        <span className="flex-shrink-0 font-semibold tabular-nums text-stone-900">
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.max(pct, 0)}%` }}
        />
      </div>
    </div>
  );
}

function Empty({ children }) {
  return <p className="py-6 text-sm text-stone-500">{children}</p>;
}

function Tip({ index, total, title, rows }) {
  const side = index < total / 2 ? "left-full ml-2" : "right-full mr-2";
  return (
    <div
      className={`pointer-events-none absolute top-2 z-10 w-44 rounded-xl bg-stone-900 p-3 text-xs text-white shadow-lg ${side}`}
    >
      <p className="mb-1.5 font-semibold">{title}</p>
      {rows.map(([k, v]) => (
        <p key={k} className="flex justify-between gap-2">
          <span className="text-stone-300">{k}</span>
          <span className="tabular-nums">{v}</span>
        </p>
      ))}
    </div>
  );
}

function AxisLabels({ ticks, max, format }) {
  return (
    <div
      className="relative h-56 w-12 flex-shrink-0 text-xs text-stone-400"
      aria-hidden="true"
    >
      {ticks.map((t) => (
        <span
          key={t}
          className="absolute right-0 translate-y-1/2 tabular-nums"
          style={{ bottom: `${(t / max) * 100}%` }}
        >
          {format(t)}
        </span>
      ))}
    </div>
  );
}

function Gridlines({ ticks, max }) {
  return ticks.map((t) => (
    <div
      key={t}
      className="absolute inset-x-0 border-t border-stone-100"
      style={{ bottom: `${(t / max) * 100}%` }}
    />
  ));
}

function MonthLabels({ data }) {
  return (
    <div className="mt-2 flex text-xs text-stone-500">
      {data.map((d) => (
        <span key={d.long} className="flex-1 text-center">
          {d.label}
        </span>
      ))}
    </div>
  );
}

function RevenueChart({ data, money, compact }) {
  const [hover, setHover] = useState(null);
  const { max, ticks } = useMemo(
    () => niceScale(Math.max(...data.map((d) => d.invoiced), 0)),
    [data],
  );

  return (
    <div className="flex gap-2">
      <AxisLabels ticks={ticks} max={max} format={compact} />
      <div className="min-w-0 flex-1">
        <div className="relative h-56">
          <Gridlines ticks={ticks} max={max} />
          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.long}
                tabIndex={0}
                aria-label={`${d.long}: ${money(d.invoiced)} invoiced, ${money(d.collected)} paid`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="relative flex h-full flex-1 items-end justify-center gap-1 rounded-md outline-none hover:bg-stone-50 focus-visible:bg-amber-50 focus-visible:ring-2 focus-visible:ring-orange-600"
              >
                <div
                  className="w-full max-w-[20px] rounded-t-md bg-amber-300"
                  style={{ height: `${(d.invoiced / max) * 100}%` }}
                />
                <div
                  className="w-full max-w-[20px] rounded-t-md bg-emerald-600"
                  style={{ height: `${(d.collected / max) * 100}%` }}
                />
                {hover === i && (
                  <Tip
                    index={i}
                    total={data.length}
                    title={d.long}
                    rows={[
                      ["Invoiced", money(d.invoiced)],
                      ["Paid", money(d.collected)],
                      ["Systems", d.jobs],
                    ]}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <MonthLabels data={data} />
      </div>
    </div>
  );
}

function CapacityChart({ data }) {
  const [hover, setHover] = useState(null);
  const n = data.length;
  const { max, ticks } = useMemo(
    () => niceScale(Math.max(...data.map((d) => d.kw), 0)),
    [data],
  );
  const pts = data.map((d, i) => [
    ((i + 0.5) / n) * 100,
    100 - (d.kw / max) * 100,
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const area = `${line} L${pts[n - 1][0]} 100 L${pts[0][0]} 100 Z`;

  return (
    <div className="flex gap-2">
      <AxisLabels
        ticks={ticks}
        max={max}
        format={(t) => `${kwFmt.format(t)} kW`}
      />
      <div className="min-w-0 flex-1">
        <div className="relative h-56">
          <Gridlines ticks={ticks} max={max} />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <path d={area} fill="currentColor" className="text-orange-100" />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="text-orange-600"
            />
          </svg>
          {data.map((d, i) => (
            <span
              key={d.long}
              aria-hidden="true"
              className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full bg-orange-600 ring-2 ring-white transition-all ${
                hover === i ? "h-3.5 w-3.5" : "h-2 w-2"
              }`}
              style={{
                left: `${pts[i][0]}%`,
                bottom: `${(d.kw / max) * 100}%`,
              }}
            />
          ))}
          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.long}
                tabIndex={0}
                aria-label={`${d.long}: ${kwFmt.format(d.kw)} kW across ${d.jobs} systems`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="relative h-full flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
              >
                {hover === i && (
                  <Tip
                    index={i}
                    total={data.length}
                    title={d.long}
                    rows={[
                      ["Capacity", `${kwFmt.format(d.kw)} kW`],
                      ["Systems", d.jobs],
                    ]}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <MonthLabels data={data} />
      </div>
    </div>
  );
}
