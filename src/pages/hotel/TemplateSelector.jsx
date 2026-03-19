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
    default: "Default Hotel",
    classic: "Classic Hospitality",
    modern: "Modern Boutique",
    elegant: "Elegant Resort",
    premium: "Premium Hotel",
    luxury: "Luxury Suite",
    business: "Business Hotel",
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

// Default Hotel Template
export const DefaultHotelTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  guestId,
  guestDOB,
  guestNationality,
  idType,
  idNumber,
  roomNumber,
  roomType,
  checkInDate,
  checkOutDate,
  numberOfGuests,
  numberOfNights,
  items,
  subtotal,
  vat,
  total,
  showStamp = false,
  stampText = "PAID",
  stampColor = "#2e7d32",
  showStampDate = true,
}) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-gray-800 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
            ) : businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Hotel Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center"></div>
            )}
            <div>
              <div className="text-2xl font-bold">
                {businessInfo.businessName}
              </div>
              <div className="text-sm text-gray-600">
                {businessInfo.tagline || "Hospitality & Comfort"}
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
              T: {businessInfo.primaryPhone}
              {businessInfo.secondaryPhone &&
                `, ${businessInfo.secondaryPhone}`}
            </div>
            {businessInfo.email && <div>E: {businessInfo.email}</div>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold mb-4 text-blue-600">INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">INVOICE NO.</span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">CHECK-IN</span>
              <span>{checkInDate}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">CHECK-OUT</span>
              <span>{checkOutDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Guest and Room Information */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-gray-100 p-3 rounded">
        <div className="font-bold text-xs mb-2 bg-gray-800 px-2 py-1 rounded">
          GUEST DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{customerName}</div>
          <div className="text-gray-600">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
          {guestNationality && <div>Nationality: {guestNationality}</div>}
        </div>
      </div>

      <div className="bg-gray-100 p-3 rounded">
        <div className="font-bold text-xs mb-2 bg-gray-800 px-2 py-1 rounded">
          IDENTIFICATION
        </div>
        <div className="text-xs space-y-1">
          {guestId && <div>Guest ID: {guestId}</div>}
          {idType && <div>ID Type: {idType}</div>}
          {idNumber && <div>ID Number: {idNumber}</div>}
          {guestDOB && <div>Date of Birth: {guestDOB}</div>}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1 rounded">
          ROOM DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Room Number:</span>
            <span className="text-lg font-bold text-blue-600">
              {roomNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Room Type:</span>
            <span>{roomType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Guests:</span>
            <span>{numberOfGuests}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Nights:</span>
            <span>{numberOfNights}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800">
            <th className="text-left px-2 py-2 font-bold">DESCRIPTION</th>
            <th className="text-center px-2 py-2 font-bold">QUANTITY</th>
            <th className="text-right px-2 py-2 font-bold">UNIT PRICE</th>
            <th className="text-right px-2 py-2 font-bold">AMOUNT</th>
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
          <span>VAT (15%):</span>
          <span>R {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-blue-600 text-gray-800 px-2 rounded">
          <span>TOTAL:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Payment Information */}
    <div className="bg-blue-50 border border-blue-200 p-3 mb-4 rounded">
      <div className="text-blue-800 font-bold text-xs mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1 text-gray-700">
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
          {businessInfo.accountNumber || "N/A"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {businessInfo.branchCode || "N/A"}
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
          size="medium"
        />
      </div>
    )}

    {/* Footer Note */}
    <div className="text-center text-xs text-gray-600 italic border-t pt-3">
      Thank you for staying with us. We hope to welcome you again soon!
    </div>
  </div>
);

// Classic Hospitality Template
export const ClassicHotelTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-amber-700 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="text-2xl font-serif font-bold text-amber-800">
            {props.businessInfo.businessName}
          </div>
          <div className="text-sm text-gray-600 italic">
            Est. {props.businessInfo.established || "1995"}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {props.businessInfo.addressLine1}, {props.businessInfo.city}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-serif text-amber-700 mb-4">INVOICE</div>
          <div className="bg-amber-50 p-3 rounded border border-amber-200">
            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold">Invoice #:</span>{" "}
                {props.jobCardNumber}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-amber-200 p-4 rounded">
        <div className="font-serif font-bold text-amber-800 mb-3">
          GUEST INFORMATION
        </div>
        <div className="text-sm space-y-1">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-amber-50 p-4 rounded border border-amber-200">
        <div className="font-serif font-bold text-amber-800 mb-3">
          RESERVATION DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Room:</span> {props.roomNumber} -{" "}
            {props.roomType}
          </div>
          <div>
            <span className="font-semibold">Check-in:</span> {props.checkInDate}
          </div>
          <div>
            <span className="font-semibold">Check-out:</span>{" "}
            {props.checkOutDate}
          </div>
          <div>
            <span className="font-semibold">Nights:</span>{" "}
            {props.numberOfNights}
          </div>
          <div>
            <span className="font-semibold">Guests:</span>{" "}
            {props.numberOfGuests}
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-sm mb-6">
      <thead>
        <tr className="bg-amber-700 text-gray-800">
          <th className="text-left px-4 py-2 font-serif">Service</th>
          <th className="text-center px-4 py-2 font-serif">Qty</th>
          <th className="text-right px-4 py-2 font-serif">Rate</th>
          <th className="text-right px-4 py-2 font-serif">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b border-amber-200">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
            <td className="text-right px-4 py-3">R {item.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-6">
      <div className="w-80">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 font-bold text-lg bg-amber-700 text-gray-800 px-4 rounded">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-200 p-4 mb-4 rounded">
      <div className="text-amber-800 font-bold text-sm mb-2">
        PAYMENT DETAILS
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-semibold">Bank:</span>{" "}
          {props.businessInfo.bankName || "N/A"}
        </div>
        <div>
          <span className="font-semibold">Account:</span>{" "}
          {props.businessInfo.accountNumber || "N/A"}
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

    <div className="text-center text-xs text-gray-600 italic border-t border-amber-200 pt-4">
      "Your comfort is our priority. Thank you for choosing{" "}
      {props.businessInfo.businessName}"
    </div>
  </div>
);

// Modern Boutique Template
export const ModernHotelTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-purple-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-24 h-24 object-contain mb-3"
            />
          )}
          <div className="text-3xl font-bold text-gray-900">
            {props.businessInfo.businessName}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {props.businessInfo.addressLine1}
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-purple-500 mb-4">INVOICE</div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm space-y-1">
              <div>#{props.jobCardNumber}</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-100 p-5 rounded-lg">
        <div className="text-sm font-bold text-purple-600 mb-3">GUEST</div>
        <div className="space-y-1">
          <div className="font-bold text-xl">{props.customerName}</div>
          <div className="text-sm text-gray-600">{props.customerEmail}</div>
          <div className="text-sm text-gray-600">{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-purple-50 p-5 rounded-lg">
        <div className="text-sm font-bold text-purple-600 mb-3">STAY</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Room:</span>
            <span className="font-bold">{props.roomNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span>{props.roomType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in:</span>
            <span>{props.checkInDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out:</span>
            <span>{props.checkOutDate}</span>
          </div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-purple-500 text-gray-800">
          <th className="text-left px-4 py-3 rounded-l-lg">Item</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Price</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Total</th>
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

    <div className="flex justify-end mb-6">
      <div className="w-80">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT:</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-4 text-xl font-bold bg-purple-500 text-gray-800 px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
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

    <div className="text-center text-sm text-gray-500 border-t pt-4">
      Thank you for your stay at {props.businessInfo.businessName}
    </div>
  </div>
);

// Luxury Resort Template
export const LuxuryHotelTemplate = (props) => (
  <div
    className="bg-gradient-to-br from-amber-50 to-white"
    style={{ padding: "15mm 20mm" }}
  >
    <div className="border-4 border-double border-amber-600 p-8">
      <div className="text-center border-b-2 border-amber-600 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img
            src={props.businessInfo.logoUrl}
            alt="Logo"
            className="w-32 h-32 object-contain mx-auto mb-4"
          />
        )}
        <div className="text-4xl font-serif font-bold text-amber-800 mb-2">
          {props.businessInfo.businessName}
        </div>
        <div className="text-sm text-gray-600 italic">
          Luxury Hospitality Since {props.businessInfo.established || "1990"}
        </div>
        <div className="text-3xl font-serif text-amber-700 mt-6">INVOICE</div>
        <div className="text-sm text-gray-600 mt-2">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border-2 border-amber-300 p-5 rounded bg-white">
          <div className="font-serif font-bold text-amber-800 mb-3 text-lg">
            ESTEEMED GUEST
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-xl">{props.customerName}</div>
            <div className="text-sm text-gray-600">{props.customerAddress}</div>
            <div className="text-sm">{props.customerEmail}</div>
          </div>
        </div>
        <div className="border-2 border-amber-300 p-5 rounded bg-white">
          <div className="font-serif font-bold text-amber-800 mb-3 text-lg">
            ACCOMMODATION
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Suite:</span>
              <span className="font-bold text-lg text-amber-700">
                {props.roomNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span>{props.roomType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span>{props.numberOfNights} nights</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Period:</span>
              <span>
                {props.checkInDate} - {props.checkOutDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 bg-white">
        <thead>
          <tr className="border-b-2 border-amber-600">
            <th className="text-left py-3 px-4 font-serif text-amber-800">
              Service Description
            </th>
            <th className="text-center py-3 px-4 font-serif text-amber-800">
              Qty
            </th>
            <th className="text-right py-3 px-4 font-serif text-amber-800">
              Rate
            </th>
            <th className="text-right py-3 px-4 font-serif text-amber-800">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-amber-200">
              <td className="py-3 px-4">{item.description}</td>
              <td className="text-center py-3 px-4">{item.qty}</td>
              <td className="text-right py-3 px-4">R {item.rate.toFixed(2)}</td>
              <td className="text-right py-3 px-4 font-semibold">
                R {item.amount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-96 bg-white p-4 rounded border-2 border-amber-300">
          <div className="flex justify-between py-2 text-gray-600">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-600">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-4 text-2xl font-serif font-bold bg-amber-600 text-gray-800 px-4 rounded">
            <span>TOTAL DUE:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {props.showStamp && (
        <div className="flex justify-center mb-6">
          <SignatureStamp
            text={props.stampText}
            color={props.stampColor}
            showDate={props.showStampDate}
            rotation={-5}
            size="large"
          />
        </div>
      )}

      <div className="text-center text-sm text-gray-600 italic border-t-2 border-amber-600 pt-4 mt-4">
        We appreciate your patronage and look forward to welcoming you again
      </div>
    </div>
  </div>
);

// Business Hotel Template
export const BusinessHotelTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-3 border-gray-800 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="text-2xl font-bold text-gray-900">
            {props.businessInfo.businessName}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {props.businessInfo.addressLine1}, {props.businessInfo.city}
          </div>
          <div className="text-sm text-gray-600">
            {props.businessInfo.primaryPhone}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-gray-800 mb-3">INVOICE</div>
          <div className="bg-gray-100 p-3 rounded border-2 border-gray-800">
            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold">Invoice:</span>{" "}
                {props.jobCardNumber}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="border border-gray-300 p-4 rounded">
        <div className="text-xs font-bold text-gray-600 mb-2 uppercase">
          Guest Information
        </div>
        <div className="text-sm space-y-1">
          <div className="font-semibold">{props.customerName}</div>
          <div className="text-gray-600 text-xs">{props.customerEmail}</div>
          <div className="text-gray-600 text-xs">{props.customerPhone}</div>
          {props.guestId && <div className="text-xs">ID: {props.guestId}</div>}
        </div>
      </div>
      <div className="border border-gray-300 p-4 rounded">
        <div className="text-xs font-bold text-gray-600 mb-2 uppercase">
          Accommodation
        </div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600 text-xs">Room:</span>
            <span className="font-bold">{props.roomNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-xs">Type:</span>
            <span className="text-xs">{props.roomType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 text-xs">Guests:</span>
            <span className="text-xs">{props.numberOfGuests}</span>
          </div>
        </div>
      </div>
      <div className="border border-gray-300 p-4 rounded bg-gray-50">
        <div className="text-xs font-bold text-gray-600 mb-2 uppercase">
          Stay Period
        </div>
        <div className="text-sm space-y-1">
          <div className="text-xs">
            <span className="text-gray-600">Check-in:</span>
            <div className="font-semibold">{props.checkInDate}</div>
          </div>
          <div className="text-xs">
            <span className="text-gray-600">Check-out:</span>
            <div className="font-semibold">{props.checkOutDate}</div>
          </div>
          <div className="text-xs">
            <span className="text-gray-600">Duration:</span>{" "}
            {props.numberOfNights} nights
          </div>
        </div>
      </div>
    </div>

    <table className="w-full text-sm mb-6 border border-gray-300">
      <thead>
        <tr className="bg-gray-50 text-gray-800">
          <th className="text-left px-4 py-2">Description</th>
          <th className="text-center px-4 py-2">Quantity</th>
          <th className="text-right px-4 py-2">Unit Price</th>
          <th className="text-right px-4 py-2">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b border-gray-200">
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

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-gray-800">
        <div className="flex justify-between py-2 px-4 bg-gray-100">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 px-4 bg-gray-100">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 px-4 font-bold text-lg bg-gray-50 text-gray-800">
          <span>TOTAL DUE:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-gray-100 border border-gray-300 p-4 mb-4 rounded">
      <div className="text-gray-800 font-bold text-sm mb-2">
        PAYMENT DETAILS
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank:</span>{" "}
          {props.businessInfo.bankName || "N/A"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {props.businessInfo.businessName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {props.businessInfo.accountNumber || "N/A"}
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

    <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-3">
      Thank you for choosing {props.businessInfo.businessName} for your business
      travel needs
    </div>
  </div>
);

// Elegant Resort Template
export const ElegantHotelTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-4 border-teal-700 p-8">
      <div className="text-center border-b-2 border-teal-700 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img
            src={props.businessInfo.logoUrl}
            alt="Logo"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
        )}
        <div className="text-4xl font-serif font-bold text-teal-800 mb-2">
          {props.businessInfo.businessName}
        </div>
        <div className="text-sm text-gray-600">
          {props.businessInfo.addressLine1} • {props.businessInfo.city}
        </div>
        <div className="text-2xl font-serif text-teal-700 mt-4">
          GUEST INVOICE
        </div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-teal-800 mb-2">
            HONORED GUEST
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold text-lg">{props.customerName}</div>
            <div className="text-gray-600">{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
            <div>{props.customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-teal-800 mb-2">
            RESERVATION
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Room:</span>
              <span className="font-bold text-teal-700">
                {props.roomNumber} - {props.roomType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span>{props.checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span>{props.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span>
                {props.numberOfNights} nights • {props.numberOfGuests} guests
              </span>
            </div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-teal-700">
            <th className="text-left py-2 font-serif text-teal-800">Service</th>
            <th className="text-center py-2 font-serif text-teal-800">Qty</th>
            <th className="text-right py-2 font-serif text-teal-800">Rate</th>
            <th className="text-right py-2 font-serif text-teal-800">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-teal-200">
              <td className="py-3">{item.description}</td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-right py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right py-3 font-semibold">
                R {item.amount.toFixed(2)}
              </td>
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
          <div className="flex justify-between py-3 font-bold text-lg bg-teal-700 text-gray-800 px-4">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 p-4 mb-4 rounded">
        <div className="text-teal-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank:</span>{" "}
            {props.businessInfo.bankName || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Account:</span>{" "}
            {props.businessInfo.accountNumber || "N/A"}
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

      <div className="text-center text-sm text-gray-600 italic border-t-2 border-teal-700 pt-4">
        It has been our pleasure to serve you. We hope to welcome you back soon.
      </div>
    </div>
  </div>
);

// Premium Hotel Template
export const PremiumHotelTemplate = (props) => (
  <div
    className="bg-gradient-to-b from-slate-50 to-white"
    style={{ padding: "15mm 20mm" }}
  >
    <div className="border-l-8 border-r-8 border-slate-800 p-6">
      <div className="border-b-4 border-slate-800 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img
                src={props.businessInfo.logoUrl}
                alt="Logo"
                className="w-24 h-24 object-contain mb-3"
              />
            )}
            <div className="text-3xl font-bold text-slate-900">
              {props.businessInfo.businessName}
            </div>
            <div className="text-sm text-slate-600 mt-2">
              {props.businessInfo.addressLine1}
            </div>
            <div className="text-sm text-slate-600">
              {props.businessInfo.city}, {props.businessInfo.postalCode}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-slate-800 mb-4">
              INVOICE
            </div>
            <div className="bg-slate-800 text-gray-800 p-4 rounded">
              <div className="text-sm space-y-1">
                <div className="font-bold">#{props.jobCardNumber}</div>
                <div>{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border-2 border-slate-800 p-5 rounded-lg shadow-sm">
          <div className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
            Guest Details
          </div>
          <div className="space-y-2">
            <div className="font-bold text-xl text-slate-900">
              {props.customerName}
            </div>
            <div className="text-sm text-slate-600">
              {props.customerAddress}
            </div>
            <div className="text-sm text-slate-700">{props.customerEmail}</div>
            <div className="text-sm text-slate-700">{props.customerPhone}</div>
          </div>
        </div>
        <div className="bg-slate-800 text-gray-800 p-5 rounded-lg shadow-sm">
          <div className="text-sm font-bold mb-3 uppercase tracking-wide">
            Accommodation Details
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Room Number:</span>
              <span className="font-bold text-2xl">{props.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Room Type:</span>
              <span>{props.roomType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Check-in:</span>
              <span>{props.checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Check-out:</span>
              <span>{props.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Total Nights:</span>
              <span className="font-bold">{props.numberOfNights}</span>
            </div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 shadow-sm">
        <thead>
          <tr className="bg-slate-800 text-gray-800">
            <th className="text-left px-4 py-3 font-bold">Description</th>
            <th className="text-center px-4 py-3 font-bold">Qty</th>
            <th className="text-right px-4 py-3 font-bold">Unit Price</th>
            <th className="text-right px-4 py-3 font-bold">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-slate-200">
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

      <div className="flex justify-end mb-6">
        <div className="w-96">
          <div className="flex justify-between py-2 px-4 bg-slate-100">
            <span className="text-slate-700">Subtotal:</span>
            <span className="text-slate-900">
              R {props.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-2 px-4 bg-slate-100">
            <span className="text-slate-700">VAT (15%):</span>
            <span className="text-slate-900">R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-4 px-4 font-bold text-xl bg-slate-800 text-gray-800 rounded">
            <span>TOTAL DUE:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 border-2 border-slate-800 p-4 mb-4 rounded">
        <div className="text-slate-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-slate-700">
          <div>
            <span className="font-semibold">Bank Name:</span>{" "}
            {props.businessInfo.bankName || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Account Holder:</span>{" "}
            {props.businessInfo.businessName}
          </div>
          <div>
            <span className="font-semibold">Account Number:</span>{" "}
            {props.businessInfo.accountNumber || "N/A"}
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

      <div className="text-center text-sm text-slate-600 border-t-2 border-slate-800 pt-4">
        Thank you for choosing {props.businessInfo.businessName}. Your
        satisfaction is our priority.
      </div>
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({
  templateId,
  documentType = "hospitality",
  stampText = "PAID",
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
      return <DefaultHotelTemplate {...templateProps} />;
    case "classic":
      return <ClassicHotelTemplate {...templateProps} />;
    case "modern":
      return <ModernHotelTemplate {...templateProps} />;
    case "elegant":
      return <ElegantHotelTemplate {...templateProps} />;
    case "premium":
      return <PremiumHotelTemplate {...templateProps} />;
    case "luxury":
      return <LuxuryHotelTemplate {...templateProps} />;
    case "business":
      return <BusinessHotelTemplate {...templateProps} />;
    default:
      return <DefaultHotelTemplate {...templateProps} />;
  }
};

export default TemplateSelector;
