import React, { useState } from 'react';

const SickNoteDocument = ({ 
  facilityInfo, 
  patientName, 
  patientId, 
  patientDOB, 
  diagnosis,
  dateFrom,
  dateTo,
  doctorName,
  practiceNumber,
  additionalNotes 
}) => {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {facilityInfo?.logoUrl && (
              <img 
                src={facilityInfo.logoUrl} 
                alt="Facility Logo" 
                className="h-16 mb-2"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-800">
              {facilityInfo?.facilityName || 'Medical Facility'}
            </h1>
            <p className="text-sm text-gray-600">{facilityInfo?.addressLine1}</p>
            <p className="text-sm text-gray-600">{facilityInfo?.addressLine2}</p>
            <p className="text-sm text-gray-600">
              {facilityInfo?.city} {facilityInfo?.postalCode}
            </p>
            <p className="text-sm text-gray-600">Tel: {facilityInfo?.primaryPhone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-blue-600">MEDICAL CERTIFICATE</h2>
            <p className="text-sm text-gray-600 mt-2">
              Practice No: {practiceNumber}
            </p>
            <p className="text-sm text-gray-600">
              Date Issued: {new Date().toLocaleDateString('en-ZA')}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
          <div>
            <span className="text-sm font-medium text-gray-600">Name:</span>
            <p className="text-base font-semibold">{patientName}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Patient ID:</span>
            <p className="text-base font-semibold">{patientId}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
            <p className="text-base font-semibold">
              {patientDOB ? new Date(patientDOB).toLocaleDateString('en-ZA') : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Medical Certificate Content */}
      <div className="mb-6 border border-gray-300 rounded p-6 bg-yellow-50">
        <p className="text-base leading-relaxed mb-4">
          This is to certify that <strong>{patientName}</strong> was examined by me on{' '}
          <strong>{new Date().toLocaleDateString('en-ZA')}</strong> and found to be suffering from:
        </p>
        
        <div className="bg-white p-4 rounded border-l-4 border-blue-600 mb-4">
          <p className="font-semibold text-gray-800">{diagnosis || 'Medical condition requiring rest'}</p>
        </div>

        <p className="text-base leading-relaxed mb-4">
          The patient is advised to be absent from work/school for the period:
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded border border-gray-300">
            <span className="text-sm font-medium text-gray-600">From:</span>
            <p className="text-lg font-bold text-blue-600">
              {dateFrom ? new Date(dateFrom).toLocaleDateString('en-ZA') : 'N/A'}
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-300">
            <span className="text-sm font-medium text-gray-600">To:</span>
            <p className="text-lg font-bold text-blue-600">
              {dateTo ? new Date(dateTo).toLocaleDateString('en-ZA') : 'N/A'}
            </p>
          </div>
        </div>

        {additionalNotes && (
          <div className="bg-white p-4 rounded border border-gray-300 mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Additional Notes:</p>
            <p className="text-base">{additionalNotes}</p>
          </div>
        )}
      </div>

      {/* Doctor Signature Section */}
      <div className="border-t-2 border-gray-300 pt-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600 mb-1">Signed by:</p>
            <p className="text-lg font-bold">{doctorName}</p>
            <p className="text-sm text-gray-600">Medical Practitioner</p>
            <p className="text-sm text-gray-600">Practice Number: {practiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
            <p className="text-sm text-gray-600">Signature</p>
            <p className="text-sm text-gray-600 mt-2">
              Date: {new Date().toLocaleDateString('en-ZA')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-500">
          This medical certificate is issued in good faith based on examination findings.
        </p>
        <p className="text-xs text-gray-500">
          Any queries regarding this certificate should be directed to {facilityInfo?.primaryPhone}
        </p>
      </div>
    </div>
  );
};

const SickNoteModal = ({ 
  isOpen, 
  onClose, 
  facilityInfo,
  patientName,
  patientId,
  patientDOB,
  diagnosis 
}) => {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [doctorName, setDoctorName] = useState('Dr. Jane Smith');
  const [practiceNumber, setPracticeNumber] = useState('MP123456');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const sickNoteHTML = document.getElementById('sick-note-preview').innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Certificate - ${patientName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
            }
            @media print {
              body { margin: 0; }
              @page { 
                size: A4;
                margin: 20mm; 
              }
            }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${sickNoteHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-800">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Medical Certificate
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-auto p-6 flex-1">
          {/* Input Form */}
          <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Certificate Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Sick Leave From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Sick Leave To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. Full Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Practice Number
                </label>
                <input
                  type="text"
                  value={practiceNumber}
                  onChange={(e) => setPracticeNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MP123456"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Additional Notes (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Any additional instructions or notes..."
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </h3>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Certificate
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
              <div id="sick-note-preview">
                <SickNoteDocument
                  facilityInfo={facilityInfo}
                  patientName={patientName}
                  patientId={patientId}
                  patientDOB={patientDOB}
                  diagnosis={diagnosis}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  doctorName={doctorName}
                  practiceNumber={practiceNumber}
                  additionalNotes={additionalNotes}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SickNoteModal;