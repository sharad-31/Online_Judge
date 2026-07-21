import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import CodeEditorSection from '../Components/CodeEditorSection';
import { useNavbarVisibility } from '../context/NavbarVisibilityContext.jsx';
import './ProblemDetail.css';

function ProblemDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const editorRef = useRef(null);
  const { hideNavbar, showNavbar } = useNavbarVisibility();

  // Keep the navbar out of the way while actively solving this problem.
  // It comes back the moment the student submits (see CodeEditorSection)
  // or navigates away from this page (cleanup below).
  useEffect(() => {
    hideNavbar();
    return () => showNavbar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

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

  if (loading) return <p className="problem-detail-container">Loading problem...</p>;
  if (error) return <p className="problem-detail-container error-text">{error}</p>;
  if (!question) return null;

  return (
    <div className="problem-detail-container fade-in">
      <Link to="/problems" className="back-link">← Back to Problems</Link>

      <h1 className="problem-title">{question.title}</h1>

      <div className="problem-detail-layout">
        <div className="problem-statement-col">
          <div className="problem-meta">
            <span className={`difficulty-${question.difficulty}`}>{question.difficulty}</span>
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

        <div ref={editorRef} className="editor-section">
          <h3>Write your solution</h3>
          <CodeEditorSection questionId={id} />
        </div>
      </div>
    </div>
  );
}

export default ProblemDetail;