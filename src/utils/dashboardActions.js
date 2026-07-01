// utils/dashboardActions.js
import { FileText, ClipboardList, Wrench, Construction } from "lucide-react";

const mobileClass = (from, to) =>
  `flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r ${from} ${to} text-white rounded-lg text-xs font-semibold active:scale-95 whitespace-nowrap`;

const PURPLE = mobileClass("from-purple-600", "to-purple-700");
const CYAN   = mobileClass("from-cyan-600",   "to-cyan-700");
const GREEN  = mobileClass("from-green-600",  "to-green-700");
const YELLOW = mobileClass("from-yellow-600", "to-yellow-700");

/**
 * Each action now includes `activeView` — the view string the dashboard
 * should activate when navigated to (e.g. "invoice", "quote", "jobcard", "estimate").
 */
const standard = (
  primaryLabel,  primaryIcon,  primaryHandler,  primaryView,
  secondaryLabel, secondaryIcon, secondaryHandler, secondaryView,
  primaryMobileClass   = PURPLE,
  secondaryMobileClass = CYAN,
) => ({
  actions: [
    { label: primaryLabel,   icon: primaryIcon,   onClick: primaryHandler,   activeView: primaryView,   variant: "primary"   },
    { label: secondaryLabel, icon: secondaryIcon, onClick: secondaryHandler, activeView: secondaryView, variant: "secondary" },
  ],
  mobileActions: [
    { label: primaryLabel,   icon: primaryIcon,   onClick: primaryHandler,   activeView: primaryView,   className: primaryMobileClass   },
    { label: secondaryLabel, icon: secondaryIcon, onClick: secondaryHandler, activeView: secondaryView, className: secondaryMobileClass },
  ],
});

export const getDashboardActions = (dashboardId, handlers = {}) => {
  const {
    handleNewInvoice,
    handleNewQuote,
    handleNewEstimate,
    handleNewJobcard,
  } = handlers;

  const invoiceQuote = standard(
    "New Invoice", FileText,      handleNewInvoice, "invoice",
    "New Quote",   ClipboardList, handleNewQuote,   "quote",
  );

  const configs = {
    // ── Unique overrides ──────────────────────────────────────
    carpentry: standard(
      "New Invoice", Wrench,        handleNewInvoice, "invoice",
      "New Quote",   FileText,      handleNewQuote,   "quote",
      GREEN, YELLOW,
    ),

    landscaping: standard(
      "New Job Card", FileText,      handleNewJobcard, "jobcard",
      "New Quote",    ClipboardList, handleNewQuote,   "quote",
    ),

    mechanics: standard(
      "New Job Card", Wrench,        handleNewInvoice, "invoice",
      "New Quote",    ClipboardList, handleNewQuote,   "quote",
    ),

    construction: standard(
      "New Invoice", FileText,      handleNewInvoice,  "invoice",
      "New Quote",   Construction,  handleNewQuote,    "quote",
    ),

    estimates: standard(
      "New Invoice",  FileText,      handleNewInvoice,  "invoice",
      "New Estimate", ClipboardList, handleNewEstimate, "estimate",
    ),

    accounting: standard(
      "New Invoice",  FileText,      handleNewInvoice,  "invoice",
      "New Quote",    ClipboardList, handleNewQuote,    "quote",
    ),

    // ── Everything else → Invoice + Quote ────────────────────
    cleaning:         invoiceQuote,
    education:        invoiceQuote,
    electrical:       invoiceQuote,
    elctrical:        invoiceQuote,
    flooring:         invoiceQuote,
    health:           invoiceQuote,
    hotel:            invoiceQuote,
    hvac:             invoiceQuote,
    legal:            invoiceQuote,
    logistics:        invoiceQuote,
    painting:         invoiceQuote,
    pestcontrol:      invoiceQuote,
    photography:      invoiceQuote,
    plumbing:         invoiceQuote,
    poolservice:      invoiceQuote,
    realestate:       invoiceQuote,
    restaurants:      invoiceQuote,
    retail:           invoiceQuote,
    security:         invoiceQuote,
    solar:            invoiceQuote,
    technology:       invoiceQuote,
    towing:           invoiceQuote,
    upholstery:       invoiceQuote,
    virtualservice:   invoiceQuote,
    welding:          invoiceQuote,
    windowrepair:     invoiceQuote,
    default:          invoiceQuote,
  };

  return configs[dashboardId] ?? configs.default;
};