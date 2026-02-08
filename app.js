const topicSelect = document.getElementById("topicSelect");
const startBtn = document.getElementById("startBtn");
const statusEl = document.getElementById("status");

const quizCard = document.getElementById("quizCard");
const questionText = document.getElementById("questionText");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");

let allQuestions = [];
let filtered = [];
let currentIndex = 0;
let score = 0;
let answered = false;

async function loadQuestions() {
  try {
    statusEl.textContent = "Loading questions...";
    const res = await fetch("data/questions.json");
    if (!res.ok) throw new Error("Failed to load questions.json");

    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("questions.json must be an array");

    // Basic validation
    allQuestions = data.filter(q =>
      q &&
      typeof q.topic === "string" &&
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      typeof q.answerIndex === "number"
    );

    const topics = getUniqueTopics(allQuestions);
    renderTopicOptions(topics);

    statusEl.textContent = `Loaded ${allQuestions.length} questions. Choose a topic to start.`;
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error loading questions. Check data/questions.json and try again.";
    topicSelect.innerHTML = `<option value="">Error</option>`;
    startBtn.disabled = true;
  }
}

function getUniqueTopics(questions) {
  const set = new Set();
  questions.forEach(q => set.add(q.topic));
  return Array.from(set).sort();
}

function renderTopicOptions(topics) {
  topicSelect.innerHTML = `<option value="">Select a topic</option>`;
  topics.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicSelect.appendChild(opt);
  });
  startBtn.disabled = true;
}

topicSelect.addEventListener("change", () => {
  startBtn.disabled = topicSelect.value === "";
});

startBtn.addEventListener("click", () => {
  const topic = topicSelect.value;
  filtered = allQuestions.filter(q => q.topic === topic);

  if (filtered.length === 0) {
    statusEl.textContent = "No questions found for this topic.";
    return;
  }

  // Shuffle questions for variety
  filtered = shuffle([...filtered]);

  currentIndex = 0;
  score = 0;
  answered = false;

  statusEl.textContent = "";
  quizCard.classList.remove("hidden");
  feedbackEl.classList.add("hidden");
  nextBtn.classList.add("hidden");
  restartBtn.classList.add("hidden");

  renderQuestion();
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < filtered.length - 1) {
    currentIndex++;
    answered = false;
    feedbackEl.classList.add("hidden");
    nextBtn.classList.add("hidden");
    renderQuestion();
  } else {
    showFinal();
  }
});

restartBtn.addEventListener("click", () => {
  quizCard.classList.add("hidden");
  statusEl.textContent = "Choose a topic to start again.";
  topicSelect.value = "";
  startBtn.disabled = true;
});

function renderQuestion() {
  const q = filtered[currentIndex];

  progressEl.textContent = `Question ${currentIndex + 1} / ${filtered.length}`;
  scoreEl.textContent = `Score: ${score}`;

  questionText.textContent = q.question;

  optionsEl.innerHTML = "";
  q.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optText;

    btn.addEventListener("click", () => handleAnswer(idx, q, btn));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(selectedIndex, q, clickedBtn) {
  if (answered) return;
  answered = true;

  const buttons = Array.from(document.querySelectorAll(".option-btn"));
  buttons.forEach(b => b.classList.add("disabled"));

  const correctIndex = q.answerIndex;

  // Mark correct option
  buttons[correctIndex]?.classList.add("correct");

  if (selectedIndex === correctIndex) {
    score++;
    clickedBtn.classList.add("correct");
    showFeedback(true, q.explanation);
  } else {
    clickedBtn.classList.add("wrong");
    showFeedback(false, q.explanation);
  }

  scoreEl.textContent = `Score: ${score}`;

  // Show Next or Final
  if (currentIndex < filtered.length - 1) {
    nextBtn.classList.remove("hidden");
  } else {
    restartBtn.classList.remove("hidden");
    nextBtn.classList.add("hidden");
  }
}

function showFeedback(isCorrect, explanation) {
  feedbackEl.classList.remove("hidden");
  const title = isCorrect ? "✅ Correct!" : "❌ Wrong!";
  const exp = explanation ? explanation : "No explanation provided.";
  feedbackEl.innerHTML = `<strong>${title}</strong><br/><span>${exp}</span>`;
}

function showFinal() {
  questionText.textContent = "Quiz finished!";
  optionsEl.innerHTML = "";
  feedbackEl.classList.remove("hidden");
  feedbackEl.innerHTML = `<strong>Final Score:</strong> ${score} / ${filtered.length}`;
  nextBtn.classList.add("hidden");
  restartBtn.classList.remove("hidden");
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

loadQuestions();