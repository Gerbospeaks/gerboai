import React, { useState, useEffect } from "react";
import { FileText, Check, Loader2, ChevronDown } from "lucide-react";
import SignatureStamp from "./SignatureStamp";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const sf = (val, decimals = 2) => (Number(val) || 0).toFixed(decimals);
const TEMPLATE_NAMES = {
  default: "Default (Original)",
  classic: "Classic Workshop",
  modern: "Modern Minimalist",
  elegant: "Elegant Business",
  premium: "Premium Auto Service",
  speed: "Speed Shop Pro",
  diagnostic: "Diagnostic Specialist",
};


export const TemplateSelector = ({
  user,
  selectedTemplate,
  onTemplateChange,
}) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState([
    "default",
    "classic",
  ]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // ── Load purchased list from Firestore ─────────────────────────────────
  useEffect(() => {
    if (!user?.uid) return;

    const load = async () => {
      try {
        const db = getFirestore();
        const snap = await getDoc(
          doc(db, "users", user.uid, "settings", "templates"),
        );

        if (snap.exists()) {
          const data = snap.data();
          const ids = Array.from(
            new Set(["default", ...(data.purchased ?? ["classic"])]),
          );
          setPurchasedTemplates(ids);

          // Restore last active template if parent hasn't set one
          if (!selectedTemplate && data.active) {
            onTemplateChange(data.active);
          }
        } else {
          // First-time user — seed the doc
          await setDoc(
            doc(db, "users", user.uid, "settings", "templates"),
            {
              purchased: ["classic"],
              active: "classic",
              createdAt: serverTimestamp(),
            },
            { merge: true },
          );
          setPurchasedTemplates(["default", "classic"]);
        }
      } catch (err) {
        console.error("TemplateSelector load:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // ── Handle selection ───────────────────────────────────────────────────
  const handleSelectTemplate = async (templateId) => {
    setIsOpen(false);
    onTemplateChange(templateId);

    // Persist active choice to Firestore (best-effort)
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(getFirestore(), "users", user.uid, "settings", "templates"),
        { active: templateId, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (err) {
      console.error("TemplateSelector persist active:", err);
    }
  };

  const displayName = TEMPLATE_NAMES[selectedTemplate] ?? "Select Template";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
      >
        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="hidden sm:inline max-w-[160px] truncate">
          {displayName}
        </span>
        <span className="sm:hidden">Template</span>
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin ml-1" />
        ) : (
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Your Templates
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
              </div>
            ) : (
              <div className="py-1 max-h-72 overflow-y-auto">
                {purchasedTemplates.map((templateId) => {
                  const isActive = selectedTemplate === templateId;
                  return (
                    <button
                      key={templateId}
                      onClick={() => handleSelectTemplate(templateId)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">
                        {TEMPLATE_NAMES[templateId] ?? templateId}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer hint */}
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
              <p className="text-[11px] text-gray-400">
                Buy more templates in{" "}
                <span className="text-blue-500 font-medium">Templates</span> →
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Template components (unchanged — kept in same file) ──────────────────────

export const DefaultTemplate = ({
  businessInfo,
  loading,
  jobCardNumber,
  customerName,
  billName,
  billEmail,
  billPhone,
  billAddress,
  customerEmail,
  customerPhone,
  customerAddress,
  vehicleReg,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vehicleVin,
  authCode,
  preAuth,
  merchant_code,
  vehicleMileage,
  items,
  subtotal,
  vat,
  total,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
}) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
            ) : businessInfo.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="w-20 h-20 object-contain mb-3"
              />
            ) : (
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center" />
            )}
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
          <div className="text-3xl font-bold mb-4">
            {documentType === "quote" ? "QUOTE" : "INVOICE"}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">
                {documentType === "quote" ? "QUOTE NO." : "INVOICE NO."}
              </span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">MERCHANT CODE</span>
              <span>{merchant_code}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">SERVICE TYPE</span>
              <span>SERVICE</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          {documentType === "quote" ? "QUOTE TO" : "INVOICE TO"}
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          BILL TO
        </div>
        <div className="text-xs space-y-1">
          <div>{billName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">
            {billAddress}
          </div>
          <div>{billEmail}</div>
          <div>{billPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          VEHICLE DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Reg Number:</span>
            <span>{vehicleReg}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Make:</span>
            <span>{vehicleMake}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Model:</span>
            <span>{vehicleModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Engine No:</span>
            <span>{vehicleYear}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">VIN Number:</span>
            <span className="text-[9px]">{vehicleVin}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Odometer:</span>
            <span>{vehicleMileage} km</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Pre Auth:</span>
            <span>{preAuth}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Auth Code:</span>
            <span>{authCode}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left px-2 py-1 font-bold">ITEM DESCRIPTION</th>
            <th className="text-center px-2 py-1 font-bold">QUANTITY</th>
            <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
            <th className="text-right px-2 py-1 font-bold">NET PRICE</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-2 py-2 leading-tight" style={{ width: "40%" }}>
                {item.description}
              </td>
              <td className="text-center px-2 py-2">{item.qty}</td>
              <td className="text-right px-2 py-2">R {sf(item.rate)}</td>
              <td className="text-right px-2 py-2">
                R {sf(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {sf(subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT:</span>
          <span>R {sf(vat)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-black px-2">
          <span>TOTAL:</span>
          <span>R {sf(total)}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
      <div>
        <div className="font-semibold mb-1">WORKSHOP SIGNATURE</div>
        <div className="border-b border-black h-8" />
      </div>
      <div>
        <div className="font-semibold mb-1">CLIENT SIGNATURE</div>
        <div className="border-b border-black h-8" />
      </div>
      <div>
        <div className="font-semibold mb-1">CONTACT NUMBER:</div>
        <div className="border-b border-black h-8" />
      </div>
    </div>

    <div className="bg-red-50 border border-red-200 p-3 mb-4">
      <div className="text-red-600 font-bold text-xs mb-2">BANKING DETAILS</div>
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
          {businessInfo.accountNumber || "23251412201"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

   

    <div className="text-center text-xs text-red-600 italic">
      {documentType === "quote"
        ? "This quote is valid for 30 days. All our parts and workmanship have 12 months or 15000KM Guarantee"
        : "NB: All our parts and workmanship have 12 months or 15000KM Guarantee"}
    </div>
  </div>
);

export const ClassicTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="text-xs leading-relaxed">
            <div>{props.businessInfo.addressLine1}</div>
            <div>
              {props.businessInfo.city}, {props.businessInfo.postalCode}
            </div>
            <div>T: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4">
            {props.documentType === "quote" ? "QUOTE" : "INVOICE"}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">
                {props.documentType === "quote" ? "QUOTE NO." : "INVOICE NO."}
              </span>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          CUSTOMER
        </div>
        <div className="text-xs space-y-1">
          <div>{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          BILL TO
        </div>
        <div className="text-xs space-y-1">
          <div>{props.billName}</div>
          <div>{props.billAddress}</div>
          <div>{props.billEmail}</div>
          <div>{props.billPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          VEHICLE
        </div>
        <div className="text-xs space-y-1">
          <div>
            {props.vehicleYear} {props.vehicleMake} {props.vehicleModel}
          </div>
          <div>Reg: {props.vehicleReg}</div>
          <div>VIN: {props.vehicleVin}</div>
          <div>Mileage: {props.vehicleMileage} km</div>
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
        {props.items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-2">{item.description}</td>
            <td className="text-center px-2 py-2">{item.qty}</td>
            <td className="text-right px-2 py-2">R {sf(item.rate)}</td>
            <td className="text-right px-2 py-2">R {sf(item.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {sf(props.subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {sf(props.vat)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {sf(props.total)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded mt-6">
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
          {props.businessInfo.accountNumber || "23251412201"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      {props.documentType === "quote"
        ? "This quote is valid for 30 days from the date above."
        : "Thank you for your business. Payment is due within 30 days of invoice date."}
    </div>
  </div>
);

export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
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
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-blue-500 mb-4">
            {props.documentType === "quote" ? "QUOTE" : "INVOICE"}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">
                {props.documentType === "quote" ? "Quote" : "Invoice"} #:
              </span>{" "}
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
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-500 mb-3">
          {props.documentType === "quote" ? "QUOTE FOR" : "BILL TO"}
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
          <div className="font-semibold text-lg mt-3">{props.billName}</div>
          <div>{props.billAddress}</div>
          <div>{props.billEmail}</div>
          <div>{props.billPhone}</div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-blue-700 mb-3">
          VEHICLE INFORMATION
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Make:</span> {props.vehicleMake}
          </div>
          <div>
            <span className="font-semibold">Model:</span> {props.vehicleModel}
          </div>
          <div>
            <span className="font-semibold">Year:</span> {props.vehicleYear}
          </div>
          <div>
            <span className="font-semibold">Reg:</span> {props.vehicleReg}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Mileage:</span>{" "}
            {props.vehicleMileage} km
          </div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-blue-500 text-white">
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
            <td className="text-right px-4 py-3">R {sf(item.rate)}</td>
            <td className="text-right px-4 py-3 font-semibold">
              R {sf(item.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {sf(props.subtotal)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {sf(props.vat)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-white px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {sf(props.total)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded mt-6">
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
          {props.businessInfo.accountNumber || "23251412201"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3 mt-4">
      {props.documentType === "quote"
        ? "This quote is valid for 30 days from the date above."
        : "Thank you for your business. Payment is due within 30 days of invoice date."}
    </div>
  </div>
);

export const ElegantTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-4 border-purple-900 p-8">
      <div className="text-center border-b-2 border-purple-900 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img
            src={props.businessInfo.logoUrl}
            alt="Logo"
            className="w-20 h-20 object-contain mb-3 mx-auto"
          />
        )}
        <div className="text-sm text-gray-600">
          {props.businessInfo.addressLine1} • {props.businessInfo.city}
        </div>
        <div className="text-2xl font-serif text-purple-700 mt-4">
          {props.documentType === "quote" ? "QUOTE" : "INVOICE"}
        </div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            {props.documentType === "quote" ? "QUOTE FOR" : "BILLED TO"}
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            <div>{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            BILL TO
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.billName}</div>
            <div>{props.billAddress}</div>
            <div>{props.billEmail}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            VEHICLE
          </div>
          <div className="text-sm space-y-1">
            <div>
              {props.vehicleYear} {props.vehicleMake} {props.vehicleModel}
            </div>
            <div>Registration: {props.vehicleReg}</div>
            <div>Mileage: {props.vehicleMileage} km</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-purple-900">
            <th className="text-left py-2 font-serif">Service</th>
            <th className="text-center py-2 font-serif">Qty</th>
            <th className="text-right py-2 font-serif">Price</th>
            <th className="text-right py-2 font-serif">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3">{item.description}</td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-right py-3">R {sf(item.rate)}</td>
              <td className="text-right py-3">R {sf(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {sf(props.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT:</span>
            <span>R {sf(props.vat)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-purple-900 text-white px-4">
            <span>TOTAL:</span>
            <span>R {sf(props.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-4 mb-4 rounded mt-6">
        <div className="text-purple-800 font-bold text-sm mb-2">
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
            {props.businessInfo.accountNumber || "23251412201"}
          </div>
          <div>
            <span className="font-semibold">Branch Code:</span>{" "}
            {props.businessInfo.branchCode || "250655"}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <p className="font-semibold">Terms:</p>
          <p>Payment due within 30 days</p>
        </div>
       
      </div>
      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        {props.documentType === "quote"
          ? "This quote is valid for 30 days from the date above."
          : "Thank you for your business. Payment is due within 30 days of invoice date."}
      </div>
    </div>
  </div>
);

export const SpeedTemplate = (props) => (
  <div className="bg-black text-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-red-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img
              src={props.businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
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
            {props.documentType === "quote" ? "QUOTE" : "INVOICE"}
          </div>
          <div className="bg-red-600 p-4 rounded space-y-1">
            <div className="text-sm font-bold">#{props.jobCardNumber}</div>
            <div className="text-sm">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">CLIENT</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.customerName}</div>
          <div className="text-gray-400">{props.customerAddress}</div>
        </div>
      </div>
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">BILL TO</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.billName}</div>
          <div className="text-gray-400">{props.billAddress}</div>
        </div>
      </div>
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">VEHICLE</div>
        <div className="text-sm">
          <div className="font-bold">
            {props.vehicleYear} {props.vehicleMake} {props.vehicleModel}
          </div>
          <div className="text-gray-400">Reg: {props.vehicleReg}</div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-red-600">
          <th className="text-left px-4 py-3 font-black">DESCRIPTION</th>
          <th className="text-center px-4 py-3 font-black">QTY</th>
          <th className="text-right px-4 py-3 font-black">PRICE</th>
          <th className="text-right px-4 py-3 font-black">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b border-gray-800">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3">R {sf(item.rate)}</td>
            <td className="text-right px-4 py-3 font-bold">
              R {sf(item.amount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-80">
        <div className="flex justify-between py-2 text-gray-400">
          <span>Subtotal:</span>
          <span>R {sf(props.subtotal)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-400">
          <span>VAT:</span>
          <span>R {sf(props.vat)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-black bg-red-600 px-4 rounded">
          <span>TOTAL:</span>
          <span>R {sf(props.total)}</span>
        </div>
      </div>
    </div>

    <div className="bg-gray-900 border border-red-600 p-4 mb-4 rounded mt-6">
      <div className="text-red-600 font-bold text-sm mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1 text-gray-400">
        <div>
          <span className="font-semibold text-gray-300">Bank Name:</span>{" "}
          {props.businessInfo.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold text-gray-300">Account Holder:</span>{" "}
          {props.businessInfo.businessName}
        </div>
        <div>
          <span className="font-semibold text-gray-300">Account Number:</span>{" "}
          {props.businessInfo.accountNumber || "23251412201"}
        </div>
        <div>
          <span className="font-semibold text-gray-300">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    <div className="mt-8 flex justify-between items-center">
      <div className="text-sm text-gray-500">
        <p className="font-semibold">Terms:</p>
        <p>Payment due within 30 days</p>
      </div>
     
    </div>
    <div className="text-center text-xs text-gray-500 italic border-t border-gray-800 pt-3">
      {props.documentType === "quote"
        ? "This quote is valid for 30 days from the date above."
        : "Thank you for your business. Payment is due within 30 days of invoice date."}
    </div>
  </div>
);

export const DiagnosticTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
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
            {props.documentType === "quote"
              ? "SERVICE QUOTE"
              : "SERVICE INVOICE"}
          </div>
          <div className="bg-green-50 border-2 border-green-600 p-3 rounded">
            <div className="text-sm">
              <span className="font-bold">
                {props.documentType === "quote" ? "Quote:" : "Invoice:"}
              </span>{" "}
              {props.jobCardNumber}
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
          CUSTOMER DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.customerName}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {props.customerEmail}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {props.customerPhone}
          </div>
        </div>
      </div>
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">BILL TO</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span> {props.billName}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {props.billEmail}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {props.billPhone}
          </div>
        </div>
      </div>
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">
          VEHICLE DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Vehicle:</span> {props.vehicleYear}{" "}
            {props.vehicleMake} {props.vehicleModel}
          </div>
          <div>
            <span className="font-semibold">Registration:</span>{" "}
            {props.vehicleReg}
          </div>
          <div>
            <span className="font-semibold">Odometer:</span>{" "}
            {props.vehicleMileage} km
          </div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-green-600 text-white px-4 py-2 font-bold">
        {props.documentType === "quote"
          ? "QUOTED SERVICES"
          : "SERVICES PERFORMED"}
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-green-50 border-b-2 border-green-600">
            <th className="text-left px-4 py-2 text-sm">Description</th>
            <th className="text-center px-4 py-2 text-sm">Qty</th>
            <th className="text-right px-4 py-2 text-sm">Unit Price</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {sf(item.rate)}</td>
              <td className="text-right px-4 py-3 font-semibold">
                R {sf(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end">
      <div className="w-80 border-2 border-green-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {sf(props.subtotal)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {sf(props.vat)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-green-600 text-white px-4 rounded">
          <span>
            {props.documentType === "quote" ? "QUOTE TOTAL:" : "TOTAL DUE:"}
          </span>
          <span>R {sf(props.total)}</span>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-200 p-4 mb-4 rounded mt-6">
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
          {props.businessInfo.accountNumber || "23251412201"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {props.businessInfo.branchCode || "250655"}
        </div>
      </div>
    </div>

    <div className="mt-8 flex justify-between items-center">
      <div className="text-sm text-gray-500">
        <p className="font-semibold">Terms:</p>
        <p>Payment due within 30 days</p>
      </div>
     
    </div>
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      {props.documentType === "quote"
        ? "This quote is valid for 30 days from the date above. Price subject to change after expiry."
        : "Thank you for your business. Payment is due within 30 days of invoice date."}
    </div>
  </div>
);

// ─── Template Renderer ────────────────────────────────────────────────────────
export const TemplateRenderer = ({
  templateId,
  documentType = "invoice",
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = false,
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
