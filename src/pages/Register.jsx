import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    doB: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/users/createUser', {
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        doB: form.doB
      });
      // Auto-login after registration
      await login(form.username, form.password);
      navigate('/upload');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl shadow-blue-100/40 ring-1 ring-gray-100 rounded-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-lg text-gray-600">Sign up for your AI Coach account</p>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.firstName} onChange={(e)=>setForm(v=>({...v, firstName: e.target.value}))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.lastName} onChange={(e)=>setForm(v=>({...v, lastName: e.target.value}))} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.email} onChange={(e)=>setForm(v=>({...v, email: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.doB} onChange={(e)=>setForm(v=>({...v, doB: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.username} onChange={(e)=>setForm(v=>({...v, username: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.password} onChange={(e)=>setForm(v=>({...v, password: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.confirmPassword} onChange={(e)=>setForm(v=>({...v, confirmPassword: e.target.value}))} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition-colors" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

