// DOM ELEMENTS
const $ = id => document.getElementById(id);

const [
    menuButton, dropdownMenu, exitButton,
    settingsOption, chaptersOption, savesOption, aboutOption,
    startScreen, topControls, startText,
    chapterScreen, individualChapter, gameScreen, savesScreen,
    aboutScreen, aboutBack, startOptions, newGameButton, continueButton,
    saveSlotsContainer, saveModeDescription, savesBack,
    chapterIntro, dialogueBox, chapterTitle,
    chapterBack, returnChapters, characterName, dialogueText, mcPortrait
] = [
    "menuButton", "dropdownMenu", "exitButton",
    "settingsOption", "chaptersOption", "savesOption", "aboutOption",
    "startScreen", "topControls", ".start-text",
    "chapterScreen", "individualChapter", "gameScreen", "savesScreen",
    "aboutScreen", "aboutBack", "startOptions", "newGameButton", "continueButton",
    "saveSlots", "saveModeDescription", "savesBack",
    "chapterIntro", "dialogueBox", "chapterTitle",
    "chapterBack", "returnChapters", "characterName", "dialogueText", "mcPortrait"
].map((id, i) => i === 9 ? document.querySelector(id) : $(id));

const chapterButtons = document.querySelectorAll(".chapter-button");
const transitionTime = 600;
const PORTRAIT_UNLOCK_DIALOGUE = "Greetings again, you look paler than ever.";

// BACKGROUND MUSIC
const bgm = new Audio("audio/bgm.mp3");
bgm.loop = true;
bgm.preload = "auto";

function playBgmFromStart() {
    bgm.pause();
    bgm.currentTime = 0;

    const playback = bgm.play();
    if (playback) playback.catch(() => {});
}

function pauseBgm(reset = false) {
    bgm.pause();

    if (reset) {
        bgm.currentTime = 0;
    }
}

function resumeTitleBgm() {
    if (currentScreen !== "title" || !bgm.paused) return;

    const playback = bgm.play();
    if (playback) playback.catch(() => {});
}

// Attempt to play title music when the page loads.
const initialBgmPlayback = bgm.play();

if (initialBgmPlayback) {
    initialBgmPlayback.catch(() => {});
}

// Retry playback after the player's first interaction.
document.addEventListener("pointerdown", resumeTitleBgm);
document.addEventListener("keydown", resumeTitleBgm);

// GAME STATE
let currentScreen = "title";
let currentDialogue = 0;
let isTyping = false;
let typingTimer = null;
let hasStarted = false;
let dialogueReady = false;
let selectedChoice = null;
let finalChoicesShown = false;
let mcPortraitUnlocked = false;
let activeDialogues;
let activeSaveSlot = null;
let savesMode = "load";

function setMcPortraitUnlocked(value) {
    mcPortraitUnlocked = value === true;
    window.mcPortraitUnlocked = mcPortraitUnlocked;
}

function syncMcPortrait(speakerName) {
    const speaker = typeof speakerName === "string"
        ? speakerName.trim().toUpperCase()
        : "";

    mcPortrait.classList.toggle(
        "visible",
        mcPortraitUnlocked && speaker === "YOU"
    );
}

// DIALOGUES
const dialogues = [
    { name: "YOU", text: "…" },
    { name: "YOU", text: "What time is it? How long have I been asleep for?" },
    { name: "YOU", text: "Ah, the sun has probably begun leaning by the west." },
    { name: "YOU", text: "I still don’t feel the greatest — I’d prefer if I go back to sleep, but I’m sure my lady in waiting will come to bother." },
    { name: "YOU", text: "… Surely father will also be displeased with how I have been lately" },
    { name: "YOU", text: "I should at least sit up." },
    { name: "MAID", text: "My lady? Are you awake?" },
    { name: "YOU", text: "I’m awake." },
    { name: "MAID", text: "Would you like to get your lady in waiting to fetch you your washstand?" },
    { name: "YOU", text: "I’d appreciate that, yes." },
    { name: "MAID", text: "I’m on it, my Lady" }
];

