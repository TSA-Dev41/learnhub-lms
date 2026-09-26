// Everything here runs client-side. The only network call this file makes
// is to LearnHub's own backend (/api/courses) — never an external AI service.

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "i", "you", "me", "my",
  "can", "could", "would", "should", "to", "for", "of", "in", "on",
  "about", "how", "what", "where", "when", "why", "please", "have",
  "has", "it", "this", "that", "and", "or", "so", "im", "want",
]);

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
}

// Classic edit-distance, used for typo tolerance on individual words.
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function wordsFuzzyMatch(a, b) {
  if (a === b) return true;
  const maxDistance = a.length <= 4 || b.length <= 4 ? 1 : 2;
  return levenshtein(a, b) <= maxDistance;
}

export const faqEntries = [
  {
    id: "enroll",
    label: "How do I enroll in a course?",
    keywords: ["enroll", "enrolment", "enrollment", "join a course", "sign up for", "take a course"],
    answers: [
      "Browse the course catalogue, open any course you're interested in, and click \"Enroll in this Course.\" You'll need to be logged in first.",
      "Just find a course you like in the catalogue and hit \"Enroll in this Course\" — you do need an account first, so register if you haven't already.",
    ],
  },
  {
    id: "quizzes",
    label: "How are quizzes graded?",
    keywords: ["quiz", "quizzes", "grade", "grading", "score", "passing score", "pass"],
    answers: [
      "Each quiz has a passing score set by the instructor. You'll instantly see your score, whether you passed, and a breakdown of every answer once you submit.",
      "Quizzes are auto-graded the moment you submit — you get your score and a full answer review right away, no waiting.",
    ],
  },
  {
    id: "lessons",
    label: "How do lessons work?",
    keywords: ["lesson", "lessons", "content", "video", "material"],
    answers: [
      "Each course is broken into ordered lessons. Once enrolled, open any lesson and mark it complete when you're done — progress is tracked automatically.",
    ],
  },
  {
    id: "progress",
    label: "Can I track my progress?",
    keywords: ["progress", "track", "dashboard", "completed", "how far along"],
    answers: [
      "Yes — your Dashboard shows every course you're enrolled in, plus completed lessons and quiz results for each one.",
    ],
  },
  {
    id: "account",
    label: "How do I create an account?",
    keywords: ["account", "register", "create account", "password", "login", "log in"],
    answers: [
      "Click \"Register\" in the navigation, fill in your name, email, and password, and you're in.",
      "Registration is free and quick — hit \"Register\" up top and fill in a few details.",
    ],
  },
  {
    id: "cost",
    label: "Is LearnHub free?",
    keywords: ["cost", "price", "free", "pay", "payment", "subscription"],
    answers: ["Yes, LearnHub is completely free — it's a student capstone project, not a commercial platform."],
  },
  {
    id: "certificate",
    label: "Do I get a certificate?",
    keywords: ["certificate", "certification", "diploma", "credential"],
    answers: ["Not at the moment — LearnHub tracks completion and quiz scores, but doesn't issue certificates yet."],
  },
  {
    id: "admin",
    label: "What can admins do?",
    keywords: ["admin", "instructor", "teacher", "manage courses"],
    answers: [
      "Admins can create and manage courses, lessons, and quizzes, publish or archive content, and view detailed student progress from the Admin Panel.",
    ],
  },
  {
    id: "contact",
    label: "How do I contact support?",
    keywords: ["contact", "support", "help", "reach", "email us"],
    answers: ["You can reach out anytime via the Contact page — fill in the form and we'll get back to you."],
  },
];

const smallTalk = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "yo", "good morning", "good afternoon", "good evening"],
    answers: [
      "Hey there! What can I help you with?",
      "Hi! Ask me anything about courses, enrollment, or quizzes.",
    ],
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank you", "cheers", "appreciate it"],
    answers: ["You're welcome!", "Anytime — good luck with the courses!"],
  },
  {
    id: "identity",
    keywords: ["who are you", "are you a bot", "are you real", "are you human", "are you ai"],
    answers: [
      "I'm the LearnHub assistant — a small built-in helper, not a real person. I can point you to real courses and answer common questions.",
    ],
  },
  {
    id: "goodbye",
    keywords: ["bye", "goodbye", "see ya", "see you"],
    answers: ["Bye! Come back anytime you have questions.", "See you around — happy learning!"],
  },
];

export const fallbackResponses = [
  "I'm not totally sure about that one — try asking about enrolling, quizzes, or a specific topic like \"do you have any courses on design?\"",
  "Hmm, I didn't quite catch that. You can ask me about enrollment, quizzes, progress tracking, or search for courses by topic.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function scoreEntry(userTokens, rawText, entry) {
  let score = 0;
  for (const phrase of entry.keywords) {
    if (rawText.includes(phrase)) {
      score += 2; // exact phrase match is a strong signal
      continue;
    }
    const phraseWords = phrase.split(" ");
    const hits = phraseWords.filter((pw) =>
      userTokens.some((ut) => wordsFuzzyMatch(ut, pw))
    ).length;
    if (hits >= Math.ceil(phraseWords.length / 2)) {
      score += 1; // fuzzy/partial match
    }
  }
  return score;
}

// Returns the best small-talk match, or null.
export function matchSmallTalk(text) {
  const normalized = normalize(text);
  const tokens = tokenize(text);
  let best = null;
  let bestScore = 0;
  for (const entry of smallTalk) {
    const score = scoreEntry(tokens, normalized, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore > 0 ? best : null;
}

// Returns up to 2 matched FAQ entries, best first, or [].
export function matchFaqIntents(text) {
  const normalized = normalize(text);
  const tokens = tokenize(text);
  const scored = faqEntries
    .map((entry) => ({ entry, score: scoreEntry(tokens, normalized, entry) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];
  const top = scored[0];
  const second = scored[1];
  const results = [top.entry];
  if (second && second.score >= top.score * 0.6 && second.entry.id !== top.entry.id) {
    results.push(second.entry);
  }
  return results;
}

// Loose follow-up match against a single previously-discussed topic, used
// when a short message like "what about the passing score" doesn't score
// highly enough on its own but the conversation already has context.
export function matchFollowUp(text, lastTopicId) {
  const entry = faqEntries.find((e) => e.id === lastTopicId);
  if (!entry) return null;
  const tokens = tokenize(text);
  const normalized = normalize(text);
  const score = scoreEntry(tokens, normalized, entry);
  return score > 0 ? entry : null;
}

export function getFaqAnswer(entry) {
  return pick(entry.answers);
}

export function getFallback() {
  return pick(fallbackResponses);
}

export function getSmallTalkAnswer(entry) {
  return pick(entry.answers);
}

// ---- Course-search intent detection ----

const COURSE_SEARCH_PATTERNS = [
  /courses?\s+(?:on|about|for|in|related to|like)\s+(.+)/i,
  /do you have (?:any )?courses?\s*(?:on|about|for|in)?\s*(.+)?/i,
  /(?:show|list|find|got) (?:me )?courses?\s*(?:on|about|for|in)?\s*(.*)/i,
];

export function detectCourseQuery(text) {
  const lower = text.toLowerCase();

  if (/categor/i.test(lower)) {
    return { type: "categories" };
  }

  for (const pattern of COURSE_SEARCH_PATTERNS) {
    const match = lower.match(pattern);
    if (match) {
      const query = (match[1] || "").replace(/[?.!]+$/, "").trim();
      return { type: "search", query };
    }
  }

  if (/what courses (do you have|are available|are there)/i.test(lower)) {
    return { type: "search", query: "" };
  }

  return null;
}