import { useCurrency, resolveCurrency, formatMoney, convert } from "../../contexts/CurrencyContext";
import React, { useState } from 'react';
import {
  FileText, ShoppingCart, Check, Eye, Sparkles,
  Building2, Briefcase, TrendingUp, Award, BarChart3,
  CreditCard, Lock, Star, Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserTemplates } from '../../hooks/useUserTemplates';


import {
  ProfessionalInvoiceSVG,
  CorporateInvoiceSVG,
  ContemporaryInvoiceSVG,
  ModernBizInvoiceSVG,
  DetailedStatementSVG,
} from './TemplateSVGs';
/* ─── Template catalogue ────────────────────────────────────────── */
export const TEMPLATES = {
  professional: {
    id: 'professional',
    name: 'Professional Standard',
    description: 'Classic business invoice with clean 3-column layout',
    price: 0,
    isPremium: false,
    category: 'free',
    icon: Briefcase,
    color: 'blue',
    SvgPreview: ProfessionalInvoiceSVG,
    features: [
      'Professional 3-column layout',
      'Client and account details',
      'Itemized billing breakdown',
      'Print optimized for A4',
    ],
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate Elite',
    description: 'Premium design with elegant branding for established businesses',
    price: 299,
    isPremium: true,
    category: 'premium',
    icon: Award,
    color: 'slate',
    SvgPreview: CorporateInvoiceSVG,
    features: [
      'Luxury design aesthetic',
      'Prominent branding area',
      'Sophisticated color scheme',
      'Premium paper compatible',
    ],
  },
  contemporary: {
    id: 'contemporary',
    name: 'Bold Contemporary',
    description: 'Modern and dynamic design for forward-thinking businesses',
    price: 349,
    isPremium: true,
    category: 'modern',
    icon: TrendingUp,
    color: 'emerald',
    SvgPreview: ContemporaryInvoiceSVG,
    features: [
      'Bold emerald design',
      'Contemporary layout',
      'Modern typography',
      'Dynamic styling',
    ],
  },
  modern: {
    id: 'modern',
    name: 'Modern Business',
    description: 'Clean, minimalist design with professional indigo accents',
    price: 249,
    isPremium: true,
    category: 'modern',
    icon: Building2,
    color: 'indigo',
    SvgPreview: ModernBizInvoiceSVG,
    features: [
      'Minimalist indigo design',
      'Spacious layout',
      'Contemporary typography',
      'Clean and professional',
    ],
  },
  detailed: {
    id: 'detailed',
    name: 'Detailed Statement',
    description: 'Comprehensive layout perfect for detailed billing and statements',
    price: 279,
    isPremium: true,
    category: 'detailed',
    icon: BarChart3,
    color: 'teal',
    SvgPreview: DetailedStatementSVG,
    features: [
      'Professional teal theme',
      'Detailed line item breakdown',
      'Payment terms section',
      'Comprehensive format',
    ],
  },
};

const COLOR_GRADIENT = {
  blue:    'from-blue-500 to-blue-600',
  slate:   'from-slate-600 to-slate-700',
  emerald: 'from-emerald-500 to-emerald-600',
  indigo:  'from-indigo-500 to-indigo-600',
  teal:    'from-teal-500 to-teal-600',
};

const CATEGORIES = [
  { id: 'all',      name: 'All Templates' },
  { id: 'free',     name: 'Free'          },
  { id: 'premium',  name: 'Premium'       },
  { id: 'modern',   name: 'Modern'        },
  { id: 'detailed', name: 'Detailed'      },
];