// BRANCHING STORY DIALOGUES
const storyBranches = {
    getOutOfBed: [
        { name: "", text: "You walk towards your vanity." },
        { name: "YOU", text: "Greetings again, you look paler than ever." },
        { name: "", text: "You say to yourself as you see your reflection on the mirror." },
        { name: "", text: "*Knocks*" },
        { name: "Lady in waiting", text: "Good afternoon, my lady. Your washstand" },
        { name: "", text: "She places it on your vanity’s side table." },
        { name: "", text: "You wash your face with a damp cloth before sitting down on a chair." },
        { name: "YOU", text: "Would you mind washing my feet and arms too." },
        { name: "Lady in waiting", text: "Of course, my Lady" },
        { name: "", text: "Your lady in waiting lowers herself to her knees to clean your ankles." },
        { name: "", text: "She proceeds to wipe the grime off the skin of your arms with gentle care, seeing your preferences to be this way." },
        { name: "", text: "Your lady in waiting seems to have something to say to fill the silence in the room." },
        { name: "Lady in waiting", text: "My lady, perhaps I could accompany you on a way to your personal garden?" },
        { name: "", text: "You checked the seeping sunlight from your wall window." },
        { name: "YOU", text: "Hm, yes, maybe you should." },
        { name: "YOU", text: "Bring me my parasol after this, I want the gardeners out of my garden as well." },
        { name: "Lady in waiting", text: "As you wish, my lady" },
        { name: "", text: "Your lady in waiting finishes her assistance then leaves you to get your parasol." },
        { name: "", text: "You look at the seeping sunlight again." },
        { name: "", text: "It irks you." },
        { name: "YOU", text: "Should I still go?" }
    ],

    stayInBed: [
        { name: "", text: "You stayed lying down on the bed, which concerned the maid" },
        { name: "MAID", text: "My lady, I suggest to let your body move a little." },
        { name: "YOU", text: "Perhaps, I should." },
        { name: "", text: "You got out of your bed." },
        { name: "", text: "You walk forward to your vanity." },
        { name: "YOU", text: "Greetings again, you look paler than ever." },
        { name: "", text: "You say to yourself as you see your reflection on the mirror." },
        { name: "", text: "*Knocks*" },
        { name: "Lady in waiting", text: "Good afternoon, my lady. Your washstand" },
        { name: "", text: "She places it on your vanity’s side table." },
        { name: "", text: "You wash your face with a damp cloth before sitting down on a chair." },
        { name: "YOU", text: "Would you mind washing my feet and arms too." },
        { name: "Lady in waiting", text: "Of course, my Lady" },
        { name: "", text: "Your lady in waiting lowers herself to her knees to clean your ankles." },
        { name: "", text: "She proceeds to wipe the grime off the skin of your arms with gentle care, seeing your preferences to be this way." }
    ],

    yes: [
        { name: "YOU", text: "I should, a little sunlight won’t hurt. I have my parasol anyways" },
        { name: "", text: "Your Lady in Waiting returns with your parasol." },
        { name: "", text: "You grab your shawl for some coverage." },
        { name: "", text: "You can now leave your room with ease." },
        { name: "", text: "You arrive at the garden." },
        { name: "", text: "The gift your father had given you for that one special day that mattered most to him." },
        { name: "YOU", text: "At least it’s well maintained." },
        { name: "", text: "You walk around, taking in the same flowers you always look at—the same flowers that die, the same flowers that get replanted on the very day they die, with no chance to mourn." }
    ],

    no: [
        { name: "YOU", text: "Sigh…" },
        { name: "", text: "You stood up to close the curtains and painstakingly crawl back to your bed." },
        { name: "", text: "Your Lady in Waiting returns, although you drove her off" },
        { name: "", text: "You won’t be able to leave your room." }
    ]
};

activeDialogues = dialogues;

// SAVE SYSTEM
const SAVE_KEY = "runawayBrideSaveSlots";

function loadAllSaves() {
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (Array.isArray(saved) && saved.length === 3) return saved;
    } catch (error) {
        console.error("Unable to read saves:", error);
    }
    return [null, null, null];
}

let saveSlots = loadAllSaves();

function writeAllSaves() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveSlots));
    } catch (error) {
        console.error("Unable to store saves:", error);
        alert("Unable to save your game. Your browser storage may be full or unavailable.");
    }
}

function getStoryPathName() {
    return Object.keys(storyBranches).find(
        path => activeDialogues === storyBranches[path]
    ) || (activeDialogues === dialogues ? "main" : "main");
}

function createSaveData() {
    return {
        chapter: 1,
        chapterTitle: "Roam to feel",
        storyPath: getStoryPathName(),
        currentDialogue,
        selectedChoice,
        finalChoicesShown,
        choices: {
            initialChoice: ["getOutOfBed", "stayInBed"].includes(selectedChoice)
                ? selectedChoice : null,
            finalChoice: ["yes", "no"].includes(selectedChoice)
                ? selectedChoice : null
        },
        dialogueReady,
        mcPortraitUnlocked,
        timestamp: Date.now()
    };
}

function autoSave() {
    if (activeSaveSlot === null || currentScreen !== "game") return;

    saveSlots[activeSaveSlot] = createSaveData();
    writeAllSaves();
    updateContinueButton();
}

function getSaveData(index) {
    return saveSlots[index];
}

function getLatestSaveSlot() {
    let latestSlot = null;
    let latestTime = 0;

    saveSlots.forEach((save, index) => {
        if (save && save.timestamp > latestTime) {
            latestTime = save.timestamp;
            latestSlot = index;
        }
    });

    return latestSlot;
}

// CHAPTER INTRO SUBTITLE
const chapterSubtitle = document.createElement("div");
chapterSubtitle.textContent = "Roam to feel";
Object.assign(chapterSubtitle.style, {
    fontSize: "18px",
    fontWeight: "normal",
    letterSpacing: "3px",
    marginTop: "8px",
    textAlign: "center",
    color: "inherit"
});
chapterIntro.appendChild(chapterSubtitle);

// CHOICE SYSTEM
const choiceContainer = document.createElement("div");

Object.assign(choiceContainer.style, {
    display: "none",
    flexDirection: "row",
    gap: "12px",
    position: "absolute",
    left: "50%",
    bottom: "8%",
    transform: "translateX(-50%)",
    width: "min(700px, 80%)",
    zIndex: "10"
});

gameScreen.appendChild(choiceContainer);

function createChoice(text, value, startsBranch = true) {
    const button = document.createElement("button");
    button.textContent = text;

    Object.assign(button.style, {
        width: "50%",
        padding: "15px",
        border: "1px solid #247bff",
        background: "#000000",
        color: "#a9d4ff",
        fontFamily: "'Special Elite', cursive",
        fontSize: "15px",
        letterSpacing: "2px",
        cursor: "pointer",
        textAlign: "center"
    });

    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        if (selectedChoice !== null) return;

        selectedChoice = value;
        Object.assign(button.style, {
            background: "#0b1c38",
            border: "2px solid #247bff",
            color: "#ffffff"
        });

        Array.from(choiceContainer.children).forEach(other => {
            other.disabled = true;
            other.style.cursor = "default";
            if (other !== button) other.style.opacity = ".35";
        });

        console.log("Selected choice:", selectedChoice);
        autoSave();

        if (startsBranch) startStoryBranch(selectedChoice);
    });

    choiceContainer.appendChild(button);
}

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
    syncMcPortrait("");
    choiceContainer.style.display = "flex";

    const continueText = dialogueBox.querySelector(".continue-text");
    if (continueText) continueText.style.display = "none";

    autoSave();
}

