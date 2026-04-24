/**
 * SubAccountDashboard.jsx
 *
 * A restricted dashboard for sub-users under a main registered account.
 * Permitted actions ONLY:
 *   ✅ Create Invoice
 *   ✅ Create Quote
 *   ✅ Create Purchase Order
 *   ✅ Add Client
 *   ✅ Add Vehicle
 *   ✅ Add Part (Parts Inventory)
 *
 * All data is scoped to the PARENT (main) account's Firestore UID.
 * Sub-user's own UID is used only for audit logging (createdBy field).
 *
 * Drop-in usage:
 *   <SubAccountDashboard parentUid="MAIN_ACCOUNT_UID" subUser={authUser} />
 *
 * Or, if you store parentUid on the sub-user's Firestore profile, fetch it
 * in your AuthContext and pass it here.
 */

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
  Car,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LogOut,
  Package,
  Plus,
  Receipt,
  Save,
  Truck,
  Users,
  Wrench,
  X,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  Menu,
  Eye,
  Download,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";

// ─── Re-use your existing components ────────────────────────────────────────
// Adjust these import paths to match your project structure:
import { TemplateRenderer } from "./TemplateSelector";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import CustomerModal from "../CustomerModal";

// ─── Firestore helpers ───────────────────────────────────────────────────────
const db = getFirestore();

const generateDocNumber = async (parentUid, docType) => {
  const year = new Date().getFullYear();
  const map = {
    invoice: { col: "invoices", prefix: "INV" },
    quote: { col: "quotations", prefix: "QT" },
    purchase_order: { col: "purchaseOrders", prefix: "PO" },
  };
  const { col, prefix } = map[docType];
  const ref = collection(db, "users", parentUid, col);
  const snap = await getDocs(
    query(ref, orderBy("createdAt", "desc"), limit(1)),
  );
  let last = 0;
  if (!snap.empty) {
    const match = snap.docs[0].data().docNumber?.match(/(\d+)$/);
    if (match) last = Number(match[1]);
  }
  return `${prefix}-${year}-${String(last + 1).padStart(4, "0")}`;
};

