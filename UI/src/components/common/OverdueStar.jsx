import { isOverdue } from '../../utils/horizonLogic'

export default function OverdueStar({ timeFrame }) {
  if (!timeFrame || !isOverdue(timeFrame)) return null

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '16px', fontWeight: 900, color: '#B71C1C' }}>★</span>
      <span
        style={{
          backgroundColor: '#B71C1C',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: '3px',
          letterSpacing: '0.05em',
        }}
      >
        OVERDUE
      </span>
    </span>
  )
}
