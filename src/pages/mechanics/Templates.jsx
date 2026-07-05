import React, { useState, useEffect } from "react";
import {
  FileText,
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  Wrench,
  Car,
  Zap,
  Crown,
  Gauge,
  CreditCard,
  Lock,
  Loader2,
} from "lucide-react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { TEMPLATE_THUMBNAILS } from "./TemplateThumbnails";

// ─── Template definitions ────────────────────────────────────────────────────
const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Classic Workshop",
    description:
      "Traditional auto repair invoice with professional 3-column layout",
    price: 0,
    isPremium: false,
    category: "free",
    icon: Wrench,
    color: "gray",
    features: [
      "Professional 3-column layout",
      "Vehicle details section",
      "Parts and labor breakdown",
      "Print optimized for A4",
    ],
    preview:
      "Three neat columns showing customer info, billing details, and vehicle information with a clean items table.",
  },
  premium: {
    id: "premium",
    name: "Premium Auto Service",
    description: "Modern design with bold branding for high-end auto shops",
    price: 299,
    isPremium: true,
    category: "premium",
    icon: Crown,
    color: "purple",
    features: [
      "Luxury design aesthetic",
      "Large branding area",
      "Enhanced color scheme",
      "Premium paper compatible",
    ],
    preview:
      "Elegant bordered design with serif fonts and premium purple accents. Perfect for luxury vehicle specialists.",
  },
  speed: {
    id: "speed",
    name: "Speed Shop Pro",
    description: "Bold and dynamic design for performance workshops",
    price: 349,
    isPremium: true,
    category: "performance",
    icon: Zap,
    color: "red",
    features: [
      "High-energy red design",
      "Performance-focused layout",
      "Bold typography",
      "Racing-inspired styling",
    ],
    preview:
      "Dynamic red and black design with aggressive styling. Ideal for performance tuning and racing shops.",
  },
  modern: {
    id: "modern",
    name: "Modern Minimalist",
    description: "Clean, contemporary design with blue accents",
    price: 249,
    isPremium: true,
    category: "modern",
    icon: Car,
    color: "blue",
    features: [
      "Minimalist blue design",
      "Spacious layout",
      "Modern typography",
      "Clean and professional",
    ],
    preview:
      "Contemporary design with blue accents and generous white space. Perfect for modern auto service centers.",
  },
  diagnostic: {
    id: "diagnostic",
    name: "Diagnostic Specialist",
    description: "Technical layout perfect for detailed diagnostic work",
    price: 279,
    isPremium: true,
    category: "technical",
    icon: Gauge,
    color: "green",
    features: [
      "Technical green theme",
      "Detailed service breakdown",
      "Diagnostic codes section",
      "Inspection checklist ready",
    ],
    preview:
      "Technical design with green accents. Optimized for diagnostic centers and detailed inspection reports.",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TEMPLATE_DOC_PATH = (uid) => ["users", uid, "settings", "templates"];

const fetchPurchased = async (uid) => {
  try {
    const db = getFirestore();
    const snap = await getDoc(doc(db, ...TEMPLATE_DOC_PATH(uid)));
    if (snap.exists()) {
      const data = snap.data();
      return Array.from(new Set(["classic", ...(data.purchased ?? [])]));
    }
    await setDoc(
      doc(db, ...TEMPLATE_DOC_PATH(uid)),
      {
        purchased: ["classic"],
        active: "classic",
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    return ["classic"];
  } catch (err) {
    console.error("fetchPurchased:", err);
    return ["classic"];
  }
};

const persistPurchase = async (uid, templateId) => {
  const db = getFirestore();
  await setDoc(
    doc(db, ...TEMPLATE_DOC_PATH(uid)),
    {
      purchased: arrayUnion(templateId),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const Templates = ({ user }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["classic"]);
  const [loadingOwned, setLoadingOwned] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPreview, setShowPreview] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [successTemplateId, setSuccessTemplateId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    if (!user?.uid) return;
    setLoadingOwned(true);
    fetchPurchased(user.uid).then((ids) => {
      setPurchasedTemplates(ids);
      setLoadingOwned(false);
    });
  }, [user?.uid]);

  const handlePurchase = (templateId) => {
    const template = TEMPLATES[templateId];
    if (!template.isPremium) {
      handleFreePurchase(templateId);
      return;
    }
    setShowPayment(templateId);
  };

  const handleFreePurchase = async (templateId) => {
    try {
      if (user?.uid) await persistPurchase(user.uid, templateId);
      setPurchasedTemplates((prev) =>
        Array.from(new Set([...prev, templateId])),
      );
      setSuccessTemplateId(templateId);
      setTimeout(() => setSuccessTemplateId(null), 3000);
    } catch (err) {
      console.error("handleFreePurchase:", err);
      alert("❌ Could not add template. Please try again.");
    }
  };

  const handlePaymentSubmit = async () => {
    const templateId = showPayment;
    const template = TEMPLATES[templateId];

    if (paymentForm.cardNumber.replace(/\s/g, "").length !== 16) {
      alert("❌ Please enter a valid 16-digit card number");
      return;
    }
    if (!paymentForm.cardName.trim()) {
      alert("❌ Please enter the cardholder name");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
      alert("❌ Please enter expiry date in MM/YY format");
      return;
    }
    if (paymentForm.cvv.length !== 3) {
      alert("❌ Please enter a valid 3-digit CVV");
      return;
    }

    try {
      setPaymentLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (user?.uid) await persistPurchase(user.uid, templateId);
      setPurchasedTemplates((prev) =>
        Array.from(new Set([...prev, templateId])),
      );
      setPaymentForm({ cardNumber: "", cardName: "", expiryDate: "", cvv: "" });
      setShowPayment(null);
      setSuccessTemplateId(templateId);
      setTimeout(() => setSuccessTemplateId(null), 4000);
    } catch (err) {
      console.error("handlePaymentSubmit:", err);
      alert("❌ Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned;
    setPaymentForm((p) => ({ ...p, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    setPaymentForm((p) => ({ ...p, expiryDate: v }));
  };

  const handleCvvChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 3);
    setPaymentForm((p) => ({ ...p, cvv: v }));
  };

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "free", name: "Free" },
    { id: "premium", name: "Premium" },
    { id: "performance", name: "Performance" },
    { id: "modern", name: "Modern" },
    { id: "technical", name: "Technical" },
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter((t) =>
    selectedCategory === "all" ? true : t.category === selectedCategory,
  );

  const totalValue = Object.values(TEMPLATES)
    .filter((t) => purchasedTemplates.includes(t.id))
    .reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice Templates
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Professional invoice designs for auto repair shops and mechanics.
            Purchased templates are instantly available in your invoice creator.
          </p>
        </div>

        {successTemplateId && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl animate-bounce">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">
              {TEMPLATES[successTemplateId]?.name} added to your templates!
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            {loadingOwned ? (
              <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
            ) : (
              <div className="text-3xl font-bold text-blue-600">
                {purchasedTemplates.length}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-1">Templates Owned</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-gray-700">
              {Object.keys(TEMPLATES).length}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Available</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              R{totalValue}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Total Value Unlocked
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isPurchased = purchasedTemplates.includes(template.id);
            const Icon = template.icon;
            const Thumb = TEMPLATE_THUMBNAILS[template.id];

            return (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Live design preview (mirrors the real invoice template) */}
                <div className="relative h-56 overflow-hidden group border-b border-gray-100">
                  {Thumb && <Thumb />}

                  {template.isPremium && !isPurchased && (
                    <div className="absolute top-3 right-3 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Premium
                    </div>
                  )}
                  {isPurchased && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                      <Check className="w-3.5 h-3.5" />
                      Owned
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center gap-2 text-white">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-bold text-lg leading-tight">
                        {template.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4 min-h-[36px]">
                    {template.description}
                  </p>

                  <ul className="space-y-1.5 mb-4">
                    {template.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      {template.isPremium ? (
                        <>
                          <div className="text-2xl font-bold text-gray-900">
                            R{template.price}
                          </div>
                          <div className="text-xs text-gray-400">one-time</div>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-green-600">
                            Free
                          </div>
                          <div className="text-xs text-gray-400">included</div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPreview(template.id)}
                        className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 text-sm text-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      {isPurchased ? (
                        <div className="px-3 py-2 bg-green-50 text-green-700 rounded-lg font-semibold flex items-center gap-1.5 text-sm border border-green-200">
                          <Check className="w-4 h-4" />
                          Owned
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePurchase(template.id)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 text-sm transition-colors shadow-sm"
                        >
                          {template.isPremium ? (
                            <>
                              <ShoppingCart className="w-4 h-4" /> Buy Now
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" /> Get Free
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            How to use your templates
          </h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>
              Purchase a template below — it is saved to your account instantly.
            </li>
            <li>
              Go to <strong>Create Job Card</strong> from the sidebar.
            </li>
            <li>
              Click the <strong>Template</strong> dropdown at the top of the
              page.
            </li>
            <li>Select any template you own — your invoice updates live.</li>
          </ol>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPreview(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(TEMPLATES[showPreview].icon, {
                  className: "w-5 h-5 text-blue-600",
                })}
                <h2 className="text-lg font-bold text-gray-900">
                  {TEMPLATES[showPreview].name}
                </h2>
              </div>
              <button
                onClick={() => setShowPreview(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-6 bg-gray-50">
              <div
                className="w-full rounded-xl shadow-md overflow-hidden"
                style={{ aspectRatio: "4 / 5" }}
              >
                {(() => {
                  const PreviewThumb = TEMPLATE_THUMBNAILS[showPreview];
                  return PreviewThumb ? <PreviewThumb /> : null;
                })()}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {TEMPLATES[showPreview].features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg p-3">
                {TEMPLATES[showPreview].preview}
              </p>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPayment(null);
              setPaymentForm({
                cardNumber: "",
                cardName: "",
                expiryDate: "",
                cvv: "",
              });
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Complete Purchase
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowPayment(null);
                  setPaymentForm({
                    cardNumber: "",
                    cardName: "",
                    expiryDate: "",
                    cvv: "",
                  });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                {React.createElement(TEMPLATES[showPayment].icon, {
                  className: "w-8 h-8 text-blue-600 flex-shrink-0",
                })}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {TEMPLATES[showPayment].name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {TEMPLATES[showPayment].description}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold text-blue-600">
                    R{TEMPLATES[showPayment].price}
                  </p>
                  <p className="text-xs text-gray-400">once-off</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Card Number
                </label>
                <input
                  type="text"
                  value={paymentForm.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-base transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentForm.cardName}
                  onChange={(e) =>
                    setPaymentForm((p) => ({
                      ...p,
                      cardName: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="JOHN DOE"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none uppercase transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={paymentForm.expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-base transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={paymentForm.cvv}
                    onChange={handleCvvChange}
                    placeholder="•••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-base transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Encrypted & secure. One-time payment — lifetime access to this
                template.
              </div>

              <button
                onClick={handlePaymentSubmit}
                disabled={paymentLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-base"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" /> Pay R
                    {TEMPLATES[showPayment].price}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By completing this purchase you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
