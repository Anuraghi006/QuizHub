import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Logged-out users are sent to /login. Non-admins are sent home from admin pages.
function ProtectedRoute({ children, adminOnly }) {
  const user = useSelector((state) => state.authReducer.user)

  if (!user) return <Navigate to="/login" />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />
  return children
}

export default ProtectedRoute
