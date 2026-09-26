import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CourseCard({ course }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
      <Link
        to={`/courses/${course._id}`}
        className="block bg-[var(--color-surface)] rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full"
      >
        <div
          className="h-36 flex items-center justify-center"
          style={{ background: "var(--color-primary-light)", color: "var(--color-text-muted)" }}
        >
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm">No image</span>
          )}
        </div>
        <div className="p-4">
          <span
            className="text-xs uppercase tracking-wide font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            {course.category}
          </span>
          <h3 className="text-lg font-bold mt-1" style={{ color: "var(--color-text)" }}>
            {course.title}
          </h3>
          <p
            className="text-sm mt-1 line-clamp-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            {course.description}
          </p>
          <div
            className="flex justify-between items-center mt-3 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            <span>{course.instructor}</span>
            <span className="capitalize">{course.level}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}