function showFinalChoices() {
    finalChoicesShown = true;
    dialogueBox.style.display = "none";
    characterName.textContent = "";
    dialogueText.textContent = "";
    syncMcPortrait("");
    selectedChoice = null;

    const continueText = dialogueBox.querySelector(".continue-text");
    if (continueText) continueText.style.display = "none";

    choiceContainer.innerHTML = "";
    createChoice("Yes", "yes");
    createChoice("No", "no");
    choiceContainer.style.display = "flex";

    autoSave();
}

function startStoryBranch(choice) {
    activeDialogues = storyBranches[choice];
    currentDialogue = 0;
    finalChoicesShown = false;
    choiceContainer.style.display = "none";
    dialogueBox.style.display = "";

    const continueText = dialogueBox.querySelector(".continue-text");
    if (continueText) continueText.style.display = "block";

    autoSave();
    typeDialogue();
}

// MENU
menuButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen === "title") {
        dropdownMenu.classList.toggle("show");
    }
});

document.addEventListener("click", event => {
    if (!event.target.closest("#topControls")) {
        dropdownMenu.classList.remove("show");
    }
});

// MENU OPTIONS
settingsOption.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    dropdownMenu.classList.remove("show");
    alert("Settings coming soon!");
});

chaptersOption.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    dropdownMenu.classList.remove("show");

    if (currentScreen !== "title") return;

    currentScreen = "chapters";
    pauseBgm(true);

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");
    chapterScreen.classList.add("active");
});

savesOption.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "title") return;

    dropdownMenu.classList.remove("show");
    openSavesScreen("load");
});

aboutOption.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    dropdownMenu.classList.remove("show");

    if (currentScreen !== "title") return;

    currentScreen = "about";
    pauseBgm(true);

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");
    aboutScreen.classList.add("active");
});

// SCREEN NAVIGATION
function returnToTitle(screen) {
    screen.classList.remove("active");
    currentScreen = "title";

    setTimeout(() => {
        startScreen.classList.remove("fade-out");
        topControls.classList.remove("fade-out");
        playBgmFromStart();
    }, transitionTime);
}

aboutBack.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen === "about") returnToTitle(aboutScreen);
});

function switchScreen(oldScreen, newScreen, callback) {
    oldScreen.classList.remove("active");

    setTimeout(() => {
        newScreen.classList.add("active");
        if (callback) callback();
    }, transitionTime);
}

// CHAPTER NAVIGATION
chapterButtons.forEach(button => {
    button.addEventListener("click", event => {
        event.stopPropagation();
        if (currentScreen !== "chapters") return;

        const chapterNumber = Number(button.dataset.chapter);
        chapterTitle.textContent = "CHAPTER " +
            ["I", "II", "III", "IV", "V"][chapterNumber - 1];

        currentScreen = "individual";
        switchScreen(chapterScreen, individualChapter);
    });
});

chapterBack.addEventListener("click", event => {
    event.stopPropagation();
    if (currentScreen === "chapters") returnToTitle(chapterScreen);
});

returnChapters.addEventListener("click", event => {
    event.stopPropagation();
    if (currentScreen !== "individual") return;

    currentScreen = "chapters";
    switchScreen(individualChapter, chapterScreen);
});

// START OPTIONS
startScreen.addEventListener("click", event => {
    event.stopPropagation();

    if (currentScreen !== "title" || startOptions.classList.contains("show")) return;

    startOptions.classList.add("show");
    startText.style.display = "none";
});

newGameButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen === "title") openSavesScreen("new");
});

