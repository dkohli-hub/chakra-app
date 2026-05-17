import { getBand, BAND_STYLES } from '../../utils/colorSystem'

export default function ColorBadge({ timeFrame }) {
  const band = getBand(timeFrame)
  if (!band) return null
  const style = BAND_STYLES[band]

  return (
    <span
      style={{
        backgroundColor: style.background,
        color: style.color,
        border: style.border ?? `1px solid ${style.color}`,
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {style.label}
    </span>
  )
}
