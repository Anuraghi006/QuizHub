import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from 'flowbite-react'
import { FaBrain } from 'react-icons/fa'
import { logout } from '../redux/slices/authSlice'

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.authReducer.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <Navbar fluid style={{ backgroundColor: '#5b21b6' }} className="px-8 py-3">
      <NavbarBrand as={Link} to="/">
        <FaBrain className="mr-2 text-2xl text-white" />
        <span className="self-center text-xl font-bold whitespace-nowrap text-white">QuizHub</span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        {user ? (
          <>
            <NavbarLink as={Link} to="/" className="text-white">Home</NavbarLink>
            <NavbarLink as={Link} to="/quiz/setup" className="text-white">Take Quiz</NavbarLink>
            <NavbarLink as={Link} to="/history" className="text-white">History</NavbarLink>
            <NavbarLink as={Link} to="/leaderboard" className="text-white">Leaderboard</NavbarLink>
            {user.role === 'admin' && (
              <NavbarLink as={Link} to="/admin/questions" className="text-white">Admin</NavbarLink>
            )}
            <span className="text-sm text-purple-200">Hi, {user.name}</span>
            <button onClick={handleLogout} className="rounded-lg bg-white/20 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/30">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavbarLink as={Link} to="/login" className="text-white">Login</NavbarLink>
            <NavbarLink as={Link} to="/register" className="text-white">Register</NavbarLink>
          </>
        )}
      </NavbarCollapse>
    </Navbar>
  )
}

export default Header
