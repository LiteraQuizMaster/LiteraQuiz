/* =========================================================
   CONFIG / SYSTEM STATE
========================================================= */
window.APP_VERSION = "2026.05.21.03";  

let profileFormReturnScreen = 'profile-menu-screen';

function openProfileFromStart(){
    profileFormReturnScreen = 'start-screen';
    loadMyProfileData();
    goToScreen('profile-form-screen');
}
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHC6OOOZ_13b5nhyTV99mfYs0Qo_7pcFKPFRYhJTSH3_31Ujr01gmvQqvnDOMqk0qFm5nlH0FkjefP/pub?output=csv";
const findCountrySheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHC6OOOZ_13b5nhyTV99mfYs0Qo_7pcFKPFRYhJTSH3_31Ujr01gmvQqvnDOMqk0qFm5nlH0FkjefP/pub?gid=622285256&single=true&output=csv";
const weeklySheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHC6OOOZ_13b5nhyTV99mfYs0Qo_7pcFKPFRYhJTSH3_31Ujr01gmvQqvnDOMqk0qFm5nlH0FkjefP/pub?gid=1053384344&single=true&output=csv";

let currentWeeklyChallenge = null;
const DEBUG = false;
const log = (...args) => DEBUG && console.log(...args);
// --- ΜΕΤΑΒΛΗΤΕΣ ΣΥΣΤΗΜΑΤΟΣ ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let userAnswers = [];
let pendingUnlockAvatar=null;
let lastSupportType = ""; // Μεταβλητή για να ξέρουμε τι έστειλε
let menuMusicTimeout, isMenuMusicPlaying = false, isMuted = false, musicTick = 0;
let musicEnabled = localStorage.getItem('literaMusicEnabled') !== 'false';
let soundEffectsEnabled = localStorage.getItem('literaSoundEffectsEnabled') !== 'false';
let currentGameMode="Answer10",
    streak=0,
    maxStreak=0,
    currentCorrectAnswers=0,
    perfect10Count=0,
    timeAttackTotalTime=45,
    timeAttackElapsed=0;
let bonusQuestionActive=false,bonusQuestionUsedThisRun=false,bonusQuestionData=null,usedBonusQuestions=[];
let unlockedAvatars=JSON.parse(localStorage.getItem('literaUnlockedAvatars')||'[]');
let allQuestions = [], gameQuestions = [], currentIdx = 0, score = 0, timeLeft = 20, timerInterval;
let selectedCategory = "", selectedDifficulty = "";
let currentHS_Cat = 'Ελληνική',
    currentHS_Diff = 'Scaling',
    currentHS_Mode = 'Answer10',
    currentHS_Type = 'personal'; // personal | global
let currentRankTitle = "";
let pendingRankUpData=null;
let lastMilestone = 0; // Για το Level Up εφέ
let initiationCompleted = false;
let forceRankHelpTier = null;
let initiationStep = 0;
let avatarHelpUsedThisRun = false;
let rankHelpUsedThisRun = false;
let poeticRetryPending = false;
let freezeTimeUntil = 0;
let heroBoostUntil = 0;
let heroBoostQuestionActive = false;
let genderHelpUsedThisRun = false;
let dragonBonusPending = false;
let maleShieldCharges = 2;
let refreshHelpUsedThisRun = false;
let isQuestionTransitionLocked = false;
let findCountryTimer = null;
let findCountryDragStartX = 0;
let findCountryDragCurrentX = 0;
let findCountryDragging = false;
let findCountryTimeLeft = 10;
let findCountryRoundIndex = 0;
let findCountryPergamena = 0;
let findCountryCorrect = 0;
let findCountryWrong = 0;
let findCountryActiveAuthor = null;
let findCountryLocked = false;
let activeAvatarTab = "Πεζογραφία";
let playerProfile = {
 

    /* =========================
       ACCOUNT CORE
    ========================= */

    username: "",
    avatar: "",
    avatarName: "",
    uid: "",

    authType: "guest",        // guest | standard | google
    accountKey: "",
    isAuthenticated: false,

    /* =========================
       PROFILE DATA
    ========================= */

    realName: "",
    rankTitleMode: "male",

    prose: [],
    poets: [],
    playwrights: [],
    books: [],
    heroes: [],

    /* =========================
       PHOTO MODE
    ========================= */

    usesCustomPhoto: false,
    customPhotoDataUrl: "",

    /* =========================
       CARD APPEARANCE
    ========================= */

    cardTheme: "rank-default"

};

const FLAG_LIST = [

"assets/flags/Albania.webp",
"assets/flags/Argentina.webp",
"assets/flags/Australia.webp",
"assets/flags/Austria.webp",

"assets/flags/Belarus.webp",
"assets/flags/Belgium.webp",
"assets/flags/Brazil.webp",
"assets/flags/Bulgaria.webp",
"assets/flags/Canada.webp",

"assets/flags/Chile.webp",
"assets/flags/China.webp",
"assets/flags/Colombia.webp",
"assets/flags/Cuba.webp",
"assets/flags/Croatia.webp",

"assets/flags/Czech.webp",
"assets/flags/Denmark.webp",
"assets/flags/Egypt.webp",
"assets/flags/England.webp",

"assets/flags/Finland.webp",
"assets/flags/France.webp",
"assets/flags/Germany.webp",
"assets/flags/Greece.webp",

"assets/flags/Hungary.webp",
"assets/flags/India.webp",
"assets/flags/Iran.webp",
"assets/flags/Ireland.webp",

"assets/flags/Israel.webp",
"assets/flags/Italy.webp",
"assets/flags/Japan.webp",
"assets/flags/Lebanon.webp",

"assets/flags/Mexico.webp",
"assets/flags/Netherlands.webp",
"assets/flags/Nigeria.webp",
"assets/flags/Norway.webp",

"assets/flags/Palestine.webp",
"assets/flags/Peru.webp",
"assets/flags/Poland.webp",
"assets/flags/Portugal.webp",

"assets/flags/Romania.webp",
"assets/flags/Russia.webp",
"assets/flags/Serbia.webp",
"assets/flags/South_Korea.webp",

"assets/flags/South_Africa.webp",
"assets/flags/Spain.webp",
"assets/flags/Sweden.webp",
"assets/flags/Switzerland.webp",

"assets/flags/Turkey.webp",
"assets/flags/Ukraine.webp",
"assets/flags/USA.webp"

];

function preloadFlags(){
    log("Preloading flags...");
    FLAG_LIST.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

function getFlagPath(countryName){

    return "assets/flags/" +
        countryName
            .trim()
            .replace(/\s+/g, "_")
            .replace(/'/g, "")
            + ".webp";

}


function findAvatarById(id){

    for(const category in allAvatars){

        const found = allAvatars[category]
            .find(av => av.id === id);

        if(found) return found;
    }

    return null;
}

function normalizeAvatarFileName(name){
    if(!name) return "";

    return name
        .trim()
        .replace(/\s+/g, "_")
        .replace(/'/g, "")
        .replace(/á|à|ä|â|Á|À|Ä|Â/g, "a")
        .replace(/é|è|ë|ê|É|È|Ë|Ê/g, "e")
        .replace(/í|ì|ï|î|Í|Ì|Ï|Î/g, "i")
        .replace(/ó|ò|ö|ô|Ó|Ò|Ö|Ô/g, "o")
        .replace(/ú|ù|ü|û|Ú|Ù|Ü|Û/g, "u")
        .replace(/ç|Ç/g, "c")
        .replace(/ñ|Ñ/g, "n")
        .replace(/ø|Ø/g, "o");
}

function getAvatarCategoryFromProfile(){
    const avatarName = playerProfile.avatarName;

    if(playerProfile.poets.includes(avatarName)) return "poets";
    if(playerProfile.prose.includes(avatarName)) return "prose";
    if(playerProfile.playwrights.includes(avatarName)) return "playwrights";
    if(playerProfile.heroes.includes(avatarName)) return "heroes";

    return "";
}

function getLocalAvatarPath(){
    const category = getAvatarCategoryFromProfile();
    const name = playerProfile.avatarName;

    if(!category || !name){
        return playerProfile.avatar || "assets/default-avatar.png";
    }

    return getAvatarImagePath(category, name);
}

function getAvatarImagePath(category, name){
    const safeName = normalizeAvatarFileName(name);

    switch(category){
        case "poets":
            return `assets/avatar-poets/${safeName}.webp`;

        case "prose":
            return `assets/avatar-novelists/${safeName}.webp`;

        case "playwrights":
            return `assets/avatar-playwrights/${safeName}.webp`;

        case "heroes":
            return `assets/avatar-heroes/${safeName}.webp`;

        default:
            return playerProfile.avatar || "assets/default-avatar.png";
    }
}

function formatQuestionText(text){

    if(!text) return "";

    // Bold (**text**)
    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    return text;
}

window.addEventListener("load", () => {

    setTimeout(() => {
        preloadFlags();
    }, 800);

});

function isGoogleUser(){
    return playerProfile.authType === "google";
}

/* =========================================================
   FIND COUNTRY – COUNTRY DATA
========================================================= */
let currentCountryLang = "el";
let currentFindCountryLeft = null;
let currentFindCountryRight = null;
let currentFindCountryRoundPool = [];


function shuffleArray(arr){
    return [...arr].sort(() => Math.random() - 0.5);
}

function pickTwoCountries(){
    const keys = Object.keys(findCountryData);
    const shuffled = shuffleArray(keys);

    return [
        findCountryData[shuffled[0]],
        findCountryData[shuffled[1]]
    ];
}

function renderFindCountryIntro(){
    if(!currentFindCountryLeft || !currentFindCountryRight) return;

    const leftFlag = document.getElementById("find-country-left-flag");
    const rightFlag = document.getElementById("find-country-right-flag");
    const leftName = document.getElementById("find-country-left-name");
    const rightName = document.getElementById("find-country-right-name");

    if(leftFlag){
        leftFlag.src = currentFindCountryLeft.flag;
        leftFlag.alt = currentCountryLang === "el"
            ? currentFindCountryLeft.name_el
            : currentFindCountryLeft.name_en;
    }

    if(rightFlag){
        rightFlag.src = currentFindCountryRight.flag;
        rightFlag.alt = currentCountryLang === "el"
            ? currentFindCountryRight.name_el
            : currentFindCountryRight.name_en;
    }

    if(leftName){
        leftName.textContent = currentCountryLang === "el"
            ? currentFindCountryLeft.name_el
            : currentFindCountryLeft.name_en;
    }

    if(rightName){
        rightName.textContent = currentCountryLang === "el"
            ? currentFindCountryRight.name_el
            : currentFindCountryRight.name_en;
    }
}

function buildFindCountryRoundPool(){
    if(!currentFindCountryLeft || !currentFindCountryRight) return;

    const leftAuthors = currentFindCountryLeft.authors.map(author => ({
        ...author,
        countryKey: "left"
    }));

    const rightAuthors = currentFindCountryRight.authors.map(author => ({
        ...author,
        countryKey: "right"
    }));

    currentFindCountryRoundPool = shuffleArray([
        ...leftAuthors,
        ...rightAuthors
    ]).slice(0, 16);
}

async function openFindCountryIntro(){

    if(Object.keys(findCountryData).length === 0){
        fetchFindCountryData();
        alert("Φορτώνουν οι χώρες. Δοκίμασε ξανά σε λίγο.");
        return;
    }

    const countries = pickTwoCountries();

    currentFindCountryLeft = countries[0];
    currentFindCountryRight = countries[1];

    renderFindCountryIntro();

    const leftFlag = currentFindCountryLeft.flag;
    const rightFlag = currentFindCountryRight.flag;

    await preloadSelectedFlags(leftFlag, rightFlag);

    goToScreen("find-country-intro-screen");

    startFlagShuffle(leftFlag, rightFlag);
}

function updateFindCountryGameUI(){
    const timerEl = document.getElementById("find-country-timer");
    const roundEl = document.getElementById("find-country-round");
    const scrollEl = document.getElementById("find-country-scrolls");
    const fillEl = document.getElementById("find-country-progress-fill");

    if(timerEl){
        timerEl.textContent = `${Math.max(0, findCountryTimeLeft).toFixed(1)}s`;
    }

    if(roundEl){
        roundEl.textContent = `${Math.min(findCountryRoundIndex + 1, 16)} / 16`;
    }

    if(scrollEl){
        scrollEl.textContent = findCountryPergamena;
    }

    if(fillEl){
        const pct = Math.max(0, Math.min(100, (findCountryTimeLeft / 10) * 100));
        fillEl.style.width = pct + "%";
    }
}

let findCountryData = {};

function fetchFindCountryData() {
    Papa.parse(findCountrySheetURL, {
        download: true,
        header: true,
        skipEmptyLines: true,

        complete: res => {
            const rows = res.data || [];
            const grouped = {};

            log("Find Country raw rows:", rows);

            rows.forEach(row => {
                const countryKey = String(row.countrycode || "").trim().toLowerCase();
                if (!countryKey) return;

const countryNameEl = String(row.country || "").trim();
const countryNameEn = String(row.country_eng || "").trim();

if(!countryNameEn){
    console.warn("Missing country_eng for flag:", row);
    return;
}

const flagPath = getFlagPath(countryNameEn);

                const authorEl = String(row.full_name || "").trim();
                const authorEn = String(row.full_name_eng || "").trim();

                if (!authorEl || !authorEn || !countryNameEl || !countryNameEn) return;

                if (!grouped[countryKey]) {
                    grouped[countryKey] = {
                        name_el: countryNameEl,
                        name_en: countryNameEn,
                        flag: flagPath,
                        authors: []
                    };
                }

                grouped[countryKey].authors.push({
                    el: authorEl,
                    en: authorEn
                });
            });

            findCountryData = grouped;
            log("Find Country data loaded:", findCountryData);
        },

        error: err => {
            console.error("Find Country sheet load error:", err);
        }
    });
}   

function renderFindCountryGameSides(){
    const leftFlag = document.getElementById("find-country-game-left-flag");
    const rightFlag = document.getElementById("find-country-game-right-flag");
    const leftName = document.getElementById("find-country-game-left-name");
    const rightName = document.getElementById("find-country-game-right-name");

    if(leftFlag){
        leftFlag.src = currentFindCountryLeft.flag;
        leftFlag.alt = currentCountryLang === "el" ? currentFindCountryLeft.name_el : currentFindCountryLeft.name_en;
    }

    if(rightFlag){
        rightFlag.src = currentFindCountryRight.flag;
        rightFlag.alt = currentCountryLang === "el" ? currentFindCountryRight.name_el : currentFindCountryRight.name_en;
    }

    if(leftName){
        leftName.textContent = currentCountryLang === "el" ? currentFindCountryLeft.name_el : currentFindCountryLeft.name_en;
    }

    if(rightName){
        rightName.textContent = currentCountryLang === "el" ? currentFindCountryRight.name_el : currentFindCountryRight.name_en;
    }
}

function loadFindCountryRound(){
    if(findCountryRoundIndex >= currentFindCountryRoundPool.length || findCountryRoundIndex >= 16){
        finishFindCountryGame();
        return;
    }

    findCountryLocked = false;
    findCountryActiveAuthor = currentFindCountryRoundPool[findCountryRoundIndex];

    const authorBox = document.getElementById("find-country-author-box");
    const toast = document.getElementById("find-country-toast");

    if(authorBox){
        authorBox.classList.remove("correct-flash", "wrong-flash");
        authorBox.textContent = currentCountryLang === "el"
            ? findCountryActiveAuthor.el
            : findCountryActiveAuthor.en;
            fitFindCountryAuthorText();
    }

    if(toast){
        toast.textContent = "";
    }

    updateFindCountryGameUI();
}

function fitFindCountryAuthorText(){
    const box = document.getElementById("find-country-author-box");
    if(!box) return;

    const isMobile = window.innerWidth <= 480;

    let size = isMobile ? 1.05 : 1.45;
    const minSize = isMobile ? 0.62 : 0.75;

    box.style.fontSize = size + "rem";

    requestAnimationFrame(() => {
        while(box.scrollWidth > box.clientWidth && size > minSize){
            size -= 0.04;
            box.style.fontSize = size + "rem";
        }
    });
}

function startFindCountryTimer(){
    clearInterval(findCountryTimer);

    findCountryTimer = setInterval(() => {
        findCountryTimeLeft = Math.max(0, findCountryTimeLeft - 0.1);
        updateFindCountryGameUI();

        if(findCountryTimeLeft <= 0){
            clearInterval(findCountryTimer);
            finishFindCountryGame();
        }
    }, 100);
}

function startFindCountryGame(){
    const overlay = document.getElementById("find-country-finish-overlay");
if(overlay){
    overlay.style.display = "none";
}
    if(!currentFindCountryLeft || !currentFindCountryRight){
        openFindCountryIntro();
        return;
    }

    buildFindCountryRoundPool();

    findCountryTimeLeft = 10;
    findCountryRoundIndex = 0;
    findCountryPergamena = 0;
    findCountryCorrect = 0;
    findCountryWrong = 0;
    findCountryLocked = false;

    renderFindCountryGameSides();
    updateFindCountryGameUI();
    loadFindCountryRound();

    goToScreen('find-country-game-screen');
    startFindCountryTimer();
}

function answerFindCountry(side){

    if(findCountryLocked || !findCountryActiveAuthor) return;

    findCountryLocked = true;

    const isCorrect =
        findCountryActiveAuthor.countryKey === side;

    const authorBox =
        document.getElementById("find-country-author-box");

    const toast =
        document.getElementById("find-country-toast");

    if(isCorrect){

        findCountryCorrect++;
        findCountryPergamena += 2;
        findCountryTimeLeft += 2;

        /* 🔊 σωστός ήχος */
        if(typeof playCorrect === "function"){
            playCorrect();
        }
        vibrateFeedback(40);

        if(authorBox){
            authorBox.classList.add("correct-flash");
        }

        if(toast){
            toast.innerHTML =
                "Σωστό! +2s και +2 <img src='assets/rank_goals/Pergamenas.webp' style='width:16px;height:16px;vertical-align:middle;'>";
        }

    }else{

        findCountryWrong++;

        findCountryTimeLeft =
            Math.max(0, findCountryTimeLeft - 1);

        /* 🔊 λάθος ήχος */
        if(typeof playWrong === "function"){
            playWrong();
        }
        vibrateFeedback([80, 40, 80]);

        if(authorBox){
            authorBox.classList.add("wrong-flash");
        }

        if(toast){
            toast.textContent =
                "Λάθος! -1s";
        }

    }

    updateFindCountryGameUI();

    setTimeout(() => {

        findCountryRoundIndex++;

        if(
            findCountryTimeLeft <= 0 ||
            findCountryRoundIndex >= 16 ||
            findCountryRoundIndex >= currentFindCountryRoundPool.length
        ){
            finishFindCountryGame();
            return;
        }

        loadFindCountryRound();

    }, 650);

}

function vibrateFeedback(pattern){
    if("vibrate" in navigator){
        navigator.vibrate(pattern);
    }
}

function finishFindCountryGame(){
    clearInterval(findCountryTimer);

    if(findCountryPergamena > 0){
        addPergamena(findCountryPergamena);
    }

    const overlay = document.getElementById("find-country-finish-overlay");
    const correctEl = document.getElementById("find-country-finish-correct");
    const wrongEl = document.getElementById("find-country-finish-wrong");
    const pergamenaEl = document.getElementById("find-country-finish-pergamena");
    const roundsEl = document.getElementById("find-country-finish-rounds");

    if(correctEl) correctEl.textContent = findCountryCorrect;
    if(wrongEl) wrongEl.textContent = findCountryWrong;
    if(pergamenaEl) pergamenaEl.textContent = findCountryPergamena;
    if(roundsEl) roundsEl.textContent = `${Math.min(findCountryRoundIndex, 16)} / 16`;

    if(overlay){
        overlay.style.display = "flex";
    }
}

function restartFindCountryGame(){

    const overlay = document.getElementById("find-country-finish-overlay");
    if(overlay){
        overlay.style.display = "none";
    }

    const countries = pickTwoCountries();

    currentFindCountryLeft = countries[0];
    currentFindCountryRight = countries[1];

    renderFindCountryGameSides();

    startFindCountryGame();

}

function closeFindCountryFinishToChallenges(){
    const overlay = document.getElementById("find-country-finish-overlay");
    if(overlay){
        overlay.style.display = "none";
    }

    goToScreen('challenge-options-screen');
}

function exitFindCountryGame(){
    clearInterval(findCountryTimer);
    goToScreen('challenge-options-screen');
}

function setupFindCountryDrag(){
    const box = document.getElementById("find-country-author-box");
    if(!box) return;

    box.addEventListener("pointerdown", startFindCountryDrag);
    box.addEventListener("pointermove", moveFindCountryDrag);
    box.addEventListener("pointerup", endFindCountryDrag);
    box.addEventListener("pointercancel", endFindCountryDrag);
}

function startFindCountryDrag(e){
    if(findCountryLocked) return;

    findCountryDragging = true;
    findCountryDragStartX = e.clientX;
    findCountryDragCurrentX = 0;

    const box = document.getElementById("find-country-author-box");
    if(box){
        box.classList.add("dragging");
        box.setPointerCapture(e.pointerId);
    }
}

function moveFindCountryDrag(e){
    if(!findCountryDragging) return;

    const box = document.getElementById("find-country-author-box");
    if(!box) return;

    findCountryDragCurrentX = e.clientX - findCountryDragStartX;

    box.style.transform = `translateX(${findCountryDragCurrentX}px)`;

    // visual feedback
    const opacity = Math.min(1, Math.abs(findCountryDragCurrentX) / 70);

    if(findCountryDragCurrentX > 0){
        box.style.background =
            `linear-gradient(180deg,
            rgba(46,204,113,${opacity}),
            rgba(39,174,96,${opacity}))`;
    }else if(findCountryDragCurrentX < 0){
        box.style.background =
            `linear-gradient(180deg,
            rgba(231,76,60,${opacity}),
            rgba(192,57,43,${opacity}))`;
    }else{
        box.style.background = "";
    }

    // Auto-trigger αν βγει αρκετά εκτός οθόνης
    const screenWidth = window.innerWidth;
    if(findCountryDragCurrentX > screenWidth * 0.4){
        findCountryDragging = false;
        box.classList.remove("dragging");
        box.style.transition = "transform 0.15s ease";
        box.style.transform = `translateX(${screenWidth}px)`;
        setTimeout(() => {
            box.style.transition = "";
            box.style.transform = "translateX(0)";
            box.style.background = "";
            answerFindCountry("right");
        }, 150);
    } else if(findCountryDragCurrentX < -screenWidth * 0.4){
        findCountryDragging = false;
        box.classList.remove("dragging");
        box.style.transition = "transform 0.15s ease";
        box.style.transform = `translateX(-${screenWidth}px)`;
        setTimeout(() => {
            box.style.transition = "";
            box.style.transform = "translateX(0)";
            box.style.background = "";
            answerFindCountry("left");
        }, 150);
    }
}

function endFindCountryDrag(){
    if(!findCountryDragging) return;

    findCountryDragging = false;

    const box = document.getElementById("find-country-author-box");
    if(!box) return;

    box.classList.remove("dragging");

    const delta = findCountryDragCurrentX;
    const screenWidth = window.innerWidth;

    if(delta <= -55){
        box.style.transition = "transform 0.22s ease";
        box.style.transform = `translateX(-${screenWidth}px)`;
        setTimeout(() => {
            box.style.transition = "";
            box.style.transform = "translateX(0)";
            box.style.background = "";
            answerFindCountry("left");
        }, 180);
    }
    else if(delta >= 55){
        box.style.transition = "transform 0.22s ease";
        box.style.transform = `translateX(${screenWidth}px)`;
        setTimeout(() => {
            box.style.transition = "";
            box.style.transform = "translateX(0)";
            box.style.background = "";
            answerFindCountry("right");
        }, 180);
    }
    else{
        box.style.transform = "translateX(0)";
        box.style.background = "";
    }
}


document.addEventListener("keydown", (e) => {
    const screen = document.getElementById("find-country-game-screen");
    if(!screen || screen.style.display === "none") return;

    if(e.key === "ArrowLeft"){
        answerFindCountry("left");
    }

    if(e.key === "ArrowRight"){
        answerFindCountry("right");
    }
});
/* =========================
   RANK TITLE MODE HELPERS
========================= */

function getRankTitleMode(){
    return playerProfile.rankTitleMode ||
           localStorage.getItem('literaRankTitleMode') ||
           "male";
}

function setRankTitleMode(mode){
    const safeMode = mode === "female" ? "female" : "male";

    playerProfile.rankTitleMode = safeMode;
    localStorage.setItem('literaRankTitleMode', safeMode);

    if (typeof saveFullPlayerProfile === "function") {
        saveFullPlayerProfile();
    }

    renderRankTitleTabs();
    renderRankInfo();
    updateProfileUI();
}

function getRankTitle(rank){
    const mode = getRankTitleMode();

    if(mode === "female"){
        return rank.titleFemale || rank.titleMale || rank.title || "";
    }

    return rank.titleMale || rank.title || "";
}

function renderRankTitleTabs(){
    const maleBtn = document.getElementById('rank-mode-male');
    const femaleBtn = document.getElementById('rank-mode-female');
    const mode = getRankTitleMode();

    if(maleBtn){
        maleBtn.classList.toggle('active', mode === 'male');
    }
    if(femaleBtn){
        femaleBtn.classList.toggle('active', mode === 'female');
    }
}



/* =========================================================
   AUDIO SYSTEM
========================================================= */

// --- ΗΧΟΙ ---
function playSynthSound(freq, type, duration, vol = 0.1) {
    if (isMuted || !soundEffectsEnabled || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration * 0.9);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const playClick = () => playSynthSound(600, 'sine', 0.1, 0.05);

function playWCSuccess() {
    const a = new Audio('assets/Sounds/Weekly_Success.wav');
    a.volume = 0.7;
    a.play().catch(()=>{});
}
function playWCFail() {
    const a = new Audio('assets/Sounds/Weekly_Fail.mp3');
    a.volume = 0.7;
    a.play().catch(()=>{});
}
function playAvatarUnlock() {
    const a = new Audio('assets/Sounds/Unlock_Avatar.mp3');
    a.volume = 0.7;
    a.play().catch(()=>{});
}
const playEpicBonusResolve=()=>[523.25,659.25,783.99,1046.5,1318.51,1567.98].forEach((f,i)=>setTimeout(()=>playSynthSound(f,'triangle',0.5,0.08),i*80));
const playBonusAppear=()=>[783.99,987.77,1318.51].forEach((f,i)=>setTimeout(()=>playSynthSound(f,'triangle',0.45,0.07),i*100));
const playCorrect = () => [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => setTimeout(() => playSynthSound(f, 'triangle', 0.5, 0.05), i * 80));
const playWrong = () => { playSynthSound(220, 'sawtooth', 0.4, 0.05); setTimeout(() => playSynthSound(210, 'sawtooth', 0.4, 0.05), 50); };
const playUnlock=()=>[659.25,783.99,987.77].forEach((f,i)=>setTimeout(()=>playSynthSound(f,'triangle',0.35,0.06),i*90));
const playStartGameSound = () => [440, 554, 659, 880].forEach((f, i) => setTimeout(() => playSynthSound(f, 'sine', 0.4, 0.1), i * 150));

// --- ΜΟΥΣΙΚΗ ΜΕΝΟΥ ---
const bassTrack = [[146.83, 200], [146.83, 200], [146.83, 200], [146.83, 200], [110.00, 200], [110.00, 200], [110.00, 200], [110.00, 200], [123.47, 200], [123.47, 200], [123.47, 200], [123.47, 200], [164.81, 200], [164.81, 200], [196.00, 200], [196.00, 200]];
const melodyTrack = [[293.66, 200], [293.66, 200], [220.00, 200], [196.00, 200], [0, 200], [196.00, 200], [0, 200], [246.94, 200], [0, 200], [246.94, 200], [0, 200], [246.94, 200], [293.66, 200], [329.63, 200], [369.99, 200], [392.00, 200]];

function playPolyphonicLoop() {
    if (!isMenuMusicPlaying || isMuted) return;
    const tempo = 160; 
    const bIdx = musicTick % bassTrack.length;
    playSynthSound(bassTrack[bIdx][0], 'sawtooth', 0.14, 0.03);
    const mIdx = musicTick % melodyTrack.length;
    if (melodyTrack[mIdx][0] > 0) playSynthSound(melodyTrack[mIdx][0], 'square', 0.12, 0.025);
    musicTick++;
    menuMusicTimeout = setTimeout(playPolyphonicLoop, tempo);
}

function startMenuMusic() {
    if (!musicEnabled || isMuted || isMenuMusicPlaying) return;
    isMenuMusicPlaying = true;
    musicTick = 0;
    playPolyphonicLoop();
}
function stopMenuMusic() { isMenuMusicPlaying = false; clearTimeout(menuMusicTimeout); }

function updateSoundButton(isMuted){
    const btn = document.getElementById("mute-btn");
    if(!btn) return;
    btn.classList.remove("sound-on","sound-off");
    if(isMuted){
        btn.classList.add("sound-off");
    }else{
        btn.classList.add("sound-on");
    }

}

function playFlagShuffleTick(){

    playSynthSound(
        320 + Math.random()*80,
        'square',
        0.04,
        0.035
    );

}

function playFlagShuffleStop(){

    playSynthSound(520, 'triangle', 0.12, 0.08);

    setTimeout(()=>{
        playSynthSound(760, 'triangle', 0.14, 0.09);
    }, 90);

}


function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('literaMuted', isMuted ? 'true' : 'false');

    const btn = document.getElementById('mute-btn');
    if (btn) btn.innerText = isMuted ? "🔇" : "🔊";

    /* ΝΕΟ */
    updateSoundButton(isMuted);

    if (isMuted) stopMenuMusic();
    else if (musicEnabled) startMenuMusic();
}

function playRankUpSound(){
    [523.25, 659.25, 783.99, 987.77].forEach((f, i) => {
        setTimeout(() => playSynthSound(f, 'triangle', 0.35, 0.06), i * 110);
    });
}

function playCountdownTick(secondsLeft){

    if(isMuted || !soundEffectsEnabled) return;

    // όσο λιγοστεύει ο χρόνος, ανεβαίνει η συχνότητα
    const freq = 600 + (10 - secondsLeft) * 40;

    playSynthSound(
        freq,
        'square',
        0.06,
        0.05
    );
}



/* =========================================================
   SPLASH SCREEN
========================================================= */

const splashPhrases = [
    "Ξεφυλλίζουμε τις σελίδες...",
    "Ακονίζουμε τα μολύβια...",
    "Επικαλούμαστε<br>τα πνεύματα των μεγάλων μυστών<br>της Λογοτεχνίας..."
];

let splashPhraseIndex = 0;
let splashIntroDone = false;
let splashAssetsReady = false;

function updateSplashProgress(step){
    const progressFill = document.getElementById("splash-progress-fill");
    if(!progressFill) return;

    const percent = ((step + 1) / splashPhrases.length) * 100;
    progressFill.style.width = percent + "%";
}


function runSplashIntro(){
    const loadingText = document.querySelector(".splash-loading-text");
    if(!loadingText) return;

    splashPhraseIndex = 0;
    loadingText.innerHTML = splashPhrases[0];
    updateSplashProgress(0);

    const PHRASE_DURATION = 2900;

    function rotateText(){
        splashPhraseIndex++;

        if(splashPhraseIndex < splashPhrases.length){
            loadingText.style.opacity = "0";

            setTimeout(() => {
                loadingText.innerHTML = splashPhrases[splashPhraseIndex];
                loadingText.style.opacity = "1";
                updateSplashProgress(splashPhraseIndex);
            }, 250);

            setTimeout(rotateText, PHRASE_DURATION);
        } else {
            splashIntroDone = true;
            tryCloseSplash();
        }
    }

    setTimeout(rotateText, PHRASE_DURATION);
}

function preloadSplashAssets(){
    const imagePaths = [
        "assets/MonstersLogo.png",
        "assets/default-avatar.png",
        "https://i.ibb.co/ksSfSWCy/Start-game.png",
        "https://i.ibb.co/ZRdnXKZw/high-scores.png",
        "https://i.ibb.co/fYh8MKWb/support.png",
        "https://i.ibb.co/qK7kFc0/Disconnecting.png",
        "https://i.ibb.co/21zBWJh4/Quit-Game.png",
        // --- CORE RANK ICONS ---
"assets/rank/rank_female.webp",
"assets/rank/rank_male.webp",
        // --- RANK LEVEL ICONS ---
"assets/rank/level1_female.webp",
"assets/rank/level1_male.webp",
"assets/rank/level2_female.webp",
"assets/rank/level2_male.webp",
"assets/rank/level3_female.webp",
"assets/rank/level3_male.webp",
"assets/rank/level4_female.webp",
"assets/rank/level4_male.webp",
"assets/rank/level5_female.webp",
"assets/rank/level5_male.webp",
"assets/rank/level6_female.webp",
"assets/rank/level6_male.webp",
"assets/rank/level7_female.webp",
"assets/rank/level7_male.webp",
"assets/rank/level8_female.webp",
"assets/rank/level8_male.webp",
"assets/rank/level9_female.webp",
"assets/rank/level9_male.webp"
    ];

    let loaded = 0;
    const total = imagePaths.length;

    function markDone(){
        loaded++;
        if(loaded >= total){
            splashAssetsReady = true;
            tryCloseSplash();
        }
    }

    if(total === 0){
        splashAssetsReady = true;
        tryCloseSplash();
        return;
    }

    imagePaths.forEach((src) => {
        const img = new Image();

        img.onload = markDone;
        img.onerror = markDone;

        img.src = src;
    });
}


// --- NAVIGATION ---
function updateGlobalHeaderPosition() {
    const appContainer = document.getElementById('app-container');
    const globalHeader = document.getElementById('global-header');
    if (!appContainer || !globalHeader) return;
    const rect = appContainer.getBoundingClientRect();
    globalHeader.style.top = rect.top + 'px';
    globalHeader.style.left = rect.left + 'px';
    globalHeader.style.width = rect.width + 'px';
    globalHeader.style.transform = 'none';
    globalHeader.style.maxWidth = 'none';
    // Set start-screen padding to clear header
    requestAnimationFrame(() => {
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.style.setProperty('padding-top', (globalHeader.offsetHeight + 8) + 'px', 'important');
        }
    });
}

function updateFixedExitButton(screenId){
    const gameNavHeader = document.getElementById('game-nav-header');
    if(!gameNavHeader) return;

    if(screenId === 'game-screen'){
        gameNavHeader.style.display = 'flex';
        const appContainer = document.getElementById('app-container');
        if(appContainer){
            const rect = appContainer.getBoundingClientRect();
            gameNavHeader.style.top = rect.top + 'px';
            gameNavHeader.style.left = rect.left + 'px';
            gameNavHeader.style.width = rect.width + 'px';
            gameNavHeader.style.transform = 'none';
            gameNavHeader.style.maxWidth = 'none';
            requestAnimationFrame(() => {
                const gameScreen = document.getElementById('game-screen');
                if(gameScreen){
                    gameScreen.style.setProperty('padding-top', (gameNavHeader.offsetHeight + 12) + 'px', 'important');
                }
            });
        }
    }else{
        gameNavHeader.style.display = 'none';
    }
}  

let splashCloseStarted = false;

function tryCloseSplash(){
    if(splashCloseStarted) return;
    if(!splashIntroDone || !splashAssetsReady) return;

    splashCloseStarted = true;

    const splash = document.getElementById("splash-screen");
    if(!splash) return;

    setTimeout(() => {
        splash.style.transition = "opacity 0.7s ease";
        splash.style.opacity = "0";
        splash.style.pointerEvents = "none";

        setTimeout(() => {
            splash.style.display = "none";
        }, 700);

    }, 3000);
}

function updateFooterPadding() {
    const footer = document.getElementById('global-footer');
    if (footer && footer.style.display !== 'none') {
        const h = footer.offsetHeight;
        document.documentElement.style.setProperty('--footer-height', h + 'px');
    }
}

function goToScreen(id) {


    if(id !== 'game-screen'){
        hideFreezeIndicator();
        freezeTimeUntil = 0;

        hideHeroBoostIndicator();
        hideDragonBonusIndicator();
        heroBoostUntil = 0;

        hidePoetryHelpIndicator();
    }

    document.querySelectorAll('.screen').forEach(s => {
        s.style.setProperty("display", "none", "important");
    });

    const target = document.getElementById(id);
    const appContainer = document.getElementById('app-container');

    if (target) {
        const flexScreens = [
            'start-screen',
            'avatar-screen',
            'finish-screen',
        ];

        const displayMode = flexScreens.includes(id) ? "flex" : "block";
        target.style.setProperty("display", displayMode, "important");

        if(id === 'help-library-screen'){
            updateHelpLibraryState();
            requestAnimationFrame(() => {
                const navTabs = document.getElementById('nav-header-tabs');
                if(navTabs){
                    navTabs.innerHTML = `<div class="help-tabs">
                        <button class="help-tab help-tab-blue active" onclick="switchHelpTab('blue')">Βοήθειες Τάξης</button>
                        <button class="help-tab help-tab-yellow" onclick="switchHelpTab('yellow')">Βοήθειες Σχολής</button>
                        <button class="help-tab help-tab-green" onclick="switchHelpTab('green')">Βοήθειες Βαθμίδας</button>
                        <button class="help-tab help-tab-red" onclick="switchHelpTab('red')">Ειδική Βοήθεια</button>
                    </div>`;
                    navTabs.style.display = 'block';
                }
            });
        }
        if(id !== 'help-library-screen'){
            const navTabsEl = document.getElementById('nav-header-tabs');
            if(navTabsEl && navTabsEl.style.display !== 'none'){ navTabsEl.style.display = 'none'; navTabsEl.innerHTML = ''; }
        }
        if(id === 'wc-scores-screen'){
            initWCScoresScreen();
        }
        if(id !== 'wc-scores-screen'){
            wcClosePicker();
        }
    }

    if (appContainer) {
        if (
            id === 'avatar-screen' ||
            id === 'finish-screen' ||
            id === 'game-screen'
        ) {
            appContainer.style.overflow = 'hidden';
        } else {
            appContainer.style.overflow = 'auto';
        }
    }

    // Position finish-screen header/footer/wrapper with app-container
    if ((id === 'avatar-screen' || id === 'finish-screen') && appContainer) {
        const avatarWrapper = document.getElementById('avatar-categories-wrapper');
        if (avatarWrapper) avatarWrapper.style.visibility = 'hidden';
        requestAnimationFrame(() => {
            const rect = appContainer.getBoundingClientRect();
            const screenEl = document.getElementById(id);
            const headerEl = screenEl ? screenEl.querySelector('.avatar-header-fixed') : null;
            const footerEl = screenEl ? screenEl.querySelector('.avatar-footer') : null;

            if (headerEl) {
                headerEl.style.position = 'fixed';
                headerEl.style.top = rect.top + 'px';
                headerEl.style.left = rect.left + 'px';
                headerEl.style.width = rect.width + 'px';
                headerEl.style.transform = 'none';
                headerEl.style.maxWidth = 'none';
            }
            if (footerEl) {
                footerEl.style.position = 'fixed';
                footerEl.style.bottom = (window.innerHeight - rect.bottom) + 'px';
                footerEl.style.left = rect.left + 'px';
                footerEl.style.width = rect.width + 'px';
                footerEl.style.transform = 'none';
                footerEl.style.maxWidth = 'none';
            }
            // Wait for header/footer to render, then position wrapper
            requestAnimationFrame(() => {
                const wrapperEl = id === 'avatar-screen'
                    ? document.getElementById('avatar-categories-wrapper')
                    : document.getElementById('summary-container-wrapper');
                if (wrapperEl && headerEl && footerEl) {
                    const headerRect = headerEl.getBoundingClientRect();
                    const footerRect = footerEl.getBoundingClientRect();
                    const headerBottom = headerRect.bottom;
                    const footerTop = footerRect.top;
                    wrapperEl.style.position = 'fixed';
                    wrapperEl.style.top = headerBottom + 'px';
                    wrapperEl.style.left = rect.left + 'px';
                    wrapperEl.style.width = rect.width + 'px';
                    wrapperEl.style.height = (footerTop - headerBottom) + 'px';
                    wrapperEl.style.overflowY = 'auto';
                    wrapperEl.style.visibility = 'visible';
                }
            });
        });
    }

    const navHeaderTabs = document.getElementById('nav-header-tabs');
    if (navHeaderTabs) {
        if (id === 'support-screen') {
            navHeaderTabs.style.display = 'block';
            navHeaderTabs.innerHTML = `
                <div class="support-tabs-box" style="margin-top:8px; margin-bottom:0;">
                    <button class="support-tab ${activeSupportTab==='settings'?'active':''}" onclick="switchSupportTab('settings')">Ρυθμίσεις</button>
                    <button class="support-tab ${activeSupportTab==='support'?'active':''}" onclick="switchSupportTab('support')">Υποστήριξη</button>
                    <button class="support-tab ${activeSupportTab==='game'?'active':''}" onclick="switchSupportTab('game')">Παιχνίδι</button>
                    <button class="support-tab ${activeSupportTab==='privacy'?'active':''}" onclick="switchSupportTab('privacy')">Απόρρητο</button>
                </div>`;
            // Restore correct panel
            document.querySelectorAll('#support-screen .support-panel').forEach(p=>p.classList.remove('active'));
            const activePanel = document.getElementById(`tab-${activeSupportTab}`);
            if (activePanel) activePanel.classList.add('active');
            // Recalculate padding AFTER tabs have rendered
            const navHeader = document.getElementById('global-nav-header');
            if (navHeader) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const supportScreen = document.getElementById('support-screen');
                        if (supportScreen) {
                            supportScreen.style.setProperty('padding-top', (navHeader.offsetHeight + 12) + 'px', 'important');
                        }
                    });
                });
            }
        } else {
            navHeaderTabs.style.display = 'none';
            navHeaderTabs.innerHTML = '';
        }
    }

    const screenSubtitles = {
        'help-library-screen': 'Γνώρισε όλες τις βοήθειες που μπορείς να ξεκλειδώσεις και να χρησιμοποιήσεις.',
        'weekly-challenge-game-screen': '__wc__',
    };

    const navSubtitle = document.getElementById('global-nav-subtitle');
    if (navSubtitle) {
        const sub = screenSubtitles[id];
        if (sub === '__wc__') {
            // Weekly challenge — θα ενημερωθεί από updateWCHeaderSubtitle
        } else if (sub) {
            navSubtitle.textContent = sub;
            navSubtitle.style.display = 'block';
        } else {
            navSubtitle.textContent = '';
            navSubtitle.style.display = 'none';
        }
    }

    updateFixedExitButton(id);

    // Global footer visibility
    const noFooterScreens = [
        'splash-screen', 'login-screen',
        'game-screen', 'find-country-game-screen',
        'finish-screen', 'initiation-rank-screen', 'initiation-profile-screen',
        'avatar-screen'
    ];

    const globalFooter = document.getElementById('global-footer');
    if (globalFooter) {
        if (noFooterScreens.includes(id)) {
            globalFooter.style.display = 'none';
        } else {
            globalFooter.style.display = 'flex';
            requestAnimationFrame(updateFooterPadding);
        }
    }

    // Global header visibility (only on start-screen)
    const globalHeader = document.getElementById('global-header');
    if (globalHeader) {
        if (id === 'start-screen') {
            globalHeader.style.display = 'block';
            updateGlobalHeaderPosition();
        } else {
            globalHeader.style.display = 'none';
        }
    }

const menuScreens = [
    'start-screen',
    'mode-screen',
    'challenge-options-screen',
    'find-country-intro-screen',
    'score-choice-screen',
    'category-screen',
    'difficulty-screen',
    'score-menu-screen',
    'support-screen'
];

    if (menuScreens.includes(id)) {
        startMenuMusic();
    } else {
        stopMenuMusic();
    }

    // Global back button & nav header
    const noBackScreens = [
        'splash-screen', 'login-screen', 'start-screen',
        'game-screen', 'finish-screen', 'avatar-screen',
        'initiation-rank-screen', 'initiation-profile-screen'
    ];

    const screenTitles = {
        'rank-info-screen':             'Κατάταξη',
        'mode-screen':                  'Επιλογή Παιχνιδιού',
        'challenge-options-screen':     'Challenges',
        'find-country-intro-screen':    'Βρες τη Χώρα',
        'score-choice-screen':          'High Scores',
        'category-screen':              'Επιλογή Κατηγορίας',
        'difficulty-screen':            'Επιλογή Δυσκολίας',
        'score-menu-screen':            'Βαθμολογίες',
        'pantheon-screen':              'Πάνθεον',
        'support-screen':               'Ρυθμίσεις & Υποστήριξη',
        'privacy-policy-screen':        'Πολιτική Απορρήτου',
        'terms-of-use-screen':          'Όροι Χρήσης',
        'profile-menu-screen':          'Προφίλ',
        'profile-form-screen':          'Επεξεργασία Προφίλ',
        'profile-card-preview-screen':  'Κάρτα Παίκτη',
        'help-library-screen':          'Βιβλίο Βοηθειών',
        'support-form-screen':          'Φόρμα Επικοινωνίας',
        'weekly-challenge-game-screen': 'Weekly Challenge',
        'wc-scores-screen':             'Λύσεις Εβδομαδιαίου Γρίφου',
    };

    const navHeader = document.getElementById('global-nav-header');
    const navTitle = document.getElementById('global-nav-title');

    if (navHeader) {
        if (noBackScreens.includes(id)) {
            navHeader.style.display = 'none';
        } else {
            navHeader.style.display = 'flex';
            if (navTitle) navTitle.textContent = screenTitles[id] || '';
            // Align with app-container
            if (appContainer) {
                const rect = appContainer.getBoundingClientRect();
                navHeader.style.top = rect.top + 'px';
                navHeader.style.left = rect.left + 'px';
                navHeader.style.width = rect.width + 'px';
                navHeader.style.transform = 'none';
                navHeader.style.maxWidth = 'none';
            }
            navHeader.setAttribute('data-current-screen', id);

            // Apply padding-top to ALL nav-header screens
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const navH = Math.min(navHeader.offsetHeight, 58);
                    Object.keys(screenTitles).forEach(screenId => {
                        const el = document.getElementById(screenId);
                        const extra = screenId === 'wc-scores-screen' ? 20 : 12;
                        if (el) el.style.setProperty('padding-top', (navH + extra) + 'px', 'important');
                    });
                });
            });
        }
    }
}

const backRoutes = {
    'weekly-challenge-game-screen': 'mode-screen',
    'score-menu-screen':            'score-choice-screen',
    'wc-scores-screen':             'score-choice-screen',
    'rank-info-screen':             'start-screen',
    'mode-screen':                  'start-screen',
    'challenge-options-screen':     'mode-screen',
    'find-country-intro-screen':    'challenge-options-screen',
    'find-country-game-screen':     'challenge-options-screen',
    'score-choice-screen':          'start-screen',
    'category-screen':              'start-screen',
    'difficulty-screen':            'category-screen',
    'pantheon-screen':              'score-choice-screen',
    'support-screen':               'start-screen',
    'privacy-policy-screen':        'support-screen',
    'terms-of-use-screen':          'support-screen',
    'profile-menu-screen':          'support-screen',
    'profile-form-screen':        'profile-menu-screen',
    'profile-card-preview-screen':'profile-menu-screen',
    'help-library-screen':        'support-screen',
    'support-form-screen':        'support-screen',
};

function handleGlobalBack() {
    const navHeader = document.getElementById('global-nav-header');
    const current = navHeader ? navHeader.getAttribute('data-current-screen') : null;

    // Dynamic back για profile-form-screen
    if(current === 'profile-form-screen'){
        goToScreen(profileFormReturnScreen || 'profile-menu-screen');
        return;
    }

    const dest = backRoutes[current];
    if (dest) goToScreen(dest);
}

function playLockedHelpSound(){
    playSynthSound(180, 'sawtooth', 0.18, 0.05);
    setTimeout(() => {
        playSynthSound(140, 'sawtooth', 0.22, 0.04);
    }, 70);
}


/* =========================================================
   INITIALIZATION / BOOTSTRAP
========================================================= */

// --- INITIALIZATION ---
window.onload=async ()=>{

loadSavedTheme();

runSplashIntro();
preloadSplashAssets();

await loadFullPlayerProfile();
fetchQuestions();
fetchFindCountryData();
isMuted = localStorage.getItem('literaMuted') === 'true';
const muteBtn = document.getElementById('mute-btn');
if (muteBtn) {
    muteBtn.innerText = isMuted ? "🔇" : "🔊";
}  
const musicToggle = document.getElementById('music-toggle');
if (musicToggle) {
    musicToggle.checked = musicEnabled;}
const soundToggle = document.getElementById('sound-toggle');
if (soundToggle) {
    soundToggle.checked = soundEffectsEnabled;}
if(!isGoogleUser()){
    applyUnlockedAvatarsFromStorage();

    const guestKey = getLocalAccountKey();

    window.playerPergamena = parseInt(
        localStorage.getItem(`literaPergamena_${guestKey}`) || "0",
        10
    );

    perfect10Count = parseInt(
        localStorage.getItem(`literaPerfect10Count_${guestKey}`) || "0",
        10
    );

    log("GUEST LOAD",{
user:playerProfile.username,
guestKey:guestKey,
pergamena:window.playerPergamena,
perfect10Count:perfect10Count,
storedPergamena:localStorage.getItem(`literaPergamena_${guestKey}`),
storedPerfect10:localStorage.getItem(`literaPerfect10Count_${guestKey}`)
});

}else{
    window.playerPergamena = window.playerPergamena || 0;
    unlockedAvatars = Array.isArray(unlockedAvatars) ? unlockedAvatars : [];
    perfect10Count = perfect10Count || 0;
}

setupFindCountryDrag();
updatePergamenaDisplay();
enableMenuClickSounds();

if(playerProfile.username && playerProfile.avatar){
    updateProfileUI();
    updatePhotoModeUI();
    // Ενημέρωσε footer score από το φορτωμένο profile
    const footerScore = document.getElementById('footer-total-score');
    if(footerScore) footerScore.textContent = (playerProfile.pantheonTotalScore || 0) + ' pts';
    goToScreen('start-screen');
}

document.addEventListener('click',()=>{
if(audioCtx.state==='suspended')audioCtx.resume();
},{once:true});
};


function convertQuotesToGreek(text){
if(!text)return "";
let result="";
let open=true;
for(let i=0;i<text.length;i++){
if(text[i]==='"'){
result+=open?'«':'»';
open=!open;
}else{
result+=text[i];
}
}
return result;
}

function fetchQuestions() {
    Papa.parse(sheetURL, { download: true, header: true, skipEmptyLines: true, complete: res => {
        allQuestions = res.data.filter(r => r.Question).map(r => ({
    id: String(r.ID || "").trim(),
    q: convertQuotesToGreek(r.Question.trim()),
    options: [
        convertQuotesToGreek(String(r['Option 1']||"").trim()),
        convertQuotesToGreek(String(r['Option 2']||"").trim()),
        convertQuotesToGreek(String(r['Option 3']||"").trim()),
        convertQuotesToGreek(String(r['Option 4']||"").trim())
    ],
    correct: String(r.CorrectIndex || "").trim(),
    category: String(r.Category || "").trim(),
    level: parseInt(r.Level || 1),
    genre: String(r.Genre || "Γενική").trim()
}));
    }});
}

function selectMode(mode) {
    currentGameMode = mode;
    streak = 0;

if(mode === "Weekly-Challenge"){
    openWeeklyChallengeIntro();
    return;
}

if (mode === 'TimeAttack') {
    selectedCategory = "All";
    selectedDifficulty = "Scaling";
    openTimeAttackIntro();
    return;
}

    if (mode === 'Challenge') {
        goToScreen('challenge-options-screen');
        return;
    }

    goToScreen('category-screen');
}



function showChallengeSoonMessage(){
    alert("Σύντομα κοντά σας");
}


function selectCategory(cat) {
    selectedCategory = cat;
    const catLabel = document.getElementById('selected-cat-label');

if(catLabel){
    catLabel.innerText = selectedCategory;
}
    goToScreen('difficulty-screen');
}

function setDifficulty(diff) { selectedDifficulty = diff; startGame(); }


/* =========================================================
   GAME CORE
========================================================= */

// --- GAME CORE ---
function startGame() {
    stopMenuMusic();
    playStartGameSound();

    let pool = (selectedCategory === "All")
        ? allQuestions
        : allQuestions.filter(q => q.category === selectedCategory);

    if (currentGameMode === 'TimeAttack') {
        // Fisher-Yates shuffle για ισόποση κατανομή ερωτήσεων
        const shuffled = [...pool];
        for(let i = shuffled.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        gameQuestions = shuffled;
        timeAttackTotalTime = 45;
        timeAttackElapsed = 0;
    } else {
        if (selectedDifficulty === 'Easy') {
            const l1 = pickFreshQuestions(pool.filter(q => q.level === 1), 7, `played_${currentGameMode}_${selectedCategory}_Easy_L1`);
            const l2 = pickFreshQuestions(pool.filter(q => q.level === 2), 3, `played_${currentGameMode}_${selectedCategory}_Easy_L2`);
            gameQuestions = [...l1, ...l2];
        } else if (selectedDifficulty === 'Medium') {
            const l2 = pool.filter(q => q.level === 2).sort(() => 0.5 - Math.random()).slice(0, 10);
            gameQuestions = l2;
        } else if (selectedDifficulty === 'Hard') {
            gameQuestions = pickFreshQuestions(pool.filter(q => q.level === 3), 10, `played_${currentGameMode}_${selectedCategory}_Hard_L3`);
        } else {
            const l1 = pickFreshQuestions(pool.filter(q => q.level === 1), 3, `played_${currentGameMode}_${selectedCategory}_Scaling_L1`);
            const l2 = pickFreshQuestions(pool.filter(q => q.level === 2), 4, `played_${currentGameMode}_${selectedCategory}_Scaling_L2`);
            const l3 = pickFreshQuestions(pool.filter(q => q.level === 3), 3, `played_${currentGameMode}_${selectedCategory}_Scaling_L3`);
            gameQuestions = [...l1, ...l2, ...l3];
        }
    }

    if (gameQuestions.length === 0) {
        alert("Δεν υπάρχουν αρκετές ερωτήσεις.");
        return;
    }

    currentIdx = 0;
    score = 0;
    streak = 0;
    maxStreak = 0;
    currentCorrectAnswers = 0;
    lastMilestone = 0;
    bonusQuestionActive = false;
    bonusQuestionUsedThisRun = false;
    bonusQuestionData = null;
    usedBonusQuestions = [];
    finishReviewModalOpen = false;
    timeAttackElapsed = 0;

    avatarHelpUsedThisRun = false;
    poeticRetryPending = false;
    freezeTimeUntil = 0;
    heroBoostUntil = 0;
    heroBoostQuestionActive = false;
    refreshHelpUsedThisRun = false;
    genderHelpUsedThisRun = false;
    maleShieldCharges = 2;
    rankHelpUsedThisRun = false;

    hideStreakUI();

    const streakCountEl = document.getElementById('streak-count');
    if (streakCountEl) streakCountEl.innerText = "0";

    goToScreen('game-screen');

    const progressFill = document.getElementById('progress-fill');
    if (progressFill && currentGameMode === 'TimeAttack') {
        progressFill.style.transition = 'none';
        progressFill.style.width = '100%';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progressFill.style.transition = '0.4s';
            });
        });
    }

    renderHelpSlots();
    loadNextQuestion();

    if (currentGameMode === 'TimeAttack') {
        startTimeAttackTimer();
    }
}

function playHelpActivateSound(){
    playSynthSound(520, 'triangle', 0.16, 0.06);
    setTimeout(() => {
        playSynthSound(700, 'triangle', 0.14, 0.05);
    }, 90);
}

function loadNextQuestion() {
    isQuestionTransitionLocked = false;

    if (currentGameMode === 'Answer10') {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (
        (currentGameMode === 'Answer10' && currentIdx >= 10) ||
        (currentGameMode !== 'TimeAttack' && currentIdx >= gameQuestions.length)
    ) {
        showFinishScreen();
        return;
    }

    // Time Attack: αν τελειώσουν όλες οι ερωτήσεις, κάνε νέο shuffle
    if (currentGameMode === 'TimeAttack' && currentIdx >= gameQuestions.length) {
        for(let i = gameQuestions.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [gameQuestions[i], gameQuestions[j]] = [gameQuestions[j], gameQuestions[i]];
        }
        currentIdx = 0;
    }

    let q;

    if (currentGameMode === 'TimeAttack') {
        const remainingQuestions = gameQuestions.slice(currentIdx);

        const eligible = remainingQuestions.filter(question => {
            if (timeAttackElapsed < 60) {
                return question.level === 1 || question.level === 2;
            }

            if (timeAttackElapsed < 120) {
                return question.level === 2 || question.level === 3;
            }

            return question.level === 3;
        });

        if (eligible.length > 0) {
            q = eligible[0];

            const foundIdx = gameQuestions.indexOf(q);

            if (foundIdx !== -1 && foundIdx !== currentIdx) {
                [gameQuestions[currentIdx], gameQuestions[foundIdx]] =
                    [gameQuestions[foundIdx], gameQuestions[currentIdx]];
            }
        } else {
            q = gameQuestions[currentIdx];
        }
    } else {
        q = gameQuestions[currentIdx];
    }

    if (!q) {
        showFinishScreen();
        return;
    }

    if (currentGameMode === 'Answer10') {
        timeLeft = 15;
    }

    updateUI();

    const qText = document.getElementById('q-text');
    if (qText)
    qText.innerHTML = formatQuestionText(q.q);

    const optDiv = document.getElementById('options');
    if (!optDiv) return;

    optDiv.innerHTML = '';

    [...q.options]
        .filter(o => o !== "")
        .sort(() => 0.5 - Math.random())
        .forEach((o, index) => {
            const b = document.createElement('button');
            b.innerText = o;
            b.className = `opt-${index}`;
            b.onclick = (e) => handleAnswer(
                e.target,
                normalizeText(o) === normalizeText(q.correct)
            );
            optDiv.appendChild(b);
        });

    if (currentGameMode === 'Answer10') {
        clearInterval(timerInterval);
        timerInterval = null;

        timerInterval = setInterval(() => {
            if (Date.now() < freezeTimeUntil) return;

            timeLeft--;

            if (timeLeft <= 10 && timeLeft > 0) {
                playCountdownTick(timeLeft);
            }

            const timerText = document.getElementById('timer-text');
            if (timerText) timerText.innerText = timeLeft + "s";

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                handleAnswer(null, false);
            }
        }, 1000);
    }
}

function normalizeText(t){
    if(!t) return "";
    return t
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g," ");
}

function getTimeAttackPhaseLabel(){
    if (timeAttackElapsed < 60) return "Φάση I";
    if (timeAttackElapsed < 120) return "Φάση II";
    return "Φάση III";
}

function getRandomBonusQuestion(){
const bonusPool=allQuestions.filter(q=>q.level===4&&!usedBonusQuestions.includes(q.q));
if(bonusPool.length===0)return null;
const selected=bonusPool[Math.floor(Math.random()*bonusPool.length)];
usedBonusQuestions.push(selected.q);
return selected;
}

function openBonusQuestionModal(){
bonusQuestionData=getRandomBonusQuestion();
if(!bonusQuestionData)return;
bonusQuestionActive=true;
const modal=document.getElementById('bonus-question-modal');
const qText=document.getElementById('bonus-question-text');
const options=document.getElementById('bonus-question-options');
const rewardBox = document.querySelector('#bonus-question-modal .bonus-reward-box');
if(!modal||!qText||!options)return;
qText.innerHTML=bonusQuestionData.q.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
options.innerHTML="";
[...bonusQuestionData.options].filter(o=>o!=="").sort(()=>0.5-Math.random()).forEach((o,index)=>{
const b=document.createElement('button');
b.innerText=o;
b.className=`opt-${index}`;
b.onclick=function(){handleBonusAnswer(b,o===bonusQuestionData.correct);};
options.appendChild(b);
});
const bonusPoints = calculateStreakBonusPoints();
const bonusPergamena = calculateStreakBonusPergamena();

if(rewardBox){
    rewardBox.innerHTML = `🎁 +${bonusPoints} βαθμοί • +${bonusPergamena} <img src="assets/rank_goals/Pergamenas.webp" style="width:18px;height:18px;vertical-align:middle;">`;
}
playBonusAppear();
modal.style.display='flex';
}

function closeBonusQuestionModal(){
const modal=document.getElementById('bonus-question-modal');
if(modal)modal.style.display='none';
bonusQuestionActive=false;
bonusQuestionData=null;
}

function calculateStreakBonusPoints(){
    const bonusIndex = Math.floor((streak - 10) / 20);
    return 50 + (bonusIndex * 100);
}

function calculateStreakBonusPergamena(){
    const bonusIndex = Math.floor((streak - 10) / 20);
    return 15 * Math.pow(2, bonusIndex);
}

function handleBonusAnswer(btn,isCorrect){
const optionsWrap=document.getElementById('bonus-question-options');
if(optionsWrap){
optionsWrap.querySelectorAll('button').forEach(b=>{
    b.style.pointerEvents='none';

    if(btn && b === btn){
        if(isCorrect){
            b.classList.add('btn-success');
        }else{
            b.classList.add('btn-clicked-error');
        }
    }else if(bonusQuestionData && b.innerText === bonusQuestionData.correct){
        b.classList.add('btn-success');
    }else{
        b.classList.add('btn-other-error');
    }
});
}
if(isCorrect){
    const bonusPoints = calculateStreakBonusPoints();
    const bonusPergamena = calculateStreakBonusPergamena();

    playEpicBonusResolve();
    addScore(bonusPoints);

    window.playerPergamena = (window.playerPergamena || 0) + bonusPergamena;
    localStorage.setItem('literaPergamena', window.playerPergamena);
    updatePergamenaDisplay();

    showBonusRewardsBanner(bonusPoints, bonusPergamena);
}else{
    playWrong();
}
setTimeout(function(){
closeBonusQuestionModal();
},1200);
}

function handleAnswer(btn, isCorrect) {
    if(isQuestionTransitionLocked) return;

    if (currentGameMode === 'Answer10') clearInterval(timerInterval);
    
const q = gameQuestions[currentIdx];
const activeCategory = getAuthorHelpCategoryForQuestion(q);
const rankMode = getRankTitleMode();

    // MALE GENDER HELP — Ασπίδα 2 Ευκαιριών
    if(
        rankMode === "male" &&
        maleShieldCharges > 0 &&
        btn &&
        !isCorrect
    ){
        maleShieldCharges--;

        btn.classList.add("poetic-blocked");
        btn.disabled = true;
        btn.style.pointerEvents = 'none';

        document.querySelectorAll('#options button').forEach(b => {
            if(b !== btn){
                b.disabled = false;
                b.style.pointerEvents = 'auto';
            }
        });

        if(maleShieldCharges <= 0){
            genderHelpUsedThisRun = true;
        }

        renderHelpSlots();
        playHelpActivateSound();
        return;
    }

    // ΠΟΙΗΣΗ — Ποιητική Άδεια
    if(
        activeCategory === "Ποίηση" &&
        !avatarHelpUsedThisRun &&
        btn &&
        !isCorrect &&
        !poeticRetryPending
    ){
        poeticRetryPending = true;
        avatarHelpUsedThisRun = true;

        btn.classList.add("poetic-blocked");
        btn.disabled = true;
        btn.style.pointerEvents = 'none';

        document.querySelectorAll('#options button').forEach(b => {
            if(b !== btn){
                b.disabled = false;
                b.style.pointerEvents = 'auto';
            }
        });

        renderHelpSlots();
        showPoetryHelpIndicator();
        playHelpActivateSound();
        return;
    }

    if(!q){
        console.error("Question not found in handleAnswer()", {
            currentIdx,
            gameQuestionsLength: gameQuestions.length,
            currentGameMode
        });
        showFinishScreen();
        return;
    }

    isQuestionTransitionLocked = true;

    userAnswers.push({
        question: q.q,
        options: q.options,
        correct: q.correct,
        userChoice: btn ? btn.innerText : "Χρόνος έληξε",
        difficulty: q.level,
        genre: q.genre || "Γενική"
    });

    updateQuestionStats(
        q,
        btn ? btn.innerText : "",
        isCorrect
    );

    document.querySelectorAll('#options button').forEach(b => {
        b.style.pointerEvents = 'none';

        if(btn && b === btn){
            if(isCorrect){
                b.classList.add('btn-success');
            }else{
                b.classList.add('btn-clicked-error');
            }
        }else if(b.innerText === q.correct){
            b.classList.add('btn-success');
        }else{
            b.classList.add('btn-other-error');
        }
    });

    if(isCorrect){
        playCorrect();
        currentCorrectAnswers++;

        if(currentGameMode === 'TimeAttack'){

            let base = q.level === 1 ? 5 : (q.level === 2 ? 10 : 15);

            streak++;

            if (streak > maxStreak) {
                maxStreak = streak;
            }

            // ΧΡΟΝΙΚΟ BONUS
if(streak > 0 && streak % 10 === 0){
    const oldTime = timeAttackTotalTime;
    timeAttackTotalTime = Math.min(45, timeAttackTotalTime + 12);
    showTimeBonusEffect(timeAttackTotalTime - oldTime);
}else{
    timeAttackTotalTime = Math.min(45, timeAttackTotalTime + 6);
}


// BONUS στο 10ο, 20ό, 30ό κτλ συνεχόμενο
const shouldOpenRegularBonus =
    streak === 10 ||
    (streak > 10 && (streak - 10) % 20 === 0);
if(shouldOpenRegularBonus && !dragonBonusPending){
    setTimeout(function(){
        openBonusQuestionModal();
    }, 700);

}

            let bonus = streak >= 3 ? (3 + (streak - 3)) : 0;
            if (streak >= 3) {
                showStreakUI(streak);
            }
let gainedPoints = (base + bonus) * getHeroScoreMultiplier();
addScore(gainedPoints);
checkLevelUp(score);

        } else {
            // Mode: Answer 10
           // Mode: Answer 10
let gainedPoints = 0;

if(selectedDifficulty === "Easy"){
    gainedPoints = 2;
}else if(selectedDifficulty === "Medium"){
    gainedPoints = 5;
}else if(selectedDifficulty === "Hard"){
    gainedPoints = 10;
}else{
    // Scaling
    gainedPoints = 8;
}

gainedPoints = gainedPoints * getHeroScoreMultiplier();
addScore(gainedPoints);
        }

        // DRAGON HELP
        if(dragonBonusPending){
            dragonBonusPending = false;
            showDragonBonusQuestion();
        }

    } else {
        playWrong();
        streak = 0;
        hideStreakUI();

        if (currentGameMode === 'TimeAttack') {
            timeAttackTotalTime -= 5;
            if (timeAttackTotalTime < 0) {
                timeAttackTotalTime = 0;
            }
        }
    }

setTimeout(() => {

    poeticRetryPending = false;
    hidePoetryHelpIndicator();
    heroBoostQuestionActive = false;

    if(currentGameMode === "Answer10"){
        hideHeroBoostIndicator();
    }

currentIdx++;

if(currentGameMode === "TimeAttack" && timeAttackTotalTime <= 0){
    showFinishScreen();
    return;
}

if(currentGameMode === "Answer10" && currentIdx >= 10){
    showFinishScreen();
    return;
}

loadNextQuestion();

}, 1500);
}


/* =========================================================
   HELP SYSTEM / HELP LIBRARY
========================================================= */

function updateHelpLibraryState(){

    const activeCategory =
    getAuthorHelpCategoryForQuestion(gameQuestions[currentIdx]);
    const rankMode = getRankTitleMode();
    const rankTier = getCurrentRankHelpTier();
    const profileComplete = hasCompletedProfileForHelps();

    const items = document.querySelectorAll('#help-library-screen .help-item');

    items.forEach(item => {
        item.classList.remove('help-active', 'help-locked');

        const badge = item.querySelector('.help-state-badge');
        if(badge) badge.innerText = "";

        const id = item.dataset.helpId;
        let isActive = false;
        let isLocked = false;
        let badgeText = "";

        // Βοήθειες Τάξης
        if(id === "class-prose"){
            isActive = activeCategory === "Πεζογραφία";
            badgeText = isActive ? "Ενεργή τώρα" : "Διαθέσιμη μέσω Τάξης";
        }

        if(id === "class-poetry"){
            isActive = activeCategory === "Ποίηση";
            badgeText = isActive ? "Ενεργή τώρα" : "Διαθέσιμη μέσω Τάξης";
        }

        if(id === "class-theatre"){
            isActive = activeCategory === "Θέατρο";
            badgeText = isActive ? "Ενεργή τώρα" : "Διαθέσιμη μέσω Τάξης";
        }

        if(id === "class-heroes"){
            isActive = activeCategory === "Λογοτεχνικοί Ήρωες";
            badgeText = isActive ? "Ενεργή τώρα" : "Διαθέσιμη μέσω Τάξης";
        }

        // Βοήθειες Σχολής
        if(id === "school-goethe"){
            isActive = rankMode === "male";
            badgeText = isActive ? "Ενεργή τώρα" : "Διαθέσιμη μέσω Σχολής";
        }

        if(id === "school-sappho"){
            isActive = rankMode === "female";
            badgeText = isActive ? "Ενεργή τώρα" : "Διαθέσιμη μέσω Σχολής";
        }

        // Βοήθειες Βαθμίδας
        if(id === "rank-proto"){
            isActive = rankTier === "proto";
            isLocked = !rankTier;
            badgeText = isLocked ? "Κλειδωμένη" : (isActive ? "Ενεργή τώρα" : "Ξεκλειδωμένη");
        }

        if(id === "rank-magistros"){
            isActive = rankTier === "magistros";
            isLocked = !(rankTier === "magistros" || rankTier === "dragon");
            badgeText = isLocked ? "Κλειδωμένη" : (isActive ? "Ενεργή τώρα" : "Ξεκλειδωμένη");
        }

        if(id === "rank-dragon"){
            isActive = rankTier === "dragon";
            isLocked = rankTier !== "dragon";
            badgeText = isLocked ? "Κλειδωμένη" : "Ενεργή τώρα";
        }

        // Ειδική βοήθεια
        if(id === "special-refresh"){
            isActive = profileComplete;
            isLocked = !profileComplete;
            badgeText = isLocked ? "Κλειδωμένη" : "Διαθέσιμη";
        }

        if(isActive){
            item.classList.add('help-active');
        }

        if(isLocked){
            item.classList.add('help-locked');
        }

        if(badge){
            badge.innerText = badgeText;
        }
    });
}

// Πρόσθεσε αυτή τη μικρή συνάρτηση για το εφέ ανανέωσης
function showTimeBonusEffect(seconds){
    const popup =
    document.getElementById("time-bonus-popup");
    if(!popup) return;
    popup.textContent =
        "Bonus Χρόνου +" + seconds + "s";
    popup.classList.add("show");
    setTimeout(()=>{
        popup.classList.remove("show");
    }, 1400);
}


/* =========================================================
   PROGRESSION / LEVEL UP
========================================================= */

