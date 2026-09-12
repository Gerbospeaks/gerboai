import React from "react";
import {
  Receipt,
  UserPlus,
  Calendar,
  ShoppingBag,
  CreditCard,
  Stethoscope,
} from "lucide-react";

/**
 * HealthDashboardQuickActions
 * Front-and-center action buttons for the Home dashboard, covering the
 * same jobs as HealthSidebar's most-used items. The three highest-frequency
 * actions (New Invoice, Add Patient, Appointments) get the brand teal/cyan
 * treatment; the rest are quieter neutral tiles that route via setActiveView,
 * same as the sidebar did.
 *
 * Colors match HealthSidebar: dark navy #0d1520, teal accent #0e7490,
 * cyan highlight #22d3ee.
 */
export default function HealthDashboardQuickActions({
  onNewInvoice,
  onAddPatient,
  onAppointments,
  goTo,
  savedInvoicesCount = 0,
  savedPatientsCount = 0,
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
      key: "patient",
      label: "Add Patient",
      sub: `${savedPatientsCount} on file`,
      icon: UserPlus,
      onClick: onAddPatient,
    },
    {
      key: "appointments",
      label: "Appointments",
      sub: "Manage schedule",
      icon: Calendar,
      onClick: onAppointments,
    },
  ];

  const secondaryActions = [
    {
      key: "purchase-orders",
      label: "Purchase Orders",
      sub: "Supplies & equipment",
      icon: ShoppingBag,
      onClick: () => goTo("purchase-orders"),
    },
    {
      key: "pending",
      label: "Pending Payments",
      sub: "Outstanding balances",
      icon: CreditCard,
      onClick: () => goTo("pending"),
    },
    {
      key: "medical-records",
      label: "Medical Records",
      sub: "Patient history",
      icon: Stethoscope,
      onClick: () => goTo("medical-records"),
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
            className="flex items-center gap-4 p-4 bg-[#0d1520] rounded-2xl shadow-sm hover:shadow-md hover:brightness-110 transition-all text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0e7490] flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-[#64748b] mt-0.5 truncate">{sub}</p>
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
            className="flex items-center gap-3.5 p-4 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#0e7490]/30 hover:shadow-sm transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#ecfeff] flex items-center justify-center flex-shrink-0">
              <Icon className="w-4.5 h-4.5 text-[#0e7490]" />
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
