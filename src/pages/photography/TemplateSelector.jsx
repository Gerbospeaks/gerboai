import React, { useState, useEffect } from "react";
import { FileText, Check } from "lucide-react";
import SignatureStamp from "../SignatureStamp";
import { PayNowButton } from "../../components/PayNowButton";
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
    classic: "Classic Workshop",
    modern: "Modern Minimalist",
    elegant: "Elegant Business",
    premium: "Premium Auto Service",
    speed: "Speed Shop Pro",
    diagnostic: "Diagnostic Specialist",
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
          ...(docSnap.data().purchased || ["classic"]),
        ]);
      } else {
        setPurchasedTemplates(["default", "classic"]);
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
                      ? "bg-orange-50 text-orange-600"
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

// Default Template (Your Original)
export const DefaultTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  eventType,
  eventDate,
  eventLocation,
  items,
  subtotal,
  vat,
  total,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
}) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {businessInfo.logoUrl && (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <div className="text-xl font-bold">
                {businessInfo.businessName}
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{businessInfo.addressLine1}</div>
            <div>
              {businessInfo.city}, {businessInfo.postalCode}
            </div>
            <div>T: {businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4">PHOTOGRAPHY INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">INVOICE NO.</span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {customerName}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {customerEmail}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {customerPhone}
          </div>
          <div>
            <span className="font-semibold">Address:</span> {customerAddress}
          </div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          EVENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Type:</span> {eventType}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {eventDate}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {eventLocation}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items &&
          items.map((item, i) => (
            <tr key={i} className="border-b">
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
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    {businessInfo.bankName && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {businessInfo.bankName}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {businessInfo.accountHolder}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {businessInfo.accountNumber}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {businessInfo.branchCode}
          </div>
        </div>
      </div>
    )}

    {/* Stamp */}
    {showStamp && (
      <div className="flex justify-center mb-4">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for choosing us for your special moments!
    </div>
  </div>
);

// Classic Template
export const ClassicTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
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
            <div></div>
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
          <div className="text-3xl font-bold mb-4">PHOTOGRAPHY INVOICE</div>
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

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          EVENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Type:</span> {props.eventType}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {props.eventDate}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.eventLocation}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items &&
          props.items.map((item, i) => (
            <tr key={i} className="border-b">
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

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    {props.businessInfo.bankName && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode}
          </div>
        </div>
      </div>
    )}

    {/* Stamp */}
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
      Thank you for choosing us for your special moments!
    </div>
  </div>
);

// Modern Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
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
            <div></div>
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
          <div className="text-3xl font-bold mb-4">PHOTOGRAPHY INVOICE</div>
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

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          EVENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Type:</span> {props.eventType}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {props.eventDate}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.eventLocation}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items &&
          props.items.map((item, i) => (
            <tr key={i} className="border-b">
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

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    {props.businessInfo.bankName && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode}
          </div>
        </div>
      </div>
    )}

    {/* Stamp */}
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
      Thank you for choosing us for your special moments!
    </div>
  </div>
);

// Elegant/Premium Template
export const ElegantTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
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
            <div></div>
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
          <div className="text-3xl font-bold mb-4">PHOTOGRAPHY INVOICE</div>
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

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          EVENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Type:</span> {props.eventType}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {props.eventDate}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.eventLocation}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items &&
          props.items.map((item, i) => (
            <tr key={i} className="border-b">
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

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    {props.businessInfo.bankName && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode}
          </div>
        </div>
      </div>
    )}

    {/* Stamp */}
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
      Thank you for choosing us for your special moments!
    </div>
  </div>
);

// Speed Shop Template
export const SpeedTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
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
            <div></div>
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
          <div className="text-3xl font-bold mb-4">PHOTOGRAPHY INVOICE</div>
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

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          EVENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Type:</span> {props.eventType}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {props.eventDate}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.eventLocation}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items &&
          props.items.map((item, i) => (
            <tr key={i} className="border-b">
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

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    {props.businessInfo.bankName && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode}
          </div>
        </div>
      </div>
    )}

    {/* Stamp */}
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
      Thank you for choosing us for your special moments!
    </div>
  </div>
);
// Diagnostic Template
export const DiagnosticTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
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
            <div></div>
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
          <div className="text-3xl font-bold mb-4">PHOTOGRAPHY INVOICE</div>
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

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          EVENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Type:</span> {props.eventType}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {props.eventDate}
          </div>
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {props.eventLocation}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items &&
          props.items.map((item, i) => (
            <tr key={i} className="border-b">
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

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    {props.businessInfo.bankName && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.accountHolder}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode}
          </div>
        </div>
      </div>
    )}

    {/* Stamp */}
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
      Thank you for choosing us for your special moments!
    </div>
  </div>
);
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
      return <DefaultTemplate {...templateProps} />;
    case "classic":
      return <ClassicTemplate {...templateProps} />;
    case "modern":
      return <ModernTemplate {...templateProps} />;
    case "elegant":
    case "premium":
      return <ElegantTemplate {...templateProps} />;
    case "speed":
      return <SpeedTemplate {...templateProps} />;
    case "diagnostic":
      return <DiagnosticTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
};
export default TemplateSelector;
