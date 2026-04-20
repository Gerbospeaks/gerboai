// components/IndustryPickerModal.jsx
// Shown when the user clicks "Get Started" on the main landing page.
// Lets them pick an industry → redirects to that industry's subdomain landing page.
// No login or register happens here — that all lives on the subdomain.
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dashboards } from "../config/dashboardConfig";
import { X, Search, ArrowRight, Check } from "lucide-react";

// ─── All industries ────────────────────────────────────────────────────────────
// subdomain: the actual subdomain used in the URL (e.g. "mechanics.solidflo.co.za")
// If your domain is different, change BASE_DOMAIN below.
const BASE_DOMAIN = "solidflo.co.za";

export const INDUSTRIES = [
  {
    id: "mechanics",
    label: "Mechanics",
    icon: "🔧",
    desc: "Job cards & workshop invoices",
    subdomain: "mechanics",
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: "📊",
    desc: "Tax invoices & client billing",
    subdomain: "accounting",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: "🏥",
    desc: "Medical billing & patient quotes",
    subdomain: "healthcare",
  },
  {
    id: "electrical",
    label: "Electrical",
    icon: "⚡",
    desc: "Quotes & COC reference tracking",
    subdomain: "electrical",
  },
  {
    id: "plumbing",
    label: "Plumbing",
    icon: "🔩",
    desc: "On-site quotes & same-day invoices",
    subdomain: "plumbing",
  },
  {
    id: "construction",
    label: "Construction",
    icon: "🏗️",
    desc: "Project invoicing & estimates",
    subdomain: "construction",
  },
  {
    id: "cleaning",
    label: "Cleaning",
    icon: "🧹",
    desc: "Recurring quotes & job scheduling",
    subdomain: "cleaning",
  },
  {
    id: "solar",
    label: "Solar",
    icon: "☀️",
    desc: "Installation proposals & deposits",
    subdomain: "solar",
  },
  {
    id: "legal",
    label: "Legal",
    icon: "⚖️",
    desc: "Fee notes & client proposals",
    subdomain: "legal",
  },
  {
    id: "security",
    label: "Security",
    icon: "🔒",
    desc: "Service contracts & invoicing",
    subdomain: "security",
  },
  {
    id: "landscaping",
    label: "Landscaping",
    icon: "🌿",
    desc: "Quotes & maintenance billing",
    subdomain: "landscaping",
  },
  {
    id: "logistics",
    label: "Logistics",
    icon: "🚚",
    desc: "Delivery & freight invoicing",
    subdomain: "logistics",
  },
  {
    id: "photography",
    label: "Photography",
    icon: "📸",
    desc: "Session packages & event billing",
    subdomain: "photography",
  },
  {
    id: "realestate",
    label: "Real Estate",
    icon: "🏠",
    desc: "Rental & commission invoicing",
    subdomain: "realestate",
  },
  {
    id: "flooring",
    label: "Flooring",
    icon: "🪵",
    desc: "Material & labour billing",
    subdomain: "flooring",
  },
  {
    id: "hvac",
    label: "HVAC",
    icon: "❄️",
    desc: "Service & maintenance invoicing",
    subdomain: "hvac",
  },
  {
    id: "painting",
    label: "Painting",
    icon: "🎨",
    desc: "Quotes & job card tracking",
    subdomain: "painting",
  },
  {
    id: "retail",
    label: "Retail",
    icon: "🛍️",
    desc: "Sales & POS invoicing",
    subdomain: "retail",
  },
  {
    id: "hotel",
    label: "Hotel",
    icon: "🏨",
    desc: "Guest billing & event invoicing",
    subdomain: "hotel",
  },
  {
    id: "education",
    label: "Education",
    icon: "🎓",
    desc: "School fee & parent billing",
    subdomain: "education",
  },
  {
    id: "carpentry",
    label: "Carpentry",
    icon: "🪚",
    desc: "Custom job quotes & invoices",
    subdomain: "carpentry",
  },
  {
    id: "towing",
    label: "Towing",
    icon: "🚗",
    desc: "Recovery & storage invoicing",
    subdomain: "towing",
  },
  {
    id: "welding",
    label: "Welding",
    icon: "🔥",
    desc: "Job cards & fabrication billing",
    subdomain: "welding",
  },
  {
    id: "technology",
    label: "Technology",
    icon: "�",
    desc: "IT services & software licensing",
    subdomain: "technology",
  },
  {
    id: "upholstery",
    label: "Upholstery",
    icon: "�️",
    desc: "Furniture repair & customization",
    subdomain: "upholstery",
  },
  {
    id: "virtual-services",
    label: "Virtual Services",
    icon: "�",
    desc: "Remote support & online consultations",
    subdomain: "virtual-services",
  },
  {
    id: "pest-control",
    label: "Pest Control",
    icon: "🐛",
    desc: "Treatment quotes & invoices",
    subdomain: "pest-control",
  },
  {
    id: "pool-services",
    label: "Pool Services",
    icon: "🏊",
    desc: "Maintenance & chemical billing",
    subdomain: "pool-services",
  },
  {
    id: "window-repair",
    label: "Window Repair",
    icon: "🪟",
    desc: "Repair quotes & call-out invoices",
    subdomain: "window-repair",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    desc: "Order, catering & event billing",
    subdomain: "restaurant",
  },
];

