import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { serverTimestamp } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  orderBy,
  limit,
  getDocs,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import uploadLogoToR2 from "../../utils/uploadLogoToR2";
import logo from "../../assets/img/solidflo.png";
import logotop from "../../assets/img/retail-logo-top.png";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Receipt,
  Settings,
  Menu,
  X,
  Plus,
  Eye,
  Send,
  Download,
  Printer,
  Trash2,
  Edit,
  Save,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Zap,
  Upload,
  Search,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
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
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n = 0) =>
  "R " +
  Number(n)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");

const today = () => new Date().toISOString().split("T")[0];
const daysOut = (d) =>
  new Date(Date.now() + d * 86400000).toISOString().split("T")[0];

const STATUS_STYLES = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-600",
};

const STOCK_STATUS = (p) => {
  if (p.stock === 0)
    return { label: "Out of stock", cls: "bg-red-100 text-red-800" };
  if (p.stock <= p.minStock)
    return { label: "Low stock", cls: "bg-yellow-100 text-yellow-800" };
  return { label: "In stock", cls: "bg-green-100 text-green-800" };
};

// ─── Empty invoice line ───────────────────────────────────────────────────────
const emptyLine = () => ({ desc: "", qty: 1, unit: "" });

// ─── Invoice line-item row ────────────────────────────────────────────────────
function LineItemRow({ item, idx, onChange, onRemove }) {
  const total = Number(item.qty) * Number(item.unit) || 0;
  return (
    <div className="grid grid-cols-12 gap-2 mb-2 items-center">
      <input
        className="col-span-5 border rounded-lg px-3 py-2 text-sm"
        placeholder="Description"
        value={item.desc}
        onChange={(e) => onChange(idx, "desc", e.target.value)}
      />
      <input
        className="col-span-2 border rounded-lg px-3 py-2 text-sm"
        type="number"
        min="1"
        placeholder="Qty"
        value={item.qty}
        onChange={(e) => onChange(idx, "qty", e.target.value)}
      />
      <input
        className="col-span-2 border rounded-lg px-3 py-2 text-sm"
        type="number"
        min="0"
        step="0.01"
        placeholder="Unit (R)"
        value={item.unit}
        onChange={(e) => onChange(idx, "unit", e.target.value)}
      />
      <div className="col-span-2 px-3 py-2 text-sm bg-gray-50 border rounded-lg font-medium text-gray-700">
        {fmt(total)}
      </div>
      <button
        onClick={() => onRemove(idx)}
        className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-500"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Invoice Preview ──────────────────────────────────────────────────────────
function InvoicePreview({ inv, biz }) {
  const subtotal = (inv.items || []).reduce(
    (a, l) => a + Number(l.qty) * Number(l.unit),
    0,
  );
  const vat = inv.vatEnabled ? subtotal * 0.15 : 0;
  const total = subtotal + vat;

  return (
    <div
      className="border rounded-xl overflow-hidden text-sm font-sans"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* Header */}
      <div className="bg-blue-900 text-white px-6 py-5 flex justify-between">
        <div>
          <div className="text-xl font-bold tracking-tight">SolidFlo</div>
          <div className="text-xs text-blue-300 mt-0.5">{biz?.name}</div>
          <div className="text-xs text-blue-400 mt-0.5">{biz?.address}</div>
          {biz?.vatNo && (
            <div className="text-xs text-blue-400">VAT: {biz.vatNo}</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{inv.number || "INV-XXXX"}</div>
          <div className="text-xs text-blue-300 mt-1">Issued: {inv.date}</div>
          <div className="text-xs text-blue-300">Due: {inv.due}</div>
          <span className="mt-2 inline-block bg-blue-700 text-blue-100 text-xs px-2 py-0.5 rounded">
            INVOICE
          </span>
        </div>
      </div>

      {/* Bill to */}
      <div className="px-6 pt-4 pb-2">
        <div className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">
          Bill to
        </div>
        <div className="font-semibold text-gray-800">{inv.customer || "—"}</div>
        {inv.email && <div className="text-xs text-gray-500">{inv.email}</div>}
      </div>

      {/* Line items */}
      <div className="px-6 pb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="py-2 px-2 text-left font-semibold">Description</th>
              <th className="py-2 px-2 text-right font-semibold">Qty</th>
              <th className="py-2 px-2 text-right font-semibold">Unit</th>
              <th className="py-2 px-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {(inv.items || []).map((li, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-2">{li.desc || "—"}</td>
                <td className="py-2 px-2 text-right">{li.qty}</td>
                <td className="py-2 px-2 text-right">{fmt(Number(li.unit))}</td>
                <td className="py-2 px-2 text-right font-medium">
                  {fmt(Number(li.qty) * Number(li.unit))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-3">
          <div className="w-52">
            <div className="flex justify-between text-xs text-gray-500 py-1">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {inv.vatEnabled && (
              <div className="flex justify-between text-xs text-gray-500 py-1">
                <span>VAT (15%)</span>
                <span>{fmt(vat)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm bg-blue-50 text-blue-900 rounded-lg px-3 py-2 mt-1">
              <span>Total Due</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes / Banking */}
        {(inv.notes || biz?.bank) && (
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            {inv.notes && <p className="mb-1">{inv.notes}</p>}
            {biz?.bank && (
              <p>
                Banking: {biz.bank} · Acc {biz.accNo} · Branch {biz.branch}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 text-xs text-gray-400 text-center">
        Proudly  African · Generated by SolidFlo
      </div>
    </div>
  );
}

// ─── New / Edit Invoice Modal ─────────────────────────────────────────────────
function InvoiceModal({ onClose, onSave, bizInfo, existingInv = null }) {
  const isEdit = !!existingInv;
  const [form, setForm] = useState(
    existingInv || {
      number: "INV-" + Date.now().toString().slice(-4),
      customer: "",
      email: "",
      phone: "",
      date: today(),
      due: daysOut(30),
      vatEnabled: true,
      notes: "",
      items: [emptyLine()],
    },
  );
  const [preview, setPreview] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const updateLine = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    set("items", items);
  };

  const removeLine = (idx) => {
    if (form.items.length === 1) return;
    set(
      "items",
      form.items.filter((_, i) => i !== idx),
    );
  };

  const subtotal = form.items.reduce(
    (a, l) => a + Number(l.qty) * Number(l.unit),
    0,
  );
  const vat = form.vatEnabled ? subtotal * 0.15 : 0;
  const total = subtotal + vat;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] flex flex-col shadow-xl">
        {/* Head */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {isEdit ? "Edit Invoice" : "New Invoice"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              {preview ? "Form" : "Preview"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {preview ? (
            <InvoicePreview inv={form} biz={bizInfo} />
          ) : (
            <>
              {/* Customer */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Customer / Business name
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.customer}
                    onChange={(e) => set("customer", e.target.value)}
                    placeholder="e.g. Cape Boutique Co."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="client@store.co.za"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Invoice number
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.number}
                    onChange={(e) => set("number", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Issue date
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Due date
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.due}
                    onChange={(e) => set("due", e.target.value)}
                  />
                </div>
              </div>

              {/* Line items header */}
              <div className="grid grid-cols-12 gap-2 mb-1 text-xs font-medium text-gray-500 px-0.5">
                <span className="col-span-5">Description</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-2">Unit price</span>
                <span className="col-span-2">Total</span>
              </div>

              {form.items.map((li, idx) => (
                <LineItemRow
                  key={idx}
                  item={li}
                  idx={idx}
                  onChange={updateLine}
                  onRemove={removeLine}
                />
              ))}

              <button
                onClick={() => set("items", [...form.items, emptyLine()])}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mt-1 mb-4"
              >
                <Plus className="w-4 h-4" />
                Add line item
              </button>

              {/* Totals */}
              <div className="flex justify-end mb-4">
                <div className="w-56 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>VAT (15%)</span>
                    <span>{fmt(vat)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold bg-blue-50 text-blue-900 rounded-lg px-3 py-2">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Payment notes
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="e.g. EFT to FNB 62001234567 Branch 250655"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6 text-sm text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.vatEnabled}
                    onChange={(e) => set("vatEnabled", e.target.checked)}
                    className="rounded"
                  />
                  Include 15% VAT
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendWhatsApp || false}
                    onChange={(e) => set("sendWhatsApp", e.target.checked)}
                    className="rounded"
                  />
                  Send via WhatsApp on save
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({ ...form, subtotal, vat, total, status: "draft" })
            }
            className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() =>
              onSave({ ...form, subtotal, vat, total, status: "pending" })
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Point of Sale Modal ──────────────────────────────────────────────────────
function POSModal({ products, onClose, onComplete }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (p) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex)
        return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((c) =>
      c
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            Point of Sale
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Products grid */}
          <div className="flex-1 p-4 overflow-y-auto border-r">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              placeholder="Search product or scan barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className="text-left border rounded-xl p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-sm text-gray-800 mb-0.5 leading-tight">
                    {p.name}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{p.sku}</div>
                  <div className="font-bold text-blue-600">{fmt(p.price)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {p.stock} in stock
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="w-72 p-4 flex flex-col">
            <div className="text-sm font-semibold text-gray-700 mb-3">
              Current sale
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {cart.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-8">
                  Tap a product to add
                </div>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 text-gray-700 leading-tight">
                    {item.name}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-6 h-6 border rounded flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-medium">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-6 h-6 border rounded flex items-center justify-center text-gray-500 hover:bg-gray-100"
                  >
                    +
                  </button>
                  <span className="w-20 text-right font-medium">
                    {fmt(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-1 mb-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT (15%)</span>
                <span>{fmt(vat)}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-900 bg-blue-50 rounded-lg px-3 py-2">
                <span>Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Payment method
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                {["Cash", "Card", "EFT", "SnapScan", "Zapper"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCart([])}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
              <button
                onClick={() => {
                  if (cart.length) {
                    onComplete(cart, total, payMethod);
                    setCart([]);
                  }
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Charge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Spark bar chart ──────────────────────────────────────────────────────────
function SparkBars({ data, valueKey, labelKey, color = "#2563eb" }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-1.5" style={{ height: 80 }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t"
            style={{
              height: Math.max(4, Math.round((d[valueKey] / max) * 72)),
              background: d[valueKey] === max ? color : color + "33",
            }}
          />
          <span className="text-[9px] text-gray-400">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function RetailDashboard() {
  const { user, authUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ── UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInv, setPreviewInv] = useState(null);
  const [showPOS, setShowPOS] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [invFilter, setInvFilter] = useState("all");

  // ── Data state
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bizInfo, setBizInfo] = useState({
    name: "My Retail Store",
    email: "",
    phone: "",
    vatNo: "",
    address: "",
    bank: "",
    accNo: "",
    branch: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "5",
    description: "",
    imageUrl: "",
  });
  const [salesData] = useState(
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
      day: d,
      sales: [12400, 8900, 15200, 11000, 18300, 22100, 9400][i],
    })),
  );

  // ── Sync location state
  useEffect(() => {
    if (location.state?.activeView) setActiveView(location.state.activeView);
  }, [location.state]);

  // ── Load data
  useEffect(() => {
    if (!user?.uid) return;
    loadInvoices();
    loadProducts();
    loadCustomers();
    loadBizInfo();
  }, [user]);

  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Firestore loaders
  const loadInvoices = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "invoices"),
        orderBy("createdAt", "desc"),
        limit(100),
      );
      const snap = await getDocs(q);
      setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const loadProducts = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "products"),
        orderBy("createdAt", "desc"),
      );
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomers = async () => {
    if (!user?.uid) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "customers"),
        orderBy("name"),
      );
      const snap = await getDocs(q);
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
  };

  const loadBizInfo = async () => {
    if (!user?.uid) return;
    try {
      const snap = await getDoc(
        doc(db, "users", user.uid, "settings", "businessInfo"),
      );
      if (snap.exists()) setBizInfo(snap.data());
    } catch (e) {
      console.error(e);
    }
  };

  // ── Invoice actions
  const handleSaveInvoice = async (formData) => {
    if (!user?.uid) return;
    try {
      const data = { ...formData, updatedAt: serverTimestamp() };
      if (editingInvoice?.firestoreId) {
        await updateDoc(
          doc(db, "users", user.uid, "invoices", editingInvoice.firestoreId),
          data,
        );
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "users", user.uid, "invoices"), data);
      }
      setShowInvoiceModal(false);
      setEditingInvoice(null);
      loadInvoices();
    } catch (e) {
      console.error(e);
      alert("Failed to save invoice");
    }
  };

  const markPaid = async (inv) => {
    if (!user?.uid || !inv.firestoreId) return;
    await updateDoc(doc(db, "users", user.uid, "invoices", inv.firestoreId), {
      status: "paid",
      paidAt: serverTimestamp(),
    });
    loadInvoices();
  };

  const deleteInvoice = async (inv) => {
    if (!window.confirm("Delete this invoice?")) return;
    await deleteDoc(doc(db, "users", user.uid, "invoices", inv.firestoreId));
    loadInvoices();
  };

  // ── Product actions
  const handleSaveProduct = async () => {
    if (!user?.uid) return;
    if (!productForm.name || !productForm.price) {
      alert("Name and price are required");
      return;
    }
    try {
      const data = {
        ...productForm,
        price: parseFloat(productForm.price),
        cost: parseFloat(productForm.cost) || 0,
        stock: parseInt(productForm.stock) || 0,
        minStock: parseInt(productForm.minStock) || 5,
        updatedAt: serverTimestamp(),
      };
      if (editingProduct) {
        await updateDoc(
          doc(db, "users", user.uid, "products", editingProduct.id),
          data,
        );
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "users", user.uid, "products"), data);
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (e) {
      alert("Failed to save product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await deleteDoc(doc(db, "users", user.uid, "products", id));
    loadProducts();
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;
    try {
      const storage = getStorage();
      const r = ref(
        storage,
        `users/${user.uid}/products/${Date.now()}_${file.name}`,
      );
      await uploadBytes(r, file);
      const url = await getDownloadURL(r);
      setProductForm((f) => ({ ...f, imageUrl: url }));
    } catch (e) {
      alert("Image upload failed");
    }
  };

  // ── POS checkout
  const handlePOSComplete = async (cartItems, total, payMethod) => {
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, "users", user.uid, "pos_sales"), {
        items: cartItems,
        total,
        payMethod,
        createdAt: serverTimestamp(),
      });
      // Decrement stock
      for (const item of cartItems) {
        const p = products.find((pr) => pr.id === item.id);
        if (p)
          await updateDoc(doc(db, "users", user.uid, "products", item.id), {
            stock: Math.max(0, p.stock - item.qty),
          });
      }
      alert(`Sale of ${fmt(total)} via ${payMethod} recorded!`);
      loadProducts();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Settings save
  const saveBizInfo = async () => {
    if (!user?.uid) return;
    await setDoc(
      doc(db, "users", user.uid, "settings", "businessInfo"),
      { ...bizInfo, updatedAt: serverTimestamp() },
      { merge: true },
    );
    alert("Settings saved!");
  };

  // ── Derived metrics
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((a, i) => a + (i.total || 0), 0);
  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((a, i) => a + (i.total || 0), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((a, i) => a + (i.total || 0), 0);
  const totalVATCollected = invoices
    .filter((i) => i.status === "paid")
    .reduce((a, i) => a + (i.vat || 0), 0);
  const lowStockItems = products.filter((p) => p.stock <= (p.minStock || 5));

  const filteredInvoices =
    invFilter === "all"
      ? invoices
      : invoices.filter((i) => i.status === invFilter);

  // ── Sidebar nav items
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "pos", label: "Point of Sale", icon: ShoppingBag },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "vat", label: "VAT Report", icon: Receipt },
    { id: "settings", label: "Store Settings", icon: Settings },
  ];

  const handleNav = (id) => {
    if (id === "pos") {
      setShowPOS(true);
      return;
    }
    setActiveView(id);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Render views ──────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Stock alert:</strong>{" "}
            {lowStockItems.map((p) => p.name).join(", ")} need restocking.
          </span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total paid (month)",
            value: fmt(totalPaid),
            sub: "↑ 12% vs last month",
            subCls: "text-green-600",
          },
          {
            label: "Outstanding",
            value: fmt(totalPending),
            sub: `${invoices.filter((i) => i.status === "pending").length} pending invoices`,
            subCls: "text-yellow-600",
          },
          {
            label: "Overdue",
            value: fmt(totalOverdue),
            sub: `${invoices.filter((i) => i.status === "overdue").length} invoices`,
            subCls: "text-red-600",
          },
          {
            label: "Products",
            value: products.length,
            sub: `${lowStockItems.length} low / out of stock`,
            subCls: "text-gray-500",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="text-xs text-gray-500 font-medium mb-1">
              {m.label}
            </div>
            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            <div className={`text-xs mt-1 ${m.subCls}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-800 mb-4">
            Weekly sales
          </div>
          <SparkBars data={salesData} valueKey="sales" labelKey="day" />
        </div>

        {/* Invoice breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-800 mb-4">
            Invoice status
          </div>
          <div className="space-y-3">
            {[
              { status: "paid", label: "Paid", color: "#16a34a" },
              { status: "pending", label: "Pending", color: "#d97706" },
              { status: "overdue", label: "Overdue", color: "#dc2626" },
              { status: "draft", label: "Draft", color: "#9ca3af" },
            ].map(({ status, label, color }) => {
              const count = invoices.filter((i) => i.status === status).length;
              const pct = invoices.length
                ? Math.round((count / invoices.length) * 100)
                : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-sm text-gray-600 w-16">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: pct + "%", background: color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-sm font-semibold text-gray-800">
            Recent invoices
          </span>
          <button
            onClick={() => setActiveView("invoices")}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-3 px-5 font-medium">Invoice</th>
                <th className="text-left py-3 px-3 font-medium">Customer</th>
                <th className="text-left py-3 px-3 font-medium">Amount</th>
                <th className="text-left py-3 px-3 font-medium">Due</th>
                <th className="text-left py-3 px-3 font-medium">Status</th>
                <th className="text-left py-3 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-5 font-medium text-gray-800">
                    {inv.number || inv.id}
                  </td>
                  <td className="py-3 px-3 text-gray-600">{inv.customer}</td>
                  <td className="py-3 px-3 font-medium">{fmt(inv.total)}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs">{inv.due}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[inv.status] || ""}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewInv(inv)}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      {inv.status !== "paid" && (
                        <button
                          onClick={() => markPaid(inv)}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
                        >
                          Mark paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No invoices yet.{" "}
                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="text-blue-600 underline"
                    >
                      Create your first invoice
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {["all", "pending", "paid", "overdue", "draft"].map((f) => (
            <button
              key={f}
              onClick={() => setInvFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${invFilter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingInvoice(null);
            setShowInvoiceModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left py-3 px-5 font-medium">Invoice</th>
              <th className="text-left py-3 px-3 font-medium">Customer</th>
              <th className="text-right py-3 px-3 font-medium">Amount</th>
              <th className="text-right py-3 px-3 font-medium">VAT</th>
              <th className="text-left py-3 px-3 font-medium">Due</th>
              <th className="text-left py-3 px-3 font-medium">Status</th>
              <th className="text-left py-3 px-5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="py-3 px-5 font-medium">
                  {inv.number || inv.id}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-800">
                    {inv.customer}
                  </div>
                  <div className="text-xs text-gray-400">{inv.email}</div>
                </td>
                <td className="py-3 px-3 text-right font-medium">
                  {fmt(inv.total)}
                </td>
                <td className="py-3 px-3 text-right text-gray-400">
                  {fmt(inv.vat)}
                </td>
                <td className="py-3 px-3 text-xs text-gray-400">{inv.due}</td>
                <td className="py-3 px-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[inv.status] || ""}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setPreviewInv(inv)}
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingInvoice(inv);
                        setShowInvoiceModal(true);
                      }}
                      className="text-xs px-2 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button className="text-xs px-2 py-1 border rounded bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45z" />
                      </svg>
                      WhatsApp
                    </button>
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => markPaid(inv)}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Mark paid
                      </button>
                    )}
                    <button
                      onClick={() => deleteInvoice(inv)}
                      className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Low / out of stock: {lowStockItems.map((p) => p.name).join(", ")}
        </div>
      )}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: "",
                sku: `SKU-${Date.now()}`,
                category: "",
                price: "",
                cost: "",
                stock: "",
                minStock: "5",
                description: "",
                imageUrl: "",
              });
              setShowProductModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left py-3 px-5 font-medium">Product</th>
              <th className="text-left py-3 px-3 font-medium">SKU</th>
              <th className="text-left py-3 px-3 font-medium">Category</th>
              <th className="text-right py-3 px-3 font-medium">Price</th>
              <th className="text-right py-3 px-3 font-medium">Cost</th>
              <th className="text-right py-3 px-3 font-medium">Margin</th>
              <th className="text-left py-3 px-3 font-medium">Stock</th>
              <th className="text-left py-3 px-5 font-medium">Status</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const ss = STOCK_STATUS(p);
              const margin =
                p.cost > 0
                  ? Math.round(((p.price - p.cost) / p.price) * 100)
                  : 0;
              const stockPct = Math.min(
                100,
                Math.round(
                  (p.stock / Math.max((p.minStock || 5) * 3, 1)) * 100,
                ),
              );
              return (
                <tr
                  key={p.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-5 font-medium text-gray-800">
                    {p.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {p.sku}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-xs">
                    {p.category}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">
                    {fmt(p.price)}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-400">
                    {fmt(p.cost)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-medium ${margin > 40 ? "text-green-600" : margin > 20 ? "text-yellow-600" : "text-red-500"}`}
                    >
                      {margin}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-xs text-gray-700 mb-1">
                      {p.stock} units
                    </div>
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: stockPct + "%",
                          background:
                            p.stock === 0
                              ? "#dc2626"
                              : p.stock <= p.minStock
                                ? "#f59e0b"
                                : "#16a34a",
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ss.cls}`}
                    >
                      {ss.label}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm(p);
                          setShowProductModal(true);
                        }}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-xs px-2 py-1 border border-red-200 text-red-500 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b">
              <th className="text-left py-3 px-5 font-medium">Customer</th>
              <th className="text-left py-3 px-3 font-medium">Contact</th>
              <th className="text-right py-3 px-3 font-medium">Total spent</th>
              <th className="text-right py-3 px-3 font-medium">Invoices</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="py-3 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {c.name
                        ?.split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="font-medium text-gray-800">{c.name}</div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="text-xs text-gray-600">{c.email}</div>
                  <div className="text-xs text-gray-400">{c.phone}</div>
                </td>
                <td className="py-3 px-3 text-right font-medium">
                  {fmt(c.totalSpent || 0)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {c.invoiceCount || 0}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <button
                    onClick={() => {
                      setShowInvoiceModal(true);
                    }}
                    className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  No customers yet. They appear automatically when you create
                  invoices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const monthlyData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
      (m, i) => ({
        month: m,
        revenue: [38200, 42100, 35900, 51000, 47300, 53800][i],
      }),
    );
    const maxRev = Math.max(...monthlyData.map((d) => d.revenue));
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Revenue (YTD)",
              value: fmt(totalPaid),
              sub: "From paid invoices",
            },
            {
              label: "Avg invoice value",
              value: invoices.length
                ? fmt(
                    invoices.reduce((a, i) => a + (i.total || 0), 0) /
                      invoices.length,
                  )
                : "R 0.00",
              sub: "All invoices",
            },
            {
              label: "VAT collected",
              value: fmt(totalVATCollected),
              sub: "From paid invoices",
            },
            {
              label: "Products tracked",
              value: products.length,
              sub: `${lowStockItems.length} need restocking`,
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className="text-2xl font-bold text-gray-900">{m.value}</div>
              <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-800 mb-4">
              Monthly revenue trend
            </div>
            <div className="flex items-end gap-2" style={{ height: 100 }}>
              {monthlyData.map((d) => (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t bg-blue-200 hover:bg-blue-500 transition-colors cursor-default"
                    style={{ height: Math.round((d.revenue / maxRev) * 88) }}
                    title={fmt(d.revenue)}
                  />
                  <span className="text-[9px] text-gray-400">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="text-sm font-semibold text-gray-800 mb-4">
              Top products by price
            </div>
            <div className="space-y-2">
              {products
                .slice()
                .sort((a, b) => b.price - a.price)
                .slice(0, 5)
                .map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {p.name}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {fmt(p.price)}
                    </span>
                  </div>
                ))}
              {products.length === 0 && (
                <div className="text-xs text-gray-400">No products yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVAT = () => {
    const paidInvs = invoices.filter((i) => i.status === "paid");
    const excl = paidInvs.reduce(
      (a, i) => a + ((i.total || 0) - (i.vat || 0)),
      0,
    );
    return (
      <div className="space-y-5">
        <div className="text-sm text-gray-500">
          VAT No: {bizInfo.vatNo || "Not set"} · Current period
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total excl. VAT", value: fmt(excl) },
            {
              label: "VAT collected (15%)",
              value: fmt(totalVATCollected),
              cls: "text-blue-700",
            },
            { label: "Total incl. VAT", value: fmt(excl + totalVATCollected) },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className={`text-2xl font-bold ${m.cls || "text-gray-900"}`}>
                {m.value}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-3 px-5 font-medium">Invoice</th>
                <th className="text-left py-3 px-3 font-medium">Customer</th>
                <th className="text-right py-3 px-3 font-medium">Excl. VAT</th>
                <th className="text-right py-3 px-3 font-medium">VAT (15%)</th>
                <th className="text-right py-3 px-5 font-medium">Incl. VAT</th>
              </tr>
            </thead>
            <tbody>
              {paidInvs.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-5 font-medium">
                    {inv.number || inv.id}
                  </td>
                  <td className="py-3 px-3 text-gray-600">{inv.customer}</td>
                  <td className="py-3 px-3 text-right">
                    {fmt((inv.total || 0) - (inv.vat || 0))}
                  </td>
                  <td className="py-3 px-3 text-right text-blue-700 font-medium">
                    {fmt(inv.vat)}
                  </td>
                  <td className="py-3 px-5 text-right font-bold">
                    {fmt(inv.total)}
                  </td>
                </tr>
              ))}
              {paidInvs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    No paid invoices this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Download VAT201 CSV
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            <FileText className="w-4 h-4" />
            Export for eFiling
          </button>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="text-sm font-semibold text-gray-800">Store details</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["name", "Store name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["vatNo", "VAT number"],
          ].map(([k, l]) => (
            <div key={k}>
              <label className="block text-xs text-gray-500 mb-1">{l}</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={bizInfo[k] || ""}
                onChange={(e) =>
                  setBizInfo((b) => ({ ...b, [k]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Address (shown on invoices)
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={bizInfo.address || ""}
            onChange={(e) =>
              setBizInfo((b) => ({ ...b, address: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="text-sm font-semibold text-gray-800">
          Banking details
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["bank", "Bank"],
            ["accNo", "Account number"],
            ["branch", "Branch code"],
          ].map(([k, l]) => (
            <div key={k}>
              <label className="block text-xs text-gray-500 mb-1">{l}</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={bizInfo[k] || ""}
                onChange={(e) =>
                  setBizInfo((b) => ({ ...b, [k]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-800 mb-2">Logo</div>
        <div className="flex items-center gap-4">
          {bizInfo.logoUrl && (
            <img
              src={bizInfo.logoUrl}
              alt="Logo"
              className="w-16 h-16 object-contain rounded-lg border"
            />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              id="logo-upload"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file || !authUser) return;
                try {
                  const url = await uploadLogoToR2(file, authUser);
                  setBizInfo((b) => ({ ...b, logoUrl: url }));
                } catch {
                  alert("Logo upload failed");
                }
              }}
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              Upload logo
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45z" />
          </svg>
          WhatsApp Business
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Connect your WhatsApp Business number to send invoices directly from
          SolidFlo.
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
          Connect WhatsApp Business
        </button>
      </div>

      <button
        onClick={saveBizInfo}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        <Save className="w-4 h-4" />
        Save settings
      </button>
    </div>
  );

  // ─── View map ─────────────────────────────────────────────────────────────
  const views = {
    overview: renderOverview,
    invoices: renderInvoices,
    products: renderProducts,
    customers: renderCustomers,
    analytics: renderAnalytics,
    vat: renderVAT,
    settings: renderSettings,
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:block">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-56" : "w-0 overflow-hidden"} bg-white border-r border-gray-100 flex flex-col transition-all duration-200 flex-shrink-0 print:hidden`}
      >
        <div className="px-4 py-4 border-b flex items-center gap-2">
          <img src={logo} alt="SolidFlo" className="h-8 object-contain" />
        </div>
        <nav className="flex-1 py-2 px-2 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                activeView === id && id !== "pos"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 truncate">
                {user?.displayName || user?.email}
              </div>
              <div className="text-[10px] text-gray-400">Retail Plan</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-700 flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-gray-800 capitalize">
              {activeView}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingInvoice(null);
                setShowInvoiceModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {(views[activeView] || (() => null))()}
        </main>
      </div>

      {/* ── Modals ── */}
      {showInvoiceModal && (
        <InvoiceModal
          onClose={() => {
            setShowInvoiceModal(false);
            setEditingInvoice(null);
          }}
          onSave={handleSaveInvoice}
          bizInfo={bizInfo}
          existingInv={editingInvoice}
        />
      )}

      {previewInv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                Invoice Preview
              </span>
              <button onClick={() => setPreviewInv(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <InvoicePreview inv={previewInv} biz={bizInfo} />
            </div>
            <div className="px-5 py-4 border-t flex gap-2 justify-end">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45z" />
                </svg>
                WhatsApp
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {showPOS && (
        <POSModal
          products={products}
          onClose={() => setShowPOS(false)}
          onComplete={async (cart, total, method) => {
            await handlePOSComplete(cart, total, method);
            setShowPOS(false);
          }}
        />
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                {editingProduct ? "Edit Product" : "Add Product"}
              </span>
              <button onClick={() => setShowProductModal(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Product name *
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    SKU
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={productForm.sku}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, sku: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Category
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, category: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Selling price (R) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, price: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Cost price (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={productForm.cost}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, cost: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Stock quantity
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, stock: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Min stock (alert below)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={productForm.minStock}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        minStock: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Product image
                </label>
                <div className="flex items-center gap-4">
                  {productForm.imageUrl && (
                    <img
                      src={productForm.imageUrl}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="product-img"
                      className="hidden"
                      onChange={handleProductImageUpload}
                    />
                    <label
                      htmlFor="product-img"
                      className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      Upload image
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-2 justify-end">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                {editingProduct ? "Update" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
