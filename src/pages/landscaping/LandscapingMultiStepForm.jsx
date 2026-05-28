import React, { useState } from "react";
import { Users, MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const LandscapingMultiStepForm = ({
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
  // Property Info Props
  propertyType,
  setPropertyType,
  propertySize,
  setPropertySize,
  propertyAddress,
  setPropertyAddress,
  accessDetails,
  setAccessDetails,
  // Items Props
  items,
  newItem,
  setNewItem,
  handleAddItem,
  onSave,
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
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              <div className="text-xs mt-2 text-gray-600 font-medium">
                {step === 1 && "Customer"}
                {step === 2 && "Property"}
                {step === 3 && "Services"}
              </div>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-green-600" : "bg-gray-200"
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

      {/* Step 1: Customer Information */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Customer Name *</div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Customer ID</div>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Auto-generated or custom"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Email *</div>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Phone *</div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="082 765 4321"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Street address, City, Postal Code"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Property Information */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Property Information</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Property Type *</div>
              <input
                type="text"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Residential Garden"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Property Size</div>
              <input
                type="text"
                value={propertySize}
                onChange={(e) => setPropertySize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., 500 sqm"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Property Address</div>
              <input
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Full property address"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Access Details</div>
              <input
                type="text"
                value={accessDetails}
                onChange={(e) => setAccessDetails(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Side gate access available"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Add Services/Materials */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add Service/Material</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <select
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({ ...newItem, type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Labor">Labor</option>
                <option value="Materials">Materials</option>
                <option value="Plants">Plants</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Rate"
                value={newItem.rate}
                onChange={(e) =>
                  setNewItem({ ...newItem, rate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleAddItem}
                className="bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Display Added Items - ADD SAFETY CHECK HERE */}
          {items && items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Added Items</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-gray-500">
                        {item.type} - Qty: {item.qty} × R{item.rate}
                      </div>
                    </div>
                    <div className="font-semibold text-green-600">
                      R{item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
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
    <span className="hidden sm:inline">Previous</span>
  </button>

  <div className="text-sm text-gray-600">
    Step {currentStep} of {totalSteps}
  </div>

  {currentStep === totalSteps ? (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSave?.("quote")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm font-medium"
      >
        Save Quote
      </button>
      <button
        onClick={() => onSave?.("invoice")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
      >
        Save Invoice
      </button>
    </div>
  ) : (
    <button
      onClick={nextStep}
      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  )}
</div>
    </div>
  );
};

export default LandscapingMultiStepForm;
