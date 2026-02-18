// src/pages/VerifyEmail.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { applyActionCode } from 'firebase/auth';
import logo from '../assets/img/solidflo-logo.png';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus('success');
          // Auto redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        })
        .catch((error) => {
          console.error('Error verifying email:', error);
          setStatus('error');
          
          if (error.code === 'auth/invalid-action-code') {
            setError('This verification link is invalid or has already been used.');
          } else if (error.code === 'auth/expired-action-code') {
            setError('This verification link has expired. Please request a new one.');
          } else {
            setError('An error occurred during verification. Please try again.');
          }
        });
    } else {
      setStatus('error');
      setError('Invalid verification link.');
    }
  }, [mode, oobCode, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="logo-section">
          <img src={logo} alt="SolidFlo Logo" />
        </div>

        {status === 'loading' && (
          <div className="status-section">
            <div className="spinner"></div>
            <h2>Verifying Your Email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="status-section success">
            <div className="success-icon">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="#10b981" />
                <path d="M25 40 L35 50 L55 30" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Email Verified Successfully!</h2>
            <p>Your email has been verified. Welcome to SolidFlo!</p>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Create professional invoices</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Generate quotes for clients</span>
              </div>
              <div className="benefit-item">
                <span className="check-icon">✓</span>
                <span>Track payments and manage business</span>
              </div>
            </div>
            <p className="redirect-text">Redirecting to login in 3 seconds...</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="status-section error">
            <div className="error-icon">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="#ef4444" />
                <path d="M30 30 L50 50 M50 30 L30 50" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Verification Failed</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button 
                className="btn-secondary"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
              <button 
                className="btn-primary"
                onClick={() => navigate('/register')}
              >
                Create New Account
              </button>
            </div>
          </div>
        )}

        <div className="footer-section">
          <p>Need help? Contact us at <a href="mailto:accounts@solidflo.co.za">accounts@solidflo.co.za</a></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;