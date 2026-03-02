// src/pages/PaymentPage.jsx
// Public page — no login required. Customer lands here from invoice email link.

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  buildPayFastPayload,
  PAYFAST_URL,
  PAYFAST_SANDBOX,
  getPaymentPageUrl,
} from "../utils/payfastUtils";
import { CheckCircle, XCircle, Clock, Car, User, FileText, CreditCard, AlertTriangle } from "lucide-react";

const WORKER_URL = process.env.REACT_APP_API_URL?.replace("/upload-logo", "") || "";

export default function PaymentPage() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice]         = useState(null);
  const [business, setBusiness]       = useState(null);
  const [payfast, setPayfast]         = useState(null); // merchant creds
  const [status, setStatus]           = useState("loading"); // loading | ready | already_paid | error
  const [error, setError]             = useState("");
  const formRef = useRef(null);

  // ── Load invoice + business info ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const db = getFirestore();

        // 1. Find the invoice — we store userId on each invoice for public lookup
        //    Search in invoices collection across users requires a collectionGroup query
        //    OR we embed userId on the invoice doc (which buildJobCardPayload should do)
        //    For now we query collectionGroup "invoices"
        const invoicesQuery = query(
          collection(db, "__invoices_lookup__"), // replaced below
        );

        // Use collectionGroup to find invoice by ID across all users
        // NOTE: You must enable collectionGroup indexing in Firestore for "invoices"
        const snap = await getDoc(
          // We'll try a direct path using the stored userId on the invoice
          // First try — look up a top-level /invoice_links/{invoiceId} doc
          // which we create when the invoice is saved
          doc(db, "invoice_links", invoiceId)
        );

        let invoiceData = null;
        let userId = null;

        if (snap.exists()) {
          // invoice_links/{invoiceId} → { userId, collectionName }
          const link = snap.data();
          userId = link.userId;
          const colName = link.collectionName || "invoices";
          const invSnap = await getDoc(doc(db, "users", userId, colName, invoiceId));
          if (invSnap.exists()) {
            invoiceData = { id: invSnap.id, userId, ...invSnap.data() };
          }
        }

        if (!invoiceData) {
          setError("Invoice not found. The link may be invalid or expired.");
          setStatus("error");
          return;
        }

        // 2. Check payment status
        if (invoiceData.status === "paid") {
          setInvoice(invoiceData);
          setStatus("already_paid");
          return;
        }

        // 3. Load business info + PayFast creds
        const bizSnap = await getDoc(
          doc(db, "users", userId, "settings", "businessInfo")
        );
        if (bizSnap.exists()) {
          const bizData = bizSnap.data();
          setBusiness(bizData);

          // PayFast creds stored under settings/payfast
          const pfSnap = await getDoc(
            doc(db, "users", userId, "settings", "payfast")
          );
          if (pfSnap.exists()) {
            setPayfast(pfSnap.data());
          }
        }

        setInvoice(invoiceData);
        setStatus("ready");
      } catch (e) {
        console.error(e);
        setError("Failed to load invoice. Please contact the business.");
        setStatus("error");
      }
    };
    load();
  }, [invoiceId]);

  // ── Build PayFast form payload ─────────────────────────────────────────────
  const payfastPayload = (() => {
    if (!invoice || !payfast?.merchantId) return null;

    const appUrl = process.env.REACT_APP_APP_URL || window.location.origin;
    return buildPayFastPayload({
      invoice,
      merchantId:   payfast.merchantId,
      merchantKey:  payfast.merchantKey,
      passphrase:   payfast.passphrase || "",
      notifyUrl:    `${WORKER_URL}/payfast-itn`,
      returnUrl:    `${appUrl}/pay/${invoiceId}/success`,
      cancelUrl:    `${appUrl}/pay/${invoiceId}/cancel`,
    });
  })();

  // ─── Format helpers ────────────────────────────────────────────────────────
  const fmt = (n) =>
    new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n || 0);

  // ─── ALREADY PAID ──────────────────────────────────────────────────────────
  if (status === "already_paid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invoice Already Paid</h1>
          <p className="text-gray-500 text-sm mb-4">
            This invoice ({invoice?.jobCardNumber}) has already been settled. Thank you!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800 font-semibold">
            {fmt(invoice?.totals?.total)} — Paid ✓
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR ─────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (status === "loading" || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const amountDue = invoice.totals?.due ?? invoice.totals?.total ?? 0;

  // ─── READY ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-4">

        {/* Sandbox warning */}
        {PAYFAST_SANDBOX && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium px-4 py-2.5 rounded-xl">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            TEST MODE — No real money will be charged
          </div>
        )}

        {/* Business header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-5">
            {business?.logoUrl ? (
              <img src={business.logoUrl} alt="logo" className="h-12 w-auto object-contain rounded-lg" />
            ) : (
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-gray-900 text-base">{business?.businessName || "Invoice"}</h2>
              <p className="text-gray-400 text-xs">{business?.primaryPhone}</p>
            </div>
          </div>

          {/* Invoice number + amount */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                {invoice.documentType === "quote" ? "Quote" : "Invoice"}
              </span>
              <span className="text-xs text-blue-400">{invoice.jobCardNumber}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{fmt(amountDue)}</div>
            {invoice.totals?.paid > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {fmt(invoice.totals.paid)} already paid · {fmt(amountDue)} remaining
              </p>
            )}
          </div>

          {/* Customer + vehicle details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{invoice.customer?.name}</span>
            </div>
            {invoice.vehicle?.make && (
              <div className="flex items-center gap-2 text-gray-600">
                <Car className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  {[invoice.vehicle?.year, invoice.vehicle?.make, invoice.vehicle?.model]
                    .filter(Boolean).join(" ")}
                  {invoice.vehicle?.registration && ` · ${invoice.vehicle.registration}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Line items summary */}
        {invoice.items?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Services & Parts</span>
            </div>
            <div className="divide-y divide-gray-50">
              {invoice.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{item.description}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded font-medium ${item.type === "Labor" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                      {item.type}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">{fmt(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-sm font-bold text-gray-900">
              <span>Total</span>
              <span className="text-blue-600">{fmt(invoice.totals?.total)}</span>
            </div>
          </div>
        )}

        {/* Pay Now button / no creds warning */}
        {payfastPayload ? (
          <>
            <form ref={formRef} method="POST" action={PAYFAST_URL} className="hidden">
              {Object.entries(payfastPayload).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
            </form>
            <button
              onClick={() => formRef.current?.submit()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg rounded-2xl shadow-lg transition-all"
            >
              <CreditCard className="w-5 h-5" />
              Pay {fmt(amountDue)} Securely
            </button>
            <p className="text-center text-xs text-gray-400">
              Powered by PayFast · SSL encrypted · Your card details are never stored
            </p>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-amber-800">Online payments not yet configured</p>
            <p className="text-xs text-amber-600 mt-1">
              Please contact {business?.businessName} directly to arrange payment.
            </p>
            {business?.primaryPhone && (
              <a href={`tel:${business.primaryPhone}`}
                className="inline-block mt-3 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-medium rounded-xl transition-colors">
                Call {business.primaryPhone}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Success / Cancel sub-pages ────────────────────────────────────────────
export function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm">
          Thank you for your payment. The business will be notified and you'll receive a confirmation shortly.
        </p>
      </div>
    </div>
  );
}

export function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-9 h-9 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
        <p className="text-gray-500 text-sm">
          No payment was taken. You can close this page or try again using the original link.
        </p>
      </div>
    </div>
  );
}