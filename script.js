
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

// CHAPTER SUBTITLE
const chapterSubtitle = document.createElement("div");
chapterSubtitle.textContent = "Roam to feel";

chapterSubtitle.style.fontSize = "18px";
chapterSubtitle.style.fontWeight = "normal";
chapterSubtitle.style.letterSpacing = "3px";
chapterSubtitle.style.marginTop = "8px";
chapterSubtitle.style.textAlign = "center";
chapterSubtitle.style.color = "inherit";

chapterIntro.appendChild(chapterSubtitle);

let currentScreen = "title";
let currentDialogue = 0;
let isTyping = false;
let typingTimer = null;
let hasStarted = false;
let dialogueReady = false;
let selectedChoice = null;

// DIALOGUE
const dialogues = [
    {
        name: "YOU",
        text: "…"
    },
    {
        name: "YOU",
        text: "What time is it? How long have I been asleep for?"
    },
    {
        name: "YOU",
        text: "Ah, the sun has probably begun leaning by the west."
    },
    {
        name: "YOU",
        text: "I still don’t feel the greatest — I’d prefer if I go back to sleep, but I’m sure my lady in waiting will come to bother."
    },
    {
        name: "YOU",
        text: "… Surely father will be displeased with how I have been lately"
    },
    {
        name: "YOU",
        text: "I should at least sit up."
    },
    {
        name: "MAID",
        text: "My lady? Are you awake?"
    },
    {
        name: "YOU",
        text: "I’m awake."
    },
    {
        name: "MAID",
        text: "Would you like to get your lady in waiting to fetch you your washstand?"
    },
    {
        name: "YOU",
        text: "I’d appreciate that, yes."
    },
    {
        name: "MAID",
        text: "I’m on it, my Lady"
    }
];

// BRANCHING STORY DIALOGUES

const storyBranches = {

    getOutOfBed: [
        {
            name: "YOU",
            text: "Greetings again, you look paler than ever."
        }
    ],

    stayInBed: [
        {
            name: "MAID",
            text: "Good afternoon, my lady. Your washstand—"
        },
        {
            name: "MAID",
            text: "My lady, I suggest to let your body move a little."
        },
        {
            name: "YOU",
            text: "Perhaps, I should."
        }
    ]

};

// CURRENT STORY PATH
let activeDialogues = dialogues;

// CHOICE MECHANIC
const choiceContainer = document.createElement("div");

choiceContainer.style.display = "none";
choiceContainer.style.flexDirection = "row";
choiceContainer.style.gap = "12px";
choiceContainer.style.position = "absolute";
choiceContainer.style.left = "50%";
choiceContainer.style.bottom = "8%";
choiceContainer.style.transform = "translateX(-50%)";
choiceContainer.style.width = "min(700px, 80%)";
choiceContainer.style.zIndex = "10";

// CHOICE BOX IS SEPARATE FROM THE DIALOGUE BOX
gameScreen.appendChild(choiceContainer);

function createChoice(text, value) {
    const button = document.createElement("button");

    button.textContent = text;

    button.style.width = "50%";
    button.style.padding = "15px";
    button.style.border = "1px solid #247bff";
    button.style.background = "#000000";
    button.style.color = "#a9d4ff";
    button.style.fontFamily = "'Special Elite', cursive";
    button.style.fontSize = "15px";
    button.style.letterSpacing = "2px";
    button.style.cursor = "pointer";
    button.style.textAlign = "center";

    button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (selectedChoice !== null) return;

        selectedChoice = value;

        button.style.background = "#0b1c38";
        button.style.border = "2px solid #247bff";
        button.style.color = "#ffffff";

        Array.from(choiceContainer.children).forEach(function(otherButton) {
            otherButton.disabled = true;
            otherButton.style.cursor = "default";

            if (otherButton !== button) {
                otherButton.style.opacity = ".35";
            }
        });

        console.log("Selected choice:", selectedChoice);

        // START THE SELECTED STORY BRANCH
        startStoryBranch(selectedChoice);
    });

    choiceContainer.appendChild(button);
}

createChoice("Get out of bed", "getOutOfBed");
createChoice("Stay in bed", "stayInBed");

function showChoices() {

    // HIDE THE DIALOGUE BOX SO THE LAST LINE DOES NOT LINGER
    dialogueBox.style.display = "none";

    // CLEAR THE PREVIOUS DIALOGUE
    characterName.textContent = "";
    dialogueText.textContent = "";

    // SHOW THE SEPARATE CHOICE BOX
    choiceContainer.style.display = "flex";

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "none";
    }
}

// START STORY BRANCH
function startStoryBranch(choice) {

    // GET THE SELECTED STORY PATH
    activeDialogues = storyBranches[choice];

    // START FROM THE FIRST DIALOGUE OF THAT PATH
    currentDialogue = 0;

    // HIDE CHOICE BUTTONS
    choiceContainer.style.display = "none";

    // SHOW THE DIALOGUE BOX AGAIN
    dialogueBox.style.display = "";

    // SHOW CONTINUE TEXT AGAIN
    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "block";
    }

    // START THE SELECTED STORY
    typeDialogue();
}

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
                    dialogueBox.style.display = "";
                    dialogueBox.classList.add("dialogue-visible");

                    currentDialogue = 0;
                    dialogueReady = true;
                    selectedChoice = null;

                    // RESET STORY PATH
                    activeDialogues = dialogues;

                    // RESET CHOICES
                    choiceContainer.style.display = "none";

                    // SHOW CONTINUE TEXT
                    const continueText = dialogueBox.querySelector(".continue-text");

                    if (continueText) {
                        continueText.style.display = "block";
                    }

                    Array.from(choiceContainer.children).forEach(function(button) {
                        button.disabled = false;
                        button.style.opacity = "1";
                        button.style.background = "#000000";
                        button.style.border = "1px solid #247bff";
                        button.style.color = "#a9d4ff";
                    });

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

    const dialogue = activeDialogues[currentDialogue];

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

    // PREVENT CONTINUING AFTER A CHOICE HAS BEEN MADE
    if (selectedChoice !== null) {

        // ALLOW THE SELECTED STORY BRANCH TO CONTINUE
        if (isTyping) {
            clearInterval(typingTimer);

            dialogueText.textContent = activeDialogues[currentDialogue].text;

            isTyping = false;
            return;
        }

        // STOP WHEN THE SELECTED BRANCH HAS FINISHED
        if (currentDialogue >= activeDialogues.length - 1) {
            return;
        }

        // MOVE TO NEXT DIALOGUE IN THE SELECTED BRANCH
        currentDialogue++;
        typeDialogue();

        return;
    }

    // IF CHOICES ARE VISIBLE, DO NOT ADVANCE
    if (choiceContainer.style.display === "flex") return;

    // IF TEXT IS STILL TYPING, SHOW THE WHOLE SENTENCE
    if (isTyping) {
        clearInterval(typingTimer);

        dialogueText.textContent = activeDialogues[currentDialogue].text;

        isTyping = false;
        return;
    }

    // SHOW CHOICES AFTER THE FINAL MAID DIALOGUE
    if (currentDialogue === dialogues.length - 1) {
        showChoices();
        return;
    }

    // MOVE TO NEXT DIALOGUE
    if (currentDialogue < activeDialogues.length - 1) {
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
    selectedChoice = null;

    // RESET STORY PATH
    activeDialogues = dialogues;

    // HIDE EXIT BUTTON
    exitButton.classList.remove("show");

    // RESET GAME SCREEN
    gameScreen.classList.remove("active");
    dialogueBox.classList.remove("dialogue-visible");
    chapterIntro.classList.remove("show");

    // RESTORE DIALOGUE BOX
    dialogueBox.style.display = "";

    // RESET CHOICES
    choiceContainer.style.display = "none";

    Array.from(choiceContainer.children).forEach(function(button) {
        button.disabled = false;
        button.style.opacity = "1";
        button.style.background = "#000000";
        button.style.border = "1px solid #247bff";
        button.style.color = "#a9d4ff";
    });

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "block";
    }

    // CLEAR OLD DIALOGUE
    characterName.textContent = "YOU";
    dialogueText.textContent = "";

    // RETURN TO TITLE SCREEN
    startScreen.classList.remove("fade-out");
    topControls.classList.remove("fade-out");

    // CLOSE DROPDOWN MENU
    dropdownMenu.classList.remove("show");
});
