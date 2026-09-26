export default function AdminOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
        Welcome, Admin
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Use the sidebar to manage courses, lessons, quizzes, and students.
      </p>
    </div>
  );
}