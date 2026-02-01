// src/components/admin/InvoicesList.js
import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './InvoicesList.css';

const InvoicesList = ({ invoices, type = 'invoice', onRefresh, onView }) => {
  const {user, authUser} = useAuth();

  const getStatusColor = (status) => {
    const colors = {
      draft: '#6b7280',
      sent: '#3b82f6',
      paid: '#10b981',
      overdue: '#ef4444',
      accepted: '#10b981',
      rejected: '#ef4444',
      expired: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const handleStatusChange = async (invoiceId, newStatus, invoice) => {
    if (!user) return;
    
    // Show confirmation dialog when sending
    if (newStatus === 'sent') {
      const docType = type === 'invoice' ? 'Invoice' : 'Quote';
      const docNumber = invoice.invoiceNumber || invoice.quoteNumber;
      
      const confirmed = window.confirm(
        `Send ${docType} ${docNumber} to ${invoice.clientEmail}?\n\n` +
        `This will:\n` +
        `✓ Mark the ${docType.toLowerCase()} as "Sent"\n` +
        `✓ Send an email to the client\n` +
        `✓ Cannot be undone\n\n` +
        `Continue?`
      );
      
      if (!confirmed) return;
    }
    
    try {
      const collectionName = type === 'invoice' ? 'adminInvoices' : 'adminQuotes';
      
      // Update the status
      await updateDoc(doc(db, 'users', user.uid, collectionName, invoiceId), {
        status: newStatus,
        ...(newStatus === 'sent' && { sentAt: new Date() }),
        ...(newStatus === 'paid' && { paidAt: new Date() })
      });
      
      // Show success message
      if (newStatus === 'sent') {
        alert(
          `✅ ${type === 'invoice' ? 'Invoice' : 'Quote'} marked as sent!\n\n` +
          `An email will be sent to ${invoice.clientEmail} shortly.\n\n` +
          `You can check the status in the Firebase Functions logs.`
        );
      } else if (newStatus === 'paid') {
        alert('✅ Invoice marked as paid!');
      }
      
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error updating status: ' + error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  return (
    <div className="invoices-list">
      <h2>All {type === 'invoice' ? 'Invoices' : 'Quotes'}</h2>

      <div className="invoices-table">
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Date</th>
              <th>{type === 'invoice' ? 'Due Date' : 'Valid Until'}</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Email Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td className="invoice-number">
                  {invoice.invoiceNumber || invoice.quoteNumber}
                </td>
                <td>
                  <div className="client-info">
                    <strong>{invoice.clientName}</strong>
                    <small>{invoice.clientEmail}</small>
                  </div>
                </td>
                <td>{formatDate(invoice.issueDate)}</td>
                <td>{formatDate(invoice.dueDate || invoice.validUntil)}</td>
                <td className="amount">R{invoice.total?.toFixed(2)}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(invoice.status) }}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td>
                  {invoice.emailSentAt ? (
                    <span className="email-sent-badge" title={`Sent on ${formatDate(invoice.emailSentAt)}`}>
                      ✅ Sent
                    </span>
                  ) : invoice.status === 'sent' ? (
                    <span className="email-pending-badge">
                      ⏳ Pending
                    </span>
                  ) : (
                    <span className="email-not-sent-badge">
                      ⚪ Not sent
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-sm btn-view"
                      onClick={() => onView(invoice)}
                    >
                      View
                    </button>
                    {invoice.status === 'draft' && (
                      <button 
                        className="btn-sm btn-send"
                        onClick={() => handleStatusChange(invoice.id, 'sent', invoice)}
                        title="Send email to client"
                      >
                        📧 Send
                      </button>
                    )}
                    {invoice.status === 'sent' && type === 'invoice' && (
                      <button 
                        className="btn-sm btn-paid"
                        onClick={() => handleStatusChange(invoice.id, 'paid', invoice)}
                      >
                        ✓ Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div className="empty-state">
            <p>No {type === 'invoice' ? 'invoices' : 'quotes'} yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesList;