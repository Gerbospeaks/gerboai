import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/img/solidflo-logo.png';
import computer from '../assets/images/new_solidflo_bg_transp_text.png';
import about from './AboutPage';  
import contact from './ContactPage';
import blogs from './BlogPostPage';
import privacy from './PrivacyPolicy';
import terms from './TermsPage';
const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const words = ['Smarter.', 'Better.', 'Bolder.'];
  const slides = [
    { id: 1, src: require('../assets/images/product1.png'), alt: 'Dashboard' },
    { id: 2, src: require('../assets/images/product2.png'), alt: 'Professional Invoices' },
    { id: 3, src: require('../assets/images/product3.png'), alt: 'Payment Processing' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/register');
  };

  return (
    <div className="app">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
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
          background: linear-gradient(135deg, #2f3444 0%, #2f3444 100%);
          background-image: url('${computer}');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
          color: #000000ff;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
         
        }

        header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(47, 52, 68, 0.7) 0%, rgba(47, 52, 68, 0.7) 100%);
          pointer-events: none;
          z-index: 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .logo img {
          height: 60px;
          width: auto;
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

        .mobile-nav-close:hover {
          color: #ff9d00;
        }

        .mobile-nav ul {
          list-style: none;
          padding: 80px 0 20px 0;
        }

        .mobile-nav ul li {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-nav ul li a, .mobile-nav ul li span {
          display: block;
          padding: 1rem 1.5rem;
          color: #fff;
          text-decoration: none;
          transition: background-color 0.3s, padding-left 0.3s;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .mobile-nav ul li a:hover, .mobile-nav ul li span:hover {
          background: rgba(255, 157, 0, 0.1);
          padding-left: 2rem;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #2f3444 0%, #2f3444 100%);
          background-image: url('${computer}');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
          color: #fff;
          padding: 0 2rem;
          text-align: center;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(47, 52, 68, 0.7) 0%, rgba(47, 52, 68, 0.7) 100%);
          pointer-events: none;
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-content h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .hero-subtitle {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .animated-word {
          color: #ff9d00;
          font-weight: 900;
          min-width: 150px;
          animation: slideIn 0.5s ease-in-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-description {
          font-size: 1.2rem;
          margin: 2rem 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        .btn {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: #ff9d00;
          color: #fff;
        }

        .btn-primary:hover {
          background: #e68a00;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(255, 157, 0, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: #fff;
          border: 2px solid #fff;
        }

        .btn-secondary:hover {
          background: #fff;
          color: #667eea;
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

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .section-description {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 3rem;
          color: #666;
          font-size: 1.1rem;
        }

        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat {
          padding: 2rem;
          background: #23273b;
          border-radius: 10px;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: #999;
        }

        /* Analytics Grid */
        .analytics-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          justify-content: center;
        }

        .analytics-card {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          flex: 1;
          min-width: 300px;
          max-width: 400px;
        }

        .analytics-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .chart-container {
          margin-bottom: 1.5rem;
        }

        .chart-svg {
          width: 100%;
          height: auto;
        }

        .chart-description {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .feature-card p {
          color: #666;
          line-height: 1.8;
        }

        /* Pricing */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .pricing-card {
          background: #fff;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
          position: relative;
        }

        .pricing-card.featured {
          border: 3px solid #ff9d00;
          transform: scale(1.05);
        }

        .pricing-badge {
          position: absolute;
          top: -15px;
          right: 20px;
          background: #ff9d00;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .price {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin: 1rem 0;
        }

        .price span {
          font-size: 1.2rem;
          color: #666;
        }

        .features-list {
          list-style: none;
          margin: 2rem 0;
          text-align: left;
        }

        .features-list li {
          padding: 0.5rem 0;
          color: #666;
        }

        .features-list li:before {
          content: "✓";
          color: #ff9d00;
          font-weight: 700;
          margin-right: 0.5rem;
        }

        /* Testimonials */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .testimonial-card {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          position: relative;
        }

        .quote-icon {
          font-size: 4rem;
          color: #ff9d00;
          opacity: 0.2;
          position: absolute;
          top: 10px;
          left: 20px;
          font-family: Georgia, serif;
        }

        .testimonial-text {
          color: #666;
          line-height: 1.8;
          margin: 2rem 0 1.5rem;
          font-style: italic;
        }

        .testimonial-author strong {
          color: #333;
          font-size: 1.1rem;
          display: block;
          margin-bottom: 0.3rem;
        }

        .testimonial-author span {
          color: #999;
          font-size: 0.9rem;
        }

        /* Integrations */
        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 1rem 0;
          scroll-behavior: smooth;
        }

        .integration-logo {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #666;
          font-size: 1.2rem;
          transition: transform 0.3s;
          flex-shrink: 0;
          min-width: 150px;
        }

        .integration-logo:hover {
          transform: translateY(-5px);
        }

        /* Slider */
        .screenshots-slider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .slider-wrapper {
          width: 100%;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .slider-track {
          display: flex;
          transition: transform 0.5s ease-in-out;
          width: 100%;
        }

        .slide {
          min-width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }

        .slide-image {
          width: 100%;
          height: auto;
          display: block;
          max-width: 100%;
        }

        .slider-dots {
          display: flex;
          gap: 0.8rem;
          justify-content: center;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }

        .dot.active {
          background: #ff9d00;
          transform: scale(1.3);
        }

        .dot:hover {
          background: #ff9d00;
        }

        /* FAQ */
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .faq-item {
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .faq-question {
          color: #333;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .faq-answer {
          color: #666;
          line-height: 1.8;
        }

        /* CTA Section */
        .cta-section {
          background: #fff;
          color: #23273b;
          text-align: center;
          padding: 5rem 2rem;
        }

        .cta-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-section p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
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

          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .faq-grid, .integrations-grid {
            grid-template-columns: 1fr;
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
          <li><a href="#features" onClick={closeMobileMenu}>Features</a></li>
          <li><a href="#pricing" onClick={closeMobileMenu}>Pricing</a></li>
          <li><a onClick={() => navigate({about})}>About</a></li>
          <li><span onClick={() => { closeMobileMenu(); handleLogin(); }}>Login</span></li>
          <li><span onClick={() => { closeMobileMenu(); handleSignup(); }} style={{ color: '#ff9d00', fontWeight: 600 }}>Sign Up Free</span></li>
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
            <li><a href="#features">Features</a></li>
            <li><a href="#customers">Customers</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#help">Help Center</a></li>
            <li><a onClick={handleLogin} className="btn-login">Login</a></li>
            <li><a onClick={handleSignup} className="btn-signup">Sign Up Free</a></li>
          </ul>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Easy online invoicing for your business</h1>
          <div className="hero-subtitle">
            <span>Billing Made:</span>
            <span className="animated-word" key={currentWord}>
              {words[currentWord]}
            </span>
          </div>
          <p className="hero-description">
            All-in-one automated billing software for small to medium-sized businesses and enterprises alike.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={handleSignup}>Start using SolidFlo for free</button>
            <button className="btn btn-secondary">Take the tour</button>
          </div>
        </div>
      </section>

      {/* Sliding Screenshots Section */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="section-title">Powerful Features at Your Fingertips</h2>
          <p className="section-description">
            Experience a seamless invoicing experience with our intuitive dashboard and comprehensive tools
          </p>
          <div className="screenshots-slider">
            <div className="slider-wrapper">
              <div className="slider-track">
                <div className="slide">
                  <img src={require('../assets/images/product1.png')} alt="Dashboard" className="slide-image" />
                </div>
                <div className="slide">
                  <img src={require('../assets/images/product2.png')} alt="Professional Invoices" className="slide-image" />
                </div>
                <div className="slide">
                  <img src={require('../assets/images/product3.png')} alt="Payment Processing" className="slide-image" />
                </div>
              </div>
            </div>
            <div className="slider-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Why Choose SolidFlo?</h2>
          <p className="section-description">
            Solidflo is designed to simplify your invoicing process, helping you save time and get paid faster. With a user-friendly interface and powerful features, solidflo is the perfect solution for small businesses looking to streamline their billing operations.
          </p>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="section-title">Financial Insights & Analytics</h2>
          <p className="section-description">
            Track your business performance with comprehensive financial dashboards and detailed analytics
          </p>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Expense Trends</h3>
              <div className="chart-container">
                <svg viewBox="0 0 400 250" className="chart-svg">
                  <defs>
                    <linearGradient id="expenseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ff9d00" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ff9d00" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  <polyline points="20,220 70,180 120,200 170,140 220,160 270,100 320,120 370,80" 
                    fill="none" stroke="#ff9d00" strokeWidth="2"/>
                  <polygon points="20,220 70,180 120,200 170,140 220,160 270,100 320,120 370,80 370,240 20,240" 
                    fill="url(#expenseGradient)"/>
                  <text x="40" y="235" fontSize="12" fill="#666">Jan</text>
                  <text x="90" y="235" fontSize="12" fill="#666">Feb</text>
                  <text x="140" y="235" fontSize="12" fill="#666">Mar</text>
                  <text x="190" y="235" fontSize="12" fill="#666">Apr</text>
                  <text x="240" y="235" fontSize="12" fill="#666">May</text>
                  <text x="290" y="235" fontSize="12" fill="#666">Jun</text>
                  <text x="340" y="235" fontSize="12" fill="#666">Jul</text>
                </svg>
              </div>
              <p className="chart-description">Monitor your spending patterns across months</p>
            </div>
            <div className="analytics-card">
              <h3>Profit & Loss</h3>
              <div className="chart-container">
                <svg viewBox="0 0 400 250" className="chart-svg">
                  <defs>
                    <linearGradient id="profitGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <rect x="30" y="100" width="35" height="120" fill="url(#profitGradient)" stroke="#4CAF50" strokeWidth="2"/>
                  <rect x="85" y="80" width="35" height="140" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2"/>
                  <rect x="140" y="120" width="35" height="100" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2"/>
                  <rect x="195" y="60" width="35" height="160" fill="url(#profitGradient)" stroke="#4CAF50" strokeWidth="2"/>
                  <rect x="250" y="90" width="35" height="130" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="2"/>
                  <rect x="305" y="70" width="35" height="150" fill="url(#profitGradient)" stroke="#4CAF50" strokeWidth="2"/>
                  <line x1="20" y1="220" x2="380" y2="220" stroke="#ddd" strokeWidth="1"/>
                  <text x="30" y="240" fontSize="12" fill="#666">Q1</text>
                  <text x="85" y="240" fontSize="12" fill="#666">Q2</text>
                  <text x="140" y="240" fontSize="12" fill="#666">Q3</text>
                  <text x="195" y="240" fontSize="12" fill="#666">Q4</text>
                  <text x="250" y="240" fontSize="12" fill="#666">Q5</text>
                  <text x="305" y="240" fontSize="12" fill="#666">Q6</text>
                </svg>
              </div>
              <p className="chart-description">Track revenue vs expenses quarterly</p>
            </div>
            <div className="analytics-card">
              <h3>Revenue Breakdown</h3>
              <div className="chart-container">
                <svg viewBox="0 0 400 250" className="chart-svg">
                  <circle cx="200" cy="120" r="80" fill="none" stroke="#ff9d00" strokeWidth="25" 
                    strokeDasharray="125.6 125.6" strokeDashoffset="0"/>
                  <circle cx="200" cy="120" r="80" fill="none" stroke="#667eea" strokeWidth="25" 
                    strokeDasharray="75.4 125.6" strokeDashoffset="-125.6"/>
                  <circle cx="200" cy="120" r="80" fill="none" stroke="#4CAF50" strokeWidth="25" 
                    strokeDasharray="50.2 125.6" strokeDashoffset="-201"/>
                  <text x="200" y="125" fontSize="28" fontWeight="bold" fill="#333" textAnchor="middle">38%</text>
                  <text x="200" y="150" fontSize="14" fill="#666" textAnchor="middle">Income</text>
                  <circle cx="80" cy="210" r="6" fill="#ff9d00"/>
                  <text x="95" y="215" fontSize="12" fill="#666">Services</text>
                  <circle cx="220" cy="210" r="6" fill="#667eea"/>
                  <text x="235" y="215" fontSize="12" fill="#666">Products</text>
                  <circle cx="350" cy="210" r="6" fill="#4CAF50"/>
                  <text x="365" y="215" fontSize="12" fill="#666">Other</text>
                </svg>
              </div>
              <p className="chart-description">See where your income comes from</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Impact in Numbers</h2>
          <div className="stats">
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat">
              <div className="stat-number">2000+</div>
              <div className="stat-label">Invoices Sent</div>
            </div>
            <div className="stat">
              <div className="stat-number">$50000+</div>
              <div className="stat-label">Processed</div>
            </div>
            <div className="stat">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section section-gray">
        <div className="container">
          <h2 className="section-title">Everything You Need to Run Your Business</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Professional Invoices</h3>
              <p>Create beautiful, customizable invoices in seconds. Add your logo, choose your colors, and impress your clients.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Online Payments</h3>
              <p>Accept credit cards, PayPal, and bank transfers. Get paid faster with integrated payment processing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Recurring Billing</h3>
              <p>Set up subscription billing and let solidflo handle everything automatically. Never miss a payment.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Time Tracking</h3>
              <p>Track billable hours with our built-in timer. Convert time entries to invoices with one click.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Expense Management</h3>
              <p>Track expenses, attach receipts, and bill clients accurately. Keep your finances organized.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Reports & Analytics</h3>
              <p>Get insights into your business with detailed reports. Track income, expenses, and profitability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section">
        <div className="container">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">$0<span>/month</span></div>
              <ul className="features-list">
                <li>Unlimited invoices</li>
                <li>Up to 5 clients</li>
                <li>Basic reports</li>
                <li>Email support</li>
              </ul>
              <button className="btn btn-secondary" onClick={handleSignup}>Get Started</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">Most Popular</div>
              <h3>Professional</h3>
              <div className="price">$19<span>/month</span></div>
              <ul className="features-list">
                <li>Everything in Free</li>
                <li>Unlimited clients</li>
                <li>Recurring billing</li>
                <li>Time tracking</li>
                <li>Advanced reports</li>
                <li>Priority support</li>
              </ul>
              <button className="btn btn-primary" onClick={handleSignup}>Start Free Trial</button>
            </div>
            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">$49<span>/month</span></div>
              <ul className="features-list">
                <li>Everything in Professional</li>
                <li>Multi-user access</li>
                <li>Custom branding</li>
                <li>API access</li>
                <li>Dedicated account manager</li>
              </ul>
              <button className="btn btn-secondary" onClick={handleSignup}>Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="section-title">Trusted by Leading Businesses</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">"Solidflo has completely transformed how we handle invoicing. We've cut our billing time by 70% and get paid 2x faster."</p>
              <div className="testimonial-author">
                <strong>Thomas Dube</strong>
                <span>CEO, Afromind Capital</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">"The automated recurring billing feature has been a game-changer for our subscription business. Highly recommend!"</p>
              <div className="testimonial-author">
                <strong>Gracious Ncube</strong>
                <span>Founder, Anantara Skincare</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote-icon">"</div>
              <p className="testimonial-text">"Best invoicing software we've used. Simple, powerful, and the support team is incredibly responsive."</p>
              <div className="testimonial-author">
                <strong>Gabriel Moyo</strong>
                <span>Owner, Gerbospeaks Ai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Integrations That Work With Your Tools</h2>
          <p className="section-description">
            Connect solidflo with the tools you already use to streamline your workflow.
          </p>
          <div className="integrations-grid">
            <div className="integration-logo">Stripe</div>
            <div className="integration-logo">PayPal</div>
            <div className="integration-logo">QuickBooks</div>
            <div className="integration-logo">Xero</div>
            <div className="integration-logo">Zapier</div>
            <div className="integration-logo">Slack</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Is solidflo really free?</h3>
              <p className="faq-answer">Yes! Our free plan includes unlimited invoices for up to 5 clients. No credit card required to get started.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I cancel anytime?</h3>
              <p className="faq-answer">Absolutely. There are no long-term contracts. You can upgrade, downgrade, or cancel your subscription at any time.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What payment methods do you accept?</h3>
              <p className="faq-answer">We support credit cards, debit cards, PayPal, and bank transfers through our integrated payment processors.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Is my data secure?</h3>
              <p className="faq-answer">Yes. We use bank-level 256-bit SSL encryption and are fully compliant with industry security standards.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do you offer customer support?</h3>
              <p className="faq-answer">Yes! We provide email support for all users, with priority support and live chat available for Professional and Enterprise plans.</p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I import existing data?</h3>
              <p className="faq-answer">Yes, you can easily import your existing client and invoice data from Excel, CSV, or other invoicing platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to streamline your billing?</h2>
          <p>Join thousands of businesses already using solidflo</p>
          <button className="btn btn-primary" onClick={handleSignup}>Start Your Free Trial</button>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            No credit card required • Cancel anytime • Free forever plan available
          </p>
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
          <li><a onClick={() => navigate('/about')}>About</a></li>
          <li><a>Careers</a></li>
          <li><a>Press Kit</a></li>
          <li><a onClick={() => navigate('/contact')}>Contact Us</a></li>
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
export default LandingPage;