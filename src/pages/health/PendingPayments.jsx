import React, { useState, useEffect } from "react";
import {
  Clock,
  Search,
  Filter,
  DollarSign,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Download,
  Printer,
} from "lucide-react";
import { db } from "../../firebase";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,  // Make sure this is imported
  doc,        // Make sure this is imported
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
const PendingPayments = ({ user, savedInvoices, onLoadInvoice }) => {
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (savedInvoices) {
      const pending = savedInvoices.filter((inv) => inv.status === "pending");
      setPendingInvoices(pending);
      setFilteredInvoices(pending);
    }
  }, [savedInvoices]);

  useEffect(() => {
    filterAndSortInvoices();
  }, [searchTerm, sortBy, pendingInvoices]);

  const filterAndSortInvoices = () => {
    let filtered = [...pendingInvoices];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.patient?.phone?.includes(searchTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "amount-high":
          return (b.totals?.total || 0) - (a.totals?.total || 0);
        case "amount-low":
          return (a.totals?.total || 0) - (b.totals?.total || 0);
        case "patient":
          return (a.patient?.name || "").localeCompare(b.patient?.name || "");
        default:
          return 0;
      }
    });

    setFilteredInvoices(filtered);
  };

  const handleMarkAsPaid = async (invoice) => {
    if (!user?.uid || !invoice.id) return;

    const confirmPay = window.confirm(
      `Mark invoice ${invoice.invoiceNumber} as paid?`
    );
    if (!confirmPay) return;

    try {
      await updateDoc(doc(db, "users", user.uid, "invoices", invoice.id), {
        status: "completed",
        dates: {
          ...invoice.dates,
          completedDate: new Date().toISOString(),
        },
        totals: {
          ...invoice.totals,
          paid: invoice.totals?.total || 0,
          due: 0,
        },
      });

      alert("Invoice marked as paid!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice");
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const handleSendReminder = (invoice) => {
    alert(
      `Payment reminder would be sent to ${invoice.patient?.email || "patient"}`
    );
  };

  const formatCurrency = (amount) => {
    return `R${(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-ZA");
  };

  const getDaysOverdue = (date) => {
    if (!date) return 0;
    const invoiceDate = date.toDate ? date.toDate() : new Date(date);
    const today = new Date();
    const diffTime = today - invoiceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalPending = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.totals?.total || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center space-x-3">
              <Clock className="w-8 h-8" />
              <span>Pending Payments</span>
            </h1>
            <p className="text-orange-100">
              Track and manage outstanding invoices
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{filteredInvoices.length}</div>
            <div className="text-sm text-orange-100">Outstanding Invoices</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalPending)}
          </div>
          <div className="text-sm text-gray-500">Total Amount Due</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {
              filteredInvoices.filter(
                (inv) => getDaysOverdue(inv.createdAt) > 30
              ).length
            }
          </div>
          <div className="text-sm text-gray-500">Overdue (30+ days)</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {
              filteredInvoices.filter(
                (inv) => getDaysOverdue(inv.createdAt) <= 7
              ).length
            }
          </div>
          <div className="text-sm text-gray-500">Recent (7 days)</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice number, patient name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
              <option value="patient">Patient Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Pending Payments
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "No invoices match your search criteria"
                : "All invoices have been paid!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => {
                  const daysOverdue = getDaysOverdue(invoice.createdAt);
                  const isOverdue = daysOverdue > 30;

                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.invoiceNumber || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {invoice.medical?.diagnosis || "No diagnosis"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.patient?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.patient?.phone || "No phone"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(invoice.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {daysOverdue} days ago
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(invoice.totals?.total)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOverdue
                              ? "bg-red-100 text-red-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {isOverdue ? "Overdue" : "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendReminder(invoice)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Send Reminder"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMarkAsPaid(invoice)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onLoadInvoice && onLoadInvoice(invoice)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <h2 className="text-xl font-semibold">Invoice Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-auto p-6 space-y-6">
              {/* Invoice Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span>Invoice Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Invoice Number:</span>
                    <div className="font-medium">
                      {selectedInvoice.invoiceNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <div className="font-medium">
                      {formatDate(selectedInvoice.createdAt)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount Due:</span>
                    <div className="font-semibold text-red-600 text-lg">
                      {formatCurrency(selectedInvoice.totals?.total)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Days Outstanding:</span>
                    <div className="font-medium">
                      {getDaysOverdue(selectedInvoice.createdAt)} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Patient Information</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {selectedInvoice.patient?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedInvoice.patient?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedInvoice.patient?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span>
                      {selectedInvoice.patient?.insuranceProvider || "No insurance"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Services</h3>
                <div className="space-y-2">
                  {selectedInvoice.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm py-2 border-b"
                    >
                      <span>{item.description}</span>
                      <span className="font-medium">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleMarkAsPaid(selectedInvoice)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark as Paid</span>
                </button>
                <button
                  onClick={() => handleSendReminder(selectedInvoice)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Reminder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPayments;