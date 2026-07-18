// UPDATE your GuestModal.jsx to include booking option

import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import {
  X, User, Phone, Mail, MapPin, Globe,
  CreditCard, Save, AlertCircle, Key,
} from "lucide-react";

const ID_TYPES = ["ID Document", "Passport", "Driver's Licence", "Refugee Document", "Other"];
const NATIONALITIES = [
  "South African", "Zimbabwean", "Mozambican", "Botswanan", "Namibian",
  "Zambian", "Malawian", "Nigerian", "Kenyan", "Ghanaian",
  "British", "American", "German", "French", "Dutch",
  "Australian", "Chinese", "Indian", "Brazilian", "Other",
];

const EMPTY = {
  name: "", guestId: "", email: "", phone: "", address: "",
  dateOfBirth: "", nationality: "Zimbabwean",
  idType: "ID Document", idNumber: "",
  preferredRoom: "", dietaryRequirements: "",
  loyaltyNumber: "", notes: "", vip: false,
};

export default function GuestModal({ showModal, setShowModal, existingGuest, onGuestSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const db = getFirestore();

  useEffect(() => {
    if (existingGuest) {
      setForm({ ...EMPTY, ...existingGuest });
    } else {
      const year = new Date().getFullYear();
      const rand = String(Math.floor(1000 + Math.random() * 9000));
      setForm({ ...EMPTY, guestId: `GST-${year}-${rand}` });
    }
    setError("");
  }, [existingGuest, showModal]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Guest name is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, updatedAt: serverTimestamp() };
      if (existingGuest?.id) {
        await updateDoc(doc(db, "users", user.uid, "guests", existingGuest.id), payload);
      } else {
        await addDoc(collection(db, "users", user.uid, "guests"), {
          ...payload, createdAt: serverTimestamp(),
        });
      }
      onGuestSaved?.();
      setShowModal(false);
    } catch (e) {
      console.error(e);
      setError("Failed to save guest. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!showModal) return null;

  const inputCls = "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-[#1d4ed8] transition-colors";
  const labelCls = "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#dbeafe] rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1e293b]">
                {existingGuest ? "Edit Guest" : "New Guest"}
              </h2>
              <p className="text-xs text-[#64748b]">
                {existingGuest ? `Updating ${existingGuest.name}` : "Register a new guest profile"}
              </p>
            </div>
          </div>
          <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-sm text-[#991b1b]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Personal */}
          <Section icon={User} label="Personal Information" accent="text-[#1d4ed8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Smith" />
              </div>
              <div>
                <label className={labelCls}>Guest ID</label>
                <input className={inputCls} value={form.guestId} onChange={(e) => setForm({ ...form, guestId: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input className={inputCls} type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Nationality</label>
                <select className={inputCls} value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })}>
                  {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vip"
                  checked={form.vip}
                  onChange={(e) => setForm({ ...form, vip: e.target.checked })}
                  className="w-4 h-4 accent-[#d97706]"
                />
                <label htmlFor="vip" className="text-sm text-[#374151] cursor-pointer font-medium">
                  Mark as VIP guest ⭐
                </label>
              </div>
            </div>
          </Section>

          {/* Contact */}
          <Section icon={Phone} label="Contact Details" accent="text-[#1d4ed8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="guest@email.com" />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="082 xxx xxxx" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Home Address</label>
                <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, Country" />
              </div>
            </div>
          </Section>

          {/* ID */}
          <Section icon={Key} label="Identification" accent="text-[#1d4ed8]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>ID Type</label>
                <select className={inputCls} value={form.idType} onChange={(e) => setForm({ ...form, idType: e.target.value })}>
                  {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>ID / Passport Number</label>
                <input className={inputCls} value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} placeholder="Number" />
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section icon={CreditCard} label="Preferences & Notes" accent="text-[#1d4ed8]">
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Preferred Room Type</label>
                <input className={inputCls} value={form.preferredRoom} onChange={(e) => setForm({ ...form, preferredRoom: e.target.value })} placeholder="e.g. Sea-view Suite, Non-smoking" />
              </div>
              <div>
                <label className={labelCls}>Dietary Requirements</label>
                <input className={inputCls} value={form.dietaryRequirements} onChange={(e) => setForm({ ...form, dietaryRequirements: e.target.value })} placeholder="e.g. Vegetarian, Halal, Nut allergy" />
              </div>
              <div>
                <label className={labelCls}>Loyalty / Rewards Number</label>
                <input className={inputCls} value={form.loyaltyNumber} onChange={(e) => setForm({ ...form, loyaltyNumber: e.target.value })} placeholder="Membership number" />
              </div>
              <div>
                <label className={labelCls}>Internal Notes</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Staff notes about this guest..." />
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl">
          <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : existingGuest ? "Update Guest" : "Save Guest"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, label, accent = "text-[#1d4ed8]", children }) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-xs font-bold ${accent} uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]`}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      {children}
    </div>
  );
}