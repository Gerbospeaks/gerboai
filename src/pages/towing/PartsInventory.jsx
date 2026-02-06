import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Box
} from 'lucide-react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const PartsInventory = ({ user }) => {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: 'Engine',
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0,
    supplier: '',
    location: ''
  });

  const categories = [
    'Engine',
    'Transmission',
    'Brakes',
    'Suspension',
    'Electrical',
    'Body',
    'Fluids',
    'Filters',
    'Tires',
    'Other'
  ];

  useEffect(() => {
    loadParts();
  }, [user]);

  useEffect(() => {
    filterParts();
  }, [searchQuery, parts]);

  const loadParts = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const db = getFirestore();
      const partsRef = collection(db, 'users', user.uid, 'parts');
      const q = query(partsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const partsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setParts(partsData);
      setFilteredParts(partsData);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParts = () => {
    if (!searchQuery.trim()) {
      setFilteredParts(parts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = parts.filter(part =>
      part.name.toLowerCase().includes(query) ||
      part.partNumber.toLowerCase().includes(query) ||
      part.category.toLowerCase().includes(query) ||
      part.supplier?.toLowerCase().includes(query)
    );
    setFilteredParts(filtered);
  };

  const handleAddPart = async () => {
    if (!user?.uid || !formData.name || !formData.partNumber) {
      alert('Please fill in required fields (Part Number and Name)');
      return;
    }

    try {
      const db = getFirestore();
      const partData = {
        ...formData,
        quantity: Number(formData.quantity),
        minQuantity: Number(formData.minQuantity),
        unitPrice: Number(formData.unitPrice),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingPart) {
        await updateDoc(
          doc(db, 'users', user.uid, 'parts', editingPart.id),
          { ...partData, updatedAt: serverTimestamp() }
        );
        alert('Part updated successfully!');
      } else {
        await addDoc(collection(db, 'users', user.uid, 'parts'), partData);
        alert('Part added successfully!');
      }

      resetForm();
      loadParts();
    } catch (error) {
      console.error('Error saving part:', error);
      alert('Failed to save part');
    }
  };

  const handleEditPart = (part) => {
    setEditingPart(part);
    setFormData({
      partNumber: part.partNumber || '',
      name: part.name || '',
      description: part.description || '',
      category: part.category || 'Engine',
      quantity: part.quantity || 0,
      minQuantity: part.minQuantity || 5,
      unitPrice: part.unitPrice || 0,
      supplier: part.supplier || '',
      location: part.location || ''
    });
    setShowAddModal(true);
  };

  const handleDeletePart = async (partId) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'users', user.uid, 'parts', partId));
      alert('Part deleted successfully!');
      loadParts();
    } catch (error) {
      console.error('Error deleting part:', error);
      alert('Failed to delete part');
    }
  };

  const resetForm = () => {
    setFormData({
      partNumber: '',
      name: '',
      description: '',
      category: 'Engine',
      quantity: 0,
      minQuantity: 5,
      unitPrice: 0,
      supplier: '',
      location: ''
    });
    setEditingPart(null);
    setShowAddModal(false);
  };

  const getLowStockParts = () => {
    return parts.filter(part => part.quantity <= part.minQuantity);
  };

  const getTotalInventoryValue = () => {
    return parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
  };

  const getOutOfStockParts = () => {
    return parts.filter(part => part.quantity === 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Parts</div>
              <div className="text-2xl font-semibold">{parts.length}</div>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Low Stock</div>
              <div className="text-2xl font-semibold text-orange-600">
                {getLowStockParts().length}
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Out of Stock</div>
              <div className="text-2xl font-semibold text-red-600">
                {getOutOfStockParts().length}
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Value</div>
              <div className="text-2xl font-semibold text-green-600">
                R{getTotalInventoryValue().toFixed(2)}
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search parts by name, part number, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-800 rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-5 h-5" />
          Add Part
        </button>
      </div>

      {/* Low Stock Alert */}
      {getLowStockParts().length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <div className="font-semibold text-orange-800">Low Stock Alert</div>
              <div className="text-sm text-orange-700 mt-1">
                {getLowStockParts().length} part(s) are running low on stock
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading parts...</div>
        ) : filteredParts.length === 0 ? (
          <div className="p-8 text-center">
            <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">No parts found</div>
            <div className="text-sm text-gray-400">
              {searchQuery ? 'Try adjusting your search' : 'Add your first part to get started'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Part Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-right text-xs text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {part.partNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {part.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {part.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`font-semibold ${
                          part.quantity === 0
                            ? 'text-red-600'
                            : part.quantity <= part.minQuantity
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {part.quantity}
                      </span>
                      <span className="text-gray-400 text-xs ml-1">
                        / {part.minQuantity} min
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      R{part.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {part.supplier || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {part.location || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditPart(part)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePart(part.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingPart ? 'Edit Part' : 'Add New Part'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Part Number *
                  </label>
                  <input
                    type="text"
                    value={formData.partNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, partNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="P-001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Part Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Oil Filter"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Part description..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="ABC Parts Co."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity in Stock
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Minimum Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, minQuantity: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unit Price (R)
                  </label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Shelf A-12"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddPart}
                  className="flex-1 bg-gray-600 text-gray-800 py-3 rounded-lg hover:bg-orange-700"
                >
                  {editingPart ? 'Update Part' : 'Add Part'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsInventory;