
import React, { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';

// Mock SignatureStamp component for this artifact
const SignatureStamp = ({ text, color, showDate, rotation, size }) => (
  <div 
    style={{ 
      transform: `rotate(${rotation}deg)`,
      display: 'inline-block',
      border: `3px solid ${color}`,
      borderRadius: '8px',
      padding: size === 'small' ? '8px 16px' : '12px 24px',
      color: color,
      fontWeight: 'bold',
      fontSize: size === 'small' ? '14px' : '18px',
      opacity: 0.7
    }}
  >
    {text}
    {showDate && <div style={{ fontSize: '10px', marginTop: '4px' }}>{new Date().toLocaleDateString()}</div>}
  </div>
);

// Template Selector Dropdown Component
export const TemplateSelector = ({ selectedTemplate, onTemplateChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: 'Default Professional',
    classic: 'Classic Clean',
    modern: 'Modern Minimalist',
    elegant: 'Elegant Premium',
    residential: 'Residential Service',
    commercial: 'Commercial Pro'
  };

  const availableTemplates = ['default', 'classic', 'modern', 'elegant', 'residential', 'commercial'];

  const handleSelectTemplate = (templateId) => {
    onTemplateChange(templateId);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <FileText className="w-4 h-4" />
        <span>{templateNames[selectedTemplate] || 'Select Template'}</span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
              {availableTemplates.map(templateId => (
                <button
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                    selectedTemplate === templateId ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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

// Default Template
export const DefaultTemplate = ({ 
  businessInfo, 
  loading,
  jobCardNumber, 
  customerName, 
  customerEmail, 
  customerPhone, 
  customerAddress,
  propertyType,
  serviceLocation,
  serviceDate,
  serviceTime,
  squareFootage,
  numberOfRooms,
  items,
  subtotal,
  documentType = 'invoice',
  vat,
  total,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#2563eb",
  showStampDate = true
}) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
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
                alt="Business Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center"></div>
            )}
            <div>
              
              <div className="text-sm font-semibold text-gray-600">
                Professional Cleaning Services
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{businessInfo.addressLine1}</div>
            <div>{businessInfo.addressLine2}</div>
            <div>{businessInfo.city} {businessInfo.postalCode}</div>
            <div className="mt-1">
              T: {businessInfo.primaryPhone}
              {businessInfo.secondaryPhone && `, ${businessInfo.secondaryPhone}`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-5xl font-black text-green-500 mb-4 italic">{documentType === 'invoice' ? 'INVOICE' : 'QUOTE'}</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">{documentType === 'quote' ? 'QUOTE NO.' : 'INVOICE NO.'}</span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">SERVICE DATE</span>
              <span>{serviceDate || new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">SERVICE TYPE</span>
              <span>CLEANING</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Three Column Section */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-blue-50 p-3 border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1">CLIENT DETAILS</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{customerName}</div>
          <div className="h-12 overflow-hidden text-xs leading-tight">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1">SERVICE LOCATION</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{serviceLocation || customerAddress}</div>
          <div className="flex justify-between">
            <span className="font-semibold">Property Type:</span>
            <span>{propertyType || 'Residential'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Square Footage:</span>
            <span>{squareFootage || 'N/A'} sqft</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Rooms:</span>
            <span>{numberOfRooms || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 border border-blue-200">
        <div className="font-bold text-xs mb-2 bg-blue-200 px-2 py-1">SERVICE SCHEDULE</div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Service Date:</span>
            <span>{serviceDate || new Date().toLocaleDateString("en-ZA")}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Time:</span>
            <span>{serviceTime || '09:00 AM'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Duration:</span>
            <span>4 hours</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Frequency:</span>
            <span>One-time</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-blue-200">
            <th className="text-left px-2 py-1 font-bold">SERVICE DESCRIPTION</th>
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
              <td className="text-right px-2 py-2">R {item.amount.toFixed(2)}</td>
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
          <span>R {(subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1">
          <span>VAT (15%):</span>
          <span>R {(vat || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {(total || 0).toFixed(2)}</span>
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

    {/* Banking Details */}
    <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
      <div className="text-blue-600 font-bold text-xs mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1">
        <div><span className="font-semibold">Bank Name:</span> {businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {businessInfo.accountNumber || '62146991441'}</div>
        <div><span className="font-semibold">Branch Code:</span> {businessInfo.branchCode || '250655'}</div>
      </div>
    </div>

    {/* Footer Note */}
    <div className="text-center text-xs text-blue-600 italic">
      Thank you for choosing our cleaning services. We guarantee 100% satisfaction!
    </div>
  </div>
);

// Classic Template
export const ClassicTemplate = (props) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-gray-800 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              
              <div className="text-sm text-gray-600">Professional Cleaning Services</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>T: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
         <div className="text-5xl font-black text-green-500 mb-4 italic">{props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">{props.documentType === 'quote' ? 'QUOTE NO.' : 'INVOICE NO.'}</span>
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
      <div className="bg-gray-100 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-800 px-2 py-1">CUSTOMER</div>
        <div className="text-xs space-y-1">
          <div>{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-gray-100 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-800 px-2 py-1">SERVICE LOCATION</div>
        <div className="text-xs space-y-1">
          <div>{props.serviceLocation || props.customerAddress}</div>
          <div>Type: {props.propertyType || 'Residential'}</div>
          <div>Size: {props.squareFootage || 'N/A'} sqft</div>
        </div>
      </div>
      <div className="bg-gray-100 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-800 px-2 py-1">SERVICE INFO</div>
        <div className="text-xs space-y-1">
          <div>Date: {props.serviceDate || new Date().toLocaleDateString()}</div>
          <div>Time: {props.serviceTime || '09:00 AM'}</div>
          <div>Status: Completed</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800">
          <th className="text-left px-2 py-1 font-bold">Service Description</th>
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
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-gray-800 px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
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
      Thank you for your business. We guarantee satisfaction with all our services!
    </div>
  </div>
);

// Modern Template
export const ModernTemplate = (props) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-blue-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          
          <div className="text-sm text-gray-600 space-y-1">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-green-500 mb-4 italic">{props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}</div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="text-sm"><span className="font-semibold">{props.documentType === 'quote' ? 'QUOTE NO.' : 'INVOICE NO.'}</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
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
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-blue-700 mb-3">SERVICE DETAILS</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-semibold">Location:</span> {props.serviceLocation || 'On-site'}</div>
          <div><span className="font-semibold">Type:</span> {props.propertyType || 'Residential'}</div>
          <div><span className="font-semibold">Date:</span> {props.serviceDate || new Date().toLocaleDateString()}</div>
          <div><span className="font-semibold">Time:</span> {props.serviceTime || '09:00 AM'}</div>
          <div className="col-span-2"><span className="font-semibold">Area:</span> {props.squareFootage || 'N/A'} sqft</div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-blue-500 text-gray-800">
          <th className="text-left px-4 py-3 rounded-l-lg">Service Description</th>
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
            <td className="text-right px-4 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
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
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-gray-800 px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
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
      Thank you for choosing our professional cleaning services. Payment is due within 30 days.
    </div>
  </div>
);

// Elegant/Premium Template
export const ElegantTemplate = (props) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    <div className="border-4 border-purple-900 p-8">
      <div className="text-center border-b-2 border-purple-900 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img src={props.businessInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
        )}
        
        <div className="text-sm text-gray-600">Premium Cleaning Services</div>
        <div className="text-sm text-gray-600">{props.businessInfo.addressLine1} • {props.businessInfo.city}</div>
        <div className="text-2xl font-serif text-purple-700 mt-4">SERVICE INVOICE</div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">BILLED TO</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            <div>{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
            <div>{props.customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">SERVICE DETAILS</div>
          <div className="text-sm space-y-1">
            <div>Location: {props.serviceLocation || props.customerAddress}</div>
            <div>Property: {props.propertyType || 'Residential'}</div>
            <div>Date: {props.serviceDate || new Date().toLocaleDateString()}</div>
            <div>Area: {props.squareFootage || 'N/A'} sqft</div>
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
          <div className="flex justify-between py-3 font-bold text-lg bg-purple-900 text-gray-800 px-4">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {/* Payment Information */}
    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
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
        <div className="border-t-2 border-gray-800 pt-2" style={{ minWidth: '200px' }}>
          <p className="text-sm font-semibold">Authorized Signature</p>
          <p className="text-xs text-gray-600">{props.businessInfo.businessName}</p>
        </div>
      </div>
    )}
    {/* Footer Note */}
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for your business. Payment is due within 30 days of invoice date.
    </div>
    </div>
  </div>
);

export const ResidentialTemplate = (props) => (
  <div className="bg-gradient-to-br from-green-50 to-blue-50" style={{ padding: "15mm 20mm" }}>
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-b-4 border-green-500 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            )}
            
            <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-green-500 mb-4 italic">{props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}</div>
            <div className="bg-green-500 text-gray-800 p-4 rounded space-y-1">
              <div className="text-sm font-bold">#{props.jobCardNumber}</div>
              <div className="text-sm">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <div className="text-sm font-bold text-green-700 mb-3">CLIENT INFORMATION</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{props.customerName}</div>
            <div className="text-gray-600">{props.customerAddress}</div>
            <div className="text-gray-600">{props.customerEmail}</div>
            <div className="text-gray-600">{props.customerPhone}</div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="text-sm font-bold text-blue-700 mb-3">SERVICE LOCATION</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{props.serviceLocation || props.customerAddress}</div>
            <div className="text-gray-600">Type: {props.propertyType || 'Residential'}</div>
            <div className="text-gray-600">Area: {props.squareFootage || 'N/A'} sqft</div>
            <div className="text-gray-600">Rooms: {props.numberOfRooms || 'N/A'}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-green-500 to-blue-500 text-gray-800">
            <th className="text-left px-4 py-3 font-black">CLEANING SERVICE</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">RATE</th>
            <th className="text-right px-4 py-3 font-black">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-bold">R {item.amount.toFixed(2)}</td>
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
          <div className="flex justify-between py-3 text-xl font-black bg-gradient-to-r from-green-500 to-blue-500 text-gray-800 px-4 rounded-lg">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 p-4 mb-4 rounded-lg">
        <div className="text-green-700 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
          <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
          <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
          <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
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
          <div className="border-t-2 border-gray-300 pt-2" style={{ minWidth: '200px' }}>
            <p className="text-sm font-semibold">Authorized Signature</p>
            <p className="text-xs text-gray-600">{props.businessInfo.businessName}</p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Thank you for trusting us with your home! We appreciate your business.
      </div>
    </div>
  </div>
);

// Commercial Pro Template
export const CommercialTemplate = (props) => (
  <div className="bg-white print:p-0" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-indigo-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          
          <div className="text-sm font-semibold text-indigo-600 mb-2">Commercial Cleaning Specialists</div>
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-indigo-600 mb-4">SERVICE INVOICE</div>
          <div className="bg-indigo-50 border-2 border-indigo-600 p-3 rounded">
            <div className="text-sm"><span className="font-bold">Invoice #:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-indigo-600 p-4 rounded">
        <div className="text-sm font-bold text-indigo-600 mb-3">CLIENT DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Company:</span> {props.customerName}</div>
          <div><span className="font-semibold">Email:</span> {props.customerEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.customerPhone}</div>
          <div><span className="font-semibold">Address:</span> {props.customerAddress}</div>
        </div>
      </div>
      <div className="border-2 border-indigo-600 p-4 rounded">
        <div className="text-sm font-bold text-indigo-600 mb-3">FACILITY DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Location:</span> {props.serviceLocation || props.customerAddress}</div>
          <div><span className="font-semibold">Property Type:</span> {props.propertyType || 'Commercial Office'}</div>
          <div><span className="font-semibold">Total Area:</span> {props.squareFootage || 'N/A'} sqft</div>
          <div><span className="font-semibold">Service Date:</span> {props.serviceDate || new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-indigo-600 text-gray-800 px-4 py-2 font-bold">SERVICES PROVIDED</div>
      <table className="w-full">
        <thead>
          <tr className="bg-indigo-50 border-b-2 border-indigo-600">
            <th className="text-left px-4 py-2 text-sm">Service Description</th>
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
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-indigo-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-indigo-600 text-gray-800 px-4 rounded">
          <span>TOTAL DUE:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-indigo-50 border border-indigo-200 p-4 mb-4 rounded">
      <div className="text-indigo-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
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
        <div className="border-t-2 border-gray-800 pt-2" style={{ minWidth: '200px' }}>
          <p className="text-sm font-semibold">Authorized Signature</p>
          <p className="text-xs text-gray-600">{props.businessInfo.businessName}</p>
        </div>
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Professional commercial cleaning services. Payment terms: Net 30 days.
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({ 
   templateId, 
  documentType = 'invoice',
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
    showStamp
   };
switch (templateId) {
case 'default':
return <DefaultTemplate {...templateProps} />;
case 'classic':
return <ClassicTemplate {...templateProps} />;
case 'modern':
return <ModernTemplate {...templateProps} />;
case 'elegant':
return <ElegantTemplate {...templateProps} />;
case 'residential':
return <ResidentialTemplate {...templateProps} />;
case 'commercial':
return <CommercialTemplate {...templateProps} />;
default:
return <DefaultTemplate {...templateProps} />;
}
};
export default TemplateSelector