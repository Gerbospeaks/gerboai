import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Users, 
  Heart, 
  Award, 
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Lightbulb,
  Rocket
} from 'lucide-react';
import logo from '../assets/img/solidflo.png';
import logo1 from '../assets/img/solidflo-logo.png';
import instagram from '../assets/images/instagram.png';
import facebook from '../assets/images/facebook.png';
import twitter from '../assets/images/twitter.png';
import linkedin from '../assets/images/linkedin.png';

const AboutPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/register');

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description: "Every decision we make starts with how it impacts our customers. Their success is our success.",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation",
      description: "We constantly push boundaries to create solutions that make invoicing simpler and more efficient.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Security",
      description: "We protect your data like it's our own, with bank-level encryption and rigorous security practices.",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaboration",
      description: "Great products are built by great teams. We believe in open communication and mutual respect.",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Speed & Efficiency",
      description: "Time is money. We're obsessed with making your workflow faster and more productive.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Impact",
      description: "We're building a platform that empowers businesses worldwide to grow and succeed.",
      color: "from-green-400 to-emerald-500"
    }
  ];

  const team = [
    {
      name: "Gabriel Moyo",
      role: "CEO & Founder",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
      bio: "Former fintech executive with 15+ years building payment solutions."
    },
    {
      name: "Thomas Dube",
      role: "CTO",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
      bio: "Tech visionary who scaled systems serving millions of users."
    },
    {
      name: "Gracious Ncube",
      role: "Head of Product",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gracious",
      bio: "Product designer passionate about creating intuitive user experiences."
    },
    {
      name: "Sarah Johnson",
      role: "VP of Engineering",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "Infrastructure expert building secure, scalable platforms."
    },
    {
      name: "Michael Chen",
      role: "Head of Customer Success",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      bio: "Customer advocate ensuring every user achieves their goals."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Marketing",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      bio: "Growth strategist helping businesses discover SolidFlo."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Founded with a mission to simplify invoicing for small businesses",
      icon: <Rocket className="w-6 h-6" />
    },
    {
      year: "2021",
      title: "First 1,000 Users",
      description: "Reached our first thousand happy customers across 15 countries",
      icon: <Users className="w-6 h-6" />
    },
    {
      year: "2022",
      title: "Series A Funding",
      description: "Raised $10M to accelerate product development and global expansion",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      year: "2023",
      title: "10K+ Businesses",
      description: "Surpassed 10,000 active businesses processing millions in invoices",
      icon: <Award className="w-6 h-6" />
    },
    {
      year: "2024",
      title: "Global Recognition",
      description: "Named 'Best Invoicing Software' by leading industry publications",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      year: "2025",
      title: "The Future",
      description: "Expanding AI capabilities and launching new features to serve you better",
      icon: <Target className="w-6 h-6" />
    }
  ];

  const stats = [
    { value: "10,000+", label: "Happy Customers" },
    { value: "50+", label: "Countries Served" },
    { value: "$5M+", label: "Processed Monthly" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          html {
            scroll-behavior: smooth;
          }

          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #ff9d00, #e68a00);
            border-radius: 10px;
          }

          .gradient-text {
            background: linear-gradient(135deg, #fb470b 0%, #000000 100%);
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

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-slide-up {
            animation: slideInUp 0.6s ease-out forwards;
          }

          .animate-slide-left {
            animation: slideInLeft 0.6s ease-out forwards;
          }

          .animate-slide-right {
            animation: slideInRight 0.6s ease-out forwards;
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }

          .animate-scale-in {
            animation: scaleIn 0.5s ease-out forwards;
          }

          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          .dot-pattern {
            background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
            background-size: 20px 20px;
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
              <a href="/" onClick={closeMobileMenu} className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Home
              </a>
              <a href="/#features" onClick={closeMobileMenu} className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Features
              </a>
              <a href="/#pricing" onClick={closeMobileMenu} className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Pricing
              </a>
              <a href="/about" onClick={closeMobileMenu} className="block text-lg font-medium text-orange-500 transition-colors">
                About
              </a>
              
              <div className="pt-6 space-y-3">
                <button 
                  onClick={() => { closeMobileMenu(); handleLogin(); }}
                  className="w-full py-3 px-6 border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all"
                >
                  Login
                </button>
                <button 
                  onClick={() => { closeMobileMenu(); handleSignup(); }}
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
              <div className="flex items-center">
                <img src={logo} alt="SolidFlo" className="h-16 w-auto cursor-pointer" onClick={() => navigate('/')} />
              </div>

              <nav className="hidden lg:flex items-center space-x-8">
                <a href="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Home
                </a>
                <a href="/#features" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Features
                </a>
                <a href="/#pricing" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Pricing
                </a>
                <a href="/about" className="text-orange-500 font-medium transition-colors">
                  About
                </a>
              </nav>

              <div className="hidden lg:flex items-center space-x-4">
                <button 
                  onClick={handleLogin}
                  className="px-6 py-2.5 text-gray-700 font-semibold hover:text-orange-500 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={handleSignup}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

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
        <section className="relative min-h-[60vh] pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 via-white to-blue-50">
          <div className="absolute inset-0 dot-pattern opacity-50" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-8 animate-slide-up">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">About SolidFlo</span>
              </div>
              
              <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                Building the Future of{' '}
                <span className="gradient-text">Invoicing</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                We're on a mission to empower businesses worldwide with simple, powerful invoicing tools that help them get paid faster and grow bigger.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center"
                >
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div
                id="story-text"
                data-animate
                className={isVisible['story-text'] ? 'animate-slide-right' : 'opacity-0'}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  Our <span className="gradient-text">Story</span>
                </h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    SolidFlo was born from a simple frustration: invoicing shouldn't be complicated. As business owners ourselves, we spent countless hours wrestling with clunky software, chasing down payments, and managing spreadsheets.
                  </p>
                  <p>
                    In 2020, we decided to build the solution we wished existed—an invoicing platform that's as simple as sending an email, yet powerful enough to scale with your business.
                  </p>
                  <p>
                    Today, we're proud to serve over 10,000 businesses in 50+ countries, processing millions of dollars in invoices every month. But we're just getting started.
                  </p>
                  <p className="font-semibold text-gray-900">
                    Our mission is to make invoicing so simple that you can focus on what really matters: growing your business.
                  </p>
                </div>
              </div>

              <div
                id="story-image"
                data-animate
                className={`relative ${isVisible['story-image'] ? 'animate-slide-left' : 'opacity-0'}`}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                    alt="Team collaboration"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500 rounded-full filter blur-2xl opacity-40" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500 rounded-full filter blur-2xl opacity-40" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Our <span className="gradient-text">Values</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  id={`value-${index}`}
                  data-animate
                  className={`p-8 bg-white rounded-2xl shadow-lg hover-lift border border-gray-100 ${
                    isVisible[`value-${index}`] ? 'animate-slide-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${value.color} mb-6 text-white`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Our Journey
              </h2>
              <p className="text-xl text-gray-400">
                Milestones that shaped SolidFlo
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-blue-500" />

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    id={`milestone-${index}`}
                    data-animate
                    className={`relative pl-20 ${
                      isVisible[`milestone-${index}`] ? 'animate-slide-right' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-0 w-5 h-5 bg-orange-500 rounded-full border-4 border-gray-900" />
                    
                    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-orange-500/20 rounded-lg text-orange-400">
                          {milestone.icon}
                        </div>
                        <span className="text-2xl font-bold text-orange-400">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Meet Our <span className="gradient-text">Team</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The talented people behind SolidFlo
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  id={`team-${index}`}
                  data-animate
                  className={`group p-8 bg-white rounded-2xl shadow-lg hover-lift border border-gray-100 text-center ${
                    isVisible[`team-${index}`] ? 'animate-scale-in' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative inline-block mb-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto border-4 border-orange-100 group-hover:border-orange-500 transition-colors"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Join Us on Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Be part of the invoicing revolution. Start your free trial today and see why 10,000+ businesses trust SolidFlo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleSignup}
                className="px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/#pricing')}
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all"
              >
                View Pricing
              </button>
            </div>

            <p className="mt-8 text-white/80 text-sm">
              ✓ No credit card required  ✓ 30-day free trial  ✓ Cancel anytime
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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

              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">Company</h3>
                <ul className="space-y-3">
                  {['About', 'Careers', 'Press Kit', 'Contact', 'Partners'].map((item) => (
                    <li key={item}>
                      <a href={item === 'About' ? '/about' : '#'} className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-400">Resources</h3>
                <ul className="space-y-3">
                  {['Help Center', 'Blog', 'Tutorials', 'Community', 'Privacy', 'Terms'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} SolidFlo. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AboutPage;