import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboards } from '../config/dashboardConfig';
import logon from '../assets/img/register.png';
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

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyLogo, setCompanyLogo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword || !selectedDashboard) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Starting registration...');
      console.log('Company Logo:', companyLogo);
      
      // Prepare company info object
      const companyInfo = {
        companyName,
        companyAddress,
        companyLogo // This is the file object
      };
      
      console.log('Company Info:', companyInfo);
      
      // Pass company info to register function
      const result = await register(name, email, password, selectedDashboard, companyInfo);
      
      console.log('Registration result:', result);
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Registration error in component:', error);
      setError('An unexpected error occurred: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 overflow-y-auto">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Please enter your details to get started</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
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
                placeholder="Enter password (min. 6 characters)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Your Industry
              </label>
              <select
                value={selectedDashboard}
                onChange={(e) => setSelectedDashboard(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">-- Choose an Industry --</option>
                {dashboards.map((dashboard) => (
                  <option key={dashboard.id} value={dashboard.id}>
                    {dashboard.icon} {dashboard.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Company Fields - Commented out as in original */}
            {/* <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Company Address</label>
              <textarea
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompanyLogo(e.target.files[0])}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div> */}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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

          {/* Login Link */}
          <p className="text-gray-600 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
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

export default Register;