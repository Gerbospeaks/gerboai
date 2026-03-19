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
const sf = (val, decimals = 2) => (Number(val) || 0).toFixed(decimals);
export const TemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["classic"]);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: "Default (Original)",
    classic: "Classic Landscaping",
    modern: "Modern Green",
    elegant: "Elegant Garden",
    premium: "Premium Outdoor",
    eco: "Eco-Friendly Design",
    commercial: "Commercial Landscaping",
  };

  const handleSelectTemplate = (templateId) => {
    onTemplateChange(templateId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-800"
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
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center justify-between ${
                    selectedTemplate === templateId
                      ? "bg-green-50 text-green-600"
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

// Default Landscaping Template
export const DefaultTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  propertyType,
  propertySize,
  propertyAddress,
  accessDetails,
  items,
  subtotal,
  vat,
  total,
  merchantCode,
  serviceType,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#2e7d32",
  showStampDate = true,
}) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-green-700 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
            ) : businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Business Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center"></div>
            )}
            <div>
              <div className="text-xl font-bold text-green-700">
                {businessInfo?.businessName || ""}
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{businessInfo.addressLine1}</div>
            <div>{businessInfo.addressLine2}</div>
            <div>
              {businessInfo.city} {businessInfo.postalCode}
            </div>
            <div className="mt-1">
              T: {businessInfo.primaryPhone}
              {businessInfo.secondaryPhone &&
                `, ${businessInfo.secondaryPhone}`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold mb-4 text-green-700">INVOICE</div>
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
              <span className="font-semibold">MERCHANT CODE</span>
              <span>{merchantCode}</span>
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
      <div className="bg-green-50 p-3 border border-green-200">
        <div className="font-bold text-xs mb-2 bg-green-600 text-gray-800 px-2 py-1">
          INVOICE TO
        </div>
        <div className="text-xs space-y-1">
          <div>{customerName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">
            {customerAddress}
          </div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-green-50 p-3 border border-green-200">
        <div className="font-bold text-xs mb-2 bg-green-600 text-gray-800 px-2 py-1">
          BILL TO
        </div>
        <div className="text-xs space-y-1">
          <div>{customerName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">
            {customerAddress}
          </div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-green-50 p-3 border border-green-200">
        <div className="font-bold text-xs mb-2 bg-green-600 text-gray-800 px-2 py-1">
          PROPERTY DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Type:</span>
            <span>{propertyType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Size:</span>
            <span>{propertySize}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Location:</span>
            <span className="text-[9px]">{propertyAddress}</span>
          </div>
          <div className="mt-2">
            <span className="font-semibold">Access:</span>
            <div className="text-[9px] mt-1">{accessDetails}</div>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-green-600 text-gray-800">
            <th className="text-left px-2 py-1 font-bold">ITEM DESCRIPTION</th>
            <th className="text-center px-2 py-1 font-bold">QUANTITY</th>
            <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
            <th className="text-right px-2 py-1 font-bold">NET PRICE</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="px-2 py-2">{item.description}</td>
              <td className="text-center px-2 py-2">{item.qty}</td>
              <td className="text-right px-2 py-2">R {item.rate.toFixed(2)}</td>
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
          <span>VAT:</span>
          <span>R {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-green-700 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    <div className="bg-green-50 border border-green-200 p-3 mb-4">
      <div className="text-green-700 font-bold text-xs mb-2">
        BANKING DETAILS
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {businessInfo.bankName || "FNB"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {businessInfo.businessName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {businessInfo.accountNumber || "62146991441"}
        </div>
      </div>
    </div>

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
    <div className="text-center text-xs text-green-600 italic">
      NB: All our work comes with a satisfaction guarantee
    </div>
  </div>
);

// Classic Landscaping Template
export const ClassicTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-green-800 pb-4 mb-4">
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
              <div className="text-xl font-bold text-green-800">
                {props.businessInfo.businessName}
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{props.businessInfo.addressLine1}</div>
            <div>
              {props.businessInfo.city}, {props.businessInfo.postalCode}
            </div>
            <div>T: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4 text-green-800">INVOICE</div>
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
      <div className="bg-green-50 p-3 border border-green-200">
        <div className="font-bold text-xs mb-2 bg-green-700 text-gray-800 px-2 py-1">
          CUSTOMER
        </div>
        <div className="text-xs space-y-1">
          <div>{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-green-50 p-3 border border-green-200">
        <div className="font-bold text-xs mb-2 bg-green-700 text-gray-800 px-2 py-1">
          PROPERTY
        </div>
        <div className="text-xs space-y-1">
          <div>Type: {props.propertyType}</div>
          <div>Size: {props.propertySize}</div>
          <div>Location: {props.propertyAddress}</div>
        </div>
      </div>
      <div className="bg-green-50 p-3 border border-green-200">
        <div className="font-bold text-xs mb-2 bg-green-700 text-gray-800 px-2 py-1">
          SERVICE INFO
        </div>
        <div className="text-xs space-y-1">
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>Type: {props.serviceType}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-green-700 text-gray-800">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-2">{item.description}</td>
            <td className="text-center px-2 py-2">{item.qty}</td>
            <td className="text-right px-2 py-2">R {item.rate.toFixed(2)}</td>
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
        <div className="flex justify-between py-2 font-bold bg-green-700 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-200 p-4 mb-4 rounded">
      <div className="text-green-800 font-bold text-sm mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {props.businessInfo.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {props.businessInfo.businessName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {props.businessInfo.accountNumber || "62146991441"}
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
      Thank you for choosing our landscaping services
    </div>
  </div>
);

// Modern Green Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-green-500 pb-6 mb-6">
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
          <div className="text-5xl font-bold text-green-500 mb-4">INVOICE</div>
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
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
        <div className="text-sm font-bold text-gray-700 mb-3">BILL TO</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
        <div className="text-sm font-bold text-green-700 mb-3">
          PROPERTY INFORMATION
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Type:</span> {props.propertyType}
          </div>
          <div>
            <span className="font-semibold">Size:</span> {props.propertySize}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Address:</span>{" "}
            {props.propertyAddress}
          </div>
          <div className="col-span-2 text-xs">
            <span className="font-semibold">Access:</span> {props.accessDetails}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-green-500 text-gray-800">
          <th className="text-left px-4 py-3 rounded-l-lg">Description</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Unit Price</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
            <td className="text-right px-4 py-3 font-semibold">
              R {item.amount.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-4">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-green-500 text-gray-800 px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-200 p-4 mb-4 rounded">
      <div className="text-green-800 font-bold text-sm mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank:</span>{" "}
          {props.businessInfo.bankName || "FNB"}
        </div>
        <div>
          <span className="font-semibold">Account:</span>{" "}
          {props.businessInfo.accountNumber || "62146991441"}
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
  </div>
);

// Template Renderer
export const TemplateRenderer = ({
  templateId,
  documentType = "landscaping",
  stampText = "APPROVED",
  stampColor = "#2e7d32",
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
      return <DefaultTemplate {...templateProps} />;
    case "classic":
      return <ClassicTemplate {...templateProps} />;
    case "modern":
      return <ModernTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
};

export default TemplateSelector;
