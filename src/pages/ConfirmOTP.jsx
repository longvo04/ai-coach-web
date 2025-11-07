import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function ConfirmOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !otp) { setError('Please enter email and OTP'); return; }
    setLoading(true);
    try {
      const resp = await axiosClient.post('/users/confirm-otp', null, { params: { email, otp }, skipAuth: true });
      const raw = resp?.data;
      const result = raw?.result || {};
      const tmpToken = result?.token || raw?.token || raw?.accessToken || raw?.access_token || raw?.jwt || resp?.headers?.authorization || '';
      const token = String(tmpToken).startsWith('Bearer ') ? String(tmpToken).slice(7) : String(tmpToken);
      if (!token) throw new Error('Invalid OTP token');
      const username = result?.username || '';
      const emailFromResp = result?.email || email;
      navigate('/reset-password', { state: { token, username, email: emailFromResp } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl ring-1 ring-gray-100 rounded-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Confirm OTP</h1>
          <p className="text-lg text-gray-600">Enter the code sent to your email</p>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
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
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition-colors" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Back to{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
