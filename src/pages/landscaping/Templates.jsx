import React, { useState, useEffect } from "react";
import {
  FileText,
  ShoppingCart,
  Check,
  Eye,
  Sparkles,
  Trees,
  Flower2,
  Leaf,
  Sprout,
  Mountain,
} from "lucide-react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

// Template definitions - 5 Landscaping-Specific Templates
const TEMPLATES = {
  classic: {
    id: "classic",
    name: "Classic Gardens",
    description:
      "Traditional landscaping invoice with professional 3-column layout",
    price: 0,
    isPremium: false,
    category: "free",
    icon: Trees,
    color: "gray",
    image:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=500&fit=crop",
    features: [
      "Professional 3-column layout",
      "Project details section",
      "Materials and labor breakdown",
      "Print optimized for A4",
    ],
    preview:
      "Three neat columns showing customer info, billing details, and project specifications with a clean itemized table.",
  },
  premium: {
    id: "premium",
    name: "Premium Estate Landscapes",
    description:
      "Elegant design with sophisticated branding for luxury landscaping",
    price: 299,
    isPremium: true,
    category: "premium",
    icon: Mountain,
    color: "purple",
    image:
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=500&fit=crop",
    features: [
      "Luxury design aesthetic",
      "Large branding area",
      "Enhanced color scheme",
      "Premium paper compatible",
    ],
    preview:
      "Elegant bordered design with sophisticated fonts and premium accents. Perfect for high-end estate landscaping and luxury garden design.",
  },
  creative: {
    id: "creative",
    name: "Creative Garden Design",
    description: "Bold and artistic design for creative landscaping services",
    price: 349,
    isPremium: true,
    category: "creative",
    icon: Flower2,
    color: "red",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=500&fit=crop",
    features: [
      "Vibrant design aesthetic",
      "Creative layout styling",
      "Bold typography",
      "Artistic garden focus",
    ],
    preview:
      "Dynamic and colorful design with artistic styling. Ideal for creative landscaping designers and ornamental garden specialists.",
  },
  modern: {
    id: "modern",
    name: "Modern Outdoor Spaces",
    description: "Clean, contemporary design with natural green accents",
    price: 249,
    isPremium: true,
    category: "modern",
    icon: Leaf,
    color: "blue",
    image:
      "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=400&h=500&fit=crop",
    features: [
      "Modern minimalist design",
      "Spacious layout",
      "Contemporary typography",
      "Clean and eco-friendly",
    ],
    preview:
      "Contemporary design with natural accents and generous white space. Perfect for modern landscaping and sustainable garden design.",
  },
  maintenance: {
    id: "maintenance",
    name: "Lawn & Maintenance Pro",
    description: "Organized layout perfect for recurring lawn care services",
    price: 279,
    isPremium: true,
    category: "maintenance",
    icon: Sprout,
    color: "green",
    image:
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400&h=500&fit=crop",
    features: [
      "Fresh green theme",
      "Service schedule section",
      "Maintenance tracking",
      "Recurring service ready",
    ],
    preview:
      "Friendly design with fresh green accents. Optimized for lawn care services, garden maintenance, and regular landscaping work.",
  },
};

