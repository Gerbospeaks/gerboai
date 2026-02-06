import React, { useState, useEffect } from 'react';
import { X, Users, Edit, Upload, Search, UserPlus, Mail, Phone, MapPin, Hash, Filter, SortAsc, SortDesc } from 'lucide-react';

const CustomersListModal = ({ 
  showModal, 
  setShowModal, 
  customers, 
  onLoadCustomer, 
  onEditCustomer,
  onAddNewCustomer 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
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

  // Filter and sort customers
  useEffect(() => {
    let result = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.address?.toLowerCase().includes(searchLower) ||
        customer.customerId?.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'date') {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        comparison = dateB - dateA; // Most recent first by default
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredCustomers(result);
  }, [searchTerm, customers, sortBy, sortOrder]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModal, setShowModal]);

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-xl md:rounded-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Customers
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                  {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'} found
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="group p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-300"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base font-semibold bg-white cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
              
              <button
                onClick={toggleSort}
                className="p-2.5 md:p-3 border-2 border-slate-200 rounded-lg md:rounded-xl hover:bg-slate-50 transition-all duration-300 group"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                ) : (
                  <SortDesc className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto p-4 md:p-6 bg-gradient-to-b from-slate-300 to-slate-400 flex-1">
          {/* Add New Customer Button */}
          <button
            onClick={() => {
              setShowModal(false);
              onAddNewCustomer();
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 md:py-3.5 rounded-xl hover:from-emerald-700 hover:to-emerald-800 mb-4 md:mb-6 flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New Customer</span>
          </button>

          {/* Customer List */}
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 md:py-16 px-4">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 md:w-12 md:h-12 text-slate-400" />
              </div>
              <p className="text-lg md:text-xl font-bold text-slate-700 mb-2">
                {searchTerm ? 'No customers found' : 'No customers yet'}
              </p>
              <p className="text-sm md:text-base text-slate-500">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Click the button above to add your first customer'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredCustomers.map((customer, index) => (
                <div 
                  key={customer.id} 
                  className="bg-white border-2 border-slate-100 p-4 md:p-5 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 group animate-slideIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Customer Name */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                          <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base md:text-lg text-slate-900 truncate">
                            {customer.name}
                          </h3>
                          {customer.customerId && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Hash className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                              <p className="text-xs font-mono text-indigo-600 truncate">
                                {customer.customerId}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="space-y-2">
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-start gap-2 text-sm text-slate-700">
                            <MapPin className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex sm:flex-col gap-2 sm:ml-4">
                      <button
                        onClick={() => {
                          onLoadCustomer(customer);
                          setShowModal(false);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 rounded-lg hover:from-blue-600 hover:to-blue-700 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Load</span>
                      </button>
                      <button
                        onClick={() => {
                          onEditCustomer(customer);
                          setShowModal(false);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-2 border-purple-200 rounded-lg hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-purple-600 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Stats */}
        {filteredCustomers.length > 0 && (
          <div className="p-4 md:p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold">{filteredCustomers.length} Customers</span>
                </div>
                {searchTerm && (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Filtered results</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowModal(false)}
                className="px-4 md:px-6 py-2 md:py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg md:rounded-xl hover:bg-white hover:border-slate-400 transition-all duration-300 font-semibold shadow-sm hover:shadow-md active:scale-95 text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        )}
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

  @keyframes slideIn {
    from {
      transform: translateX(-10px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out forwards;
    opacity: 0;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export default CustomersListModal;