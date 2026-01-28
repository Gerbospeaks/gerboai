import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';
import { 
  X, 
  Search, 
  Edit, 
  Trash2, 
  GraduationCap, 
  Phone, 
  Mail, 
  Calendar,
  User,
  Plus,
  AlertCircle
} from 'lucide-react';

const StudentsListModal = ({ 
  showModal, 
  setShowModal, 
  students, 
  onLoadStudent, 
  onEditStudent, 
  onAddNewStudent 
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const handleClose = () => {
    setShowModal(false);
    setSearchTerm('');
    setSelectedGrade('');
  };

  const handleLoadStudent = (student) => {
    onLoadStudent(student);
    handleClose();
  };

  const handleEdit = (e, student) => {
    e.stopPropagation();
    onEditStudent(student);
  };

  const handleDeleteClick = (e, student) => {
    e.stopPropagation();
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!user?.uid || !studentToDelete?.id) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', user.uid, 'students', studentToDelete.id));
      alert('Student deleted successfully!');
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
      // Reload students list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
  };

  // Filter students based on search term and grade
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !selectedGrade || student.gradeLevel === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });

  // Get unique grade levels from students
  const uniqueGrades = [...new Set(students.map(s => s.gradeLevel).filter(Boolean))].sort();

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
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-gray-500 text-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                Students Directory ({filteredStudents.length})
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-800 hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, student ID, or parent name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 text-gray-900"
                />
              </div>
              
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 text-gray-900"
              >
                <option value="">All Grades</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  onAddNewStudent();
                  handleClose();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-800 rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Student
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-auto p-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm || selectedGrade ? 'No students found matching your search' : 'No students added yet'}
                </p>
                {!searchTerm && !selectedGrade && (
                  <button
                    onClick={() => {
                      onAddNewStudent();
                      handleClose();
                    }}
                    className="mt-4 px-6 py-2 bg-gray-500 text-gray-800 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add Your First Student
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleLoadStudent(student)}
                    className="border rounded-lg p-4 hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all bg-white"
                  >
                    {/* Student Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {student.name || 'No Name'}
                          </h3>
                          <p className="text-xs text-gray-500">{student.studentId || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleEdit(e, student)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Student"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, student)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-medium">{student.gradeLevel || 'No Grade'}</span>
                      </div>
                      
                      {student.dateOfBirth && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Age: {calculateAge(student.dateOfBirth)} years</span>
                        </div>
                      )}

                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs text-gray-500 mb-1">Parent/Guardian:</p>
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{student.parentName || 'N/A'}</span>
                        </div>
                        
                        {student.parentPhone && (
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-xs">{student.parentPhone}</span>
                          </div>
                        )}
                        
                        {student.parentEmail && (
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-xs truncate">{student.parentEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Medical Alerts */}
                      {(student.allergies || student.medicalInfo) && (
                        <div className="border-t pt-2 mt-2">
                          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs text-sm font-medium">Medical Alert</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Click to Load Indicator */}
                    <div className="mt-3 pt-3 border-t text-center">
                      <span className="text-xs text-indigo-600 text-sm font-medium">
                        Click to load student details
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-800">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students.length} students
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Student</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to delete this student?
              </p>
              <p className="font-semibold text-gray-900">
                {studentToDelete?.name}
              </p>
              <p className="text-xs text-gray-500">
                Student ID: {studentToDelete?.studentId}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentsListModal;