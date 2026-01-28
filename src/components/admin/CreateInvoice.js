// src/components/admin/CreateInvoice.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import './CreateInvoice.css';

const CreateInvoice = ({ clients, adminUserId, onSuccess }) => {
  const [docType, setDocType] = useState('invoice');
  const [selectedClient, setSelectedClient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, details: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, details: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice || 0));
    }, 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const generateNumber = () => {
    const prefix = docType === 'invoice' ? 'INV' : 'QUO';
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting document creation...');
      console.log('Admin User ID:', adminUserId);
      
      // Validate
      if (!selectedClient) {
        alert('Please select a client');
        setLoading(false);
        return;
      }

      if (!dueDate) {
        alert('Please select a due date');
        setLoading(false);
        return;
      }

      if (!adminUserId) {
        alert('Admin user ID is missing');
        setLoading(false);
        return;
      }

      const client = clients.find(c => c.id === selectedClient);
      
      if (!client) {
        alert('Selected client not found');
        setLoading(false);
        return;
      }

      console.log('Client found:', client);

      const { subtotal, tax, total } = calculateTotals();
      
      const itemsWithAmounts = items.map(item => ({
        description: item.description || '',
        details: item.details || '',
        quantity: parseFloat(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0,
        amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      }));

      console.log('Items prepared:', itemsWithAmounts);

      const docNumber = generateNumber();
      
      // Path to admin's subcollection
      const collectionName = docType === 'invoice' ? 'adminInvoices' : 'adminQuotes';
      const collectionPath = collection(db, 'users', adminUserId, collectionName);

      console.log('Collection path:', `users/${adminUserId}/${collectionName}`);

      const docData = {
        [docType === 'invoice' ? 'invoiceNumber' : 'quoteNumber']: docNumber,
        clientId: selectedClient,
        clientName: client.name || client.email || 'Unknown Client',
        clientEmail: client.email || '',
        clientCompany: client.company || '',
        issueDate: serverTimestamp(),
        [docType === 'invoice' ? 'dueDate' : 'validUntil']: new Date(dueDate),
        items: itemsWithAmounts,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: 'draft',
        notes: notes || '',
        createdAt: serverTimestamp()
      };

      console.log('Document data to save:', docData);

      const docRef = await addDoc(collectionPath, docData);
      
      console.log('Document created with ID:', docRef.id);

      alert(`${docType === 'invoice' ? 'Invoice' : 'Quote'} created successfully!`);
      onSuccess();
      
    } catch (error) {
      console.error('Error creating document:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please check your Firestore security rules.');
      } else if (error.code === 'not-found') {
        alert('Collection not found. Please check your database setup.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
    
    setLoading(false);
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="create-invoice">
      <h2>Create New {docType === 'invoice' ? 'Invoice' : 'Quote'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Document Type</label>
            <select 
              value={docType} 
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="invoice">Invoice</option>
              <option value="quote">Quote</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select Client *</label>
            <select 
              value={selectedClient} 
              onChange={(e) => setSelectedClient(e.target.value)}
              required
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name || client.email} {client.company ? `- ${client.company}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{docType === 'invoice' ? 'Due Date' : 'Valid Until'} *</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="line-items">
          <h3>Line Items</h3>
          
          {items.map((item, index) => (
            <div key={index} className="line-item-group">
              <div className="line-item">
                <input
                  type="text"
                  placeholder="Description (e.g., SolidFlo Pro Plan - January)"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  required
                />
                <span className="item-amount">
                  R{(item.quantity * item.unitPrice).toFixed(2)}
                </span>
                {items.length > 1 && (
                  <button 
                    type="button" 
                    className="btn-remove"
                    onClick={() => removeItem(index)}
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Additional details (optional)"
                value={item.details}
                onChange={(e) => updateItem(index, 'details', e.target.value)}
                className="item-details-input"
              />
            </div>
          ))}
          
          <button type="button" className="btn-add-item" onClick={addItem}>
            + Add Line Item
          </button>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes or payment terms..."
            rows="3"
          />
        </div>

        <div className="totals-summary">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Tax (15%):</span>
            <span>R{tax.toFixed(2)}</span>
          </div>
          <div className="total-row total">
            <span>Total:</span>
            <span>R{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : `Create ${docType === 'invoice' ? 'Invoice' : 'Quote'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;