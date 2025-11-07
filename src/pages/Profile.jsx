import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import CVSummaryCard from '../components/CVSummaryCard';

export default function Profile() {
  const { user, loadMyInfo } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success'); // 'success' or 'error'

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

  const save = async () => {
    setSaving(true);
    setMsg('');
    setMsgType('success');
    try {
      const payload = { ...form };
      // Validate password confirmation if provided
      if (payload.password) {
        if (!payload.confirmPassword) {
          setMsg('Please confirm your new password');
          setMsgType('error');
          setSaving(false);
          return;
        }
        if (payload.password !== payload.confirmPassword) {
          setMsg('Passwords do not match');
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
        {['username','firstName','lastName','email','doB','password','confirmPassword'].map((key)=> (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
            <input type={key==='password'? 'password' : key==='confirmPassword'? 'password' : 'text'} className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-md px-3 py-2 outline-none transition" value={form[key] || ''} onChange={(e)=>setForm(v=>({...v, [key]: e.target.value}))} />
          </div>
        ))}
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


