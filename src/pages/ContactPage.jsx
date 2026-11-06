import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import logo from "../assets/img/solidlogo.png";
import logo1 from "../assets/img/solidflo-logo.png";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import linkedin from "../assets/images/linkedin.png";

const ContactPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("idle"); // idle, sending, success, error

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("sending");

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setFormStatus("success");

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setFormStatus("idle");
      }, 3000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Email",
      value: "hello@gerboai.com",
      link: "mailto:hello@gerboai.com",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Phone",
      value: "+27 11 012 5842 ",
      link: "tel:+27110125842",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Address",
      value: "Mandela Square \n Sandton, Johannesburg \n South Africa",
      link: null,
    },
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - GerboAI</title>
        <meta
          name="description"
          content="Get in touch with GerboAI. We're here to help with your invoicing needs."
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

          .hover-lift {
            transition:
              transform 0.3s ease,
              box-shadow 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          input:focus,
          textarea:focus {
            outline: none;
            border-color: #ff9d00;
            box-shadow: 0 0 0 3px rgba(255, 157, 0, 0.1);
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2.5rem !important;
            }
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
              <a
                href="#contact-form"
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                Contact Form
              </a>
              <a
                href="#contact-info"
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                Contact Info
              </a>

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
                <img src={logo} alt="GerboAI" className="h-16 w-auto" />
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
                <a
                  href="#contact-form"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Contact Form
                </a>
                <a
                  href="#contact-info"
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Contact Info
                </a>
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
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="hero-title text-5xl md:text-6xl font-bold mb-6 text-gray-900 animate-slide-up">
                Let's <span className="gradient-text">Connect</span>
              </h1>
              <p
                className="text-xl text-gray-600 leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Have questions? We're here to help. Send us a message and we'll
                respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div id="contact-form" className="animate-slide-up">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Send us a message
                    </h2>
                    <p className="text-gray-600">
                      Fill out the form below and we'll get back to you shortly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === "sending"}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                        formStatus === "success"
                          ? "bg-green-500 text-white"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transform hover:-translate-y-1"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {formStatus === "sending" && (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      )}
                      {formStatus === "success" && (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Message Sent!
                        </>
                      )}
                      {formStatus === "idle" && (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <div
                id="contact-info"
                className="space-y-8 animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                {/* Contact Information Cards */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Get in Touch
                  </h2>

                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                          {info.icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            {info.label}
                          </div>
                          {info.link ? (
                            <a
                              href={info.link}
                              className="text-lg font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <div className="text-lg font-semibold text-gray-900 whitespace-pre-line">
                              {info.value}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Follow Us
                  </h3>
                  <div className="flex gap-4">
                    {[
                      { icon: facebook, alt: "Facebook", link: "#" },
                      { icon: twitter, alt: "Twitter", link: "#" },
                      { icon: linkedin, alt: "LinkedIn", link: "#" },
                      { icon: instagram, alt: "Instagram", link: "#" },
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.link}
                        className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center hover-lift transform transition-all"
                      >
                        <img
                          src={social.icon}
                          alt={social.alt}
                          className="w-7 h-7 brightness-0 invert"
                        />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">Office Hours</h3>
                  </div>
                  <div className="space-y-3">
                    {officeHours.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 border-b border-white/20 last:border-0"
                      >
                        <span className="font-medium">{schedule.day}</span>
                        <span className="font-semibold">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden mt-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join 10,000+ businesses using GerboAI. Start your free trial
              today.
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
                <img src={logo1} alt="GerboAI" className="h-10 mb-4" />
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
                &copy; {new Date().getFullYear()} GerboAI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ContactPage;
