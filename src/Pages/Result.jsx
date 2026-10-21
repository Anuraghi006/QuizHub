import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button, Card } from 'flowbite-react'
import { fetchResult } from '../redux/slices/attemptSlice'

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function Result() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const result = useSelector((state) => state.attemptReducer.result)
  const error = useSelector((state) => state.attemptReducer.error)

  useEffect(() => {
    dispatch(fetchResult(id))
  }, [dispatch, id])

  if (error) return <Alert color="failure" className="m-6">{error}</Alert>
  if (!result || result.id !== id) return <p className="p-10 text-center text-gray-500">Loading result…</p>

  const difference = result.previousAverage === null ? null : result.percent - result.previousAverage

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      {result.overtime && (
        <Alert color="warning">You submitted after the time limit, so your answers were not counted.</Alert>
      )}

      <Card className="text-center bg-white border border-gray-200 shadow-sm dark:bg-white">
        <p className="text-sm font-medium text-gray-500">{result.category} · {result.difficulty}</p>
        <p className="text-6xl font-extrabold text-purple-800 my-2">{result.percent}%</p>
        <p className="text-lg font-semibold text-gray-900">{result.correct} of {result.total} correct</p>
        <p className="text-gray-600">Time taken: {formatTime(result.timeTaken)}</p>
        <p className="text-sm text-gray-600 mt-1">
          {difference === null
            ? 'This is your first quiz.'
            : `${difference >= 0 ? '+' : ''}${difference}% compared with your average (${result.previousAverage}%)`}
        </p>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review your answers</h2>
        <ol className="flex flex-col gap-4 text-left">
          {result.review.map((item, index) => (
            <li key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
              <p className="font-medium text-gray-900">{index + 1}. {item.question}</p>
              {item.chosenIndex === null ? (
                <p className="text-sm text-gray-500">You skipped this one.</p>
              ) : (
                <p className={`text-sm font-medium ${item.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                  Your answer: {item.options[item.chosenIndex]}
                </p>
              )}
              {!item.isCorrect && (
                <p className="text-sm font-medium text-green-700">
                  Correct answer: {item.options[item.correctIndex]}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex gap-3">
        <Link to="/quiz/setup">
          <Button className="bg-purple-700 hover:bg-purple-800 text-white">Take another quiz</Button>
        </Link>
        <Link to="/history">
          <Button color="light">View history</Button>
        </Link>
      </div>
    </div>
  )
}

export default Result