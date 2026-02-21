import React, { useState, useEffect } from "react";
import { FileText, Check } from "lucide-react";
import SignatureStamp from "../SignatureStamp";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Helper function to calculate due date based on payment terms
const calculateDueDate = (terms) => {
  let daysToAdd = 30; // default

  if (terms?.includes("7 Days") || terms?.includes("7 Day")) daysToAdd = 7;
  else if (terms?.includes("15 Days")) daysToAdd = 15;
  else if (terms?.includes("30 Days")) daysToAdd = 30;
  else if (terms?.includes("60 Days")) daysToAdd = 60;
  else if (terms?.includes("90 Days")) daysToAdd = 90;
  else if (terms?.includes("Completion")) daysToAdd = 0;
  else if (terms?.includes("Deposit")) daysToAdd = 0;

  if (daysToAdd === 0) {
    return "Upon Completion";
  }

  return new Date(
    Date.now() + daysToAdd * 24 * 60 * 60 * 1000,
  ).toLocaleDateString("en-ZA");
};

// Template Selector Dropdown Component
export const TemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState([
    "professional",
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: "Classic Carpentry",
    professional: "Professional Woodwork",
    modern: "Modern Craftsman",
    corporate: "Premium Joinery",
    premium: "Executive Furniture",
    contemporary: "Contemporary Wood",
    detailed: "Detailed Estimate",
  };

  useEffect(() => {
    loadPurchasedTemplates();
  }, [user]);

  const loadPurchasedTemplates = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "templates");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPurchasedTemplates([
          "default",
          ...(docSnap.data().purchased || ["professional"]),
        ]);
      } else {
        setPurchasedTemplates(["default", "professional"]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "templates");

      await updateDoc(docRef, {
        active: templateId,
        updatedAt: serverTimestamp(),
      });

      onTemplateChange(templateId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  return (
    <div className="relative print:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-300 rounded-lg hover:bg-amber-50"
      >
        <FileText className="w-4 h-4 text-amber-600" />
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
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-amber-200 rounded-lg shadow-lg z-20 max-h-80 overflow-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-amber-700 px-3 py-2">
                Your Templates
              </div>
              {purchasedTemplates.map((templateId) => (
                <button
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 flex items-center justify-between ${
                    selectedTemplate === templateId
                      ? "bg-amber-100 text-amber-700"
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

// Default/Classic Carpentry Template
export const DefaultTemplate = (props) => <ProfessionalTemplate {...props} />;

// Professional Woodwork Template (Default)
export const ProfessionalTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  customerName,
  customerCompany,
  customerEmail,
  customerPhone,
  customerAddress,
  projectName,
  projectAddress,
  projectType,
  projectSize,
  woodType,
  finishType,
  items,
  subtotal,
  documentType = "invoice",
  vat,
  total,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#92400e",
  showStampDate = true,
  paymentMethod = "Bank Transfer/EFT",
  paymentTerms = "50% Deposit, Balance on Completion",
  serviceGuarantee = "12 Months Craftsmanship Warranty",
}) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-amber-600 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
            ) : businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Company Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-amber-100 rounded flex items-center justify-center">
                <span className="text-amber-700 font-bold text-xl">🪵</span>
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-amber-700">
                {businessInfo.businessName || businessInfo.companyName}
              </div>
              <div className="text-sm font-semibold text-gray-600">
                Professional Carpentry Services
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-600">
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
            {businessInfo.registrationNumber && (
              <div className="mt-1">Reg: {businessInfo.registrationNumber}</div>
            )}
            {businessInfo.vatNumber && <div>VAT: {businessInfo.vatNumber}</div>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-amber-800 mb-4">
            {documentType === "invoice" ? "INVOICE" : "QUOTE"}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">
                {documentType === "quote" ? "Quote No." : "Invoice No."}
              </span>
              <span className="text-amber-900">{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Date</span>
              <span className="text-amber-900">
                {new Date().toLocaleDateString("en-ZA")}
              </span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Wood Type</span>
              <span className="text-amber-900">{woodType || "Oak"}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Finish</span>
              <span className="text-amber-900">{finishType || "Varnish"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Client and Project Information */}
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-amber-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-amber-800">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div className="font-semibold">{customerName}</div>
          {customerCompany && customerCompany !== customerName && (
            <div className="text-gray-600">{customerCompany}</div>
          )}
          <div className="mt-2">{customerAddress}</div>
          <div className="mt-2">{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-amber-800">
          PROJECT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div className="font-semibold">{projectName}</div>
          <div className="mt-2">{projectAddress}</div>
          <div className="flex justify-between mt-2">
            <span className="font-semibold">Type:</span>
            <span>{projectType || "Custom Carpentry"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Units:</span>
            <span>{projectSize || "N/A"} pieces</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Payment Terms:</span>
            <span className="text-xs">{paymentTerms}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-amber-600 text-amber-900">
            <th className="text-left px-3 py-2 font-bold">Description</th>
            <th className="text-center px-3 py-2 font-bold">Category</th>
            <th className="text-center px-3 py-2 font-bold">Qty</th>
            <th className="text-right px-3 py-2 font-bold">Rate</th>
            <th className="text-right px-3 py-2 font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="px-3 py-3">{item.description}</td>
              <td className="text-center px-3 py-3">
                {item.workCategory || item.type || "Custom Work"}
              </td>
              <td className="text-center px-3 py-3">{item.qty}</td>
              <td className="text-right px-3 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-3 py-3 font-semibold">
                R {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="flex justify-end mb-6">
      <div className="w-72 text-sm">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {(subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {(vat || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 font-bold bg-amber-700 text-white px-4 rounded">
          <span>TOTAL:</span>
          <span>R {(total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Payment Information */}
    <div className="bg-amber-50 border border-amber-200 p-4 mb-4 rounded">
      <div className="text-amber-900 font-bold text-sm mb-2">
        BANKING DETAILS
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {businessInfo.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {businessInfo.accountHolder ||
            businessInfo.businessName ||
            businessInfo.companyName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {businessInfo.accountNumber || "62123456789"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {businessInfo.branchCode || "250655"}
        </div>
        <div>
          <span className="font-semibold">Payment Method:</span> {paymentMethod}
        </div>
      </div>
    </div>

    {/* Service Guarantee */}
    {serviceGuarantee && serviceGuarantee !== "No Warranty" && (
      <div className="bg-green-50 border border-green-200 p-3 mb-4 rounded text-center">
        <div className="text-green-700 font-semibold text-sm">
          ✓ {serviceGuarantee}
        </div>
      </div>
    )}

    {/* Signatures and Stamp */}
    <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
      <div>
        <div className="font-semibold mb-1">AUTHORIZED SIGNATURE</div>
        <div className="border-b border-black h-8"></div>
      </div>
      {showStamp && (
        <div className="flex justify-end">
          <SignatureStamp
            text={stampText}
            color={stampColor}
            showDate={showStampDate}
            rotation={-5}
            size="small"
          />
        </div>
      )}
    </div>

    {/* Footer Note */}
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      {documentType === "quote"
        ? "Quote valid for 30 days. Terms & conditions apply."
        : "Payment terms: 50% deposit on acceptance, balance on completion. Warranty: 12 months craftsmanship."}
    </div>
  </div>
);

// Modern Craftsman Template
export const ModernTemplate = (props) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-amber-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {props.businessInfo.businessName || props.businessInfo.companyName}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{props.businessInfo.addressLine1}</div>
            <div>
              {props.businessInfo.city}, {props.businessInfo.postalCode}
            </div>
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-amber-600 mb-4 italic">
            {props.documentType === "quote" ? "QUOTE" : "INVOICE"}
          </div>
          <div className="bg-amber-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">
                {props.documentType === "quote" ? "Quote #" : "Invoice #"}
              </span>{" "}
              {props.jobCardNumber}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Wood:</span>{" "}
              {props.woodType || "Oak"}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-700 mb-3">
          CLIENT INFORMATION
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          {props.customerCompany && (
            <div className="text-gray-600">{props.customerCompany}</div>
          )}
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-amber-800 mb-3">
          PROJECT DETAILS
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Project:</span> {props.projectName}
          </div>
          <div>
            <span className="font-semibold">Type:</span>{" "}
            {props.projectType || "Custom Carpentry"}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.projectAddress}
          </div>
          <div>
            <span className="font-semibold">Units:</span>{" "}
            {props.projectSize || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Wood:</span>{" "}
            {props.woodType || "Oak"}
          </div>
          <div>
            <span className="font-semibold">Finish:</span>{" "}
            {props.finishType || "Varnish"}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-amber-600 text-white">
          <th className="text-left px-4 py-3 rounded-l-lg">Description</th>
          <th className="text-center px-4 py-3">Category</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Rate</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">
              {item.workCategory || item.type || "Custom"}
            </td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
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
        <div className="flex justify-between py-3 text-xl font-bold bg-amber-600 text-white px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-200 p-4 mb-4 rounded">
      <div className="text-amber-900 font-bold text-sm mb-2">
        BANKING DETAILS
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {props.businessInfo.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {props.businessInfo.accountHolder ||
            props.businessInfo.businessName ||
            props.businessInfo.companyName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {props.businessInfo.accountNumber || "62123456789"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    {props.showStamp && (
      <div className="text-center mb-4">
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
      Quality craftsmanship guaranteed. Payment: 50% deposit, balance on
      completion.
    </div>
  </div>
);

// Premium Joinery Template
export const CorporateTemplate = (props) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    <div className="border-4 border-amber-800 p-8">
      <div className="text-center border-b-2 border-amber-800 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img
            src={props.businessInfo.logoUrl}
            alt="Logo"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
        )}
        <div className="text-4xl font-serif font-bold text-gray-900 mb-2">
          {props.businessInfo.businessName || props.businessInfo.companyName}
        </div>
        <div className="text-sm text-gray-600">
          Premium Joinery & Custom Woodwork
        </div>
        <div className="text-sm text-gray-600">
          {props.businessInfo.addressLine1} • {props.businessInfo.city}
        </div>
        <div className="text-2xl font-serif text-amber-700 mt-4">
          {props.documentType === "quote"
            ? "PROJECT QUOTE"
            : "CARPENTRY INVOICE"}
        </div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-gray-900 mb-2">CLIENT</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            {props.customerCompany && (
              <div className="text-gray-600">{props.customerCompany}</div>
            )}
            <div>{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
            <div>{props.customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-gray-900 mb-2">PROJECT</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.projectName}</div>
            <div>Location: {props.projectAddress}</div>
            <div>Type: {props.projectType || "Custom Carpentry"}</div>
            <div>Units: {props.projectSize || "N/A"} pieces</div>
            <div>Wood: {props.woodType || "Oak"}</div>
            <div>Finish: {props.finishType || "Varnish"}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-amber-800">
            <th className="text-left py-2 font-serif">Description</th>
            <th className="text-center py-2 font-serif">Category</th>
            <th className="text-center py-2 font-serif">Qty</th>
            <th className="text-right py-2 font-serif">Rate</th>
            <th className="text-right py-2 font-serif">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3">{item.description}</td>
              <td className="text-center py-3">
                {item.workCategory || item.type || "Custom"}
              </td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-right py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right py-3">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-amber-800 text-white px-4">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 mb-4 rounded">
        <div className="text-amber-900 font-bold text-sm mb-2">
          BANKING DETAILS
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName || "First National Bank"}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder ||
              props.businessInfo.businessName ||
              props.businessInfo.companyName}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber || "62123456789"}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode || "250655"}
          </div>
        </div>
      </div>

      {props.showStamp && (
        <div className="text-center mb-4">
          <div className="mb-4">
            <SignatureStamp
              text={props.stampText}
              color={props.stampColor}
              showDate={props.showStampDate}
              rotation={-5}
              size="medium"
            />
          </div>
          <div
            className="border-t-2 border-amber-800 pt-2"
            style={{ minWidth: "200px" }}
          >
            <p className="text-sm font-semibold">Authorized Signature</p>
            <p className="text-xs text-gray-600">
              {props.businessInfo.businessName ||
                props.businessInfo.companyName}
            </p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Handcrafted excellence. Terms: 50% deposit, balance on completion.
        Warranty: 12 months craftsmanship.
      </div>
    </div>
  </div>
);

// Executive Furniture Template
export const ContemporaryTemplate = (props) => (
  <div
    className="bg-gradient-to-br from-amber-50 to-yellow-50"
    style={{ padding: "5mm 10mm" }}
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-b-4 border-amber-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img
                src={props.businessInfo.logoUrl}
                alt="Logo"
                className="w-20 h-20 object-contain mb-3"
              />
            )}
            <div className="text-3xl font-black text-amber-700 mb-2">
              {props.businessInfo.businessName ||
                props.businessInfo.companyName}
            </div>
            <div className="text-sm text-gray-600">
              Custom Furniture Specialists
            </div>
            <div className="text-sm text-gray-600">
              {props.businessInfo.addressLine1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-amber-600 mb-4 italic">
              {props.documentType === "quote" ? "QUOTE" : "INVOICE"}
            </div>
            <div className="bg-amber-600 text-white p-4 rounded space-y-1">
              <div className="text-sm font-bold">#{props.jobCardNumber}</div>
              <div className="text-sm">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
          <div className="text-sm font-bold text-amber-800 mb-3">CLIENT</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{props.customerName}</div>
            {props.customerCompany && (
              <div className="text-gray-600">{props.customerCompany}</div>
            )}
            <div className="text-gray-600">{props.customerAddress}</div>
            <div className="text-gray-600">{props.customerEmail}</div>
            <div className="text-gray-600">{props.customerPhone}</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
          <div className="text-sm font-bold text-yellow-800 mb-3">PROJECT</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{props.projectName}</div>
            <div className="text-gray-600">{props.projectAddress}</div>
            <div className="text-gray-600">
              Type: {props.projectType || "Custom Furniture"}
            </div>
            <div className="text-gray-600">
              Units: {props.projectSize || "N/A"} pieces
            </div>
            <div className="text-gray-600">Wood: {props.woodType || "Oak"}</div>
            <div className="text-gray-600">
              Finish: {props.finishType || "Varnish"}
            </div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
            <th className="text-left px-4 py-3 font-black">DESCRIPTION</th>
            <th className="text-center px-4 py-3 font-black">CATEGORY</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">RATE</th>
            <th className="text-right px-4 py-3 font-black">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">
                {item.workCategory || item.type || "Custom"}
              </td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-bold">
                R {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-80">
          <div className="flex justify-between py-2 text-gray-600">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-600">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 rounded-lg">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 p-4 mb-4 rounded-lg">
        <div className="text-amber-800 font-bold text-sm mb-2">
          BANKING DETAILS
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName || "First National Bank"}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder ||
              props.businessInfo.businessName ||
              props.businessInfo.companyName}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber || "62123456789"}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode || "250655"}
          </div>
        </div>
      </div>

      {props.showStamp && (
        <div className="text-center mb-4">
          <div className="mb-4">
            <SignatureStamp
              text={props.stampText}
              color={props.stampColor}
              showDate={props.showStampDate}
              rotation={-5}
              size="medium"
            />
          </div>
          <div
            className="border-t-2 border-gray-300 pt-2"
            style={{ minWidth: "200px" }}
          >
            <p className="text-sm font-semibold">Authorized Signature</p>
            <p className="text-xs text-gray-600">
              {props.businessInfo.businessName ||
                props.businessInfo.companyName}
            </p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Crafting quality furniture with passion. Payment: 50% deposit, balance
        on completion.
      </div>
    </div>
  </div>
);

// Detailed Estimate Template
export const DetailedTemplate = (props) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-amber-800 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="text-2xl font-bold text-gray-900 mb-2">
            {props.businessInfo.businessName || props.businessInfo.companyName}
          </div>
          <div className="text-sm font-semibold text-amber-800 mb-2">
            Professional Carpentry & Joinery
          </div>
          <div className="text-sm text-gray-600">
            {props.businessInfo.addressLine1}
          </div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-amber-800 mb-4">
            {props.documentType === "quote" ? "DETAILED QUOTE" : "INVOICE"}
          </div>
          <div className="bg-amber-100 border-2 border-amber-800 p-3 rounded">
            <div className="text-sm">
              <span className="font-bold">Number:</span> {props.jobCardNumber}
            </div>
            <div className="text-sm">
              <span className="font-bold">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-amber-800 p-4 rounded">
        <div className="text-sm font-bold text-amber-800 mb-3">CLIENT</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
          {props.customerCompany &&
            props.customerCompany !== props.customerName && (
              <div>
                <span className="font-semibold">Company:</span>{" "}
                {props.customerCompany}
              </div>
            )}
          <div>
            <span className="font-semibold">Email:</span> {props.customerEmail}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {props.customerPhone}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {props.customerAddress}
          </div>
        </div>
      </div>
      <div className="border-2 border-amber-800 p-4 rounded">
        <div className="text-sm font-bold text-amber-800 mb-3">PROJECT</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.projectName}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.projectAddress}
          </div>
          <div>
            <span className="font-semibold">Type:</span>{" "}
            {props.projectType || "Custom Carpentry"}
          </div>
          <div>
            <span className="font-semibold">Units:</span>{" "}
            {props.projectSize || "N/A"} pieces
          </div>
          <div>
            <span className="font-semibold">Wood Type:</span>{" "}
            {props.woodType || "Oak"}
          </div>
          <div>
            <span className="font-semibold">Finish:</span>{" "}
            {props.finishType || "Varnish"}
          </div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-amber-800 text-white px-4 py-2 font-bold">
        CARPENTRY ITEMS
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-amber-100 border-b-2 border-amber-800">
            <th className="text-left px-4 py-2 text-sm">Description</th>
            <th className="text-center px-4 py-2 text-sm">Category</th>
            <th className="text-center px-4 py-2 text-sm">Qty</th>
            <th className="text-right px-4 py-2 text-sm">Rate</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">
                {item.workCategory || item.type || "Custom"}
              </td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-semibold">
                R {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-amber-800 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-amber-800 text-white px-4 rounded">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-amber-100 border border-amber-300 p-4 mb-4 rounded">
      <div className="text-amber-900 font-bold text-sm mb-2">
        BANKING DETAILS
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {props.businessInfo.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {props.businessInfo.accountHolder ||
            props.businessInfo.businessName ||
            props.businessInfo.companyName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {props.businessInfo.accountNumber || "62123456789"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    {props.showStamp && (
      <div className="text-center mb-4">
        <div className="mb-4">
          <SignatureStamp
            text={props.stampText}
            color={props.stampColor}
            showDate={props.showStampDate}
            rotation={-5}
            size="medium"
          />
        </div>
        <div
          className="border-t-2 border-gray-800 pt-2"
          style={{ minWidth: "200px" }}
        >
          <p className="text-sm font-semibold">Authorized Signature</p>
          <p className="text-xs text-gray-600">
            {props.businessInfo.businessName || props.businessInfo.companyName}
          </p>
        </div>
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Payment terms: 50% deposit on acceptance, balance on completion. Warranty:
      12 months on craftsmanship.
    </div>
  </div>
);

// Legacy template names for backwards compatibility
export const ClassicTemplate = (props) => <ProfessionalTemplate {...props} />;
export const IndustrialTemplate = (props) => <CorporateTemplate {...props} />;
export const ResidentialTemplate = (props) => (
  <ContemporaryTemplate {...props} />
);
export const CommercialTemplate = (props) => <DetailedTemplate {...props} />;

// Template Renderer
export const TemplateRenderer = ({
  templateId,
  documentType = "invoice",
  stampText = "APPROVED",
  stampColor = "#92400e",
  showStampDate = true,
  showStamp = false,
  paymentMethod = "Bank Transfer/EFT",
  paymentTerms = "50% Deposit, Balance on Completion",
  serviceGuarantee = "12 Months Craftsmanship Warranty",
  ...props
}) => {
  const templateProps = {
    ...props,
    documentType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
    paymentMethod,
    paymentTerms,
    serviceGuarantee,
  };

  switch (templateId) {
    case "default":
      return <DefaultTemplate {...templateProps} />;
    case "professional":
      return <ProfessionalTemplate {...templateProps} />;
    case "modern":
      return <ModernTemplate {...templateProps} />;
    case "corporate":
    case "premium":
      return <CorporateTemplate {...templateProps} />;
    case "contemporary":
      return <ContemporaryTemplate {...templateProps} />;
    case "detailed":
      return <DetailedTemplate {...templateProps} />;
    // Legacy template names for backwards compatibility
    case "classic":
      return <ClassicTemplate {...templateProps} />;
    case "industrial":
      return <IndustrialTemplate {...templateProps} />;
    case "residential":
      return <ResidentialTemplate {...templateProps} />;
    case "commercial":
      return <CommercialTemplate {...templateProps} />;
    default:
      return <ProfessionalTemplate {...templateProps} />;
  }
};

export default TemplateSelector;
