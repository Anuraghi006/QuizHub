import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Button } from 'flowbite-react'
import { selectAnswer, goToQuestion, tick, submitQuiz } from '../redux/slices/quizSlice'

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function Quiz() {
  const dispatch = useDispatch()
  const quiz = useSelector((state) => state.quizReducer)
  const autoSubmitted = useRef(false)

  // Count down one second at a time while the quiz is active
  useEffect(() => {
    if (quiz.status !== 'active') return
    const timer = setInterval(() => dispatch(tick()), 1000)
    return () => clearInterval(timer)
  }, [dispatch, quiz.status])

  // When time runs out, submit once
  useEffect(() => {
    if (quiz.status === 'active' && quiz.timeLeft === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true
      dispatch(submitQuiz())
    }
  }, [dispatch, quiz.status, quiz.timeLeft])

  if (quiz.status === 'idle') return <Navigate to="/quiz/setup" />
  if (quiz.status === 'finished') return <Navigate to={`/result/${quiz.resultId}`} />

  const question = quiz.questions[quiz.currentIndex]
  const answeredCount = Object.keys(quiz.answers).length
  const isLast = quiz.currentIndex === quiz.questions.length - 1
  const submitting = quiz.status === 'submitting'

  const handleSubmit = () => {
    const unanswered = quiz.questions.length - answeredCount
    const message = unanswered > 0
      ? `You have ${unanswered} unanswered question(s). Submit anyway?`
      : 'Submit your quiz now?'
    if (window.confirm(message)) dispatch(submitQuiz())
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 p-6 md:grid-cols-[1fr_200px]">
      <div className="flex flex-col gap-4">
        {quiz.error && <Alert color="failure">{quiz.error}</Alert>}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Question {quiz.currentIndex + 1} of {quiz.questions.length}</span>
          <span className={`rounded-lg px-3 py-1 font-mono text-lg font-bold ${quiz.timeLeft <= 30 ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-800'}`}>
            {formatTime(quiz.timeLeft)}
          </span>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <p className="mb-1 text-xs uppercase text-purple-700">{question.category} · {question.difficulty}</p>
          <h2 className="mb-5 text-xl font-semibold text-gray-900">{question.question}</h2>
          <div className="flex flex-col gap-3">
            {question.options.map((option, index) => {
              const chosen = quiz.answers[question.id] === index
              return (
                <button
                  key={index}
                  onClick={() => dispatch(selectAnswer({ questionId: question.id, optionIndex: index }))}
                  className={`rounded-lg border px-4 py-3 text-left ${chosen ? 'border-purple-700 bg-purple-100 font-medium' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <Button color="light" disabled={quiz.currentIndex === 0 || submitting} onClick={() => dispatch(goToQuestion(quiz.currentIndex - 1))}>
            Previous
          </Button>
          {isLast ? (
            <Button color="success" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Submitting…' : 'Submit quiz'}
            </Button>
          ) : (
            <Button className="bg-purple-700 hover:bg-purple-800" disabled={submitting} onClick={() => dispatch(goToQuestion(quiz.currentIndex + 1))}>
              Next
            </Button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-lg border bg-white p-4 shadow">
        <p className="mb-3 text-sm font-semibold text-gray-700">Answered {answeredCount} of {quiz.questions.length}</p>
        <div className="grid grid-cols-5 gap-2">
          {quiz.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => dispatch(goToQuestion(index))}
              className={`h-9 rounded border text-sm ${quiz.answers[q.id] !== undefined ? 'border-purple-700 bg-purple-700 text-white' : 'border-gray-300 bg-white'} ${index === quiz.currentIndex ? 'ring-2 ring-purple-700' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <Button className="mt-4 w-full bg-green-600 hover:bg-green-700" disabled={submitting} onClick={handleSubmit}>
          Submit quiz
        </Button>
      </aside>
    </div>
  )
}

export default Quiz
