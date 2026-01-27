// UPDATE your GuestModal.jsx to include booking option

import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, CreditCard, Globe } from 'lucide-react';
import { createCheckInFromGuest } from './CheckInOutModal';
import { useAuth } from "../../contexts/AuthContext";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from "firebase/firestore";
const GuestModal = ({ showModal, setShowModal, existingGuest, onGuestSaved , user }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    guestId: '',
    dateOfBirth: '',
    nationality: '',
    idType: 'ID Document',
    idNumber: ''
  });

  const [createCheckIn, setCreateCheckIn] = useState(false);
  const [bookingData, setBookingData] = useState({
    roomNumber: '',
    roomType: 'Standard Double Room',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: '1',
    notes: ''
  });

  useEffect(() => {
    if (existingGuest) {
      setFormData(existingGuest);
      setCreateCheckIn(false);
    } else {
      // Reset form for new guest
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        guestId: `GST-${Date.now()}`,
        dateOfBirth: '',
        nationality: '',
        idType: 'ID Document',
        idNumber: ''
      });
      setCreateCheckIn(false);
      setBookingData({
        roomNumber: '',
        roomType: 'Standard Double Room',
        checkInDate: '',
        checkOutDate: '',
        numberOfGuests: '1',
        notes: ''
      });
    }
  }, [existingGuest, showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Please enter guest name and phone number');
      return;
    }

    try {
      const db = getFirestore();
      const userId = user?.uid;
      
      if (!userId) {
        alert('User not authenticated');
        return;
      }


      const guestDataToSave = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (existingGuest?.id) {
        // Update existing guest
        await updateDoc(doc(db, 'users', userId, 'guests', existingGuest.id), guestDataToSave);
        alert('Guest updated successfully!');
      } else {
        // Add new guest
        await addDoc(collection(db, 'users', userId, 'guests'), {
          ...guestDataToSave,
          createdAt: serverTimestamp()
        });
        
        // Create check-in if requested
        if (createCheckIn && bookingData.roomNumber && bookingData.checkInDate) {
          const checkInCreated = await createCheckInFromGuest(userId, formData, bookingData);
          if (checkInCreated) {
            alert('Guest and check-in created successfully!');
          } else {
            alert('Guest saved but failed to create check-in');
          }
        } else {
          alert('Guest saved successfully!');
        }
      }

      onGuestSaved?.();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Failed to save guest');
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-blue-600 text-gray-800">
          <h2 className="text-xl font-semibold">
            {existingGuest ? 'Edit Guest' : 'Add New Guest'}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-800 hover:bg-blue-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-auto p-6">
          <div className="space-y-6">
            {/* Guest Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Guest Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Guest ID</label>
                  <input
                    type="text"
                    value={formData.guestId}
                    onChange={(e) => setFormData({...formData, guestId: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    placeholder="Auto-generated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="082 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      rows="2"
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street, City, Postal Code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nationality</label>
                  <div className="relative">
                    <Globe className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="South African"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ID Type</label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({...formData, idType: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ID Document">ID Document</option>
                    <option value="Passport">Passport</option>
                    <option value="Driver's License">Driver's License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ID Number</label>
                  <div className="relative">
                    <CreditCard className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="ID/Passport Number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Check-In Option (only for new guests) */}
            {!existingGuest && (
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createCheckIn}
                      onChange={(e) => setCreateCheckIn(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-semibold text-blue-900">Create Check-In for this guest</span>
                  </label>
                  <p className="text-xs text-blue-700 mt-1 ml-7">
                    Save time by adding booking details now
                  </p>
                </div>

                {createCheckIn && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Booking Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Room Number *</label>
                        <input
                          type="text"
                          required={createCheckIn}
                          value={bookingData.roomNumber}
                          onChange={(e) => setBookingData({...bookingData, roomNumber: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="205"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Room Type</label>
                        <select
                          value={bookingData.roomType}
                          onChange={(e) => setBookingData({...bookingData, roomType: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
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
                        <label className="block text-sm font-medium mb-2">Check-In Date *</label>
                        <input
                          type="date"
                          required={createCheckIn}
                          value={bookingData.checkInDate}
                          onChange={(e) => setBookingData({...bookingData, checkInDate: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Check-Out Date *</label>
                        <input
                          type="date"
                          required={createCheckIn}
                          value={bookingData.checkOutDate}
                          onChange={(e) => setBookingData({...bookingData, checkOutDate: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Guests</label>
                        <input
                          type="number"
                          min="1"
                          value={bookingData.numberOfGuests}
                          onChange={(e) => setBookingData({...bookingData, numberOfGuests: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Notes / Special Requests</label>
                        <textarea
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                          rows="2"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Late check-in, dietary requirements, etc."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-gray-800 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                <Save className="w-5 h-5" />
                {existingGuest ? 'Update Guest' : createCheckIn ? 'Save Guest & Create Check-In' : 'Save Guest'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestModal;