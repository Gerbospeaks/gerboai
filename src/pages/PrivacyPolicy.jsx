import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Shield,
  Lock,
  MapPin,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Menu,
  X,
  ArrowLeft,
  Mail,
  Calendar,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";
import logo1 from "../assets/img/solidflo-logo.png";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import linkedin from "../assets/images/linkedin.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Update active section based on scroll position
      const sections = document.querySelectorAll("[data-section]");
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? "hidden" : "";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    closeMobileMenu();
  };

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Eye className="w-5 h-5" />,
    },
    {
      id: "data-sharing",
      title: "Information Sharing",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: "cookies",
      title: "Cookies & Tracking",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: "children",
      title: "Children's Privacy",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: "changes",
      title: "Policy Changes",
      icon: <Calendar className="w-5 h-5" />,
    },
    { id: "contact", title: "Contact Us", icon: <Mail className="w-5 h-5" /> },
  ];

  const lastUpdated = "February 14, 2026";

  return (
    <>
      <Helmet>
        <title>Privacy Policy - SolidFlo</title>
        <meta
          name="description"
          content="Learn how SolidFlo collects, uses, and protects your personal information."
        />
      </Helmet>

      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <style jsx>{`
          @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

          * {
            font-family:
              "Inter",
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
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
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
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

          /* Custom scrollbar for TOC */
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
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
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
                onClick={() => {
                  closeMobileMenu();
                  navigate("/");
                }}
                className="flex items-center gap-2 text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Jump to Section
                </h3>
                <div className="space-y-2">
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
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/login");
                  }}
                  className="w-full py-3 px-6 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/register");
                  }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
            scrollY > 50 ? "glass shadow-lg" : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div
                className="flex items-center cursor-pointer"
                onClick={() => navigate("/")}
              >
                <img src={logo} alt="SolidFlo" className="h-16 w-auto" />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </button>
              </nav>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2.5 text-gray-700 font-semibold hover:text-orange-500 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
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
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6 animate-slide-up">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">
                  Your Privacy Matters
                </span>
              </div>

              <h1
                className="hero-title text-5xl md:text-6xl font-bold mb-6 text-gray-900 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                Privacy <span className="gradient-text">Policy</span>
              </h1>

              <p
                className="text-xl text-gray-600 leading-relaxed mb-4 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                Learn how we collect, use, and protect your personal information
              </p>

              <p
                className="text-sm text-gray-500 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
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
                              ? "active"
                              : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
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
                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                      At SolidFlo, we take your privacy seriously. This Privacy
                      Policy explains how we collect, use, disclose, and
                      safeguard your information when you use our invoicing
                      platform.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      By using SolidFlo, you agree to the collection and use of
                      information in accordance with this policy.
                    </p>
                  </div>

                  {/* Section 1: Information Collection */}
                  <div
                    id="information-collection"
                    data-section
                    className="mb-12 scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Information We Collect
                      </h2>
                    </div>

                    <div className="space-y-6 pl-15">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Personal Information
                        </h3>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          When you register for an account, we collect:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                          <li>
                            Name and contact information (email address, phone
                            number)
                          </li>
                          <li>
                            Business information (company name, address, tax ID)
                          </li>
                          <li>
                            Payment information (credit card details, billing
                            address)
                          </li>
                          <li>
                            Profile information (profile picture, preferences)
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Usage Data
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          We automatically collect information about how you use
                          our service, including IP address, browser type, pages
                          visited, time spent on pages, and other diagnostic
                          data.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Customer Data
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Information you enter about your customers, including
                          names, contact details, and transaction history, is
                          collected to provide our invoicing services.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: How We Use Information */}
                  <div
                    id="how-we-use"
                    data-section
                    className="mb-12 scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                        <Eye className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        How We Use Your Information
                      </h2>
                    </div>

                    <div className="space-y-4 pl-15">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        We use the collected information for various purposes:
                      </p>
                      <ul className="space-y-3">
                        {[
                          "To provide and maintain our service",
                          "To process your transactions and send invoices",
                          "To notify you about changes to our service",
                          "To provide customer support",
                          "To gather analysis or valuable information to improve our service",
                          "To monitor the usage of our service",
                          "To detect, prevent and address technical issues",
                          "To provide you with news, special offers and general information",
                          "To comply with legal obligations",
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Section 3: Information Sharing */}
                  <div
                    id="data-sharing"
                    data-section
                    className="mb-12 scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Information Sharing
                      </h2>
                    </div>

                    <div className="space-y-6 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        We do not sell, trade, or rent your personal information
                        to third parties. We may share your information only in
                        the following circumstances:
                      </p>

                      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Service Providers
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          We may employ third-party companies and individuals to
                          facilitate our service (payment processors, hosting
                          providers, analytics services). These third parties
                          have access to your information only to perform
                          specific tasks on our behalf and are obligated not to
                          disclose or use it for any other purpose.
                        </p>
                      </div>

                      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Legal Requirements
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          We may disclose your information if required to do so
                          by law or in response to valid requests by public
                          authorities (e.g., a court or government agency).
                        </p>
                      </div>

                      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Business Transfers
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          If we are involved in a merger, acquisition, or asset
                          sale, your information may be transferred. We will
                          provide notice before your information is transferred
                          and becomes subject to a different Privacy Policy.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Data Security */}
                  <div
                    id="data-security"
                    data-section
                    className="mb-12 scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Data Security
                      </h2>
                    </div>

                    <div className="space-y-6 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        The security of your data is important to us. We
                        implement industry-standard security measures to protect
                        your information:
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <Lock className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold text-gray-900">
                              Encryption
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            All data transmission is encrypted using SSL/TLS
                            protocols. Sensitive data is encrypted at rest using
                            AES-256 encryption.
                          </p>
                        </div>

                        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold text-gray-900">
                              Access Controls
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            We implement strict access controls and
                            authentication mechanisms to ensure only authorized
                            personnel can access your data.
                          </p>
                        </div>

                        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <Eye className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold text-gray-900">
                              Regular Audits
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Our systems undergo regular security audits and
                            penetration testing by third-party security experts.
                          </p>
                        </div>

                        <div className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            <h3 className="font-semibold text-gray-900">
                              Monitoring
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            We continuously monitor our systems for potential
                            vulnerabilities and threats.
                          </p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Important:</strong> No method of transmission
                          over the Internet or electronic storage is 100%
                          secure. While we strive to use commercially acceptable
                          means to protect your information, we cannot guarantee
                          its absolute security.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Your Rights */}
                  <div
                    id="your-rights"
                    data-section
                    className="mb-12 scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Your Privacy Rights
                      </h2>
                    </div>

                    <div className="space-y-6 pl-15">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        You have certain rights regarding your personal
                        information:
                      </p>

                      <div className="space-y-4">
                        {[
                          {
                            title: "Access",
                            description:
                              "You have the right to request copies of your personal information.",
                          },
                          {
                            title: "Rectification",
                            description:
                              "You have the right to request correction of any information you believe is inaccurate or incomplete.",
                          },
                          {
                            title: "Erasure",
                            description:
                              "You have the right to request deletion of your personal information, under certain conditions.",
                          },
                          {
                            title: "Restrict Processing",
                            description:
                              "You have the right to request restriction of processing your personal information, under certain conditions.",
                          },
                          {
                            title: "Object to Processing",
                            description:
                              "You have the right to object to our processing of your personal information, under certain conditions.",
                          },
                          {
                            title: "Data Portability",
                            description:
                              "You have the right to request transfer of your data to another organization, or directly to you, under certain conditions.",
                          },
                        ].map((right, index) => (
                          <div
                            key={index}
                            className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-orange-600">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {right.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {right.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mt-6">
                        <p className="text-gray-700">
                          To exercise any of these rights, please contact us at{" "}
                          <a
                            href="mailto:privacy@solidflo.co.za"
                            className="text-orange-600 font-semibold hover:underline"
                          >
                            privacy@solidflo.co.za
                          </a>
                          . We will respond to your request within 30 days.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 6: Cookies */}
                  <div id="cookies" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center text-white">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Cookies & Tracking Technologies
                      </h2>
                    </div>

                    <div className="space-y-6 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        We use cookies and similar tracking technologies to
                        track activity on our service and hold certain
                        information. Cookies are files with a small amount of
                        data which may include an anonymous unique identifier.
                      </p>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          Types of Cookies We Use
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                              <strong className="text-gray-900">
                                Essential Cookies:
                              </strong>
                              <span className="text-gray-700">
                                {" "}
                                Required for the website to function properly
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                              <strong className="text-gray-900">
                                Performance Cookies:
                              </strong>
                              <span className="text-gray-700">
                                {" "}
                                Help us understand how visitors interact with
                                our website
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                              <strong className="text-gray-900">
                                Functional Cookies:
                              </strong>
                              <span className="text-gray-700">
                                {" "}
                                Remember your preferences and settings
                              </span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div>
                              <strong className="text-gray-900">
                                Advertising Cookies:
                              </strong>
                              <span className="text-gray-700">
                                {" "}
                                Deliver relevant ads and track campaign
                                performance
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        You can instruct your browser to refuse all cookies or
                        to indicate when a cookie is being sent. However, if you
                        do not accept cookies, you may not be able to use some
                        portions of our service.
                      </p>
                    </div>
                  </div>

                  {/* Section 7: Children's Privacy */}
                  <div
                    id="children"
                    data-section
                    className="mb-12 scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Children's Privacy
                      </h2>
                    </div>

                    <div className="space-y-4 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        Our service is not directed to individuals under the age
                        of 18. We do not knowingly collect personally
                        identifiable information from children under 18.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        If you are a parent or guardian and you are aware that
                        your child has provided us with personal information,
                        please contact us. If we become aware that we have
                        collected personal information from children without
                        verification of parental consent, we will take steps to
                        remove that information from our servers.
                      </p>
                    </div>
                  </div>

                  {/* Section 8: Policy Changes */}
                  <div id="changes" data-section className="mb-12 scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Changes to This Privacy Policy
                      </h2>
                    </div>

                    <div className="space-y-4 pl-15">
                      <p className="text-gray-700 leading-relaxed">
                        We may update our Privacy Policy from time to time. We
                        will notify you of any changes by posting the new
                        Privacy Policy on this page and updating the "Last
                        updated" date at the top of this Privacy Policy.
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        You are advised to review this Privacy Policy
                        periodically for any changes. Changes to this Privacy
                        Policy are effective when they are posted on this page.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          We will also notify you via email and/or a prominent
                          notice on our service prior to the change becoming
                          effective for material changes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 9: Contact */}
                  <div id="contact" data-section className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Contact Us
                      </h2>
                    </div>

                    <div className="pl-15">
                      <p className="text-gray-700 leading-relaxed mb-6">
                        If you have any questions about this Privacy Policy,
                        please contact us:
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <Mail className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-gray-900">
                              Email
                            </h3>
                          </div>
                          <a
                            href="mailto:privacy@solidflo.co.za"
                            className="text-orange-600 font-semibold hover:underline"
                          >
                            privacy@solidflo.co.za
                          </a>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <MapPin className="w-5 h-5 text-orange-600" />
                            <h3 className="font-semibold text-gray-900">
                              Address
                            </h3>
                          </div>
                          <p className="text-gray-700 text-sm">
                            Mandela Square
                            <br />
                            Sandton
                            <br />
                            South Africa
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 text-center">
                          For general inquiries, visit our{" "}
                          <button
                            onClick={() => navigate("/contact")}
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
              Join 10,000+ businesses using SolidFlo. Your data is safe with us.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              Start Free Trial
            </button>

            <p className="mt-6 text-white/80 text-sm">
              ✓ No credit card required ✓ 14-day free trial ✓ Cancel anytime
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
                  Free online invoicing for small businesses. Create and send
                  invoices, track time and expenses, and accept online payments.
                </p>
                <div className="flex gap-4">
                  {[
                    { icon: facebook, alt: "Facebook" },
                    { icon: twitter, alt: "Twitter" },
                    { icon: linkedin, alt: "LinkedIn" },
                    { icon: instagram, alt: "Instagram" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
                    >
                      <img
                        src={social.icon}
                        alt={social.alt}
                        className="w-5 h-5"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Product */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Product
                </h3>
                <ul className="space-y-3">
                  {[
                    "Features",
                    "Pricing",
                    "Integrations",
                    "API Docs",
                    "Updates",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Company
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: "About", path: "/about" },
                    { label: "Careers", path: "/careers" },
                    { label: "Press Kit", path: "/press-kit" },
                    { label: "Contact", path: "/contact" },
                    { label: "Partners", path: "/partners" },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        onClick={() => navigate(item.path)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: "Help Center", path: "/help-center" },
                    { label: "Blogs", path: "/blogs" },
                    { label: "Tutorials", path: "/tutorials" },
                    { label: "Community", path: "/community" },
                    { label: "Privacy Policy", path: "/privacy" },
                    { label: "Terms of Service", path: "/terms" },
                  ].map((item) => (
                    <li key={item.label}>
                      <a
                        onClick={() => navigate(item.path)}
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>
                &copy; {new Date().getFullYear()} SolidFlo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PrivacyPolicy;
