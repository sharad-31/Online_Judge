import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import './Footer.css';

// This project's lucide-react build ships lucide's generic icon set only —
// brand/social marks (GitHub, X/Twitter, LinkedIn) aren't included, so these
// are small inline SVGs instead of a lucide import.
const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" {...props}>
    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a10.98 10.98 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" {...props}>
    <path d="M18.9 2H22l-7.5 8.57L23.3 22h-6.86l-5.37-6.6L4.9 22H1.78l8.02-9.17L1 2h7.03l4.86 6.03L18.9 2Zm-1.2 18.2h1.7L7.4 3.7H5.57L17.7 20.2Z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" {...props}>
    <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <Link to="/" className="footer-brand">
            <Code2 size={20} />
            OJ Platform
          </Link>
          <p className="footer-tagline">
            Code your vision. Build your future. A cloud-native platform for
            real-time judging, contests, and AI-assisted learning.
          </p>
          <div className="footer-social">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><TwitterIcon /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon /></a>
          </div>
        </div>

        <div className="footer-link-col">
          <h4>Platform</h4>
          <Link to="/problems">Problems</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/submissions">My Submissions</Link>
        </div>

        <div className="footer-link-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
          <Link to="/profile">Profile</Link>
        </div>

        <div className="footer-link-col">
          <h4>Resources</h4>
          <a href="#top">Documentation</a>
          <a href="#top">Support</a>
          <a href="#top">Status</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} OJ Platform. All rights reserved.</span>
        <span className="footer-bottom-tag">Built for coders, by coders.</span>
      </div>
    </footer>
  );
}

export default Footer;
