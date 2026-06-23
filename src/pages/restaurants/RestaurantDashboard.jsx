import React, { useState, useEffect } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import Templates from "./Templates";
import ServiceMarketplaceView from "../ServiceMarketplaceView";
import ServiceRequestsView from "../ServiceRequestsView";
import PurchaseOrders from "../PurchaseOrders";
import { useLocation } from "react-router-dom";
import AIInvoiceWindow from "../AIInvoiceWindow";
import TemplateSelector, { TemplateRenderer } from "./TemplateSelector";
import { useAuth } from "../../contexts/AuthContext";
import HomeView from "../HomeView";
import BusinessSettingsModal from "../BusinessSettingsModal";
import AppHeader from "../AppHeader";
import StampSignatureModal from "../StampSignatureModal";
import { POTemplateRenderer } from "../Purchaseordertemplates";
import SubUserManagement from "../SubUserManagement";
import { serverTimestamp } from "firebase/firestore";
import logo from "../../assets/img/solidflo-logo.png";
import StampOverlay from "../StampOverlay";
import { getAuth, signOut } from "firebase/auth";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronLeft,
  Home,
  Settings,
  Calendar,
  FileText,
  BarChart3,
  Menu,
  Plus,
  Edit,
  LogOut,
  Trash2,
  Search,
  Upload,
  X,
  AlertCircle,
  Save,
  Eye,
  ChefHat,
  Clock,
  CheckCircle,
  XCircle,
  Receipt,
  Split,
  Briefcase,
  Phone,
  Mail,
  MessageCircle,
  Shield,
  Archive,
  Star,
  CreditCard,
  Banknote,
  Wallet,
} from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ─── Colour palette ────────────────────────────────────────────────────── */
const C = {
  bg: "#F7F8FC",
  sidebar: "#1A1F2E",
  sidebarB: "#242B3D",
  accent: "#F97316", // warm orange — restaurant
  accentL: "#FFF3E8",
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  red: "#EF4444",
  text: "#111827",
  sub: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

/* ─── Sidebar nav items ─────────────────────────────────────────────────── */
const NAV = [
  { id: "Overview", icon: Home, label: "Overview" },
  { id: "Invoicing", icon: Receipt, label: "Table Invoicing" },
  { id: "Catering", icon: Briefcase, label: "Catering & Events" },
  { id: "Menu", icon: UtensilsCrossed, label: "Menu" },
  { id: "Reservations", icon: Calendar, label: "Reservations" },
  { id: "Orders", icon: ShoppingCart, label: "Orders" },
  { id: "Staff", icon: Users, label: "Staff & Sections" },
  { id: "Payments", icon: CreditCard, label: "Payments" },
  { id: "History", icon: Archive, label: "Invoice History" },
  { id: "Analytics", icon: BarChart3, label: "Analytics" },
];

/* ─── Tiny shared components ────────────────────────────────────────────── */
function Badge({ children, color = C.green }) {
  return (
    <span
      style={{
        background: color + "18",
        color,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 99,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = C.accent }) {
  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>{label}</p>
          <p
            style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: 0 }}
          >
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: 12, color: C.green, marginTop: 4 }}>{sub}</p>
          )}
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: color + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color={color} />
        </div>
      </div>
    </Card>
  );
}

function SectionTitle({ children, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
      }}
    >
      <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>
        {children}
      </h2>
      {action}
    </div>
  );
}

