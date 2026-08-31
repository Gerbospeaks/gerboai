import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, doc, onSnapshot } from "firebase/firestore";
import { Utensils, Flame, Loader2, ImageOff } from "lucide-react";

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
 * GuestMenuPage — public route: /menu/:propertyId
 *
 * One static grid, 3 columns, as many rows as there are categories with
 * items — no page-level sliding. Instead, each category cell independently
 * rotates through its own items every ROTATE_MS if it has more than one.
 * All cells share one tick counter for simplicity, but since each computes
 * `tick % items.length` against its OWN item count, a category with 1 item
 * never visibly changes while a category with 3 cycles through all of them —
 * so the rotation reads as per-cell/independent even though it's one timer.
 */
export default function GuestMenuPage() {
  const { propertyId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!propertyId) return;
    const db = getFirestore();
    const unsubMenu = onSnapshot(
      collection(db, "users", propertyId, "menuItems"),
      (snap) => {
        setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("This menu isn't available right now.");
        setLoading(false);
      },
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
    const t = setInterval(() => setTick((v) => v + 1), ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  const currency = propertyInfo?.currencySymbol || "$";
  const available = menuItems.filter((m) => m.available);
  const categoriesWithItems = MENU_CATEGORIES.filter(
    (cat) => available.filter((m) => m.category === cat).length > 0,
  );

  const breakoutStyle = {
    width: "100vw",
    position: "relative",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
  };

  if (loading) {
    return (
      <div
        style={breakoutStyle}
        className="min-h-screen bg-[#faf8f4] flex items-center justify-center"
      >
        <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={breakoutStyle}
        className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center gap-2 px-6 text-center"
      >
        <Utensils className="w-8 h-8 text-[#cbd5e1]" />
        <p className="text-sm text-[#64748b]">{error}</p>
      </div>
    );
  }

  return (
    <div style={breakoutStyle} className="min-h-screen bg-[#faf8f4]">
      <style>{`
        .slide-in { animation: slideIn 0.4s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

     

      {categoriesWithItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
          <Utensils className="w-8 h-8 text-[#cbd5e1]" />
          <p className="text-sm text-[#94a3b8]">
            Nothing is marked available right now — check with your server.
          </p>
        </div>
      ) : (
        <div
          className="grid gap-px bg-[#ece4d3]"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {categoriesWithItems.map((cat) => {
            const items = available.filter((m) => m.category === cat);
            const activeIdx = tick % items.length;
            const activeItem = items[activeIdx];

            return (
              <div key={cat} className="bg-white p-2 flex flex-col">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="w-1 h-3 bg-[#d97706] rounded-full flex-shrink-0" />
                  <h2 className="text-[9px] font-bold text-[#92400e] uppercase tracking-wide truncate">
                    {cat}
                  </h2>
                </div>

                {activeItem && (
                  <div
                    key={activeItem.id}
                    className="slide-in flex-1 flex flex-col"
                  >
                    <div className="aspect-square bg-[#f1ede2] rounded-lg overflow-hidden relative mb-1.5">
                      {activeItem.imageUrl ? (
                        <img
                          src={activeItem.imageUrl}
                          alt={activeItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-[#d6cdb8]" />
                        </div>
                      )}
                      {activeItem.popular && (
                        <span className="absolute top-1 left-1 bg-[#d97706] text-white rounded-full p-0.5">
                          <Flame className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-semibold text-[#1e293b] leading-tight line-clamp-2">
                      {activeItem.name}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-white bg-[#92400e] px-1.5 py-0.5 rounded self-start">
                      {currency}
                      {Number(activeItem.price).toFixed(2)}
                    </span>

                    {items.length > 1 && (
                      <div className="flex gap-0.5 mt-1.5 justify-center">
                        {items.map((_, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${i === activeIdx ? "bg-[#92400e]" : "bg-[#e2d8c4]"}`}
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
      )}
    </div>
  );
}
