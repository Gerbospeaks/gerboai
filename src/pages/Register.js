import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboards } from '../config/dashboardConfig';
import logo from '../assets/img/register.png';
function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDashboard, setSelectedDashboard] = useState('');
  const [error, setError] = useState('');
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
    <div className="max-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${logo})`, backgroundAttachment: 'fixed', backgroundBlendMode: 'overlay'}}>
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm password"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Select Your Industry</label>
            <select
              value={selectedDashboard}
              onChange={(e) => setSelectedDashboard(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
  <label className="block text-gray-300 mb-2">Company Name</label>
  <input
    type="text"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
  />
</div>

<div>
  <label className="block text-gray-300 mb-2">Company Address</label>
  <textarea
    value={companyAddress}
    onChange={(e) => setCompanyAddress(e.target.value)}
    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
  />
</div>

<div>
  <label className="block text-gray-300 mb-2">Company Logo</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setCompanyLogo(e.target.files[0])}
    className="w-full text-gray-300"
  />
</div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;