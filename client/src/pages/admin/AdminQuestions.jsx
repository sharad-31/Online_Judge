import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

function AdminQuestions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance.get('/questions')
      .then(res => setQuestions(res.data.questions))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return
    await axiosInstance.delete(`/questions/${id}`)
    setQuestions(questions.filter(q => q._id !== id))
  }

  return (
    <div className="problem-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Manage Questions</h1>
        <Link to="/admin/questions/new" className="btn" 
          style={{ padding: '8px 16px', background: '#2563eb', color: 'white', 
                   textDecoration: 'none', borderRadius: '6px' }}>
          + Add Question
        </Link>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="problem-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q._id}>
                <td>{q.title}</td>
                <td>{q.topic}</td>
                <td className={`difficulty-${q.difficulty}`}>{q.difficulty}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/admin/questions/${q._id}`}
                    style={{ color: '#2563eb', textDecoration: 'none' }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(q._id)}
                    style={{ color: '#dc2626', background: 'none', 
                             border: 'none', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminQuestions