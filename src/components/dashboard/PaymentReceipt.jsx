import React from "react";
import { Check } from "lucide-react";

const PaymentReceipt = ({ payment, invoice, businessInfo }) => {
  return (
    <div
      id="payment-receipt-print"
      className="hidden print:block bg-white p-8 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
        {businessInfo?.logoUrl && (
          <img
            src={businessInfo.logoUrl}
            alt="Logo"
            className="h-16 mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-slate-900">PAYMENT RECEIPT</h1>
        <p className="text-slate-600 mt-2">
          Receipt #{payment.id?.slice(-8).toUpperCase() || "N/A"}
        </p>
      </div>

      {/* Business Info */}
      <div className="mb-6 text-center">
        <div className="font-bold text-lg">
          {businessInfo?.businessName || "N/A"}
        </div>
        <div className="text-sm text-slate-600">
          {businessInfo?.addressLine1 || ""}
        </div>
        <div className="text-sm text-slate-600">
          {businessInfo?.addressLine2 || ""} {businessInfo?.city || ""}
        </div>
        <div className="text-sm text-slate-600">
          Tel: {businessInfo?.primaryPhone || "N/A"}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <h2 className="text-xl font-bold text-emerald-900">
            PAYMENT RECEIVED
          </h2>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-emerald-900 mb-2">
            R{payment?.amount?.toFixed(2) || "0.00"}
          </div>
          <div className="text-sm text-slate-600">
            {payment?.paymentDate
              ? new Date(payment.paymentDate).toLocaleDateString("en-ZA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </div>
        </div>
      </div>

      {/* Customer & Invoice Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-bold text-slate-900 mb-2">CUSTOMER</h3>
          <div className="text-sm">
            <div>{invoice?.customer?.name || "N/A"}</div>
            <div className="text-slate-600">
              {invoice?.customer?.email || ""}
            </div>
            <div className="text-slate-600">
              {invoice?.customer?.phone || ""}
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-2">INVOICE DETAILS</h3>
          <div className="text-sm">
            <div>Invoice: {invoice?.jobCardNumber || "N/A"}</div>
            <div>Method: {payment?.method?.toUpperCase() || "N/A"}</div>
            {payment?.reference && <div>Ref: {payment.reference}</div>}
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      {invoice?.vehicle && (
        <div className="mb-6 bg-slate-50 p-4 rounded-lg">
          <h3 className="font-bold text-slate-900 mb-2">VEHICLE</h3>
          <div className="text-sm">
            <div>
              {invoice.vehicle.year} {invoice.vehicle.make}{" "}
              {invoice.vehicle.model}
            </div>
            <div className="text-slate-600">
              Registration: {invoice.vehicle.registration}
            </div>
          </div>
        </div>
      )}

      {/* Payment Breakdown */}
      <div className="border-t-2 border-slate-200 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-slate-600">Invoice Total:</span>
          <span className="font-bold">
            R{invoice?.totals?.total?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-slate-600"><span className="hidden sm:inline">Previous</span> Payments:</span>
          <span className="font-bold">
            R
            {((invoice?.totals?.paid || 0) - (payment?.amount || 0)).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between mb-2 text-emerald-600">
          <span className="font-bold">This Payment:</span>
          <span className="font-bold">
            R{payment?.amount?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t-2 border-slate-200 pt-2 mt-2">
          <span>Balance Due:</span>
          <span
            className={
              invoice?.totals?.due <= 0 ? "text-emerald-600" : "text-rose-600"
            }
          >
            R{invoice?.totals?.due?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      {/* Payment Notes */}
      {payment?.notes && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-slate-900 mb-2">Notes:</h3>
          <p className="text-sm text-slate-700">{payment.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-600 border-t border-slate-200 pt-4">
        <p className="font-bold">Thank you for your payment!</p>
        <p className="mt-2">
          This is an official receipt. Please keep for your records.
        </p>
        <p className="mt-4 text-xs">
          Generated on{" "}
          {new Date().toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default PaymentReceipt;
