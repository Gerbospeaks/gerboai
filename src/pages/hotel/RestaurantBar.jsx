import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Utensils,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  Coffee,
  Wine,
  ShoppingCart,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  ChevronDown,
  Receipt,
  Tag,
  LayoutGrid,
  List,
  Flame,
} from "lucide-react";

const ORDER_STATUS = {
  pending: {
    label: "Pending",
    bg: "bg-[#fef3c7]",
    text: "text-[#92400e]",
    dot: "bg-[#f59e0b]",
  },
  preparing: {
    label: "Preparing",
    bg: "bg-[#dbeafe]",
    text: "text-[#1e40af]",
    dot: "bg-[#3b82f6]",
  },
  ready: {
    label: "Ready",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    dot: "bg-[#22c55e]",
  },
  served: {
    label: "Served",
    bg: "bg-[#f1f5f9]",
    text: "text-[#475569]",
    dot: "bg-[#94a3b8]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[#fef2f2]",
    text: "text-[#991b1b]",
    dot: "bg-[#ef4444]",
  },
};

const MENU_CATEGORIES = [
  "Starters",
  "Mains",
  "Grills",
  "Seafood",
  "Vegetarian",
  "Desserts",
  "Beverages",
  "Cocktails",
  "Wine",
  "Beer",
  "Soft Drinks",
  "Specials",
];

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "menu", label: "Menu", icon: Utensils },
  { key: "tables", label: "Tables", icon: Users },
];

const EMPTY_MENU_ITEM = {
  name: "",
  category: "Mains",
  price: "",
  description: "",
  available: true,
  popular: false,
  dietary: [],
};

const EMPTY_ORDER = {
  tableNumber: "",
  guestName: "",
  guestRoom: "",
  items: [],
  notes: "",
  status: "pending",
  orderType: "Dine-in",
};

const EMPTY_TABLE = {
  tableNumber: "",
  capacity: "4",
  status: "available",
  section: "Main",
  notes: "",
};

