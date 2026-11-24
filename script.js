
const menuButton = document.getElementById("menuButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const exitButton = document.getElementById("exitButton");

const settingsOption = document.getElementById("settingsOption");
const chaptersOption = document.getElementById("chaptersOption");
const savesOption = document.getElementById("savesOption");
const aboutOption = document.getElementById("aboutOption");

const startScreen = document.getElementById("startScreen");
const topControls = document.getElementById("topControls");
const startText = document.querySelector(".start-text");

const chapterScreen = document.getElementById("chapterScreen");
const individualChapter = document.getElementById("individualChapter");
const gameScreen = document.getElementById("gameScreen");
const savesScreen = document.getElementById("savesScreen");

const startOptions = document.getElementById("startOptions");
const newGameButton = document.getElementById("newGameButton");
const continueButton = document.getElementById("continueButton");

const saveSlotsContainer = document.getElementById("saveSlots");
const saveModeDescription = document.getElementById("saveModeDescription");
const savesBack = document.getElementById("savesBack");

const chapterIntro = document.getElementById("chapterIntro");
const dialogueBox = document.getElementById("dialogueBox");

const chapterTitle = document.getElementById("chapterTitle");

const chapterBack = document.getElementById("chapterBack");
const returnChapters = document.getElementById("returnChapters");

const chapterButtons = document.querySelectorAll(".chapter-button");

const characterName = document.getElementById("characterName");
const dialogueText = document.getElementById("dialogueText");

const transitionTime = 600;

// SAVE SYSTEM
const SAVE_KEY = "runawayBrideSaveSlots";

let saveSlots = loadAllSaves();
let activeSaveSlot = null;
let savesMode = "load";
let pendingStart = false;

function loadAllSaves() {
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));

        if (Array.isArray(saved) && saved.length === 3) {
            return saved;
        }
    } catch (error) {
        console.error("Unable to read saves:", error);
    }

    return [null, null, null];
}

function writeAllSaves() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveSlots));
    } catch (error) {
        console.error("Unable to store saves:", error);
        alert("Unable to save your game. Your browser storage may be full or unavailable.");
    }
}

function getStoryPathName() {
    if (activeDialogues === storyBranches.getOutOfBed) {
        return "getOutOfBed";
    }

    if (activeDialogues === storyBranches.stayInBed) {
        return "stayInBed";
    }

    if (activeDialogues === storyBranches.yes) {
        return "yes";
    }

    if (activeDialogues === storyBranches.no) {
        return "no";
    }

    return "main";
}

function createSaveData() {
    return {
        chapter: 1,
        chapterTitle: "Roam to feel",

        storyPath: getStoryPathName(),

        currentDialogue: currentDialogue,

        selectedChoice: selectedChoice,

        finalChoicesShown: finalChoicesShown,

        choices: {
            initialChoice:
                ["getOutOfBed", "stayInBed"].includes(selectedChoice)
                    ? selectedChoice
                    : null,

            finalChoice:
                ["yes", "no"].includes(selectedChoice)
                    ? selectedChoice
                    : null
        },

        dialogueReady: dialogueReady,

        timestamp: Date.now()
    };
}

function autoSave() {
    if (activeSaveSlot === null) return;
    if (currentScreen !== "game") return;

    saveSlots[activeSaveSlot] = createSaveData();

    writeAllSaves();

    updateContinueButton();
}

function getSaveData(slotIndex) {
    return saveSlots[slotIndex];
}