// Templates Component
const Templates = ({ user }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(["classic"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showPreview, setShowPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchasedTemplates();
  }, [user]);

  const loadPurchasedTemplates = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, "users", user.uid, "settings", "templates");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPurchasedTemplates(docSnap.data().purchased || ["classic"]);
      } else {
        await setDoc(docRef, {
          purchased: ["classic"],
          active: "classic",
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (templateId) => {
    if (!user?.uid) return;

    const template = TEMPLATES[templateId];

    if (
      window.confirm(
        `Purchase ${template.name} for R${template.price}?\n\nThis is a one-time purchase and will be available forever.`,
      )
    ) {
      try {
        const db = getFirestore();
        const docRef = doc(db, "users", user.uid, "settings", "templates");

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          await updateDoc(docRef, {
            purchased: arrayUnion(templateId),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(docRef, {
            purchased: ["classic", templateId],
            active: "classic",
            updatedAt: serverTimestamp(),
          });
        }

        setPurchasedTemplates((prev) => [...prev, templateId]);
        alert(
          "✅ Template purchased successfully!\n\nYou can now select it from the template dropdown when creating invoices.",
        );
      } catch (error) {
        console.error("Error purchasing template:", error);
        alert("❌ Failed to purchase template. Please try again.");
      }
    }
  };

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "free", name: "Free" },
    { id: "premium", name: "Premium" },
    { id: "creative", name: "Creative" },
    { id: "modern", name: "Modern" },
    { id: "maintenance", name: "Maintenance" },
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter((template) => {
    if (selectedCategory === "all") return true;
    return template.category === selectedCategory;
  });

  const getColorClasses = (color) => {
    const colors = {
      gray: "from-gray-500 to-gray-600",
      purple: "from-purple-500 to-purple-600",
      red: "from-red-500 to-red-600",
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg p-8 text-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Trees className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Invoice Templates</h1>
        </div>
        <p className="text-green-50 text-lg">
          Professional invoice designs crafted specifically for landscaping
          companies and garden design professionals
        </p>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>One-time purchase</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Lifetime access</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>Print ready</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {purchasedTemplates.length}
          </div>
          <div className="text-sm text-gray-600">Templates Owned</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-emerald-600">
            {Object.keys(TEMPLATES).length}
          </div>
          <div className="text-sm text-gray-600">Total Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            R
            {Object.values(TEMPLATES)
              .filter((t) => purchasedTemplates.includes(t.id))
              .reduce((sum, t) => sum + t.price, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? "bg-green-600 text-gray-800 shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isPurchased = purchasedTemplates.includes(template.id);
          const Icon = template.icon;

          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Template Preview Image with Gradient Overlay */}
              <div className="relative h-64 bg-gray-900 overflow-hidden group">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(template.color)} opacity-40`}
                ></div>

                {/* Icon Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Icon className="w-24 h-24 text-gray-800 opacity-20" />
                </div>

                {/* Badges */}
                {template.isPremium && !isPurchased && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-500 text-gray-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Premium
                  </div>
                )}
                {isPurchased && (
                  <div className="absolute top-4 left-4 bg-green-600 text-gray-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Check className="w-5 h-5" />
                    Owned
                  </div>
                )}

                {/* Template Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Icon className="w-6 h-6" />
                    <h3 className="text-xl font-bold">{template.name}</h3>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">
                  {template.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    FEATURES
                  </div>
                  <ul className="space-y-2">
                    {template.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preview Description */}
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    PREVIEW
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {template.preview}
                  </p>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    {template.isPremium ? (
                      <div>
                        <div className="text-3xl font-bold text-green-600">
                          R{template.price}
                        </div>
                        <div className="text-xs text-gray-500">one-time</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-green-600">
                          Free
                        </div>
                        <div className="text-xs text-gray-500">included</div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(template.id)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-800 hover:border-gray-400 flex items-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    {isPurchased ? (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2 border-2 border-green-200">
                        <Check className="w-5 h-5" />
                        <span>Owned</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePurchase(template.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-gray-800 rounded-lg hover:from-green-700 hover:to-emerald-600 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        {template.isPremium ? (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Buy Now
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Get Free
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

      {/* Help Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          How to use your templates
        </h3>
        <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
          <li>
            Purchase a template that matches your landscaping business style
          </li>
          <li>Go to "Create Job Card" from the sidebar menu</li>
          <li>
            Look for the template selector dropdown at the top of the page
          </li>
          <li>Select your purchased template from the dropdown</li>
          <li>Your invoice will automatically use the selected design</li>
        </ol>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                {React.createElement(TEMPLATES[showPreview].icon, {
                  className: "w-6 h-6 text-green-600",
                })}
                <h2 className="text-2xl font-bold text-gray-900">
                  {TEMPLATES[showPreview].name}
                </h2>
              </div>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-8 bg-gray-800">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  {React.createElement(TEMPLATES[showPreview].icon, {
                    className: "w-16 h-16 text-green-600 mx-auto mb-4",
                  })}
                  <h3 className="text-2xl font-bold mb-2">
                    {TEMPLATES[showPreview].name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {TEMPLATES[showPreview].description}
                  </p>
                  <img
                    src={TEMPLATES[showPreview].image}
                    alt={TEMPLATES[showPreview].name}
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">Template Features:</h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {TEMPLATES[showPreview].features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Note:</strong> {TEMPLATES[showPreview].preview}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
