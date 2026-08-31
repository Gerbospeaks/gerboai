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

/**
 * MenuSignagePage — public, unauthenticated route: /display/:propertyId
 * Meant to be left open full-screen on a TV/monitor at the lodge.
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

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const currency = propertyInfo?.currencySymbol || "$";
  const available = menuItems.filter((m) => m.available);
  const categoriesWithItems = MENU_CATEGORIES.filter(
    (cat) => available.filter((m) => m.category === cat).length > 0,
  );
  const columnCount = Math.min(Math.max(categoriesWithItems.length, 1), 3);

  return (
    <div className="min-h-screen bg-[#161311] text-[#f5f1ea] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-10 py-6 border-b border-[#2e2a24] flex-shrink-0">
        <div className="flex items-center gap-4">
          {propertyInfo?.logoUrl && (
            <img
              src={propertyInfo.logoUrl}
              alt=""
              className="w-11 h-11 object-contain rounded"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {propertyInfo?.propertyName || "Menu"}
            </h1>
            <p className="text-xs text-[#a89f8e] mt-0.5">Today's offering</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold tabular-nums">
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

      <div className="flex-1 px-10 py-7 overflow-hidden">
        {categoriesWithItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <Utensils className="w-10 h-10 text-[#5a5347]" />
            <p className="text-lg text-[#a89f8e]">
              Menu will appear here once items are marked available.
            </p>
          </div>
        ) : (
          <div
            className="h-full grid gap-x-10"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {categoriesWithItems.map((cat) => {
              const items = available.filter((m) => m.category === cat);
              return (
                <div key={cat} className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#3a352c]">
                    <span className="w-1.5 h-4 bg-[#d97706] rounded-full" />
                    <h2 className="text-sm font-bold text-[#d97706] uppercase tracking-[0.2em]">
                      {cat}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 overflow-hidden">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#211d19] border border-[#3a352c] rounded-lg overflow-hidden"
                      >
                        <div className="aspect-[4/3] bg-[#2a251f] relative">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="w-5 h-5 text-[#5a5347]" />
                            </div>
                          )}
                          {item.popular && (
                            <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#d97706] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                              <Flame className="w-2.5 h-2.5" /> Popular
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold leading-snug truncate">
                            {item.name}
                          </p>
                          <span className="inline-block mt-1 text-xs font-bold text-[#161311] bg-[#e8b978] px-1.5 py-0.5 rounded">
                            {currency}
                            {Number(item.price).toFixed(2)}
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
    </div>
  );
}
