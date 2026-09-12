import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  FileText,
  Hammer,
  LogOut,
  MapPin,
  Package,
  Plus,
  Printer,
  Receipt,
  Save,
  Truck,
  Users,
  Wrench,
  X,
  Building2,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  DollarSign,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ─── Re-use existing components ──────────────────────────────────────────────
// Adjust these import paths to match your project structure:
import { TemplateRenderer } from "./TemplateSelector";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import CustomerModal from "../CustomerModal";
import AppHeader from "../AppHeader";
import StampPaywallModal from "../StampPaywallModal";
import StampSignatureModal from "../StampSignatureModal";
import TemplateSelector from "./TemplateSelector";

// ─── Firestore helpers ────────────────────────────────────────────────────────
const db = getFirestore();

const generateDocNumber = async (parentUid, docType) => {
  const year = new Date().getFullYear();
  const map = {
    invoice: { col: "invoices", prefix: "INV" },
    quote: { col: "quotes", prefix: "QTE" },
    purchase_order: { col: "purchaseOrders", prefix: "PO" },
  };
  const { col, prefix } = map[docType];
  const ref = collection(db, "users", parentUid, col);
  const snap = await getDocs(
    query(ref, orderBy("createdAt", "desc"), limit(1)),
  );
  let last = 1000;
  if (!snap.empty) {
    const match =
      snap.docs[0].data().docNumber?.match(/(\d+)$/) ||
      snap.docs[0].data().quoteNumber?.match(/(\d+)$/) ||
      snap.docs[0].data().poNumber?.match(/(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `${prefix}-${year}-${String(last + 1).padStart(4, "0")}`;
};

// ─── Toast notification ───────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === "success"
      ? "bg-[#f0fdf4] border-[#86efac] text-[#166534]"
      : "bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]";
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors}`}
      style={{ minWidth: 280 }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto p-0.5 hover:opacity-60">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─── Shared CSS tokens ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#ea580c] focus:border-[#ea580c] transition-colors";
const btnPrimary =
  "flex items-center gap-2 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondary =
  "flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#374151] text-sm font-medium rounded-lg transition-colors shadow-sm";

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "invoice", label: "New Invoice", icon: FileText, accent: "#ea580c" },
  { id: "quote", label: "New Quote", icon: Receipt, accent: "#0d9488" },
  {
    id: "purchase_order",
    label: "Purchase Order",
    icon: Truck,
    accent: "#7c3aed",
  },
  { id: "add_client", label: "Add Client", icon: Users, accent: "#059669" },
  {
    id: "add_material",
    label: "Add Material",
    icon: Package,
    accent: "#0284c7",
  },
  { id: "add_project", label: "Log Project", icon: Hammer, accent: "#d97706" },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const CarpentrySubAccountDashboard = ({ parentUid, subUser }) => {
  // ── layout ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const [activeView, setActiveView] = useState("invoice");
  const [toast, setToast] = useState(null);

  // ── shared ────────────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [showPreview, setShowPreview] = useState(false);
  const [isSavingPDF, setIsSavingPDF] = useState(false);
  const [notifications] = useState([]);

  // ── Invoice / Quote ───────────────────────────────────────────────────────
  const [docType, setDocType] = useState("invoice");
  const [docNumber, setDocNumber] = useState("");
  const [docId, setDocId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [vatRate, setVatRate] = useState(15);

  // customer fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerId, setCustomerId] = useState("");

  // bill-to
  const [billName, setBillName] = useState("");
  const [billEmail, setBillEmail] = useState("");
  const [billPhone, setBillPhone] = useState("");
  const [billAddress, setBillAddress] = useState("");

  // project details (carpentry-specific)
  const [projectType, setProjectType] = useState("Kitchen Cabinetry");
  const [projectSize, setProjectSize] = useState("");
  const [woodType, setWoodType] = useState("Oak");
  const [finishType, setFinishType] = useState("Varnish");
  const [siteAddress, setSiteAddress] = useState("");

  // line items
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    workCategory: "Custom Cabinetry",
    taxRate: "15",
    phase: "Phase 1",
  });

  const subtotal = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalTax = items.reduce((s, i) => s + Number(i.taxAmount || 0), 0);
  const total = subtotal + totalTax;

  // ── Purchase Order ─────────────────────────────────────────────────────────
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState(new Date().toLocaleDateString("en-ZA"));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [poItems, setPoItems] = useState([]);
  const [newPoItem, setNewPoItem] = useState({
    description: "",
    qty: 1,
    unit: "m²",
    unitPrice: 0,
  });
  const [poNotes, setPoNotes] = useState("");
  const [poPaymentTerms, setPoPaymentTerms] = useState("30 Days");
  const [poShipping, setPoShipping] = useState("");

  const poSubtotal = poItems.reduce((s, i) => s + Number(i.amount || 0), 0);
  const poVat = poSubtotal * 0.15;
  const poTotal = poSubtotal + poVat;

  // ── Add Material form ──────────────────────────────────────────────────────
  const [matName, setMatName] = useState("");
  const [matSku, setMatSku] = useState("");
  const [matQty, setMatQty] = useState("");
  const [matPrice, setMatPrice] = useState("");
  const [matSupplier, setMatSupplier] = useState("");
  const [matCategory, setMatCategory] = useState("Timber");
  const [matUnit, setMatUnit] = useState("m²");
  const [matReorder, setMatReorder] = useState("");

  // ── Log Project form ───────────────────────────────────────────────────────
  const [projName, setProjName] = useState("");
  const [projClient, setProjClient] = useState("");
  const [projType, setProjType] = useState("Kitchen Cabinetry");
  const [projWood, setProjWood] = useState("Oak");
  const [projFinish, setProjFinish] = useState("Varnish");
  const [projAddress, setProjAddress] = useState("");
  const [projStart, setProjStart] = useState("");
  const [projNotes, setProjNotes] = useState("");

  // ── Add Client modal ───────────────────────────────────────────────────────
  const [showClientModal, setShowClientModal] = useState(false);

  // ─── Load business info ───────────────────────────────────────────────────
  useEffect(() => {
    if (!parentUid) return;
    const load = async () => {
      const snap = await getDoc(
        doc(db, "users", parentUid, "settings", "businessInfo"),
      );
      if (snap.exists()) setBusinessInfo(snap.data());
    };
    load();
  }, [parentUid]);

  // ─── Generate doc numbers when view changes ───────────────────────────────
  useEffect(() => {
    if (!parentUid) return;
    if (activeView === "invoice" || activeView === "quote") {
      const t = activeView === "invoice" ? "invoice" : "quote";
      setDocType(t);
      setDocId(null);
      setCurrentStep(1);
      generateDocNumber(parentUid, t).then(setDocNumber);
    }
    if (activeView === "purchase_order") {
      generateDocNumber(parentUid, "purchase_order").then(setPoNumber);
    }
  }, [activeView, parentUid]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (message, type = "success") => setToast({ message, type });

  const resetInvoiceForm = useCallback(async () => {
    setDocId(null);
    setCurrentStep(1);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerId("");
    setBillName("");
    setBillEmail("");
    setBillPhone("");
    setBillAddress("");
    setProjectType("Kitchen Cabinetry");
    setProjectSize("");
    setWoodType("Oak");
    setFinishType("Varnish");
    setSiteAddress("");
    setItems([]);
    if (parentUid) {
      const n = await generateDocNumber(parentUid, docType);
      setDocNumber(n);
    }
  }, [parentUid, docType]);

  // ─── Print ────────────────────────────────────────────────────────────────
  const printStyles = `@media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } html,body { margin:0!important;padding:0!important;width:210mm!important;background:white!important; } body * { visibility:hidden!important; } #carp-sub-print-area,#carp-sub-print-area * { visibility:visible!important; } #carp-sub-print-area { display:block!important;position:absolute!important;left:0!important;top:0!important;width:210mm!important;min-height:297mm!important;margin:0!important;padding:0!important;background:white!important; } @page { size:A4 portrait;margin:40px!important; } }`;

  const handlePrint = () => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    requestAnimationFrame(() => {
      setTimeout(() => window.print(), 300);
    });
    window.onafterprint = () => {
      document.head.removeChild(styleSheet);
      window.onafterprint = null;
    };
  };

  // ─── Save PDF ─────────────────────────────────────────────────────────────
  const handleSavePDF = async () => {
    setIsSavingPDF(true);
    try {
      const printArea = document.getElementById("carp-sub-print-area");
      if (!printArea) throw new Error("Print area not found");

      const prevStyle = printArea.getAttribute("style") || "";
      printArea.style.cssText = `display:block!important;position:fixed;top:0;left:-9999px;width:794px;min-height:1123px;background:white;z-index:9999;visibility:visible;`;
      printArea.classList.remove("hidden");

      await new Promise((r) => setTimeout(r, 300));

      const images = printArea.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (!img.src || img.src.startsWith("data:")) return resolve();
              fetch(img.src, { mode: "cors" })
                .then((r) => r.blob())
                .then((blob) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    img.src = e.target.result;
                    resolve();
                  };
                  reader.onerror = resolve;
                  reader.readAsDataURL(blob);
                })
                .catch(resolve);
            }),
        ),
      );

      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });

      printArea.classList.add("hidden");
      printArea.setAttribute("style", prevStyle);

      const isPO = activeView === "purchase_order";
      const prefix = isPO ? "PO" : docType === "quote" ? "Quote" : "Invoice";
      const number = isPO ? poNumber || "draft" : docNumber || "draft";
      const fileName = `${prefix}-${number}.pdf`;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 0.95),
        "JPEG",
        0,
        0,
        pageWidth,
        pageHeight,
      );
      pdf.save(fileName);

      showToast(`${fileName} downloaded`);
    } catch (err) {
      showToast("PDF save failed: " + err.message, "error");
    } finally {
      setIsSavingPDF(false);
    }
  };

  // ─── Line item handlers ────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    const taxRate = Number(newItem.taxRate) || 0;
    const amount = rate * qty;
    const taxAmount = amount * (taxRate / 100);
    setItems((prev) => [
      ...prev,
      {
        ...newItem,
        rate,
        qty,
        amount,
        taxAmount,
        totalAmount: amount + taxAmount,
      },
    ]);
    setNewItem({
      description: "",
      rate: "",
      qty: "",
      workCategory: "Custom Cabinetry",
      taxRate: "15",
      phase: "Phase 1",
    });
  };
  const handleRemoveItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const handleUpdateItem = (i, field, val) =>
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== i) return item;
        const u = { ...item, [field]: val };
        if (field === "rate" || field === "qty") {
          u.amount = Number(u.rate) * Number(u.qty);
          u.taxAmount = u.amount * (Number(u.taxRate || 15) / 100);
          u.totalAmount = u.amount + u.taxAmount;
        }
        return u;
      }),
    );

  const handleAddPoItem = () => {
    if (!newPoItem.description) return;
    const up = Number(newPoItem.unitPrice) || 0;
    const qty = Number(newPoItem.qty);
    setPoItems((prev) => [
      ...prev,
      { ...newPoItem, unitPrice: up, amount: up * qty },
    ]);
    setNewPoItem({ description: "", qty: 1, unit: "m²", unitPrice: 0 });
  };
  const handleRemovePoItem = (i) =>
    setPoItems((prev) => prev.filter((_, idx) => idx !== i));

  // ─── Build payload ──────────────────────────────────────────────────────────
  const buildPayload = (numberToUse) => ({
    docNumber: numberToUse,
    quoteNumber: numberToUse,
    documentType: docType,
    status: "pending",
    createdBy: subUser?.uid || "subuser",
    subUserEmail: subUser?.email || "",
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
      merchant_code: customerId,
    },
    billTo: {
      name: billName,
      email: billEmail,
      phone: billPhone,
      address: billAddress,
    },
    projectDetails: {
      type: projectType,
      size: projectSize,
      woodType,
      finishType,
      siteAddress,
    },
    items,
    totals: { subtotal, tax: totalTax, total, paid: 0, due: total },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // ─── Save Invoice / Quote ──────────────────────────────────────────────────
  const handleSaveDoc = async () => {
    if (!parentUid) return;
    setSaving(true);
    try {
      const col = docType === "quote" ? "quotes" : "invoices";
      const payload = buildPayload(docNumber);

      await setDoc(
        doc(db, "users", parentUid, col, docNumber),
        { ...payload, updatedAt: serverTimestamp() },
        { merge: true },
      );

      setDocId(docNumber);
      showToast(
        `${docType === "quote" ? "Quote" : "Invoice"} saved — ${docNumber}`,
      );
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Purchase Order ───────────────────────────────────────────────────
  const handleSavePO = async () => {
    if (!parentUid) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", parentUid, "purchaseOrders", poNumber),
        {
          poNumber,
          poDate,
          deliveryDate,
          supplierName,
          supplierContact,
          supplierEmail,
          supplierPhone,
          supplierAddress,
          deliveryName,
          deliveryAddress,
          items: poItems.filter((i) => i.description),
          totals: { subtotal: poSubtotal, vat: poVat, total: poTotal },
          notes: poNotes,
          paymentTerms: poPaymentTerms,
          shippingMethod: poShipping,
          status: "pending",
          createdBy: subUser?.uid || "subuser",
          subUserEmail: subUser?.email || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      showToast(`Purchase Order ${poNumber} saved`);
      setPoItems([]);
      setPoNotes("");
      setSupplierName("");
      setSupplierContact("");
      setSupplierEmail("");
      setSupplierPhone("");
      setSupplierAddress("");
      setDeliveryName("");
      setDeliveryAddress("");
      generateDocNumber(parentUid, "purchase_order").then(setPoNumber);
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Material ─────────────────────────────────────────────────────────
  const handleSaveMaterial = async () => {
    if (!parentUid || !matName) {
      showToast("Material name is required", "error");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", parentUid, "materialsInventory"), {
        name: matName,
        sku: matSku,
        qty: Number(matQty) || 0,
        price: Number(matPrice) || 0,
        supplier: matSupplier,
        category: matCategory,
        unit: matUnit,
        reorderPoint: Number(matReorder) || 0,
        createdBy: subUser?.uid || "subuser",
        subUserEmail: subUser?.email || "",
        createdAt: serverTimestamp(),
      });
      showToast(`Material "${matName}" added`);
      setMatName("");
      setMatSku("");
      setMatQty("");
      setMatPrice("");
      setMatSupplier("");
      setMatReorder("");
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Project ──────────────────────────────────────────────────────────
  const handleSaveProject = async () => {
    if (!parentUid || !projName) {
      showToast("Project name is required", "error");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", parentUid, "projects"), {
        name: projName,
        client: projClient,
        type: projType,
        woodType: projWood,
        finishType: projFinish,
        address: projAddress,
        startDate: projStart,
        notes: projNotes,
        status: "active",
        createdBy: subUser?.uid || "subuser",
        subUserEmail: subUser?.email || "",
        createdAt: serverTimestamp(),
      });
      showToast(`Project "${projName}" logged`);
      setProjName("");
      setProjClient("");
      setProjAddress("");
      setProjStart("");
      setProjNotes("");
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (_) {}
  };

  // ─── Template props ────────────────────────────────────────────────────────
  const templateProps = {
    templateId: selectedTemplate,
    loading: false,
    invoiceNumber: docNumber,
    jobCardNumber: docNumber,
    customerName,
    billName,
    billEmail,
    billPhone,
    billAddress,
    merchant_code: customerId,
    customerEmail,
    customerPhone,
    customerAddress,
    items,
    subtotal,
    totalTax,
    vat: totalTax,
    total,
    documentType: docType,
    businessInfo,
    projectDetails: {
      type: projectType,
      size: projectSize,
      woodType,
      finishType,
      siteAddress,
    },
  };

  const poTemplateProps = {
    templateId: selectedTemplate,
    businessInfo,
    poNumber,
    poDate,
    deliveryDate,
    supplierName,
    supplierContact,
    supplierEmail,
    supplierPhone,
    supplierAddress,
    deliveryName,
    deliveryAddress,
    items: poItems.filter((i) => i.description),
    subtotal: poSubtotal,
    vat: poVat,
    total: poTotal,
    notes: poNotes,
    paymentTerms: poPaymentTerms,
    shippingMethod: poShipping,
  };

  // ─── AppHeader actions ─────────────────────────────────────────────────────
  const isInvoiceOrQuote = activeView === "invoice" || activeView === "quote";
  const isPO = activeView === "purchase_order";

  const headerActions = [
    isInvoiceOrQuote && {
      label: "Preview",
      icon: Eye,
      onClick: () => setShowPreview(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    (isInvoiceOrQuote || isPO) && {
      label: "Print",
      icon: Printer,
      onClick: handlePrint,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-md transition-colors whitespace-nowrap hover:bg-[#f8fafc]",
    },
    isInvoiceOrQuote && {
      label: "New",
      icon: Plus,
      onClick: resetInvoiceForm,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    (isInvoiceOrQuote || isPO) && {
      label: isSavingPDF ? "Saving..." : "Save PDF",
      icon: Download,
      onClick: handleSavePDF,
      disabled: isSavingPDF,
      className: `flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap ${isSavingPDF ? "bg-[#64748b] cursor-not-allowed" : "bg-[#0891b2] hover:bg-[#0e7490]"}`,
    },
    isInvoiceOrQuote && {
      label: saving ? "Saving…" : "Save",
      icon: Save,
      onClick: handleSaveDoc,
      disabled: saving,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50",
    },
    isPO && {
      label: saving ? "Saving…" : "Save P.O.",
      icon: Save,
      onClick: handleSavePO,
      disabled: saving,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap disabled:opacity-50",
    },
    activeView === "add_material" && {
      label: saving ? "Saving…" : "Save Material",
      icon: Save,
      onClick: handleSaveMaterial,
      disabled: saving,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    activeView === "add_project" && {
      label: saving ? "Saving…" : "Log Project",
      icon: Save,
      onClick: handleSaveProject,
      disabled: saving,
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
    activeView === "add_client" && {
      label: "Add Client",
      icon: Plus,
      onClick: () => setShowClientModal(true),
      className:
        "flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-md transition-colors whitespace-nowrap",
    },
  ].filter(Boolean);

  // ─── Step definitions ──────────────────────────────────────────────────────
  const invoiceSteps = [
    { number: 1, title: "Client", icon: Users },
    { number: 2, title: "Bill To", icon: FileText },
    { number: 3, title: "Project", icon: Hammer },
    { number: 4, title: "Items", icon: Wrench },
    { number: 5, title: "Review", icon: CreditCard },
  ];

  const poSteps = [
    { number: 1, title: "Supplier", icon: Truck },
    { number: 2, title: "Delivery", icon: MapPin },
    { number: 3, title: "Items", icon: Package },
    { number: 4, title: "Summary", icon: FileText },
  ];

  const steps = activeView === "purchase_order" ? poSteps : invoiceSteps;
  const totalSteps = steps.length;

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#f5f0eb]">
      {/* ── Hidden print/PDF area ─────────────────────────────────────────── */}
      <div
        id="carp-sub-print-area"
        className="hidden print:block bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {activeView === "purchase_order" ? (
          <POTemplateRenderer {...poTemplateProps} />
        ) : (
          <TemplateRenderer {...templateProps} />
        )}
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 md:gap-3">
        {/* ── MOBILE BACKDROP ─────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <aside
          className={`
            flex flex-col transition-all duration-300 flex-shrink-0 z-40
            fixed inset-y-0 left-0
            lg:relative lg:inset-auto
            ${sidebarOpen ? "w-56 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-14"}
          `}
          style={{ background: "#1c1208" }}
        >
          {/* Logo / toggle */}
          <div
            className="flex items-center justify-between px-3 py-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div
              className={`flex items-center gap-2 min-w-0 ${sidebarOpen ? "flex" : "hidden lg:hidden"}`}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#ea580c" }}
              >
                <Hammer className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {businessInfo.businessName || "Carpentry Co."}
                </p>
                <p
                  className="text-[10px] truncate"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {subUser?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
            {sidebarOpen && (
              <p
                className="text-[9px] font-bold uppercase tracking-widest px-2 pb-1.5"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Actions
              </p>
            )}
            {NAV_ITEMS.map(({ id, label, icon: Icon, accent }) => {
              const isActive = activeView === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveView(id);
                    setCurrentStep(1);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  title={!sidebarOpen ? label : undefined}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 lg:py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.08)"
                      : "transparent",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: isActive ? accent : "transparent" }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: isActive ? "#fff" : accent }}
                    />
                  </div>
                  {sidebarOpen && <span className="truncate">{label}</span>}
                  {isActive && sidebarOpen && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: accent }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sub-user badge + logout */}
          <div
            className="px-2 pb-3 pt-3 space-y-1 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {sidebarOpen && (
              <div
                className="px-2 py-1.5 mb-1 rounded-lg border"
                style={{
                  background: "rgba(234,88,12,0.1)",
                  borderColor: "rgba(234,88,12,0.2)",
                }}
              >
                <p
                  className="text-[9px] font-bold uppercase tracking-wide"
                  style={{ color: "#f97316" }}
                >
                  Sub Account
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Scoped billing access
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 lg:py-2 rounded-lg transition-all"
              style={{ color: "rgba(255,255,255,0.4)" }}
              title={!sidebarOpen ? "Logout" : undefined}
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </aside>

        {/* ── MAIN ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* ── AppHeader ─────────────────────────────────────────────────── */}
          <AppHeader
            actions={headerActions}
            mobileActions={headerActions}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            pageTitle={
              NAV_ITEMS.find((n) => n.id === activeView)?.label || "Dashboard"
            }
            dashboardType="carpentry"
            plan="sub"
            notifications={notifications}
          />

          {/* ── Body ─────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* ── LEFT: Form content ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* ── INVOICE / QUOTE BUILDER ──────────────────────────────── */}
              {(activeView === "invoice" || activeView === "quote") && (
                <div className="px-4 sm:px-6 py-6">
                  {/* Doc type toggle */}
                  <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          activeView === "invoice" ? "#fff7ed" : "#f0fdfa",
                      }}
                    >
                      {activeView === "invoice" ? (
                        <FileText className="w-5 h-5 text-[#ea580c]" />
                      ) : (
                        <Receipt className="w-5 h-5 text-[#0d9488]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1e293b]">
                        {activeView === "invoice" ? "New Invoice" : "New Quote"}{" "}
                        —{" "}
                        <span
                          style={{
                            color:
                              activeView === "invoice" ? "#ea580c" : "#0d9488",
                          }}
                        >
                          {docNumber}
                        </span>
                      </p>
                      <p className="text-xs text-[#64748b]">
                        Fill in all steps then save
                      </p>
                    </div>
                    <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-1">
                      <button
                        onClick={() => {
                          setActiveView("invoice");
                          setDocType("invoice");
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeView === "invoice" ? "bg-white text-[#ea580c] shadow-sm" : "text-[#64748b] hover:text-[#374151]"}`}
                      >
                        Invoice
                      </button>
                      <button
                        onClick={() => {
                          setActiveView("quote");
                          setDocType("quote");
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeView === "quote" ? "bg-white text-[#0d9488] shadow-sm" : "text-[#64748b] hover:text-[#374151]"}`}
                      >
                        Quote
                      </button>
                    </div>
                  </div>

                  {/* Step indicator */}
                  <StepIndicator
                    steps={invoiceSteps}
                    currentStep={currentStep}
                    accentColor="#ea580c"
                  />

                  {/* Step content card */}
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      {/* Step 1 — Client */}
                      {currentStep === 1 && (
                        <StepCard
                          icon={Users}
                          title="Client Details"
                          subtitle="Who is this document for?"
                          accentBg="bg-[#fff7ed]"
                          accentIcon="text-[#ea580c]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                              label="Customer Name *"
                              value={customerName}
                              set={setCustomerName}
                              placeholder="John Smith"
                            />
                            <Field
                              label="Customer ID"
                              value={customerId}
                              set={setCustomerId}
                              placeholder="CUST-001"
                            />
                            <Field
                              label="Email *"
                              value={customerEmail}
                              set={setCustomerEmail}
                              type="email"
                              placeholder="john@example.com"
                            />
                            <Field
                              label="Phone *"
                              value={customerPhone}
                              set={setCustomerPhone}
                              type="tel"
                              placeholder="082 123 4567"
                            />
                            <div className="sm:col-span-2">
                              <Field
                                label="Address"
                                value={customerAddress}
                                set={setCustomerAddress}
                                placeholder="Street, City, Postal Code"
                              />
                            </div>
                          </div>
                        </StepCard>
                      )}

                      {/* Step 2 — Bill To */}
                      {currentStep === 2 && (
                        <StepCard
                          icon={FileText}
                          title="Bill To"
                          subtitle="Billing contact (may differ from client)"
                          accentBg="bg-[#f0fdf4]"
                          accentIcon="text-[#059669]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                              label="Billing Name *"
                              value={billName}
                              set={setBillName}
                              placeholder="Billing contact"
                            />
                            <Field
                              label="Email"
                              value={billEmail}
                              set={setBillEmail}
                              type="email"
                              placeholder="billing@example.com"
                            />
                            <Field
                              label="Phone"
                              value={billPhone}
                              set={setBillPhone}
                              type="tel"
                              placeholder="082 123 4567"
                            />
                            <div className="sm:col-span-2">
                              <Field
                                label="Billing Address"
                                value={billAddress}
                                set={setBillAddress}
                                placeholder="Billing address if different"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setBillName(customerName);
                              setBillEmail(customerEmail);
                              setBillPhone(customerPhone);
                              setBillAddress(customerAddress);
                            }}
                            className="mt-3 flex items-center gap-2 text-[#ea580c] text-sm font-medium hover:underline"
                          >
                            <Users className="w-4 h-4" /> Copy from Client
                          </button>
                        </StepCard>
                      )}

                      {/* Step 3 — Project Details */}
                      {currentStep === 3 && (
                        <StepCard
                          icon={Hammer}
                          title="Project Details"
                          subtitle="Carpentry project specifications"
                          accentBg="bg-[#fff7ed]"
                          accentIcon="text-[#d97706]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>Project Type *</label>
                              <select
                                value={projectType}
                                onChange={(e) => setProjectType(e.target.value)}
                                className={selectCls}
                              >
                                <option>Kitchen Cabinetry</option>
                                <option>Bedroom Furniture</option>
                                <option>Built-in Wardrobes</option>
                                <option>Custom Shelving</option>
                                <option>Decking</option>
                                <option>Doors & Frames</option>
                                <option>Flooring</option>
                                <option>Ceilings</option>
                                <option>Custom Furniture</option>
                                <option>Other</option>
                              </select>
                            </div>
                            <Field
                              label="Area (sqm)"
                              value={projectSize}
                              set={setProjectSize}
                              type="number"
                              placeholder="15"
                            />
                            <div>
                              <label className={labelCls}>Wood Type</label>
                              <select
                                value={woodType}
                                onChange={(e) => setWoodType(e.target.value)}
                                className={selectCls}
                              >
                                <option>Oak</option>
                                <option>Pine</option>
                                <option>Meranti</option>
                                <option>Sapele</option>
                                <option>MDF</option>
                                <option>Plywood</option>
                                <option>Melamine</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Finish Type</label>
                              <select
                                value={finishType}
                                onChange={(e) => setFinishType(e.target.value)}
                                className={selectCls}
                              >
                                <option>Varnish</option>
                                <option>Stain & Varnish</option>
                                <option>Paint</option>
                                <option>Oil Finish</option>
                                <option>Lacquer</option>
                                <option>Natural/Unfinished</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <Field
                                label="Site Address"
                                value={siteAddress}
                                set={setSiteAddress}
                                placeholder="45 Corporate Blvd, Sandton"
                              />
                            </div>
                          </div>
                          <div
                            className="mt-3 px-3 py-2.5 rounded-lg border"
                            style={{
                              background: "#fff7ed",
                              borderColor: "#fed7aa",
                            }}
                          >
                            <p className="text-xs text-[#9a3412] flex items-center gap-2">
                              <Hammer className="w-3.5 h-3.5" />
                              <span>
                                <strong>{projectType}</strong> ·{" "}
                                {projectSize || "—"} sqm · {woodType} ·{" "}
                                {finishType}
                              </span>
                            </p>
                          </div>
                        </StepCard>
                      )}

                      {/* Step 4 — Items */}
                      {currentStep === 4 && (
                        <StepCard
                          icon={Wrench}
                          title="Work Items & Materials"
                          subtitle="Add line items to the document"
                          accentBg="bg-[#f8fafc]"
                          accentIcon="text-[#475569]"
                        >
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-4">
                            <p className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-3">
                              Add Item
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              <div>
                                <label className={labelCls}>Category</label>
                                <select
                                  value={newItem.workCategory}
                                  onChange={(e) =>
                                    setNewItem({
                                      ...newItem,
                                      workCategory: e.target.value,
                                    })
                                  }
                                  className={selectCls}
                                >
                                  <option>Custom Cabinetry</option>
                                  <option>Installation</option>
                                  <option>Materials</option>
                                  <option>Hardware</option>
                                  <option>Finishing</option>
                                  <option>Labour</option>
                                </select>
                              </div>
                              <div className="sm:col-span-1">
                                <label className={labelCls}>Phase</label>
                                <select
                                  value={newItem.phase}
                                  onChange={(e) =>
                                    setNewItem({
                                      ...newItem,
                                      phase: e.target.value,
                                    })
                                  }
                                  className={selectCls}
                                >
                                  <option>Phase 1</option>
                                  <option>Phase 2</option>
                                  <option>Phase 3</option>
                                  <option>Final</option>
                                </select>
                              </div>
                              <div>
                                <label className={labelCls}>Rate (R)</label>
                                <input
                                  type="number"
                                  className={inputCls}
                                  placeholder="0.00"
                                  value={newItem.rate}
                                  onChange={(e) =>
                                    setNewItem({
                                      ...newItem,
                                      rate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className={labelCls}>Qty</label>
                                <input
                                  type="number"
                                  className={inputCls}
                                  placeholder="1"
                                  value={newItem.qty}
                                  onChange={(e) =>
                                    setNewItem({
                                      ...newItem,
                                      qty: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                              <div className="sm:col-span-2">
                                <label className={labelCls}>Description</label>
                                <input
                                  className={inputCls}
                                  placeholder="Work / material description"
                                  value={newItem.description}
                                  onChange={(e) =>
                                    setNewItem({
                                      ...newItem,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className={labelCls}>VAT %</label>
                                <input
                                  type="number"
                                  className={inputCls}
                                  placeholder="15"
                                  value={newItem.taxRate}
                                  onChange={(e) =>
                                    setNewItem({
                                      ...newItem,
                                      taxRate: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <button
                              onClick={handleAddItem}
                              className={btnPrimary}
                            >
                              <Plus className="w-4 h-4" /> Add Item
                            </button>
                          </div>
                          <CarpentryItemsTable
                            items={items}
                            onRemove={handleRemoveItem}
                            onUpdate={handleUpdateItem}
                            subtotal={subtotal}
                            totalTax={totalTax}
                            total={total}
                          />
                        </StepCard>
                      )}

                      {/* Step 5 — Review */}
                      {currentStep === 5 && (
                        <StepCard
                          icon={CreditCard}
                          title="Review & Save"
                          subtitle="Check details then save"
                          accentBg="bg-[#faf5ff]"
                          accentIcon="text-[#7c3aed]"
                        >
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl overflow-hidden">
                            {[
                              ["Document #", docNumber],
                              [
                                "Type",
                                docType === "quote" ? "Quote" : "Invoice",
                              ],
                              ["Client", customerName || "—"],
                              ["Project Type", projectType || "—"],
                              ["Wood / Finish", `${woodType} / ${finishType}`],
                              [
                                "Area",
                                projectSize ? `${projectSize} sqm` : "—",
                              ],
                              ["Items", `${items.length} line item(s)`],
                              ["Subtotal", `R${subtotal.toFixed(2)}`],
                              ["VAT", `R${totalTax.toFixed(2)}`],
                              ["Total", `R${total.toFixed(2)}`],
                            ].map(([k, v]) => (
                              <div
                                key={k}
                                className="flex items-center justify-between px-4 py-2.5 border-b border-[#f1f5f9] last:border-0 text-sm"
                              >
                                <span className="text-[#64748b]">{k}</span>
                                <span
                                  className={`font-semibold ${k === "Total" ? "text-[#ea580c] text-base" : "text-[#1e293b]"}`}
                                >
                                  {v}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={handleSaveDoc}
                            disabled={saving}
                            className={`mt-4 w-full justify-center ${btnPrimary}`}
                          >
                            <Save className="w-4 h-4" />
                            {saving
                              ? "Saving…"
                              : `Save ${docType === "quote" ? "Quote" : "Invoice"} — ${docNumber}`}
                          </button>
                        </StepCard>
                      )}
                    </div>

                    {/* Step navigation */}
                    <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
                      <button
                        onClick={() =>
                          setCurrentStep((p) => Math.max(1, p - 1))
                        }
                        disabled={currentStep === 1}
                        className={`${btnSecondary} ${currentStep === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <span className="text-xs text-[#64748b] font-medium">
                        {currentStep} / {totalSteps}
                      </span>
                      {currentStep < totalSteps ? (
                        <button
                          onClick={() =>
                            setCurrentStep((p) => Math.min(totalSteps, p + 1))
                          }
                          className={btnPrimary}
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveDoc}
                          disabled={saving}
                          className={btnPrimary}
                        >
                          <Save className="w-4 h-4" />{" "}
                          {saving ? "Saving…" : "Save"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PURCHASE ORDER ──────────────────────────────────────────── */}
              {activeView === "purchase_order" && (
                <div className="px-4 sm:px-6 py-6">
                  <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm mb-4">
                    <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-[#7c3aed]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1e293b]">
                        Purchase Order —{" "}
                        <span className="text-[#7c3aed]">{poNumber}</span>
                      </p>
                      <p className="text-xs text-[#64748b]">
                        Order timber, materials & hardware from a supplier
                      </p>
                    </div>
                  </div>

                  <StepIndicator
                    steps={poSteps}
                    currentStep={currentStep}
                    accentColor="#7c3aed"
                  />

                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      {/* PO Step 1 — Supplier */}
                      {currentStep === 1 && (
                        <StepCard
                          icon={Truck}
                          title="Supplier Details"
                          subtitle="Timber yard / hardware supplier"
                          accentBg="bg-[#eff6ff]"
                          accentIcon="text-[#2563eb]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                              label="Supplier Name *"
                              value={supplierName}
                              set={setSupplierName}
                              placeholder="ABC Timber & Hardware"
                            />
                            <Field
                              label="Contact Person"
                              value={supplierContact}
                              set={setSupplierContact}
                              placeholder="John Doe"
                            />
                            <Field
                              label="Email"
                              value={supplierEmail}
                              set={setSupplierEmail}
                              type="email"
                              placeholder="supplier@example.com"
                            />
                            <Field
                              label="Phone"
                              value={supplierPhone}
                              set={setSupplierPhone}
                              type="tel"
                              placeholder="011 123 4567"
                            />
                            <div className="sm:col-span-2">
                              <Field
                                label="Supplier Address"
                                value={supplierAddress}
                                set={setSupplierAddress}
                                placeholder="Street, City, Postal Code"
                              />
                            </div>
                          </div>
                        </StepCard>
                      )}

                      {/* PO Step 2 — Delivery */}
                      {currentStep === 2 && (
                        <StepCard
                          icon={MapPin}
                          title="Delivery Details"
                          subtitle="When and where to deliver"
                          accentBg="bg-[#f0fdf4]"
                          accentIcon="text-[#059669]"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                              label="Deliver To *"
                              value={deliveryName}
                              set={setDeliveryName}
                              placeholder="Workshop / site name"
                            />
                            <Field
                              label="P.O. Number"
                              value={poNumber}
                              set={setPoNumber}
                              placeholder="PO-2026-0001"
                            />
                            <Field
                              label="P.O. Date"
                              value={poDate}
                              set={setPoDate}
                              type="date"
                              placeholder=""
                            />
                            <Field
                              label="Delivery Date"
                              value={deliveryDate}
                              set={setDeliveryDate}
                              type="date"
                              placeholder=""
                            />
                            <Field
                              label="Payment Terms"
                              value={poPaymentTerms}
                              set={setPoPaymentTerms}
                              placeholder="30 Days"
                            />
                            <Field
                              label="Shipping Method"
                              value={poShipping}
                              set={setPoShipping}
                              placeholder="Delivery / Collection"
                            />
                            <div className="sm:col-span-2">
                              <Field
                                label="Delivery Address"
                                value={deliveryAddress}
                                set={setDeliveryAddress}
                                placeholder="Workshop / site address"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setDeliveryName(businessInfo.businessName || "");
                              setDeliveryAddress(
                                businessInfo.addressLine1 || "",
                              );
                            }}
                            className="mt-3 flex items-center gap-2 text-[#ea580c] text-sm font-medium hover:underline"
                          >
                            <Building2 className="w-4 h-4" /> Use My Business
                            Address
                          </button>
                        </StepCard>
                      )}

                      {/* PO Step 3 — Items */}
                      {currentStep === 3 && (
                        <StepCard
                          icon={Package}
                          title="Order Items"
                          subtitle="Timber, hardware and materials to order"
                          accentBg="bg-[#f8fafc]"
                          accentIcon="text-[#475569]"
                        >
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-4">
                            <p className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-3">
                              Add Item
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <div className="sm:col-span-2">
                                <label className={labelCls}>Description</label>
                                <input
                                  className={inputCls}
                                  placeholder="e.g. Oak timber 100x50mm"
                                  value={newPoItem.description}
                                  onChange={(e) =>
                                    setNewPoItem({
                                      ...newPoItem,
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className={labelCls}>Qty</label>
                                <input
                                  type="number"
                                  className={inputCls}
                                  value={newPoItem.qty}
                                  onChange={(e) =>
                                    setNewPoItem({
                                      ...newPoItem,
                                      qty: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className={labelCls}>Unit</label>
                                <select
                                  className={selectCls}
                                  value={newPoItem.unit}
                                  onChange={(e) =>
                                    setNewPoItem({
                                      ...newPoItem,
                                      unit: e.target.value,
                                    })
                                  }
                                >
                                  <option>m²</option>
                                  <option>m</option>
                                  <option>ea</option>
                                  <option>set</option>
                                  <option>ltr</option>
                                  <option>kg</option>
                                  <option>sheet</option>
                                  <option>length</option>
                                </select>
                              </div>
                              <div>
                                <label className={labelCls}>Unit Price</label>
                                <input
                                  type="number"
                                  className={inputCls}
                                  placeholder="0.00"
                                  value={newPoItem.unitPrice}
                                  onChange={(e) =>
                                    setNewPoItem({
                                      ...newPoItem,
                                      unitPrice: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <button
                              onClick={handleAddPoItem}
                              className={`mt-3 ${btnPrimary}`}
                            >
                              <Plus className="w-4 h-4" /> Add Item
                            </button>
                          </div>

                          {poItems.filter((i) => i.description).length > 0 ? (
                            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                                  <tr>
                                    {[
                                      "Description",
                                      "Qty",
                                      "Unit",
                                      "Unit Price",
                                      "Amount",
                                      "",
                                    ].map((h) => (
                                      <th
                                        key={h}
                                        className="px-3 py-2 text-left text-xs font-semibold text-[#64748b] uppercase"
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {poItems
                                    .filter((i) => i.description)
                                    .map((item, idx) => (
                                      <tr
                                        key={idx}
                                        className="border-b border-[#f1f5f9]"
                                      >
                                        <td className="px-3 py-2 font-medium text-[#374151]">
                                          {item.description}
                                        </td>
                                        <td className="px-3 py-2 text-[#64748b]">
                                          {item.qty}
                                        </td>
                                        <td className="px-3 py-2 text-[#64748b]">
                                          {item.unit}
                                        </td>
                                        <td className="px-3 py-2 text-[#64748b]">
                                          R{Number(item.unitPrice).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 font-semibold text-[#1e293b]">
                                          R{Number(item.amount).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2">
                                          <button
                                            onClick={() =>
                                              handleRemovePoItem(idx)
                                            }
                                            className="p-1 text-[#94a3b8] hover:text-[#dc2626] rounded"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                              <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col items-end gap-1 text-sm">
                                <div className="flex justify-between w-44 text-[#64748b]">
                                  <span>Subtotal</span>
                                  <span className="font-medium text-[#374151]">
                                    R{poSubtotal.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between w-44 text-[#64748b]">
                                  <span>VAT (15%)</span>
                                  <span className="font-medium text-[#374151]">
                                    R{poVat.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between w-44 pt-2 border-t border-[#e2e8f0] font-bold text-[#1e293b]">
                                  <span>Total</span>
                                  <span className="text-[#7c3aed]">
                                    R{poTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <EmptyState
                              icon={Package}
                              text="No items added yet"
                            />
                          )}
                        </StepCard>
                      )}

                      {/* PO Step 4 — Summary */}
                      {currentStep === 4 && (
                        <StepCard
                          icon={FileText}
                          title="Order Summary"
                          subtitle="Review and add notes"
                          accentBg="bg-[#faf5ff]"
                          accentIcon="text-[#7c3aed]"
                        >
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl overflow-hidden mb-4">
                            {[
                              ["P.O. Number", poNumber || "Not set"],
                              ["Supplier", supplierName || "Not set"],
                              ["Delivery Date", deliveryDate || "TBD"],
                              ["Payment Terms", poPaymentTerms],
                              [
                                "Items",
                                `${poItems.filter((i) => i.description).length} items`,
                              ],
                              ["Total", `R${poTotal.toFixed(2)}`],
                            ].map(([k, v]) => (
                              <div
                                key={k}
                                className="flex items-center justify-between px-4 py-2.5 border-b border-[#f1f5f9] last:border-0 text-sm"
                              >
                                <span className="text-[#64748b]">{k}</span>
                                <span
                                  className={`font-semibold ${k === "Total" ? "text-[#7c3aed]" : "text-[#1e293b]"}`}
                                >
                                  {v}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className={labelCls}>
                              Notes / Special Instructions
                            </label>
                            <textarea
                              value={poNotes}
                              onChange={(e) => setPoNotes(e.target.value)}
                              rows={3}
                              placeholder="Any delivery or material notes…"
                              className={`${inputCls} resize-none`}
                            />
                          </div>
                          <button
                            onClick={handleSavePO}
                            disabled={saving}
                            className={`mt-4 w-full justify-center ${btnPrimary}`}
                          >
                            <Save className="w-4 h-4" />{" "}
                            {saving
                              ? "Saving…"
                              : `Save Purchase Order — ${poNumber}`}
                          </button>
                        </StepCard>
                      )}
                    </div>

                    {/* PO Step nav */}
                    <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
                      <button
                        onClick={() =>
                          setCurrentStep((p) => Math.max(1, p - 1))
                        }
                        disabled={currentStep === 1}
                        className={`${btnSecondary} ${currentStep === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <span className="text-xs text-[#64748b] font-medium">
                        {currentStep} / {totalSteps}
                      </span>
                      {currentStep < totalSteps ? (
                        <button
                          onClick={() =>
                            setCurrentStep((p) => Math.min(totalSteps, p + 1))
                          }
                          className={btnPrimary}
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSavePO}
                          disabled={saving}
                          className={btnPrimary}
                        >
                          <Save className="w-4 h-4" />{" "}
                          {saving ? "Saving…" : "Save P.O."}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ADD CLIENT ──────────────────────────────────────────────── */}
              {activeView === "add_client" && (
                <div className="max-w-xl mx-auto px-4 py-10 text-center">
                  <div className="w-16 h-16 bg-[#f0fdf4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[#059669]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#1e293b] mb-1">
                    Add a Client
                  </h2>
                  <p className="text-sm text-[#64748b] mb-6">
                    Click below to open the client form. The client will be
                    saved under the main account.
                  </p>
                  <button
                    onClick={() => setShowClientModal(true)}
                    className={`${btnPrimary} mx-auto`}
                  >
                    <Plus className="w-4 h-4" /> Open Client Form
                  </button>
                </div>
              )}

              {/* ── ADD MATERIAL ─────────────────────────────────────────────── */}
              {activeView === "add_material" && (
                <div className="max-w-2xl mx-auto px-4 py-6">
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f0f9ff] rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#0284c7]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#1e293b]">
                          Add Material to Inventory
                        </h2>
                        <p className="text-xs text-[#64748b]">
                          Saved to the main account's materials inventory
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Material Name *"
                          value={matName}
                          set={setMatName}
                          placeholder="Oak Timber 100x50mm"
                        />
                        <Field
                          label="SKU / Code"
                          value={matSku}
                          set={setMatSku}
                          placeholder="OAK-100-50"
                        />
                        <div>
                          <label className={labelCls}>Category</label>
                          <select
                            className={selectCls}
                            value={matCategory}
                            onChange={(e) => setMatCategory(e.target.value)}
                          >
                            {[
                              "Timber",
                              "Sheet Goods",
                              "Hardwood",
                              "Softwood",
                              "MDF/Melamine",
                              "Hardware",
                              "Fasteners",
                              "Adhesives",
                              "Finishing",
                              "Other",
                            ].map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Unit</label>
                          <select
                            className={selectCls}
                            value={matUnit}
                            onChange={(e) => setMatUnit(e.target.value)}
                          >
                            {[
                              "m²",
                              "m",
                              "ea",
                              "sheet",
                              "length",
                              "ltr",
                              "kg",
                              "set",
                            ].map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <Field
                          label="Quantity in Stock"
                          value={matQty}
                          set={setMatQty}
                          type="number"
                          placeholder="10"
                        />
                        <Field
                          label="Price per Unit (R)"
                          value={matPrice}
                          set={setMatPrice}
                          type="number"
                          placeholder="250.00"
                        />
                        <Field
                          label="Reorder Point"
                          value={matReorder}
                          set={setMatReorder}
                          type="number"
                          placeholder="5"
                        />
                        <div className="sm:col-span-2">
                          <Field
                            label="Supplier"
                            value={matSupplier}
                            set={setMatSupplier}
                            placeholder="ABC Timber & Hardware"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSaveMaterial}
                        disabled={saving}
                        className={`mt-5 ${btnPrimary}`}
                      >
                        <Save className="w-4 h-4" />{" "}
                        {saving ? "Saving…" : "Save Material"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── LOG PROJECT ──────────────────────────────────────────────── */}
              {activeView === "add_project" && (
                <div className="max-w-2xl mx-auto px-4 py-6">
                  <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                        <Hammer className="w-5 h-5 text-[#d97706]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#1e293b]">
                          Log a Project
                        </h2>
                        <p className="text-xs text-[#64748b]">
                          Record a carpentry project under the main account
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Project Name *"
                          value={projName}
                          set={setProjName}
                          placeholder="Smith Kitchen Remodel"
                        />
                        <Field
                          label="Client Name"
                          value={projClient}
                          set={setProjClient}
                          placeholder="John Smith"
                        />
                        <div>
                          <label className={labelCls}>Project Type</label>
                          <select
                            className={selectCls}
                            value={projType}
                            onChange={(e) => setProjType(e.target.value)}
                          >
                            <option>Kitchen Cabinetry</option>
                            <option>Bedroom Furniture</option>
                            <option>Built-in Wardrobes</option>
                            <option>Custom Shelving</option>
                            <option>Decking</option>
                            <option>Doors & Frames</option>
                            <option>Flooring</option>
                            <option>Custom Furniture</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Wood Type</label>
                          <select
                            className={selectCls}
                            value={projWood}
                            onChange={(e) => setProjWood(e.target.value)}
                          >
                            <option>Oak</option>
                            <option>Pine</option>
                            <option>Meranti</option>
                            <option>Sapele</option>
                            <option>MDF</option>
                            <option>Plywood</option>
                            <option>Melamine</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Finish Type</label>
                          <select
                            className={selectCls}
                            value={projFinish}
                            onChange={(e) => setProjFinish(e.target.value)}
                          >
                            <option>Varnish</option>
                            <option>Stain & Varnish</option>
                            <option>Paint</option>
                            <option>Oil Finish</option>
                            <option>Lacquer</option>
                            <option>Natural/Unfinished</option>
                          </select>
                        </div>
                        <Field
                          label="Start Date"
                          value={projStart}
                          set={setProjStart}
                          type="date"
                          placeholder=""
                        />
                        <div className="sm:col-span-2">
                          <Field
                            label="Site Address"
                            value={projAddress}
                            set={setProjAddress}
                            placeholder="15 Oak Street, Sandton"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Notes</label>
                          <textarea
                            value={projNotes}
                            onChange={(e) => setProjNotes(e.target.value)}
                            rows={3}
                            placeholder="Any project notes or special requirements…"
                            className={`${inputCls} resize-none`}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSaveProject}
                        disabled={saving}
                        className={`mt-5 ${btnPrimary}`}
                      >
                        <Save className="w-4 h-4" />{" "}
                        {saving ? "Saving…" : "Log Project"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Live preview panel ────────────────────────────────── */}
            {(activeView === "invoice" ||
              activeView === "quote" ||
              activeView === "purchase_order") && (
              <div className="hidden xl:flex w-[380px] flex-shrink-0 flex-col border-l border-[#e2e8f0] bg-[#e8eaed] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex-shrink-0">
                  <TemplateSelector
                    user={{ uid: parentUid }}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[#e2e8f0] text-[#374151] text-xs font-medium rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                    <button
                      onClick={handleSavePDF}
                      disabled={isSavingPDF}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#ea580c] text-white text-xs font-medium rounded-lg hover:bg-[#c2410c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3 h-3" />
                      {isSavingPDF ? "Saving..." : "PDF"}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div
                    className="bg-white shadow-lg rounded origin-top"
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      transform: "scale(0.44)",
                      transformOrigin: "top left",
                      marginBottom: `calc((297mm * 0.44) - 297mm)`,
                    }}
                  >
                    {activeView === "purchase_order" ? (
                      <POTemplateRenderer {...poTemplateProps} />
                    ) : (
                      <TemplateRenderer {...templateProps} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Invoice Preview Modal (fullscreen) ──────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#1c1208] rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1e293b]">
                    {activeView === "purchase_order"
                      ? "P.O."
                      : docType === "quote"
                        ? "Quote"
                        : "Invoice"}{" "}
                    Preview
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    {activeView === "purchase_order"
                      ? poNumber
                      : docNumber || "Draft"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Save PDF
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
                style={{ width: "210mm", minHeight: "297mm" }}
              >
                {activeView === "purchase_order" ? (
                  <POTemplateRenderer {...poTemplateProps} />
                ) : (
                  <TemplateRenderer {...templateProps} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Client Modal ─────────────────────────────────────────────────────── */}
      <CustomerModal
        showModal={showClientModal}
        setShowModal={setShowClientModal}
        existingCustomer={null}
        onCustomerSaved={() => showToast("Client saved to main account")}
        overrideUid={parentUid}
      />

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

const Field = ({ label, value, set, type = "text", placeholder }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => set(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  </div>
);

const StepIndicator = ({ steps, currentStep, accentColor = "#ea580c" }) => (
  <div className="flex items-center gap-0 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm mb-4">
    {steps.map((step, idx) => (
      <React.Fragment key={step.number}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background:
                currentStep === step.number
                  ? accentColor
                  : currentStep > step.number
                    ? "#dcfce7"
                    : "#e2e8f0",
              color:
                currentStep === step.number
                  ? "#fff"
                  : currentStep > step.number
                    ? "#059669"
                    : "#94a3b8",
            }}
          >
            {currentStep > step.number ? "✓" : step.number}
          </div>
          <span
            className="text-xs font-medium hidden sm:block"
            style={{
              color:
                currentStep === step.number
                  ? accentColor
                  : currentStep > step.number
                    ? "#059669"
                    : "#94a3b8",
            }}
          >
            {step.title}
          </span>
        </div>
        {idx < steps.length - 1 && (
          <div
            className="flex-1 h-px mx-2"
            style={{
              background: currentStep > step.number ? "#059669" : "#e2e8f0",
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const StepCard = ({
  icon: Icon,
  title,
  subtitle,
  accentBg,
  accentIcon,
  children,
}) => (
  <div>
    <div className="flex items-center gap-3 mb-5">
      <div
        className={`w-9 h-9 ${accentBg} rounded-lg flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${accentIcon}`} />
      </div>
      <div>
        <h2 className="text-base font-bold text-[#1e293b]">{title}</h2>
        <p className="text-xs text-[#64748b]">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const CarpentryItemsTable = ({
  items,
  onRemove,
  onUpdate,
  subtotal,
  totalTax,
  total,
}) => {
  if (items.length === 0)
    return (
      <EmptyState
        icon={Wrench}
        text="No work items yet — use the form above to add items"
      />
    );
  return (
    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
        <span className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Work Items
        </span>
        <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
          {items.length} items
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e2e8f0]">
            <tr>
              {[
                "Category",
                "Phase",
                "Description",
                "Rate",
                "Qty",
                "VAT",
                "Total",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-xs font-semibold text-[#64748b] uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]"
              >
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#fff7ed] text-[#c2410c]">
                    {item.workCategory || "General"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#faf5ff] text-[#7c3aed]">
                    {item.phase || "Phase 1"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.description}
                    onChange={(e) =>
                      onUpdate(idx, "description", e.target.value)
                    }
                    className="w-full text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#ea580c] focus:outline-none rounded px-2 py-1 min-w-[120px]"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-[#94a3b8]">R</span>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        onUpdate(idx, "rate", Number(e.target.value))
                      }
                      className="w-20 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#ea580c] focus:outline-none rounded px-2 py-1"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) =>
                      onUpdate(idx, "qty", Number(e.target.value))
                    }
                    className="w-14 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#ea580c] focus:outline-none rounded px-2 py-1"
                    min="1"
                  />
                </td>
                <td className="px-3 py-2 text-[#64748b] text-sm">
                  R{Number(item.taxAmount || 0).toFixed(2)}
                </td>
                <td className="px-3 py-2.5 font-semibold text-[#1e293b]">
                  R{Number(item.totalAmount || item.amount || 0).toFixed(2)}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => onRemove(idx)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col items-end gap-1 text-sm">
        <div className="flex justify-between w-52 text-[#64748b]">
          <span>Subtotal</span>
          <span className="font-medium text-[#374151]">
            R{subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between w-52 text-[#64748b]">
          <span>VAT</span>
          <span className="font-medium text-[#374151]">
            R{totalTax.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between w-52 pt-2 border-t border-[#e2e8f0] font-bold text-[#1e293b]">
          <span>Total</span>
          <span className="text-[#ea580c]">R{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-10 text-center">
    <Icon className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
    <p className="text-sm font-medium text-[#94a3b8]">{text}</p>
  </div>
);

export default CarpentrySubAccountDashboard;
