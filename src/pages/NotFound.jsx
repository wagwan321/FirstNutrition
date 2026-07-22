import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container section center">
      <h1 style={{ fontSize: 90, color: 'var(--accent)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p className="text-muted" style={{ margin: '12px 0 22px' }}>
        Looks like this page skipped leg day. Let's get you back on track.
      </p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  )
}