// --- LEVEL UP LOGIC ---
function checkLevelUp(currentScore) {
    let milestone = 0;
    if (currentScore >= 250) milestone = 250;
    else if (currentScore >= 150) milestone = 150;

    if (milestone > lastMilestone) {
        lastMilestone = milestone;
        showLevelUpEffect();
    }
}

function showLevelUpEffect() {
    const msg = document.getElementById('level-up-msg');
    if (!msg) return;
    
    // Ήχος Level Up
    [880, 1108, 1318, 1760].forEach((f, i) => setTimeout(() => playSynthSound(f, 'square', 0.6, 0.05), i * 100));
    
    msg.style.display = 'block';
    msg.style.animation = 'none';
    msg.offsetHeight; // trigger reflow
    msg.style.animation = 'fadeOutUp 1.5s forwards';
    
    setTimeout(() => { msg.style.display = 'none'; }, 1500);
}

// --- UI HELPERS ---
function showStreakUI(count) {
    const badge = document.getElementById('streak-badge');
    if(badge) {
        document.getElementById('streak-count').innerText = count;
        badge.style.display = 'block';
    }
}

function hideStreakUI() {
    const badge = document.getElementById('streak-badge');
    if(badge) badge.style.display = 'none';
}

function updateUI() { 
    const progText = document.getElementById('progress-text');
    const progFill = document.getElementById('progress-fill');
    if (currentGameMode === 'Answer10') {
        progText.innerText = `Ερώτηση ${currentIdx+1}/10`; 
        progFill.style.width = ((currentIdx+1)*10) + "%"; 
        document.getElementById('timer-text').innerText = timeLeft + "s";
    } else {
        progText.innerText = `Score: ${score} • ${getTimeAttackPhaseLabel()}`;
    }
}

function startTimeAttackTimer() {
    clearInterval(timerInterval);
    timerInterval = null;

    timerInterval = setInterval(() => {
        if (Date.now() < freezeTimeUntil) return;

        if (freezeTimeUntil > 0 && Date.now() >= freezeTimeUntil) {
            freezeTimeUntil = 0;
            hideFreezeIndicator();
        }

        if (heroBoostUntil > 0 && Date.now() >= heroBoostUntil) {
            heroBoostUntil = 0;
            hideHeroBoostIndicator();
        }

        timeAttackTotalTime--;
        timeAttackElapsed++;

        if (timeAttackTotalTime <= 10 && timeAttackTotalTime > 0) {
            playCountdownTick(timeAttackTotalTime);
        }

if (timeAttackTotalTime <= 0) {
    timeAttackTotalTime = 0;

    clearInterval(timerInterval);
    timerInterval = null;

    isQuestionTransitionLocked = true;

    const timerText = document.getElementById('timer-text');
    if (timerText) timerText.innerText = "0:00";

    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = "0%";

    setTimeout(() => {
        showFinishScreen();
    }, 100);

    return;
}

        const mins = Math.floor(timeAttackTotalTime / 60);
        const secs = timeAttackTotalTime % 60;

        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const p = Math.max(0, (timeAttackTotalTime / 45) * 100);
            progressFill.style.width = p + "%";
        }
    }, 1000);
}

/* =========================================================
   SCORING / HIGH SCORES / FIREBASE STATS
========================================================= */

// --- SCORING & HIGH SCORES ---

async function saveScore(pts,cat,diff){
if(isGoogleUser()){
await saveCloudPersonalScore(pts,cat,diff);
return;
}

let all=JSON.parse(localStorage.getItem('quiz_scores_v11'))||{};
const accountKey=getLocalAccountKey();
const key=`${accountKey}_${currentGameMode}_${cat}_${diff}`;

if(!all[key]) all[key]=[];

all[key].push({
pts,
streak:currentGameMode==='TimeAttack'?maxStreak:0,
bestRun:currentGameMode==='TimeAttack'?currentCorrectAnswers:0,
correctAnswers:currentCorrectAnswers,
totalQuestions:currentGameMode==='Answer10'?10:currentIdx,
username:playerProfile.username||"",
date:new Date().toISOString()
});

all[key].sort((a,b)=>(b.pts||0)-(a.pts||0));
all[key]=all[key].slice(0,15);

localStorage.setItem('quiz_scores_v11',JSON.stringify(all));
}

async function saveCloudPersonalScore(pts,cat,diff){
    log("SAVE CLOUD PERSONAL START",{
uid:playerProfile.uid,
username:playerProfile.username,
authType:playerProfile.authType,
isAuthenticated:playerProfile.isAuthenticated,
pts,
cat,
diff,
currentGameMode
});
if(!playerProfile.isAuthenticated||playerProfile.authType!=="google") return;
if(!playerProfile.uid){
console.warn("SAVE CLOUD PERSONAL ABORT: missing uid");
return;
}
if(!window.firebaseDB||!window.firebaseCollection||!window.firebaseAddDoc||!window.firebaseDoc||!window.firebaseSetDoc) return;

try{
const db=window.firebaseDB;
const collectionFn=window.firebaseCollection;
const addDocFn=window.firebaseAddDoc;
const docFn=window.firebaseDoc;
const setDocFn=window.firebaseSetDoc;

const playerRef=docFn(db,"players",playerProfile.uid);

await setDocFn(playerRef,{
uid:playerProfile.uid||"",
username:playerProfile.username||"",
email:window.firebaseAuth&&window.firebaseAuth.currentUser?window.firebaseAuth.currentUser.email||"": "",
displayLabel:`${playerProfile.username||"Unknown"} (${playerProfile.accountKey||"no_accountKey"})`,
avatar:playerProfile.avatar||"",
avatarName:playerProfile.avatarName||"",
authType:playerProfile.authType||"google",
accountKey:playerProfile.accountKey||"",
isAuthenticated:true,
rankTitleMode:playerProfile.rankTitleMode||"male",
realName:playerProfile.realName||"",
prose:Array.isArray(playerProfile.prose)?playerProfile.prose:[],
poets:Array.isArray(playerProfile.poets)?playerProfile.poets:[],
playwrights:Array.isArray(playerProfile.playwrights)?playerProfile.playwrights:[],
books:Array.isArray(playerProfile.books)?playerProfile.books:[],
heroes:Array.isArray(playerProfile.heroes)?playerProfile.heroes:[],
usesCustomPhoto:!!playerProfile.usesCustomPhoto,
customPhotoDataUrl:playerProfile.customPhotoDataUrl||"",
cardTheme:playerProfile.cardTheme||"rank-default",
pergamena:window.playerPergamena||0,
pantheonPerfect10:perfect10Count||0,
unlockedAvatars:Array.isArray(unlockedAvatars)?unlockedAvatars:[],
initiationCompleted:!!initiationCompleted
},{merge:true});


}catch(err){
console.error("Cloud personal score save error FULL:",err);
alert("Cloud personal score save error: " + (err.code || err.message || err));
}
}

async function saveGlobalScore(pts, cat, diff){
  
  log("GLOBAL SAVE CALLED", {
    pts,
    cat,
    diff,
    currentGameMode,
    username: playerProfile.username,
    accountKey: playerProfile.accountKey,
    isAuthenticated: playerProfile.isAuthenticated
});

if(!window.firebaseDB || !window.firebaseDoc || !window.firebaseGetDoc || !window.firebaseSetDoc){
console.warn("Firestore global score helpers not ready.");
return;
}

if(!playerProfile.isAuthenticated){
log("Guest user: skip global score save.");
return;
}

try{

const db = window.firebaseDB;
const docFn = window.firebaseDoc;
const getDocFn = window.firebaseGetDoc;
const setDocFn = window.firebaseSetDoc;

let docId = "";

// =========================
// ANSWER 10
// =========================
if(currentGameMode === "Answer10"){
  log("GLOBAL branch: Answer10 check");

docId = `${playerProfile.accountKey}_A10_${cat}_${diff}`;

const ref = docFn(db,"global_scores",docId);
const snap = await getDocFn(ref);

const newPerfect10 =
(
currentCorrectAnswers === 10 &&
(diff === "Scaling" || diff === "Hard")
) ? 1 : 0;

if(!snap.exists()){

await setDocFn(ref,{
username: playerProfile.username || "Guest",
accountKey: playerProfile.accountKey || "",
uid: playerProfile.uid || "",
mode: "Answer10",
category: cat,
difficulty: diff,
pts: pts,
perfect10: newPerfect10,
date: new Date().toISOString()
});

}else{

const data = snap.data();

if(pts > (data.pts || 0)){

await setDocFn(ref,{
...data,
username: playerProfile.username || data.username || "Guest",
uid: playerProfile.uid || data.uid || "",
pts: pts,
perfect10: newPerfect10,
date: new Date().toISOString()
});

}

}

}

// =========================
// TIME ATTACK
// =========================
if(currentGameMode === "TimeAttack"){
  log("GLOBAL branch: TimeAttack check");

docId = `${playerProfile.accountKey}_TA`;

const ref = docFn(db,"global_scores",docId);
const snap = await getDocFn(ref);

if(!snap.exists()){

log("GLOBAL writing NEW TimeAttack doc:", docId, {
    pts,
    streak: maxStreak || 0,
    bestRun: currentCorrectAnswers || 0
});  
await setDocFn(ref,{
username: playerProfile.username || "Guest",
accountKey: playerProfile.accountKey || "",
uid: playerProfile.uid || "",
mode: "TimeAttack",
category: "All",
difficulty: "Scaling",
pts: pts,
streak: maxStreak || 0,
bestRun: currentCorrectAnswers || 0,
date: new Date().toISOString()
});

}else{

const data = snap.data();

 log("GLOBAL updating TimeAttack doc:", docId, {
    oldData: data,
    newPts: Math.max(pts, data.pts || 0),
    newStreak: Math.max(maxStreak || 0, data.streak || 0),
    newBestRun: Math.max(currentCorrectAnswers || 0, data.bestRun || 0)
}); 
await setDocFn(ref,{
...data,
username: playerProfile.username || data.username || "Guest",
uid: playerProfile.uid || data.uid || "",
pts: Math.max(pts, data.pts || 0),
streak: Math.max(maxStreak || 0, data.streak || 0),
bestRun: Math.max(currentCorrectAnswers || 0, data.bestRun || 0),
date: new Date().toISOString()
});

}

}

log("GLOBAL score saved / updated");

}catch(err){
console.error("GLOBAL save error:",err);
}

}

async function loadGlobalScores(cat, diff){

if(
    !window.firebaseDB ||
    !window.firebaseCollection ||
    !window.firebaseQuery ||
    !window.firebaseWhere ||
    !window.firebaseOrderBy ||
    !window.firebaseLimit ||
    !window.firebaseGetDocs
){
    console.warn("Firestore global score loaders not ready.");
    return [];
}

try{

    const db = window.firebaseDB;
    const collectionFn = window.firebaseCollection;
    const queryFn = window.firebaseQuery;
    const whereFn = window.firebaseWhere;
    const orderByFn = window.firebaseOrderBy;
    const limitFn = window.firebaseLimit;
    const getDocsFn = window.firebaseGetDocs;

    const baseRef = collectionFn(db, "global_scores");

    let fieldToOrder = "pts";

    if(currentHS_Mode === "TimeAttack"){
        if(currentTA_View === "streak"){
            fieldToOrder = "streak";
        }else if(currentTA_View === "run"){
            fieldToOrder = "bestRun";
        }else{
            fieldToOrder = "pts";
        }
    }

    const q = queryFn(
        baseRef,
        whereFn("mode", "==", currentHS_Mode),
        whereFn("category", "==", cat),
        whereFn("difficulty", "==", diff),
        orderByFn(fieldToOrder, "desc"),
        limitFn(50)
    );

    const snap = await getDocsFn(q);

    const rows = [];

    snap.forEach(docSnap => {
        rows.push(docSnap.data());
    });


    return rows;

}catch(err){
    console.error("Global score load error:", err);
    return [];
}

}

function openTimeAttackIntro(){
    const modal = document.getElementById('timeattack-intro-modal');
    if(modal){
        modal.style.display = 'flex';
    }
}

function closeTimeAttackIntroToMode(){
    const modal = document.getElementById('timeattack-intro-modal');
    if(modal){
        modal.style.display = 'none';
    }

    goToScreen('mode-screen');
}

function startTimeAttackAfterIntro(){
    const modal = document.getElementById('timeattack-intro-modal');
    if(modal){
        modal.style.display = 'none';
    }

    startGame();
}

async function updatePantheonPlayerStats(){

if(!window.firebaseDB || !window.firebaseDoc || !window.firebaseSetDoc || !window.firebaseAuth){
console.warn("Pantheon helpers not ready.");
return;
}

const firebaseUser = window.firebaseAuth.currentUser;

if(!firebaseUser){
console.warn("No firebase user.");
return;
}

if(!playerProfile.isAuthenticated || playerProfile.authType !== "google"){
log("Guest user: skip pantheon update.");
return;
}

try{

const db = window.firebaseDB;
const docFn = window.firebaseDoc;
const setDocFn = window.firebaseSetDoc;

const totalScore = await getCloudTotalPlayerScore();
const bestStreak = await getCloudBestTimeAttackStreak();
const bestRun = await getCloudBestTimeAttackRun();
const perfect10 = perfect10Count || 0;
const gamesPlayed = await getTotalGamesPlayed();
const accuracy = await getOverallAccuracy();
const rankData = getPlayerRankAdvanced(totalScore,bestStreak,bestRun,perfect10);

await setDocFn(
docFn(db,'players',firebaseUser.uid),
{
uid: firebaseUser.uid,
username: playerProfile.username || "",
avatar: playerProfile.avatar || "",
avatarName: playerProfile.avatarName || "",
realName: playerProfile.realName || "",
rankTitleMode: playerProfile.rankTitleMode || "male",
usesCustomPhoto: !!playerProfile.usesCustomPhoto,
customPhotoDataUrl: playerProfile.customPhotoDataUrl || "",
cardTheme: playerProfile.cardTheme || "rank-default",

prose: playerProfile.prose || [],
poets: playerProfile.poets || [],
playwrights: playerProfile.playwrights || [],
books: playerProfile.books || [],
heroes: playerProfile.heroes || [],

pantheonTotalScore: totalScore,
pantheonAccuracy: accuracy,
pantheonPerfect10: perfect10,
pantheonBestStreak: bestStreak,
pantheonBestRun: bestRun,
pantheonGamesPlayed: gamesPlayed,

rankTitleMale: rankData.titleMale || rankData.title || "",
rankTitleFemale: rankData.titleFemale || rankData.titleMale || rankData.title || "",
rankIcon: rankData.icon || "🪶",

updatedAt: new Date().toISOString()
},
{merge:true}
);

log("Pantheon player stats updated.");

}catch(err){
console.error("Pantheon player stats update error:", err);
}

}

async function updateQuestionStats(questionObj, selectedOptionText, isCorrect){

    if(
        !window.firebaseDB ||
        !window.firebaseDoc ||
        !window.firebaseSetDoc ||
        !window.firebaseGetDoc ||
        !window.firebaseIncrement ||
        !questionObj ||
        !questionObj.id
    ){
        return;
    }

    try{
        const db = window.firebaseDB;
        const docFn = window.firebaseDoc;
        const setDocFn = window.firebaseSetDoc;
        const getDocFn = window.firebaseGetDoc;
        const incrementFn = window.firebaseIncrement;

        const paddedId = String(questionObj.id).padStart(4, "0");

        const statsRef = docFn(db, 'question_stats', `q_${paddedId}`);

        const optionKey =
            selectedOptionText && selectedOptionText.trim() !== ""
                ? selectedOptionText
                : "__timeout__";

        // 1) Κάνουμε increment στα βασικά stats
        await setDocFn(statsRef, {
            questionId: String(questionObj.id),
            questionText: questionObj.q || "",
            category: questionObj.category || "",
            level: questionObj.level || 1,
            genre: questionObj.genre || "Γενική",
            updatedAt: new Date().toISOString(),

            timesPlayed: incrementFn(1),
            timesCorrect: isCorrect ? incrementFn(1) : incrementFn(0),
            [`optionStats.${optionKey}`]: incrementFn(1)
        }, { merge: true });

        // 2) Διαβάζουμε το ενημερωμένο doc για accuracy + difficulty flag
        const snap = await getDocFn(statsRef);

        if(snap.exists()){
            const data = snap.data();

            const played = data.timesPlayed || 0;
            const correct = data.timesCorrect || 0;

            const accuracy =
                played > 0
                    ? Number(((correct / played) * 100).toFixed(1))
                    : 0;

            let difficultyFlag = "normal";

            if(accuracy < 25){
                difficultyFlag = "hard";
            }else if(accuracy > 80){
                difficultyFlag = "easy";
            }

            await setDocFn(statsRef, {
                accuracy: accuracy,
                difficultyFlag: difficultyFlag
            }, { merge: true });
        }

    }catch(err){
        console.error("Question stats update error:", err);
    }
}


function openHighScoreCategory(type, mode) {

    if(type === 'global' && !isGoogleUser()){
        showInitiationOnlyMessage("Το Global High Scores");
        return;
    }

    currentHS_Type = type;
    currentHS_Mode = mode;
    currentTA_View = 'score';

    const hsTitle = document.querySelector('#score-menu-screen .logo-sub');
    const diffTabs = document.getElementById('difficulty-tabs');
    const taTabs = document.getElementById('timeattack-tabs');
    const catFilters = document.getElementById('score-cat-filters');

    if (hsTitle) {
        if (type === 'personal') {
            hsTitle.innerText = `Τα δικά σου High Scores - ${mode}`;
        } else {
            hsTitle.innerText = `Global High Scores - ${mode}`;
        }
    }

    if (mode === 'TimeAttack') {
        currentHS_Cat = 'All';
        currentHS_Diff = 'Scaling';

        if (diffTabs) diffTabs.style.display = 'none';
        if (taTabs) taTabs.style.display = 'flex';
        if (catFilters) catFilters.style.display = 'none';

        const taButtons = document.querySelectorAll('#timeattack-tabs .tab-btn');
        taButtons.forEach(btn => btn.classList.remove('active'));
        if (taButtons[0]) taButtons[0].classList.add('active');
    } else {
        currentHS_Cat = 'Ελληνική';
        currentHS_Diff = 'Easy';

        if (diffTabs) diffTabs.style.display = 'flex';
        if (taTabs) taTabs.style.display = 'none';
        if (catFilters) catFilters.style.display = 'flex';

        const diffButtons = document.querySelectorAll('#difficulty-tabs .tab-btn');
        diffButtons.forEach(btn => btn.classList.remove('active'));
        if (diffButtons[0]) diffButtons[0].classList.add('active');

        const catButtons = document.querySelectorAll('#score-cat-filters .score-cat-btn');
        catButtons.forEach(btn => btn.classList.remove('active'));
        if (catButtons[0]) catButtons[0].classList.add('active');
    }

    goToScreen('score-menu-screen');
    displayScores(currentHS_Cat, currentHS_Diff);
}

