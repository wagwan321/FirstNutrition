import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container section center not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p className="text-muted">
        Looks like this page skipped leg day. Let's get you back on track.
      </p>
      <Link to="/" className="btn btn-primary"><ArrowLeft size={18} /> Back to Home</Link>
    </div>
  )
}
