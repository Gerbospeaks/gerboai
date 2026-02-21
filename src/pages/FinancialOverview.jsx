import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  Calendar,
  Users,
  PieChart,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

const FinancialOverview = ({ user }) => {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    avgInvoice: 0,
    invoiceCount: 0,
    outstanding: 0,
    overdue: 0,
    paidThisMonth: 0,
    expenses: 0,
    netProfit: 0,
    revenueGrowth: 0,
    collectionRate: 0,
    healthScore: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topClients, setTopClients] = useState([]);

  // Fetch financial data from Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const fetchFinancialData = async () => {
      setLoading(true);
      const db = getFirestore();

      try {
        // Get date ranges based on timeRange
        const now = new Date();
        let startDate = new Date();

        if (timeRange === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === "month") {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          startDate.setFullYear(now.getFullYear() - 1);
        }

        // Fetch invoices from the current user
        const invoicesRef = collection(db, "users", user.uid, "invoices");
        const invoicesSnapshot = await getDocs(invoicesRef);

        let totalRevenue = 0;
        let totalOutstanding = 0;
        let totalOverdue = 0;
        let paidCount = 0;
        let invoicesList = [];

        invoicesSnapshot.forEach((doc) => {
          const invoice = doc.data();
          invoicesList.push({ id: doc.id, ...invoice });

          const invoiceDate = invoice.dates?.invoiceDate
            ? new Date(invoice.dates.invoiceDate)
            : invoice.dates?.quoteDate
              ? new Date(invoice.dates.quoteDate)
              : invoice.createdAt?.toDate
                ? invoice.createdAt.toDate()
                : null;
          const dueDate = invoice.dates?.dueDate
            ? new Date(invoice.dates.dueDate)
            : invoice.dates?.validUntil
              ? new Date(invoice.dates.validUntil)
              : null;

          if (invoiceDate && invoiceDate >= startDate) {
            if (invoice.status === "paid") {
              totalRevenue += invoice.totals?.total || 0;
              paidCount++;
            } else if (
              invoice.status === "pending" ||
              invoice.status === "partially_paid"
            ) {
              const due = invoice.totals?.due || invoice.totals?.total || 0;
              totalOutstanding += due;

              if (dueDate && dueDate < now) {
                totalOverdue += due;
              }
            }
          }
        });

        // Also fetch quotes if they exist
        try {
          const quotesRef = collection(db, "users", user.uid, "quotes");
          const quotesSnapshot = await getDocs(quotesRef);

          quotesSnapshot.forEach((doc) => {
            const quote = doc.data();
            invoicesList.push({ id: doc.id, ...quote, isQuote: true });

            const quoteDate = quote.dates?.quoteDate
              ? new Date(quote.dates.quoteDate)
              : quote.createdAt?.toDate
                ? quote.createdAt.toDate()
                : null;
            const dueDate = quote.dates?.validUntil
              ? new Date(quote.dates.validUntil)
              : null;

            if (quoteDate && quoteDate >= startDate) {
              if (quote.status === "paid") {
                totalRevenue += quote.totals?.total || 0;
                paidCount++;
              } else if (
                quote.status === "pending" ||
                quote.status === "partially_paid"
              ) {
                const due = quote.totals?.due || quote.totals?.total || 0;
                totalOutstanding += due;

                if (dueDate && dueDate < now) {
                  totalOverdue += due;
                }
              }
            }
          });
        } catch (error) {
          console.log("No quotes collection or error fetching quotes:", error);
        }

        // Calculate metrics
        const invoiceCount = invoicesList.length;
        const avgInvoice = paidCount > 0 ? totalRevenue / paidCount : 0;
        const collectionRate =
          invoiceCount > 0 ? (paidCount / invoiceCount) * 100 : 0;

        // Fetch expenses (assuming you have an expenses collection)
        let totalExpenses = 0;
        try {
          const expensesRef = collection(db, "users", user.uid, "expenses");
          const expensesSnapshot = await getDocs(expensesRef);

          expensesSnapshot.forEach((doc) => {
            const expense = doc.data();
            const expenseDate = expense.date
              ? new Date(expense.date)
              : expense.createdAt?.toDate
                ? expense.createdAt.toDate()
                : null;

            if (expenseDate && expenseDate >= startDate) {
              totalExpenses += expense.amount || 0;
            }
          });
        } catch (error) {
          console.log("No expenses collection yet");
        }

        const netProfit = totalRevenue - totalExpenses;
        const healthScore = calculateHealthScore(
          collectionRate,
          totalOverdue,
          netProfit,
          totalRevenue,
        );

        // Calculate revenue growth (compare with previous period)
        let previousRevenue = 0;
        let previousStartDate = new Date(startDate);
        let previousEndDate = new Date(startDate);

        if (timeRange === "week") {
          previousStartDate.setDate(previousStartDate.getDate() - 7);
        } else if (timeRange === "month") {
          previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        } else {
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        }

        invoicesList.forEach((invoice) => {
          const invoiceDate = invoice.dates?.invoiceDate
            ? new Date(invoice.dates.invoiceDate)
            : invoice.dates?.quoteDate
              ? new Date(invoice.dates.quoteDate)
              : invoice.createdAt?.toDate
                ? invoice.createdAt.toDate()
                : null;

          if (
            invoiceDate &&
            invoiceDate >= previousStartDate &&
            invoiceDate < startDate &&
            invoice.status === "paid"
          ) {
            previousRevenue += invoice.totals?.total || 0;
          }
        });

        const revenueGrowth =
          previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        setFinancialData({
          totalRevenue,
          avgInvoice,
          invoiceCount,
          outstanding: totalOutstanding,
          overdue: totalOverdue,
          paidThisMonth: paidCount,
          expenses: totalExpenses,
          netProfit,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          collectionRate: Math.round(collectionRate),
          healthScore,
        });

        // Process revenue data for chart (last 6 months)
        processRevenueData(invoicesList, startDate);

        // Process recent activity
        processRecentActivity(invoicesList);

        // Process top clients
        processTopClients(invoicesList);
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [user, timeRange]);

  const calculateHealthScore = (
    collectionRate,
    overdue,
    netProfit,
    revenue,
  ) => {
    let score = 0;

    // Collection rate (40 points)
    score += (collectionRate / 100) * 40;

    // Overdue ratio (30 points)
    const overdueRatio = revenue > 0 ? overdue / revenue : 0;
    score += Math.max(0, 30 - overdueRatio * 100);

    // Profitability (30 points)
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    score += Math.min(30, profitMargin);

    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const processRevenueData = (invoices, startDate) => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        revenue: 0,
        expenses: 0,
      });
    }

    invoices.forEach((invoice) => {
      const invoiceDate = invoice.dates?.invoiceDate
        ? new Date(invoice.dates.invoiceDate)
        : invoice.dates?.quoteDate
          ? new Date(invoice.dates.quoteDate)
          : invoice.createdAt?.toDate
            ? invoice.createdAt.toDate()
            : null;
      if (!invoiceDate) return;

      const monthDiff =
        (now.getFullYear() - invoiceDate.getFullYear()) * 12 +
        (now.getMonth() - invoiceDate.getMonth());
      const monthIndex = 5 - monthDiff;

      if (monthIndex >= 0 && monthIndex < 6 && invoice.status === "paid") {
        months[monthIndex].revenue += invoice.totals?.total || 0;
      }
    });

    setRevenueData(months);
  };

  const processRecentActivity = (invoices) => {
    const activity = invoices
      .filter(
        (inv) =>
          inv.dates?.invoiceDate || inv.dates?.quoteDate || inv.createdAt,
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.dates?.invoiceDate || a.dates?.quoteDate || a.createdAt?.toDate(),
        );
        const dateB = new Date(
          b.dates?.invoiceDate || b.dates?.quoteDate || b.createdAt?.toDate(),
        );
        return dateB - dateA;
      })
      .slice(0, 4)
      .map((invoice) => {
        const invoiceDate = new Date(
          invoice.dates?.invoiceDate ||
            invoice.dates?.quoteDate ||
            invoice.createdAt?.toDate(),
        );
        const now = new Date();
        const diffTime = Math.abs(now - invoiceDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let timeAgo = "";
        if (diffDays === 0) timeAgo = "Today";
        else if (diffDays === 1) timeAgo = "Yesterday";
        else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
        else timeAgo = `${Math.floor(diffDays / 7)} weeks ago`;

        let status = invoice.status || "pending";
        let type = invoice.isQuote ? "quote" : "invoice";

        if (status === "paid") {
          type = "payment";
          status = "received";
        } else if (
          invoice.dates?.dueDate &&
          new Date(invoice.dates.dueDate) < now
        ) {
          type = "overdue";
          status = "overdue";
        } else if (
          invoice.dates?.validUntil &&
          new Date(invoice.dates.validUntil) < now
        ) {
          type = "overdue";
          status = "overdue";
        } else {
          status = "sent";
        }

        return {
          type,
          client: invoice.customer?.name || "Unknown",
          amount: invoice.totals?.total || 0,
          date: timeAgo,
          status,
          documentNumber: invoice.quoteNumber || "N/A",
        };
      });

    setRecentActivity(activity);
  };

  const processTopClients = (invoices) => {
    const clientMap = new Map();

    invoices.forEach((invoice) => {
      if (invoice.status !== "paid") return;

      const clientName = invoice.customer?.name || "Unknown";
      const revenue = invoice.totals?.total || 0;

      if (clientMap.has(clientName)) {
        const client = clientMap.get(clientName);
        client.revenue += revenue;
        client.invoices += 1;
      } else {
        clientMap.set(clientName, {
          name: clientName,
          revenue,
          invoices: 1,
        });
      }
    });

    const sortedClients = Array.from(clientMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    setTopClients(sortedClients);
  };

  const formatCurrency = (amount) => {
    return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gray-300 p-4 md:p-6">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading financial data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Financial Overview
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitor your business performance at a glance
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTimeRange("week")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "week"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "month"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange("year")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "year"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>

          {/* Financial Health Score */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 mb-2">Financial Health Score</p>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold">
                      {financialData.healthScore}
                    </span>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 mb-1">
                        {financialData.healthScore >= 80 ? (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            <span>Excellent</span>
                          </>
                        ) : financialData.healthScore >= 60 ? (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            <span>Good</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4" />
                            <span>Needs Attention</span>
                          </>
                        )}
                      </div>
                      <p className="text-blue-100">
                        {financialData.healthScore >= 80
                          ? "Excellent financial health"
                          : financialData.healthScore >= 60
                            ? "Good financial health"
                            : "Monitor cash flow closely"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {financialData.collectionRate}%
                      </div>
                      <div className="text-xs text-blue-100">
                        Collection Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Total Revenue */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  {financialData.revenueGrowth >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>+{financialData.revenueGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      <span>{financialData.revenueGrowth}%</span>
                    </>
                  )}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(financialData.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-2">This {timeRange}</p>
            </div>

            {/* Outstanding */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Pending</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Outstanding</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(financialData.outstanding)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {financialData.invoiceCount - financialData.paidThisMonth}{" "}
                unpaid invoices
              </p>
            </div>

            {/* Overdue */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                  <TrendingDown className="w-4 h-4" />
                  <span>Urgent</span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Overdue</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(financialData.overdue)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Requires immediate attention
              </p>
            </div>

            {/* Net Profit */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Net Profit</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(financialData.netProfit)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Revenue minus expenses
              </p>
            </div>

            {/* Average Invoice */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Average Invoice</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(financialData.avgInvoice)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Per invoice</p>
            </div>

            {/* Invoice Count */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Total Invoices</h3>
              <p className="text-3xl font-bold text-gray-900">
                {financialData.invoiceCount}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {financialData.paidThisMonth} paid this {timeRange}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue vs Expenses Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue vs Expenses
                </h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {revenueData.map((data, index) => {
                  const maxValue = Math.max(
                    ...revenueData.map((d) => Math.max(d.revenue, d.expenses)),
                  );
                  const revenueWidth =
                    maxValue > 0 ? (data.revenue / maxValue) * 100 : 0;
                  const expenseWidth =
                    maxValue > 0 ? (data.expenses / maxValue) * 100 : 0;

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {data.month}
                        </span>
                        <div className="text-xs text-gray-500">
                          <span className="text-green-600 text-sm font-medium">
                            R{(data.revenue / 1000).toFixed(0)}k
                          </span>
                          {" / "}
                          <span className="text-red-600 text-sm font-medium">
                            R{(data.expenses / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${revenueWidth}%` }}
                          ></div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{ width: `${expenseWidth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-600">Expenses</span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Expense Breakdown
                </h2>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>

              {expenseBreakdown.length > 0 ? (
                <>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                      <svg
                        viewBox="0 0 200 200"
                        className="transform -rotate-90"
                      >
                        {expenseBreakdown.map((expense, index) => {
                          const total = expenseBreakdown.reduce(
                            (sum, e) => sum + e.amount,
                            0,
                          );
                          const percentage = (expense.amount / total) * 100;
                          const circumference = 2 * Math.PI * 80;
                          const offset = expenseBreakdown
                            .slice(0, index)
                            .reduce((sum, e) => {
                              return sum + (e.amount / total) * circumference;
                            }, 0);
                          const dashArray = `${(percentage / 100) * circumference} ${circumference}`;

                          return (
                            <circle
                              key={index}
                              cx="100"
                              cy="100"
                              r="80"
                              fill="none"
                              stroke={expense.color}
                              strokeWidth="40"
                              strokeDasharray={dashArray}
                              strokeDashoffset={-offset}
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(
                              expenseBreakdown.reduce(
                                (sum, e) => sum + e.amount,
                                0,
                              ),
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {expenseBreakdown.map((expense, index) => {
                      const total = expenseBreakdown.reduce(
                        (sum, e) => sum + e.amount,
                        0,
                      );
                      const percentage = (
                        (expense.amount / total) *
                        100
                      ).toFixed(1);

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: expense.color }}
                            ></div>
                            <span className="text-sm text-gray-700">
                              {expense.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(expense.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No expense data available</p>
                  <p className="text-sm mt-1">Add expenses to see breakdown</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>

              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 pb-4 border-b last:border-0"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.status === "received"
                            ? "bg-green-100"
                            : activity.status === "sent"
                              ? "bg-blue-100"
                              : "bg-red-100"
                        }`}
                      >
                        {activity.status === "received" ? (
                          <DollarSign className="w-5 h-5 text-green-600" />
                        ) : activity.status === "sent" ? (
                          <FileText className="w-5 h-5 text-blue-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {activity.client}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 capitalize">
                            {activity.type} • {activity.documentNumber}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm mt-1">
                    Create invoices to see activity
                  </p>
                </div>
              )}
            </div>

            {/* Top Clients */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Clients
                </h2>
                <Users className="w-5 h-5 text-gray-400" />
              </div>

              {topClients.length > 0 ? (
                <div className="space-y-4">
                  {topClients.map((client, index) => {
                    const maxRevenue = Math.max(
                      ...topClients.map((c) => c.revenue),
                    );
                    const width = (client.revenue / maxRevenue) * 100;

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {client.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {client.invoices} invoices
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(client.revenue)}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No client data yet</p>
                  <p className="text-sm mt-1">
                    Add paid invoices to see top clients
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialOverview;
