import React, { useState, useEffect } from "react";
import Templates from "./Templates";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceExtractor from "../AIInvoiceExtractor";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import { getAuth, signOut } from "firebase/auth";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  UtensilsCrossed,
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
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
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

const RestaurantDashboard = () => {
  const db = getFirestore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const { user, authUser } = useAuth();
  const [useAI, setUseAI] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState(null);
  const [activeView, setActiveView] = useState("home");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [menuItems, setMenuItems] = useState([
    {
      id: "1",
      name: "Classic Burger",
      category: "Burgers",
      price: 12.99,
      cost: 5.5,
      description: "Juicy beef patty with lettuce, tomato, and special sauce",
      prepTime: 15,
      calories: 650,
      imageUrl: "",
      available: true,
    },
    {
      id: "2",
      name: "Margherita Pizza",
      category: "Pizza",
      price: 14.99,
      cost: 6.0,
      description: "Fresh mozzarella, basil, and tomato sauce",
      prepTime: 20,
      calories: 800,
      imageUrl: "",
      available: true,
    },
  ]);

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    description: "",
    prepTime: "",
    calories: "",
    imageUrl: "",
    available: true,
  });

  const [orders, setOrders] = useState([
    {
      id: "ord-001",
      customerName: "John Doe",
      itemCount: 3,
      total: 45.5,
      status: "Completed",
      createdAt: new Date(),
    },
    {
      id: "ord-002",
      customerName: "Jane Smith",
      itemCount: 2,
      total: 28.99,
      status: "Preparing",
      createdAt: new Date(),
    },
    {
      id: "ord-003",
      customerName: "Bob Johnson",
      itemCount: 4,
      total: 62.0,
      status: "Pending",
      createdAt: new Date(),
    },
  ]);
  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
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
  const [restaurantInfo, setRestaurantInfo] = useState({
    restaurantName: "MY RESTAURANT",
    address: "123 Food Street",
    city: "City",
    postalCode: "12345",
    phone: "123-456-7890",
    email: "info@restaurant.com",
    logoUrl: "",
    cuisine: "American",
    openingHours: "9:00 AM - 10:00 PM",
  });
  const [showSettings, setShowSettings] = useState(false);

  const [salesData, setSalesData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalMenuItems: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    generateSalesData();
    calculateMetrics();
  }, [menuItems, orders]);

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

  const calculateMetrics = () => {
    const totalMenuItems = menuItems.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    setMetrics({
      totalRevenue,
      totalOrders: orders.length,
      totalMenuItems,
      avgOrderValue,
    });
  };

  const generateSalesData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = days.map((day) => ({
      date: day,
      sales: Math.floor(Math.random() * 8000) + 3000,
      orders: Math.floor(Math.random() * 50) + 20,
    }));
    setSalesData(data);
  };

  const handleAddMenuItem = () => {
    setEditingItem(null);
    setMenuForm({
      name: "",
      category: "",
      price: "",
      cost: "",
      description: "",
      prepTime: "",
      calories: "",
      imageUrl: "",
      available: true,
    });
    setShowMenuModal(true);
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setMenuForm(item);
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = () => {
    if (!menuForm.name || !menuForm.price) {
      alert("Please enter item name and price");
      return;
    }

    const itemData = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      cost: parseFloat(menuForm.cost) || 0,
      prepTime: parseInt(menuForm.prepTime) || 0,
      calories: parseInt(menuForm.calories) || 0,
    };

    if (editingItem) {
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id ? { ...itemData, id: item.id } : item,
        ),
      );
      alert("Menu item updated successfully!");
    } else {
      setMenuItems([...menuItems, { ...itemData, id: Date.now().toString() }]);
      alert("Menu item added successfully!");
    }

    setShowMenuModal(false);
  };

  const handleDeleteMenuItem = (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?"))
      return;

    setMenuItems(menuItems.filter((item) => item.id !== itemId));
    alert("Menu item deleted successfully!");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuForm({ ...menuForm, imageUrl: reader.result });
      alert("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveRestaurantInfo = () => {
    alert("Restaurant information saved successfully!");
    setShowSettings(false);
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
      setRestaurantInfo((prev) => ({ ...prev, uploading: true }));

      // ✅ Upload to Cloudflare R2 (Worker handles userId)
      const logoUrl = await uploadLogoToR2(file, authUser);

      setRestaurantInfo((prev) => ({
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
      setRestaurantInfo((prev) => ({ ...prev, uploading: false }));
    }
  };
  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
  }, [location.state]);
  const handleLogout = () => {
    alert("Logout functionality would be implemented with Firebase Auth");
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-gray-300">
      {/* Sidebar Toggle Button - Works on both mobile and desktop */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-gray-800 rounded-lg shadow-lg hover:bg-slate-700 transition-colors print:hidden"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed z-40 w-64 bg-gray-800 border-r border-gray-200 transition-transform duration-300 h-full print:hidden`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-16 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-gray-800" />
            </div>
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
                onClick={() => setActiveTab("Menu")}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                  activeTab === "Menu"
                    ? "bg-gray-500 text-gray-800"
                    : "text-gray-300 hover:bg-gray-500"
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span>Menu</span>
              </div>

              <div
                onClick={() => setActiveTab("Orders")}
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
                onClick={() => setActiveTab("Customers")}
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
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-gray-800" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">
                {user?.displayName || "Restaurant Owner"}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || "owner@restaurant.com"}
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
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "ml-0 md:ml-16"}`}
      >
        <div className="flex-1 overflow-auto">
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
                {activeTab === "Menu" && (
                  <button
                    onClick={handleAddMenuItem}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-gray-800 rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Menu Item
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

          <div className="p-6">
            {activeTab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      12.5% from last month
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.totalOrders}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      8.2% from last week
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Menu Items</p>
                      <UtensilsCrossed className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.totalMenuItems}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Active items</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${metrics.avgOrderValue.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      5.3% increase
                    </p>
                  </div>
                </div>

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

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Performance Metrics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm text-gray-600 mb-1">Peak Hours</p>
                      <p className="text-2xl font-bold text-gray-900">
                        6:00 PM - 8:00 PM
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Most Popular Item
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        Classic Burger
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Avg Prep Time
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        18 mins
                      </p>
                    </div>
                  </div>
                </div>

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
                            Items
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
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600">
                              {order.customerName || "Guest"}
                            </td>
                            <td className="py-3 px-2 text-sm text-gray-600">
                              {order.itemCount || 0} items
                            </td>
                            <td className="py-3 px-2 text-sm font-medium text-gray-900">
                              ${order.total || 0}
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs text-sm font-medium ${getOrderStatusColor(order.status || "Pending")}`}
                              >
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

            {activeTab === "Menu" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square bg-gray-100 relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UtensilsCrossed className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs text-sm font-medium ${
                                item.available
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 md:p-6">
                          <h3 className="font-semibold text-lg mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.category}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-2xl font-bold text-indigo-600">
                                ${item.price}
                              </div>
                              {item.prepTime > 0 && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.prepTime} min
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMenuItem(item)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-800 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="flex items-center justify-center px-3 py-2 bg-red-600 text-gray-800 rounded-lg hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {menuItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>
                        No menu items yet. Click "Add Menu Item" to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          Items
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
                            #{order.id}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {order.createdAt.toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {order.customerName || "Guest"}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {order.itemCount || 0} items
                          </td>
                          <td className="py-3 px-2 text-sm font-medium text-gray-900">
                            ${order.total || 0}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs text-sm font-medium ${getOrderStatusColor(order.status || "Pending")}`}
                            >
                              {order.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>No orders yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Customers" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Customer Management
                </h2>
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Customer management feature coming soon!</p>
                </div>
              </div>
            )}

            {activeTab === "Analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Weekly Sales Trend
                    </h2>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#3b82f6"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Order Volume
                    </h2>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar
                          dataKey="orders"
                          fill="#8b5cf6"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Performance Metrics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm text-gray-600 mb-1">Peak Hours</p>
                      <p className="text-2xl font-bold text-gray-900">
                        6:00 PM - 8:00 PM
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Most Popular Item
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        Classic Burger
                      </p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Avg Prep Time
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        18 mins
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <button
                onClick={() => setShowMenuModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={menuForm.name}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={menuForm.category}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Pizza"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={menuForm.cost}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, cost: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    value={menuForm.prepTime}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, prepTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={menuForm.calories}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, calories: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your dish..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </label>
                  {menuForm.imageUrl && (
                    <img
                      src={menuForm.imageUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={menuForm.available}
                  onChange={(e) =>
                    setMenuForm({ ...menuForm, available: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <label
                  htmlFor="available"
                  className="text-sm font-medium text-gray-700"
                >
                  Available for ordering
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowMenuModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenuItem}
                className="flex-1 px-4 py-2 bg-indigo-600 text-gray-800 rounded-lg hover:bg-indigo-700"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <BusinessSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default RestaurantDashboard;
