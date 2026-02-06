import React, { useState } from "react";
import { Users, Building2, Plus, ChevronLeft, ChevronRight, Edit } from "lucide-react";

const PaintingMultiStepForm = ({
  // Client Info Props
  clientName,
  setClientName,
  clientType,
  setClientType,
  clientCompany,
  setClientCompany,
  clientId,
  setClientId,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  // Project Info Props
  projectName,
  setProjectName,
  projectAddress,
  setProjectAddress,
  projectType,
  setProjectType,
  projectSize,
  setProjectSize,
  projectDuration,
  setProjectDuration,
  projectStartDate,
  setProjectStartDate,
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
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              <div className="text-xs mt-2 text-gray-600 font-medium">
                {step === 1 && "Client"}
                {step === 2 && "Project"}
                {step === 3 && "Line Items"}
              </div>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-orange-600" : "bg-gray-200"
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
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Client Type *</div>
              <select
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Government">Government</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Company Name</div>
              <input
                type="text"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Optional"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Client ID</div>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Auto-generated or custom"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Email *</div>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Phone *</div>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="082 765 4321"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Street address, City, Postal Code"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Project Information */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Project Information</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Project Name *</div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Downtown Office Complex"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Project Address *</div>
              <input
                type="text"
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Project site location"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Project Type *</div>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Type</option>
                <option value="New Build">New Build</option>
                <option value="Renovation">Renovation</option>
                <option value="Extension">Extension</option>
                <option value="Repairs">Repairs</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Project Size</div>
              <input
                type="text"
                value={projectSize}
                onChange={(e) => setProjectSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 500 sqm"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Duration</div>
              <input
                type="text"
                value={projectDuration}
                onChange={(e) => setProjectDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., 3 months"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Start Date</div>
              <input
                type="date"
                value={projectStartDate}
                onChange={(e) => setProjectStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Project Info Helper */}
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-xs text-orange-700">
              <strong>💡 Tip:</strong> Provide detailed project information to generate accurate quotes and invoices. The project type helps categorize work for reporting.
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
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Labor">Labor</option>
                <option value="Materials">Materials</option>
                <option value="Equipment">Equipment</option>
                <option value="Subcontractor">Subcontractor</option>
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
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="number"
                placeholder="Rate"
                value={newItem.rate}
                onChange={(e) =>
                  setNewItem({ ...newItem, rate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <input
                type="number"
                placeholder="Qty"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                onClick={handleAddItem}
                className="bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 flex items-center justify-center gap-2 transition-colors"
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
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-gray-700">
                        Description
                      </th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">
                        Rate
                      </th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-orange-50 transition-colors"
                      >
                        <td className="py-3 px-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.type === "Labor"
                                ? "bg-blue-100 text-blue-800"
                                : item.type === "Materials"
                                ? "bg-green-100 text-green-800"
                                : item.type === "Equipment"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-700">
                          {item.description}
                        </td>
                        <td className="py-3 px-3 text-sm text-right text-gray-700">
                          R{parseFloat(item.rate).toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-sm text-right text-gray-700">
                          {item.qty}
                        </td>
                        <td className="py-3 px-3 text-sm text-right font-semibold text-orange-600">
                          R{item.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Categories:</span>
                    <span className="font-medium">
                      {[...new Set(items.map((i) => i.type))].length}
                    </span>
                  </div>
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

        <div className="text-sm text-gray-600 font-medium">
          Step {currentStep} of {totalSteps}
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === totalSteps
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaintingMultiStepForm;