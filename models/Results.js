let questions = [];
let score = 0, currentQ = 0, timeLeft = 300;

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const timerEl = document.getElementById("timer");

function rtQuestions(qSet) {
  questions = qSet;
  startChat();
}

function startChat() {
  addBotMessage("Welcome to your Interview! Let’s begin.");
  askQuestion();
  startTimer();
}

function askQuestion() {
  if (currentQ < questions.length) {
    addBotMessage(`Q${currentQ + 1}: ${questions[currentQ].q}`);
  } else finishInterview();
}

function handleAnswer(answer) {
  const correct = questions[currentQ].a;
  if (answer.toLowerCase().includes(correct.split(" ")[0].toLowerCase())) score++;
  addBotMessage(`✅ Correct Answer: ${correct}`);
  currentQ++;
  setTimeout(askQuestion, 1200);
}

function addUserMessage(msg) {
  const p = document.createElement("p");
  p.classList.add("user");
  p.innerText = msg;
  chatBox.appendChild(p);
}

function addBotMessage(msg) {
  const p = document.createElement("p");
  p.classList.add("bot");
  p.innerText = msg;
  chatBox.appendChild(p);
  chatBox.scrollTop = chatBox.scrollHeight;
  speak(msg);
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}

function startTimer() {
  const t = setInterval(() => {
    if (timeLeft > 0) timerEl.innerText = `Time: ${--timeLeft}`;
    else { clearInterval(t); finishInterview(); }
  }, 1000);
}

function finishInterview() {
  const percent = ((score / questions.length) * 100).toFixed(1);
  addBotMessage(`Interview Over! 🏆 Your Score: ${score}/${questions.length} (${percent}%)`);
  disableInput();
  createPDF(score, percent);
}

function disableInput() {
  userInput.disabled = true;
  sendBtn.disabled = true;
}

sendBtn.onclick = () => {
  const ans = userInput.value.trim();
  if (!ans) return;
  addUserMessage(ans);
  handleAnswer(ans);
  userInput.value = "";
};

userInput.addEventListener("keypress", (e) => e.key === "Enter" && sendBtn.click());

// 📄 Generate PDF
function createPDF(score, percent) {
    const summary = `
    Interview Summary
    ------------------
    Total Questions: ${questions.length}
    Score: ${score}
    Percentage: ${percent}%
    `;
    const blob = new Blob([summary], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Interview_Result.pdf";
    link.click();
}
