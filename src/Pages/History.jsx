import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Card } from 'flowbite-react'
import { fetchHistory } from '../redux/slices/attemptSlice'

function History() {
  const dispatch = useDispatch()
  const history = useSelector((state) => state.attemptReducer.history)

  useEffect(() => {
    dispatch(fetchHistory())
  }, [dispatch])

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Previous attempts</h1>
        
        {history.length === 0 ? (
          <p className="text-gray-500 py-4">You have not taken any quizzes yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{new Date(attempt.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{attempt.category}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{attempt.difficulty}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {attempt.correct}/{attempt.total} ({attempt.percent}%)
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link 
                        to={`/result/${attempt.id}`} 
                        className="font-medium text-purple-700 hover:text-purple-900 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default History