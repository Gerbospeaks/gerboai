import React, { useState } from "react";
import { Users, Bed, Plus, ChevronLeft, ChevronRight } from "lucide-react";

const HospitalityMultiStepForm = ({
  // Guest Info Props
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
  // Booking Info Props
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
  // Modal Props
  showGuestsListModal,
  setShowGuestsListModal,
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
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
              <div className="text-xs mt-2 text-gray-600 font-medium">
                {step === 1 && "Guest"}
                {step === 2 && "Booking"}
                {step === 3 && "Charges"}
              </div>
            </div>
            {step < 3 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-purple-600" : "bg-gray-200"
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

      {/* Step 1: Guest Information */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Guest Information</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Guest Name *</div>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Guest ID</div>
              <input
                type="text"
                value={guestId}
                onChange={(e) => setGuestId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Auto-generated or custom"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Email *</div>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="guest@example.com"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Phone *</div>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="082 765 4321"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <input
                type="text"
                value={guestAddress}
                onChange={(e) => setGuestAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Street address, City, Postal Code"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
              <input
                type="date"
                value={guestDOB}
                onChange={(e) => setGuestDOB(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Nationality</div>
              <input
                type="text"
                value={guestNationality}
                onChange={(e) => setGuestNationality(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., South African"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">ID Type *</div>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option>ID Document</option>
                <option>Passport</option>
                <option>Driver's License</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">ID Number *</div>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter ID number"
              />
            </div>
          </div>

          <button
            onClick={() => setShowGuestsListModal(true)}
            className="mt-4 text-sm text-purple-600 hover:underline"
          >
            Load from saved guests
          </button>
        </div>
      )}

      {/* Step 2: Booking Information */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Bed className="w-5 h-5" />
              <span>Booking Information</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Room Number *</div>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 101, 205"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Room Type *</div>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select Room Type</option>
                <option value="Standard Single Room">Standard Single Room</option>
                <option value="Standard Double Room">Standard Double Room</option>
                <option value="Deluxe Single Room">Deluxe Single Room</option>
                <option value="Deluxe Double Room">Deluxe Double Room</option>
                <option value="Executive Suite">Executive Suite</option>
                <option value="Presidential Suite">Presidential Suite</option>
                <option value="Family Room">Family Room</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Check-In Date *</div>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Check-Out Date *</div>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Number of Guests</div>
              <input
                type="number"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="2"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Number of Nights</div>
              <input
                type="number"
                value={numberOfNights}
                onChange={(e) => setNumberOfNights(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="5"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Special Requests</div>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows="2"
                placeholder="e.g., Late check-in, High floor, Sea view"
              />
            </div>
          </div>

          {/* Booking Info Helper */}
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-xs text-purple-700">
              <strong>💡 Tip:</strong> Confirm room availability and guest preferences before finalizing the booking to ensure a smooth check-in experience.
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Add Charges */}
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
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Room Charge">Room Charge</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Laundry">Laundry</option>
                <option value="Minibar">Minibar</option>
                <option value="Spa & Wellness">Spa & Wellness</option>
                <option value="Room Service">Room Service</option>
                <option value="Other">Other</option>
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
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="number"
                placeholder="Rate"
                value={newItem.rate}
                onChange={(e) =>
                  setNewItem({ ...newItem, rate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="number"
                placeholder="Qty"
                value={newItem.qty}
                onChange={(e) =>
                  setNewItem({ ...newItem, qty: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={handleAddItem}
                className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Display Added Items */}
          {items.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Added Charges</h3>
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
                        className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                      >
                        <td className="py-3 px-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.type === "Room Charge"
                                ? "bg-blue-100 text-blue-800"
                                : item.type === "Food & Beverage"
                                ? "bg-green-100 text-green-800"
                                : item.type === "Laundry"
                                ? "bg-purple-100 text-purple-800"
                                : item.type === "Minibar"
                                ? "bg-orange-100 text-orange-800"
                                : item.type === "Spa & Wellness"
                                ? "bg-pink-100 text-pink-800"
                                : item.type === "Room Service"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
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
                        <td className="py-3 px-3 text-sm text-right font-semibold text-purple-600">
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
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HospitalityMultiStepForm;