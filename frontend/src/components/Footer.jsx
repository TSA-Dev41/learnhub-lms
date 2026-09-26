import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-gray-100 px-8 py-8"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <Logo />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            © {year} LearnHub LMS — TSAcademy Capstone Project
          </p>
        </div>

        <nav className="flex gap-5 text-sm">
            <Link to="/" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
                Home
            </Link>
            <Link to="/courses" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
                Courses
            </Link>
            <Link to="/about" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
                About
            </Link>
            <Link to="/contact" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
                Contact
            </Link>
        </nav>
      </div>
    </footer>
  );
}