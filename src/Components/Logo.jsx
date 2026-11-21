import { Link } from "react-router-dom";

export default function Logo({ light = false }) {
  return (
    <Link className={`brand-logo ${light ? "brand-logo-light" : ""}`} to="/" aria-label="Toy Zone home">
      <svg className="toy-zone-mark" viewBox="0 0 72 62" role="img" aria-label="S-shaped toy train">
        <path d="M47 8C37 1 17 4 14 17c-4 17 28 12 31 25 4 15-17 20-31 12" fill="none" stroke="#ff785f" strokeWidth="10" strokeLinecap="round" />
        <path d="M18 53h38" stroke="#183153" strokeWidth="3" strokeLinecap="round" />
        <rect x="31" y="34" width="22" height="14" rx="4" fill="#ffd166" stroke="#183153" strokeWidth="2" />
        <rect x="25" y="39" width="8" height="9" rx="2" fill="#73c9e8" stroke="#183153" strokeWidth="2" />
        <path d="M34 34v-6h10l6 6" fill="#ff9db7" stroke="#183153" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="32" cy="50" r="4" fill="#183153" /><circle cx="48" cy="50" r="4" fill="#183153" />
        <path d="M42 22l3 5 6 1-4 4 1 6-6-3-5 3 1-6-4-4 6-1z" fill="#ffd166" />
      </svg>
      <span className="brand-copy">
        <strong>TOY ZONE</strong>
        <small>Where Every Toy Begins an Adventure!</small>
      </span>
    </Link>
  );
}
