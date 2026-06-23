import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import SolidFloAgent from "../../components/SolidFloAgent/SolidFloAgent";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import FinancialOverview from "../FinancialOverview";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import StampOverlay from "../StampOverlay";
import LogisticsSidebar from "./LogisticsSidebar";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from "../AIInvoiceWindow";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { getAuth, signOut } from "firebase/auth";
import FreightMultiStepForm from "./FreightMultiStepForm";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import { getFunctions } from "firebase/functions";
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
import { Printer, Download } from "lucide-react";
import { db } from "../../firebase";
import CustomerModal from "../CustomerModal";
import CustomersListModal from "../CustomersListModal";
import InTransitModal from "./InTransitModal";
import WaybillStickerModal from "./WaybillStickerModal";

// ── New section views ─────────────────────────────────────────────────────────
import FleetView from "./FleetView";
import RoutePlannerView from "./RoutePlannerView";
import WarehouseView from "./WarehouseView";
import AnalyticsView from "./AnalyticsView";
import TrackingView from "./TrackingView";
import ScheduleView from "./ScheduleView";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Save,
  Eye,
  Stamp,
  Sparkles,
  Users,
  Calendar,
  FileText,
  FileBarChart,
  Plus,
  Send,
  LogOut,
  X,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Wallet,
  Truck,
  ClipboardList,
  Package,
  MapPin,
  ArrowRight,
  Navigation,
  Warehouse,
  BarChart3,
  ShoppingBag,
} from "lucide-react";

