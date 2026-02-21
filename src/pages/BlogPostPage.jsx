import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Mail,
  MessageCircle,
  ThumbsUp,
  Bookmark,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import logo from "../assets/img/solidflo.png";
import logo1 from "../assets/img/solidflo-logo.png";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import twitter from "../assets/images/twitter.png";
import linkedin from "../assets/images/linkedin.png";

const BlogPostPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Sample blog post data - replace with actual data from API/CMS
  const blogPost = {
    title: "10 Invoicing Best Practices to Get Paid Faster in 2026",
    slug: "invoicing-best-practices-2026",
    excerpt:
      "Learn the proven strategies that help businesses reduce payment delays and improve cash flow.",
    content: `
      <p class="lead">Getting paid on time is crucial for maintaining healthy cash flow in your business. Yet many businesses struggle with late payments and unpaid invoices. In this comprehensive guide, we'll share 10 proven best practices that will help you get paid faster and improve your business finances.</p>

      <h2>1. Create Professional, Detailed Invoices</h2>
      <p>First impressions matter. A professional-looking invoice signals that you're a credible business that takes payments seriously. Include all necessary details:</p>
      <ul>
        <li>Clear invoice number and date</li>
        <li>Detailed description of products or services</li>
        <li>Individual line items with quantities and rates</li>
        <li>Subtotals, taxes, and total amount due</li>
        <li>Your business information and logo</li>
      </ul>

      <h2>2. Send Invoices Immediately</h2>
      <p>Don't wait to send invoices. The faster you invoice, the faster you get paid. With modern invoicing software like SolidFlo, you can automate this process and send invoices within minutes of completing work.</p>
      <p>Studies show that invoices sent within 24 hours of work completion are paid 30% faster than those sent after a week.</p>

      <h2>3. Offer Multiple Payment Options</h2>
      <p>Make it as easy as possible for clients to pay you. The more payment options you offer, the fewer excuses clients have for late payment. Consider accepting:</p>
      <ul>
        <li>Credit and debit cards</li>
        <li>Bank transfers (ACH)</li>
        <li>PayPal and other digital wallets</li>
        <li>Mobile payments</li>
      </ul>

      <h2>4. Set Clear Payment Terms</h2>
      <p>Don't leave payment expectations unclear. Specify your payment terms prominently on every invoice:</p>
      <ul>
        <li>Due date (e.g., "Due upon receipt" or "Net 30")</li>
        <li>Late payment fees or interest charges</li>
        <li>Early payment discounts (if applicable)</li>
        <li>Accepted payment methods</li>
      </ul>

      <h2>5. Automate Payment Reminders</h2>
      <p>Following up on unpaid invoices is time-consuming, but necessary. Automation can handle this for you. Set up automatic reminders that go out:</p>
      <ul>
        <li>3 days before the due date</li>
        <li>On the due date</li>
        <li>3, 7, and 14 days after the due date</li>
      </ul>
      <p>Automated reminders are sent consistently and help you maintain professional relationships while ensuring timely payments.</p>

      <h2>6. Require Deposits for Large Projects</h2>
      <p>For substantial projects, request a deposit upfront (typically 25-50%). This accomplishes several goals:</p>
      <ul>
        <li>Ensures client commitment</li>
        <li>Covers initial expenses</li>
        <li>Reduces your financial risk</li>
        <li>Provides working capital</li>
      </ul>

      <h2>7. Offer Incentives for Early Payment</h2>
      <p>Consider offering a small discount (2-5%) for payments made within 10 days. While this reduces your profit slightly, it can significantly improve cash flow and reduce the administrative burden of chasing late payments.</p>

      <h2>8. Use Recurring Billing for Regular Services</h2>
      <p>If you provide ongoing services, set up recurring billing. This automates the payment process and ensures predictable income. Your clients benefit from the convenience, and you benefit from reliable cash flow.</p>

      <h2>9. Follow Up Promptly on Late Payments</h2>
      <p>Don't let late invoices sit. Contact clients as soon as a payment is overdue. Often, late payments are due to oversight rather than inability to pay. A friendly reminder can resolve the issue quickly.</p>
      <p>When following up:</p>
      <ul>
        <li>Start with a polite, professional email</li>
        <li>Escalate to a phone call if needed</li>
        <li>Offer payment plans if financial hardship is the issue</li>
        <li>Know when to involve collections or legal action</li>
      </ul>

      <h2>10. Track and Analyze Your Invoicing Data</h2>
      <p>Use invoicing software to track key metrics:</p>
      <ul>
        <li>Average time to payment</li>
        <li>Which clients pay on time vs. late</li>
        <li>Most effective payment methods</li>
        <li>Success rate of payment reminders</li>
      </ul>
      <p>This data helps you identify patterns and optimize your invoicing process over time.</p>

      <h2>Conclusion</h2>
      <p>Implementing these invoicing best practices will help you get paid faster, improve your cash flow, and spend less time chasing payments. Modern invoicing software like SolidFlo can automate many of these processes, making it easier than ever to maintain healthy business finances.</p>
      <p>Remember, the key to getting paid faster is to make the payment process as simple and convenient as possible for your clients while maintaining clear, professional communication about payment expectations.</p>
    `,
    featuredImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop",
    author: {
      name: "Sarah Johnson",
      role: "Financial Expert",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      bio: "Sarah is a certified financial advisor with over 10 years of experience helping small businesses optimize their invoicing and payment processes.",
    },
    publishDate: "2026-02-10",
    readTime: "8 min read",
    category: "Best Practices",
    tags: ["Invoicing", "Cash Flow", "Business Tips", "Finance"],
    likes: 234,
    comments: 18,
  };

  // Related posts
  const relatedPosts = [
    {
      title: "How to Handle Late-Paying Clients Professionally",
      excerpt:
        "Learn diplomatic strategies for dealing with clients who consistently pay late.",
      image:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop",
      slug: "handle-late-paying-clients",
      readTime: "6 min read",
      category: "Client Management",
    },
    {
      title: "Understanding Net 30, Net 60: Payment Terms Explained",
      excerpt:
        "A comprehensive guide to common payment terms and when to use them.",
      image:
        "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=300&fit=crop",
      slug: "payment-terms-explained",
      readTime: "5 min read",
      category: "Finance",
    },
    {
      title: "Automating Your Invoicing: A Step-by-Step Guide",
      excerpt:
        "Save time and reduce errors by automating your invoicing workflow.",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      slug: "automate-invoicing-guide",
      readTime: "7 min read",
      category: "Automation",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(progress, 100));
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

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = blogPost.title;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      copy: () => {
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      },
    };

    if (platform === "copy") {
      shareUrls.copy();
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <>
      <Helmet>
        <title>{blogPost.title} - SolidFlo Blog</title>
        <meta name="description" content={blogPost.excerpt} />
        <meta property="og:title" content={blogPost.title} />
        <meta property="og:description" content={blogPost.excerpt} />
        <meta property="og:image" content={blogPost.featuredImage} />
        <meta name="twitter:card" content="summary_large_image" />
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

          .reading-progress {
            position: fixed;
            top: 80px;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(0, 0, 0, 0.05);
            z-index: 100;
          }

          .reading-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff9d00, #e68a00);
            transition: width 0.1s ease;
          }

          .blog-content {
            font-size: 1.125rem;
            line-height: 1.8;
            color: #374151;
          }

          .blog-content .lead {
            font-size: 1.25rem;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 2rem;
            line-height: 1.8;
          }

          .blog-content h2 {
            font-size: 1.875rem;
            font-weight: 700;
            color: #111827;
            margin-top: 3rem;
            margin-bottom: 1rem;
            line-height: 1.3;
          }

          .blog-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
          }

          .blog-content p {
            margin-bottom: 1.5rem;
          }

          .blog-content ul,
          .blog-content ol {
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
          }

          .blog-content li {
            margin-bottom: 0.5rem;
          }

          .blog-content a {
            color: #ff9d00;
            text-decoration: underline;
          }

          .blog-content a:hover {
            color: #e68a00;
          }

          .blog-content blockquote {
            border-left: 4px solid #ff9d00;
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
            color: #4b5563;
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2rem !important;
            }

            .blog-content {
              font-size: 1rem;
            }

            .blog-content h2 {
              font-size: 1.5rem;
            }
          }
        `}</style>

        {/* Reading Progress Bar */}
        <div className="reading-progress">
          <div
            className="reading-progress-bar"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

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
              <button
                onClick={() => {
                  closeMobileMenu();
                  navigate("/blog");
                }}
                className="block text-lg font-medium text-gray-700 hover:text-orange-500 transition-colors"
              >
                All Posts
              </button>

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
                <button
                  onClick={() => navigate("/blog")}
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  All Posts
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
        <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 animate-fade-in">
              <button
                onClick={() => navigate("/")}
                className="hover:text-orange-500 transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <button
                onClick={() => navigate("/blog")}
                className="hover:text-orange-500 transition-colors"
              >
                Blog
              </button>
              <span>/</span>
              <span className="text-orange-500">{blogPost.category}</span>
            </div>

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6 animate-slide-up">
              <Tag className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-600">
                {blogPost.category}
              </span>
            </div>

            {/* Title */}
            <h1
              className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              {blogPost.title}
            </h1>

            {/* Meta Info */}
            <div
              className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>{formatDate(blogPost.publishDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>{blogPost.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-orange-500" />
                <span>{blogPost.likes} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <span>{blogPost.comments} comments</span>
              </div>
            </div>

            {/* Featured Image */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl mb-12 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <img
                src={blogPost.featuredImage}
                alt={blogPost.title}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Sidebar - Social Share (Desktop) */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="sticky top-32 space-y-4">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isLiked
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                    title="Like this post"
                  >
                    <ThumbsUp className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isBookmarked
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-orange-100"
                    }`}
                    title="Bookmark this post"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-12 h-12 bg-gray-100 text-gray-600 hover:bg-orange-100 rounded-full flex items-center justify-center transition-all"
                      title="Share this post"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>

                    {showShareMenu && (
                      <div className="absolute left-16 top-0 bg-white rounded-lg shadow-xl p-2 space-y-2 z-10">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors w-full"
                        >
                          <Facebook className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors w-full"
                        >
                          <Twitter className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors w-full"
                        >
                          <Linkedin className="w-4 h-4 text-blue-700" />
                          <span className="text-sm">LinkedIn</span>
                        </button>
                        <button
                          onClick={() => handleShare("copy")}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors w-full"
                        >
                          <LinkIcon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="lg:col-span-8">
                <article className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                  <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blogPost.content }}
                  />

                  {/* Tags */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Tagged In
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {blogPost.tags.map((tag, index) => (
                        <button
                          key={index}
                          className="px-4 py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-600 rounded-full text-sm font-medium transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Social Actions */}
                  <div className="lg:hidden mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                          isLiked
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>{isLiked ? "Liked" : "Like"}</span>
                      </button>

                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                          isBookmarked
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                        }`}
                      >
                        <Bookmark className="w-5 h-5" />
                        <span>{isBookmarked ? "Saved" : "Save"}</span>
                      </button>

                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 hover:bg-orange-100 rounded-lg font-semibold transition-all"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </article>

                {/* Author Bio */}
                <div className="mt-12 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 border border-orange-200">
                  <div className="flex items-start gap-6">
                    <img
                      src={blogPost.author.avatar}
                      alt={blogPost.author.name}
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {blogPost.author.name}
                      </h3>
                      <p className="text-orange-600 font-semibold mb-3">
                        {blogPost.author.role}
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        {blogPost.author.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Related Posts (Desktop) */}
              <div className="lg:col-span-3">
                <div className="sticky top-32">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Related Posts
                  </h3>
                  <div className="space-y-6">
                    {relatedPosts.map((post, index) => (
                      <div
                        key={index}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      >
                        <div className="relative rounded-lg overflow-hidden mb-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Posts Section (Mobile) */}
        <section className="lg:hidden py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Related Posts
            </h3>
            <div className="grid gap-6">
              {relatedPosts.map((post, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover-lift cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="relative h-48">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Mail className="w-12 h-12 text-white mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Stay Updated with Our Newsletter
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Get the latest invoicing tips, business insights, and SolidFlo
              updates delivered to your inbox.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all">
                  Subscribe
                </button>
              </div>
              <p className="mt-4 text-white/70 text-sm">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Ready to Improve Your Invoicing?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Join 10,000+ businesses using SolidFlo to get paid faster.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="mt-6 text-gray-500 text-sm">
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

export default BlogPostPage;
