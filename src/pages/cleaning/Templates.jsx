import React, { useState } from 'react';
import { 
  FileText, 
  ShoppingCart, 
  Check, 
  Eye,
  Sparkles,
  Home,
  Building2,
  Leaf,
  Crown,
  Droplets,
  CreditCard,
  Lock
} from 'lucide-react';

// Template definitions - 5 Cleaning Industry Specific Templates
const TEMPLATES = {
  professional: {
    id: 'professional',
    name: 'Professional Clean',
    description: 'Classic cleaning service invoice with organized 3-column layout',
    price: 0,
    isPremium: false,
    category: 'free',
    icon: Sparkles,
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=500&fit=crop',
    features: [
      'Professional 3-column layout',
      'Service details section',
      'Materials and labor breakdown',
      'Print optimized for A4'
    ],
    preview: 'Three neat columns showing client info, billing details, and service information with a clean items table.'
  },
  premium: {
    id: 'premium',
    name: 'Premium Service Pro',
    description: 'Elegant design with refined branding for high-end cleaning services',
    price: 299,
    isPremium: true,
    category: 'premium',
    icon: Crown,
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=500&fit=crop',
    features: [
      'Luxury design aesthetic',
      'Large branding area',
      'Enhanced color scheme',
      'Premium paper compatible'
    ],
    preview: 'Elegant bordered design with serif fonts and premium purple accents. Perfect for upscale residential cleaning services.'
  },
  commercial: {
    id: 'commercial',
    name: 'Commercial Clean Pro',
    description: 'Bold and professional design for commercial cleaning operations',
    price: 349,
    isPremium: true,
    category: 'commercial',
    icon: Building2,
    color: 'slate',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=500&fit=crop',
    features: [
      'Corporate slate design',
      'Commercial-focused layout',
      'Bold typography',
      'Professional styling'
    ],
    preview: 'Dynamic slate and blue design with corporate styling. Ideal for office buildings and commercial facilities.'
  },
  modern: {
    id: 'modern',
    name: 'Fresh & Modern',
    description: 'Clean, contemporary design with fresh blue accents',
    price: 249,
    isPremium: true,
    category: 'modern',
    icon: Home,
    color: 'cyan',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=500&fit=crop',
    features: [
      'Minimalist blue design',
      'Spacious layout',
      'Modern typography',
      'Clean and professional'
    ],
    preview: 'Contemporary design with fresh blue accents and generous white space. Perfect for modern residential cleaning services.'
  },
  eco: {
    id: 'eco',
    name: 'Eco-Friendly Specialist',
    description: 'Green-themed layout perfect for eco-conscious cleaning services',
    price: 279,
    isPremium: true,
    category: 'eco',
    icon: Leaf,
    color: 'green',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=500&fit=crop',
    features: [
      'Eco-friendly green theme',
      'Sustainable service focus',
      'Green products section',
      'Environmental commitment'
    ],
    preview: 'Fresh design with green accents. Optimized for eco-friendly cleaning companies and green service providers.'
  }
};

// Templates Component
const Templates = () => {
  const [purchasedTemplates, setPurchasedTemplates] = useState(['professional']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(null);
  const [showPayment, setShowPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const handlePurchase = async (templateId) => {
    const template = TEMPLATES[templateId];
    
    // Open payment modal for premium templates
    if (template.isPremium) {
      setShowPayment(templateId);
      return;
    }

    // For free templates, process immediately
    setPurchasedTemplates(prev => [...prev, templateId]);
    alert('✅ Template added successfully!');
  };

  const handlePaymentSubmit = async () => {
    const templateId = showPayment;
    const template = TEMPLATES[templateId];

    // Validate card details
    if (!paymentForm.cardNumber || paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      alert('❌ Please enter a valid 16-digit card number');
      return;
    }

    if (!paymentForm.cardName.trim()) {
      alert('❌ Please enter the cardholder name');
      return;
    }

    if (!paymentForm.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentForm.expiryDate)) {
      alert('❌ Please enter expiry date in MM/YY format');
      return;
    }

    if (!paymentForm.cvv || paymentForm.cvv.length !== 3) {
      alert('❌ Please enter a valid 3-digit CVV');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add template to purchased list
      setPurchasedTemplates(prev => [...prev, templateId]);
      
      // Reset form and close modal
      setPaymentForm({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
      setShowPayment(null);
      
      alert(`✅ Payment successful!\n\n${template.name} has been added to your account.\n\nYou can now use it when creating invoices.`);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('❌ Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value) && value.length <= 16) {
      setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(value) });
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setPaymentForm({ ...paymentForm, expiryDate: value });
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setPaymentForm({ ...paymentForm, cvv: value });
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'free', name: 'Free' },
    { id: 'premium', name: 'Premium' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'modern', name: 'Modern' },
    { id: 'eco', name: 'Eco-Friendly' }
  ];

  const filteredTemplates = Object.values(TEMPLATES).filter(template => {
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  });

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      slate: 'from-slate-500 to-slate-700',
      cyan: 'from-cyan-500 to-blue-500',
      green: 'from-green-500 to-emerald-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Invoice Templates</h1>
          </div>
          <p className="text-blue-50 text-lg">
            Professional invoice designs crafted specifically for cleaning services and janitorial companies
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
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
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-gray-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
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
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-gray-800 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
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
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
          <h3 className="font-semibold text-cyan-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How to use your templates
          </h3>
          <ol className="text-sm text-cyan-800 space-y-2 list-decimal list-inside">
            <li>Purchase a template that matches your cleaning business style</li>
            <li>Go to "Create Invoice" from the sidebar menu</li>
            <li>Look for the template selector dropdown at the top of the page</li>
            <li>Select your purchased template from the dropdown</li>
            <li>Your invoice will automatically use the selected design</li>
          </ol>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Droplets className="w-5 h-5" />
            Perfect for Cleaning Professionals
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Residential cleaning services</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Commercial janitorial companies</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Deep cleaning specialists</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Eco-friendly cleaning services</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Carpet and upholstery cleaning</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Window washing services</span>
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
                  <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
                    <p className="text-sm text-cyan-900">
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
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-gray-800 rounded-lg hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
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
              <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-cyan-500">
                <div className="flex items-center justify-between text-gray-800">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Complete Purchase</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowPayment(null);
                      setPaymentForm({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
                    }}
                    className="text-gray-800 hover:text-gray-200 text-3xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Template Info */}
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    {React.createElement(TEMPLATES[showPayment].icon, { className: "w-8 h-8 text-blue-600" })}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{TEMPLATES[showPayment].name}</h3>
                      <p className="text-sm text-gray-600">{TEMPLATES[showPayment].description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <span className="text-sm text-gray-600">One-time payment</span>
                    <span className="text-2xl font-bold text-blue-600">R{TEMPLATES[showPayment].price}</span>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-lg"
                    />
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value.toUpperCase() })}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all uppercase"
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={paymentForm.expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={paymentForm.cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono text-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800 flex items-start gap-2">
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Your payment information is encrypted and secure. This is a one-time purchase with lifetime access.</span>
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={loading}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-gray-800 rounded-lg hover:from-blue-700 hover:to-cyan-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay R{TEMPLATES[showPayment].price}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By completing this purchase, you agree to our terms of service
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;