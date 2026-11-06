// src/components/admin/InvoicePreview.js
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './InvoicePreview.css';

const InvoicePreview = ({ invoice, onBack }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `${invoice.invoiceNumber || invoice.quoteNumber}`,
  });

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isQuote = !!invoice.quoteNumber;

  return (
    <div className="invoice-preview-container">
      <div className="preview-actions">
        <button onClick={onBack} className="btn-back">← Back</button>
        <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
      </div>

      <div ref={componentRef} className="invoice-document">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-info">
            <div className="logo-section">
              <img src="/sovereign/solidflo.png" alt="GerboAI Logo" />
            </div>
            <div className="company-details">
              <h1>GerboAI</h1>
              <p>
                58 Minuet Crescent<br />
                Olivienhoutbosch<br />
                South Africa
              </p>
              <p style={{ marginTop: '12px' }}>
                <strong>Email:</strong> accounts@gerboai.com<br />
                <strong>Phone:</strong> +27 68 488 7039
              </p>
            </div>
          </div>

          <div className="invoice-meta">
            <h2>{isQuote ? 'QUOTE' : 'INVOICE'}</h2>
            <div className="meta-detail">
              <span className="meta-label">Date:</span>
              <span className="meta-value">{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="meta-detail">
              <span className="meta-label">{isQuote ? 'Quote No.:' : 'Invoice No.:'}</span>
              <span className="meta-value">{invoice.invoiceNumber || invoice.quoteNumber}</span>
            </div>
            {!isQuote && (
              <div className="meta-detail">
                <span className="meta-label">Due Date:</span>
                <span className="meta-value">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
            {isQuote && (
              <div className="meta-detail">
                <span className="meta-label">Valid Until:</span>
                <span className="meta-value">{formatDate(invoice.validUntil)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="invoice-content">
          {/* Billing Section */}
          <div className="billing-section">
            <div className="billing-card">
              <h3>{isQuote ? 'QUOTE TO' : 'BILL TO'}</h3>
              <p><strong>{invoice.clientName}</strong></p>
              <p>{invoice.clientEmail}</p>
            </div>

            <div className="billing-card">
              <h3>SHIP TO</h3>
              <p><strong>{invoice.clientName}</strong></p>
              <p>{invoice.clientEmail}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="item-description">{item.description}</div>
                      {item.details && (
                        <div className="item-details">{item.details}</div>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    <td>R{item.unitPrice.toFixed(2)}</td>
                    <td>R{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="note-box">
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Totals */}
          <div className="totals-section">
            <div className="totals-card">
              <div className="totals-row">
                <span className="totals-label">Subtotal</span>
                <span className="totals-value">R{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">VAT (15%)</span>
                <span className="totals-value">R{invoice.tax.toFixed(2)}</span>
              </div>
              <div className="totals-row total">
                <span className="totals-label">TOTAL</span>
                <span className="totals-value">R{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bank-section">
            <h3>Banking Details</h3>
            <div className="bank-grid">
              <div className="bank-item">
                <div className="bank-label">Bank Name</div>
                <div className="bank-value">ACCESS BANK</div>
              </div>
              <div className="bank-item">
                <div className="bank-label">Account Name</div>
                <div className="bank-value">Sovereign Designs</div>
              </div>
              <div className="bank-item">
                <div className="bank-label">Branch Code</div>
                <div className="bank-value">410506</div>
              </div>
              <div className="bank-item">
                <div className="bank-label">Account Number</div>
                <div className="bank-value">51559563935</div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="terms-section">
            <h4>Terms & Conditions</h4>
            <p>
              {isQuote
                ? 'This quotation remains valid for 28 days from date of quotation. All prices quoted are exclusive of VAT unless otherwise stated. Prices and product availability are subject to change after the validity period. Orders must be confirmed in writing to proceed.'
                : 'Payment is due within 30 days of invoice date. Late payments may incur additional charges. Please reference the invoice number when making payment.'}
            </p>
          </div>

          {/* Signature */}
          <div className="signature-section">
            <div className="signature-label">Authorized Signature</div>
            <div className="signature-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;