import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Phone, MapPin, Hash, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext";
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const CustomerModal = ({ showModal, setShowModal, existingCustomer = null, onCustomerSaved }) => {
  const [customerData, setCustomerData] = useState({
    name: existingCustomer?.name || '',
    email: existingCustomer?.email || '',
    phone: existingCustomer?.phone || '',
    address: existingCustomer?.address || '',
    customerId: existingCustomer?.customerId || ''
  });
  
  const { user, authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update form when existingCustomer changes
  useEffect(() => {
    if (existingCustomer) {
      setCustomerData({
        name: existingCustomer.name || '',
        email: existingCustomer.email || '',
        phone: existingCustomer.phone || '',
        address: existingCustomer.address || '',
        customerId: existingCustomer.customerId || ''
      });
    }
  }, [existingCustomer]);

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

    // Email validation (if provided)
    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (existingCustomer && existingCustomer.id) {
        // Update existing customer
        const customerRef = doc(db, 'users', user.uid, 'clients', existingCustomer.id);
        await updateDoc(customerRef, {
          name: customerData.name.trim(),
          email: customerData.email.trim(),
          phone: customerData.phone.trim(),
          address: customerData.address.trim(),
          customerId: customerData.customerId.trim() || `CUST-${Date.now()}`,
          updatedAt: new Date().toISOString()
        });
        
        console.log('Customer updated successfully');
      } else {
        // Add new customer
        const docRef = await addDoc(collection(db, 'users', user.uid, 'clients'), {
          name: customerData.name.trim(),
          email: customerData.email.trim(),
          phone: customerData.phone.trim(),
          address: customerData.address.trim(),
          customerId: customerData.customerId.trim() || `CUST-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        console.log('Customer added with ID:', docRef.id);
      }

      // Show success state
      setSuccess(true);

      // Callback to parent component
      if (onCustomerSaved) {
        onCustomerSaved();
      }

      // Close modal after brief delay
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1200);

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
    setSuccess(false);
  };

  const handleClose = () => {
    setShowModal(false);
    if (!existingCustomer) {
      resetForm();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {existingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                  {existingCustomer ? 'Update customer information' : 'Create a new customer profile'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="group p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-4 md:p-6 bg-gradient-to-b from-slate-50 to-white flex-1">
          <div className="space-y-4 md:space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-start space-x-3 animate-slideDown">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">Success!</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Customer {existingCustomer ? 'updated' : 'created'} successfully
                  </p>
                </div>
              </div>
            )}

            {/* Customer Name */}
            <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Customer Name <span className="text-red-500">*</span></span>
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
                className="w-full px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base font-medium"
                placeholder="John Smith"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-600" />
                <span>Email Address</span>
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
                className="w-full px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-sm md:text-base"
                placeholder="john.smith@example.com"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                <span>Optional - used for sending invoices</span>
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Phone Number <span className="text-red-500">*</span></span>
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
                className="w-full px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 text-sm md:text-base font-medium"
                placeholder="082 123 4567"
                required
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Address</span>
              </label>
              <textarea
                value={customerData.address}
                onChange={(e) =>
                  setCustomerData({
                    ...customerData,
                    address: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm md:text-base resize-none"
                placeholder="123 Main Street, Sandton, 2090"
                rows="3"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
                <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                <span>Full physical or billing address</span>
              </p>
            </div>

            {/* Customer ID */}
            <div className="bg-white rounded-xl p-4 md:p-5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center space-x-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                <span>Customer ID (Optional)</span>
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
                className="w-full px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm md:text-base font-mono"
                placeholder="CUST-001"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
                <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                <span>Leave blank to auto-generate unique ID</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-4 md:p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-white hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSaveCustomer}
              disabled={loading || success}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{existingCustomer ? 'Update Customer' : 'Save Customer'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add these animations to your global CSS or Tailwind config
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }

  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }

  .animate-shake {
    animation: shake 0.4s ease-out;
  }
`;

export default CustomerModal;