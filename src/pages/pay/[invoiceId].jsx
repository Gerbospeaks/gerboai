// pages/pay/[invoiceId].jsx
import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function PayPage({ params }) {
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const load = async () => {
      const db = getFirestore();
      const snap = await getDoc(doc(db, "invoices", params.invoiceId));
      if (snap.exists()) setInvoice(snap.data());
    };
    load();
  }, [params.invoiceId]);

  const handlePay = () => {
    // Redirect to Peach Payments / PayFast / Stripe
    window.location.href = `https://www.payfast.co.za/eng/process?merchant_id=YOUR_ID&amount=${invoice.total}&item_name=Invoice+${params.invoiceId}&return_url=https://solidflo.co.za/pay/success`;
  };

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-content-center bg-gray-50 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Invoice #{params.invoiceId}</h1>
        <p className="text-gray-500 mb-6">From {invoice.businessName}</p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Due</span>
            <span>R {Number(invoice.total).toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={handlePay}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition"
        >
          Pay Now
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">
          Secured by PayFast · SSL Encrypted
        </p>
      </div>
    </div>
  );
}