const TABLE_STATUS = {
  available: {
    label: "Available",
    dot: "bg-[#22c55e]",
    bg: "bg-[#f0fdf4]",
    border: "border-[#bbf7d0]",
    text: "text-[#166534]",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-[#3b82f6]",
    bg: "bg-[#eff6ff]",
    border: "border-[#bfdbfe]",
    text: "text-[#1e40af]",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-[#ec4899]",
    bg: "bg-[#fdf2f8]",
    border: "border-[#fbcfe8]",
    text: "text-[#9d174d]",
  },
  cleaning: {
    label: "Cleaning",
    dot: "bg-[#a855f7]",
    bg: "bg-[#faf5ff]",
    border: "border-[#e9d5ff]",
    text: "text-[#6b21a8]",
  },
};

export default function RestaurantBar({ user }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [menuForm, setMenuForm] = useState(EMPTY_MENU_ITEM);
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER);
  const [tableForm, setTableForm] = useState(EMPTY_TABLE);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  // Order builder: selected menu item to add
  const [orderItemQty, setOrderItemQty] = useState({});

  const db = getFirestore();

  useEffect(() => {
    if (user?.uid) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mSnap, oSnap, tSnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "users", user.uid, "menuItems"),
            orderBy("category", "asc"),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "orders"),
            orderBy("createdAt", "desc"),
          ),
        ),
        getDocs(
          query(
            collection(db, "users", user.uid, "tables"),
            orderBy("tableNumber", "asc"),
          ),
        ),
      ]);
      setMenuItems(mSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setOrders(oSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTables(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Menu CRUD ──────────────────────────────────────────────────────────────
  const openNewMenu = () => {
    setMenuForm(EMPTY_MENU_ITEM);
    setEditingId(null);
    setShowMenuModal(true);
  };
  const openEditMenu = (item) => {
    setMenuForm({ ...EMPTY_MENU_ITEM, ...item });
    setEditingId(item.id);
    setShowMenuModal(true);
  };
  const saveMenu = async () => {
    if (!menuForm.name || !menuForm.price) return;
    setSaving(true);
    try {
      const p = { ...menuForm, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "menuItems", editingId), p);
      } else {
        await addDoc(collection(db, "users", user.uid, "menuItems"), {
          ...p,
          createdAt: serverTimestamp(),
        });
      }
      setShowMenuModal(false);
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  const toggleAvailable = async (item) => {
    await updateDoc(doc(db, "users", user.uid, "menuItems", item.id), {
      available: !item.available,
    });
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, available: !m.available } : m,
      ),
    );
  };

  // ── Order CRUD ─────────────────────────────────────────────────────────────
  const openNewOrder = () => {
    setOrderForm({ ...EMPTY_ORDER, items: [] });
    setOrderItemQty({});
    setEditingId(null);
    setShowOrderModal(true);
  };
  const addItemToOrder = (menuItem) => {
    const qty = Number(orderItemQty[menuItem.id] || 1);
    setOrderForm((f) => {
      const existing = f.items.findIndex((i) => i.menuItemId === menuItem.id);
      if (existing >= 0) {
        const items = [...f.items];
        items[existing] = {
          ...items[existing],
          qty: items[existing].qty + qty,
          amount: (items[existing].qty + qty) * Number(menuItem.price),
        };
        return { ...f, items };
      }
      return {
        ...f,
        items: [
          ...f.items,
          {
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: Number(menuItem.price),
            qty,
            amount: qty * Number(menuItem.price),
          },
        ],
      };
    });
  };
  const removeOrderItem = (idx) =>
    setOrderForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const orderTotal = orderForm.items.reduce((s, i) => s + (i.amount || 0), 0);
  const saveOrder = async () => {
    if (!orderForm.tableNumber && !orderForm.guestName) return;
    setSaving(true);
    try {
      const p = {
        ...orderForm,
        total: orderTotal,
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "orders", editingId), p);
      } else {
        await addDoc(collection(db, "users", user.uid, "orders"), {
          ...p,
          createdAt: serverTimestamp(),
        });
      }
      setShowOrderModal(false);
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  const quickOrderStatus = async (order, status) => {
    await updateDoc(doc(db, "users", user.uid, "orders", order.id), {
      status,
      updatedAt: serverTimestamp(),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
    );
  };

  // ── Table CRUD ─────────────────────────────────────────────────────────────
  const openNewTable = () => {
    setTableForm(EMPTY_TABLE);
    setEditingId(null);
    setShowTableModal(true);
  };
  const openEditTable = (t) => {
    setTableForm({ ...EMPTY_TABLE, ...t });
    setEditingId(t.id);
    setShowTableModal(true);
  };
  const saveTable = async () => {
    if (!tableForm.tableNumber) return;
    setSaving(true);
    try {
      const p = { ...tableForm, updatedAt: serverTimestamp() };
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "tables", editingId), p);
      } else {
        await addDoc(collection(db, "users", user.uid, "tables"), {
          ...p,
          createdAt: serverTimestamp(),
        });
      }
      setShowTableModal(false);
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };
  const quickTableStatus = async (t, status) => {
    await updateDoc(doc(db, "users", user.uid, "tables", t.id), {
      status,
      updatedAt: serverTimestamp(),
    });
    setTables((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, status } : x)),
    );
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async ({ collection: col, id }) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, col, id));
      setDeleteConfirm(null);
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const filteredMenu = menuItems.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "all" || m.category === categoryFilter),
  );
  const filteredOrders = orders.filter(
    (o) =>
      (o.tableNumber?.toString().includes(search) ||
        o.guestName?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" || o.status === statusFilter),
  );

  const stats = {
    activeOrders: orders.filter((o) =>
      ["pending", "preparing"].includes(o.status),
    ).length,
    readyOrders: orders.filter((o) => o.status === "ready").length,
    todayRevenue: orders
      .filter((o) => {
        if (!o.createdAt?.toDate) return false;
        return (
          o.createdAt.toDate().toDateString() === new Date().toDateString() &&
          o.status === "served"
        );
      })
      .reduce((s, o) => s + (o.total || 0), 0),
    tablesFree: tables.filter((t) => t.status === "available").length,
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg bg-white text-[#1e293b] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-[#d97706] transition-colors";
  const labelCls =
    "block text-xs font-semibold text-[#374151] uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#d97706]" /> Restaurant & Bar
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            Menu, orders and table management
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "menu" && (
            <button
              onClick={openNewMenu}
              className="flex items-center gap-2 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          )}
          {activeTab === "orders" && (
            <button
              onClick={openNewOrder}
              className="flex items-center gap-2 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>
          )}
          {activeTab === "tables" && (
            <button
              onClick={openNewTable}
              className="flex items-center gap-2 px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Table
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Active Orders",
            value: stats.activeOrders,
            icon: Flame,
            color: "text-[#d97706]",
            bg: "bg-[#fef3c7]",
          },
          {
            label: "Ready to Serve",
            value: stats.readyOrders,
            icon: CheckCircle,
            color: "text-[#059669]",
            bg: "bg-[#dcfce7]",
          },
          {
            label: "Tables Free",
            value: stats.tablesFree,
            icon: Users,
            color: "text-[#1d4ed8]",
            bg: "bg-[#dbeafe]",
          },
          {
            label: "Today Revenue",
            value: `R${stats.todayRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-[#7c3aed]",
            bg: "bg-[#f3e8ff]",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">
                {label}
              </span>
              <div
                className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f1f5f9] p-1 rounded-xl w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? "bg-white text-[#d97706] shadow-sm" : "text-[#64748b] hover:text-[#374151]"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "menu" ? "Search menu items..." : "Search orders..."
            }
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#d97706] transition-colors"
          />
        </div>
        {activeTab === "menu" && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${categoryFilter === "all" ? "bg-[#d97706] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
            >
              All
            </button>
            {MENU_CATEGORIES.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${categoryFilter === c ? "bg-[#d97706] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {activeTab === "orders" && (
          <div className="flex gap-2">
            {["all", ...Object.keys(ORDER_STATUS)].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${statusFilter === s ? "bg-[#d97706] text-white" : "bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]"}`}
              >
                {s === "all" ? "All" : ORDER_STATUS[s]?.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── ORDERS TAB ── */}
          {activeTab === "orders" &&
            (filteredOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                label="No orders yet"
                onAdd={openNewOrder}
                addLabel="Create first order"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const s = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="px-4 py-3 border-b border-[#f1f5f9] flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1e293b]">
                              {order.tableNumber
                                ? `Table ${order.tableNumber}`
                                : order.guestName}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${s.bg} ${s.text}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                              />
                              {s.label}
                            </span>
                          </div>
                          {order.guestRoom && (
                            <p className="text-xs text-[#94a3b8]">
                              Room {order.guestRoom}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setDeleteConfirm({
                                collection: "orders",
                                id: order.id,
                              });
                            }}
                            className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="px-4 py-3 space-y-1">
                        {(order.items || []).map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-[#374151]">
                              {item.qty}× {item.name}
                            </span>
                            <span className="text-[#64748b] font-medium">
                              R{item.amount?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {order.notes && (
                          <p className="text-xs text-[#94a3b8] italic mt-1">
                            {order.notes}
                          </p>
                        )}
                      </div>
                      <div className="px-4 py-3 border-t border-[#f1f5f9] flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1e293b]">
                          R{(order.total || 0).toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          {Object.entries(ORDER_STATUS)
                            .filter(([k]) => k !== order.status)
                            .slice(0, 2)
                            .map(([key, cfg]) => (
                              <button
                                key={key}
                                onClick={() => quickOrderStatus(order, key)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${cfg.bg} ${cfg.text} hover:opacity-80 transition-opacity`}
                              >
                                {cfg.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* ── MENU TAB ── */}
          {activeTab === "menu" &&
            (filteredMenu.length === 0 ? (
              <EmptyState
                icon={Utensils}
                label="No menu items"
                onAdd={openNewMenu}
                addLabel="Add first item"
              />
            ) : (
              <div>
                {MENU_CATEGORIES.filter(
                  (cat) => categoryFilter === "all" || cat === categoryFilter,
                ).map((cat) => {
                  const catItems = filteredMenu.filter(
                    (m) => m.category === cat,
                  );
                  if (!catItems.length) return null;
                  return (
                    <div key={cat} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest">
                          {cat}
                        </h3>
                        <div className="flex-1 h-px bg-[#e2e8f0]" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            className={`bg-white border rounded-xl p-4 shadow-sm transition-all group ${item.available ? "border-[#e2e8f0]" : "border-[#f1f5f9] opacity-60"}`}
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-sm font-bold text-[#1e293b] truncate">
                                  {item.name}
                                </span>
                                {item.popular && (
                                  <Flame className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-sm font-bold text-[#d97706] ml-2 flex-shrink-0">
                                R{Number(item.price).toFixed(2)}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-[#64748b] mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => toggleAvailable(item)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${item.available ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#94a3b8]"}`}
                              >
                                {item.available ? "Available" : "Unavailable"}
                              </button>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEditMenu(item)}
                                  className="p-1 text-[#64748b] hover:text-[#d97706] transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      collection: "menuItems",
                                      id: item.id,
                                    })
                                  }
                                  className="p-1 text-[#64748b] hover:text-[#ef4444] transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

          {/* ── TABLES TAB ── */}
          {activeTab === "tables" &&
            (tables.length === 0 ? (
              <EmptyState
                icon={Users}
                label="No tables added"
                onAdd={openNewTable}
                addLabel="Add first table"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {tables.map((table) => {
                  const ts =
                    TABLE_STATUS[table.status] || TABLE_STATUS.available;
                  return (
                    <div
                      key={table.id}
                      className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all group ${ts.bg} ${ts.border}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xl font-bold text-[#0f172a]">
                          {table.tableNumber}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditTable(table)}
                            className="p-1 text-[#64748b] hover:text-[#1d4ed8] transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                collection: "tables",
                                id: table.id,
                              })
                            }
                            className="p-1 text-[#64748b] hover:text-[#ef4444] transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#64748b] mb-2">
                        <Users className="w-3 h-3" /> {table.capacity} seats
                      </div>
                      {table.section && (
                        <p className="text-[10px] text-[#94a3b8] mb-2">
                          {table.section}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(TABLE_STATUS).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => quickTableStatus(table, key)}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-opacity ${table.status === key ? `${cfg.bg} ${cfg.text}` : "bg-white/60 text-[#94a3b8] hover:opacity-100 opacity-60"}`}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-[#e2e8f0]">
            <div className="w-12 h-12 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[#ef4444]" />
            </div>
            <h3 className="text-base font-bold text-[#1e293b] text-center mb-1">
              Delete this item?
            </h3>
            <p className="text-sm text-[#64748b] text-center mb-6">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-[#f8fafc] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-[#ef4444] text-white text-sm font-semibold rounded-xl hover:bg-[#dc2626] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu item modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <ModalHeader
              title={editingId ? "Edit Menu Item" : "Add Menu Item"}
              onClose={() => setShowMenuModal(false)}
            />
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Item Name *</label>
                  <input
                    className={inputCls}
                    value={menuForm.name}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, name: e.target.value })
                    }
                    placeholder="e.g. Grilled Chicken"
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <select
                    className={inputCls}
                    value={menuForm.category}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, category: e.target.value })
                    }
                  >
                    {MENU_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Price (R) *</label>
                  <input
                    className={inputCls}
                    type="number"
                    value={menuForm.price}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={2}
                    value={menuForm.description}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, description: e.target.value })
                    }
                    placeholder="Brief description..."
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuForm.available}
                      onChange={(e) =>
                        setMenuForm({
                          ...menuForm,
                          available: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#d97706]"
                    />
                    <span className="text-sm text-[#374151]">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuForm.popular}
                      onChange={(e) =>
                        setMenuForm({ ...menuForm, popular: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#d97706]"
                    />
                    <span className="text-sm text-[#374151] flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-[#d97706]" /> Popular
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowMenuModal(false)}
              onSave={saveMenu}
              saving={saving}
              disabled={!menuForm.name || !menuForm.price}
              saveLabel={editingId ? "Update" : "Add to Menu"}
              accentColor="bg-[#d97706] hover:bg-[#b45309]"
            />
          </div>
        </div>
      )}

      {/* Order modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <ModalHeader
              title="New Order"
              onClose={() => setShowOrderModal(false)}
            />
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Table #</label>
                  <input
                    className={inputCls}
                    value={orderForm.tableNumber}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        tableNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className={labelCls}>Guest Name</label>
                  <input
                    className={inputCls}
                    value={orderForm.guestName}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, guestName: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className={labelCls}>Room #</label>
                  <input
                    className={inputCls}
                    value={orderForm.guestRoom}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, guestRoom: e.target.value })
                    }
                    placeholder="Charge to room"
                  />
                </div>
                <div>
                  <label className={labelCls}>Order Type</label>
                  <select
                    className={inputCls}
                    value={orderForm.orderType}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, orderType: e.target.value })
                    }
                  >
                    {["Dine-in", "Room Service", "Takeaway", "Bar"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    className={inputCls}
                    value={orderForm.status}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, status: e.target.value })
                    }
                  >
                    {Object.entries(ORDER_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Menu item picker */}
              <div>
                <div className="text-xs font-bold text-[#d97706] uppercase tracking-widest mb-3 pb-2 border-b border-[#e2e8f0]">
                  Add Items from Menu
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {menuItems
                    .filter((m) => m.available)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#1e293b] truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-[#d97706]">
                            R{Number(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={orderItemQty[item.id] || 1}
                            onChange={(e) =>
                              setOrderItemQty((q) => ({
                                ...q,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="w-10 text-center text-xs border border-[#e2e8f0] rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-[#d97706]"
                          />
                          <button
                            onClick={() => addItemToOrder(item)}
                            className="w-7 h-7 bg-[#d97706] text-white rounded-lg flex items-center justify-center hover:bg-[#b45309] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Order items */}
              {orderForm.items.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-2">
                    Order Summary
                  </div>
                  <div className="space-y-1.5">
                    {orderForm.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-xl"
                      >
                        <span className="text-sm font-medium text-[#1e293b]">
                          {item.qty}× {item.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#d97706]">
                            R{item.amount?.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeOrderItem(i)}
                            className="p-1 text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between px-2.5 pt-2 border-t border-[#e2e8f0]">
                      <span className="text-sm font-bold text-[#1e293b]">
                        Total
                      </span>
                      <span className="text-sm font-bold text-[#d97706]">
                        R{orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={orderForm.notes}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, notes: e.target.value })
                  }
                  placeholder="Dietary requirements, allergies..."
                />
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowOrderModal(false)}
              onSave={saveOrder}
              saving={saving}
              disabled={!orderForm.tableNumber && !orderForm.guestName}
              saveLabel="Place Order"
              accentColor="bg-[#d97706] hover:bg-[#b45309]"
            />
          </div>
        </div>
      )}

      {/* Table modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col border border-[#e2e8f0]">
            <ModalHeader
              title={editingId ? "Edit Table" : "Add Table"}
              onClose={() => setShowTableModal(false)}
            />
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className={labelCls}>Table Number *</label>
                <input
                  className={inputCls}
                  value={tableForm.tableNumber}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, tableNumber: e.target.value })
                  }
                  placeholder="e.g. 1"
                />
              </div>
              <div>
                <label className={labelCls}>Capacity (seats)</label>
                <input
                  className={inputCls}
                  type="number"
                  min="1"
                  value={tableForm.capacity}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, capacity: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Section</label>
                <select
                  className={inputCls}
                  value={tableForm.section}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, section: e.target.value })
                  }
                >
                  {["Main", "Terrace", "Bar", "Private", "VIP", "Poolside"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  className={inputCls}
                  value={tableForm.status}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, status: e.target.value })
                  }
                >
                  {Object.entries(TABLE_STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <input
                  className={inputCls}
                  value={tableForm.notes}
                  onChange={(e) =>
                    setTableForm({ ...tableForm, notes: e.target.value })
                  }
                  placeholder="e.g. Window seat"
                />
              </div>
            </div>
            <ModalFooter
              onCancel={() => setShowTableModal(false)}
              onSave={saveTable}
              saving={saving}
              disabled={!tableForm.tableNumber}
              saveLabel={editingId ? "Update" : "Add Table"}
              accentColor="bg-[#d97706] hover:bg-[#b45309]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function EmptyState({ icon: Icon, label, onAdd, addLabel }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
      <Icon className="w-10 h-10 text-[#cbd5e1]" />
      <p className="text-sm text-[#94a3b8]">{label}</p>
      <button
        onClick={onAdd}
        className="text-sm text-[#d97706] font-medium hover:underline"
      >
        {addLabel}
      </button>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
      <h2 className="text-sm font-bold text-[#1e293b]">{title}</h2>
      <button
        onClick={onClose}
        className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onSave,
  saving,
  disabled,
  saveLabel,
  accentColor,
}) {
  return (
    <div className="flex gap-3 px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl">
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#374151] text-sm font-medium rounded-xl hover:bg-white transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className={`flex-1 px-4 py-2.5 ${accentColor} disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors`}
      >
        {saving ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}
