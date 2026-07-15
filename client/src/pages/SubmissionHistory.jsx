import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './Leaderboard.css';

function SubmissionHistory() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!storedUser?.id) {
      setLoading(false);
      return;
    }

    axiosInstance.get(`/submissions/user/${storedUser.id}`)
      .then((res) => setSubmissions(res.data.submissions))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>My Submissions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="problem-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Language</th>
              <th>Verdict</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id}>
                <td>{s.questionId?.title || s.questionId}</td>
                <td>{s.language}</td>
                <td><span className={`badge badge-${s.verdict}`}>{s.verdict}</span></td>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>
                  <Link to={`/submissions/${s._id}`} className="view-link">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SubmissionHistory;