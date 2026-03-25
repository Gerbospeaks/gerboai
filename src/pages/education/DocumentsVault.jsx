import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  Plus,
  ExternalLink,
  Shield,
  Building,
  Users,
  BookOpen,
  Globe,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
  Calendar,
  Download,
  Search,
} from "lucide-react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ─── CLOUDFLARE WORKER URL ────────────────────────────────────────────────────
const WORKER_URL = "https://r2-upload-worker.v8-auto.workers.dev";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ─── DOCUMENT DEFINITIONS ─────────────────────────────────────────────────────
const DOCUMENT_CATEGORIES = [
  {
    id: "registration",
    label: "Registration & Legal",
    icon: Building,
    color: "#0D6EFD",
    colorLight: "#E8F0FE",
    docs: [
      {
        id: "form11",
        name: "Form 11 / Form 16",
        sub: "Partial Care & ECD Programme application (DBE)",
        hasExpiry: false,
        required: true,
        link: "https://www.education.gov.za",
      },
      {
        id: "npo",
        name: "NPO Certificate",
        sub: "Non-Profit Organisation registration — Dept of Social Development",
        hasExpiry: true,
        required: true,
        link: "https://esocial.dsd.gov.za",
      },
      {
        id: "health_cert",
        name: "Municipal Health Certificate",
        sub: "Health clearance issued by local municipality",
        hasExpiry: true,
        required: true,
        link: "https://www.gov.za",
      },
      {
        id: "fire_cert",
        name: "Fire Safety Certificate",
        sub: "Issued by local fire department after inspection",
        hasExpiry: true,
        required: true,
        link: "https://www.gov.za",
      },
      {
        id: "zoning",
        name: "Zoning / Land Use Approval",
        sub: "Municipality confirmation of correct zoning for ECD",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "building_plan",
        name: "Approved Building Plan",
        sub: "Municipality-approved structural plan of premises",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "lease",
        name: "Lease Agreement / Title Deed",
        sub: "Proof of right to occupy premises",
        hasExpiry: true,
        required: true,
        link: null,
      },
      {
        id: "ecd_cert",
        name: "ECD Registration Certificate",
        sub: "Final registration cert — Bronze / Silver / Gold (DBE eCares)",
        hasExpiry: true,
        required: true,
        link: "https://ecdinfohub.org/how-to/registration/",
      },
      {
        id: "cipc",
        name: "CIPC Business Registration",
        sub: "For-profit centres — Companies & Intellectual Property Commission",
        hasExpiry: false,
        required: false,
        link: "https://eservices.cipc.co.za",
      },
      {
        id: "pbo",
        name: "PBO / Tax Exemption Letter",
        sub: "SARS Public Benefit Organisation status (if applicable)",
        hasExpiry: false,
        required: false,
        link: "https://efiling.sars.gov.za",
      },
    ],
  },
  {
    id: "staff",
    label: "Staff & Personnel",
    icon: Users,
    color: "#0F7B3F",
    colorLight: "#EBF8F1",
    docs: [
      {
        id: "owner_id",
        name: "Owner / Principal ID Copy",
        sub: "Certified copy of SA ID or passport",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "child_protection",
        name: "Child Protection Clearances (Form 29 & 30)",
        sub: "Required for ALL staff including cook, driver, gardener",
        hasExpiry: true,
        required: true,
        link: "https://www.dsd.gov.za",
      },
      {
        id: "police_clearance",
        name: "Police Clearance Certificates",
        sub: "SAPS clearance for all staff and volunteers",
        hasExpiry: true,
        required: true,
        link: "https://www.saps.gov.za/services/clearance.php",
      },
      {
        id: "medical_clearance",
        name: "Medical Clearance Certificates",
        sub: "Health clearance for all staff (DSD requirement)",
        hasExpiry: true,
        required: true,
        link: null,
      },
      {
        id: "firstaid",
        name: "First Aid Certificates",
        sub: "Approved first aid training — at least one staff member",
        hasExpiry: true,
        required: true,
        link: null,
      },
      {
        id: "qualifications",
        name: "Staff Qualifications / NQF Certificates",
        sub: "ECD-related qualifications for principal & practitioners",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "uif",
        name: "UIF Registration Confirmation",
        sub: "Dept of Employment & Labour — Unemployment Insurance Fund",
        hasExpiry: false,
        required: true,
        link: "https://ufiling.labour.gov.za",
      },
      {
        id: "contracts",
        name: "Employment Contracts",
        sub: "Signed contracts for all employed staff",
        hasExpiry: false,
        required: true,
        link: null,
      },
    ],
  },
  {
    id: "policies",
    label: "Policies & Programmes",
    icon: BookOpen,
    color: "#7C3AED",
    colorLight: "#F3F0FF",
    docs: [
      {
        id: "business_plan",
        name: "Business Plan",
        sub: "Operational plan, staffing, curriculum overview",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "constitution",
        name: "Centre Constitution",
        sub: "Required for NPOs and voluntary associations",
        hasExpiry: false,
        required: false,
        link: null,
      },
      {
        id: "health_policy",
        name: "Health & Safety Policy",
        sub: "Procedures for health care, illness, emergencies",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "emergency_plan",
        name: "Emergency Action Plan",
        sub: "Evacuation procedures, emergency contacts",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "curriculum",
        name: "Daily Programme / Curriculum Plan",
        sub: "Age-appropriate programme based on NCF (birth–4 years)",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "food_menu",
        name: "Nutrition Plan / Food Menu",
        sub: "Daily menu for meals and snacks provided to children",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "child_prot_policy",
        name: "Child Protection Policy",
        sub: "Safeguarding procedures aligned with the Children's Act 2005",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "admission",
        name: "Admission Policy & Forms",
        sub: "Intake forms, child records, parental consent",
        hasExpiry: false,
        required: true,
        link: null,
      },
      {
        id: "financial_records",
        name: "Financial Management System",
        sub: "Budget, fee structure, financial records as evidence",
        hasExpiry: false,
        required: true,
        link: null,
      },
    ],
  },
];

