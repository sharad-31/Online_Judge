import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import axiosInstance from '../api/axiosInstance'
import './Signup.css'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
const isValidPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

function Signup() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    if (name.trim().length < 2 || name.trim().length > 50) {
      return 'Name must be between 2 and 50 characters';
    }
    if (!isValidUsername(username)) {
      return 'Username must be 3-20 characters (letters, numbers, underscores only)';
    }
    if (!isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (phone && !isValidPhone(phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!isValidPassword(password)) {
      return 'Password must be at least 8 characters with at least one letter and one number';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true)
    try {
      await axiosInstance.post('/auth/signup', {
        name, username, email, phone, password
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="login-subtitle">Join and start solving problems</p>

        {error && <p className="error-text">{error}</p>}

        <label>Full Name</label>
        <input className="input" type="text" value={name}
          onChange={(e) => setName(e.target.value)} required />

        <label>Username</label>
        <input className="input" type="text" value={username}
          onChange={(e) => setUsername(e.target.value)} required />

        <label>Email</label>
        <input className="input" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />

        <label>Phone (optional)</label>
        <input className="input" type="tel" value={phone}
          onChange={(e) => setPhone(e.target.value)} />

        <label>Password</label>
        <div className="password-field">
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="signup-hint">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Signup