import { Route, Routes } from 'react-router-dom'
import Header from './Components/Header'
import ProtectedRoute from './Components/ProtectedRoute'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Home from './Pages/Home'
import QuizSetup from './Pages/QuizSetup'
import Quiz from './Pages/Quiz'
import Result from './Pages/Result'
import History from './Pages/History'
import Leaderboard from './Pages/Leaderboard'
import AdminQuestions from './Pages/AdminQuestions'
import PageNotFound from './Pages/PageNotFound'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path='/quiz/setup' element={<ProtectedRoute><QuizSetup /></ProtectedRoute>} />
        <Route path='/quiz' element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path='/result/:id' element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path='/history' element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path='/leaderboard' element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        <Route path='/admin/questions' element={<ProtectedRoute adminOnly><AdminQuestions /></ProtectedRoute>} />

        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </div>
  )
}

export default App