function showSummary() {
    const container = document.getElementById('summary-container');
    if (!container) return;
    container.innerHTML = ""; 

    userAnswers.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'summary-card';

        let optionsHTML = "";
        item.options.filter(o => o !== "").forEach((opt) => {
            let emoji = "";
            let colorStyle = ""; // Εδώ θα μπαίνει το χρώμα

            if (opt === item.correct) {
                emoji = "✅";
                colorStyle = "color: #2ecc71; font-weight: bold;"; // Πράσινο για τη σωστή
            } else {
                emoji = "❌";
                // Αν ο χρήστης διάλεξε αυτή τη λάθος απάντηση, την κάνουμε κόκκινη
                if (opt === item.userChoice) {
                    colorStyle = "color: #ff4d4d;"; 
                } else {
                    colorStyle = "opacity: 0.7;"; // Οι υπόλοιπες λάθος απλώς αχνές
                }
            }
            
            optionsHTML += `<div class="summary-option" style="${colorStyle}">${emoji} ${opt}</div>`;
        });

        card.innerHTML = `
            <div style="color:var(--gold); font-weight:bold; margin-bottom:10px; border-bottom:1px solid rgba(199,143,87,0.2); padding-bottom:5px;">
                Ερώτηση ${index + 1}: ${item.question.replace(/\*\*(.*?)\*\*/g,'$1')}
            </div>
            <div class="summary-options-list">
                ${optionsHTML}
            </div>
            <div class="summary-meta" style="display:flex; justify-content:space-between; font-size:0.75rem; margin-top:12px; opacity:0.6; font-style:italic;">
                <span>Δυσκολία: ${item.difficulty}</span>
                <span>Κατηγορία: ${item.genre}</span>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Καθαρισμός για το επόμενο session
    userAnswers = []; 
}


function formatScoreDate(dateString){

    if(!dateString) return "";

    const monthsGR = [
        "Ιαν",
        "Φεβ",
        "Μαρ",
        "Απρ",
        "Μαϊ",
        "Ιουν",
        "Ιουλ",
        "Αυγ",
        "Σεπ",
        "Οκτ",
        "Νοε",
        "Δεκ"
    ];

    let date;

    // ISO format (2026-04-20T...)
    if(dateString.includes("T")){
        date = new Date(dateString);
    }

    // format τύπου 20/4/2026
    else if(dateString.includes("/")){
        const parts = dateString.split(" ")[0].split("/");
        date = new Date(parts[2], parts[1]-1, parts[0]);
    }

    else{
        return dateString;
    }

    const day = date.getDate();
    const month = monthsGR[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;

}

async function displayScores(cat, diff) {
    const scoreList = document.getElementById('score-list');
    if (!scoreList) return;

    const allPersonal =
        JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};

    let data = [];
    let title = "";

    // PERSONAL
if(currentHS_Type==='personal'){
if(isGoogleUser()){
data=await loadCloudPersonalScores(cat,diff);
title=currentHS_Mode==='TimeAttack'
? "Time Attack - Τα δικά σου σκορ"
: `${cat} - ${diff}`;
}else{
const allPersonal=JSON.parse(localStorage.getItem('quiz_scores_v11'))||{};
const accountKey=getLocalAccountKey();
const key=`${accountKey}_${currentHS_Mode}_${cat}_${diff}`;
data=allPersonal[key]||[];
title=currentHS_Mode==='TimeAttack'
? "Time Attack - Τα δικά σου σκορ"
: `${cat} - ${diff}`;
}
}

    // GLOBAL
else {
    data = await loadGlobalScores(cat, diff);

    title = currentHS_Mode === 'TimeAttack'
        ? "Time Attack - Global High Scores"
        : `${cat} - ${diff} - Global High Scores`;
}

    // Ειδικό sort για TimeAttack / Best Streak
 // Φιλτράρουμε πρώτα άχρηστες εγγραφές
if(currentHS_Mode==='TimeAttack'&&currentTA_View==='streak'){
data=data.filter(e=>(e.streak||0)>0);
data=[...data].sort((a,b)=>(b.streak||0)-(a.streak||0));
}else if(currentHS_Mode==='TimeAttack'&&currentTA_View==='run'){
data=data.filter(e=>(e.bestRun||0)>0);
data=[...data].sort((a,b)=>(b.bestRun||0)-(a.bestRun||0));
}else{
data=data.filter(e=>(e.pts||0)>0);
data=[...data].sort((a,b)=>(b.pts||0)-(a.pts||0));
}
  
    let html = `<h4 style="color:var(--gold); text-align:center; margin-bottom:20px;">${title}</h4>`;

    if (data.length === 0) {
        html += `<p style="text-align:center; opacity: 0.6;">Κανένα σκορ ακόμα.</p>`;
    } else {
        data.forEach((e, i) => {

 let valueText=`${e.pts} pts`;
if(currentHS_Mode==='TimeAttack'&&currentTA_View==='streak'){
valueText=`${e.streak||0} 🔥`;
}else if(currentHS_Mode==='TimeAttack'&&currentTA_View==='run'){
valueText=`${e.bestRun||0} σωστές`;
}

html += `
    <div class="score-row">
        <span class="score-row-value">
            ${i + 1}. ${e.username ? e.username + ' - ' : ''}${valueText}
        </span>
        <span class="score-row-date">
${formatScoreDate(e.date)}
</span>
    </div>
`;
        });
    }

    scoreList.innerHTML = html;
}



let currentTA_View = 'score'; // score | streak


function selectTimeAttackTab(element, type) {
    currentTA_View = type;
    document
        .querySelectorAll('#timeattack-tabs .tab-btn')
        .forEach(b => b.classList.remove('active'));
    element.classList.add('active');
    displayScores(currentHS_Cat, currentHS_Diff);
}

// --- CONTROLS ---
function selectTab(element, diff) { currentHS_Diff = diff; document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); element.classList.add('active'); displayScores(currentHS_Cat, diff); }
function selectCat(element, cat) { currentHS_Cat = cat; document.querySelectorAll('.score-cat-btn').forEach(b => b.classList.remove('active')); element.classList.add('active'); displayScores(cat, currentHS_Diff); }

// Οριστική έξοδος
function forceExit() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'none';

    clearInterval(timerInterval);
    timerInterval = null;
    showFinishScreen();
}


/* =========================================================
   SUPPORT / FORMS / FEEDBACK
========================================================= */

// --- SUPPORT ---
function openSupportPage(type) {
    lastSupportType = type; // Αποθηκεύουμε αν είναι 'new-q' ή 'error'
    const title = document.getElementById('support-title');
    const label = document.getElementById('sup-msg-label');
    if (type === 'new-q') { 
        title.innerText = "Υποβολή Ερώτησης"; 
        label.innerText = "Η ερώτησή σας:"; 
    } else { 
        title.innerText = "Αναφορά Λάθους"; 
        label.innerText = "Με ποια ερώτηση διαφωνείτε;"; 
    }
    goToScreen('support-form-screen');
}

function submitSupport() {
    const nameInput = document.getElementById('sup-name');
    const emailInput = document.getElementById('sup-email');
    const msgInput = document.getElementById('sup-message');

    const name = nameInput ? nameInput.value : "";
    const email = emailInput ? emailInput.value : "";
    const msg = msgInput ? msgInput.value : "";

    if (!msg || !email) {
        document.getElementById('validation-modal').style.display = 'flex';
        return;
    }

    fetch("https://formspree.io/f/xqegavyj", {
        method: "POST",
        body: JSON.stringify({
            Name: name || "Anonymous",
            Email: email,
            Message: msg,
            Type: lastSupportType
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (res.ok) {
            playCorrect();

            if(nameInput) nameInput.value = "";
            if(emailInput) emailInput.value = "";
            if(msgInput) msgInput.value = "";

            showThanksModal();
        }
    }).catch(err => {
        console.error("Support submit error:", err);
    });
}

// Συνάρτηση για να κλείνει το προειδοποιητικό modal
function closeValidationModal() {
    document.getElementById('validation-modal').style.display = 'none';
}

function showThanksModal() {
    const modal = document.getElementById('thanks-modal');
    const msgNewQ = document.getElementById('msg-new-q');
    const msgError = document.getElementById('msg-error-report');

    // Κλείνουμε και τα δύο καλού-κακού πριν δείξουμε το σωστό
    msgNewQ.style.display = 'none';
    msgError.style.display = 'none';

    if (lastSupportType === 'new-q') {
        msgNewQ.style.display = 'block';
    } else {
        msgError.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

function closeThanksModal() {
    document.getElementById('thanks-modal').style.display = 'none';
    goToScreen('start-screen'); // Επιστροφή στην αρχή
}

// Παύση ήχου όταν η εφαρμογή "κρύβεται"
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        stopMenuMusic();
        if (audioCtx && audioCtx.state !== 'suspended') {
            audioCtx.suspend();
        }
    } else {
        if (musicEnabled && !isMuted) {
            startMenuMusic();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
});

// --- MODAL ΓΙΑ ΕΞΟΔΟ ΑΠΟ ΤΟ ΠΑΙΧΝΙΔΙ (Μέσα στο Game) ---
function confirmExit() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.style.display = 'flex';
        clearInterval(timerInterval); 
    }
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    if (currentGameMode === 'TimeAttack') {
        startTimeAttackTimer();
    } else if (currentGameMode === 'Answer10') {
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('timer-text').innerText = timeLeft + "s";
            if (timeLeft <= 0) handleAnswer(null, false);
        }, 1000);
    }
}

// --- MODAL ΓΙΑ ΕΞΟΔΟ ΑΠΟ ΤΗΝ ΕΦΑΡΜΟΓΗ (Κεντρικό Μενού) ---
function exitApp() {
    const modal = document.getElementById('exit-app-modal');
    if (modal) modal.style.display = 'flex';
}

function closeExitAppModal() {
    const modal = document.getElementById('exit-app-modal');
    if (modal) modal.style.display = 'none';
}

// Η τελική εντολή κλεισίματος για το APK
function terminateApp() {
    closeExitAppModal();

    setTimeout(() => {
        // PWA WebView Android - simulate back button press
        if(window.Android && window.Android.exitApp){
            window.Android.exitApp();
            return;
        }

        // Cordova
        if(navigator.app && navigator.app.exitApp){
            navigator.app.exitApp();
            return;
        }

        // PWA - go back to minimize/close
        if(window.history.length > 1){
            window.history.go(-window.history.length);
        } else {
            window.location.href = 'about:blank';
        }
    }, 200);
}

function handleLogin(mode){
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');
  const username = usernameInput ? usernameInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value.trim() : "";
  
  const termsCheckbox = document.getElementById('terms-checkbox');

if(!termsCheckbox || !termsCheckbox.checked){

    const msgEl = document.getElementById('validation-message');
    if(msgEl){
        msgEl.innerHTML =
            "Παρακαλώ διαβάστε και αποδεχθείτε <br>την Πολιτική Απορρήτου και τους Όρους Χρήσης!";
    }

    document.getElementById('validation-modal').style.display = 'flex';
    return;
}

  if(mode === 'google-full'){
    const auth = window.firebaseAuth;
    const provider = window.firebaseGoogleProvider;
    const signInWithPopupFn = window.firebaseSignInWithPopup;
    const db = window.firebaseDB;
    const docFn = window.firebaseDoc;
    const getDocFn = window.firebaseGetDoc;

    if(!auth || !provider || !signInWithPopupFn || !db || !docFn || !getDocFn){
      console.error("Firebase Auth/Firestore is not ready.");
      alert("Το Google Login δεν είναι έτοιμο ακόμη.");
      return;
    }

    signInWithPopupFn(auth, provider).then(function(result){
      const googleUser = result.user;
      window.pendingGoogleUser = googleUser;

      const playerRef = docFn(db, 'players', googleUser.uid);

      return getDocFn(playerRef).then(function(playerSnap){

        if(playerSnap.exists()){
          const playerData = playerSnap.data();

          initiationCompleted = !!playerData.initiationCompleted;

          if(typeof playerData.pantheonPerfect10 === "number"){
            perfect10Count = playerData.pantheonPerfect10;
          }

          if(playerData.avatar){
            playerProfile.avatar = playerData.avatar;
          }

          if(playerData.avatarName){
            playerProfile.avatarName = playerData.avatarName;
          }

          if(typeof playerData.pergamena === "number"){
            window.playerPergamena = playerData.pergamena;
            updatePergamenaDisplay();
          }

          if(Array.isArray(playerData.unlockedAvatars)){
            unlockedAvatars = [...playerData.unlockedAvatars];
          } else {
            unlockedAvatars = [];
          }

          playerProfile.realName = playerData.realName || "";
          playerProfile.prose = Array.isArray(playerData.prose) ? playerData.prose : [];
          playerProfile.poets = Array.isArray(playerData.poets) ? playerData.poets : [];
          playerProfile.playwrights = Array.isArray(playerData.playwrights) ? playerData.playwrights : [];
          playerProfile.books = Array.isArray(playerData.books) ? playerData.books : [];
          playerProfile.heroes = Array.isArray(playerData.heroes) ? playerData.heroes : [];
          playerProfile.rankTitleMode = playerData.rankTitleMode || "male";
          playerProfile.usesCustomPhoto = !!playerData.usesCustomPhoto;
          playerProfile.customPhotoDataUrl = playerData.customPhotoDataUrl || "";
          playerProfile.cardTheme = playerData.cardTheme || "rank-default";

          executeLogin(
            playerData.username || googleUser.displayName || googleUser.email || "Google Player",
            "",
            "google-full"
          );
          return;
        }
        initiationCompleted = false;
        initiationStep = 0;
        localStorage.removeItem('literaUnlockedAvatars');
        localStorage.removeItem('literaPergamena');
        window.playerPergamena = 0;
        updatePergamenaDisplay();
        applyUnlockedAvatarsFromStorage();

        const modal = document.getElementById('google-username-modal');
        const input = document.getElementById('google-username-input');

        if(input){
          input.value = "";
          input.placeholder = googleUser.displayName || "Γράψε ψευδώνυμο";
        }

        if(modal) modal.style.display = 'flex';
      });

    }).catch(function(error){
      console.error("Google login error full:", error);
      alert("Google error: " + error.code + " | " + error.message);
    });

    return;
  }

if(username === ""){

    const msgEl = document.getElementById('validation-message');

    if(msgEl){
        msgEl.innerHTML =
        "Παρακαλώ συμπληρώστε όλα <br>τα απαραίτητα πεδία!";
    }

    document.getElementById('validation-modal').style.display = 'flex';

    usernameInput.classList.add('input-error');

    return;
}

  if(mode === 'standard' && password === ""){
    document.getElementById('password-warning-modal').style.display = 'flex';
    return;
  }

  executeLogin(username, password, mode);
}

function startInitiationIfNeeded(){

    if(initiationCompleted){
        goToScreen('start-screen');
        return;
    }

    initiationStep = 1;
    initiationSelectedRank = null;

    goToScreen('initiation-rank-screen');
}


async function completeInitiation(){
    initiationCompleted = true;
    initiationStep = 0;

    localStorage.setItem('literaInitiationCompleted', 'true');

    const auth = window.firebaseAuth;
    const db = window.firebaseDB;
    const docFn = window.firebaseDoc;
    const setDocFn = window.firebaseSetDoc;

    if(auth && auth.currentUser && db && docFn && setDocFn){
        const playerRef = docFn(db, 'players', auth.currentUser.uid);
        await setDocFn(playerRef, {
            initiationCompleted: true,
            realName: playerProfile.realName || "",
            prose: Array.isArray(playerProfile.prose) ? playerProfile.prose : [],
            poets: Array.isArray(playerProfile.poets) ? playerProfile.poets : [],
            playwrights: Array.isArray(playerProfile.playwrights) ? playerProfile.playwrights : [],
            books: Array.isArray(playerProfile.books) ? playerProfile.books : [],
            heroes: Array.isArray(playerProfile.heroes) ? playerProfile.heroes : [],
            rankTitleMode: playerProfile.rankTitleMode || "male"
        }, { merge: true });
    }

    goToScreen('start-screen');
}


function showInitiationOverlay(title,text){
    const overlay = document.getElementById('initiation-overlay');
    const titleEl = document.getElementById('initiation-title');
    const textEl = document.getElementById('initiation-text');

    if(titleEl) titleEl.innerText = title;
    if(textEl) textEl.innerText = text;
    if(overlay) overlay.classList.remove('is-hidden');
}

function hideInitiationOverlay(){
    const overlay = document.getElementById('initiation-overlay');
    if(overlay) overlay.classList.add('is-hidden');
}

function proceedWithoutPassword(){
const username=document.getElementById('username-input').value.trim();
document.getElementById('password-warning-modal').style.display='none';
executeLogin(username,"",'guest');
}
function closePasswordWarning(){
document.getElementById('password-warning-modal').style.display='none';
}
function confirmGoogleUsername(){
const input=document.getElementById('google-username-input');
const modal=document.getElementById('google-username-modal');
const username=input?input.value.trim():"";
const googleUser=window.pendingGoogleUser;
const db=window.firebaseDB;
const docFn=window.firebaseDoc;
const setDocFn=window.firebaseSetDoc;
if(username===""){
alert("Γράψε πρώτα ένα όνομα παίκτη.");
return;
}
if(!googleUser){
alert("Δεν βρέθηκε Google user.");
return;
}
if(!db||!docFn||!setDocFn){
alert("Το Firestore δεν είναι έτοιμο.");
return;
}
const playerRef=docFn(db,'players',googleUser.uid);
setDocFn(playerRef,{
uid:googleUser.uid,
username:username,
email:googleUser.email||"",
authType:"google",
createdAt:new Date().toISOString(),
pergamena:window.playerPergamena||0,
initiationCompleted:false,
unlockedAvatars:getUnlockedAvatarIds()
}).then(function(){
if(modal)modal.style.display='none';
window.pendingGoogleUser=null;
initiationCompleted = false;
initiationStep = 0;  
executeLogin(username,"","google-full");
}).catch(function(error){
console.error("Save player error:",error);
alert("Σφάλμα αποθήκευσης λογαριασμού.");
});
}

function cancelGoogleUsername(){
const modal=document.getElementById('google-username-modal');
if(modal)modal.style.display='none';
window.pendingGoogleUser=null;
goToScreen('login-screen');
}

function getLocalAccountKey(){
return playerProfile.accountKey||`${playerProfile.authType}_${(playerProfile.username||'anonymous').trim().toLowerCase()}`;
}

function getScopedStorageKey(baseKey){
if(isGoogleUser()) return baseKey;
return `${baseKey}_${getLocalAccountKey()}`;
}

function executeLogin(user,pass,mode){
playerProfile.username=user;
playerProfile.authType=mode==='google-full'?'google':(mode==='standard'?'standard':'guest');
playerProfile.isAuthenticated=(playerProfile.authType==='google'||playerProfile.authType==='standard');
playerProfile.accountKey=`${playerProfile.authType}_${user.trim().toLowerCase()}`;

const firebaseUser=
window.firebaseAuth&&window.firebaseAuth.currentUser
?window.firebaseAuth.currentUser
:null;

playerProfile.uid=
firebaseUser&&firebaseUser.uid
?firebaseUser.uid
:"";

if(!isGoogleUser()){
playerProfile.avatar=localStorage.getItem('literaAvatarImg')||"";
playerProfile.avatarName=localStorage.getItem('literaAvatarRole')||"";

localStorage.setItem('literaUserName',user);
localStorage.setItem('literaAuthType',playerProfile.authType);
localStorage.setItem('literaIsAuthenticated',playerProfile.isAuthenticated?'true':'false');
localStorage.setItem('literaAccountKey',playerProfile.accountKey);

perfect10Count=parseInt(
localStorage.getItem(getGuestScopedKey('literaPerfect10Count'))||"0",
10
);

window.playerPergamena=parseInt(
localStorage.getItem(getGuestScopedKey('literaPergamena'))||"0",
10
);
}

renderAvatarScreen();
updateProfileUI();

if(playerProfile.avatar&&playerProfile.avatarName){
if(isGoogleUser()){
startInitiationIfNeeded();
}else{
goToScreen('start-screen');
}
return;
}

if(typeof avatarReturnScreen!=="undefined") avatarReturnScreen='start-screen';

const nameDisplay=document.getElementById('display-username');
if(nameDisplay) nameDisplay.innerText=user;

goToScreen('avatar-screen');
}



function handleLogout() {
    playClick();
    const modal = document.getElementById('logout-modal');
    if (modal) modal.style.display = 'flex';
}

// 2. Αυτή καλείται αν ο χρήστης πατήσει "Παραμονή"
function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) modal.style.display = 'none';
}

// 3. Αυτή καλείται αν ο χρήστης πατήσει οριστικά "Αποσύνδεση"

async function confirmLogout() {
    const modal = document.getElementById('logout-modal');
    if(modal) modal.style.display = 'none';

    playClick();

    try{
        const auth = window.firebaseAuth;
if(auth && window.firebaseSignOut){
    await window.firebaseSignOut(auth);
}
    }catch(err){
        console.error("Firebase signOut error:", err);
    }

    localStorage.removeItem('literaUserName');
    localStorage.removeItem('literaAuthType');
    localStorage.removeItem('literaAvatarImg');
    localStorage.removeItem('literaAvatarRole');
    localStorage.removeItem('literaAccountKey');
    localStorage.removeItem('literaIsAuthenticated');
    localStorage.removeItem('literaPlayerProfile');
    localStorage.removeItem('literaPergamena');
    localStorage.removeItem('literaUnlockedAvatars');
    if(isGoogleUser()){
localStorage.removeItem('literaPerfect10Count');
}else{
localStorage.removeItem(getGuestScopedKey('literaPerfect10Count'));
}
    perfect10Count = 0;
    window.playerPergamena = 0;
    updatePergamenaDisplay();

    playerProfile = {
        username: "",
        avatar: "",
        avatarName: "",
        uid: "",
        authType: "guest",
        accountKey: "",
        isAuthenticated: false,
        realName: "",
        rankTitleMode: "male",
        prose: [],
        poets: [],
        playwrights: [],
        books: [],
        heroes: [],
        usesCustomPhoto: false,
        customPhotoDataUrl: "",
        cardTheme: "rank-default"
    };

    goToScreen('login-screen');
    log("Ο χρήστης αποσυνδέθηκε.");
}

// --- 4. AVATARS ---

const AVATAR_COST = {
    basic: 200,
    classic: 500,
    advanced: 800,
    legendary: 1200,
    epic: 2000,
    unique: 3000
};

const allAvatars = {
    "Πεζογραφία": [

    // UNLOCKED
    {id:"Kazantzakis", name:"Νίκος Καζαντζάκης", img:"assets/avatar-novelists/Kazantzakis.webp", locked:false, cost:0},

    // BASIC — 200
    {id:"Myrivilis", name:"Στράτης Μυριβήλης", img:"assets/avatar-novelists/Myrivilis.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Lountemis", name:"Μενέλαος Λουντέμης", img:"assets/avatar-novelists/Lountemis.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Karagatsis", name:"Μ. Καραγάτσης", img:"assets/avatar-novelists/Karagatsis.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Hawthorne", name:"Nathaniel Hawthorne", img:"assets/avatar-novelists/Nathaniel_Hawthorne.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"TMorrison", name:"Toni Morrison", img:"assets/avatar-novelists/Toni_Morrison.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"EBronte", name:"Emily Brontë", img:"assets/avatar-novelists/Emily_Bronte.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Lee", name:"Harper_Lee", img:"assets/avatar-novelists/Harper_Lee.webp", locked:true, cost:AVATAR_COST.classic},   

    // CLASSIC — 500
    {id:"Proust", name:"Marcel Proust", img:"assets/avatar-novelists/Marcel_Proust.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Camus", name:"Albert Camus", img:"assets/avatar-novelists/Alber_Camus.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Houellebecq", name:"Michel Houellebecq", img:"assets/avatar-novelists/Michel_Houellebecq.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Hesse", name:"Hermann Hesse", img:"assets/avatar-novelists/Hermann_Hesse.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Orwell", name:"George Orwell", img:"assets/avatar-novelists/George_Orwell.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Eco", name:"Umberto Eco", img:"assets/avatar-novelists/Umberto_Eco.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Woolf", name:"Virginia Woolf", img:"assets/avatar-novelists/Virginia_Woolf.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Marquez", name:"Gabriel García Márquez", img:"assets/avatar-novelists/Gabriel_Garcia_Marquez.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"CBronte", name:"Charlotte Brontë", img:"assets/avatar-novelists/Charlotte_Bronte.webp", locked:true, cost:AVATAR_COST.classic},

    // ADVANCED — 800
    {id:"Papadiamantis", name:"Αλέξανδρος Παπαδιαμάντης", img:"assets/avatar-novelists/Papadiamantis.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"MShelley", name:"Mary Shelley", img:"assets/avatar-novelists/Mary_Shelley.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Kundera", name:"Milan Kundera", img:"assets/avatar-novelists/Milan_Kundera.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Dickens", name:"Charles Dickens", img:"assets/avatar-novelists/Charles_Dickens.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Flaubert", name:"Gustave Flaubert", img:"assets/avatar-novelists/Gustave_Flaubert.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Oe", name:"Kenzaburō Ōe", img:"assets/avatar-novelists/Kenzaburo_Oe.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Steinbeck", name:"John Steinbeck", img:"assets/avatar-novelists/John_Steinbeck.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Broch", name:"Hermann Broch", img:"assets/avatar-novelists/Hermann_Broch.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Celine", name:"Louis Ferdinand Celine", img:"assets/avatar-novelists/Louis_Ferdinand_Celine.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Duras", name:"Marguerite Duras", img:"assets/avatar-novelists/Marguerite_Duras.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Huxley", name:"Aldous Huxley", img:"assets/avatar-novelists/Aldous_Huxley.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"JRoth", name:"Joseph Roth", img:"assets/avatar-novelists/Joseph_Roth.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Doyle", name:"Arthur Conan Doyle", img:"assets/avatar-novelists/Arthur_Conan_Doyle.webp", locked:true, cost:AVATAR_COST.advanced},

    // LEGENDARY — 1200
    {id:"Joyce", name:"James Joyce", img:"assets/avatar-novelists/James_Joyce.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Agatha", name:"Agatha Christie", img:"assets/avatar-novelists/Agatha_Christie.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Kafka", name:"Franz Kafka", img:"assets/avatar-novelists/Franz_Kafka.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"TMann", name:"Thomas Mann", img:"assets/avatar-novelists/Thomas_Mann.webp", locked:true, cost:AVATAR_COST.legendary},  
    {id:"Twain", name:"Mark Twain", img:"assets/avatar-novelists/Mark_Twain.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Nabokov", name:"Vladimir Nabokov", img:"assets/avatar-novelists/Vladimir_Nabokov.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Dumas", name:"Alexandre Dumas", img:"assets/avatar-novelists/Alexandre_Dumas.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Melville", name:"Herman Melville", img:"assets/avatar-novelists/Herman_Melville.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Mishima", name:"Yukio Mishima", img:"assets/avatar-novelists/Yukio_Mishima.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Tolkien", name:"John Ronald Reuel Tolkien", img:"assets/avatar-novelists/John_Ronald_Reuel_Tolkien.webp", locked:true, cost:AVATAR_COST.legendary},

    // EPIC — 2000
    {id:"Tolstoy", name:"Leo Tolstoy", img:"assets/avatar-novelists/Leon_Tolstoy.webp", locked:true, cost:AVATAR_COST.epic},
    {id:"Viziinos", name:"Γεώργιος Βιζυηνός", img:"assets/avatar-novelists/Viziinos.webp", locked:true, cost:AVATAR_COST.epic},
    {id:"Cervantes", name:"Miguel de Cervantes", img:"assets/avatar-novelists/Miguel_de_Cervantes.webp", locked:true, cost:AVATAR_COST.epic},

    // UNIQUE — 3000
    {id:"Dostoevsky", name:"Fyodor Dostoevsky", img:"assets/avatar-novelists/Fyodor_Dostoevsky.webp", locked:true, cost:AVATAR_COST.unique},
    ],

    "Θέατρο": [

    // UNLOCKED
    {id:"Brecht", name:"Bertolt Brecht", img:"assets/avatar-playwrights/Bertol_Brecht.webp", locked:false, cost:0},

    // BASIC — 200
    {id:"Miller", name:"Arthur Miller", img:"assets/avatar-playwrights/Arthur_Miller.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"DarioFo", name:"Dario Fo", img:"assets/avatar-playwrights/Dario_Fo.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Hellman", name:"Lillian Hellman", img:"assets/avatar-playwrights/Lillian_Hellman.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Marlowe", name:"Christopher Marlowe", img:"assets/avatar-playwrights/Christopher_Marlowe.webp", locked:true, cost:AVATAR_COST.basic},

    // CLASSIC — 500
    {id:"Chekhov", name:"Anton Chekhov", img:"assets/avatar-playwrights/Anton_Chekhov.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Ionesco", name:"Eugène Ionesco", img:"assets/avatar-playwrights/Eugen_Ionescu.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"ONeill", name:"Eugene O'Neill", img:"assets/avatar-playwrights/Eugene_O_Neill.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Pirandello", name:"Luigi Pirandello", img:"assets/avatar-playwrights/Luigi_Pirandello.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Williams", name:"Tennessee Williams", img:"assets/avatar-playwrights/Tennessee_Williams.webp", locked:true, cost:AVATAR_COST.classic},

    // ADVANCED — 800
    {id:"Strindberg", name:"August Strindberg", img:"assets/avatar-playwrights/August_Strindberg.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Pinter", name:"Harold Pinter", img:"assets/avatar-playwrights/Harold_Pinter.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Shaw", name:"George Bernard Shaw", img:"assets/avatar-playwrights/George_Bernard_Shaw.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Bjornson", name:"Bjørnstjerne Bjørnson", img:"assets/avatar-playwrights/Bjornstjerne_Bjornson.webp", locked:true, cost:AVATAR_COST.advanced},

    // LEGENDARY — 1200
    {id:"Beckett", name:"Samuel Beckett", img:"assets/avatar-playwrights/Samuel_Beckett.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Sophocles", name:"Σοφοκλής", img:"assets/avatar-playwrights/Sophocles.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Euripides", name:"Ευριπίδης", img:"assets/avatar-playwrights/Euripides.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Aristophanes", name:"Αριστοφάνης", img:"assets/avatar-playwrights/Aristophanes.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Moliere", name:"Molière", img:"assets/avatar-playwrights/Moliere.webp", locked:true, cost:AVATAR_COST.legendary},

    // EPIC — 2000
    {id:"Aeschylus", name:"Αισχύλος", img:"assets/avatar-playwrights/Aeschylus.webp", locked:true, cost:AVATAR_COST.epic},
    {id:"Ibsen", name:"Henrik Ibsen", img:"assets/avatar-playwrights/Henrik_Ibsen.webp", locked:true, cost:AVATAR_COST.epic},

    // UNIQUE — 3000
    {id:"Shakespeare", name:"William Shakespeare", img:"assets/avatar-playwrights/William_Shakespeare.webp", locked:true, cost:AVATAR_COST.unique}

],

"Ποίηση": [

    // UNLOCKED
    {id:"Kavvadias", name:"Νίκος Καββαδίας", img:"assets/avatar-poets/Kavvadias.webp", locked:false, cost:0},

    // BASIC — 200
    {id:"Gkatsos", name:"Νίκος Γκάτσος", img:"assets/avatar-poets/Nikos_Gkatsos.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Frost", name:"Robert Frost", img:"assets/avatar-poets/Robert_Frost.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Keats", name:"John Keats", img:"assets/avatar-poets/John_Keats.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Dimoula", name:"Κική Δημουλά", img:"assets/avatar-poets/Dimoula.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Livadiitis", name:"Τάσος Λειβαδίτης", img:"assets/avatar-poets/Tasos_Livadites.webp", locked:true, cost:AVATAR_COST.basic},

    // CLASSIC — 500
    {id:"Elytis", name:"Οδυσσέας Ελύτης", img:"assets/avatar-poets/Elytis.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Seferis", name:"Γιώργος Σεφέρης", img:"assets/avatar-poets/Seferis.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Ritsos", name:"Γιάννης Ρίτσος", img:"assets/avatar-poets/Ritsos.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Palamas", name:"Κωστής Παλαμάς", img:"assets/avatar-poets/Palamas.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Plath", name:"Sylvia Plath", img:"assets/avatar-poets/Sylvia_Plath.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Blake", name:"William Blake", img:"assets/avatar-poets/William_Blake.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Dickinson", name:"Emily Dickinson", img:"assets/avatar-poets/Emily_Dickinson.webp", locked:true, cost:AVATAR_COST.classic},

    // ADVANCED — 800
    {id:"Baudelaire", name:"Charles Baudelaire", img:"assets/avatar-poets/Charles_Pierre_Baudelaire.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Yeats", name:"William Butler Yeats", img:"assets/avatar-poets/William_Butler_Yeats.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Tennyson", name:"Lord Alfred Tennyson", img:"assets/avatar-poets/Lord_Alfred_Tennyson.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Neruda", name:"Pablo Neruda", img:"assets/avatar-poets/Pablo_Neruda.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Heine", name:"Heinrich Heine", img:"assets/avatar-poets/Heinrich_Heine.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Mistral", name:"Gabriela Mistral", img:"assets/avatar-poets/Gabriela_Mistral.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Mayakovsky", name:"Vladimir Mayakovsky", img:"assets/avatar-poets/Vladimir_Mayakovsky.webp", locked:true, cost:AVATAR_COST.advanced},

    // LEGENDARY — 1200
    {id:"Eliot", name:"T. S. Eliot", img:"assets/avatar-poets/TS_Eliot.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Coleridge", name:"Samuel Taylor Coleridge", img:"assets/avatar-poets/Samuel_Taylor_Coleridge.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Kipling", name:"Rudyard Kipling", img:"assets/avatar-poets/Rudyard_Kipling.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Rimbaud", name:"Arthur Rimbaud", img:"assets/avatar-poets/Arthur_Rimbaud.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"GarciaLorca", name:"Federico García Lorca", img:"assets/avatar-poets/Federico_Garcia_Lorca.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Angelou", name:"Maya Angelou", img:"assets/avatar-poets/Maya_Angelou.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Cummings", name:"E. E. Cummings", img:"assets/avatar-poets/EE_Cummings.webp", locked:true, cost:AVATAR_COST.legendary},

    // EPIC — 2000
    {id:"Cavafy", name:"Κωνσταντίνος Π. Καβάφης", img:"assets/avatar-poets/Cavafy.webp", locked:true, cost:AVATAR_COST.epic},
    {id:"Ono", name:"Ono no Komachi", img:"assets/avatar-poets/Ono_no_Komachi.webp", locked:true, cost:AVATAR_COST.epic},

    // UNIQUE
    {id:"Pushkin", name:"Alexander Pushkin", img:"assets/avatar-poets/Alexander_Sergeyevich_Pushkin.webp", locked:true, cost:AVATAR_COST.unique},
    {id:"Whitman", name:"Walt Whitman", img:"assets/avatar-poets/Walt_Whitman.webp", locked:true, cost:AVATAR_COST.unique}

],

"Λογοτεχνικοί Ήρωες": [

    // UNLOCKED
    {id:"Anna", name:"Anna Karenina", img:"assets/avatar-heroes/Anna_Karenina.webp", locked:false, cost:0},

    // BASIC — 200
    {id:"Gregor", name:"Gregor Samsa", img:"assets/avatar-heroes/Gregor_Samsa.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Cecile", name:"Cécile", img:"assets/avatar-heroes/Cecile.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Loxandra", name:"Λωξάντρα", img:"assets/avatar-heroes/Loxandra.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Fragkogiannou", name:"Φραγκογιαννού", img:"assets/avatar-heroes/Fragkogiannou.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"Jo", name:"Jo March", img:"assets/avatar-heroes/Jo_March.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"JohnWild", name:"John the Savage", img:"assets/avatar-heroes/John_The_Savage.webp", locked:true, cost:AVATAR_COST.basic},
    {id:"SergiosBakhos", name:"Σέργιος και Βάκχος", img:"assets/avatar-heroes/Sergios_Bakxos.webp", locked:true, cost:AVATAR_COST.basic},

    // CLASSIC — 500
    {id:"Ahab", name:"Captain Ahab", img:"assets/avatar-heroes/Captain_Ahab.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Gatsby", name:"Jay Gatsby", img:"assets/avatar-heroes/Jay_Gatsby.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Dracula", name:"Count Dracula", img:"assets/avatar-heroes/Count_Dracula.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"LadyMacbeth", name:"Lady Macbeth", img:"assets/avatar-heroes/Lady_Macbeth.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"Yossarian", name:"Capt. John Yossarian", img:"assets/avatar-heroes/Capt_John_Yossarian.webp", locked:true, cost:AVATAR_COST.classic},
    {id:"JaneEyre", name:"Jane Eyre", img:"assets/avatar-heroes/Jane_Eyre.webp", locked:true, cost:AVATAR_COST.classic},

    // ADVANCED — 800
    {id:"Baskerville", name:"William of Baskerville", img:"assets/avatar-heroes/William_of_Baskerville.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Dantes", name:"Edmond Dantès", img:"assets/avatar-heroes/Count_Montechristo.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Javert", name:"Inspector Javert", img:"assets/avatar-heroes/Inspector_Javert.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Leopold", name:"Leopold Bloom", img:"assets/avatar-heroes/Leopold_Bloom.webp", locked:true, cost:AVATAR_COST.advanced},
    {id:"Sydney", name:"Sydney Carton", img:"assets/avatar-heroes/Sydney_Carton.webp", locked:true, cost:AVATAR_COST.advanced},

    // LEGENDARY — 1200
    {id:"Myshkin", name:"Prince Myshkin", img:"assets/avatar-heroes/Lev_Nikolayevich_Myshkin.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Papissa", name:"Πάπισσα Ιωάννα", img:"assets/avatar-heroes/Popese_Joanna.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Cathy", name:"Cathy Earnshaw", img:"assets/avatar-heroes/Cathy_Earnshaw.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Othello", name:"Othello", img:"assets/avatar-heroes/Othello.webp", locked:true, cost:AVATAR_COST.legendary},
    {id:"Gandalf", name:"Gandalf", img:"assets/avatar-heroes/Gandalf.webp", locked:true, cost:AVATAR_COST.legendary},

    // EPIC — 2000
    {id:"DonQuixote", name:"Don Quixote", img:"assets/avatar-heroes/Don_Quixote.webp", locked:true, cost:AVATAR_COST.epic},
    {id:"Sherlock", name:"Sherlock Holmes", img:"assets/avatar-heroes/Sherlock_Holmes.webp", locked:true, cost:AVATAR_COST.epic},

    // UNIQUE — 3000
    {id:"Raskolnikov", name:"Rodion Raskolnikov", img:"assets/avatar-heroes/Raskolnikov.webp", locked:true, cost:AVATAR_COST.unique}

]
};


function getAvatarCategoryBoxClass(category){

    if(category === "Πεζογραφία")
        return "help-section-blue";

    if(category === "Ποίηση")
        return "help-section-yellow";

    if(category === "Θέατρο")
        return "help-section-green";

    if(category === "Λογοτεχνικοί Ήρωες")
        return "help-section-red";

    return "help-section-blue";
}

function renderAvatarScreen(){

    const wrapper =
        document.getElementById('avatar-categories-wrapper');

    if(!wrapper) return;

    wrapper.innerHTML = "";

    /* =========================
       CREATE TABS
    ========================= */

    const tabsContainer =
        document.createElement('div');

    tabsContainer.className = "avatar-tabs";

    const categories =
        Object.keys(allAvatars);

    categories.forEach(category => {

        const tab =
            document.createElement('div');

tab.className =
    "avatar-tab" +
    (category === activeAvatarTab ? " active" : "");

tab.innerText = category;

tab.dataset.category = category;

        tab.innerText = category;

        tab.onclick = () => {

            activeAvatarTab = category;
            renderAvatarScreen();

        };

        tabsContainer.appendChild(tab);

    });

    // Put tabs inside header
    const tabsInHeader = document.getElementById('avatar-tabs-container');
    if (tabsInHeader) {
        tabsInHeader.innerHTML = '';
        tabsInHeader.appendChild(tabsContainer);
    } else {
        wrapper.appendChild(tabsContainer);
    }

    /* =========================
       ONLY ACTIVE CATEGORY
    ========================= */

    const avatars =
        allAvatars[activeAvatarTab];

    if(!avatars || avatars.length === 0)
        return;

    const colorClass =
        getAvatarCategoryBoxClass(activeAvatarTab);

    const sectionBox =
        document.createElement('div');

    sectionBox.className =
        `help-section-box ${colorClass} avatar-category-box`;

    /* =========================
       GROUP BY RARITY
    ========================= */

const rarityOrder = [
    "free",
    "basic",
    "classic",
    "advanced",
    "legendary",
    "epic",
    "unique"
];

const rarityTitles = {
    free:"ΜΥΣΤΑΓΩΓΟΙ",
    basic:"ΒΑΣΙΚΟΙ",
    classic:"ΚΛΑΣΙΚΟΙ",
    advanced:"ΘΕΜΕΛΙΩΔΕΙΣ",
    legendary:"ΘΡΥΛΙΚΟΙ",
    epic:"ΕΠΙΚΟΙ",
    unique:"ΜΟΝΑΔΙΚΟΙ"
};

const rarityCostMap = {
    free: 0,
    basic: AVATAR_COST.basic,
    classic: AVATAR_COST.classic,
    advanced: AVATAR_COST.advanced,
    legendary: AVATAR_COST.legendary,
    epic: AVATAR_COST.epic,
    unique: AVATAR_COST.unique
};

rarityOrder.forEach(rarity => {

    const rarityGroup =
        avatars.filter(av =>
            (av.cost || 0) === rarityCostMap[rarity]
        );

        if(rarityGroup.length === 0)
            return;

        /* TITLE */

        const rarityTitle =
            document.createElement('h3');

        rarityTitle.className =
            "avatar-rarity-title";

        rarityTitle.innerText =
            rarityTitles[rarity];

        sectionBox.appendChild(rarityTitle);

        /* GRID */

        const grid =
            document.createElement('div');

        grid.className =
            "avatar-grid";

        rarityGroup.forEach(av => {

            const isLocked = av.locked;

            const canUnlock =
                isLocked &&
                (window.playerPergamena || 0) >= av.cost;

            const lockedClass =
                isLocked ? 'locked-avatar' : '';

            const unlockGlowClass =
                canUnlock ? 'can-unlock' : '';

            const avData =
                JSON.stringify(av)
                .replace(/'/g,"&apos;");

            const clickAction =
                isLocked
                    ? (canUnlock
                        ? `promptUnlockAvatar(${avData})`
                        : `showLockedMessage(${av.cost})`)
                    : `selectThisAvatar(this, ${avData})`;

            grid.innerHTML += `
                <div class="avatar-option ${lockedClass} ${unlockGlowClass}"
                     onclick='${clickAction}'>

                    <div class="avatar-container-inner">

                        <img src="${av.img}"
                             class="avatar-img-style">

                        ${isLocked
                            ? `<div class="lock-icon">🔒</div>
                               <div class="avatar-cost">
                               <img src="assets/rank_goals/Pergamenas.webp" style="width:16px;height:16px;vertical-align:middle;"> ${av.cost}</div>`
                            : ""}

                    </div>

                    <p class="avatar-name">
                        ${av.name}
                    </p>

                </div>
            `;

        });

        sectionBox.appendChild(grid);

    });

    wrapper.appendChild(sectionBox);

}

function showLockedMessage(cost) {
    // Reset των avatars
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));

    const confirmBtn = document.getElementById('confirm-avatar-btn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.classList.add('pending'); 
        // ΜΗΝ αφαιρείς το confirm-green εδώ, άστο να υπάρχει 
        // ώστε το pending απλά να το κάνει "αχνό πράσινο"
        confirmBtn.classList.add('confirm-green'); 
    }

    selectedAvatarData = null;

    // Εμφάνιση Modal... (ο κώδικας που ήδη έχεις)
    const modal = document.getElementById('validation-modal');
    if (modal) {
        modal.querySelector('p').innerHTML = `Κλειδωμένο!<br>Στόχος: ${cost} <img src="assets/rank_goals/Pergamenas.webp" style="width:16px;height:16px;vertical-align:middle;"> Περγαμηνές`;
        modal.style.display = 'flex';
    }
}

function selectThisAvatar(element, avatarObj) {
  //1. Sound Effect
  playClick();
  
  // 1. Οπτική επιλογή στο grid
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    
    // 2. Αποθήκευση επιλογής (Εικόνα ΚΑΙ Όνομα)
    playerProfile.avatar = avatarObj.img;
    playerProfile.avatarName = avatarObj.name;
    
    // 3. Ενεργοποίηση του κουμπιού Επιβεβαίωση
    const confirmBtn = document.getElementById('confirm-avatar-btn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('pending');
        confirmBtn.classList.add('active');
    }
}

function confirmAvatarSelection() {
    if (!playerProfile.avatar || !playerProfile.avatarName) {
        alert("Επίλεξε πρώτα avatar.");
        return;
    }

    if(!isGoogleUser()){
        localStorage.setItem('literaAvatarImg', playerProfile.avatar);
        localStorage.setItem('literaAvatarRole', playerProfile.avatarName);
    }

    playerProfile.usesCustomPhoto = false;
    playerProfile.customPhotoDataUrl = "";

    saveFullPlayerProfile();
    updateProfileUI();
    updatePhotoModeUI();

    const profileAvatarImg = document.getElementById('profile-avatar-img');
    const profileAvatarName = document.getElementById('profile-avatar-name');

    if (profileAvatarImg) {
        profileAvatarImg.src = playerProfile.avatar || "assets/default-avatar.png";
    }

    if (profileAvatarName) {
        profileAvatarName.innerText = playerProfile.avatarName || "Όνομα Avatar";
    }

    if((avatarReturnScreen || 'start-screen') === 'start-screen'){
        if(isGoogleUser()){
            startInitiationIfNeeded();
        }else{
            goToScreen('start-screen');
        }
    }else if(avatarReturnScreen === 'start-screen-avatar'){
        goToScreen('start-screen');
    }else{
        goToScreen(avatarReturnScreen || 'start-screen');
    }
}


function openAvatarFromProfile(){
    avatarReturnScreen = 'profile-menu-screen';

    renderAvatarScreen();

    const nameDisplay = document.getElementById('display-username');
    if (nameDisplay) {
        nameDisplay.innerText = playerProfile.username || "";
    }

    goToScreen('avatar-screen');
}



function handleAvatarClick(avatarId, isLocked, requirement) {
    if (isLocked) {
        // Αν είναι κλειδωμένο, δείξε το μήνυμα
        showLockedModal(requirement);
    } else {
        // Αν είναι ξεκλείδωτο, κάνε την κανονική επιλογή
        selectAvatar(avatarId); 
    }
}

function showLockedModal(requirement) {
    // Χρησιμοποιούμε το validation-modal που ήδη έχεις στο HTML σου
    const modal = document.getElementById('validation-modal');
    const modalText = modal.querySelector('p');
    
    // Αλλάζουμε το κείμενο του modal
    modalText.innerHTML = `Το Avatar είναι κλειδωμένο!<br><br>Χρειάζεστε <strong>${requirement}</strong> για να το αποκτήσετε.`;
    
    // Εμφανίζουμε το modal
    modal.style.display = 'flex';
}


function getGuestScopedKey(baseKey){
const guestName=(playerProfile.username||'anonymous').trim().toLowerCase();
return `${baseKey}_guest_${guestName}`;
}

function getTotalPlayerScore() {
    if(!isGoogleUser()) return 0;

    const all = JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};

    const accountKey =
        playerProfile.accountKey ||
        `guest_${(playerProfile.username || 'anonymous').trim().toLowerCase()}`;

    let total = 0;

    Object.keys(all).forEach(key => {

        if (key.startsWith(accountKey)) {

            all[key].forEach(entry => {
                total += entry.pts;
            });

        }

    });

    log("TOTAL accountKey:", accountKey);
    log("TOTAL score:", total);
    return total;
}
async function getCloudTotalPlayerScore(){
    return getTotalPlayerScore();
}

async function getCloudBestTimeAttackStreak(){
    return getBestTimeAttackStreak();
}

async function getCloudBestTimeAttackRun(){
    return getBestTimeAttackRun();
}

async function getTotalGamesPlayed(){

if(playerProfile.isAuthenticated &&
playerProfile.authType === "google"){

return await getCloudTotalGamesPlayed();

}

// ===== LOCAL =====

const all =
JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};

const accountKey =
playerProfile.accountKey ||
`guest_${(playerProfile.username || 'anonymous').trim().toLowerCase()}`;

let totalGames = 0;

Object.keys(all).forEach(key => {

if(key.startsWith(accountKey)){

totalGames += (all[key] || []).length;

}

});

return totalGames;

}

async function getOverallAccuracy(){

if(playerProfile.isAuthenticated &&
playerProfile.authType === "google"){

return await getCloudOverallAccuracy();

}

// ===== LOCAL =====

const all =
JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};

const accountKey =
playerProfile.accountKey ||
`guest_${(playerProfile.username || 'anonymous').trim().toLowerCase()}`;

let totalAnswered = 0;
let totalCorrect = 0;

Object.keys(all).forEach(key => {

if(key.startsWith(accountKey)){

(all[key] || []).forEach(entry => {

totalAnswered += Number(entry.totalQuestions || 0);
totalCorrect += Number(entry.correctAnswers || 0);

});

}

});

if(totalAnswered === 0) return 0;

return Math.round(
(totalCorrect / totalAnswered) * 1000
) / 10;

}

const rankLevels = [

{
score:100000,
titleMale:"Μέγας Δράκος της Γνώσης και της Σοφίας",
titleFemale:"Μεγάλη Δράκαινα της Γνώσης και της Σοφίας",
perfect10:100,
streak:30,
bestRun:50,
wc:20,
wcMaxClues:3,
wcQualifying:8
},

{
score:50000,
titleMale:"Ανώτατος Θεματοφύλακας του Λογοτεχνικού Κανόνα",
titleFemale:"Ανώτατη Προστάτιδα του Λογοτεχνικού Κανόνα",
perfect10:25,
streak:27,
bestRun:40,
wc:16,
wcMaxClues:4,
wcQualifying:6
},

{
score:40000,
titleMale:"Μέγας Μάγιστρος της Ακαδημίας",
titleFemale:"Πρωθιέρεια της Ακαδημίας",
perfect10:20,
streak:25,
bestRun:30,
wc:12,
wcMaxClues:4,
wcQualifying:5
},

{
score:30000,
titleMale:"Μέγας Δομέστικος των Βιβλίων και των Γραμμάτων",
titleFemale:"Μεγάλη Μύστις των Βιβλίων και των Γραμμάτων",
perfect10:15,
streak:22,
wc:10,
wcMaxClues:5,
wcQualifying:4
},

{
score:20000,
titleMale:"Πρωτορήτωρας της Μεγάλης Βιβλιοθήκης",
titleFemale:"Πρωτορητώρισσα της Μεγάλης Βιβλιοθήκης",
perfect10:10,
streak:19,
wc:8,
wcMaxClues:5,
wcQualifying:3
},

{
score:10000,
titleMale:"Λογοθέτης του Φιλολογικού Συλλόγου",
titleFemale:"Λογοθέτις του Φιλολογικού Συλλόγου",
perfect10:8,
streak:16,
wc:6,
wcMaxClues:6,
wcQualifying:2
},

{
score:5000,
titleMale:"Δρουγγάριος των Αναγνωστηρίων",
titleFemale:"Δρουγγάρισσα των Αναγνωστηρίων",
perfect10:5,
streak:13,
wc:4
},

{
score:2000,
titleMale:"Τακτικός Μελετητής",
titleFemale:"Τακτική Μελετήτρια",
perfect10:3,
streak:10,
wc:2
},

{
score:0,
titleMale:"Μαθητευόμενος Αναγνώστης",
titleFemale:"Μαθητευόμενη Αναγνώστρια",
}

];

const rankLevelImages = {
    male: [
        "assets/rank/level1_male.webp",
        "assets/rank/level2_male.webp",
        "assets/rank/level3_male.webp",
        "assets/rank/level4_male.webp",
        "assets/rank/level5_male.webp",
        "assets/rank/level6_male.webp",
        "assets/rank/level7_male.webp",
        "assets/rank/level8_male.webp",
        "assets/rank/level9_male.webp"
    ],
    female: [
        "assets/rank/level1_female.webp",
        "assets/rank/level2_female.webp",
        "assets/rank/level3_female.webp",
        "assets/rank/level4_female.webp",
        "assets/rank/level5_female.webp",
        "assets/rank/level6_female.webp",
        "assets/rank/level7_female.webp",
        "assets/rank/level8_female.webp",
        "assets/rank/level9_female.webp"
    ]
};

const rankUnlockHelpMap = {
    10000: "Έπος Καρδίας",
    40000: "Ο Μεγάλος Αδερφός",
    100000: "Η Φωνή του Δράκου"
};

function getRankLevelImage(rank){
    const mode = getRankTitleMode() === "female" ? "female" : "male";
    const index = rankLevels.findIndex(r => r.score === rank.score);

    if(index === -1) return "";

    const imageIndex = (rankLevels.length - 1) - index;

    return rankLevelImages[mode][imageIndex] || "";
}

function getBestTimeAttackStreak(){
    if(!isGoogleUser()) return 0;

const all = JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};

let accountKey;

if(isGoogleUser()){
    accountKey = playerProfile.accountKey;
}else{
    accountKey =
        playerProfile.accountKey ||
        localStorage.getItem('literaAccountKey') ||
        `guest_${(playerProfile.username || 'anonymous').trim().toLowerCase()}`;
}

let best = 0;

Object.keys(all).forEach(key=>{
    if(key===`${accountKey}_TimeAttack_All_Scaling`){
        all[key].forEach(entry=>{
            if((entry.streak||0)>best) best=entry.streak||0;
        });
    }
});

return best;
}

function getBestTimeAttackRun(){
    if(!isGoogleUser()) return 0;

const all = JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};
let accountKey;

if(isGoogleUser()){
    accountKey = playerProfile.accountKey;
}else{
    accountKey =
        playerProfile.accountKey ||
        localStorage.getItem('literaAccountKey') ||
        `guest_${(playerProfile.username || 'anonymous').trim().toLowerCase()}`;
}

let best = 0;

Object.keys(all).forEach(key=>{
    if(key === `${accountKey}_TimeAttack_All_Scaling`){
        all[key].forEach(entry=>{
            if((entry.bestRun || 0) > best) best = entry.bestRun || 0;
        });
    }
});

return best;
}


function getPlayerRankAdvanced(totalScore,bestStreak,bestRun,perfect10){
let achieved=rankLevels[rankLevels.length-1];
for(let i=0;i<rankLevels.length;i++){
const rank=rankLevels[i];
const scoreOk=totalScore>=rank.score;
const perfectOk=!rank.perfect10||perfect10>=rank.perfect10;
const streakOk=!rank.streak||bestStreak>=rank.streak;
const runOk=!rank.bestRun||bestRun>=rank.bestRun;
if(scoreOk&&perfectOk&&streakOk&&runOk){
achieved=rank;
break;
}
}
return achieved;
}

async function updateProfileUI(){
const name = playerProfile.username || "Επισκέπτης";
const avatarImg = getLocalAvatarPath();
const avatarRole = playerProfile.avatarName || "Πρωτάρης";
const nameEl=document.getElementById('display-player-name');
const imgEl=document.getElementById('display-avatar-img');
const roleEl=document.getElementById('display-avatar-role');
if(nameEl)nameEl.innerText=name;
if(imgEl){
    imgEl.src = avatarImg;
    imgEl.onerror = function(){
        this.src = "assets/default-avatar.png";
    };
}
if(roleEl)roleEl.innerText=avatarRole;

let totalScore=0;
let bestStreak=0;
let bestRun=0;
const perfect10=perfect10Count||0;

if(playerProfile.isAuthenticated&&playerProfile.authType==="google"){
totalScore = playerProfile.pantheonTotalScore || 0;
bestStreak = playerProfile.pantheonBestStreak || getBestTimeAttackStreak();
bestRun = playerProfile.pantheonBestRun || getBestTimeAttackRun();
}else{
totalScore=getTotalPlayerScore();
bestStreak=getBestTimeAttackStreak();
bestRun=getBestTimeAttackRun();
}

const rankData=getPlayerRankAdvanced(totalScore,bestStreak,bestRun,perfect10);
const resolvedRankTitle=getRankTitle(rankData);

const savedRankTitle = localStorage.getItem('literaLastResolvedRankTitle') || "";
const oldRankScore = parseInt(localStorage.getItem('literaLastResolvedRankScore') || "0", 10);
const oldRankData = rankLevels.find(r => r.score === oldRankScore) || rankLevels[rankLevels.length - 1];

if(resolvedRankTitle !== savedRankTitle){
    if(savedRankTitle !== ""){
        pendingRankUpData = {
            oldRankData: oldRankData,
            newRankData: rankData
        };
    }

    localStorage.setItem('literaLastResolvedRankTitle', resolvedRankTitle);
    localStorage.setItem('literaLastResolvedRankScore', String(rankData.score));
}

currentRankTitle = resolvedRankTitle;

log("RANK CHECK:", {
resolvedRankTitle,
savedRankTitle,
pendingRankUpData
});

log("RANK SCORE CHECK:", {
  currentRankScore: rankData.score,
  savedRankScore: localStorage.getItem('literaLastResolvedRankScore')
});

const rankElement=document.getElementById('display-player-rank');
if(rankElement){
rankElement.innerHTML = `${resolvedRankTitle}`;
}

// Update total score display
const totalScoreEl = document.getElementById('display-total-score');
if(totalScoreEl){
    totalScoreEl.textContent = totalScore + ' pts';
}

// Update footer stats
const footerPergamena = document.getElementById('footer-pergamena');
const footerScore = document.getElementById('footer-total-score');
if(footerPergamena) footerPergamena.textContent = window.playerPergamena || 0;
if(footerScore) footerScore.textContent = (playerProfile.pantheonTotalScore || totalScore || 0) + ' pts';
}


var avatarReturnScreen='login-screen';


function openAvatarFromStart(){
    avatarReturnScreen = 'start-screen-avatar';

    renderAvatarScreen();

    const nameDisplay = document.getElementById('display-username');
    if (nameDisplay) {
        nameDisplay.innerText = playerProfile.username || "";
    }

    goToScreen('avatar-screen');
}


function openDeleteAccountModal(){
const modal=document.getElementById('delete-account-modal');
if(modal)modal.style.display='flex';
}
function closeDeleteAccountModal(){
const modal=document.getElementById('delete-account-modal');
if(modal)modal.style.display='none';
}

function openPantheon(){

if(!isGoogleUser()){
showInitiationOnlyMessage("Το Πάνθεον");
return;
}

currentPantheonViewIndex = 0;
goToScreen('pantheon-screen');
renderPantheonTabs();
renderPantheonCards();

}


const pantheonViews=[
{id:"total",icon:"https://i.ibb.co/HpX7RtXZ/Wisdom.png",title:"Το Άδυντον της Σοφίας",subtitle:"Περισσότεροι συνολικοί βαθμοί"},
{id:"accuracy",icon:"https://i.ibb.co/Sw1BNsh5/Accuracy.png",title:"Η Αίθουσα της Ακρίβειας",subtitle:"Υψηλότερο ποσοστό σωστών απαντήσεων"},
{id:"perfect",icon:"https://i.ibb.co/spn2Dqyv/Perfection.png",title:"Ο Ναός της Τελειότητας",subtitle:"Περισσότερα 10/10 (σε Δύσκολο ή Κλιμάκωση)"},
{id:"streak",icon:"https://i.ibb.co/RkxZh1F4/Fire.png",title:"Η Σάλα της Φωτιάς",subtitle:"Μεγαλύτερο σερί σωστών απαντήσεων"},
{id:"fastest",icon:"https://i.ibb.co/4RkB9cWq/Endurance.png",title:"Το Περιβόλι της Αντοχής",subtitle:"Περισσότερες σωστές σε ένα Time Attack"},
{id:"games",icon:"https://i.ibb.co/1crNJx6/Loyalty.png",title:"Το Περιστύλιο της Αφοσίωσης",subtitle:"Περισσότερα παιχνίδια"}
];

let currentPantheonViewIndex=0;

function renderPantheonTabs(){
const tabs=document.getElementById('pantheon-tabs');
const title=document.getElementById('pantheon-title');
const subtitle=document.getElementById('pantheon-subtitle');
if(!tabs||!title)return;
tabs.innerHTML='';
pantheonViews.forEach((view,index)=>{
const btn=document.createElement('button');
btn.className=`pantheon-tab-btn ${index===currentPantheonViewIndex?'active':''}`;
btn.innerHTML = `<img src="${view.icon}" class="pantheon-tab-icon">`;
btn.onclick=function(){
currentPantheonViewIndex=index;
renderPantheonTabs();
renderPantheonCards();
};
tabs.appendChild(btn);
});
title.textContent=pantheonViews[currentPantheonViewIndex].title;
if(subtitle)
subtitle.textContent=pantheonViews[currentPantheonViewIndex].subtitle;  
}

function getPantheonCardClass(color){
if(color==="gold")return"left-gold";
if(color==="silver")return"left-silver";
if(color==="bronze")return"left-bronze";
return"left-blue";
}

async function renderPantheonCards(){

const list = document.getElementById('pantheon-list');
if(!list) return;

list.innerHTML = `
<div class="pantheon-card left-blue" style="justify-content:center; text-align:center;">
    <div class="pantheon-player">
        <div class="pantheon-name">Φόρτωση Πάνθεον...</div>
        <div class="pantheon-rank">Συλλέγονται οι κορυφαίοι παίκτες.</div>
    </div>
</div>
`;

if(
!window.firebaseDB ||
!window.firebaseCollection ||
!window.firebaseGetDocs ||
!window.firebaseQuery ||
!window.firebaseOrderBy ||
!window.firebaseLimit
){
list.innerHTML = `
<div class="pantheon-card left-blue" style="justify-content:center; text-align:center;">
    <div class="pantheon-player">
        <div class="pantheon-name">Το Πάνθεον δεν είναι διαθέσιμο</div>
        <div class="pantheon-rank">Λείπουν helpers του Firestore.</div>
    </div>
</div>
`;
return;
}

try{

const currentView = pantheonViews[currentPantheonViewIndex]?.id || "total";

let orderField = "pantheonTotalScore";

if(currentView === "accuracy")
orderField = "pantheonAccuracy";

if(currentView === "perfect")
orderField = "pantheonPerfect10";

if(currentView === "streak")
orderField = "pantheonBestStreak";

if(currentView === "fastest")
orderField = "pantheonBestRun";

if(currentView === "games")
orderField = "pantheonGamesPlayed";

const db = window.firebaseDB;
const collectionFn = window.firebaseCollection;
const getDocsFn = window.firebaseGetDocs;
const queryFn = window.firebaseQuery;
const orderByFn = window.firebaseOrderBy;
const limitFn = window.firebaseLimit;

const q = queryFn(
collectionFn(db,"players"),
orderByFn(orderField,"desc"),
limitFn(5)
);

const snap = await getDocsFn(q);

if(snap.empty){
list.innerHTML = `
<div class="pantheon-card left-blue" style="justify-content:center; text-align:center;">
    <div class="pantheon-player">
        <div class="pantheon-name">Το Πάνθεον είναι άδειο</div>
        <div class="pantheon-rank">Παίξε για να εμφανιστείς πρώτος.</div>
    </div>
</div>
`;
return;
}

list.innerHTML = "";

let place = 0;

snap.forEach(docSnap => {

place++;

const player = docSnap.data();
const playerId = docSnap.id;

let color = "blue";
if(place === 1) color = "gold";
else if(place === 2) color = "silver";
else if(place === 3) color = "bronze";

let statText = "";

if(currentView === "total")
statText = `${player.pantheonTotalScore || 0} pts`;

else if(currentView === "accuracy")
statText = `${player.pantheonAccuracy || 0}%`;

else if(currentView === "perfect")
statText = `${player.pantheonPerfect10 || 0}x 10/10`;

else if(currentView === "streak")
statText = `${player.pantheonBestStreak || 0} σερί`;

else if(currentView === "fastest")
statText = `${player.pantheonBestRun || 0} σωστές`;

else if(currentView === "games")
statText = `${player.pantheonGamesPlayed || 0} παιχνίδια`;

const card = document.createElement("div");
card.className = `pantheon-card ${getPantheonCardClass(color)}`;

const avatarSrc =
(player.usesCustomPhoto && player.customPhotoDataUrl)
? player.customPhotoDataUrl
: (player.avatar || "assets/default-avatar.png");

const rankMode = player.rankTitleMode || "male";
const rankTitle =
rankMode === "female"
? (player.rankTitleFemale || player.rankTitleMale || "Άγνωστη Βαθμίδα")
: (player.rankTitleMale || "Άγνωστη Βαθμίδα");

card.innerHTML = `
<div class="pantheon-place">
${place===1?"🥇":place===2?"🥈":place===3?"🥉":"#"+place}
</div>

<div class="pantheon-main">
    <div class="pantheon-avatar">
        <img src="${avatarSrc}" alt="${player.username || 'Player'}">
    </div>

    <div class="pantheon-player">
        <div class="pantheon-name">${player.username || "Άγνωστος παίκτης"}</div>
        <div class="pantheon-rank">${player.rankIcon || "🪶"} ${rankTitle}</div>
    </div>
</div>

<div class="pantheon-stat">
${statText}
</div>
`;

card.addEventListener("click", () => {
    openPantheonPlayerCard(playerId);
});

list.appendChild(card);

});

}catch(err){

console.error("Pantheon load error:", err);

list.innerHTML = `
<div class="pantheon-card left-blue" style="justify-content:center; text-align:center;">
    <div class="pantheon-player">
        <div class="pantheon-name">Σφάλμα φόρτωσης</div>
        <div class="pantheon-rank">Δεν ήταν δυνατή η ανάκτηση του Πάνθεον.</div>
    </div>
</div>
`;

}

}

/* =========================
   AVATAR BACK HANDLER
========================= */

function handleAvatarBack(){
    if(avatarReturnScreen === 'start-screen-avatar'){
        goToScreen('start-screen');
    }else{
        goToScreen(avatarReturnScreen || 'login-screen');
    }
}

async function openRankInfoScreen(){

if(!isGoogleUser()){
showInitiationOnlyMessage("Το Ranking");
return;
}

goToScreen('rank-info-screen');
renderRankTitleTabs();
await renderRankInfo();

}

async function renderRankInfo(){

    const currentBox = document.getElementById('rank-current-box');
    const listBox = document.getElementById('rank-levels-list');

    if(!currentBox || !listBox) return;

    let totalScore = 0;
    let bestStreak = 0;
    let bestRun = 0;
    const perfect10 = perfect10Count || 0;

    if(playerProfile.isAuthenticated && playerProfile.authType === "google"){
        totalScore = playerProfile.pantheonTotalScore || 0;
        bestStreak = playerProfile.pantheonBestStreak || getBestTimeAttackStreak();
        bestRun = playerProfile.pantheonBestRun || getBestTimeAttackRun();
    }else{
        totalScore = getTotalPlayerScore();
        bestStreak = getBestTimeAttackStreak();
        bestRun = getBestTimeAttackRun();
    }

    // Sync footer με την ίδια τιμή
    const footerScoreEl = document.getElementById('footer-total-score');
    if(footerScoreEl) footerScoreEl.textContent = totalScore + ' pts';

    const currentRank = getPlayerRankAdvanced(
        totalScore,
        bestStreak,
        bestRun,
        perfect10
    );

    const currentImage = getRankLevelImage(currentRank);

    currentBox.innerHTML = '';

    listBox.innerHTML =
        rankLevels.map(rank => {

            const isCurrent = rank.score === currentRank.score;
            const isUnlocked = !isCurrent && rank.score !== 0 && totalScore >= rank.score;
            const isLocked = !isCurrent && !isUnlocked;

            const image = getRankLevelImage(rank);
            const unlockHelp = rankUnlockHelpMap[rank.score] || "";

            // Καθορισμός class κατάστασης
            let stateClass = '';
            let badgeHTML = '';
            if(isCurrent){
                stateClass = 'rank-card-current';
                badgeHTML = `<div class="rank-book-badge rank-badge-current">Τρέχουσα Βαθμίδα</div>`;
            } else if(isUnlocked){
                stateClass = 'rank-card-unlocked';
                badgeHTML = `<div class="rank-book-badge rank-badge-unlocked">✓ Κατακτήθηκε</div>`;
            } else {
                stateClass = 'rank-card-locked';
                badgeHTML = `<div class="rank-book-badge rank-badge-locked">🔒 Κλειδωμένη</div>`;
            }

            const requirements = [];

            if(rank.score !== 0 && !isUnlocked){

                const scoreDone = totalScore >= rank.score;
                const scoreShown = Math.min(totalScore, rank.score);
                requirements.push(`<div class="rank-req-item ${scoreDone ? 'req-done' : 'req-missing'}"><img class="req-icon-img" src="assets/rank_goals/Points.webp"><div class="req-text"><span class="req-name">Πόντοι</span><span class="req-progress">${scoreShown.toLocaleString('el-GR')} / ${rank.score.toLocaleString('el-GR')}</span></div></div>`);

                if(rank.perfect10){
                    const perfectDone = perfect10 >= rank.perfect10;
                    const perfectShown = Math.min(perfect10, rank.perfect10);
                    requirements.push(`<div class="rank-req-item ${perfectDone ? 'req-done' : 'req-missing'}"><img class="req-icon-img" src="assets/rank_goals/Perfect10.webp"><div class="req-text"><span class="req-name">Perfect 10</span><span class="req-progress">${perfectShown} / ${rank.perfect10}</span></div></div>`);
                }

                if(rank.streak){
                    const streakDone = bestStreak >= rank.streak;
                    const streakShown = Math.min(bestStreak, rank.streak);
                    requirements.push(`<div class="rank-req-item ${streakDone ? 'req-done' : 'req-missing'}"><img class="req-icon-img" src="assets/rank_goals/Streak.webp"><div class="req-text"><span class="req-name">Streak <span class="req-hint">(Σερί σωστών σε ένα Time Attack)</span></span><span class="req-progress">${streakShown} / ${rank.streak}</span></div></div>`);
                }

                if(rank.bestRun){
                    const runDone = bestRun >= rank.bestRun;
                    const runShown = Math.min(bestRun, rank.bestRun);
                    requirements.push(`<div class="rank-req-item ${runDone ? 'req-done' : 'req-missing'}"><img class="req-icon-img" src="assets/rank_goals/Best_run.webp"><div class="req-text"><span class="req-name">Best Run <span class="req-hint">(Σωστές απαντήσεις σε ένα Time Attack)</span></span><span class="req-progress">${runShown} / ${rank.bestRun}</span></div></div>`);
                }

                if(rank.wc){
                    const wcSolved = playerProfile.pantheonWCSolved || 0;
                    const wcDone = wcSolved >= rank.wc;
                    const wcShown = Math.min(wcSolved, rank.wc);
                    const wcHint = rank.wcMaxClues ? `<span class="req-hint">(${rank.wcQualifying} με χρήση ≤${rank.wcMaxClues} στοιχείων)</span>` : '';
                    const wcQualShown = rank.wcMaxClues ? ` · ${Math.min(playerProfile.pantheonWCQualifying||0, rank.wcQualifying)}/${rank.wcQualifying} με ≤${rank.wcMaxClues}` : '';
                    requirements.push(`<div class="rank-req-item ${wcDone ? 'req-done' : 'req-missing'}"><img class="req-icon-img" src="assets/rank_goals/WC_done.webp"><div class="req-text"><span class="req-name">Εβδομαδιαίοι Γρίφοι ${wcHint}</span><span class="req-progress">${wcShown} / ${rank.wc}${wcQualShown}</span></div></div>`);
                }

            }

            return `
                <div class="rank-book-item ${stateClass}">
                    <div class="rank-book-header-row">
                        <img src="${image}"
                             class="rank-book-icon"
                             alt="${getRankTitle(rank)}">
                        <div class="rank-book-text">
                            <div class="rank-book-title">
                                ${getRankTitle(rank)}
                            </div>
                            ${badgeHTML}
                        </div>
                    </div>

                    ${requirements.length > 0 ? `
                    <div class="rank-req-list">
                        ${requirements.join('')}
                        ${unlockHelp && !isUnlocked ? `
                        <div class="rank-unlock-help" style="margin-top:6px;">
                            🔓 Ξεκλειδώνει: ${unlockHelp}
                        </div>
                        ` : ""}
                    </div>
                    ` : `
                    ${unlockHelp && !isUnlocked ? `
                    <div class="rank-unlock-help">
                        🔓 Ξεκλειδώνει: ${unlockHelp}
                    </div>
                    ` : ""}
                    `}
                </div>
            `;

        }).join('');
}

function promptUnlockAvatar(avatarObj){
pendingUnlockAvatar=avatarObj;
const modal=document.getElementById('unlock-avatar-modal');
const message=document.getElementById('unlock-avatar-message');
if(message){
message.innerHTML=`Θέλετε να ξεκλειδώσετε τον <strong>${avatarObj.name}</strong> έναντι <strong>${avatarObj.cost} <img src="assets/rank_goals/Pergamenas.webp" style="width:16px;height:16px;vertical-align:middle;"></strong>;`;
}
if(modal){
modal.style.display='flex';
}
}

function closeUnlockAvatarModal(){
const modal=document.getElementById('unlock-avatar-modal');
if(modal)modal.style.display='none';
pendingUnlockAvatar=null;
}

function unlockAvatarInLocalState(avatarId){
Object.values(allAvatars).forEach(category=>{
category.forEach(av=>{
if(av.id===avatarId){
av.locked=false;
}
});
});
}

function hasUnlockedLegendaryAvatarInCategory(category){

    if(!allAvatars || !allAvatars[category]){
        return false;
    }

    const unlockedIds = getUnlockedAvatarIds();

    return allAvatars[category].some(av => {

        const isHighTier =
            (av.cost || 0) >= AVATAR_COST.legendary;

const isUnlocked =
    unlockedIds.includes(av.id);

        return isHighTier && isUnlocked;

    });
}

function getAvatarHelpUnlockMessage(avatarObj){

    if(!avatarObj) return "";

    const category = getAvatarCategoryById(avatarObj.id);

    if(!category) return "";

const helpNames = {
    "Πεζογραφία": "Το κάλπικο ζύγι",
    "Ποίηση": "Ποιητική Άδεια",
    "Θέατρο": "Από μηχανής Θεός",
    "Λογοτεχνικοί Ήρωες": "Το τσεκούρι του Ρασκόλνικοφ"
};

    const helpName = helpNames[category];

    if(!helpName) return "";

    return `
    🔓 Νέα Βοήθεια Ξεκλειδώθηκε!

    Ξεκλείδωσες τη βοήθεια:
    «${helpName}»

    Είναι πλέον διαθέσιμη
    όταν χρησιμοποιείς avatar αυτής της τάξης.
    `;
}

function showAvatarHelpUnlockedModal(avatarObj){

    const msg = getAvatarHelpUnlockMessage(avatarObj);
    if(!msg) return;

    const modal = document.getElementById("avatar-help-unlocked-modal");
    const message = document.getElementById("avatar-help-unlocked-message");

    if(message){
        message.innerText = msg;
    }

    if(modal){
        modal.classList.remove("is-hidden");
        modal.style.display = "flex";
    }
}

function closeAvatarHelpUnlockedModal(){

    const modal = document.getElementById("avatar-help-unlocked-modal");

    if(modal){
        modal.classList.add("is-hidden");
        modal.style.display = "none";
    }
}

function getAvatarCategoryById(avatarId){

    for(const [category, avatars] of Object.entries(allAvatars)){
        if(avatars.some(av => av.id === avatarId)){
            return category;
        }
    }

    return "";
}

function getAuthorHelpCategoryForQuestion(q){

    const activeCategory = getCurrentAvatarCategory();

    if(!activeCategory){
        return null;
    }

    if(!hasUnlockedLegendaryAvatarInCategory(activeCategory)){
        return null;
    }

    return activeCategory;
}

function getUnlockedAvatarIds(){
return JSON.parse(localStorage.getItem('literaUnlockedAvatars')||'[]');
}

function saveUnlockedAvatarIds(ids){
localStorage.setItem('literaUnlockedAvatars',JSON.stringify(ids));
}

function applyUnlockedAvatarsFromStorage(){
const unlockedIds=getUnlockedAvatarIds();
Object.values(allAvatars).forEach(category=>{
category.forEach(av=>{
if(unlockedIds.includes(av.id)){
av.locked=false;
}
});
});
}

function confirmUnlockAvatar(){
    if(!isGoogleUser()){
closeUnlockAvatarModal();
return;
}
if(!pendingUnlockAvatar)return;
const cost=pendingUnlockAvatar.cost||0;
const currentPergamena=window.playerPergamena||0;
if(currentPergamena<cost){
closeUnlockAvatarModal();
showLockedMessage(cost);
return;
}
window.playerPergamena=currentPergamena-cost;
localStorage.setItem('literaPergamena',window.playerPergamena);
updatePergamenaDisplay();
animatePergamenaSpend(cost);

const unlockedIds = Array.isArray(unlockedAvatars) ? [...unlockedAvatars] : [];
if(!unlockedIds.includes(pendingUnlockAvatar.id)){
unlockedIds.push(pendingUnlockAvatar.id);
unlockedAvatars = unlockedIds;
saveUnlockedAvatarIds(unlockedIds);
}
unlockAvatarInLocalState(pendingUnlockAvatar.id);

const auth=window.firebaseAuth;
const db=window.firebaseDB;
const docFn=window.firebaseDoc;
const setDocFn=window.firebaseSetDoc;
const firebaseUser=auth&&auth.currentUser?auth.currentUser:null;

if(firebaseUser&&db&&docFn&&setDocFn){
const playerRef=docFn(db,'players',firebaseUser.uid);
setDocFn(playerRef,{
unlockedAvatars:unlockedIds,
pergamena:window.playerPergamena
},{merge:true}).catch(err=>console.error('Avatar unlock sync error:',err));
}

const unlockedAvatar = pendingUnlockAvatar;
const unlockedName = pendingUnlockAvatar.name;

closeUnlockAvatarModal();
renderAvatarScreen();
flashUnlockedAvatarByName(unlockedName);

log("UNLOCKED AVATAR TEST:", unlockedAvatar);

if((unlockedAvatar.cost || 0) >= AVATAR_COST.legendary){
    log("SHOW HELP UNLOCK MODAL");
    showAvatarHelpUnlockedModal(unlockedAvatar);
    playAvatarUnlock();
} else {
    playAvatarUnlock();
}
}



function addPergamena(amount){
window.playerPergamena=(window.playerPergamena||0)+amount;

localStorage.setItem(
getScopedStorageKey('literaPergamena'),
String(window.playerPergamena)
);

updatePergamenaDisplay();
showPergamenaReward(amount);

if(!isGoogleUser()) return;

const auth=window.firebaseAuth;
const db=window.firebaseDB;
const docFn=window.firebaseDoc;
const setDocFn=window.firebaseSetDoc;
const firebaseUser=auth&&auth.currentUser?auth.currentUser:null;

if(firebaseUser&&db&&docFn&&setDocFn){
const playerRef=docFn(db,'players',firebaseUser.uid);
setDocFn(
playerRef,
{pergamena:window.playerPergamena},
{merge:true}
).catch(err=>console.error("Pergamena sync error:",err));
}
}

function updatePergamenaDisplay(){
const amount = window.playerPergamena || 0;
const el = document.getElementById('pergamena-display');
if(el) el.textContent = amount;
const footerEl = document.getElementById('footer-pergamena');
if(footerEl) footerEl.textContent = amount;
}

function showPergamenaReward(amount){
const reward=document.createElement("div");
reward.innerHTML=`+${amount} <img src="assets/rank_goals/Pergamenas.webp" style="width:18px;height:18px;vertical-align:middle;">`;
reward.style.position="fixed";
reward.style.top="20%";
reward.style.left="50%";
reward.style.transform="translateX(-50%)";
reward.style.background="rgba(0,0,0,0.8)";
reward.style.padding="10px 18px";
reward.style.borderRadius="12px";
reward.style.color="#ffd700";
reward.style.fontWeight="bold";
reward.style.zIndex="9999";
document.body.appendChild(reward);
setTimeout(()=>{
reward.remove();
},1500);
}

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Theme
    loadSavedTheme();

    // 2. Username input limit
    const usernameInput = document.getElementById("username-input");
    if(usernameInput){
        usernameInput.addEventListener("input", () => {
            if(usernameInput.value.length > 13){
                usernameInput.value = usernameInput.value.slice(0, 13);
                showUsernameLimitWarning();
            }
        });
    }

    // 3. Google username input limit
    const googleInput = document.getElementById("google-username-input");
    if(googleInput){
        googleInput.addEventListener("input", () => {
            if(googleInput.value.length > 13){
                googleInput.value = googleInput.value.slice(0, 13);
                showUsernameLimitWarning();
            }
        });
    }

    // 4. Firebase auto-login restore
    const auth = window.firebaseAuth;
    if(auth){
        auth.onAuthStateChanged(async function(user){
            if(!user) return;
            const db = window.firebaseDB;
            const docFn = window.firebaseDoc;
            const getDocFn = window.firebaseGetDoc;
            if(!db || !docFn || !getDocFn) return;
            try{
                const playerRef = docFn(db, 'players', user.uid);
                const snap = await getDocFn(playerRef);
                if(!snap.exists()) return;
                const data = snap.data();

                playerProfile.username = data.username || user.displayName || user.email || "Google Player";
                playerProfile.authType = "google";
                playerProfile.isAuthenticated = true;
                playerProfile.uid = user.uid;
                playerProfile.accountKey = `google_${playerProfile.username.trim().toLowerCase()}`;
                playerProfile.avatar = data.avatar || "";
                playerProfile.avatarName = data.avatarName || "";
                playerProfile.realName = data.realName || "";
                playerProfile.prose = Array.isArray(data.prose) ? data.prose : [];
                playerProfile.poets = Array.isArray(data.poets) ? data.poets : [];
                playerProfile.playwrights = Array.isArray(data.playwrights) ? data.playwrights : [];
                playerProfile.books = Array.isArray(data.books) ? data.books : [];
                playerProfile.heroes = Array.isArray(data.heroes) ? data.heroes : [];
                playerProfile.rankTitleMode = data.rankTitleMode || "male";
                initiationCompleted = !!data.initiationCompleted;
                perfect10Count = typeof data.pantheonPerfect10 === "number" ? data.pantheonPerfect10 : 0;
                window.playerPergamena = typeof data.pergamena === "number" ? data.pergamena : 0;
                unlockedAvatars = Array.isArray(data.unlockedAvatars) ? data.unlockedAvatars : [];
                playerProfile.pantheonTotalScore = data.pantheonTotalScore || 0;
                playerProfile.pantheonBestStreak = data.pantheonBestStreak || 0;
                playerProfile.pantheonBestRun = data.pantheonBestRun || 0;
                playerProfile.pantheonGamesPlayed = data.pantheonGamesPlayed || 0;
                playerProfile.pantheonAccuracy = data.pantheonAccuracy || 0;
                playerProfile.pantheonWCSolved = data.pantheonWCSolved || 0;
                playerProfile.pantheonWCQualifying = data.pantheonWCQualifying || 0;

                // Αν το pantheonWCSolved είναι 0, φόρτωσε από weekly_challenges subcollection
                if(!playerProfile.pantheonWCSolved && window.firebaseGetDocs && window.firebaseCollection){
                    window.firebaseGetDocs(
                        window.firebaseCollection(window.firebaseDB, 'players', playerProfile.uid, 'weekly_challenges')
                    ).then(snap => {
                        let solved = 0;
                        let qualifying = 0;
                        snap.forEach(d => {
                            const wd = d.data();
                            if(wd.solved){
                                solved++;
                                if((wd.unlocked_clues || 0) <= 3) qualifying++;
                            }
                        });
                        playerProfile.pantheonWCSolved = solved;
                        playerProfile.pantheonWCQualifying = qualifying;
                        if(solved > 0 && window.firebaseSetDoc){
                            window.firebaseSetDoc(
                                window.firebaseDoc(window.firebaseDB, 'players', playerProfile.uid),
                                { pantheonWCSolved: solved, pantheonWCQualifying: qualifying },
                                { merge: true }
                            ).catch(e => console.warn('WC sync error:', e));
                        }
                    }).catch(e => console.warn('WC load error:', e));
                }

                // Αν το pantheonTotalScore είναι 0 αλλά υπάρχουν τοπικοί πόντοι, κάνε sync μία φορά
                if(!playerProfile.pantheonTotalScore){
                    const localScore = getTotalPlayerScore();
                    if(localScore > 0){
                        playerProfile.pantheonTotalScore = localScore;
                        if(window.firebaseSetDoc && window.firebaseDoc && window.firebaseDB){
                            window.firebaseSetDoc(
                                window.firebaseDoc(window.firebaseDB, 'players', playerProfile.uid),
                                { pantheonTotalScore: localScore },
                                { merge: true }
                            ).catch(e => console.warn('Sync score error:', e));
                        }
                    }
                }

                updatePergamenaDisplay();
                updateProfileUI();
                updatePhotoModeUI();

                // Ενημέρωσε footer score
                const footerScore = document.getElementById('footer-total-score');
                if(footerScore) footerScore.textContent = (playerProfile.pantheonTotalScore || 0) + ' pts';

                // One-time score_history cleanup
                if(!data.scoreHistoryCleaned && window.firebaseGetDocs && window.firebaseCollection && window.firebaseDeleteDoc){
                    window.firebaseGetDocs(
                        window.firebaseCollection(window.firebaseDB, 'players', playerProfile.uid, 'score_history')
                    ).then(async snap => {
                        if(snap.size > 0){
                            for(const d of snap.docs){
                                await window.firebaseDeleteDoc(
                                    window.firebaseDoc(window.firebaseDB, 'players', playerProfile.uid, 'score_history', d.id)
                                ).catch(()=>{});
                            }
                            // Σημείωσε ότι έγινε η εκκαθάριση
                            window.firebaseSetDoc(
                                window.firebaseDoc(window.firebaseDB, 'players', playerProfile.uid),
                                { scoreHistoryCleaned: true },
                                { merge: true }
                            ).catch(()=>{});
                            console.log('score_history cleanup done');
                        }
                    }).catch(()=>{});
                }

                if(initiationCompleted){
                    goToScreen('start-screen');
                }else{
                    goToScreen('initiation-rank-screen');
                }
            }catch(err){
                console.error("Auto-login restore error:", err);
            }
        });
    }

    // 5. Photo upload handler
    const photoInput = document.getElementById('photo-upload-input');
    if(photoInput){
        photoInput.addEventListener('change', function(e){
            const file = e.target.files && e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = function(event){
                const imageData = event.target.result;
                playerProfile.usesCustomPhoto = true;
                playerProfile.customPhotoDataUrl = imageData;
                saveFullPlayerProfile();
                updateProfileUI();
                updatePhotoModeUI();
                if(playerProfile.isAuthenticated){
                    updatePantheonPlayerStats();
                }
                const profileAvatarName = document.getElementById('profile-avatar-name');
                if(profileAvatarName){
                    profileAvatarName.innerText = playerProfile.avatarName || "Όνομα Avatar";
                }
            };
            reader.readAsDataURL(file);
        });
    }

});

function showUsernameLimitWarning(){

const warning=document.createElement("div");

warning.innerText="Ξεπεράσατε το επιτρεπόμενο όριο χαρακτήρων";

warning.style.position="fixed";
warning.style.top="25%";
warning.style.left="50%";
warning.style.transform="translateX(-50%)";

warning.style.background="rgba(0,0,0,0.85)";
warning.style.color="#ffcc00";

warning.style.padding="12px 18px";
warning.style.borderRadius="12px";

warning.style.fontSize="0.85rem";
warning.style.zIndex="9999";

document.body.appendChild(warning);

setTimeout(()=>{
warning.remove();
},1800);
}

function animatePergamenaSpend(amount){
const display=document.getElementById('pergamena-display');
if(display){
display.classList.remove('pergamena-pulse');
void display.offsetWidth;
display.classList.add('pergamena-pulse');
}
const el=document.createElement('div');
el.className='pergamena-float';
el.innerHTML=`-${amount} <img src='assets/rank_goals/Pergamenas.webp' style='width:16px;height:16px;vertical-align:middle;'>`;
document.body.appendChild(el);
setTimeout(()=>{el.remove();},1100);
}
function flashUnlockedAvatar(avatarId){
setTimeout(()=>{
const options=document.querySelectorAll('.avatar-option');
options.forEach(opt=>{
const nameEl=opt.querySelector('.avatar-name');
if(nameEl&&nameEl.innerText===avatarId)return;
});
},0);
}

function flashUnlockedAvatarByName(avatarName){
setTimeout(()=>{
document.querySelectorAll('.avatar-option').forEach(opt=>{
const nameEl=opt.querySelector('.avatar-name');
if(nameEl&&nameEl.innerText===avatarName){
opt.classList.remove('unlock-flash');
void opt.offsetWidth;
opt.classList.add('unlock-flash');
}
});
},60);
}

async function reauthenticateGoogleForDelete(firebaseUser){
if(!firebaseUser) return false;
if(!window.firebaseReauthenticateWithPopup||!window.firebaseGoogleProvider) return false;

try{
await window.firebaseReauthenticateWithPopup(firebaseUser,window.firebaseGoogleProvider);
return true;
}catch(err){
console.error("Reauthentication error:",err);
return false;
}
}

async function confirmDeleteAccount(){

    const auth = window.firebaseAuth;
    const db = window.firebaseDB;
    const docFn = window.firebaseDoc;
    const deleteDocFn = window.firebaseDeleteDoc;
    const firebaseUser = auth && auth.currentUser ? auth.currentUser : null;
    const deleteUserFn = window.firebaseDeleteUser;

    if(!firebaseUser || !db || !docFn || !deleteDocFn || !deleteUserFn){
        alert("Δεν βρέθηκε ενεργός λογαριασμός για διαγραφή.");
        return;
    }

    const uid = firebaseUser.uid;
    const accountKey = playerProfile.accountKey || "";
    const playerRef = docFn(db, "players", uid);

    try{

        /*
           1. ΠΡΩΤΑ βεβαιωνόμαστε ότι το Auth delete επιτρέπεται.
           Αν θέλει reauth, γίνεται εδώ ΠΡΙΝ σβήσουμε Firestore.
        */
        try{
            await deleteUserFn(firebaseUser);

            /*
               Αν φτάσει εδώ, ο Auth λογαριασμός διαγράφηκε.
               Όμως δεν έχουμε σβήσει ακόμα Firestore, άρα σταματάμε αυτό το μονοπάτι
               και πάμε να καθαρίσουμε Firestore με uid/accountKey που ήδη κρατήσαμε.
            */

        }catch(error){

            if(error && error.code === "auth/requires-recent-login"){

                const reauthOk =
                    await reauthenticateGoogleForDelete(firebaseUser);

                if(!reauthOk){
                    alert("Για την οριστική διαγραφή χρειάζεται νέα σύνδεση με Google.");
                    return;
                }

            }else{
                throw error;
            }
        }

        /*
           2. Σβήνουμε Firestore data.
        */
        try{
            await deleteCloudPlayerData(uid, accountKey);
        }catch(err){
            console.warn("deleteCloudPlayerData skipped:", err);
        }

        try{
            await deleteDocFn(playerRef);
        }catch(err){
            console.warn("playerRef delete skipped:", err);
        }

        /*
           3. Αν δεν είχε ήδη σβηστεί ο Auth user, τον σβήνουμε τώρα.
        */
        if(auth.currentUser){
            try{
                await deleteUserFn(auth.currentUser);
            }catch(error){
                if(error && error.code !== "auth/user-not-found"){
                    throw error;
                }
            }
        }

        closeDeleteAccountModal();

        localStorage.removeItem('literaUserName');
        localStorage.removeItem('literaAuthType');
        localStorage.removeItem('literaAvatarImg');
        localStorage.removeItem('literaAvatarRole');
        localStorage.removeItem('literaAccountKey');
        localStorage.removeItem('literaIsAuthenticated');
        localStorage.removeItem('literaUnlockedAvatars');
        localStorage.removeItem('literaPergamena');
        localStorage.removeItem('literaPerfect10Count');
        localStorage.removeItem('quiz_scores_v11');
        localStorage.removeItem('quiz_global_scores_v1');
        localStorage.removeItem('literaLastResolvedRankTitle');
        localStorage.removeItem('literaLastResolvedRankScore');
        localStorage.removeItem('literaPlayerProfile');

        currentRankTitle = "";
        perfect10Count = 0;
        window.playerPergamena = 0;
        updatePergamenaDisplay();

        playerProfile = {
            username:"",
            avatar:"",
            avatarName:"",
            uid:"",
            authType:"guest",
            accountKey:"",
            isAuthenticated:false
        };

        const nameDisplay = document.getElementById('display-username');
        if(nameDisplay) nameDisplay.innerText = "";

        applyUnlockedAvatarsFromStorage();
        renderAvatarScreen();

        const successModal = document.getElementById("delete-success-modal");

        if(successModal){
            successModal.style.display = "flex";
        }

        setTimeout(function(){
            if(successModal){
                successModal.style.display = "none";
            }
            goToScreen('login-screen');
        }, 2000);

    }catch(error){
        console.error("Delete account error:", error);
        alert("Σφάλμα κατά τη διαγραφή λογαριασμού.");
    }
}


function showBonusRewardsBanner(scoreAmount,pergamenaAmount){
const reward=document.createElement("div");
reward.className="bonus-reward-float";
reward.innerHTML=`🎁 +${scoreAmount} βαθμοί • +${pergamenaAmount} <img src='assets/rank_goals/Pergamenas.webp' style='width:16px;height:16px;vertical-align:middle;'>`;
document.body.appendChild(reward);
setTimeout(()=>{
reward.remove();
},1600);
}

function openRankUpModal(rankData){
    
    const modal = document.getElementById('rank-up-modal');
    const text = document.getElementById('rank-up-text');
    const oldBadge = document.getElementById('rank-up-old-badge');
    const newBadge = document.getElementById('rank-up-new-badge');
    const unlockBox = document.getElementById('rank-up-unlock');

    if(!rankData || !rankData.oldRankData || !rankData.newRankData){
        return;
    }

    const oldRank = rankData.oldRankData;
    const newRank = rankData.newRankData;

    if(text){
        text.innerHTML = `Ανεβήκατε σε νέα βαθμίδα κατάταξης!`;
    }

    if(oldBadge){
        oldBadge.innerHTML = `
            <img src="${getRankLevelImage(oldRank)}" class="rankup-badge-img">
            <div class="rankup-badge-title">${getRankTitle(oldRank)}</div>
        `;
    }

    if(newBadge){
        newBadge.innerHTML = `
            <img src="${getRankLevelImage(newRank)}" class="rankup-badge-img">
            <div class="rankup-badge-title">${getRankTitle(newRank)}</div>
        `;
    }

    if(unlockBox){
        const unlockText = rankUnlockHelpMap[newRank.score] || "";

        if(unlockText){
            unlockBox.innerHTML = `🔓 Ξεκλειδώθηκε: ${unlockText}`;
            unlockBox.style.display = 'block';
        }else{
            unlockBox.innerHTML = "";
            unlockBox.style.display = 'none';
        }
    }

    if(typeof playRankUpSound === "function"){
        playRankUpSound();
    }

    if(modal){
        modal.classList.remove('is-hidden');
        modal.style.display = 'flex';
    }
}

function closeRankUpModal(){
    const modal = document.getElementById('rank-up-modal');
    if(modal){
        modal.style.display = 'none';
        modal.classList.add('is-hidden');
    }
}

let activeSupportTab = 'settings';

function switchSupportTab(tabName){
    activeSupportTab = tabName;
    document.querySelectorAll('#nav-header-tabs .support-tab').forEach(btn=>btn.classList.remove('active'));
    document.querySelectorAll('#support-screen .support-panel').forEach(panel=>panel.classList.remove('active'));
    const targetTab=document.querySelector(`#nav-header-tabs .support-tab[onclick="switchSupportTab('${tabName}')"]`);
    const targetPanel=document.getElementById(`tab-${tabName}`);
    if(targetTab)targetTab.classList.add('active');
    if(targetPanel)targetPanel.classList.add('active');
}