const ONLINE_PORTALS = [
  {
    name: "DBE eCares — ECD Registration",
    desc: "Online ECD programme registration (Bronze/Silver/Gold)",
    url: "https://ecdinfohub.org/how-to/registration/",
    icon: "🏛️",
    color: "#E8F0FE",
    textColor: "#185FA5",
  },
  {
    name: "DBE WhatsApp Bot",
    desc: "WhatsApp bot for initial Bronze ECD registration — 0800 202 933",
    url: "https://wa.me/27800202933",
    icon: "💬",
    color: "#EAF3DE",
    textColor: "#27500A",
  },
  {
    name: "NPO Registration — DSD eSocial",
    desc: "Register or renew NPO with Dept of Social Development",
    url: "https://esocial.dsd.gov.za",
    icon: "📋",
    color: "#F3F0FF",
    textColor: "#534AB7",
  },
  {
    name: "CIPC — Company Registration",
    desc: "Register a for-profit business entity",
    url: "https://eservices.cipc.co.za",
    icon: "🏢",
    color: "#FAEEDA",
    textColor: "#633806",
  },
  {
    name: "SARS eFiling — PBO / Tax Exemption",
    desc: "Apply for Public Benefit Organisation status",
    url: "https://efiling.sars.gov.za",
    icon: "💰",
    color: "#FAEEDA",
    textColor: "#633806",
  },
  {
    name: "SAPS Police Clearance",
    desc: "Apply online for police clearance certificates",
    url: "https://www.saps.gov.za/services/clearance.php",
    icon: "🔒",
    color: "#FCEBEB",
    textColor: "#791F1F",
  },
  {
    name: "UIF Registration — uFiling",
    desc: "Register employees for Unemployment Insurance Fund",
    url: "https://ufiling.labour.gov.za",
    icon: "👥",
    color: "#EAF3DE",
    textColor: "#085041",
  },
  {
    name: "ECD Info Hub",
    desc: "Resources, policy documents, forms and ECD guidance",
    url: "https://ecdinfohub.org",
    icon: "📚",
    color: "#F3F0FF",
    textColor: "#3C3489",
  },
  {
    name: "GROW ECD Registration Guide",
    desc: "Free step-by-step ECD centre registration guide",
    url: "https://growecd.org.za",
    icon: "🌱",
    color: "#EAF3DE",
    textColor: "#085041",
  },
  {
    name: "SA Government Services",
    desc: "gov.za — links to all government departments",
    url: "https://www.gov.za",
    icon: "🇿🇦",
    color: "#E8F0FE",
    textColor: "#042C53",
  },
  {
    name: "Dept of Basic Education",
    desc: "DBE official site — ECD information and forms",
    url: "https://www.education.gov.za",
    icon: "📖",
    color: "#E8F0FE",
    textColor: "#042C53",
  },
  {
    name: "SAPS Online Services",
    desc: "Criminal record checks and fingerprinting info",
    url: "https://www.saps.gov.za",
    icon: "🛡️",
    color: "#FCEBEB",
    textColor: "#791F1F",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getDocStatus = (docState) => {
  if (!docState?.uploaded) return "missing";
  if (docState.expiry) {
    const days = getDaysUntilExpiry(docState.expiry);
    if (days !== null && days < 0) return "expired";
    if (days !== null && days <= 60) return "expiring";
  }
  return "ok";
};

const STATUS_CONFIG = {
  ok:       { label: "Uploaded",      bg: "#EAF3DE", color: "#27500A", dot: "#639922" },
  expiring: { label: "Expiring soon", bg: "#FAEEDA", color: "#633806", dot: "#EF9F27" },
  expired:  { label: "Expired",       bg: "#FCEBEB", color: "#791F1F", dot: "#E24B4A" },
  missing:  { label: "Missing",       bg: "#FCEBEB", color: "#791F1F", dot: "#E24B4A" },
};

// ─── CLOUDFLARE UPLOAD ────────────────────────────────────────────────────────
/**
 * Uploads a document file to Cloudflare R2 via the Worker's /upload-pdf endpoint.
 * The Worker stores it under users/{userId}/ and returns { publicUrl, key }.
 */
const uploadToCloudflare = async (file) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("No authenticated user");

  const idToken = await currentUser.getIdToken();

  const res = await fetch(`${WORKER_URL}/upload-pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": file.name,
    },
    body: await file.arrayBuffer(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Upload failed");
  }

  return res.json();
};

// ─── UPLOAD MODAL ─────────────────────────────────────────────────────────────
const UploadModal = ({ doc: docDef, current, onSave, onClose }) => {
  const [expiry, setExpiry] = useState(current?.expiry || "");
  const [notes, setNotes] = useState(current?.notes || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef(null);

  const handleSave = async () => {
    setSaving(true);
    setUploadError("");
    try {
      await onSave({ expiry, notes, file, existing: current });
      onClose();
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 460,
          boxShadow: "0 8px 40px rgba(0,0,0,.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #DDE3ED",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2133" }}>
              {current?.uploaded ? "Update Document" : "Upload Document"}
            </div>
            <div style={{ fontSize: 12, color: "#8A97A8", marginTop: 2 }}>
              {docDef.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#8A97A8", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px" }}>
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${file ? "#0F7B3F" : "#DDE3ED"}`,
              borderRadius: 10,
              padding: "20px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: file ? "#EBF8F1" : "#F5F6FA",
              marginBottom: 14,
              transition: "all .15s",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => {
                setUploadError("");
                setFile(e.target.files?.[0] ?? null);
              }}
            />
            {file ? (
              <>
                <CheckCircle size={22} style={{ color: "#0F7B3F", marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F7B3F" }}>{file.name}</div>
                <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 2 }}>
                  {(file.size / 1024).toFixed(0)} KB — click to change
                </div>
              </>
            ) : (
              <>
                <Upload size={22} style={{ color: "#8A97A8", marginBottom: 6 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: "#4A5568" }}>Click to upload</div>
                <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 2 }}>PDF, JPG, PNG, DOC supported</div>
              </>
            )}
          </div>

          {/* Current file indicator */}
          {current?.uploaded && !file && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "#F0F3F9",
                borderRadius: 8,
                marginBottom: 14,
                fontSize: 12,
                color: "#4A5568",
              }}
            >
              <FileText size={14} style={{ color: "#0D6EFD" }} />
              Currently: {current.fileName || "Document on file"}
              {current.fileUrl && (
                <a
                  href={current.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: "auto", color: "#0D6EFD" }}
                >
                  <Eye size={14} />
                </a>
              )}
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "#FCEBEB",
                borderRadius: 8,
                marginBottom: 14,
                fontSize: 12,
                color: "#791F1F",
              }}
            >
              <AlertCircle size={13} />
              {uploadError}
            </div>
          )}

          {/* Expiry */}
          {docDef.hasExpiry && (
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6B7A8D",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 5,
                }}
              >
                Expiry Date
              </label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                style={{
                  width: "100%",
                  height: 36,
                  padding: "0 10px",
                  fontSize: 13,
                  border: "1px solid #DDE3ED",
                  borderRadius: 7,
                  outline: "none",
                  fontFamily: "inherit",
                  color: "#1A2133",
                }}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#6B7A8D",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 5,
              }}
            >
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Renewed March 2026, contact person: John"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 13,
                border: "1px solid #DDE3ED",
                borderRadius: 7,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                color: "#1A2133",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #DDE3ED",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: "1px solid #DDE3ED",
              background: "transparent",
              fontSize: 13,
              fontWeight: 600,
              color: "#4A5568",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!file && !current?.uploaded)}
            style={{
              padding: "7px 18px",
              borderRadius: 8,
              border: "none",
              background: saving || (!file && !current?.uploaded) ? "#DDE3ED" : "#0D6EFD",
              fontSize: 13,
              fontWeight: 700,
              color: saving || (!file && !current?.uploaded) ? "#8A97A8" : "#fff",
              cursor: saving || (!file && !current?.uploaded) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {saving && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  border: "2px solid rgba(255,255,255,.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin .7s linear infinite",
                }}
              />
            )}
            {saving ? "Uploading…" : current?.uploaded ? "Update" : "Save"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── DOCUMENT ROW ──────────────────────────────────────────────────────────────
const DocRow = ({ docDef, state, onUpload, onDelete }) => {
  const isMobile = useIsMobile();
  const status = getDocStatus(state);
  const sc = STATUS_CONFIG[status];
  const daysLeft = state?.expiry ? getDaysUntilExpiry(state.expiry) : null;

  return (
    <div
      style={{
        padding: isMobile ? "10px 12px" : "10px 14px",
        borderBottom: "1px solid #F0F3F9",
        background: "#fff",
        transition: "background .1s",
      }}
      onMouseEnter={(e) => ((e.currentTarget).style.background = "#FAFBFD")}
      onMouseLeave={(e) => ((e.currentTarget).style.background = "#fff")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: sc.dot,
            flexShrink: 0,
            marginTop: 4,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "#1A2133" }}>
              {docDef.name}
            </span>
            {docDef.required && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  background: "#FEF0EA",
                  color: "#E8601C",
                  padding: "1px 5px",
                  borderRadius: 4,
                  letterSpacing: ".04em",
                  whiteSpace: "nowrap",
                }}
              >
                REQUIRED
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 1, lineHeight: 1.4 }}>
            {docDef.sub}
          </div>
          {state?.notes && (
            <div style={{ fontSize: 11, color: "#6B7A8D", marginTop: 2, fontStyle: "italic" }}>
              {state.notes}
            </div>
          )}
          {daysLeft !== null && status !== "missing" && (
            <div
              style={{
                fontSize: 11,
                color: daysLeft < 0 ? "#C0392B" : daysLeft <= 30 ? "#BA7517" : "#639922",
                marginTop: 2,
                fontWeight: 600,
              }}
            >
              {daysLeft < 0
                ? `Expired ${Math.abs(daysLeft)} days ago`
                : daysLeft === 0
                  ? "Expires today!"
                  : `Expires in ${daysLeft} days — ${new Date(state.expiry).toLocaleDateString("en-ZA")}`}
            </div>
          )}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            background: sc.bg,
            color: sc.color,
            padding: "3px 8px",
            borderRadius: 20,
            flexShrink: 0,
            whiteSpace: "nowrap",
            alignSelf: "flex-start",
          }}
        >
          {isMobile
            ? status === "ok" ? "✓" : status === "expiring" ? "⚠" : "✗"
            : sc.label}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 8, marginLeft: 16, flexWrap: "wrap" }}>
        {state?.fileUrl && (
          <a
            href={state.fileUrl}
            target="_blank"
            rel="noreferrer"
            title="View document"
            style={{
              height: 28,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              borderRadius: 6,
              border: "1px solid #DDE3ED",
              color: "#6B7A8D",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Eye size={12} /> {!isMobile && "View"}
          </a>
        )}
        {docDef.link && (
          <a
            href={docDef.link}
            target="_blank"
            rel="noreferrer"
            title="Open portal"
            style={{
              height: 28,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              borderRadius: 6,
              border: "1px solid #DDE3ED",
              color: "#6B7A8D",
              textDecoration: "none",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <ExternalLink size={12} /> {!isMobile && "Portal"}
          </a>
        )}
        <button
          onClick={onUpload}
          title={state?.uploaded ? "Update document" : "Upload document"}
          style={{
            height: 28,
            padding: "0 12px",
            borderRadius: 6,
            border: `1px solid ${state?.uploaded ? "#DDE3ED" : "#0D6EFD"}`,
            background: state?.uploaded ? "transparent" : "#E8F0FE",
            color: state?.uploaded ? "#6B7A8D" : "#185FA5",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Upload size={11} />
          {state?.uploaded ? "Update" : "Upload"}
        </button>
        {state?.uploaded && (
          <button
            onClick={onDelete}
            title="Remove document"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              border: "1px solid #DDE3ED",
              background: "transparent",
              color: "#C0392B",
              cursor: "pointer",
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────
const CategorySection = ({ category, docsState, onUpload, onDelete }) => {
  const [open, setOpen] = useState(true);
  const Icon = category.icon;
  const uploaded = category.docs.filter((d) => getDocStatus(docsState[d.id]) !== "missing").length;
  const total = category.docs.length;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DDE3ED",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          background: "#F0F3F9",
          border: "none",
          borderBottom: open ? "1px solid #DDE3ED" : "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: category.colorLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} style={{ color: category.color }} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2133" }}>{category.label}</div>
          <div style={{ fontSize: 11, color: "#8A97A8" }}>{uploaded} of {total} documents uploaded</div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
            background: uploaded === total ? "#EAF3DE" : uploaded === 0 ? "#FCEBEB" : "#FAEEDA",
            color: uploaded === total ? "#27500A" : uploaded === 0 ? "#791F1F" : "#633806",
          }}
        >
          {uploaded}/{total}
        </span>
        {open ? <ChevronUp size={15} style={{ color: "#8A97A8" }} /> : <ChevronDown size={15} style={{ color: "#8A97A8" }} />}
      </button>
      {open && (
        <div>
          {category.docs.map((docDef) => (
            <DocRow
              key={docDef.id}
              docDef={docDef}
              state={docsState[docDef.id]}
              onUpload={() => onUpload(docDef)}
              onDelete={() => onDelete(docDef.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const DocumentsVault = ({ user }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("documents");
  const [docsState, setDocsState] = useState({});
  const [uploadTarget, setUploadTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", user.uid, "settings", "documentsVault"));
      if (snap.exists()) setDocsState(snap.data());
    };
    load();
  }, [user?.uid]);

  const persist = async (newState) => {
    if (!user?.uid) return;
    const db = getFirestore();
    await setDoc(
      doc(db, "users", user.uid, "settings", "documentsVault"),
      newState,
      { merge: true },
    );
  };

  // ── Upload handler: sends file to Cloudflare R2, saves URL in Firestore ──
  const handleSave = async ({
    expiry,
    notes,
    file,
    existing,
  }) => {
    if (!uploadTarget) return;

    let fileUrl = existing?.fileUrl ?? null;
    let fileKey = existing?.fileKey ?? null;
    let fileName = existing?.fileName ?? null;

    if (file) {
      // Upload to Cloudflare R2 via Worker
      const result = await uploadToCloudflare(file);
      fileUrl  = result.publicUrl;
      fileKey  = result.key;
      fileName = file.name;
    }

    const updated = {
      ...docsState,
      [uploadTarget.id]: {
        uploaded: true,
        expiry: expiry || null,
        notes: notes || "",
        fileUrl,
        fileKey,   // R2 object key — useful for deletion later
        fileName,
        updatedAt: new Date().toISOString(),
      },
    };

    setDocsState(updated);
    await persist(updated);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Remove this document record?")) return;

    // Note: to also delete the file from R2, add a DELETE /delete-document
    // endpoint to your Worker that calls DOCUMENTS_BUCKET.delete(key)
    const updated = { ...docsState };
    delete updated[docId];
    setDocsState(updated);
    await persist(updated);
  };

  const allDocs = DOCUMENT_CATEGORIES.flatMap((c) => c.docs);
  const uploaded = allDocs.filter((d) => getDocStatus(docsState[d.id]) !== "missing").length;
  const expiring = allDocs.filter((d) => getDocStatus(docsState[d.id]) === "expiring").length;
  const expired  = allDocs.filter((d) => getDocStatus(docsState[d.id]) === "expired").length;
  const missing  = allDocs.filter((d) => getDocStatus(docsState[d.id]) === "missing").length;

  const filteredCategories = searchQuery
    ? DOCUMENT_CATEGORIES.map((cat) => ({
        ...cat,
        docs: cat.docs.filter(
          (d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.sub.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter((cat) => cat.docs.length > 0)
    : DOCUMENT_CATEGORIES;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #DDE3ED", marginBottom: 16 }}>
        {[
          { id: "documents", label: "Documents", icon: Shield },
          { id: "portals",   label: "Online Portals", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: isMobile ? "8px 12px" : "8px 16px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? "#0D6EFD" : "transparent"}`,
                background: activeTab === tab.id ? "#E8F0FE" : "transparent",
                color: activeTab === tab.id ? "#185FA5" : "#6B7A8D",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── DOCUMENTS TAB ── */}
      {activeTab === "documents" && (
        <>
          {/* Summary strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? 6 : 8,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Uploaded",      value: uploaded, bg: "#EAF3DE", color: "#27500A" },
              { label: "Expiring soon", value: expiring, bg: "#FAEEDA", color: "#633806" },
              { label: "Expired",       value: expired,  bg: "#FCEBEB", color: "#791F1F" },
              { label: "Missing",       value: missing,  bg: "#F0F3F9", color: "#1A2133" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 8, padding: isMobile ? "10px 10px" : "10px 12px" }}>
                <div style={{ fontSize: isMobile ? 22 : 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: s.color, marginTop: 3, opacity: 0.8 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8A97A8", marginBottom: 5 }}>
              <span>Compliance progress</span>
              <span style={{ fontWeight: 700, color: "#1A2133" }}>{uploaded}/{allDocs.length} documents</span>
            </div>
            <div style={{ height: 6, background: "#DDE3ED", borderRadius: 99, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(uploaded / allDocs.length) * 100}%`,
                  background:
                    uploaded === allDocs.length ? "#639922" :
                    uploaded / allDocs.length > 0.6 ? "#0D6EFD" : "#E8601C",
                  borderRadius: 99,
                  transition: "width .4s ease",
                }}
              />
            </div>
          </div>

          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 11px",
              border: "1px solid #DDE3ED",
              borderRadius: 8,
              marginBottom: 12,
              background: "#fff",
            }}
          >
            <Search size={13} style={{ color: "#8A97A8", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search documents…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#1A2133",
                width: "100%",
                background: "transparent",
                fontFamily: "inherit",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#8A97A8", padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {filteredCategories.map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              docsState={docsState}
              onUpload={(docDef) => setUploadTarget(docDef)}
              onDelete={handleDelete}
            />
          ))}

          {filteredCategories.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#8A97A8", fontSize: 13 }}>
              No documents match "{searchQuery}"
            </div>
          )}
        </>
      )}

      {/* ── PORTALS TAB ── */}
      {activeTab === "portals" && (
        <div>
          <p style={{ fontSize: 13, color: "#6B7A8D", marginBottom: 14, lineHeight: 1.6 }}>
            Quick access to the official South African government portals and
            resources you need for ECD registration and compliance.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 8,
            }}
          >
            {ONLINE_PORTALS.map((portal, i) => (
              <a
                key={i}
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  border: "1px solid #DDE3ED",
                  borderRadius: 10,
                  background: "#fff",
                  textDecoration: "none",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.background = "#F5F6FA";
                  (e.currentTarget).style.borderColor = "#B4B2A9";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.background = "#fff";
                  (e.currentTarget).style.borderColor = "#DDE3ED";
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: portal.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {portal.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1A2133", lineHeight: 1.3 }}>
                    {portal.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#8A97A8", marginTop: 2, lineHeight: 1.3 }}>
                    {portal.desc}
                  </div>
                </div>
                <ExternalLink size={13} style={{ color: "#B4B2A9", flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {uploadTarget && (
        <UploadModal
          doc={uploadTarget}
          current={docsState[uploadTarget.id]}
          onSave={handleSave}
          onClose={() => setUploadTarget(null)}
        />
      )}
    </div>
  );
};

export default DocumentsVault;