(async function () {
    // =========================================================================
    // KONFIGURATION: TIMINGS & INTERVALLE (in Millisekunden)
    // =========================================================================
    
    // -- Interaktionen --
    const TIME_HOLD_RELEASE_DELAY = 500
    const TIME_INTRO_HINT_DELAY = 1000;
    const TIME_INTRO_HINT_DURATION = 1500;

    // -- Dauer des Blinzelns (Basis + Zufall)
    const TIME_BLINK_CLOSED_BASE = 100;
    const TIME_BLINK_CLOSED_VAR  = 100; 
    
    // Zeit zwischen zwei Blinzlern (Basis + Zufall)
    const TIME_BLINK_INTERVAL_BASE = 2000;
    const TIME_BLINK_INTERVAL_VAR  = 2000;

    // Dauer der Variantenanzeige (Basis + Zufall)
    const TIME_VARIANT_SHOW_BASE = 500;
    const TIME_VARIANT_SHOW_VAR  = 1000;
    
    // Zeit zwischen zwei Varianten (Basis + Zufall)
    const TIME_VARIANT_INTERVAL_BASE = 3000;
    const TIME_VARIANT_INTERVAL_VAR  = 3000;
    
    const TIME_VARIANT_RETRY = 10000;

    // -- System --
    const TIME_SLEEP_CHECK_INTERVAL = 60000;


    // =========================================================================
    // HAUPTLOGIK
    // =========================================================================

    const portrait = document.getElementById('frank-portrait');
    const overlay = document.querySelector('.blink-container');

    if (!portrait || !overlay) return;

    overlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    overlay.addEventListener('dragstart', function (e) { e.preventDefault(); });

    const urlParams = new URLSearchParams(window.location.search);

    const seasonImgDir = 'images/seasons/';
    const seasonImages = {
        away: `${seasonImgDir}clay_frank_backsoon.webp`,
        xmas: `${seasonImgDir}clay_frank_xmas.webp`,
        easter: `${seasonImgDir}clay_frank_easter.webp`,
        halloween: `${seasonImgDir}clay_frank_halloween.webp`,
        new_year: `${seasonImgDir}clay_frank_new_year.webp`,
        oktoberfest: `${seasonImgDir}clay_frank_oktoberfest.webp`,
        valentinesday: `${seasonImgDir}clay_frank_valentinesday.webp`
    };

    const forcedSeason =
        urlParams.has('away') ? 'away' :
        urlParams.has('xmas') ? 'xmas' :
        urlParams.has('easter') ? 'easter' :
        urlParams.has('halloween') ? 'halloween' :
        urlParams.has('newyear') ? 'new_year' :
        urlParams.has('oktoberfest') ? 'oktoberfest' :
        urlParams.has('valentinesday') ? 'valentinesday' :
        null;

    const forceSleep = urlParams.has('sleeping');
    const forceAwake = urlParams.has('awake');

    function addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    function inRangeInclusive(now, start, end) {
        return now >= start && now <= end;
    }

    function easterSundayDate(year) {
        const a = year % 19;
        const b = Math.floor(year / 100);
        const c = year % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31);
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month - 1, day, 12, 0, 0, 0);
    }

    function isSleepTime() {
        if (forceAwake) return false;
        if (forceSleep) return true;
        const hour = new Date().getHours();
        return hour >= 22 || hour < 6;
    }

    async function loadAwayRange() {
        try {
            const res = await fetch('/away.json', { cache: 'no-store' });
            if (!res.ok) return null;
            const data = await res.json();
            if (!data || typeof data.from !== 'string' || typeof data.to !== 'string') return null;
            const iso = /^\d{4}-\d{2}-\d{2}$/;
            if (!iso.test(data.from) || !iso.test(data.to)) return null;
            const from = new Date(data.from + 'T00:00:00');
            const to = new Date(data.to + 'T23:59:59.999');
            if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
            if (to < from) return null;
            return { from, to };
        } catch {
            return null;
        }
    }

    function isAwayActive(range) {
        if (!range) return false;
        const now = new Date();
        return now >= range.from && now <= range.to;
    }

    function initStaticImageMode(src) {
        const img = new Image();
        img.src = src;
        img.onload = function () {
            portrait.src = src;
        };
        portrait.src = src;
    }

    function initNormalMode() {
        const imgBase = 'images/clay_frank.webp';
        const imgClickSign = 'images/clay_frank_holding_click_sign.webp';
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

        let isIntro = true;
        let isShowingVariant = false;
        let isHolding = false;
        let areTimersRunning = false;
        
        let blinkTimeout = null;
        let variantTimeout = null;
        let endHoldTimeout = null;
        let hintTimeout = null;

        function cancelPendingEndHold() {
            if (endHoldTimeout) {
                clearTimeout(endHoldTimeout);
                endHoldTimeout = null;
            }
        }

        const baseImg = new Image();
        baseImg.src = imgBase;
        baseImg.onload = function () {
            [imgClosedEyes, imgSleeping, imgSleepingOpenEyes, ...imgVariants].forEach(src => {
                const img = new Image();
                img.src = src;
            });
        };

        function resetIdleTimers() {
            clearTimeout(blinkTimeout);
            clearTimeout(variantTimeout);
            areTimersRunning = false;
            blinkTimeout = null;
            variantTimeout = null;
            startIdleTimers();
        }

        function startIdleTimers() {
            if (areTimersRunning) return;
            areTimersRunning = true;

            blinkTimeout = setTimeout(blink, TIME_BLINK_INTERVAL_BASE + Math.random() * TIME_BLINK_INTERVAL_VAR);
            variantTimeout = setTimeout(showRandomVariant, TIME_VARIANT_INTERVAL_BASE + Math.random() * TIME_VARIANT_INTERVAL_VAR);
        }

        function showClickHint() {
            if (!isIntro || isSleepTime()) return;

            overlay.classList.add('highlight');
            portrait.src = imgClickSign;
            
            setTimeout(() => {
                overlay.classList.remove('highlight');
                if (!isSleepTime() && isIntro && !isHolding) {
                    portrait.src = imgBase;
                }
                isIntro = false;
                startIdleTimers();
            }, TIME_INTRO_HINT_DURATION);
        }

        hintTimeout = setTimeout(showClickHint, TIME_INTRO_HINT_DELAY);

        function updateSleepMode() {
            if (isHolding) return;
            if (isSleepTime()) {
                portrait.src = imgSleeping;
            } else if (!isShowingVariant) {
                portrait.src = imgBase;
            }
        }

        function blink() {
            if (isIntro || isSleepTime() || isShowingVariant || isHolding) {
                blinkTimeout = setTimeout(blink, TIME_BLINK_INTERVAL_BASE + Math.random() * TIME_BLINK_INTERVAL_VAR);
                return;
            }

            portrait.src = imgClosedEyes;

            setTimeout(() => {
                if (!isSleepTime() && !isShowingVariant && !isHolding) {
                    portrait.src = imgBase;
                }
                blinkTimeout = setTimeout(blink, TIME_BLINK_INTERVAL_BASE + Math.random() * TIME_BLINK_INTERVAL_VAR);
            }, TIME_BLINK_CLOSED_BASE + Math.random() * TIME_BLINK_CLOSED_VAR);
        }

        function showRandomVariant() {
            if (isIntro || isSleepTime() || isHolding) {
                variantTimeout = setTimeout(showRandomVariant, TIME_VARIANT_RETRY);
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
                variantTimeout = setTimeout(showRandomVariant, TIME_VARIANT_INTERVAL_BASE + Math.random() * TIME_VARIANT_INTERVAL_VAR);
            }, TIME_VARIANT_SHOW_BASE + Math.random() * TIME_VARIANT_SHOW_VAR);
        }

        function startHold(e) {
            e.preventDefault();
            
            if (hintTimeout) {
                clearTimeout(hintTimeout);
                hintTimeout = null;
            }

            cancelPendingEndHold();
            overlay.classList.add('highlight');

            isIntro = false;
            startIdleTimers();
            
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
            cancelPendingEndHold();

            endHoldTimeout = setTimeout(() => {
                endHoldTimeout = null;
                overlay.classList.remove('highlight');
                if (!isHolding) return;

                isHolding = false;
                isShowingVariant = false;

                if (isSleepTime()) {
                    portrait.src = imgSleeping;
                } else {
                    portrait.src = imgBase;
                }
                resetIdleTimers();
            }, TIME_HOLD_RELEASE_DELAY);
        }

        updateSleepMode();
        setInterval(updateSleepMode, TIME_SLEEP_CHECK_INTERVAL);
        
        overlay.addEventListener('mousedown', startHold);
        overlay.addEventListener('mouseup', endHold);
        overlay.addEventListener('mouseleave', endHold);
        overlay.addEventListener('touchstart', startHold, { passive: false });
        overlay.addEventListener('touchend', endHold);
        overlay.addEventListener('touchcancel', endHold);

        return function cleanup() {
            clearTimeout(blinkTimeout);
            clearTimeout(variantTimeout);
            if (hintTimeout) clearTimeout(hintTimeout);
            cancelPendingEndHold();
        };
    }

    if (forcedSeason) {
        initStaticImageMode(seasonImages[forcedSeason]);
        return;
    }
    if (forceAwake || forceSleep) {
        initNormalMode();
        return;
    }

    const awayRange = await loadAwayRange();
    if (isAwayActive(awayRange)) {
        initStaticImageMode(seasonImages.away);
        return;
    }

    (function () {
        const now = new Date();
        const y = now.getFullYear();

        if (now.getMonth() === 1 && now.getDate() === 14) {
            initStaticImageMode(seasonImages.valentinesday);
            return;
        }
        if (inRangeInclusive(now, new Date(y, 11, 15), new Date(y, 11, 27, 23, 59, 59, 999))) {
            initStaticImageMode(seasonImages.xmas);
            return;
        }
        if (inRangeInclusive(now, new Date(y, 8, 15), new Date(y, 9, 10, 23, 59, 59, 999))) {
            initStaticImageMode(seasonImages.oktoberfest);
            return;
        }
        if (inRangeInclusive(now, new Date(y, 9, 25), new Date(y, 10, 1, 23, 59, 59, 999))) {
            initStaticImageMode(seasonImages.halloween);
            return;
        }
        if (inRangeInclusive(now, new Date(y, 11, 31), new Date(y + 1, 0, 5, 23, 59, 59, 999)) ||
            inRangeInclusive(now, new Date(y - 1, 11, 31), new Date(y, 0, 5, 23, 59, 59, 999))) {
            initStaticImageMode(seasonImages.new_year);
            return;
        }
        const easterSunday = easterSundayDate(y);
        const easterStart = addDays(easterSunday, -7);
        easterStart.setHours(0, 0, 0, 0);
        const easterEnd = addDays(easterSunday, 1);
        easterEnd.setHours(23, 59, 59, 999);

        if (inRangeInclusive(now, easterStart, easterEnd)) {
            initStaticImageMode(seasonImages.easter);
            return;
        }

        initNormalMode();
    })();
})();