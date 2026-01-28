import React, { useState } from 'react';
import { Users, Building, UserCheck, AlertTriangle, Eye, ArrowRight, ArrowLeft, Check, Shield } from 'lucide-react';

const SecurityIncidentMultiStepForm = ({
  // Client Info Props
  clientName,
  setClientName,
  clientContact,
  setClientContact,
  clientEmail,
  setClientEmail,
  // Site Info Props
  siteName,
  setSiteName,
  siteAddress,
  setSiteAddress,
  // Guard Info Props
  guardName,
  setGuardName,
  guardId,
  setGuardId,
  // Incident Details Props
  incidentType,
  setIncidentType,
  incidentDate,
  setIncidentDate,
  incidentTime,
  setIncidentTime,
  incidentDescription,
  setIncidentDescription,
  actionsTaken,
  setActionsTaken,
  // Witness Info Props
  witnessName,
  setWitnessName,
  witnessContact,
  setWitnessContact,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

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

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const getSeverityColor = (type) => {
    const severityMap = {
      'Theft': 'high',
      'Assault': 'high',
      'Fire': 'critical',
      'Medical Emergency': 'critical',
      'Vandalism': 'medium',
      'Trespassing': 'medium',
      'Suspicious Activity': 'low',
      'Other': 'low'
    };
    
    const severity = severityMap[type] || 'low';
    
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    
    return colors[severity];
  };

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => goToStep(step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === step
                      ? 'bg-blue-600 text-white'
                      : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </button>
                <span className="mt-2 text-xs font-medium text-gray-700 text-center">
                  {step === 1 && 'Client'}
                  {step === 2 && 'Site'}
                  {step === 3 && 'Guard'}
                  {step === 4 && 'Incident'}
                  {step === 5 && 'Witness'}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-1 ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Step 1: Client Information */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Client Information</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Site Information */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Building className="w-6 h-6 text-blue-600" />
                <span>Site Information</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main Street, City, State ZIP"
                />
              </div>
            </div>

            {/* Site Summary Card */}
            {(siteName || siteAddress) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Site Details</h4>
                    <div className="space-y-1 text-sm">
                      {siteName && (
                        <div>
                          <span className="text-blue-600">Name:</span>
                          <span className="ml-2 text-blue-900 font-medium">{siteName}</span>
                        </div>
                      )}
                      {siteAddress && (
                        <div>
                          <span className="text-blue-600">Location:</span>
                          <span className="ml-2 text-blue-900 font-medium">{siteAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Guard on Duty */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <span>Guard on Duty</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guard Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter guard name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guard ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guardId}
                  onChange={(e) => setGuardId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="GRD-001"
                />
              </div>
            </div>

            {/* Guard Summary Card */}
            {(guardName || guardId) && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <UserCheck className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-1">Officer on Duty</h4>
                    <div className="space-y-1 text-sm">
                      {guardName && (
                        <div>
                          <span className="text-green-600">Name:</span>
                          <span className="ml-2 text-green-900 font-medium">{guardName}</span>
                        </div>
                      )}
                      {guardId && (
                        <div>
                          <span className="text-green-600">Badge ID:</span>
                          <span className="ml-2 text-green-900 font-medium">{guardId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Incident Details */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <span>Incident Details</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Theft">Theft</option>
                  <option value="Trespassing">Trespassing</option>
                  <option value="Vandalism">Vandalism</option>
                  <option value="Assault">Assault</option>
                  <option value="Fire">Fire</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  placeholder="Provide detailed description of the incident..."
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actions Taken <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                  placeholder="Describe immediate actions taken..."
                />
              </div>
            </div>

            {/* Incident Severity Alert */}
            {incidentType && (
              <div className={`mt-6 p-4 border-2 rounded-lg ${getSeverityColor(incidentType)}`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Incident Classification</h4>
                    <div className="text-sm">
                      <span className="font-medium">Type:</span> {incidentType}
                      {incidentDate && incidentTime && (
                        <span className="ml-4">
                          <span className="font-medium">Occurred:</span> {incidentDate} at {incidentTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Witness Information */}
        {currentStep === 5 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Eye className="w-6 h-6 text-blue-600" />
                <span>Witness Information</span>
              </h2>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Witness information is optional but recommended if available.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness Name
                </label>
                <input
                  type="text"
                  value={witnessName}
                  onChange={(e) => setWitnessName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness Contact
                </label>
                <input
                  type="text"
                  value={witnessContact}
                  onChange={(e) => setWitnessContact(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Report Summary */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Report Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-2 font-medium">{clientName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Site:</span>
                    <span className="ml-2 font-medium">{siteName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Guard:</span>
                    <span className="ml-2 font-medium">{guardName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Incident Type:</span>
                    <span className="ml-2 font-medium">{incidentType || 'Not selected'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">{incidentDate || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Witness:</span>
                    <span className="ml-2 font-medium">{witnessName || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>

            {(witnessName || witnessContact) && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 mb-1">Witness Details</h4>
                    <div className="space-y-1 text-sm">
                      {witnessName && (
                        <div>
                          <span className="text-purple-600">Name:</span>
                          <span className="ml-2 text-purple-900 font-medium">{witnessName}</span>
                        </div>
                      )}
                      {witnessContact && (
                        <div>
                          <span className="text-purple-600">Contact:</span>
                          <span className="ml-2 text-purple-900 font-medium">{witnessContact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === totalSteps}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === totalSteps
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {currentStep === totalSteps ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityIncidentMultiStepForm;