import React, { useState } from "react";
import {
  X, Search, User, Plus, Edit2, Phone,
  Mail, ChevronRight, Users, Star,
} from "lucide-react";

export default function GuestsListModal({
  showModal, setShowModal,
  guests = [],
  onLoadGuest,
  onEditGuest,
  onAddNewGuest,
}) {
  const [search, setSearch] = useState("");

  if (!showModal) return null;

  const filtered = guests.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.guestId?.toLowerCase().includes(search.toLowerCase()) ||
    g.email?.toLowerCase().includes(search.toLowerCase()) ||
    g.phone?.includes(search) ||
    g.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-[#e2e8f0]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#dbeafe] rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1e293b]">Guests</h2>
              <p className="text-xs text-[#64748b]">{guests.length} registered guests</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onAddNewGuest?.(); setShowModal(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Guest
            </button>
            <button onClick={() => setShowModal(false)} className="p-1.5 text-[#64748b] hover:text-[#1e293b] hover:bg-[#e2e8f0] rounded-lg transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-[#e2e8f0]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, email, nationality..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#e2e8f0] rounded-xl bg-white text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <User className="w-10 h-10 text-[#cbd5e1]" />
              <p className="text-sm text-[#94a3b8]">
                {search ? "No guests match your search" : "No guests yet"}
              </p>
              <button
                onClick={() => { onAddNewGuest?.(); setShowModal(false); }}
                className="text-sm text-[#1d4ed8] font-medium hover:underline"
              >
                Register the first guest
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {filtered.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-[#f8fafc] transition-colors group"
                >
                  {/* Avatar + info */}
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => { onLoadGuest?.(guest); setShowModal(false); }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 bg-[#dbeafe] rounded-full flex items-center justify-center ring-1 ring-[#bfdbfe]">
                        <span className="text-xs font-bold text-[#1d4ed8]">
                          {guest.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                      </div>
                      {guest.vip && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#fef3c7] rounded-full flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 text-[#d97706]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1e293b] truncate">{guest.name}</p>
                        {guest.guestId && <span className="text-xs text-[#94a3b8] flex-shrink-0">{guest.guestId}</span>}
                        {guest.vip && <span className="text-[10px] font-bold text-[#d97706] bg-[#fef3c7] px-1.5 py-0.5 rounded-full">VIP</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {guest.phone && (
                          <span className="text-xs text-[#64748b] flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {guest.phone}
                          </span>
                        )}
                        {guest.email && (
                          <span className="text-xs text-[#64748b] flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" /> {guest.email}
                          </span>
                        )}
                        {guest.nationality && (
                          <span className="text-xs text-[#94a3b8]">{guest.nationality}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditGuest?.(guest); setShowModal(false); }}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1d4ed8] hover:bg-[#dbeafe] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Edit guest"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { onLoadGuest?.(guest); setShowModal(false); }}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1d4ed8] hover:bg-[#dbeafe] rounded-lg transition-all"
                      title="Load into invoice"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl flex items-center justify-between">
            <p className="text-xs text-[#94a3b8]">
              Showing {filtered.length} of {guests.length} guests
            </p>
            <p className="text-xs text-[#94a3b8]">
              {guests.filter((g) => g.vip).length} VIP guests
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