// ─── Toast notification ──────────────────────────────────────────────────────
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
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors} animate-in slide-in-from-bottom-4`}
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

// ─── Shared CSS tokens ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const labelCls =
  "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";
const selectCls =
  "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition-colors";
const btnPrimary =
  "flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondary =
  "flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#374151] text-sm font-medium rounded-lg transition-colors shadow-sm";

// ─── NAV CONFIG ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "invoice", label: "New Invoice", icon: FileText, accent: "#2563eb" },
  { id: "quote", label: "New Quote", icon: Receipt, accent: "#0d9488" },
  {
    id: "purchase_order",
    label: "Purchase Order",
    icon: Truck,
    accent: "#7c3aed",
  },
  { id: "add_client", label: "Add Client", icon: Users, accent: "#059669" },
  { id: "add_vehicle", label: "Add Vehicle", icon: Car, accent: "#0284c7" },
  { id: "add_part", label: "Add Part", icon: Package, accent: "#ea580c" },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const SubAccountDashboard = ({ parentUid, subUser }) => {
  // ── layout ───────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("invoice");
  const [toast, setToast] = useState(null);

  // ── shared ───────────────────────────────────────────────────────────────
  const [businessInfo, setBusinessInfo] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Invoice / Quote ───────────────────────────────────────────────────────
  const [docType, setDocType] = useState("invoice"); // "invoice" | "quote"
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

  // vehicle
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleMileage, setVehicleMileage] = useState("");
  const [preAuth, setPreAuth] = useState("");
  const [authCode, setAuthCode] = useState("");

  // line items
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    rate: "",
    qty: "",
    type: "Labor",
  });

  const subtotal = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const vat = subtotal * (vatRate / 100);
  const total = subtotal + vat;

  // ── Purchase Order ────────────────────────────────────────────────────────
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
    unit: "ea",
    unitPrice: 0,
  });
  const [poNotes, setPoNotes] = useState("");
  const [poPaymentTerms, setPoPaymentTerms] = useState("30 Days");
  const [poShipping, setPoShipping] = useState("");

  const poSubtotal = poItems.reduce((s, i) => s + Number(i.amount || 0), 0);
  const poVat = poSubtotal * 0.15;
  const poTotal = poSubtotal + poVat;

  // ── Add Vehicle form ──────────────────────────────────────────────────────
  const [vMake, setVMake] = useState("");
  const [vModel, setVModel] = useState("");
  const [vYear, setVYear] = useState("");
  const [vReg, setVReg] = useState("");
  const [vVin, setVVin] = useState("");
  const [vMileage, setVMileage] = useState("");
  const [vOwner, setVOwner] = useState("");
  const [vColor, setVColor] = useState("");

  // ── Add Part form ─────────────────────────────────────────────────────────
  const [partName, setPartName] = useState("");
  const [partSku, setPartSku] = useState("");
  const [partQty, setPartQty] = useState("");
  const [partPrice, setPartPrice] = useState("");
  const [partSupplier, setPartSupplier] = useState("");
  const [partCategory, setPartCategory] = useState("Engine");
  const [partReorder, setPartReorder] = useState("");

  // ── Add Client modal ──────────────────────────────────────────────────────
  const [showClientModal, setShowClientModal] = useState(false);

  // ─── Load business info ──────────────────────────────────────────────────
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

  // ─── Generate doc numbers when view changes ──────────────────────────────
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

  // ─── Helpers ─────────────────────────────────────────────────────────────
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
    setVehicleMake("");
    setVehicleModel("");
    setVehicleYear("");
    setVehicleReg("");
    setVehicleVin("");
    setVehicleMileage("");
    setPreAuth("");
    setAuthCode("");
    setItems([]);
    if (parentUid) {
      const n = await generateDocNumber(parentUid, docType);
      setDocNumber(n);
    }
  }, [parentUid, docType]);

  // ─── Line item handlers ───────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!newItem.description || !newItem.qty) return;
    const rate = Number(newItem.rate) || 0;
    const qty = Number(newItem.qty);
    setItems((prev) => [
      ...prev,
      { ...newItem, rate, qty, amount: rate * qty },
    ]);
    setNewItem({ description: "", rate: "", qty: "", type: "Labor" });
  };
  const handleRemoveItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const handleUpdateItem = (i, field, val) =>
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== i) return item;
        const u = { ...item, [field]: val };
        if (field === "rate" || field === "qty")
          u.amount = Number(u.rate) * Number(u.qty);
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
    setNewPoItem({ description: "", qty: 1, unit: "ea", unitPrice: 0 });
  };
  const handleRemovePoItem = (i) =>
    setPoItems((prev) => prev.filter((_, idx) => idx !== i));

  // ─── Save Invoice / Quote ─────────────────────────────────────────────────
  const handleSaveDoc = async () => {
    if (!parentUid) return;
    setSaving(true);
    try {
      const col = docType === "quote" ? "quotations" : "invoices";
      const payload = {
        docNumber,
        jobCardNumber: docNumber,
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
        vehicle: {
          make: vehicleMake,
          model: vehicleModel,
          year: vehicleYear,
          registration: vehicleReg,
          vin: vehicleVin,
          mileage: vehicleMileage,
          preAuth,
          authCode,
        },
        items,
        vatRate,
        totals: { subtotal, vat, total, paid: 0, due: total },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (docId) {
        await updateDoc(doc(db, "users", parentUid, col, docId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        showToast(
          `${docType === "quote" ? "Quote" : "Invoice"} updated successfully`,
        );
      } else {
        const ref = await addDoc(
          collection(db, "users", parentUid, col),
          payload,
        );
        setDocId(ref.id);
        showToast(
          `${docType === "quote" ? "Quote" : "Invoice"} saved — ${docNumber}`,
        );
      }
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Purchase Order ──────────────────────────────────────────────────
  const handleSavePO = async () => {
    if (!parentUid) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", parentUid, "purchaseOrders"), {
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
      });
      showToast(`Purchase Order ${poNumber} saved`);
      // reset PO form
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

  // ─── Save Vehicle ─────────────────────────────────────────────────────────
  const handleSaveVehicle = async () => {
    if (!parentUid || !vMake || !vReg) {
      showToast("Make and Registration are required", "error");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", parentUid, "vehicles"), {
        make: vMake,
        model: vModel,
        year: vYear,
        registration: vReg,
        vin: vVin,
        mileage: vMileage,
        owner: vOwner,
        color: vColor,
        createdBy: subUser?.uid || "subuser",
        subUserEmail: subUser?.email || "",
        createdAt: serverTimestamp(),
      });
      showToast(`Vehicle ${vReg} added`);
      setVMake("");
      setVModel("");
      setVYear("");
      setVReg("");
      setVVin("");
      setVMileage("");
      setVOwner("");
      setVColor("");
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Part ────────────────────────────────────────────────────────────
  const handleSavePart = async () => {
    if (!parentUid || !partName) {
      showToast("Part name is required", "error");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", parentUid, "partsInventory"), {
        name: partName,
        sku: partSku,
        qty: Number(partQty) || 0,
        price: Number(partPrice) || 0,
        supplier: partSupplier,
        category: partCategory,
        reorderPoint: Number(partReorder) || 0,
        createdBy: subUser?.uid || "subuser",
        subUserEmail: subUser?.email || "",
        createdAt: serverTimestamp(),
      });
      showToast(`Part "${partName}" added`);
      setPartName("");
      setPartSku("");
      setPartQty("");
      setPartPrice("");
      setPartSupplier("");
      setPartReorder("");
    } catch (e) {
      showToast("Save failed: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (_) {}
  };

  // ─── Invoice/Quote steps ──────────────────────────────────────────────────
  const invoiceSteps = [
    { number: 1, title: "Client", icon: Users },
    { number: 2, title: "Bill To", icon: FileText },
    { number: 3, title: "Vehicle", icon: Car },
    { number: 4, title: "Services", icon: Wrench },
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
    <div className="h-screen w-full flex overflow-hidden bg-[#f0f2f5]">
      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col bg-[#0f172a] transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? "w-56" : "w-14"
        }`}
      >
        {/* Logo / toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-[#2563eb] rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {businessInfo.businessName || "SubAccount"}
                </p>
                <p className="text-[10px] text-white/40 truncate">
                  {subUser?.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {sidebarOpen && (
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest px-2 pb-1.5">
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
                }}
                title={!sidebarOpen ? label : undefined}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                }`}
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
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sub-user badge + logout */}
        <div className="px-2 pb-3 border-t border-white/10 pt-3 space-y-1">
          {sidebarOpen && (
            <div className="px-2 py-1.5 mb-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wide">
                Sub Account
              </p>
              <p className="text-[10px] text-white/50 truncate">
                Read-only billing access
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
            title={!sidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#e2e8f0] shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-[#1e293b]">
              {NAV_ITEMS.find((n) => n.id === activeView)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-[#64748b]">
              Scoped to:{" "}
              <span className="font-semibold text-[#374151]">
                {businessInfo.businessName || parentUid}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick new invoice/quote */}
            {(activeView === "invoice" || activeView === "quote") && (
              <>
                <button onClick={resetInvoiceForm} className={btnSecondary}>
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
                <button
                  onClick={handleSaveDoc}
                  disabled={saving}
                  className={btnPrimary}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            )}
            {activeView === "purchase_order" && (
              <button
                onClick={handleSavePO}
                disabled={saving}
                className={btnPrimary}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save P.O."}
              </button>
            )}
            {activeView === "add_vehicle" && (
              <button
                onClick={handleSaveVehicle}
                disabled={saving}
                className={btnPrimary}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Vehicle"}
              </button>
            )}
            {activeView === "add_part" && (
              <button
                onClick={handleSavePart}
                disabled={saving}
                className={btnPrimary}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Part"}
              </button>
            )}
            {activeView === "add_client" && (
              <button
                onClick={() => setShowClientModal(true)}
                className={btnPrimary}
              >
                <Plus className="w-3.5 h-3.5" /> Add Client
              </button>
            )}
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── INVOICE / QUOTE BUILDER ─────────────────────────────────── */}
          {(activeView === "invoice" || activeView === "quote") && (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              {/* Doc type toggle */}
              <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      activeView === "invoice" ? "#eff6ff" : "#f0fdfa",
                  }}
                >
                  {activeView === "invoice" ? (
                    <FileText className="w-5 h-5 text-[#2563eb]" />
                  ) : (
                    <Receipt className="w-5 h-5 text-[#0d9488]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1e293b]">
                    {activeView === "invoice" ? "New Invoice" : "New Quote"} —{" "}
                    <span className="text-[#2563eb]">{docNumber}</span>
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
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeView === "invoice"
                        ? "bg-white text-[#2563eb] shadow-sm"
                        : "text-[#64748b] hover:text-[#374151]"
                    }`}
                  >
                    Invoice
                  </button>
                  <button
                    onClick={() => {
                      setActiveView("quote");
                      setDocType("quote");
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeView === "quote"
                        ? "bg-white text-[#0d9488] shadow-sm"
                        : "text-[#64748b] hover:text-[#374151]"
                    }`}
                  >
                    Quote
                  </button>
                </div>
              </div>

              {/* Step indicator */}
              <StepIndicator steps={invoiceSteps} currentStep={currentStep} />

              {/* Step content */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Step 1 — Client */}
                  {currentStep === 1 && (
                    <StepCard
                      icon={Users}
                      title="Client Details"
                      subtitle="Who is this invoice for?"
                      accentBg="bg-[#eff6ff]"
                      accentIcon="text-[#2563eb]"
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
                        className="mt-3 flex items-center gap-2 text-[#2563eb] text-sm font-medium hover:underline"
                      >
                        <Users className="w-4 h-4" /> Copy from Client
                      </button>
                    </StepCard>
                  )}

                  {/* Step 3 — Vehicle */}
                  {currentStep === 3 && (
                    <StepCard
                      icon={Car}
                      title="Vehicle Information"
                      subtitle="Enter the vehicle details"
                      accentBg="bg-[#f0f9ff]"
                      accentIcon="text-[#0284c7]"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Make *"
                          value={vehicleMake}
                          set={setVehicleMake}
                          placeholder="Toyota"
                        />
                        <Field
                          label="Model *"
                          value={vehicleModel}
                          set={setVehicleModel}
                          placeholder="Hilux"
                        />
                        <Field
                          label="Year *"
                          value={vehicleYear}
                          set={setVehicleYear}
                          placeholder="2020"
                        />
                        <Field
                          label="Registration *"
                          value={vehicleReg}
                          set={setVehicleReg}
                          placeholder="ABC 123 GP"
                        />
                        <Field
                          label="VIN"
                          value={vehicleVin}
                          set={setVehicleVin}
                          placeholder="1HGBH41JXMN109186"
                        />
                        <Field
                          label="Mileage (km)"
                          value={vehicleMileage}
                          set={setVehicleMileage}
                          placeholder="45000"
                        />
                        <Field
                          label="Pre Auth"
                          value={preAuth}
                          set={setPreAuth}
                          placeholder="AUTH123"
                        />
                        <Field
                          label="Auth Code"
                          value={authCode}
                          set={setAuthCode}
                          placeholder="456789"
                        />
                      </div>
                    </StepCard>
                  )}

                  {/* Step 4 — Services */}
                  {currentStep === 4 && (
                    <StepCard
                      icon={Wrench}
                      title="Services & Parts"
                      subtitle="Add line items to the invoice"
                      accentBg="bg-[#f8fafc]"
                      accentIcon="text-[#475569]"
                    >
                      {/* Add item */}
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide mb-3">
                          Add Item
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div>
                            <label className={labelCls}>Type</label>
                            <select
                              value={newItem.type}
                              onChange={(e) =>
                                setNewItem({ ...newItem, type: e.target.value })
                              }
                              className={selectCls}
                            >
                              <option>Labor</option>
                              <option>Parts</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className={labelCls}>Description</label>
                            <input
                              className={inputCls}
                              placeholder="Work / part description"
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
                            <label className={labelCls}>Rate (R)</label>
                            <input
                              type="number"
                              className={inputCls}
                              placeholder="0.00"
                              value={newItem.rate}
                              onChange={(e) =>
                                setNewItem({ ...newItem, rate: e.target.value })
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
                                setNewItem({ ...newItem, qty: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleAddItem}
                          className={`mt-3 ${btnPrimary}`}
                        >
                          <Plus className="w-4 h-4" /> Add Item
                        </button>
                      </div>

                      {/* Items table */}
                      <ItemsTable
                        items={items}
                        onRemove={handleRemoveItem}
                        onUpdate={handleUpdateItem}
                        subtotal={subtotal}
                        vat={vat}
                        total={total}
                        vatRate={vatRate}
                        setVatRate={setVatRate}
                        emptyIcon={Wrench}
                        emptyText="No items yet"
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
                          ["Type", docType === "quote" ? "Quote" : "Invoice"],
                          ["Client", customerName || "—"],
                          [
                            "Vehicle",
                            [vehicleYear, vehicleMake, vehicleModel]
                              .filter(Boolean)
                              .join(" ") || "—",
                          ],
                          ["Registration", vehicleReg || "—"],
                          ["Items", `${items.length} line item(s)`],
                          ["Subtotal", `R${subtotal.toFixed(2)}`],
                          [`VAT (${vatRate}%)`, `R${vat.toFixed(2)}`],
                          ["Total", `R${total.toFixed(2)}`],
                        ].map(([k, v]) => (
                          <div
                            key={k}
                            className="flex items-center justify-between px-4 py-2.5 border-b border-[#f1f5f9] last:border-0 text-sm"
                          >
                            <span className="text-[#64748b]">{k}</span>
                            <span
                              className={`font-semibold ${k === "Total" ? "text-[#2563eb] text-base" : "text-[#1e293b]"}`}
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
                    onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
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
                      <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PURCHASE ORDER ──────────────────────────────────────────────── */}
          {activeView === "purchase_order" && (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              <div className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-sm">
                <div className="w-9 h-9 bg-[#faf5ff] rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">
                    Purchase Order —{" "}
                    <span className="text-[#7c3aed]">{poNumber}</span>
                  </p>
                  <p className="text-xs text-[#64748b]">
                    Order parts from a supplier
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
                      subtitle="Vendor information"
                      accentBg="bg-[#eff6ff]"
                      accentIcon="text-[#2563eb]"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field
                          label="Supplier Name *"
                          value={supplierName}
                          set={setSupplierName}
                          placeholder="ABC Parts"
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
                          placeholder="Workshop name"
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
                          placeholder="Courier / Collection"
                        />
                        <div className="sm:col-span-2">
                          <Field
                            label="Delivery Address"
                            value={deliveryAddress}
                            set={setDeliveryAddress}
                            placeholder="Delivery address"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDeliveryName(businessInfo.businessName || "");
                          setDeliveryAddress(businessInfo.addressLine1 || "");
                        }}
                        className="mt-3 flex items-center gap-2 text-[#2563eb] text-sm font-medium hover:underline"
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
                      subtitle="Parts and items to order"
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
                              placeholder="Part name"
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
                              <option>ea</option>
                              <option>set</option>
                              <option>ltr</option>
                              <option>kg</option>
                              <option>m</option>
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
                                        onClick={() => handleRemovePoItem(idx)}
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
                        <EmptyState icon={Package} text="No items added yet" />
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
                          placeholder="Any delivery notes…"
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
                    onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
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

          {/* ── ADD CLIENT ─────────────────────────────────────────────────── */}
          {activeView === "add_client" && (
            <div className="max-w-xl mx-auto px-4 py-10 text-center">
              <div className="w-16 h-16 bg-[#f0fdf4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#059669]" />
              </div>
              <h2 className="text-lg font-bold text-[#1e293b] mb-1">
                Add a Client
              </h2>
              <p className="text-sm text-[#64748b] mb-6">
                Click below to open the client form. The client will be saved
                under the main account.
              </p>
              <button
                onClick={() => setShowClientModal(true)}
                className={`${btnPrimary} mx-auto`}
              >
                <Plus className="w-4 h-4" /> Open Client Form
              </button>
            </div>
          )}

          {/* ── ADD VEHICLE ────────────────────────────────────────────────── */}
          {activeView === "add_vehicle" && (
            <div className="max-w-2xl mx-auto px-4 py-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#f0f9ff] rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-[#0284c7]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1e293b]">
                      Add Vehicle
                    </h2>
                    <p className="text-xs text-[#64748b]">
                      Saved to the main account's vehicle registry
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Make *"
                      value={vMake}
                      set={setVMake}
                      placeholder="Toyota"
                    />
                    <Field
                      label="Model"
                      value={vModel}
                      set={setVModel}
                      placeholder="Hilux"
                    />
                    <Field
                      label="Year"
                      value={vYear}
                      set={setVYear}
                      placeholder="2020"
                    />
                    <Field
                      label="Registration *"
                      value={vReg}
                      set={setVReg}
                      placeholder="ABC 123 GP"
                    />
                    <Field
                      label="VIN"
                      value={vVin}
                      set={setVVin}
                      placeholder="1HGBH41JXMN109186"
                    />
                    <Field
                      label="Colour"
                      value={vColor}
                      set={setVColor}
                      placeholder="Silver"
                    />
                    <Field
                      label="Mileage (km)"
                      value={vMileage}
                      set={setVMileage}
                      placeholder="45000"
                    />
                    <Field
                      label="Owner / Client Name"
                      value={vOwner}
                      set={setVOwner}
                      placeholder="John Smith"
                    />
                  </div>
                  <button
                    onClick={handleSaveVehicle}
                    disabled={saving}
                    className={`mt-5 ${btnPrimary}`}
                  >
                    <Save className="w-4 h-4" />{" "}
                    {saving ? "Saving…" : "Save Vehicle"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ADD PART ───────────────────────────────────────────────────── */}
          {activeView === "add_part" && (
            <div className="max-w-2xl mx-auto px-4 py-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#fff7ed] rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-[#ea580c]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1e293b]">
                      Add Part to Inventory
                    </h2>
                    <p className="text-xs text-[#64748b]">
                      Saved to the main account's parts inventory
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Part Name *"
                      value={partName}
                      set={setPartName}
                      placeholder="Oil Filter"
                    />
                    <Field
                      label="SKU / Part Number"
                      value={partSku}
                      set={setPartSku}
                      placeholder="OIL-FLT-001"
                    />
                    <div>
                      <label className={labelCls}>Category</label>
                      <select
                        className={selectCls}
                        value={partCategory}
                        onChange={(e) => setPartCategory(e.target.value)}
                      >
                        {[
                          "Engine",
                          "Brakes",
                          "Suspension",
                          "Electrical",
                          "Body",
                          "Tyres",
                          "Fluids",
                          "Filters",
                          "Other",
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <Field
                      label="Quantity in Stock"
                      value={partQty}
                      set={setPartQty}
                      type="number"
                      placeholder="10"
                    />
                    <Field
                      label="Selling Price (R)"
                      value={partPrice}
                      set={setPartPrice}
                      type="number"
                      placeholder="150.00"
                    />
                    <Field
                      label="Reorder Point"
                      value={partReorder}
                      set={setPartReorder}
                      type="number"
                      placeholder="2"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Supplier"
                        value={partSupplier}
                        set={setPartSupplier}
                        placeholder="ABC Spares"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSavePart}
                    disabled={saving}
                    className={`mt-5 ${btnPrimary}`}
                  >
                    <Save className="w-4 h-4" />{" "}
                    {saving ? "Saving…" : "Save Part"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CLIENT MODAL (reuse existing) ─────────────────────────────────── */}
      <CustomerModal
        showModal={showClientModal}
        setShowModal={setShowClientModal}
        existingCustomer={null}
        onCustomerSaved={() => showToast("Client saved to main account")}
        // Override the uid so saves go to the parent account, not sub-user:
        overrideUid={parentUid}
      />

      {/* ── TOAST ────────────────────────────────────────────────────────── */}
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

/** Simple labelled input */
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

/** Step progress indicator */
const StepIndicator = ({ steps, currentStep, accentColor = "#2563eb" }) => (
  <div className="flex items-center gap-0 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 shadow-sm">
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

/** Section card with icon header */
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

/** Editable items table */
const ItemsTable = ({
  items,
  onRemove,
  onUpdate,
  subtotal,
  vat,
  total,
  vatRate,
  setVatRate,
  emptyIcon: EmptyIcon,
  emptyText,
}) => {
  if (items.length === 0)
    return <EmptyState icon={EmptyIcon} text={emptyText} />;
  return (
    <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
        <span className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Line Items
        </span>
        <span className="text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded-full">
          {items.length} items
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e2e8f0]">
            <tr>
              {["Type", "Description", "Rate", "Qty", "Amount", ""].map((h) => (
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
                  <select
                    value={item.type}
                    onChange={(e) => onUpdate(idx, "type", e.target.value)}
                    className="text-xs font-semibold rounded px-2 py-1 border border-[#e2e8f0] focus:outline-none cursor-pointer"
                    style={{
                      background: item.type === "Labor" ? "#eff6ff" : "#f0fdf4",
                      color: item.type === "Labor" ? "#1d4ed8" : "#166534",
                    }}
                  >
                    <option>Labor</option>
                    <option>Parts</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={item.description}
                    onChange={(e) =>
                      onUpdate(idx, "description", e.target.value)
                    }
                    className="w-full text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none rounded px-2 py-1 min-w-[120px]"
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
                      className="w-20 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none rounded px-2 py-1"
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
                    className="w-14 text-sm text-[#374151] bg-transparent border border-transparent hover:border-[#e2e8f0] focus:border-[#2563eb] focus:outline-none rounded px-2 py-1"
                    min="1"
                  />
                </td>
                <td className="px-3 py-2.5 font-semibold text-[#1e293b]">
                  R{(Number(item.rate) * Number(item.qty)).toFixed(2)}
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
        <div className="flex items-center justify-between w-52 text-[#64748b]">
          <label className="flex items-center gap-1.5">
            <span>VAT</span>
            <div className="flex items-center border border-[#d1d5db] rounded-md overflow-hidden bg-white">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-12 px-1.5 py-0.5 text-xs text-center text-[#1e293b] focus:outline-none"
              />
              <span className="px-1.5 text-xs text-[#64748b] bg-[#f1f5f9] border-l border-[#d1d5db]">
                %
              </span>
            </div>
          </label>
          <span className="font-medium text-[#374151]">R{vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-52 pt-2 border-t border-[#e2e8f0] font-bold text-[#1e293b]">
          <span>Total</span>
          <span className="text-[#2563eb]">R{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

/** Empty state placeholder */
const EmptyState = ({ icon: Icon, text }) => (
  <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl py-10 text-center">
    <Icon className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2" />
    <p className="text-sm font-medium text-[#94a3b8]">{text}</p>
  </div>
);

export default SubAccountDashboard;
