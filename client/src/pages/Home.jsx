import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Users, Layers } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="hero-title">Sharpen your coding skills</h1>
        <p className="hero-subtitle">
          Solve curated DSA problems, get instant verdicts, and climb the leaderboard.
        </p>
        <div className="hero-actions">
          <Link to="/problems" className="btn">Browse Problems</Link>
          <Link to="/leaderboard" className="btn btn-outline">View Leaderboard</Link>
        </div>
      </motion.div>

      <motion.div
        className="home-stats"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="card stat-card">
          <Code2 size={26} className="stat-icon" />
          <span className="stat-number">70+</span>
          <span className="stat-label">Problems</span>
        </div>
        <div className="card stat-card">
          <Layers size={26} className="stat-icon" />
          <span className="stat-number">4</span>
          <span className="stat-label">Languages Supported</span>
        </div>
        <div className="card stat-card">
          <Users size={26} className="stat-icon" />
          <span className="stat-number">20</span>
          <span className="stat-label">Topics Covered</span>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;