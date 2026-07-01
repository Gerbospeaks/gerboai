import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
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
    icon: "💻",
    desc: "IT services & software licensing",
    subdomain: "technology",
  },
  {
    id: "upholstery",
    label: "Upholstery",
    icon: "🪑",
    desc: "Furniture repair & customization",
    subdomain: "upholstery",
  },
  {
    id: "virtual-services",
    label: "Virtual Services",
    icon: "🖥️",
    desc: "Remote support & online consultations",
    subdomain: "virtualservice",
  },
  {
    id: "pest-control",
    label: "Pest Control",
    icon: "🐛",
    desc: "Treatment quotes & invoices",
    subdomain: "pestcontrol",
  },
  {
    id: "pool-services",
    label: "Pool Services",
    icon: "🏊",
    desc: "Maintenance & chemical billing",
    subdomain: "poolservices",
  },
  {
    id: "window-repair",
    label: "Window Repair",
    icon: "🪟",
    desc: "Repair quotes & call-out invoices",
    subdomain: "windowrepair",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "🍽️",
    desc: "Order, catering & event billing",
    subdomain: "restaurant",
  },
];

// ─── Zoho-style tokens ────────────────────────────────────────────────────────
const Z = {
  radius: 6,
  radiusSm: 4,
  blue: "#1a5ec8",
  blueHover: "#1550b0",
  blueFocusRing: "0 0 0 2px rgba(26,94,200,0.18)",
  blueSelectedBg: "#eef3ff",
  blueSelectedText: "#1a5ec8",
  border: "1px solid #d1d5db",
  borderLight: "1px solid #e5e7eb",
  footerBg: "#f9fafb",
  inputH: 34,
  btnH: 32,
  fontFamily: "'Zoho Puvi', 'DM Sans', -apple-system, sans-serif",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  danger: "#e24b4a",
  disabled: "#a0aec0",
};

// ─── Shared button base ───────────────────────────────────────────────────────
const btnBase = {
  height: Z.btnH,
  padding: "0 16px",
  borderRadius: Z.radiusSm,
  fontSize: 13,
  fontWeight: 500,
  fontFamily: Z.fontFamily,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  transition: "background 0.12s",
};

