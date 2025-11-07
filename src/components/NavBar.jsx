import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function NavBar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/upload" className="text-lg font-semibold tracking-tight hover:text-blue-600 transition-colors">AI Coach</Link>
          {token && (
            <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-700">
              <Link to="/upload" className="hover:text-blue-600 transition-colors">Upload</Link>
              <Link to="/goals" className="hover:text-blue-600 transition-colors">Goals</Link>
              <Link to="/history" className="hover:text-blue-600 transition-colors">History</Link>
              <Link to="/feedback" className="hover:text-blue-600 transition-colors">Feedback</Link>
              <Link to="/profile" className="hover:text-blue-600 transition-colors">Profile</Link>
            </nav>
          )}
        </div>
        <div>
          {token ? (
            <button className="text-sm border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-md px-3 py-1.5 transition-colors" onClick={onLogout}>Logout</button>
          ) : (
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}


