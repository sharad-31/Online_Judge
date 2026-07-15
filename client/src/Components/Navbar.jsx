import { Link, useNavigate } from 'react-router-dom';
import { Code2, Trophy, ListChecks, LogOut, LogIn } from 'lucide-react';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Code2 size={22} />
        OJ Platform
      </Link>
      <div className="navbar-links">
        <Link to="/problems"><ListChecks size={16} /> Problems</Link>
        <Link to="/leaderboard"><Trophy size={16} /> Leaderboard</Link>
        {token && <Link to="/submissions"><Code2 size={16} /> My Submissions</Link>}
        {token ? (
          <button className="btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <Link to="/login"><LogIn size={16} /> Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;