function updatePillUI(pillId, thumbId, labelOnId, labelOffId, isOn){
    const thumb = document.getElementById(thumbId);
    const labelOn = document.getElementById(labelOnId);
    const labelOff = document.getElementById(labelOffId);
    if(!thumb) return;
    if(isOn){
        thumb.classList.remove('right');
        if(labelOn) labelOn.classList.add('active');
        if(labelOff) labelOff.classList.remove('active');
    } else {
        thumb.classList.add('right');
        if(labelOn) labelOn.classList.remove('active');
        if(labelOff) labelOff.classList.add('active');
    }
}

function toggleSoundPill(){
    soundEffectsEnabled = !soundEffectsEnabled;
    localStorage.setItem('literaSoundEffectsEnabled', soundEffectsEnabled ? 'true' : 'false');
    updatePillUI('sound-pill','sound-thumb','sound-label-on','sound-label-off', soundEffectsEnabled);
    log("Sound effects:", soundEffectsEnabled);
}

function toggleMusicPill(){
    musicEnabled = !musicEnabled;
    localStorage.setItem('literaMusicEnabled', musicEnabled ? 'true' : 'false');
    updatePillUI('music-pill','music-thumb','music-label-on','music-label-off', musicEnabled);
    if(musicEnabled && !isMuted){ startMenuMusic(); } else { stopMenuMusic(); }
    log("Music:", musicEnabled);
}

