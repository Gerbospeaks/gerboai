import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { forgotpassword } from './ForgotPassword'
import logon from '../assets/img/reg2.png';
import logo from '../assets/img/solidflo.png';
import slide1 from '../assets/img/slide1.avif';
import slide2 from '../assets/img/slide2.avif';
import slide3 from '../assets/img/slide3.jpg';

// Add your slide images here
const slides = [
  {
    image: slide1,
    title: "Seamless work experience",
    description: "Everything you need in an easily customizable dashboard"
  },
  {
    image: slide2,
    title: "Boost your productivity",
    description: "Streamline your workflow with powerful tools"
  },
  {
    image: slide3,
    title: "Collaborate effortlessly",
    description: "Work together with your team in real-time"
  }
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Check if user is admin and redirect accordingly
      if (result.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="mb-8">
            <img
              src={logo}
              alt="Business Logo"
              className="w-16 h-12 object-contain"
            />
          </div>

          {/* Welcome Text */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-500 mb-8">Please enter your details</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
                disabled={isSubmitting}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
              {!isSubmitting && (
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </button>
          </form>

          {/* Terms and Privacy */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </Link>
          </p>

          {/* Sign Up Link */}
          <p className="text-gray-600 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      
{/* Right Side - Illustration with Carousel */}
<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-600 via-blue-600 to-gray-700 items-center justify-center p-12">
  <div className="max-w-lg w-full">
    {/* Illustration Card */}
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-12 text-center">
      {/* Slides Container with Pagination */}
      <div className="relative w-full">
        {/* Slides */}
        <div className="relative w-full" style={{ minHeight: '450px' }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 relative'
                  : 'opacity-0 absolute top-0 left-0 right-0 pointer-events-none'
              }`}
            >
              {/* Image */}
              <div className="mb-8 w-full flex items-center justify-center" style={{ height: '280px' }}>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              
              {/* Title */}
              <h3 className="text-3xl font-bold text-white mb-4">
                {slide.title}
              </h3>
              
              {/* Description */}
              <p className="text-purple-100 text-lg">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white bg-opacity-40 hover:bg-opacity-60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  );
}

export default Login;