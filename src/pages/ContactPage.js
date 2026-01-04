import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import logo from '../assets/img/solidflo-logo.png';
import { useNavigate } from 'react-router-dom';
import about from './AboutPage';  
import contact from './ContactPage';
import blogs from './BlogPostPage';
import privacy from './PrivacyPolicy';
import terms from './TermsPage';
const ContactPage = () => {
    const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.subject && formData.message) {
      console.log('Form submitted:', formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    }
  };

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
        }

        .app {
          overflow-x: hidden;
        }

        /* Header Styles */
        header {
          background: #2f3444;
          color: #fff;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

         .logo img {
          height: 60px;
          width: auto;
        }

        .logo .highlight {
          color: #ff9d00;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
          list-style: none;
        }

        .desktop-nav a {
          color: #fff;
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }

        .desktop-nav a:hover {
          color: #ff9d00;
        }

        .btn-login {
          padding: 0.5rem 1.5rem;
          border: 2px solid #ff9d00;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .btn-login:hover {
          background: #ff9d00;
          color: #fff;
        }

        .btn-signup {
          padding: 0.5rem 1.5rem;
          background: #ff9d00;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-signup:hover {
          background: #e68a00;
          transform: translateY(-2px);
        }

        .mobile-menu-btn {
          display: none;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        /* Mobile Menu */
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          opacity: ${mobileMenuOpen ? '1' : '0'};
          visibility: ${mobileMenuOpen ? 'visible' : 'hidden'};
          transition: opacity 0.3s ease-in-out, visibility 0.3s;
          z-index: 9998;
        }

        .mobile-nav {
          position: fixed;
          top: 0;
          left: ${mobileMenuOpen ? '0' : '-300px'};
          width: 300px;
          height: 100vh;
          background: #2f3444;
          transition: left 0.3s ease-in-out;
          z-index: 9999;
          overflow-y: auto;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
        }

        .mobile-nav-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: #fff;
          font-size: 2rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
        }

        .mobile-nav ul {
          list-style: none;
          padding: 80px 0 20px 0;
        }

        .mobile-nav ul li {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-nav ul li a {
          display: block;
          padding: 1rem 1.5rem;
          color: #fff;
          text-decoration: none;
          transition: background-color 0.3s, padding-left 0.3s;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .mobile-nav ul li a:hover {
          background: rgba(255, 157, 0, 0.1);
          padding-left: 2rem;
        }

        /* Contact Hero */
        .contact-hero {
          background: linear-gradient(135deg, #2f3444 0%, #2f3444 100%);
          color: #fff;
          padding: 6rem 2rem 4rem;
          display: flex;
          align-items: flex-end;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 400px;
          padding-bottom: 60px;
          height: 100vh;
        }

        .contact-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(90deg, rgba(255, 157, 0, 0.05) 1px, transparent 1px),
            linear-gradient(rgba(255, 157, 0, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          opacity: 0.3;
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          opacity: 0.15;
          animation: float 15s infinite ease-in-out;
        }

        .shape:nth-child(1) {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
          animation-duration: 20s;
        }

        .shape:nth-child(2) {
          top: 60%;
          left: 80%;
          animation-delay: 2s;
          animation-duration: 18s;
        }

        .shape:nth-child(3) {
          top: 30%;
          left: 70%;
          animation-delay: 4s;
          animation-duration: 22s;
        }

        .shape:nth-child(4) {
          top: 80%;
          left: 20%;
          animation-delay: 6s;
          animation-duration: 19s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(5deg);
          }
          50% {
            transform: translateY(-60px) translateX(-20px) rotate(-5deg);
          }
          75% {
            transform: translateY(-30px) translateX(20px) rotate(3deg);
          }
        }

        .contact-icon {
          font-size: 4rem;
          color: #ff9d00;
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 2;
          animation: fadeInUp 1s ease-out;
          width: 100%;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .contact-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .contact-hero .highlight {
          color: #ff9d00;
        }

        .contact-hero p {
          font-size: 1.3rem;
          max-width: 700px;
          margin: 0 auto;
          opacity: 0.95;
        }

        /* Section Styles */
        .section {
          padding: 5rem 2rem;
        }

        .section-gray {
          background: #f8f9fa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Contact Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        /* Contact Form */
        .contact-form {
          background: #fff;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .contact-form h2 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff9d00;
        }

        .form-group textarea {
          min-height: 150px;
          resize: vertical;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #ff9d00;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover {
          background: #e68a00;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 157, 0, 0.4);
        }

        .success-message {
          background: #4CAF50;
          color: #fff;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Contact Info Cards */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-card {
          background: #fff;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }

        .info-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff9d00, #e68a00);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .info-content h3 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .info-content p {
          color: #666;
          line-height: 1.6;
        }

        .info-content a {
          color: #ff9d00;
          text-decoration: none;
          font-weight: 500;
        }

        .info-content a:hover {
          text-decoration: underline;
        }

        /* FAQ Section */
        .faq-section {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-section h2 {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 3rem;
          color: #333;
        }

        .faq-grid {
          display: grid;
          gap: 1.5rem;
        }

        .faq-item {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          border-left: 4px solid #ff9d00;
        }

        .faq-question {
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .faq-answer {
          color: #666;
          line-height: 1.8;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #ff9d00 0%, #e68a00 100%);
          padding: 5rem 2rem;
          text-align: center;
          color: #fff;
        }

        .cta-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.95;
        }

        .btn-white {
          display: inline-block;
          padding: 1rem 2.5rem;
          background: #fff;
          color: #ff9d00;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          font-size: 1.1rem;
        }

        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        /* Footer */
        footer {
          background: #23273b;
          color: #fff;
          padding: 4rem 2rem 2rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-section h3 {
          margin-bottom: 1.5rem;
          color: #ff9d00;
          font-size: 1.2rem;
        }

        .footer-section ul {
          list-style: none;
        }

        .footer-section ul li {
          margin-bottom: 0.8rem;
        }

        .footer-section a {
          color: #ccc;
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }

        .footer-section a:hover {
          color: #ff9d00;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid #333;
          text-align: center;
          color: #999;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-links a {
          width: 40px;
          height: 40px;
          background: #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
          color: #fff;
          text-decoration: none;
        }

        .social-links a:hover {
          background: #ff9d00;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .contact-hero h1 {
            font-size: 2rem;
          }

          .contact-hero p {
            font-size: 1.1rem;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .contact-form {
            padding: 2rem;
          }
        }
      `}</style>

      {/* Menu Overlay */}
      <div className="menu-overlay" onClick={closeMobileMenu} />

      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <button className="mobile-nav-close" onClick={closeMobileMenu}>
          &times;
        </button>
        <ul>
          <li><a href="/" onClick={closeMobileMenu}>Home</a></li>
          <li><a href="/about" onClick={closeMobileMenu}>About</a></li>
          <li><a href="/contact" onClick={closeMobileMenu}>Contact</a></li>
          <li><a href="/login" onClick={closeMobileMenu}>Login</a></li>
          <li><a href="/register" onClick={closeMobileMenu} style={{ color: '#ff9d00', fontWeight: 600 }}>Sign Up Free</a></li>
        </ul>
      </nav>

      {/* Header */}
      <header>
        <div className="header-content">
          <div className="logo">
          <img src={logo} alt="SolidFlo" />
          </div>
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            ☰
          </button>
          <ul className="desktop-nav">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/login" className="btn-login">Login</a></li>
            <li><a href="/register" className="btn-signup">Sign Up Free</a></li>
          </ul>
        </div>
      </header>

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="floating-shapes">
          <div className="shape">
            <div className="contact-icon">✉️</div>
          </div>
          <div className="shape">
            <div className="contact-icon">📞</div>
          </div>
          <div className="shape">
            <div className="contact-icon">💬</div>
          </div>
          <div className="shape">
            <div className="contact-icon">🤝</div>
          </div>
        </div>
        <div className="hero-content-wrapper">
          <h1>Get in <span className="highlight">Touch</span></h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form">
              <h2>Send us a Message</h2>
              {submitted && (
                <div className="success-message">
                  <CheckCircle size={20} />
                  <span>Thank you! Your message has been sent successfully.</span>
                </div>
              )}
              <div>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <button onClick={handleSubmit} className="submit-btn">
                  <Send size={20} />
                  Send Message
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="contact-info">
              <div className="info-card">
                <div className="info-icon">
                  <Mail size={28} />
                </div>
                <div className="info-content">
                  <h3>Email Us</h3>
                  <p>Our team is here to help</p>
                  <a href="mailto:support@solidflo.co.za">support@solidflo.co.za</a>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Phone size={28} />
                </div>
                <div className="info-content">
                  <h3>Call Us</h3>
                  <p>Mon-Fri from 8am to 5pm</p>
                  <a href="tel:+27684887039">+27 (68) 488-7039</a>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <MapPin size={28} />
                </div>
                <div className="info-content">
                  <h3>Visit Us</h3>
                  <p>Mandela Square<br />Sandton, Gauteng<br />South Africa</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Clock size={28} />
                </div>
                <div className="info-content">
                  <h3>Support Hours</h3>
                  <p>Monday - Friday: 8am - 5pm PST<br />Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3 className="faq-question">How quickly will I get a response?</h3>
                <p className="faq-answer">We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.</p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Do you offer live chat support?</h3>
                <p className="faq-answer">Yes! Professional and Enterprise plan users have access to live chat support during business hours.</p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Can I schedule a demo?</h3>
                <p className="faq-answer">Absolutely! Mention "demo request" in your message subject and we'll arrange a personalized walkthrough of Solidflo.</p>
              </div>
              <div className="faq-item">
                <h3 className="faq-question">Where can I find documentation?</h3>
                <p className="faq-answer">Visit our Help Center for comprehensive guides, tutorials, and API documentation to get the most out of Solidflo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of businesses using Solidflo for their invoicing needs</p>
          <button className="btn-white" onClick={() => window.location.href = '/register'}>
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>solidflo</h3>
            <p>Free online invoicing for small businesses. Create and send invoices, track time and expenses, and accept online payments.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">t</a>
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="Instagram">ig</a>
            </div>
          </div>
          <div className="footer-section">
            <h3>Product</h3>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a>Integrations</a></li>
              <li><a>API Documentation</a></li>
              <li><a>Updates</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a>Careers</a></li>
              <li><a>Press Kit</a></li>
              <li><a>Partners</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Resources</h3>
            <ul>
             <li><a>Help Center</a></li>
          <li><a onClick={() => navigate('/blogs')}>Blog</a></li>
          <li><a>Video Tutorials</a></li>
          <li><a>Community</a></li>
          <li><a onClick={() => navigate('/privacy')}>Privacy Policy</a></li>
          <li><a onClick={() => navigate('/terms')}>Terms And Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} solidflo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;