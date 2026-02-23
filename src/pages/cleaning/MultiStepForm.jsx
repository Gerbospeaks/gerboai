import React, { useState } from "react";
import {
  Users,
  Building,
  Plus,
  ChevronLeft,
  ChevronRight,
  CreditCard,
} from "lucide-react";

const MultiStepForm = ({
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
  propertyRooms,
  setPropertyRooms,
  propertyBathrooms,
  setPropertyBathrooms,
  propertyFloors,
  setPropertyFloors,
  serviceFrequency,
  setServiceFrequency,
  // Items Props
  items,
  newItem,
  setNewItem,
  handleAddItem,
  // Payment Terms Props
  paymentMethod,
  setPaymentMethod,
  paymentTerms,
  setPaymentTerms,
  serviceGuarantee,
  setServiceGuarantee,
  // Document Type (for conditional rendering)
  isQuoteMode = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
        {[1, 2, 3, 4].map((step) => (
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
                {step === 1 && "Customer"}
                {step === 2 && "Property"}
                {step === 3 && "Services"}
                {step === 4 && "Payment"}
              </div>
            </div>
            {step < 4 && (
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

      {/* Step 1: Customer Information */}
      {currentStep === 1 && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Customer Name *</div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Customer ID</div>
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
                placeholder="customer@example.com"
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

      {/* Step 2: Property Information */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Property Information</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Property Type *</div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Office</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Size (m²)</div>
              <input
                type="number"
                value={propertySize}
                onChange={(e) => setPropertySize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="120"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Rooms</div>
              <input
                type="number"
                value={propertyRooms}
                onChange={(e) => setPropertyRooms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Bathrooms</div>
              <input
                type="number"
                value={propertyBathrooms}
                onChange={(e) => setPropertyBathrooms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Floors</div>
              <input
                type="number"
                value={propertyFloors}
                onChange={(e) => setPropertyFloors(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                Service Frequency *
              </div>
              <select
                value={serviceFrequency}
                onChange={(e) => setServiceFrequency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>One-Time</option>
                <option>Weekly</option>
                <option>Bi-Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Add Services/Items */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add Service/Item</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <select
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({ ...newItem, type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Service">Service</option>
                <option value="Supplies">Supplies</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
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
                    <div className="font-semibold text-blue-600">
                      R{item.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Payment Terms */}
      {currentStep === 4 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Terms</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">Payment Method *</div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="EFT">EFT</option>
                <option value="Cash/Card/EFT">Cash/Card/EFT</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Payment Terms *</div>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {isQuoteMode ? (
                  <>
                    <option value="Quote Valid 30 Days">
                      Quote Valid 30 Days
                    </option>
                    <option value="Quote Valid 60 Days">
                      Quote Valid 60 Days
                    </option>
                    <option value="Quote Valid 90 Days">
                      Quote Valid 90 Days
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Due on Completion">Due on Completion</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="50% Deposit, Balance on Completion">
                      50% Deposit, Balance on Completion
                    </option>
                  </>
                )}
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-2">
                Service Guarantee
              </div>
              <select
                value={serviceGuarantee}
                onChange={(e) => setServiceGuarantee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7 Day Satisfaction Guarantee">
                  7 Day Satisfaction Guarantee
                </option>
                <option value="14 Day Satisfaction Guarantee">
                  14 Day Satisfaction Guarantee
                </option>
                <option value="30 Day Satisfaction Guarantee">
                  30 Day Satisfaction Guarantee
                </option>
                <option value="100% Satisfaction Guaranteed">
                  100% Satisfaction Guaranteed
                </option>
                <option value="Money Back Guarantee">
                  Money Back Guarantee
                </option>
                <option value="No Guarantee">No Guarantee</option>
              </select>
            </div>
          </div>

          {/* Payment Terms Preview */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Preview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium text-gray-800">
                  {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Payment Terms:</span>
                <span className="font-medium text-gray-800">
                  {paymentTerms}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service Guarantee:</span>
                <span className="font-medium text-gray-800">
                  {serviceGuarantee}
                </span>
              </div>
            </div>
          </div>
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

        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === totalSteps
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MultiStepForm;
