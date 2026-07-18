import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import CodeEditorSection from '../components/CodeEditorSection';
import './ProblemDetail.css';

function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axiosInstance.get(`/questions/${id}`);
        setQuestion(response.data.question);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Problem not found.');
        } else {
          setError('Failed to load problem. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <p className="problem-detail-container">Loading problem...</p>;
  if (error) return <p className="problem-detail-container error-text">{error}</p>;
  if (!question) return null;

  return (
    <div className="problem-detail-wrapper">

      {/* ── Mini Navbar ── */}
      <div className="problem-mini-nav">
        <Link to="/problems" className="mini-nav-back">
          <ArrowLeft size={16} /> Back to Problems
        </Link>
        <span className="mini-nav-brand">
          <Code2 size={18} /> OJ Platform
        </span>
        <button className="mini-nav-logout" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="problem-detail-page">

        {/* Left Panel */}
        <div className="problem-left-panel">
          <h1 className="problem-title">{question.title}</h1>

          <div className="problem-meta">
            <span className={`difficulty-${question.difficulty}`}>
              {question.difficulty}
            </span>
            <span>{question.topic}</span>
          </div>

          <div className="problem-limits">
            <span>Time Limit: {question.timeLimit}s</span>
            <span>Memory Limit: {question.memoryLimit}MB</span>
          </div>

          <div className="statement-section">
            <h3>Problem Statement</h3>
            <p className="statement-text">{question.statement}</p>
          </div>

          <div className="sample-section">
            <h3>Sample Input</h3>
            <pre className="sample-box">{question.sampleInput}</pre>
          </div>

          <div className="sample-section">
            <h3>Sample Output</h3>
            <pre className="sample-box">{question.sampleOutput}</pre>
          </div>

          <div className="problem-stats">
            <span>Total Submissions: {question.totalSubmissions}</span>
            {' | '}
            <span>Accepted: {question.acceptedSubmissions}</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="problem-right-panel">
          <CodeEditorSection questionId={id} />
        </div>

      </div>
    </div>
  );
}

export default ProblemDetail;