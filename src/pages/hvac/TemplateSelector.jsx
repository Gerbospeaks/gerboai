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
    default: 'Default (Original)',
    classic: 'Classic HVAC',
    modern: 'Modern Climate',
    elegant: 'Elegant Comfort',
    premium: 'Premium HVAC Service',
    cooling: 'Cooling Specialist',
    diagnostic: 'Diagnostic Pro'
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
        setPurchasedTemplates(['default', ...(docSnap.data().purchased || ['classic'])]);
      } else {
        setPurchasedTemplates(['default', 'classic']);
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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-300"
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
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-between ${
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

// Default HVAC Template
export const DefaultTemplate = ({ 
  businessInfo, 
  loading,
  jobCardNumber, 
  customerName, 
  customerEmail, 
  customerPhone, 
  customerAddress,
  equipmentType,
  equipmentManufacturer,
  equipmentModel,
  equipmentSerial,
  equipmentId,
  equipmentLocation,
  items,
  subtotal,
  vat,
  total,
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true
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
                {businessInfo?.businessName?.split(" ")[0] || ""}{" "}
                {businessInfo?.businessName?.split(" ")[1] || ""}
              </div>
              <div className="text-sm font-semibold">
                {businessInfo?.businessName?.split(" ").slice(2).join(" ") || ""}
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
          <div className="text-3xl font-bold mb-4">INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">INVOICE NO.</span>
              <span>{jobCardNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">SERVICE TYPE</span>
              <span>HVAC SERVICE</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Three Column Section */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">INVOICE TO</div>
        <div className="text-xs space-y-1">
          <div>{customerName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">BILL TO</div>
        <div className="text-xs space-y-1">
          <div>{customerName}</div>
          <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">SYSTEM DETAILS</div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">Type:</span>
            <span className="text-right text-[10px]">{equipmentType}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Brand:</span>
            <span>{equipmentManufacturer}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Model:</span>
            <span>{equipmentModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Serial No:</span>
            <span className="text-[9px]">{equipmentSerial}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Capacity:</span>
            <span className="text-[9px]">{equipmentId}</span>
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
          <tr className="bg-gray-300">
            <th className="text-left px-2 py-1 font-bold">ITEM DESCRIPTION</th>
            <th className="text-center px-2 py-1 font-bold">QUANTITY</th>
            <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
            <th className="text-right px-2 py-1 font-bold">NET PRICE</th>
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
          <span>VAT:</span>
          <span>R {vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 font-bold bg-gray-800 text-white px-2">
          <span>TOTAL:</span>
          <span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Banking Details */}
    <div className="bg-blue-50 border border-blue-200 p-3 mb-4">
      <div className="text-blue-600 font-bold text-xs mb-2">BANKING DETAILS</div>
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
        <div className="font-semibold mb-1">TECHNICIAN SIGNATURE</div>
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
      NB: All HVAC services include 12 months warranty on parts and labor
    </div>
  </div>
);

// Classic HVAC Template
export const ClassicTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-2 border-blue-600 pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div>
              <div className="text-xl font-bold">{props.businessInfo.businessName}</div>
              <div className="text-xs text-blue-600">Professional HVAC Services</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>T: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4 text-blue-600">SERVICE INVOICE</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">INVOICE NO.</span>
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

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-blue-50 p-3 rounded">
        <div className="font-bold text-xs mb-2 text-blue-600">CUSTOMER INFORMATION</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-blue-50 p-3 rounded">
        <div className="font-bold text-xs mb-2 text-blue-600">HVAC SYSTEM</div>
        <div className="text-xs space-y-1">
          <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
          <div><span className="font-semibold">Brand:</span> {props.equipmentManufacturer} {props.equipmentModel}</div>
          <div><span className="font-semibold">Serial:</span> {props.equipmentSerial}</div>
          <div><span className="font-semibold">Capacity:</span> {props.equipmentId}</div>
          <div><span className="font-semibold">Location:</span> {props.equipmentLocation}</div>
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-blue-600 text-white">
          <th className="text-left px-2 py-2">Description</th>
          <th className="text-center px-2 py-2">Qty</th>
          <th className="text-right px-2 py-2">Unit Price</th>
          <th className="text-right px-2 py-2">Amount</th>
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
        <div className="flex justify-between py-2 font-bold bg-blue-600 text-white px-2 rounded">
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
        <div className="mb-4">
          <SignatureStamp 
            text={props.stampText}
            color={props.stampColor}
            showDate={props.showStampDate}
            rotation={-5}
            size="medium"
          />
        </div>
      </div>
    )}

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Thank you for choosing our HVAC services. We guarantee quality workmanship.
    </div>
  </div>
);

// Modern Climate Template
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-cyan-500 pb-6 mb-6">
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
          <div className="text-5xl font-bold text-cyan-500 mb-4">INVOICE</div>
          <div className="bg-cyan-50 p-4 rounded-lg space-y-2">
            <div className="text-sm"><span className="font-semibold">Invoice #:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-semibold">Service:</span> HVAC</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-300 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-500 mb-3">BILL TO</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-cyan-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-cyan-700 mb-3">SYSTEM INFORMATION</div>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
          <div><span className="font-semibold">Brand:</span> {props.equipmentManufacturer}</div>
          <div><span className="font-semibold">Model:</span> {props.equipmentModel}</div>
          <div><span className="font-semibold">Capacity:</span> {props.equipmentId}</div>
          <div><span className="font-semibold">Location:</span> {props.equipmentLocation}</div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-cyan-500 text-white">
          <th className="text-left px-4 py-3 rounded-l-lg">Description</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-right px-4 py-3">Unit Price</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-300">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
            <td className="text-right px-4 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-cyan-500 text-white px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-cyan-50 border border-cyan-200 p-4 mb-4 rounded mt-6">
      <div className="text-cyan-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode}</div>
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
      Providing comfort through quality HVAC solutions
    </div>
  </div>
);
// Elegant Comfort Template
export const ElegantTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-4 border-indigo-900 p-8">
      <div className="text-center border-b-2 border-indigo-900 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
          <img src={props.businessInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
        )}
        <div className="text-4xl font-serif font-bold text-indigo-900 mb-2">{props.businessInfo.businessName}</div>
        <div className="text-sm text-gray-600">{props.businessInfo.addressLine1} • {props.businessInfo.city}</div>
        <div className="text-sm text-gray-600">Comfort Solutions Since 2020</div>
        <div className="text-2xl font-serif text-indigo-700 mt-4">SERVICE INVOICE</div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-indigo-900 mb-2">BILLED TO</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            <div>{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
            <div>{props.customerPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-indigo-900 mb-2">HVAC SYSTEM</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
            <div><span className="font-semibold">Brand:</span> {props.equipmentManufacturer} {props.equipmentModel}</div>
            <div><span className="font-semibold">Capacity:</span> {props.equipmentId}</div>
            <div><span className="font-semibold">Location:</span> {props.equipmentLocation}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-indigo-900">
            <th className="text-left py-2 font-serif">Service Description</th>
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

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>R {props.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>VAT:</span>
            <span>R {props.vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg bg-indigo-900 text-white px-4">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 p-4 mb-4 rounded mt-6">
        <div className="text-indigo-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
          <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
          <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber}</div>
          <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode}</div>
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
        Excellence in climate control and comfort solutions
      </div>
    </div>
  </div>
);

// Cooling Specialist Template
export const CoolingTemplate = (props) => (
  <div className="bg-gradient-to-b from-blue-50 to-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-blue-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-3xl font-black text-blue-600 mb-2">{props.businessInfo.businessName}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
          <div className="text-sm font-semibold text-blue-600 mt-2">❄️ Cooling & Heating Experts</div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-blue-600 mb-4">INVOICE</div>
          <div className="bg-blue-600 text-white p-4 rounded space-y-1">
            <div className="text-sm font-bold">#{props.jobCardNumber}</div>
            <div className="text-sm">{new Date().toLocaleDateString()}</div>
            <div className="text-xs">HVAC Service</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-white border-2 border-blue-400 p-4 rounded-lg shadow">
        <div className="text-sm font-bold text-blue-600 mb-3">CLIENT INFORMATION</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.customerName}</div>
          <div className="text-gray-600">{props.customerAddress}</div>
          <div className="text-gray-600">{props.customerEmail}</div>
          <div className="text-blue-600 font-semibold">{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-white border-2 border-blue-400 p-4 rounded-lg shadow">
        <div className="text-sm font-bold text-blue-600 mb-3">SYSTEM DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">System:</span> {props.equipmentType}</div>
          <div><span className="font-semibold">Brand:</span> {props.equipmentManufacturer}</div>
          <div><span className="font-semibold">Model:</span> {props.equipmentModel}</div>
          <div><span className="font-semibold">Capacity:</span> {props.equipmentId}</div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <table className="w-full">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="text-left px-4 py-3 font-black">SERVICE DESCRIPTION</th>
            <th className="text-center px-4 py-3 font-black">QTY</th>
            <th className="text-right px-4 py-3 font-black">PRICE</th>
            <th className="text-right px-4 py-3 font-black">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b hover:bg-blue-50">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-bold">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end">
      <div className="w-80 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between py-2 text-gray-600">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-600">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-black bg-blue-600 text-white px-4 rounded">
          <span>TOTAL DUE:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border-2 border-blue-400 p-4 mb-4 rounded-lg mt-6">
      <div className="text-blue-800 font-bold text-sm mb-2">💳 PAYMENT DETAILS</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank:</span> {props.businessInfo.bankName || 'FNB'}</div>
        <div><span className="font-semibold">Account:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Number:</span> {props.businessInfo.accountNumber}</div>
        <div><span className="font-semibold">Branch:</span> {props.businessInfo.branchCode}</div>
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

    <div className="text-center text-xs text-blue-600 font-semibold border-t-2 border-blue-400 pt-3">
      ❄️ Keeping You Cool & Comfortable - 12 Month Warranty on All Services ❄️
    </div>
  </div>
);

// Diagnostic Pro Template
export const DiagnosticTemplate = (props) => (
  <div className="bg-white" style={{ padding: "15mm 20mm" }}>
    <div className="border-b-4 border-green-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-2xl font-bold text-gray-900 mb-2">{props.businessInfo.businessName}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
          <div className="text-sm text-green-600 font-semibold mt-1">Professional HVAC Diagnostics</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-green-600 mb-4">SERVICE INVOICE</div>
          <div className="bg-green-50 border-2 border-green-600 p-3 rounded">
            <div className="text-sm"><span className="font-bold">Invoice:</span> {props.jobCardNumber}</div>
            <div className="text-sm"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-bold">Type:</span> HVAC Service</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">CUSTOMER DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Name:</span> {props.customerName}</div>
          <div><span className="font-semibold">Address:</span> {props.customerAddress}</div>
          <div><span className="font-semibold">Email:</span> {props.customerEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.customerPhone}</div>
        </div>
      </div>
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">SYSTEM DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Type:</span> {props.equipmentType}</div>
          <div><span className="font-semibold">Brand:</span> {props.equipmentManufacturer}</div>
          <div><span className="font-semibold">Model:</span> {props.equipmentModel}</div>
          <div><span className="font-semibold">Serial:</span> {props.equipmentSerial}</div>
          <div><span className="font-semibold">Capacity:</span> {props.equipmentId}</div>
          <div><span className="font-semibold">Location:</span> {props.equipmentLocation}</div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-green-600 text-white px-4 py-2 font-bold">SERVICES PERFORMED</div>
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
              <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-semibold">R {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end">
      <div className="w-80 border-2 border-green-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-green-600 text-white px-4 rounded">
          <span>TOTAL DUE:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-200 p-4 mb-4 rounded mt-6">
      <div className="text-green-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode}</div>
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
      Professional HVAC diagnostics and repair • 12 month warranty on parts & labor
    </div>
  </div>
);

// Template Renderer Component
export const TemplateRenderer = ({ 
  templateId, 
  documentType = 'hvac',
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
    case 'premium':
      return <ElegantTemplate {...templateProps} />;
    case 'cooling':
      return <CoolingTemplate {...templateProps} />;
    case 'diagnostic':
      return <DiagnosticTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
};

export default TemplateSelector;