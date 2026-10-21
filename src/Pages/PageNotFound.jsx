import { Link } from 'react-router-dom'

function PageNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 p-10">
      <h1 className="text-5xl font-bold text-purple-800">404</h1>
      <p className="text-gray-600">That page does not exist.</p>
      <Link to="/" className="font-medium text-purple-700 hover:underline">Go home</Link>
    </div>
  )
}

export default PageNotFound
