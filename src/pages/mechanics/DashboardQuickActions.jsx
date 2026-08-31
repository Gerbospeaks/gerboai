import React from "react";
import {
  Receipt,
  FileSignature,
  UserPlus,
  Car,
  Package,
  ShoppingBag,
  History,
  BarChart2,
} from "lucide-react";

/**
 * DashboardQuickActions (Mechanics)
 * Front-and-center action buttons for the Home dashboard, covering the
 * same jobs as the sidebar's most-used items. Primary/frequent actions
 * (New Invoice, New Quote, Add Customer) open the editor/modal directly;
 * the rest route via setActiveView, same as the sidebar did.
 */
export default function DashboardQuickActions({
  onNewInvoice,
  onNewQuote,
  onAddCustomer,
  goTo,
  savedJobCardsCount = 0,
  savedCustomersCount = 0,
}) {
  const actions = [
    {
      key: "invoice",
      label: "New Invoice",
      sub: `${savedJobCardsCount} saved`,
      icon: Receipt,
      onClick: onNewInvoice,
      accent: "bg-[#dbeafe] text-[#2563eb]",
    },
    {
      key: "quote",
      label: "New Quote",
      sub: "Create a job quote",
      icon: FileSignature,
      onClick: onNewQuote,
      accent: "bg-[#f3e8ff] text-[#7c3aed]",
    },
    {
      key: "customer",
      label: "Add Customer",
      sub: `${savedCustomersCount} on file`,
      icon: UserPlus,
      onClick: onAddCustomer,
      accent: "bg-[#dcfce7] text-[#059669]",
    },
    {
      key: "vehicles",
      label: "Vehicles",
      sub: "View & manage records",
      icon: Car,
      onClick: () => goTo("vehicles"),
      accent: "bg-[#fce7f3] text-[#db2777]",
    },
    {
      key: "parts",
      label: "Parts Inventory",
      sub: "Stock & pricing",
      icon: Package,
      onClick: () => goTo("parts-inventory"),
      accent: "bg-[#ffedd5] text-[#ea580c]",
    },
    {
      key: "purchase-orders",
      label: "Purchase Orders",
      sub: "Order parts & supplies",
      icon: ShoppingBag,
      onClick: () => goTo("purchase-orders"),
      accent: "bg-[#fef3c7] text-[#d97706]",
    },
    {
      key: "history",
      label: "Job History",
      sub: "Past jobs & records",
      icon: History,
      onClick: () => goTo("history-view"),
      accent: "bg-[#e0e7ff] text-[#4338ca]",
    },
    {
      key: "reports",
      label: "Reports & Analytics",
      sub: "Business performance",
      icon: BarChart2,
      onClick: () => goTo("reports"),
      accent: "bg-[#cffafe] text-[#0891b2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {actions.map(({ key, label, sub, icon: Icon, onClick, accent }) => (
        <button
          key={key}
          onClick={onClick}
          className="flex flex-col items-start gap-3 p-4 bg-white border border-[#e2e8f0] rounded-xl shadow-sm hover:shadow-md hover:border-[#cbd5e1] transition-all text-left"
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1e293b]">{label}</p>
            <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