function Btn({
  children,
  onClick,
  color = C.accent,
  outline = false,
  small = false,
  icon: Icon,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: small ? "6px 12px" : "9px 18px",
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        borderRadius: 8,
        cursor: "pointer",
        border: outline ? `1.5px solid ${color}` : "none",
        background: outline ? "transparent" : color,
        color: outline ? color : C.white,
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {Icon && <Icon size={small ? 13 : 15} />}
      {children}
    </button>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  style = {},
}) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "9px 12px",
          fontSize: 13,
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          outline: "none",
          boxSizing: "border-box",
          background: C.white,
          color: C.text,
        }}
      />
    </div>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <h3
            style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} color={C.sub} />
          </button>
        </div>
        <div style={{ overflow: "auto", padding: 24, flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── STATUS BADGE COLOURS ──────────────────────────────────────────────── */
function statusColor(status) {
  const map = {
    Completed: C.green,
    Paid: C.green,
    Preparing: "#F59E0B",
    Pending: C.blue,
    Sent: C.blue,
    Cancelled: C.red,
    Overdue: C.red,
    Confirmed: C.purple,
    Draft: C.sub,
  };
  return map[status] || C.sub;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB VIEWS
═══════════════════════════════════════════════════════════════════════════ */

/* ── Overview ──────────────────────────────────────────────────────────── */
function OverviewTab({ metrics, salesData, orders, menuItems }) {
  const pieData = [
    { name: "Dine-in", value: 58 },
    { name: "Takeaway", value: 27 },
    { name: "Catering", value: 15 },
  ];
  const COLORS = [C.accent, C.blue, C.purple];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`R${metrics.totalRevenue.toFixed(2)}`}
          sub="↑ 12.5% from last month"
          color={C.green}
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders Today"
          value={metrics.totalOrders}
          sub="↑ 8.2% from yesterday"
          color={C.blue}
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Menu Items"
          value={metrics.totalMenuItems}
          sub="Active items"
          color={C.purple}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Order Value"
          value={`R${metrics.avgOrderValue.toFixed(2)}`}
          sub="↑ 5.3% increase"
          color={C.accent}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Card>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Weekly Sales
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke={C.sub} fontSize={12} />
              <YAxis stroke={C.sub} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={C.accent}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Revenue Split
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 8,
            }}
          >
            {pieData.map((d, i) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: COLORS[i],
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: C.sub }}>{d.name}</span>
                <span
                  style={{ marginLeft: "auto", fontWeight: 600, color: C.text }}
                >
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Performance metrics */}
      <Card>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.text,
            marginBottom: 16,
          }}
        >
          Today's Performance
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 16,
          }}
        >
          {[
            { label: "Peak Hours", value: "6:00–8:00 PM", color: C.blue },
            {
              label: "Most Popular Item",
              value: "Classic Burger",
              color: C.green,
            },
            { label: "Avg Prep Time", value: "18 mins", color: C.accent },
            { label: "Tables Turned", value: "34", color: C.purple },
            { label: "Outstanding Bills", value: "R1 240.00", color: C.red },
            { label: "VAT Collected", value: "R892.50", color: C.green },
          ].map((m) => (
            <div
              key={m.label}
              style={{ borderLeft: `3px solid ${m.color}`, paddingLeft: 12 }}
            >
              <p style={{ fontSize: 12, color: C.sub, margin: "0 0 4px" }}>
                {m.label}
              </p>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: C.text,
                  margin: 0,
                }}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent orders */}
      <Card>
        <SectionTitle>Recent Orders</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Order ID", "Customer", "Items", "Total", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        color: C.sub,
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr
                  key={o.id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td
                    style={{ padding: "10px", fontWeight: 600, color: C.text }}
                  >
                    #{o.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "10px", color: C.sub }}>
                    {o.customerName || "Guest"}
                  </td>
                  <td style={{ padding: "10px", color: C.sub }}>
                    {o.itemCount || 0} items
                  </td>
                  <td
                    style={{ padding: "10px", fontWeight: 600, color: C.text }}
                  >
                    R{(o.total || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={statusColor(o.status)}>
                      {o.status || "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Table Invoicing ───────────────────────────────────────────────────── */
function InvoicingTab({ menuItems }) {
  const [tableNo, setTableNo] = useState("");
  const [covers, setCovers] = useState(1);
  const [lineItems, setLineItems] = useState([]);
  const [splitCount, setSplitCount] = useState(1);
  const [showSplit, setShowSplit] = useState(false);
  const [sent, setSent] = useState(false);
  const [waPhone, setWaPhone] = useState("");

  const addItem = (mi) => {
    const existing = lineItems.findIndex((l) => l.id === mi.id);
    if (existing >= 0) {
      const updated = [...lineItems];
      updated[existing].qty += 1;
      setLineItems(updated);
    } else {
      setLineItems([...lineItems, { ...mi, qty: 1 }]);
    }
  };

  const removeItem = (id) => setLineItems(lineItems.filter((l) => l.id !== id));

  const subtotal = lineItems.reduce((s, l) => s + l.price * l.qty, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const perHead = covers > 0 ? total / covers : total;

  const handleSendWA = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const categories = [...new Set(menuItems.map((m) => m.category))];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 360px",
        gap: 20,
        alignItems: "start",
      }}
    >
      {/* Left — menu picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Input
              label="Table Number"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              placeholder="e.g. T-04"
            />
            <Input
              label="Covers"
              type="number"
              value={covers}
              onChange={(e) => setCovers(Number(e.target.value))}
              placeholder="1"
            />
          </div>
        </Card>

        {categories.map((cat) => (
          <Card key={cat}>
            <h4
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.sub,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 12,
              }}
            >
              {cat}
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
                gap: 10,
              }}
            >
              {menuItems
                .filter((m) => m.category === cat && m.available)
                .map((mi) => (
                  <button
                    key={mi.id}
                    onClick={() => addItem(mi)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "12px 14px",
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = C.accent)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = C.border)
                    }
                  >
                    <span
                      style={{ fontSize: 13, fontWeight: 600, color: C.text }}
                    >
                      {mi.name}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: C.accent,
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      R{mi.price.toFixed(2)}
                    </span>
                  </button>
                ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Right — bill */}
      <div
        style={{
          position: "sticky",
          top: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: C.text,
              }}
            >
              {tableNo ? `Table ${tableNo}` : "Bill"} · {covers}{" "}
              {covers === 1 ? "cover" : "covers"}
            </h3>
            <Badge color={C.blue}>Draft</Badge>
          </div>

          {lineItems.length === 0 ? (
            <p
              style={{
                color: C.sub,
                fontSize: 13,
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              Tap menu items to add to the bill
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {lineItems.map((l) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                  }}
                >
                  <span style={{ flex: 1, color: C.text }}>{l.name}</span>
                  <span style={{ color: C.sub }}>×{l.qty}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: C.text,
                      minWidth: 70,
                      textAlign: "right",
                    }}
                  >
                    R{(l.price * l.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(l.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    <X size={13} color={C.red} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              borderTop: `1px solid ${C.border}`,
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {[
              ["Subtotal", `R${subtotal.toFixed(2)}`],
              ["VAT (15%)", `R${vat.toFixed(2)}`],
            ].map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: C.sub,
                }}
              >
                <span>{l}</span>
                <span>{v}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                fontWeight: 700,
                color: C.text,
                paddingTop: 8,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <span>Total Due</span>
              <span>R{total.toFixed(2)}</span>
            </div>
            {covers > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: C.sub,
                }}
              >
                <span>Per person</span>
                <span>R{perHead.toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Split billing */}
        <Card>
          <button
            onClick={() => setShowSplit(!showSplit)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
              padding: 0,
            }}
          >
            <Split size={15} color={C.accent} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              Split the bill
            </span>
            <ChevronDown
              size={14}
              color={C.sub}
              style={{
                marginLeft: "auto",
                transform: showSplit ? "rotate(180deg)" : "none",
              }}
            />
          </button>
          {showSplit && (
            <div style={{ marginTop: 12 }}>
              <Input
                label="Split between"
                type="number"
                value={splitCount}
                onChange={(e) => setSplitCount(Number(e.target.value))}
                placeholder="2"
              />
              {splitCount > 1 && total > 0 && (
                <div
                  style={{
                    background: C.accentL,
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: C.sub }}>Each person pays: </span>
                  <span style={{ fontWeight: 700, color: C.accent }}>
                    R{(total / splitCount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Send via WhatsApp */}
        <Card>
          <Input
            label="Customer WhatsApp"
            value={waPhone}
            onChange={(e) => setWaPhone(e.target.value)}
            placeholder="+27 71 234 5678"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              icon={MessageCircle}
              onClick={handleSendWA}
              color="#25D366"
              style={{ flex: 1 }}
            >
              {sent ? "Sent! ✓" : "Send via WhatsApp"}
            </Btn>
            <Btn icon={Eye} outline color={C.blue} small onClick={() => {}}>
              Preview
            </Btn>
          </div>
        </Card>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn
            icon={Receipt}
            onClick={() => {}}
            color={C.accent}
            style={{ flex: 1 }}
          >
            Finalise Invoice
          </Btn>
          <Btn icon={Banknote} onClick={() => {}} outline color={C.green}>
            Mark Paid
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Catering & Events ─────────────────────────────────────────────────── */
function CateringTab() {
  const [events, setEvents] = useState([
    {
      id: "EVT-001",
      client: "Zulu Weddings",
      date: "2025-07-12",
      covers: 120,
      perHead: 380,
      deposit: 10000,
      status: "Confirmed",
    },
    {
      id: "EVT-002",
      client: "MTN Corporate Lunch",
      date: "2025-07-18",
      covers: 40,
      perHead: 220,
      deposit: 2000,
      status: "Draft",
    },
    {
      id: "EVT-003",
      client: "Mokoena Birthday",
      date: "2025-08-03",
      covers: 60,
      perHead: 300,
      deposit: 5000,
      status: "Pending",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    client: "",
    date: "",
    covers: "",
    perHead: "",
    deposit: "",
    notes: "",
  });

  const total = (e) => e.covers * e.perHead;
  const balance = (e) => total(e) - e.deposit;

  const handleSave = () => {
    setEvents([
      ...events,
      {
        id: `EVT-${String(events.length + 1).padStart(3, "0")}`,
        ...form,
        covers: Number(form.covers),
        perHead: Number(form.perHead),
        deposit: Number(form.deposit),
        status: "Draft",
      },
    ]);
    setShowModal(false);
    setForm({
      client: "",
      date: "",
      covers: "",
      perHead: "",
      deposit: "",
      notes: "",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon={Briefcase}
          label="Active Events"
          value={events.filter((e) => e.status !== "Draft").length}
          color={C.accent}
        />
        <StatCard
          icon={Users}
          label="Total Covers"
          value={events.reduce((s, e) => s + e.covers, 0)}
          color={C.blue}
        />
        <StatCard
          icon={DollarSign}
          label="Deposits Held"
          value={`R${events.reduce((s, e) => s + e.deposit, 0).toLocaleString()}`}
          color={C.green}
        />
        <StatCard
          icon={TrendingUp}
          label="Projected Revenue"
          value={`R${events.reduce((s, e) => s + total(e), 0).toLocaleString()}`}
          color={C.purple}
        />
      </div>

      <Card>
        <SectionTitle
          action={
            <Btn icon={Plus} small onClick={() => setShowModal(true)}>
              New Event
            </Btn>
          }
        >
          Upcoming Events & Catering
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((e) => (
            <div
              key={e.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 100px 110px 110px auto",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: C.bg,
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                fontSize: 13,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: C.text }}>
                  {e.client}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.sub }}>
                  {e.date}
                </p>
              </div>
              <span style={{ color: C.sub }}>{e.covers} covers</span>
              <span style={{ color: C.sub }}>R{e.perHead}/head</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: C.text }}>
                  R{total(e).toLocaleString()}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.red }}>
                  Bal R{balance(e).toLocaleString()}
                </p>
              </div>
              <Badge color={statusColor(e.status)}>{e.status}</Badge>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn
                  small
                  outline
                  color={C.blue}
                  icon={Receipt}
                  onClick={() => {}}
                >
                  Invoice
                </Btn>
                <Btn
                  small
                  outline
                  color={C.green}
                  icon={CheckCircle}
                  onClick={() => {}}
                >
                  Paid
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showModal && (
        <Modal
          title="New Catering Event"
          onClose={() => setShowModal(false)}
          width={520}
        >
          <Input
            label="Client / Organisation"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            placeholder="e.g. Zulu Weddings"
          />
          <Input
            label="Event Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label="Covers"
              type="number"
              value={form.covers}
              onChange={(e) => setForm({ ...form, covers: e.target.value })}
              placeholder="80"
            />
            <Input
              label="Price per Head (R)"
              type="number"
              value={form.perHead}
              onChange={(e) => setForm({ ...form, perHead: e.target.value })}
              placeholder="350"
            />
          </div>
          <Input
            label="Deposit Collected (R)"
            type="number"
            value={form.deposit}
            onChange={(e) => setForm({ ...form, deposit: e.target.value })}
            placeholder="5000"
          />
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
              }}
            >
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              style={{
                width: "100%",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                padding: "9px 12px",
                fontSize: 13,
                resize: "vertical",
                minHeight: 80,
                boxSizing: "border-box",
              }}
              placeholder="Menu preferences, dietary requirements, special requests…"
            />
          </div>
          {form.covers && form.perHead && (
            <div
              style={{
                background: C.accentL,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              <span style={{ color: C.sub }}>Total event value: </span>
              <span style={{ fontWeight: 700, color: C.accent }}>
                R{(Number(form.covers) * Number(form.perHead)).toLocaleString()}
              </span>
              {form.deposit && (
                <span style={{ color: C.sub }}>
                  {" "}
                  · Balance: R
                  {(
                    Number(form.covers) * Number(form.perHead) -
                    Number(form.deposit)
                  ).toLocaleString()}
                </span>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              onClick={handleSave}
              color={C.accent}
              icon={Save}
              style={{ flex: 1 }}
            >
              Save Event
            </Btn>
            <Btn onClick={() => setShowModal(false)} outline color={C.sub}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Reservations ──────────────────────────────────────────────────────── */
function ReservationsTab() {
  const [reservations, setReservations] = useState([
    {
      id: "RES-001",
      name: "Sipho Nkosi",
      date: "2025-07-08",
      time: "19:00",
      covers: 4,
      table: "T-06",
      special: "Anniversary",
      status: "Confirmed",
    },
    {
      id: "RES-002",
      name: "Fatima Adams",
      date: "2025-07-08",
      time: "20:00",
      covers: 2,
      table: "T-02",
      special: "",
      status: "Confirmed",
    },
    {
      id: "RES-003",
      name: "Ruan Pretorius",
      date: "2025-07-09",
      time: "13:00",
      covers: 8,
      table: "T-10",
      special: "Gluten-free",
      status: "Pending",
    },
    {
      id: "RES-004",
      name: "Lerato Dlamini",
      date: "2025-07-10",
      time: "18:30",
      covers: 3,
      table: "T-04",
      special: "",
      status: "Confirmed",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    time: "",
    covers: "",
    table: "",
    special: "",
    phone: "",
  });

  const handleSave = () => {
    setReservations([
      ...reservations,
      {
        id: `RES-${String(reservations.length + 1).padStart(3, "0")}`,
        ...form,
        covers: Number(form.covers),
        status: "Pending",
      },
    ]);
    setShowModal(false);
    setForm({
      name: "",
      date: "",
      time: "",
      covers: "",
      table: "",
      special: "",
      phone: "",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon={Calendar}
          label="Today's Bookings"
          value={reservations.filter((r) => r.date === "2025-07-08").length}
          color={C.accent}
        />
        <StatCard
          icon={Users}
          label="Total Covers"
          value={reservations.reduce((s, r) => s + r.covers, 0)}
          color={C.blue}
        />
        <StatCard
          icon={Star}
          label="Special Requests"
          value={reservations.filter((r) => r.special).length}
          color={C.purple}
        />
        <StatCard
          icon={CheckCircle}
          label="Confirmed"
          value={reservations.filter((r) => r.status === "Confirmed").length}
          color={C.green}
        />
      </div>

      <Card>
        <SectionTitle
          action={
            <Btn icon={Plus} small onClick={() => setShowModal(true)}>
              New Reservation
            </Btn>
          }
        >
          Reservations Log
        </SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "ID",
                  "Guest",
                  "Date",
                  "Time",
                  "Covers",
                  "Table",
                  "Special",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      color: C.sub,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td
                    style={{ padding: "10px", fontWeight: 600, color: C.text }}
                  >
                    {r.id}
                  </td>
                  <td style={{ padding: "10px", color: C.text }}>{r.name}</td>
                  <td style={{ padding: "10px", color: C.sub }}>{r.date}</td>
                  <td style={{ padding: "10px", color: C.sub }}>{r.time}</td>
                  <td style={{ padding: "10px", color: C.sub }}>{r.covers}</td>
                  <td style={{ padding: "10px", color: C.sub }}>{r.table}</td>
                  <td
                    style={{
                      padding: "10px",
                      color: r.special ? C.accent : C.sub,
                    }}
                  >
                    {r.special || "—"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={statusColor(r.status)}>{r.status}</Badge>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <Btn
                      small
                      outline
                      color={C.blue}
                      icon={Receipt}
                      onClick={() => {}}
                    >
                      Bill
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <Modal title="New Reservation" onClose={() => setShowModal(false)}>
          <Input
            label="Guest Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Sipho Nkosi"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+27 71 234 5678"
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <Input
              label="Covers"
              type="number"
              value={form.covers}
              onChange={(e) => setForm({ ...form, covers: e.target.value })}
              placeholder="2"
            />
            <Input
              label="Table"
              value={form.table}
              onChange={(e) => setForm({ ...form, table: e.target.value })}
              placeholder="T-04"
            />
          </div>
          <Input
            label="Special Requests"
            value={form.special}
            onChange={(e) => setForm({ ...form, special: e.target.value })}
            placeholder="Anniversary, allergy info…"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              onClick={handleSave}
              color={C.accent}
              icon={Save}
              style={{ flex: 1 }}
            >
              Save Reservation
            </Btn>
            <Btn onClick={() => setShowModal(false)} outline color={C.sub}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Staff & Sections ──────────────────────────────────────────────────── */
function StaffTab() {
  const [staff, setStaff] = useState([
    {
      id: "S-01",
      name: "Nomsa Dube",
      role: "Head Waiter",
      section: "Indoor A",
      invoices: 24,
      tips: 840,
    },
    {
      id: "S-02",
      name: "Thabo Molefe",
      role: "Waiter",
      section: "Outdoor",
      invoices: 18,
      tips: 620,
    },
    {
      id: "S-03",
      name: "Ayesha Isaacs",
      role: "Waiter",
      section: "Bar",
      invoices: 31,
      tips: 1120,
    },
    {
      id: "S-04",
      name: "Pieter van Wyk",
      role: "Cashier",
      section: "Till",
      invoices: 0,
      tips: 0,
    },
  ]);

  const sections = [
    { name: "Indoor A", tables: "T-01 – T-08", waiter: "Nomsa Dube" },
    { name: "Indoor B", tables: "T-09 – T-15", waiter: "Unassigned" },
    { name: "Outdoor", tables: "T-16 – T-22", waiter: "Thabo Molefe" },
    { name: "Bar", tables: "B-01 – B-06", waiter: "Ayesha Isaacs" },
    { name: "VIP Room", tables: "VIP-01 – 03", waiter: "Unassigned" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon={Users}
          label="Active Staff"
          value={staff.length}
          color={C.accent}
        />
        <StatCard
          icon={Receipt}
          label="Bills Raised"
          value={staff.reduce((s, st) => s + st.invoices, 0)}
          color={C.blue}
        />
        <StatCard
          icon={DollarSign}
          label="Tips Collected"
          value={`R${staff.reduce((s, st) => s + st.tips, 0).toLocaleString()}`}
          color={C.green}
        />
        <StatCard
          icon={Star}
          label="Top Performer"
          value="Ayesha Isaacs"
          color={C.purple}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionTitle
            action={
              <Btn small icon={Plus} onClick={() => {}}>
                Add Staff
              </Btn>
            }
          >
            Staff Performance
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {staff.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: C.bg,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: C.accent + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.accent,
                    flexShrink: 0,
                  }}
                >
                  {s.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.text,
                    }}
                  >
                    {s.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.sub }}>
                    {s.role} · {s.section}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.text,
                    }}
                  >
                    {s.invoices} bills
                  </p>
                  <p
                    style={{ margin: "2px 0 0", fontSize: 11, color: C.green }}
                  >
                    R{s.tips} tips
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Section Map</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sections.map((sec) => (
              <div
                key={sec.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: C.bg,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: sec.waiter === "Unassigned" ? C.red : C.green,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 13,
                      color: C.text,
                    }}
                  >
                    {sec.name}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.sub }}>
                    {sec.tables}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: sec.waiter === "Unassigned" ? C.red : C.sub,
                  }}
                >
                  {sec.waiter}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── Payments ──────────────────────────────────────────────────────────── */
function PaymentsTab() {
  const [payments, setPayments] = useState([
    {
      id: "PAY-001",
      invoice: "INV-0089",
      customer: "Table T-04",
      amount: 1874.5,
      method: "Card",
      date: "2025-07-07",
      status: "Paid",
    },
    {
      id: "PAY-002",
      invoice: "INV-0090",
      customer: "MTN Corp",
      amount: 8800.0,
      method: "EFT",
      date: "2025-07-07",
      status: "Paid",
    },
    {
      id: "PAY-003",
      invoice: "INV-0091",
      customer: "Table T-11",
      amount: 640.0,
      method: "Cash",
      date: "2025-07-07",
      status: "Paid",
    },
    {
      id: "PAY-004",
      invoice: "INV-0092",
      customer: "Table T-06",
      amount: 3200.0,
      method: "Card",
      date: "2025-07-07",
      status: "Pending",
    },
    {
      id: "PAY-005",
      invoice: "INV-0088",
      customer: "Zulu Events",
      amount: 45600,
      method: "EFT",
      date: "2025-07-06",
      status: "Pending",
    },
  ]);

  const methodIcon = { Card: CreditCard, EFT: Banknote, Cash: Wallet };
  const methodColor = { Card: C.blue, EFT: C.green, Cash: C.accent };

  const total = payments
    .filter((p) => p.status === "Paid")
    .reduce((s, p) => s + p.amount, 0);
  const pending = payments
    .filter((p) => p.status === "Pending")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon={CheckCircle}
          label="Collected Today"
          value={`R${total.toLocaleString()}`}
          color={C.green}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={`R${pending.toLocaleString()}`}
          color={C.red}
        />
        <StatCard
          icon={CreditCard}
          label="Card Payments"
          value={payments.filter((p) => p.method === "Card").length}
          color={C.blue}
        />
        <StatCard
          icon={Banknote}
          label="EFT Payments"
          value={payments.filter((p) => p.method === "EFT").length}
          color={C.purple}
        />
      </div>

      {/* Method breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
        }}
      >
        {["Card", "EFT", "Cash"].map((method) => {
          const Icon = methodIcon[method];
          const color = methodColor[method];
          const total = payments
            .filter((p) => p.method === method)
            .reduce((s, p) => s + p.amount, 0);
          return (
            <Card key={method}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} color={color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                  {method}
                </span>
              </div>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.text,
                  margin: "0 0 2px",
                }}
              >
                R{total.toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>
                {payments.filter((p) => p.method === method).length}{" "}
                transactions
              </p>
            </Card>
          );
        })}
      </div>

      <Card>
        <SectionTitle>Payment Log</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "ID",
                  "Invoice",
                  "Customer",
                  "Amount",
                  "Method",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      color: C.sub,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const MIcon = methodIcon[p.method];
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {p.id}
                    </td>
                    <td style={{ padding: "10px", color: C.sub }}>
                      {p.invoice}
                    </td>
                    <td style={{ padding: "10px", color: C.text }}>
                      {p.customer}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      R{p.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <MIcon size={13} color={methodColor[p.method]} />
                        <span style={{ color: C.sub }}>{p.method}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px", color: C.sub }}>{p.date}</td>
                    <td style={{ padding: "10px" }}>
                      <Badge color={statusColor(p.status)}>{p.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Invoice History ───────────────────────────────────────────────────── */
function HistoryTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const invoices = [
    {
      id: "INV-0092",
      customer: "Table T-06",
      date: "2025-07-07",
      amount: 3200.0,
      vat: 417.39,
      status: "Pending",
      method: "Card",
    },
    {
      id: "INV-0091",
      customer: "Table T-11",
      date: "2025-07-07",
      amount: 640.0,
      vat: 83.48,
      status: "Paid",
      method: "Cash",
    },
    {
      id: "INV-0090",
      customer: "MTN Corp",
      date: "2025-07-07",
      amount: 8800.0,
      vat: 1147.83,
      status: "Paid",
      method: "EFT",
    },
    {
      id: "INV-0089",
      customer: "Table T-04",
      date: "2025-07-06",
      amount: 1874.5,
      vat: 244.5,
      status: "Paid",
      method: "Card",
    },
    {
      id: "INV-0088",
      customer: "Zulu Events",
      date: "2025-07-06",
      amount: 45600.0,
      vat: 5947.83,
      status: "Pending",
      method: "EFT",
    },
    {
      id: "INV-0087",
      customer: "Table T-02",
      date: "2025-07-05",
      amount: 420.0,
      vat: 54.78,
      status: "Paid",
      method: "Cash",
    },
  ];

  const statuses = ["All", "Paid", "Pending", "Overdue"];
  const filtered = invoices
    .filter((i) => filter === "All" || i.status === filter)
    .filter(
      (i) =>
        i.customer.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon={Receipt}
          label="Total Invoiced"
          value={`R${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`}
          color={C.accent}
        />
        <StatCard
          icon={Shield}
          label="VAT Collected"
          value={`R${invoices.reduce((s, i) => s + i.vat, 0).toLocaleString()}`}
          color={C.blue}
        />
        <StatCard
          icon={CheckCircle}
          label="Paid Invoices"
          value={invoices.filter((i) => i.status === "Paid").length}
          color={C.green}
        />
        <StatCard
          icon={Clock}
          label="Outstanding"
          value={invoices.filter((i) => i.status !== "Paid").length}
          color={C.red}
        />
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={14}
              color={C.sub}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices…"
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                fontSize: 13,
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {/* Status filter */}
          <div style={{ display: "flex", gap: 6 }}>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 20,
                  cursor: "pointer",
                  border: `1.5px solid ${filter === s ? C.accent : C.border}`,
                  background: filter === s ? C.accentL : "transparent",
                  color: filter === s ? C.accent : C.sub,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <Btn small icon={Archive} outline color={C.blue} onClick={() => {}}>
            Export CSV
          </Btn>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Invoice",
                  "Customer",
                  "Date",
                  "Amount",
                  "VAT",
                  "Method",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      color: C.sub,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr
                  key={inv.id}
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <td
                    style={{
                      padding: "10px",
                      fontWeight: 700,
                      color: C.accent,
                    }}
                  >
                    {inv.id}
                  </td>
                  <td style={{ padding: "10px", color: C.text }}>
                    {inv.customer}
                  </td>
                  <td style={{ padding: "10px", color: C.sub }}>{inv.date}</td>
                  <td
                    style={{ padding: "10px", fontWeight: 700, color: C.text }}
                  >
                    R{inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px", color: C.sub }}>
                    R{inv.vat.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px", color: C.sub }}>
                    {inv.method}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <Badge color={statusColor(inv.status)}>{inv.status}</Badge>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn
                        small
                        outline
                        color={C.blue}
                        icon={Eye}
                        onClick={() => {}}
                      >
                        View
                      </Btn>
                      <Btn
                        small
                        outline
                        color={C.accent}
                        icon={MessageCircle}
                        onClick={() => {}}
                      >
                        WA
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: C.sub,
                    }}
                  >
                    No invoices match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Menu Tab (carry-forward, restyled) ─────────────────────────────────── */
function MenuTab({ menuItems, onAdd, onEdit, onDelete }) {
  const categories = [...new Set(menuItems.map((m) => m.category))];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {categories.map((cat) => (
        <Card key={cat}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.sub,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 16,
            }}
          >
            {cat}
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: 14,
            }}
          >
            {menuItems
              .filter((m) => m.category === cat)
              .map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: 110,
                      background: C.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <UtensilsCrossed size={36} color={C.border} />
                    )}
                    <div style={{ position: "absolute", top: 8, right: 8 }}>
                      <Badge color={item.available ? C.green : C.red}>
                        {item.available ? "Available" : "Off"}
                      </Badge>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {item.name}
                    </p>
                    <p
                      style={{ margin: "0 0 8px", fontSize: 12, color: C.sub }}
                    >
                      {item.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: C.accent,
                        }}
                      >
                        R{item.price.toFixed(2)}
                      </span>
                      {item.prepTime > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: C.sub,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Clock size={11} /> {item.prepTime}m
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          flex: 1,
                          padding: "7px",
                          fontSize: 12,
                          borderRadius: 7,
                          border: `1px solid ${C.border}`,
                          background: C.bg,
                          cursor: "pointer",
                          color: C.text,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        style={{
                          padding: "7px 10px",
                          fontSize: 12,
                          borderRadius: 7,
                          border: "none",
                          background: C.red + "18",
                          cursor: "pointer",
                          color: C.red,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}
      {menuItems.length === 0 && (
        <Card>
          <p style={{ textAlign: "center", color: C.sub, padding: "32px 0" }}>
            No menu items yet. Add your first item.
          </p>
        </Card>
      )}
    </div>
  );
}

/* ── Orders Tab (restyled) ──────────────────────────────────────────────── */
function OrdersTab({ orders }) {
  return (
    <Card>
      <SectionTitle>All Orders</SectionTitle>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Order ID", "Date", "Customer", "Items", "Total", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      color: C.sub,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px", fontWeight: 600, color: C.text }}>
                  #{o.id}
                </td>
                <td style={{ padding: "10px", color: C.sub }}>
                  {o.createdAt.toLocaleDateString()}
                </td>
                <td style={{ padding: "10px", color: C.text }}>
                  {o.customerName || "Guest"}
                </td>
                <td style={{ padding: "10px", color: C.sub }}>
                  {o.itemCount || 0} items
                </td>
                <td style={{ padding: "10px", fontWeight: 700, color: C.text }}>
                  R{(o.total || 0).toFixed(2)}
                </td>
                <td style={{ padding: "10px" }}>
                  <Badge color={statusColor(o.status)}>
                    {o.status || "Pending"}
                  </Badge>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: "32px", textAlign: "center", color: C.sub }}
                >
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── Analytics Tab (restyled) ────────────────────────────────────────────── */
function AnalyticsTab({ salesData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Weekly Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke={C.sub} fontSize={12} />
              <YAxis stroke={C.sub} fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={C.accent}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              marginBottom: 16,
            }}
          >
            Daily Orders
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke={C.sub} fontSize={12} />
              <YAxis stroke={C.sub} fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill={C.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.text,
            marginBottom: 16,
          }}
        >
          Performance Summary
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 16,
          }}
        >
          {[
            { label: "Peak Hours", value: "6:00–8:00 PM", color: C.blue },
            {
              label: "Most Popular Item",
              value: "Classic Burger",
              color: C.green,
            },
            { label: "Avg Prep Time", value: "18 mins", color: C.accent },
            { label: "Busiest Day", value: "Saturday", color: C.purple },
          ].map((m) => (
            <div
              key={m.label}
              style={{ borderLeft: `3px solid ${m.color}`, paddingLeft: 12 }}
            >
              <p style={{ fontSize: 12, color: C.sub, margin: "0 0 4px" }}>
                {m.label}
              </p>
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: C.text,
                  margin: 0,
                }}
              >
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
const RestaurantDashboard = () => {
  const db = getFirestore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [showSettings, setShowSettings] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    category: "",
    price: "",
    cost: "",
    description: "",
    prepTime: "",
    calories: "",
    imageUrl: "",
    available: true,
  });

  const [menuItems, setMenuItems] = useState([
    {
      id: "1",
      name: "Classic Burger",
      category: "Burgers",
      price: 129.99,
      cost: 55,
      description: "Juicy beef patty with lettuce, tomato and special sauce",
      prepTime: 15,
      calories: 650,
      imageUrl: "",
      available: true,
    },
    {
      id: "2",
      name: "Margherita Pizza",
      category: "Pizza",
      price: 149.99,
      cost: 60,
      description: "Fresh mozzarella, basil and tomato sauce",
      prepTime: 20,
      calories: 800,
      imageUrl: "",
      available: true,
    },
    {
      id: "3",
      name: "Grilled Chicken",
      category: "Mains",
      price: 164.99,
      cost: 70,
      description: "Flame-grilled chicken breast with seasonal sides",
      prepTime: 18,
      calories: 520,
      imageUrl: "",
      available: true,
    },
    {
      id: "4",
      name: "Craft Beer Bucket",
      category: "Drinks",
      price: 220.0,
      cost: 80,
      description: "6 assorted craft beers on ice",
      prepTime: 2,
      calories: 0,
      imageUrl: "",
      available: true,
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: "ord-001",
      customerName: "Sipho N.",
      itemCount: 3,
      total: 435.5,
      status: "Completed",
      createdAt: new Date(),
    },
    {
      id: "ord-002",
      customerName: "Fatima A.",
      itemCount: 2,
      total: 289.99,
      status: "Preparing",
      createdAt: new Date(),
    },
    {
      id: "ord-003",
      customerName: "Ruan P.",
      itemCount: 4,
      total: 620.0,
      status: "Pending",
      createdAt: new Date(),
    },
  ]);

  const [salesData, setSalesData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalMenuItems: 0,
    avgOrderValue: 0,
  });
  const location = useLocation();

  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    setSalesData(
      days.map((d) => ({
        date: d,
        sales: Math.floor(Math.random() * 8000) + 3000,
        orders: Math.floor(Math.random() * 50) + 20,
      })),
    );
  }, []);

  useEffect(() => {
    const rev = orders.reduce((s, o) => s + (o.total || 0), 0);
    setMetrics({
      totalRevenue: rev,
      totalOrders: orders.length,
      totalMenuItems: menuItems.length,
      avgOrderValue: orders.length > 0 ? rev / orders.length : 0,
    });
  }, [menuItems, orders]);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
    const fn = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (location.state?.activeView) setActiveTab(location.state.activeView);
  }, [location.state]);

  /* Menu CRUD */
  const handleAddMenuItem = () => {
    setEditingItem(null);
    setMenuForm({
      name: "",
      category: "",
      price: "",
      cost: "",
      description: "",
      prepTime: "",
      calories: "",
      imageUrl: "",
      available: true,
    });
    setShowMenuModal(true);
  };
  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setMenuForm(item);
    setShowMenuModal(true);
  };
  const handleDeleteMenuItem = (id) => {
    if (!window.confirm("Delete this item?")) return;
    setMenuItems(menuItems.filter((i) => i.id !== id));
  };
  const handleSaveMenuItem = () => {
    if (!menuForm.name || !menuForm.price) {
      alert("Name and price are required");
      return;
    }
    const data = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      cost: parseFloat(menuForm.cost) || 0,
      prepTime: parseInt(menuForm.prepTime) || 0,
      calories: parseInt(menuForm.calories) || 0,
    };
    if (editingItem)
      setMenuItems(
        menuItems.map((i) =>
          i.id === editingItem.id ? { ...data, id: i.id } : i,
        ),
      );
    else setMenuItems([...menuItems, { ...data, id: Date.now().toString() }]);
    setShowMenuModal(false);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).catch(console.error);
  };

  /* Active-tab header CTA */
  const headerCTA = {
    Menu: (
      <Btn icon={Plus} small onClick={handleAddMenuItem}>
        Add Item
      </Btn>
    ),
    Invoicing: null,
    Catering: null,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: C.bg,
        fontFamily: "'Inter',sans-serif",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        style={{
          width: sidebarOpen ? 230 : 0,
          minWidth: sidebarOpen ? 230 : 0,
          overflow: "hidden",
          background: C.sidebar,
          height: "100vh",
          position: "fixed",
          zIndex: 40,
          transition: "width 0.25s, min-width 0.25s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: 13,
                  color: "#fff",
                }}
              >
                SolidFlo
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Restaurants
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
          {NAV.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id;
            return (
              <div
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  marginBottom: 2,
                  background: active ? C.accent : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon
                  size={15}
                  color={active ? "#fff" : "rgba(255,255,255,0.45)"}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#fff" : "rgba(255,255,255,0.55)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              marginTop: 12,
              paddingTop: 12,
            }}
          >
            <div
              onClick={() => setShowSettings(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Settings size={15} color="rgba(255,255,255,0.45)" />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                Settings
              </span>
            </div>
          </div>
        </nav>

        {/* User */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: C.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChefHat size={15} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.displayName || "Restaurant Owner"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <LogOut size={14} color="rgba(255,255,255,0.35)" />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 230 : 0,
          transition: "margin-left 0.25s",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            padding: "0 24px",
            height: 58,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              <Menu size={18} color={C.sub} />
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
              }}
            >
              {NAV.find((n) => n.id === activeTab)?.label || activeTab}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {headerCTA[activeTab]}
            <Btn
              icon={LogOut}
              outline
              color={C.red}
              small
              onClick={handleLogout}
            >
              Logout
            </Btn>
          </div>
        </div>

        {/* Page body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeTab === "Overview" && (
            <OverviewTab
              metrics={metrics}
              salesData={salesData}
              orders={orders}
              menuItems={menuItems}
            />
          )}
          {activeTab === "Invoicing" && <InvoicingTab menuItems={menuItems} />}
          {activeTab === "Catering" && <CateringTab />}
          {activeTab === "Reservations" && <ReservationsTab />}
          {activeTab === "Menu" && (
            <MenuTab
              menuItems={menuItems}
              onAdd={handleAddMenuItem}
              onEdit={handleEditMenuItem}
              onDelete={handleDeleteMenuItem}
            />
          )}
          {activeTab === "Orders" && <OrdersTab orders={orders} />}
          {activeTab === "Staff" && <StaffTab />}
          {activeTab === "Payments" && <PaymentsTab />}
          {activeTab === "History" && <HistoryTab />}
          {activeTab === "Analytics" && <AnalyticsTab salesData={salesData} />}
        </div>
      </div>

      {/* ── Menu item modal ── */}
      {showMenuModal && (
        <Modal
          title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
          onClose={() => setShowMenuModal(false)}
        >
          <Input
            label="Item Name *"
            value={menuForm.name}
            onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            placeholder="e.g. Margherita Pizza"
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <Input
              label="Category"
              value={menuForm.category}
              onChange={(e) =>
                setMenuForm({ ...menuForm, category: e.target.value })
              }
              placeholder="Pizza"
            />
            <Input
              label="Price (R) *"
              type="number"
              value={menuForm.price}
              onChange={(e) =>
                setMenuForm({ ...menuForm, price: e.target.value })
              }
              placeholder="149.99"
            />
            <Input
              label="Cost (R)"
              type="number"
              value={menuForm.cost}
              onChange={(e) =>
                setMenuForm({ ...menuForm, cost: e.target.value })
              }
              placeholder="60.00"
            />
            <Input
              label="Prep Time (min)"
              type="number"
              value={menuForm.prepTime}
              onChange={(e) =>
                setMenuForm({ ...menuForm, prepTime: e.target.value })
              }
              placeholder="20"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                marginBottom: 6,
              }}
            >
              Description
            </label>
            <textarea
              value={menuForm.description}
              onChange={(e) =>
                setMenuForm({ ...menuForm, description: e.target.value })
              }
              style={{
                width: "100%",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                padding: "9px 12px",
                fontSize: 13,
                resize: "vertical",
                minHeight: 72,
                boxSizing: "border-box",
              }}
              placeholder="Describe your dish…"
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <input
              type="checkbox"
              id="avail"
              checked={menuForm.available}
              onChange={(e) =>
                setMenuForm({ ...menuForm, available: e.target.checked })
              }
            />
            <label htmlFor="avail" style={{ fontSize: 13, color: C.text }}>
              Available for ordering
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              onClick={handleSaveMenuItem}
              color={C.accent}
              icon={Save}
              style={{ flex: 1 }}
            >
              {editingItem ? "Update Item" : "Add Item"}
            </Btn>
            <Btn onClick={() => setShowMenuModal(false)} outline color={C.sub}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {showSettings && (
        <BusinessSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default RestaurantDashboard;
