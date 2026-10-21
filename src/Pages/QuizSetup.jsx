import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Card, Label, Select } from 'flowbite-react'
import { fetchCategories } from '../redux/slices/questionSlice'
import { startQuiz, resetQuiz } from '../redux/slices/quizSlice'

function QuizSetup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const categories = useSelector((state) => state.questionReducer.categories)
  const error = useSelector((state) => state.quizReducer.error)

  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [amount, setAmount] = useState(10)

  useEffect(() => {
    dispatch(resetQuiz())
    dispatch(fetchCategories())
  }, [dispatch])

  const handleStart = async (e) => {
    e.preventDefault()
    try {
      await dispatch(startQuiz({ category, difficulty, amount })).unwrap()
      navigate('/quiz')
    } catch {
      // the error message is shown from the store
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl p-6">
      <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Set up your quiz</h1>
        <p className="text-sm text-gray-600">You get 30 seconds per question.</p>
        
        {error && <Alert color="failure">{error}</Alert>}
        
        <form onSubmit={handleStart} className="flex flex-col gap-4 mt-2">
          <div>
            <div className="mb-1 block">
              <Label htmlFor="category" value="Category" className="text-gray-700 font-medium" />
            </div>
            <Select 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
            >
              <option value="">Any category</option>
              {categories.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-1 block">
              <Label htmlFor="difficulty" value="Difficulty" className="text-gray-700 font-medium" />
            </div>
            <Select 
              id="difficulty" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
            >
              <option value="">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </div>

          <div>
            <div className="mb-1 block">
              <Label htmlFor="amount" value="Number of questions" className="text-gray-700 font-medium" />
            </div>
            <Select 
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </Select>
          </div>

          <Button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white mt-2">
            Start quiz
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default QuizSetup