function toggleThemePill(){
    const current = localStorage.getItem('literaTheme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
}



function setTheme(theme){
    /* καθαρίζουμε όλα τα themes */
    document.body.classList.remove(
        "light-theme-enabled"
    );
    /* ενεργοποίηση theme */
    if(theme === "light"){
        document.body.classList.add(
            "light-theme-enabled"
        );
    }
    /* αποθήκευση */
    localStorage.setItem(
        "literaTheme",
        theme
    );
    updateThemeUI(theme);
    log("Theme set:", theme);
}

function updateThemeUI(theme){
    document
        .querySelectorAll(".theme-option")
        .forEach(btn =>
            btn.classList.remove("active")
        );
    const el = document.getElementById("theme-" + theme);
    if(el){ el.classList.add("active"); }

    // Update pill toggle
    const isLight = theme === 'light';
    updatePillUI('theme-pill','theme-thumb','theme-label-light','theme-label-dark', isLight);
}

function loadSavedTheme(){
    const saved = localStorage.getItem("literaTheme") || "dark";
    setTheme(saved);

    // Init sound/music pills
    const soundOn = localStorage.getItem('literaSoundEffectsEnabled') !== 'false';
    const musicOn = localStorage.getItem('literaMusicEnabled') !== 'false';
    updatePillUI('sound-pill','sound-thumb','sound-label-on','sound-label-off', soundOn);
    updatePillUI('music-pill','music-thumb','music-label-on','music-label-off', musicOn);
}

function showInitiationOnlyMessage(roomName){

const modal=document.getElementById('initiation-modal');
const title=document.querySelector('#initiation-modal .modal-title');

if(title && roomName){
title.innerText="🔒 "+roomName+" είναι κλειδωμένο";
}

if(modal){
modal.style.display='flex';
}

}

function closeInitiationModal(){

const modal=document.getElementById('initiation-modal');

if(modal){
modal.style.display='none';
}

}

function openMyProfileScreen(){
if(!isGoogleUser()){
showInitiationOnlyMessage();
return;
}

const avatarImg = document.getElementById('profile-avatar-img');
const avatarName = document.getElementById('profile-avatar-name');

if (avatarImg) {
    avatarImg.src = playerProfile.avatar || localStorage.getItem('literaAvatarImg') || "assets/default-avatar.png";
}

if (avatarName) {
    avatarName.innerText = playerProfile.avatarName || localStorage.getItem('literaAvatarRole') || "Όνομα Avatar";
}

loadMyProfileData();
updatePhotoModeUI();
goToScreen('profile-menu-screen');
}

function saveMyProfileData(){
    const screen = document.getElementById("profile-form-screen");
    if(!screen) return;

    playerProfile.realName =
        screen.querySelector("#real-name-input")?.value.trim() || "";

    playerProfile.prose =
        Array.from(screen.querySelectorAll(".prose-input"))
        .map(i => i.value.trim())
        .filter(Boolean);

    playerProfile.poets =
        Array.from(screen.querySelectorAll(".poet-input"))
        .map(i => i.value.trim())
        .filter(Boolean);

    playerProfile.playwrights =
        Array.from(screen.querySelectorAll(".playwright-input"))
        .map(i => i.value.trim())
        .filter(Boolean);

    playerProfile.books =
        Array.from(screen.querySelectorAll(".book-input"))
        .map(i => i.value.trim())
        .filter(Boolean);

    playerProfile.heroes =
        Array.from(screen.querySelectorAll(".hero-input"))
        .map(i => i.value.trim())
        .filter(Boolean);

    saveFullPlayerProfile();
    updateProfileUI();
    updatePhotoModeUI();
    renderProfileCardPreview();

    if(playerProfile.isAuthenticated){
        updatePantheonPlayerStats();
    }

    goToScreen('profile-card-preview-screen');
}

function finishProfilePreview(){
    saveFullPlayerProfile();
    updateProfileUI();
    updatePhotoModeUI();

    if(playerProfile.isAuthenticated){
        updatePantheonPlayerStats();
    }

    if(initiationStep === 2){
        completeInitiation();
        return;
    }

    goToScreen('profile-menu-screen');
}

function loadMyProfileData(){
    const screen = document.getElementById("profile-form-screen");
    if(!screen) return;

    const realNameInput = screen.querySelector("#real-name-input");
    if(realNameInput){
        realNameInput.value = playerProfile.realName || "";
    }

    const fill = (selector, values = []) => {
        screen.querySelectorAll(selector).forEach((input, index) => {
            input.value = values[index] || "";
        });
    };

    fill(".prose-input", playerProfile.prose || []);
    fill(".poet-input", playerProfile.poets || []);
    fill(".playwright-input", playerProfile.playwrights || []);
    fill(".book-input", playerProfile.books || []);
    fill(".hero-input", playerProfile.heroes || []);
}

function openResetProgressModal(){

    const modal =
        document.getElementById('reset-progress-modal');

    if(modal){
        modal.style.display = 'flex';
    }
}

function closeResetProgressModal(){

    const modal =
        document.getElementById('reset-progress-modal');

    if(modal){
        modal.style.display = 'none';
    }
}

async function confirmResetProgress(){

    closeResetProgressModal();
    await resetPlayerProgress();
}

async function resetCloudProgressOnly(){

    if(
        !window.firebaseDB ||
        !window.firebaseDoc ||
        !window.firebaseSetDoc ||
        !window.firebaseCollection ||
        !window.firebaseGetDocs ||
        !window.firebaseDeleteDoc ||
        !playerProfile.uid
    ){
        console.warn("Cloud reset helpers missing");
        return;
    }

    const db = window.firebaseDB;

    const playerRef =
        window.firebaseDoc(db, "players", playerProfile.uid);

    const historyRef =
        window.firebaseCollection(db, "players", playerProfile.uid, "score_history");

    const historySnap =
        await window.firebaseGetDocs(historyRef);

    const deletes = [];

    historySnap.forEach(docSnap => {
        deletes.push(
            window.firebaseDeleteDoc(docSnap.ref)
        );
    });

    await Promise.all(deletes);

    await window.firebaseSetDoc(playerRef, {
        pergamena: 0,
        pantheonPerfect10: 0,
        unlockedAvatars: []
    }, { merge:true });
}

async function resetPlayerProgress(){

    const accountKey =
        playerProfile.accountKey ||
        `guest_${(playerProfile.username || 'anonymous').trim().toLowerCase()}`;

    /* =========================
       RESET LOCAL SCORES
    ========================= */
    const allScores =
        JSON.parse(localStorage.getItem('quiz_scores_v11')) || {};

    Object.keys(allScores).forEach(key => {
        if(key.startsWith(accountKey)){
            delete allScores[key];
        }
    });

    localStorage.setItem(
        'quiz_scores_v11',
        JSON.stringify(allScores)
    );

    /* =========================
       RESET PLAYER PROGRESS
    ========================= */
perfect10Count = 0;

if(isGoogleUser()){
localStorage.setItem('literaPerfect10Count','0');
}else{
localStorage.setItem(getGuestScopedKey('literaPerfect10Count'),'0');
}

    window.playerPergamena = 0;
    localStorage.setItem('literaPergamena', '0');

    unlockedAvatars = [];
    localStorage.setItem(
        'literaUnlockedAvatars',
        JSON.stringify([])
    );

    pendingRankUpData = null;
    lastMilestone = 0;
    currentCorrectAnswers = 0;
    streak = 0;
    maxStreak = 0;

    /* =========================
       ΚΡΑΤΑΜΕ PROFILE / AVATAR / SCHOOL
    ========================= */
    if(isGoogleUser()){
    await resetCloudProgressOnly();
}
    
    updatePergamenaDisplay();
    updateProfileUI();
    updatePhotoModeUI();

    if(typeof renderRankInfo === "function"){
        renderRankInfo();
    }


setTimeout(() => {

    openResetSuccessModal();

}, 200);
}

function openResetSuccessModal(){

    const modal =
        document.getElementById('reset-success-modal');

    if(modal){
        modal.style.display = 'flex';
    }
}

function closeResetSuccessModal(){

    const modal =
        document.getElementById('reset-success-modal');

    if(modal){
        modal.style.display = 'none';
    }

    goToScreen('start-screen');
}

function openPrivacyPolicy(fromScreen = 'support-screen'){
    legalReturnScreen = fromScreen;
    goToScreen('privacy-policy-screen');
}

function openTermsOfUse(fromScreen = 'support-screen'){
    legalReturnScreen = fromScreen;
    goToScreen('terms-of-use-screen');
}



function renderProfileCardPreview(){

    const avatarEl = document.getElementById('preview-card-avatar');
    const realNameEl = document.getElementById('preview-card-realname');
    const usernameEl = document.getElementById('preview-card-username');
    const rankEl = document.getElementById('preview-card-rank');

    const proseEl = document.getElementById('preview-card-prose');
    const poetsEl = document.getElementById('preview-card-poets');
    const playwrightsEl = document.getElementById('preview-card-playwrights');
    const booksEl = document.getElementById('preview-card-books');
    const heroesEl = document.getElementById('preview-card-heroes');

    const avatarSrc =
        (playerProfile.usesCustomPhoto && playerProfile.customPhotoDataUrl)
        ? playerProfile.customPhotoDataUrl
        : (playerProfile.avatar || "assets/default-avatar.png");

    const username =
        playerProfile.username || "Επισκέπτης";

    const realName =
        playerProfile.realName || "Δεν έχει δηλωθεί";

    const totalScore = getTotalPlayerScore();
    const bestStreak = getBestTimeAttackStreak();
    const bestRun = getBestTimeAttackRun();
    const perfect10 = perfect10Count || 0;
    const rankData = getPlayerRankAdvanced(totalScore,bestStreak,bestRun,perfect10);

    if(avatarEl) avatarEl.src = avatarSrc;
    if(realNameEl) realNameEl.innerText = realName;
    if(usernameEl) usernameEl.innerText = `@${username}`;
    if(rankEl){
    const rankIcon = rankData.icon ? rankData.icon + " " : "";
    rankEl.innerText = rankIcon + getRankTitle(rankData);
}

    const fillTags = (target, values) => {
        if(!target) return;
        const clean = (values || []).filter(v => v && v.trim() !== "");
        if(clean.length === 0){
            target.innerHTML = `<span class="player-card-tag">—</span>`;
            return;
        }
        target.innerHTML = clean
            .map(v => `<span class="player-card-tag">${v}</span>`)
            .join("");
    };

    fillTags(proseEl, playerProfile.prose);
    fillTags(poetsEl, playerProfile.poets);
    fillTags(playwrightsEl, playerProfile.playwrights);
    fillTags(booksEl, playerProfile.books);
    fillTags(heroesEl, playerProfile.heroes);
}



async function deleteCloudPlayerData(){
if(!playerProfile.isAuthenticated||playerProfile.authType!=="google"||!playerProfile.uid) return;
if(!window.firebaseDB||!window.firebaseDoc||!window.firebaseGetDoc||!window.firebaseSetDoc||!window.firebaseDeleteDoc||!window.firebaseCollection||!window.firebaseGetDocs) return;

try{
const db=window.firebaseDB;
const docFn=window.firebaseDoc;
const getDocFn=window.firebaseGetDoc;
const setDocFn=window.firebaseSetDoc;
const deleteDocFn=window.firebaseDeleteDoc;
const collectionFn=window.firebaseCollection;
const getDocsFn=window.firebaseGetDocs;
const deleteFieldFn=window.firebaseDeleteField;

const playerRef=docFn(db,"players",playerProfile.uid);
const historyRef=collectionFn(db,"players",playerProfile.uid,"score_history");
const historySnap=await getDocsFn(historyRef);

for(const docSnap of historySnap.docs){
await deleteDocFn(docFn(db,"players",playerProfile.uid,"score_history",docSnap.id));
}

const globalRef=collectionFn(db,"global_scores");
const globalSnap=await getDocsFn(globalRef);

for(const docSnap of globalSnap.docs){
const data=docSnap.data();
if(data.accountKey===playerProfile.accountKey){
await deleteDocFn(docFn(db,"global_scores",docSnap.id));
}
}

const playerSnap=await getDocFn(playerRef);
if(playerSnap.exists()){
if(deleteFieldFn){
await setDocFn(playerRef,{
pergamena:deleteFieldFn(),
pantheonPerfect10:deleteFieldFn(),
unlockedAvatars:deleteFieldFn(),
rankTitleMode:deleteFieldFn(),
realName:deleteFieldFn(),
prose:deleteFieldFn(),
poets:deleteFieldFn(),
playwrights:deleteFieldFn(),
books:deleteFieldFn(),
heroes:deleteFieldFn(),
avatar:deleteFieldFn(),
avatarName:deleteFieldFn(),
usesCustomPhoto:deleteFieldFn(),
customPhotoDataUrl:deleteFieldFn(),
cardTheme:deleteFieldFn(),
initiationCompleted:deleteFieldFn()
},{merge:true});
}
await deleteDocFn(playerRef);
}

}catch(err){
console.error("deleteCloudPlayerData error:",err);
}
}

async function openPantheonPlayerCard(playerId){

    if(
        !window.firebaseDB ||
        !window.firebaseDoc ||
        !window.firebaseGetDoc
    ){
        console.warn("Pantheon player modal: missing Firestore helpers.");
        return;
    }

    try{
        const ref = window.firebaseDoc(window.firebaseDB, "players", playerId);
        const snap = await window.firebaseGetDoc(ref);

        if(!snap.exists()){
            console.warn("Pantheon player not found:", playerId);
            return;
        }

        const player = snap.data();
        renderPantheonPlayerCard(player);

        const modal = document.getElementById("pantheon-player-modal");
        if(modal){
            modal.classList.remove("is-hidden");
            modal.style.display = "flex";
        }

    }catch(err){
        console.error("Pantheon player card load error:", err);
    }
}

function renderPantheonPlayerCard(player){

    const avatarEl = document.getElementById('pantheon-preview-card-avatar');
    const realNameEl = document.getElementById('pantheon-preview-card-realname');
    const usernameEl = document.getElementById('pantheon-preview-card-username');
    const rankEl = document.getElementById('pantheon-preview-card-rank');

    const proseEl = document.getElementById('pantheon-preview-card-prose');
    const poetsEl = document.getElementById('pantheon-preview-card-poets');
    const playwrightsEl = document.getElementById('pantheon-preview-card-playwrights');
    const booksEl = document.getElementById('pantheon-preview-card-books');
    const heroesEl = document.getElementById('pantheon-preview-card-heroes');

    const avatarSrc =
        (player.usesCustomPhoto && player.customPhotoDataUrl)
        ? player.customPhotoDataUrl
        : (player.avatar || "assets/default-avatar.png");

    const username = player.username || "Επισκέπτης";
    const realName = player.realName || "Δεν έχει δηλωθεί";

    const rankMode = player.rankTitleMode || "male";
    const rankTitle =
        rankMode === "female"
        ? (player.rankTitleFemale || player.rankTitleMale || "Άγνωστη Βαθμίδα")
        : (player.rankTitleMale || "Άγνωστη Βαθμίδα");

    if(avatarEl) avatarEl.src = avatarSrc;
    if(realNameEl) realNameEl.innerText = realName;
    if(usernameEl) usernameEl.innerText = `@${username}`;
    if(rankEl) rankEl.innerText = `${player.rankIcon || "🪶"} ${rankTitle}`;

    const fillTags = (target, values) => {
        if(!target) return;
        const clean = (values || []).filter(v => v && String(v).trim() !== "");
        if(clean.length === 0){
            target.innerHTML = `<span class="player-card-tag">—</span>`;
            return;
        }
        target.innerHTML = clean
            .map(v => `<span class="player-card-tag">${v}</span>`)
            .join("");
    };

    fillTags(proseEl, player.prose);
    fillTags(poetsEl, player.poets);
    fillTags(playwrightsEl, player.playwrights);
    fillTags(booksEl, player.books);
    fillTags(heroesEl, player.heroes);
}

function closePantheonPlayerCard(){
    const modal = document.getElementById("pantheon-player-modal");
    if(modal){
        modal.classList.add("is-hidden");
        modal.style.display = "none";
    }
}

function handlePantheonModalBackdrop(event){
    if(event.target && event.target.id === "pantheon-player-modal"){
        closePantheonPlayerCard();
    }
}

function openAvatarSelection(){
goToScreen('avatar-selection-screen');
}

function openPhotoWarningModal(){
    const modal = document.getElementById('photo-warning-modal');
    if(modal) modal.style.display = 'flex';
}

function closePhotoWarningModal(){
    const modal = document.getElementById('photo-warning-modal');
    if(modal) modal.style.display = 'none';
}

function triggerPhotoUpload(){
    closePhotoWarningModal();
    const input = document.getElementById('photo-upload-input');
    if(input) input.click();
}

function updatePhotoModeUI(){
    const usingPhoto = !!playerProfile.usesCustomPhoto;
    document.body.classList.toggle('uses-custom-photo', usingPhoto);

    const profileAvatarImg = document.getElementById('profile-avatar-img');
    const startAvatarImg = document.getElementById('display-avatar-img');

    if(usingPhoto && playerProfile.customPhotoDataUrl){
        if(profileAvatarImg) profileAvatarImg.src = playerProfile.customPhotoDataUrl;
        if(startAvatarImg) startAvatarImg.src = playerProfile.customPhotoDataUrl;
    }else{
        const avatarSrc = playerProfile.avatar || "assets/default-avatar.png";
        if(profileAvatarImg) profileAvatarImg.src = avatarSrc;
        if(startAvatarImg) startAvatarImg.src = avatarSrc;
    }
}


async function saveFullPlayerProfile(){

    if(isGoogleUser()){

        if(
            window.firebaseDB &&
            window.firebaseDoc &&
            window.firebaseSetDoc &&
            playerProfile.uid
        ){
            try{
                await window.firebaseSetDoc(
                    window.firebaseDoc(window.firebaseDB, "players", playerProfile.uid),
                    {
                        username: playerProfile.username || "",
                        uid: playerProfile.uid || "",
                        authType: playerProfile.authType || "google",
                        accountKey: playerProfile.accountKey || "",
isAuthenticated: true,
email: window.firebaseAuth && window.firebaseAuth.currentUser ? window.firebaseAuth.currentUser.email || "" : "",
displayLabel: `${playerProfile.username || "Unknown"} (${playerProfile.accountKey || "no_accountKey"})`,
initiationCompleted: !!initiationCompleted,

                        avatar: playerProfile.avatar || "",
                        avatarName: playerProfile.avatarName || "",

                        realName: playerProfile.realName || "",
                        rankTitleMode: playerProfile.rankTitleMode || "male",

                        prose: playerProfile.prose || [],
                        poets: playerProfile.poets || [],
                        playwrights: playerProfile.playwrights || [],
                        books: playerProfile.books || [],
                        heroes: playerProfile.heroes || [],

                        usesCustomPhoto: !!playerProfile.usesCustomPhoto,
                        customPhotoDataUrl: playerProfile.customPhotoDataUrl || "",
                        cardTheme: playerProfile.cardTheme || "rank-default",

                        pergamena: window.playerPergamena || 0,
                        unlockedAvatars: Array.isArray(unlockedAvatars) ? unlockedAvatars : [],
                        pantheonPerfect10: perfect10Count || 0,

                        updatedAt: new Date().toISOString()
                    },
                    { merge: true }
                );
            }catch(err){
                console.error("Google profile save error:", err);
            }
        }

        return;
    }

    localStorage.setItem('literaPlayerProfile', JSON.stringify(playerProfile));
}



async function loadFullPlayerProfile(){

    // GOOGLE USER → Firebase only
    if(isGoogleUser() && playerProfile.uid){

        try{

           const docRef =
    firebaseDoc(
        firebaseDB,
        "players",
        playerProfile.uid
    );

            const snap =
                await firebaseGetDoc(docRef);

            if(snap.exists()){

                const saved = snap.data();

                playerProfile = {
                    ...playerProfile,
                    ...saved
                };

            }

        }catch(err){

            console.error(
                "Firebase load error:",
                err
            );

        }

        return;
    }

    // GUEST USER → localStorage
    const raw =
        localStorage.getItem(
            'literaPlayerProfile'
        );

    if(!raw) return;

    try{

        const saved =
            JSON.parse(raw);

        playerProfile = {
            ...playerProfile,
            ...saved
        };

    }catch(err){

        console.error(
            "Local profile parse error:",
            err
        );

    }

}



function getCurrentAvatarCategory(){

    if(playerProfile.usesCustomPhoto){
        return null;
    }

    const avatarName = playerProfile.avatarName || "";

    for(const [category, avatars] of Object.entries(allAvatars)){
        const found = avatars.find(av => av.name === avatarName);
        if(found){
            return category;
        }
    }

    return null;
}

const avatarHelpIconMap = {
    "Πεζογραφία": "https://i.ibb.co/Z1GBmy2M/Novelists.png",
    "Ποίηση": "https://i.ibb.co/vxxSyBP6/Poets.png",
    "Θέατρο": "https://i.ibb.co/YTYkmzCv/Time-Freeze.png",
    "Λογοτεχνικοί Ήρωες": "https://i.ibb.co/Q3mPCQ9t/Heroes.png"  
};

const rankHelpIconMap = {
    proto: "https://i.ibb.co/3yDPgMdR/Heart-Saga.png",
    magistros: "https://i.ibb.co/XxcKkjKX/All-Seeing-Eye.png",
    dragon: "https://i.ibb.co/4ZCxXBXZ/Great-Dragon.png"
};

function getCurrentAvatarCategory(){

    if(playerProfile.usesCustomPhoto){
        return null;
    }

    const avatarName = playerProfile.avatarName || "";

    for(const [category, avatars] of Object.entries(allAvatars)){
        const found = avatars.find(av => av.name === avatarName);
        if(found){
            return category;
        }
    }

    return null;
}

function hasCompletedProfileForHelps(){

    if(!playerProfile) return false;

    const hasRealName =
        !!(playerProfile.realName && playerProfile.realName.trim() !== "");

    const literaryLists = [
        playerProfile.prose,
        playerProfile.poets,
        playerProfile.playwrights,
        playerProfile.books,
        playerProfile.heroes
    ];

    let hasAtLeastOne = false;

    literaryLists.forEach(list => {
        if(Array.isArray(list)){
            const filtered =
                list.filter(x => x && x.trim() !== "");

            if(filtered.length > 0){
                hasAtLeastOne = true;
            }
        }
    });

    return hasRealName && hasAtLeastOne;
}

function renderHelpSlots(){

   const activeCategory =
    getAuthorHelpCategoryForQuestion(gameQuestions[currentIdx]);
    const rankMode = getRankTitleMode();
    const rankTier = getCurrentRankHelpTier();

    for(let i = 1; i <= 4; i++){

        const slotBtn = document.getElementById(`help-slot-${i}`);
        const slotImg = document.getElementById(`help-slot-img-${i}`);

        if(!slotBtn || !slotImg) continue;

        slotBtn.classList.remove("locked", "active-help", "used-help", "refresh-ready");
        slotImg.src = "https://i.ibb.co/VWyXVsTj/locked.png";
slotBtn.classList.add("locked");

        // 1ο slot = avatar help
if(i === 1){
    if(activeCategory && avatarHelpIconMap[activeCategory]){
        slotBtn.classList.remove("locked");
        slotImg.src =
            avatarHelpIconMap[activeCategory];
        if(avatarHelpUsedThisRun){
            slotImg.src =
                "https://i.ibb.co/Kps98YC5/Used-Help.png";
            slotBtn.classList.add("used-help");
        }else{
            slotBtn.classList.add("active-help");
        }
    }else{
        slotImg.src =
            "https://i.ibb.co/VWyXVsTj/locked.png";
        slotBtn.classList.add("locked");
    }
}

        // 2ο slot = gender help
        else if(i === 2){

            if(rankMode === "male"){

                if(maleShieldCharges <= 0){
                    slotImg.src = "https://i.ibb.co/Kps98YC5/Used-Help.png";
                    slotBtn.classList.add("used-help");
                }else if(maleShieldCharges === 1){
                    slotImg.src = "https://i.ibb.co/mrc8k7xc/Cracked-Male-Shield.png";
                    slotBtn.classList.add("active-help");
                }else{
                    slotImg.src = "https://i.ibb.co/DgmLPP1g/Male-Shield.png";
                    slotBtn.classList.add("active-help");
                }

            }else if(rankMode === "female"){

                if(genderHelpUsedThisRun){
                    slotImg.src = "https://i.ibb.co/Kps98YC5/Used-Help.png";
                    slotBtn.classList.add("used-help");
                }else{
                    slotImg.src = "https://i.ibb.co/x8cGB75X/Female-Sandglass.png";
                    slotBtn.classList.add("active-help");
                }

            }else{
                slotImg.src = "https://i.ibb.co/VWyXVsTj/locked.png";
                slotBtn.classList.add("locked");
            }
        }

        // 3ο slot = rank help
        else if(i === 3){

            if(rankTier){

                slotImg.src = rankHelpIconMap[rankTier];

                if(rankHelpUsedThisRun){
                    slotImg.src = "https://i.ibb.co/Kps98YC5/Used-Help.png";
                    slotBtn.classList.add("used-help");
                }else{
                    slotBtn.classList.add("active-help");
                }

            }else{
                slotImg.src = "https://i.ibb.co/VWyXVsTj/locked.png";
                slotBtn.classList.add("locked");
            }
        }

        // 4ο slot = refresh help
        else if(i === 4){

            if(hasCompletedProfileForHelps()){
                slotImg.src = "https://i.ibb.co/209HMG3H/Chat-GPT-Image-15-2026-11-36-20.png";

                if(refreshHelpUsedThisRun){
                    slotImg.src = "https://i.ibb.co/Kps98YC5/Used-Help.png";
                    slotBtn.classList.add("used-help");
                }else if(
                    avatarHelpUsedThisRun ||
                    genderHelpUsedThisRun ||
                    maleShieldCharges < 2 ||
                    rankHelpUsedThisRun
                ){
                    slotBtn.classList.add("active-help");
                }else{
                    slotBtn.classList.add("refresh-ready");
                }

            }else{
                slotImg.src = "https://i.ibb.co/VWyXVsTj/locked.png";
                slotBtn.classList.add("locked");
            }
        }

        else{
            slotImg.src = "https://i.ibb.co/VWyXVsTj/locked.png";
            slotBtn.classList.add("locked");
        }
    }
}

function showDragonBonusQuestion(){

    showDragonBonusIndicator();
    playHelpActivateSound();

    setTimeout(function(){
        hideDragonBonusIndicator();
        openBonusQuestionModal();
    }, 1200);
}

function useAllSeeingEyeHelp(){
if(isQuestionTransitionLocked) return;
    if(rankHelpUsedThisRun){
        playLockedHelpSound();
        return;
    }

    const currentQuestion = gameQuestions[currentIdx];
    if(!currentQuestion){
        playLockedHelpSound();
        return;
    }

    const buttons =
        document.querySelectorAll('#options button');

    let correctButton = null;

    buttons.forEach(btn=>{
        if(btn.innerText === currentQuestion.correct){
            correctButton = btn;
        }
    });

    if(!correctButton){
        playLockedHelpSound();
        return;
    }

    // glow σωστής απάντησης
correctButton.style.boxShadow =
    "0 0 12px #4cff7a, 0 0 24px #4cff7a";

correctButton.style.border =
    "4px solid #4cff7a";

    rankHelpUsedThisRun = true;

    renderHelpSlots();
    playHelpActivateSound();
}

function useDragonVoiceHelp(){
if(isQuestionTransitionLocked) return;
    if(rankHelpUsedThisRun){
        playLockedHelpSound();
        return;
    }

    const currentQuestion = gameQuestions[currentIdx];
    if(!currentQuestion){
        playLockedHelpSound();
        return;
    }

    const buttons = document.querySelectorAll('#options button');
    let correctButton = null;

    buttons.forEach(btn=>{
        if(btn.innerText === currentQuestion.correct){
            correctButton = btn;
        }
    });

    if(!correctButton){
        playLockedHelpSound();
        return;
    }

    correctButton.style.boxShadow =
        "0 0 18px #ffd700, 0 0 40px #ffd700, inset 0 0 10px rgba(255,215,0,0.35)";

    correctButton.style.outline = "4px solid #ffd700";
    correctButton.style.outlineOffset = "2px";

    dragonBonusPending = true;
    rankHelpUsedThisRun = true;

    renderHelpSlots();
    playHelpActivateSound();
}

function getCurrentRankHelpTier(){

    // TEST MODE (αν έχεις βάλει forced tier)
    if(forceRankHelpTier){
        return forceRankHelpTier;
    }

    const totalScore = getTotalPlayerScore();
    const bestStreak = getBestTimeAttackStreak();
    const bestRun = getBestTimeAttackRun();
    const perfect10 = perfect10Count || 0;

    const rankData = getPlayerRankAdvanced(
        totalScore,
        bestStreak,
        bestRun,
        perfect10
    );

    const rankTitle = getRankTitle(rankData);

    if(rankTitle.includes("Μέγας Δράκος")){
        return "dragon";
    }

    if(rankTitle.includes("Μέγας Μάγιστρος")){
        return "magistros";
    }

    if(rankTitle.includes("Πρωτορήτορας")){
        return "proto";
    }

    return null;
}

function useRefreshHelp(){
if(isQuestionTransitionLocked) return;
    if(refreshHelpUsedThisRun) return;

    const rankMode = getRankTitleMode();

    const canRefreshAvatar = avatarHelpUsedThisRun;
    const canRefreshGender =
        genderHelpUsedThisRun || (rankMode === "male" && maleShieldCharges < 2);
    const canRefreshRank = rankHelpUsedThisRun;

    if(!canRefreshAvatar && !canRefreshGender && !canRefreshRank){
        playLockedHelpSound();
        return;
    }

    avatarHelpUsedThisRun = false;
    poeticRetryPending = false;

    genderHelpUsedThisRun = false;
    if(rankMode === "male"){
        maleShieldCharges = 2;
    }

    rankHelpUsedThisRun = false;

    refreshHelpUsedThisRun = true;

    renderHelpSlots();
    playHelpActivateSound();
}

function handleHelpSlotClick(slotNumber){

    const activeCategory = getAuthorHelpCategoryForQuestion(gameQuestions[currentIdx]);
    const rankMode = getRankTitleMode();
    const rankTier = getCurrentRankHelpTier();

    // 4ο slot = refresh help
    if(slotNumber === 4){

        if(!hasCompletedProfileForHelps()){
            playLockedHelpSound();
            return;
        }

        useRefreshHelp();
        return;
    }

    // 3ο slot = rank help
    if(slotNumber === 3){

        if(!rankTier){
            playLockedHelpSound();
            return;
        }

        if(rankHelpUsedThisRun){
            playLockedHelpSound();
            return;
        }

        if(rankTier === "proto"){
            useHeartSagaHelp();
            return;
        }
      
        if(rankTier === "magistros"){
    useAllSeeingEyeHelp();
    return;
}
      
      if(rankTier === "dragon"){
    useDragonVoiceHelp();
    return;
}

        // προς το παρόν τα άλλα δυο δεν έχουν μπει ακόμα
        playLockedHelpSound();
        return;
    }

    // 2ο slot = gender help
    if(slotNumber === 2){

        // male = passive shield, όχι clickable
        if(rankMode === "male"){
            playLockedHelpSound();
            return;
        }

        // female = active +10 sec
        if(rankMode === "female"){
            useFemaleTimeHelp();
            return;
        }

        playLockedHelpSound();
        return;
    }

    // 1ο slot = avatar help
    if(slotNumber !== 1){
        playLockedHelpSound();
        return;
    }

    if(!activeCategory){
        playLockedHelpSound();
        return;
    }

    if(activeCategory === "Ποίηση"){
        playLockedHelpSound();
        return;
    }

    if(avatarHelpUsedThisRun){
        playLockedHelpSound();
        return;
    }

    if(activeCategory === "Πεζογραφία"){
        useBalanceHelp();
        return;
    }

    if(activeCategory === "Θέατρο"){
        useFreezeTimeHelp();
        return;
    }

    if(activeCategory === "Λογοτεχνικοί Ήρωες"){
        useHeroCourageHelp();
        return;
    }

    playLockedHelpSound();
}


// ΒΟΗΘΕΙΑ ΖΥΓΑΡΙΑΣ 50/50

function useBalanceHelp(){
if(isQuestionTransitionLocked) return;
    if(avatarHelpUsedThisRun) return;

    const q = gameQuestions[currentIdx];
    if(!q) return;

    const buttons = [...document.querySelectorAll('#options button')];

    const wrongButtons = buttons.filter(btn => {
        return btn.innerText !== q.correct && btn.style.visibility !== "hidden";
    });

    if(wrongButtons.length < 2) return;

    wrongButtons
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .forEach(btn => {
            btn.style.visibility = "hidden";
            btn.disabled = true;
        });

avatarHelpUsedThisRun = true;
renderHelpSlots();
playHelpActivateSound();
}

function useFreezeTimeHelp(){
if(isQuestionTransitionLocked) return;
    if(avatarHelpUsedThisRun) return;

    freezeTimeUntil = Date.now() + 10000; // 10 δευτερόλεπτα

    avatarHelpUsedThisRun = true;
    renderHelpSlots();

    showFreezeIndicator();   // ← ΑΥΤΟ ΕΙΝΑΙ ΤΟ ΚΡΙΣΙΜΟ
    playHelpActivateSound();
}

function useHeroCourageHelp(){
  if(isQuestionTransitionLocked) return;

    if(avatarHelpUsedThisRun) return;

    if(currentGameMode === "TimeAttack"){
        heroBoostUntil = Date.now() + 15000; // 15 δευτερόλεπτα
    }else{
        // Answer10 -> μόνο για την τρέχουσα ερώτηση
        heroBoostQuestionActive = true;
    }

    avatarHelpUsedThisRun = true;
    renderHelpSlots();
    showHeroBoostIndicator();
    playHelpActivateSound();
}

function useHeartSagaHelp(){
if(isQuestionTransitionLocked) return;
    if(rankHelpUsedThisRun){
        playLockedHelpSound();
        return;
    }

    const currentQuestion = gameQuestions[currentIdx];
    if(!currentQuestion){
        playLockedHelpSound();
        return;
    }

    // Βρες ερωτήσεις level 1 διαφορετικές από την τρέχουσα
    const fallbackPool = allQuestions.filter(q =>
        q &&
        q.level === 1 &&
        q.q !== currentQuestion.q
    );

    if(fallbackPool.length === 0){
        playLockedHelpSound();
        return;
    }

    const newQuestion =
        fallbackPool[Math.floor(Math.random() * fallbackPool.length)];

    gameQuestions[currentIdx] = newQuestion;

    rankHelpUsedThisRun = true;
    renderHelpSlots();
    playHelpActivateSound();

    loadNextQuestion();
}

function getHeroScoreMultiplier(){

    if(getCurrentAvatarCategory() !== "Λογοτεχνικοί Ήρωες"){
        return 1;
    }

    if(heroBoostQuestionActive){
        return 2;
    }

    if(Date.now() < heroBoostUntil){
        return 2;
    }

    return 1;
}

function showHeroBoostIndicator(){
  
    const el = document.getElementById('hero-boost-indicator');
    if(el){
        el.style.display = 'flex';
    }
}

function hideHeroBoostIndicator(){
    const el = document.getElementById('hero-boost-indicator');
    if(el){
        el.style.display = 'none';
    }
}

function showFreezeIndicator(){
    const el = document.getElementById('freeze-indicator');
    const app = document.getElementById('app-container');

    if(el) el.style.display = 'block';
    if(app) app.classList.add('freeze-active');
}

function hideFreezeIndicator(){
    const el = document.getElementById('freeze-indicator');
    const app = document.getElementById('app-container');

    if(el) el.style.display = 'none';
    if(app) app.classList.remove('freeze-active');
}

function showPoetryHelpIndicator(){
    const el = document.getElementById('poetry-help-indicator');
    if(el){
        el.style.display = 'block';
    }
}

function hidePoetryHelpIndicator(){
    const el = document.getElementById('poetry-help-indicator');
    if(el){
        el.style.display = 'none';
    }
}

const appContainer = document.getElementById('app-container');

let isDraggingScroll = false;
let dragStartY = 0;
let startScrollTop = 0;

if(appContainer){

    appContainer.addEventListener('mousedown', function(e){
        // μόνο αριστερό κλικ
        if(e.button !== 0) return;

        isDraggingScroll = true;
        dragStartY = e.clientY;
        startScrollTop = appContainer.scrollTop;

        appContainer.classList.add('drag-scroll-active');
    });

    window.addEventListener('mousemove', function(e){
        if(!isDraggingScroll) return;

        const deltaY = e.clientY - dragStartY;
        appContainer.scrollTop = startScrollTop - deltaY;
    });

    window.addEventListener('mouseup', function(){
        isDraggingScroll = false;
        appContainer.classList.remove('drag-scroll-active');
    });

    appContainer.addEventListener('mouseleave', function(){
        isDraggingScroll = false;
        appContainer.classList.remove('drag-scroll-active');
    });

    // για να μην κάνει select κείμενα όσο σέρνεις
    appContainer.addEventListener('dragstart', function(e){
        e.preventDefault();
    });
}

function useFemaleTimeHelp(){
if(isQuestionTransitionLocked) return;
    if(genderHelpUsedThisRun){
        playLockedHelpSound();
        return;
    }

    if(currentGameMode === "TimeAttack"){
        timeAttackTotalTime += 15;
        if(timeAttackTotalTime > 45) timeAttackTotalTime = 45;
    }else{
        timeLeft += 15;
        document.getElementById('timer-text').innerText = timeLeft + "s";
    }

    showTimeBonusEffect(15);
    genderHelpUsedThisRun = true;
    renderHelpSlots();
    playHelpActivateSound();
}

let initiationSelectedRank = null;

function selectInitiationRank(mode){

    initiationSelectedRank = mode;

    const maleBtn = document.getElementById("initiation-rank-mode-male");
    const femaleBtn = document.getElementById("initiation-rank-mode-female");
    const continueBtn = document.getElementById("initiation-continue-btn");

    if(maleBtn){
        maleBtn.classList.toggle("active", mode === "male");
    }

    if(femaleBtn){
        femaleBtn.classList.toggle("active", mode === "female");
    }

    if(continueBtn){
        continueBtn.disabled = false;
    }
}

function continueInitiationRank(){

    if(!initiationSelectedRank){
        return;
    }

    setRankTitleMode(initiationSelectedRank);

    initiationStep = 2;
    goToScreen('initiation-profile-screen');
}

function completeInitiationProfile(){
    const screen = document.getElementById('initiation-profile-screen');
    if(!screen) return;

    const profile = {
        realName: screen.querySelector('#initiation-real-name-input')?.value.trim() || "",
        prose: Array.from(screen.querySelectorAll('.prose-input')).map(i => i.value.trim()).filter(Boolean),
        poets: Array.from(screen.querySelectorAll('.poet-input')).map(i => i.value.trim()).filter(Boolean),
        playwrights: Array.from(screen.querySelectorAll('.playwright-input')).map(i => i.value.trim()).filter(Boolean),
        books: Array.from(screen.querySelectorAll('.book-input')).map(i => i.value.trim()).filter(Boolean),
        heroes: Array.from(screen.querySelectorAll('.hero-input')).map(i => i.value.trim()).filter(Boolean)
    };


    playerProfile.realName = profile.realName;
    playerProfile.prose = profile.prose;
    playerProfile.poets = profile.poets;
    playerProfile.playwrights = profile.playwrights;
    playerProfile.books = profile.books;
    playerProfile.heroes = profile.heroes;

    saveFullPlayerProfile();
    updateProfileUI();
    updatePhotoModeUI();
    renderProfileCardPreview();

    goToScreen('profile-card-preview-screen');
}

function skipInitiationProfile(){
    completeInitiation();
}

function showDragonBonusIndicator(){
    const el = document.getElementById("dragon-bonus-indicator");
    const app = document.getElementById("app-container");

    if(el) el.style.display = "block";
    if(app) app.classList.add("dragon-flash");
}

function hideDragonBonusIndicator(){
    const el = document.getElementById("dragon-bonus-indicator");
    const app = document.getElementById("app-container");

    if(el) el.style.display = "none";
    if(app) app.classList.remove("dragon-flash");
}

function showScoreGain(points){
    const el = document.getElementById("score-gain-pop");
    if(!el) return;

    el.innerText = `+${points}`;
    el.classList.remove("show");

    // reflow για να ξαναπαίξει το animation
    void el.offsetWidth;

    el.classList.add("show");

    setTimeout(function(){
        el.classList.remove("show");
    }, 420);
}

function addScore(points){
    score += points;
    updateUI();
    showScoreGain(points);
}

//ΥΠΟΣΤΗΡΙΞΗ και DONATIONS//

function openDonateModal(){
const modal=document.getElementById('donate-modal');
if(modal)modal.style.display='flex';
}

function closeDonateModal(){
const modal=document.getElementById('donate-modal');
if(modal)modal.style.display='none';
}


function closeDonateSoonModal(){
const soonModal=document.getElementById('donate-soon-modal');
if(soonModal)soonModal.style.display='none';
}

function formatElapsedTime(totalSeconds){
    if(!totalSeconds || totalSeconds < 0){
        return "0 δευτερόλεπτα";
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if(minutes > 0){
        return `${minutes} λεπτό${minutes === 1 ? "" : "ά"} και ${seconds} δευτερόλεπτα`;
    }

    return `${seconds} δευτερόλεπτα`;
}


function getFinishComment(score){
    if(score >= 500) return "Σου αξίζει μια θέση δίπλα στον Γκαίτε!";
    else if(score >= 475) return "Αν ζούσε ο Χάρολντ Μπλουμ, σίγουρα θα σε ονόμαζε διάδοχό του!";
    else if(score >= 450) return "Μπράβο. Το σκορ σου είναι υψηλό, αλλά η κοινωνική σου ζωή μάλλον ανύπαρκτη.";
    else if(score >= 425) return "Αν ήταν στο χέρι μου, θα ήσουν μέλος της επιτροπής Νόμπελ Λογοτεχνίας!";
    else if(score >= 400) return "Φαίνεται πως έχεις διαβάσει περισσότερα βιβλία απ' όσα οι υπόλοιποι έχουμε δει σε ράφι.";
    else if(score >= 320) return "Εντυπωσιακό. Μπορείς πλέον να κοιτάς τους γύρω σου με το ύφος του διαβασμένου.";
    else if(score >= 200) return "Πολύ καλή προσπάθεια!";
    else if(score >= 150) return "Χρειάζεσαι πολύ διάβασμα ακόμα!";
    else if(score >= 75) return "Μην απελπίζεσαι.";
    return "Μάλλον φαντάζεσαι την κόλαση σαν ένα είδος βιβλιοθήκης.";
}

function getFinishCommentAnswer10(correctAnswers, difficulty){

    const percent = (correctAnswers / 10) * 100;

    if(percent === 100){
        if(difficulty === "hard")
            return "Δέκα στα δέκα στο Δύσκολο. Αυτό δεν είναι τύχη — είναι παιδεία.";
        if(difficulty === "medium")
            return "Άψογο σκορ. Η βιβλιοθήκη σε χαιρετά.";
        return "Τέλειο αποτέλεσμα! Μια μικρή λογοτεχνική νίκη.";
    }

    else if(percent >= 80){
        return "Πολύ δυνατή επίδοση. Είσαι κοντά στην τελειότητα.";
    }

    else if(percent >= 60){
        return "Καλή προσπάθεια. Το έδαφος είναι σταθερό.";
    }

    else if(percent >= 40){
        return "Υπάρχει πρόοδος, αλλά θέλει ακόμα διάβασμα.";
    }

    else if(percent >= 20){
        return "Μην απογοητεύεσαι — κάθε βιβλίο αρχίζει από την πρώτη σελίδα.";
    }

    return "Η λογοτεχνία σε περιμένει ακόμα.";
}

function typeText(element, text, speed = 22){
    return new Promise(resolve => {
        if(!element){
            resolve();
            return;
        }

        element.textContent = "";
        let i = 0;

        function step(){
            if(i < text.length){
                element.textContent += text.charAt(i);
                i++;
                setTimeout(step, speed);
            }else{
                resolve();
            }
        }

        step();
    });
}

let finishReviewModalOpen = false;
async function openFinishReviewModal(){

    if(finishReviewModalOpen) return;
    finishReviewModalOpen = true;

    log("Opening Finish Review Modal");

    const modal = document.getElementById('finish-review-modal');
    const loading = document.getElementById('finish-review-loading');
    const resultWrap = document.getElementById('finish-review-result-wrap');
    const statsWrap = document.getElementById('finish-review-stats');
    const resultText = document.getElementById('finish-review-result-text');
    const button = document.getElementById('finish-review-btn');

    if(!modal || !loading || !resultWrap || !statsWrap || !resultText || !button){
        console.error("Finish modal elements missing");
        return;
    }

    /* RESET STATE */

    modal.classList.add("show");
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.style.visibility = "visible";

    loading.style.display = "block";
    resultWrap.style.display = "none";

    statsWrap.innerHTML = "";
    resultText.innerText = "";

    button.style.display = "none";

    /* WAIT 2 sec */

    await new Promise(resolve => setTimeout(resolve, 2000));

    /* SHOW RESULTS */

    loading.style.display = "none";
    resultWrap.style.display = "block";

    /* CALCULATE VALUES */

    const totalQuestions =
        currentGameMode === "Answer10"
        ? 10
        : currentIdx;

    const percent =
        totalQuestions > 0
        ? Math.round((currentCorrectAnswers / totalQuestions) * 100)
        : 0;

    const elapsed =
        currentGameMode === "TimeAttack"
        ? (timeAttackElapsed || 0)
        : 0;

    const formattedTime = formatElapsedTime(elapsed);

    /* BUILD LINES */

    const lines = [

        `Συνολικές ερωτήσεις: <span class="finish-review-stat-value">${totalQuestions}</span>`,

        `Σωστές απαντήσεις: <span class="finish-review-stat-value">${currentCorrectAnswers}</span>`,

        `Ποσοστό επιτυχίας: <span class="finish-review-stat-value">${percent}%</span>`,

        `Συνολικός χρόνος: <span class="finish-review-stat-value">${formattedTime}</span>`

    ];

    /* TYPE STATS */

    for(const line of lines){

        const div = document.createElement("div");

        div.className = "finish-review-stat-line";
        div.innerHTML = line;

        statsWrap.appendChild(div);

        await new Promise(r => setTimeout(r, 220));
    }

    /* COMMENT */

const comment =
    currentGameMode === "Answer10"
        ? getFinishCommentAnswer10(currentCorrectAnswers, selectedDifficulty)
        : getFinishComment(score);

    await typeText(resultText, comment, 22);

    /* SHOW BUTTON */

    button.style.display = "flex";

    log("Finish Review Modal Ready");
}

function switchHelpTab(tab) {
    // Tabs
    document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.help-tab-${tab}`).classList.add('active');
    // Content
    document.querySelectorAll('.help-tab-content').forEach(c => c.style.display = 'none');
    document.querySelector(`.help-tab-content[data-tab="${tab}"]`).style.display = 'block';
}

function continueToFinishSummary(){
    finishReviewModalOpen = false;
    const modal = document.getElementById('finish-review-modal');

    if(modal){
        modal.classList.remove("show");
        modal.style.display = "none";
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";
    }

    goToScreen('finish-screen');
    showSummary();
}

async function showFinishScreen() {
    hideFreezeIndicator();
    freezeTimeUntil = 0;

    hideHeroBoostIndicator();
    heroBoostUntil = 0;
    clearInterval(timerInterval);

const modeLabel = document.getElementById('final-mode-label');
if(modeLabel){
    modeLabel.innerText =
        currentGameMode === "TimeAttack"
        ? "Time Attack"
        : "Answer 10";
}

  // ΜΗΝ πάμε ακόμα finish screen
// Θα πάμε όταν πατηθεί "Ευχαριστώ! Δείξε μου την ανασκόπηση!"

    const scoreVal = document.getElementById('final-score-value');
    if(scoreVal) scoreVal.innerText = score;

const scoreMsg = document.getElementById('score-message');
if(scoreMsg){
    scoreMsg.innerText = "";
}

    await openFinishReviewModal();
    maybeShowCoffeeReminder();
    await saveScore(score, selectedCategory, selectedDifficulty);
    await saveGlobalScore(score, selectedCategory, selectedDifficulty);

    const isHardOrScaling =
        selectedDifficulty === "Scaling" ||
        selectedDifficulty === "Hard";

    if(
        currentGameMode === "Answer10" &&
        currentCorrectAnswers === 10 &&
        isHardOrScaling &&
        isGoogleUser()
    ){
        perfect10Count++;

        localStorage.setItem(
            'literaPerfect10Count',
            String(perfect10Count)
        );
    }

    // 🎉 PERFECT 10 — Coffee reminder

if(
    currentGameMode === "Answer10" &&
    currentCorrectAnswers === 10
){

    log("Perfect 10 — show coffee modal");

    setTimeout(() => {

        openCoffeeModal();

    }, 3000);

}

// ⚡ TIME ATTACK HIGH SCORE — Coffee reminder
if(
    currentGameMode === "TimeAttack" &&
    score >= 300
){
    log("Great TimeAttack score — show coffee modal");

    setTimeout(() => {
        openCoffeeModal();
    }, 3000);
}

    await updatePantheonPlayerStats();

    let reward = 0;

    if(currentGameMode === "TimeAttack"){
        reward += Math.floor(currentCorrectAnswers / 5);
        if(currentCorrectAnswers >= 20) reward += 5;
        if(currentCorrectAnswers >= 40) reward += 10;
    }

    if(currentGameMode === "Answer10"){
        if(currentCorrectAnswers >= 7) reward += 2;
        if(currentCorrectAnswers === 10) reward += 5;
    }

    log("TimeAttack correct:", currentCorrectAnswers);
    log("Pergamena reward:", reward);

    if(reward > 0){
        addPergamena(reward);
    }

    await updateProfileUI();

    if(pendingRankUpData){
        const rankDataToShow = pendingRankUpData;

        log("RANK MODAL TRIGGER:", rankDataToShow);

        pendingRankUpData = null;

        setTimeout(function(){
           log("OPENING RANK MODAL NOW");
            openRankUpModal(rankDataToShow);
        }, 250);
    }
}


function setCountryLang(lang){
    currentCountryLang = lang === "en" ? "en" : "el";

    const toggle = document.getElementById("country-lang-toggle");
    const elLabel = document.getElementById("lang-label-el");
    const enLabel = document.getElementById("lang-label-en");

    if(toggle){
        toggle.checked = currentCountryLang === "en";
    }

    if(elLabel){
        elLabel.classList.toggle("active", currentCountryLang === "el");
    }

    if(enLabel){
        enLabel.classList.toggle("active", currentCountryLang === "en");
    }

    renderFindCountryIntro();
}

function toggleCountryLang(){
    const toggle = document.getElementById("country-lang-toggle");
    const lang = toggle && toggle.checked ? "en" : "el";
    setCountryLang(lang);
}
//Update Button//
async function forceAppUpdate(){

    try{

        const response =
            await fetch("script.js?nocache=" + Date.now());

        const scriptText =
            await response.text();

        const match =
            scriptText.match(/window\.APP_VERSION\s*=\s*["'](.+?)["']/);

        if(!match){

            openUpdateModal(
                "Έλεγχος για ενημερώσεις",
                "Δεν βρέθηκε αριθμός έκδοσης.",
                false
            );

            return;
        }

        const serverVersion = match[1];
        const currentVersion = window.APP_VERSION;

        if(serverVersion !== currentVersion){

            openUpdateModal(
                "Νέα έκδοση διαθέσιμη",
                "Υπάρχει νέα έκδοση της εφαρμογής.",
                true
            );

        }else{

            openUpdateModal(
                "Έλεγχος για ενημερώσεις",
                "Η εφαρμογή είναι ήδη ενημερωμένη.",
                false
            );

        }

    }catch(error){

        openUpdateModal(
            "Έλεγχος για ενημερώσεις",
            "Δεν ήταν δυνατός ο έλεγχος ενημερώσεων.",
            false
        );

        console.error(error);

    }

}

function openAppInfoModal(){

    const modal =
        document.getElementById("app-info-modal");

    const versionText =
        document.getElementById("app-version-text");

    if(versionText && window.APP_VERSION){
        versionText.textContent =
            "v" + window.APP_VERSION;
    }

    if(modal){
        modal.style.display = "flex";
    }

}


function closeAppInfoModal(){

    const modal =
        document.getElementById("app-info-modal");

    if(modal){
        modal.style.display = "none";
    }

}

async function forceAppUpdate(){

    try{
        const response = await fetch("script.js?nocache=" + Date.now());
        const scriptText = await response.text();

        const match = scriptText.match(/window\.APP_VERSION\s*=\s*["'](.+?)["']/);

        if(!match){
            openUpdateModal(
                "Έλεγχος για ενημερώσεις",
                "Δεν βρέθηκε αριθμός έκδοσης.",
                false
            );
            return;
        }

        const serverVersion = match[1];
        const currentVersion = window.APP_VERSION;

        if(serverVersion !== currentVersion){
            openUpdateModal(
                "Νέα έκδοση διαθέσιμη",
                "Υπάρχει νέα έκδοση της εφαρμογής.",
                true
            );
        }else{
            openUpdateModal(
                "Έλεγχος για ενημερώσεις",
                "Η εφαρμογή είναι ήδη ενημερωμένη.",
                false
            );
        }

    }catch(error){
        openUpdateModal(
            "Έλεγχος για ενημερώσεις",
            "Δεν ήταν δυνατός ο έλεγχος ενημερώσεων.",
            false
        );

        console.error(error);
    }
}

async function autoCheckForUpdate(){

    try{
        const response = await fetch("script.js?nocache=" + Date.now());
        const scriptText = await response.text();

        const match = scriptText.match(/window\.APP_VERSION\s*=\s*["'](.+?)["']/);
        if(!match) return;

        const serverVersion = match[1];
        const currentVersion = window.APP_VERSION;

        if(serverVersion !== currentVersion){
            const ok = confirm(
                "Υπάρχει νέα έκδοση της εφαρμογής. Να γίνει ενημέρωση;"
            );

            if(ok){
                window.location.href =
                    window.location.pathname +
                    "?update=" + Date.now();
            }
        }

    }catch(error){
        log("Auto update check skipped", error);
    }
}

window.addEventListener("load", () => {
    setTimeout(() => {
        autoCheckForUpdate();
    }, 2500);
});

function openUpdateModal(title, text, hasUpdate){
    const modal = document.getElementById("update-modal");
    const titleEl = document.getElementById("update-modal-title");
    const textEl = document.getElementById("update-modal-text");
    const actionBtn = document.getElementById("update-modal-action");

    if(!modal || !titleEl || !textEl || !actionBtn) return;

    titleEl.textContent = title;
    textEl.textContent = text;

    if(hasUpdate){
        actionBtn.style.display = "block";
        actionBtn.onclick = function(){
            // Καθάρισε Service Worker και cache πριν το update
            if('serviceWorker' in navigator){
                navigator.serviceWorker.getRegistrations().then(regs => {
                    for(const reg of regs) reg.unregister();
                });
            }
            if('caches' in window){
                caches.keys().then(keys => {
                    for(const key of keys) caches.delete(key);
                });
            }
            setTimeout(() => {
                window.location.href =
                    window.location.pathname +
                    "?update=" + Date.now();
            }, 300);
        };
    }else{
        actionBtn.style.display = "none";
        actionBtn.onclick = null;
    }

    modal.style.display = "flex";
}

function closeUpdateModal(){
    const modal = document.getElementById("update-modal");
    if(modal){
        modal.style.display = "none";
    }
}

function openAppInfoModal(){

    const modal = document.getElementById("app-info-modal");

    if(!modal) return;

    // Version
    const versionEl =
        document.getElementById("app-version-info");

    if(versionEl){
        versionEl.textContent =
            "v" + window.APP_VERSION;
    }

    // Device
    const deviceEl =
        document.getElementById("app-device-info");

    if(deviceEl){

        if(/Android/i.test(navigator.userAgent)){
            deviceEl.textContent = "Android";
        }
        else if(/iPhone|iPad/i.test(navigator.userAgent)){
            deviceEl.textContent = "iOS";
        }
        else{
            deviceEl.textContent = "Desktop";
        }

    }

    // Browser
    const browserEl =
        document.getElementById("app-browser-info");

    if(browserEl){

        if(navigator.userAgent.includes("Chrome")){
            browserEl.textContent = "Chrome";
        }
        else if(navigator.userAgent.includes("Firefox")){
            browserEl.textContent = "Firefox";
        }
        else{
            browserEl.textContent = "Άλλος";
        }

    }

    // Installed status
    const installEl =
        document.getElementById("app-install-info");

    if(installEl){

        if(
            window.matchMedia("(display-mode: standalone)").matches
        ){
            installEl.textContent =
                "Εγκατεστημένη στο κινητό";
        }
        else{
            installEl.textContent =
                "Άνοιγμα μέσω browser";
        }

    }

    modal.style.display = "flex";

}

function closeAppInfoModal(){

    const modal =
        document.getElementById("app-info-modal");

    if(modal){
        modal.style.display = "none";
    }

}

function preloadSelectedFlags(leftFlag, rightFlag){

    return Promise.all([
        preloadImage(leftFlag),
        preloadImage(rightFlag)
    ]);

}

function preloadImage(url){

    return new Promise(resolve => {

        const img = new Image();

        img.onload = resolve;
        img.onerror = resolve;

        img.src = url;

    });

}

async function startFlagShuffle(leftFlag, rightFlag){

    const leftImg =
        document.getElementById("find-country-left-flag");

    const rightImg =
        document.getElementById("find-country-right-flag");

    if(!leftImg || !rightImg) return;

    const randomFlags =
        Object.values(findCountryData)
        .map(c => c.flag);

    let cycles = 12; // λίγο μεγαλύτερο για πιο ωραίο effect

    const interval = setInterval(() => {

        const r1 =
            randomFlags[Math.floor(Math.random()*randomFlags.length)];

        const r2 =
            randomFlags[Math.floor(Math.random()*randomFlags.length)];

        leftImg.src = r1;
        rightImg.src = r2;

        // 🔊 shuffle tick (όχι κάθε frame — πιο smooth)
        if(cycles % 2 === 0){
            playFlagShuffleTick();
        }

        cycles--;

        if(cycles <= 0){

            clearInterval(interval);

            // τελικές σημαίες
            leftImg.src = leftFlag;
            rightImg.src = rightFlag;

            // 🔔 shuffle stop sound
            playFlagShuffleStop();

        }

    }, 85); // 80 → 85 = πιο φυσικός ρυθμός

}

function enableMenuClickSounds(){

    document.addEventListener("click", (e) => {

        const btn = e.target.closest("button");

        if(!btn) return;

        // Μην παίζει ήχο σε disabled buttons
        if(btn.disabled) return;

        // Μην παίζει μέσα στο gameplay answers
        if(btn.closest("#options")) return;

        // Παίξε click
        if(typeof playClick === "function"){
            playClick();
        }

    });

}

// ===================QUESTION PICKERS=====================//

function getPlayedQuestionIds(key){
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function savePlayedQuestionIds(key, ids){
    localStorage.setItem(key, JSON.stringify(ids));
}

function pickFreshQuestions(pool, count, key){

    let playedIds = getPlayedQuestionIds(key);

    let freshPool = pool.filter(q => !playedIds.includes(q.id));

    if(freshPool.length < count){
        playedIds = [];
        freshPool = [...pool];
    }

    const picked = shuffleArray(freshPool).slice(0, count);

    const newPlayedIds = [
        ...playedIds,
        ...picked.map(q => q.id)
    ];

    savePlayedQuestionIds(key, [...new Set(newPlayedIds)]);

    return picked;
}


//===================QUESTION PICKERS END=====================//

//===================DONATE FUNCTIONS=====================//

function openCoffeeModal(){

    playClick();

    const modal =
        document.getElementById("coffee-modal");

    if(modal){

        modal.style.display = "flex";

        requestAnimationFrame(() => {
            modal.classList.remove("is-hidden");
        });

    }

}

function closeCoffeeModal(){

    playClick();

    const modal =
        document.getElementById("coffee-modal");

    if(modal){

        modal.classList.add("is-hidden");

        // Περιμένει να τελειώσει το animation
        setTimeout(() => {

            modal.style.display = "none";

        }, 350); // ίδιο με CSS duration

    }

}

function openBuyMeACoffee(){
    playClick();

    window.open(
        "https://buymeacoffee.com/LectorNocturnus",
        "_blank",
        "noopener,noreferrer"
    );
}

function maybeShowCoffeeReminder(){

    let gamesPlayed =
        parseInt(
            localStorage.getItem("literaGamesPlayed") || "0",
            10
        );

    gamesPlayed++;

    localStorage.setItem(
        "literaGamesPlayed",
        gamesPlayed
    );

    log("Games played:", gamesPlayed);

    // Κάθε 12 παρτίδες
    if(gamesPlayed > 0 && gamesPlayed % 10 === 0){

        setTimeout(() => {

            openCoffeeModal();

        }, 2500);

    }

}

function loadWeeklyChallenge(callback) {
    Papa.parse(weeklySheetURL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const today = new Date();
            today.setHours(0,0,0,0);

            // Αποθήκευσε όλα τα challenges για το leaderboard (preload)
            wcAllChallenges = results.data.filter(r => r.week_id && r.active_from);

            // Βρες το active challenge — το πιο πρόσφατο που έχει active_from <= σήμερα
            let active = null;
            results.data.forEach(row => {
                if (!row.week_id || !row.active_from) return;
                const from = new Date(row.active_from);
                from.setHours(0,0,0,0);
                if (from <= today) {
                    if (!active || from > new Date(active.active_from)) {
                        active = row;
                    }
                }
            });

            currentWeeklyChallenge = active;
            if (callback) callback(active);
        },
        error: function(err) {
            console.error('Weekly sheet error:', err);
            if (callback) callback(null);
        }
    });
}

function openWeeklyChallengeIntro() {
    const modal = document.getElementById('weekly-challenge-intro-modal');
    if (!modal) return;
    document.getElementById('wc-loading').style.display = 'block';
    document.getElementById('wc-intro-content').style.display = 'none';
    document.getElementById('wc-start-btn').style.display = 'none';
    modal.style.display = 'flex';

    // Αν είναι ήδη preloaded χρησιμοποίησε το αμέσως
    if (currentWeeklyChallenge) {
        populateWCIntroModal(currentWeeklyChallenge);
    } else {
        loadWeeklyChallenge(function(challenge) {
            currentWeeklyChallenge = challenge;
            populateWCIntroModal(challenge);
        });
    }
}

function populateWCIntroModal(challenge) {
    document.getElementById('wc-loading').style.display = 'none';

    if (!challenge) {
        document.getElementById('wc-intro-content').style.display = 'block';
        document.getElementById('wc-intro-type').textContent = 'Δεν βρέθηκε ενεργό challenge.';
        return;
    }

    // Ημερομηνία
    const from = new Date(challenge.active_from);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    const fmt = d => d.toLocaleDateString('el-GR', {day:'numeric', month:'long'});
    const dateEl = document.getElementById('wc-intro-date-text');
    if (dateEl) dateEl.textContent = fmt(from) + ' - ' + fmt(to) + ' ' + to.getFullYear();

    const promptEl = document.getElementById('wc-intro-prompt');
    if (promptEl) promptEl.textContent = challenge.prompt || '';

    const clue0El = document.getElementById('wc-intro-clue0');
    if (clue0El) clue0El.textContent = challenge.clue_0 || '';

    document.getElementById('wc-intro-content').style.display = 'block';

    // Φόρτωσε Firebase state
    loadWCPlayerState().then(() => {
        const attemptsEl = document.getElementById('wc-attempts-left');
        const startBtn = document.getElementById('wc-start-btn');
        const auth = window.firebaseAuth;
        const firebaseUser = auth && auth.currentUser ? auth.currentUser : null;

        if (firebaseUser && currentWeeklyChallenge) {
            window.firebaseGetDoc(
                window.firebaseDoc(window.firebaseDB, 'players', firebaseUser.uid, 'weekly_challenges', String(currentWeeklyChallenge.week_id))
            ).then(snap => {
                if (snap.exists() && snap.data().solved) {
                    if (attemptsEl) { attemptsEl.textContent = '✓ Έχετε λύσει τον γρίφο!'; attemptsEl.style.color = '#2ecc71'; }
                    if (startBtn) startBtn.style.display = 'none';
                } else {
                    if (attemptsEl) {
                        attemptsEl.textContent = wcAttemptsLeft <= 0 ? '✕ Δεν υπάρχουν άλλες προσπάθειες!' : `Απομένουν ${wcAttemptsLeft} από 4 προσπάθειες!`;
                        attemptsEl.style.color = '#e74c3c';
                    }
                    if (startBtn) startBtn.style.display = wcAttemptsLeft <= 0 ? 'none' : 'block';
                    // Εμφάνισε game screen από πίσω χωρίς να αλλάξει το routing
                    if (wcAttemptsLeft > 0) {
                        document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
                        const gameScreen = document.getElementById('weekly-challenge-game-screen');
                        if (gameScreen) gameScreen.style.display = 'block';
                    }
                }
            });
        } else {
            if (attemptsEl) attemptsEl.textContent = `Απομένουν ${wcAttemptsLeft} από 4 προσπάθειες!`;
            if (startBtn) startBtn.style.display = 'block';
        }
    });
}

function closeWeeklyChallengeIntro() {
    const modal = document.getElementById('weekly-challenge-intro-modal');
    if (modal) modal.style.display = 'none';

    // Άνοιξε αμέσως το game screen
    renderWeeklyClues();
    updateWCHeaderSubtitle();
    renderWCAnswersList();
    goToScreen('weekly-challenge-game-screen');

    // Αν έχει λυθεί → δείξε solved state (async στο παρασκήνιο)
    if (wcStateLoaded && currentWeeklyChallenge) {
        const auth = window.firebaseAuth;
        const firebaseUser = auth && auth.currentUser ? auth.currentUser : null;
        if (firebaseUser) {
            window.firebaseGetDoc(
                window.firebaseDoc(window.firebaseDB, 'players', firebaseUser.uid, 'weekly_challenges', String(currentWeeklyChallenge.week_id))
            ).then(snap => {
                if (snap.exists() && snap.data().solved) {
                    requestAnimationFrame(() => { showWCSolvedState(); unlockAllClues(); });
                }
            });
            return;
        }
    }
    goToScreen('mode-screen');
}

let wcUnlockedClues = 0;
let wcAttemptsLeft = 4;

function updateWCAttemptsDisplay() {
    const el = document.getElementById('wc-attempts-display');
    if (!el) return;

    if (wcAttemptsLeft <= 0) {
        el.parentElement.style.color = '#e74c3c';
        el.parentElement.innerHTML = '<strong style="color:#e74c3c;">Δεν υπάρχουν άλλες προσπάθειες!</strong>';
    } else {
        el.textContent = wcAttemptsLeft;
    }

    const input = document.getElementById('wc-answer-input');
    const btn = document.querySelector('.menu-btn.btn-green[onclick="submitWeeklyChallengeAnswer()"]');
    if (wcAttemptsLeft <= 0) {
        if (input) { input.disabled = true; input.placeholder = 'Δεν υπάρχουν άλλες προσπάθειες.'; }
        if (btn) btn.disabled = true;
    } else {
        if (input) { input.disabled = false; input.placeholder = 'Πληκτρολόγησε την απάντηση...'; }
        if (btn) btn.disabled = false;
    }
}

function openWeeklyChallengeGame() {
    // Κλείσε μόνο το modal χωρίς routing
    const modal = document.getElementById('weekly-challenge-intro-modal');
    if (modal) modal.style.display = 'none';

    if (!currentWeeklyChallenge) return;

    // Καθάρισε UI
    const input = document.getElementById('wc-answer-input');
    if (input) input.value = '';
    const list = document.getElementById('wc-answers-list');
    if (list) list.innerHTML = '';
    const history = document.getElementById('wc-answers-history');
    if (history) history.style.display = 'none';

    // Φόρτωσε από Firebase
    loadWCPlayerState().then(() => {
        const list2 = document.getElementById('wc-answers-list');
        if (list2) list2.innerHTML = '';
        const history2 = document.getElementById('wc-answers-history');
        if (history2) history2.style.display = 'none';

        renderWeeklyClues();
        updateWCAttemptsDisplay();
        updateWCHeaderSubtitle();
        renderWCAnswersList();
        goToScreen('weekly-challenge-game-screen');
    });
}

// Πόσα clues είναι διαθέσιμα βάσει ημερών από active_from (1 ανά ημέρα, min 1)
function getWCAvailableClueCount() {
    if (!currentWeeklyChallenge || !currentWeeklyChallenge.active_from) return 1;
    const fromStr = String(currentWeeklyChallenge.active_from).trim().slice(0, 10);
    const [fy, fm, fd] = fromStr.split('-').map(Number);
    const from = new Date(fy, fm - 1, fd);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysPassed = Math.floor((today - from) / 86400000);
    let available = daysPassed + 1;
    let maxIdx = 0;
    for (let i = 0; i <= 7; i++) {
        if (currentWeeklyChallenge[`clue_${i}`]) maxIdx = i; else break;
    }
    return Math.min(available, maxIdx);
}

function renderWeeklyClues() {
    const container = document.getElementById('wc-clues-container');
    if (!container || !currentWeeklyChallenge) return;
    container.innerHTML = '';

    const ch = currentWeeklyChallenge;
    const availableClues = getWCAvailableClueCount();

    // Εμφάνισε clue_0 + όσα έχει ξεκλειδώσει ο παίκτης (ή λυθεί)
    for (let i = 0; i <= wcUnlockedClues; i++) {
        const clueKey = `clue_${i}`;
        if (!ch[clueKey]) break;

        const label = i === 0 ? 'Αρχικό στοιχείο' : `${i}ο στοιχείο`;

        const card = document.createElement('div');
        card.style.cssText = `
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 12px;
            padding: 12px 14px;
            margin-bottom: 10px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
        `;

        const img = document.createElement('img');
        img.src = i === 0
            ? 'assets/weekly_challenge/Clue_0.webp'
            : 'assets/weekly_challenge/Weekly_Challenge.webp';
        img.style.cssText = 'width:40px; height:40px; object-fit:contain; flex-shrink:0;';

        const text = document.createElement('div');
        text.innerHTML = `<div style="font-size:0.7rem; color:var(--gold); font-weight:bold; margin-bottom:4px;">${label}</div>
                          <div style="font-size:0.88rem; opacity:0.85; line-height:1.4;">${ch[clueKey]}</div>`;

        card.appendChild(img);
        card.appendChild(text);
        container.appendChild(card);
    }

    // Δείξε το + κουμπί μόνο αν υπάρχει επόμενο clue ΚΑΙ είναι διαθέσιμο σήμερα
    const nextKey = `clue_${wcUnlockedClues + 1}`;
    const unlockSection = document.getElementById('wc-unlock-section');
    const unlockLockedMsg = document.getElementById('wc-unlock-locked-msg');
    if (unlockSection) {
        const maxToday = getMaxAvailableClueToday();
        const nextExists = !!ch[nextKey];
        const nextAvailableToday = (wcUnlockedClues + 1) <= maxToday;

        if(nextExists && nextAvailableToday){
            unlockSection.style.display = 'block';
            if(unlockLockedMsg) unlockLockedMsg.style.display = 'none';
        } else if(nextExists && !nextAvailableToday){
            unlockSection.style.display = 'none';
            if(unlockLockedMsg){
                unlockLockedMsg.style.display = 'block';
                unlockLockedMsg.textContent = '🔒 Το επόμενο στοιχείο θα είναι διαθέσιμο για αγορά αύριο!';
            }
        } else {
            unlockSection.style.display = 'none';
            if(unlockLockedMsg) unlockLockedMsg.style.display = 'none';
        }
    }
}


function updateWCHeaderSubtitle() {
    const navSubtitle = document.getElementById('global-nav-subtitle');
    if (!navSubtitle) return;
    const pts = 700 - (wcUnlockedClues * 50);
    const perg = 350 - (wcUnlockedClues * 25);
    navSubtitle.innerHTML = `<img src='assets/rank_goals/Points.webp' style='width:16px;height:16px;vertical-align:middle;'> ${pts} pts · <img src='assets/rank_goals/Pergamenas.webp' style='width:16px;height:16px;vertical-align:middle;'> ${perg} περγαμηνές διαθέσιμα`;
    navSubtitle.style.display = 'block';
}

function getMaxAvailableClueToday(){
    if(!currentWeeklyChallenge || !currentWeeklyChallenge.active_from) return 0;

    const fromStr = String(currentWeeklyChallenge.active_from).trim().slice(0, 10);
    const [fy, fm, fd] = fromStr.split('-').map(Number);
    const activeFrom = new Date(fy, fm - 1, fd);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const daysPassed = Math.floor((today - activeFrom) / (1000 * 60 * 60 * 24));
    const maxClue = Math.min(Math.max(daysPassed + 1, 0), 7);

    return maxClue;
}

function unlockNextClue() {
    const maxToday = getMaxAvailableClueToday();
    if(wcUnlockedClues + 1 > maxToday){
        return;
    }
    wcUnlockedClues++;
    saveWCState();
    renderWeeklyClues();
    updateWCHeaderSubtitle();
}

let wcAnswersHistory = [];
let wcDocKey = null;
let wcStateLoaded = false;

async function loadWCPlayerState() {
    if (!currentWeeklyChallenge) return;
    if (wcStateLoaded && wcDocKey === String(currentWeeklyChallenge.week_id)) return;

    const auth = window.firebaseAuth;
    const firebaseUser = auth && auth.currentUser ? auth.currentUser : null;
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const weekId = currentWeeklyChallenge.week_id;
    wcDocKey = String(weekId);

    if (!window.firebaseDB || !window.firebaseDoc || !window.firebaseGetDoc) return;

    try {
        const db = window.firebaseDB;
        const docRef = window.firebaseDoc(db, 'players', uid, 'weekly_challenges', String(weekId));
        const snap = await window.firebaseGetDoc(docRef);

        if (snap.exists()) {
            const data = snap.data();
            wcAttemptsLeft = data.attempts_left !== undefined ? data.attempts_left : 4;
            wcUnlockedClues = data.unlocked_clues || 0;
            wcAnswersHistory = (data.wrong_answers || []).map(a => ({ answer: a, correct: false }));
            // Αν έχει λυθεί, εμφάνισε banner
            if (data.solved) {
                requestAnimationFrame(() => {
                    showWCSolvedState();
                    unlockAllClues();
                });
            } else if (data.attempts_left === 0) {
                requestAnimationFrame(() => showWCBlockedBanner());
            }
        } else {
            wcAttemptsLeft = 4;
            wcUnlockedClues = 0;
            wcAnswersHistory = [];
            await window.firebaseSetDoc(
                window.firebaseDoc(db, 'players', uid, 'weekly_challenges', String(weekId)), {
                week_id: weekId,
                attempts_left: 4,
                unlocked_clues: 0,
                wrong_answers: [],
                solved: false
            });
        }
        wcStateLoaded = true;
    } catch(e) {
        console.error('WC Firebase load error:', e);
    }
}

async function saveWCState() {
    const auth = window.firebaseAuth;
    const firebaseUser = auth && auth.currentUser ? auth.currentUser : null;
    if (!firebaseUser || !wcDocKey || !window.firebaseDB || !window.firebaseDoc || !window.firebaseSetDoc) return;
    const uid = firebaseUser.uid;
    try {
        const db = window.firebaseDB;
        await window.firebaseSetDoc(
            window.firebaseDoc(db, 'players', uid, 'weekly_challenges', String(wcDocKey)), {
            attempts_left: wcAttemptsLeft,
            unlocked_clues: wcUnlockedClues,
            wrong_answers: wcAnswersHistory.filter(a => !a.correct).map(a => a.answer)
        }, { merge: true });
    } catch(e) {
        console.error('WC Firebase save error:', e);
    }
}

function renderWCAnswersList() {
    const list = document.getElementById('wc-answers-list');
    const history = document.getElementById('wc-answers-history');
    if (!list) return;
    list.innerHTML = '';
    if (wcAnswersHistory.length === 0) {
        if (history) history.style.display = 'none';
        return;
    }
    if (history) history.style.display = 'block';
    wcAnswersHistory.forEach(a => {
        const item = document.createElement('p');
        item.style.cssText = `font-size:0.85rem; margin:4px 0; color:${a.correct ? '#2ecc71' : '#e74c3c'};`;
        item.textContent = `${a.correct ? '✓' : '✗'} ${a.answer || a}`;
        list.appendChild(item);
    });
}

function addToWCHistory(answer, correct) {
    wcAnswersHistory.push({ answer, correct });
    renderWCAnswersList();
}

async function submitWeeklyChallengeAnswer() {
    const input = document.getElementById('wc-answer-input');
    if (!input || !currentWeeklyChallenge) return;
    const answer = input.value.trim();
    if (!answer) return;

    const accepted = (currentWeeklyChallenge.accepted_answers || '')
        .split(';').map(a => a.trim().toLowerCase()).filter(Boolean);

    if (accepted.includes(answer.toLowerCase())) {
        addToWCHistory(answer, true);

        const attemptsUsed = 4 - wcAttemptsLeft;
        const pts = 700 - (wcUnlockedClues * 50);
        const perg = 350 - (wcUnlockedClues * 25);

        // Εμφάνισε UI αμέσως
        showWCSolvedState();
        unlockAllClues();
        addPergamena(perg);

        const ptsEl = document.getElementById('wc-correct-pts');
        const pergEl = document.getElementById('wc-correct-perg');
        if (ptsEl) ptsEl.textContent = pts;
        if (pergEl) pergEl.textContent = perg;
        document.getElementById('wc-correct-modal').style.display = 'flex';
        playWCSuccess();

        // Firebase saves στο παρασκήνιο
        const auth = window.firebaseAuth;
        const firebaseUser = auth && auth.currentUser ? auth.currentUser : null;
        if (firebaseUser) {
            const uid = firebaseUser.uid;
            const weekId = currentWeeklyChallenge.week_id;
            window.firebaseSetDoc(
                window.firebaseDoc(window.firebaseDB, 'players', uid, 'weekly_challenges', String(weekId)), {
                solved: true,
                solved_at: new Date().toISOString(),
                attempts_used: attemptsUsed,
                unlocked_clues: wcUnlockedClues,
                pts_earned: pts,
                perg_earned: perg,
                username: playerProfile.username || '',
                week_id: weekId
            }, { merge: true }).catch(e => console.error('WC save error:', e));

            window.firebaseSetDoc(
                window.firebaseDoc(window.firebaseDB, 'wc_leaderboard', String(weekId), 'scores', uid), {
                username: playerProfile.username || '',
                unlocked_clues: wcUnlockedClues,
                attempts_used: attemptsUsed,
                solved_at: new Date().toISOString()
            }, { merge: true }).catch(e => console.error('WC leaderboard save error:', e));
        }

        // Score/stats στο παρασκήνιο
        const prevMode = currentGameMode;
        currentGameMode = 'Weekly-Challenge';
        saveScore(pts, 'Weekly', 'Weekly').catch(()=>{});
        updatePantheonPlayerStats(pts, 0, 0, 0, 0).catch(()=>{});
        currentGameMode = prevMode;

    } else {
        wcAttemptsLeft = Math.max(0, wcAttemptsLeft - 1);
        updateWCAttemptsDisplay();
        addToWCHistory(answer, false);
        playWCFail();
        await saveWCState();
        const remaining = document.getElementById('wc-wrong-remaining');
        if (remaining) remaining.textContent = wcAttemptsLeft;
        const warningEl = document.getElementById('wc-wrong-warning');
        if (warningEl) warningEl.style.display = wcAttemptsLeft === 1 ? 'block' : 'none';
        document.getElementById('wc-wrong-modal').style.display = 'flex';
        if (wcAttemptsLeft === 0) showWCBlockedBanner();
    }
    input.value = '';
}

function closeWCCorrectModal() {
    document.getElementById('wc-correct-modal').style.display = 'none';
    // Μην πηγαίνεις πουθενά - μείνε στη game screen
}

function unlockAllClues() {
    if (!currentWeeklyChallenge) return;
    // Βρες πόσα clues υπάρχουν
    let maxClue = 0;
    for (let i = 0; i <= 7; i++) {
        if (currentWeeklyChallenge[`clue_${i}`]) maxClue = i;
        else break;
    }
    wcUnlockedClues = maxClue;
    renderWeeklyClues();
}

function closeWCWrongModal() {
    document.getElementById('wc-wrong-modal').style.display = 'none';
}

function showWCSolvedState() {
    const el = document.getElementById('wc-attempts-display');
    if (el && el.parentElement) {
        const correctAnswer = currentWeeklyChallenge
            ? (currentWeeklyChallenge.answer || currentWeeklyChallenge.accepted_answers?.split(';')[0]?.trim() || '')
            : '';
        el.parentElement.innerHTML = `
            <strong style="color:#2ecc71; font-size:1rem;">✓ Ο γρίφος λύθηκε!</strong><br>
            <span style="font-size:0.85rem; opacity:0.8;">Η σωστή απάντηση είναι "<em>${correctAnswer}</em>"</span>
        `;
    }
    const inputEl = document.getElementById('wc-answer-input');
    const solvedBanner = document.getElementById('wc-solved-banner');
    const submitBtn = document.querySelector('.menu-btn.btn-green[onclick="submitWeeklyChallengeAnswer()"]');
    if (inputEl) inputEl.style.display = 'none';
    if (solvedBanner) solvedBanner.style.display = 'block';
    if (submitBtn) submitBtn.style.display = 'none';
}

function showWCBlockedBanner() {
    const el = document.getElementById('wc-attempts-display');
    if (el && el.parentElement) {
        el.parentElement.innerHTML = '<strong style="color:#e74c3c;">✕ Δεν υπάρχουν άλλες προσπάθειες!</strong>';
    }
    const inputEl = document.getElementById('wc-answer-input');
    const blockedBanner = document.getElementById('wc-blocked-banner');
    const submitBtn = document.querySelector('.menu-btn.btn-green[onclick="submitWeeklyChallengeAnswer()"]');
    if (inputEl) inputEl.style.display = 'none';
    if (blockedBanner) blockedBanner.style.display = 'block';
    if (submitBtn) submitBtn.style.display = 'none';
}

// ===== WEEKLY CHALLENGE SCORES — custom modal picker =====

let wcAllChallenges = [];
let wcSelectedYear  = null;
let wcSelectedMonth = null;
let wcSelectedWeekId = null;
let wcPickerOpen = null; // 'year' | 'month' | 'week' | null
const wcMonthNames = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος',
                      'Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος'];
const wcScoresCache = {}; // { [week_id]: results[] }

function initWCScoresScreen() {
    wcPickerOpen = null;
    const existing = document.getElementById('wc-picker-dropdown');
    if (existing) existing.remove();

    const list = document.getElementById('wc-scores-list');

    if (wcAllChallenges.length > 0) {
        // Ήδη preloaded — default στην τρέχουσα εβδομάδα
        wcInitPickerDefaults();
        wcRenderButtons();
        loadWCScores();
        return;
    }

    // Fallback: φόρτωσε το sheet τώρα
    if (list) list.innerHTML = '<p style="text-align:center; opacity:0.5; font-size:0.85rem;">Φόρτωση...</p>';
    Papa.parse(weeklySheetURL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            wcAllChallenges = results.data.filter(r => r.week_id && r.active_from);
            wcInitPickerDefaults();
            wcRenderButtons();
            loadWCScores();
        },
        error: function() {
            if (list) list.innerHTML = '<p style="text-align:center; opacity:0.5;">Σφάλμα φόρτωσης.</p>';
        }
    });
}

function wcInitPickerDefaults() {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Μόνο εβδομάδες που έχουν ήδη ξεκινήσει
    const active = wcAllChallenges
        .filter(r => { const d = new Date(r.active_from); d.setHours(0,0,0,0); return d <= today; })
        .sort((a, b) => new Date(b.active_from) - new Date(a.active_from));

    if (!active.length) return;
    const latest = active[0];
    const d = new Date(latest.active_from);
    wcSelectedYear   = d.getFullYear();
    wcSelectedMonth  = d.getMonth();
    wcSelectedWeekId = latest.week_id;
}

function wcRenderButtons() {
    let weekLabel = '—';
    if (wcSelectedWeekId) {
        const row = wcAllChallenges.find(r => r.week_id === wcSelectedWeekId);
        if (row) {
            weekLabel = `Εβδομάδα ${row.week_number || row.week_id}`;
        }
    }
    const lblYear  = document.getElementById('wc-btn-year-label');
    const lblMonth = document.getElementById('wc-btn-month-label');
    const lblWeek  = document.getElementById('wc-btn-week-label');
    if (lblYear)  lblYear.textContent  = wcSelectedYear  !== null ? String(wcSelectedYear)        : '—';
    if (lblMonth) lblMonth.textContent = wcSelectedMonth !== null ? wcMonthNames[wcSelectedMonth] : '—';
    if (lblWeek)  lblWeek.textContent  = weekLabel;

    // Light mode button colors
    const isLight = document.body.classList.contains('light-theme-enabled');
    const btnYear  = document.getElementById('wc-btn-year');
    const btnMonth = document.getElementById('wc-btn-month');
    const btnWeek  = document.getElementById('wc-btn-week');
    if(isLight){
        if(btnYear)  btnYear.style.background  = 'linear-gradient(180deg,#c39bd3,#9b59b6)';
        if(btnMonth) btnMonth.style.background = 'linear-gradient(180deg,#7fb3d3,#3498db)';
        if(btnWeek)  btnWeek.style.background  = 'linear-gradient(180deg,#58d68d,#27ae60)';
    }
}

function wcTogglePicker(type) {
    // Κλείσε αν ήταν ήδη ανοιχτό το ίδιο
    if (wcPickerOpen === type) {
        wcClosePicker();
        return;
    }
    wcPickerOpen = type;

    const existing = document.getElementById('wc-picker-dropdown');
    if (existing) existing.remove();

    const fmt = d => `${d.getDate()}/${d.getMonth()+1}`;
    let items = [];

    if (type === 'year') {
        const years = [...new Set(wcAllChallenges.map(r =>
            new Date(r.active_from).getFullYear()))].sort((a,b) => b-a);
        items = years.map(y => ({ label: String(y), value: y, selected: y === wcSelectedYear }));

    } else if (type === 'month') {
        const months = [...new Set(
            wcAllChallenges
                .filter(r => new Date(r.active_from).getFullYear() === wcSelectedYear)
                .map(r => new Date(r.active_from).getMonth())
        )].sort((a,b) => b-a);
        items = months.map(m => ({ label: wcMonthNames[m], value: m, selected: m === wcSelectedMonth }));

    } else if (type === 'week') {
        const weeks = wcAllChallenges.filter(r => {
            const d = new Date(r.active_from);
            return d.getFullYear() === wcSelectedYear && d.getMonth() === wcSelectedMonth;
        });
        items = weeks.map(r => {
            return {
                label: `Εβδ. ${r.week_number || r.week_id}`,
                value: r.week_id,
                selected: r.week_id === wcSelectedWeekId
            };
        });
    }

    // Anchor: βρες το κουμπί
    const anchorId = { year: 'wc-btn-year', month: 'wc-btn-month', week: 'wc-btn-week' }[type];
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'wc-picker-dropdown';

    const isLight = document.body.classList.contains('light-theme-enabled');

    // Χρώματα ανά τύπο
    const typeColors = isLight ? {
        year:  { bg: '#f3eafc', border: 'rgba(155,89,182,0.3)', selectedBg: 'rgba(155,89,182,0.15)', selectedColor: '#6c3483', textColor: '#333' },
        month: { bg: '#eaf4fb', border: 'rgba(52,152,219,0.3)', selectedBg: 'rgba(52,152,219,0.15)', selectedColor: '#1f47b8', textColor: '#333' },
        week:  { bg: '#eafaf1', border: 'rgba(39,174,96,0.3)',  selectedBg: 'rgba(39,174,96,0.15)',  selectedColor: '#1e8449', textColor: '#333' }
    } : {
        year:  { bg: '#2d1a3e', border: 'rgba(155,89,182,0.5)', selectedBg: 'rgba(155,89,182,0.25)', selectedColor: '#c39bd3', textColor: 'rgba(255,255,255,0.82)' },
        month: { bg: '#0d1f3c', border: 'rgba(52,152,219,0.5)', selectedBg: 'rgba(52,152,219,0.25)', selectedColor: '#7fb3d3', textColor: 'rgba(255,255,255,0.82)' },
        week:  { bg: '#0d2b1a', border: 'rgba(39,174,96,0.5)',  selectedBg: 'rgba(39,174,96,0.25)',  selectedColor: '#58d68d', textColor: 'rgba(255,255,255,0.82)' }
    };
    const tc = typeColors[type];

    const anchorRect = anchor.getBoundingClientRect();

    dropdown.style.cssText = `
        position: fixed;
        top: ${anchorRect.bottom + 6}px;
        left: ${anchorRect.left}px;
        min-width: ${Math.max(anchorRect.width, 190)}px;
        z-index: 9999;
        background: ${tc.bg};
        border: 1px solid ${tc.border};
        border-radius: 16px;
        padding: 6px 0;
        box-shadow: 0 8px 32px rgba(0,0,0,0.7);
        overflow: hidden;
    `;

    items.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = `
            padding: 12px 20px;
            font-size: 0.88rem;
            color: ${item.selected ? tc.selectedColor : tc.textColor};
            background: ${item.selected ? tc.selectedBg : 'transparent'};
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        `;
        row.innerHTML = `<span>${item.label}</span>${item.selected ? `<span style="font-size:0.85rem; color:${tc.selectedColor};">✓</span>` : ''}`;
        row.addEventListener('pointerover', () => {
            if (!item.selected) row.style.background = 'rgba(255,255,255,0.07)';
        });
        row.addEventListener('pointerout', () => {
            if (!item.selected) row.style.background = 'transparent';
        });
        row.addEventListener('click', (e) => {
            e.stopPropagation();
            wcPickerSelect(type, item.value);
        });
        dropdown.appendChild(row);
    });

    document.body.appendChild(dropdown);

    // Κλείσιμο με click έξω
    setTimeout(() => {
        document.addEventListener('click', wcOutsideClick, { once: true });
    }, 10);
}

function wcOutsideClick(e) {
    const dd = document.getElementById('wc-picker-dropdown');
    if (dd && !dd.contains(e.target)) wcClosePicker();
}

function wcClosePicker() {
    if (typeof wcPickerOpen === 'undefined') return;
    wcPickerOpen = null;
    const dd = document.getElementById('wc-picker-dropdown');
    if (dd) dd.remove();
    document.removeEventListener('click', wcOutsideClick);
}

function wcPickerSelect(type, value) {
    wcClosePicker();
    if (type === 'year') {
        wcSelectedYear = value;
        // Reset month & week στο πρώτο διαθέσιμο
        const months = [...new Set(
            wcAllChallenges
                .filter(r => new Date(r.active_from).getFullYear() === value)
                .map(r => new Date(r.active_from).getMonth())
        )].sort((a,b) => b-a);
        wcSelectedMonth = months[0] ?? null;
        const weeks = wcAllChallenges.filter(r => {
            const d = new Date(r.active_from);
            return d.getFullYear() === wcSelectedYear && d.getMonth() === wcSelectedMonth;
        }).sort((a,b) => new Date(b.active_from) - new Date(a.active_from));
        wcSelectedWeekId = weeks[0]?.week_id ?? null;

    } else if (type === 'month') {
        wcSelectedMonth = value;
        // Reset week
        const weeks = wcAllChallenges.filter(r => {
            const d = new Date(r.active_from);
            return d.getFullYear() === wcSelectedYear && d.getMonth() === value;
        }).sort((a,b) => new Date(b.active_from) - new Date(a.active_from));
        wcSelectedWeekId = weeks[0]?.week_id ?? null;

    } else if (type === 'week') {
        wcSelectedWeekId = value;
    }

    wcRenderButtons();
    loadWCScores();
}

async function loadWCScores() {
    const list = document.getElementById('wc-scores-list');
    if (!list) return;

    const weekId = wcSelectedWeekId;
    if (!weekId) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5; font-size:0.85rem;">Δεν βρέθηκε εβδομάδα.</p>';
        return;
    }

    // Serve από cache αν υπάρχει
    if (wcScoresCache[weekId]) {
        wcRenderScoresList(wcScoresCache[weekId], list);
        return;
    }

    list.innerHTML = '<p style="text-align:center; opacity:0.5; font-size:0.85rem;">Φόρτωση...</p>';

    try {
        const db = window.firebaseDB;
        const scoresSnap = await window.firebaseGetDocs(
            window.firebaseCollection(db, 'wc_leaderboard', String(weekId), 'scores')
        );
        const results = [];

        scoresSnap.forEach(doc => {
            const data = doc.data();
            results.push({
                uid: doc.id,
                username: data.username || 'Unknown',
                unlocked_clues: data.unlocked_clues || 0,
                attempts_used: data.attempts_used || 0,
                solved_at: data.solved_at || ''
            });
        });

        results.sort((a, b) => {
            if (a.unlocked_clues !== b.unlocked_clues) return a.unlocked_clues - b.unlocked_clues;
            return a.attempts_used - b.attempts_used;
        });

        // Αποθήκευσε στο cache
        wcScoresCache[weekId] = results;
        wcRenderScoresList(results, list);

    } catch(e) {
        console.error('WC scores error:', e);
        list.innerHTML = '<p style="text-align:center; opacity:0.5;">Σφάλμα φόρτωσης.</p>';
    }
}

function wcRenderScoresList(results, list) {
    if (results.length === 0) {
        list.innerHTML = '<p style="text-align:center; opacity:0.5; font-size:0.85rem;">Κανείς δεν έχει λύσει τον γρίφο ακόμα!</p>';
        return;
    }
    list.innerHTML = '';
    results.slice(0, 20).forEach((r, i) => {
        const date = r.solved_at ? new Date(r.solved_at).toLocaleDateString('el-GR') : '-';
        const card = document.createElement('div');
        card.style.cssText = `
            display:flex; align-items:center; gap:10px;
            background:rgba(255,255,255,0.05); border-radius:12px;
            padding:10px 14px; margin-bottom:8px;
            border:1px solid rgba(255,255,255,0.1);
        `;
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <span style="font-size:1.1rem; min-width:32px;">${medal}</span>
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:0.9rem;">${r.username}</div>
                <div style="font-size:0.72rem; opacity:0.5;">${date}</div>
            </div>
            <div style="text-align:right; font-size:0.78rem; opacity:0.7;">
                📜 ${r.unlocked_clues} στοιχεία<br>
                🎯 ${r.attempts_used} προσπάθειες
            </div>
        `;
        card.addEventListener('click', () => openPantheonPlayerCard(r.uid));
        list.appendChild(card);
    });
}

