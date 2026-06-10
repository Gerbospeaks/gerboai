
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dashboards } from "../config/dashboardConfig";
import { X, Search, ArrowRight, Check, ChevronDown } from "lucide-react";

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

function getSubdomainUrl(subdomain) {
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isDev) {
    return `http://localhost:${window.location.port}?industry=${subdomain}`;
  }

  const protocol = window.location.protocol; // https:
  return `${protocol}//${subdomain}.${BASE_DOMAIN}`;
}

export default function IndustryPickerModal({ onClose, intent = "register" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  const filtered = dashboards.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description?.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
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

        <div
          ref={dropdownRef}
          style={{ position: "relative", marginBottom: 16 }}
        >
          {/* Search/trigger input */}
          <div style={{ position: "relative" }}>
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
              value={isOpen ? query : (selectedInfo?.label ?? "")}
              readOnly={!isOpen}
              onClick={() => {
                setIsOpen(true);
                setQuery("");
              }}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 36px 10px 36px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                color: "#111827",
                background:"#ffffff",
                cursor: "pointer",
              }}
            />
            <ChevronDown
              size={15}
              onClick={() => setIsOpen((o) => !o)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
                color: "#9ca3af",
                transition: "transform 0.2s",
                cursor: "pointer",
              }}
            />
          </div>

          {/* Dropdown list */}
          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "#ffffff",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                maxHeight: 240,
                overflowY: "auto",
                zIndex: 950,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}
            >
              {filtered.length === 0 ? (
                <p
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#000000",
                  }}
                >
                  No results for "{query}"
                </p>
              ) : (
                filtered.map((d) => (
                  <div
                    key={d.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSelected(d.id);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6",
                      background: selected === d.id ? "#ffffff" : "#ffffff", // ← force white bg
                    }}
                  >
                    <span style={{ fontSize: 18 }}></span>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: selected === d.id ? "#1655e0" : "#111827",
                        }}
                      >
                        {" "}
                        {/* ← force dark text */}
                        {d.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#000000" }}>
                       
                      </div>{" "}
                      {/* ← force gray text */}
                    </div>
                    {selected === d.id && (
                      <Check
                        size={14}
                        color="#1655e0"
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </div>
                ))
              )}
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
