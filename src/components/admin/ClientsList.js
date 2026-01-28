// src/components/admin/ClientsList.js
import React, { useState } from 'react';
import './ClientsList.css';

const ClientsList = ({ clients, onCreateInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (client.name?.toLowerCase().includes(searchLower)) ||
      (client.email?.toLowerCase().includes(searchLower)) ||
      (client.company?.toLowerCase().includes(searchLower))
    );
  });

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'name') {
      return (a.name || a.email).localeCompare(b.name || b.email);
    } else if (sortBy === 'email') {
      return a.email.localeCompare(b.email);
    } else if (sortBy === 'createdAt') {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA; // Newest first
    }
    return 0;
  });

  return (
    <div className="clients-list">
      <div className="clients-header">
        <h2>Your SaaS Clients</h2>
        <div className="clients-controls">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
          </select>
        </div>
      </div>
      
      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Email</th>
              <th>Company</th>
              <th>Dashboard</th>
              <th>Member Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.map(client => (
              <tr key={client.id}>
                <td>
                  <div className="client-name-cell">
                    <div className="client-avatar">
                      {(client.name || client.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{client.name || 'No Name'}</strong>
                      {client.dashboardId && (
                        <span className="client-plan-badge">
                          {client.dashboardId}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${client.email}`} className="email-link">
                    {client.email}
                  </a>
                </td>
                <td>{client.company || '-'}</td>
                <td>
                  <span className={`dashboard-badge ${client.dashboardId || 'none'}`}>
                    {client.dashboardId || 'Not Set'}
                  </span>
                </td>
                <td>{formatDate(client.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-invoice"
                      onClick={() => onCreateInvoice(client.id)}
                      title="Create Invoice"
                    >
                      📄 Invoice
                    </button>
                    <button 
                      className="btn-action btn-view"
                      title="View History"
                    >
                      👁️ View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedClients.length === 0 && (
          <div className="empty-state">
            {searchTerm ? (
              <p>No clients found matching "{searchTerm}"</p>
            ) : (
              <p>No clients yet</p>
            )}
          </div>
        )}
      </div>

      <div className="clients-summary">
        Showing {sortedClients.length} of {clients.length} clients
      </div>
    </div>
  );
};

export default ClientsList;