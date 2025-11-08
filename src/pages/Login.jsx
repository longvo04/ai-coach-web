import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateUsername } from '../utils/validation';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });

  const handleFieldChange = (field, value) => {
    setForm(v => ({ ...v, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(v => ({ ...v, [field]: '' }));
    }
    if (field === 'username' && value) {
      const validation = validateUsername(value);
      if (!validation.isValid) {
        setFieldErrors(v => ({ ...v, username: validation.error }));
      } else {
        setFieldErrors(v => ({ ...v, username: '' }));
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ username: '', password: '' });

    // Validate username
    if (form.username) {
      const usernameValidation = validateUsername(form.username);
      if (!usernameValidation.isValid) {
        setFieldErrors(v => ({ ...v, username: usernameValidation.error }));
        setError(usernameValidation.error);
        return;
      }
    }

    if (!form.username || !form.password) {
      setError('Please enter username and password');
      return;
    }

    try {
      await login(form.username, form.password);
      navigate('/upload');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md bg-white shadow-xl shadow-blue-100/40 ring-1 ring-gray-100 rounded-2xl p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-lg text-gray-600">Sign in to your AI Coach account</p>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              className={`w-full border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.username} 
              onChange={(e)=>handleFieldChange('username', e.target.value)} 
              required 
            />
            {fieldErrors.username && <p className="text-red-600 text-xs mt-1">{fieldErrors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" 
              value={form.password} 
              onChange={(e)=>handleFieldChange('password', e.target.value)} 
              required 
            />
          </div>
          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-2.5 transition-colors" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Sign up</Link>
        </div>
      </div>
    </div>
  );
}


