import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function StudentDetail() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState({ lessons: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentDetail = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.all([
      api.get(`/admin/students/${id}`),
      api.get(`/admin/students/${id}/enrollments`),
      api.get(`/admin/students/${id}/progress`),
    ])
      .then(([studentRes, enrollRes, progressRes]) => {
        setStudent(studentRes.data.data);
        setEnrollments(enrollRes.data.data);
        setProgress(progressRes.data.data);
      })
      .catch(() => setError("Unable to load student details."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchStudentDetail();
  }, [fetchStudentDetail]);

  if (loading) return <p className="text-gray-500">Loading...</p>;

  if (error) {
    return (
      <div>
        <p className="bg-red-100 text-red-700 p-3 rounded mb-3">{error}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchStudentDetail}
            className="text-sm font-medium text-blue-600 underline"
          >
            Retry
          </button>
          <Link to="/admin/students" className="text-blue-600 hover:underline text-sm">
            ← Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/students" className="text-blue-600 hover:underline text-sm">
        ← Back to Students
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-1">{student.name}</h1>
      <p className="text-gray-500 mb-6">{student.email}</p>

      {/* Enrollments */}
      <h2 className="text-lg font-bold mb-3">Enrollments</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Course</th>
              <th className="p-3">Status</th>
              <th className="p-3">Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.enrollmentId} className="border-t">
                <td className="p-3 font-medium">{e.courseTitle}</td>
                <td className="p-3 capitalize">{e.status}</td>
                <td className="p-3">
                  {new Date(e.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500">
                  Not enrolled in any courses.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lesson progress */}
      <h2 className="text-lg font-bold mb-3">Completed Lessons</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Lesson</th>
              <th className="p-3">Course</th>
              <th className="p-3">Completed</th>
            </tr>
          </thead>
          <tbody>
            {progress.lessons.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="p-3 font-medium">{l.lessonTitle}</td>
                <td className="p-3">{l.courseTitle}</td>
                <td className="p-3">
                  {new Date(l.completedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {progress.lessons.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500">
                  No lessons completed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quiz attempts */}
      <h2 className="text-lg font-bold mb-3">Quiz Attempts</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Quiz</th>
              <th className="p-3">Score</th>
              <th className="p-3">Result</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {progress.quizzes.map((q, i) => (
              <tr key={i} className="border-t">
                <td className="p-3 font-medium">{q.quizTitle}</td>
                <td className="p-3">{q.score}%</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      q.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {q.passed ? "Passed" : "Failed"}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(q.attemptedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {progress.quizzes.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No quiz attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}