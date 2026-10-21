import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Card, Label, TextInput } from 'flowbite-react'
import { registerUser } from '../redux/slices/authSlice'

function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.authReducer.user)
  const serverError = useSelector((state) => state.authReducer.error)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setLocalError('The two passwords do not match')
      return
    }
    setLocalError('')
    dispatch(registerUser({ name, email, password }))
  }

  const message = localError || serverError

  return (
    <div className="flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        
        {message && <Alert color="failure">{message}</Alert>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-1 block">
              <Label htmlFor="name" value="Name" className="text-gray-700 font-medium" />
            </div>
            <TextInput 
              id="name" 
              required 
              placeholder="John Doe"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

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
              <Label htmlFor="password" value="Password (at least 6 characters)" className="text-gray-700 font-medium" />
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

          <div>
            <div className="mb-1 block">
              <Label htmlFor="confirm" value="Confirm password" className="text-gray-700 font-medium" />
            </div>
            <TextInput 
              id="confirm" 
              type="password" 
              required 
              placeholder="••••••••"
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)} 
            />
          </div>

          <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white mt-2">
            Register
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-2">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-purple-700 hover:text-purple-900 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Register