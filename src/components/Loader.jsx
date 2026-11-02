// First-load splash: the official logo with a progress line.
export default function Loader({ hiding }) {
  return (
    <div className={`loader${hiding ? ' hiding' : ''}`} aria-hidden="true">
      <div className="loader-inner">
        <img src="/images/fn/site/logo.svg" alt="" className="loader-logo" />
        <div className="loader-bar"><span /></div>
      </div>
    </div>
  )
}
