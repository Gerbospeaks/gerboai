import React from "react";
import {
  Receipt,
  FileSignature,
  UserPlus,
  Car,
  Package,
  History,
  StickyNote,
  BarChart2,
} from "lucide-react";

/**
 * DashboardQuickActions (Towing)
 * Front-and-center action buttons for the Home dashboard, covering the
 * same jobs as the sidebar's most-used items. Primary/frequent actions
 * (New Invoice, New Quote, Add Customer) open the editor/modal directly;
 * the rest route via goTo (setActiveView), same as the sidebar.
 */
export default function DashboardQuickActions({
  onNewInvoice,
  onNewQuote,
  onAddCustomer,
  goTo,
  savedJobCardsCount = 0,
  savedCustomersCount = 0,
}) {
  const primaryActions = [
    {
      key: "invoice",
      label: "New Invoice",
      sub: `${savedJobCardsCount} saved`,
      icon: Receipt,
      onClick: onNewInvoice,
    },
    {
      key: "quote",
      label: "New Quote",
      sub: "Create a towing estimate",
      icon: FileSignature,
      onClick: onNewQuote,
    },
  ];

  const secondaryActions = [
    {
      key: "customer",
      label: "Add Customer",
      sub: `${savedCustomersCount} on file`,
      icon: UserPlus,
      onClick: onAddCustomer,
    },
    {
      key: "vehicles",
      label: "Vehicles",
      sub: "Fleet & customer vehicles",
      icon: Car,
      onClick: () => goTo("vehicles"),
    },
    {
      key: "parts",
      label: "Parts Inventory",
      sub: "Stock & pricing",
      icon: Package,
      onClick: () => goTo("parts-inventory"),
    },
    {
      key: "history",
      label: "Job History",
      sub: "Past calls & records",
      icon: History,
      onClick: () => goTo("history-view"),
    },
    {
      key: "notes",
      label: "Notes",
      sub: "Dispatch & reminders",
      icon: StickyNote,
      onClick: () => goTo("notes-view"),
    },
    {
      key: "reports",
      label: "Reports & Analytics",
      sub: "Business performance",
      icon: BarChart2,
      onClick: () => goTo("reports"),
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* Primary — the two most-used actions get brand-color weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {primaryActions.map(({ key, label, sub, icon: Icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-[#151a28] rounded-2xl shadow-sm hover:shadow-md hover:brightness-110 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[#c8f24c] flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#151a28]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-[#8a93a6] mt-0.5 truncate">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary — quieter neutral tiles, same radius language as the primaries */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {secondaryActions.map(({ key, label, sub, icon: Icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="flex flex-col items-start gap-2.5 p-3.5 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#151a28]/20 hover:shadow-sm transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#151a28]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1e293b] leading-tight">
                {label}
              </p>
              <p className="text-[10px] text-[#94a3b8] mt-0.5 leading-tight truncate">
                {sub}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