// ─── Number generator ─────────────────────────────────────────────────────────
const generateWaybillNumber = async (userId) => {
  const db = getFirestore();
  const year = new Date().getFullYear();
  const waybillsRef = collection(db, "users", userId, "waybills");
  const q = query(waybillsRef, orderBy("createdAt", "desc"), limit(1));
  const snapshot = await getDocs(q);
  let lastNumber = 891;
  if (!snapshot.empty) {
    const match = snapshot.docs[0].data().waybillNumber?.match(/(\d+)$/);
    if (match) lastNumber = Number(match[1]);
  }
  return `WB-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
};

const functions = getFunctions();

// ── Placeholder view for sections not yet built ───────────────────────────────
const PlaceholderView = ({ title, icon: Icon, description }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-sm">
      <div className="w-16 h-16 bg-[#fff7ed] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-[#ea580c]" />
      </div>
      <h2 className="text-lg font-bold text-[#1e293b] mb-2">{title}</h2>
      <p className="text-sm text-[#64748b] mb-4">
        {description || "This section is coming soon."}
      </p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fff7ed] text-[#ea580c] text-xs font-semibold rounded-full border border-[#fed7aa]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" />
        Coming soon
      </span>
    </div>
  </div>
);

const LogisticsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputMode, setInputMode] = useState("manual");
  const [documentType, setDocumentType] = useState("invoice");
  const [activeView, setActiveView] = useState("home");
  const { user, authUser } = useAuth();
  const [showAIWindow, setShowAIWindow] = useState(false);
  const [waybillNumber, setWaybillNumber] = useState("");
  const [waybillId, setWaybillId] = useState(null);
  const [aiWindowOpen, setAiWindowOpen] = useState(false);
  const [aiDocType, setAiDocType] = useState("invoice");
  // Lists
  const [savedWaybills, setSavedWaybills] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [waybills, setWaybills] = useState([]);
  const [showWaybillsList, setShowWaybillsList] = useState(false);

  const [showInTransitModal, setShowInTransitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomersListModal, setShowCustomersListModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const [showWaybillSticker, setShowWaybillSticker] = useState(false);
  const [savedWaybillData, setSavedWaybillData] = useState(null);

  // Sidebar accordions
  const [isWaybillsOpen, setIsWaybillsOpen] = useState(false);
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [showStampModal, setShowStampModal] = useState(false);
const [stampConfig, setStampConfig] = useState(null);
  // Misc
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: false,
    enabled: false,
  });

  const [stats, setStats] = useState({
    totalWaybills: 0,
    totalInTransit: 0,
    totalRevenue: 0,
    totalClients: 0,
    pendingPayments: 0,
    loading: true,
  });

  const [paymentStatus, setPaymentStatus] = useState({
    totalPaid: 0,
    balanceDue: 0,
    status: "pending",
  });

  // ── Sender fields ────────────────────────────────────────────────────────
  const [senderName, setSenderName] = useState("John Smith");
  const [customerId, setCustomerId] = useState("CUST-2026-1234");
  const [senderEmail, setSenderEmail] = useState("john.smith@example.com");
  const [senderPhone, setSenderPhone] = useState("082 123 4567");
  const [senderAddress, setSenderAddress] = useState(
    "123 Main Street, Pretoria, 0001",
  );

  // ── Receiver fields ──────────────────────────────────────────────────────
  const [receiverName, setReceiverName] = useState("Jane Doe");
  const [receiverEmail, setReceiverEmail] = useState("jane.doe@example.com");
  const [receiverPhone, setReceiverPhone] = useState("083 987 6543");
  const [receiverAddress, setReceiverAddress] = useState(
    "456 Oak Avenue, Johannesburg, 2000",
  );

  // ── Shipment fields ──────────────────────────────────────────────────────
  const [origin, setOrigin] = useState("Pretoria");
  const [destination, setDestination] = useState("Johannesburg");
  const [cargoType, setCargoType] = useState("General Cargo");
  const [weight, setWeight] = useState("500");
  const [dimensions, setDimensions] = useState("100x80x60 cm");
  const [trackingNumber, setTrackingNumber] = useState("TRK" + Date.now());

  // ── Items ────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Freight",
  });

  // ── Business info ────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "SOLIDFLO LOGISTICS",
    addressLine1: "9-10 CNR THIRD & ARKWRIGHT AVENUE",
    addressLine2: "WYNBERG",
    city: "SANDTON",
    postalCode: "2090",
    primaryPhone: "082 514 4509",
    secondaryPhone: "084 583 9929",
    logoUrl: "",
  });

  const location = useLocation();

  // ── Computed totals ──────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setSidebarOpen(w >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    generateWaybillNumber(user.uid).then(setWaybillNumber);
    loadSavedWaybills();
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      loadCustomers();
      fetchBusinessStats();
    }
  }, [user]);

  useEffect(() => {
    if (!waybillId)
      setPaymentStatus({ totalPaid: 0, balanceDue: total, status: "pending" });
  }, [total, waybillId]);

  // ── Data loaders ──────────────────────────────────────────────────────────
  const fetchBusinessStats = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const waybillsSnap = await getDocs(
        collection(db, "users", user.uid, "waybills"),
      );
      let totalRevenue = 0,
        pendingPayments = 0,
        totalInTransit = 0;
      const waybillsList = [];
      waybillsSnap.forEach((doc) => {
        const d = doc.data();
        totalRevenue += parseFloat(d.totals?.total || 0);
        if (["pending", "unpaid", "partially_paid"].includes(d.status))
          pendingPayments += parseFloat(d.totals?.due || d.totals?.total || 0);
        if (d.status === "in_transit") totalInTransit++;
        waybillsList.push({ id: doc.id, ...d });
      });
      waybillsList.sort(
        (a, b) =>
          new Date(b.dates?.shipmentDate || 0) -
          new Date(a.dates?.shipmentDate || 0),
      );
      setWaybills(waybillsList);

      let clientCount = 0;
      try {
        const cSnap = await getDocs(
          collection(db, "users", user.uid, "clients"),
        );
        clientCount = cSnap.docs.length;
        setSavedCustomers(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (_) {}

      setStats({
        totalWaybills: waybillsSnap.docs.length,
        totalInTransit,
        totalRevenue,
        totalClients: clientCount,
        pendingPayments,
        loading: false,
      });
    } catch (_) {
      setStats((p) => ({ ...p, loading: false }));
    }
  };

  const loadBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) setBusinessInfo(snap.data());
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "clients"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (_) {}
  };

  const loadSavedWaybills = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    const snap = await getDocs(
      query(
        collection(db, "users", user.uid, "waybills"),
        orderBy("createdAt", "desc"),
        limit(50),
      ),
    );
    setSavedWaybills(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // ── Customer handlers ─────────────────────────────────────────────────────
  const handleAddNewCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };
  const handleEditCustomer = (c) => {
    setSelectedCustomer(c);
    setShowCustomerModal(true);
  };
  const handleCustomerSaved = () => loadCustomers();

  const loadCustomer = (c) => {
    setSenderName(c.name || "");
    setSenderEmail(c.email || "");
    setSenderPhone(c.phone || "");
    setSenderAddress(c.address || "");
    setCustomerId(c.customerId || "");
  };

  // ── Waybill loader ────────────────────────────────────────────────────────
  const loadWaybill = (wb) => {
    setWaybillId(wb.id);
    setWaybillNumber(wb.waybillNumber || "");
    setSenderName(wb.sender?.name || "");
    setSenderEmail(wb.sender?.email || "");
    setSenderPhone(wb.sender?.phone || "");
    setSenderAddress(wb.sender?.address || "");
    setCustomerId(wb.sender?.customerId || "");
    setReceiverName(wb.receiver?.name || "");
    setReceiverEmail(wb.receiver?.email || "");
    setReceiverPhone(wb.receiver?.phone || "");
    setReceiverAddress(wb.receiver?.address || "");
    setOrigin(wb.shipment?.origin || "");
    setDestination(wb.shipment?.destination || "");
    setCargoType(wb.shipment?.cargoType || "");
    setWeight(wb.shipment?.weight || "");
    setDimensions(wb.shipment?.dimensions || "");
    setTrackingNumber(wb.shipment?.trackingNumber || "");
    setItems(wb.items || []);
    setPaymentStatus({
      totalPaid: wb.totals?.paid || 0,
      balanceDue: wb.totals?.due || wb.totals?.total || 0,
      status: wb.status || "pending",
    });
    setShowWaybillsList(false);
    setActiveView("invoice");
  };

  // ── In transit handlers ───────────────────────────────────────────────────
  const handleViewWaybillDetails = (wb) => {
    setShowInTransitModal(false);
    loadWaybill(wb);
  };
  const handlePrintWaybillLabel = (wb) => {
    setSavedWaybillData(wb);
    setShowWaybillSticker(true);
  };

  // ── AI extractor ──────────────────────────────────────────────────────────
  const handleAIDataExtracted = (data) => {
    if (data.sender.name) setSenderName(data.sender.name);
    if (data.sender.email) setSenderEmail(data.sender.email);
    if (data.sender.phone) setSenderPhone(data.sender.phone);
    if (data.sender.address) setSenderAddress(data.sender.address);
    if (data.sender.customerId) setCustomerId(data.sender.customerId);
    if (data.receiver.name) setReceiverName(data.receiver.name);
    if (data.receiver.email) setReceiverEmail(data.receiver.email);
    if (data.receiver.phone) setReceiverPhone(data.receiver.phone);
    if (data.receiver.address) setReceiverAddress(data.receiver.address);
    if (data.shipment.origin) setOrigin(data.shipment.origin);
    if (data.shipment.destination) setDestination(data.shipment.destination);
    if (data.shipment.cargoType) setCargoType(data.shipment.cargoType);
    if (data.shipment.weight) setWeight(data.shipment.weight);
    if (data.shipment.dimensions) setDimensions(data.shipment.dimensions);
    if (data.shipment.trackingNumber)
      setTrackingNumber(data.shipment.trackingNumber);
    if (data.items?.length > 0) setItems(data.items);
    alert("✅ Waybill data extracted and populated successfully!");
  };

  // ── Item handler ──────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [
      ...prev,
      {
        description: newItem.description,
        type: newItem.type || "Freight",
        rate,
        qty,
        amount: rate * qty,
      },
    ]);
    setNewItem({ description: "", rate: "", qty: "", type: "Freight" });
  };

  // ── Payload builder ───────────────────────────────────────────────────────
  const buildPayload = (numberToUse) => ({
    waybillNumber: numberToUse,
    locked: true,
    status: "pending",
    documentType,
    dates: { shipmentDate: new Date().toISOString(), deliveredDate: null },
    sender: {
      name: senderName,
      email: senderEmail,
      phone: senderPhone,
      address: senderAddress,
      customerId,
    },
    receiver: {
      name: receiverName,
      email: receiverEmail,
      phone: receiverPhone,
      address: receiverAddress,
    },
    shipment: {
      origin,
      destination,
      cargoType,
      weight,
      dimensions,
      trackingNumber,
    },
    items,
    totals: { subtotal, vat, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSaveWaybill = async () => {
    if (!user?.uid) return;
    const db = getFirestore();
    let numberToUse = waybillNumber;
    if (!waybillId) {
      numberToUse = await generateWaybillNumber(user.uid);
      setWaybillNumber(numberToUse);
    }
    const data = buildPayload(numberToUse);
    if (waybillId) {
      await updateDoc(doc(db, "users", user.uid, "waybills", waybillId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const ref = await addDoc(
        collection(db, "users", user.uid, "waybills"),
        data,
      );
      setWaybillId(ref.id);
    }
    setSavedWaybillData(data);
    alert("Waybill saved and locked");
    loadSavedWaybills();
    fetchBusinessStats();
    setShowWaybillSticker(true);
  };

  // ── Convert to invoice ────────────────────────────────────────────────────
  const handleConvertToInvoice = async () => {
    if (!user?.uid || !waybillId) {
      alert("Please save the waybill first before converting to invoice");
      return;
    }
    if (!window.confirm("Convert this waybill to an invoice?")) return;
    try {
      const db = getFirestore();
      const newInvoiceNumber = await generateWaybillNumber(user.uid);
      const invoiceData = buildPayload(newInvoiceNumber);
      invoiceData.documentType = "invoice";
      invoiceData.convertedFromWaybill = waybillId;
      invoiceData.convertedFromWaybillNumber = waybillNumber;
      invoiceData.convertedAt = serverTimestamp();
      const invoiceRef = await addDoc(
        collection(db, "users", user.uid, "invoices"),
        invoiceData,
      );
      await updateDoc(doc(db, "users", user.uid, "waybills", waybillId), {
        convertedToInvoice: true,
        convertedToInvoiceId: invoiceRef.id,
        convertedToInvoiceNumber: newInvoiceNumber,
        convertedAt: serverTimestamp(),
        status: "converted",
      });
      setDocumentType("invoice");
      setWaybillId(invoiceRef.id);
      setWaybillNumber(newInvoiceNumber);
      alert(`Waybill successfully converted to Invoice ${newInvoiceNumber}`);
      loadSavedWaybills();
    } catch (_) {
      alert("Failed to convert waybill to invoice");
    }
  };

  // ── New waybill ───────────────────────────────────────────────────────────
  const handleNewWaybill = () => {
    setWaybillId(null);
    setWaybillNumber("");
    setSenderName("John Smith");
    setCustomerId("CUST-2026-1234");
    setSenderEmail("john.smith@example.com");
    setSenderPhone("082 123 4567");
    setSenderAddress("123 Main Street, Pretoria, 0001");
    setReceiverName("Jane Doe");
    setReceiverEmail("jane.doe@example.com");
    setReceiverPhone("083 987 6543");
    setReceiverAddress("456 Oak Avenue, Johannesburg, 2000");
    setOrigin("Pretoria");
    setDestination("Johannesburg");
    setCargoType("General Cargo");
    setWeight("500");
    setDimensions("100x80x60 cm");
    setTrackingNumber("TRK" + Date.now());
    setItems([]);
    generateWaybillNumber(user?.uid).then(setWaybillNumber);
  };

  // ── Print / PDF ───────────────────────────────────────────────────────────
  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #print-area,#print-area * { visibility:visible!important; } #print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

  const handlePrint = () => {
    const s = document.createElement("style");
    s.textContent = printStyles;
    document.head.appendChild(s);
    window.print();
    setTimeout(() => document.head.removeChild(s), 1000);
  };

  const handleSavePDF = async () => {
    if (!waybillId) {
      alert("Please save the waybill before exporting PDF");
      return;
    }
    setTimeout(() => window.print(), 300);
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (_) {}
  };

  // ── Header actions (only shown on waybill builder view) ───────────────────
  const headerActions =
    activeView === "invoice"
      ? [
          documentType === "quote" &&
            waybillId && {
              label: "Convert to Invoice",
              icon: FileText,
              onClick: handleConvertToInvoice,
              className:
                "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
            },
          {
            label: "Preview",
            icon: Eye,
            onClick: () => setShowPreview(true),
            className:
              "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
          },
          {
            label: "Print",
            icon: Printer,
            onClick: handlePrint,
            variant: "secondary",
          },
          {
            label: "New",
            icon: Plus,
            onClick: handleNewWaybill,
            className:
              "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
          },
          {
            label: "Send",
            icon: Send,
            className:
              "flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
          },
          {
            label: "Save PDF",
            icon: Download,
            onClick: handleSavePDF,
            className:
              "flex items-center gap-1.5 px-3 py-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
          },
          {
            label: "Save",
            icon: Save,
            onClick: handleSaveWaybill,
            className:
              "flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
          },
        ].filter(Boolean)
      : [];

  const mobileDashboardActions =
    activeView === "invoice"
      ? [
          documentType === "quote" &&
            waybillId && {
              label: "To Invoice",
              icon: FileText,
              onClick: handleConvertToInvoice,
              className:
                "flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
            },
          {
            label: "Save",
            icon: Save,
            onClick: handleSaveWaybill,
            className:
              "flex items-center gap-1.5 px-3 py-2 bg-[#ea580c] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
          },
          {
            label: "Send",
            icon: Send,
            className:
              "flex items-center gap-1.5 px-3 py-2 bg-[#059669] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
          },
          {
            label: "PDF",
            icon: Download,
            onClick: handleSavePDF,
            className:
              "flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
          },
          {
            label: "Print",
            icon: Printer,
            onClick: handlePrint,
            className:
              "flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-[#374151] rounded-md text-xs font-medium active:scale-95 whitespace-nowrap",
          },
        ].filter(Boolean)
      : [];

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatCurrency = (n) =>
    new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(n);

  const statusBadge = (s) =>
    s === "delivered"
      ? "bg-[#dcfce7] text-[#166534]"
      : s === "in_transit"
        ? "bg-[#dbeafe] text-[#1e40af]"
        : s === "partially_paid"
          ? "bg-[#fef3c7] text-[#92400e]"
          : s === "pending"
            ? "bg-[#fff7ed] text-[#c2410c]"
            : "bg-[#fef2f2] text-[#991b1b]";

  // ── Template props ────────────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    businessInfo,
    loading,
    jobCardNumber: waybillNumber,
    trackingNumber,
    senderName,
    senderEmail,
    senderPhone,
    senderAddress,
    receiverName,
    receiverEmail,
    receiverPhone,
    receiverAddress,
    origin,
    destination,
    cargoType,
    weight,
    dimensions,
    items,
    subtotal,
    vat,
    total,
    documentType: "freight",
    serviceType: "FREIGHT",
    stampText: stampSettings.text,
    stampColor: stampSettings.color,
    showStampDate: stampSettings.showDate,
    showStamp: stampSettings.enabled,
    paymentStatus,
    stampConfig,
  };

  // ── Stat card ─────────────────────────────────────────────────────────────
  const StatCard = ({
    title,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    subtitle,
    loading: l,
    trend,
  }) => (
    <div className="bg-white rounded-xl p-4 border border-[#e2e8f0] shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
          >
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-[#64748b] mb-0.5">{title}</p>
        {l ? (
          <div className="h-6 bg-[#f1f5f9] rounded animate-pulse" />
        ) : (
          <>
            <p className="text-lg font-bold text-[#1e293b] truncate">{value}</p>
            {subtitle && (
              <p className="text-xs text-[#94a3b8] mt-0.5">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ── Home view ─────────────────────────────────────────────────────────────
  const HomeViewLocal = () => (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Waybills"
          value={stats.totalWaybills}
          icon={ClipboardList}
          iconBg="bg-[#fff7ed]"
          iconColor="text-[#ea580c]"
          subtitle="All time"
          loading={stats.loading}
          trend={12}
        />
        <StatCard
          title="In Transit"
          value={stats.totalInTransit}
          icon={Truck}
          iconBg="bg-[#eff6ff]"
          iconColor="text-[#2563eb]"
          subtitle="Active shipments"
          loading={stats.loading}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          iconBg="bg-[#f0fdf4]"
          iconColor="text-[#059669]"
          subtitle="Total invoiced"
          loading={stats.loading}
          trend={8}
        />
        <StatCard
          title="Clients"
          value={stats.totalClients}
          icon={Users}
          iconBg="bg-[#f0fdfa]"
          iconColor="text-[#0891b2]"
          subtitle="Active"
          loading={stats.loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#fff7ed] rounded-lg flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-[#ea580c]" />
          </div>
          <div>
            <p className="text-xs text-[#64748b] mb-0.5">Pending Payments</p>
            {stats.loading ? (
              <div className="h-6 bg-[#f1f5f9] rounded animate-pulse w-32" />
            ) : (
              <>
                <p className="text-xl font-bold text-[#ea580c]">
                  {formatCurrency(stats.pendingPayments)}
                </p>
                <p className="text-xs text-[#94a3b8]">Outstanding waybills</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
            Quick Actions
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              {
                label: "New Waybill",
                icon: ClipboardList,
                onClick: () => {
                  handleNewWaybill();
                  setActiveView("invoice");
                },
                bg: "bg-[#fff7ed]",
                hover: "hover:bg-[#ffedd5]",
                border: "border-[#fed7aa]",
                iconBg: "bg-[#ea580c]",
                text: "text-[#c2410c]",
              },
              {
                label: "In Transit",
                icon: Truck,
                onClick: () => setShowInTransitModal(true),
                bg: "bg-[#eff6ff]",
                hover: "hover:bg-[#dbeafe]",
                border: "border-[#bfdbfe]",
                iconBg: "bg-[#2563eb]",
                text: "text-[#1e40af]",
              },
              {
                label: "Clients",
                icon: Users,
                onClick: () => setShowCustomersListModal(true),
                bg: "bg-[#f0fdfa]",
                hover: "hover:bg-[#ccfbf1]",
                border: "border-[#99f6e4]",
                iconBg: "bg-[#0891b2]",
                text: "text-[#0e7490]",
              },
            ].map(
              ({
                label,
                icon: Icon,
                onClick,
                bg,
                hover,
                border,
                iconBg,
                text,
              }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`flex-1 flex items-center justify-between px-3 py-2.5 ${bg} ${hover} border ${border} rounded-lg transition-all group`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 ${iconBg} rounded flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className={`text-xs font-semibold ${text}`}>
                      {label}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-3 h-3 ${text} opacity-60 group-hover:translate-x-0.5 transition-transform`}
                  />
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Additional quick nav for new sections */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">
          Operations
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            {
              label: "Fleet",
              icon: Truck,
              view: "fleet",
              bg: "bg-[#fff7ed]",
              color: "text-[#ea580c]",
            },
            {
              label: "Routes",
              icon: Navigation,
              view: "routes",
              bg: "bg-[#eff6ff]",
              color: "text-[#2563eb]",
            },
            {
              label: "Tracking",
              icon: MapPin,
              view: "tracking",
              bg: "bg-[#f0fdf4]",
              color: "text-[#16a34a]",
            },
            {
              label: "Warehouse",
              icon: Warehouse,
              view: "warehouse",
              bg: "bg-[#faf5ff]",
              color: "text-[#7c3aed]",
            },
            {
              label: "Schedule",
              icon: Calendar,
              view: "schedule",
              bg: "bg-[#fefce8]",
              color: "text-[#ca8a04]",
            },
            {
              label: "Analytics",
              icon: BarChart3,
              view: "analytics",
              bg: "bg-[#f0fdfa]",
              color: "text-[#0891b2]",
            },
          ].map(({ label, icon: Icon, view, bg, color }) => (
            <button
              key={label}
              onClick={() => setActiveView(view)}
              className={`flex flex-col items-center gap-2 p-3 ${bg} rounded-xl hover:opacity-90 transition-all border border-transparent hover:border-[#e2e8f0]`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className={`text-xs font-semibold ${color}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <h3 className="text-sm font-semibold text-[#1e293b]">
            Recent Waybills
          </h3>
          <button
            onClick={() => setShowWaybillsList(true)}
            className="text-xs text-[#ea580c] hover:text-[#c2410c] font-medium"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-[#f1f5f9]">
          {stats.loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-[#f8fafc] animate-pulse m-3 rounded-lg"
              />
            ))
          ) : waybills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 mb-3 bg-[#f1f5f9] rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-[#94a3b8]" />
              </div>
              <p className="text-sm font-medium text-[#374151] mb-1">
                No waybills yet
              </p>
              <p className="text-xs text-[#94a3b8] mb-3">
                Create your first waybill to get started
              </p>
              <button
                onClick={() => {
                  handleNewWaybill();
                  setActiveView("invoice");
                }}
                className="px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Create Waybill
              </button>
            </div>
          ) : (
            waybills.slice(0, 8).map((wb) => (
              <div
                key={wb.id}
                onClick={() => loadWaybill(wb)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-[#1e293b] truncate">
                      {wb.waybillNumber || wb.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${statusBadge(wb.status)}`}
                    >
                      {wb.status === "in_transit"
                        ? "In Transit"
                        : wb.status === "partially_paid"
                          ? "Partial"
                          : wb.status || "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1 truncate">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      {wb.sender?.name || "No sender"}
                    </span>
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <MapPin className="w-3 h-3" />
                      {wb.shipment?.origin || "?"} →{" "}
                      {wb.shipment?.destination || "?"}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="text-sm font-bold text-[#1e293b]">
                    {formatCurrency(wb.totals?.total || 0)}
                  </div>
                  {wb.totals?.due > 0 && wb.totals?.due < wb.totals?.total && (
                    <div className="text-xs text-[#d97706]">
                      Due: {formatCurrency(wb.totals.due)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
 return (
  <div className="h-screen w-full overflow-hidden flex flex-col bg-[#f0f2f5]">
    {/* Print area */}
    <div id="print-area" className="hidden print:block bg-white"
      style={{ position: "relative", width: "210mm", minHeight: "297mm" }}>
      <TemplateRenderer {...templateProps} />
      <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />

    </div>

    {showAIWindow && (
        <AIInvoiceWindow
          user={user}
          businessInfo={businessInfo}
          documentType={documentType}
          onExit={() => setShowAIWindow(false)}
          onNavigateTo={(view) => {
            setAiWindowOpen(false);
            setActiveView(view);
          }}
          industry="logistics"
          TemplateRenderer={TemplateRenderer}
        />
      )}

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LogisticsSidebar
          navigate={() => {}} // pass your router's navigate if using React Router
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          handleNewWaybill={handleNewWaybill} // was () => {}
          handleLogout={handleLogout} // was () => {}
          handleAddNewCustomer={handleAddNewCustomer}
          businessInfo={businessInfo}
          savedWaybills={savedWaybills}
          savedCustomers={savedCustomers}
          showWaybillsList={showWaybillsList}
          setShowWaybillsList={setShowWaybillsList}
          setShowCustomersListModal={setShowCustomersListModal}
          setShowInTransitModal={setShowInTransitModal}
          newRequestCount={0}
        />
        {/* ── Main content ───────────────────────────────────────────────── */}
   <div className={`flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
    sidebarOpen ? "flex-1" : "flex-1 md:ml-0"
  }`}>
          <AppHeader
            actions={headerActions}
            mobileActions={mobileDashboardActions}
            onSettingsOpen={() => setShowSettings(true)}
            dashboardType="mechanics"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            pageTitle="Job Cards"
            plan="pro"
            showConvertButton={
              documentType === "quote" &&
              !!waybillId &&
              activeView === "invoice"
            }
            onConvert={handleConvertToInvoice}
          />
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* ── Modals ─────────────────────────────────────────────────── */}
            {showSettings && (
              <BusinessSettingsModal onClose={() => setShowSettings(false)} />
            )}

            <CustomersListModal
              showModal={showCustomersListModal}
              setShowModal={setShowCustomersListModal}
              customers={customers}
              onLoadCustomer={loadCustomer}
              onEditCustomer={handleEditCustomer}
              onAddNewCustomer={handleAddNewCustomer}
            />
            <CustomerModal
              showModal={showCustomerModal}
              setShowModal={setShowCustomerModal}
              existingCustomer={selectedCustomer}
              onCustomerSaved={handleCustomerSaved}
            />

            <WaybillStickerModal
              isOpen={showWaybillSticker}
              onClose={() => setShowWaybillSticker(false)}
              waybillData={savedWaybillData}
              businessInfo={businessInfo}
            />
            <InTransitModal
              isOpen={showInTransitModal}
              onClose={() => setShowInTransitModal(false)}
              user={user}
              onViewDetails={handleViewWaybillDetails}
              onPrintLabel={handlePrintWaybillLabel}
            />
{showStampModal && (
  <StampSignatureModal
    isOpen={showStampModal}
    onClose={() => setShowStampModal(false)}
    onConfirm={(cfg) => {
      setStampConfig(cfg);
      setShowStampModal(false);
    }}
    previewContent={
      activeView === "purchase-orders"
        ? <POTemplateRenderer  />
        : <TemplateRenderer {...templateProps} />
    }
    businessInfo={businessInfo}
    existingConfig={stampConfig}
  />
)}
            {/* All waybills modal */}
            {showWaybillsList && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-[#e2e8f0]">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
                    <div>
                      <h2 className="text-base font-semibold text-[#1e293b]">
                        All Waybills
                      </h2>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {savedWaybills.length} records
                      </p>
                    </div>
                    <button
                      onClick={() => setShowWaybillsList(false)}
                      className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {savedWaybills.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Truck className="w-10 h-10 text-[#cbd5e1] mb-3" />
                        <p className="text-sm text-[#94a3b8]">
                          No waybills found
                        </p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                            {[
                              "Waybill #",
                              "Sender",
                              "Receiver",
                              "Route",
                              "Total",
                              "Status",
                              "",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {savedWaybills.map((wb) => (
                            <tr
                              key={wb.id}
                              className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
                            >
                              <td
                                className="px-4 py-3 text-sm font-semibold text-[#ea580c] cursor-pointer"
                                onClick={() => {
                                  loadWaybill(wb);
                                  setShowWaybillsList(false);
                                }}
                              >
                                {wb.waybillNumber || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-[#374151]">
                                {wb.sender?.name || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-[#374151]">
                                {wb.receiver?.name || "N/A"}
                              </td>
                              <td className="px-4 py-3 text-sm text-[#374151]">
                                {wb.shipment?.origin || "?"} →{" "}
                                {wb.shipment?.destination || "?"}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-[#1e293b]">
                                {formatCurrency(wb.totals?.total || 0)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(wb.status)}`}
                                >
                                  {wb.status === "in_transit"
                                    ? "In Transit"
                                    : wb.status || "Pending"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => {
                                    setSavedWaybillData(wb);
                                    setShowWaybillSticker(true);
                                  }}
                                  className="text-xs px-2.5 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#374151] rounded-lg transition-colors font-medium"
                                >
                                  Label
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preview modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#0f172a] rounded-lg flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#1e293b]">
                          Waybill Preview
                        </h2>
                        <p className="text-xs text-[#64748b]">
                          {waybillNumber || "Draft"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                      <button
                        onClick={handleSavePDF}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Save PDF
                      </button>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-6">
                    <div
                      className="mx-auto bg-white shadow-xl"
                      style={{ position: "relative", width: "210mm", minHeight: "297mm" }}
                    >
                      <TemplateRenderer {...templateProps} />
                      <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Views ─────────────────────────────────────────────────── */}
            {activeView === "home" && (
              <div className="flex-1 overflow-y-auto p-4">
                <HomeView
                  user={user}
                  onNavigate={(view, docType) => {
                    if (docType) setDocumentType(docType);
                    setActiveView(view);
                  }}
                  onGoToDashboard={() => setActiveView("quote")}
                  onSidebarToggle={() => setSidebarOpen((p) => !p)}
                  sidebarOpen={sidebarOpen}
                />
              </div>
            )}
            {activeView === "templates" && (
              <div className="flex-1 overflow-y-auto p-4">
                <Templates user={user} />
              </div>
            )}
            {activeView === "financial-overview" && (
              <div className="flex-1 overflow-y-auto p-4">
                <FinancialOverview user={user} />
              </div>
            )}
            {activeView === "purchase-orders" && (
              <div className="flex-1 overflow-y-auto p-6">
                <PurchaseOrders user={user} />
              </div>
            )}

            {/* ── New sections ── */}
            {activeView === "fleet" && <FleetView />}
            {activeView === "routes" && <RoutePlannerView />}
            {activeView === "tracking" && <TrackingView />}
            {activeView === "warehouse" && <WarehouseView />}
            {activeView === "analytics" && <AnalyticsView />}
            {activeView === "schedule" && <ScheduleView />}

            {/* ── Placeholder views for future sections ── */}
            {activeView === "invoices" && (
              <PlaceholderView
                title="Invoices"
                icon={Receipt}
                description="Manage, send, and track all invoices. Connect your accounting integration to auto-sync."
              />
            )}
            {activeView === "payments" && (
              <PlaceholderView
                title="Payments"
                icon={CreditCard}
                description="Process payments, view history, and manage overdue accounts."
              />
            )}
            {activeView === "marketplace" && (
              <div className="flex-1 overflow-y-auto p-6">
                <ServiceMarketplaceView
                  user={user}
                  businessInfo={businessInfo}
                />
              </div>
            )}

            {activeView === "incoming-requests" && (
              <div className="flex-1 overflow-y-auto p-6">
                <ServiceRequestsView user={user} businessInfo={businessInfo} />
              </div>
            )}
            {/* ── Waybill builder — split layout ──────────────────────────── */}
            {activeView === "invoice" && (
              <div className="flex-1 overflow-hidden flex min-h-0">
                {/* LEFT: Form panel */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-w-0">
                  <div className="space-y-5">
                    {/* In-transit status banner */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl">
                      <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-sm font-semibold text-[#1e40af]">
                        Shipment Status
                      </span>
                      <span className="text-sm text-[#2563eb]">
                        · Ready to Dispatch
                      </span>
                      {trackingNumber && (
                        <span className="ml-auto text-xs font-mono text-[#64748b]">
                          {trackingNumber}
                        </span>
                      )}
                    </div>

                    {/* Summary stat cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          label: "Total Amount",
                          value: `R${total.toFixed(2)}`,
                          icon: Receipt,
                          iconBg: "bg-[#fff7ed]",
                          iconColor: "text-[#ea580c]",
                          textColor: "text-[#1e293b]",
                        },
                        {
                          label: "Paid",
                          value: `R${paymentStatus.totalPaid.toFixed(2)}`,
                          icon: CheckSquare,
                          iconBg:
                            paymentStatus.totalPaid > 0
                              ? "bg-[#dcfce7]"
                              : "bg-[#f1f5f9]",
                          iconColor:
                            paymentStatus.totalPaid > 0
                              ? "text-[#059669]"
                              : "text-[#94a3b8]",
                          textColor:
                            paymentStatus.totalPaid > 0
                              ? "text-[#059669]"
                              : "text-[#1e293b]",
                        },
                        {
                          label: "Balance Due",
                          value: `R${paymentStatus.balanceDue.toFixed(2)}`,
                          icon: Wallet,
                          iconBg:
                            paymentStatus.balanceDue <= 0
                              ? "bg-[#dcfce7]"
                              : "bg-[#fef2f2]",
                          iconColor:
                            paymentStatus.balanceDue <= 0
                              ? "text-[#059669]"
                              : "text-[#dc2626]",
                          textColor:
                            paymentStatus.balanceDue <= 0
                              ? "text-[#059669]"
                              : "text-[#dc2626]",
                        },
                      ].map(
                        ({
                          label,
                          value,
                          icon: Icon,
                          iconBg,
                          iconColor,
                          textColor,
                        }) => (
                          <div
                            key={label}
                            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                                {label}
                              </span>
                              <div
                                className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
                              >
                                <Icon className={`w-4 h-4 ${iconColor}`} />
                              </div>
                            </div>
                            <div className={`text-xl font-bold ${textColor}`}>
                              {value}
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* Main input card */}
                    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                      <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <button
                          onClick={() => setInputMode("manual")}
                          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${inputMode === "manual" ? "border-[#ea580c] text-[#ea580c] bg-white" : "border-transparent text-[#64748b] hover:text-[#374151]"}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Manual Entry
                        </button>
                        <button
                          onClick={() => setShowAIWindow(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ml-auto mr-3 my-auto bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] text-white shadow-md shadow-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Sparkles className="w-4 h-4" />
                          AI Mode
                        </button>
                      </div>

                      {inputMode === "manual" && (
                        <div className="p-6">
                          <FreightMultiStepForm
                            senderName={senderName}
                            setSenderName={setSenderName}
                            customerId={customerId}
                            setCustomerId={setCustomerId}
                            senderEmail={senderEmail}
                            setSenderEmail={setSenderEmail}
                            senderPhone={senderPhone}
                            setSenderPhone={setSenderPhone}
                            senderAddress={senderAddress}
                            setSenderAddress={setSenderAddress}
                            receiverName={receiverName}
                            setReceiverName={setReceiverName}
                            receiverEmail={receiverEmail}
                            setReceiverEmail={setReceiverEmail}
                            receiverPhone={receiverPhone}
                            setReceiverPhone={setReceiverPhone}
                            receiverAddress={receiverAddress}
                            setReceiverAddress={setReceiverAddress}
                            origin={origin}
                            setOrigin={setOrigin}
                            destination={destination}
                            setDestination={setDestination}
                            cargoType={cargoType}
                            setCargoType={setCargoType}
                            weight={weight}
                            setWeight={setWeight}
                            dimensions={dimensions}
                            setDimensions={setDimensions}
                            trackingNumber={trackingNumber}
                            setTrackingNumber={setTrackingNumber}
                            items={items}
                            newItem={newItem}
                            setNewItem={setNewItem}
                            handleAddItem={handleAddItem}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Live preview panel */}
                <div className="hidden xl:flex w-[420px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                    <TemplateSelector
                      user={user}
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={setSelectedTemplate}
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </button>
                      <button
                        onClick={handleSavePDF}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#ea580c] text-white text-xs font-medium rounded-lg hover:bg-[#c2410c] transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div
                      className="bg-white shadow-lg rounded origin-top"
                      style={{
                        position: "relative",
                        width: "210mm",
                        minHeight: "297mm",
                        transform: "scale(0.44)",
                        transformOrigin: "top left",
                        marginBottom: `calc((297mm * 0.44) - 297mm)`,
                      }}
                    >
                      <TemplateRenderer {...templateProps} />
                      <StampOverlay stampConfig={stampConfig} pageNumber={1} businessInfo={businessInfo} />

                    </div>
                  </div>
                  {/* ── Stamp button footer ── */}
<div className="flex-shrink-0 px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0]">
  <button
    onClick={() => setShowStampModal(true)}
    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[#ce1414] hover:bg-[#b01212] text-white text-sm font-medium rounded-lg transition-colors"
  >
    <Stamp className="w-4 h-4" />
    Stamp &amp; Signature
  </button>
</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SolidFloAgent industry="logistics" />
    </div>
  );
};

export default LogisticsDashboard;
