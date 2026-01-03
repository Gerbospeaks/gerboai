import React, { useState } from 'react';
import { Save, X, User } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import { db } from '../firebase'; // Adjust import path as needed
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const CustomerModal = ({ showModal, setShowModal, existingCustomer = null, onCustomerSaved }) => {
  const [customerData, setCustomerData] = useState({
    name: existingCustomer?.name || '',
    email: existingCustomer?.email || '',
    phone: existingCustomer?.phone || '',
    address: existingCustomer?.address || '',
    customerId: existingCustomer?.customerId || ''
  });
   const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSaveCustomer = async () => {
    // Validation
    if (!customerData.name.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!customerData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (existingCustomer && existingCustomer.id) {
        // Update existing customer
        const customerRef = doc(db, 'users', user.uid, 'clients', existingCustomer.id);
        await updateDoc(customerRef, {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          customerId: customerData.customerId,
          updatedAt: new Date().toISOString()
        });
        
        console.log('Customer updated successfully');
      } else {
        // Add new customer
        const docRef = await addDoc(collection(db, 'users', user.uid, 'clients'), {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          customerId: customerData.customerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        console.log('Customer added with ID:', docRef.id);
      }

      // Callback to parent component
      if (onCustomerSaved) {
        onCustomerSaved();
      }

      // Close modal and reset form
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving customer:', err);
      setError('Failed to save customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerData({
      name: '',
      email: '',
      phone: '',
      address: '',
      customerId: ''
    });
    setError('');
  };

  const handleClose = () => {
    setShowModal(false);
    if (!existingCustomer) {
      resetForm();
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="w-6 h-6" />
            {existingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6">
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    email: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="john.doe@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    phone: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="082 514 4509"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Address
              </label>
              <textarea
                value={customerData.address}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    address: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="123 Main Street, Sandton, 2090"
                rows="3"
              />
            </div>

            {/* Customer ID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Customer ID (Optional)
              </label>
              <input
                type="text"
                value={customerData.customerId}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    customerId: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="CUST-001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to auto-generate
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveCustomer}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : existingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;