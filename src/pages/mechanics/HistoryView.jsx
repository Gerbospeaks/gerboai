import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  Car,
  Users,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Printer,
  Download,
  X,
  TrendingUp,
  Wrench,
  Package,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  limit,
  where,
} from "firebase/firestore";

const statusConfig = {
  paid: {
    label: "Paid",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    icon: CheckCircle,
    dot: "bg-[#059669]",
  },
  partially_paid: {
    label: "Partial",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    icon: Clock,
    dot: "bg-[#d97706]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    icon: Clock,
    dot: "bg-[#2563eb]",
  },
  converted: {
    label: "Converted",
    bg: "bg-[#f3e8ff]",
    text: "text-[#6b21a8]",
    icon: FileText,
    dot: "bg-[#7c3aed]",
  },
  unpaid: {
    label: "Unpaid",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    icon: XCircle,
    dot: "bg-[#dc2626]",
  },
};

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(
    n || 0,
  );

const formatDate = (val) => {
  if (!val) return "—";
  if (val?.toDate) return val.toDate().toLocaleDateString("en-ZA");
  if (typeof val === "string") return new Date(val).toLocaleDateString("en-ZA");
  return "—";
};

export default function HistoryView({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc");

  useEffect(() => {
    if (user?.uid) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    const db = getFirestore();
    try {
      const [invSnap, quoteSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "invoices"),
            orderBy("createdAt", "desc"),
            limit(200),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "quotations"),
            orderBy("createdAt", "desc"),
            limit(200),
          ),
        ),
      ]);
      const inv = invSnap.docs.map((d) => ({
        id: d.id,
        _type: "invoice",
        ...d.data(),
      }));
      const quotes = quoteSnap.docs.map((d) => ({
        id: d.id,
        _type: "quotation",
        ...d.data(),
      }));
      setRecords([...inv, ...quotes]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records
    .filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.jobCardNumber?.toLowerCase().includes(q) ||
        r.customer?.name?.toLowerCase().includes(q) ||
        r.vehicle?.registration?.toLowerCase().includes(q) ||
        r.vehicle?.make?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const matchType = filterType === "all" || r._type === filterType;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      const getTime = (x) =>
        x.createdAt?.toDate?.()?.getTime() ||
        new Date(x.createdAt || 0).getTime();
      if (sortBy === "date_desc") return getTime(b) - getTime(a);
      if (sortBy === "date_asc") return getTime(a) - getTime(b);
      if (sortBy === "amount_desc")
        return (b.totals?.total || 0) - (a.totals?.total || 0);
      if (sortBy === "amount_asc")
        return (a.totals?.total || 0) - (b.totals?.total || 0);
      return 0;
    });

  const stats = {
    total: records.length,
    paid: records.filter((r) => r.status === "paid").length,
    pending: records.filter((r) => r.status === "pending").length,
    revenue: records
      .filter((r) => r.status === "paid")
      .reduce((s, r) => s + (r.totals?.total || 0), 0),
  };

  const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
      >
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center">
          <History className="w-5 h-5 text-[#2563eb]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#1e293b]">Job History</h1>
          <p className="text-xs text-[#64748b]">All invoices and quotations</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Records",
            value: stats.total,
            icon: FileText,
            bg: "bg-[#eff6ff]",
            color: "text-[#2563eb]",
          },
          {
            label: "Paid",
            value: stats.paid,
            icon: CheckCircle,
            bg: "bg-[#f0fdf4]",
            color: "text-[#059669]",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            bg: "bg-[#fff7ed]",
            color: "text-[#ea580c]",
          },
          {
            label: "Revenue",
            value: formatCurrency(stats.revenue),
            icon: TrendingUp,
            bg: "bg-[#faf5ff]",
            color: "text-[#7c3aed]",
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
            <p className="text-xs text-[#64748b]">{label}</p>
            <p className="text-lg font-bold text-[#1e293b] truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search number, client, vehicle…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-[#1e293b] placeholder-[#94a3b8]"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partial</option>
          <option value="pending">Pending</option>
          <option value="unpaid">Unpaid</option>
          <option value="converted">Converted</option>
        </select>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        >
          <option value="all">Invoices & Quotes</option>
          <option value="invoice">Invoices only</option>
          <option value="quotation">Quotes only</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>

        <span className="text-xs text-[#94a3b8] ml-auto">
          {filtered.length} records
        </span>
      </div>

      {/* Records list */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#f1f5f9]">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 bg-[#f1f5f9] rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#f1f5f9] rounded animate-pulse w-48" />
                  <div className="h-3 bg-[#f1f5f9] rounded animate-pulse w-64" />
                </div>
                <div className="h-6 bg-[#f1f5f9] rounded-full animate-pulse w-16" />
                <div className="h-5 bg-[#f1f5f9] rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
              <History className="w-7 h-7 text-[#cbd5e1]" />
            </div>
            <p className="text-sm font-semibold text-[#374151]">
              No records found
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filtered.map((record) => {
              const isOpen = expanded === record.id;
              const cfg = statusConfig[record.status] || statusConfig.pending;
              return (
                <div key={record.id}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : record.id)}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
                  >
                    {/* Type icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${record._type === "invoice" ? "bg-[#eff6ff]" : "bg-[#f0fdf4]"}`}
                    >
                      {record._type === "invoice" ? (
                        <Receipt className="w-4 h-4 text-[#2563eb]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#059669]" />
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-[#1e293b]">
                          {record.jobCardNumber || record.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${record._type === "invoice" ? "bg-[#dbeafe] text-[#1e40af]" : "bg-[#dcfce7] text-[#166534]"}`}
                        >
                          {record._type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-[#64748b] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {record.customer?.name || "No client"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          {[
                            record.vehicle?.year,
                            record.vehicle?.make,
                            record.vehicle?.model,
                          ]
                            .filter(Boolean)
                            .join(" ") || "No vehicle"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status + amount */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={record.status} />
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-[#1e293b]">
                          {formatCurrency(record.totals?.total)}
                        </div>
                        {record.totals?.due > 0 &&
                          record.totals?.due < record.totals?.total && (
                            <div className="text-xs text-[#d97706]">
                              Due: {formatCurrency(record.totals.due)}
                            </div>
                          )}
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-[#94a3b8] transition-transform ${isOpen ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isOpen && (
                    <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-5 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Client */}
                        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
                          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Client
                          </p>
                          {[
                            ["Name", record.customer?.name],
                            ["Email", record.customer?.email],
                            ["Phone", record.customer?.phone],
                            ["Address", record.customer?.address],
                          ].map(([k, v]) =>
                            v ? (
                              <div
                                key={k}
                                className="flex justify-between text-xs py-1 border-b border-[#f1f5f9] last:border-0"
                              >
                                <span className="text-[#64748b]">{k}</span>
                                <span className="text-[#1e293b] font-medium text-right max-w-[60%] truncate">
                                  {v}
                                </span>
                              </div>
                            ) : null,
                          )}
                        </div>

                        {/* Vehicle */}
                        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
                          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5" /> Vehicle
                          </p>
                          {[
                            ["Make", record.vehicle?.make],
                            ["Model", record.vehicle?.model],
                            ["Year", record.vehicle?.year],
                            ["Reg", record.vehicle?.registration],
                            ["VIN", record.vehicle?.vin],
                            [
                              "Mileage",
                              record.vehicle?.mileage
                                ? `${record.vehicle.mileage} km`
                                : null,
                            ],
                          ].map(([k, v]) =>
                            v ? (
                              <div
                                key={k}
                                className="flex justify-between text-xs py-1 border-b border-[#f1f5f9] last:border-0"
                              >
                                <span className="text-[#64748b]">{k}</span>
                                <span className="text-[#1e293b] font-medium">
                                  {v}
                                </span>
                              </div>
                            ) : null,
                          )}
                        </div>

                        {/* Financials */}
                        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4">
                          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" /> Financials
                          </p>
                          {[
                            [
                              "Subtotal",
                              formatCurrency(record.totals?.subtotal),
                            ],
                            ["VAT", formatCurrency(record.totals?.vat)],
                            ["Total", formatCurrency(record.totals?.total)],
                            ["Paid", formatCurrency(record.totals?.paid)],
                            ["Balance", formatCurrency(record.totals?.due)],
                          ].map(([k, v]) => (
                            <div
                              key={k}
                              className={`flex justify-between text-xs py-1 border-b border-[#f1f5f9] last:border-0 ${k === "Total" ? "font-bold text-[#1e293b]" : ""}`}
                            >
                              <span className="text-[#64748b]">{k}</span>
                              <span
                                className={`font-medium ${k === "Balance" && record.totals?.due > 0 ? "text-[#dc2626]" : k === "Paid" ? "text-[#059669]" : "text-[#1e293b]"}`}
                              >
                                {v}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Line items */}
                      {record.items?.length > 0 && (
                        <div className="mt-4 bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
                          <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 text-[#64748b]" />
                            <span className="text-xs font-semibold text-[#374151]">
                              Line Items ({record.items.length})
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-[#f1f5f9]">
                                  {[
                                    "Type",
                                    "Description",
                                    "Rate",
                                    "Qty",
                                    "Amount",
                                  ].map((h) => (
                                    <th
                                      key={h}
                                      className="px-4 py-2 text-left font-semibold text-[#64748b] uppercase tracking-wide"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {record.items.map((item, i) => (
                                  <tr
                                    key={i}
                                    className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]"
                                  >
                                    <td className="px-4 py-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.type === "Labor" ? "bg-[#dbeafe] text-[#1e40af]" : "bg-[#dcfce7] text-[#166534]"}`}
                                      >
                                        {item.type || "—"}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-[#374151] font-medium">
                                      {item.description}
                                    </td>
                                    <td className="px-4 py-2 text-[#374151]">
                                      R{Number(item.rate || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 text-[#374151]">
                                      {item.qty}
                                    </td>
                                    <td className="px-4 py-2 font-semibold text-[#1e293b]">
                                      R{Number(item.amount || 0).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
