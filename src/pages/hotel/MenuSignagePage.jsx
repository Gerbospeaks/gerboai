import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, doc, onSnapshot } from "firebase/firestore";
import { Utensils, Flame, ImageOff } from "lucide-react";

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
const ROTATE_MS = 4000;

/**
 * MenuSignagePage — public route: /display/:propertyId
 *
 * Mirrors GuestMenuPage's design: one static grid (no page-level sliding),
 * with each category cell independently rotating through its own items
 * every ROTATE_MS. All cells share one tick counter for simplicity, but
 * since each computes `tick % items.length` against its OWN item count,
 * a category with 1 item never visibly changes while a category with 3
 * cycles through all of them — reads as per-cell/independent rotation
 * even though it's one timer. Kept as a dark, TV-friendly layout with a
 * header clock since a TV has no one to swipe it.
 */
export default function MenuSignagePage() {
  const { propertyId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [now, setNow] = useState(new Date());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!propertyId) return;
    const db = getFirestore();
    const unsubMenu = onSnapshot(
      collection(db, "users", propertyId, "menuItems"),
      (snap) => setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    const unsubProperty = onSnapshot(
      doc(db, "users", propertyId, "settings", "propertyInfo"),
      (snap) => {
        if (snap.exists()) setPropertyInfo(snap.data());
      },
    );
    return () => {
      unsubMenu();
      unsubProperty();
    };
  }, [propertyId]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const currency = propertyInfo?.currencySymbol || "$";
  const available = menuItems.filter((m) => m.available);
  const categoriesWithItems = MENU_CATEGORIES.filter(
    (cat) => available.filter((m) => m.category === cat).length > 0,
  );

  return (
    <div className="h-screen w-full bg-[#161311] text-[#f5f1ea] flex flex-col overflow-hidden">
      <style>{`
        .slide-in { animation: slideIn 0.4s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2e2a24] flex-shrink-0">
        <div className="flex items-center gap-3">
          {propertyInfo?.logoUrl && (
            <img
              src={propertyInfo.logoUrl}
              alt=""
              className="w-9 h-9 object-contain rounded"
            />
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              {propertyInfo?.propertyName || "Menu"}
            </h1>
            <p className="text-[11px] text-[#a89f8e] mt-0.5">
              Today's offering
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums leading-none">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[11px] text-[#a89f8e] mt-0.5">
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {categoriesWithItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <Utensils className="w-10 h-10 text-[#5a5347]" />
          <p className="text-lg text-[#a89f8e]">
            Menu will appear here once items are marked available.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div
            className="grid gap-px bg-[#2e2a24]"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {categoriesWithItems.map((cat) => {
              const items = available.filter((m) => m.category === cat);
              const activeIdx = tick % items.length;
              const activeItem = items[activeIdx];

              return (
                <div
                  key={cat}
                  className="relative bg-[#161311] aspect-square overflow-hidden"
                >
                  {/* Full-bleed image, fills the whole cell */}
                  {activeItem && (
                    <div
                      key={activeItem.id}
                      className="slide-in absolute inset-0"
                    >
                      {activeItem.imageUrl ? (
                        <img
                          src={activeItem.imageUrl}
                          alt={activeItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#211d19]">
                          <ImageOff className="w-6 h-6 text-[#5a5347]" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gradient scrim so overlaid text stays legible over any image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

                  {/* Category label */}
                  <div className="absolute top-0 left-0 right-0 flex items-center gap-2 px-3 py-2.5">
                    <span className="w-1.5 h-4 bg-[#d97706] rounded-full" />
                    <h2 className="text-sm font-bold text-[#f5f1ea] uppercase tracking-[0.15em] truncate drop-shadow">
                      {cat}
                    </h2>
                  </div>

                  {activeItem?.popular && (
                    <span className="absolute top-2.5 right-2.5 bg-[#d97706] text-white rounded-full p-1">
                      <Flame className="w-3 h-3" />
                    </span>
                  )}

                  {/* Name, price, and rotation dots pinned to the bottom of the cell */}
                  {activeItem && (
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
                      <p className="text-xs font-semibold leading-snug line-clamp-2 text-[#f5f1ea] drop-shadow">
                        {activeItem.name}
                      </p>
                      <span className="inline-block mt-1.5 text-xs font-bold text-[#161311] bg-[#e8b978] px-2 py-0.5 rounded">
                        {currency}
                        {Number(activeItem.price).toFixed(2)}
                      </span>

                      {items.length > 1 && (
                        <div className="flex gap-1 mt-2 justify-center">
                          {items.map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 rounded-full transition-all ${i === activeIdx ? "w-4 bg-[#d97706]" : "w-1 bg-white/30"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
