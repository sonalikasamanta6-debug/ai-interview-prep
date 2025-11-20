let score = 0;
let currentQ = 0;
let timeLeft = 300;
let timer;


const questionSets = {
  ai: [
    { q: "What is Artificial Intelligence?", a: "AI is the simulation of human intelligence by machines." },
    { q: "What is Machine Learning?", a: "Machine Learning is a subset of AI where models learn from data." },
    { q: "What is Deep Learning?", a: "Deep Learning uses neural networks to learn complex patterns." },
    { q: "What is Natural Language Processing?", a: "NLP enables computers to understand and process human language." },
    { q: "What is overfitting?", a: "Overfitting means a model performs well on training data but poorly on new data." }
  ],

  data: [
    { q: "What is Data Science?", a: "It is the study of data to extract meaningful insights using statistics and algorithms." },
    { q: "What is supervised learning?", a: "Supervised learning uses labeled data for training models." },
    { q: "What is data visualization?", a: "It means representing data through charts, graphs, and visuals." },
    { q: "What is feature scaling?", a: "Feature scaling normalizes data so features are comparable." },
    { q: "What is a confusion matrix?", a: "It shows the performance of a classification model using TP, TN, FP, FN." }
  ],

  electronics: [
    { q: "What is a diode?", a: "A diode allows current to flow in one direction only." },
    { q: "What is Ohm’s Law?", a: "V = I × R, meaning voltage equals current times resistance." },
    { q: "What is a transistor?", a: "A transistor amplifies or switches electronic signals." },
    { q: "What does a capacitor do?", a: "A capacitor stores and releases electrical energy." },
    { q: "What is the difference between AC and DC?", a: "AC alternates direction, DC flows in one direction." }
  ]
};

// --------------------------- MAIN CHAT FUNCTION ---------------------------
function startChat(field) {
  const questions = questionSets[field];

  // Get DOM elements
  const chatBox = document.getElementById("chatBox");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const timerEl = document.getElementById("timer");

  if (!chatBox || !userInput || !sendBtn || !timerEl) {
    console.error("❌ Missing HTML elements! Check your page structure.");
    return;
  }

  score = 0;
  currentQ = 0;
  timeLeft = 300;

  chatBox.innerHTML = "";

  // --------------------------- MESSAGE FUNCTIONS ---------------------------
  function addUserMessage(msg) {
    const p = document.createElement("p");
    p.classList.add("user");
    p.innerText = msg;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
    speak(msg); // user speech 🔊
  }

  async function addBotMessage(msg) {
    // show typing effect first
    const typing = document.createElement("p");
    typing.classList.add("bot");
    typing.innerText = "Typing...";
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    await new Promise(res => setTimeout(res, 1000)); // delay 1 second

    typing.remove(); // remove typing text
    const p = document.createElement("p");
    p.classList.add("bot");
    p.innerText = msg;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
    speak(msg); // bot speech 🔊
  }

  function speak(text) {
    if (!text || !window.speechSynthesis) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.pitch = 1;
    speech.rate = 1;
    speech.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  // --------------------------- ASK QUESTION ---------------------------
  async function askQuestion() {
    if (currentQ < questions.length) {
      await addBotMessage(`Q${currentQ + 1}: ${questions[currentQ].q}`);
    } else {
      const percent = ((score / questions.length) * 100).toFixed(2);
      await addBotMessage(`✅ Interview complete!`);
      await addBotMessage(`Your score: ${score}/${questions.length} (${percent}%)`);
      clearInterval(timer);
      disableInput();
    }
  }

  // --------------------------- DISABLE INPUT ---------------------------
  function disableInput() {
    sendBtn.disabled = true;
    userInput.disabled = true;
  }

  // --------------------------- HANDLE ANSWER ---------------------------
  async function handleAnswer(answer) {
    if (!answer) return;

    const correctAns = questions[currentQ].a.toLowerCase();
    if (answer.toLowerCase().includes(correctAns.split(" ")[0])) {
      score++;
      await addBotMessage("✅ Correct!");
    } else {
      await addBotMessage(`❌ Correct answer: ${questions[currentQ].a}`);
    }

    currentQ++;
    setTimeout(askQuestion, 1000);
  }

  // --------------------------- TIMER ---------------------------
  function startTimer() {
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        timerEl.innerText = `⏱ Time: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
          .toString()
          .padStart(2, "0")}`;
      } else {
        clearInterval(timer);
        addBotMessage("⏰ Time’s up! Interview over.");
        disableInput();
      }
    }, 1000);
  }

  // --------------------------- EVENT LISTENERS ---------------------------
  sendBtn.addEventListener("click", () => {
    const answer = userInput.value.trim();
    if (!answer) return;
    addUserMessage(answer);
    handleAnswer(answer);
    userInput.value = "";
  });

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // --------------------------- START CHAT ---------------------------
  addBotMessage(`Welcome to your ${field.toUpperCase()} Interview! Let's begin.`);
  askQuestion();
  startTimer();
}



const demoBtn = document.getElementById('demo-btn');
const modal = document.getElementById('demo-modal');
const closeBtn = document.querySelector('.close-btn');

demoBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});
