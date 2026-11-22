
const menuButton = document.getElementById("menuButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const exitButton = document.getElementById("exitButton");

const settingsOption = document.getElementById("settingsOption");
const chaptersOption = document.getElementById("chaptersOption");
const aboutOption = document.getElementById("aboutOption");

const startScreen = document.getElementById("startScreen");
const topControls = document.getElementById("topControls");

const chapterScreen = document.getElementById("chapterScreen");
const individualChapter = document.getElementById("individualChapter");
const gameScreen = document.getElementById("gameScreen");

const chapterIntro = document.getElementById("chapterIntro");
const dialogueBox = document.getElementById("dialogueBox");

const chapterTitle = document.getElementById("chapterTitle");

const chapterBack = document.getElementById("chapterBack");
const returnChapters = document.getElementById("returnChapters");

const chapterButtons = document.querySelectorAll(".chapter-button");

const characterName = document.getElementById("characterName");
const dialogueText = document.getElementById("dialogueText");

const transitionTime = 600;

let currentScreen = "title";
let currentDialogue = 0;
let isTyping = false;
let typingTimer = null;
let hasStarted = false;
let dialogueReady = false;

// DIALOGUE
const dialogues = [
    {
        name: "YOU",
        text: "Ugh..."
    },
    {
        name: "YOU",
        text: "What happened to me?"
    },
    {
        name: "YOU",
        text: "It's dark, and I feel very dizzy"
    },
    {
        name: "YOU",
        text: "Where am I?"
    }
];

// DROPDOWN MENU
menuButton.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "title") return;

    dropdownMenu.classList.toggle("show");
});

// CLOSE MENU WHEN CLICKING OUTSIDE
document.addEventListener("click", function(event) {
    if (!event.target.closest("#topControls")) {
        dropdownMenu.classList.remove("show");
    }
});

// SETTINGS BUTTON
settingsOption.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    dropdownMenu.classList.remove("show");

    alert("Settings coming soon!");
});

// CHAPTERS BUTTON
chaptersOption.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    dropdownMenu.classList.remove("show");

    if (currentScreen !== "title") return;

    currentScreen = "chapters";

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    chapterScreen.classList.add("active");
});

// ABOUT BUTTON
aboutOption.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    dropdownMenu.classList.remove("show");

    alert("The Runaway Bride\n\nA mysterious story...");
});

// SCREEN TRANSITION
function switchScreen(oldScreen, newScreen, callback) {
    oldScreen.classList.remove("active");

    setTimeout(function() {
        newScreen.classList.add("active");

        if (callback) {
            callback();
        }
    }, transitionTime);
}

// OPEN INDIVIDUAL CHAPTER
chapterButtons.forEach(function(button) {
    button.addEventListener("click", function(event) {
        event.stopPropagation();

        if (currentScreen !== "chapters") return;

        const chapterNumber = Number(button.dataset.chapter);

        chapterTitle.textContent = "CHAPTER " +
            ["I", "II", "III", "IV", "V"][chapterNumber - 1];

        currentScreen = "individual";

        switchScreen(chapterScreen, individualChapter);
    });
});

// BACK TO MAIN TITLE
chapterBack.addEventListener("click", function(event) {
    event.stopPropagation();

    if (currentScreen !== "chapters") return;

    currentScreen = "title";

    chapterScreen.classList.remove("active");

    setTimeout(function() {
        startScreen.classList.remove("fade-out");
        topControls.classList.remove("fade-out");
    }, transitionTime);
});

// BACK TO CHAPTERS
returnChapters.addEventListener("click", function(event) {
    event.stopPropagation();

    if (currentScreen !== "individual") return;

    currentScreen = "chapters";

    switchScreen(individualChapter, chapterScreen);
});

// START GAME
function startGame() {
    if (hasStarted || currentScreen !== "title") return;

    hasStarted = true;
    currentScreen = "game";

    dropdownMenu.classList.remove("show");
    exitButton.classList.remove("show");

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    setTimeout(function() {
        gameScreen.classList.add("active");

        // FADE IN CHAPTER 1
        setTimeout(function() {
            chapterIntro.classList.add("show");

            // KEEP CHAPTER 1 VISIBLE FOR 2 SECONDS
            setTimeout(function() {

                // FADE OUT CHAPTER 1
                chapterIntro.classList.remove("show");

                // WAIT FOR FADE OUT TO FINISH
                setTimeout(function() {
                    dialogueBox.classList.add("dialogue-visible");

                    currentDialogue = 0;
                    dialogueReady = true;

                    // SHOW EXIT BUTTON WHEN DIALOGUE STARTS
                    exitButton.classList.add("show");

                    typeDialogue();

                }, 1500);

            }, 2000);

        }, 100);

    }, transitionTime);
}

// TITLE SCREEN CLICK ONLY
startScreen.addEventListener("click", function(event) {
    event.stopPropagation();

    if (currentScreen !== "title") return;

    startGame();
});

// TYPEWRITER EFFECT
function typeDialogue() {
    clearInterval(typingTimer);

    const dialogue = dialogues[currentDialogue];

    characterName.textContent = dialogue.name;
    dialogueText.textContent = "";

    let letterIndex = 0;

    isTyping = true;

    typingTimer = setInterval(function() {
        dialogueText.textContent += dialogue.text.charAt(letterIndex);

        letterIndex++;

        if (letterIndex >= dialogue.text.length) {
            clearInterval(typingTimer);
            isTyping = false;
        }

    }, 70);
}

// CLICK DIALOGUE TO CONTINUE
gameScreen.addEventListener("click", function(event) {
    if (currentScreen !== "game") return;
    if (!dialogueReady) return;

    // IF TEXT IS STILL TYPING, SHOW THE WHOLE SENTENCE
    if (isTyping) {
        clearInterval(typingTimer);

        dialogueText.textContent = dialogues[currentDialogue].text;

        isTyping = false;
        return;
    }

    // MOVE TO NEXT DIALOGUE
    if (currentDialogue < dialogues.length - 1) {
        currentDialogue++;
        typeDialogue();
    }
});

// EXIT BUTTON
exitButton.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "game") return;

    // STOP ANY RUNNING TYPEWRITER EFFECT
    clearInterval(typingTimer);

    // RESET GAME VARIABLES
    currentScreen = "title";
    currentDialogue = 0;
    isTyping = false;
    hasStarted = false;
    dialogueReady = false;

    // HIDE EXIT BUTTON
    exitButton.classList.remove("show");

    // RESET GAME SCREEN
    gameScreen.classList.remove("active");
    dialogueBox.classList.remove("dialogue-visible");
    chapterIntro.classList.remove("show");

    // CLEAR OLD DIALOGUE
    characterName.textContent = "YOU";
    dialogueText.textContent = "";

    // RETURN TO TITLE SCREEN
    startScreen.classList.remove("fade-out");
    topControls.classList.remove("fade-out");

    // CLOSE DROPDOWN MENU
    dropdownMenu.classList.remove("show");
});
