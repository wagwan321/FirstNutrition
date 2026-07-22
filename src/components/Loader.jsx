import ProteinTub from './ProteinTub.jsx'

export default function Loader({ hiding }) {
  return (
    <div className={`loader ${hiding ? 'hiding' : ''}`}>
      <div className="loader-inner">
        <div className="loader-glow" />
        <div className="loader-tub">
          <ProteinTub mark="FN" label="WHEY GOLD" uid="loader" />
        </div>
        <div className="loader-brand">
          <span className="logo-mark">FN</span> FIRST NUTRITION
        </div>
        <div className="loader-tag">Loading your fuel…</div>
        <div className="loader-bar"><span /></div>
      </div>
    </div>
  )
}
