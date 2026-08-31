import React from "react";
import {
  Receipt,
  UserPlus,
  Bed,
  Calendar,
  DoorOpen,
  Utensils,
} from "lucide-react";

/**
 * DashboardQuickActions
 * Front-and-center action buttons for the Home dashboard, covering the
 * same jobs as the sidebar's most-used items. The three highest-frequency
 * actions (New Invoice, Add Guest, Check-In/Out) get the brand navy/lime
 * treatment and open as modals; the rest are quieter neutral tiles that
 * route via setActiveView, same as the sidebar did.
 *
 * Colors match HotelSidebar / AppHeader: navy #0f1623, lime accent #c6f135.
 */
export default function DashboardQuickActions({
  onNewInvoice,
  onAddGuest,
  onCheckInOut,
  goTo,
  savedInvoicesCount = 0,
  savedGuestsCount = 0,
}) {
  const primaryActions = [
    {
      key: "invoice",
      label: "New Invoice",
      sub: `${savedInvoicesCount} saved`,
      icon: Receipt,
      onClick: onNewInvoice,
    },
    {
      key: "guest",
      label: "Add Guest",
      sub: `${savedGuestsCount} on file`,
      icon: UserPlus,
      onClick: onAddGuest,
    },
    {
      key: "checkin",
      label: "Check-In / Out",
      sub: "Manage arrivals",
      icon: DoorOpen,
      onClick: onCheckInOut,
    },
  ];

  const secondaryActions = [
    {
      key: "rooms",
      label: "Rooms",
      sub: "View & update status",
      icon: Bed,
      onClick: () => goTo("rooms"),
    },
    {
      key: "reservations",
      label: "Reservations",
      sub: "Upcoming stays",
      icon: Calendar,
      onClick: () => goTo("reservations"),
    },
    {
      key: "restaurant",
      label: "Restaurant / Bar",
      sub: "Orders & tables",
      icon: Utensils,
      onClick: () => goTo("restaurant"),
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* Primary — the three most-used actions get brand-color weight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {primaryActions.map(({ key, label, sub, icon: Icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="flex items-center gap-4 p-4 bg-[#0f1623] rounded-2xl shadow-sm hover:shadow-md hover:brightness-110 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[#c6f135] flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[#0f1623]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-[#8a93a6] mt-0.5 truncate">{sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary — quieter neutral tiles, same radius language as the primaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {secondaryActions.map(({ key, label, sub, icon: Icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className="flex items-center gap-3.5 p-4 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#0f1623]/20 hover:shadow-sm transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
              <Icon className="w-4.5 h-4.5 text-[#0f1623]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1e293b] leading-tight">
                {label}
              </p>
              <p className="text-xs text-[#94a3b8] mt-0.5 leading-tight truncate">
                {sub}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
