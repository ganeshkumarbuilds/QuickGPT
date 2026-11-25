import { Link } from 'react-router-dom'
export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="QuickGPT home">
      <span className="brand-mark" aria-hidden="true">
        ✳
      </span>
      QuickGPT
    </Link>
  )
}
