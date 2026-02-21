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

// Template Selector Dropdown Component
export const TemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["classic"]);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: "Default Freight Bill",
    classic: "Classic Logistics",
    modern: "Modern Express",
    elegant: "Professional Courier",
    premium: "Premium Freight",
    speed: "Fast Track Delivery",
    diagnostic: "Detailed Shipping",
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

// Default Freight Bill Template
export const DefaultTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  trackingNumber,
  senderName,
  senderEmail,
  senderPhone,
  senderAddress,
  receiverName,
  receiverEmail,
  receiverPhone,
  receiverAddress,
  origin,
  destination,
  cargoType,
  weight,
  dimensions,
  items,
  subtotal,
  vat,
  total,
  showStamp = false,
  stampText = "DISPATCHED",
  stampColor = "#2196f3",
  showStampDate = true,
  serviceType = "FREIGHT",
}) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-black pb-4 mb-4">
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
              <div className="text-xl font-bold">
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
          <div className="text-3xl font-bold mb-4">FREIGHT BILL</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">WAYBILL NO.</span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">TRACKING NO.</span>
              <span>{trackingNumber}</span>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          SENDER
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{senderName}</div>
          <div className="h-12 overflow-hidden text-xs leading-tight">
            {senderAddress}
          </div>
          <div>{senderEmail}</div>
          <div>{senderPhone}</div>
          <div className="mt-2">
            <span className="font-semibold">Origin:</span> {origin}
          </div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          RECEIVER
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{receiverName}</div>
          <div className="h-12 overflow-hidden text-xs leading-tight">
            {receiverAddress}
          </div>
          <div>{receiverEmail}</div>
          <div>{receiverPhone}</div>
          <div className="mt-2">
            <span className="font-semibold">Destination:</span> {destination}
          </div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          SHIPMENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Cargo Type:</span>
            <span>{cargoType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Weight:</span>
            <span>{weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Dimensions:</span>
            <span className="text-[9px]">{dimensions}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Pieces:</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Insurance:</span>
            <span>Standard</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800">
            <th className="text-left px-2 py-1 font-bold">ITEM DESCRIPTION</th>
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
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Payment Details */}
    <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
      <div className="text-blue-600 font-bold text-xs mb-2">
        PAYMENT DETAILS
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
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {businessInfo.branchCode || "250655"}
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
    <div className="text-center text-xs text-blue-600 italic">
      NB: All shipments are insured. Terms and conditions apply.
    </div>
  </div>
);

// Classic Logistics Template
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
          <div className="text-3xl font-bold mb-4">SHIPPING INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">WAYBILL NO.</span>
              <span>{props.jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">TRACKING</span>
              <span>{props.trackingNumber}</span>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">FROM</div>
        <div className="text-xs space-y-1">
          <div>{props.senderName}</div>
          <div>{props.senderAddress}</div>
          <div>{props.senderEmail}</div>
          <div>{props.senderPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">TO</div>
        <div className="text-xs space-y-1">
          <div>{props.receiverName}</div>
          <div>{props.receiverAddress}</div>
          <div>{props.receiverEmail}</div>
          <div>{props.receiverPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CARGO
        </div>
        <div className="text-xs space-y-1">
          <div>Type: {props.cargoType}</div>
          <div>Weight: {props.weight} kg</div>
          <div>Size: {props.dimensions}</div>
          <div>Origin: {props.origin}</div>
          <div>Dest: {props.destination}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800">
          <th className="text-left px-2 py-1 font-bold">Description</th>
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
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-gray-800 px-2">
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
      Thank you for choosing our logistics services.
    </div>
  </div>
);

// Modern Express Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-blue-500 pb-6 mb-6">
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
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-blue-500 mb-4">FREIGHT</div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Waybill:</span>{" "}
              {props.jobCardNumber}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Tracking:</span>{" "}
              {props.trackingNumber}
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
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-500 mb-3">SHIPPER</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.senderName}</div>
          <div>{props.senderAddress}</div>
          <div>{props.senderPhone}</div>
          <div className="mt-2 text-blue-600">Origin: {props.origin}</div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-blue-700 mb-3">CONSIGNEE</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.receiverName}</div>
          <div>{props.receiverAddress}</div>
          <div>{props.receiverPhone}</div>
          <div className="mt-2 text-blue-600">
            Destination: {props.destination}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-gray-100 p-4 rounded-lg mb-6">
      <div className="text-sm font-bold text-gray-700 mb-2">CARGO DETAILS</div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-semibold">Type:</span> {props.cargoType}
        </div>
        <div>
          <span className="font-semibold">Weight:</span> {props.weight} kg
        </div>
        <div>
          <span className="font-semibold">Dimensions:</span> {props.dimensions}
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-blue-500 text-gray-800">
          <th className="text-left px-4 py-3 rounded-l-lg">Service</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Rate</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-800">
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
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-gray-800 px-4 rounded-lg">
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
      Fast, reliable delivery services worldwide.
    </div>
  </div>
);

// Professional Courier Template
export const ElegantTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-4 border-purple-900 p-8">
      <div className="text-center border-b-2 border-purple-900 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img
            src={props.businessInfo.logoUrl}
            alt="Logo"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
        )}

        <div className="text-sm text-gray-600">
          {props.businessInfo.addressLine1} • {props.businessInfo.city}
        </div>
        <div className="text-2xl font-serif text-purple-700 mt-4">
          BILL OF LADING
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Waybill #{props.jobCardNumber}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            CONSIGNOR
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.senderName}</div>
            <div>{props.senderAddress}</div>
            <div>{props.senderPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            CONSIGNEE
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.receiverName}</div>
            <div>{props.receiverAddress}</div>
            <div>{props.receiverPhone}</div>
          </div>
        </div>
      </div>

      <div className="border-2 border-purple-900 p-4 rounded mb-6">
        <div className="font-serif font-bold text-purple-900 mb-2">
          SHIPMENT INFORMATION
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Route:</span> {props.origin} →{" "}
            {props.destination}
          </div>
          <div>
            <span className="font-semibold">Cargo:</span> {props.cargoType}
          </div>
          <div>
            <span className="font-semibold">Weight:</span> {props.weight} kg
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-purple-900">
            <th className="text-left py-2 font-serif">Service</th>
            <th className="text-center py-2 font-serif">Qty</th>
            <th className="text-right py-2 font-serif">Rate</th>
            <th className="text-right py-2 font-serif">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3">{item.description}</td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-right py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right py-3">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-4">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT:</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-purple-900 text-gray-800 px-4">
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
        Professional logistics solutions with care.
      </div>
    </div>
  </div>
);