/* ─── Payment modal ─────────────────────────────────────────────── */
function PaymentModal({ template, onClose, onSuccess }) {
  const [form,    setForm]    = useState({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const fmtCard   = (v) => { const c = v.replace(/\s/g,''); return (c.match(/.{1,4}/g)||[]).join(' '); };
  const fmtExpiry = (v) => { let d = v.replace(/\D/g,''); if (d.length >= 2) d = d.slice(0,2)+'/'+d.slice(2,4); return d.slice(0,5); };
const { currencyCode } = useCurrency();
const chargeCurrency = resolveCurrency(currencyCode);

// Template prices are stored in ZAR; show them in the charge currency
const money = (zar) =>
  formatMoney(convert(zar, "ZAR", chargeCurrency), chargeCurrency);
  const submit = async () => {
    const raw = form.cardNumber.replace(/\s/g,'');
    if (raw.length !== 16)            return setError('Enter a valid 16-digit card number');
    if (!form.cardName.trim())        return setError('Enter the cardholder name');
    if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) return setError('Enter expiry as MM/YY');
    if (form.cvv.length !== 3)        return setError('Enter a valid 3-digit CVV');
    setError('');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1800)); // simulate gateway
      onSuccess(template.id);
    } catch {
      setError('Payment failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#0f172a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-xl font-bold">Complete Purchase</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">✕</button>
        </div>

        <div className="p-6">
          {/* Template summary */}
          <div className="mb-5 p-4 bg-[#eff6ff] rounded-xl border-2 border-[#bfdbfe]">
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(template.icon, { className: 'w-8 h-8 text-[#2563eb]' })}
              <div>
                <h3 className="font-bold text-[#1e293b]">{template.name}</h3>
                <p className="text-xs text-[#64748b]">{template.description}</p>
              </div>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#bfdbfe]">
              <span className="text-sm text-[#64748b]">One-time payment · lifetime access</span>
              <span className="text-xl font-bold text-[#2563eb]">{money(template.price)}</span>
            </div>
          </div>

          {/* Card fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-1.5">Card Number</label>
              <input value={form.cardNumber}
                onChange={e => { const v=e.target.value.replace(/\s/g,''); if(/^\d*$/.test(v)&&v.length<=16) setForm({...form,cardNumber:fmtCard(v)}); }}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 border-2 border-[#d1d5db] rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none font-mono text-base transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-1.5">Cardholder Name</label>
              <input value={form.cardName}
                onChange={e => setForm({...form,cardName:e.target.value.toUpperCase()})}
                placeholder="JOHN DOE"
                className="w-full px-4 py-3 border-2 border-[#d1d5db] rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none uppercase transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-1.5">Expiry</label>
                <input value={form.expiryDate}
                  onChange={e => setForm({...form,expiryDate:fmtExpiry(e.target.value)})}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border-2 border-[#d1d5db] rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none font-mono transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wide mb-1.5">CVV</label>
                <input type="password" value={form.cvv}
                  onChange={e => { const v=e.target.value.replace(/\D/g,''); if(v.length<=3) setForm({...form,cvv:v}); }}
                  placeholder="123" maxLength={3}
                  className="w-full px-4 py-3 border-2 border-[#d1d5db] rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none font-mono transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-green-800">Payment is encrypted and secure. One-time purchase, lifetime access on your account.</span>
          </div>

          <button onClick={submit} disabled={loading}
            className="w-full mt-5 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing payment…</>
              : <><Lock className="w-5 h-5" /> Pay {money(template.price)}</>}
          </button>
          <p className="text-xs text-center text-[#9ca3af] mt-3">By completing this purchase you agree to our terms of service</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Preview modal ─────────────────────────────────────────────── */
function PreviewModal({ template, onClose, isOwned, onPurchase, onActivate, isActive }) {
  const Icon       = template.icon;
  const SvgPreview = template.SvgPreview;
  const { currencyCode } = useCurrency();
const chargeCurrency = resolveCurrency(currencyCode);

// Template prices are stored in ZAR; show them in the charge currency
const money = (zar) =>
  formatMoney(convert(zar, "ZAR", chargeCurrency), chargeCurrency);
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b bg-[#f8fafc] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-[#2563eb]" />
            <div>
              <h2 className="text-xl font-bold text-[#1e293b]">{template.name}</h2>
              <p className="text-xs text-[#64748b]">{template.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#1e293b] w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#e2e8f0] transition-colors">✕</button>
        </div>
        <div className="overflow-auto p-6 bg-[#e2e8f0] flex justify-center flex-1">
          <div className="w-full max-w-lg shadow-2xl rounded-lg overflow-hidden"><SvgPreview /></div>
        </div>
        <div className="p-5 border-t bg-[#f8fafc] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 border-2 border-[#d1d5db] text-[#374151] rounded-xl font-semibold hover:bg-[#f9fafb] transition-all">
            Close
          </button>
          {isOwned ? (
            <button onClick={() => { onActivate(template.id); onClose(); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isActive ? 'bg-green-600 text-white' : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'}`}>
              {isActive ? <><Check className="w-4 h-4" /> Active Template</> : <><Star className="w-4 h-4" /> Set as Active</>}
            </button>
          ) : (
            <button onClick={() => { onPurchase(template); onClose(); }}
              className="flex-1 py-3 bg-[#2563eb] text-white rounded-xl font-semibold hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Buy — {money(template.price)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Template card ─────────────────────────────────────────────── */
function TemplateCard({ template, isOwned, isActive, onPurchase, onActivate, onPreview }) {
  const Icon       = template.icon;
  const SvgPreview = template.SvgPreview;
  const { currencyCode } = useCurrency();
const chargeCurrency = resolveCurrency(currencyCode);

// Template prices are stored in ZAR; show them in the charge currency
const money = (zar) =>
  formatMoney(convert(zar, "ZAR", chargeCurrency), chargeCurrency);
  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
      ${isActive ? 'border-[#2563eb] shadow-lg shadow-[#2563eb]/10' : 'border-[#e2e8f0] hover:border-[#93c5fd]'}`}>
      {/* Preview thumbnail */}
      <div className="relative h-64 bg-[#f8fafc] overflow-hidden group">
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
          <SvgPreview />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br ${COLOR_GRADIENT[template.color] || 'from-blue-500 to-blue-600'} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

        {/* Badges */}
        {isActive && (
          <div className="absolute top-3 left-3 bg-[#2563eb] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <Star className="w-3 h-3 fill-white" /> Active
          </div>
        )}
        {template.isPremium && !isOwned && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#374151] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow border border-[#e2e8f0]">
            <Sparkles className="w-3 h-3 text-[#2563eb]" /> Premium
          </div>
        )}
        {isOwned && !isActive && (
          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
            <Check className="w-3 h-3" /> Owned
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button onClick={() => onPreview(template)}
            className="px-4 py-2 bg-white text-[#1e293b] rounded-lg font-semibold hover:bg-[#f8fafc] transition-all flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4" /> Preview
          </button>
          {isOwned ? (
            <button onClick={() => onActivate(template.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${isActive ? 'bg-green-600 text-white' : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'}`}>
              {isActive ? <><Check className="w-4 h-4" /> Active</> : <><Star className="w-4 h-4" /> Set Active</>}
            </button>
          ) : (
            <button onClick={() => onPurchase(template)}
              className="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-semibold hover:bg-[#1d4ed8] text-sm flex items-center gap-2 transition-all">
              <ShoppingCart className="w-4 h-4" /> Buy
            </button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-[#2563eb]" />
          <h3 className="text-base font-bold text-[#1e293b]">{template.name}</h3>
        </div>
        <p className="text-sm text-[#64748b] mb-4 min-h-[36px]">{template.description}</p>
        <ul className="space-y-1.5 mb-4">
          {template.features.map((f, i) => (
            <li key={i} className="text-xs text-[#374151] flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9]">
          <div>
            {template.price === 0
              ? <><div className="text-2xl font-bold text-green-600">Free</div><div className="text-xs text-[#9ca3af]">always included</div></>
              : <><div className="text-2xl font-bold text-[#2563eb]">{money(template.price)}</div><div className="text-xs text-[#9ca3af]">one-time</div></>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onPreview(template)}
              className="px-3 py-2 border-2 border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#93c5fd] transition-all flex items-center gap-1.5 text-sm text-[#374151]">
              <Eye className="w-4 h-4" />
            </button>
            {isOwned ? (
              <button onClick={() => onActivate(template.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-all border-2 ${isActive ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff]'}`}>
                {isActive ? <><Check className="w-4 h-4" /> Active</> : <><Star className="w-4 h-4" /> Use</>}
              </button>
            ) : (
              <button onClick={() => onPurchase(template)}
                className="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 hover:bg-[#1d4ed8] transition-all shadow hover:shadow-lg">
                <ShoppingCart className="w-4 h-4" /> Buy
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
const Templates = () => {
  const { user } = useAuth();
  const {
    purchased, activeTemplate, loading, saving,
    addPurchased, changeActive, isOwned,
  } = useUserTemplates(user);

  const [category,       setCategory]       = useState('all');
  const [previewTpl,     setPreviewTpl]     = useState(null);
  const [paymentTpl,     setPaymentTpl]     = useState(null);
  const [successMsg,     setSuccessMsg]     = useState('');

  const filtered = Object.values(TEMPLATES).filter(
    t => category === 'all' || t.category === category
  );

  const handleActivate = async (id) => {
    if (!isOwned(id)) return;
    await changeActive(id);
    setSuccessMsg(`"${TEMPLATES[id]?.name}" is now your active template`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handlePaymentSuccess = async (templateId) => {
    await addPurchased(templateId);
    setSuccessMsg(`"${TEMPLATES[templateId]?.name}" purchased! Click "Use" to set it as active.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-[#64748b]">
      <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
      Loading your templates…
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-[#1e3a8a] rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Invoice Templates</h1>
          </div>
          <p className="text-blue-200">
            Professional designs for your accounting dashboard. Your active template is used on every invoice you create.
          </p>
        </div>

        {/* Success toast */}
        {successMsg && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium text-sm shadow">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" /> {successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Templates Owned',   value: purchased.length,                              color: 'text-[#2563eb]' },
            { label: 'Total Available',   value: Object.keys(TEMPLATES).length,                 color: 'text-[#7c3aed]' },
            { label: 'Active Template',   value: TEMPLATES[activeTemplate]?.name || '—',        color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className={`text-xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-[#64748b] font-medium uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active template highlight */}
        {TEMPLATES[activeTemplate] && (
          <div className="flex items-center gap-4 p-4 bg-[#eff6ff] border-2 border-[#bfdbfe] rounded-xl">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wide">Currently Active</div>
              <div className="font-bold text-[#1e293b]">{TEMPLATES[activeTemplate].name}</div>
              <div className="text-xs text-[#64748b]">This template is used for all invoices and quotes on your dashboard</div>
            </div>
            {saving && (
              <div className="ml-auto flex items-center gap-2 text-xs text-[#64748b]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
              </div>
            )}
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                category === cat.id
                  ? 'bg-[#2563eb] text-white shadow-lg scale-105 shadow-[#2563eb]/25'
                  : 'bg-white text-[#374151] hover:bg-[#f1f5f9] border border-[#e2e8f0]'
              }`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(tpl => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              isOwned={isOwned(tpl.id)}
              isActive={activeTemplate === tpl.id}
              onPurchase={setPaymentTpl}
              onActivate={handleActivate}
              onPreview={setPreviewTpl}
            />
          ))}
        </div>

        {/* How-to */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-6">
          <h3 className="font-bold text-[#1e40af] mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" /> How templates work
          </h3>
          <ol className="text-sm text-[#1e3a8a] space-y-2 list-decimal list-inside">
            <li>Purchase any premium template you like — it's saved to your account in Firebase</li>
            <li>Click <strong>"Use"</strong> or <strong>"Set Active"</strong> on any owned template</li>
            <li>Your active template is automatically used on all new invoices and quotes</li>
            <li>Switch templates anytime — your invoice data is preserved</li>
          </ol>
        </div>

      </div>

      {/* Modals */}
      {previewTpl && (
        <PreviewModal
          template={previewTpl}
          isOwned={isOwned(previewTpl.id)}
          isActive={activeTemplate === previewTpl.id}
          onClose={() => setPreviewTpl(null)}
          onPurchase={(t) => { setPreviewTpl(null); setPaymentTpl(t); }}
          onActivate={handleActivate}
        />
      )}
      {paymentTpl && (
        <PaymentModal
          template={paymentTpl}
          onClose={() => setPaymentTpl(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Templates;
