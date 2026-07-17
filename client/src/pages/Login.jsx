import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import axiosInstance from '../api/axiosInstance';
import './Login.css';

gsap.registerPlugin(Draggable);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lampOn, setLampOn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cordBeadRef = useRef(null);
  const cordLineRef = useRef(null);
  const hitAreaRef = useRef(null);
  const lampOnRef = useRef(false);

  useEffect(() => {
    if (!hitAreaRef.current) return;

    const draggable = Draggable.create(hitAreaRef.current, {
      type: 'y',
      bounds: { minY: 0, maxY: 60 },

      onDrag() {
        gsap.set(cordBeadRef.current, { y: this.y });
        gsap.set(cordLineRef.current, { attr: { y2: 180 + this.y } });
      },

      onRelease() {
        if (this.y > 30) {
          lampOnRef.current = !lampOnRef.current;
          setLampOn(lampOnRef.current);
        }

        gsap.to([cordBeadRef.current, hitAreaRef.current], {
          y: 0,
          duration: 0.5,
          ease: 'back.out(2.5)'
        });

        gsap.to(cordLineRef.current, {
          attr: { y2: 180 },
          duration: 0.5,
          ease: 'back.out(2.5)'
        });
      }
    });

    return () => draggable[0]?.kill();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lamp-page" data-on={lampOn}>
      <div className="lamp-container">
        <div className="lamp-wrapper">
          <svg className="lamp-svg" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
            <ellipse className="inner-glow" cx="100" cy="110" rx="60" ry="30" />
            <rect className="lamp-base-part" x="92" y="100" width="16" height="160" rx="8" />
            <rect className="lamp-base-part" x="60" y="250" width="80" height="12" rx="6" />

            <g className="pull-cord">
              <line ref={cordLineRef} className="cord-line" x1="130" y1="110" x2="130" y2="180" />
              <circle ref={cordBeadRef} className="cord-bead" cx="130" cy="190" r="6" />
              <circle ref={hitAreaRef} className="cord-hit" cx="130" cy="190" r="25" fill="transparent" />
            </g>

            <path
              className="lamp-shade"
              d="M30 110 C 30 50, 170 50, 170 110 C 170 125, 30 125, 30 110 Z"
            />
          </svg>
          {!lampOn && <p className="lamp-hint">Pull the cord to sign in</p>}
        </div>

        <form className={`lamp-login-form ${lampOn ? 'active' : ''}`} onSubmit={handleSubmit}>
          <h2>Welcome back</h2>

          {error && <p className="error-text">{error}</p>}

          <div className="lamp-form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="lamp-form-group">
            <label>Password</label>
            <div className="lamp-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="lamp-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="lamp-login-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

          <p className="lamp-signup-hint">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;