import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './ProblemList.css';
import { Circle, Search, X } from 'lucide-react';

const TOPICS = [
  'Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Sorting', 'Searching', 'Stack',
  'Queue', 'LinkedList', 'Hashing', 'Greedy', 'Backtracking', 'Bit Manipulation',
  'Math', 'Recursion', 'Two Pointers', 'Sliding Window', 'Heap', 'Trie',
];

const LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript'];

// Chip labels map to a search keyword rather than a strict topic enum match,
// so "Binary Search" still surfaces relevant problems even though the
// backend's topic field doesn't use that exact string.
const POPULAR_CHIPS = ['Arrays', 'DP', 'Graphs', 'Trees', 'Binary Search', 'Greedy'];

function ProblemList({ user }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (difficulty) params.difficulty = difficulty;
      if (topic) params.topic = topic;

      const response = await axiosInstance.get('/questions', { params });
      setQuestions(response.data.questions);
    } catch {
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, topic]);

  const handleProblemClick = (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(`/problems/${id}`);
    } else {
      navigate('/login');
    }
  };

  const solvedSet = useMemo(
    () => new Set((user?.solvedQuestions || []).map((id) => String(id))),
    [user]
  );

  const handleChipClick = (chip) => {
    setSearch((prev) => (prev.toLowerCase() === chip.toLowerCase() ? '' : chip));
  };

  const acceptanceRate = (q) => {
    if (!q.totalSubmissions) return null;
    return Math.round((q.acceptedSubmissions / q.totalSubmissions) * 100);
  };

  // Live client-side search across title + topic; instant, no reload.
  const visibleQuestions = useMemo(() => {
    let list = questions;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q)
      );
    }

    if (status && user) {
      list = list.filter((item) => {
        const isSolved = solvedSet.has(String(item._id));
        if (status === 'Solved') return isSolved;
        if (status === 'Unsolved') return !isSolved;
        return true; // 'Attempted' isn't tracked separately yet — falls through
      });
    }

    return list;
  }, [questions, search, status, user, solvedSet]);

  return (
    <div className="problem-list-container">
      <h1>Problems</h1>

      <div className="search-bar-wrap">
        <Search size={18} className="search-icon" />
        <input
          className="search-bar"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems by title, topic, or keyword..."
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="chip-row">
        {POPULAR_CHIPS.map((chip) => (
          <button
            key={chip}
            className={`chip ${search.toLowerCase() === chip.toLowerCase() ? 'chip-active' : ''}`}
            onClick={() => handleChipClick(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All Topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={!user}
          title={user ? undefined : 'Log in to filter by status'}
        >
          <option value="">All Statuses</option>
          <option value="Solved">Solved</option>
          <option value="Unsolved">Unsolved</option>
        </select>

        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">All Languages</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {loading && <p className="status-text">Loading problems...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && visibleQuestions.length === 0 && (
        <p className="status-text">No problems found.</p>
      )}

      {!loading && !error && visibleQuestions.length > 0 && (
        <div className="problem-card-grid">
          {visibleQuestions.map((q, i) => {
            const rate = acceptanceRate(q);
            const isSolved = user && solvedSet.has(String(q._id));
            return (
              <div
                key={q._id}
                className="card problem-card"
                style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                onClick={() => handleProblemClick(q._id)}
              >
                <div className="problem-card-top">
                  <span className={`badge difficulty-badge diff-${q.difficulty}`}>
                    <Circle size={7} fill="currentColor" /> {q.difficulty}
                  </span>
                  {isSolved && <span className="badge solved-badge">Solved</span>}
                </div>

                <h3 className="problem-card-title">{q.title}</h3>

                <div className="problem-card-tags">
                  <span className="topic-tag">{q.topic}</span>
                </div>

                <div className="problem-card-bottom">
                  <span className="acceptance-rate">
                    {rate !== null ? `${rate}% acceptance` : 'No submissions yet'}
                  </span>
                  <button
                    className="btn solve-btn"
                    onClick={(e) => { e.stopPropagation(); handleProblemClick(q._id); }}
                  >
                    Solve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProblemList;
