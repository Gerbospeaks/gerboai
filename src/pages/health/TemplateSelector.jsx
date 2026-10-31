import React, { useState, useEffect, createContext, useContext } from "react";
import { FileText, Check } from "lucide-react";
import SignatureStamp from "../SignatureStamp";
import { PayNowButton } from "../../components/PayNowButton";

import { useCurrency, resolveCurrency, formatMoney } from "../../contexts/CurrencyContext";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";






const InvoiceCurrencyContext = createContext(null);

const useInvoiceCurrency = (override) => {
  const { currencyCode } = useCurrency();
  return resolveCurrency(override || currencyCode);
};

// Drop-in replacement for `<Money value={x} />`
const Money = ({ value }) => {
  const fromCtx = useContext(InvoiceCurrencyContext);
  const fallback = useInvoiceCurrency();
  return <>{formatMoney(value, fromCtx || fallback)}</>;
};

export const TemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["clinical"]);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: "Default (Original)",
    clinical: "Clinical Standard",
    modern: "Modern Medical",
    wellness: "Wellness Center",
    premium: "Premium Healthcare",
    specialist: "Specialist Practice",
    hospital: "Hospital Services",
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
              {purchasedTemplates.map((templateId) => (
                <button
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between ${
                    selectedTemplate === templateId
                      ? "bg-blue-50 text-blue-600"
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

// Default Healthcare Template
export const DefaultTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  patientId,
  patientDOB,
  patientGender,
  insuranceProvider,
  insuranceNumber,
  diagnosis,
  prescription,
  items,
  subtotal,
  vat,
  total,
  showStamp = false,
  stampText = "PAID",
  stampColor = "#2e7d32",
  showStampDate = true,
  serviceType = "MEDICAL",
}) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-blue-600 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
            ) : businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Facility Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-2xl">+</span>
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-blue-900">
                {businessInfo.businessName}
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-700">
            <div>{businessInfo.addressLine1}</div>
            <div>{businessInfo.addressLine2}</div>
            <div>
              {businessInfo.city} {businessInfo.postalCode}
            </div>
            <div className="mt-1">
              Tel: {businessInfo.primaryPhone}
              {businessInfo.secondaryPhone &&
                ` | ${businessInfo.secondaryPhone}`}
            </div>
            {businessInfo.email && <div>Email: {businessInfo.email}</div>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold mb-4 text-blue-900">
            MEDICAL INVOICE
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">INVOICE NO.</span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">SERVICE TYPE</span>
              <span>{serviceType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Three Column Section */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-blue-50 border border-blue-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-50 text-gray-800 px-2 py-1">
          PATIENT INFORMATION
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{customerName}</div>
          <div className="text-gray-600">Patient ID: {patientId}</div>
          <div className="h-12 overflow-hidden text-xs leading-tight">
            {customerAddress}
          </div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-50 text-gray-800 px-2 py-1">
          PATIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Date of Birth:</span>
            <span>{patientDOB}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Gender:</span>
            <span>{patientGender}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Patient ID:</span>
            <span>{patientId}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-50 text-gray-800 px-2 py-1">
          INSURANCE INFORMATION
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Provider:</span>
            <span>{insuranceProvider || "Self Pay"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Policy No:</span>
            <span>{insuranceNumber || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Clinical Information */}
    {(diagnosis || prescription) && (
      <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3">
        <div className="font-bold text-xs mb-2 text-yellow-800">
          CLINICAL NOTES
        </div>
        <div className="text-xs space-y-2">
          {diagnosis && (
            <div>
              <span className="font-semibold">Diagnosis: </span>
              <span>{diagnosis}</span>
            </div>
          )}
          {prescription && (
            <div>
              <span className="font-semibold">Prescription: </span>
              <span>{prescription}</span>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Services Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 text-gray-800">
            <th className="text-left px-2 py-1 font-bold">
              SERVICE DESCRIPTION
            </th>
            <th className="text-center px-2 py-1 font-bold">QUANTITY</th>
            <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
            <th className="text-right px-2 py-1 font-bold">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="px-2 py-2">{item.description}</td>
              <td className="text-center px-2 py-2">{item.qty}</td>
              <td className="text-right px-2 py-2"><Money value={item.rate} /></td>
              <td className="text-right px-2 py-2">
                R {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-blue-900 text-gray-800 px-2">
          <span>TOTAL DUE:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Payment Information */}
    <div className="bg-green-50 border border-green-200 p-3 mb-4">
      <div className="text-green-800 font-bold text-xs mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {businessInfo.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {businessInfo.businessName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {businessInfo.accountNumber || "XXX-XXX-XXXX"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    {/* Stamp and Signature */}
    {showStamp && (
      <div className="flex justify-end mb-4">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="small"
        />
      </div>
    )}

    {/* Footer */}
    <div className="text-center text-xs text-gray-600 italic border-t pt-3">
      This is a computer-generated invoice. Payment is due within 30 days.
    </div>
  </div>
);

// Clinical Template
export const ClinicalTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-teal-600 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img
                src={props.businessInfo.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <div className="text-xl font-bold text-teal-900">
                {props.businessInfo.businessName}
              </div>
              <div className="text-sm text-gray-600">Medical Services</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-700">
            <div>{props.businessInfo.addressLine1}</div>
            <div>
              {props.businessInfo.city}, {props.businessInfo.postalCode}
            </div>
            <div>Tel: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4 text-teal-600">INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">INVOICE NO.</span>
              <span>{props.jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-teal-50 border border-teal-200 p-3">
        <div className="font-bold text-xs mb-2 bg-teal-600 text-gray-800 px-2 py-1">
          PATIENT
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{props.customerName}</div>
          <div>DOB: {props.patientDOB}</div>
          <div>ID: {props.patientId}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-teal-50 border border-teal-200 p-3">
        <div className="font-bold text-xs mb-2 bg-teal-600 text-gray-800 px-2 py-1">
          INSURANCE
        </div>
        <div className="text-xs space-y-1">
          <div>{props.insuranceProvider || "Self Pay"}</div>
          <div>Policy: {props.insuranceNumber || "N/A"}</div>
        </div>
      </div>
      <div className="bg-teal-50 border border-teal-200 p-3">
        <div className="font-bold text-xs mb-2 bg-teal-600 text-gray-800 px-2 py-1">
          VISIT INFO
        </div>
        <div className="text-xs space-y-1">
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>Type: {props.serviceType}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-teal-600 text-gray-800">
          <th className="text-left px-2 py-1 font-bold">Service</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Rate</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-2">{item.description}</td>
            <td className="text-center px-2 py-2">{item.qty}</td>
            <td className="text-right px-2 py-2"><Money value={item.rate} /></td>
            <td className="text-right px-2 py-2">R {item.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-4">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-teal-900 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-200 p-3 mb-4">
      <div className="text-green-800 font-bold text-xs mb-2">
        PAYMENT DETAILS
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-semibold">Bank:</span>{" "}
          {props.businessInfo.bankName || "FNB"}
        </div>
        <div>
          <span className="font-semibold">Account:</span>{" "}
          {props.businessInfo.accountNumber}
        </div>
      </div>
    </div>

    {props.showStamp && (
      <div className="flex justify-end mb-4">
        <SignatureStamp
          text={props.stampText}
          color={props.stampColor}
          showDate={props.showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}

    <div className="text-center text-xs text-gray-600 italic border-t pt-3">
      Payment due within 30 days. Thank you for choosing our healthcare
      services.
    </div>
  </div>
);

// Modern Medical Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-indigo-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}

          <div className="text-sm text-gray-600 space-y-1">
            <div>{props.businessInfo.addressLine1}</div>
            <div>
              {props.businessInfo.city}, {props.businessInfo.postalCode}
            </div>
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-indigo-500 mb-4">INVOICE</div>
          <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Invoice #:</span>{" "}
              {props.jobCardNumber}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-700 mb-3">
          PATIENT INFORMATION
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div>Patient ID: {props.patientId}</div>
          <div>DOB: {props.patientDOB}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-indigo-700 mb-3">INSURANCE</div>
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-semibold">Provider:</span>{" "}
            {props.insuranceProvider || "Self Pay"}
          </div>
          <div>
            <span className="font-semibold">Policy:</span>{" "}
            {props.insuranceNumber || "N/A"}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-indigo-500 text-gray-800">
          <th className="text-left px-4 py-3 rounded-l-lg">Service</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Rate</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3"><Money value={item.rate} /></td>
            <td className="text-right px-4 py-3 font-semibold">
              R {item.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-6">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-indigo-500 text-gray-800 px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {props.showStamp && (
      <div className="flex justify-center mb-4">
        <SignatureStamp
          text={props.stampText}
          color={props.stampColor}
          showDate={props.showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Professional healthcare services. Payment due within 30 days.
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({
  templateId,
  documentType = "medical",
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
  showStamp = false,
  currency,
  ...props
}) => {
  const code = useInvoiceCurrency(currency);
  const templateProps = {
    ...props,
    documentType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
  };
  let content;
  switch (templateId) {
    case "default":
      return content = <DefaultTemplate {...templateProps} />;
    case "clinical":
      return content = <ClinicalTemplate {...templateProps} />;
    case "modern":
      return content = <ModernTemplate {...templateProps} />;
    default:
      return content = <DefaultTemplate {...templateProps} />;
  }
  return (
    <InvoiceCurrencyContext.Provider value={code}>
      {content}
    </InvoiceCurrencyContext.Provider>
  );
};
// Sick Note Component
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
  additionalNotes,
}) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-4 border-blue-600 p-6">
      {/* Header */}
      <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
        <div className="text-3xl font-bold text-blue-900 mb-2">
          MEDICAL CERTIFICATE
        </div>
        <div className="text-sm text-gray-600">
          Sick Note / Certificate of Illness
        </div>
      </div>

      {/* Facility Info */}
      <div className="mb-6 text-center">
        <div className="text-xl font-bold">{facilityInfo.businessName}</div>
        <div className="text-sm text-gray-600">
          {facilityInfo.addressLine1}, {facilityInfo.city},{" "}
          {facilityInfo.postalCode}
        </div>
        <div className="text-sm text-gray-600">
          Tel: {facilityInfo.primaryPhone}
        </div>
      </div>

      {/* Certificate Body */}
      <div className="space-y-4 mb-6">
        <p className="text-sm">This is to certify that:</p>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Patient Name:</span> {patientName}
            </div>
            <div>
              <span className="font-semibold">ID/Patient No:</span> {patientId}
            </div>
            <div>
              <span className="font-semibold">Date of Birth:</span> {patientDOB}
            </div>
            <div>
              <span className="font-semibold">Date Issued:</span>{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="text-sm leading-relaxed">
          <p className="mb-3">
            was examined and treated at this facility on{" "}
            <span className="font-semibold">
              {new Date().toLocaleDateString()}
            </span>
            .
          </p>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-3">
            <div className="font-semibold mb-2">Diagnosis:</div>
            <div>{diagnosis || "Medical condition requiring rest"}</div>
          </div>

          <p className="mb-3">
            The patient is advised to refrain from work/school for the following
            period:
          </p>

          <div className="bg-red-50 border-2 border-red-500 p-4 rounded mb-3">
            <div className="grid grid-cols-2 gap-4 text-base font-bold">
              <div>
                <span className="text-red-700">FROM:</span> {dateFrom}
              </div>
              <div>
                <span className="text-red-700">TO:</span> {dateTo}
              </div>
            </div>
            <div className="text-center mt-2 text-sm text-red-700">
              (Both dates inclusive)
            </div>
          </div>

          {additionalNotes && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <div className="font-semibold mb-2">Additional Notes:</div>
              <div className="text-sm">{additionalNotes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Doctor Info and Signature */}
      <div className="border-t-2 border-gray-300 pt-6 mt-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm mb-4">
              <div className="font-semibold">Issued by:</div>
              <div className="mt-2">{doctorName}</div>
              <div className="text-gray-600">Medical Practitioner</div>
              <div className="text-gray-600">Practice No: {practiceNumber}</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-right">
              <div className="font-semibold mb-2">Signature:</div>
              <div className="border-b-2 border-gray-400 h-16 mb-2"></div>
              <div className="text-gray-600">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t">
        This certificate is issued in accordance with medical examination
        conducted on the date mentioned above.
        <div className="mt-1">
          For verification, please contact: {facilityInfo.primaryPhone}
        </div>
      </div>
    </div>
  </div>
);
export default TemplateSelector;
