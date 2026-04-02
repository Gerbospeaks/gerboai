// components/BusinessSettingsModal.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updatePortalSlug } from '../contexts/AuthContext';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { uploadLogoToR2 } from "../utils/uploadLogoToR2";
import {
  Settings,
  X,
  Upload,
  Building2,
  MapPin,
  Phone,
  CreditCard,
  CheckSquare,
  Send,
  Image,
  Zap,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import SignatureStamp from "./mechanics/SignatureStamp";

// ─── Gateway definitions ───────────────────────────────────────────────────────
const GATEWAYS = [
  {
    id: "payfast",
    label: "PayFast",
    region: "SA",
    desc: "Card, EFT & SnapScan",
    abbr: "PF",
    badgeColor: "bg-green-100 text-green-700",
    fields: [
      { key: "merchant_id", label: "Merchant ID", placeholder: "10000100" },
      { key: "merchant_key", label: "Merchant Key", placeholder: "q1cd2rdny4a53" },
      { key: "passphrase", label: "Passphrase", placeholder: "Your passphrase", type: "password" },
    ],
    hint: "Find these under Integration > Merchant Details in your PayFast dashboard.",
    docsUrl: "https://developers.payfast.co.za/docs",
  },
  {
    id: "yoco",
    label: "Yoco",
    region: "SA",
    desc: "Card payments for SA businesses",
    abbr: "YC",
    badgeColor: "bg-green-100 text-green-700",
    fields: [
      { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", type: "password" },
      { key: "public_key", label: "Public Key", placeholder: "pk_live_..." },
    ],
    hint: "Find your keys under Developers > API Keys in the Yoco business portal.",
    docsUrl: "https://developer.yoco.com/online/resources/sdks-plugins",
  },
  {
    id: "stripe",
    label: "Stripe",
    region: "Global",
    desc: "Cards, Apple Pay & Google Pay",
    abbr: "ST",
    badgeColor: "bg-blue-100 text-blue-700",
    fields: [
      { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", type: "password" },
      { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_..." },
      { key: "webhook_secret", label: "Webhook Secret (optional)", placeholder: "whsec_...", type: "password" },
    ],
    hint: "Get your keys at dashboard.stripe.com > Developers > API keys.",
    docsUrl: "https://stripe.com/docs/keys",
  },
  {
    id: "paypal",
    label: "PayPal",
    region: "Global",
    desc: "PayPal balance, card or bank",
    abbr: "PP",
    badgeColor: "bg-blue-100 text-blue-700",
    fields: [
      { key: "client_id", label: "Client ID", placeholder: "AaBbCc..." },
      { key: "client_secret", label: "Client Secret", placeholder: "EeFfGg...", type: "password" },
    ],
    hint: "Create credentials at developer.paypal.com > Apps & Credentials.",
    docsUrl: "https://developer.paypal.com/api/rest/",
  },
];

// ─── Single gateway row ────────────────────────────────────────────────────────
function GatewayRow({ gateway, saved, onSave }) {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(saved?.enabled ?? false);
  const [fields, setFields] = useState(() => {
    const init = {};
    gateway.fields.forEach((f) => { init[f.key] = saved?.[f.key] ?? ""; });
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  function handleToggle(e) {
    e.stopPropagation();
    const next = !enabled;
    setEnabled(next);
    if (next && !open) setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(gateway.id, { ...fields, enabled });
    setSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  }

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${enabled ? "border-blue-400" : "border-gray-200"}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Abbr badge */}
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
          {gateway.abbr}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-800">{gateway.label}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${gateway.badgeColor}`}>
              {gateway.region}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 truncate">{gateway.desc}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Toggle */}
          <button
            onClick={handleToggle}
            className={`relative w-8 h-4.5 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-blue-500" : "bg-gray-300"}`}
            style={{ width: 32, height: 18 }}
          >
            <span
              className="absolute top-0.5 rounded-full bg-white transition-all"
              style={{ width: 14, height: 14, left: enabled ? 16 : 2, transition: "left 0.2s" }}
            />
          </button>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>
      </div>

      {/* Expandable form */}
      {open && (
        <div className="px-3 pb-3 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-2 mt-3">
            {gateway.fields.map((f, i) => (
              <div
                key={f.key}
                className={`flex flex-col gap-1 ${gateway.fields.length === 3 && i === 0 ? "col-span-2" : ""}`}
              >
                <label className="text-[11px] font-semibold text-gray-600">{f.label}</label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={fields[f.key]}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-2">
            {gateway.hint}{" "}
            <a href={gateway.docsUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
              View docs →
            </a>
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {savedOk && (
              <span className="flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────
const BusinessSettingsModal = ({ onClose }) => {
  const { user, refreshUser, authUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [gatewayData, setGatewayData] = useState({});

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    primaryPhone: "",
    secondaryPhone: "",
    logoUrl: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
    emailProvider: "gmail",
    emailPassword: "",
  });

  const [stampSettings, setStampSettings] = useState({
    text: "APPROVED",
    color: "#d32f2f",
    showDate: true,
    enabled: false,
  });

  useEffect(() => {
    if (user?.uid) {
      loadBusinessInfo();
      loadGatewayData();
    }
  }, [user]);

  const loadBusinessInfo = async () => {
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBusinessInfo(data);
        if (data.stampSettings) setStampSettings(data.stampSettings);
      }
    } catch (error) {
      console.error("Error loading business info:", error);
    }
  };

  const loadGatewayData = async () => {
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "settings", "paymentGateways"));
      if (snap.exists()) setGatewayData(snap.data());
    } catch (error) {
      console.error("Error loading gateway data:", error);
    }
  };

  const handleGatewaySave = async (gatewayId, fields) => {
    if (!user?.uid) return;
    const updated = { ...gatewayData, [gatewayId]: fields };
    setGatewayData(updated);
    await setDoc(
      doc(db, "users", user.uid, "settings", "paymentGateways"),
      updated,
      { merge: true }
    );
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    if (!file.type.startsWith("image/")) return alert("Please upload an image file.");
    if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB.");
    try {
      setUploading(true);
      const authUser = getAuth().currentUser;
      if (!authUser) throw new Error("Not authenticated");
      const logoUrl = await uploadLogoToR2(file, authUser);
      await updateDoc(doc(db, "users", user.uid), { logoUrl });
      setBusinessInfo((prev) => ({ ...prev, logoUrl }));
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.uid) return;
    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "businessInfo");
      await setDoc(docRef, { ...businessInfo, stampSettings });
      if (user?.dashboardId === "education" && businessInfo?.businessName) {
        await updatePortalSlug(user.uid, businessInfo.businessName);
      }
      await refreshUser();
      onClose();
    } catch (error) {
      console.error("Error saving business info:", error);
    }
  };

  const handleTestEmail = async () => {
    // your existing test email logic here
  };

  const saGateways = GATEWAYS.filter((g) => g.region === "SA");
  const intlGateways = GATEWAYS.filter((g) => g.region === "Global");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:rounded-xl sm:max-w-5xl sm:h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-800">Business Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden">
          {/* LEFT COLUMN */}
          <div className="lg:border-r border-gray-200 flex flex-col overflow-y-auto">
            {/* Logo */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Image className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Logo</span>
              </div>
              <div className="px-4 sm:px-5 py-4 flex items-center gap-4">
                {businessInfo.logoUrl ? (
                  <img
                    src={businessInfo.logoUrl}
                    alt="Logo"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain border border-gray-200 rounded-lg bg-white flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    {uploading ? "Uploading..." : businessInfo.logoUrl ? "Change Logo" : "Upload Logo"}
                  </label>
                  <p className="text-xs text-gray-400 mt-1.5">Square image, PNG or JPG, max 5 MB</p>
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Building2 className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Information</span>
              </div>
              <div className="px-4 sm:px-5 py-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Business Name</label>
                  <input
                    type="text"
                    value={businessInfo.businessName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="e.g. Solidflo Invoicing SaaS"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</span>
              </div>
              <div className="px-4 sm:px-5 py-4 grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Address Line 1</label>
                  <input
                    type="text"
                    value={businessInfo.addressLine1}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="9-10 CNR Third & Arkwright Ave"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Address Line 2</label>
                  <input
                    type="text"
                    value={businessInfo.addressLine2}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="Wynberg"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">City</label>
                  <input
                    type="text"
                    value={businessInfo.city}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="Sandton"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    value={businessInfo.postalCode}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="2090"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="border-b border-gray-200 lg:border-b-0">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</span>
              </div>
              <div className="px-4 sm:px-5 py-4 grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={businessInfo.primaryPhone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, primaryPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="082 514 4509"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Secondary Phone</label>
                  <input
                    type="tel"
                    value={businessInfo.secondaryPhone}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, secondaryPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="084 583 9929"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col overflow-y-auto border-t border-gray-200 lg:border-t-0">
            {/* Bank Details */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Details</span>
              </div>
              <div className="px-4 sm:px-5 py-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Bank Name", key: "bankName", placeholder: "e.g. FNB" },
                  { label: "Account Holder", key: "accountHolder", placeholder: "e.g. Acme Pty Ltd" },
                  { label: "Account Number", key: "accountNumber", placeholder: "e.g. 62123456789" },
                  { label: "Branch Code", key: "branchCode", placeholder: "e.g. 250655" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">{label}</label>
                    <input
                      type="text"
                      value={businessInfo[key] || ""}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, [key]: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Payment Gateways ─────────────────────────────────────────── */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Zap className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Gateways</span>
              </div>
              <div className="px-4 sm:px-5 py-4 space-y-3">
                {/* Promo hint */}
                <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm flex-shrink-0">💳</span>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Enable a gateway and your clients will see a <strong>Pay Now</strong> button on every invoice you send.
                  </p>
                </div>

                {/* SA */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">South Africa</p>
                <div className="space-y-2">
                  {saGateways.map((gw) => (
                    <GatewayRow key={gw.id} gateway={gw} saved={gatewayData[gw.id]} onSave={handleGatewaySave} />
                  ))}
                </div>

                {/* International */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-1">International</p>
                <div className="space-y-2">
                  {intlGateways.map((gw) => (
                    <GatewayRow key={gw.id} gateway={gw} saved={gatewayData[gw.id]} onSave={handleGatewaySave} />
                  ))}
                </div>
              </div>
            </div>

            {/* Invoice Stamp */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <CheckSquare className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Stamp</span>
              </div>
              <div className="px-4 sm:px-5 py-4 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stampSettings.enabled}
                    onChange={(e) => setStampSettings({ ...stampSettings, enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Show approval stamp on invoices and quotes
                  </span>
                </label>
                {stampSettings.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Stamp Text</label>
                      <input
                        type="text"
                        value={stampSettings.text}
                        onChange={(e) => setStampSettings({ ...stampSettings, text: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-sm font-bold uppercase border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        placeholder="APPROVED"
                        maxLength={15}
                      />
                      <p className="text-xs text-gray-400">Max 15 characters</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Stamp Color</label>
                      <select
                        value={stampSettings.color}
                        onChange={(e) => setStampSettings({ ...stampSettings, color: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer"
                      >
                        <option value="#d32f2f">🔴 Red — Traditional</option>
                        <option value="#1976d2">🔵 Blue — Professional</option>
                        <option value="#388e3c">🟢 Green — Approved</option>
                        <option value="#7b1fa2">🟣 Purple — Premium</option>
                        <option value="#000000">⚫ Black — Formal</option>
                        <option value="#f57c00">🟠 Orange — Attention</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stampSettings.showDate}
                          onChange={(e) => setStampSettings({ ...stampSettings, showDate: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-gray-700">Include date on stamp</span>
                      </label>
                    </div>
                    <div className="col-span-2 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</p>
                      <SignatureStamp
                        text={stampSettings.text}
                        color={stampSettings.color}
                        showDate={stampSettings.showDate}
                        rotation={-5}
                        size="medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Email Configuration */}
            <div>
              <div className="px-4 sm:px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Send className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Configuration</span>
              </div>
              <div className="px-4 sm:px-5 py-4 space-y-3">
                <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm flex-shrink-0">✉️</span>
                  <div>
                    <p className="text-xs font-semibold text-blue-800">{user?.email || authUser?.email}</p>
                    <p className="text-xs text-blue-500 mt-0.5">Quotes and invoices will be sent from this address.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email Provider</label>
                    <select
                      value={businessInfo.emailProvider || "gmail"}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, emailProvider: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer"
                    >
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook / Hotmail</option>
                      <option value="yahoo">Yahoo Mail</option>
                      <option value="other">Other SMTP</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      App Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={businessInfo.emailPassword || ""}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, emailPassword: e.target.value })}
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </div>
                {(businessInfo.emailProvider === "gmail" || !businessInfo.emailProvider) && (
                  <details className="border border-orange-200 bg-orange-50 rounded-lg overflow-hidden">
                    <summary className="px-4 py-2.5 text-xs font-semibold text-orange-800 cursor-pointer select-none">
                      📖 How to get a Gmail App Password
                    </summary>
                    <ol className="px-5 pb-3 pt-1 text-xs text-orange-800 space-y-1 list-decimal">
                      <li>Go to <strong>myaccount.google.com → Security</strong></li>
                      <li>Enable <strong>2-Step Verification</strong></li>
                      <li>Search for <strong>"App passwords"</strong> and create one</li>
                      <li>Copy the 16-character code and paste it above</li>
                    </ol>
                    <a
                      href="https://support.google.com/accounts/answer/185833"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 pb-3 text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View Google instructions →
                    </a>
                  </details>
                )}
                {businessInfo.emailProvider === "outlook" && (
                  <details className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
                    <summary className="px-4 py-2.5 text-xs font-semibold text-blue-800 cursor-pointer select-none">
                      📖 How to get an Outlook App Password
                    </summary>
                    <ol className="px-5 pb-3 pt-1 text-xs text-blue-800 space-y-1 list-decimal">
                      <li>Go to <strong>account.microsoft.com/security</strong></li>
                      <li>Click <strong>Advanced security options → App passwords</strong></li>
                      <li>Create a new app password and paste it above</li>
                    </ol>
                    <a
                      href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 pb-3 text-xs text-blue-600 font-semibold hover:underline"
                    >
                      View Microsoft instructions →
                    </a>
                  </details>
                )}
                <button
                  onClick={handleTestEmail}
                  disabled={!businessInfo.emailPassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {businessInfo.emailPassword ? "Send Test Email" : "Enter App Password First"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveBusinessInfo}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsModal;
