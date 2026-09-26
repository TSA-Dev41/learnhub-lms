import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow";
const labelClass = "block text-sm font-medium mb-1";

const emptyQuizForm = {
  title: "",
  description: "",
  passingScore: 70,
  timeLimit: 0,
  status: "draft",
};

const emptyQuestionForm = {
  text: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 1,
};

export default function ManageQuizzes() {
  const { id: courseId } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const ignoreRef = useRef(false);

  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizFormError, setQuizFormError] = useState("");

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get(`/admin/quizzes/course/${courseId}`);
      if (!ignoreRef.current) {
        setQuizzes(res.data.data);
      }
    } catch {
      if (!ignoreRef.current) {
        setLoadError("Unable to load quizzes.");
      }
    } finally {
      if (!ignoreRef.current) {
        setLoading(false);
      }
    }
  }, [courseId]);

  useEffect(() => {
    ignoreRef.current = false;
    const fetchTimer = setTimeout(() => {
      fetchQuizzes();
    }, 0);
    return () => {
      clearTimeout(fetchTimer);
      ignoreRef.current = true;
    };
  }, [fetchQuizzes]);

  const handleQuizChange = (e) => {
    setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  };

  const startEditQuiz = (quiz) => {
    setEditingQuizId(quiz._id);
    setQuizFormError("");
    setQuizForm({
      title: quiz.title || "",
      description: quiz.description || "",
      passingScore: quiz.passingScore ?? 70,
      timeLimit: quiz.timeLimit ?? 0,
      status: quiz.status || "draft",
    });
  };

  const cancelEditQuiz = () => {
    setEditingQuizId(null);
    setQuizFormError("");
    setQuizForm(emptyQuizForm);
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setSubmittingQuiz(true);
    setQuizFormError("");
    try {
      if (editingQuizId) {
        await api.put(`/admin/quizzes/${editingQuizId}`, quizForm);
      } else {
        await api.post(`/admin/quizzes`, { ...quizForm, course: courseId });
      }
      cancelEditQuiz();
      fetchQuizzes();
    } catch (err) {
      setQuizFormError(err.response?.data?.message || "Unable to save quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm("Delete this quiz and all its questions? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      if (activeQuiz?.id === quizId) setActiveQuiz(null);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete quiz.");
    }
  };

  const openQuestionManager = (quizId) => {
    setQuestionError("");
    api
      .get(`/admin/quizzes/${quizId}`)
      .then((res) => setActiveQuiz(res.data.data))
      .catch(() => setQuestionError("Unable to load quiz questions."));
  };

  const closeQuestionManager = () => {
    setActiveQuiz(null);
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestionForm);
    setQuestionError("");
  };

  const refreshActiveQuiz = () => {
    if (activeQuiz) openQuestionManager(activeQuiz.id);
  };

  const handleOptionChange = (index, value) => {
    const options = [...questionForm.options];
    options[index] = value;
    setQuestionForm({ ...questionForm, options });
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuestionError("");
    setQuestionForm({
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
    });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setQuestionError("");
    setQuestionForm(emptyQuestionForm);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setSubmittingQuestion(true);
    setQuestionError("");
    try {
      const cleanOptions = questionForm.options.filter((o) => o.trim() !== "");
      const payload = { ...questionForm, options: cleanOptions };

      if (editingQuestionId) {
        await api.put(`/admin/questions/${editingQuestionId}`, payload);
      } else {
        await api.post(`/admin/quizzes/${activeQuiz.id}/questions`, payload);
      }
      cancelEditQuestion();
      refreshActiveQuiz();
    } catch (err) {
      setQuestionError(err.response?.data?.message || "Unable to save question.");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/admin/questions/${questionId}`);
      refreshActiveQuiz();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete question.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Manage Quizzes
        </h1>
        <Link
          to="/admin/courses"
          className="hover:underline text-sm"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to Courses
        </Link>
      </div>

      {/* Quiz list */}
      {loading ? (
        <div className="space-y-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded-lg skeleton" />
          ))}
        </div>
      ) : loadError ? (
        <div
          className="p-3 rounded-lg mb-8 flex items-center justify-between gap-3"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          <span>{loadError}</span>
          <button onClick={fetchQuizzes} className="text-sm font-medium underline shrink-0">
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-surface rounded-lg shadow-sm overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--color-primary-light)" }}>
              <tr className="text-left">
                <th className="p-3" style={{ color: "var(--color-text)" }}>Title</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Passing Score</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Status</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id} className="border-t border-gray-100">
                  <td className="p-3 font-medium" style={{ color: "var(--color-text)" }}>{quiz.title}</td>
                  <td className="p-3" style={{ color: "var(--color-text-muted)" }}>{quiz.passingScore}%</td>
                  <td className="p-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs capitalize font-medium"
                      style={
                        quiz.status === "published"
                          ? { background: "var(--color-accent-light)", color: "var(--color-accent)" }
                          : { background: "var(--color-warning-light)", color: "var(--color-warning)" }
                      }
                    >
                      {quiz.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-3 text-sm">
                    <button
                      onClick={() => openQuestionManager(quiz._id)}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Questions
                    </button>
                    <button
                      onClick={() => startEditQuiz(quiz)}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="hover:underline"
                      style={{ color: "var(--color-danger)" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center" style={{ color: "var(--color-text-muted)" }}>
                    No quizzes yet. Add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit quiz form */}
      <div className="bg-surface rounded-lg shadow-sm p-6 max-w-2xl mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text)" }}>
          {editingQuizId ? "Edit Quiz" : "Add New Quiz"}
        </h2>

        {quizFormError && (
          <p
            className="p-3 rounded-lg mb-4"
            style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
          >
            {quizFormError}
          </p>
        )}

        <form onSubmit={handleQuizSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>Title</label>
            <input name="title" value={quizForm.title} onChange={handleQuizChange} required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>Description</label>
            <input name="description" value={quizForm.description} onChange={handleQuizChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: "var(--color-text)" }}>
                Passing Score (%)
              </label>
              <input
                type="number"
                name="passingScore"
                value={quizForm.passingScore}
                onChange={handleQuizChange}
                min={0}
                max={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: "var(--color-text)" }}>
                Time Limit (minutes, 0 = none)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={quizForm.timeLimit}
                onChange={handleQuizChange}
                min={0}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ color: "var(--color-text)" }}>Status</label>
            <select name="status" value={quizForm.status} onChange={handleQuizChange} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submittingQuiz}
              className="text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              style={{ background: "var(--color-primary)" }}
            >
              {submittingQuiz ? "Saving..." : editingQuizId ? "Save Changes" : "Add Quiz"}
            </motion.button>
            {editingQuizId && (
              <button
                type="button"
                onClick={cancelEditQuiz}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ color: "var(--color-text)" }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Question manager for active quiz */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.15 }}
            className="bg-surface rounded-lg shadow-sm p-6 max-w-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
                Questions — {activeQuiz.title}
              </h2>
              <button
                onClick={closeQuestionManager}
                className="text-sm hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                Close
              </button>
            </div>

            {questionError && (
              <p
                className="p-3 rounded-lg mb-4"
                style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
              >
                {questionError}
              </p>
            )}

            <ul className="space-y-2 mb-6">
              {activeQuiz.questions.map((q) => (
                <li
                  key={q.id}
                  className="rounded-lg p-3 flex justify-between items-start"
                  style={{ background: "var(--color-bg)" }}
                >
                  <div>
                    <p className="font-medium" style={{ color: "var(--color-text)" }}>{q.text}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Options: {q.options.join(", ")} — Correct: {q.correctAnswer} — {q.points} pt(s)
                    </p>
                  </div>
                  <div className="space-x-3 shrink-0 text-sm">
                    <button
                      onClick={() => startEditQuestion(q)}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="hover:underline"
                      style={{ color: "var(--color-danger)" }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {activeQuiz.questions.length === 0 && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No questions yet.
                </p>
              )}
            </ul>

            <h3 className="font-bold mb-3" style={{ color: "var(--color-text)" }}>
              {editingQuestionId ? "Edit Question" : "Add Question"}
            </h3>
            <form onSubmit={handleQuestionSubmit} className="space-y-3">
              <div>
                <label className={labelClass} style={{ color: "var(--color-text)" }}>
                  Question Text
                </label>
                <input
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>

              {questionForm.options.map((opt, i) => (
                <div key={i}>
                  <label className={labelClass} style={{ color: "var(--color-text)" }}>
                    Option {i + 1}
                  </label>
                  <input
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}

              <div>
                <label className={labelClass} style={{ color: "var(--color-text)" }}>
                  Correct Answer (must exactly match one option)
                </label>
                <input
                  value={questionForm.correctAnswer}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, correctAnswer: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass} style={{ color: "var(--color-text)" }}>Points</label>
                <input
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: e.target.value })}
                  min={1}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submittingQuestion}
                  className="text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
                  style={{ background: "var(--color-primary)" }}
                >
                  {submittingQuestion ? "Saving..." : editingQuestionId ? "Save Changes" : "Add Question"}
                </motion.button>
                {editingQuestionId && (
                  <button
                    type="button"
                    onClick={cancelEditQuestion}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    style={{ color: "var(--color-text)" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}