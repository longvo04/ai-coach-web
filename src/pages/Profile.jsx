import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import CVSummaryCard from '../components/CVSummaryCard';
import { validateUsername, validatePassword, validateDateOfBirth, validatePasswordConfirmation } from '../utils/validation';

export default function Profile() {
  const { user, loadMyInfo } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success'); // 'success' or 'error'
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    doB: ''
  });

  useEffect(() => {
    (async () => {
      const u = user || await loadMyInfo();
      if (u) setForm({
        id: u.id,
        username: u.username || '',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        doB: u.doB || '',
        password: '',
        confirmPassword: '',
        metadata: u.metadata || {},
      });
    })();
  }, [user, loadMyInfo]);

  if (!form) return <div className="p-6">Loading...</div>;

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
      if (value) {
        const validation = validatePassword(value);
        if (!validation.isValid) {
          setFieldErrors(v => ({ ...v, password: validation.error }));
        } else {
          setFieldErrors(v => ({ ...v, password: '' }));
        }
        // Also re-validate confirmPassword if it exists
        if (form?.confirmPassword) {
          const confirmValidation = validatePasswordConfirmation(value, form.confirmPassword);
          if (!confirmValidation.isValid) {
            setFieldErrors(v => ({ ...v, confirmPassword: confirmValidation.error }));
          } else {
            setFieldErrors(v => ({ ...v, confirmPassword: '' }));
          }
        }
      } else {
        setFieldErrors(v => ({ ...v, password: '', confirmPassword: '' }));
      }
    } else if (field === 'confirmPassword') {
      if (value && form?.password) {
        const validation = validatePasswordConfirmation(form.password, value);
        if (!validation.isValid) {
          setFieldErrors(v => ({ ...v, confirmPassword: validation.error }));
        } else {
          setFieldErrors(v => ({ ...v, confirmPassword: '' }));
        }
      } else if (!value && !form?.password) {
        setFieldErrors(v => ({ ...v, confirmPassword: '' }));
      }
    } else if (field === 'doB') {
      if (value) {
        const validation = validateDateOfBirth(value);
        if (!validation.isValid) {
          setFieldErrors(v => ({ ...v, doB: validation.error }));
        } else {
          setFieldErrors(v => ({ ...v, doB: '' }));
        }
      }
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    setMsgType('success');
    setFieldErrors({ username: '', password: '', confirmPassword: '', doB: '' });

    try {
      const payload = { ...form };

      // Validate username
      if (payload.username) {
        const usernameValidation = validateUsername(payload.username);
        if (!usernameValidation.isValid) {
          setFieldErrors(v => ({ ...v, username: usernameValidation.error }));
          setMsg(usernameValidation.error);
          setMsgType('error');
          setSaving(false);
          return;
        }
      }

      // Validate date of birth
      if (payload.doB) {
        const dobValidation = validateDateOfBirth(payload.doB);
        if (!dobValidation.isValid) {
          setFieldErrors(v => ({ ...v, doB: dobValidation.error }));
          setMsg(dobValidation.error);
          setMsgType('error');
          setSaving(false);
          return;
        }
      }

      // Validate password confirmation if provided
      if (payload.password) {
        const passwordValidation = validatePassword(payload.password);
        if (!passwordValidation.isValid) {
          setFieldErrors(v => ({ ...v, password: passwordValidation.error }));
          setMsg(passwordValidation.error);
          setMsgType('error');
          setSaving(false);
          return;
        }

        const confirmValidation = validatePasswordConfirmation(payload.password, payload.confirmPassword);
        if (!confirmValidation.isValid) {
          setFieldErrors(v => ({ ...v, confirmPassword: confirmValidation.error }));
          setMsg(confirmValidation.error);
          setMsgType('error');
          setSaving(false);
          return;
        }
      }

      if (!payload.password) delete payload.password;
      if (!payload.confirmPassword) delete payload.confirmPassword;
      await axiosClient.put(`/users/${form.id}`, payload);
      setMsg('Saved');
      setMsgType('success');
    } catch {
      setMsg('Save failed');
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={save} disabled={saving}>{saving?'Saving...':'Save'}</button>
        </div>
        {msg && (
          <div className={`mb-3 text-sm rounded px-3 py-2 ${
            msgType === 'error' 
              ? 'text-red-700 bg-red-50 border border-red-200' 
              : 'text-green-700 bg-green-50 border border-green-200'
          }`}>
            {msg}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              className={`w-full border ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.username || ''} 
              onChange={(e)=>handleFieldChange('username', e.target.value)} 
            />
            {fieldErrors.username && <p className="text-red-600 text-xs mt-1">{fieldErrors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" 
              value={form.firstName || ''} 
              onChange={(e)=>handleFieldChange('firstName', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" 
              value={form.lastName || ''} 
              onChange={(e)=>handleFieldChange('lastName', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" 
              value={form.email || ''} 
              onChange={(e)=>handleFieldChange('email', e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input 
              type="date" 
              className={`w-full border ${fieldErrors.doB ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.doB ? form.doB.split('T')[0] : ''} 
              onChange={(e)=>handleFieldChange('doB', e.target.value)} 
            />
            {fieldErrors.doB && <p className="text-red-600 text-xs mt-1">{fieldErrors.doB}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-gray-500 text-xs">(leave blank to keep current)</span></label>
            <input 
              type="password" 
              className={`w-full border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.password || ''} 
              onChange={(e)=>handleFieldChange('password', e.target.value)} 
              placeholder="New password"
            />
            {fieldErrors.password && <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              className={`w-full border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition`} 
              value={form.confirmPassword || ''} 
              onChange={(e)=>handleFieldChange('confirmPassword', e.target.value)} 
              placeholder="Confirm new password"
              disabled={!form.password}
            />
            {fieldErrors.confirmPassword && <p className="text-red-600 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>
        </div>
        {form.metadata && Object.keys(form.metadata).length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">CV Data</h2>
              <button
                type="button"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 py-1.5 transition-colors"
                onClick={() => navigate('/upload')}
              >
                Change CV Data
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CVSummaryCard title="Basic information" data={form.metadata['basic information']} />
              <CVSummaryCard title="Education" data={form.metadata['education']} />
              <CVSummaryCard title="Experience" data={form.metadata['experience']} />
              <CVSummaryCard title="Skill" data={form.metadata['skill']} />
              <CVSummaryCard title="Summary" data={form.metadata['summary']} />
              <CVSummaryCard title="Career path" data={form.metadata['career path']} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