function getLatestSaveSlot() {
    let latestSlot = null;
    let latestTime = 0;

    saveSlots.forEach(function(save, index) {
        if (save && save.timestamp > latestTime) {
            latestTime = save.timestamp;
            latestSlot = index;
        }
    });

    return latestSlot;
}

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
let finalChoicesShown = false;

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
        text: "… Surely father will also be displeased with how I have been lately"
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
            name: "",
            text: "You walk towards your vanity."
        },
        {
            name: "YOU",
            text: "Greetings again, you look paler than ever."
        },
        {
            name: "",
            text: "You say to yourself as you see your reflection on the mirror."
        },
        {
            name: "",
            text: "*Knocks*"
        },
        {
            name: "Lady in waiting",
            text: "Good afternoon, my lady. Your washstand—"
        },
        {
            name: "",
            text: "She places it on your vanity’s side table."
        },
        {
            name: "",
            text: "You wash your face with a damp cloth before sitting down on a chair."
        },
        {
            name: "YOU",
            text: "Would you mind washing my feet and arms too."
        },
        {
            name: "Lady in waiting",
            text: "Of course, my Lady"
        },
        {
            name: "",
            text: "Your lady in waiting lowers herself to her knees to clean your ankles."
        },
        {
            name: "",
            text: "She proceeds to wipe the grime off the skin of your arms with gentle care, seeing your preferences to be this way."
        },
        {
            name: "",
            text: "Your lady in waiting seems to have something to say to fill the silence in the room."
        },
        {
            name: "Lady in waiting",
            text: "My lady, perhaps I could accompany you on a way to your personal garden?"
        },
        {
            name: "",
            text: "You checked the seeping sunlight from your wall window."
        },
        {
            name: "YOU",
            text: "Hm, yes, maybe you should."
        },
        {
            name: "YOU",
            text: "Bring me my parasol after this, I want the gardeners out of my garden as well."
        },
        {
            name: "Lady in waiting",
            text: "As you wish, my lady"
        },
        {
            name: "",
            text: "Your lady in waiting finishes her assistance then leaves you to get your parasol."
        },
        {
            name: "",
            text: "You look at the seeping sunlight again."
        },
        {
            name: "",
            text: "It irks you."
        },
        {
            name: "YOU",
            text: "Should I still go?"
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
    ],

    yes: [
        {
            name: "YOU",
            text: "I should, a little sunlight won’t hurt. I have my parasol anyways"
        },
        {
            name: "",
            text: "Your Lady in Waiting returns with your parasol."
        },
        {
            name: "",
            text: "You grab your shawl for some coverage."
        },
        {
            name: "",
            text: "You can now leave your room with ease."
        }
    ],

    no: [
        {
            name: "YOU",
            text: "Sigh…"
        },
        {
            name: "",
            text: "You stood up to close the curtains and painstakingly crawl back to your bed."
        },
        {
            name: "",
            text: "Your Lady in Waiting returns — although you drove her off — You won’t be able to leave your room."
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

gameScreen.appendChild(choiceContainer);

function createChoice(text, value, startsBranch = true) {
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

        autoSave();

        if (startsBranch) {
            startStoryBranch(selectedChoice);
        }
    });

    choiceContainer.appendChild(button);
}

// INITIAL CHOICES
function createInitialChoices() {
    choiceContainer.innerHTML = "";

    createChoice("Get out of bed", "getOutOfBed");
    createChoice("Stay in bed", "stayInBed");
}

createInitialChoices();

function showChoices() {
    dialogueBox.style.display = "none";

    characterName.textContent = "";
    dialogueText.textContent = "";

    choiceContainer.style.display = "flex";

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "none";
    }

    autoSave();
}

// FINAL YES / NO CHOICES
function showFinalChoices() {
    finalChoicesShown = true;

    dialogueBox.style.display = "none";

    characterName.textContent = "";
    dialogueText.textContent = "";

    selectedChoice = null;

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "none";
    }

    choiceContainer.innerHTML = "";

    createChoice("Yes", "yes");
    createChoice("No", "no");

    choiceContainer.style.display = "flex";

    autoSave();
}

// START STORY BRANCH
function startStoryBranch(choice) {
    activeDialogues = storyBranches[choice];

    currentDialogue = 0;

    finalChoicesShown = false;

    choiceContainer.style.display = "none";

    dialogueBox.style.display = "";

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "block";
    }

    autoSave();

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

// SAVES BUTTON
savesOption.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "title") return;

    dropdownMenu.classList.remove("show");

    openSavesScreen("load");
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

// START OPTIONS
startScreen.addEventListener("click", function(event) {
    event.stopPropagation();

    if (currentScreen !== "title") return;

    if (startOptions.classList.contains("show")) return;

    startOptions.classList.add("show");

    // HIDE THE TAP TO START TEXT
    startText.style.display = "none";
});

// OPEN SAVE SLOT SELECTION FOR NEW GAME
newGameButton.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "title") return;

    openSavesScreen("new");
});

// CONTINUE MOST RECENT SAVE
continueButton.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "title") return;

    const latestSlot = getLatestSaveSlot();

    if (latestSlot === null) {
        alert("There are no saved games yet.");
        return;
    }

    loadGame(latestSlot);
});

// START NEW GAME
function startGame() {
    if (hasStarted || currentScreen !== "title") return;

    hasStarted = true;
    currentScreen = "game";

    dropdownMenu.classList.remove("show");
    startOptions.classList.remove("show");

    startText.style.display = "none";

    exitButton.classList.remove("show");

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    setTimeout(function() {
        gameScreen.classList.add("active");

        setTimeout(function() {
            chapterIntro.classList.add("show");

            setTimeout(function() {
                chapterIntro.classList.remove("show");

                setTimeout(function() {
                    dialogueBox.style.display = "";
                    dialogueBox.classList.add("dialogue-visible");

                    currentDialogue = 0;
                    dialogueReady = true;
                    selectedChoice = null;
                    finalChoicesShown = false;

                    activeDialogues = dialogues;

                    createInitialChoices();
                    choiceContainer.style.display = "none";

                    const continueText = dialogueBox.querySelector(".continue-text");

                    if (continueText) {
                        continueText.style.display = "block";
                    }

                    exitButton.classList.add("show");

                    autoSave();

                    typeDialogue();

                }, 1500);

            }, 2000);

        }, 100);

    }, transitionTime);
}

// START NEW GAME IN SELECTED SLOT
function beginNewGame(slotIndex) {
    activeSaveSlot = slotIndex;

    currentDialogue = 0;
    activeDialogues = dialogues;

    selectedChoice = null;
    finalChoicesShown = false;

    isTyping = false;
    dialogueReady = false;
    hasStarted = false;

    createInitialChoices();
    choiceContainer.style.display = "none";

    dialogueBox.style.display = "";
    dialogueBox.classList.remove("dialogue-visible");

    characterName.textContent = "YOU";
    dialogueText.textContent = "";

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "block";
    }

    savesScreen.classList.remove("active");

    currentScreen = "title";

    startText.style.display = "none";

    setTimeout(function() {
        startScreen.classList.remove("fade-out");
        topControls.classList.remove("fade-out");

        startGame();
    }, transitionTime);
}

// TYPEWRITER EFFECT
function typeDialogue() {
    clearInterval(typingTimer);

    const dialogue = activeDialogues[currentDialogue];

    if (!dialogue) return;

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

            autoSave();
        }

    }, 70);
}

// CLICK DIALOGUE TO CONTINUE
gameScreen.addEventListener("click", function(event) {
    if (currentScreen !== "game") return;
    if (!dialogueReady) return;

    if (selectedChoice !== null) {

        if (isTyping) {
            clearInterval(typingTimer);

            dialogueText.textContent = activeDialogues[currentDialogue].text;

            isTyping = false;

            autoSave();
            return;
        }

        if (currentDialogue >= activeDialogues.length - 1) {

            if (
                activeDialogues === storyBranches.getOutOfBed &&
                !finalChoicesShown
            ) {
                showFinalChoices();
            }

            return;
        }

        currentDialogue++;

        autoSave();
        typeDialogue();

        return;
    }

    if (choiceContainer.style.display === "flex") return;

    if (isTyping) {
        clearInterval(typingTimer);

        dialogueText.textContent = activeDialogues[currentDialogue].text;

        isTyping = false;

        autoSave();
        return;
    }

    if (currentDialogue === dialogues.length - 1) {
        showChoices();
        return;
    }

    if (currentDialogue < activeDialogues.length - 1) {
        currentDialogue++;

        autoSave();
        typeDialogue();
    }
});

// SAVES SCREEN
function openSavesScreen(mode) {
    savesMode = mode;

    currentScreen = "saves";

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    saveModeDescription.textContent =
        mode === "new"
            ? "Select a slot for your new game."
            : "Select a save slot to continue.";

    renderSaveSlots();

    savesScreen.classList.add("active");
}

function renderSaveSlots() {
    saveSlotsContainer.innerHTML = "";

    saveSlots.forEach(function(save, index) {

        const slot = document.createElement("div");
        slot.className = "save-slot";

        const info = document.createElement("div");
        info.className = "save-slot-info";

        const title = document.createElement("div");
        title.className = "save-slot-title";
        title.textContent = "SAVE SLOT " + (index + 1);

        const details = document.createElement("div");
        details.className = "save-slot-details";

        const actions = document.createElement("div");
        actions.className = "save-slot-actions";

        if (save) {
            details.innerHTML =
                "Chapter " + save.chapter +
                "<br>" + save.chapterTitle +
                "<br>Dialogue: " + (save.currentDialogue + 1) +
                "<br>Last saved: " +
                new Date(save.timestamp).toLocaleString();

            if (savesMode === "new") {
                const overwriteButton = document.createElement("button");

                overwriteButton.className = "save-action";
                overwriteButton.textContent = "Overwrite";

                overwriteButton.addEventListener("click", function(event) {
                    event.stopPropagation();

                    if (confirm("Overwrite Save Slot " + (index + 1) + "? This cannot be undone.")) {
                        beginNewGame(index);
                    }
                });

                actions.appendChild(overwriteButton);

            } else {
                const loadButton = document.createElement("button");

                loadButton.className = "save-action";
                loadButton.textContent = "Load";

                loadButton.addEventListener("click", function(event) {
                    event.stopPropagation();
                    loadGame(index);
                });

                actions.appendChild(loadButton);
            }

            // DELETE SAVE BUTTON
            const deleteButton = document.createElement("button");

            deleteButton.className = "save-action";
            deleteButton.textContent = "Delete";

            deleteButton.style.color = "#ff0000";
            deleteButton.style.borderColor = "#ff0000";

            deleteButton.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();

                if (confirm("Are you sure you want to delete Save Slot " + (index + 1) + "? This cannot be undone.")) {

                    saveSlots[index] = null;

                    writeAllSaves();

                    renderSaveSlots();

                    updateContinueButton();
                }
            });

            actions.appendChild(deleteButton);

        } else {
            details.classList.add("save-empty");
            details.textContent = "Empty Slot";

            const newButton = document.createElement("button");

            newButton.className = "save-action";
            newButton.textContent = savesMode === "new" ? "Start" : "Empty";

            if (savesMode === "new") {
                newButton.addEventListener("click", function(event) {
                    event.stopPropagation();
                    beginNewGame(index);
                });
            } else {
                newButton.disabled = true;
                newButton.style.opacity = ".4";
                newButton.style.cursor = "default";
            }

            actions.appendChild(newButton);
        }

        info.appendChild(title);
        info.appendChild(details);

        slot.appendChild(info);
        slot.appendChild(actions);

        saveSlotsContainer.appendChild(slot);
    });
}

