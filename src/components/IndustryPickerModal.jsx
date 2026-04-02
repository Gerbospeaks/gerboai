// components/IndustryPickerModal.jsx
// Shown when the user clicks "Get Started" on the main landing page.
// Lets them pick an industry → redirects to that industry's subdomain landing page.
// No login or register happens here — that all lives on the subdomain.

import { useState, useMemo } from "react";
import { X, Search, ArrowRight } from "lucide-react";

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

// ─── Modal component ───────────────────────────────────────────────────────────
export default function IndustryPickerModal({ onClose }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return INDUSTRIES;
    return INDUSTRIES.filter(
      (i) =>
        i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q),
    );
  }, [search]);

  function handleGo() {
    if (!selected) return;
    const industry = INDUSTRIES.find((i) => i.id === selected);
    if (!industry) return;
    window.location.href = getSubdomainUrl(industry.subdomain);
  }

  const selectedIndustry = INDUSTRIES.find((i) => i.id === selected);

  return (
    // Faux overlay — uses in-flow div so iframe height is not collapsed
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Choose your industry
            </h2>
            <p className="text-sm text-gray-400">
              Select your industry and we'll take you to your dedicated SolidFlo
              experience.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search industries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 h-9 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        {/* Industry grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No industries match "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filtered.map((industry) => {
                const isSelected = selected === industry.id;
                return (
                  <button
                    key={industry.id}
                    onClick={() => setSelected(industry.id)}
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl leading-none">
                      {industry.icon}
                    </span>
                    <span
                      className={`text-xs font-semibold leading-tight ${isSelected ? "text-blue-800" : "text-gray-800"}`}
                    >
                      {industry.label}
                    </span>
                    <span
                      className={`text-[11px] leading-tight ${isSelected ? "text-blue-600" : "text-gray-400"}`}
                    >
                      {industry.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-400">
            {selectedIndustry
              ? `Going to ${selectedIndustry.subdomain}.${BASE_DOMAIN}`
              : "Select an industry to continue"}
          </p>
          <button
            onClick={handleGo}
            disabled={!selected}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