continueButton.addEventListener("click", event => {
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

// START GAME
function startGame() {
    if (hasStarted || currentScreen !== "title") return;

    hasStarted = true;
    currentScreen = "game";

    pauseBgm(true);

    dropdownMenu.classList.remove("show");
    startOptions.classList.remove("show");
    startText.style.display = "none";
    exitButton.classList.remove("show");
    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    setTimeout(() => {
        gameScreen.classList.add("active");

        setTimeout(() => {
            chapterIntro.classList.add("show");

            setTimeout(() => {
                chapterIntro.classList.remove("show");

                setTimeout(() => {
                    playBgmFromStart();

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
                    if (continueText) continueText.style.display = "block";

                    exitButton.classList.add("show");
                    autoSave();
                    typeDialogue();
                }, 1500);
            }, 2000);
        }, 100);
    }, transitionTime);
}

function beginNewGame(slotIndex) {
    activeSaveSlot = slotIndex;
    currentDialogue = 0;
    activeDialogues = dialogues;
    selectedChoice = null;
    finalChoicesShown = false;
    isTyping = false;
    dialogueReady = false;
    hasStarted = false;

    setMcPortraitUnlocked(false);
    createInitialChoices();
    choiceContainer.style.display = "none";

    dialogueBox.style.display = "";
    dialogueBox.classList.remove("dialogue-visible");
    characterName.textContent = "YOU";
    dialogueText.textContent = "";
    syncMcPortrait("YOU");

    const continueText = dialogueBox.querySelector(".continue-text");
    if (continueText) continueText.style.display = "block";

    savesScreen.classList.remove("active");
    currentScreen = "title";
    startText.style.display = "none";

    setTimeout(() => {
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

    if (dialogue.text.trim() === PORTRAIT_UNLOCK_DIALOGUE) {
        setMcPortraitUnlocked(true);
    }

    characterName.textContent = dialogue.name;
    dialogueText.textContent = "";
    syncMcPortrait(dialogue.name);

    let letterIndex = 0;
    isTyping = true;

    typingTimer = setInterval(() => {
        dialogueText.textContent += dialogue.text.charAt(letterIndex++);

        if (letterIndex >= dialogue.text.length) {
            clearInterval(typingTimer);
            isTyping = false;
            autoSave();
        }
    }, 70);
}

// DIALOGUE PROGRESSION
function finishTyping() {
    clearInterval(typingTimer);
    dialogueText.textContent = activeDialogues[currentDialogue].text;
    isTyping = false;
    autoSave();
}

gameScreen.addEventListener("click", () => {
    if (currentScreen !== "game" || !dialogueReady) return;

    if (selectedChoice !== null) {
        if (isTyping) {
            finishTyping();
            return;
        }

        if (currentDialogue >= activeDialogues.length - 1) {
            if (activeDialogues === storyBranches.getOutOfBed && !finalChoicesShown) {
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
        finishTyping();
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

    pauseBgm(true);

    startScreen.classList.add("fade-out");
    topControls.classList.add("fade-out");

    saveModeDescription.textContent = mode === "new"
        ? "Select a slot for your new game."
        : "Select a save slot to continue.";

    renderSaveSlots();
    savesScreen.classList.add("active");
}

function createSaveButton(text, callback, disabled = false) {
    const button = document.createElement("button");
    button.className = "save-action";
    button.textContent = text;
    button.disabled = disabled;

    if (disabled) {
        button.style.opacity = ".4";
        button.style.cursor = "default";
    } else {
        button.addEventListener("click", callback);
    }

    return button;
}

function renderSaveSlots() {
    saveSlotsContainer.innerHTML = "";

    saveSlots.forEach((save, index) => {
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
                "<br>Last saved: " + new Date(save.timestamp).toLocaleString();

            if (savesMode === "new") {
                actions.appendChild(createSaveButton("Overwrite", event => {
                    event.stopPropagation();

                    if (confirm("Overwrite Save Slot " + (index + 1) + "? This cannot be undone.")) {
                        beginNewGame(index);
                    }
                }));
            } else {
                actions.appendChild(createSaveButton("Load", event => {
                    event.stopPropagation();
                    loadGame(index);
                }));
            }

            actions.appendChild(createSaveButton("Delete", event => {
                event.preventDefault();
                event.stopPropagation();

                if (!confirm("Are you sure you want to delete Save Slot " + (index + 1) + "? This cannot be undone.")) return;

                saveSlots[index] = null;
                writeAllSaves();
                renderSaveSlots();
                updateContinueButton();
            }));

        } else {
            details.classList.add("save-empty");
            details.textContent = "Empty Slot";

            if (savesMode === "new") {
                actions.appendChild(createSaveButton("Start", event => {
                    event.stopPropagation();
                    beginNewGame(index);
                }));
            } else {
                actions.appendChild(createSaveButton("Empty", null, true));
            }
        }

        info.append(title, details);
        slot.append(info, actions);
        saveSlotsContainer.appendChild(slot);
    });
}

// CONTINUE BUTTON STATE
function updateContinueButton() {
    const hasSave = getLatestSaveSlot() !== null;
    continueButton.disabled = !hasSave;
}

// LOAD GAME
function hasReachedPortraitUnlock(save) {
    if (!save) return false;

    if (typeof save.mcPortraitUnlocked === "boolean") {
        return save.mcPortraitUnlocked;
    }

    switch (save.storyPath) {
        case "getOutOfBed":
            return save.currentDialogue >= 1;
        case "stayInBed":
            return save.currentDialogue >= 5;
        case "yes":
        case "no":
            return true;
        default:
            return false;
    }
}

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
    pauseBgm(true);

    activeSaveSlot = slotIndex;
    activeDialogues = availablePaths[save.storyPath];

    currentDialogue = Math.max(
        0,
        Math.min(save.currentDialogue, activeDialogues.length - 1)
    );

    selectedChoice = save.selectedChoice;
    finalChoicesShown = save.finalChoicesShown || false;

    setMcPortraitUnlocked(hasReachedPortraitUnlock(save));

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

    setTimeout(() => {
        playBgmFromStart();

        gameScreen.classList.add("active");
        chapterIntro.classList.remove("show");

        dialogueBox.style.display = "";
        dialogueBox.classList.add("dialogue-visible");
        exitButton.classList.add("show");

        const continueText = dialogueBox.querySelector(".continue-text");

        if (finalChoicesShown && selectedChoice === null) {
            dialogueBox.style.display = "none";
            syncMcPortrait("");
            if (continueText) continueText.style.display = "none";
            showFinalChoices();

        } else if (
            selectedChoice === null &&
            save.storyPath === "main" &&
            currentDialogue === dialogues.length - 1
        ) {
            dialogueBox.style.display = "none";
            syncMcPortrait("");
            if (continueText) continueText.style.display = "none";
            showChoices();

        } else {
            choiceContainer.style.display = "none";
            if (continueText) continueText.style.display = "block";

            characterName.textContent = activeDialogues[currentDialogue].name;
            dialogueText.textContent = activeDialogues[currentDialogue].text;
            syncMcPortrait(activeDialogues[currentDialogue].name);
        }
    }, transitionTime);
}

// BACK FROM SAVES
savesBack.addEventListener("click", event => {
    event.stopPropagation();
    if (currentScreen === "saves") returnToTitle(savesScreen);
});

// EXIT GAME
exitButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen !== "game") return;

    autoSave();
    clearInterval(typingTimer);
    pauseBgm(true);

    currentScreen = "title";
    currentDialogue = 0;
    isTyping = false;
    hasStarted = false;
    dialogueReady = false;
    selectedChoice = null;
    finalChoicesShown = false;
    activeDialogues = dialogues;

    setMcPortraitUnlocked(false);
    syncMcPortrait("");

    exitButton.classList.remove("show");
    gameScreen.classList.remove("active");
    dialogueBox.classList.remove("dialogue-visible");
    chapterIntro.classList.remove("show");

    setTimeout(() => {
        startScreen.classList.remove("fade-out");
        topControls.classList.remove("fade-out");
        startText.style.display = "";
        playBgmFromStart();
    }, transitionTime);
});

// INITIAL SAVE BUTTON STATE
updateContinueButton();