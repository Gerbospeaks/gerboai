import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { X, User, Phone, Mail, MapPin, Calendar, GraduationCap } from 'lucide-react';

const StudentModal = ({ showModal, setShowModal, existingStudent, onStudentSaved }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    gradeLevel: '',
    dateOfBirth: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    allergies: '',
  });

  useEffect(() => {
    if (existingStudent) {
      setFormData({
        name: existingStudent.name || '',
        studentId: existingStudent.studentId || '',
        gradeLevel: existingStudent.gradeLevel || '',
        dateOfBirth: existingStudent.dateOfBirth || '',
        parentName: existingStudent.parentName || '',
        parentEmail: existingStudent.parentEmail || '',
        parentPhone: existingStudent.parentPhone || '',
        parentAddress: existingStudent.parentAddress || '',
        emergencyContact: existingStudent.emergencyContact || '',
        emergencyPhone: existingStudent.emergencyPhone || '',
        medicalInfo: existingStudent.medicalInfo || '',
        allergies: existingStudent.allergies || '',
      });
    } else {
      // Reset form for new student
      setFormData({
        name: '',
        studentId: `STU-${Date.now()}`,
        gradeLevel: '',
        dateOfBirth: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        parentAddress: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalInfo: '',
        allergies: '',
      });
    }
  }, [existingStudent, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter student name');
      return false;
    }
    if (!formData.gradeLevel.trim()) {
      alert('Please enter grade level');
      return false;
    }
    if (!formData.parentName.trim()) {
      alert('Please enter parent/guardian name');
      return false;
    }
    if (!formData.parentPhone.trim()) {
      alert('Please enter parent/guardian phone number');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.uid) {
      alert('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const db = getFirestore();
      const studentData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (existingStudent?.id) {
        // Update existing student
        await updateDoc(
          doc(db, 'users', user.uid, 'students', existingStudent.id),
          studentData
        );
        alert('Student updated successfully!');
      } else {
        // Create new student
        studentData.createdAt = serverTimestamp();
        await addDoc(
          collection(db, 'users', user.uid, 'students'),
          studentData
        );
        alert('Student added successfully!');
      }

      onStudentSaved();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-indigo-600 text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            {existingStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6">
          <div className="space-y-6">
            {/* Student Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    placeholder="STU-2026-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Grade Level *
                  </label>
                  <select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="Pre-K">Pre-K</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Parent/Guardian Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Parent/Guardian Name *
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Mary Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="082 123 4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="parent@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <input
                    type="text"
                    name="parentAddress"
                    value={formData.parentAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="123 Main Street, Johannesburg"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center gap-2">
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
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="083 987 6543"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-indigo-900">
                Medical Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Peanuts, Dairy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Medical Conditions / Notes
                  </label>
                  <textarea
                    name="medicalInfo"
                    value={formData.medicalInfo}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Any medical conditions, medications, or special care instructions..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>Save Student</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;