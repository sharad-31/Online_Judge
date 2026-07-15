import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import './SubmissionDetail.css';

const monacoLangMap = { cpp: 'cpp', c: 'c', java: 'java', python: 'python' };

function SubmissionDetail() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editorWidth, setEditorWidth] = useState(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    axiosInstance.get(`/submissions/${id}`)
      .then((res) => setSubmission(res.data.submission))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load submission.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setEditorWidth(entry.contentRect.width);
      }
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [submission]);

  if (loading) return <p className="submission-detail-container">Loading submission...</p>;
  if (error) return <p className="submission-detail-container error-text">{error}</p>;
  if (!submission) return null;

  return (
    <div className="submission-detail-container">
      <Link to="/submissions" className="back-link">
        <ArrowLeft size={15} /> Back to Submissions
      </Link>

      <div className="card submission-summary">
        <div className="submission-summary-header">
          <span className={`badge badge-${submission.verdict}`}>{submission.verdict}</span>
          <span className="submission-lang">{submission.language}</span>
        </div>

        <div className="submission-stats">
          <div className="stat-item">
            <span className="stat-label">Execution Time</span>
            <span className="stat-value">{submission.executionTime} ms</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Memory Used</span>
            <span className="stat-value">{submission.memoryUsed} KB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Coding Time</span>
            <span className="stat-value">{submission.codingTime}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Submitted</span>
            <span className="stat-value">{new Date(submission.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="submit-panel submission-code-panel">
        <h3>Submitted Code</h3>
        <div className="editor-wrapper" ref={wrapperRef}>
          {editorWidth > 0 && (
            <Editor
              width={editorWidth}
              height="450px"
              language={monacoLangMap[submission.language]}
              theme="vs-dark"
              value={submission.code}
              options={{
                readOnly: true,
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 16 }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetail;