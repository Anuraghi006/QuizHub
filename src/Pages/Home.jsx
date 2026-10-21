import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Card } from 'flowbite-react'
import { fetchHistory } from '../redux/slices/attemptSlice'

function Home() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.authReducer.user)
  const history = useSelector((state) => state.attemptReducer.history)

  useEffect(() => {
    dispatch(fetchHistory())
  }, [dispatch])

  const taken = history.length
  const best = taken ? Math.max(...history.map((a) => a.percent)) : 0
  const average = taken ? Math.round(history.reduce((sum, a) => sum + a.percent, 0) / taken) : 0

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-600">Pick a category and difficulty, then test yourself against the clock.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
          <p className="text-sm font-medium text-gray-500">Quizzes taken</p>
          <p className="text-2xl font-bold text-gray-900">{taken}</p>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
          <p className="text-sm font-medium text-gray-500">Average score</p>
          <p className="text-2xl font-bold text-gray-900">{average}%</p>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
          <p className="text-sm font-medium text-gray-500">Best score</p>
          <p className="text-2xl font-bold text-gray-900">{best}%</p>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link to="/quiz/setup">
          <Button className="bg-purple-700 hover:bg-purple-800 text-white">Start a new quiz</Button>
        </Link>
        <Link to="/leaderboard">
          <Button color="light">View leaderboard</Button>
        </Link>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h2 className="text-xl font-semibold text-gray-900">Recent attempts</h2>
        {taken === 0 && <p className="text-gray-500">No quizzes yet. Take your first one!</p>}
        <ul className="divide-y divide-gray-200">
          {history.slice(0, 3).map((a) => (
            <li key={a.id} className="flex justify-between py-2 text-gray-800">
              <Link to={`/result/${a.id}`} className="hover:underline text-purple-700 font-medium">
                {a.category} · {a.difficulty}
              </Link>
              <span className="font-semibold text-gray-900">{a.correct}/{a.total} ({a.percent}%)</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default Home