import React, { useState } from 'react';
import { X, Search, Edit, UserCheck, Phone, Mail, Calendar, CreditCard, Plus, Trash2 } from 'lucide-react';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const PatientsListModal = ({ 
  showModal, 
  setShowModal, 
  patients, 
  onLoadPatient, 
  onEditPatient, 
  onAddNewPatient 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('All');

  const handleDeletePatient = async (patientId, patientName) => {
    if (!window.confirm(`Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', user.uid, 'patients', patientId));
      alert('Patient deleted successfully');
      // Trigger a reload of patients
      window.location.reload();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
    
    const matchesGender = filterGender === 'All' || patient.gender === filterGender;
    
    return matchesSearch && matchesGender;
  });

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-800 text-white">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">All Patients</h2>
              <p className="text-sm text-blue-100">
                {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b bg-gray-300">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, ID, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={onAddNewPatient}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Patient
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="overflow-auto flex-1 p-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No patients found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || filterGender !== 'All' 
                  ? 'Try adjusting your search or filters' 
                  : 'Add your first patient to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                >
                  {/* Patient Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        {patient.name || 'Unknown Patient'}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          patient.gender === 'Male' 
                            ? 'bg-blue-100 text-blue-700' 
                            : patient.gender === 'Female'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {patient.gender || 'N/A'}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">ID: {patient.patientId || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditPatient(patient)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Patient"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.id, patient.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Patient Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Age</div>
                        <div className="font-medium">
                          {calculateAge(patient.dateOfBirth)} years
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium">{patient.phone || 'N/A'}</div>
                      </div>
                    </div>

                    {patient.email && (
                      <div className="flex items-center gap-2 text-gray-600 col-span-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Email</div>
                          <div className="font-medium text-xs">{patient.email}</div>
                        </div>
                      </div>
                    )}

                    {patient.insuranceProvider && (
                      <div className="flex items-center gap-2 text-gray-600 col-span-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500">Insurance</div>
                          <div className="font-medium">
                            {patient.insuranceProvider}
                            {patient.insuranceNumber && ` - ${patient.insuranceNumber}`}
                          </div>
                        </div>
                      </div>
                    )}

                    {patient.bloodType && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500">Blood Type</div>
                        <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-semibold">
                          {patient.bloodType}
                        </span>
                      </div>
                    )}

                    {patient.allergies && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Allergies</div>
                        <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded">
                          {patient.allergies}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => {
                        onLoadPatient(patient);
                        setShowModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Load to Invoice
                    </button>
                    <button
                      onClick={() => onEditPatient(patient)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Edit Details
                    </button>
                  </div>

                  {/* Last Updated */}
                  {patient.updatedAt && (
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      Last updated: {new Date(patient.updatedAt.toDate()).toLocaleDateString('en-ZA')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-300 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredPatients.length} of {patients.length} total patients
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientsListModal;