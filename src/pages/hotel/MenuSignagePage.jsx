import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, doc, onSnapshot } from "firebase/firestore";
import { Utensils, Flame } from "lucide-react";

// Keep in sync with RestaurantBar.jsx's MENU_CATEGORIES.
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

/**
 * MenuSignagePage
 * Public, unauthenticated route: /display/:propertyId
 * Meant to be left open full-screen on a TV/monitor at the lodge —
 * not touched, not logged in, just live ambient display.
 *
 * Uses the SAME public Firestore rule as GuestMenuPage:
 *   users/{propertyId}/menuItems        -> allow read: if true;
 *   users/{propertyId}/settings/propertyInfo -> allow read: if true;
 * No additional rule changes needed if that's already in place.
 */
export default function MenuSignagePage() {
  const { propertyId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [now, setNow] = useState(new Date());

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

  // Clock, mostly to reassure anyone glancing at the screen that it's live.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const currency = propertyInfo?.currencySymbol || "$";
  const available = menuItems.filter((m) => m.available);
  const categoriesWithItems = MENU_CATEGORIES.filter(
    (cat) => available.filter((m) => m.category === cat).length > 0,
  );

  return (
    <div className="min-h-screen bg-[#161311] text-[#f5f1ea] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-7 border-b border-[#2e2a24] flex-shrink-0">
        <div className="flex items-center gap-4">
          {propertyInfo?.logoUrl && (
            <img
              src={propertyInfo.logoUrl}
              alt=""
              className="w-12 h-12 object-contain rounded"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {propertyInfo?.propertyName || "Menu"}
            </h1>
            <p className="text-sm text-[#a89f8e] mt-0.5">Today's offering</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs text-[#a89f8e] mt-0.5">
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Menu grid */}
      <div className="flex-1 px-10 py-8 overflow-hidden">
        {categoriesWithItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <Utensils className="w-10 h-10 text-[#5a5347]" />
            <p className="text-lg text-[#a89f8e]">
              Menu will appear here once items are marked available.
            </p>
          </div>
        ) : (
          <div
            className="h-full grid gap-x-12 gap-y-8"
            style={{
              gridTemplateColumns: `repeat(${Math.min(categoriesWithItems.length, 3)}, minmax(0, 1fr))`,
            }}
          >
            {categoriesWithItems.map((cat) => {
              const items = available.filter((m) => m.category === cat);
              return (
                <div key={cat} className="min-w-0">
                  <h2 className="text-sm font-bold text-[#d97706] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[#3a352c]">
                    {cat}
                  </h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-semibold leading-snug">
                              {item.name}
                            </p>
                            {item.popular && (
                              <Flame className="w-4 h-4 text-[#d97706] flex-shrink-0" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-[#a89f8e] mt-1 leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="text-base font-bold text-[#e8b978] flex-shrink-0 whitespace-nowrap">
                          {currency}
                          {Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
