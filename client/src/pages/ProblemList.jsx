import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './ProblemList.css';
import { Circle } from 'lucide-react';



function ProblemList() {
  const navigate = useNavigate()  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('')


  useEffect(() => {
    fetchQuestions();
  }, [difficulty, topic, search]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (difficulty) params.difficulty = difficulty;
      if (topic) params.topic = topic;
      if (search) params.search = search;

      const response = await axiosInstance.get('/questions', { params });
      setQuestions(response.data.questions);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };


const handleProblemClick = (id) => {
    const token = localStorage.getItem('token')
    
    if (token) {
        navigate(`/problems/${id}`)  
    } else {
        navigate('/login')           
    }
}

  return (
    <div className="problem-list-container">
      <h1>Problems</h1>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder=" Search problems..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All Topics</option>
          <option value="Arrays">Arrays</option>
          <option value="Strings">Strings</option>
          <option value="Trees">Trees</option>
          <option value="Graphs">Graphs</option>
          <option value="DP">DP</option>
          <option value="Sorting">Sorting</option>
          <option value="Searching">Searching</option>
          <option value="Stack">Stack</option>
          <option value="Queue">Queue</option>
          <option value="LinkedList">LinkedList</option>
          <option value="Hashing">Hashing</option>
          <option value="Greedy">Greedy</option>
          <option value="Backtracking">Backtracking</option>
          <option value="Bit Manipulation">Bit Manipulation</option>
          <option value="Math">Math</option>
          <option value="Recursion">Recursion</option>
          <option value="Two Pointers">Two Pointers</option>
          <option value="Sliding Window">Sliding Window</option>
          <option value="Heap">Heap</option>
          <option value="Trie">Trie</option>
        </select>
      </div>

      {loading && <p className="status-text">Loading problems...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && questions.length === 0 && <p className="status-text">No problems found.</p>}

      {!loading && !error && questions.length > 0 && (
        <table className="problem-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q._id}>
              
                <td onClick={() => handleProblemClick(q._id)} 
                    style={{ cursor: 'pointer' }}>
                    {q.title}
                </td>
                <td>{q.topic}</td>
                <td className={`difficulty-${q.difficulty}`}>
                  <Circle size={8} fill="currentColor" style={{ marginRight: '6px', display: 'inline' }} />
                  {q.difficulty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProblemList;