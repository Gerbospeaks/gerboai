import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Check, 
  Eye,
  Sparkles,
  Zap,
  Lightbulb,
  Cpu,
  Activity,
  Shield
} from 'lucide-react';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';

// Template definitions - 5 Electrical Engineering Templates
const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Classic Industrial',
    description: 'Traditional electrical services invoice with professional 3-column layout',
    price: 0,
    isPremium: false,
    category: 'free',
    icon: Zap,
    color: 'gray',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=500&fit=crop',
    features: [
      'Professional 3-column layout',
      'Circuit details section',
      'Materials and labor breakdown',
      'Print optimized for A4'
    ],
    preview: 'Three neat columns showing customer info, billing details, and electrical specifications with a clean items table.'
  },
  premium: {
    id: 'premium',
    name: 'Premium Power Systems',
    description: 'Modern design with bold branding for high-end electrical contractors',
    price: 299,
    isPremium: true,
    category: 'premium',
    icon: Shield,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop',
    features: [
      'Luxury design aesthetic',
      'Large branding area',
      'Enhanced color scheme',
      'Premium paper compatible'
    ],
    preview: 'Elegant bordered design with modern fonts and premium purple accents. Perfect for high-end electrical installations.'
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Pro',
    description: 'Bold and dynamic design for industrial electrical services',
    price: 349,
    isPremium: true,
    category: 'industrial',
    icon: Activity,
    color: 'red',
    image: 'https://images.unsplash.com/photo-1581092918484-8313e1f7e8c8?w=400&h=500&fit=crop',
    features: [
      'High-energy red design',
      'Industrial-focused layout',
      'Bold typography',
      'Heavy-duty styling'
    ],
    preview: 'Dynamic red and black design with robust styling. Ideal for industrial electrical contractors and plant services.'
  },
  modern: {
    id: 'modern',
    name: 'Modern Smart Systems',
    description: 'Clean, contemporary design with blue tech accents',
    price: 249,
    isPremium: true,
    category: 'modern',
    icon: Cpu,
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=400&h=500&fit=crop',
    features: [
      'Minimalist blue design',
      'Spacious layout',
      'Modern typography',
      'Clean and professional'
    ],
    preview: 'Contemporary design with blue accents and generous white space. Perfect for smart home and automation specialists.'
  },
  residential: {
    id: 'residential',
    name: 'Residential Specialist',
    description: 'Friendly layout perfect for home electrical services',
    price: 279,
    isPremium: true,
    category: 'residential',
    icon: Lightbulb,
    color: 'green',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=500&fit=crop',
    features: [
      'Approachable green theme',
      'Detailed service breakdown',
      'Safety compliance section',
      'Inspection checklist ready'
    ],
    preview: 'Friendly design with green accents. Optimized for residential electricians and home service providers.'
  }
};

// Templates Component
const Templates = ({ user }) => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(['classic']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  useEffect(() => {
    loadPurchasedTemplates();
  }, [user]);

  const loadPurchasedTemplates = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const docRef = doc(db, 'users', user.uid, 'settings', 'templates');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPurchasedTemplates(docSnap.data().purchased || ['classic']);
      } else {
        await setDoc(docRef, {
          purchased: ['classic'],
          active: 'classic',
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (templateId) => {
    if (!user?.uid) return;

    const template = TEMPLATES[templateId];
    
    // For free templates, just add them directly
    if (!template.isPremium) {
      try {
        const db = getFirestore();
        const docRef = doc(db, 'users', user.uid, 'settings', 'templates');
        
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            purchased: arrayUnion(templateId),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(docRef, {
            purchased: ['classic', templateId],
            active: 'classic',
            updatedAt: serverTimestamp()
          });
        }

        setPurchasedTemplates(prev => [...prev, templateId]);
        alert('✅ Template added successfully!\n\nYou can now select it from the template dropdown when creating job cards.');
      } catch (error) {
        console.error('Error adding template:', error);
        alert('❌ Failed to add template. Please try again.');
      }
      return;
    }
    
    // For premium templates, show payment modal
    setShowPayment(templateId);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid || !showPayment) return;

    // Basic validation
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
      alert('Please fill in all card details');
      return;
    }

    // Validate card number (simple check)
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d+$/.test(cleanCardNumber)) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    // Validate expiry date
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert('Please enter expiry date in MM/YY format');
      return;
    }

    // Validate CVV
    if (cardDetails.cvv.length !== 3 || !/^\d+$/.test(cardDetails.cvv)) {
      alert('Please enter a valid 3-digit CVV');
      return;
    }

    setPaymentProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Process purchase
      const db = getFirestore();
      const docRef = doc(db, 'users', user.uid, 'settings', 'templates');
      
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          purchased: arrayUnion(showPayment),
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(docRef, {
          purchased: ['classic', showPayment],
          active: 'classic',
          updatedAt: serverTimestamp()
        });
      }

      // Record payment transaction (optional)
      const paymentRef = doc(db, 'users', user.uid, 'payments', Date.now().toString());
      await setDoc(paymentRef, {
        templateId: showPayment,
        templateName: TEMPLATES[showPayment].name,
        amount: TEMPLATES[showPayment].price,
        currency: 'ZAR',
        timestamp: serverTimestamp(),
        status: 'completed'
      });

      setPurchasedTemplates(prev => [...prev, showPayment]);
      
      // Reset form and close modal
      setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
      setShowPayment(null);
      
      alert('✅ Payment successful!\n\nYour template has been purchased and is now available.');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'free', name: 'Free' },
    { id: 'premium', name: 'Premium' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'modern', name: 'Modern' },
    { id: 'residential', name: 'Residential' }
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter(template => {
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  });

  const getColorClasses = (color) => {
    const colors = {
      gray: 'from-gray-500 to-gray-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600'
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-8 text-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Invoice Templates</h1>
        </div>
        <p className="text-blue-50 text-lg">
          Professional invoice designs crafted specifically for electrical engineers and contractors
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
          <div className="text-2xl font-bold text-blue-600">
            {purchasedTemplates.length}
          </div>
          <div className="text-sm text-gray-600">Templates Owned</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-cyan-600">
            {Object.keys(TEMPLATES).length}
          </div>
          <div className="text-sm text-gray-600">Total Available</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            R{Object.values(TEMPLATES)
              .filter(t => purchasedTemplates.includes(t.id))
              .reduce((sum, t) => sum + t.price, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-gray-50 text-gray-800 shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => {
          const isPurchased = purchasedTemplates.includes(template.id);
          const Icon = template.icon;
          
          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Template Preview Image with Gradient Overlay */}
              <div className="relative h-64 bg-gray-900 overflow-hidden group">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(template.color)} opacity-40`}></div>
                
                {/* Icon Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Icon className="w-24 h-24 text-gray-800 opacity-20" />
                </div>

                {/* Badges */}
                {template.isPremium && !isPurchased && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-gray-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
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
                <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{template.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">FEATURES</div>
                  <ul className="space-y-2">
                    {template.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preview Description */}
                <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs font-semibold text-gray-500 mb-1">PREVIEW</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{template.preview}</p>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    {template.isPremium ? (
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
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
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-gray-800 rounded-lg hover:from-blue-700 hover:to-cyan-600 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          How to use your templates
        </h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Purchase a template that matches your electrical business style</li>
          <li>Go to "Create Job Card" from the sidebar menu</li>
          <li>Look for the template selector dropdown at the top of the page</li>
          <li>Select your purchased template from the dropdown</li>
          <li>Your invoice will automatically use the selected design</li>
        </ol>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Perfect for Electrical Professionals
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Licensed electricians</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Industrial electrical contractors</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Residential electricians</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Commercial electrical services</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Smart home automation specialists</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Maintenance and repair services</span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                {React.createElement(TEMPLATES[showPreview].icon, { className: "w-6 h-6 text-blue-600" })}
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
                  {React.createElement(TEMPLATES[showPreview].icon, { className: "w-16 h-16 text-blue-600 mx-auto mb-4" })}
                  <h3 className="text-2xl font-bold mb-2">{TEMPLATES[showPreview].name}</h3>
                  <p className="text-gray-600 mb-4">{TEMPLATES[showPreview].description}</p>
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
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Design Preview:</strong> {TEMPLATES[showPreview].preview}
                  </p>
                </div>
                <div className="mt-4 flex justify-center">
                  {purchasedTemplates.includes(showPreview) ? (
                    <div className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2 border-2 border-green-200">
                      <Check className="w-5 h-5" />
                      <span>You Own This Template</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowPreview(null);
                        handlePurchase(showPreview);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-gray-800 rounded-lg hover:from-blue-700 hover:to-cyan-600 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {TEMPLATES[showPreview].isPremium ? (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Purchase for R{TEMPLATES[showPreview].price}
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Get Free Template
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-cyan-500 text-gray-800 rounded-t-xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Complete Purchase</h2>
                <button
                  onClick={() => {
                    setShowPayment(null);
                    setCardDetails({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
                  }}
                  className="text-gray-800 hover:text-gray-200 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                  disabled={paymentProcessing}
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 text-blue-50">
                {React.createElement(TEMPLATES[showPayment].icon, { className: "w-5 h-5" })}
                <span className="font-medium">{TEMPLATES[showPayment].name}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              {/* Amount */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                <div className="text-4xl font-bold text-blue-600">
                  R{TEMPLATES[showPayment].price}
                </div>
                <div className="text-xs text-gray-500 mt-1">One-time payment • Lifetime access</div>
              </div>

              {/* Card Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.cardName}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardName: e.target.value }))}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={paymentProcessing}
                  required
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (value.length <= 16 && /^\d*$/.test(value)) {
                      setCardDetails(prev => ({ ...prev, cardNumber: formatCardNumber(value) }));
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  disabled={paymentProcessing}
                  required
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCardDetails(prev => ({ ...prev, expiryDate: formatExpiryDate(value) }));
                      }
                    }}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    disabled={paymentProcessing}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 3) {
                        setCardDetails(prev => ({ ...prev, cvv: value }));
                      }
                    }}
                    placeholder="123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    disabled={paymentProcessing}
                    required
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We never store your complete card details.
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={paymentProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-gray-800 rounded-lg hover:from-blue-700 hover:to-cyan-600 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Pay R{TEMPLATES[showPayment].price}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                By completing this purchase, you agree to our terms and conditions
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;