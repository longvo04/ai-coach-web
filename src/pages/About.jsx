import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function About() {
  const { token } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">About AI Coach</h1>
        <p className="text-xl text-gray-600">
          Your personalized skill-development assistant for structured, intelligent learning
        </p>
      </div>

      <div className="bg-white rounded-xl shadow ring-1 ring-gray-100 p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is AI Coach?</h2>
          <p className="text-gray-700 leading-relaxed">
            AI Coach is a personalized skill-development assistant designed to help users identify their current strengths, 
            define meaningful learning goals, and follow a weekly improvement plan recommended by AI.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            The system leverages intelligent analysis to understand each user's background and generate a tailored growth 
            roadmap based on the individual's skills and desired goals.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Users can begin their journey in two ways:
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
              <h3 className="font-semibold text-blue-900 mb-2">📄 Upload a CV</h3>
              <p className="text-blue-800">
                Allow the AI to automatically analyze existing experience, extract skill keywords, and assess current proficiency levels.
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-md">
              <h3 className="font-semibold text-green-900 mb-2">💬 Use an AI Prompt</h3>
              <p className="text-green-800">
                Describe your current skills and learning objectives in natural language, and the system uses this to build a personalized plan.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
              <h3 className="font-semibold text-purple-900 mb-2">🎯 SMART Action Plans</h3>
              <p className="text-purple-800 text-sm">
                Specific, Measurable, Achievable, Relevant, Time-bound plans for each learning goal.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
              <h3 className="font-semibold text-orange-900 mb-2">📊 Progress Tracking</h3>
              <p className="text-orange-800 text-sm">
                Weekly progress tracking to visualize improvement and measure growth.
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
              <h3 className="font-semibold text-indigo-900 mb-2">💡 AI Feedback</h3>
              <p className="text-indigo-800 text-sm">
                AI-generated feedback and motivation messages to help users stay consistent and fully committed to the plan.
              </p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-5">
              <h3 className="font-semibold text-teal-900 mb-2">📈 History & Insights</h3>
              <p className="text-teal-800 text-sm">
                Track your learning journey over time with detailed history and completion records.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Transform Your Learning Journey</h2>
          <p className="text-gray-700 leading-relaxed">
            AI Coach transforms self-learning into a structured, guided process—helping users upgrade their professional 
            skills week by week with the support of intelligent, data-driven insights.
          </p>
        </div>

        {!token && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-3 text-center transition-colors font-medium"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md px-6 py-3 text-center transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        )}

        {token && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              to="/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-3 text-center transition-colors font-medium"
            >
              Upload Your CV
            </Link>
            <Link
              to="/goals"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md px-6 py-3 text-center transition-colors font-medium"
            >
              View Your Goals
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

