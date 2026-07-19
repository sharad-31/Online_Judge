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
    <div className="auth-page signup-bg">
      <div className="auth-shell">
        <div className="auth-hero">
          <h1>Hello!</h1>
          <p>Already solving problems with us? Log back in and pick up where you left off.</p>
          <Link to="/login" className="auth-toggle-btn">Login</Link>
        </div>

        <form className="auth-form-panel" onSubmit={handleSubmit}>
          <h2>Sign Up Form</h2>
          <p className="auth-subtitle">Join and start solving problems</p>

          {error && <p className="error-text">{error}</p>}

          <div>
            <label>Full Name</label>
            <input className="input" type="text" placeholder="Full name" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label>Username</label>
            <input className="input" type="text" placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div>
            <label>Email</label>
            <input className="input" type="email" placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label>Phone (optional)</label>
            <input className="input" type="tel" placeholder="Phone" value={phone}
              onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <label>Password</label>
            <div className="auth-password-field">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="auth-hint">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