// Premium Freight Template
export const PremiumTemplate = (props) => (
  <div
    className="bg-gradient-to-br from-gray-50 to-gray-100"
    style={{ padding: "15mm 20mm" }}
  >
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-b-4 border-amber-500 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img
                src={props.businessInfo.logoUrl}
                alt="Logo"
                className="w-24 h-24 object-contain mb-3"
              />
            )}

            <div className="text-sm text-gray-600">
              {props.businessInfo.addressLine1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-amber-600 mb-3">
              PREMIUM
            </div>
            <div className="text-2xl font-bold text-gray-700">
              FREIGHT SERVICE
            </div>
            <div className="mt-4 bg-amber-50 p-3 rounded">
              <div className="text-xs">
                <span className="font-bold">Waybill:</span>{" "}
                {props.jobCardNumber}
              </div>
              <div className="text-xs">
                <span className="font-bold">Tracking:</span>{" "}
                {props.trackingNumber}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border-l-4 border-amber-500 pl-4">
          <div className="text-sm font-bold text-amber-600 mb-2">ORIGIN</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold text-lg">{props.senderName}</div>
            <div className="text-gray-600">{props.senderAddress}</div>
            <div className="text-gray-600">{props.senderPhone}</div>
            <div className="mt-2 font-semibold text-amber-600">
              {props.origin}
            </div>
          </div>
        </div>
        <div className="border-l-4 border-amber-500 pl-4">
          <div className="text-sm font-bold text-amber-600 mb-2">
            DESTINATION
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold text-lg">{props.receiverName}</div>
            <div className="text-gray-600">{props.receiverAddress}</div>
            <div className="text-gray-600">{props.receiverPhone}</div>
            <div className="mt-2 font-semibold text-amber-600">
              {props.destination}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded mb-6">
        <div className="font-bold text-amber-700 mb-3">
          CARGO SPECIFICATIONS
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Type:</span> {props.cargoType}
          </div>
          <div>
            <span className="font-semibold">Weight:</span> {props.weight} kg
          </div>
          <div>
            <span className="font-semibold">Dimensions:</span>{" "}
            {props.dimensions}
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="bg-amber-500 text-gray-800">
            <th className="text-left px-4 py-3">Service Description</th>
            <th className="text-center px-4 py-3">Qty</th>
            <th className="text-right px-4 py-3">Rate</th>
            <th className="text-right px-4 py-3">Amount</th>
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
        <div className="w-80 bg-gray-50 p-4 rounded">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-bold bg-amber-500 text-gray-800 px-4 rounded">
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
        Premium freight services - Delivered with excellence.
      </div>
    </div>
  </div>
);

