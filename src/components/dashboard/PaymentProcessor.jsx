import React, { useState, useEffect } from "react";
import PaymentReceipt from "./PaymentReceipt";
import {
  CreditCard,
  Banknote,
  Smartphone,
  X,
  Check,
  Clock,
  AlertCircle,
  Download,
  Printer,
  Mail,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

const PaymentProcessor = ({
  showModal,
  setShowModal,
  invoice,
  onPaymentComplete,
  user,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);

  // Calculate totals
  const totalAmount = invoice?.totals?.total || 0;
  const totalPaid =
    payments.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const balanceDue = totalAmount - totalPaid;

  // Load existing payments
  useEffect(() => {
    if (invoice?.id && user?.uid) {
      loadPayments();
    }
  }, [invoice?.id, user?.uid]);

  const loadPayments = async () => {
    try {
      const collectionName =
        invoice.documentType === "quote" ? "quotations" : "invoices";
      const paymentsRef = collection(
        db,
        "users",
        user.uid,
        collectionName,
        invoice.id,
        "payments",
      );
      const q = query(paymentsRef, orderBy("paymentDate", "desc"));
      const snapshot = await getDocs(q);

      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);

    if (amount > balanceDue) {
      if (
        !window.confirm(
          `Payment amount (R${amount.toFixed(2)}) exceeds balance due (R${balanceDue.toFixed(2)}). Continue with overpayment?`,
        )
      ) {
        return;
      }
    }

    setLoading(true);

    try {
      const collectionName =
        invoice.documentType === "quote" ? "quotations" : "invoices";
      const paymentData = {
        amount,
        method: paymentMethod,
        reference: paymentReference,
        notes: paymentNotes,
        paymentDate: new Date(paymentDate).toISOString(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      };

      // Add payment to subcollection
      const paymentsRef = collection(
        db,
        "users",
        user.uid,
        collectionName,
        invoice.id,
        "payments",
      );
      const paymentDoc = await addDoc(paymentsRef, paymentData);

      // Update invoice totals
      const newTotalPaid = totalPaid + amount;
      const newBalanceDue = totalAmount - newTotalPaid;
      const newStatus =
        newBalanceDue <= 0
          ? "paid"
          : newTotalPaid > 0
            ? "partially_paid"
            : "pending";

      await updateDoc(doc(db, "users", user.uid, collectionName, invoice.id), {
        "totals.paid": newTotalPaid,
        "totals.due": newBalanceDue,
        status: newStatus,
        lastPaymentDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Store last payment for receipt
      setLastPayment({
        id: paymentDoc.id,
        ...paymentData,
        amount,
      });

      // Reset form
      setPaymentAmount("");
      setPaymentReference("");
      setPaymentNotes("");

      // Reload payments
      await loadPayments();

      // Show receipt option
      setShowReceipt(true);

      if (onPaymentComplete) {
        onPaymentComplete();
      }

      alert("✅ Payment recorded successfully!");
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to record payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId, amount) => {
    if (
      !window.confirm(
        `Delete payment of R${amount.toFixed(2)}? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const collectionName =
        invoice.documentType === "quote" ? "quotations" : "invoices";

      // Delete payment document
      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
          collectionName,
          invoice.id,
          "payments",
          paymentId,
        ),
        {
          deleted: true,
          deletedAt: serverTimestamp(),
        },
      );

      // Update invoice totals
      const newTotalPaid = totalPaid - amount;
      const newBalanceDue = totalAmount - newTotalPaid;
      const newStatus =
        newBalanceDue <= 0
          ? "paid"
          : newTotalPaid > 0
            ? "partially_paid"
            : "pending";

      await updateDoc(doc(db, "users", user.uid, collectionName, invoice.id), {
        "totals.paid": newTotalPaid,
        "totals.due": newBalanceDue,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      await loadPayments();
      alert("Payment deleted successfully");
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment");
    }
  };

  const paymentMethodIcons = {
    cash: Banknote,
    card: CreditCard,
    eft: Smartphone,
    check: CreditCard,
  };

  const paymentMethodColors = {
    cash: "emerald",
    card: "blue",
    eft: "purple",
    check: "orange",
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Payment Processing
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Invoice #{invoice?.jobCardNumber || "N/A"}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
            {/* Left Column - Payment Summary */}
            <div className="space-y-6">
              {/* Amount Summary */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-300">
                    <span className="text-slate-600 font-medium">
                      Invoice Total:
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      R{totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-300">
                    <span className="text-emerald-600 font-medium">
                      Total Paid:
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                      R{totalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-900 font-bold">
                      Balance Due:
                    </span>
                    <span
                      className={`text-lg sm:text-2xl font-bold ${
                        balanceDue <= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      R{balanceDue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4">
                  {balanceDue <= 0 ? (
                    <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 justify-center font-bold">
                      <Check className="w-5 h-5" />
                      Fully Paid
                    </div>
                  ) : totalPaid > 0 ? (
                    <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg flex items-center gap-2 justify-center font-bold">
                      <Clock className="w-5 h-5" />
                      Partially Paid
                    </div>
                  ) : (
                    <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg flex items-center gap-2 justify-center font-bold">
                      <AlertCircle className="w-5 h-5" />
                      Unpaid
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Customer Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">Name:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {invoice?.customer?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Email:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {invoice?.customer?.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Phone:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {invoice?.customer?.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Vehicle:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      {invoice?.vehicle?.year} {invoice?.vehicle?.make}{" "}
                      {invoice?.vehicle?.model}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Payment History
                </h3>
                {payments.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">
                    No payments recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => {
                      const Icon =
                        paymentMethodIcons[payment.method] || CreditCard;
                      const color =
                        paymentMethodColors[payment.method] || "blue";

                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}
                            >
                              <Icon className={`w-5 h-5 text-${color}-600`} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                R{payment.amount.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-600">
                                {payment.method.toUpperCase()} •{" "}
                                {new Date(
                                  payment.paymentDate,
                                ).toLocaleDateString()}
                              </div>
                              {payment.reference && (
                                <div className="text-xs text-slate-500">
                                  Ref: {payment.reference}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeletePayment(payment.id, payment.amount)
                            }
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Add Payment Form */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Record New Payment
                </h3>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "cash", label: "Cash", icon: Banknote },
                      { value: "card", label: "Card", icon: CreditCard },
                      { value: "eft", label: "EFT", icon: Smartphone },
                      { value: "check", label: "Check", icon: CreditCard },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.value;
                      return (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-slate-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 mx-auto mb-2 ${
                              isSelected ? "text-blue-600" : "text-slate-400"
                            }`}
                          />
                          <div
                            className={`text-sm font-bold ${
                              isSelected ? "text-blue-600" : "text-slate-700"
                            }`}
                          >
                            {method.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Payment Amount <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">
                      R
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  {paymentAmount && parseFloat(paymentAmount) > balanceDue && (
                    <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Overpayment: R
                      {(parseFloat(paymentAmount) - balanceDue).toFixed(2)}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setPaymentAmount(balanceDue.toFixed(2))}
                      className="text-xs bg-white border border-slate-300 px-3 py-1 rounded-lg hover:bg-slate-50 font-semibold"
                    >
                      Pay Full Balance
                    </button>
                    <button
                      onClick={() =>
                        setPaymentAmount((balanceDue / 2).toFixed(2))
                      }
                      className="text-xs bg-white border border-slate-300 px-3 py-1 rounded-lg hover:bg-slate-50 font-semibold"
                    >
                      Pay 50%
                    </button>
                  </div>
                </div>

                {/* Payment Date */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Payment Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Reference Number */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Transaction ID, Check #, etc."
                  />
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="3"
                    placeholder="Additional payment notes..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleAddPayment}
                  disabled={loading || !paymentAmount}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Record Payment
                    </>
                  )}
                </button>
              </div>

              {/* Receipt Options */}
              {showReceipt && lastPayment && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-emerald-900">
                      Payment Recorded!
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.print()}
                      className="w-full bg-white border-2 border-emerald-300 text-emerald-700 py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Receipt
                    </button>
                    <button
                      onClick={() => {
                        /* Email functionality */
                      }}
                      className="w-full bg-white border-2 border-emerald-300 text-emerald-700 py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Receipt
                    </button>
                    <button
                      onClick={() => {
                        /* Download functionality */
                      }}
                      className="w-full bg-white border-2 border-emerald-300 text-emerald-700 py-3 rounded-xl hover:bg-emerald-50 transition-all font-bold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor;
