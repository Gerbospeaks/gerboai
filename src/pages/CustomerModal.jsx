import React, { useState, useEffect } from "react";
import {
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

/* ─── Zoho design tokens (shared with CustomersListModal) ─────────────────── */
const Z = {
  red: "#e8442a",
  redHover: "#c73b24",
  redLight: "#fdf2f0",
  navy: "#1a2340",
  navyMid: "#2d3a55",
  blue: "#1b6ec2",
  blueLight: "#e8f0fb",
  green: "#1d8348",
  greenLight: "#eafaf1",
  border: "#d9dde6",
  borderFocus: "#1b6ec2",
  bg: "#f4f5f8",
  white: "#ffffff",
  text: "#1a2340",
  textMid: "#4a5568",
  textMuted: "#8a93a6",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');

  .zcf-root * { font-family: 'Lato', sans-serif; box-sizing: border-box; }

  .zcf-overlay {
    position: fixed; inset: 0;
    background: rgba(20,26,48,.55);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: zcf-fade .18s ease;
  }
  .zcf-dialog {
    background: ${Z.white};
    border-radius: 6px;
    box-shadow: 0 8px 40px rgba(20,26,48,.22);
    width: 100%; max-width: 560px;
    max-height: 92vh;
    display: flex; flex-direction: column;
    animation: zcf-up .2s ease;
    overflow: hidden;
  }

  /* ── Header ── */
  .zcf-header {
    background: ${Z.navy};
    padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .zcf-header-left { display: flex; align-items: center; gap: 10px; }
  .zcf-header-icon {
    width: 32px; height: 32px; border-radius: 50%;
    background: ${Z.red};
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .zcf-title { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: .01em; }
  .zcf-subtitle { font-size: 11px; color: rgba(255,255,255,.5); margin-top: 2px; }
  .zcf-close {
    background: transparent; border: none; cursor: pointer;
    color: rgba(255,255,255,.6); padding: 4px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s;
  }
  .zcf-close:hover { color: #fff; background: rgba(255,255,255,.12); }

  /* ── Body ── */
  .zcf-body {
    overflow-y: auto; flex: 1;
    background: ${Z.bg};
    padding: 20px;
  }
  .zcf-body::-webkit-scrollbar { width: 6px; }
  .zcf-body::-webkit-scrollbar-track { background: transparent; }
  .zcf-body::-webkit-scrollbar-thumb { background: ${Z.border}; border-radius: 6px; }

  /* ── Alert banners ── */
  .zcf-alert {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px; border-radius: 4px;
    margin-bottom: 16px; font-size: 13px;
    border-left: 3px solid transparent;
  }
  .zcf-alert-error {
    background: #fef2f0; border-left-color: ${Z.red};
    animation: zcf-shake .35s ease;
  }
  .zcf-alert-error .zcf-alert-title { color: #b91c1c; font-weight: 700; margin-bottom: 2px; }
  .zcf-alert-error .zcf-alert-body  { color: #c53030; }
  .zcf-alert-success {
    background: ${Z.greenLight}; border-left-color: ${Z.green};
    animation: zcf-fade .25s ease;
  }
  .zcf-alert-success .zcf-alert-title { color: #155835; font-weight: 700; margin-bottom: 2px; }
  .zcf-alert-success .zcf-alert-body  { color: #1d6b3e; }

  /* ── Section card ── */
  .zcf-card {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 4px;
    margin-bottom: 12px;
    overflow: hidden;
    transition: border-color .15s, box-shadow .15s;
  }
  .zcf-card:focus-within {
    border-color: ${Z.borderFocus};
    box-shadow: 0 0 0 3px rgba(27,110,194,.12);
  }
  .zcf-card-label {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px 6px;
    font-size: 11px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; color: ${Z.textMid};
    border-bottom: 1px solid ${Z.border};
    background: #f9fafb;
    user-select: none;
  }
  .zcf-card-label .req { color: ${Z.red}; margin-left: 1px; }
  .zcf-input, .zcf-textarea {
    width: 100%; border: none; outline: none;
    padding: 10px 14px;
    font-size: 13px; color: ${Z.text};
    background: transparent;
    transition: background .12s;
    font-family: 'Lato', sans-serif;
  }
  .zcf-input::placeholder, .zcf-textarea::placeholder { color: ${Z.textMuted}; }
  .zcf-input:disabled, .zcf-textarea:disabled { opacity: .5; cursor: not-allowed; }
  .zcf-textarea { resize: none; line-height: 1.5; }
  .zcf-input.mono { font-family: 'Courier New', monospace; font-size: 12px; letter-spacing: .04em; }
  .zcf-hint {
    padding: 5px 14px 8px;
    font-size: 11px; color: ${Z.textMuted};
    border-top: 1px dashed #eaedf2;
  }

  /* ── Footer ── */
  .zcf-footer {
    padding: 12px 20px;
    border-top: 1px solid ${Z.border};
    background: ${Z.white};
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; flex-shrink: 0;
  }
  .zcf-btn-cancel {
    height: 34px; padding: 0 18px;
    background: ${Z.white}; color: ${Z.textMid};
    border: 1px solid ${Z.border}; border-radius: 3px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: border-color .15s, color .15s;
    font-family: 'Lato', sans-serif;
  }
  .zcf-btn-cancel:hover { border-color: ${Z.red}; color: ${Z.red}; }
  .zcf-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }

  .zcf-btn-save {
    height: 34px; padding: 0 20px;
    background: ${Z.red}; color: #fff;
    border: none; border-radius: 3px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: background .15s;
    font-family: 'Lato', sans-serif;
  }
  .zcf-btn-save:hover { background: ${Z.redHover}; }
  .zcf-btn-save:disabled { opacity: .55; cursor: not-allowed; }
  .zcf-btn-save.success { background: ${Z.green}; }

  /* Spinner */
  .zcf-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: zcf-spin .7s linear infinite;
  }

  /* Animations */
  @keyframes zcf-fade  { from { opacity:0 }                       to { opacity:1 } }
  @keyframes zcf-up    { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes zcf-shake {
    0%,100% { transform:translateX(0) }
    20%     { transform:translateX(-5px) }
    60%     { transform:translateX(5px) }
  }
  @keyframes zcf-spin  { to { transform:rotate(360deg) } }
`;

/* ─── Component ──────────────────────────────────────────────────────────── */
const CustomerModal = ({
  showModal,
  setShowModal,
  existingCustomer = null,
  onCustomerSaved,
}) => {
  const [customerData, setCustomerData] = useState({
    name: existingCustomer?.name || "",
    email: existingCustomer?.email || "",
    phone: existingCustomer?.phone || "",
    address: existingCustomer?.address || "",
    customerId: existingCustomer?.customerId || "",
  });

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /* Sync form when existingCustomer prop changes */
  useEffect(() => {
    if (existingCustomer) {
      setCustomerData({
        name: existingCustomer.name || "",
        email: existingCustomer.email || "",
        phone: existingCustomer.phone || "",
        address: existingCustomer.address || "",
        customerId: existingCustomer.customerId || "",
      });
    }
  }, [existingCustomer]);

  /* Escape key */
  useEffect(() => {
    const h = (e) => e.key === "Escape" && showModal && handleClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showModal]);

  const set = (field) => (e) =>
    setCustomerData((prev) => ({ ...prev, [field]: e.target.value }));

  const resetForm = () => {
    setCustomerData({
      name: "",
      email: "",
      phone: "",
      address: "",
      customerId: "",
    });
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    setShowModal(false);
    if (!existingCustomer) resetForm();
  };

  const handleSave = async () => {
    if (!customerData.name.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!customerData.phone.trim()) {
      setError("Phone number is required");
      return;
    }
    if (
      customerData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)
    ) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        name: customerData.name.trim(),
        email: customerData.email.trim(),
        phone: customerData.phone.trim(),
        address: customerData.address.trim(),
        customerId: customerData.customerId.trim() || `CUST-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };

      if (existingCustomer?.id) {
        await updateDoc(
          doc(db, "users", user.uid, "clients", existingCustomer.id),
          payload,
        );
      } else {
        await addDoc(collection(db, "users", user.uid, "clients"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
      }

      setSuccess(true);
      if (onCustomerSaved) onCustomerSaved();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to save customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const isEdit = Boolean(existingCustomer);

  return (
    <div className="zcf-root">
      <style>{globalStyles}</style>

      <div className="zcf-overlay" onClick={handleClose}>
        <div className="zcf-dialog" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="zcf-header">
            <div className="zcf-header-left">
              <div className="zcf-header-icon">
                <User size={15} color="#fff" />
              </div>
              <div>
                <div className="zcf-title">
                  {isEdit ? "Edit Customer" : "New Customer"}
                </div>
                <div className="zcf-subtitle">
                  CRM &rsaquo; Contacts &rsaquo;{" "}
                  {isEdit ? "Update Record" : "Create Record"}
                </div>
              </div>
            </div>
            <button className="zcf-close" onClick={handleClose}>
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="zcf-body">
            {/* Error */}
            {error && (
              <div className="zcf-alert zcf-alert-error">
                <AlertCircle
                  size={15}
                  color="#b91c1c"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <div className="zcf-alert-title">Validation Error</div>
                  <div className="zcf-alert-body">{error}</div>
                </div>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="zcf-alert zcf-alert-success">
                <CheckCircle
                  size={15}
                  color="#1d8348"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <div className="zcf-alert-title">Saved Successfully</div>
                  <div className="zcf-alert-body">
                    Customer {isEdit ? "updated" : "created"} successfully.
                  </div>
                </div>
              </div>
            )}

            {/* Name */}
            <div className="zcf-card">
              <div className="zcf-card-label">
                <User size={11} />
                Customer Name <span className="req">*</span>
              </div>
              <input
                className="zcf-input"
                type="text"
                placeholder="e.g. John Smith"
                value={customerData.name}
                onChange={set("name")}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="zcf-card">
              <div className="zcf-card-label">
                <Mail size={11} />
                Email Address
              </div>
              <input
                className="zcf-input"
                type="email"
                placeholder="john.smith@example.com"
                value={customerData.email}
                onChange={set("email")}
                disabled={loading}
              />
              <div className="zcf-hint">
                Optional — used for sending invoices
              </div>
            </div>

            {/* Phone */}
            <div className="zcf-card">
              <div className="zcf-card-label">
                <Phone size={11} />
                Phone Number <span className="req">*</span>
              </div>
              <input
                className="zcf-input"
                type="tel"
                placeholder="082 123 4567"
                value={customerData.phone}
                onChange={set("phone")}
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div className="zcf-card">
              <div className="zcf-card-label">
                <MapPin size={11} />
                Address
              </div>
              <textarea
                className="zcf-textarea"
                placeholder="123 Main Street, Sandton, 2090"
                rows={3}
                value={customerData.address}
                onChange={set("address")}
                disabled={loading}
              />
              <div className="zcf-hint">Full physical or billing address</div>
            </div>

            {/* Customer ID */}
            <div className="zcf-card">
              <div className="zcf-card-label">
                <Hash size={11} />
                Customer ID
              </div>
              <input
                className="zcf-input mono"
                type="text"
                placeholder="CUST-001"
                value={customerData.customerId}
                onChange={set("customerId")}
                disabled={loading}
              />
              <div className="zcf-hint">
                Leave blank to auto-generate a unique ID
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="zcf-footer">
            <button
              className="zcf-btn-cancel"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className={`zcf-btn-save${success ? " success" : ""}`}
              onClick={handleSave}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="zcf-spinner" /> Saving…
                </>
              ) : success ? (
                <>
                  <CheckCircle size={14} /> Saved!
                </>
              ) : (
                <>
                  <Save size={14} />{" "}
                  {isEdit ? "Update Customer" : "Save Customer"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
