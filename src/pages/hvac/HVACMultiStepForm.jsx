import React, { useState } from "react";
import { Users, Wind, Plus, ChevronLeft, ChevronRight, Save, FileText, Receipt } from "lucide-react";

const HVACMultiStepForm = ({
  // Customer Info Props
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
  // HVAC System Info Props
  systemType,
  setSystemType,
  systemBrand,
  setSystemBrand,
  systemModel,
  setSystemModel,
  systemSerial,
  setSystemSerial,
  systemCapacity,
  setSystemCapacity,
  systemLocation,
  setSystemLocation,
  // Items Props
  items,
  newItem,
  setNewItem,
  handleAddItem,
  handleRemoveItem,
  // Save
  onSave,
  documentType = "invoice",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const isQuote   = documentType === "quote";
  const saveLabel = isQuote ? "Save Quote" : "Save Invoice";
  const SaveIcon  = isQuote ? Receipt : FileText;

  const inputCls = "w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm";
  const labelCls = "text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5 block";

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <button
              onClick={() => setCurrentStep(step)}
              className="flex flex-col items-center group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === step
                    ? "bg-cyan-600 text-white ring-4 ring-cyan-100"
                    : currentStep > step
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                }`}
              >
                {currentStep > step ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step}
              </div>
              <div className={`text-xs mt-2 font-medium transition-colors ${
                currentStep >= step ? "text-cyan-700" : "text-gray-400"
              }`}>
                {step === 1 && "Customer"}
                {step === 2 && "HVAC System"}
                {step === 3 && "Services"}
              </div>
            </button>
            {step < 3 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                currentStep > step ? "bg-cyan-600" : "bg-gray-200"
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {/* ── Step 1: Customer Information ── */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#eff6ff] rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-[#2563eb]" />
            </div>
            <h2 className="text-sm font-semibold text-[#1e293b]">Customer Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Customer Name *</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className={inputCls} placeholder="Enter customer name" />
            </div>
            <div>
              <label className={labelCls}>Customer ID</label>
              <input type="text" value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                className={inputCls} placeholder="Auto-generated or custom" />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                className={inputCls} placeholder="customer@example.com" />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className={inputCls} placeholder="082 765 4321" />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className={labelCls}>Address</label>
              <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
                className={inputCls} placeholder="Street address, City, Postal Code" />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: HVAC System Information ── */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-[#f0fdfa] rounded-lg flex items-center justify-center">
              <Wind className="w-4 h-4 text-[#0891b2]" />
            </div>
            <h2 className="text-sm font-semibold text-[#1e293b]">HVAC System Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>System Type *</label>
              <input type="text" value={systemType} onChange={(e) => setSystemType(e.target.value)}
                className={inputCls} placeholder="e.g., Central AC, Split System" />
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <input type="text" value={systemBrand} onChange={(e) => setSystemBrand(e.target.value)}
                className={inputCls} placeholder="e.g., Daikin, Carrier, Trane" />
            </div>
            <div>
              <label className={labelCls}>Model</label>
              <input type="text" value={systemModel} onChange={(e) => setSystemModel(e.target.value)}
                className={inputCls} placeholder="Model number" />
            </div>
            <div>
              <label className={labelCls}>Serial Number</label>
              <input type="text" value={systemSerial} onChange={(e) => setSystemSerial(e.target.value)}
                className={inputCls} placeholder="Serial number" />
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input type="text" value={systemCapacity} onChange={(e) => setSystemCapacity(e.target.value)}
                className={inputCls} placeholder="e.g., 3.5kW / 12 000 BTU" />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input type="text" value={systemLocation} onChange={(e) => setSystemLocation(e.target.value)}
                className={inputCls} placeholder="e.g., Main Office – Reception" />
            </div>
          </div>

          <div className="mt-4 bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <div className="text-xs text-cyan-700">
              <strong>💡 Tip:</strong> Record complete system details for accurate maintenance history and warranty tracking.
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Services / Parts ── */}
      {currentStep === 3 && (
        <div className="space-y-4">
          {/* Add item row */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-[#1e293b] mb-4">Add Service / Part</h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className={inputCls}
              >
                <option value="Service">Service</option>
                <option value="Parts">Parts</option>
                <option value="Refrigerant">Refrigerant</option>
                <option value="Materials">Materials</option>
              </select>

              <input type="text" placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className={inputCls}
              />

              <input type="number" placeholder="Rate (R)"
                value={newItem.rate}
                onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                className={inputCls}
              />

              <input type="number" placeholder="Qty"
                value={newItem.qty}
                onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                className={inputCls}
              />

              <button
                onClick={handleAddItem}
                className="bg-cyan-600 text-white rounded-lg px-4 py-2 hover:bg-cyan-700 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Items table */}
          {items.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">
                Added Items <span className="ml-1.5 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">{items.length}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-[#f8fafc]">
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Category</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Description</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Rate</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Qty</th>
                      <th className="text-right py-2.5 px-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Amount</th>
                      <th className="py-2.5 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            item.type === "Service"     ? "bg-blue-100 text-blue-800"
                            : item.type === "Parts"    ? "bg-green-100 text-green-800"
                            : item.type === "Refrigerant" ? "bg-cyan-100 text-cyan-800"
                            : "bg-purple-100 text-purple-800"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#374151]">{item.description}</td>
                        <td className="py-3 px-3 text-right text-[#374151]">R {parseFloat(item.rate).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-[#374151]">{item.qty}</td>
                        <td className="py-3 px-3 text-right font-semibold text-cyan-600">R {item.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          {handleRemoveItem && (
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded transition-all"
                              title="Remove item"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b]">
                <div className="flex gap-4">
                  <span>Items: <strong className="text-[#1e293b]">{items.length}</strong></span>
                  <span>Categories: <strong className="text-[#1e293b]">{[...new Set(items.map(i => i.type))].length}</strong></span>
                </div>
                <div className="text-sm font-bold text-[#1e293b]">
                  Subtotal: R {items.reduce((s, i) => s + i.amount, 0).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] rounded-lg py-10 text-center">
              <Plus className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
              <p className="text-sm text-[#94a3b8]">No items added yet</p>
              <p className="text-xs text-[#cbd5e1] mt-1">Use the form above to add services or parts</p>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex justify-between items-center pt-4 border-t border-[#e2e8f0]">
        {/* Back button */}
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStep === 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-[#f1f5f9] text-[#374151] hover:bg-[#e2e8f0]"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-xs text-[#94a3b8] font-medium">
          Step {currentStep} of {totalSteps}
        </div>

        {/* Next OR Save */}
        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onSave}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md ${
              isQuote
                ? "bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                : "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
            }`}
          >
            <SaveIcon className="w-4 h-4" />
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default HVACMultiStepForm;
