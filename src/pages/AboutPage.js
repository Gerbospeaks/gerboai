import React, { useState } from 'react';
import logo from '../assets/img/solidflo-logo.png';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import about from './AboutPage';  
import terms from './TermsPage';
import contact from './ContactPage';
import blogs from './BlogPostPage';
import privacy from './PrivacyPolicy';
const AboutPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
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

        /* About Hero */
        .about-hero {
          background: linear-gradient(135deg, #2f3444 0%, #2f3444 100%);
          color: #fff;
          padding: 6rem 2rem 4rem;
          display: flex;
          align-items: flex-end;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 400px;
          height: 100vh;
        }

        .about-hero::before {
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

        .shape:nth-child(5) {
          top: 50%;
          left: 50%;
          animation-delay: 3s;
          animation-duration: 25s;
        }

        .shape:nth-child(6) {
          top: 20%;
          left: 40%;
          animation-delay: 5s;
          animation-duration: 21s;
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

        .invoice-icon {
          font-size: 4rem;
          color: #ff9d00;
        }

        .chart-icon {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255, 157, 0, 0.3), rgba(255, 157, 0, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dollar-sign {
          font-size: 5rem;
          color: #ff9d00;
          font-weight: bold;
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #ff9d00;
          border-radius: 50%;
          opacity: 0;
          animation: particleFloat 8s infinite ease-in-out;
        }

        .particle:nth-child(1) {
          left: 15%;
          animation-delay: 0s;
          animation-duration: 10s;
        }

        .particle:nth-child(2) {
          left: 35%;
          animation-delay: 2s;
          animation-duration: 12s;
        }

        .particle:nth-child(3) {
          left: 55%;
          animation-delay: 4s;
          animation-duration: 9s;
        }

        .particle:nth-child(4) {
          left: 75%;
          animation-delay: 1s;
          animation-duration: 11s;
        }

        .particle:nth-child(5) {
          left: 85%;
          animation-delay: 3s;
          animation-duration: 13s;
        }

        .particle:nth-child(6) {
          left: 25%;
          animation-delay: 5s;
          animation-duration: 10s;
        }

        .particle:nth-child(7) {
          left: 65%;
          animation-delay: 2.5s;
          animation-duration: 11.5s;
        }

        .particle:nth-child(8) {
          left: 45%;
          animation-delay: 4.5s;
          animation-duration: 9.5s;
        }

        @keyframes particleFloat {
          0% {
            bottom: 0;
            opacity: 0;
            transform: translateX(0);
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            bottom: 100%;
            opacity: 0;
            transform: translateX(50px);
          }
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 2;
          text-align: left;
          animation: fadeInUp 1s ease-out;
          padding-bottom: 40px
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

        .about-hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .about-hero .highlight {
          color: #ff9d00;
        }

        .about-hero p {
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

        .section-title {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
          text-align: center;
        }

        .section-subtitle {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 3rem;
          color: #666;
          font-size: 1.1rem;
          line-height: 1.8;
        }

        /* Mission Section */
        .mission-box {
          background: linear-gradient(135deg, #ff9d00 0%, #e68a00 100%);
          padding: 4rem;
          border-radius: 20px;
          color: #fff;
          text-align: center;
          box-shadow: 0 10px 30px rgba(255, 157, 0, 0.3);
        }

        .mission-box h2 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
        }

        .mission-box p {
          font-size: 1.2rem;
          line-height: 1.8;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Story Section */
        .story-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-text h2 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .story-text p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-size: 1.05rem;
        }

        .story-image {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        /* Values Grid */
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .value-card {
          background: #fff;
          padding: 2.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .value-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .value-icon {
          font-size: 3.5rem;
          margin-bottom: 1.5rem;
        }

        .value-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .value-card p {
          color: #666;
          line-height: 1.8;
        }

        /* Team Section */
        .team-intro {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 4rem;
        }

        .team-intro h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .team-intro p {
          color: #666;
          font-size: 1.1rem;
          line-height: 1.8;
        }

        .team-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-top: 4rem;
        }

        .stat-box {
          background: #2f3444;
          padding: 2.5rem;
          border-radius: 15px;
          text-align: center;
          color: #fff;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: #ff9d00;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        /* Impact Section */
        .impact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3rem;
        }

        .impact-card {
          background: #fff;
          padding: 2.5rem;
          border-radius: 15px;
          border-left: 5px solid #ff9d00;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .impact-card h3 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .impact-card p {
          color: #666;
          line-height: 1.8;
          font-size: 1.05rem;
        }

        /* CTA Section */
        .cta-section {
          background: #fff;
          padding: 5rem 2rem;
          text-align: center;
        }

        .cta-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .cta-section p {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }

        .btn {
          display: inline-block;
          padding: 1rem 2.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          font-size: 1.1rem;
        }

        .btn-primary {
          background: #ff9d00;
          color: #fff;
        }

        .btn-primary:hover {
          background: #e68a00;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 157, 0, 0.4);
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

          .about-hero h1 {
            font-size: 2rem;
          }

          .about-hero p {
            font-size: 1.1rem;
          }

          .story-content {
            grid-template-columns: 1fr;
          }

          .story-image {
            height: 300px;
          }

          .impact-grid {
            grid-template-columns: 1fr;
          }

          .mission-box {
            padding: 2.5rem 1.5rem;
          }

          .mission-box h2 {
            font-size: 2rem;
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
            <li><a href="/login" className="btn-login">Login</a></li>
            <li><a href="/register" className="btn-signup">Sign Up Free</a></li>
          </ul>
        </div>
      </header>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="floating-shapes">
          <div className="shape">
            <div className="invoice-icon">📄</div>
          </div>
          <div className="shape">
            <div className="dollar-sign">$</div>
          </div>
          <div className="shape">
            <div className="chart-icon">📊</div>
          </div>
          <div className="shape">
            <div className="invoice-icon">💳</div>
          </div>
          <div className="shape">
            <div className="chart-icon">📈</div>
          </div>
          <div className="shape">
            <div className="invoice-icon">💰</div>
          </div>
        </div>
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="hero-content-wrapper">
          <h1>About <span className="highlight">Solidflo</span></h1>
          <p>Empowering small businesses with free, simple, and powerful invoicing tools</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container">
          <div className="mission-box">
            <h2>Our Mission</h2>
            <p>
              At Solidflo, we believe every small business deserves access to professional invoicing tools without breaking the bank. 
              We're on a mission to simplify financial management for entrepreneurs, freelancers, and small business owners, 
              helping them focus on what they do best—growing their business and serving their customers with excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Solidflo was born from a simple observation: small business owners were spending too much time on paperwork 
                and not enough time serving their clients. Expensive accounting software was overkill for basic invoicing needs, 
                and free alternatives were either too limited or too complicated.
              </p>
              <p>
                We set out to create something different—a completely free invoicing platform that's powerful enough for 
                growing businesses yet simple enough to start using in minutes. No credit card required, no hidden fees, 
                just straightforward tools to help you get paid.
              </p>
              <p>
                Today, thousands of small businesses trust Solidflo to manage their invoicing, track their time, and accept 
                payments. We're proud to support entrepreneurs around the world as they build their dreams.
              </p>
            </div>
            <div className="story-image">
              📊
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">
            These core principles guide everything we do at Solidflo
          </p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💙</div>
              <h3>Small Business First</h3>
              <p>
                We built Solidflo specifically for small businesses and freelancers. Every feature is designed with your 
                unique needs in mind, not enterprise complexity.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⚡</div>
              <h3>Simplicity is Power</h3>
              <p>
                Great software shouldn't require a manual. We believe in intuitive design that gets out of your way 
                and lets you focus on running your business.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Built to Scale</h3>
              <p>
                Start simple and grow with confidence. Our tools scale seamlessly as your business expands, 
                without forcing you into expensive upgrades.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Trust & Security</h3>
              <p>
                Your financial data deserves the highest protection. We use bank-level encryption and security 
                practices to keep your information safe.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Customer Success</h3>
              <p>
                Your success is our success. We're committed to providing exceptional support and continuously 
                improving based on your feedback.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Accessible to All</h3>
              <p>
                Professional invoicing shouldn't be a luxury. Our free tier ensures every business, 
                regardless of size, can present themselves professionally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section section-gray">
        <div className="container">
          <div className="team-intro">
            <h2>Built by a Team That Cares</h2>
            <p>
              We're a passionate team of designers, developers, and entrepreneurs who understand the challenges 
              small businesses face. We've been in your shoes, and we're dedicated to making your life easier.
            </p>
          </div>
          <div className="team-stats">
            <div className="stat-box">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">2,000+</div>
              <div className="stat-label">Invoices Sent</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">$50K+</div>
              <div className="stat-label">Processed</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Making an Impact</h2>
          <p className="section-subtitle">
            Here's how we're helping small businesses thrive
          </p>
          <div className="impact-grid">
            <div className="impact-card">
              <h3>🎯 Faster Payments</h3>
              <p>
                Our users report getting paid 2x faster thanks to professional invoices, payment reminders, 
                and integrated online payment processing.
              </p>
            </div>
            <div className="impact-card">
              <h3>⏰ Time Savings</h3>
              <p>
                Small businesses save an average of 5 hours per week on billing and administrative tasks, 
                giving them more time to focus on growth.
              </p>
            </div>
            <div className="impact-card">
              <h3>💰 Better Cash Flow</h3>
              <p>
                With recurring billing and automated reminders, businesses maintain healthier cash flow 
                and reduce late payments significantly.
              </p>
            </div>
            <div className="impact-card">
              <h3>📈 Professional Growth</h3>
              <p>
                By presenting a professional image through polished invoices and efficient processes, 
                businesses win more clients and build stronger relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Join the Solidflo Community</h2>
          <p>
            Start invoicing like a pro today—no credit card required
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/register'}>
            Get Started Free
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999' }}>
            Free forever • No credit card required • Start in minutes
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
              <li><a onClick={() => navigate('/about')}>About Us</a></li>
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

export default AboutPage;