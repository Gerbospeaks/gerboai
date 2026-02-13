import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path to your firebase config
import logo from '../assets/img/solidflo.png';
import slide1 from '../assets/img/slide1.avif';
import slide2 from '../assets/img/slide2.avif';
import slide3 from '../assets/img/slide3.jpg';

const slides = [
  {
    image: slide1,
    title: "Forgot your password?",
    description: "Don't worry, we'll help you get back in"
  },
  {
    image: slide2,
    title: "Quick recovery",
    description: "Reset your password in just a few clicks"
  },
  {
    image: slide3,
    title: "Secure process",
    description: "Your account security is our priority"
  }
];

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Configure action code settings (optional - customize the redirect URL)
      const actionCodeSettings = {
        // URL you want to redirect back to after password reset
        // Make sure this URL is whitelisted in Firebase Console
        url: window.location.origin + 'https://solidflo.co.za/login',
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      setSuccess(`Password reset email sent! Please check your inbox at ${email}. If you don't see it, check your spam folder.`);
      setEmail(''); // Clear the email field
    } catch (err) {
      console.error('Error sending password reset email:', err);
      
      // Handle specific error codes
      if (err.code === 'auth/user-not-found') {
        // For security reasons, don't reveal if email exists or not
        setSuccess(`If an account exists with ${email}, a password reset email has been sent.`);
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
// In your forgot password function


async function resetPassword(email) {
  try {
    const resetSettings = {
      url: 'https://solidflo.co.za/reset-password',
      handleCodeInApp: true
    };
    
    await sendPasswordResetEmail(auth, email, resetSettings);
    
    console.log('Password reset email sent!');
  } catch (error) {
    console.error(error);
  }
}
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Forgot Password Form */}
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

          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
          <p className="text-gray-500 mb-8">
            Enter your email address and we'll send you a link to reset your password
          </p>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Form */}
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
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              {!isSubmitting && (
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>

          {/* Back to Login */}
          <p className="text-gray-600 text-center mt-6">
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration with Carousel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-600 via-blue-600 to-gray-700 items-center justify-center p-12">
        <div className="max-w-lg w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-12 text-center">
            <div className="relative w-full">
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
                    <div className="mb-8 w-full flex items-center justify-center" style={{ height: '280px' }}>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {slide.title}
                    </h3>
                    
                    <p className="text-purple-100 text-lg">
                      {slide.description}
                    </p>
                  </div>
                ))}
              </div>

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

export default ForgotPassword;