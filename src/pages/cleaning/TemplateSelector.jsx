import React, { useState } from "react";
import { FileText, Check } from "lucide-react";

const sf = (val, decimals = 2) => (Number(val) || 0).toFixed(decimals);

const SignatureStamp = ({ text, color, showDate, rotation, size }) => (
  <div
    style={{
      transform: `rotate(${rotation}deg)`,
      display: "inline-block",
      border: `3px solid ${color}`,
      borderRadius: "8px",
      padding: size === "small" ? "8px 16px" : "12px 24px",
      color,
      fontWeight: "bold",
      fontSize: size === "small" ? "14px" : "18px",
      opacity: 0.7,
    }}
  >
    {text}
    {showDate && (
      <div style={{ fontSize: "10px", marginTop: "4px" }}>
        {new Date().toLocaleDateString()}
      </div>
    )}
  </div>
);

// ── Template Selector dropdown ─────────────────────────────────────────────────
export const TemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
  user,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const templates = [
    { id: "professional", label: "Default Professional" },
    { id: "classic", label: "Classic Clean" },
    { id: "modern", label: "Modern Minimalist" },
    { id: "elegant", label: "Elegant Premium" },
    { id: "residential", label: "Residential Service" },
    { id: "commercial", label: "Commercial Pro" },
  ];

  const currentLabel =
    templates.find((t) => t.id === selectedTemplate)?.label ||
    "Select Template";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
      >
        <FileText className="w-4 h-4 text-[#0891b2]" />
        <span className="truncate max-w-[140px]">{currentLabel}</span>
        <svg
          className="w-3.5 h-3.5 ml-1 text-gray-400"
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
          <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onTemplateChange(t.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${
                  selectedTemplate === t.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                <span>{t.label}</span>
                {selectedTemplate === t.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Professional (Default) Template ───────────────────────────────────────────
export const ProfessionalTemplate = ({
  businessInfo,
  loading,
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  billName,
  billEmail,
  billPhone,
  billAddress,
  taxId,
  propertyType,
  serviceLocation,
  serviceDate,
  serviceTime,
  squareFootage,
  numberOfRooms,
  items = [],
  subtotal = 0,
  totalTax = 0,
  total = 0,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#2563eb",
  showStampDate = true,
  paymentStatus,
}) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    {showStamp && paymentStatus?.status === "paid" && (
      <div className="absolute top-12 right-12">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}
    {/* Header */}
    <div className="border-b-2 border-blue-600 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
            ) : businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-blue-600 font-bold text-lg">
                {businessInfo?.businessName?.[0] || "C"}
              </div>
            )}
            <div>
              <div className="font-bold text-sm text-gray-800">
                {businessInfo?.businessName}
              </div>
              <div className="text-xs text-gray-500">
                Professional Cleaning Services
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-600">
            <div>{businessInfo?.addressLine1}</div>
            <div>{businessInfo?.addressLine2}</div>
            <div>
              {businessInfo?.city} {businessInfo?.postalCode}
            </div>
            <div className="mt-1">
              T: {businessInfo?.primaryPhone}
              {businessInfo?.secondaryPhone &&
                `, ${businessInfo.secondaryPhone}`}
            </div>
            {businessInfo?.email && <div>{businessInfo.email}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-green-500 mb-4 italic">
            {documentType === "invoice"
              ? "INVOICE"
              : documentType === "estimate"
                ? "QUOTE"
                : "PURCHASE ORDER"}
          </div>
          <div className="text-xs space-y-1">
            {[
              [
                documentType === "estimate" ? "QUOTE NO." : "INVOICE NO.",
                invoiceNumber,
              ],
              ["DATE", new Date().toLocaleDateString("en-ZA")],
              [
                "SERVICE DATE",
                serviceDate || new Date().toLocaleDateString("en-ZA"),
              ],
              ["SERVICE TYPE", "CLEANING"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-8">
                <span className="font-semibold">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Three columns */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-blue-50 p-3 border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1">
          CLIENT DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{customerName}</div>
          <div className="h-12 overflow-hidden text-xs leading-tight">
            {customerAddress}
          </div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>
      <div className="bg-blue-50 p-3 border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1">
          BILL TO
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{billName || customerName}</div>
          <div>{billAddress || customerAddress}</div>
          <div>{billEmail || customerEmail}</div>
          <div>{billPhone || customerPhone}</div>
          {taxId && <div>Tax ID: {taxId}</div>}
        </div>
      </div>
      <div className="bg-blue-50 p-3 border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1">
          SERVICE DETAILS
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">
            {serviceLocation || customerAddress}
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Type:</span>
            <span>{propertyType || "Residential"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Area:</span>
            <span>{squareFootage || "N/A"} sqm</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Date:</span>
            <span>{serviceDate || new Date().toLocaleDateString("en-ZA")}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Time:</span>
            <span>{serviceTime || "09:00 AM"}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-blue-200">
            <th className="text-left px-2 py-1 font-bold">
              SERVICE DESCRIPTION
            </th>
            <th className="text-left px-2 py-1 font-bold">CATEGORY</th>
            <th className="text-right px-2 py-1 font-bold">RATE</th>
            <th className="text-center px-2 py-1 font-bold">QTY</th>
            <th className="text-right px-2 py-1 font-bold">TAX</th>
            <th className="text-right px-2 py-1 font-bold">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="px-2 py-2">{item.description}</td>
              <td className="px-2 py-2">
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                  {item.category || "Service"}
                </span>
              </td>
              <td className="text-right px-2 py-2">R {sf(item.rate)}</td>
              <td className="text-center px-2 py-2">{item.qty}</td>
              <td className="text-right px-2 py-2">R {sf(item.taxAmount)}</td>
              <td className="text-right px-2 py-2 font-bold">
                R {sf(item.totalAmount)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-2 py-4 text-center text-gray-400 italic"
              >
                No services added
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {sf(subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {sf(totalTax)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {sf(total)}</span>
        </div>
      </div>
    </div>

    {/* Signature */}
    <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
      <div>
        <div className="font-semibold mb-1">AUTHORIZED SIGNATURE</div>
        <div className="border-b border-black h-8" />
      </div>
    </div>

    {/* Banking details */}
    <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
      <div className="text-blue-600 font-bold text-xs mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1">
        <div>
          <span className="font-semibold">Bank Name:</span>{" "}
          {businessInfo?.bankName || "First National Bank"}
        </div>
        <div>
          <span className="font-semibold">Account Holder:</span>{" "}
          {businessInfo?.businessName}
        </div>
        <div>
          <span className="font-semibold">Account Number:</span>{" "}
          {businessInfo?.accountNumber || "62146991441"}
        </div>
        <div>
          <span className="font-semibold">Branch Code:</span>{" "}
          {businessInfo?.branchCode || "250655"}
        </div>
      </div>
    </div>
    <div className="text-center text-xs text-blue-600 italic">
      Thank you for choosing our cleaning services. We guarantee 100%
      satisfaction!
    </div>
  </div>
);

// ── Classic Template ───────────────────────────────────────────────────────────
export const ClassicTemplate = ({
  businessInfo = {},
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  billName,
  billEmail,
  billPhone,
  billAddress,
  taxId,
  propertyType,
  serviceLocation,
  serviceDate,
  serviceTime,
  squareFootage,
  items = [],
  subtotal = 0,
  totalTax = 0,
  total = 0,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#374151",
  showStampDate = true,
  paymentStatus,
}) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    {showStamp && paymentStatus?.status === "paid" && (
      <div className="absolute top-12 right-12">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}
    <div className="border-b-2 border-gray-800 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          {businessInfo.logoUrl && (
            <img
              src={businessInfo.logoUrl}
              alt="Logo"
              className="w-16 h-16 object-contain mb-2"
            />
          )}
          <div className="font-bold text-sm text-gray-800">
            {businessInfo.businessName}
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <div>{businessInfo.addressLine1}</div>
            <div>
              {businessInfo.city}, {businessInfo.postalCode}
            </div>
            <div>T: {businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-green-500 mb-4 italic">
            {documentType === "estimate"
              ? "QUOTE"
              : documentType === "purchase_order"
                ? "PURCHASE ORDER"
                : "INVOICE"}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">
                {documentType === "estimate" ? "QUOTE NO." : "INVOICE NO."}
              </span>
              <span>{invoiceNumber}</span>
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
      {[
        {
          title: "CUSTOMER",
          lines: [customerName, customerAddress, customerEmail, customerPhone],
        },
        {
          title: "BILL TO",
          lines: [
            billName || customerName,
            billAddress || customerAddress,
            billEmail || customerEmail,
            billPhone || customerPhone,
            taxId ? `Tax ID: ${taxId}` : null,
          ].filter(Boolean),
        },
        {
          title: "SERVICE INFO",
          lines: [
            `Location: ${serviceLocation || customerAddress}`,
            `Type: ${propertyType || "Residential"}`,
            `Size: ${squareFootage || "N/A"} sqm`,
            `Date: ${serviceDate || new Date().toLocaleDateString()}`,
            `Time: ${serviceTime || "09:00 AM"}`,
          ],
        },
      ].map(({ title, lines }) => (
        <div key={title} className="bg-gray-100 p-3">
          <div className="font-bold text-xs mb-2 bg-gray-800 text-white px-2 py-1">
            {title}
          </div>
          <div className="text-xs space-y-1">
            {lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Service Description</th>
          <th className="text-left px-2 py-1 font-bold">Category</th>
          <th className="text-right px-2 py-1 font-bold">Rate</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Tax</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-2">{item.description}</td>
            <td className="px-2 py-2">
              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                {item.category || "Service"}
              </span>
            </td>
            <td className="text-right px-2 py-2">R {sf(item.rate)}</td>
            <td className="text-center px-2 py-2">{item.qty}</td>
            <td className="text-right px-2 py-2">R {sf(item.taxAmount)}</td>
            <td className="text-right px-2 py-2 font-bold">
              R {sf(item.totalAmount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-6">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1">
          <span>Subtotal:</span>
          <span>R {sf(subtotal)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {sf(totalTax)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-50 px-2">
          <span>TOTAL:</span>
          <span>R {sf(total)}</span>
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
          {businessInfo.bankName || "First National Bank"}
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
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for your business. We guarantee satisfaction with all our
      services!
    </div>
  </div>
);

// ── Modern Template ────────────────────────────────────────────────────────────
export const ModernTemplate = ({
  businessInfo = {},
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  billName,
  billEmail,
  billPhone,
  billAddress,
  taxId,
  propertyType,
  serviceLocation,
  serviceDate,
  serviceTime,
  squareFootage,
  items = [],
  subtotal = 0,
  totalTax = 0,
  total = 0,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#3b82f6",
  showStampDate = true,
  paymentStatus,
}) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    {showStamp && paymentStatus?.status === "paid" && (
      <div className="absolute top-12 right-12">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}
    <div className="border-b-4 border-blue-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {businessInfo.logoUrl && (
            <img
              src={businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="font-bold text-gray-800">
            {businessInfo.businessName}
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{businessInfo.addressLine1}</div>
            <div>
              {businessInfo.city}, {businessInfo.postalCode}
            </div>
            <div>{businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-green-500 mb-4 italic">
            {documentType === "estimate"
              ? "QUOTE"
              : documentType === "purchase_order"
                ? "PO"
                : "INVOICE"}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">
                {documentType === "estimate" ? "QUOTE NO." : "INVOICE NO."}
              </span>{" "}
              {invoiceNumber}
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
          <div className="font-semibold text-lg">
            {billName || customerName}
          </div>
          <div>{billAddress || customerAddress}</div>
          <div>{billEmail || customerEmail}</div>
          <div>{billPhone || customerPhone}</div>
          {taxId && (
            <div className="text-xs text-gray-500">Tax ID: {taxId}</div>
          )}
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-blue-700 mb-3">
          SERVICE DETAILS
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {serviceLocation || "On-site"}
          </div>
          <div>
            <span className="font-semibold">Type:</span>{" "}
            {propertyType || "Residential"}
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {serviceDate || new Date().toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Time:</span>{" "}
            {serviceTime || "09:00 AM"}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Area:</span>{" "}
            {squareFootage || "N/A"} sqm
          </div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-blue-500 text-white">
          <th className="text-left px-4 py-3 rounded-l-lg">
            Service Description
          </th>
          <th className="text-left px-4 py-3">Category</th>
          <th className="text-right px-4 py-3">Rate</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Tax</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">{item.description}</td>
            <td className="px-4 py-3">
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                {item.category || "Service"}
              </span>
            </td>
            <td className="text-right px-4 py-3">R {sf(item.rate)}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3">R {sf(item.taxAmount)}</td>
            <td className="text-right px-4 py-3 font-semibold">
              R {sf(item.totalAmount)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-6">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {sf(subtotal)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {sf(totalTax)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-white px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {sf(total)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank:</span>{" "}
          {businessInfo.bankName || "First National Bank"}
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
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for choosing our professional cleaning services. Payment is due
      within 30 days.
    </div>
  </div>
);

// ── Elegant Template ───────────────────────────────────────────────────────────
export const ElegantTemplate = ({
  businessInfo = {},
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  billName,
  billEmail,
  billPhone,
  billAddress,
  taxId,
  propertyType,
  serviceLocation,
  serviceDate,
  squareFootage,
  items = [],
  subtotal = 0,
  totalTax = 0,
  total = 0,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#7c3aed",
  showStampDate = true,
  paymentStatus,
}) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    {showStamp && paymentStatus?.status === "paid" && (
      <div className="absolute top-12 right-12">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}
    <div className="border-4 border-purple-900 p-8">
      <div className="text-center border-b-2 border-purple-900 pb-6 mb-6">
        {businessInfo.logoUrl && (
          <img
            src={businessInfo.logoUrl}
            alt="Logo"
            className="w-24 h-24 object-contain mx-auto mb-4"
          />
        )}
        <div className="font-bold text-gray-800">
          {businessInfo.businessName}
        </div>
        <div className="text-sm text-gray-600">
          {businessInfo.addressLine1} • {businessInfo.city}
        </div>
        <div className="text-2xl font-serif text-purple-700 mt-4">
          {documentType === "estimate"
            ? "SERVICE QUOTE"
            : documentType === "purchase_order"
              ? "PURCHASE ORDER"
              : "SERVICE INVOICE"}
        </div>
        <div className="text-sm text-gray-500 mt-1">#{invoiceNumber}</div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            BILLED TO
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{customerName}</div>
            <div>{customerAddress}</div>
            <div>{customerEmail}</div>
            <div>{customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            BILL TO
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{billName || customerName}</div>
            <div>{billAddress || customerAddress}</div>
            <div>{billEmail || customerEmail}</div>
            {taxId && (
              <div className="text-xs text-gray-500">Tax ID: {taxId}</div>
            )}
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            SERVICE DETAILS
          </div>
          <div className="text-sm space-y-1">
            <div>Location: {serviceLocation || customerAddress}</div>
            <div>Property: {propertyType || "Residential"}</div>
            <div>Date: {serviceDate || new Date().toLocaleDateString()}</div>
            <div>Area: {squareFootage || "N/A"} sqm</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-purple-900">
            <th className="text-left py-2 font-serif">Service</th>
            <th className="text-left py-2 font-serif">Category</th>
            <th className="text-right py-2 font-serif">Rate</th>
            <th className="text-center py-2 font-serif">Qty</th>
            <th className="text-right py-2 font-serif">Tax</th>
            <th className="text-right py-2 font-serif">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3">{item.description}</td>
              <td className="py-3">
                <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                  {item.category || "Service"}
                </span>
              </td>
              <td className="text-right py-3">R {sf(item.rate)}</td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-right py-3">R {sf(item.taxAmount)}</td>
              <td className="text-right py-3">R {sf(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {sf(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT (15%):</span>
            <span>R {sf(totalTax)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-purple-900 text-white px-4">
            <span>TOTAL:</span>
            <span>R {sf(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank:</span>{" "}
            {businessInfo.bankName || "First National Bank"}
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
      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Thank you for your business. Payment is due within 30 days of invoice
        date.
      </div>
    </div>
  </div>
);

// ── Residential Template ───────────────────────────────────────────────────────
export const ResidentialTemplate = ({
  businessInfo = {},
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  billName,
  billEmail,
  billPhone,
  billAddress,
  taxId,
  propertyType,
  serviceLocation,
  serviceDate,
  serviceTime,
  squareFootage,
  numberOfRooms,
  items = [],
  subtotal = 0,
  totalTax = 0,
  total = 0,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#16a34a",
  showStampDate = true,
  paymentStatus,
}) => (
  <div
    className="bg-gradient-to-br from-green-50 to-blue-50"
    style={{ padding: "15mm 20mm" }}
  >
    {showStamp && paymentStatus?.status === "paid" && (
      <div className="absolute top-12 right-12">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-b-4 border-green-500 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {businessInfo.logoUrl && (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="w-20 h-20 object-contain mb-3"
              />
            )}
            <div className="font-bold text-gray-800">
              {businessInfo.businessName}
            </div>
            <div className="text-sm text-gray-600">
              {businessInfo.addressLine1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-green-500 mb-4 italic">
              {documentType === "estimate"
                ? "QUOTE"
                : documentType === "purchase_order"
                  ? "PO"
                  : "INVOICE"}
            </div>
            <div className="bg-green-500 text-white p-4 rounded space-y-1">
              <div className="text-sm font-bold">#{invoiceNumber}</div>
              <div className="text-sm">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <div className="text-sm font-bold text-green-700 mb-3">CLIENT</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{customerName}</div>
            <div className="text-gray-600">{customerAddress}</div>
            <div className="text-gray-600">{customerEmail}</div>
            <div className="text-gray-600">{customerPhone}</div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="text-sm font-bold text-blue-700 mb-3">BILL TO</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">
              {billName || customerName}
            </div>
            <div className="text-gray-600">
              {billAddress || customerAddress}
            </div>
            <div className="text-gray-600">{billEmail || customerEmail}</div>
            {taxId && (
              <div className="text-xs text-gray-500">Tax ID: {taxId}</div>
            )}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <div className="text-sm font-bold text-green-700 mb-3">
            SERVICE LOCATION
          </div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">
              {serviceLocation || customerAddress}
            </div>
            <div className="text-gray-600">
              Type: {propertyType || "Residential"}
            </div>
            <div className="text-gray-600">
              Area: {squareFootage || "N/A"} sqm
            </div>
            <div className="text-gray-600">Rooms: {numberOfRooms || "N/A"}</div>
            <div className="text-gray-600">
              Date: {serviceDate || new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <th className="text-left px-4 py-3 font-black">CLEANING SERVICE</th>
            <th className="text-left px-4 py-3 font-black">CATEGORY</th>
            <th className="text-right px-4 py-3 font-black">RATE</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">TAX</th>
            <th className="text-right px-4 py-3 font-black">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{item.description}</td>
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                  {item.category || "Service"}
                </span>
              </td>
              <td className="text-right px-4 py-3">R {sf(item.rate)}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {sf(item.taxAmount)}</td>
              <td className="text-right px-4 py-3 font-bold">
                R {sf(item.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-80">
          <div className="flex justify-between py-2 text-gray-600">
            <span>Subtotal:</span>
            <span>R {sf(subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-600">
            <span>VAT (15%):</span>
            <span>R {sf(totalTax)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-black bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 rounded-lg">
            <span>TOTAL:</span>
            <span>R {sf(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 p-4 mb-4 rounded-lg">
        <div className="text-green-700 font-bold text-sm mb-2">
          PAYMENT INFORMATION
        </div>
        <div className="text-xs space-y-1 text-gray-700">
          <div>
            <span className="font-semibold">Bank:</span>{" "}
            {businessInfo.bankName || "First National Bank"}
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
      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Thank you for trusting us with your home! We appreciate your business.
      </div>
    </div>
  </div>
);

// ── Commercial Template ────────────────────────────────────────────────────────
export const CommercialTemplate = ({
  businessInfo = {},
  invoiceNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  billName,
  billEmail,
  billPhone,
  billAddress,
  taxId,
  propertyType,
  serviceLocation,
  serviceDate,
  squareFootage,
  items = [],
  subtotal = 0,
  totalTax = 0,
  total = 0,
  documentType = "invoice",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#4338ca",
  showStampDate = true,
  paymentStatus,
}) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    {showStamp && paymentStatus?.status === "paid" && (
      <div className="absolute top-12 right-12">
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="medium"
        />
      </div>
    )}
    <div className="border-b-4 border-indigo-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {businessInfo.logoUrl && (
            <img
              src={businessInfo.logoUrl}
              alt="Logo"
              className="w-20 h-20 object-contain mb-3"
            />
          )}
          <div className="text-sm font-semibold text-indigo-600 mb-1">
            Commercial Cleaning Specialists
          </div>
          <div className="font-bold text-gray-800">
            {businessInfo.businessName}
          </div>
          <div className="text-sm text-gray-600">
            {businessInfo.addressLine1}, {businessInfo.city}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-indigo-600 mb-4">
            {documentType === "estimate"
              ? "SERVICE QUOTE"
              : documentType === "purchase_order"
                ? "PURCHASE ORDER"
                : "SERVICE INVOICE"}
          </div>
          <div className="bg-indigo-50 border-2 border-indigo-600 p-3 rounded">
            <div className="text-sm">
              <span className="font-bold">Invoice #:</span> {invoiceNumber}
            </div>
            <div className="text-sm">
              <span className="font-bold">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="border-2 border-indigo-600 p-4 rounded">
        <div className="text-sm font-bold text-indigo-600 mb-3">
          CLIENT DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Company:</span> {customerName}
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
      <div className="border-2 border-indigo-600 p-4 rounded">
        <div className="text-sm font-bold text-indigo-600 mb-3">BILL TO</div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Name:</span>{" "}
            {billName || customerName}
          </div>
          <div>
            <span className="font-semibold">Address:</span>{" "}
            {billAddress || customerAddress}
          </div>
          <div>
            <span className="font-semibold">Email:</span>{" "}
            {billEmail || customerEmail}
          </div>
          {taxId && (
            <div>
              <span className="font-semibold">Tax ID:</span> {taxId}
            </div>
          )}
        </div>
      </div>
      <div className="border-2 border-indigo-600 p-4 rounded">
        <div className="text-sm font-bold text-indigo-600 mb-3">
          FACILITY DETAILS
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-semibold">Location:</span>{" "}
            {serviceLocation || customerAddress}
          </div>
          <div>
            <span className="font-semibold">Type:</span>{" "}
            {propertyType || "Commercial Office"}
          </div>
          <div>
            <span className="font-semibold">Area:</span>{" "}
            {squareFootage || "N/A"} sqm
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {serviceDate || new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-indigo-600 text-white px-4 py-2 font-bold">
        SERVICES PROVIDED
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-indigo-50 border-b-2 border-indigo-600">
            <th className="text-left px-4 py-2 text-sm">Service Description</th>
            <th className="text-left px-4 py-2 text-sm">Category</th>
            <th className="text-right px-4 py-2 text-sm">Rate</th>
            <th className="text-center px-4 py-2 text-sm">Qty</th>
            <th className="text-right px-4 py-2 text-sm">Tax</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-3">{item.description}</td>
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                  {item.category || "Service"}
                </span>
              </td>
              <td className="text-right px-4 py-3">R {sf(item.rate)}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {sf(item.taxAmount)}</td>
              <td className="text-right px-4 py-3 font-semibold">
                R {sf(item.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-indigo-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {sf(subtotal)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {sf(totalTax)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-indigo-600 text-white px-4 rounded">
          <span>TOTAL DUE:</span>
          <span>R {sf(total)}</span>
        </div>
      </div>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 p-4 mb-4 rounded">
      <div className="text-indigo-800 font-bold text-sm mb-2">
        PAYMENT INFORMATION
      </div>
      <div className="text-xs space-y-1 text-gray-700">
        <div>
          <span className="font-semibold">Bank:</span>{" "}
          {businessInfo.bankName || "First National Bank"}
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
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Professional commercial cleaning services. Payment terms: Net 30 days.
    </div>
  </div>
);

// ── Template Renderer ──────────────────────────────────────────────────────────
export const TemplateRenderer = ({
  templateId,
  documentType = "invoice",
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
  showStamp = false,
  // normalise both naming conventions
  invoiceNumber,
  jobCardNumber,
  totalTax,
  vat,
  ...rest
}) => {
  const resolvedProps = {
    ...rest,
    documentType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
    invoiceNumber: invoiceNumber || jobCardNumber || "",
    totalTax: totalTax ?? vat ?? 0,
  };

  switch (templateId) {
    case "classic":
      return <ClassicTemplate {...resolvedProps} />;
    case "modern":
      return <ModernTemplate {...resolvedProps} />;
    case "elegant":
      return <ElegantTemplate {...resolvedProps} />;
    case "residential":
      return <ResidentialTemplate {...resolvedProps} />;
    case "commercial":
      return <CommercialTemplate {...resolvedProps} />;
    case "professional":
    default:
      return <ProfessionalTemplate {...resolvedProps} />;
  }
};

export default TemplateSelector;