//===================END OF WEEKLY CHALLENGE FUNCTIONS=====================//

window.addEventListener('resize', () => {
    const globalHeader = document.getElementById('global-header');
    if (globalHeader && globalHeader.style.display !== 'none') {
        updateGlobalHeaderPosition();
    }
    const navHeader = document.getElementById('global-nav-header');
    if (navHeader && navHeader.style.display !== 'none') {
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            const rect = appContainer.getBoundingClientRect();
            navHeader.style.top = rect.top + 'px';
            navHeader.style.left = rect.left + 'px';
            navHeader.style.width = rect.width + 'px';
        }
    }
    // Reposition avatar screen elements on resize
    const gameNavHeader = document.getElementById('game-nav-header');
    if (gameNavHeader && gameNavHeader.style.display !== 'none') {
        const appContainer2 = document.getElementById('app-container');
        if (appContainer2) {
            const rect = appContainer2.getBoundingClientRect();
            gameNavHeader.style.top = rect.top + 'px';
            gameNavHeader.style.left = rect.left + 'px';
            gameNavHeader.style.width = rect.width + 'px';
        }
    }
    const avatarHeader = document.querySelector('.avatar-header-fixed');
    const avatarScreen = document.getElementById('avatar-screen');
    if (avatarHeader && avatarScreen && avatarScreen.style.display !== 'none') {
        const appContainer2 = document.getElementById('app-container');
        if (appContainer2) {
            const rect = appContainer2.getBoundingClientRect();
            const avatarFooter = document.querySelector('.avatar-footer');
            const avatarWrapper = document.getElementById('avatar-categories-wrapper');
            avatarHeader.style.top = rect.top + 'px';
            avatarHeader.style.left = rect.left + 'px';
            avatarHeader.style.width = rect.width + 'px';
            if (avatarFooter) {
                avatarFooter.style.bottom = (window.innerHeight - rect.bottom) + 'px';
                avatarFooter.style.left = rect.left + 'px';
                avatarFooter.style.width = rect.width + 'px';
            }
            if (avatarWrapper && avatarFooter) {
                const headerBottom = rect.top + avatarHeader.offsetHeight;
                const footerTop = rect.bottom - avatarFooter.offsetHeight;
                avatarWrapper.style.top = headerBottom + 'px';
                avatarWrapper.style.left = rect.left + 'px';
                avatarWrapper.style.width = rect.width + 'px';
                avatarWrapper.style.height = (footerTop - headerBottom) + 'px';
            }
        }
    }
    updateFooterPadding();
});