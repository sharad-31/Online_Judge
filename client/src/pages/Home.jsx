import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Users, Layers, Zap, Swords, Trophy, Globe2, History, Bot, Circle, ArrowRight
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import Hero from '../Components/Hero';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const FEATURES = [
  { icon: Zap, title: 'Instant Judging', desc: 'Submit code and get a verdict in seconds with our real-time execution engine.', color: 'cyan' },
  { icon: Swords, title: 'Coding Contests', desc: 'Compete head-to-head in timed contests and climb the live rankings.', color: 'violet' },
  { icon: Trophy, title: 'Leaderboards', desc: 'Track your rating against every coder on the platform, updated in real time.', color: 'amber' },
  { icon: Globe2, title: 'Multiple Languages', desc: 'Write and submit solutions in C++, Java, Python, or JavaScript.', color: 'blue' },
  { icon: History, title: 'Submission History', desc: 'Revisit every attempt with full diffs, verdicts, and runtime stats.', color: 'green' },
  { icon: Bot, title: 'AI Assistance', desc: 'Get contextual hints and optimization tips from an AI pair programmer.', color: 'pink' },
];

function Home() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axiosInstance.get('/questions')
      .then((res) => setQuestions((res.data.questions || []).slice(0, 3)))
      .catch(() => {});
    axiosInstance.get('/leaderboard/global', { params: { limit: 5 } })
      .then((res) => setUsers(res.data.users || []))
      .catch(() => {});
  }, []);

  const handleProblemClick = (id) => {
    const token = localStorage.getItem('token');
    navigate(token ? `/problems/${id}` : '/login');
  };

  const acceptanceRate = (q) => {
    if (!q.totalSubmissions) return null;
    return Math.round((q.acceptedSubmissions / q.totalSubmissions) * 100);
  };

  return (
    <div className="home-container">
      <Hero />

      {/* ---------- Features ---------- */}
      <motion.section
        className="section features-section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ staggerChildren: 0.08 }}
      >
        <motion.div className="section-heading" variants={fadeUp} transition={{ duration: 0.5 }}>
          <span className="section-eyebrow">Why OJ Platform</span>
          <h2>Everything you need to level up</h2>
          <p>A complete toolkit for practicing, competing, and growing as an engineer.</p>
        </motion.div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <motion.div
              key={title}
              className="card feature-card"
              variants={fadeUp}
              transition={{ duration: 0.45 }}
            >
              <div className={`feature-icon-badge fi-${color}`}>
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ---------- Stats ---------- */}
      <motion.section
        className="section"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          className="home-stats"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <div className="card stat-card">
            <div className="stat-icon-badge"><Code2 size={20} className="stat-icon" /></div>
            <span className="stat-number">70+</span>
            <span className="stat-label">Problems</span>
          </div>
          <div className="card stat-card">
            <div className="stat-icon-badge"><Layers size={20} className="stat-icon" /></div>
            <span className="stat-number">4</span>
            <span className="stat-label">Languages Supported</span>
          </div>
          <div className="card stat-card">
            <div className="stat-icon-badge"><Users size={20} className="stat-icon" /></div>
            <span className="stat-number">20</span>
            <span className="stat-label">Topics Covered</span>
          </div>
        </motion.div>
      </motion.section>

      {/* ---------- Problems preview ---------- */}
      {questions.length > 0 && (
        <motion.section
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.div className="section-heading row" variants={fadeUp} transition={{ duration: 0.5 }}>
            <div>
              <span className="section-eyebrow">Practice</span>
              <h2>Jump into a problem</h2>
            </div>
            <Link to="/problems" className="view-all-link">
              Browse all problems <ArrowRight size={15} />
            </Link>
          </motion.div>

          <div className="preview-problem-grid">
            {questions.map((q) => {
              const rate = acceptanceRate(q);
              return (
                <motion.div
                  key={q._id}
                  className="card preview-problem-card"
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  onClick={() => handleProblemClick(q._id)}
                >
                  <div className="preview-problem-top">
                    <span className={`badge difficulty-badge diff-${q.difficulty}`}>
                      <Circle size={7} fill="currentColor" /> {q.difficulty}
                    </span>
                    {rate !== null && <span className="acceptance-rate">{rate}% acceptance</span>}
                  </div>
                  <h4>{q.title}</h4>
                  <span className="topic-tag">{q.topic}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ---------- Leaderboard preview ---------- */}
      {users.length > 0 && (
        <motion.section
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div className="section-heading row" variants={fadeUp} transition={{ duration: 0.5 }}>
            <div>
              <span className="section-eyebrow">Compete</span>
              <h2>Top of the leaderboard</h2>
            </div>
            <Link to="/leaderboard" className="view-all-link">
              Full leaderboard <ArrowRight size={15} />
            </Link>
          </motion.div>

          <div className="card preview-leaderboard">
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                className={`preview-lb-row ${i < 3 ? 'top3' : ''}`}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
              >
                <span className="preview-lb-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="preview-lb-avatar">
                  {(u.username || u.name || '?')[0].toUpperCase()}
                </span>
                <span className="preview-lb-name">{u.username || u.name}</span>
                <span className="preview-lb-solved">{u.questionsSolved} solved</span>
                <span className="preview-lb-score">{u.ranking} pts</span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

export default Home;
