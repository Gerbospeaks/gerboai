import React from "react";

export const PayNowButton = ({ invoiceId, amount, currency = "USD", paymentUrl, color = "#6366f1" }) => {
  // Build the payment URL — swap this with your actual payment gateway link
  const url = paymentUrl || `https://pay.solidflo.co.za/${invoiceId}`;

  return (
    <div className="my-4 flex flex-col items-center gap-2 no-print-hide">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: color }}
        className="inline-flex items-center gap-2 px-8 py-3 text-white font-bold text-sm rounded-lg shadow hover:opacity-90 transition-opacity no-print"
      >
        💳 PAY NOW — {currency} {Number(amount).toFixed(2)}
      </a>
      <p className="text-[10px] text-gray-400 print-only hidden">
        Pay online: <span className="font-mono text-blue-600">{url}</span>
      </p>
    </div>
  );
};