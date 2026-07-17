import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Trophy, ListChecks, LogOut, LogIn, User, Menu, X } from 'lucide-react';
import './Navbar.css';

const navLinkClass = ({ isActive }) => (isActive ? 'nav-active' : '');

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    closeMenu();
    navigate('/login');
  };

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <Code2 size={22} />
        OJ Platform
      </Link>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/problems" className={navLinkClass} onClick={closeMenu}>
          <ListChecks size={16} /> Problems
        </NavLink>

        <NavLink to="/leaderboard" className={navLinkClass} onClick={closeMenu}>
          <Trophy size={16} /> Leaderboard
        </NavLink>

        {token && (
          <NavLink to="/submissions" className={navLinkClass} onClick={closeMenu}>
            <Code2 size={16} /> My Submissions
          </NavLink>
        )}

        {token && user && (
          <NavLink to="/profile" className="navbar-user" onClick={closeMenu}>
            <span className="navbar-avatar">{initial}</span>
            {user.username || user.name}
          </NavLink>
        )}

        {token ? (
          <button className="btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className={navLinkClass}
            state={{ from: location.pathname }}
            onClick={closeMenu}
          >
            <LogIn size={16} /> Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
