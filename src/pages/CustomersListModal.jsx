import React from 'react';
import { X, Users, Edit, Upload } from 'lucide-react';

const CustomersListModal = ({ 
  showModal, 
  setShowModal, 
  customers, 
  onLoadCustomer, 
  onEditCustomer,
  onAddNewCustomer 
}) => {
  
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Customers
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6">
          {/* Add New Customer Button */}
          <button
            onClick={() => {
              setShowModal(false);
              onAddNewCustomer();
            }}
            className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-orange-700 mb-4 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Add New Customer
          </button>

          {/* Customer List */}
          {customers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No customers yet</p>
              <p className="text-sm">Click the button above to add your first customer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <div 
                  key={customer.id} 
                  className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        📞 {customer.phone}
                      </p>
                      {customer.email && (
                        <p className="text-sm text-gray-600">
                          ✉️ {customer.email}
                        </p>
                      )}
                      {customer.address && (
                        <p className="text-sm text-gray-600">
                          📍 {customer.address}
                        </p>
                      )}
                      {customer.customerId && (
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {customer.customerId}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          onLoadCustomer(customer);
                          setShowModal(false);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4" />
                        Load
                      </button>
                      <button
                        onClick={() => {
                          onEditCustomer(customer);
                          setShowModal(false);
                        }}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersListModal;