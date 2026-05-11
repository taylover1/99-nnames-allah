// This file controls study cards, progress, random cards, and quiz mode.

let currentIndex = 0;
let learnedCards = new Set();
let quizIndex = 0;
let quizScore = 0;
let quizRound = 1;
let answerWasChosen = false;

const studyModeButton = document.querySelector("#studyModeButton");
const quizModeButton = document.querySelector("#quizModeButton");
const studyMode = document.querySelector("#studyMode");
const quizMode = document.querySelector("#quizMode");

const card = document.querySelector("#nameCard");
const arabicName = document.querySelector("#arabicName");
const russianName = document.querySelector("#russianName");
const backRussianName = document.querySelector("#backRussianName");
const meaning = document.querySelector("#meaning");
const explanation = document.querySelector("#explanation");
const cardNumber = document.querySelector("#cardNumber");
const learnedCounter = document.querySelector("#learnedCounter");
const progressFill = document.querySelector("#progressFill");
const nameSelect = document.querySelector("#nameSelect");
const nextButton = document.querySelector("#nextButton");
const randomButton = document.querySelector("#randomButton");

const quizScoreText = document.querySelector("#quizScore");
const quizRoundText = document.querySelector("#quizRound");
const quizMeaning = document.querySelector("#quizMeaning");
const answerOptions = document.querySelector("#answerOptions");
const quizFeedback = document.querySelector("#quizFeedback");
const nextQuizButton = document.querySelector("#nextQuizButton");

function showCard(index) {
    // Always show the front side when a new card appears.
    card.classList.remove("is-flipped");

    const name = names[index];
    arabicName.textContent = name.arabic;
    russianName.textContent = name.name_ru;
    backRussianName.textContent = `${name.name_ru} - ${name.arabic}`;
    meaning.textContent = name.meaning_ru;
    explanation.textContent = name.explanation;

    cardNumber.textContent = `${index + 1} / ${names.length}`;
    nameSelect.value = String(index);

    const progressPercent = ((index + 1) / names.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
}

function fillNameSelect() {
    // Build the dropdown from the same data as the cards.
    names.forEach((name, index) => {
        const option = document.createElement("option");

        option.value = index;
        option.textContent = `${index + 1}. ${name.name_ru}`;

        nameSelect.appendChild(option);
    });
}

function updateLearnedCounter() {
    learnedCounter.textContent = `${learnedCards.size} / ${names.length} изучено`;
}

function goToNextCard() {
    // Count the current card as learned once.
    learnedCards.add(currentIndex);
    updateLearnedCounter();

    currentIndex = (currentIndex + 1) % names.length;
    showCard(currentIndex);
}

function showRandomCard() {
    let randomIndex = Math.floor(Math.random() * names.length);

    // If possible, choose a different card than the current one.
    while (randomIndex === currentIndex && names.length > 1) {
        randomIndex = Math.floor(Math.random() * names.length);
    }

    currentIndex = randomIndex;
    showCard(currentIndex);
}

function switchMode(mode) {
    const quizIsOpen = mode === "quiz";

    studyMode.classList.toggle("is-hidden", quizIsOpen);
    quizMode.classList.toggle("is-hidden", !quizIsOpen);
    studyModeButton.classList.toggle("is-active", !quizIsOpen);
    quizModeButton.classList.toggle("is-active", quizIsOpen);
}

function shuffleArray(items) {
    // Fisher-Yates shuffle: a small, reliable way to mix an array.
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}

function getQuizOptions(correctIndex) {
    const wrongIndexes = names
        .map((name, index) => index)
        .filter((index) => index !== correctIndex);

    const randomWrongIndexes = shuffleArray(wrongIndexes).slice(0, 3);
    return shuffleArray([correctIndex, ...randomWrongIndexes]);
}

function startQuizQuestion() {
    answerWasChosen = false;
    quizIndex = Math.floor(Math.random() * names.length);

    const correctName = names[quizIndex];
    const optionIndexes = getQuizOptions(quizIndex);

    quizMeaning.textContent = correctName.meaning_ru;
    quizScoreText.textContent = `${quizScore} правильных`;
    quizRoundText.textContent = `Вопрос ${quizRound}`;
    quizFeedback.textContent = "";
    quizFeedback.classList.remove("is-wrong");
    answerOptions.innerHTML = "";

    optionIndexes.forEach((optionIndex) => {
        const option = names[optionIndex];
        const button = document.createElement("button");

        button.className = "answer-button";
        button.type = "button";
        button.dataset.index = optionIndex;
        button.textContent = `${option.name_ru} - ${option.arabic}`;
        button.addEventListener("click", () => checkAnswer(button, optionIndex));

        answerOptions.appendChild(button);
    });
}

function checkAnswer(selectedButton, selectedIndex) {
    if (answerWasChosen) {
        return;
    }

    answerWasChosen = true;
    const buttons = answerOptions.querySelectorAll(".answer-button");
    const correctName = names[quizIndex];

    buttons.forEach((button) => {
        button.disabled = true;

        if (Number(button.dataset.index) === quizIndex) {
            button.classList.add("is-correct");
        }
    });

    if (selectedIndex === quizIndex) {
        quizScore += 1;
        quizFeedback.textContent = `Верно: ${correctName.name_ru} - ${correctName.arabic} - ${correctName.meaning_ru}.`;
        quizFeedback.classList.remove("is-wrong");
    } else {
        selectedButton.classList.add("is-wrong");
        quizFeedback.textContent = `Правильный ответ: ${correctName.name_ru} - ${correctName.arabic} - ${correctName.meaning_ru}.`;
        quizFeedback.classList.add("is-wrong");
    }

    quizScoreText.textContent = `${quizScore} правильных`;
}

card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
});

nextButton.addEventListener("click", goToNextCard);
randomButton.addEventListener("click", showRandomCard);

nameSelect.addEventListener("change", () => {
    currentIndex = Number(nameSelect.value);
    showCard(currentIndex);
});

studyModeButton.addEventListener("click", () => switchMode("study"));
quizModeButton.addEventListener("click", () => switchMode("quiz"));

nextQuizButton.addEventListener("click", () => {
    quizRound += 1;
    startQuizQuestion();
});

// Load the first card and first quiz question when the page opens.
fillNameSelect();
showCard(currentIndex);
updateLearnedCounter();
startQuizQuestion();
