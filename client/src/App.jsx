import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import axiosInstance from './api/axiosInstance'
import Home from './pages/Home'
import ProblemList from './pages/ProblemList'
import ProblemDetail from './pages/ProblemDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SubmissionDetail from './pages/SubmissionDetail';
import Profile from './pages/Profile';

import Leaderboard from './pages/Leaderboard';
import SubmissionHistory from './pages/SubmissionHistory';
import Navbar from './components/Navbar';
import { Toaster } from 'react-hot-toast';

function AppRoutes({ user, setUser }) {
  const location = useLocation();

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div key={location.pathname} className="page-transition">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/:id" element={
            user ? <ProblemDetail user={user} /> : <Navigate to="/login" state={{ from: window.location.pathname }} />
          } />
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <Login setUser={setUser} />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/" /> : <Signup />
          } />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/submissions" element={<SubmissionHistory />} />
          <Route path="/submissions/:id" element={
              user ? <SubmissionDetail /> : <Navigate to="/login" state={{ from: window.location.pathname }} />
          } />
          <Route path="/profile" element={
              user ? <Profile /> : <Navigate to="/login" state={{ from: window.location.pathname }} />
          } />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleMouseMove = (e) => {
      document.querySelectorAll('.card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
          card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axiosInstance.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</p>

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#171a23',
            color: '#e6e8ec',
            border: '1px solid #2a2f3d',
            fontSize: '14px'
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#171a23' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#171a23' } }
        }}
      />
      <AppRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  )
}

export default App