import React, { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";


export const DefaultPOTemplate = ({
  businessInfo = {},
  loading,
  poNumber,
  poDate,
  deliveryDate,
  supplierName,
  supplierContact,
  supplierEmail,
  supplierPhone,
  supplierAddress,
  deliveryName,
  deliveryAddress,
  items = [],
  subtotal = 0,
  vat = 0,
  total = 0,
  notes,
  paymentTerms,
  shippingMethod,
}) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    {/* Header */}
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {loading ? (
              <div className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
            ) : businessInfo.logoUrl ? (
              <img src={businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
            ) : (
              <div className="w-12 h-12 bg-white rounded" />
            )}
          </div>
          <div className="text-xs leading-relaxed">
            <div className="font-bold text-sm">{businessInfo.businessName}</div>
            <div>{businessInfo.addressLine1}</div>
            <div>{businessInfo.addressLine2}</div>
            <div>{businessInfo.city} {businessInfo.postalCode}</div>
            <div className="mt-1">T: {businessInfo.primaryPhone}{businessInfo.secondaryPhone && `, ${businessInfo.secondaryPhone}`}</div>
            <div>{businessInfo.email}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold mb-4">PURCHASE ORDER</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8">
              <span className="font-semibold">P.O. NUMBER</span>
              <span>{poNumber}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DATE</span>
              <span>{poDate || new Date().toLocaleDateString("en-ZA")}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">DELIVERY DATE</span>
              <span>{deliveryDate || "TBD"}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="font-semibold">PAYMENT TERMS</span>
              <span>{paymentTerms || "30 Days"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Supplier / Delivery */}
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">SUPPLIER / VENDOR</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{supplierName}</div>
          <div>{supplierContact}</div>
          <div className="h-14 overflow-hidden text-xs leading-tight">{supplierAddress}</div>
          <div>{supplierEmail}</div>
          <div>{supplierPhone}</div>
        </div>
      </div>

      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">SHIP / DELIVER TO</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{deliveryName || businessInfo.businessName}</div>
          <div className="h-14 overflow-hidden text-xs leading-tight">{deliveryAddress || businessInfo.addressLine1}</div>
          {shippingMethod && <div><span className="font-semibold">Method:</span> {shippingMethod}</div>}
        </div>
      </div>
    </div>

    {/* Items Table */}
    <div className="mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left px-2 py-1 font-bold">ITEM DESCRIPTION</th>
            <th className="text-center px-2 py-1 font-bold">QTY</th>
            <th className="text-center px-2 py-1 font-bold">UNIT</th>
            <th className="text-right px-2 py-1 font-bold">UNIT PRICE</th>
            <th className="text-right px-2 py-1 font-bold">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-2 py-2">{item.description}</td>
              <td className="text-center px-2 py-2">{item.qty}</td>
              <td className="text-center px-2 py-2">{item.unit || "ea"}</td>
              <td className="text-right px-2 py-2">R {Number(item.unitPrice).toFixed(2)}</td>
              <td className="text-right px-2 py-2">R {Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="flex justify-end mb-4">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1"><span>Subtotal:</span><span>R {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between py-1"><span>VAT (15%):</span><span>R {vat.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 font-bold bg-gray-50 text-black px-2">
          <span>TOTAL:</span><span>R {total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {/* Notes */}
    {notes && (
      <div className="bg-gray-50 border border-gray-300 p-3 mb-4 text-xs">
        <div className="font-bold mb-1">NOTES / SPECIAL INSTRUCTIONS</div>
        <div>{notes}</div>
      </div>
    )}

    {/* Authorisation */}
    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
      <div>
        <div className="font-semibold mb-1">AUTHORISED BY</div>
        <div className="border-b border-black h-8 mb-1" />
        <div className="text-gray-500">Name &amp; Signature</div>
      </div>
      <div>
        <div className="font-semibold mb-1">DATE</div>
        <div className="border-b border-black h-8 mb-1" />
        <div className="text-gray-500">Date of Authorisation</div>
      </div>
    </div>

    <div className="text-center text-xs text-red-600 italic">
      This Purchase Order constitutes a binding agreement subject to the terms and conditions of {businessInfo.businessName}.
    </div>
  </div>
);

// ─── CLASSIC Template ────────────────────────────────────────────────────────
export const ClassicPOTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-2 border-black pb-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo?.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-xs leading-relaxed">
            <div className="font-bold">{props.businessInfo?.businessName}</div>
            <div>{props.businessInfo?.addressLine1}</div>
            <div>{props.businessInfo?.city}, {props.businessInfo?.postalCode}</div>
            <div>T: {props.businessInfo?.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold mb-4">PURCHASE ORDER</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between gap-8"><span className="font-semibold">P.O. NO.</span><span>{props.poNumber}</span></div>
            <div className="flex justify-between gap-8"><span className="font-semibold">DATE</span><span>{props.poDate || new Date().toLocaleDateString()}</span></div>
            <div className="flex justify-between gap-8"><span className="font-semibold">DELIVERY DATE</span><span>{props.deliveryDate || "TBD"}</span></div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">SUPPLIER</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{props.supplierName}</div>
          <div>{props.supplierContact}</div>
          <div>{props.supplierAddress}</div>
          <div>{props.supplierEmail}</div>
          <div>{props.supplierPhone}</div>
        </div>
      </div>
      <div className="bg-gray-200 p-3">
        <div className="font-bold text-xs mb-2 bg-gray-400 px-2 py-1">DELIVER TO</div>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{props.deliveryName || props.businessInfo?.businessName}</div>
          <div>{props.deliveryAddress || props.businessInfo?.addressLine1}</div>
          {props.shippingMethod && <div>Method: {props.shippingMethod}</div>}
        </div>
      </div>
    </div>

    <table className="w-full text-xs mb-4">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="text-left px-2 py-1 font-bold">Description</th>
          <th className="text-center px-2 py-1 font-bold">Qty</th>
          <th className="text-center px-2 py-1 font-bold">Unit</th>
          <th className="text-right px-2 py-1 font-bold">Unit Price</th>
          <th className="text-right px-2 py-1 font-bold">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b">
            <td className="px-2 py-2">{item.description}</td>
            <td className="text-center px-2 py-2">{item.qty}</td>
            <td className="text-center px-2 py-2">{item.unit || "ea"}</td>
            <td className="text-right px-2 py-2">R {Number(item.unitPrice).toFixed(2)}</td>
            <td className="text-right px-2 py-2">R {Number(item.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-4">
      <div className="w-64 text-xs">
        <div className="flex justify-between py-1"><span>Subtotal:</span><span>R {props.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between py-1"><span>VAT (15%):</span><span>R {props.vat.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 font-bold bg-gray-50 px-2">
          <span>TOTAL:</span><span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {props.notes && (
      <div className="bg-blue-50 border border-blue-200 p-3 mb-4 rounded text-xs">
        <div className="font-bold text-blue-800 mb-1">NOTES</div>
        <div>{props.notes}</div>
      </div>
    )}

    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
      <div>
        <div className="font-semibold mb-1">AUTHORISED SIGNATURE</div>
        <div className="border-b border-black h-8 mb-1" />
        <div className="text-gray-500">Name &amp; Date</div>
      </div>
      <div>
        <div className="font-semibold mb-1">SUPPLIER ACKNOWLEDGEMENT</div>
        <div className="border-b border-black h-8 mb-1" />
        <div className="text-gray-500">Signature &amp; Date</div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3">
      Please reference P.O. #{props.poNumber} on all invoices and correspondence. Payment terms: {props.paymentTerms || "30 days"}.
    </div>
  </div>
);

// ─── MODERN Template ─────────────────────────────────────────────────────────
export const ModernPOTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-blue-500 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo?.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-sm text-gray-600 space-y-1">
            <div className="font-semibold">{props.businessInfo?.businessName}</div>
            <div>{props.businessInfo?.addressLine1}</div>
            <div>{props.businessInfo?.city}, {props.businessInfo?.postalCode}</div>
            <div>{props.businessInfo?.primaryPhone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-blue-500 mb-4">P.O.</div>
          <div className="text-sm text-blue-400 font-semibold -mt-3 mb-4">PURCHASE ORDER</div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
            <div><span className="font-semibold">P.O. #:</span> {props.poNumber}</div>
            <div><span className="font-semibold">Date:</span> {props.poDate || new Date().toLocaleDateString()}</div>
            <div><span className="font-semibold">Expected:</span> {props.deliveryDate || "TBD"}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-gray-500 mb-3">VENDOR / SUPPLIER</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.supplierName}</div>
          <div>{props.supplierContact}</div>
          <div>{props.supplierAddress}</div>
          <div>{props.supplierEmail}</div>
          <div>{props.supplierPhone}</div>
        </div>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm font-bold text-blue-700 mb-3">SHIP TO</div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{props.deliveryName || props.businessInfo?.businessName}</div>
          <div>{props.deliveryAddress || props.businessInfo?.addressLine1}</div>
          {props.shippingMethod && <div><span className="font-semibold">Method:</span> {props.shippingMethod}</div>}
          {props.paymentTerms && <div><span className="font-semibold">Terms:</span> {props.paymentTerms}</div>}
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-blue-500 text-white">
          <th className="text-left px-4 py-3 rounded-l-lg">Description</th>
          <th className="text-center px-4 py-3">Qty</th>
          <th className="text-center px-4 py-3">Unit</th>
          <th className="text-right px-4 py-3">Unit Price</th>
          <th className="text-right px-4 py-3 rounded-r-lg">Amount</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-center px-4 py-3">{item.unit || "ea"}</td>
            <td className="text-right px-4 py-3">R {Number(item.unitPrice).toFixed(2)}</td>
            <td className="text-right px-4 py-3 font-semibold">R {Number(item.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-6">
      <div className="w-80 space-y-2">
        <div className="flex justify-between py-2 text-gray-600"><span>Subtotal:</span><span>R {props.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 text-gray-600"><span>VAT (15%):</span><span>R {props.vat.toFixed(2)}</span></div>
        <div className="flex justify-between py-3 text-xl font-bold bg-blue-500 text-white px-4 rounded-lg">
          <span>TOTAL:</span><span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {props.notes && (
      <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded text-sm">
        <div className="font-bold text-blue-800 mb-1">Notes</div>
        <div className="text-gray-700">{props.notes}</div>
      </div>
    )}

    <div className="mt-6 flex justify-between items-end">
      <div className="text-sm">
        <div className="border-t-2 border-gray-300 w-48 pt-2 mt-10">
          <p className="font-semibold">Authorised Signature</p>
          <p className="text-gray-500 text-xs">{props.businessInfo?.businessName}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500 text-right">
        <p className="font-semibold">Payment Terms: {props.paymentTerms || "30 days"}</p>
        <p>Please quote P.O. # on all invoices</p>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3 mt-4">
      This purchase order is subject to the standard terms and conditions of {props.businessInfo?.businessName}.
    </div>
  </div>
);

// ─── ELEGANT Template ────────────────────────────────────────────────────────
export const ElegantPOTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-4 border-purple-900 p-8">
      <div className="text-center border-b-2 border-purple-900 pb-6 mb-6">
        {props.businessInfo?.logoUrl && (
          <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3 mx-auto" />
        )}
        <div className="font-bold text-lg text-purple-900">{props.businessInfo?.businessName}</div>
        <div className="text-sm text-gray-600">
          {props.businessInfo?.addressLine1} • {props.businessInfo?.city}
        </div>
        <div className="text-2xl font-serif text-purple-700 mt-4">PURCHASE ORDER</div>
        <div className="text-sm text-gray-500 mt-1">#{props.poNumber}</div>
        <div className="flex justify-center gap-8 text-xs text-gray-500 mt-2">
          <span><span className="font-semibold">Date:</span> {props.poDate || new Date().toLocaleDateString()}</span>
          <span><span className="font-semibold">Delivery:</span> {props.deliveryDate || "TBD"}</span>
          <span><span className="font-semibold">Terms:</span> {props.paymentTerms || "30 days"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">VENDOR / SUPPLIER</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.supplierName}</div>
            <div>{props.supplierContact}</div>
            <div>{props.supplierAddress}</div>
            <div>{props.supplierEmail}</div>
            <div>{props.supplierPhone}</div>
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-purple-900 mb-2">SHIP / DELIVER TO</div>
          <div className="text-sm space-y-1">
            <div className="font-semibold">{props.deliveryName || props.businessInfo?.businessName}</div>
            <div>{props.deliveryAddress || props.businessInfo?.addressLine1}</div>
            {props.shippingMethod && <div>Method: {props.shippingMethod}</div>}
          </div>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-purple-900">
            <th className="text-left py-2 font-serif">Item</th>
            <th className="text-center py-2 font-serif">Qty</th>
            <th className="text-center py-2 font-serif">Unit</th>
            <th className="text-right py-2 font-serif">Unit Price</th>
            <th className="text-right py-2 font-serif">Total</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3">{item.description}</td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-center py-3">{item.unit || "ea"}</td>
              <td className="text-right py-3">R {Number(item.unitPrice).toFixed(2)}</td>
              <td className="text-right py-3">R {Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2"><span>Subtotal:</span><span>R {props.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between py-2"><span>VAT:</span><span>R {props.vat.toFixed(2)}</span></div>
          <div className="flex justify-between py-3 font-bold text-lg bg-purple-900 text-white px-4">
            <span>TOTAL:</span><span>R {props.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {props.notes && (
        <div className="bg-purple-50 border border-purple-200 p-3 mb-4 rounded text-sm">
          <div className="font-bold text-purple-800 mb-1">Notes &amp; Instructions</div>
          <div>{props.notes}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-purple-200">
        <div>
          <div className="border-b border-purple-900 h-10 mb-2" />
          <div className="text-xs text-purple-900 font-semibold">Authorised Signatory</div>
          <div className="text-xs text-gray-500">{props.businessInfo?.businessName}</div>
        </div>
        <div>
          <div className="border-b border-purple-900 h-10 mb-2" />
          <div className="text-xs text-purple-900 font-semibold">Supplier Acknowledgement</div>
          <div className="text-xs text-gray-500">Signature &amp; Date</div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 italic border-t pt-3 mt-4">
        Please reference P.O. #{props.poNumber} on all invoices and correspondence.
      </div>
    </div>
  </div>
);

// ─── SPEED SHOP Template ─────────────────────────────────────────────────────
export const SpeedPOTemplate = (props) => (
  <div className="bg-black text-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-red-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo?.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="text-3xl font-black text-red-600 mb-1">{props.businessInfo?.businessName}</div>
          <div className="text-sm text-gray-400">{props.businessInfo?.addressLine1}</div>
          <div className="text-sm text-gray-400">{props.businessInfo?.primaryPhone}</div>
        </div>
        <div className="text-right">
          <div className="text-5xl font-black text-red-600 mb-1 italic">P.O.</div>
          <div className="text-sm text-red-400 font-black tracking-widest mb-3">PURCHASE ORDER</div>
          <div className="bg-red-600 p-4 rounded space-y-1">
            <div className="text-sm font-bold">#{props.poNumber}</div>
            <div className="text-sm">{props.poDate || new Date().toLocaleDateString()}</div>
            <div className="text-xs">Delivery: {props.deliveryDate || "TBD"}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">SUPPLIER</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.supplierName}</div>
          <div className="text-gray-400">{props.supplierContact}</div>
          <div className="text-gray-400">{props.supplierAddress}</div>
          <div className="text-gray-400">{props.supplierEmail}</div>
        </div>
      </div>
      <div className="bg-gray-900 p-4 rounded">
        <div className="text-sm font-bold text-red-600 mb-3">DELIVER TO</div>
        <div className="text-sm space-y-1">
          <div className="font-bold">{props.deliveryName || props.businessInfo?.businessName}</div>
          <div className="text-gray-400">{props.deliveryAddress || props.businessInfo?.addressLine1}</div>
          {props.shippingMethod && <div className="text-gray-400">Method: {props.shippingMethod}</div>}
          {props.paymentTerms && <div className="text-gray-400">Terms: {props.paymentTerms}</div>}
        </div>
      </div>
    </div>

    <table className="w-full mb-6">
      <thead>
        <tr className="bg-red-600">
          <th className="text-left px-4 py-3 font-black">DESCRIPTION</th>
          <th className="text-center px-4 py-3 font-black">QTY</th>
          <th className="text-center px-4 py-3 font-black">UNIT</th>
          <th className="text-right px-4 py-3 font-black">PRICE</th>
          <th className="text-right px-4 py-3 font-black">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, i) => (
          <tr key={i} className="border-b border-gray-800">
            <td className="px-4 py-3">{item.description}</td>
            <td className="text-center px-4 py-3">{item.qty}</td>
            <td className="text-center px-4 py-3">{item.unit || "ea"}</td>
            <td className="text-right px-4 py-3">R {Number(item.unitPrice).toFixed(2)}</td>
            <td className="text-right px-4 py-3 font-bold">R {Number(item.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="flex justify-end mb-4">
      <div className="w-80">
        <div className="flex justify-between py-2 text-gray-400"><span>Subtotal:</span><span>R {props.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 text-gray-400"><span>VAT (15%):</span><span>R {props.vat.toFixed(2)}</span></div>
        <div className="flex justify-between py-3 text-xl font-black bg-red-600 px-4 rounded">
          <span>TOTAL:</span><span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {props.notes && (
      <div className="bg-gray-900 border border-red-600 p-3 mb-4 rounded text-sm">
        <div className="text-red-600 font-bold mb-1">NOTES</div>
        <div className="text-gray-400">{props.notes}</div>
      </div>
    )}

    <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-gray-800">
      <div>
        <div className="border-b border-red-600 h-10 mb-2" />
        <div className="text-xs text-red-600 font-bold">AUTHORISED BY</div>
      </div>
      <div>
        <div className="border-b border-red-600 h-10 mb-2" />
        <div className="text-xs text-red-600 font-bold">SUPPLIER SIGN-OFF</div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t border-gray-800 pt-3 mt-4">
      Quote P.O. #{props.poNumber} on all invoices. Terms: {props.paymentTerms || "30 days"}.
    </div>
  </div>
);

// ─── DIAGNOSTIC Template ─────────────────────────────────────────────────────
export const DiagnosticPOTemplate = (props) => (
  <div className="bg-white" style={{ padding: "5mm 10mm" }}>
    <div className="border-b-4 border-green-600 pb-6 mb-6">
      <div className="flex justify-between items-start">
        <div>
          {props.businessInfo?.logoUrl && (
            <img src={props.businessInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain mb-3" />
          )}
          <div className="font-semibold">{props.businessInfo?.businessName}</div>
          <div className="text-sm text-gray-600">{props.businessInfo?.addressLine1}</div>
          <div className="text-sm text-gray-600">{props.businessInfo?.city}</div>
          <div className="text-sm text-gray-600">{props.businessInfo?.primaryPhone}</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-green-600 mb-4">PURCHASE ORDER</div>
          <div className="bg-green-50 border-2 border-green-600 p-3 rounded">
            <div className="text-sm"><span className="font-bold">P.O.:</span> {props.poNumber}</div>
            <div className="text-sm"><span className="font-bold">Date:</span> {props.poDate || new Date().toLocaleDateString()}</div>
            <div className="text-sm"><span className="font-bold">Delivery:</span> {props.deliveryDate || "TBD"}</div>
            <div className="text-sm"><span className="font-bold">Terms:</span> {props.paymentTerms || "30 days"}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">SUPPLIER DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Supplier:</span> {props.supplierName}</div>
          <div><span className="font-semibold">Contact:</span> {props.supplierContact}</div>
          <div><span className="font-semibold">Email:</span> {props.supplierEmail}</div>
          <div><span className="font-semibold">Phone:</span> {props.supplierPhone}</div>
          <div><span className="font-semibold">Address:</span> {props.supplierAddress}</div>
        </div>
      </div>
      <div className="border-2 border-green-600 p-4 rounded">
        <div className="text-sm font-bold text-green-600 mb-3">DELIVERY DETAILS</div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">Deliver To:</span> {props.deliveryName || props.businessInfo?.businessName}</div>
          <div><span className="font-semibold">Address:</span> {props.deliveryAddress || props.businessInfo?.addressLine1}</div>
          {props.shippingMethod && <div><span className="font-semibold">Method:</span> {props.shippingMethod}</div>}
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="bg-green-600 text-white px-4 py-2 font-bold">ITEMS ORDERED</div>
      <table className="w-full">
        <thead>
          <tr className="bg-green-50 border-b-2 border-green-600">
            <th className="text-left px-4 py-2 text-sm">Description</th>
            <th className="text-center px-4 py-2 text-sm">Qty</th>
            <th className="text-center px-4 py-2 text-sm">Unit</th>
            <th className="text-right px-4 py-2 text-sm">Unit Price</th>
            <th className="text-right px-4 py-2 text-sm">Amount</th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-3">{item.description}</td>
              <td className="text-center px-4 py-3">{item.qty}</td>
              <td className="text-center px-4 py-3">{item.unit || "ea"}</td>
              <td className="text-right px-4 py-3">R {Number(item.unitPrice).toFixed(2)}</td>
              <td className="text-right px-4 py-3 font-semibold">R {Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end mb-6">
      <div className="w-80 border-2 border-green-600 p-4 rounded">
        <div className="flex justify-between py-2"><span>Subtotal:</span><span>R {props.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between py-2"><span>VAT (15%):</span><span>R {props.vat.toFixed(2)}</span></div>
        <div className="flex justify-between py-3 text-xl font-bold bg-green-600 text-white px-4 rounded">
          <span>ORDER TOTAL:</span><span>R {props.total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    {props.notes && (
      <div className="bg-green-50 border border-green-200 p-3 mb-4 rounded text-sm">
        <div className="font-bold text-green-800 mb-1">NOTES / INSTRUCTIONS</div>
        <div>{props.notes}</div>
      </div>
    )}

    <div className="grid grid-cols-2 gap-8 mt-4 pt-4 border-t border-green-200">
      <div>
        <div className="border-b-2 border-green-600 h-10 mb-2" />
        <div className="text-xs text-green-700 font-semibold">Authorised By (Name &amp; Signature)</div>
      </div>
      <div>
        <div className="border-b-2 border-green-600 h-10 mb-2" />
        <div className="text-xs text-green-700 font-semibold">Supplier Acknowledgement</div>
      </div>
    </div>

    <div className="text-center text-xs text-gray-500 italic border-t pt-3 mt-4">
      Please quote P.O. #{props.poNumber} on all delivery notes and invoices. {props.paymentTerms || "30 day"} payment terms apply.
    </div>
  </div>
);

// ─── PO Template Renderer ────────────────────────────────────────────────────
export const POTemplateRenderer = ({ templateId, ...props }) => {
  switch (templateId) {
    case "default":      return <DefaultPOTemplate {...props} />;
    case "classic":      return <ClassicPOTemplate {...props} />;
    case "modern":       return <ModernPOTemplate {...props} />;
    case "elegant":
    case "premium":      return <ElegantPOTemplate {...props} />;
    case "speed":        return <SpeedPOTemplate {...props} />;
    case "diagnostic":   return <DiagnosticPOTemplate {...props} />;
    default:             return <DefaultPOTemplate {...props} />;
  }
};
