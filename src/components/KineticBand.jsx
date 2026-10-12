import ScrollScene from './ScrollScene.jsx'

// Giant type that slides sideways as you scroll — the two rows travel in
// opposite directions. Purely decorative.
const Row = ({ words, className }) => (
  <div className={`kinetic-row ${className}`}>
    {[...words, ...words, ...words].map((w, i) => (
      <span key={i}>{w}<i className="k-star" /></span>
    ))}
  </div>
)

export default function KineticBand({
  top = ['Fuel', 'Train', 'Recover', 'Repeat'],
  bottom = ['Start the change', '100% authentic'],
}) {
  return (
    <ScrollScene className="kinetic" aria-hidden="true">
      <Row words={top} className="k1" />
      <Row words={bottom} className="k2" />
    </ScrollScene>
  )
}
