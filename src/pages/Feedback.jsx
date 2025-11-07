import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../hooks/useAuth';

export default function Feedback() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const getFeedback = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const resp = await axiosClient.get('/gemini/feedback', { params: { userId: user?.id } });
      setData(resp?.data?.result || null);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Personalized Feedback</h1>
      <p className="text-gray-600">Get AI-powered feedback on your current progress and motivation to keep going.</p>

      <button
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md px-4 py-2.5 transition-colors"
        onClick={getFeedback}
        disabled={loading}
      >
        {loading ? 'Getting Feedback…' : 'Get Feedback'}
      </button>

      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-sm">{error}</div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-5">
            <h2 className="text-lg font-semibold mb-2">Feedback</h2>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">{data.feedback}</p>
          </div>
          {data.motivation_quote && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-yellow-900 mb-1">Motivation</h3>
              <p className="text-yellow-900">“{data.motivation_quote}”</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
