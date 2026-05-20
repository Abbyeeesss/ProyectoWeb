const LABELS = {
  urgente: { className: 'red', text: 'Urgente' },
  proximo: { className: 'orange', text: 'Próximo' },
  preventivo: { className: 'green', text: 'Preventivo' },
}

export default function UrgencyBadge({ level }) {
  const cfg = LABELS[level] ?? { className: 'green', text: level }
  return <span className={`core-badge ${cfg.className}`}>{cfg.text}</span>
}
