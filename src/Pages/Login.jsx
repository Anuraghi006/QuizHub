import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Card, Label, TextInput } from 'flowbite-react'
import { loginUser } from '../redux/slices/authSlice'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.authReducer.user)
  const error = useSelector((state) => state.authReducer.error)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // When login succeeds, the user is set in the store, so go to the home page
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser({ email, password }))
  }

  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Login</h2>
        
        {error && <Alert color="failure">{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-1 block">
              <Label htmlFor="email" value="Email" className="text-gray-700 font-medium" />
            </div>
            <TextInput
              id="email"
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 block">
              <Label htmlFor="password" value="Password" className="text-gray-700 font-medium" />
            </div>
            <TextInput
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white mt-2">
            Login
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-2">
          No account?{' '}
          <Link to="/register" className="font-medium text-purple-700 hover:text-purple-900 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Login