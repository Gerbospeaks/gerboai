import React, { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import v8logo from "../../assets/img/v8-logo.png";
import SignatureStamp from './SignatureStamp';
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
    classic: 'Classic Towing',
    modern: 'Modern Roadside',
    elegant: 'Professional Recovery',
    premium: 'Premium Towing Service',
    speed: 'Emergency Response',
    diagnostic: 'Recovery Specialist'
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

// Default Template (Original - Updated for Towing)
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
  merchant_code,
  vehicleMileage,
  items,
  subtotal,
  vat,
  total,
  documentType = 'invoice',
  showStamp = false,
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = true,
  towLocation,
  destination,
  towDistance,
  towType,
  vehicleCondition,
  incidentType
}) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    {/* Header Section */}
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded"></div>
            ) : businessInfo.logoUrl ? (
             <img src={businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            ) : (
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center"></div>
            )}
           
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
          <div className="text-3xl font-bold mb-4">
            {documentType === 'quote' ? 'TOWING QUOTE' : 'SERVICE INVOICE'}
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
              <span className="font-semibold">CUSTOMER ID</span>
              <span>{merchant_code}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">SERVICE TYPE</span>
              <span>TOWING</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Three Column Section */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">
          {documentType === 'quote' ? 'QUOTE TO' : 'INVOICE TO'}
        </div>
        <div className="text-xs space-y-1">
          <div>{customerName}</div>
          <div></div>
          <div className="h-16 overflow-hidden text-xs leading-tight">{customerAddress}</div>
          <div>{customerEmail}</div>
          <div>{customerPhone}</div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">BILL TO</div>
        <div className="text-xs space-y-1">
          <div>{billName}</div>
          <div></div>
          <div className="h-16 overflow-hidden text-xs leading-tight">{billAddress}</div>
          <div>{billEmail}</div>
          <div>{billPhone}</div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">VEHICLE DETAILS</div>
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
            <span className="font-semibold">Year:</span>
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
        </div>
      </div>
    </div>

    {/* Towing Details Section - NEW */}
    <div className="bg-orange-50 border-2 border-orange-400 p-3 mb-4">
      <div className="font-bold text-xs mb-2 text-orange-800 bg-orange-200 px-2 py-1">TOWING DETAILS</div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="font-semibold text-orange-800 mb-1">Pickup Location:</div>
          <div className="text-xs leading-tight">{towLocation || 'N/A'}</div>
        </div>
        <div>
          <div className="font-semibold text-orange-800 mb-1">Destination:</div>
          <div className="text-xs leading-tight">{destination || 'N/A'}</div>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-orange-800">Distance:</span>
          <span>{towDistance || 'N/A'} km</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-orange-800">Tow Type:</span>
          <span>{towType || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-orange-800">Vehicle Condition:</span>
          <span>{vehicleCondition || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-orange-800">Incident Type:</span>
          <span>{incidentType || 'N/A'}</span>
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left px-2 py-1 font-bold">SERVICE DESCRIPTION</th>
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
    <div className="bg-red-50 border border-red-200 p-3 mb-4">
      <div className="text-red-600 font-bold text-xs mb-2">BANKING DETAILS</div>
      <div className="text-xs space-y-1">
        <div><span className="font-semibold">Bank Name:</span> {businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {businessInfo.accountNumber || '63149991431'}</div>
        <div><span className="font-semibold">Branch Code:</span> {businessInfo.branchCode || '250655'}</div>
      </div>
    </div>

    {/* Signatures and Stamp */}
    <div className="grid grid-cols-3 gap-4 mb-6 text-xs">
      <div>
        <div className="font-semibold mb-1">DRIVER SIGNATURE</div>
        <div className="border-b border-black h-8"></div>
      </div>
      <div>
        <div className="font-semibold mb-1">CLIENT SIGNATURE</div>
        <div className="border-b border-black h-8"></div>
      </div>
      <div>
        <div className="font-semibold mb-1">CONTACT NUMBER:</div>
        <div className="border-b border-black h-8"></div>
      </div>
    </div>

    {showStamp && (
      <div className="flex justify-end mb-4">
        <SignatureStamp 
          text={stampText}
          color={stampColor}
          showDate={showStampDate}
          rotation={-5}
          size="small"
        />
      </div>
    )}

    {/* Footer Note */}
    <div className="text-center text-xs text-red-600 italic">
      {documentType === 'quote' 
        ? 'This quote is valid for 30 days. All services are insured and compliant with industry standards.'
        : 'NB: Professional towing service with full insurance coverage. Vehicle safety is our priority.'
      }
    </div>
  </div>
);

// Classic Template (Updated for Towing)
export const ClassicTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {props.businessInfo.logoUrl && (
              <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            )}
          </div>
          <div className="text-xs leading-relaxed">
            <div>{props.businessInfo.addressLine1}</div>
            <div>{props.businessInfo.city}, {props.businessInfo.postalCode}</div>
            <div>T: {props.businessInfo.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4">
            {props.documentType === 'quote' ? 'TOWING QUOTE' : 'SERVICE INVOICE'}
          </div>
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
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">CUSTOMER</div>
        <div className="text-xs space-y-1">
          <div>{props.customerName}</div>
          <div>{props.customerAddress}</div>
          <div>{props.customerEmail}</div>
          <div>{props.customerPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">BILL TO</div>
        <div className="text-xs space-y-1">
          <div>{props.billName}</div>
          <div>{props.billAddress}</div>
          <div>{props.billEmail}</div>
          <div>{props.billPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">VEHICLE</div>
        <div className="text-xs space-y-1">
          <div>{props.vehicleYear} {props.vehicleMake} {props.vehicleModel}</div>
          <div>Reg: {props.vehicleReg}</div>
          <div>VIN: {props.vehicleVin}</div>
          <div>Mileage: {props.vehicleMileage} km</div>
        </div>
      </div>
    </div>

    {/* Towing Details Section */}
    <div className="bg-blue-50 border-2 border-blue-300 p-3 mb-4">
      <div className="font-bold text-xs mb-2 text-blue-800">TOWING INFORMATION</div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="font-semibold">From:</span> {props.towLocation || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">To:</span> {props.destination || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">Distance:</span> {props.towDistance || 'N/A'} km
        </div>
        <div>
          <span className="font-semibold">Type:</span> {props.towType || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">Condition:</span> {props.vehicleCondition || 'N/A'}
        </div>
        <div>
          <span className="font-semibold">Incident:</span> {props.incidentType || 'N/A'}
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
            <td className="text-right px-2 py-2">R {item.rate.toFixed(2)}</td>
            <td className="text-right px-2 py-2">R {item.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
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

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded mt-6">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '63149991431'}</div>
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
      {props.documentType === 'quote' 
        ? 'This quote is valid for 30 days. All services are insured and compliant with industry standards.'
        : 'Thank you for your business. Professional towing service with full insurance coverage.'
      }
    </div>
  </div>
);

// Modern Template (Roadside Service Theme)
export const ModernTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
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
          <div className="text-5xl font-bold text-blue-500 mb-4">
            {props.documentType === 'quote' ? 'QUOTE' : 'INVOICE'}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="text-sm">
              <span className="font-semibold">{props.documentType === 'quote' ? 'Quote' : 'Invoice'} #:</span> {props.jobCardNumber}
            </div>
            <div className="text-sm"><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-500 mb-3">
          {props.documentType === 'quote' ? 'QUOTE FOR' : 'BILL TO'}
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
        <div className="text-sm font-bold text-blue-700 mb-3">VEHICLE & TOWING DETAILS</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-semibold">Make:</span> {props.vehicleMake}</div>
          <div><span className="font-semibold">Model:</span> {props.vehicleModel}</div>
          <div><span className="font-semibold">Year:</span> {props.vehicleYear}</div>
          <div><span className="font-semibold">Reg:</span> {props.vehicleReg}</div>
          <div className="col-span-2"><span className="font-semibold">Mileage:</span> {props.vehicleMileage} km</div>
          
          <div className="col-span-2 border-t border-blue-200 mt-2 pt-2">
            <div className="font-bold text-blue-700 mb-1">Towing Information</div>
          </div>
          <div className="col-span-2"><span className="font-semibold">From:</span> {props.towLocation || 'N/A'}</div>
          <div className="col-span-2"><span className="font-semibold">To:</span> {props.destination || 'N/A'}</div>
          <div><span className="font-semibold">Distance:</span> {props.towDistance || 'N/A'} km</div>
          <div><span className="font-semibold">Type:</span> {props.towType || 'N/A'}</div>
          <div className="col-span-2"><span className="font-semibold">Incident:</span> {props.incidentType || 'N/A'}</div>
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
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-white px-4 rounded-lg">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded mt-6">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '63149991431'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
      </div>
    </div>

    <div className="mt-8 flex justify-between items-center">
      <div className="text-sm text-gray-500">
        <p className="font-semibold">Terms:</p>
        <p>Payment due within 30 days</p>
      </div>
      
      {props.showStamp && (
        <SignatureStamp 
          text={props.stampText}
          color={props.stampColor}
          showDate={props.showStampDate}
          rotation={-5}
          size="medium"
        />
      )}
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3 mt-4">
      {props.documentType === 'quote' 
        ? 'This quote is valid for 30 days. All services are insured and compliant with industry standards.'
        : 'Thank you for your business. Professional towing service with full insurance coverage.'
      }
    </div>
  </div>
);

// Elegant/Premium Recovery Template
export const ElegantTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-4 border-purple-900 p-8">
      <div className="text-center border-b-2 border-purple-900 pb-6 mb-6">
        {props.businessInfo.logoUrl && (
         <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3 mx-auto" />
        )}
        
        <div className="text-sm text-gray-600">{props.businessInfo.addressLine1} • {props.businessInfo.city}</div>
        <div className="text-2xl font-serif text-purple-700 mt-4">
          {props.documentType === 'quote' ? 'RECOVERY QUOTE' : 'SERVICE INVOICE'}
        </div>
        <div className="text-sm text-gray-500 mt-1">#{props.jobCardNumber}</div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">
            {props.documentType === 'quote' ? 'QUOTE FOR' : 'BILLED TO'}
          </div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.customerName}</div>
            <div>{props.customerAddress}</div>
            <div>{props.customerEmail}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">BILL TO</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.billName}</div>
            <div>{props.billAddress}</div>
            <div>{props.billEmail}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">VEHICLE</div>
          <div className="text-sm space-y-1">
            <div>{props.vehicleYear} {props.vehicleMake} {props.vehicleModel}</div>
            <div>Registration: {props.vehicleReg}</div>
            <div>Mileage: {props.vehicleMileage} km</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">RECOVERY DETAILS</div>
          <div className="text-sm space-y-1">
            <div><span className="font-semibold">From:</span> {props.towLocation || 'N/A'}</div>
            <div><span className="font-semibold">To:</span> {props.destination || 'N/A'}</div>
            <div><span className="font-semibold">Distance:</span> {props.towDistance || 'N/A'} km</div>
            <div><span className="font-semibold">Type:</span> {props.towType || 'N/A'}</div>
            <div><span className="font-semibold">Incident:</span> {props.incidentType || 'N/A'}</div>
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
          <div className="flex justify-between py-3 font-bold text-lg bg-purple-900 text-white px-4">
            <span>TOTAL:</span>
            <span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-4 mb-4 rounded mt-6">
        <div className="text-purple-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
        <div className="text-xs space-y-1 text-gray-700">
          <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
          <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
          <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '63149991431'}</div>
          <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <p className="font-semibold">Terms:</p>
          <p>Payment due within 30 days</p>
        </div>
        
        {props.showStamp && (
          <SignatureStamp 
            text={props.stampText}
            color={props.stampColor}
            showDate={props.showStampDate}
            rotation={-5}
            size="medium"
          />
        )}
      </div>

      <div className="text-center text-xs text-gray-500 italic border-t pt-3">
        {props.documentType === 'quote' 
          ? 'This quote is valid for 30 days. All services are insured and compliant with industry standards.'
          : 'Thank you for your business. Professional recovery service with full insurance coverage.'
        }
      </div>
    </div>
  </div>
);

// Emergency Response Template (Previously Speed Shop)
export const SpeedTemplate = (props) => (
  <div className="bg-black text-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-orange-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
           <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-3xl font-black text-orange-600 mb-2">{props.businessInfo.businessName}</div>
          <div className="text-sm text-gray-400">{props.businessInfo.addressLine1}</div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-orange-600 mb-4 italic">
            {props.documentType === 'quote' ? 'QUOTE' : 'SERVICE CALL'}
          </div>
          <div className="bg-orange-600 p-4 rounded space-y-1">
            <div className="text-sm font-bold">#{props.jobCardNumber}</div>
            <div className="text-sm">{new Date().toLocaleDateString()}</div>
            <div className="text-xs">24/7 EMERGENCY</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-orange-600 mb-3">CLIENT</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.customerName}</div>
          <div className="text-gray-400">{props.customerAddress}</div>
          <div className="text-gray-400">{props.customerPhone}</div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-orange-600 mb-3">VEHICLE</div>
        <div className="text-sm">
          <div className="font-bold">{props.vehicleYear} {props.vehicleMake} {props.vehicleModel}</div>
          <div className="text-gray-400">Reg: {props.vehicleReg}</div>
          <div className="text-gray-400">Condition: {props.vehicleCondition || 'N/A'}</div>
        </div>
      </div>
      
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-orange-600 mb-3">EMERGENCY DETAILS</div>
        <div className="text-sm">
          <div className="text-gray-400 text-xs space-y-1">
            <div><span className="font-semibold">Type:</span> {props.incidentType || 'N/A'}</div>
            <div><span className="font-semibold">Distance:</span> {props.towDistance || 'N/A'} km</div>
            <div><span className="font-semibold">Service:</span> {props.towType || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>

    {/* Route Details */}
    <div className="bg-gray-900 p-4 rounded mb-6 border-2 border-orange-600">
      <div className="text-sm font-bold text-orange-600 mb-3">ROUTE DETAILS</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs text-gray-400 mb-1">PICKUP LOCATION</div>
          <div className="text-white">{props.towLocation || 'N/A'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">DESTINATION</div>
          <div className="text-white">{props.destination || 'N/A'}</div>
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-orange-600">
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
            <td className="text-right px-4 py-3">R {item.rate.toFixed(2)}</td>
            <td className="text-right px-4 py-3 font-bold">R {item.amount.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end">
      <div className="w-80">
        <div className="flex justify-between py-2 text-gray-400">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 text-gray-400">
          <span>VAT:</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-black bg-orange-600 px-4 rounded">
          <span>TOTAL:</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-gray-900 border border-orange-600 p-4 mb-4 rounded mt-6">
      <div className="text-orange-600 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-400">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '63149991431'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
      </div>
    </div>

    <div className="mt-8 flex justify-between items-center">
      <div className="text-sm text-gray-400">
        <p className="font-semibold text-orange-600">24/7 Emergency Service</p>
        <p>Payment due immediately for emergency calls</p>
      </div>
      
      {props.showStamp && (
        <SignatureStamp 
          text={props.stampText}
          color={props.stampColor}
          showDate={props.showStampDate}
          rotation={-5}
          size="medium"
        />
      )}
    </div>

    <div className="text-center text-xs text-gray-400 italic border-t border-gray-800 pt-3">
      {props.documentType === 'quote' 
        ? 'Emergency quote valid for 24 hours. Fully insured rapid response service.'
        : 'Thank you for choosing our emergency towing service. Fully licensed and insured.'
      }
    </div>
  </div>
);

// Recovery Specialist Template (Previously Diagnostic)
export const DiagnosticTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-blue-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          
          <div className="text-sm text-gray-600">{props.businessInfo.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo.city}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-blue-600 mb-4">
            {props.documentType === 'quote' ? 'RECOVERY QUOTE' : 'SERVICE INVOICE'}
          </div>
          <div className="bg-blue-50 border-2 border-blue-600 p-3 rounded">
            <div className="text-sm">
              <span className="font-bold">{props.documentType === 'quote' ? 'Quote:' : 'Invoice:'}</span> {props.jobCardNumber}
            </div>
            <div className="text-sm"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className="border-2 border-blue-600 p-4 rounded">
        <div className="text-sm font-bold text-blue-600 mb-3">CUSTOMER DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Name:</span> {props.customerName}</div>
          <div><span className="font-semibold">Email:</span> {props.customerEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.customerPhone}</div>
        </div>
      </div>
      
      <div className="border-2 border-blue-600 p-4 rounded">
        <div className="text-sm font-bold text-blue-600 mb-3">VEHICLE DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Vehicle:</span> {props.vehicleYear} {props.vehicleMake} {props.vehicleModel}</div>
          <div><span className="font-semibold">Registration:</span> {props.vehicleReg}</div>
          <div><span className="font-semibold">Odometer:</span> {props.vehicleMileage} km</div>
          <div><span className="font-semibold">Condition:</span> {props.vehicleCondition || 'N/A'}</div>
        </div>
      </div>

      <div className="border-2 border-blue-600 p-4 rounded">
        <div className="text-sm font-bold text-blue-600 mb-3">RECOVERY DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Type:</span> {props.towType || 'N/A'}</div>
          <div><span className="font-semibold">Distance:</span> {props.towDistance || 'N/A'} km</div>
          <div><span className="font-semibold">Incident:</span> {props.incidentType || 'N/A'}</div>
        </div>
      </div>
    </div>

    {/* Route Information */}
    <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded mb-6">
      <div className="text-sm font-bold text-blue-700 mb-3">ROUTE INFORMATION</div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-semibold text-blue-700">Pickup Location:</div>
          <div className="text-gray-700 mt-1">{props.towLocation || 'N/A'}</div>
        </div>
        <div>
          <div className="font-semibold text-blue-700">Destination:</div>
          <div className="text-gray-700 mt-1">{props.destination || 'N/A'}</div>
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-blue-600 text-white px-4 py-2 font-bold">
        {props.documentType === 'quote' ? 'QUOTED SERVICES' : 'SERVICES PROVIDED'}
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-blue-50 border-b-2 border-blue-600">
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
      <div className="w-80 border-2 border-blue-600 p-4 rounded">
        <div className="flex justify-between py-2">
          <span>Subtotal:</span>
          <span>R {props.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>VAT (15%):</span>
          <span>R {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-600 text-white px-4 rounded">
          <span>{props.documentType === 'quote' ? 'QUOTE TOTAL:' : 'TOTAL DUE:'}</span>
          <span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded mt-6">
      <div className="text-blue-800 font-bold text-sm mb-2">PAYMENT INFORMATION</div>
      <div className="text-xs space-y-1 text-gray-700">
        <div><span className="font-semibold">Bank Name:</span> {props.businessInfo.bankName || 'First National Bank'}</div>
        <div><span className="font-semibold">Account Holder:</span> {props.businessInfo.businessName}</div>
        <div><span className="font-semibold">Account Number:</span> {props.businessInfo.accountNumber || '63149991431'}</div>
        <div><span className="font-semibold">Branch Code:</span> {props.businessInfo.branchCode || '250655'}</div>
      </div>
    </div>

    <div className="mt-8 flex justify-between items-center">
      <div className="text-sm text-gray-500">
        <p className="font-semibold">Terms:</p>
        <p>Payment due within 30 days</p>
      </div>
      
      {props.showStamp && (
        <SignatureStamp 
          text={props.stampText}
          color={props.stampColor}
          showDate={props.showStampDate}
          rotation={-5}
          size="medium"
        />
      )}
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      {props.documentType === 'quote' 
        ? 'This quote is valid for 30 days. Professional recovery service with full insurance coverage.'
        : 'Thank you for your business. Specialist vehicle recovery with comprehensive insurance.'
      }
    </div>
  </div>
);

// Template Renderer with Towing Props
export const TemplateRenderer = ({ 
  templateId, 
  documentType = 'invoice',
  stampText = "APPROVED",
  stampColor = "#d32f2f",
  showStampDate = false,
  showStamp = false,
  towLocation,
  destination,
  towDistance,
  towType,
  vehicleCondition,
  incidentType,
  ...props 
}) => {
  const templateProps = { 
    ...props, 
    documentType,
    stampText,
    stampColor,
    showStampDate,
    showStamp,
    towLocation,
    destination,
    towDistance,
    towType,
    vehicleCondition,
    incidentType
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
    case 'speed':
      return <SpeedTemplate {...templateProps} />;
    case 'diagnostic':
      return <DiagnosticTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
};

export default TemplateSelector;