// Build the subdomain URL for an industry.
// In dev (localhost) we use a query param instead so you can test without real subdomains.
function getSubdomainUrl(subdomain) {
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isDev) {
    // Dev mode: stay on localhost but pass ?industry=mechanics so SubdomainAuthPage can pick it up
    return `http://localhost:${window.location.port}?industry=${subdomain}`;
  }

  const protocol = window.location.protocol; // https:
  return `${protocol}//${subdomain}.${BASE_DOMAIN}`;
}

export default function IndustryPickerModal({ onClose, intent = "register" }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");

  const filtered = dashboards.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description?.toLowerCase().includes(query.toLowerCase()),
  );

  const selectedInfo = dashboards.find((d) => d.id === selected);

  const handleContinue = () => {
  if (!selected) return;
  const industry = dashboards.find((d) => d.id === selected);
  if (!industry) return;

  onClose();

  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isDev) {
    // Dev: stay on localhost, pass industry + mode as query params
    window.location.href = `http://localhost:${window.location.port}?industry=${industry.id}&mode=${intent}`;
  } else {
    const protocol = window.location.protocol;
    if (intent === "login") {
      window.location.href = `${protocol}//${industry.id}.solidflo.co.za/login`;
    } else {
      // Pass dashboardId in the URL — localStorage doesn't work cross-origin
      window.location.href = `${protocol}//${industry.id}.solidflo.co.za/register?industry=${industry.id}`;
    }
  }
};
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 900,
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 910,
          background: "#fff",
          borderRadius: 16,
          padding: "32px 28px 28px",
          width: "min(92vw, 680px)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
                marginBottom: 6,
              }}
            >
              Choose your industry
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              We'll tailor your dashboard to match your business type.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: 4,
              marginLeft: 12,
              flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search industry..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 36px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
              color: "#111827",
            }}
          />
        </div>

        {/* Selection banner */}
        {selectedInfo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#f0f4ff",
              border: "1px solid #c7d5f8",
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 18 }}>{selectedInfo.icon}</span>
            <span style={{ fontWeight: 700, color: "#1655e0" }}>
              {selectedInfo.name}
            </span>
            {selectedInfo.description && (
              <span style={{ color: "#6b7280", marginLeft: 2 }}>
                — {selectedInfo.description}
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            paddingRight: 4,
            marginBottom: 20,
          }}
        >
          {filtered.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 13,
                padding: "32px 0",
              }}
            >
              No industries found for "{query}"
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: 10,
              }}
            >
              {filtered.map((d) => {
                const isSelected = selected === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelected(d.id)}
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      padding: "12px 8px",
                      border: `2px solid ${isSelected ? "#1655e0" : "#e8eaf0"}`,
                      borderRadius: 12,
                      background: isSelected ? "#f0f4ff" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 16,
                          height: 16,
                          background: "#1655e0",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </span>
                    )}
                    <span style={{ fontSize: 24, lineHeight: 1 }}>
                      {d.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: "center",
                        color: isSelected ? "#1655e0" : "#374151",
                        lineHeight: 1.3,
                      }}
                    >
                      {d.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 20px",
              border: "1px solid #d1d5db",
              borderRadius: 10,
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: selected ? "#1655e0" : "#a0aec0",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: selected ? "pointer" : "not-allowed",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "background 0.15s",
            }}
          >
            {selected ? (
              <>
                Continue as {selectedInfo?.name} <ArrowRight size={14} />
              </>
            ) : (
              "Select an Industry"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
