const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const timerEl = document.getElementById("timer");

let questions = [];
if (!window.FIELD) window.FIELD = "ai";

if (window.FIELD === "ai") {
  questions = [
    { q: "What is Artificial Intelligence?", a: "AI simulates human intelligence in machines." },
    { q: "Name a major ML paradigm.", a: "supervised" },
    { q: "What is Deep Learning?", a: "neural networks" },
    { q: "What does NLP stand for?", a: "natural language processing" },
    { q: "What is a model overfitting?", a: "overfitting" }
  ];
} else if (window.FIELD === "data") {
  questions = [
    { q: "What is Data Science?", a: "insights from data" },
    { q: "Define supervised learning.", a: "labeled" },
    { q: "What is feature engineering?", a: "features" },
    { q: "What is cross validation?", a: "validation" },
    { q: "What is a confusion matrix?", a: "true" }
  ];
} else {
  questions = [
    { q: "What is Ohm's Law?", a: "v = ir" },
    { q: "What is a diode?", a: "one direction" },
    { q: "What is a transistor used for?", a: "amplification" },
    { q: "What does a capacitor do?", a: "stores" },
    { q: "AC vs DC?", a: "direction" }
  ];
}

let currentIndex = 0;
let score = 0;
let timeLeft = 300; // 5 minutes in seconds
let timerInterval;

function start() {
  addBot("Welcome — your timed interview starts now!");
  startTimer();
  setTimeout(askNext, 800);
}

function askNext() {
  if (currentIndex >= questions.length) return finish();
  const q = questions[currentIndex];
  addBot(`Q${currentIndex + 1}: ${q.q}`);
}

function handleUserAnswer(ans) {
  if (currentIndex >= questions.length) return;
  const correct = questions[currentIndex].a.toLowerCase();
  if (ans.toLowerCase().includes(correct.split(" ")[0])) {
    score++;
    addBot("✅ Correct!");
  } else {
    addBot(`❌ Not quite. Correct: ${questions[currentIndex].a}`);
  }
  currentIndex++;
  if (currentIndex < questions.length) {
    setTimeout(askNext, 1000);
  } else {
    setTimeout(finish, 800);
  }
}

function finish() {
  clearInterval(timerInterval);
  const percent = (score / questions.length) * 100;
  addBot(`🏁 Interview finished — Score: ${score}/${questions.length} (${percent.toFixed(1)}%)`);
  userInput.disabled = true;
  sendBtn.disabled = true;
  // enable download
  createResultPDF(score, percent.toFixed(1));
}

function addUser(msg) {
  const d = document.createElement("div");
  d.className = "user";
  d.textContent = msg;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addBot(msg) {
  const d = document.createElement("div");
  d.className = "bot";
  d.textContent = msg;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
  speak(msg);
}

function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  } catch (e) {
    // ignore speech errors
  }
}

sendBtn.addEventListener("click", () => {
  const v = userInput.value.trim();
  if (!v) return;
  addUser(v);
  handleUserAnswer(v);
  userInput.value = "";
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

function startTimer() {
  updateTimerText();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerText();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      addBot("⏰ Time's up!");
      finish();
    }
  }, 1000);
}

function updateTimerText() {
  const mm = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const ss = (timeLeft % 60).toString().padStart(2, "0");
  timerEl.textContent = `Time: ${mm}:${ss}`;
}

// quick PDF (plain text) download using browser blob
function createResultPDF(scoreVal, percentStr) {
  const header = `Interview Result\n\nField: ${window.FIELD}\nScore: ${scoreVal}/${questions.length}\nPercent: ${percentStr}%\n\n`;
  let lines = header;
  for (let i = 0; i < questions.length; i++) {
    lines += `Q${i + 1}: ${questions[i].q}\nAnswer: ${questions[i].a}\n\n`;
  }
  const blob = new Blob([lines], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `result_${window.FIELD}_${Date.now()}.txt`;
  a.textContent = "Download result";
  a.style = "display:inline-block;margin:10px;padding:8px 12px;background:#007bff;color:#fff;border-radius:6px;text-decoration:none;";
  document.body.appendChild(a);
}

window.onload = start;