// Fast Track Delivery Template
export const SpeedTemplate = (props) => (
  <div className="bg-black text-gray-800" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-red-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3 brightness-0 invert"
            />
          )}
          <div className="text-3xl font-black text-red-600 mb-2">
            {props.businessInfo.businessName}
          </div>
          <div className="text-sm text-gray-400">
            {props.businessInfo.addressLine1}
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-red-600 mb-4 italic">
            EXPRESS
          </div>
          <div className="bg-red-600 p-4 rounded space-y-1">
            <div className="text-sm font-bold">
              WAYBILL #{props.jobCardNumber}
            </div>
            <div className="text-sm">TRACKING: {props.trackingNumber}</div>
            <div className="text-sm">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">PICKUP</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.senderName}</div>
          <div className="text-gray-400">{props.senderAddress}</div>
          <div className="text-gray-400">{props.senderPhone}</div>
          <div className="mt-2 text-red-500">FROM: {props.origin}</div>
        </div>
      </div>
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">DELIVERY</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.receiverName}</div>
          <div className="text-gray-400">{props.receiverAddress}</div>
          <div className="text-gray-400">{props.receiverPhone}</div>
          <div className="mt-2 text-red-500">TO: {props.destination}</div>
        </div>
      </div>
    </div>

    <div className="bg-red-900 p-4 rounded mb-6">
      <div className="font-black text-red-200 mb-2">PACKAGE INFO</div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-bold">Type:</span> {props.cargoType}
        </div>
        <div>
          <span className="font-bold">Weight:</span> {props.weight} kg
        </div>
        <div>
          <span className="font-bold">Size:</span> {props.dimensions}
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-red-600">
          <th className="text-left px-4 py-3 font-black">SERVICE</th>
          <th className="text-center px-4 py-3 font-black">QTY</th>
          <th className="text-right px-4 py-3 font-black">RATE</th>
          <th className="text-right px-4 py-3 font-black">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b border-gray-800">
            <td className="px-4 py-3">{item.description}</td>
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
        <div className="flex justify-between py-2 text-gray-400">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-400">
          <span>VAT:</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-black bg-red-600 px-4 rounded">
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

    <div className="text-center text-xs text-red-500 italic border-t border-gray-800 pt-3">
      FAST TRACK DELIVERY - When time matters most.
    </div>
  </div>
);

// Detailed Shipping Template
export const DiagnosticTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-green-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}

          <div className="text-sm text-gray-600">
            {props.businessInfo.addressLine1}
          </div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-green-600 mb-4">
            SHIPPING MANIFEST
          </div>
          <div className="bg-green-50 border-2 border-green-600 p-3 rounded">
            <div className="text-sm">
              <span className="font-bold">Waybill:</span> {props.jobCardNumber}
            </div>
            <div className="text-sm">
              <span className="font-bold">Tracking:</span>{" "}
              {props.trackingNumber}
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
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">
          SHIPPER DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.senderName}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {props.senderAddress}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {props.senderEmail}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {props.senderPhone}
          </div>
          <div className="mt-2 pt-2 border-t border-green-300">
            <span className="font-semibold">Origin Port:</span> {props.origin}
          </div>
        </div>
      </div>
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">
          CONSIGNEE DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.receiverName}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {props.receiverAddress}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {props.receiverEmail}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {props.receiverPhone}
          </div>
          <div className="mt-2 pt-2 border-t border-green-300">
            <span className="font-semibold">Destination Port:</span>{" "}
            {props.destination}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border-2 border-green-600 p-4 rounded mb-6">
      <div className="text-sm font-bold text-green-600 mb-3">
        CARGO INFORMATION
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-semibold">Cargo Type:</span> {props.cargoType}
        </div>
        <div>
          <span className="font-semibold">Total Weight:</span> {props.weight} kg
        </div>
        <div>
          <span className="font-semibold">Dimensions:</span> {props.dimensions}
        </div>
        <div>
          <span className="font-semibold">Number of Pieces:</span>{" "}
          {props.items.length}
        </div>
        <div>
          <span className="font-semibold">Declared Value:</span> R{" "}
          {props.total.toFixed(2)}
        </div>
        <div>
          <span className="font-semibold">Insurance:</span> Comprehensive
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-green-600 text-gray-800 px-4 py-2 font-bold">
        ITEMIZED SERVICES
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-green-50 border-b-2 border-green-600">
            <th className="text-left px-4 py-2 text-sm">Service Description</th>
            <th className="text-center px-4 py-2 text-sm">Quantity</th>
            <th className="text-right px-4 py-2 text-sm">Unit Rate</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b">
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
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-green-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-green-600 text-gray-800 px-4 rounded">
          <span>TOTAL DUE:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">
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
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
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
      Secure and detailed logistics documentation for your shipment.
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({
  templateId,
  documentType = "freight",
  stampText = "DISPATCHED",
  stampColor = "#2196f3",
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
      return <ElegantTemplate {...templateProps} />;
    case "premium":
      return <PremiumTemplate {...templateProps} />;
    case "speed":
      return <SpeedTemplate {...templateProps} />;
    case "diagnostic":
      return <DiagnosticTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
};

export default TemplateSelector;
