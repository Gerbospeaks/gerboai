import React, { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Template Selector Dropdown Component
export const TemplateSelector = ({ user, selectedTemplate, onTemplateChange }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(['professional']);
  const [isOpen, setIsOpen] = useState(false);

  const templateNames = {
    default: 'Default Standard',
    professional: 'Professional Standard',
    modern: 'Modern Business',
    corporate: 'Corporate Elite',
    premium: 'Premium Professional',
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
  vehicleReg,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vehicleVin,
  vehicleMileage,
  items,
  subtotal,
  vat,
  total
}) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-slate-700 pb-4 mb-4">
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
              <div className="text-xl font-bold text-slate-800">
                {businessInfo.businessName}
              </div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-600">
            <div>{businessInfo.addressLine1}</div>
            <div>{businessInfo.addressLine2}</div>
            <div>{businessInfo.city} {businessInfo.postalCode}</div>
            <div className="mt-1">
              Tel: {businessInfo.primaryPhone}
              {businessInfo.secondaryPhone && ` | ${businessInfo.secondaryPhone}`}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-slate-700 mb-4">INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Invoice No.</span>
              <span className="text-slate-800">{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Date</span>
              <span className="text-slate-800">{new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Reference</span>
              <span className="text-slate-800">REF-{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold text-gray-600">Terms</span>
              <span className="text-slate-800">Net 30</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Client Information */}
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-slate-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-slate-700">BILL TO</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div className="font-semibold">{customerName}</div>
          <div className="mt-2">{customerAddress}</div>
          <div className="mt-2">{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-slate-700">ACCOUNT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div className="flex justify-between">
            <span className="font-semibold">Account ID:</span>
            <span>ACC-{jobCardNumber.substring(0, 6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Payment Terms:</span>
            <span>Net 30 Days</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Due Date:</span>
            <span>{new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString("en-ZA")}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-6">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-200 text-slate-700">
            <th className="text-left px-3 py-2 font-bold">Description</th>
            <th className="text-center px-3 py-2 font-bold">Quantity</th>
            <th className="text-right px-3 py-2 font-bold">Unit Price</th>
            <th className="text-right px-3 py-2 font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="px-3 py-3">{item.description}</td>
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
        <div className="flex justify-between py-3 font-bold bg-slate-700 text-white px-4 rounded">
          <span>TOTAL DUE:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Payment Information */}
    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {businessInfo.accountNumber || '62146991441'}</div>
        <div><span className="font-semibold">Branch Code:</span> {businessInfo.branchCode || '250655'}</div>
      </div>
    </div>

    {/* Footer Note */}
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for your business. Payment is due within 30 days of invoice date.
    </div>
  </div>
);

// Professional Standard Template
export const ProfessionalTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-blue-600 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              <div className="text-xl font-bold text-blue-900">{props.businessInfo.businessName}</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-gray-600">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>Tel: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 mb-4">INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">Invoice No.</span>
              <span>{props.jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">Date</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">Due Date</span>
              <span>{new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-blue-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-blue-800">BILL TO</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <div className="font-bold text-sm mb-2 text-gray-700">PAYMENT TERMS</div>
        <div className="text-xs space-y-1">
          <div>Terms: Net 30 Days</div>
          <div>Payment Method: Bank Transfer</div>
          <div>Reference: {props.jobCardNumber}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-6">
      <thead>
        <tr className="bg-blue-100 text-blue-900">
          <th className="text-left px-3 py-2 font-bold">Description</th>
          <th className="text-center px-3 py-2 font-bold">Qty</th>
          <th className="text-right px-3 py-2 font-bold">Unit Price</th>
          <th className="text-right px-3 py-2 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-3 py-3">{item.description}</td>
            <td className="text-center px-3 py-3">{item.qty}</td>
            <td className="text-right px-3 py-3">R {item.rate.toFixed(2)}</td>
            <td className="text-right px-3 py-3">R {item.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-6">
      <div className="w-72 text-sm">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 font-bold bg-blue-600 text-white px-4 rounded">
          <span>TOTAL DUE:</span>
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

    {/* Footer Note */}
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for your business. Payment is due within 30 days of invoice date.
    </div>
  </div>
);

// Modern Business Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-indigo-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-3xl font-bold text-gray-900 mb-2">{props.businessInfo.businessName}</div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>{props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-indigo-500 mb-4">INVOICE</div>
          <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
            <div className="text-sm"><span className="font-semibold">Invoice #:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-semibold">Due:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-500 mb-3">BILL TO</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-indigo-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-indigo-700 mb-3">ACCOUNT DETAILS</div>
        <div className="space-y-2 text-sm">
          <div><span className="font-semibold">Account ID:</span> {props.jobCardNumber.substring(0, 8)}</div>
          <div><span className="font-semibold">Payment Terms:</span> Net 30</div>
          <div><span className="font-semibold">Status:</span> <span className="text-green-600 font-semibold">Active</span></div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-indigo-500 text-white">
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
        <div className="flex justify-between py-3 text-xl font-bold bg-indigo-500 text-white px-4 rounded-lg">
          <span>TOTAL DUE:</span>
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

    {/* Footer Note */}
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for your business. Payment is due within 30 days of invoice date.
    </div>
  </div>
);

// Corporate Elite Template
export const CorporateTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-4 border-slate-800 p-8">
      <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img src={props.businessInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
        )}
        <div className="text-4xl font-serif font-bold text-slate-800 mb-2">{props.businessInfo.businessName}</div>
        <div className="text-sm text-gray-600">{props.businessInfo.addressLine1} • {props.businessInfo.city}</div>
        <div className="text-2xl font-serif text-slate-700 mt-4">TAX INVOICE</div>
        <div className="text-sm text-gray-500 mt-1">Invoice #{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-slate-800 mb-2">INVOICED TO</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            <div>{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
            <div>{props.customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-slate-800 mb-2">INVOICE DETAILS</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
            <div><span className="font-semibold">Due Date:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
            <div><span className="font-semibold">Terms:</span> Net 30 Days</div>
            <div><span className="font-semibold">Reference:</span> {props.jobCardNumber}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-slate-800">
            <th className="text-left py-2 font-serif">Item Description</th>
            <th className="text-center py-2 font-serif">Qty</th>
            <th className="text-right py-2 font-serif">Rate</th>
            <th className="text-right py-2 font-serif">Amount</th>
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
        <div className="w-72">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT (15%):</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-slate-800 text-white px-4">
            <span>TOTAL DUE:</span>
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

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Thank you for your business. Payment is due within 30 days of invoice date.
      </div>
    </div>
  </div>
);

// Bold Contemporary Template
export const ContemporaryTemplate = (props) => (
  <div className="bg-gradient-to-br from-slate-50 to-gray-100" style={{ padding: "15mm 20mm" }}>
    <div className="bg-white p-8 shadow-lg">
      <div className="border-b-4 border-emerald-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            )}
            <div className="text-3xl font-black text-slate-800 mb-2">{props.businessInfo.businessName}</div>
            <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-emerald-600 mb-4 italic">INVOICE</div>
            <div className="bg-emerald-600 text-white p-4 rounded space-y-1">
              <div className="text-sm font-bold">#{props.jobCardNumber}</div>
              <div className="text-sm">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-emerald-600">
          <div className="text-sm font-bold text-emerald-600 mb-3">CLIENT</div>
          <div className="text-sm space-y-1">
            <div className="font-bold text-lg">{props.customerName}</div>
            <div className="text-gray-600">{props.customerAddress}</div>
            <div className="text-gray-600">{props.customerEmail}</div>
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-slate-600">
          <div className="text-sm font-bold text-slate-700 mb-3">PAYMENT INFO</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Terms:</span> Net 30 Days</div>
            <div><span className="font-semibold">Due:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
            <div><span className="font-semibold">Method:</span> Bank Transfer</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
            <th className="text-left px-4 py-3 font-black">DESCRIPTION</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">RATE</th>
            <th className="text-right px-4 py-3 font-black">TOTAL</th>
          </tr>
        </thead>
        <tbody>
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
            <span>VAT:</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-black bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 rounded-lg">
            <span>AMOUNT DUE:</span>
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

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        Thank you for your business. Payment is due within 30 days of invoice date.
      </div>
    </div>
  </div>
);

// Detailed Statement Template
export const DetailedTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-teal-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-2xl font-bold text-gray-900 mb-2">{props.businessInfo.businessName}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
          <div className="text-sm text-gray-600 mt-1">Tel: {props.businessInfo.primaryPhone}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-teal-600 mb-4">TAX INVOICE</div>
          <div className="bg-teal-50 border-2 border-teal-600 p-3 rounded">
            <div className="text-sm"><span className="font-bold">Invoice Number:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-bold">Invoice Date:</span> {new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-bold">Due Date:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-teal-600 p-4 rounded">
        <div className="text-sm font-bold text-teal-600 mb-3">CLIENT INFORMATION</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Name:</span> {props.customerName}</div>
          <div><span className="font-semibold">Address:</span> {props.customerAddress}</div>
          <div><span className="font-semibold">Email:</span> {props.customerEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.customerPhone}</div>
        </div>
      </div>
      <div className="border-2 border-teal-600 p-4 rounded">
        <div className="text-sm font-bold text-teal-600 mb-3">PAYMENT DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Payment Terms:</span> Net 30 Days</div>
          <div><span className="font-semibold">Payment Method:</span> Bank Transfer</div>
          <div><span className="font-semibold">Account Status:</span> <span className="text-green-600 font-semibold">Current</span></div>
          <div><span className="font-semibold">Reference:</span> {props.jobCardNumber}</div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-teal-600 text-white px-4 py-2 font-bold">ITEMIZED STATEMENT</div>
      <table className="w-full">
        <thead>
          <tr className="bg-teal-50 border-b-2 border-teal-600">
            <th className="text-left px-4 py-2 text-sm">Description of Services/Products</th>
            <th className="text-center px-4 py-2 text-sm">Quantity</th>
            <th className="text-right px-4 py-2 text-sm">Unit Price</th>
            <th className="text-right px-4 py-2 text-sm">Line Total</th>
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
      <div className="w-80 border-2 border-teal-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-teal-600 text-white px-4 rounded mt-2">
          <span>AMOUNT DUE:</span>
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

    {/* Footer Note */}
    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for your business. Payment is due within 30 days of invoice date.
    </div>
  </div>
);

// Template Renderer
export const TemplateRenderer = ({ templateId, ...props }) => {
  switch (templateId) {
    case 'default':
      return <DefaultTemplate {...props} />;
    case 'professional':
      return <ProfessionalTemplate {...props} />;
    case 'modern':
      return <ModernTemplate {...props} />;
    case 'corporate':
    case 'premium':
      return <CorporateTemplate {...props} />;
    case 'contemporary':
      return <ContemporaryTemplate {...props} />;
    case 'detailed':
      return <DetailedTemplate {...props} />;
    default:
      return <DefaultTemplate {...props} />;
  }
};

export default TemplateSelector