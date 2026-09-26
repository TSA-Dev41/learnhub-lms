import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      className={`font-heading font-bold text-xl tracking-tight ${className}`}
    >
      <span style={{ color: "var(--color-primary)" }}>Learn</span>
      <span style={{ color: "var(--color-accent)" }}>Hub</span>
    </Link>
  );
}