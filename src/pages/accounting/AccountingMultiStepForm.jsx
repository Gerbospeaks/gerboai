import React, { useState } from "react";
import {
  Users,
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Trash2,
} from "lucide-react";

/* ─── shared input className ─── */
const INPUT =
  "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400 text-sm";

const AccountingMultiStepForm = ({
  /* client */
  customerName,
  setCustomerName,
  customerId,
  setCustomerId,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress,
  /* dates / terms */
  documentType,
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  paymentTerms,
  setPaymentTerms,
  /* items */
  items,
  newItem,
  setNewItem,
  handleAddItem,
  /* payment extras */
  paymentMethod,
  setPaymentMethod,
  serviceGuarantee,
  setServiceGuarantee,
  /* quote flag */
  isQuoteMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const next = () => currentStep < totalSteps && setCurrentStep((s) => s + 1);
  const prev = () => currentStep > 1 && setCurrentStep((s) => s - 1);

  /* helper: remove item by index (passed down if available, else local) */
  const removeItem = (idx) => {
    /* items is controlled by parent — we mutate via setItems if exposed,
       otherwise fall back to a no-op.  The parent already passes items/setItems
       via handleAddItem pattern; expose a removeItem prop or handle here. */
    // Uncomment & wire if parent exposes setItems:
    // setItems(prev => prev.filter((_, i) => i !== idx));
  };

  /* ─────────────── STEP INDICATOR ─────────────── */
  const STEPS = ["Client", "Details", "Line Items", "Payment"];
  const StepBar = () => (
    <div className="flex items-center justify-between mb-0">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = currentStep > step;
        const active = currentStep === step;
        return (
          <React.Fragment key={step}>
            {/* circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                  ${active ? "bg-blue-600 text-white ring-4 ring-blue-100 scale-110" : ""}
                  ${done ? "bg-blue-600 text-white" : ""}
                  ${!active && !done ? "bg-slate-200 text-slate-500" : ""}
                `}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-xs mt-2 font-semibold transition-colors
                  ${active ? "text-blue-600" : done ? "text-slate-500" : "text-slate-400"}`}
              >
                {label}
              </span>
            </div>

            {/* connector */}
            {step < totalSteps && (
              <div className="flex-1 mx-1.5 mb-5">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    done ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 1 – CLIENT INFORMATION
     ═══════════════════════════════════════════════════════════════ */
  const Step1 = () => (
    <div className="p-6 sm:p-8">
      {/* page header */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          Customer Information
        </h2>
        <p className="text-slate-500 mt-2 ml-0 sm:ml-13 text-sm">
          Enter customer and billing details
        </p>
      </div>

      {/* INVOICE TO */}
      <AccentSection color="bg-blue-600" title="INVOICE TO">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Customer Name" required>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={INPUT} placeholder="Enter customer name" />
          </Field>

          <Field label="Customer ID">
            <input type="text" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={INPUT} placeholder="e.g. CUST-2026-1234" />
          </Field>

          <Field label="Email" required>
            <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={INPUT} placeholder="email@example.com" />
          </Field>

          <Field label="Phone" required>
            <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className={INPUT} placeholder="082 123 4567" />
          </Field>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Address" required>
              <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className={INPUT} placeholder="Street address, City, Postal Code" />
            </Field>
          </div>
        </div>
      </AccentSection>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 2 – INVOICE / QUOTE DETAILS
     ═══════════════════════════════════════════════════════════════ */
  const Step2 = () => (
    <div className="p-6 sm:p-8">
      {/* page header */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          {documentType === "quote" ? "Quote" : "Invoice"} Details
        </h2>
        <p className="text-slate-500 mt-2 text-sm">Set dates and payment terms</p>
      </div>

      <AccentSection color="bg-emerald-600" title="DATES & TERMS">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={documentType === "quote" ? "Quote Date" : "Invoice Date"} required>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={INPUT} />
          </Field>

          <Field label={documentType === "quote" ? "Valid Until" : "Due Date"} required>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT} />
          </Field>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Payment Terms" required>
              <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className={INPUT}>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Net 90">Net 90</option>
              </select>
            </Field>
          </div>
        </div>

        {/* info card */}
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700 font-semibold mb-1">💡 Payment Terms Guide</p>
          <ul className="text-xs text-blue-600 list-disc ml-5 space-y-0.5">
            <li><strong>Due on Receipt</strong> – Payment expected immediately</li>
            <li><strong>Net 15 / 30 / 60 / 90</strong> – Payment due within the specified number of days</li>
          </ul>
        </div>
      </AccentSection>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 3 – LINE ITEMS
     ═══════════════════════════════════════════════════════════════ */
  const Step3 = () => (
    <div className="p-6 sm:p-8">
      {/* page header */}
      <div className="mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          Description
        </h2>
        <p className="text-slate-500 mt-2 text-sm">Add services and parts to the {documentType}</p>
      </div>

      {/* ── ADD ITEM FORM ── */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 sm:p-6 mb-6 border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" /> Add New Item
        </h3>

        {/* mobile: stack; sm+: 5-col row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <select
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            className={INPUT}
          >
            <option value="Service">Service</option>
            <option value="Consultation">Consultation</option>
            <option value="Bookkeeping">Bookkeeping</option>
            <option value="Tax Preparation">Tax Preparation</option>
            <option value="Audit">Audit</option>
          </select>

          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className={INPUT}
          />

          <input
            type="number"
            placeholder="Rate"
            value={newItem.rate}
            onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
            className={INPUT}
          />

          <input
            type="number"
            placeholder="Qty"
            value={newItem.qty}
            onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
            className={INPUT}
          />

          <button
            onClick={handleAddItem}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2.5 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 transition-all font-semibold shadow-md hover:shadow-lg text-sm"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* ── ITEMS TABLE or EMPTY STATE ── */}
      {items.length > 0 ? (
        <>
          <h3 className="text-base font-bold text-slate-900 mb-3">Items Added</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  {["Type", "Description", "Rate", "Qty", "Amount", ""].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-4 text-xs font-bold text-slate-700 ${
                        i >= 2 && i <= 4 ? "text-right" : i === 5 ? "text-center w-16" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.type === "Service" || item.type === "Labor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{item.description}</td>
                    <td className="px-4 py-3.5 text-right text-slate-700">R{Number(item.rate).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-right text-slate-700">{item.qty}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">R{item.amount.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── TOTALS BOX ── */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="space-y-3">
              <Row label="Subtotal:" value={`R${subtotal.toFixed(2)}`} />
              <Row label="VAT (15%):" value={`R${vat.toFixed(2)}`} />
              <div className="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-blue-300">
                <span className="text-slate-900">Total:</span>
                <span className="text-blue-700 text-2xl">R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* empty state */
        <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">No items added yet</p>
          <p className="text-sm text-slate-500 mt-1">Add services or parts using the form above</p>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     STEP 4 – PAYMENT TERMS
     ═══════════════════════════════════════════════════════════════ */
  const Step4 = () => (
    <div className="p-6 sm:p-8">
      {/* page header */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          Payment Terms
        </h2>
      </div>

      <AccentSection color="bg-purple-600" title="PAYMENT DETAILS">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Payment Method" required>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={INPUT}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="EFT">EFT</option>
              <option value="Cash/Card/EFT">Cash / Card / EFT</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </Field>

          <Field label="Payment Terms" required>
            <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className={INPUT}>
              {isQuoteMode || documentType === "quote" ? (
                <>
                  <option value="Quote Valid 30 Days">Quote Valid 30 Days</option>
                  <option value="Quote Valid 60 Days">Quote Valid 60 Days</option>
                  <option value="Quote Valid 90 Days">Quote Valid 90 Days</option>
                </>
              ) : (
                <>
                  <option value="Due on Completion">Due on Completion</option>
                  <option value="Net 7 Days">Net 7 Days</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Net 60 Days">Net 60 Days</option>
                  <option value="50% Deposit, Balance on Completion">50% Deposit, Balance on Completion</option>
                </>
              )}
            </select>
          </Field>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Service Guarantee">
              <select value={serviceGuarantee} onChange={(e) => setServiceGuarantee(e.target.value)} className={INPUT}>
                <option value="7 Day Satisfaction Guarantee">7 Day Satisfaction Guarantee</option>
                <option value="14 Day Satisfaction Guarantee">14 Day Satisfaction Guarantee</option>
                <option value="30 Day Satisfaction Guarantee">30 Day Satisfaction Guarantee</option>
                <option value="100% Satisfaction Guaranteed">100% Satisfaction Guaranteed</option>
                <option value="Money Back Guarantee">Money Back Guarantee</option>
                <option value="No Guarantee">No Guarantee</option>
              </select>
            </Field>
          </div>
        </div>
      </AccentSection>

      {/* ── LIVE PREVIEW CARD ── */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Preview</h3>
        <div className="space-y-0">
          <Row label="Payment Method:" value={paymentMethod} />
          <Row label="Payment Terms:" value={paymentTerms} />
          <Row label="Service Guarantee:" value={serviceGuarantee} noBorder />
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* step bar inside top padding */}
      <div className="px-6 sm:px-8 pt-6 pb-2">
        <StepBar />
      </div>

      {/* active step content */}
      {currentStep === 1 && <Step1 />}
      {currentStep === 2 && <Step2 />}
      {currentStep === 3 && <Step3 />}
      {currentStep === 4 && <Step4 />}

      {/* ── NAVIGATION FOOTER ── */}
      <div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <button
          onClick={prev}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
            currentStep === 1
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {/* step counter badge */}
        <span className="text-sm text-slate-600 font-bold bg-white px-4 py-2 rounded-lg border border-slate-200">
          Step {currentStep} of {totalSteps}
        </span>

        <button
          onClick={next}
          disabled={currentStep === totalSteps}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm shadow-md ${
            currentStep === totalSteps
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
          }`}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════ TINY HELPERS ═══════════════ */

/** Label + children wrapper */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Coloured-bar section header */
function AccentSection({ color, title, children }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-5">
        <div className={`h-8 w-1 ${color} rounded-full`} />
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/** Preview / totals row */
function Row({ label, value, noBorder }) {
  return (
    <div className={`flex justify-between items-center py-2.5 text-sm ${noBorder ? "" : "border-b border-slate-200"}`}>
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default AccountingMultiStepForm;