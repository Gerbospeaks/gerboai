import React, { useEffect, useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';

const WaybillStickerModal = ({ 
  isOpen, 
  onClose, 
  waybillData,
  businessInfo 
}) => {
  const barcodeRef = useRef(null);
  const trackingBarcodeRef = useRef(null);

  useEffect(() => {
    if (isOpen && waybillData) {
      // Generate barcode for waybill number
      if (barcodeRef.current && waybillData.waybillNumber) {
        try {
          JsBarcode(barcodeRef.current, waybillData.waybillNumber, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 14,
            margin: 10
          });
        } catch (error) {
          console.error('Error generating waybill barcode:', error);
        }
      }

      // Generate barcode for tracking number
      const trackingNum = waybillData.shipment?.trackingNumber || waybillData.trackingNumber;
      if (trackingBarcodeRef.current && trackingNum) {
        try {
          JsBarcode(trackingBarcodeRef.current, trackingNum, {
            format: "CODE128",
            width: 2,
            height: 50,
            displayValue: true,
            fontSize: 12,
            margin: 5
          });
        } catch (error) {
          console.error('Error generating tracking barcode:', error);
        }
      }
    }
  }, [isOpen, waybillData]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (!isOpen || !waybillData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between print:hidden">
          <h2 className="text-xl font-semibold">Waybill Shipping Label</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-800 rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Print Label
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-gray-800 rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Sticker Content */}
        <div className="overflow-auto p-6 flex justify-center items-center bg-gray-100">
          <div className="bg-white" style={{ width: '100mm', minHeight: '150mm' }}>
            {/* Professional Shipping Label */}
            <div className="border-4 border-black p-4">
              
              {/* Header Section with Logo and Company */}
              <div className="border-b-4 border-black pb-3 mb-3">
                <div className="flex items-center justify-between">
                  {businessInfo?.logoUrl ? (
                    <img 
                      src={businessInfo.logoUrl} 
                      alt="Logo" 
                      className="h-12 object-contain"
                    />
                  ) : (
                    <div className="h-12 flex items-center">
                      <div className="text-2xl font-black">{businessInfo?.businessName || 'LOGISTICS'}</div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs font-semibold">EXPRESS DELIVERY</div>
                    <div className="text-xs">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Waybill Number Barcode */}
              <div className="mb-4 text-center border-2 border-gray-300 p-2">
                <svg ref={barcodeRef}></svg>
              </div>

              {/* FROM Section */}
              <div className="mb-4 border-2 border-black p-3">
                <div className="bg-black text-gray-800 px-2 py-1 font-bold text-sm mb-2">
                  FROM (SHIPPER)
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-base">{waybillData.sender?.name || 'N/A'}</div>
                  <div className="text-sm">{waybillData.sender?.address || 'N/A'}</div>
                  <div className="text-sm flex justify-between">
                    <span>📱 {waybillData.sender?.phone || 'N/A'}</span>
                  </div>
                  <div className="text-xs bg-gray-200 px-2 py-1 mt-1 inline-block font-semibold">
                    ORIGIN: {waybillData.shipment?.origin || 'N/A'}
                  </div>
                </div>
              </div>

              {/* TO Section - More Prominent */}
              <div className="mb-4 border-4 border-black p-3 bg-yellow-50">
                <div className="bg-black text-gray-800 px-2 py-1 font-bold text-sm mb-2">
                  TO (CONSIGNEE) - DELIVER TO:
                </div>
                <div className="space-y-1">
                  <div className="font-black text-lg">{waybillData.receiver?.name || 'N/A'}</div>
                  <div className="text-base font-semibold">{waybillData.receiver?.address || 'N/A'}</div>
                  <div className="text-sm flex justify-between mt-2">
                    <span className="font-bold">📱 {waybillData.receiver?.phone || 'N/A'}</span>
                  </div>
                  <div className="text-sm bg-black text-gray-800 px-3 py-2 mt-2 font-bold text-center">
                    DESTINATION: {waybillData.shipment?.destination || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="mb-4 border-2 border-gray-400 p-3">
                <div className="bg-gray-700 text-gray-800 px-2 py-1 font-bold text-xs mb-2">
                  SHIPMENT DETAILS
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold">Cargo Type:</span>
                    <div className="font-bold">{waybillData.shipment?.cargoType || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Weight:</span>
                    <div className="font-bold">{waybillData.shipment?.weight || 'N/A'} kg</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Dimensions:</span>
                    <div className="font-bold">{waybillData.shipment?.dimensions || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Pieces:</span>
                    <div className="font-bold">{waybillData.items?.length || 0}</div>
                  </div>
                </div>
              </div>

              {/* Tracking Number with Barcode */}
              <div className="border-2 border-black p-2 text-center">
                <div className="text-xs font-bold mb-1">TRACKING NUMBER</div>
                <svg ref={trackingBarcodeRef}></svg>
              </div>

              {/* Service Type Badge */}
              <div className="mt-3 flex justify-between items-center">
                <div className="bg-red-600 text-gray-800 px-3 py-1 font-bold text-xs">
                  URGENT
                </div>
                <div className="bg-blue-600 text-gray-800 px-3 py-1 font-bold text-xs">
                  INSURED
                </div>
                <div className="text-xs">
                  <span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Footer Notice */}
              <div className="mt-3 text-center text-xs border-t-2 border-black pt-2">
                <div className="font-bold">HANDLE WITH CARE</div>
                <div className="text-[10px] mt-1">
                  For assistance call: {businessInfo?.primaryPhone || 'N/A'}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Print Instructions */}
        <div className="p-4 bg-gray-100 border-t text-sm text-gray-300 print:hidden">
          <p className="font-semibold mb-1">📋 Printing Instructions:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Print on adhesive label paper (100mm x 150mm recommended)</li>
            <li>Ensure barcode is clearly visible and scannable</li>
            <li>Attach securely to package in visible location</li>
            <li>Keep package dry and protected during transit</li>
          </ul>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          .bg-white[style*="100mm"] * {
            visibility: visible;
          }
          
          .bg-white[style*="100mm"] {
            position: fixed;
            left: 0;
            top: 0;
            width: 100mm;
            height: 150mm;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          @page {
            size: 100mm 150mm;
            margin: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WaybillStickerModal;