export default function IndustryPickerModal({ onClose, intent = "register" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownH = Math.min(230, 38 * 6); // approx max height
    const isMobile = window.innerWidth < 540;

    // Place above if not enough room below
    const placeAbove = spaceBelow < dropdownH && spaceAbove > spaceBelow;

    if (isMobile) {
      setDropdownStyle({
        position: "fixed",
        left: 8,
        right: 8,
        zIndex: 9999,
        ...(placeAbove
          ? { bottom: window.innerHeight - rect.top + 3 }
          : { top: rect.bottom + 3 }),
      });
    } else {
      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(placeAbove
          ? { bottom: window.innerHeight - rect.top + 3 }
          : { top: rect.bottom + 3 }),
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  const filtered = dashboards.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.description?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedInfo = dashboards.find((d) => d.id === selected);

  const handleSelect = (id) => {
    setSelected(id);
    setIsOpen(false);
    setQuery("");
  };

  const handleContinue = () => {
    if (!selected) return;
    const industry = dashboards.find((d) => d.id === selected);
    if (!industry) return;
    onClose();
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isDev) {
      window.location.href = `http://localhost:${window.location.port}?industry=${industry.id}&mode=${intent}`;
    } else {
      const protocol = window.location.protocol;
      if (intent === "login") {
        window.location.href = `${protocol}//${industry.id}.solidflo.co.za/login`;
      } else {
        window.location.href = `${protocol}//${industry.id}.solidflo.co.za/register?industry=${industry.id}`;
      }
    }
  };

  const inputDisplayValue = isOpen ? query : (selectedInfo?.name ?? "");

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 900,
          backdropFilter: "blur(2px)",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 910,
          background: "#fff",
          borderRadius: Z.radius,
          width: "min(92vw, 520px)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          border: Z.border,
          // ✅ overflow: visible so dropdown escapes the modal bounds
          overflow: "visible",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontFamily: Z.fontFamily,
        }}
      >
        {/* Header — needs overflow:hidden to clip the border-radius */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: Z.borderLight,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderRadius: `${Z.radius}px ${Z.radius}px 0 0`,
            background: "#fff",
            // Clip just the top corners
            overflow: "hidden",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: Z.textPrimary,
                margin: 0,
                marginBottom: 3,
              }}
            >
              Choose your industry
            </h2>
            <p style={{ fontSize: 12, color: Z.textSecondary, margin: 0 }}>
              We'll tailor your dashboard to match your business type.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: Z.textMuted,
              padding: 4,
              marginLeft: 12,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              borderRadius: Z.radiusSm,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px 20px", flex: 1, background: "#fff" }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: Z.textSecondary,
              display: "block",
              marginBottom: 6,
            }}
          >
            Industry <span style={{ color: Z.danger }}>*</span>
          </label>

          {/* Input trigger — NOT inside dropdownRef so outside-click works correctly */}
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: Z.textMuted,
                pointerEvents: "none",
              }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or select industry..."
              value={inputDisplayValue}
              readOnly={!isOpen}
              onClick={() => {
                setIsOpen(true);
                setQuery("");
              }}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                height: Z.inputH,
                padding: "0 32px",
                border: isOpen ? `1px solid ${Z.blue}` : Z.border,
                borderRadius: Z.radiusSm,
                fontSize: 13,
                color: Z.textPrimary,
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
                cursor: "pointer",
                boxShadow: isOpen ? Z.blueFocusRing : "none",
                transition: "border-color 0.12s, box-shadow 0.12s",
              }}
            />
            <ChevronDown
              size={14}
              onClick={() => {
                setIsOpen((o) => !o);
                if (!isOpen) setQuery("");
              }}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
                color: Z.textMuted,
                transition: "transform 0.15s",
                cursor: "pointer",
              }}
            />
          </div>

          {/* ✅ Dropdown rendered in a portal, positioned via fixed coords */}
          {isOpen &&
            ReactDOM.createPortal(
              <div
                ref={dropdownRef}
                style={{
                  ...dropdownStyle,
                  background: "#fff",
                  border: Z.border,
                  borderRadius: Z.radiusSm,
                  maxHeight: 230,
                  overflowY: "auto",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
                }}
              >
                {filtered.length === 0 ? (
                  <p
                    style={{
                      padding: "18px",
                      textAlign: "center",
                      fontSize: 13,
                      color: Z.textSecondary,
                      margin: 0,
                    }}
                  >
                    No results for "{query}"
                  </p>
                ) : (
                  filtered.map((d) => {
                    const isSelected = selected === d.id;
                    return (
                      <div
                        key={d.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelect(d.id);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderBottom: "0.5px solid #f3f4f6",
                          background: isSelected ? Z.blueSelectedBg : "#fff",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "#f5f7ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isSelected
                            ? Z.blueSelectedBg
                            : "#fff";
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: isSelected
                                ? Z.blueSelectedText
                                : Z.textPrimary,
                            }}
                          >
                            {d.name}
                          </div>
                          {d.description && (
                            <div
                              style={{
                                fontSize: 11,
                                color: Z.textMuted,
                                marginTop: 1,
                              }}
                            >
                              {d.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check
                            size={13}
                            color={Z.blue}
                            style={{ flexShrink: 0 }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>,
              document.body
            )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: Z.borderLight,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: Z.footerBg,
            borderRadius: `0 0 ${Z.radius}px ${Z.radius}px`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              ...btnBase,
              background: "#fff",
              border: Z.border,
              color: Z.textSecondary,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              ...btnBase,
              background: selected ? Z.blue : Z.disabled,
              color: "#fff",
              cursor: selected ? "pointer" : "not-allowed",
              minWidth: 140,
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (selected) e.currentTarget.style.background = Z.blueHover;
            }}
            onMouseLeave={(e) => {
              if (selected) e.currentTarget.style.background = Z.blue;
            }}
          >
            {selected ? (
              <>
                Continue as {selectedInfo?.name}
                <ArrowRight size={13} />
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