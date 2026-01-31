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

// Helper function to calculate due date based on payment terms
const calculateDueDate = (terms) => {
  let daysToAdd = 30; // default
  
  if (terms?.includes("7 Days") || terms?.includes("7 Day")) daysToAdd = 7;
  else if (terms?.includes("15 Days")) daysToAdd = 15;
  else if (terms?.includes("30 Days") || terms?.includes("Net 30")) daysToAdd = 30;
  else if (terms?.includes("60 Days")) daysToAdd = 60;
  else if (terms?.includes("90 Days")) daysToAdd = 90;
  else if (terms?.includes("Due on Receipt")) daysToAdd = 0;
  else if (terms?.includes("Immediate")) daysToAdd = 0;
  
  if (daysToAdd === 0) {
    return "Due on Receipt";
  }
  
  return new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toLocaleDateString("en-ZA");
};

// Template Selector Dropdown Component
export const TemplateSelector = ({ user, selectedTemplate, onTemplateChange }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(['professional']);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: 'Standard Invoice',
    professional: 'Professional Standard',
    modern: 'Modern Business',
    corporate: 'Corporate Elite',
    premium: 'Premium',
    contemporary: 'Bold Contemporary',
    detailed: 'Detailed Statement'
  };

  useEffect(() => {
    loadPurchasedTemplates();
  }, [user]);

  const loadPurchasedTemplates = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, 'users', user.uid, 'settings', 'templates');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPurchasedTemplates(['default', ...(docSnap.data().purchased || ['professional'])]);
      } else {
        setPurchasedTemplates(['default', 'professional']);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSelectTemplate = async (templateId) => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, 'users', user.uid, 'settings', 'templates');
      
      await updateDoc(docRef, {
        active: templateId,
        updatedAt: serverTimestamp()
      });

      onTemplateChange(templateId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  return (
    <div className="relative print:hidden">
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

// Default/Standard Invoice Template
export const DefaultTemplate = (props) => <ProfessionalTemplate {...props} />;

// Professional Services Template (Default)
export const ProfessionalTemplate = ({ 
  businessInfo, 
  loading,
  jobCardNumber, 
  customerName,
  customerCompany,
  customerEmail, 
  customerPhone, 
  customerAddress,
  customerId,
  invoiceDate,
  dueDate,
  items,
  subtotal,
  documentType = 'invoice',
  vat,
  total,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#ea580c",
  showStampDate = true,
  paymentMethod = "Bank Transfer/EFT",
  paymentTerms = "Net 30",
  serviceGuarantee = "7 Day Satisfaction Guarantee"
}) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
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
                alt="Company Logo"
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">💼</span>
              </div>
            )}
            <div>
              <div className="text-xl font-bold text-blue-600">
                {businessInfo.businessName || businessInfo.companyName}
              </div>
              <div className="text-sm font-semibold text-gray-600">
                Professional Accounting Services
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-600">
            <div>{businessInfo.addressLine1}</div>
            {businessInfo.addressLine2 && <div>{businessInfo.addressLine2}</div>}
            <div>{businessInfo.city} {businessInfo.postalCode}</div>
            <div className="mt-1">
              Tel: {businessInfo.primaryPhone}
              {businessInfo.secondaryPhone && ` | ${businessInfo.secondaryPhone}`}
            </div>
            {businessInfo.registrationNumber && (
              <div className="mt-1">Reg: {businessInfo.registrationNumber}</div>
            )}
            {businessInfo.taxNumber && (
              <div>VAT: {businessInfo.taxNumber}</div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-blue-700 mb-4">
            {documentType === 'invoice' ? 'INVOICE' : 'QUOTE'}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">{documentType === 'quote' ? 'Quote No.' : 'Invoice No.'}</span>
              <span className="text-blue-800">{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Date</span>
              <span className="text-blue-800">{invoiceDate || new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Due Date</span>
              <span className="text-blue-800">{dueDate || calculateDueDate(paymentTerms)}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Terms</span>
              <span className="text-blue-800">{paymentTerms || 'Net 30'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Client Information */}
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-blue-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-blue-700">BILL TO</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div className="font-semibold">{customerName}</div>
          {customerCompany && customerCompany !== customerName && (
            <div className="text-gray-600">{customerCompany}</div>
          )}
          {customerId && (
            <div className="text-gray-500">Customer ID: {customerId}</div>
          )}
          <div className="mt-2">{customerAddress}</div>
          <div className="mt-2">{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-blue-700">PAYMENT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div className="flex justify-between">
            <span className="font-semibold">Payment Terms:</span>
            <span>{paymentTerms || 'Net 30'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Payment Method:</span>
            <span>{paymentMethod}</span>
          </div>
          {serviceGuarantee && serviceGuarantee !== "No Warranty" && (
            <div className="flex justify-between">
              <span className="font-semibold">Guarantee:</span>
              <span className="text-xs">{serviceGuarantee}</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-blue-200 text-blue-900">
            <th className="text-left px-3 py-2 font-bold">Description</th>
            <th className="text-center px-3 py-2 font-bold">Type</th>
            <th className="text-center px-3 py-2 font-bold">Qty</th>
            <th className="text-right px-3 py-2 font-bold">Rate</th>
            <th className="text-right px-3 py-2 font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="px-3 py-3">{item.description}</td>
              <td className="text-center px-3 py-3">{item.type || 'Service'}</td>
              <td className="text-center px-3 py-3">{item.qty}</td>
              <td className="text-right px-3 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-3 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="flex justify-end mb-6">
      <div className="w-72 text-sm">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 font-bold bg-blue-600 text-white px-4 rounded">
          <span>TOTAL:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    
    {/* Payment Information */}
    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {businessInfo.accountHolder || businessInfo.businessName || businessInfo.companyName}</div>
        <div><span className="font-semibold">Account Number:</span> {businessInfo.accountNumber || '62123456789'}</div>
        <div><span className="font-semibold">Branch Code:</span> {businessInfo.branchCode || '250655'}</div>
        <div><span className="font-semibold">Payment Method:</span> {paymentMethod}</div>
      </div>
    </div>

    {/* Service Guarantee */}
    {serviceGuarantee && serviceGuarantee !== "No Warranty" && (
      <div className="bg-green-50 border border-green-200 p-3 mb-4 rounded text-center">
        <div className="text-green-700 font-semibold text-sm">✓ {serviceGuarantee}</div>
      </div>
    )}

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
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      {documentType === 'quote' 
        ? 'Quote valid for 30 days. Terms & conditions apply.' 
        : 'Thank you for your business. Payment due as per terms above.'}
    </div>
  </div>
);

// Classic Template
export const ClassicTemplate = (props) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-gray-800 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              <div className="text-xl font-bold">{props.businessInfo.businessName || props.businessInfo.companyName}</div>
              <div className="text-sm text-gray-600">Accounting & Financial Services</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>T: {props.businessInfo.primaryPhone}</div>
            {props.businessInfo.registrationNumber && <div>Reg: {props.businessInfo.registrationNumber}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-blue-500 mb-4 italic">
            {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">{props.documentType === 'quote' ? 'QUOTE NO.' : 'INVOICE NO.'}</span>
              <span>{props.jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{props.invoiceDate || new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-100 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-800 text-white px-2 py-1">CLIENT</div>
        <div className="text-xs space-y-1">
          <div>{props.customerName}</div>
          {props.customerCompany && <div className="text-gray-600">{props.customerCompany}</div>}
          {props.customerId && <div className="text-gray-500">ID: {props.customerId}</div>}
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-gray-100 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-800 text-white px-2 py-1">PAYMENT DETAILS</div>
        <div className="text-xs space-y-1">
          <div>Terms: {props.paymentTerms || 'Net 30'}</div>
          <div>Due: {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          <div>Method: {props.paymentMethod}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Type</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-right px-2 py-1 font-bold">Rate</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-2">{item.description}</td>
            <td className="text-center px-2 py-2">{item.type || 'Service'}</td>
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
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.accountHolder || props.businessInfo.businessName || props.businessInfo.companyName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62123456789'}</div>
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
      Terms & Conditions: Payment due as per terms above. {props.serviceGuarantee}
    </div>
  </div>
);

// Modern Business Template
export const ModernTemplate = (props) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-blue-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-3xl font-bold text-gray-900 mb-2">{props.businessInfo.businessName || props.businessInfo.companyName}</div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-blue-500 mb-4 italic">
            {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="text-sm"><span className="font-semibold">{props.documentType === 'quote' ? 'Quote #' : 'Invoice #'}</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-semibold">Date:</span> {props.invoiceDate || new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-semibold">Due:</span> {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-700 mb-3">CLIENT INFORMATION</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          {props.customerCompany && <div className="text-gray-600">{props.customerCompany}</div>}
          {props.customerId && <div className="text-gray-500 text-xs">ID: {props.customerId}</div>}
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-blue-700 mb-3">PAYMENT DETAILS</div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div><span className="font-semibold">Terms:</span> {props.paymentTerms || 'Net 30'}</div>
          <div><span className="font-semibold">Method:</span> {props.paymentMethod}</div>
          <div><span className="font-semibold">Due Date:</span> {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-blue-500 text-white">
          <th className="text-left px-4 py-3 rounded-l-lg">Description</th>
          <th className="text-center px-4 py-3">Type</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Rate</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.type || 'Service'}</td>
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
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-white px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.accountHolder || props.businessInfo.businessName || props.businessInfo.companyName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62123456789'}</div>
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
      Payment terms: {props.paymentTerms || 'Net 30'}. {props.serviceGuarantee}
    </div>
  </div>
);

// Corporate Template
export const CorporateTemplate = (props) => (
  <div className="bg-white p-6" style={{padding: "5mm 10mm" }}>
    <div className="border-b-4 border-slate-700 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-2xl font-bold text-gray-900 mb-2">{props.businessInfo.businessName || props.businessInfo.companyName}</div>
          <div className="text-sm font-semibold text-slate-700 mb-2">Financial & Accounting Services</div>
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-slate-700 mb-4">
            {props.documentType === 'quote' ? 'QUOTATION' : 'INVOICE'}
          </div>
          <div className="bg-slate-100 border-2 border-slate-700 p-3 rounded">
            <div className="text-sm"><span className="font-bold">Number:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-bold">Date:</span> {props.invoiceDate || new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-bold">Due:</span> {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-slate-700 p-4 rounded">
        <div className="text-sm font-bold text-slate-700 mb-3">CLIENT</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Name:</span> {props.customerName}</div>
          {props.customerCompany && props.customerCompany !== props.customerName && (
            <div><span className="font-semibold">Company:</span> {props.customerCompany}</div>
          )}
          {props.customerId && (
            <div><span className="font-semibold">Customer ID:</span> {props.customerId}</div>
          )}
          <div><span className="font-semibold">Email:</span> {props.customerEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.customerPhone}</div>
          <div><span className="font-semibold">Address:</span> {props.customerAddress}</div>
        </div>
      </div>
      <div className="border-2 border-slate-700 p-4 rounded">
        <div className="text-sm font-bold text-slate-700 mb-3">PAYMENT INFORMATION</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Terms:</span> {props.paymentTerms || 'Net 30'}</div>
          <div><span className="font-semibold">Method:</span> {props.paymentMethod}</div>
          <div><span className="font-semibold">Due Date:</span> {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-slate-700 text-white px-4 py-2 font-bold">LINE ITEMS</div>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-700">
            <th className="text-left px-4 py-2 text-sm">Description</th>
            <th className="text-center px-4 py-2 text-sm">Type</th>
            <th className="text-center px-4 py-2 text-sm">Qty</th>
            <th className="text-right px-4 py-2 text-sm">Rate</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.type || 'Service'}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-slate-700 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-slate-700 text-white px-4 rounded">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-slate-100 border border-slate-300 p-4 mb-4 rounded">
      <div className="text-slate-800 font-bold text-sm mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.accountHolder || props.businessInfo.businessName || props.businessInfo.companyName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62123456789'}</div>
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
          <p className="text-xs text-gray-600">{props.businessInfo.businessName || props.businessInfo.companyName}</p>
        </div>
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Payment terms: {props.paymentTerms || 'Net 30'}. {props.serviceGuarantee}
    </div>
  </div>
);

// Premium Template (Contemporary style)
export const PremiumTemplate = (props) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50" style={{ padding: "5mm 10mm" }}>
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-b-4 border-blue-500 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            )}
            <div className="text-3xl font-black text-blue-600 mb-2">{props.businessInfo.businessName || props.businessInfo.companyName}</div>
            <div className="text-sm text-gray-600">Professional Financial Services</div>
            <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-blue-500 mb-4 italic">
              {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
            </div>
            <div className="bg-blue-500 text-white p-4 rounded space-y-1">
              <div className="text-sm font-bold">#{props.jobCardNumber}</div>
              <div className="text-sm">{props.invoiceDate || new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="text-sm font-bold text-blue-700 mb-3">CLIENT</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{props.customerName}</div>
            {props.customerCompany && <div className="text-gray-600">{props.customerCompany}</div>}
            {props.customerId && <div className="text-gray-500 text-xs">ID: {props.customerId}</div>}
            <div className="text-gray-600">{props.customerAddress}</div>
            <div className="text-gray-600">{props.customerEmail}</div>
            <div className="text-gray-600">{props.customerPhone}</div>
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
          <div className="text-sm font-bold text-indigo-700 mb-3">PAYMENT</div>
          <div className="text-sm space-y-1">
            <div className="text-gray-600">Terms: {props.paymentTerms || 'Net 30'}</div>
            <div className="text-gray-600">Method: {props.paymentMethod}</div>
            <div className="text-gray-600">Due: {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <th className="text-left px-4 py-3 font-black">DESCRIPTION</th>
            <th className="text-center px-4 py-3 font-black">TYPE</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">RATE</th>
            <th className="text-right px-4 py-3 font-black">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.type || 'Service'}</td>
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
          <div className="flex justify-between py-3 text-xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 rounded-lg">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 p-4 mb-4 rounded-lg">
        <div className="text-blue-700 font-bold text-sm mb-2">BANKING DETAILS</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
          <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.accountHolder || props.businessInfo.businessName || props.businessInfo.companyName}</div>
          <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62123456789'}</div>
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
            <p className="text-xs text-gray-600">{props.businessInfo.businessName || props.businessInfo.companyName}</p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Thank you for your business. {props.serviceGuarantee}
      </div>
    </div>
  </div>
);

// Contemporary Template - Bold emerald design
export const ContemporaryTemplate = (props) => (
  <div className="bg-gradient-to-br from-emerald-50 to-green-50" style={{ padding: "5mm 10mm" }}>
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="border-b-4 border-emerald-500 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            )}
            <div className="text-3xl font-black text-emerald-600 mb-2">{props.businessInfo.businessName || props.businessInfo.companyName}</div>
            <div className="text-sm text-gray-600">Professional Financial Services</div>
            <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-emerald-500 mb-4 italic">
              {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
            </div>
            <div className="bg-emerald-500 text-white p-4 rounded space-y-1">
              <div className="text-sm font-bold">#{props.jobCardNumber}</div>
              <div className="text-sm">{props.invoiceDate || new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200">
          <div className="text-sm font-bold text-emerald-700 mb-3">CLIENT</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-gray-900">{props.customerName}</div>
            {props.customerCompany && <div className="text-gray-600">{props.customerCompany}</div>}
            {props.customerId && <div className="text-gray-500 text-xs">ID: {props.customerId}</div>}
            <div className="text-gray-600">{props.customerAddress}</div>
            <div className="text-gray-600">{props.customerEmail}</div>
            <div className="text-gray-600">{props.customerPhone}</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <div className="text-sm font-bold text-green-700 mb-3">PAYMENT</div>
          <div className="text-sm space-y-1">
            <div className="text-gray-600">Terms: {props.paymentTerms || 'Net 30'}</div>
            <div className="text-gray-600">Method: {props.paymentMethod}</div>
            <div className="text-gray-600">Due: {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6 shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
            <th className="text-left px-4 py-3 font-black">DESCRIPTION</th>
            <th className="text-center px-4 py-3 font-black">TYPE</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">RATE</th>
            <th className="text-right px-4 py-3 font-black">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.type || 'Service'}</td>
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
          <div className="flex justify-between py-3 text-xl font-black bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 rounded-lg">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 p-4 mb-4 rounded-lg">
        <div className="text-emerald-700 font-bold text-sm mb-2">BANKING DETAILS</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
          <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.accountHolder || props.businessInfo.businessName || props.businessInfo.companyName}</div>
          <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62123456789'}</div>
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
            <p className="text-xs text-gray-600">{props.businessInfo.businessName || props.businessInfo.companyName}</p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Modern business solutions. {props.serviceGuarantee}
      </div>
    </div>
  </div>
);

// Detailed Statement Template - Professional teal theme
export const DetailedTemplate = (props) => (
  <div className="bg-white p-6" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-teal-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-2xl font-bold text-gray-900 mb-2">{props.businessInfo.businessName || props.businessInfo.companyName}</div>
          <div className="text-sm font-semibold text-teal-700 mb-2">Detailed Financial Statements</div>
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-teal-700 mb-4">
            {props.documentType === 'quote' ? 'DETAILED QUOTE' : 'DETAILED STATEMENT'}
          </div>
          <div className="bg-teal-100 border-2 border-teal-600 p-3 rounded">
            <div className="text-sm"><span className="font-bold">Number:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-bold">Date:</span> {props.invoiceDate || new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-bold">Due:</span> {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-teal-600 p-4 rounded">
        <div className="text-sm font-bold text-teal-700 mb-3">CLIENT INFORMATION</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Name:</span> {props.customerName}</div>
          {props.customerCompany && props.customerCompany !== props.customerName && (
            <div><span className="font-semibold">Company:</span> {props.customerCompany}</div>
          )}
          {props.customerId && (
            <div><span className="font-semibold">Customer ID:</span> {props.customerId}</div>
          )}
          <div><span className="font-semibold">Email:</span> {props.customerEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.customerPhone}</div>
          <div><span className="font-semibold">Address:</span> {props.customerAddress}</div>
        </div>
      </div>
      <div className="border-2 border-teal-600 p-4 rounded">
        <div className="text-sm font-bold text-teal-700 mb-3">PAYMENT TERMS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Payment Terms:</span> {props.paymentTerms || 'Net 30'}</div>
          <div><span className="font-semibold">Payment Method:</span> {props.paymentMethod}</div>
          <div><span className="font-semibold">Due Date:</span> {props.dueDate || calculateDueDate(props.paymentTerms)}</div>
          {props.serviceGuarantee && props.serviceGuarantee !== "No Warranty" && (
            <div><span className="font-semibold">Guarantee:</span> {props.serviceGuarantee}</div>
          )}
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-teal-600 text-white px-4 py-2 font-bold">DETAILED LINE ITEMS</div>
      <table className="w-full">
        <thead>
          <tr className="bg-teal-100 border-b-2 border-teal-600">
            <th className="text-left px-4 py-2 text-sm">Description</th>
            <th className="text-center px-4 py-2 text-sm">Type</th>
            <th className="text-center px-4 py-2 text-sm">Qty</th>
            <th className="text-right px-4 py-2 text-sm">Rate</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.type || 'Service'}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-teal-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-teal-600 text-white px-4 rounded">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-teal-50 border border-teal-300 p-4 mb-4 rounded">
      <div className="text-teal-800 font-bold text-sm mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.accountHolder || props.businessInfo.businessName || props.businessInfo.companyName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '62123456789'}</div>
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
          <p className="text-xs text-gray-600">{props.businessInfo.businessName || props.businessInfo.companyName}</p>
        </div>
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Comprehensive billing statement. Payment terms: {props.paymentTerms || 'Net 30'}
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({
  templateId, 
  documentType = 'invoice',
  stampText = "APPROVED",
  stampColor = "#ea580c",
  showStampDate = true,
  showStamp = false,
  paymentMethod = "Bank Transfer/EFT",
  paymentTerms = "Net 30",
  serviceGuarantee = "7 Day Satisfaction Guarantee",
  ...props 
}) => {
  const templateProps = { 
    ...props, 
    documentType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
    paymentMethod,
    paymentTerms,
    serviceGuarantee
  };

  switch (templateId) {
    case 'default':
      return <DefaultTemplate {...templateProps} />;
    case 'professional':
      return <ProfessionalTemplate {...templateProps} />;
    case 'modern':
      return <ModernTemplate {...templateProps} />;
    case 'corporate':
      return <CorporateTemplate {...templateProps} />;
    case 'premium':
      return <PremiumTemplate {...templateProps} />;
    case 'contemporary':
      return <ContemporaryTemplate {...templateProps} />;
    case 'detailed':
      return <DetailedTemplate {...templateProps} />;
    // Legacy template names for backwards compatibility
    case 'classic':
      return <ClassicTemplate {...templateProps} />;
    default:
      return <ProfessionalTemplate {...templateProps} />;
  }
};

export default TemplateSelector;