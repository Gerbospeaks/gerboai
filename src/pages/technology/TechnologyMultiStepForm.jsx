import React, { useState } from "react";
import {
  Users,
  Briefcase,
  Plus,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from "lucide-react";

const TechnologyMultiStepForm = ({
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
  // Project Info Props
  projectDate,
  setProjectDate,
  projectName,
  setProjectName,
  projectScope,
  setProjectScope,
  // Items Props
  items,
  newItem,
  setNewItem,
  handleAddItem,
  documentType,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () =>
    currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const accentColor = "violet";

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step
                    ? "bg-violet-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              <div className="text-xs mt-2 text-gray-600 font-medium">
                {step === 1 && "Client"}
                {step === 2 && "Project"}
                {step === 3 && "Services"}
              </div>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-colors ${
                  currentStep > step ? "bg-violet-600" : "bg-gray-200"
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

      {/* ── Step 1: Client Information ── */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-violet-600" />
            <span>Client Information</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Client Name *</div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Client ID</div>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Auto-generated or custom"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Email *</div>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="client@example.com"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Phone *</div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="082 765 4321"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Street address, City, Postal Code"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Project Information ── */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-violet-600" />
            <span>Project Details</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Project Name *</div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="e.g. E-commerce Website Build"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {documentType === "quote"
                  ? "Quote Date *"
                  : "Project Start Date *"}
              </div>
              <input
                type="date"
                value={projectDate}
                onChange={(e) => setProjectDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                Service Category *
              </div>
              <select
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Select category...</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile App Development">
                  Mobile App Development
                </option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="IT Support & Maintenance">
                  IT Support &amp; Maintenance
                </option>
                <option value="Cloud & Hosting">Cloud &amp; Hosting</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Data & Analytics">Data &amp; Analytics</option>
                <option value="Software Licensing">Software Licensing</option>
                <option value="Network Setup">Network Setup</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {documentType === "quote"
                  ? "Quote Valid Until"
                  : "Estimated Completion"}
              </div>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Scope of Work</div>
              <textarea
                rows={3}
                placeholder="e.g. Design, development, testing, deployment and 30-day post-launch support"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
              />
            </div>
          </div>

          {/* Quote-specific notice */}
          {documentType === "quote" && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">
                📋 This is a <strong>Quote</strong> — the client must accept
                before work begins. You can convert it to an Invoice once
                accepted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Services / Line Items ── */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-violet-600" />
              <span>Add Service / Line Item</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <select
                value={newItem.type}
                onChange={(e) =>
                  setNewItem({ ...newItem, type: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Consulting">Consulting</option>
                <option value="Support">Support</option>
                <option value="Hosting">Hosting</option>
                <option value="Licensing">Licensing</option>
                <option value="Hardware">Hardware</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="sm:col-span-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                placeholder="Rate (R)"
                value={newItem.rate}
                onChange={(e) =>
                  setNewItem({ ...newItem, rate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={handleAddItem}
                className="bg-violet-600 text-white rounded-lg px-4 py-2 hover:bg-violet-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Added line items */}
          {items && items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-base font-semibold mb-4 text-slate-700">
                Line Items ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.type} · Qty: {item.qty} × R
                        {Number(item.rate).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-semibold text-violet-600 text-sm">
                      R{Number(item.amount).toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Totals summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      R{items.reduce((s, i) => s + i.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VAT (15%)</span>
                    <span>
                      R
                      {(items.reduce((s, i) => s + i.amount, 0) * 0.15).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-violet-700 pt-1 border-t">
                    <span>Total</span>
                    <span>
                      R
                      {(items.reduce((s, i) => s + i.amount, 0) * 1.15).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
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

        <div className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === totalSteps}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
            currentStep === totalSteps
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TechnologyMultiStepForm;
