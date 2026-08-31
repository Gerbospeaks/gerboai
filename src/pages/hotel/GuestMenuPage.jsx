import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, doc, onSnapshot } from "firebase/firestore";
import { Utensils, Flame, Loader2 } from "lucide-react";

// Keep this order in sync with RestaurantBar.jsx's MENU_CATEGORIES so
// sections appear in a sensible sequence rather than alphabetical.
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
 * GuestMenuPage
 * Public, unauthenticated route: /menu/:propertyId
 * propertyId is the lodge's Firebase uid. Shows only items with
 * available === true, live, via onSnapshot. No edit affordances —
 * this is what a guest sees after scanning a table QR code.
 *
 * Requires a Firestore rule allowing public read on:
 *   users/{propertyId}/menuItems
 *   users/{propertyId}/settings/propertyInfo
 * See the accompanying rules snippet — nothing else should be public.
 */
export default function GuestMenuPage() {
  const { propertyId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [propertyInfo, setPropertyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const currency = propertyInfo?.currencySymbol || "$";
  const available = menuItems.filter((m) => m.available);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#d97706] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center gap-2 px-6 text-center">
        <Utensils className="w-8 h-8 text-[#cbd5e1]" />
        <p className="text-sm text-[#64748b]">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Header */}
      <div className="bg-[#1e293b] text-white px-5 pt-8 pb-6 text-center">
        {propertyInfo?.logoUrl && (
          <img
            src={propertyInfo.logoUrl}
            alt=""
            className="w-12 h-12 object-contain mx-auto mb-3 rounded"
          />
        )}
        <h1 className="text-lg font-bold tracking-tight">
          {propertyInfo?.propertyName || "Today's Menu"}
        </h1>
        <p className="text-xs text-[#94a3b8] mt-1">
          Restaurant &amp; Bar · updated live
        </p>
      </div>

      {/* Menu */}
      <div className="max-w-md mx-auto px-4 py-6 pb-16">
        {available.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Utensils className="w-8 h-8 text-[#cbd5e1]" />
            <p className="text-sm text-[#94a3b8]">
              Nothing is marked available right now — check with your server.
            </p>
          </div>
        ) : (
          MENU_CATEGORIES.map((cat) => {
            const items = available.filter((m) => m.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-7">
                <h2 className="text-xs font-bold text-[#92400e] uppercase tracking-widest mb-3 pb-2 border-b border-[#e7ddc9]">
                  {cat}
                </h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-[#1e293b]">
                            {item.name}
                          </p>
                          {item.popular && (
                            <Flame className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0" />
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-[#78716c] mt-0.5 leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#92400e] flex-shrink-0 whitespace-nowrap">
                        {currency}
                        {Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
