import { useEffect } from 'react'

export default function WireframeToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2400)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="core-toast" role="status">
      <strong>Wireframe</strong>
      <p>{message}</p>
    </div>
  )
}
