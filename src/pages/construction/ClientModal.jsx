import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Building2, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const ClientModal = ({ showModal, setShowModal, existingClient, onClientSaved }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    clientType: 'Residential',
    clientId: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingClient) {
      setFormData({
        name: existingClient.name || '',
        email: existingClient.email || '',
        phone: existingClient.phone || '',
        address: existingClient.address || '',
        company: existingClient.company || '',
        clientType: existingClient.clientType || 'Residential',
        clientId: existingClient.clientId || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        clientType: 'Residential',
        clientId: `CLI-${Date.now()}`
      });
    }
  }, [existingClient, showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert('User not authenticated');
      return;
    }

    if (!formData.name || !formData.phone) {
      alert('Please enter client name and phone number');
      return;
    }

    setSaving(true);

    try {
      const db = getFirestore();
      const clientData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (existingClient?.id) {
        await updateDoc(doc(db, 'users', user.uid, 'clients', existingClient.id), clientData);
        alert('Client updated successfully!');
      } else {
        clientData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', user.uid, 'clients'), clientData);
        alert('Client added successfully!');
      }

      if (onClientSaved) {
        onClientSaved();
      }
      
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        clientType: 'Residential',
        clientId: ''
      });
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      clientType: 'Residential',
      clientId: ''
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-gray-600 text-gray-800">
          <h2 className="text-xl font-semibold">
            {existingClient ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-800 hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  Client Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Client Type *
                </label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Government">Government</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="ABC Construction Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  Client ID
                </label>
                <input
                  type="text"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="CLI-2026-0001"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="082 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Physical Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="123 Main Street, Pretoria, 0001"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
              <strong>Note:</strong> Fields marked with * are required
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : existingClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;