import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || '';
  const username = location.state?.username || '';
  const email = location.state?.email || '';
  const { login } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('Missing reset token. Please restart the reset flow.');
  }, [token]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) { setError('Missing reset token.'); return; }
    if (!newPassword || !confirmPassword) { setError('Please enter and confirm your new password'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await axiosClient.post('/users/reset-password', null, { params: { email, newPassword, confirmPassword }, headers: { Authorization: `Bearer ${token}` }, skipAuth: true });
      // Attempt auto-login using username (fallback to email if backend accepts it)
      if (username) {
        await login(username, newPassword);
        navigate('/upload');
      } else if (email) {
        try { await login(email, newPassword); navigate('/upload'); } catch { navigate('/login'); }
      } else {
        setDone(true);
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl ring-1 ring-gray-100 rounded-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Set New Password</h1>
          <p className="text-lg text-gray-600">Enter your new password to complete the reset.</p>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        {done && <div className="text-green-600 text-sm mb-3 bg-green-50 border border-green-200 rounded px-3 py-2">Password updated! Redirecting…</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition"
              value={confirmPassword}
              onChange={(e)=>setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition-colors" disabled={loading || !token}>
            {loading ? 'Saving…' : 'Set Password'}
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
