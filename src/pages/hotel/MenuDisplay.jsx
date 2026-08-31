import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Utensils, Flame, Eye, EyeOff, ImageOff } from "lucide-react";

const MENU_CATEGORIES = [
  "Starters", "Mains", "Grills", "Seafood", "Vegetarian",
  "Desserts", "Beverages", "Cocktails", "Wine", "Beer", "Soft Drinks", "Specials",
];

export default function MenuDisplay({ user, currencySymbol = "$" }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const db = getFirestore();
    const unsub = onSnapshot(
      query(collection(db, "users", user.uid, "menuItems"), orderBy("category", "asc")),
      (snap) => {
        setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => { console.error(err); setLoading(false); },
    );
    return () => unsub();
  }, [user]);

  const visible = showUnavailable ? menuItems : menuItems.filter((m) => m.available);
  const categoriesWithItems = MENU_CATEGORIES.filter(
    (cat) => visible.filter((m) => m.category === cat).length > 0,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#d97706]" /> Menu
          </h1>
          <p className="text-sm text-[#64748b] mt-0.5">
            {visible.length} item{visible.length !== 1 ? "s" : ""} shown
          </p>
        </div>
        <button
          onClick={() => setShowUnavailable((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] text-xs font-semibold text-[#64748b] rounded-xl hover:bg-[#f8fafc] transition-colors"
        >
          {showUnavailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showUnavailable ? "Hide unavailable" : "Show unavailable"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categoriesWithItems.length === 0 ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl flex flex-col items-center justify-center py-16 gap-3">
          <Utensils className="w-10 h-10 text-[#cbd5e1]" />
          <p className="text-sm text-[#94a3b8]">
            {showUnavailable ? "No menu items yet." : "Nothing marked available yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categoriesWithItems.map((cat) => {
            const items = visible.filter((m) => m.category === cat);
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-5 bg-[#d97706] rounded-full" />
                  <h2 className="text-sm font-bold text-[#1e293b] uppercase tracking-wide">{cat}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm ${!item.available ? "opacity-50" : ""}`}
                    >
                      <div className="aspect-square bg-[#f1f5f9] relative">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-6 h-6 text-[#cbd5e1]" />
                          </div>
                        )}
                        {item.popular && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#d97706] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Flame className="w-3 h-3" /> Popular
                          </span>
                        )}
                        {!item.available && (
                          <span className="absolute top-2 right-2 bg-white/90 text-[#94a3b8] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-[#1e293b] leading-snug">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <span className="inline-block mt-2 text-sm font-bold text-white bg-[#1e293b] px-2.5 py-1 rounded-lg">
                          {currencySymbol}{Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}