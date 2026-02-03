import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Receipt,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const HistoryView = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState("date-desc");
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Statistics
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalEstimates: 0,
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });

  useEffect(() => {
    if (user?.uid) {
      loadDocuments();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filterStatus, filterType, dateRange, sortBy]);

  const loadDocuments = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const db = getFirestore();

      // Load invoices
      const invoicesRef = collection(db, "users", user.uid, "invoices");
      const invoicesQuery = query(
        invoicesRef,
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);

      // Load estimates
      const estimatesRef = collection(db, "users", user.uid, "estimates");
      const estimatesQuery = query(
        estimatesRef,
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const estimatesSnapshot = await getDocs(estimatesQuery);

      const allDocuments = [];

      invoicesSnapshot.forEach((doc) => {
        allDocuments.push({
          id: doc.id,
          type: "invoice",
          ...doc.data(),
        });
      });

      estimatesSnapshot.forEach((doc) => {
        allDocuments.push({
          id: doc.id,
          type: "estimate",
          ...doc.data(),
        });
      });

      setDocuments(allDocuments);
      calculateStats(allDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs) => {
    const invoices = docs.filter((d) => d.type === "invoice");
    const estimates = docs.filter((d) => d.type === "estimate");

    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + (inv.totals?.total || 0),
      0
    );
    const paidAmount = invoices.reduce(
      (sum, inv) => sum + (inv.totals?.paid || 0),
      0
    );
    const pendingAmount = invoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + (inv.totals?.due || 0), 0);

    // Calculate overdue (invoices with due date passed and still pending)
    const now = new Date();
    const overdueAmount = invoices
      .filter((inv) => {
        if (inv.status !== "pending" && inv.status !== "partially_paid")
          return false;
        const dueDate = inv.dates?.dueDate
          ? new Date(inv.dates.dueDate)
          : null;
        return dueDate && dueDate < now;
      })
      .reduce((sum, inv) => sum + (inv.totals?.due || 0), 0);

    setStats({
      totalInvoices: invoices.length,
      totalEstimates: estimates.length,
      totalRevenue,
      paidAmount,
      pendingAmount,
      overdueAmount,
    });
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((doc) => doc.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      filtered = filtered.filter((doc) => {
        const docDate = doc.createdAt?.toDate
          ? doc.createdAt.toDate()
          : new Date(doc.createdAt);

        switch (dateRange) {
          case "today":
            return docDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return docDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return docDate >= monthAgo;
          case "quarter":
            const quarterAgo = new Date(
              now.getTime() - 90 * 24 * 60 * 60 * 1000
            );
            return docDate >= quarterAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt?.toDate?.() || b.createdAt) -
            new Date(a.createdAt?.toDate?.() || a.createdAt)
          );
        case "date-asc":
          return (
            new Date(a.createdAt?.toDate?.() || a.createdAt) -
            new Date(b.createdAt?.toDate?.() || b.createdAt)
          );
        case "amount-desc":
          return (b.totals?.total || 0) - (a.totals?.total || 0);
        case "amount-asc":
          return (a.totals?.total || 0) - (b.totals?.total || 0);
        case "customer":
          return (a.customer?.name || "").localeCompare(b.customer?.name || "");
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  };

  const handleDeleteDocument = async (docId, docType) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${docType}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const db = getFirestore();
      const collectionName = docType === "invoice" ? "invoices" : "estimates";
      await deleteDoc(doc(db, "users", user.uid, collectionName, docId));
      await loadDocuments();
      alert(`${docType} deleted successfully`);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert(`Failed to delete ${docType}`);
    }
  };

  const toggleRowExpansion = (docId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(docId)) {
      newExpanded.delete(docId);
    } else {
      newExpanded.add(docId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle,
        label: "Paid",
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: Clock,
        label: "Pending",
      },
      partially_paid: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: TrendingUp,
        label: "Partial",
      },
      overdue: {
        bg: "bg-rose-100",
        text: "text-rose-700",
        icon: AlertCircle,
        label: "Overdue",
      },
      converted: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: ArrowUpRight,
        label: "Converted",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Document History
            </h1>
            <p className="text-slate-600">
              View and manage all invoices and estimates
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Invoices
            </span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.totalInvoices}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600">
              Estimates
            </span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.totalEstimates}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700">Revenue</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            R{stats.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700">Paid</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            R{stats.paidAmount.toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700">
              Pending
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900">
            R{stats.pendingAmount.toFixed(2)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-700">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-900">
            R{stats.overdueAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by number, client, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="all">All Types</option>
              <option value="invoice">Invoices</option>
              <option value="estimate">Estimates</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="font-semibold">
              {filteredDocuments.length} documents found
            </span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
            <option value="customer">Customer Name</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold text-lg">
              No documents found
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => (
                  <React.Fragment key={doc.id}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            doc.type === "invoice"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {doc.type === "invoice" ? (
                            <Receipt className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          {doc.type === "invoice" ? "Invoice" : "Estimate"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">
                          {doc.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {doc.customer?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {doc.customer?.name || "N/A"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {doc.customer?.email || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(doc.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-bold text-slate-900 text-lg">
                          R{doc.totals?.total?.toFixed(2) || "0.00"}
                        </div>
                        {doc.totals?.paid > 0 && (
                          <div className="text-xs text-emerald-600 font-semibold">
                            Paid: R{doc.totals.paid.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(doc.status)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleRowExpansion(doc.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            {expandedRows.has(doc.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteDocument(doc.id, doc.type)
                            }
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(doc.id) && (
                      <tr>
                        <td colSpan="7" className="bg-slate-50 px-4 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column - Items */}
                            <div>
                              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Line Items ({doc.items?.length || 0})
                              </h4>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {doc.items?.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-3 rounded-lg border border-slate-200"
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="font-medium text-slate-900">
                                        {item.description}
                                      </div>
                                      <div className="font-bold text-slate-900">
                                        R{item.totalAmount?.toFixed(2)}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-600">
                                      <span>Qty: {item.qty}</span>
                                      <span>Rate: R{item.rate?.toFixed(2)}</span>
                                      {item.taxRate > 0 && (
                                        <span>Tax: {item.taxRate}%</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right Column - Details */}
                            <div>
                              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" />
                                Additional Details
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                                <div>
                                  <div className="text-xs font-semibold text-slate-600 mb-1">
                                    Customer Information
                                  </div>
                                  <div className="text-sm text-slate-900">
                                    {doc.customer?.name}
                                  </div>
                                  <div className="text-xs text-slate-600">
                                    {doc.customer?.email}
                                  </div>
                                  <div className="text-xs text-slate-600">
                                    {doc.customer?.phone}
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200">
                                  <div className="text-xs font-semibold text-slate-600 mb-2">
                                    Financial Summary
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">
                                        Subtotal:
                                      </span>
                                      <span className="font-semibold">
                                        R{doc.totals?.subtotal?.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-600">Tax:</span>
                                      <span className="font-semibold">
                                        R{doc.totals?.tax?.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-200">
                                      <span className="font-bold text-slate-900">
                                        Total:
                                      </span>
                                      <span className="font-bold text-blue-700">
                                        R{doc.totals?.total?.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {doc.convertedToInvoiceNumber && (
                                  <div className="pt-3 border-t border-slate-200">
                                    <div className="text-xs font-semibold text-purple-600 mb-1">
                                      Converted to Invoice
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">
                                      {doc.convertedToInvoiceNumber}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;