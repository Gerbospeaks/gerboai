import React, { useState } from "react";
import { Users, Calendar, Plus, ChevronLeft, ChevronRight, Edit } from "lucide-react";

const AccountingMultiStepForm = ({
  // Client Info Props
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
  // Invoice/Quote Details Props
  documentType,
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  paymentTerms,
  setPaymentTerms,
  // Items Props
  items,
  newItem,
  setNewItem,
  handleAddItem,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              <div className="text-xs mt-2 text-gray-600 font-medium">
                {step === 1 && "Client"}
                {step === 2 && "Details"}
                {step === 3 && "Line Items"}
              </div>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderStepIndicator()}

      {/* Step 1: Client Information */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Client Information</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Client Name *</div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Client ID</div>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated or custom"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Email *</div>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Phone *</div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="082 765 4321"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Street address, City, Postal Code"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Invoice/Quote Details */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>
                {documentType === "quote" ? "Quote" : "Invoice"} Details
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {documentType === "quote" ? "Quote Date *" : "Invoice Date *"}
              </div>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {documentType === "quote" ? "Valid Until *" : "Due Date *"}
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Payment Terms *</div>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Net 90">Net 90</option>
              </select>
            </div>

            {/* Additional helpful info */}
            <div className="col-span-1 sm:col-span-2 mt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-blue-700">
                  <strong>Payment Terms Guide:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>Due on Receipt: Payment expected immediately</li>
                    <li>Net 15/30/60/90: Payment due within specified days</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Add Line Items */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add Line Item</h2>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <select
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({ ...newItem, type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    description: e.target.value,
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Rate"
                value={newItem.rate}
                onChange={(e) =>
                  setNewItem({ ...newItem, rate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Qty"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleAddItem}
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Display Added Items */}
          {items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Added Line Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Type
                      </th>
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">
                        Description
                      </th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">
                        Rate
                      </th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">
                        Qty
                      </th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-600">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-3 text-sm">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm">{item.description}</td>
                        <td className="py-3 px-3 text-sm text-right">
                          R{item.rate}
                        </td>
                        <td className="py-3 px-3 text-sm text-right">
                          {item.qty}
                        </td>
                        <td className="py-3 px-3 text-sm text-right font-semibold text-blue-600">
                          R{item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{items.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === totalSteps
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AccountingMultiStepForm;