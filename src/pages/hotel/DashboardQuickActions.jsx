import React from "react";
import {
  Receipt,
  UserPlus,
  Bed,
  Calendar,
  DoorOpen,
  Utensils,
  CreditCard,
  FileBarChart,
} from "lucide-react";

/**
 * DashboardQuickActions
 * Front-and-center action buttons for the Home dashboard, covering the
 * same jobs as the sidebar's most-used items. Primary/frequent actions
 * (New Invoice, Add Guest, Check-In/Out) open as modals on top of the
 * dashboard; the rest route via setActiveView, same as the sidebar did.
 */
export default function DashboardQuickActions({
  onNewInvoice,
  onAddGuest,
  onCheckInOut,
  goTo,
  savedInvoicesCount = 0,
  savedGuestsCount = 0,
}) {
  const actions = [
    {
      key: "invoice",
      label: "New Invoice",
      sub: `${savedInvoicesCount} saved`,
      icon: Receipt,
      onClick: onNewInvoice,
      accent: "bg-[#fef3c7] text-[#d97706]",
    },
    {
      key: "guest",
      label: "Add Guest",
      sub: `${savedGuestsCount} on file`,
      icon: UserPlus,
      onClick: onAddGuest,
      accent: "bg-[#dcfce7] text-[#059669]",
    },
    {
      key: "checkin",
      label: "Check-In / Out",
      sub: "Manage arrivals",
      icon: DoorOpen,
      onClick: onCheckInOut,
      accent: "bg-[#dbeafe] text-[#1d4ed8]",
    },
    {
      key: "rooms",
      label: "Rooms",
      sub: "View & update status",
      icon: Bed,
      onClick: () => goTo("rooms"),
      accent: "bg-[#f3e8ff] text-[#7c3aed]",
    },
    {
      key: "reservations",
      label: "Reservations",
      sub: "Upcoming stays",
      icon: Calendar,
      onClick: () => goTo("reservations"),
      accent: "bg-[#fce7f3] text-[#db2777]",
    },
    {
      key: "restaurant",
      label: "Restaurant / Bar",
      sub: "Orders & tables",
      icon: Utensils,
      onClick: () => goTo("restaurant"),
      accent: "bg-[#ffedd5] text-[#ea580c]",
    },

  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {actions.map(({ key, label, sub, icon: Icon, onClick, accent }) => (
        <button
          key={key}
          onClick={onClick}
          className="flex flex-col items-start gap-3 p-4 bg-gray-300 border border-[#e2e8f0] rounded-xl shadow-sm hover:shadow-md hover:border-[#cbd5e1] transition-all text-left"
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
