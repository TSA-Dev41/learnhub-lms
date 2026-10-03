const FAQ = () => {
  const faqs = [
    {
      question: "What is LearnHub?",
      answer:
        "LearnHub is an online learning platform where students can access courses and learning materials.",
    },
    {
      question: "How do I create an account?",
      answer:
        "Click on the Register button and complete the registration form to create your account.",
    },
    {
      question: "How do I enroll in a course?",
      answer:
        "Browse the available courses, select a course you are interested in, and follow the enrollment instructions.",
    },
    {
      question: "Can I access my courses after enrolling?",
      answer:
        "Yes. Once you enroll in a course, you can access it from your dashboard.",
    },
    {
      question: "How do I take a quiz?",
      answer:
        "Open the course you are enrolled in and select the available quiz to begin.",
    },
    {
      question: "Who can I contact if I have a problem?",
      answer:
        "If you experience any problem, contact the LearnHub support team or your course administrator.",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-3">
          Frequently Asked Questions
        </h1>

        <p className="text-[var(--color-text-muted)] mb-8">
          Find answers to common questions about using LearnHub.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[var(--color-surface)] rounded-lg shadow-sm p-5"
            >
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                {faq.question}
              </h2>

              <p className="text-[var(--color-text-muted)]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;