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
    default: 'Default (Professional)',
    classic: 'Classic Legal',
    modern: 'Modern Law Firm',
    elegant: 'Elegant Chambers',
    corporate: 'Corporate Legal',
    traditional: 'Traditional Practice',
    boutique: 'Boutique Firm'
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
                Your Templates
              </div>
              {purchasedTemplates.map(templateId => (
                <button
                  key={templateId}
                  onClick={() => handleSelectTemplate(templateId)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between ${
                    selectedTemplate === templateId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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

// Default Legal Template
export const DefaultTemplate = ({ 
  businessInfo, 
  loading,
  jobCardNumber,
  invoiceNumber,
  customerName,
  clientName,
  customerEmail,
  clientEmail,
  customerPhone,
  clientPhone,
  customerAddress,
  clientAddress,
  caseNumber,
  caseType,
  matterDescription,
  items,
  subtotal,
  vat,
  total,
  serviceType,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#1e40af",
  showStampDate = true
}) => {
  const finalInvoiceNumber = invoiceNumber || jobCardNumber;
  const finalClientName = clientName || customerName;
  const finalClientEmail = clientEmail || customerEmail;
  const finalClientPhone = clientPhone || customerPhone;
  const finalClientAddress = clientAddress || customerAddress;

  return (
    <div className="bg-white" style={{ padding: "15mm 20mm" }}>
      {/* Header Section */}
      <div className="border-b-2 border-blue-900 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {loading ? (
                <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
              ) : businessInfo.logoUrl ? (
                <img
                  src={businessInfo.logoUrl}
                  alt="Firm Logo"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center"></div>
              )}
              <div>
                <div className="text-xl font-bold text-blue-900">
                  {businessInfo?.businessName || ""}
                </div>
                <div className="text-xs text-gray-600 italic">Attorneys & Conveyancers</div>
              </div>
            </div>
            <div className="text-xs leading-relaxed text-gray-700">
              <div>{businessInfo.addressLine1}</div>
              <div>{businessInfo.addressLine2}</div>
              <div>{businessInfo.city} {businessInfo.postalCode}</div>
              <div className="mt-1">
                T: {businessInfo.primaryPhone}
                {businessInfo.secondaryPhone && ` | F: ${businessInfo.secondaryPhone}`}
              </div>
              {businessInfo.email && <div>E: {businessInfo.email}</div>}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold mb-4 text-blue-900">TAX INVOICE</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between gap-8">
                <span className="font-semibold">INVOICE NO.</span>
                <span>{finalInvoiceNumber}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-semibold">DATE</span>
                <span>{new Date().toLocaleDateString("en-ZA")}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-semibold">CASE NO.</span>
                <span>{caseNumber}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-semibold">MATTER TYPE</span>
                <span>{caseType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Section */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 border border-blue-200">
          <div className="font-bold text-xs mb-2 bg-blue-900 text-gray-800 px-2 py-1">BILL TO</div>
          <div className="text-xs space-y-1">
            <div className="font-semibold">{finalClientName}</div>
            <div className="h-12 overflow-hidden text-xs leading-tight">{finalClientAddress}</div>
            <div>{finalClientEmail}</div>
            <div>{finalClientPhone}</div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 border border-blue-200">
          <div className="font-bold text-xs mb-2 bg-blue-900 text-gray-800 px-2 py-1">CLIENT DETAILS</div>
          <div className="text-xs space-y-1">
            <div className="font-semibold">{finalClientName}</div>
            <div className="h-12 overflow-hidden text-xs leading-tight">{finalClientAddress}</div>
            <div>{finalClientEmail}</div>
            <div>{finalClientPhone}</div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 border border-blue-200">
          <div className="font-bold text-xs mb-2 bg-blue-900 text-gray-800 px-2 py-1">MATTER DETAILS</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">Case No:</span>
              <span>{caseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Type:</span>
              <span>{caseType}</span>
            </div>
            <div className="mt-2">
              <span className="font-semibold">Description:</span>
              <div className="text-[9px] mt-1 leading-tight">{matterDescription}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-blue-900 text-gray-800">
              <th className="text-left px-2 py-1 font-bold">DESCRIPTION OF SERVICES</th>
              <th className="text-center px-2 py-1 font-bold">HOURS/QTY</th>
              <th className="text-right px-2 py-1 font-bold">RATE</th>
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
            <span>R {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>VAT (15%):</span>
            <span>R {vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold bg-blue-900 text-gray-800 px-2">
            <span>TOTAL DUE:</span>
            <span>R {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Banking Details */}
      <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
        <div className="text-blue-900 font-bold text-xs mb-2">TRUST ACCOUNT DETAILS</div>
        <div className="text-xs space-y-1">
          <div><span className="font-semibold">Bank Name:</span> {businessInfo.bankName || 'FNB'}</div>
          <div><span className="font-semibold">Account Holder:</span> {businessInfo.businessName}</div>
          <div><span className="font-semibold">Account Number:</span> {businessInfo.accountNumber || '62146991441'}</div>
          <div><span className="font-semibold">Branch Code:</span> {businessInfo.branchCode || '250655'}</div>
        </div>
      </div>

      {/* Signatures and Stamp */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
        <div>
          <div className="font-semibold mb-1">AUTHORIZED SIGNATURE</div>
          <div className="border-b border-blue-900 h-8"></div>
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
      <div className="text-center text-xs text-blue-900 italic border-t border-blue-900 pt-2">
        Payment is due within 30 days of invoice date. Interest may be charged on overdue accounts.
      </div>
    </div>
  );
};

// Classic Legal Template
export const ClassicTemplate = (props) => {
  const finalInvoiceNumber = props.invoiceNumber || props.jobCardNumber;
  const finalClientName = props.clientName || props.customerName;
  const finalClientEmail = props.clientEmail || props.customerEmail;
  const finalClientPhone = props.clientPhone || props.customerPhone;
  const finalClientAddress = props.clientAddress || props.customerAddress;

  return (
    <div className="bg-white" style={{ padding: "15mm 20mm" }}>
      <div className="border-b-2 border-gray-800 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {props.businessInfo.logoUrl && (
                <img src={props.businessInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
              )}
              <div>
                <div className="text-xl font-serif font-bold text-gray-900">{props.businessInfo.businessName}</div>
                <div className="text-xs text-gray-600">Attorneys & Conveyancers</div>
              </div>
            </div>
            <div className="text-xs leading-relaxed">
              <div>{props.businessInfo.addressLine1}</div>
              <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
              <div>T: {props.businessInfo.primaryPhone}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-serif font-bold mb-4 text-gray-900">TAX INVOICE</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between gap-8">
                <span className="font-semibold">INVOICE NO.</span>
                <span>{finalInvoiceNumber}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-semibold">DATE</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="font-semibold">CASE NO.</span>
                <span>{props.caseNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 border border-gray-300">
          <div className="font-bold text-xs mb-2 bg-gray-700 text-gray-800 px-2 py-1">CLIENT</div>
          <div className="text-xs space-y-1">
            <div className="font-semibold">{finalClientName}</div>
            <div>{finalClientAddress}</div>
            <div>{finalClientEmail}</div>
            <div>{finalClientPhone}</div>
          </div>
        </div>
        <div className="bg-gray-50 p-3 border border-gray-300">
          <div className="font-bold text-xs mb-2 bg-gray-700 text-gray-800 px-2 py-1">MATTER</div>
          <div className="text-xs space-y-1">
            <div>Case: {props.caseNumber}</div>
            <div>Type: {props.caseType}</div>
            <div className="text-[9px] mt-1">{props.matterDescription}</div>
          </div>
        </div>
        <div className="bg-gray-50 p-3 border border-gray-300">
          <div className="font-bold text-xs mb-2 bg-gray-700 text-gray-800 px-2 py-1">INVOICE INFO</div>
          <div className="text-xs space-y-1">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Terms: 30 Days</div>
          </div>
        </div>
      </div>

      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="bg-gray-700 text-gray-800">
            <th className="text-left px-2 py-1 font-bold">Description</th>
            <th className="text-center px-2 py-1 font-bold">Hours</th>
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

      <div className="bg-gray-50 border border-gray-300 p-4 mb-4">
        <div className="text-gray-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
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
        This account is rendered according to our terms of engagement
      </div>
    </div>
  );
};
export const CorporateTemplate = (props) => {
  const finalInvoiceNumber = props.invoiceNumber || props.jobCardNumber;
  const finalClientName = props.clientName || props.customerName;
  const finalClientEmail = props.clientEmail || props.customerEmail;
  const finalClientPhone = props.clientPhone || props.customerPhone;
  const finalClientAddress = props.clientAddress || props.customerAddress;

  return (
    <div className="bg-white" style={{ padding: "15mm 20mm" }}>
      <div className="border-b-4 border-indigo-900 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            )}
            <div className="text-2xl font-bold text-indigo-900 mb-2">{props.businessInfo.businessName}</div>
            <div className="text-xs text-gray-600">
              <div>{props.businessInfo.addressLine1}</div>
              <div>{props.businessInfo.city}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-indigo-900 mb-4">FEE NOTE</div>
            <div className="bg-indigo-50 border-2 border-indigo-900 p-3 rounded">
              <div className="text-sm"><span className="font-bold">Reference:</span> {finalInvoiceNumber}</div>
              <div className="text-sm"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-indigo-900 p-4">
          <div className="text-sm font-bold text-indigo-900 mb-3">CLIENT INFORMATION</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Name:</span> {finalClientName}</div>
            <div><span className="font-semibold">Email:</span> {finalClientEmail}</div>
            <div><span className="font-semibold">Phone:</span> {finalClientPhone}</div>
          </div>
        </div>
        <div className="border-2 border-indigo-900 p-4">
          <div className="text-sm font-bold text-indigo-900 mb-3">MATTER DETAILS</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">File:</span> {props.caseNumber}</div>
            <div><span className="font-semibold">Type:</span> {props.caseType}</div>
            <div className="text-xs">{props.matterDescription}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-indigo-900 text-gray-800 px-4 py-2 font-bold">PROFESSIONAL SERVICES RENDERED</div>
        <table className="w-full">
          <thead>
            <tr className="bg-indigo-50 border-b-2 border-indigo-900">
              <th className="text-left px-4 py-2 text-sm">Description</th>
              <th className="text-center px-4 py-2 text-sm">Time</th>
              <th className="text-right px-4 py-2 text-sm">Rate</th>
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

      <div className="flex justify-end mb-4">
        <div className="w-80 border-2 border-indigo-900 p-4">
          <div className="flex justify-between py-2">
            <span>Professional Fees:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-bold bg-indigo-900 text-gray-800 px-4">
            <span>TOTAL DUE:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 p-4 mb-4">
        <div className="text-indigo-900 font-bold text-sm mb-2">BANKING DETAILS</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank:</span> {props.businessInfo.bankName || 'FNB'}</div>
          <div><span className="font-semibold">Account:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
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
        Terms: Payment within 30 days of invoice date
      </div>
    </div>
  );
};

// Modern Law Firm Template
export const ModernTemplate = (props) => {
  const finalInvoiceNumber = props.invoiceNumber || props.jobCardNumber;
  const finalClientName = props.clientName || props.customerName;
  const finalClientEmail = props.clientEmail || props.customerEmail;
  const finalClientPhone = props.clientPhone || props.customerPhone;
  const finalClientAddress = props.clientAddress || props.customerAddress;

  return (
    <div className="bg-white" style={{ padding: "15mm 20mm" }}>
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
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
            <div className="text-5xl font-bold text-blue-600 mb-4">INVOICE</div>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="text-sm"><span className="font-semibold">Invoice #:</span> {finalInvoiceNumber}</div>
              <div className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
              <div className="text-sm"><span className="font-semibold">Case:</span> {props.caseNumber}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="text-sm font-bold text-gray-700 mb-3">CLIENT</div>
          <div className="space-y-1 text-sm">
            <div className="font-semibold text-lg">{finalClientName}</div>
            <div>{finalClientAddress}</div>
            <div>{finalClientEmail}</div>
            <div>{finalClientPhone}</div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-600">
          <div className="text-sm font-bold text-blue-700 mb-3">MATTER INFORMATION</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Case Number:</span> {props.caseNumber}</div>
            <div><span className="font-semibold">Matter Type:</span> {props.caseType}</div>
            <div className="text-xs mt-2">{props.matterDescription}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="bg-blue-600 text-gray-800">
            <th className="text-left px-4 py-3 rounded-l-lg">Service Description</th>
            <th className="text-center px-4 py-3">Hours</th>
            <th className="text-right px-4 py-3">Rate</th>
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
          <div className="flex justify-between py-3 text-xl font-bold bg-blue-600 text-gray-800 px-4 rounded-lg">
            <span>TOTAL DUE:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
        <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT DETAILS</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank:</span> {props.businessInfo.bankName || 'FNB'}</div>
          <div><span className="font-semibold">Account:</span> {props.businessInfo.accountNumber || '62146991441'}</div>
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
        Payment due within 30 days. Interest charged on overdue accounts.
      </div>
    </div>
  );
};

// Template Renderer
export const TemplateRenderer = ({  templateId, 
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
default:
return <DefaultTemplate {...templateProps} />;
}
};
export default TemplateSelector