// LOAD GAME
function loadGame(slotIndex) {
    const save = getSaveData(slotIndex);

    if (!save) {
        alert("This save slot is empty.");
        return;
    }

    const availablePaths = {
        main: dialogues,
        getOutOfBed: storyBranches.getOutOfBed,
        stayInBed: storyBranches.stayInBed,
        yes: storyBranches.yes,
        no: storyBranches.no
    };

    if (!availablePaths[save.storyPath]) {
        alert("This save file is incompatible.");
        return;
    }

    clearInterval(typingTimer);

    activeSaveSlot = slotIndex;

    activeDialogues = availablePaths[save.storyPath];

    currentDialogue = Math.max(
        0,
        Math.min(save.currentDialogue, activeDialogues.length - 1)
    );

    selectedChoice = save.selectedChoice;
    finalChoicesShown = save.finalChoicesShown || false;

    dialogueReady = true;
    hasStarted = true;
    isTyping = false;

    currentScreen = "game";

    savesScreen.classList.remove("active");

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    dropdownMenu.classList.remove("show");
    startOptions.classList.remove("show");

    startText.style.display = "none";

    setTimeout(function() {
        gameScreen.classList.add("active");

        chapterIntro.classList.remove("show");

        dialogueBox.style.display = "";
        dialogueBox.classList.add("dialogue-visible");

        exitButton.classList.add("show");

        const continueText = dialogueBox.querySelector(".continue-text");

        if (finalChoicesShown && selectedChoice === null) {
            dialogueBox.style.display = "none";

            if (continueText) {
                continueText.style.display = "none";
            }

            showFinalChoices();

        } else if (selectedChoice === null &&
                   save.storyPath === "main" &&
                   currentDialogue === dialogues.length - 1) {

            dialogueBox.style.display = "none";

            if (continueText) {
                continueText.style.display = "none";
            }

            showChoices();

        } else {
            choiceContainer.style.display = "none";

            if (continueText) {
                continueText.style.display = "block";
            }

            characterName.textContent = activeDialogues[currentDialogue].name;
            dialogueText.textContent = activeDialogues[currentDialogue].text;
        }

    }, transitionTime);
}

// BACK FROM SAVES
savesBack.addEventListener("click", function(event) {
    event.stopPropagation();

    if (currentScreen !== "saves") return;

    savesScreen.classList.remove("active");

    currentScreen = "title";

    setTimeout(function() {
        startScreen.classList.remove("fade-out");
        topControls.classList.remove("fade-out");
    }, transitionTime);
});

// EXIT BUTTON
exitButton.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "game") return;

    // SAVE BEFORE EXITING
    autoSave();

    clearInterval(typingTimer);

    currentScreen = "title";
    currentDialogue = 0;
    isTyping = false;
    hasStarted = false;
    dialogueReady = false;
    selectedChoice = null;
    finalChoicesShown = false;

    activeDialogues = dialogues;

    exitButton.classList.remove("show");

    gameScreen.classList.remove("active");
    dialogueBox.classList.remove("dialogue-visible");
    chapterIntro.classList.remove("show");

    dialogueBox.style.display = "";

    createInitialChoices();
    choiceContainer.style.display = "none";

    const continueText = dialogueBox.querySelector(".continue-text");

    if (continueText) {
        continueText.style.display = "block";
    }

    characterName.textContent = "YOU";
    dialogueText.textContent = "";

    startScreen.classList.remove("fade-out");
    topControls.classList.remove("fade-out");

    startOptions.classList.remove("show");

    // RESTORE TAP TO START TEXT
    startText.style.display = "";

    dropdownMenu.classList.remove("show");
});

// UPDATE CONTINUE BUTTON
function updateContinueButton() {
    const latestSlot = getLatestSaveSlot();

    continueButton.disabled = latestSlot === null;

    continueButton.style.opacity =
        latestSlot === null ? ".4" : "1";

    continueButton.style.cursor =
        latestSlot === null ? "default" : "pointer";
}

updateContinueButton();

// REFRESH SAVE DATA WHEN RETURNING TO TITLE
const originalRenderSaveSlots = renderSaveSlots;

renderSaveSlots = function() {
    saveSlots = loadAllSaves();
    originalRenderSaveSlots();
    updateContinueButton();
};
