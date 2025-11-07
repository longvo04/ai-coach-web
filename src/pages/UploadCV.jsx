import { useEffect, useMemo, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';
import GoalPrompt from '../components/GoalPrompt';
import CVSummaryCard from '../components/CVSummaryCard';

export default function UploadCV() {
  const { user, loadMyInfo } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cvResult, setCvResult] = useState(null);
  const fileInputRef = useRef(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) loadMyInfo();
  }, [userId, loadMyInfo]);

  useEffect(() => {
    if (user?.metadata && Object.keys(user.metadata).length > 0 && !cvResult) {
      setCvResult(user.metadata);
    }
  }, [user, cvResult]);

  const disabled = useMemo(() => { return !file || !userId || loading}, [file, userId, loading]);

  const uploadAndAnalyze = async () => {
    if (!file || !userId) return;
    setLoading(true);
    setCvResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('userId', userId);
      const { data } = await axiosClient.post('/gemini/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCvResult(data);
      setFile(null); // Clear file after successful upload to allow new uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input element
      }
    } catch {
      setCvResult({ error: 'Analyze failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Upload CV</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={(e)=>{setFile(e.target.files?.[0]); console.log(file, userId, loading)}} className="block text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <button className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md px-4 py-2.5 transition-colors" onClick={uploadAndAnalyze} disabled={disabled}>
            {loading ? 'Analyzing…' : 'Upload & Analyze'}
          </button>
        </div>
      </div>

      {loading && <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-4">Processing… please wait.</div>}

      {cvResult && !cvResult.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CVSummaryCard title="Basic information" data={cvResult['basic information']} />
          <CVSummaryCard title="Education" data={cvResult['education']} />
          <CVSummaryCard title="Experience" data={cvResult['experience']} />
          <CVSummaryCard title="Skill" data={cvResult['skill']} />
          <CVSummaryCard title="Summary" data={cvResult['summary']} />
          <CVSummaryCard title="Career path" data={cvResult['career path']} />
        </div>
      )}

      {cvResult && !cvResult.error && (
        <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-6">
          <GoalPrompt cvAnalysis={cvResult} />
        </div>
      )}
    </div>
  );
}


