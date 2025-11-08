import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';
import { validateUsername, validatePassword, validateDateOfBirth, validatePasswordConfirmation } from '../utils/validation';

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
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    doB: ''
  });

  const handleFieldChange = (field, value) => {
    setForm(v => ({ ...v, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(v => ({ ...v, [field]: '' }));
    }

    // Real-time validation for specific fields
    if (field === 'username') {
      const validation = validateUsername(value);
      if (!validation.isValid && value) {
        setFieldErrors(v => ({ ...v, username: validation.error }));
      } else {
        setFieldErrors(v => ({ ...v, username: '' }));
      }
    } else if (field === 'password') {
      const validation = validatePassword(value);
      if (!validation.isValid && value) {
        setFieldErrors(v => ({ ...v, password: validation.error }));
      } else {
        setFieldErrors(v => ({ ...v, password: '' }));
      }
      // Also re-validate confirmPassword if it exists
      if (form.confirmPassword) {
        const confirmValidation = validatePasswordConfirmation(value, form.confirmPassword);
        if (!confirmValidation.isValid) {
          setFieldErrors(v => ({ ...v, confirmPassword: confirmValidation.error }));
        } else {
          setFieldErrors(v => ({ ...v, confirmPassword: '' }));
        }
      }
    } else if (field === 'confirmPassword') {
      const validation = validatePasswordConfirmation(form.password, value);
      if (!validation.isValid && value) {
        setFieldErrors(v => ({ ...v, confirmPassword: validation.error }));
      } else {
        setFieldErrors(v => ({ ...v, confirmPassword: '' }));
      }
    } else if (field === 'doB') {
      const validation = validateDateOfBirth(value);
      if (!validation.isValid && value) {
        setFieldErrors(v => ({ ...v, doB: validation.error }));
      } else {
        setFieldErrors(v => ({ ...v, doB: '' }));
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ username: '', password: '', confirmPassword: '', doB: '' });

    // Validate all fields
    const usernameValidation = validateUsername(form.username);
    const passwordValidation = validatePassword(form.password);
    const dobValidation = validateDateOfBirth(form.doB);
    const confirmPasswordValidation = validatePasswordConfirmation(form.password, form.confirmPassword);

    if (!usernameValidation.isValid) {
      setFieldErrors(v => ({ ...v, username: usernameValidation.error }));
      setError(usernameValidation.error);
      return;
    }

    if (!passwordValidation.isValid) {
      setFieldErrors(v => ({ ...v, password: passwordValidation.error }));
      setError(passwordValidation.error);
      return;
    }

    if (!dobValidation.isValid) {
      setFieldErrors(v => ({ ...v, doB: dobValidation.error }));
      setError(dobValidation.error);
      return;
    }

    if (!confirmPasswordValidation.isValid) {
      setFieldErrors(v => ({ ...v, confirmPassword: confirmPasswordValidation.error }));
      setError(confirmPasswordValidation.error);
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
              <input className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.firstName} onChange={(e)=>handleFieldChange('firstName', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.lastName} onChange={(e)=>handleFieldChange('lastName', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form.email} onChange={(e)=>handleFieldChange('email', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input 
              type="date" 
              className={`w-full border ${fieldErrors.doB ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.doB} 
              onChange={(e)=>handleFieldChange('doB', e.target.value)} 
              required 
            />
            {fieldErrors.doB && <p className="text-red-600 text-xs mt-1">{fieldErrors.doB}</p>}
          </div>
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
              className={`w-full border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.password} 
              onChange={(e)=>handleFieldChange('password', e.target.value)} 
              required 
            />
            {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
            {!fieldErrors.password && form.password && (
              <p className="text-gray-500 text-xs mt-1">Password must be at least 8 characters</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              className={`w-full border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.confirmPassword} 
              onChange={(e)=>handleFieldChange('confirmPassword', e.target.value)} 
              required 
            />
            {fieldErrors.confirmPassword && <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
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

