import { useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import './Profile.css'

function Profile() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      const fetchProfile = async () => {
          try {
              // Pehle user info lo
              const userRes = await axiosInstance.get('/auth/me')
              setUser(userRes.data.user)
              
              // Phir stats lo — user._id chahiye
              const statsRes = await axiosInstance.get(`/leaderboard/users/${userRes.data.user._id}/stats`)
              setStats(statsRes.data)
          } catch (err) {
              console.error(err)
          } finally {
              setLoading(false)
          }
      }
      fetchProfile()
  }, [])

  if (loading) return <p className="profile-container">Loading profile...</p>;
  if (!user || !stats) return <p className="profile-container error-text">Failed to load profile.</p>;

  return (
      <div className="profile-container">
          {/* User Info Card */}
          <div className="profile-card">
              <div className="profile-avatar">
                  {(user.name?.[0] || user.username?.[0] || '?').toUpperCase()}
              </div>
              <h2>{user.name}</h2>
              <p className="profile-username">@{user.username}</p>
              <p>{user.email}</p>
          </div>

          {/* Stats Card */}
          <div className="stats-card">
              <div>
                  <h3>{stats.ranking}</h3>
                  <p>Score</p>
              </div>
              <div>
                  <h3>{stats.questionsSolved}</h3>
                  <p>Solved</p>
              </div>
          </div>
      </div>
  )
}

export default Profile