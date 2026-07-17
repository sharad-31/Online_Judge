import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import './Leaderboard.css';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/leaderboard/global')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="problem-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Problems Solved</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u._id}>
                <td>
                  <span className={index < 3 ? `medal medal-${index + 1}` : ''}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </span>
                </td>
                <td>{u.username}</td>
                <td>{u.questionsSolved}</td>
                <td>{u.ranking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;