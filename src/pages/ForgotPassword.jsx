import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { validatePassword } from '../utils/validation';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/users/forgot-password', null, { params: { email }, skipAuth: true });
      setSuccess(true);
      navigate('/confirm-otp', { state: { email } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordError('');
    
    if (value) {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        setPasswordError(validation.error);
      }
    }
  };

  const onReset = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (!otp || !newPassword) {
      setError('Please enter the OTP and your new password');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error);
      setError(passwordValidation.error);
      return;
    }

    setLoading(true);
    try {
      // 1) Confirm OTP to get a temporary token
      const confirm = await axiosClient.post('/users/confirm-otp', null, { params: { email, otp }, skipAuth: true });
      const raw = confirm?.data;
      const tmpToken = raw?.token || raw?.accessToken || raw?.access_token || raw?.jwt || raw?.result || confirm?.headers?.authorization || '';
      const token = String(tmpToken).startsWith('Bearer ') ? String(tmpToken).slice(7) : String(tmpToken);
      if (!token) throw new Error('Invalid OTP token');

      // 2) Use the token to reset the password
      await axiosClient.post('/users/reset-password', null, { params: { newPassword }, headers: { Authorization: `Bearer ${token}` }, skipAuth: true });
      setError('');
      // Use success flag to show a success message
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl shadow-blue-100/40 ring-1 ring-gray-100 rounded-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
          <p className="text-lg text-gray-600">Enter your email to reset your password</p>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        {success && !otp && !newPassword && (
          <div className="text-green-600 text-sm mb-3 bg-green-50 border border-green-200 rounded px-3 py-2">
            OTP sent! Please check your email for the code.
          </div>
        )}
        {!success ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)} 
                required 
                placeholder="Enter your email address"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition-colors" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={onReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
              <input
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition"
                value={otp}
                onChange={(e)=>setOtp(e.target.value)}
                placeholder="Enter the code from your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className={`w-full border ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`}
                value={newPassword}
                onChange={(e)=>handlePasswordChange(e.target.value)}
                required
              />
              {passwordError && <p className="text-red-600 text-xs mt-1">{passwordError}</p>}
              {!passwordError && newPassword && (
                <p className="text-gray-500 text-xs mt-1">Password must be at least 8 characters</p>
              )}
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition-colors" disabled={loading}>
              {loading ? 'Resetting…' : 'Set New Password'}
            </button>
          </form>
        )}
        <div className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

