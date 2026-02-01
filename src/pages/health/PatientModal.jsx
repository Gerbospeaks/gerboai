import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { X, Save, User, Mail, Phone, MapPin, Calendar, CreditCard, Stethoscope } from 'lucide-react';

const PatientModal = ({ showModal, setShowModal, existingPatient, onPatientSaved }) => {
  const {user, authUser} = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    patientId: '',
    dateOfBirth: '',
    gender: 'Male',
    insuranceProvider: '',
    insuranceNumber: '',
    bloodType: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: ''
  });

  useEffect(() => {
    if (existingPatient) {
      setFormData({
        name: existingPatient.name || '',
        email: existingPatient.email || '',
        phone: existingPatient.phone || '',
        address: existingPatient.address || '',
        patientId: existingPatient.patientId || '',
        dateOfBirth: existingPatient.dateOfBirth || '',
        gender: existingPatient.gender || 'Male',
        insuranceProvider: existingPatient.insuranceProvider || '',
        insuranceNumber: existingPatient.insuranceNumber || '',
        bloodType: existingPatient.bloodType || '',
        allergies: existingPatient.allergies || '',
        emergencyContactName: existingPatient.emergencyContactName || '',
        emergencyContactPhone: existingPatient.emergencyContactPhone || '',
        medicalHistory: existingPatient.medicalHistory || ''
      });
    } else {
      // Generate new patient ID for new patients
      setFormData(prev => ({
        ...prev,
        patientId: `PAT-${Date.now()}`
      }));
    }
  }, [existingPatient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Please enter patient name and phone number');
      return;
    }

    if (!user?.uid) {
      alert('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const db = getFirestore();
      
      const patientData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (existingPatient && existingPatient.id) {
        // Update existing patient
        await updateDoc(doc(db, 'users', user.uid, 'patients', existingPatient.id), patientData);
        alert('Patient updated successfully!');
      } else {
        // Create new patient
        patientData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', user.uid, 'patients'), patientData);
        alert('Patient created successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        patientId: `PAT-${Date.now()}`,
        dateOfBirth: '',
        gender: 'Male',
        insuranceProvider: '',
        insuranceNumber: '',
        bloodType: '',
        allergies: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        medicalHistory: ''
      });

      setShowModal(false);
      
      if (onPatientSaved) {
        onPatientSaved();
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50 text-gray-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-6 h-6" />
            {existingPatient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-800 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-auto p-6">
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="patient@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="082 123 4567"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street, City, Postal Code"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Insurance Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Discovery Health"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Insurance Number
                  </label>
                  <input
                    type="text"
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DH123456789"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Zoey Mor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="082 987 6543"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-600 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Medical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Allergies
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="List any known allergies (medications, food, environmental, etc.)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    placeholder="Previous conditions, surgeries, chronic illnesses, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : (existingPatient ? 'Update Patient' : 'Save Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;