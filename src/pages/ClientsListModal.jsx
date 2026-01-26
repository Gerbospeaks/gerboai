import React, { useState } from 'react';
import { X, Search, Edit, User, Phone, Mail, Building2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const ClientsListModal = ({ showModal, setShowModal, clients, onLoadClient, onEditClient, onAddNewClient }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const handleClose = () => {
    setShowModal(false);
    setSearchTerm('');
    setFilterType('All');
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (!user?.uid) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', user.uid, 'clients', clientId));
      alert('Client deleted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || client.clientType === filterType;
    
    return matchesSearch && matchesType;
  });

  const clientTypes = ['All', 'Residential', 'Commercial', 'Industrial', 'Government'];

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-slate-600 text-white">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Clients ({clients.length})</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-300 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={onAddNewClient}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Client
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {clientTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-gray-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-auto p-4 flex-1">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm || filterType !== 'All' ? 'No clients found' : 'No clients yet'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchTerm || filterType !== 'All'
                  ? 'Try adjusting your search or filter'
                  : 'Start by adding your first client'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          client.clientType === 'Commercial' ? 'bg-blue-100 text-blue-700' :
                          client.clientType === 'Residential' ? 'bg-green-100 text-green-700' :
                          client.clientType === 'Industrial' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {client.clientType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {client.company && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{client.company}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
                        <span className="text-xs line-clamp-2">{client.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        onLoadClient(client);
                        handleClose();
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      Use Client
                    </button>
                    <button
                      onClick={() => onEditClient(client)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {client.clientId && (
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      ID: {client.clientId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-300 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientsListModal;