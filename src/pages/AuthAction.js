// src/pages/AuthAction.js
//
// Single page that handles all Firebase email action flows:
//   • No mode / default  → Forgot Password (send reset link)
//   • mode=resetPassword → Reset Password (set new password)
//   • mode=verifyEmail   → Verify Email (auto-applies code)
//   • mode=recoverEmail  → Recover Email (auto-applies code)
//
// Set your Firebase "Action URL" to: https://solidflo.co.za/auth-action
// Firebase will append ?mode=...&oobCode=... automatically.

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/img/solidflo.png';
import slide1 from '../assets/img/slide1.avif';
import slide2 from '../assets/img/slide2.avif';
import slide3 from '../assets/img/slide3.jpg';

// ---------------------------------------------------------------------------
// Carousel config per mode
// ---------------------------------------------------------------------------
const SLIDES = {
  default: [
    { image: slide1, title: 'Reset your password', description: "We'll send you a link to reset your password" },
    { image: slide2, title: 'Secure process',       description: 'Your security is our top priority' },
    { image: slide3, title: 'Quick recovery',       description: 'Get back to work in minutes' },
  ],
  resetPassword: [
    { image: slide1, title: 'Secure your account', description: 'Create a strong password to protect your data' },
    { image: slide2, title: 'Easy password reset',  description: 'Get back to work in just a few simple steps' },
    { image: slide3, title: "We've got you covered", description: 'Your security is our top priority' },
  ],
  verifyEmail: [
    { image: slide1, title: 'Almost there!',        description: 'Confirming your email address…' },
    { image: slide2, title: 'Stay secure',          description: 'Verified accounts keep your data safe' },
    { image: slide3, title: 'Welcome to SolidFlo',  description: 'Your business, beautifully managed' },
  ],
  recoverEmail: [
    { image: slide1, title: 'Recovering your email', description: 'We are reverting your email change…' },
    { image: slide2, title: 'Account protection',    description: "We noticed a change you didn't make" },
    { image: slide3, title: 'All sorted',            description: 'Your original email will be restored' },
  ],
};

// ---------------------------------------------------------------------------
// Small shared UI helpers
// ---------------------------------------------------------------------------
const SuccessBox = ({ children }) => (
  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <div>{children}</div>
  </div>
);

const ErrorBox = ({ children }) => (
  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
    {children}
  </div>
);

const Spinner = ({ label = 'Loading…' }) => (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
    <p className="text-gray-600">{label}</p>
  </div>
);

const StatusIcon = ({ success }) => (
  <div className="flex justify-center mb-6">
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="36" fill={success ? '#10b981' : '#ef4444'} />
      {success
        ? <path d="M25 40 L35 50 L55 30" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M30 30 L50 50 M50 30 L30 50" stroke="white" strokeWidth="4" strokeLinecap="round" />}
    </svg>
  </div>
);

// ---------------------------------------------------------------------------
// Carousel (shared right-panel)
// ---------------------------------------------------------------------------
function Carousel({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-600 via-blue-600 to-gray-700 items-center justify-center p-12">
      <div className="max-w-lg w-full">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-12 text-center">
          <div className="relative w-full" style={{ minHeight: '450px' }}>
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ease-in-out ${
                  i === current ? 'opacity-100 relative' : 'opacity-0 absolute top-0 left-0 right-0 pointer-events-none'
                }`}
              >
                <div className="mb-8 w-full flex items-center justify-center" style={{ height: '280px' }}>
                  <img src={slide.image} alt={slide.title} className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{slide.title}</h3>
                <p className="text-purple-100 text-lg">{slide.description}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white bg-opacity-40 hover:bg-opacity-60'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View 1 – Forgot Password (no oobCode)
// ---------------------------------------------------------------------------
function ForgotPasswordView() {
  const [email, setEmail]           = useState('');
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const { resetPassword }           = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.');

    setSubmitting(true);
    const result = await resetPassword(email);
    setSubmitting(false);

    if (result.success) { setMessage(result.message); setEmail(''); }
    else setError(result.message);
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
      <p className="text-gray-500 mb-8">No worries! Enter your email and we'll send you reset instructions.</p>

      {error   && <ErrorBox>{error}</ErrorBox>}
      {message && (
        <SuccessBox>
          <p className="font-medium">{message}</p>
          <p className="text-sm mt-1">Please check your inbox and spam folder. The link expires in 1 hour.</p>
        </SuccessBox>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email" disabled={isSubmitting}
          />
        </div>
        <button
          type="submit" disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Sending…</>
          ) : (
            <>Send Reset Link <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to Login
        </Link>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// View 2 – Reset Password (mode=resetPassword)
// ---------------------------------------------------------------------------
function ResetPasswordView({ oobCode }) {
  const navigate                     = useNavigate();
  const [password, setPassword]      = useState('');
  const [confirm, setConfirm]        = useState('');
  const [error, setError]            = useState('');
  const [success, setSuccess]        = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [isVerifying, setVerifying]  = useState(true);
  const [email, setEmail]            = useState('');
  const [showPwd, setShowPwd]        = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset code. Please request a new password reset link.');
      setVerifying(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then(userEmail => { setEmail(userEmail); setVerifying(false); })
      .catch(err => {
        if (err.code === 'auth/expired-action-code') setError('This password reset link has expired. Please request a new one.');
        else if (err.code === 'auth/invalid-action-code') setError('This reset link is invalid or has already been used.');
        else setError('Unable to verify reset link. Please request a new password reset.');
        setVerifying(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!password || !confirm) return setError('Please fill in all fields.');
    if (password.length < 6) return setError('Password must be at least 6 characters long.');
    if (password !== confirm) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess('Password reset successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.code === 'auth/expired-action-code') setError('This reset link has expired. Please request a new one.');
      else if (err.code === 'auth/invalid-action-code') setError('This link is invalid or already used.');
      else if (err.code === 'auth/weak-password') setError('Password is too weak. Please choose a stronger one.');
      else setError('Failed to reset password. Please try again.');
      setSubmitting(false);
    }
  };

  const EyeIcon = ({ visible }) => visible
    ? <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>;

  if (isVerifying) return <Spinner label="Verifying reset link…" />;

  if (error && !email) return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Invalid Link</h2>
      <ErrorBox>{error}</ErrorBox>
      <Link to="/auth-action" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center">
        Request New Reset Link
      </Link>
      <p className="text-gray-600 text-center mt-6">Remember your password? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Back to Login</Link></p>
    </>
  );

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
      <p className="text-gray-500 mb-8">{email && `Enter a new password for ${email}`}</p>

      {success && <SuccessBox><p className="font-medium">{success}</p></SuccessBox>}
      {error   && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { label: 'New Password',      val: password, set: setPassword, show: showPwd,    toggle: () => setShowPwd(p => !p),     hint: 'Must be at least 6 characters long' },
          { label: 'Confirm Password',  val: confirm,  set: setConfirm,  show: showConfirm, toggle: () => setShowConfirm(p => !p), hint: null },
        ].map(({ label, val, set, show, toggle, hint }) => (
          <div key={label}>
            <label className="block text-gray-700 text-sm font-medium mb-2">{label}</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${label.toLowerCase()}`} disabled={isSubmitting || !!success}
              />
              <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><EyeIcon visible={show} /></svg>
              </button>
            </div>
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
          </div>
        ))}

        <button
          type="submit" disabled={isSubmitting || !!success}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? 'Resetting Password…' : success ? 'Success!' : (
            <>Reset Password <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></>
          )}
        </button>
      </form>

      <p className="text-gray-600 text-center mt-6">
        Remember your password? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Back to Login</Link>
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// View 3 – Verify Email (mode=verifyEmail)
// ---------------------------------------------------------------------------
function VerifyEmailView({ oobCode }) {
  const navigate           = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError]  = useState('');

  useEffect(() => {
    if (!oobCode) { setStatus('error'); setError('Invalid verification link.'); return; }
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(err => {
        setStatus('error');
        if (err.code === 'auth/invalid-action-code') setError('This verification link is invalid or has already been used.');
        else if (err.code === 'auth/expired-action-code') setError('This verification link has expired. Please request a new one.');
        else setError('An error occurred during verification. Please try again.');
      });
  }, [oobCode, navigate]);

  if (status === 'loading') return <Spinner label="Verifying your email…" />;

  if (status === 'success') return (
    <div className="text-center">
      <StatusIcon success />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Verified!</h2>
      <p className="text-gray-500 mb-6">Your email has been verified. Welcome to SolidFlo!</p>
      <div className="text-left bg-green-50 border border-green-100 rounded-xl p-4 mb-6 space-y-2">
        {['Create professional invoices', 'Generate quotes for clients', 'Track payments and manage your business'].map(b => (
          <div key={b} className="flex items-center gap-2 text-green-700 text-sm">
            <span className="font-bold">✓</span> {b}
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-sm mb-4">Redirecting to login in 3 seconds…</p>
      <button onClick={() => navigate('/login')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
        Go to Login Now
      </button>
    </div>
  );

  return (
    <div className="text-center">
      <StatusIcon success={false} />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Failed</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <div className="flex gap-3">
        <button onClick={() => navigate('/login')} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
          Back to Login
        </button>
        <button onClick={() => navigate('/register')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
          Create Account
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// View 4 – Recover Email (mode=recoverEmail)
// ---------------------------------------------------------------------------
function RecoverEmailView({ oobCode }) {
  const navigate            = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!oobCode) { setStatus('error'); setError('Invalid recovery link.'); return; }
    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 4000);
      })
      .catch(err => {
        setStatus('error');
        if (err.code === 'auth/invalid-action-code') setError('This recovery link is invalid or has already been used.');
        else if (err.code === 'auth/expired-action-code') setError('This recovery link has expired.');
        else setError('An error occurred during email recovery. Please contact support.');
      });
  }, [oobCode, navigate]);

  if (status === 'loading') return <Spinner label="Recovering your email address…" />;

  if (status === 'success') return (
    <div className="text-center">
      <StatusIcon success />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Recovered!</h2>
      <p className="text-gray-500 mb-6">Your original email address has been restored. If you did not request this change, please reset your password immediately.</p>
      <p className="text-gray-400 text-sm mb-4">Redirecting to login in 4 seconds…</p>
      <button onClick={() => navigate('/login')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">
        Go to Login Now
      </button>
    </div>
  );

  return (
    <div className="text-center">
      <StatusIcon success={false} />
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Recovery Failed</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <button onClick={() => navigate('/login')} className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">
        Back to Login
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------
function AuthAction() {
  const [searchParams] = useSearchParams();
  const mode    = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  // Pick carousel slides for the current mode
  const slides = SLIDES[mode] ?? SLIDES.default;

  // Pick which form/view to render
  const renderContent = () => {
    switch (mode) {
      case 'resetPassword': return <ResetPasswordView oobCode={oobCode} />;
      case 'verifyEmail':   return <VerifyEmailView   oobCode={oobCode} />;
      case 'recoverEmail':  return <RecoverEmailView  oobCode={oobCode} />;
      default:              return <ForgotPasswordView />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – form panel */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <img src={logo} alt="SolidFlo" className="w-16 h-12 object-contain" />
          </div>
          {renderContent()}
          <p className="text-center text-gray-400 text-xs mt-8">
            Need help? <a href="mailto:accounts@solidflo.co.za" className="underline hover:text-gray-600">accounts@solidflo.co.za</a>
          </p>
        </div>
      </div>

      {/* Right – carousel */}
      <Carousel slides={slides} />
    </div>
  );
}

export default AuthAction;