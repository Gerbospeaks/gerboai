import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  FileText,
  User,
  Settings,
  CreditCard,
  XCircle,
  Shield,
  Scale,
  AlertTriangle,
  Calendar,
  Mail,
  Menu,
  X,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';
import logo from '../assets/img/solidflo.png';
import logo1 from '../assets/img/solidflo-logo.png';
import instagram from '../assets/images/instagram.png';
import facebook from '../assets/images/facebook.png';
import twitter from '../assets/images/twitter.png';
import linkedin from '../assets/images/linkedin.png';

const TermsPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Update active section based on scroll position
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id);
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    closeMobileMenu();
  };

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 'definitions', title: 'Definitions', icon: <FileText className="w-5 h-5" /> },
    { id: 'accounts', title: 'User Accounts', icon: <User className="w-5 h-5" /> },
    { id: 'service-use', title: 'Use of Service', icon: <Settings className="w-5 h-5" /> },
    { id: 'payment', title: 'Payment Terms', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: <Shield className="w-5 h-5" /> },
    { id: 'prohibited', title: 'Prohibited Activities', icon: <XCircle className="w-5 h-5" /> },
    { id: 'liability', title: 'Limitation of Liability', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'termination', title: 'Termination', icon: <XCircle className="w-5 h-5" /> },
    { id: 'governing-law', title: 'Governing Law', icon: <Scale className="w-5 h-5" /> },
    { id: 'changes', title: 'Changes to Terms', icon: <Calendar className="w-5 h-5" /> },
    { id: 'contact', title: 'Contact Us', icon: <Mail className="w-5 h-5" /> }
  ];

  const lastUpdated = "February 14, 2026";

  return (
    <>
      <Helmet>
        <title>Terms of Service - SolidFlo</title>
        <meta name="description" content="Read SolidFlo's Terms of Service to understand your rights and responsibilities when using our invoicing platform." />
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .gradient-text {
            background: linear-gradient(135deg, #ff9d00 0%, #e68a00 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .glass {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-slide-up {
            animation: slideInUp 0.6s ease-out forwards;
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }

          .toc-link {
            transition: all 0.3s ease;
          }

          .toc-link.active {
            background: linear-gradient(135deg, #ff9d00 0%, #e68a00 100%);
            color: white;
            transform: translateX(4px);
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
          }

          .toc-sidebar::-webkit-scrollbar {
            width: 4px;
          }

          .toc-sidebar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .toc-sidebar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #ff9d00, #e68a00);
            border-radius: 4px;
          }
        `}</style>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Navigation */}
        <div 
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6">
            <button 
              onClick={closeMobileMenu}
              className="absolute top-6 right-6 text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mt-12 space-y-6">
              <button 
                onClick={() => { closeMobileMenu(); navigate('/'); }}
                className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
              
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Jump to Section
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {section.icon}
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 space-y-3">
                <button 
                  onClick={() => { closeMobileMenu(); navigate('/login'); }}
                  className="w-full py-3 px-6 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => { closeMobileMenu(); navigate('/register'); }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrollY > 50 ? 'glass shadow-lg' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="SolidFlo" className="h-16 w-auto" />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </button>
              </nav>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 text-gray-700 font-semibold hover:text-orange-500 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Start Free Trial
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-700 hover:text-orange-500"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6 animate-slide-up">
                <Scale className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">Legal Agreement</span>
              </div>

              <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 text-gray-900 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Terms of <span className="gradient-text">Service</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Please read these terms carefully before using SolidFlo
              </p>

              <p className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Table of Contents Sidebar - Desktop */}
              <div className="hidden lg:block">
                <div className="sticky top-24 toc-sidebar max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                      On This Page
                    </h3>
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`toc-link w-full text-left px-3 py-2 text-sm rounded-lg flex items-center gap-2 ${
                            activeSection === section.id
                              ? 'active'
                              : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          {section.icon}
                          <span className="truncate">{section.title}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                  {/* Introduction */}
                  <div className="mb-12 pb-8 border-b border-gray-200">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                          <p className="text-sm text-blue-800">
                            These Terms of Service constitute a legally binding agreement between you and SolidFlo. By accessing or using our service, you agree to be bound by these terms.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Welcome to SolidFlo. These Terms of Service ("Terms") govern your access to and use of the SolidFlo platform, including our website, applications, and services. Please read these Terms carefully.
                    </p>
                  </div>

                  {/* Section 1: Acceptance */}
                  <div id="acceptance" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Acceptance of Terms</h2>
                    </div>
                    
                    <div className="space-y-4 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        By creating an account, accessing, or using SolidFlo, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        If you do not agree to these Terms, you may not access or use our services. If you are using SolidFlo on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
                      </p>
                    </div>
                  </div>

                  {/* Section 2: Definitions */}
                  <div id="definitions" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Definitions</h2>
                    </div>
                    
                    <div className="space-y-4 pl-15">
                      <div className="grid gap-4">
                        {[
                          { term: 'Service', definition: 'Refers to the SolidFlo platform, including all features, tools, and functionalities.' },
                          { term: 'User/You', definition: 'Refers to the individual or entity accessing or using the Service.' },
                          { term: 'Account', definition: 'Your registered user profile on the SolidFlo platform.' },
                          { term: 'Content', definition: 'All data, information, invoices, and materials you submit or create using the Service.' },
                          { term: 'Subscription', definition: 'Your paid plan for accessing premium features of the Service.' }
                        ].map((item, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                            <h3 className="font-semibold text-gray-900 mb-1">"{item.term}"</h3>
                            <p className="text-sm text-gray-600">{item.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: User Accounts */}
                  <div id="accounts" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                        <User className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">User Accounts</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          To use SolidFlo, you must create an account by providing accurate and complete information. You agree to:
                        </p>
                        <ul className="space-y-2">
                          {[
                            'Provide truthful, accurate, and complete registration information',
                            'Maintain and update your information to keep it current',
                            'Maintain the security of your password and account',
                            'Notify us immediately of any unauthorized use of your account',
                            'Accept responsibility for all activities that occur under your account'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Eligibility</h3>
                        <p className="text-gray-700 leading-relaxed">
                          You must be at least 18 years old or the age of majority in your jurisdiction to create an account. By creating an account, you represent that you meet these age requirements.
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Warning:</strong> You are responsible for maintaining the confidentiality of your account credentials. We are not liable for any loss or damage arising from your failure to comply with this security obligation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Use of Service */}
                  <div id="service-use" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Settings className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Use of Service</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">License Grant</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your business purposes in accordance with these Terms.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Acceptable Use</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                        </p>
                        <div className="space-y-3">
                          {[
                            'Violate any applicable laws or regulations',
                            'Infringe upon the rights of others',
                            'Transmit any malicious code, viruses, or harmful content',
                            'Attempt to gain unauthorized access to the Service',
                            'Use the Service to send spam or unsolicited communications',
                            'Reverse engineer or attempt to extract the source code',
                            'Use automated systems to access the Service without authorization'
                          ].map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Payment Terms */}
                  <div id="payment" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Payment Terms</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Subscription Plans</h3>
                        <p className="text-gray-700 leading-relaxed">
                          SolidFlo offers both free and paid subscription plans. Paid subscriptions provide access to additional features and functionality. Subscription fees are billed in advance on a monthly or annual basis.
                        </p>
                      </div>

                      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing and Renewal</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li>• Subscriptions automatically renew unless cancelled before the renewal date</li>
                          <li>• You authorize us to charge your payment method for all fees incurred</li>
                          <li>• Prices are subject to change with 30 days' notice</li>
                          <li>• All fees are non-refundable except as required by law</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Trial</h3>
                        <p className="text-gray-700 leading-relaxed">
                          We may offer a free trial period. At the end of the trial, your subscription will automatically convert to a paid subscription unless you cancel before the trial ends. No refunds are provided for any unused portion of a subscription.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Cancellation</h3>
                        <p className="text-gray-700 leading-relaxed">
                          You may cancel your subscription at any time from your account settings. Cancellation will take effect at the end of your current billing period, and you will retain access until that date.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Intellectual Property */}
                  <div id="intellectual-property" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Intellectual Property Rights</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Intellectual Property</h3>
                        <p className="text-gray-700 leading-relaxed">
                          The Service and all its original content, features, and functionality are owned by SolidFlo and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Content</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          You retain all rights to the content you create and upload to the Service. By using the Service, you grant us a limited license to:
                        </p>
                        <ul className="space-y-2">
                          {[
                            'Store and process your content to provide the Service',
                            'Display your content as necessary to provide invoicing services',
                            'Create backups of your content',
                            'Use your content to improve and develop the Service'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> We do not claim ownership of your content. You can delete your content at any time by removing it from your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Prohibited Activities */}
                  <div id="prohibited" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Prohibited Activities</h2>
                    </div>
                    
                    <div className="space-y-4 pl-15">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You may not access or use the Service for any purpose other than that for which we make it available. Prohibited activities include, but are not limited to:
                      </p>
                      
                      <div className="grid gap-4">
                        {[
                          'Using the Service for any illegal purpose or in violation of any laws',
                          'Impersonating another person or entity',
                          'Interfering with or disrupting the Service or servers',
                          'Attempting to bypass any security features',
                          'Using the Service to transmit malware or harmful code',
                          'Scraping or harvesting data from the Service',
                          'Creating multiple accounts to abuse promotions',
                          'Reselling or redistributing the Service without authorization',
                          'Using the Service to compete with SolidFlo'
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                        <p className="text-sm text-red-800">
                          <strong>Warning:</strong> Violation of these prohibited activities may result in immediate termination of your account and potential legal action.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 8: Limitation of Liability */}
                  <div id="liability" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Limitation of Liability</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer of Warranties</h3>
                        <p className="text-gray-700 leading-relaxed">
                          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Damages</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SOLIDFLO BE LIABLE FOR:
                        </p>
                        <ul className="space-y-2">
                          {[
                            'Any indirect, incidental, special, consequential, or punitive damages',
                            'Loss of profits, revenue, data, or business opportunities',
                            'Damages resulting from unauthorized access to your account',
                            'Damages exceeding the amount you paid us in the past 12 months'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of the above limitations may not apply to you.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 9: Termination */}
                  <div id="termination" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg flex items-center justify-center text-white">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Termination</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by You</h3>
                        <p className="text-gray-700 leading-relaxed">
                          You may terminate your account at any time by accessing your account settings and following the cancellation process. Upon termination, your right to use the Service will immediately cease.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Termination by Us</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          We may suspend or terminate your account immediately, without prior notice, if:
                        </p>
                        <ul className="space-y-2">
                          {[
                            'You breach these Terms',
                            'Your use of the Service is fraudulent or illegal',
                            'You fail to pay subscription fees',
                            'We are required to do so by law',
                            'Continuing to provide the Service would be unlawful or harmful'
                          ].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Effect of Termination</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Upon termination, all licenses and rights granted to you will immediately cease. You will lose access to your account and all associated data. We may delete your content after termination. It is your responsibility to export any data you wish to retain before terminating your account.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 10: Governing Law */}
                  <div id="governing-law" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white">
                        <Scale className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Governing Law & Dispute Resolution</h2>
                    </div>
                    
                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Governing Law</h3>
                        <p className="text-gray-700 leading-relaxed">
                          These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Dispute Resolution</h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          In the event of any dispute, claim, or controversy arising out of or relating to these Terms or the Service:
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-orange-600">1</span>
                            </div>
                            <div>
                              <strong className="text-gray-900">Informal Resolution:</strong>
                              <p className="text-gray-700">Contact us first to attempt to resolve the dispute informally.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-orange-600">2</span>
                            </div>
                            <div>
                              <strong className="text-gray-900">Arbitration:</strong>
                              <p className="text-gray-700">If informal resolution fails, disputes will be resolved through binding arbitration.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-orange-600">3</span>
                            </div>
                            <div>
                              <strong className="text-gray-900">Class Action Waiver:</strong>
                              <p className="text-gray-700">You agree to resolve disputes on an individual basis and waive any right to participate in class actions.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 11: Changes to Terms */}
                  <div id="changes" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Changes to These Terms</h2>
                    </div>
                    
                    <div className="space-y-4 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or through a prominent notice on the Service at least 30 days before the changes take effect.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes. If you do not agree to the revised Terms, you must stop using the Service and cancel your account.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Tip:</strong> We recommend checking this page periodically for updates. The "Last updated" date at the top indicates when the Terms were last modified.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 12: Contact */}
                  <div id="contact" data-section className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
                    </div>
                    
                    <div className="pl-15">
                      <p className="text-gray-700 leading-relaxed mb-6">
                        If you have any questions about these Terms, please contact us:
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-gray-900">Email</h3>
                          </div>
                          <a href="mailto:legal@solidflo.co.za" className="text-orange-600 font-semibold hover:underline">
                            legal@solidflo.co.za
                          </a>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <FileText className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-gray-900">Mailing Address</h3>
                          </div>
                          <p className="text-gray-700 text-sm">
                            SolidFlo Legal Department<br />
                            Mandela Square<br />
                            Sandton<br />
                            South Africa
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 text-center">
                          For general support inquiries, visit our{' '}
                          <button 
                            onClick={() => navigate('/contact')}
                            className="text-orange-600 font-semibold hover:underline"
                          >
                            Contact Page
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join 10,000+ businesses using SolidFlo. Start your free trial today.
            </p>
            
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              Start Free Trial
            </button>

            <p className="mt-6 text-white/80 text-sm">
              ✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div>
              <img src={logo1} alt="SolidFlo" className="h-10 mb-4" />
              <p className="text-gray-400 mb-6 leading-relaxed">
                Free online invoicing for small businesses. Create and send invoices, track time and expenses, and accept online payments.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: facebook, alt: 'Facebook' },
                  { icon: twitter, alt: 'Twitter' },
                  { icon: linkedin, alt: 'LinkedIn' },
                  { icon: instagram, alt: 'Instagram' }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
                  >
                    <img src={social.icon} alt={social.alt} className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Product</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Integrations', 'API Docs', 'Updates'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Company</h3>
              <ul className="space-y-3">
                {[
                  { label: 'About', path: '/about' },
                  { label: 'Careers', path: '/careers' },
                  { label: 'Press Kit', path: '/press-kit' },
                  { label: 'Contact', path: '/contact' },
                  { label: 'Partners', path: '/partners' }
                ].map((item) => (
                  <li key={item.label}>
                    <a 
                      onClick={() => navigate(item.path)}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-400">Resources</h3>
               <ul className="space-y-3">
                {[
                  { label: 'Help Center', path: '/help-center' },
                  { label: 'Blogs', path: '/blogs' },
                  { label: 'Tutorials', path: '/tutorials' },
                  { label: 'Community', path: '/community' },
                  { label: 'Privacy Policy', path: '/privacy' },
                  { label: 'Terms of Service', path: '/terms' }
                ].map((item) => (
                  <li key={item.label}>
                    <a 
                      onClick={() => navigate(item.path)}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
             
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} SolidFlo. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default TermsPage;