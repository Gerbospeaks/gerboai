import React, { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import SignatureStamp from "../SignatureStamp";

const sf = (val, decimals = 2) => (Number(val) || 0).toFixed(decimals);
const TemplatePreviewModal = ({ template, onClose, onSelect, isSelected }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {template.name}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {template.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="aspect-[8.5/11] bg-white border border-slate-200 rounded-lg overflow-hidden">
            <img
              src={template.preview}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-semibold transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onSelect(template.id);
                onClose();
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                isSelected
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {isSelected ? "✓ Selected" : "Select Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Template Selector Component
const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const templates = [
    {
      id: "professional",
      name: "Professional",
      description: "Clean and modern design perfect for corporate clients",
      preview: "/api/placeholder/400/520",
      color: "blue",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple and elegant layout with focus on content",
      preview: "/api/placeholder/400/520",
      color: "slate",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Contemporary design with bold typography",
      preview: "/api/placeholder/400/520",
      color: "purple",
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional invoice layout with timeless appeal",
      preview: "/api/placeholder/400/520",
      color: "emerald",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Unique design for creative professionals",
      preview: "/api/placeholder/400/520",
      color: "orange",
    },
    {
      id: "corporate",
      name: "Corporate",
      description: "Formal design for enterprise businesses",
      preview: "/api/placeholder/400/520",
      color: "indigo",
    },
  ];

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected
        ? "border-blue-500 bg-blue-50"
        : "border-slate-200 hover:border-blue-300",
      slate: isSelected
        ? "border-slate-500 bg-slate-50"
        : "border-slate-200 hover:border-slate-300",
      purple: isSelected
        ? "border-purple-500 bg-purple-50"
        : "border-slate-200 hover:border-purple-300",
      emerald: isSelected
        ? "border-emerald-500 bg-emerald-50"
        : "border-slate-200 hover:border-emerald-300",
      orange: isSelected
        ? "border-orange-500 bg-orange-50"
        : "border-slate-200 hover:border-orange-300",
      indigo: isSelected
        ? "border-indigo-500 bg-indigo-50"
        : "border-slate-200 hover:border-indigo-300",
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <div
              key={template.id}
              className={`relative group rounded-xl border-2 overflow-hidden transition-all duration-300 ${getColorClasses(
                template.color,
                isSelected,
              )} ${isSelected ? "shadow-lg scale-105" : "shadow-sm hover:shadow-md"}`}
            >
              {/* Template Preview Image */}
              <div className="aspect-[8.5/11] bg-white overflow-hidden relative">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => onSelectTemplate(template.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4" />
                        Selected
                      </>
                    ) : (
                      "Select"
                    )}
                  </button>
                </div>

                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Check className="w-3 h-3" />
                    Selected
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4 bg-white">
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-slate-600">{template.description}</p>
              </div>

              {/* Select Button (Mobile) */}
              <div className="p-4 pt-0 bg-white lg:hidden">
                <button
                  onClick={() => onSelectTemplate(template.id)}
                  className={`w-full py-2 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSelected ? "✓ Selected" : "Select Template"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={onSelectTemplate}
          isSelected={selectedTemplate === previewTemplate.id}
        />
      )}
    </>
  );
};

// Template Renderer Component
export const TemplateRenderer = ({
  templateId,
  businessInfo,
  loading,
  invoiceNumber,
  customerName,
  billName,
  billEmail,
  billPhone,
  billAddress,
  customerEmail,
  customerPhone,
  customerAddress,
  taxId,
  items,
  subtotal,
  totalTax,
  total,
  documentType = "invoice",
  stampText = "PAID",
  stampColor = "#22c55e",
  showStampDate = true,
  showStamp = false,
  paymentStatus,
}) => {
  // Professional Template
  const ProfessionalTemplate = () => (
    <div className="bg-white p-12 relative">
      {/* Signature Stamp */}
      {showStamp && paymentStatus?.status === "paid" && (
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
        />
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start mb-12 pb-8 border-b-4 border-blue-600">
        <div className="flex-1">
          {businessInfo?.logoUrl ? (
            <img
              src={businessInfo.logoUrl}
              alt="Business Logo"
              className="h-20 w-auto mb-4"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white">
                {businessInfo?.businessName?.charAt(0) || "B"}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {businessInfo?.businessName || "Your Business Name"}
          </h1>
          <div className="text-sm text-slate-600 space-y-1">
            <p>{businessInfo?.addressLine1}</p>
            <p>
              {businessInfo?.city}, {businessInfo?.postalCode}
            </p>
            <p>{businessInfo?.email}</p>
            <p>{businessInfo?.primaryPhone}</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">
            {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-end gap-2">
              <span className="font-semibold text-slate-700">Number:</span>
              <span className="text-slate-900">{invoiceNumber}</span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="font-semibold text-slate-700">Date:</span>
              <span className="text-slate-900">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="font-semibold text-slate-700">Due Date:</span>
              <span className="text-slate-900">
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To / Ship To Section */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 pb-2 border-b-2 border-blue-600">
            Bill To
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-slate-900 text-base">{customerName}</p>
            {taxId && <p className="text-slate-600">Tax ID: {taxId}</p>}
            <p className="text-slate-600">{customerEmail}</p>
            <p className="text-slate-600">{customerPhone}</p>
            <p className="text-slate-600">{customerAddress}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 pb-2 border-b-2 border-blue-600">
            Payment To
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-slate-900 text-base">
              {billName || customerName}
            </p>
            <p className="text-slate-600">{billEmail || customerEmail}</p>
            <p className="text-slate-600">{billPhone || customerPhone}</p>
            <p className="text-slate-600">{billAddress || customerAddress}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="text-left py-4 px-4 font-bold text-sm">
                Description
              </th>
              <th className="text-left py-4 px-4 font-bold text-sm">
                Category
              </th>
              <th className="text-right py-4 px-4 font-bold text-sm">Rate</th>
              <th className="text-right py-4 px-4 font-bold text-sm">Qty</th>
              <th className="text-right py-4 px-4 font-bold text-sm">Tax</th>
              <th className="text-right py-4 px-4 font-bold text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                <td className="py-4 px-4 text-sm text-slate-900">
                  {item.description}
                </td>
                <td className="py-4 px-4 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                    {item.category || "Service"}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-right text-slate-700">
                  R{item.rate.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-sm text-right text-slate-700">
                  {item.qty}
                </td>
                <td className="py-4 px-4 text-sm text-right text-slate-700">
                  R{item.taxAmount.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-sm text-right font-bold text-slate-900">
                  R{item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-80">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-700 font-medium">Subtotal:</span>
              <span className="font-bold text-slate-900">
                R{subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-700 font-medium">VAT (15%):</span>
              <span className="font-bold text-slate-900">
                R{totalTax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-4 bg-blue-50 px-4 rounded-lg">
              <span className="text-lg font-bold text-slate-900">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                R{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Terms */}
      <div className="border-t-2 border-slate-200 pt-8">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">
          Payment Terms & Conditions
        </h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p>• Payment is due within 30 days of invoice date</p>
          <p>• Late payments may incur a 2% monthly interest charge</p>
          <p>• Please reference invoice number in all payments</p>
          <p>• All prices are in South African Rand (ZAR)</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t-2 border-slate-200 text-center">
        <p className="text-sm text-slate-600">Thank you for your business!</p>
        {businessInfo?.registrationNumber && (
          <p className="text-xs text-slate-500 mt-2">
            Registration: {businessInfo.registrationNumber} | VAT:{" "}
            {businessInfo.vatNumber}
          </p>
        )}
      </div>
    </div>
  );

  // Minimal Template
  const MinimalTemplate = () => (
    <div className="bg-white p-12 relative">
      {showStamp && paymentStatus?.status === "paid" && (
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
        />
      )}

      {/* Header */}
      <div className="mb-16">
        <div className="flex justify-between items-start mb-8">
          <div>
            {businessInfo?.logoUrl ? (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-16 w-auto mb-6"
              />
            ) : (
              <div className="h-16 w-16 bg-slate-900 rounded mb-6"></div>
            )}
            <h1 className="text-xl font-bold text-slate-900 mb-1">
              {businessInfo?.businessName}
            </h1>
            <div className="text-xs text-slate-600 space-y-0.5">
              <p>{businessInfo?.email}</p>
              <p>{businessInfo?.primaryPhone}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-5xl font-light text-slate-900 mb-6">
              {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
            </h2>
            <div className="text-sm space-y-1">
              <p className="text-slate-600">{invoiceNumber}</p>
              <p className="text-slate-600">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-900"></div>
      </div>

      {/* Client Info */}
      <div className="mb-16">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Bill To
        </div>
        <div className="text-sm">
          <p className="font-bold text-slate-900 mb-2">{customerName}</p>
          <p className="text-slate-600">{customerEmail}</p>
          <p className="text-slate-600">{customerAddress}</p>
        </div>
      </div>

      {/* Items */}
      <div className="mb-16">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-900">
              <th className="text-left py-3 text-xs uppercase tracking-wider text-slate-700">
                Description
              </th>
              <th className="text-right py-3 text-xs uppercase tracking-wider text-slate-700">
                Qty
              </th>
              <th className="text-right py-3 text-xs uppercase tracking-wider text-slate-700">
                Rate
              </th>
              <th className="text-right py-3 text-xs uppercase tracking-wider text-slate-700">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="py-4 text-sm text-slate-900">
                  {item.description}
                </td>
                <td className="py-4 text-sm text-right text-slate-700">
                  {item.qty}
                </td>
                <td className="py-4 text-sm text-right text-slate-700">
                  R{item.rate.toFixed(2)}
                </td>
                <td className="py-4 text-sm text-right font-medium text-slate-900">
                  R{item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-slate-700">Subtotal</span>
              <span className="text-slate-900">R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Tax</span>
              <span className="text-slate-900">R{totalTax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-slate-900">
            <span className="font-bold text-slate-900">Total</span>
            <span className="font-bold text-slate-900 text-xl">
              R{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Modern Template
  const ModernTemplate = () => (
    <div className="bg-white relative">
      {showStamp && paymentStatus?.status === "paid" && (
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
        />
      )}

      {/* Header with Background */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-12 mb-8">
        <div className="flex justify-between items-start">
          <div>
            {businessInfo?.logoUrl ? (
              <div className="bg-white p-2 rounded-lg inline-block mb-4">
                <img
                  src={businessInfo.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto"
                />
              </div>
            ) : null}
            <h1 className="text-3xl font-bold mb-2">
              {businessInfo?.businessName}
            </h1>
            <div className="text-sm opacity-90">
              <p>{businessInfo?.email}</p>
              <p>{businessInfo?.primaryPhone}</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-4xl font-bold mb-4">
              {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
            </h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-sm">
              <p className="mb-1">{invoiceNumber}</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-12 pb-12">
        {/* Client Section */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <div className="text-xs font-bold text-purple-600 uppercase mb-3">
              Bill To
            </div>
            <div className="text-sm">
              <p className="font-bold text-lg mb-2">{customerName}</p>
              <p className="text-slate-600">{customerEmail}</p>
              <p className="text-slate-600">{customerPhone}</p>
              <p className="text-slate-600">{customerAddress}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                <th className="text-left py-4 px-4 text-sm font-bold text-purple-900">
                  Item
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-purple-900">
                  Qty
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-purple-900">
                  Rate
                </th>
                <th className="text-right py-4 px-4 text-sm font-bold text-purple-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-slate-200">
                  <td className="py-4 px-4 text-sm">{item.description}</td>
                  <td className="py-4 px-4 text-sm text-right">{item.qty}</td>
                  <td className="py-4 px-4 text-sm text-right">
                    R{item.rate.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-sm text-right font-bold">
                    R{item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-80 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6">
            <div className="space-y-3">
              <div className="flex justify-between opacity-90">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between opacity-90">
                <span>Tax</span>
                <span>R{totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/30 text-xl font-bold">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Classic Template
  const ClassicTemplate = () => (
    <div className="bg-white p-12 relative border-8 border-double border-slate-800">
      {showStamp && paymentStatus?.status === "paid" && (
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
        />
      )}

      {/* Decorative Header */}
      <div className="text-center mb-12 pb-8 border-b-4 border-double border-slate-800">
        {businessInfo?.logoUrl && (
          <img
            src={businessInfo.logoUrl}
            alt="Logo"
            className="h-20 w-auto mx-auto mb-4"
          />
        )}
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
          {businessInfo?.businessName}
        </h1>
        <p className="text-sm text-slate-600">{businessInfo?.addressLine1}</p>
        <p className="text-sm text-slate-600">
          {businessInfo?.city}, {businessInfo?.postalCode}
        </p>
      </div>

      {/* Invoice Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
          {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
        </h2>
        <div className="inline-block border-2 border-slate-800 px-6 py-3">
          <div className="text-sm space-y-1">
            <div>
              <span className="font-bold">No:</span> {invoiceNumber}
            </div>
            <div>
              <span className="font-bold">Date:</span>{" "}
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-12">
        <div className="border-2 border-slate-800 p-6">
          <div className="font-serif font-bold text-lg mb-3">Bill To:</div>
          <div className="text-sm space-y-1">
            <p className="font-bold">{customerName}</p>
            <p>{customerAddress}</p>
            <p>{customerEmail}</p>
            <p>{customerPhone}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full border-2 border-slate-800">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="text-left py-3 px-4 font-serif">Description</th>
              <th className="text-right py-3 px-4 font-serif">Quantity</th>
              <th className="text-right py-3 px-4 font-serif">Rate</th>
              <th className="text-right py-3 px-4 font-serif">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-slate-300">
                <td className="py-3 px-4 text-sm">{item.description}</td>
                <td className="py-3 px-4 text-sm text-right">{item.qty}</td>
                <td className="py-3 px-4 text-sm text-right">
                  R{item.rate.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-sm text-right font-bold">
                  R{item.totalAmount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-80 border-2 border-slate-800 p-6">
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="font-serif">Subtotal:</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-serif">Tax:</span>
              <span>R{totalTax.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-slate-800 font-serif font-bold text-lg">
            <span>Total:</span>
            <span>R{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 border-t-4 border-double border-slate-800">
        <p className="font-serif text-sm">Thank you for your business</p>
      </div>
    </div>
  );

  // Creative Template
  const CreativeTemplate = () => (
    <div className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-12 relative">
      {showStamp && paymentStatus?.status === "paid" && (
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
        />
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-300/20 to-orange-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
            {businessInfo?.logoUrl && (
              <img
                src={businessInfo.logoUrl}
                alt="Logo"
                className="h-20 w-20 rounded-2xl shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-1">
                {businessInfo?.businessName}
              </h1>
              <p className="text-sm text-slate-600">{businessInfo?.email}</p>
            </div>
          </div>

          <div className="text-right bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-3">
              {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-bold text-slate-900">{invoiceNumber}</p>
              <p className="text-slate-600">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-3">
            Client Details
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-bold text-lg mb-2">{customerName}</p>
              <p className="text-sm text-slate-600">{customerEmail}</p>
              <p className="text-sm text-slate-600">{customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">{customerAddress}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-600 to-pink-600 text-white">
                <th className="text-left py-4 px-6 font-bold">Service</th>
                <th className="text-right py-4 px-6 font-bold">Qty</th>
                <th className="text-right py-4 px-6 font-bold">Rate</th>
                <th className="text-right py-4 px-6 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="py-4 px-6 text-sm">{item.description}</td>
                  <td className="py-4 px-6 text-sm text-right">{item.qty}</td>
                  <td className="py-4 px-6 text-sm text-right">
                    R{item.rate.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-bold">
                    R{item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-96 bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="space-y-3">
              <div className="flex justify-between text-sm opacity-90">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-90">
                <span>Tax (15%)</span>
                <span>R{totalTax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/30 my-4"></div>
              <div className="flex justify-between text-2xl font-bold">
                <span>Total Due</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Corporate Template
  const CorporateTemplate = () => (
    <div className="bg-white p-12 relative">
      {showStamp && paymentStatus?.status === "paid" && (
        <SignatureStamp
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
        />
      )}

      {/* Header Bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 -mx-12 -mt-12 mb-8 p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            {businessInfo?.logoUrl && (
              <div className="bg-white p-2 rounded mb-4 inline-block">
                <img
                  src={businessInfo.logoUrl}
                  alt="Logo"
                  className="h-12 w-auto"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold mb-1">
              {businessInfo?.businessName}
            </h1>
            <div className="text-sm opacity-90 space-y-0.5">
              <p>{businessInfo?.addressLine1}</p>
              <p>
                {businessInfo?.city}, {businessInfo?.postalCode}
              </p>
              <p>
                {businessInfo?.email} | {businessInfo?.primaryPhone}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold mb-4">
              {documentType === "estimate" ? "ESTIMATE" : "INVOICE"}
            </h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm">
              <div className="space-y-1">
                <p>
                  <span className="opacity-75">Number:</span>{" "}
                  <span className="font-bold">{invoiceNumber}</span>
                </p>
                <p>
                  <span className="opacity-75">Date:</span>{" "}
                  <span className="font-bold">
                    {new Date().toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <span className="opacity-75">Due:</span>{" "}
                  <span className="font-bold">
                    {new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="border-l-4 border-indigo-600 pl-4">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
            Bill To
          </div>
          <div className="text-sm space-y-1">
            <p className="font-bold text-lg">{customerName}</p>
            {taxId && <p className="text-slate-600">Tax ID: {taxId}</p>}
            <p className="text-slate-600">{customerEmail}</p>
            <p className="text-slate-600">{customerPhone}</p>
            <p className="text-slate-600">{customerAddress}</p>
          </div>
        </div>

        <div className="border-l-4 border-blue-600 pl-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
            Company Details
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Registration: {businessInfo?.registrationNumber}</p>
            <p>VAT Number: {businessInfo?.vatNumber}</p>
            <p>Website: {businessInfo?.website}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <div className="overflow-hidden border border-slate-300 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <th className="text-left py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Description
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Category
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Rate
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Qty
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Tax
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-200 hover:bg-slate-50"
                >
                  <td className="py-4 px-6 text-sm text-slate-900">
                    {item.description}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                      {item.category || "Service"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-slate-700">
                    R{item.rate.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-slate-700">
                    {item.qty}
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-slate-700">
                    R{item.taxAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-bold text-slate-900">
                    R{item.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end mb-12">
        <div className="w-96">
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  R{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">VAT (15%):</span>
                <span className="font-semibold text-slate-900">
                  R{totalTax.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-slate-300 my-3"></div>
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-4 rounded-lg">
                <span className="font-bold text-lg">Total Amount Due:</span>
                <span className="font-bold text-2xl">R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="border-t-2 border-slate-200 pt-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">
          Terms & Conditions
        </h3>
        <div className="grid grid-cols-2 gap-6 text-xs text-slate-600">
          <div>
            <p className="mb-2">
              <span className="font-semibold text-slate-700">
                Payment Terms:
              </span>{" "}
              Net 30 days from invoice date
            </p>
            <p>
              <span className="font-semibold text-slate-700">Late Fee:</span> 2%
              per month on overdue balance
            </p>
          </div>
          <div>
            <p className="mb-2">
              <span className="font-semibold text-slate-700">
                Payment Methods:
              </span>{" "}
              Bank Transfer, Credit Card, Cash
            </p>
            <p>
              <span className="font-semibold text-slate-700">Currency:</span>{" "}
              All amounts in ZAR
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-600 font-semibold">
          Thank you for your business
        </p>
        <p className="text-xs text-slate-500 mt-2">
          This is a computer-generated document and is valid without signature
        </p>
      </div>
    </div>
  );

  // Render the selected template
  const templates = {
    professional: ProfessionalTemplate,
    minimal: MinimalTemplate,
    modern: ModernTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    corporate: CorporateTemplate,
  };

  const SelectedTemplate = templates[templateId] || templates.professional;

  return <SelectedTemplate />;
};

export default TemplateSelector;
