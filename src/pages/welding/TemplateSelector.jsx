import React, { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import SignatureStamp from '../SignatureStamp';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Template Selector Dropdown Component
export const TemplateSelector = ({ user, selectedTemplate, onTemplateChange }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(['classic']);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: 'Default Welding',
    classic: 'Classic Industrial',
    modern: 'Modern Fabrication',
    elegant: 'Elegant Professional',
    premium: 'Premium Welding',
    technical: 'Technical Specialist',
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
        <span className="hidden sm:inline">{templateNames[selectedTemplate] || 'Select Template'}</span>
        <span className="sm:hidden">Template</span>
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
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                Available Templates
              </div>
              {Object.keys(templateNames).map(templateId => (
                <button
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-between ${
                    selectedTemplate === templateId ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
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


// Default Welding Template
export const DefaultTemplate = ({ 
  businessInfo, 
  loading,
  jobCardNumber, 
  customerName, 
  customerEmail, 
  customerPhone, 
  customerAddress,
  equipmentType, // projectType
  equipmentManufacturer, // materialType
  equipmentModel, // weldingProcess
  equipmentSerial, // materialThickness
  equipmentId, // projectScale
  equipmentLocation, // projectAddress
  items,
  subtotal,
  vat,
  total,
  serviceCode,
  serviceType = "WELDING SERVICE",
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
  documentType = "quote"
}) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-orange-600 pb-4 mb-4">
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
              <div className="w-12 h-12 bg-orange-200 rounded flex items-center justify-center">
                <span className="text-orange-600 font-bold">W</span>
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-orange-900">{businessInfo?.businessName || "Welding Services"}</div>
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
          <div className="text-3xl font-bold text-orange-600 mb-4">
            {documentType === 'quote' ? 'WELDING QUOTE' : 'WELDING INVOICE'}
          </div>
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
              <span className="font-semibold">SERVICE CODE</span>
              <span>{serviceCode}</span>
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
      <div className="bg-orange-50 p-3 border border-orange-200">
        <div className="font-bold text-xs mb-2 bg-orange-600 text-white px-2 py-1">CLIENT DETAILS</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{customerName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-orange-50 p-3 border border-orange-200">
        <div className="font-bold text-xs mb-2 bg-orange-600 text-white px-2 py-1">BILLING ADDRESS</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{customerName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-orange-50 p-3 border border-orange-200">
        <div className="font-bold text-xs mb-2 bg-orange-600 text-white px-2 py-1">PROJECT DETAILS</div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Type:</span>
            <span>{equipmentType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Material:</span>
            <span>{equipmentManufacturer}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Process:</span>
            <span>{equipmentModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Thickness:</span>
            <span className="text-[9px]">{equipmentSerial}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Scale:</span>
            <span>{equipmentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Location:</span>
            <span className="text-[9px]">{equipmentLocation}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-orange-600 text-white">
            <th className="text-left px-2 py-1 font-bold">WORK DESCRIPTION</th>
            <th className="text-center px-2 py-1 font-bold">QUANTITY</th>
            <th className="text-right px-2 py-1 font-bold">UNIT RATE</th>
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
        <div className="flex justify-between py-2 font-bold bg-orange-100 text-orange-900 px-2 rounded">
          <span>TOTAL:</span>
          <span>R {(total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    <div className="bg-orange-50 border border-orange-200 p-3 mb-4 rounded">
      <div className="text-orange-600 font-bold text-xs mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1">
        <div><span className="font-semibold">Bank Name:</span> {businessInfo.bankName || 'FNB'}</div>
        <div><span className="font-semibold">Account Holder:</span> {businessInfo.businessName}</div>
        <div><span className="font-semibold">Branch Name:</span> {businessInfo.branchName || 'Main Branch'}</div>
        <div><span className="font-semibold">Account Number:</span> {businessInfo.accountNumber || '62146991441'}</div>
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
    <div className="text-center text-xs text-orange-600 italic">
      NB: All welding work comes with a 12-month warranty
    </div>
  </div>
);

// Classic Welding Template
export const ClassicTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-stone-800 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              <div className="text-xl font-bold text-stone-800">{props.businessInfo.businessName}</div>
              <div className="text-xs text-stone-600">Professional Welding Services</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-stone-700">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>T: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-stone-800 mb-4">
            {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
          </div>
          <div className="text-xs space-y-1 bg-stone-100 p-3 rounded">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">Number:</span>
              <span>{props.jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-stone-100 p-3 rounded">
        <div className="font-bold text-xs mb-2 bg-stone-800 text-white px-2 py-1 rounded">CLIENT</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{props.customerName}</div>
          <div className="text-stone-600">{props.customerAddress}</div>
          <div className="text-stone-600">{props.customerEmail}</div>
          <div className="text-stone-600">{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-stone-100 p-3 rounded">
        <div className="font-bold text-xs mb-2 bg-stone-800 text-white px-2 py-1 rounded">PROJECT</div>
        <div className="text-xs space-y-1">
          <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
          <div><span className="font-semibold">Material:</span> {props.equipmentManufacturer}</div>
          <div><span className="font-semibold">Process:</span> {props.equipmentModel}</div>
          <div><span className="font-semibold">Scale:</span> {props.equipmentId}</div>
        </div>
      </div>
      <div className="bg-stone-100 p-3 rounded">
        <div className="font-bold text-xs mb-2 bg-stone-800 text-white px-2 py-1 rounded">WORK INFO</div>
        <div className="text-xs space-y-1">
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>Location: {props.equipmentLocation}</div>
          <div>Thickness: {props.equipmentSerial}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-stone-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Rate</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b border-stone-200">
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
        <div className="flex justify-between py-1 border-b border-stone-200">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-stone-200">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-stone-800 text-white px-2 rounded mt-1">
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

    <div className="text-center text-xs text-stone-600 italic border-t border-stone-200 pt-3">
      Thank you for choosing our welding services. All work guaranteed.
    </div>
  </div>
);

// Modern Welding Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-orange-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-2xl font-bold text-orange-600 mb-1">{props.businessInfo.businessName}</div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-orange-500 mb-4">
            {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
          </div>
          <div className="bg-orange-50 p-4 rounded-lg space-y-2 border border-orange-200">
            <div className="text-sm"><span className="font-semibold">Number:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-semibold">Service:</span> Welding</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-700 mb-3">CLIENT INFORMATION</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div className="text-gray-600">{props.customerAddress}</div>
          <div className="text-gray-600">{props.customerEmail}</div>
          <div className="text-gray-600">{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="text-sm font-bold text-orange-700 mb-3">PROJECT SPECIFICATIONS</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
          <div><span className="font-semibold">Process:</span> {props.equipmentModel}</div>
          <div><span className="font-semibold">Material:</span> {props.equipmentManufacturer}</div>
          <div><span className="font-semibold">Thickness:</span> {props.equipmentSerial}</div>
          <div className="col-span-2"><span className="font-semibold">Location:</span> {props.equipmentLocation}</div>
          <div className="col-span-2"><span className="font-semibold">Scale:</span> {props.equipmentId}</div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-orange-500 text-white">
          <th className="text-left px-4 py-3 rounded-l-lg">Work Description</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Unit Rate</th>
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
        <div className="flex justify-between py-3 text-xl font-bold bg-orange-500 text-white px-4 rounded-lg">
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
      Professional welding services with quality guarantee
    </div>
  </div>
);

// Elegant Welding Template
export const ElegantTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-4 border-amber-700 p-8">
      <div className="text-center border-b-2 border-amber-700 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img src={props.businessInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
        )}
        <div className="text-2xl font-bold text-amber-900 mb-1">{props.businessInfo.businessName}</div>
        <div className="text-sm text-gray-600">{props.businessInfo.addressLine1} • {props.businessInfo.city}</div>
        <div className="text-2xl font-serif text-amber-700 mt-4">
          {props.documentType === 'quote' ? 'WELDING QUOTATION' : 'WELDING INVOICE'}
        </div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-amber-900 mb-2">CLIENT DETAILS</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            <div className="text-gray-600">{props.customerAddress}</div>
            <div className="text-gray-600">{props.customerEmail}</div>
            <div className="text-gray-600">{props.customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-amber-900 mb-2">PROJECT INFORMATION</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
            <div><span className="font-semibold">Material:</span> {props.equipmentManufacturer}</div>
            <div><span className="font-semibold">Process:</span> {props.equipmentModel}</div>
            <div><span className="font-semibold">Thickness:</span> {props.equipmentSerial}</div>
            <div><span className="font-semibold">Scale:</span> {props.equipmentId}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-amber-700">
            <th className="text-left py-2 font-serif">Work Item</th>
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
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-300">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-amber-700 text-white px-4 rounded">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 mb-4 rounded">
        <div className="text-amber-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank:</span> {props.businessInfo.bankName || 'FNB'}</div>
          <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
          <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
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
        Excellence in welding • Quality craftsmanship • Professional service
      </div>
    </div>
  </div>
);

// Premium Welding Template
export const PremiumTemplate = (props) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100" style={{ padding: "15mm 20mm" }}>
    <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain mb-4 brightness-0 invert" />
            )}
            <div className="text-3xl font-bold mb-2">{props.businessInfo.businessName}</div>
            <div className="text-sm opacity-90">Premium Welding Services</div>
            <div className="text-sm opacity-90 mt-2">{props.businessInfo.addressLine1}</div>
            <div className="text-sm opacity-90">{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black mb-2">
              {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
            </div>
            <div className="bg-white text-orange-600 px-4 py-2 rounded font-bold">
              #{props.jobCardNumber}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border-l-4 border-orange-600 pl-4">
            <div className="text-sm font-bold text-orange-700 mb-3">CLIENT INFORMATION</div>
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-lg text-gray-900">{props.customerName}</div>
              <div className="text-gray-600">{props.customerAddress}</div>
              <div className="text-gray-600">{props.customerEmail}</div>
              <div className="text-gray-600">{props.customerPhone}</div>
            </div>
          </div>
          <div className="border-l-4 border-orange-600 pl-4">
            <div className="text-sm font-bold text-orange-700 mb-3">WELDING PROJECT DETAILS</div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold">{props.equipmentType}</span>
                <span className="text-gray-600">Material:</span>
                <span className="font-semibold">{props.equipmentManufacturer}</span>
                <span className="text-gray-600">Process:</span>
                <span className="font-semibold">{props.equipmentModel}</span>
                <span className="text-gray-600">Thickness:</span>
                <span className="font-semibold">{props.equipmentSerial}</span>
                <span className="text-gray-600">Scale:</span>
                <span className="font-semibold">{props.equipmentId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-orange-600 text-white px-4 py-2 font-bold mb-2">WORK BREAKDOWN</div>
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50 border-b-2 border-orange-600">
                <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">Description</th>
                <th className="text-center px-4 py-3 text-sm font-bold text-gray-700">Qty</th>
                <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">Unit Rate</th>
                <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {props.items.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="text-center px-4 py-3 text-sm">{item.qty}</td>
                  <td className="text-right px-4 py-3 text-sm">R {item.rate.toFixed(2)}</td>
                  <td className="text-right px-4 py-3 text-sm font-semibold">R {item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-6">
          <div className="w-96">
            <div className="flex justify-between py-2 text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">R {props.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-600">
              <span>VAT (15%):</span>
              <span className="font-semibold">R {props.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-4 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 rounded-lg mt-2">
              <span>TOTAL DUE:</span>
              <span>R {props.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border-2 border-orange-200 p-4 mb-4 rounded-lg">
          <div className="text-orange-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
          <div className="text-xs space-y-1 text-gray-700">
            <div><span className="font-semibold">Bank:</span> {props.businessInfo.bankName || 'FNB'}</div>
            <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
            <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
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

        <div className="text-center text-xs text-gray-500 italic border-t pt-4">
          Premium Welding Services • Certified Welders • 12 Month Warranty on All Work
        </div>
      </div>
    </div>
  </div>
);

// Technical Welding Template
export const TechnicalTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-2 border-red-700">
      <div className="bg-red-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3 brightness-0 invert" />
            )}
            <div className="text-2xl font-bold mb-1">{props.businessInfo.businessName}</div>
            <div className="text-sm opacity-90">Certified Welding Specialists</div>
            <div className="text-sm opacity-90 mt-2">{props.businessInfo.addressLine1}</div>
            <div className="text-sm opacity-90">{props.businessInfo.city}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-2">WELDING</div>
            <div className="text-3xl font-mono">{props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}</div>
            <div className="bg-white text-red-700 px-3 py-1 rounded mt-2 font-mono font-bold">
              {props.jobCardNumber}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 border border-gray-300 p-3">
            <div className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Client Details</div>
            <div className="text-sm space-y-1">
              <div className="font-semibold">{props.customerName}</div>
              <div className="text-xs text-gray-600">{props.customerAddress}</div>
              <div className="text-xs text-gray-600">{props.customerEmail}</div>
              <div className="text-xs text-gray-600">{props.customerPhone}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 p-3">
            <div className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Project Specs</div>
            <div className="text-xs space-y-1">
              <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
              <div><span className="font-semibold">Material:</span> {props.equipmentManufacturer}</div>
              <div><span className="font-semibold">Process:</span> {props.equipmentModel}</div>
              <div><span className="font-semibold">Thickness:</span> {props.equipmentSerial}</div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-300 p-3">
            <div className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">Work Details</div>
            <div className="text-xs space-y-1">
              <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
              <div><span className="font-semibold">Location:</span> {props.equipmentLocation}</div>
              <div><span className="font-semibold">Scale:</span> {props.equipmentId}</div>
              <div><span className="font-semibold">Code:</span> {props.serviceCode}</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-red-700 text-white px-4 py-2 font-bold text-sm uppercase tracking-wide">
            Welding Work Breakdown
          </div>
          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-red-50">
                <th className="text-left px-4 py-2 text-xs font-bold text-gray-700 border-b border-gray-300">Work Description</th>
                <th className="text-center px-4 py-2 text-xs font-bold text-gray-700 border-b border-gray-300">Qty</th>
                <th className="text-right px-4 py-2 text-xs font-bold text-gray-700 border-b border-gray-300">Rate</th>
                <th className="text-right px-4 py-2 text-xs font-bold text-gray-700 border-b border-gray-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              {props.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="text-center px-4 py-3 text-sm font-mono">{item.qty}</td>
                  <td className="text-right px-4 py-3 text-sm font-mono">R {item.rate.toFixed(2)}</td>
                  <td className="text-right px-4 py-3 text-sm font-mono font-semibold">R {item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-6">
          <div className="w-80 border-2 border-red-700">
            <div className="flex justify-between py-2 px-4 bg-gray-50">
              <span className="text-sm font-semibold">Subtotal:</span>
              <span className="text-sm font-mono">R {props.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 px-4 bg-gray-50 border-t border-gray-300">
              <span className="text-sm font-semibold">VAT (15%):</span>
              <span className="text-sm font-mono">R {props.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 px-4 bg-red-700 text-white text-lg font-bold">
              <span>TOTAL DUE:</span>
              <span className="font-mono">R {props.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-700 p-4 mb-4">
          <div className="text-red-800 font-bold text-sm mb-2 uppercase tracking-wide">Banking Details</div>
          <div className="text-xs space-y-1 text-gray-700 grid grid-cols-2 gap-x-4">
            <div><span className="font-semibold">Bank:</span> {props.businessInfo.bankName || 'FNB'}</div>
            <div><span className="font-semibold">Branch:</span> {props.businessInfo.branchName || 'Main Branch'}</div>
            <div className="col-span-2"><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
            <div className="col-span-2"><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
          </div>
        </div>

        {props.showStamp && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-gray-600">
              <div className="font-semibold mb-1">Authorized Welder Signature:</div>
              <div className="border-b-2 border-gray-400 w-48 h-8"></div>
            </div>
            <SignatureStamp 
              text={props.stampText}
              color={props.stampColor}
              showDate={props.showStampDate}
              rotation={-5}
              size="medium"
            />
          </div>
        )}

        <div className="text-center text-xs text-gray-500 italic border-t-2 border-gray-300 pt-3">
          Certified Welding • All work meets industry standards • 12 months warranty
        </div>
      </div>
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({ templateId, 
  documentType = 'quote',
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
    case 'premium':
      return <PremiumTemplate {...templateProps} />;
    case 'technical':
      return <TechnicalTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
};

export default TemplateSelector;