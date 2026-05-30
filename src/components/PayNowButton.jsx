import React from "react";

export const PayNowButton = ({ invoiceId, amount, currency = "ZAR", paymentUrl, color = "#6366f1" }) => {
  const url = paymentUrl || `https://pay.solidflo.co.za/${invoiceId}`;

  return (
    <div className="my-4 flex flex-col items-center gap-2">

      {/* Visible on screen, hidden when printing */}
      
       <a href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: color }}
        className="print:hidden inline-flex items-center gap-2 px-8 py-3 text-white font-bold text-sm rounded-lg shadow hover:opacity-90 transition-opacity"
      >
        💳 PAY NOW — {currency} {Number(amount).toFixed(2)}
      </a>

      {/* Hidden on screen, visible when printing */}
      <p className="hidden print:block text-[10px] text-gray-400">
        Pay online: <span className="font-mono text-blue-600">{url}</span>
      </p>

    </div>
  );
};