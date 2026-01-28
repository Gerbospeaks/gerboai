// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ClientsList from '../components/admin/ClientsList';
import CreateInvoice from '../components/admin/CreateInvoice';
import InvoicesList from '../components/admin/InvoicesList';
import InvoicePreview from '../components/admin/InvoicePreview';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load all users as clients (excluding admin)
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.isAdmin !== true); // Exclude admin users
      
      setClients(allUsers);

      // Load invoices from admin's subcollection
      const invoicesQuery = query(
        collection(db, 'users', user.uid, 'adminInvoices'),
        orderBy('createdAt', 'desc')
      );
      const invoicesSnapshot = await getDocs(invoicesQuery);
      setInvoices(invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load quotes from admin's subcollection
      const quotesQuery = query(
        collection(db, 'users', user.uid, 'adminQuotes'),
        orderBy('createdAt', 'desc')
      );
      const quotesSnapshot = await getDocs(quotesQuery);
      setQuotes(quotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    }
    setLoading(false);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('preview');
  };

  if (!user) {
    return <div className="loading">Loading user data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>SolidFlo Admin Portal</h1>
        <p>Manage your client invoices and quotes</p>
      </header>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'clients' ? 'active' : ''}
          onClick={() => setActiveTab('clients')}
        >
          Clients ({clients.length})
        </button>
        <button 
          className={activeTab === 'invoices' ? 'active' : ''}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices ({invoices.length})
        </button>
        <button 
          className={activeTab === 'quotes' ? 'active' : ''}
          onClick={() => setActiveTab('quotes')}
        >
          Quotes ({quotes.length})
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          + Create New
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'clients' && (
              <ClientsList 
                clients={clients} 
                onCreateInvoice={(clientId) => setActiveTab('create')}
              />
            )}
            
            {activeTab === 'invoices' && (
              <InvoicesList 
                invoices={invoices} 
                onRefresh={loadData}
                onView={handleViewInvoice}
              />
            )}
            
            {activeTab === 'quotes' && (
              <InvoicesList 
                invoices={quotes} 
                type="quote"
                onRefresh={loadData}
                onView={handleViewInvoice}
              />
            )}
            
            {activeTab === 'create' && (
              <CreateInvoice 
                clients={clients}
                adminUserId={user.uid}
                onSuccess={() => {
                  loadData();
                  setActiveTab('invoices');
                }}
              />
            )}

            {activeTab === 'preview' && selectedInvoice && (
              <InvoicePreview 
                invoice={selectedInvoice}
                onBack={() => setActiveTab('invoices')}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;