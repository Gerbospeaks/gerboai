import React, { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';

const QuoteTemplate = () => {
  const [loading] = useState(false);
  
  const [businessInfo] = useState({
    businessName: "PRECISION ACCOUNTING SERVICES",
    addressLine1: "123 Finance Street",
    addressLine2: "Rosebank",
    city: "Johannesburg",
    postalCode: "2196",
    primaryPhone: "011 789 0123",
    secondaryPhone: "082 456 7890",
    logoUrl: "",
    taxNumber: "VAT-9012345678",
    registrationNumber: "2024/123456/07",
  });

  const [quoteNumber, setQuoteNumber] = useState("QUO-2026-0001");
  const [customerName, setCustomerName] = useState("Acme Corporation");
  const [customerEmail, setCustomerEmail] = useState("accounts@acmecorp.com");
  const [customerPhone, setCustomerPhone] = useState("011 234 5678");
  const [customerAddress, setCustomerAddress] = useState("456 Business Park, Sandton, 2196");
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("This quote is valid for 30 days from the date of issue.");

  const [items, setItems] = useState([
    { type: "Service", description: "Monthly Bookkeeping Services", rate: 5000, qty: 1, amount: 5000 },
    { type: "Consultation", description: "Financial Consultation (2 hours)", rate: 1500, qty: 2, amount: 3000 }
  ]);

  const [newItem, setNewItem] = useState({
    type: "Service",
    description: "",
    rate: "",
    qty: ""
  });

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const handleAddItem = () => {
    if (!newItem.description || !newItem.rate || !newItem.qty) return;

    const rate = Number(newItem.rate);
    const qty = Number(newItem.qty);

    const item = {
      type: newItem.type,
      description: newItem.description,
      rate,
      qty,
      amount: rate * qty
    };

    setItems([...items, item]);
    setNewItem({ type: "Service", description: "", rate: "", qty: "" });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
       

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Edit Form */}
          <div className="space-y-6 print:hidden">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Quote Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Quote Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quote Date</label>
                  <input
                    type="date"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Add Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Add Line Items</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Service">Service</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Product">Product</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Description of service/product"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (R)</label>
                    <input
                      type="number"
                      value={newItem.rate}
                      onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newItem.qty}
                      onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddItem}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {/* Current Items List */}
              {items.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Current Items</h3>
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.type}: {item.description}</div>
                        <div className="text-xs text-gray-600">
                          R{item.rate.toFixed(2)} × {item.qty} = R{item.amount.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Notes & Terms</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes or terms..."
              />
            </div>
          </div>

          {/* Right Side - Quote Preview */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ maxWidth: "210mm" }}>
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
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <Calculator className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-xl font-bold">
                            {businessInfo.businessName}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed">
                        <div>{businessInfo.addressLine1}</div>
                        <div>{businessInfo.addressLine2}</div>
                        <div>
                          {businessInfo.city} {businessInfo.postalCode}
                        </div>
                        <div className="mt-1">
                          T: {businessInfo.primaryPhone}
                          {businessInfo.secondaryPhone &&
                            `, ${businessInfo.secondaryPhone}`}
                        </div>
                        {businessInfo.taxNumber && (
                          <div>VAT: {businessInfo.taxNumber}</div>
                        )}
                        {businessInfo.registrationNumber && (
                          <div>Reg: {businessInfo.registrationNumber}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold mb-4 text-blue-600">QUOTATION</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">QUOTE NO.</span>
                          <span>{quoteNumber}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">DATE</span>
                          <span>{new Date(quoteDate).toLocaleDateString("en-ZA")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span className="font-semibold">VALID UNTIL</span>
                          <span>{validUntil ? new Date(validUntil).toLocaleDateString("en-ZA") : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 border border-blue-200">
                    <div className="font-bold text-xs mb-2 bg-blue-600 text-white px-2 py-1">
                      QUOTE FOR
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
                </div>

                {/* Items Table */}
                <div className="mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="text-left px-2 py-1 font-bold">
                          DESCRIPTION
                        </th>
                        <th className="text-center px-2 py-1 font-bold">
                          QTY
                        </th>
                        <th className="text-right px-2 py-1 font-bold">
                          RATE
                        </th>
                        <th className="text-right px-2 py-1 font-bold">
                          AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-2 py-2">
                            <div className="font-medium">{item.type}</div>
                            <div className="text-gray-600">{item.description}</div>
                          </td>
                          <td className="text-center px-2 py-2">{item.qty}</td>
                          <td className="text-right px-2 py-2">
                            R {item.rate.toFixed(2)}
                          </td>
                          <td className="text-right px-2 py-2">
                            R {item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t pt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (15%):</span>
                    <span>R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 text-blue-600 text-sm">
                    <span>Total Quote Amount:</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes/Terms */}
                {notes && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="text-xs font-medium mb-2 text-blue-600">
                      Notes & Terms
                    </div>
                    <div className="text-xs text-gray-600 whitespace-pre-wrap">
                      {notes}
                    </div>
                  </div>
                )}

                {/* Acceptance Section */}
                <div className="mt-6 pt-4 border-t">
                  <div className="text-xs font-medium mb-3 text-blue-600">
                    Quote Acceptance
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="mb-1 text-gray-600">Client Signature:</div>
                      <div className="border-b border-gray-400 h-8"></div>
                    </div>
                    <div>
                      <div className="mb-1 text-gray-600">Date:</div>
                      <div className="border-b border-gray-400 h-8"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
                  <div>Company Reg: {businessInfo.registrationNumber}</div>
                  <div>VAT Reg: {businessInfo.taxNumber}</div>
                  <div className="text-center mt-3 italic">
                    Thank you for considering our services
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default QuoteTemplate;