// components/AppHeader.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardRoute } from "../utils/dashboardRoutes";
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Plus,
  HelpCircle,
  X,
  FileSignature,
  Users,
  Receipt,
  Briefcase,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  ClipboardList,
  Wrench,
  Hammer,
  Sparkles,
  ShoppingBag,
  Package,
  UserPlus,
} from "lucide-react";

// ── Palette — matches HotelSidebar (dark navy shell + lime accent) ──────────
const Z = {
  accent: "#c6f135",
  accentHover: "#b3dc2a",
  accentText: "#0f1623",
  navy: "#0f1623",
  navyMid: "#1e2535",
  navyRing: "#2d3a52",
  blue: "#3b82f6",
  blueLight: "#e8f0fb",
  green: "#059669",
  greenLight: "#eafaf1",
  amber: "#d97706",
  amberLight: "#fffbeb",
  danger: "#dc2626",
  dangerLight: "#fdf2f0",
  border: "#d9dde6",
  bg: "#f4f5f8",
  white: "#ffffff",
  text: "#0f1623",
  textMid: "#4a5568",
  textMuted: "#8a93a6",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700&display=swap');

  .zah * { font-family: 'Lato', sans-serif; box-sizing: border-box; }

  /* Floating shell — same margin/rounding treatment as the sidebar cards */
  .zah-shell {
    padding: 12px 12px 0 12px;
  }
  @media (min-width: 768px) {
    .zah-shell { padding: 12px 12px 0 0; }
  }

  .zah-bar {
    position: sticky; top: 12px; z-index: 40;
    background: ${Z.navy};
    border-radius: 16px;
    box-shadow: 0 4px 18px rgba(15,22,35,.18);
    height: 56px;
    display: flex; align-items: center;
    padding: 0 12px;
    gap: 4px;
    min-width: 0;
  }

  .zah-left {
    display: flex; align-items: center; gap: 6px;
    flex-shrink: 0; min-width: 0;
    max-width: calc(100vw - 180px);
    overflow: hidden;
  }

  .zah-hamburger {
    width: 32px; height: 32px; border-radius: 10px;
    background: transparent; border: none; cursor: pointer;
    color: #94a3b8;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  .zah-hamburger:hover { background: ${Z.navyMid}; color: #fff; }

  .zah-logo-icon {
    width: 30px; height: 30px; border-radius: 10px;
    background: ${Z.accent};
    display: none; align-items: center; justify-content: center; flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .zah-logo-icon { display: flex; }
  }

  .zah-brand {
    font-size: 14px; font-weight: 700; color: #fff; letter-spacing: .02em;
    white-space: nowrap; flex-shrink: 0;
  }
  .zah-divider { width: 1px; height: 18px; background: rgba(255,255,255,.1); margin: 0 2px; flex-shrink: 0; }
  .zah-page-title {
    font-size: 12px; color: rgba(255,255,255,.5); white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
    display: none;
  }
  @media (min-width: 480px) {
    .zah-page-title { display: block; max-width: 120px; }
  }
  @media (min-width: 768px) {
    .zah-page-title { max-width: 200px; }
  }

  .zah-plan {
    display: none;
    align-items: center;
    padding: 2px 9px; border-radius: 20px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
    white-space: nowrap; flex-shrink: 0;
  }
  @media (min-width: 520px) {
    .zah-plan { display: inline-flex; }
  }
  .zah-plan-pro        { background: ${Z.navyMid}; color: #c6f135; }
  .zah-plan-enterprise { background: rgb(46, 2, 116); color: #c4b5fd; }
  .zah-plan-free       { background: rgb(97, 4, 4); color: rgba(255,255,255,.5); }

  .zah-docnum {
    font-size: 10px; font-family: 'Courier New', monospace;
    color: rgba(255,255,255,.35);
    padding: 2px 8px; border: 1px solid rgba(255,255,255,.12);
    border-radius: 6px; white-space: nowrap;
    display: none;
  }
  @media (min-width: 1024px) {
    .zah-docnum { display: inline; }
  }

  .zah-spacer { flex: 1; min-width: 0; }

  .zah-right {
    display: flex; align-items: center; gap: 4px;
    flex-shrink: 0;
  }
  @media (min-width: 640px) {
    .zah-right { gap: 6px; }
  }

  .zah-icon-btn {
    width: 34px; height: 34px; border-radius: 10px;
    background: ${Z.navyMid}; border: none; cursor: pointer;
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    position: relative; transition: background .15s, color .15s;
    flex-shrink: 0;
  }
  .zah-icon-btn:hover { background: ${Z.accent}; color: ${Z.accentText}; }

  .zah-search-pill {
    display: none;
    align-items: center; justify-content: center;
    width: 34px; height: 34px;
    background: ${Z.navyMid}; border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px; cursor: pointer; color: rgba(255,255,255,.6);
    transition: background .15s, border-color .15s, color .15s;
    flex-shrink: 0;
    padding: 0;
    gap: 0;
  }
  @media (min-width: 640px) {
    .zah-search-pill {
      display: flex;
      width: auto; padding: 0 12px; gap: 6px;
    }
  }
  .zah-search-pill:hover {
    background: rgb(30, 41, 64); border-color: rgba(255,255,255,.15); color: rgba(255,255,255,.9);
  }
  .zah-search-label { font-size: 12px; white-space: nowrap; }
  .zah-kbd {
    padding: 1px 5px; background: rgba(255,255,255,.1);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 5px; font-size: 10px; font-family: monospace;
    color: rgb(255, 255, 255);
  }

  .zah-create-btn {
    height: 34px;
    padding: 0 12px;
    background: ${Z.accent}; color: ${Z.accentText};
    border: none; border-radius: 10px; cursor: pointer;
    font-size: 12px; font-weight: 700; letter-spacing: .01em;
    display: flex; align-items: center; gap: 4px;
    transition: background .15s;
    font-family: 'Lato', sans-serif;
    white-space: nowrap; flex-shrink: 0;
  }
  .zah-create-btn:hover { background: ${Z.accentHover}; }
  .zah-create-label { display: none; }
  @media (min-width: 400px) {
    .zah-create-label { display: inline; }
    .zah-create-btn { padding: 0 14px; }
  }

  .zah-notif-dot {
    position: absolute; top: 3px; right: 3px;
    width: 14px; height: 14px; border-radius: 50%;
    background: ${Z.accent}; border: 2px solid ${Z.navy};
    font-size: 8px; font-weight: 700; color: ${Z.accentText};
    display: flex; align-items: center; justify-content: center;
  }

  .zah-bell-btn {
    display: none !important;
  }
  @media (min-width: 640px) {
    .zah-bell-btn { display: flex !important; }
  }

  .zah-help-btn { display: none !important; }
  @media (min-width: 640px) {
    .zah-help-btn { display: flex !important; }
  }

  .zah-v-divider {
    width: 1px; height: 22px; background: rgba(255,255,255,.08);
    margin: 0 2px; flex-shrink: 0;
  }

  .zah-avatar-btn {
    display: flex; align-items: center; gap: 5px;
    height: 34px; padding: 0 4px;
    background: ${Z.navyMid}; border: none; cursor: pointer;
    border-radius: 10px; transition: background .15s;
    flex-shrink: 0;
  }
  .zah-avatar-btn:hover { background: rgb(30, 41, 64); }
  .zah-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: ${Z.accent};
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: ${Z.accentText}; flex-shrink: 0;
    overflow: hidden;
  }
  .zah-username {
    font-size: 12px; font-weight: 700; color: rgba(255,255,255,.85);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    display: none;
    max-width: 90px;
  }
  @media (min-width: 640px) {
    .zah-username { display: block; }
    .zah-avatar-btn { padding: 0 8px 0 4px; gap: 7px; }
  }
  .zah-chevron  { color: rgba(255,255,255,.4); transition: transform .2s; flex-shrink: 0; }
  .zah-chevron.open { transform: rotate(180deg); }

  .zah-dropdown {
    position: fixed; z-index: 9999;
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(15,22,35,.2);
    overflow: hidden;
    animation: zah-drop .15s ease;
    max-width: calc(100vw - 20px);
  }
  @keyframes zah-drop { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }

  .zah-drop-head {
    padding: 10px 14px;
    background: ${Z.bg};
    border-bottom: 1px solid ${Z.border};
  }
  .zah-drop-head-title { font-size: 10px; font-weight: 700; color: ${Z.textMuted}; text-transform: uppercase; letter-spacing: .07em; }

  .zah-drop-item {
    width: 100%; display: flex; align-items: center; justify-content: space-between;
    padding: 9px 14px; background: none; border: none; cursor: pointer;
    font-size: 13px; color: ${Z.textMid}; text-align: left;
    transition: background .12s;
    font-family: 'Lato', sans-serif;
  }
  .zah-drop-item:hover { background: ${Z.bg}; color: ${Z.text}; }
  .zah-drop-item-left { display: flex; align-items: center; gap: 9px; }
  .zah-drop-item-kbd {
    padding: 1px 6px; background: ${Z.bg};
    border: 1px solid ${Z.border}; border-radius: 5px;
    font-size: 10px; font-family: monospace; color: ${Z.textMuted};
  }
  .zah-drop-divider { height: 1px; background: ${Z.border}; margin: 2px 0; }

  .zah-user-card {
    padding: 14px; background: ${Z.navy};
    border-bottom: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; gap: 10px;
  }
  .zah-user-card-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: ${Z.accent};
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: ${Z.accentText}; flex-shrink: 0; overflow: hidden;
  }
  .zah-user-card-name  { font-size: 13px; font-weight: 700; color: #fff; }
  .zah-user-card-email { font-size: 11px; color: rgba(255,255,255,.45); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px; }
  .zah-user-badges     { display: flex; gap: 5px; margin-top: 5px; flex-wrap: wrap; }
  .zah-user-badge-industry {
    padding: 1px 7px; border-radius: 20px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
    background: ${Z.accent}; color: ${Z.accentText};
  }

  .zah-drop-item.danger { color: ${Z.danger}; }
  .zah-drop-item.danger:hover { background: ${Z.dangerLight}; }

  .zah-notif-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px 14px; transition: background .12s; cursor: default;
    border-bottom: 1px solid ${Z.border};
  }
  .zah-notif-item:last-child { border-bottom: none; }
  .zah-notif-item.unread { background: ${Z.blueLight}; }
  .zah-notif-item:hover  { background: ${Z.bg}; }
  .zah-notif-title { font-size: 12px; font-weight: 700; color: ${Z.text}; }
  .zah-notif-msg   { font-size: 11px; color: ${Z.textMid}; margin-top: 2px; }
  .zah-notif-time  { font-size: 10px; color: ${Z.textMuted}; margin-top: 3px; }
  .zah-notif-dismiss {
    background: none; border: none; cursor: pointer; padding: 2px;
    color: ${Z.textMuted}; border-radius: 5px; flex-shrink: 0;
    transition: background .12s, color .12s;
  }
  .zah-notif-dismiss:hover { background: ${Z.border}; color: ${Z.text}; }

  .zah-notif-footer {
    padding: 8px 14px; border-top: 1px solid ${Z.border};
    background: ${Z.bg};
  }
  .zah-notif-footer-btn {
    width: 100%; background: none; border: none; cursor: pointer;
    font-size: 11px; font-weight: 700; color: ${Z.blue}; text-align: center;
    font-family: 'Lato', sans-serif; padding: 2px;
    transition: color .12s;
  }
  .zah-notif-footer-btn:hover { color: ${Z.accentHover}; }

  .zah-mark-all {
    background: none; border: none; cursor: pointer;
    font-size: 11px; font-weight: 700; color: ${Z.blue};
    font-family: 'Lato', sans-serif; padding: 0;
    transition: color .12s;
    white-space: nowrap;
  }
  .zah-mark-all:hover { color: ${Z.danger}; }

  .zah-notif-empty { padding: 24px 14px; text-align: center; }
  .zah-notif-empty-icon { width: 40px; height: 40px; background: ${Z.navy}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
  .zah-notif-empty-text { font-size: 12px; color: ${Z.textMuted}; }

  .zah-search-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(15,22,35,.55); backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 60px;
    animation: zah-fade .15s ease;
  }
  @media (min-width: 640px) {
    .zah-search-overlay { padding-top: 80px; }
  }
  @keyframes zah-fade { from { opacity:0 } to { opacity:1 } }

  .zah-search-box {
    background: ${Z.white};
    border: 1px solid ${Z.border};
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(15,22,35,.25);
    width: 100%; max-width: 520px;
    margin: 0 12px;
    overflow: hidden;
    animation: zah-up .18s ease;
  }
  @keyframes zah-up { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

  .zah-search-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-bottom: 1px solid ${Z.border};
  }
  .zah-search-input {
    flex: 1; border: none; outline: none;
    font-size: 14px; color: ${Z.text}; background: transparent;
    font-family: 'Lato', sans-serif;
    min-width: 0;
  }
  .zah-search-input::placeholder { color: ${Z.textMuted}; }
  .zah-search-hints { padding: 10px 14px; display: flex; flex-wrap: wrap; gap: 6px; }
  .zah-hint-chip {
    height: 26px; padding: 0 10px;
    background: ${Z.bg}; border: 1px solid ${Z.border};
    border-radius: 8px; font-size: 11px; font-weight: 600; color: ${Z.textMid};
    cursor: pointer; transition: border-color .12s, color .12s;
    font-family: 'Lato', sans-serif;
  }
  .zah-hint-chip:hover { border-color: ${Z.blue}; color: ${Z.blue}; }
  .zah-search-foot {
    padding: 8px 14px; border-top: 1px solid ${Z.border};
    background: ${Z.bg};
    display: flex; justify-content: space-between;
    flex-wrap: wrap; gap: 4px;
  }
  .zah-search-foot span { font-size: 10px; color: ${Z.textMuted}; }
  .zah-search-foot-kbd {
    padding: 1px 5px; background: ${Z.white}; border: 1px solid ${Z.border};
    border-radius: 5px; font-family: monospace; font-size: 10px; color: ${Z.textMid};
  }

  /* ── Action buttons row (scrollable on mobile) ── */
  .zah-actions-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-top: 1px solid rgba(255,255,255,.07);
    background: ${Z.navyMid};
    border-radius: 0 0 16px 16px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex-shrink: 0;
  }
  .zah-actions-bar::-webkit-scrollbar { display: none; }
`;

const DASHBOARD_CONFIG = {
  mechanics: {
    label: "Mechanics",
    quickCreate: [
      {
        label: "New Job Card",
        icon: ClipboardList,
        shortcut: "J",
        view: "invoice",
        action: "newInvoice",
      },
      {
        label: "New Quote",
        icon: FileSignature,
        shortcut: "Q",
        view: "invoice",
        action: "newQuote",
      },
      {
        label: "New Customer",
        icon: UserPlus,
        shortcut: "C",
        view: null,
        action: "newCustomer",
      },
      {
        label: "Purchase Order",
        icon: ShoppingBag,
        shortcut: "P",
        view: "purchase-orders",
        action: null,
      },
      {
        label: "Parts Inventory",
        icon: Package,
        shortcut: "L",
        view: "parts-inventory",
        action: null,
      },
    ],
  },
  construction: {
    label: "Construction",
    quickCreate: [
      {
        label: "New Quote",
        icon: FileSignature,
        shortcut: "Q",
        view: "quote",
        action: "newQuote",
      },
      {
        label: "New Invoice",
        icon: FileText,
        shortcut: "I",
        view: "invoice",
        action: "newInvoice",
      },
      {
        label: "New Client",
        icon: UserPlus,
        shortcut: "C",
        view: null,
        action: "newCustomer",
      },
      {
        label: "Schedule Job",
        icon: Briefcase,
        shortcut: "S",
        view: "schedule",
        action: null,
      },
      {
        label: "Reports",
        icon: Receipt,
        shortcut: "R",
        view: "reports",
        action: null,
      },
    ],
  },
  cleaning: {
    label: "Cleaning",
    quickCreate: [
      {
        label: "New Quote",
        icon: FileSignature,
        shortcut: "Q",
        view: "quote",
        action: "newQuote",
      },
      {
        label: "New Invoice",
        icon: FileText,
        shortcut: "I",
        view: "quote",
        action: "newInvoice",
      },
      {
        label: "New Client",
        icon: UserPlus,
        shortcut: "C",
        view: null,
        action: "newCustomer",
      },
      {
        label: "New Job",
        icon: Sparkles,
        shortcut: "J",
        view: "jobs",
        action: null,
      },
      {
        label: "Schedule",
        icon: Briefcase,
        shortcut: "S",
        view: "schedule",
        action: null,
      },
    ],
  },
  carpentry: {
    label: "Carpentry",
    quickCreate: [
      {
        label: "New Quote",
        icon: FileSignature,
        shortcut: "Q",
        view: "quote",
        action: "newQuote",
      },
      {
        label: "New Invoice",
        icon: FileText,
        shortcut: "I",
        view: "quote",
        action: "newInvoice",
      },
      {
        label: "New Client",
        icon: UserPlus,
        shortcut: "C",
        view: null,
        action: "newCustomer",
      },
      {
        label: "New Project",
        icon: Hammer,
        shortcut: "P",
        view: "projects",
        action: null,
      },
      {
        label: "Work Order",
        icon: Wrench,
        shortcut: "W",
        view: "work-orders",
        action: null,
      },
    ],
  },
  electrical: {
    label: "Electrical",
    quickCreate: [
      {
        label: "New Quote",
        icon: FileSignature,
        shortcut: "Q",
        view: "quote",
        action: "newQuote",
      },
      {
        label: "New Invoice",
        icon: FileText,
        shortcut: "I",
        view: "invoice",
        action: "newInvoice",
      },
      {
        label: "New Client",
        icon: UserPlus,
        shortcut: "C",
        view: null,
        action: "newCustomer",
      },
      {
        label: "Schedule",
        icon: Briefcase,
        shortcut: "S",
        view: "schedule",
        action: null,
      },
      {
        label: "Reports",
        icon: Receipt,
        shortcut: "R",
        view: "reports",
        action: null,
      },
    ],
  },
};

const DEFAULT_CONFIG = {
  label: "Dashboard",
  quickCreate: [
    {
      label: "New Invoice",
      icon: FileText,
      shortcut: "I",
      view: "invoice",
      action: "newInvoice",
    },
    {
      label: "New Quote",
      icon: FileSignature,
      shortcut: "Q",
      view: "quote",
      action: "newQuote",
    },
    {
      label: "New Client",
      icon: UserPlus,
      shortcut: "C",
      view: null,
      action: "newCustomer",
    },
    {
      label: "New Expense",
      icon: Receipt,
      shortcut: "E",
      view: "expenses",
      action: null,
    },
    {
      label: "New Project",
      icon: Briefcase,
      shortcut: "P",
      view: "projects",
      action: null,
    },
  ],
};

const planMeta = {
  free: { label: "Free", cls: "zah-plan zah-plan-free" },
  pro: { label: "Pro", cls: "zah-plan zah-plan-pro" },
  enterprise: { label: "Enterprise", cls: "zah-plan zah-plan-enterprise" },
};

const notifIcon = (type) => {
  if (type === "success")
    return (
      <CheckCircle2
        size={14}
        color={Z.green}
        style={{ flexShrink: 0, marginTop: 1 }}
      />
    );
  if (type === "warning")
    return (
      <AlertCircle
        size={14}
        color={Z.amber}
        style={{ flexShrink: 0, marginTop: 1 }}
      />
    );
  return (
    <Clock size={14} color={Z.blue} style={{ flexShrink: 0, marginTop: 1 }} />
  );
};

const useDropStyle = (desiredWidth = 220) => {
  const getStyle = () => {
    const vw = window.innerWidth;
    const safeWidth = Math.min(desiredWidth, vw - 20);
    return { right: 22, top: 68, width: safeWidth };
  };
  return getStyle;
};

/* ─── Component ──────────────────────────────────────────────────────────── */
const AppHeader = ({
  dashboardType = "mechanics",
  sidebarOpen = false,
  setSidebarOpen = () => {},
  onQuickCreate = () => {},
  actions = [],
  mobileActions = [],
  showActions = true,
  onSettingsOpen,
  onTeamOpen,
  notifications = [],
  pageTitle = "",
  plan = "pro",
  showConvertButton = false, // ← add
  onConvert = () => {}, // ← add
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localNotifs, setLocalNotifs] = useState(notifications);
  const [isMobile, setIsMobile] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const quickCreateRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = localNotifs.filter((n) => !n.read).length;
  const dashConfig = DASHBOARD_CONFIG[dashboardType] ?? DEFAULT_CONFIG;

  const getDropStyle = useDropStyle();
  const getNotifDropStyle = useDropStyle(300);
  const getUserMenuDropStyle = useDropStyle(240);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target))
        setShowQuickCreate(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((p) => !p);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowQuickCreate(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = () =>
    setLocalNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const dismissNotif = (id) =>
    setLocalNotifs((p) => p.filter((n) => n.id !== id));

  const getUserInitials = () => {
    if (user?.name)
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };
  const getUserDisplayName = () =>
    user?.name || user?.email?.split("@")[0] || "User";

  const handleQuickCreateItem = (item) => {
    setShowQuickCreate(false);
    onQuickCreate({ view: item.view, action: item.action, label: item.label });
  };

  // Decide which action list to render
  const visibleActions =
    isMobile && mobileActions.length > 0 ? mobileActions : actions;

  return (
    <div className="zah zah-shell">
      <style>{css}</style>

      {/* ── Search overlay ── */}
      {showSearch && (
        <div
          className="zah-search-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowSearch(false);
          }}
        >
          <div className="zah-search-box">
            <div className="zah-search-row">
              <Search size={16} color={Z.textMuted} style={{ flexShrink: 0 }} />
              <input
                ref={searchRef}
                className="zah-search-input"
                type="text"
                placeholder={`Search ${dashConfig.label.toLowerCase()} documents, clients…`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: Z.textMuted,
                  display: "flex",
                  padding: 2,
                }}
                onClick={() => setShowSearch(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="zah-search-hints">
              {["Unpaid", "Overdue", "Last 30 days", "Top clients"].map((h) => (
                <button
                  key={h}
                  className="zah-hint-chip"
                  onClick={() => setSearchQuery(h)}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="zah-search-foot">
              <span>
                <span className="zah-search-foot-kbd">↵</span> to search
              </span>
              <span>
                <span className="zah-search-foot-kbd">Esc</span> to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Header bar ── */}
      <header className="zah-bar print:hidden">
        {/* Left */}
        <div className="zah-left">
          <button
            className="zah-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="zah-logo-icon">
            <LayoutDashboard size={14} color={Z.accentText} />
          </div>

          {pageTitle && (
            <>
              <span className="zah-divider" />
              <span className="zah-page-title">{pageTitle}</span>
            </>
          )}

          {plan && plan !== "free" && (
            <span className={(planMeta[plan] ?? planMeta.pro).cls}>
              {(planMeta[plan] ?? planMeta.pro).label}
            </span>
          )}
        </div>

        <div className="zah-spacer" />

        {/* Right */}
        <div className="zah-right">
          {/* Search — desktop only */}
          {showConvertButton ? (
            <button
              onClick={onConvert}
              style={{
                height: 34,
                padding: "0 14px",
                background: Z.accent,
                color: Z.accentText,
                border: "none",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "'Lato',sans-serif",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <FileText size={13} />
              Convert to Invoice
            </button>
          ) : (
            <button
              className="zah-search-pill"
              onClick={() => setShowSearch(true)}
              aria-label="Search"
            >
              <Search size={13} />
              <span className="zah-search-label">Search…</span>
              <span className="zah-kbd">⌘K</span>
            </button>
          )}
          {/* + Create */}
          <div style={{ position: "relative" }} ref={quickCreateRef}>
            <button
              className="zah-create-btn"
              onClick={() => setShowQuickCreate((p) => !p)}
            >
              <Plus size={13} />
              <span className="zah-create-label">Create</span>
            </button>

            {showQuickCreate && (
              <div className="zah-dropdown" style={getDropStyle()}>
                <div className="zah-drop-head">
                  <span className="zah-drop-head-title">
                    {dashConfig.label} · Quick Create
                  </span>
                </div>
                {dashConfig.quickCreate.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="zah-drop-item"
                      onClick={() => handleQuickCreateItem(item)}
                    >
                      <span className="zah-drop-item-left">
                        <Icon size={14} color={Z.textMuted} />
                        {item.label}
                      </span>
                      <span className="zah-drop-item-kbd">{item.shortcut}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Page-level action buttons ── */}
          {showActions &&
            visibleActions.length > 0 &&
            visibleActions.map((action, i) => {
              const {
                label,
                icon: Icon,
                onClick,
                variant = "secondary",
                className,
              } = action;

              // If a className was passed (Tailwind), use it directly
              if (className) {
                return (
                  <button
                    key={i}
                    onClick={onClick}
                    title={label}
                    aria-label={label}
                    className={className}
                  >
                    {Icon && <Icon size={13} />}
                    <span>{label}</span>
                  </button>
                );
              }

              // Fallback: render with inline styles (variant-based)
              return (
                <button
                  key={i}
                  onClick={onClick}
                  title={label}
                  aria-label={label}
                  style={
                    variant === "primary"
                      ? {
                          height: 34,
                          padding: "0 14px",
                          background: Z.accent,
                          color: Z.accentText,
                          border: "none",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontFamily: "'Lato',sans-serif",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }
                      : {
                          height: 34,
                          padding: "0 12px",
                          background: Z.navyMid,
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontFamily: "'Lato',sans-serif",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }
                  }
                >
                  {Icon && <Icon size={13} />}
                  <span>{label}</span>
                </button>
              );
            })}

          {/* Help — desktop only */}
          <button
            className="zah-icon-btn zah-help-btn"
            title="Help & Support"
            onClick={() => navigate("/help")}
          >
            <HelpCircle size={16} />
          </button>

          {/* Notifications — desktop only */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              className="zah-icon-btn zah-bell-btn"
              onClick={() => setShowNotifications((p) => !p)}
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="zah-notif-dot">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="zah-dropdown" style={getNotifDropStyle()}>
                <div
                  className="zah-drop-head"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="zah-drop-head-title">
                    Notifications
                    {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
                  </span>
                  {unreadCount > 0 && (
                    <button className="zah-mark-all" onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {localNotifs.length === 0 ? (
                    <div className="zah-notif-empty">
                      <div className="zah-notif-empty-icon">
                        <Bell size={18} color={Z.textMuted} />
                      </div>
                      <div className="zah-notif-empty-text">
                        No notifications yet
                      </div>
                    </div>
                  ) : (
                    localNotifs.map((n) => (
                      <div
                        key={n.id}
                        className={`zah-notif-item${n.read ? "" : " unread"}`}
                      >
                        {notifIcon(n.type)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="zah-notif-title">{n.title}</div>
                          {n.message && (
                            <div className="zah-notif-msg">{n.message}</div>
                          )}
                          {n.time && (
                            <div className="zah-notif-time">{n.time}</div>
                          )}
                        </div>
                        <button
                          className="zah-notif-dismiss"
                          onClick={() => dismissNotif(n.id)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="zah-notif-footer">
                  <button
                    className="zah-notif-footer-btn"
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/notifications");
                    }}
                  >
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="zah-v-divider" />

          {/* User menu */}
          <div style={{ position: "relative" }} ref={userMenuRef}>
            <button
              className="zah-avatar-btn"
              onClick={() => setShowUserMenu((p) => !p)}
            >
              <div className="zah-avatar">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              <span className="zah-username">{getUserDisplayName()}</span>
              <ChevronDown
                size={13}
                className={`zah-chevron${showUserMenu ? " open" : ""}`}
              />
            </button>

            {showUserMenu && (
              <div className="zah-dropdown" style={getUserMenuDropStyle()}>
                <div className="zah-user-card">
                  <div className="zah-user-card-avatar">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="avatar"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="zah-user-card-name">
                      {getUserDisplayName()}
                    </div>
                    <div className="zah-user-card-email">{user?.email}</div>
                  </div>
                </div>

                <button
                  className="zah-drop-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate(getDashboardRoute(user?.dashboardId));
                  }}
                >
                  <span className="zah-drop-item-left">
                    <LayoutDashboard size={14} color={Z.textMuted} /> Dashboard
                  </span>
                </button>
                {onTeamOpen && (
                  <button
                    className="zah-drop-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      onTeamOpen();
                    }}
                  >
                    <span className="zah-drop-item-left">
                      <Users size={14} color={Z.textMuted} /> Manage Team
                    </span>
                  </button>
                )}
                {onSettingsOpen && (
                  <button
                    className="zah-drop-item"
                    onClick={() => {
                      setShowUserMenu(false);
                      onSettingsOpen();
                    }}
                  >
                    <span className="zah-drop-item-left">
                      <Settings size={14} color={Z.textMuted} /> Business
                      Settings
                    </span>
                  </button>
                )}

                <div className="zah-drop-divider" />

                <button className="zah-drop-item danger" onClick={handleLogout}>
                  <span className="zah-drop-item-left">
                    <LogOut size={14} color={Z.danger} /> Sign out
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default AppHeader;
