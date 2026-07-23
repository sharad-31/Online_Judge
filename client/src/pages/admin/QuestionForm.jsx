import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'

const TOPICS = ['Arrays','Strings','Trees','Graphs','DP','Sorting',
  'Searching','Stack','Queue','LinkedList','Hashing','Greedy',
  'Backtracking','Bit Manipulation','Math','Recursion',
  'Two Pointers','Sliding Window','Heap','Trie']

function QuestionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', topic: 'Arrays', difficulty: 'Easy',
    statement: '', sampleInput: '', sampleOutput: '',
    timeLimit: 2, memoryLimit: 256
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      axiosInstance.get(`/questions/${id}`)
        .then(res => setForm(res.data.question))
    }
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isEdit) {
        await axiosInstance.put(`/questions/${id}`, form)
      } else {
        await axiosInstance.post('/questions', form)
      }
      navigate('/admin/questions')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px' }}>
      <h1>{isEdit ? 'Edit Question' : 'Add New Question'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} 
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <div>
          <label>Title</label>
          <input className="input" name="title" value={form.title}
            onChange={handleChange} required />
        </div>

        <div>
          <label>Topic</label>
          <select className="input" name="topic" value={form.topic}
            onChange={handleChange}>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label>Difficulty</label>
          <select className="input" name="difficulty" value={form.difficulty}
            onChange={handleChange}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label>Problem Statement</label>
          <textarea className="input" name="statement" value={form.statement}
            onChange={handleChange} rows={5} required />
        </div>

        <div>
          <label>Sample Input</label>
          <textarea className="input" name="sampleInput" value={form.sampleInput}
            onChange={handleChange} rows={3} required />
        </div>

        <div>
          <label>Sample Output</label>
          <textarea className="input" name="sampleOutput" value={form.sampleOutput}
            onChange={handleChange} rows={2} required />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <label>Time Limit (sec)</label>
            <input className="input" type="number" name="timeLimit"
              value={form.timeLimit} onChange={handleChange} min={1} max={30} />
          </div>
          <div>
            <label>Memory Limit (MB)</label>
            <input className="input" type="number" name="memoryLimit"
              value={form.memoryLimit} onChange={handleChange} min={16} max={1024} />
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading}
          style={{ background: '#2563eb', color: 'white', padding: '12px',
                   border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {loading ? 'Saving...' : isEdit ? 'Update Question' : 'Create Question'}
        </button>
      </form>
    </div>
  )
}

export default QuestionForm