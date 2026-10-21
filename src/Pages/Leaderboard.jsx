import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card } from 'flowbite-react'
import { fetchLeaderboard } from '../redux/slices/attemptSlice'

function Leaderboard() {
  const dispatch = useDispatch()
  const leaderboard = useSelector((state) => state.attemptReducer.leaderboard)
  const user = useSelector((state) => state.authReducer.user)

  useEffect(() => {
    dispatch(fetchLeaderboard())
  }, [dispatch])

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card className="bg-white border border-gray-200 shadow-sm dark:bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-sm text-gray-600">Top 10 players, ranked by best score.</p>
        
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 py-4">No attempts yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-gray-100 uppercase text-xs font-semibold text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Best</th>
                  <th className="px-4 py-3">Average</th>
                  <th className="px-4 py-3">Quizzes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((row, index) => {
                  const isCurrentUser = row.userId === user?.id
                  return (
                    <tr
                      key={row.userId}
                      className={
                        isCurrentUser
                          ? 'bg-purple-50 text-purple-900 font-semibold'
                          : 'bg-white hover:bg-gray-50 text-gray-800'
                      }
                    >
                      <td className="px-4 py-3 font-medium">#{index + 1}</td>
                      <td className="px-4 py-3">
                        {row.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs font-normal text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{row.best}%</td>
                      <td className="px-4 py-3">{row.average}%</td>
                      <td className="px-4 py-3">{row.quizzes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Leaderboard