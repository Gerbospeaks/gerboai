import React, { useState, useEffect } from "react";
import { FileText, Check } from "lucide-react";

// Template Selector Dropdown Component
export const TemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["classic"]);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    classic: "Classic",
    modern: "Modern",
    professional: "Professional",
    colorful: "Colorful",
  };

  const handleSelectTemplate = (templateId) => {
    onTemplateChange(templateId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">
          {templateNames[selectedTemplate] || "Select Template"}
        </span>
        <span className="sm:hidden">Template</span>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                Your Templates
              </div>
              {Object.keys(templateNames).map((templateId) => (
                <button
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                    selectedTemplate === templateId
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700"
                  }`}
                >
                  <span>{templateNames[templateId]}</span>
                  {selectedTemplate === templateId && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Classic Template Component
export const ClassicTemplate = ({
  businessInfo,
  jobCardNumber,
  term,
  academicYear,
  studentName,
  studentId,
  gradeLevel,
  dateOfBirth,
  parentName,
  parentPhone,
  parentEmail,
  subjects = [],
  attendanceDays,
  attendancePresent,
  teacherComments,
  calculateAverage,
}) => {
  const safeSubjects = subjects || [];

  return (
    <div className="bg-white p-8">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        {businessInfo.logoUrl && (
          <img
            src={businessInfo.logoUrl}
            alt="School Logo"
            className="w-20 h-20 mx-auto mb-4 object-contain"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {businessInfo.businessName || "SCHOOL NAME"}
        </h1>
        <p className="text-sm text-gray-600">
          {businessInfo.addressLine1}, {businessInfo.city}
        </p>
        <p className="text-sm text-gray-600">
          Tel: {businessInfo.primaryPhone}
        </p>
        <h2 className="text-xl font-semibold text-gray-700 mt-4">
          STUDENT REPORT CARD
        </h2>
      </div>

      {/* Report Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <strong>Report Number:</strong> {jobCardNumber}
        </div>
        <div>
          <strong>Academic Period:</strong> {term} {academicYear}
        </div>
      </div>

      {/* Student Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-200 px-4 py-2 mb-3">
          Student Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm px-4">
          <div>
            <strong>Name:</strong> {studentName}
          </div>
          <div>
            <strong>Student ID:</strong> {studentId}
          </div>
          <div>
            <strong>Grade:</strong> {gradeLevel}
          </div>
          <div>
            <strong>Date of Birth:</strong> {dateOfBirth}
          </div>
        </div>
      </div>

      {/* Parent Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-200 px-4 py-2 mb-3">
          Parent/Guardian Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm px-4">
          <div>
            <strong>Name:</strong> {parentName}
          </div>
          <div>
            <strong>Phone:</strong> {parentPhone}
          </div>
          <div className="col-span-2">
            <strong>Email:</strong> {parentEmail}
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-200 px-4 py-2 mb-3">
          Academic Performance
        </h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">
                Subject
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                Mark (%)
              </th>
              <th className="border border-gray-300 px-4 py-2 text-center">
                Grade
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Comments
              </th>
            </tr>
          </thead>
          <tbody>
            {safeSubjects.map((subject, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-4 py-2">
                  {subject.name}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  {subject.mark}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                  {subject.grade}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {subject.comments}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-semibold">
              <td className="border border-gray-300 px-4 py-2">AVERAGE</td>
              <td
                className="border border-gray-300 px-4 py-2 text-center"
                colSpan="3"
              >
                {calculateAverage ? calculateAverage() : "0"}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Attendance */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-200 px-4 py-2 mb-3">
          Attendance Record
        </h3>
        <div className="px-4 text-sm">
          <p>
            <strong>Total School Days:</strong> {attendanceDays}
          </p>
          <p>
            <strong>Days Present:</strong> {attendancePresent}
          </p>
          <p>
            <strong>Attendance Rate:</strong>{" "}
            {attendanceDays && attendancePresent
              ? ((attendancePresent / attendanceDays) * 100).toFixed(1)
              : "0"}
            %
          </p>
        </div>
      </div>

      {/* Teacher Comments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold bg-gray-200 px-4 py-2 mb-3">
          Teacher Comments
        </h3>
        <p className="px-4 text-sm">{teacherComments}</p>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-6 border-t border-gray-300">
        <div>
          <div className="border-t border-gray-400 pt-2 text-center">
            <p className="text-sm font-semibold">Teacher Signature</p>
            <p className="text-xs text-gray-600">Date: _______________</p>
          </div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-2 text-center">
            <p className="text-sm font-semibold">
              Principal: {businessInfo.principalName}
            </p>
            <p className="text-xs text-gray-600">Date: _______________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Template Component
export const ModernTemplate = (props) => {
  const safeSubjects = props.subjects || [];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      {/* Header with logo and info side by side */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {props.businessInfo.logoUrl && (
              <img
                src={props.businessInfo.logoUrl}
                alt="School Logo"
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">
                {props.businessInfo.businessName || "SCHOOL NAME"}
              </h1>
              <p className="text-sm text-gray-600">
                {props.businessInfo.addressLine1}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-indigo-100 px-4 py-2 rounded">
              <p className="text-xs text-indigo-600 font-semibold">
                REPORT CARD
              </p>
              <p className="text-sm font-bold text-indigo-900">
                {props.jobCardNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student and Academic Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded"></span>
            Student Information
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Name:</span>{" "}
              <strong>{props.studentName}</strong>
            </p>
            <p>
              <span className="text-gray-600">ID:</span> {props.studentId}
            </p>
            <p>
              <span className="text-gray-600">Grade:</span> {props.gradeLevel}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded"></span>
            Academic Period
          </h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Term:</span>{" "}
              <strong>{props.term}</strong>
            </p>
            <p>
              <span className="text-gray-600">Year:</span> {props.academicYear}
            </p>
            <p>
              <span className="text-gray-600">Average:</span>{" "}
              <strong className="text-indigo-600">
                {props.calculateAverage ? props.calculateAverage() : "0"}%
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grades */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">
          Academic Performance
        </h3>
        <div className="space-y-2">
          {safeSubjects.map((subject, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{subject.name}</p>
                {subject.comments && (
                  <p className="text-xs text-gray-600 mt-1">
                    {subject.comments}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-indigo-600">
                  {subject.mark}%
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    subject.grade === "A"
                      ? "bg-green-100 text-green-700"
                      : subject.grade === "B"
                        ? "bg-blue-100 text-blue-700"
                        : subject.grade === "C"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {subject.grade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance and Comments */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-indigo-900 mb-3">Attendance</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {props.attendanceDays && props.attendancePresent
                ? (
                    (props.attendancePresent / props.attendanceDays) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </div>
            <p className="text-xs text-gray-600">
              {props.attendancePresent} / {props.attendanceDays} days
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-indigo-900 mb-3">
            Teacher Comments
          </h3>
          <p className="text-xs text-gray-700">{props.teacherComments}</p>
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t-2 border-gray-300 pt-2 mt-8">
              <p className="text-sm font-semibold">Teacher Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-300 pt-2 mt-8">
              <p className="text-sm font-semibold">
                Principal: {props.businessInfo.principalName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional Template Component
export const ProfessionalTemplate = (props) => {
  const safeSubjects = props.subjects || [];

  return (
    <div className="bg-white p-8">
      {/* Letterhead */}
      <div className="border-b-4 border-gray-800 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img
                src={props.businessInfo.logoUrl}
                alt="School Logo"
                className="w-24 h-24 object-contain mb-2"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {props.businessInfo.businessName || "SCHOOL NAME"}
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              {props.businessInfo.addressLine1}
              <br />
              {props.businessInfo.city} {props.businessInfo.postalCode}
              <br />
              Tel: {props.businessInfo.primaryPhone}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-800">ACADEMIC REPORT</h2>
            <p className="text-sm text-gray-600 mt-1">
              Report No: {props.jobCardNumber}
            </p>
            <p className="text-sm text-gray-600">
              {props.term} {props.academicYear}
            </p>
          </div>
        </div>
      </div>

      {/* Student Details Table */}
      <table className="w-full mb-6 text-sm">
        <tbody>
          <tr className="border-b">
            <td className="py-2 font-semibold w-1/4">Student Name:</td>
            <td className="py-2">{props.studentName}</td>
            <td className="py-2 font-semibold w-1/4">Student ID:</td>
            <td className="py-2">{props.studentId}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 font-semibold">Grade Level:</td>
            <td className="py-2">{props.gradeLevel}</td>
            <td className="py-2 font-semibold">Date of Birth:</td>
            <td className="py-2">{props.dateOfBirth}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 font-semibold">Parent/Guardian:</td>
            <td className="py-2">{props.parentName}</td>
            <td className="py-2 font-semibold">Contact:</td>
            <td className="py-2">{props.parentPhone}</td>
          </tr>
        </tbody>
      </table>

      {/* Performance Summary */}
      <div className="mb-6">
        <h3 className="text-md font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-4">
          ACADEMIC PERFORMANCE SUMMARY
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-800">
              <th className="border border-gray-600 px-3 py-2 text-left">
                SUBJECT
              </th>
              <th className="border border-gray-600 px-3 py-2 text-center w-24">
                MARK (%)
              </th>
              <th className="border border-gray-600 px-3 py-2 text-center w-20">
                GRADE
              </th>
              <th className="border border-gray-600 px-3 py-2 text-left">
                REMARKS
              </th>
            </tr>
          </thead>
          <tbody>
            {safeSubjects.map((subject, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-300 px-3 py-2 text-sm font-medium">
                  {subject.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center font-semibold">
                  {subject.mark}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                  {subject.grade}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-xs">
                  {subject.comments}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold">
              <td className="border border-gray-400 px-3 py-2">
                OVERALL AVERAGE
              </td>
              <td
                className="border border-gray-400 px-3 py-2 text-center text-lg"
                colSpan="3"
              >
                {props.calculateAverage ? props.calculateAverage() : "0"}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Attendance Section */}
      <div className="mb-6">
        <h3 className="text-md font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-3">
          ATTENDANCE RECORD
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 border border-gray-300">
            <p className="text-gray-600 text-xs mb-1">Total School Days</p>
            <p className="font-bold text-lg">{props.attendanceDays}</p>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-300">
            <p className="text-gray-600 text-xs mb-1">Days Present</p>
            <p className="font-bold text-lg">{props.attendancePresent}</p>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-300">
            <p className="text-gray-600 text-xs mb-1">Attendance Rate</p>
            <p className="font-bold text-lg">
              {props.attendanceDays && props.attendancePresent
                ? (
                    (props.attendancePresent / props.attendanceDays) *
                    100
                  ).toFixed(1)
                : "0"}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="mb-8">
        <h3 className="text-md font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-3">
          TEACHER'S REMARKS
        </h3>
        <div className="bg-gray-50 border border-gray-300 p-4 min-h-[80px]">
          <p className="text-sm text-gray-800">{props.teacherComments}</p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-12 mt-12">
        <div>
          <div className="border-t border-gray-400 pt-2">
            <p className="text-xs text-gray-600">Class Teacher</p>
            <p className="text-sm font-semibold mt-4">
              _______________________
            </p>
            <p className="text-xs text-gray-600 mt-1">Signature & Date</p>
          </div>
        </div>
        <div>
          <div className="border-t border-gray-400 pt-2">
            <p className="text-xs text-gray-600">Principal</p>
            <p className="text-sm font-semibold mt-1">
              {props.businessInfo.principalName}
            </p>
            <p className="text-sm mt-3">_______________________</p>
            <p className="text-xs text-gray-600 mt-1">Signature & Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Colorful Template Component
export const ColorfulTemplate = (props) => {
  const safeSubjects = props.subjects || [];

  return (
    <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-purple-300">
        <div className="text-center">
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="School Logo"
              className="w-20 h-20 mx-auto mb-3 object-contain"
            />
          )}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {props.businessInfo.businessName || "SCHOOL NAME"}
          </h1>
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-800 px-6 py-2 rounded-full font-bold text-lg">
            ⭐ REPORT CARD ⭐
          </div>
          <p className="text-sm text-gray-600 mt-3">{props.jobCardNumber}</p>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-xs opacity-90 mb-1">Student</p>
          <p className="font-bold text-lg">{props.studentName}</p>
          <p className="text-xs opacity-75">{props.gradeLevel}</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-xs opacity-90 mb-1">Academic Period</p>
          <p className="font-bold text-lg">{props.term}</p>
          <p className="text-xs opacity-75">{props.academicYear}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-red-500 text-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-xs opacity-90 mb-1">Average</p>
          <p className="font-bold text-3xl">
            {props.calculateAverage ? props.calculateAverage() : "0"}%
          </p>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          📚 Subjects & Grades
        </h3>
        <div className="space-y-3">
          {safeSubjects.map((subject, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">
                    {subject.name}
                  </p>
                  {subject.comments && (
                    <p className="text-sm text-gray-600 mt-1">
                      {subject.comments}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-gray-800 font-bold text-xl">
                        {subject.mark}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg ${
                      subject.grade === "A"
                        ? "bg-gradient-to-br from-green-400 to-green-600 text-gray-800"
                        : subject.grade === "B"
                          ? "bg-gradient-to-br from-blue-400 to-blue-600 text-gray-800"
                          : subject.grade === "C"
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-800"
                            : "bg-gradient-to-br from-red-400 to-red-600 text-gray-800"
                    }`}
                  >
                    {subject.grade}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance and Comments */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <h3 className="text-lg font-bold text-purple-700 mb-4">
            📅 Attendance
          </h3>
          <div className="inline-block bg-gradient-to-br from-green-400 to-emerald-500 text-gray-800 rounded-full w-24 h-24 flex items-center justify-center shadow-lg mb-3">
            <div>
              <p className="text-3xl font-bold">
                {props.attendanceDays && props.attendancePresent
                  ? (
                      (props.attendancePresent / props.attendanceDays) *
                      100
                    ).toFixed(0)
                  : "0"}
              </p>
              <p className="text-xs">%</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {props.attendancePresent} out of {props.attendanceDays} days
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-purple-700 mb-3">
            💬 Teacher Comments
          </h3>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
            <p className="text-sm text-gray-700">{props.teacherComments}</p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <div className="border-t-2 border-purple-400 pt-4 mt-8">
                <p className="text-sm font-semibold text-gray-800">
                  Teacher Signature
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Date: _______________
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
              <div className="border-t-2 border-purple-400 pt-4 mt-8">
                <p className="text-sm font-semibold text-gray-800">
                  Principal: {props.businessInfo.principalName}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Date: _______________
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Template Renderer
export const TemplateRenderer = ({
  templateId,
  documentType = "invoice",
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
  showStamp = false,
  ...props
}) => {
  const templateProps = {
    ...props,
    documentType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
  };
  switch (templateId) {
    case "default":
      return <ClassicTemplate {...templateProps} />;
    case "classic":
      return <ClassicTemplate {...templateProps} />;
    case "modern":
      return <ModernTemplate {...templateProps} />;
    case "elegant":
    case "premium":
      return <ProfessionalTemplate {...templateProps} />;
    case "speed":
      return <ColorfulTemplate {...templateProps} />;
    case "diagnostic":
      return <ClassicTemplate {...templateProps} />;
    default:
      return <ModernTemplate {...templateProps} />;
  }
};
export default TemplateSelector;
