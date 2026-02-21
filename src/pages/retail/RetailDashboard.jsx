import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import Templates from "./Templates";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import logo from "../../assets/img/solidflo.png";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Calendar,
  FileText,
  BarChart3,
  Menu,
  Plus,
  Edit,
  LogOut,
  Trash2,
  Search,
  Upload,
  X,
  AlertCircle,
  Save,
  Eye,
  ShoppingBag,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RetailDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const { user, authUser } = useAuth();
  const [documentType, setDocumentType] = useState("invoice");
  const [useAI, setUseAI] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeView, setActiveView] = useState("home");
  // Products state
  const [products, setProducts] = useState([]);
  const [invoiceId, setInvoiceId] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    description: "",
    imageUrl: "",
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // Store settings
  const [storeInfo, setStoreInfo] = useState({
    storeName: "MY RETAIL STORE",
    address: "123 Business Street",
    city: "City",
    postalCode: "12345",
    phone: "123-456-7890",
    email: "store@example.com",
    logoUrl: "",
  });
  const [showSettings, setShowSettings] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });
  // Analytics state
  const [salesData, setSalesData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    lowStockItems: 0,
  });
  const handleProcessPayment = async () => {
    if (!invoiceId || !user?.uid) {
      alert("Please save the invoice before processing payment");
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, invoiceId),
      );

      if (invoiceDoc.exists()) {
        const invoiceData = invoiceDoc.data();
        setSelectedInvoiceForPayment({
          id: invoiceId,
          ...invoiceData,
        });
        setShowPaymentModal(true);
      } else {
        alert("Invoice not found. Please save the invoice first.");
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice for payment");
    }
  };

  const loadPaymentStatus = async () => {
    if (!user?.uid || !invoiceId) {
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: 0, // ✅ Use 0 as default
        status: "pending",
      });
      return;
    }

    try {
      const collectionName =
        documentType === "estimate" ? "estimates" : "invoices";
      const invoiceDoc = await getDoc(
        doc(db, "users", user.uid, collectionName, invoiceId),
      );

      if (invoiceDoc.exists()) {
        const data = invoiceDoc.data();
        setPaymentStatus({
          totalPaid: data.totals?.paid || 0,
          balanceDue: data.totals?.due || data.totals?.total || 0,
          status: data.status || "pending",
        });
      } else {
        setPaymentStatus({
          totalPaid: 0,
          balanceDue: 0, // ✅ Use 0 since no invoice exists
          status: "pending",
        });
      }
    } catch (error) {
      console.error("Error loading payment status:", error);
      setPaymentStatus({
        totalPaid: 0,
        balanceDue: 0, // ✅ Use 0 on error
        status: "pending",
      });
    }
  };

  const handlePaymentComplete = () => {
    loadPaymentStatus();
    setShowPaymentModal(false);
  };
  useEffect(() => {
    if (user?.uid) {
      loadProducts();
      loadOrders();
      loadStoreInfo();
      generateSalesData();
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadProducts = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "products"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const productsData = [];

      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setProducts(productsData);
      calculateMetrics(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadOrders = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "orders"),
        orderBy("createdAt", "desc"),
        limit(20),
      );
      const querySnapshot = await getDocs(q);
      const ordersData = [];

      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadStoreInfo = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "users", user.uid, "settings", "storeInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStoreInfo(docSnap.data());
      }
    } catch (error) {
      console.error("Error loading store info:", error);
    }
  };

  const calculateMetrics = (productsData) => {
    const totalProducts = productsData.length;
    const lowStockItems = productsData.filter(
      (p) => p.stock <= p.minStock,
    ).length;

    setMetrics({
      totalRevenue: 0, // Calculate from orders
      totalOrders: orders.length,
      totalProducts,
      lowStockItems,
    });
  };

  const generateSalesData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = days.map((day) => ({
      date: day,
      sales: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 30) + 10,
    }));
    setSalesData(data);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      sku: `SKU-${Date.now()}`,
      category: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "5",
      description: "",
      imageUrl: "",
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm(product);
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!user?.uid) return;

    if (!productForm.name || !productForm.price) {
      alert("Please enter product name and price");
      return;
    }

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        cost: parseFloat(productForm.cost) || 0,
        stock: parseInt(productForm.stock) || 0,
        minStock: parseInt(productForm.minStock) || 5,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(
          doc(db, "users", user.uid, "products", editingProduct.id),
          productData,
        );
        alert("Product updated successfully!");
      } else {
        productData.createdAt = serverTimestamp();
        await addDoc(
          collection(db, "users", user.uid, "products"),
          productData,
        );
        alert("Product added successfully!");
      }

      setShowProductModal(false);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "products", productId));
      alert("Product deleted successfully!");
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `users/${user.uid}/products/${Date.now()}_${file.name}`,
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProductForm({ ...productForm, imageUrl: downloadURL });
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  const handleSaveStoreInfo = async () => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "users", user.uid, "settings", "storeInfo");
      await setDoc(docRef, storeInfo);
      alert("Store information saved successfully!");
      setShowSettings(false);
    } catch (error) {
      console.error("Error saving store info:", error);
      alert("Failed to save store information");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid || !authUser) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setStoreInfo((prev) => ({ ...prev, uploading: true }));

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setStoreInfo((prev) => ({
        ...prev,
        logoUrl,
        uploading: false,
      }));

      // Save URL to Firestore
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");

      await setDoc(
        docRef,
        {
          logoUrl,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      alert("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo: " + error.message);
      setStoreInfo((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0)
      return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (product.stock <= product.minStock)
      return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "In Stock", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar Toggle Button - Works on both mobile and desktop */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-50 text-gray-800 rounded-lg shadow-lg hover:bg-slate-700 transition-colors print:hidden"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-40 w-64 bg-gray-50 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center space-x-2 mb-8">
            <img
              src={logo}
              alt="Store Logo"
              className="w-16 h-12 object-contain rounded-lg"
            />
          </div>

          <nav className="space-y-1">
            <div
              onClick={() => {
                setActiveTab("Overview");
                setSidebarOpen(false);
              }}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                activeTab === "Overview"
                  ? "bg-gray-500 text-gray-800"
                  : "text-gray-300 hover:bg-gray-500"
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Overview</span>
            </div>

            <div
              onClick={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-500 rounded-lg cursor-pointer"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>

            <div className="pt-4 space-y-2">
              <div
                onClick={() => {
                  setActiveTab("Products");
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  activeTab === "Products"
                    ? "bg-gray-500 text-gray-800"
                    : "text-gray-300 hover:bg-gray-500"
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Products</span>
              </div>

              <div
                onClick={() => {
                  setActiveTab("Orders");
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  activeTab === "Orders"
                    ? "bg-gray-500 text-gray-800"
                    : "text-gray-300 hover:bg-gray-500"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Orders</span>
              </div>

              <div
                onClick={() => {
                  setActiveTab("Customers");
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  activeTab === "Customers"
                    ? "bg-gray-500 text-gray-800"
                    : "text-gray-300 hover:bg-gray-500"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </div>
              <div
                onClick={() => setActiveView("templates")}
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <FileText className="w-5 h-5" />
                <span>Invoice Templates</span>
              </div>

              <div
                onClick={() => setActiveTab("Analytics")}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  activeTab === "Analytics"
                    ? "bg-gray-500 text-gray-800"
                    : "text-gray-300 hover:bg-gray-500"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700 bg-gray-500">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-gray-800" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                {user?.displayName || "Store Owner"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "owner@store.com"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold">{activeTab}</h1>
              </div>

              <div className="flex items-center gap-3">
                {activeTab === "Products" && (
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-gray-800 rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "Overview" && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <ArrowUpRight className="w-4 h-4" />
                        +12.5%
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">
                      Total Revenue
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">$38,247</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-green-50">
                        <ShoppingCart className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <ArrowUpRight className="w-4 h-4" />
                        +8.2%
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">
                      Total Orders
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.length}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-purple-50">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">
                      Total Products
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.totalProducts}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-orange-50">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">
                      Low Stock Items
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.lowStockItems}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Sales Overview
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Daily Orders
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar
                          dataKey="orders"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Recent Orders
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                            Order ID
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                            Customer
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                            Total
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-gray-100 hover:bg-gray-800"
                          >
                            <td className="py-3 px-2 text-sm font-medium text-gray-900">
                              {order.id}
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600">
                              {order.customerName || "N/A"}
                            </td>
                            <td className="py-3 px-2 text-sm font-medium text-gray-900">
                              ${order.total || 0}
                            </td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-1 rounded-full text-xs text-sm font-medium bg-green-100 text-green-800">
                                {order.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "Products" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <div
                          key={product.id}
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-square bg-gray-100 relative">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs text-sm font-medium ${stockStatus.color}`}
                              >
                                {stockStatus.text}
                              </span>
                            </div>
                          </div>
                          <div className="p-4 md:p-6">
                            <h3 className="font-semibold text-lg mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {product.sku}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="text-2xl font-bold text-indigo-600">
                                  ${product.price}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock: {product.stock}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 text-sm"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="flex items-center justify-center px-3 py-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>
                        No products yet. Click "Add Product" to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "Orders" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  All Orders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Order ID
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Customer
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Total
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 hover:bg-gray-800"
                        >
                          <td className="py-3 px-2 text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {order.createdAt?.toDate?.().toLocaleDateString() ||
                              "N/A"}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {order.customerName || "N/A"}
                          </td>
                          <td className="py-3 px-2 text-sm font-medium text-gray-900">
                            ${order.total || 0}
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-1 rounded-full text-xs text-sm font-medium bg-green-100 text-green-800">
                              {order.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Image
                  </label>
                  <div className="flex items-center gap-4">
                    {productForm.imageUrl ? (
                      <img
                        src={productForm.imageUrl}
                        alt="Product"
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="product-image"
                      />
                      <label
                        htmlFor="product-image"
                        className="inline-block px-4 py-2 bg-gray-500 text-gray-800 rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        Upload Image
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm({ ...productForm, sku: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="SKU-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="Electronics, Clothing, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cost
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.cost}
                      onChange={(e) =>
                        setProductForm({ ...productForm, cost: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minimum Stock
                    </label>
                    <input
                      type="number"
                      value={productForm.minStock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          minStock: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Product description"
                  />
                </div>

                <button
                  onClick={handleSaveProduct}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-gray-800 py-3 rounded-lg hover:bg-indigo-700"
                >
                  <Save className="w-5 h-5" />
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">Store Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Store Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {storeInfo.logoUrl ? (
                      <img
                        src={storeInfo.logoUrl}
                        alt="Store Logo"
                        className="w-24 h-24 object-contain border rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-800">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-block px-4 py-2 bg-gray-500 text-gray-800 rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        Upload Logo
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeInfo.storeName}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, storeName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={storeInfo.address}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={storeInfo.city}
                      onChange={(e) =>
                        setStoreInfo({ ...storeInfo, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={storeInfo.postalCode}
                      onChange={(e) =>
                        setStoreInfo({
                          ...storeInfo,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={storeInfo.phone}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) =>
                      setStoreInfo({ ...storeInfo, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <button
                  onClick={handleSaveStoreInfo}
                  className="w-full bg-indigo-600 text-gray-800 py-3 rounded-lg hover:bg-indigo-700"
                >
                  Save Store Information
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailDashboard;
