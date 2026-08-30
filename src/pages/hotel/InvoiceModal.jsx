import React from "react";
import {
  X,
  Printer,
  Download,
  CreditCard,
  Sparkles,
  Stamp,
} from "lucide-react";
import HospitalityMultiStepForm from "./HospitalityMultiStepForm";
import HotelAIExtractor from "./HotelAIExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import StampOverlay from "../StampOverlay";

/**
 * InvoiceModal
 * Same form + live-preview flow that used to live inline under
 * activeView === "invoice", now rendered as an overlay so the
 * dashboard underneath stays mounted and visible.
 */
export default function InvoiceModal({
  isOpen,
  onClose,

  // guest fields
  guestName,
  setGuestName,
  guestId,
  setGuestId,
  guestEmail,
  setGuestEmail,
  guestPhone,
  setGuestPhone,
  guestAddress,
  setGuestAddress,
  guestDOB,
  setGuestDOB,
  guestNationality,
  setGuestNationality,
  idType,
  setIdType,
  idNumber,
  setIdNumber,

  // booking fields
  roomNumber,
  setRoomNumber,
  roomType,
  setRoomType,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  numberOfGuests,
  setNumberOfGuests,
  numberOfNights,
  setNumberOfNights,
  specialRequests,
  setSpecialRequests,

  // guests list modal trigger (from within step 1)
  showGuestsListModal,
  setShowGuestsListModal,

  // line items
  items,
  newItem,
  setNewItem,
  handleAddItem,

  // invoice meta / totals
  invoiceNumber,
  invoiceId,
  paymentStatus,
  subtotal,
  vat,
  total,

  // template + preview
  selectedTemplate,
  setSelectedTemplate,
  templateProps,
  stampConfig,
  propertyInfo,

  // input mode (manual vs AI)
  inputMode,
  setInputMode,
  documentType,
  handleAIDataExtracted,

  // actions
  handleSaveInvoice,
  handleProcessPayment,
  handlePrint,
  handleSavePDF,
  setShowStampModal,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#1e293b]">
              {invoiceId ? "Edit Invoice" : "New Invoice"}
            </h2>
            <p className="text-xs text-[#64748b]">{invoiceNumber || "Draft"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={handleSavePDF}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] text-white text-xs font-medium rounded-lg hover:bg-[#0e7490] transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            <button
              onClick={handleSaveInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body: form left, live preview right (matches old split layout) */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* LEFT: form */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
            <div className="space-y-5">
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="Invoice Amount"
                  value={`$${total.toFixed(2)}`}
                  tone="amber"
                />
                <StatCard
                  label="Paid"
                  value={`$${paymentStatus.totalPaid.toFixed(2)}`}
                  tone={paymentStatus.totalPaid > 0 ? "green" : "slate"}
                />
                <StatCard
                  label="Balance Due"
                  value={`$${paymentStatus.balanceDue.toFixed(2)}`}
                  tone={paymentStatus.balanceDue <= 0 ? "green" : "red"}
                />
              </div>

              {/* Payment banner */}
              {invoiceId && (
                <div
                  className={`px-5 py-3.5 rounded-xl border flex items-center justify-between ${
                    paymentStatus.status === "paid"
                      ? "bg-[#f0fdf4] border-[#bbf7d0]"
                      : paymentStatus.status === "partially_paid"
                        ? "bg-[#fffbeb] border-[#fde68a]"
                        : "bg-[#fff7ed] border-[#fed7aa]"
                  }`}
                >
                  <div className="text-sm font-semibold text-[#9a3412]">
                    {paymentStatus.status === "paid"
                      ? "Invoice Fully Paid"
                      : paymentStatus.status === "partially_paid"
                        ? `$${paymentStatus.totalPaid.toFixed(2)} paid · $${paymentStatus.balanceDue.toFixed(2)} remaining`
                        : `Payment Pending — $${paymentStatus.balanceDue.toFixed(2)} due on check-out`}
                  </div>
                  {paymentStatus.status !== "paid" && (
                    <button
                      onClick={handleProcessPayment}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" /> Record Payment
                    </button>
                  )}
                </div>
              )}

              {/* Form card */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <button
                    onClick={() => setInputMode("manual")}
                    className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                      inputMode === "manual"
                        ? "border-[#d97706] text-[#d97706] bg-white"
                        : "border-transparent text-[#64748b] hover:text-[#374151]"
                    }`}
                  >
                    Manual Entry
                  </button>
                  <button
                    onClick={() => setInputMode("ai")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4" /> AI Mode
                  </button>
                </div>

                {inputMode === "ai" && (
                  <div className="p-6 border-b border-[#e2e8f0]">
                    <HotelAIExtractor
                      onDataExtracted={handleAIDataExtracted}
                      documentType={documentType}
                    />
                  </div>
                )}

                {inputMode === "manual" && (
                  <div className="p-6">
                    <HospitalityMultiStepForm
                      guestName={guestName}
                      setGuestName={setGuestName}
                      guestId={guestId}
                      setGuestId={setGuestId}
                      guestEmail={guestEmail}
                      setGuestEmail={setGuestEmail}
                      guestPhone={guestPhone}
                      setGuestPhone={setGuestPhone}
                      guestAddress={guestAddress}
                      setGuestAddress={setGuestAddress}
                      guestDOB={guestDOB}
                      setGuestDOB={setGuestDOB}
                      guestNationality={guestNationality}
                      setGuestNationality={setGuestNationality}
                      idType={idType}
                      setIdType={setIdType}
                      idNumber={idNumber}
                      setIdNumber={setIdNumber}
                      roomNumber={roomNumber}
                      setRoomNumber={setRoomNumber}
                      roomType={roomType}
                      setRoomType={setRoomType}
                      checkInDate={checkInDate}
                      setCheckInDate={setCheckInDate}
                      checkOutDate={checkOutDate}
                      setCheckOutDate={setCheckOutDate}
                      numberOfGuests={numberOfGuests}
                      setNumberOfGuests={setNumberOfGuests}
                      numberOfNights={numberOfNights}
                      setNumberOfNights={setNumberOfNights}
                      specialRequests={specialRequests}
                      setSpecialRequests={setSpecialRequests}
                      showGuestsListModal={showGuestsListModal}
                      setShowGuestsListModal={setShowGuestsListModal}
                      items={items}
                      newItem={newItem}
                      setNewItem={setNewItem}
                      handleAddItem={handleAddItem}
                    />
                  </div>
                )}
              </div>

              {invoiceId && paymentStatus.status !== "paid" && (
                <button
                  onClick={handleProcessPayment}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                  <CreditCard className="w-4 h-4" /> Process Payment
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: live preview (hidden on small screens, same as before) */}
          <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#d97706] text-white text-xs font-medium rounded-lg hover:bg-[#b45309] transition-colors"
                >
                  <Download className="w-3 h-3" /> PDF
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div
                className="bg-white shadow-lg rounded origin-top"
                style={{
                  position: "relative",
                  width: "210mm",
                  minHeight: "297mm",
                  transform: "scale(0.44)",
                  transformOrigin: "top left",
                  marginBottom: `calc((297mm * 0.44) - 297mm)`,
                }}
              >
                <TemplateRenderer {...templateProps} />
                <StampOverlay
                  stampConfig={stampConfig}
                  pageNumber={1}
                  businessInfo={propertyInfo}
                />
              </div>
            </div>
            <div className="flex-shrink-0 px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
              <button
                onClick={() => setShowStampModal(true)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Stamp className="w-4 h-4" /> Stamp &amp; Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const tones = {
    amber: { bg: "bg-[#fef3c7]", text: "text-[#d97706]" },
    green: { bg: "bg-[#dcfce7]", text: "text-[#059669]" },
    red: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]" },
    slate: { bg: "bg-[#f1f5f9]", text: "text-[#94a3b8]" },
  }[tone] || { bg: "bg-[#f1f5f9]", text: "text-[#1e293b]" };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
      <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide block mb-2">
        {label}
      </span>
      <div className={`text-xl font-bold ${tones.text}`}>{value}</div>
    </div>
  );
}
