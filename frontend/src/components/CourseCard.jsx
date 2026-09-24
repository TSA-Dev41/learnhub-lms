import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
    >
      <div className="h-36 bg-gray-200 flex items-center justify-center text-gray-400">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>No image</span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
          {course.category}
        </span>
        <h3 className="text-lg font-bold mt-1">{course.title}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {course.description}
        </p>
        <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
          <span>{course.instructor}</span>
          <span className="capitalize">{course.level}</span>
        </div>
      </div>
    </Link>
  );
}