(function() {
    const portrait = document.getElementById('frank-portrait');

    // const overlay = document.querySelector('.portrait-overlay');
    const overlay = document.querySelector('.blink-container');
    // Kontextmenü und Draggen auf mobilen Geräten unterbinden
    overlay.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    overlay.addEventListener('dragstart', function(e) { e.preventDefault(); });

    // Alle Bilder (nur noch WebP)
    const imgBase = 'images/clay_frank.webp';
    const imgClosedEyes = 'images/clay_frank_closed_eyes.webp';
    const imgSleeping = 'images/clay_frank_sleeping.webp';
    const imgSleepingOpenEyes = 'images/clay_frank_sleeping_open_eyes.webp';
    const imgVariants = [
        'images/clay_frank_idea.webp',
        'images/clay_frank_looking_at_keyboard.webp',
        'images/clay_frank_smiling.webp',
        'images/clay_frank_sceptical.webp',
        'images/clay_frank_facepalm.webp',
        'images/clay_frank_grimacing_face.webp',
        'images/clay_frank_hands_up.webp',
        'images/clay_frank_rolling_eyes.webp',
        'images/clay_frank_winking_face.webp',
        'images/clay_frank_holding_mug.webp',
        'images/clay_frank_scratching_head.webp',
        'images/clay_frank_tilting_head.webp',
        'images/clay_frank_thinking.webp'
    ];
    // Basisbild zuerst vorladen
    const baseImg = new Image();
    baseImg.src = imgBase;
    baseImg.onload = function() {
        [imgClosedEyes, imgSleeping, ...imgVariants].forEach(src => {
            const img = new Image();
            img.src = src;
        });
    };
    let isShowingVariant = false;
    let isHolding = false;
    let blinkTimeout = null;
    let variantTimeout = null;
    // Query-Parameter für Testzwecke prüfen
    const urlParams = new URLSearchParams(window.location.search);
    const forceSleep = urlParams.has('sleeping');
    const forceAwake = urlParams.has('awake');
    function isSleepTime() {
        if (forceAwake) return false;
        if (forceSleep) return true;
        const hour = new Date().getHours();
        return hour >= 22 || hour < 6;
    }
    function blink() {
        if (isSleepTime() || isShowingVariant || isHolding) {
            blinkTimeout = setTimeout(blink, 2000 + Math.random() * 4000);
            return;
        }
        portrait.src = imgClosedEyes;
        setTimeout(() => {
            if (!isSleepTime() && !isShowingVariant && !isHolding) {
                portrait.src = imgBase;
            }
            blinkTimeout = setTimeout(blink, 2000 + Math.random() * 4000);
        }, 150 + Math.random() * 50);
    }
    function showRandomVariant() {
        if (isSleepTime() || isHolding) {
            variantTimeout = setTimeout(showRandomVariant, 10000);
            return;
        }
        isShowingVariant = true;
        const randomVariant = imgVariants[Math.floor(Math.random() * imgVariants.length)];
        portrait.src = randomVariant;
        setTimeout(() => {
            isShowingVariant = false;
            if (!isSleepTime() && !isHolding) {
                portrait.src = imgBase;
            }
            variantTimeout = setTimeout(showRandomVariant, 4000 + Math.random() * 4000);
        }, 1400 + Math.random() * 200);
    }
    function updateSleepMode() {
        if (isHolding) return;
        if (isSleepTime()) {
            portrait.src = imgSleeping;
        } else if (!isShowingVariant) {
            portrait.src = imgBase;
        }
    }
    updateSleepMode();
    setInterval(updateSleepMode, 60000);
    setTimeout(blink, 1000 + Math.random() * 2000);
    setTimeout(showRandomVariant, 3000 + Math.random() * 5000);
    function startHold(e) {
        e.preventDefault();
        if (isSleepTime()) {
            portrait.src = imgSleepingOpenEyes;
            isHolding = true;
            return;
        }
        isHolding = true;
        if (!isShowingVariant) {
            isShowingVariant = true;
            const randomVariant = imgVariants[Math.floor(Math.random() * imgVariants.length)];
            portrait.src = randomVariant;
        }
    }
    function endHold() {
        if (!isHolding) return;
        isHolding = false;
        isShowingVariant = false;
        if (isSleepTime()) {
            portrait.src = imgSleeping;
        } else {
            portrait.src = imgBase;
        }
    }
    overlay.addEventListener('mousedown', startHold);
    overlay.addEventListener('mouseup', endHold);
    overlay.addEventListener('mouseleave', endHold);
    overlay.addEventListener('touchstart', startHold, { passive: false });
    overlay.addEventListener('touchend', endHold);
    overlay.addEventListener('touchcancel', endHold);
})();
