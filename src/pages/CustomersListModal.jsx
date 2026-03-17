import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Edit,
  Upload,
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Hash,
  SortAsc,
  SortDesc,
  ChevronRight,
} from "lucide-react";

/* ─── Zoho design tokens ─────────────────────────────────────────────────── */
const Z = {
  red: "#e8442a",
  redHover: "#c73b24",
  redLight: "#fdf2f0",
  navy: "#1a2340",
  navyMid: "#2d3a55",
  blue: "#1b6ec2",
  blueLight: "#e8f0fb",
  green: "#1d8348",
  greenLight: "#eafaf1",
  border: "#d9dde6",
  borderFocus: "#1b6ec2",
  bg: "#f4f5f8",
  white: "#ffffff",
  text: "#1a2340",
  textMid: "#4a5568",
  textMuted: "#8a93a6",
  row: "#ffffff",
  rowHover: "#f7f9fc",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;500;600;700&display=swap');

  .zcm-root * { font-family: 'Lato', sans-serif; box-sizing: border-box; }

  .zcm-overlay {
    position: fixed; inset: 0;
    background: rgba(20,26,48,0.55);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: zcm-fade .18s ease;
  }
  .zcm-dialog {
    background: ${Z.white};
    border-radius: 6px;
    box-shadow: 0 8px 40px rgba(20,26,48,.22);
    width: 100%; max-width: 860px;
    max-height: 92vh;
    display: flex; flex-direction: column;
    animation: zcm-up .2s ease;
    overflow: hidden;
  }

  /* Header */
  .zcm-header {
    background: ${Z.navy};
    padding: 14px 20px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .zcm-header-left { display: flex; align-items: center; gap: 10px; }
  .zcm-header-icon {
    width: 32px; height: 32px; border-radius: 50%;
    background: ${Z.red}; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .zcm-title { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: .01em; }
  .zcm-subtitle { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 1px; }
  .zcm-close {
    background: transparent; border: none; cursor: pointer;
    color: rgba(255,255,255,.6); padding: 4px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: color .15s, background .15s;
  }
  .zcm-close:hover { color: #fff; background: rgba(255,255,255,.12); }

  /* Toolbar */
  .zcm-toolbar {
    padding: 12px 20px;
    background: ${Z.white};
    border-bottom: 1px solid ${Z.border};
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0; flex-wrap: wrap;
  }
  .zcm-search-wrap {
    position: relative; flex: 1; min-width: 180px;
  }
  .zcm-search-icon {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: ${Z.textMuted}; pointer-events: none;
  }
  .zcm-search {
    width: 100%; height: 34px;
    padding: 0 10px 0 34px;
    border: 1px solid ${Z.border};
    border-radius: 4px;
    font-size: 13px; color: ${Z.text};
    background: ${Z.bg};
    outline: none; transition: border .15s, box-shadow .15s;
  }
  .zcm-search:focus {
    border-color: ${Z.borderFocus};
    box-shadow: 0 0 0 3px rgba(27,110,194,.15);
    background: ${Z.white};
  }
  .zcm-search::placeholder { color: ${Z.textMuted}; }
  .zcm-select {
    height: 34px; padding: 0 10px;
    border: 1px solid ${Z.border}; border-radius: 4px;
    font-size: 13px; font-weight: 600; color: ${Z.textMid};
    background: ${Z.white}; cursor: pointer; outline: none;
    transition: border .15s;
  }
  .zcm-select:focus { border-color: ${Z.borderFocus}; }
  .zcm-sort-btn {
    height: 34px; width: 34px;
    border: 1px solid ${Z.border}; border-radius: 4px;
    background: ${Z.white}; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: ${Z.textMid}; transition: border .15s, background .15s;
  }
  .zcm-sort-btn:hover { border-color: ${Z.blue}; background: ${Z.blueLight}; color: ${Z.blue}; }
  .zcm-add-btn {
    height: 34px; padding: 0 14px;
    background: ${Z.red}; color: #fff;
    border: none; border-radius: 4px; cursor: pointer;
    font-size: 13px; font-weight: 700; letter-spacing: .01em;
    display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
    transition: background .15s;
  }
  .zcm-add-btn:hover { background: ${Z.redHover}; }

  /* Body */
  .zcm-body {
    overflow-y: auto; flex: 1;
    background: ${Z.bg};
  }

  /* Table */
  .zcm-table { width: 100%; border-collapse: collapse; }
  .zcm-thead { position: sticky; top: 0; z-index: 2; }
  .zcm-thead th {
    background: #eef0f5;
    border-bottom: 2px solid ${Z.border};
    padding: 9px 16px;
    text-align: left;
    font-size: 11px; font-weight: 700;
    color: ${Z.textMid};
    text-transform: uppercase; letter-spacing: .06em;
    white-space: nowrap;
  }
  .zcm-thead th:last-child { text-align: right; }

  .zcm-row {
    background: ${Z.white};
    border-bottom: 1px solid ${Z.border};
    transition: background .12s;
    animation: zcm-row-in .2s ease both;
  }
  .zcm-row:hover { background: ${Z.rowHover}; }
  .zcm-row td { padding: 11px 16px; vertical-align: middle; }

  /* Avatar */
  .zcm-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, ${Z.navy} 0%, ${Z.navyMid} 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
    border: 2px solid ${Z.border};
  }
  .zcm-name-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .zcm-name { font-size: 13px; font-weight: 700; color: ${Z.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .zcm-id {
    font-size: 11px; color: ${Z.blue}; font-family: monospace;
    display: flex; align-items: center; gap: 3px; margin-top: 2px;
  }
  .zcm-contact-line {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px; color: ${Z.textMid}; margin-bottom: 3px;
  }
  .zcm-contact-line:last-child { margin-bottom: 0; }

  /* Action buttons */
  .zcm-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
  .zcm-btn-load {
    height: 28px; padding: 0 12px;
    background: ${Z.blueLight}; color: ${Z.blue};
    border: 1px solid #b8d0ee; border-radius: 3px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 4px;
    transition: background .15s, border-color .15s;
    white-space: nowrap;
  }
  .zcm-btn-load:hover { background: ${Z.blue}; color: #fff; border-color: ${Z.blue}; }
  .zcm-btn-edit {
    height: 28px; padding: 0 12px;
    background: #fff; color: ${Z.textMid};
    border: 1px solid ${Z.border}; border-radius: 3px;
    font-size: 12px; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; gap: 4px;
    transition: background .15s, border-color .15s, color .15s;
    white-space: nowrap;
  }
  .zcm-btn-edit:hover { background: ${Z.redLight}; color: ${Z.red}; border-color: #f0b8b0; }

  /* Empty state */
  .zcm-empty {
    text-align: center; padding: 64px 24px;
  }
  .zcm-empty-icon {
    width: 64px; height: 64px; margin: 0 auto 16px;
    background: #eef0f5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }
  .zcm-empty-title { font-size: 15px; font-weight: 700; color: ${Z.text}; margin-bottom: 6px; }
  .zcm-empty-sub { font-size: 13px; color: ${Z.textMuted}; }

  /* Footer */
  .zcm-footer {
    padding: 10px 20px;
    border-top: 1px solid ${Z.border};
    background: ${Z.white};
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0; gap: 12px; flex-wrap: wrap;
  }
  .zcm-footer-stat { font-size: 12px; color: ${Z.textMuted}; }
  .zcm-footer-stat strong { color: ${Z.text}; font-weight: 700; }
  .zcm-breadcrumb {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; color: ${Z.textMuted};
  }
  .zcm-close-footer {
    height: 32px; padding: 0 16px;
    background: ${Z.white}; color: ${Z.textMid};
    border: 1px solid ${Z.border}; border-radius: 3px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: border-color .15s, color .15s;
  }
  .zcm-close-footer:hover { border-color: ${Z.red}; color: ${Z.red}; }

  /* Animations */
  @keyframes zcm-fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes zcm-up { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes zcm-row-in { from { opacity: 0; transform: translateX(-4px) } to { opacity: 1; transform: translateX(0) } }

  /* Scrollbar */
  .zcm-body::-webkit-scrollbar { width: 6px; }
  .zcm-body::-webkit-scrollbar-track { background: transparent; }
  .zcm-body::-webkit-scrollbar-thumb { background: ${Z.border}; border-radius: 6px; }
  .zcm-body::-webkit-scrollbar-thumb:hover { background: #b0b8c8; }
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/* ─── Component ──────────────────────────────────────────────────────────── */
const CustomersListModal = ({
  showModal,
  setShowModal,
  customers,
  onLoadCustomer,
  onEditCustomer,
  onAddNewCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  /* Filter + sort */
  useEffect(() => {
    let result = customers.filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q) ||
        c.customerId?.toLowerCase().includes(q)
      );
    });
    result.sort((a, b) => {
      let cmp =
        sortBy === "date"
          ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          : (a.name || "").localeCompare(b.name || "");
      return sortOrder === "asc" ? cmp : -cmp;
    });
    setFilteredCustomers(result);
  }, [searchTerm, customers, sortBy, sortOrder]);

  /* Escape key */
  useEffect(() => {
    const h = (e) => e.key === "Escape" && showModal && setShowModal(false);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showModal, setShowModal]);

  if (!showModal) return null;

  return (
    <div className="zcm-root">
      <style>{globalStyles}</style>

      {/* Overlay */}
      <div className="zcm-overlay" onClick={() => setShowModal(false)}>
        <div className="zcm-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="zcm-header">
            <div className="zcm-header-left">
              <div className="zcm-header-icon">
                <Users size={16} color="#fff" />
              </div>
              <div>
                <div className="zcm-title">Customers</div>
                <div className="zcm-subtitle">
                  CRM &rsaquo; Contacts &rsaquo; All Customers
                </div>
              </div>
            </div>
            <button className="zcm-close" onClick={() => setShowModal(false)}>
              <X size={18} />
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div className="zcm-toolbar">
            {/* Search */}
            <div className="zcm-search-wrap">
              <Search size={14} className="zcm-search-icon" />
              <input
                className="zcm-search"
                type="text"
                placeholder="Search customers…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sort controls */}
            <select
              className="zcm-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="date">Date Added</option>
            </select>

            <button
              className="zcm-sort-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
            >
              {sortOrder === "asc" ? <SortAsc size={15} /> : <SortDesc size={15} />}
            </button>

            {/* Add button */}
            <button
              className="zcm-add-btn"
              onClick={() => { setShowModal(false); onAddNewCustomer(); }}
            >
              <UserPlus size={14} />
              New Customer
            </button>
          </div>

          {/* ── Body ── */}
          <div className="zcm-body">
            {filteredCustomers.length === 0 ? (
              <div className="zcm-empty">
                <div className="zcm-empty-icon">
                  <Users size={28} color={Z.textMuted} />
                </div>
                <div className="zcm-empty-title">
                  {searchTerm ? "No matching customers" : "No customers yet"}
                </div>
                <div className="zcm-empty-sub">
                  {searchTerm
                    ? "Try a different search term"
                    : "Click {New Customer} to get started"}
                </div>
              </div>
            ) : (
              <table className="zcm-table">
                <thead className="zcm-thead">
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer, i) => (
                    <tr
                      key={customer.id}
                      className="zcm-row"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      {/* Name + ID */}
                      <td style={{ minWidth: 180 }}>
                        <div className="zcm-name-cell">
                          <div className="zcm-avatar">
                            {initials(customer.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="zcm-name">{customer.name}</div>
                            {customer.customerId && (
                              <div className="zcm-id">
                                <Hash size={10} />
                                {customer.customerId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        {customer.phone ? (
                          <div className="zcm-contact-line">
                            <Phone size={12} color={Z.textMuted} />
                            <span style={{ fontSize: 12 }}>{customer.phone}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: Z.textMuted }}>—</span>
                        )}
                      </td>

                      {/* Email */}
                      <td>
                        {customer.email ? (
                          <div className="zcm-contact-line">
                            <Mail size={12} color={Z.textMuted} />
                            <span style={{ fontSize: 12 }}>{customer.email}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: Z.textMuted }}>—</span>
                        )}
                      </td>

                      {/* Address */}
                      <td style={{ maxWidth: 200 }}>
                        {customer.address ? (
                          <div className="zcm-contact-line">
                            <MapPin size={12} color={Z.textMuted} style={{ flexShrink: 0 }} />
                            <span
                              style={{
                                fontSize: 12,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {customer.address}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: Z.textMuted }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="zcm-actions">
                          <button
                            className="zcm-btn-load"
                            onClick={() => { onLoadCustomer(customer); setShowModal(false); }}
                          >
                            <Upload size={11} /> Load
                          </button>
                          <button
                            className="zcm-btn-edit"
                            onClick={() => { onEditCustomer(customer); setShowModal(false); }}
                          >
                            <Edit size={11} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="zcm-footer">
            <div className="zcm-breadcrumb">
              <ChevronRight size={12} />
              <span className="zcm-footer-stat">
                Showing <strong>{filteredCustomers.length}</strong> of{" "}
                <strong>{customers.length}</strong> customers
                {searchTerm && " · filtered"}
              </span>
            </div>
            <button className="zcm-close-footer" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomersListModal;
