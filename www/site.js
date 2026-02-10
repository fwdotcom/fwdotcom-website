(async function () {
	// Portrait-Bild (img-Element), dessen src wir austauschen
	const portrait = document.getElementById('frank-portrait');

	// Overlay/Container für Interaktionen (Klick/Touch); dient als „Hitbox“
	const overlay = document.querySelector('.blink-container');

	// Falls das Script auf einer Seite ohne Portrait/Overlay läuft, nichts tun
	if (!portrait || !overlay) return;

	// Kontextmenü und Draggen unterbinden (gegen „Bild speichern“, langes Draggen etc.)
	overlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
	overlay.addEventListener('dragstart', function (e) { e.preventDefault(); });

	// Query-Parameter für Test-/Override-Zwecke
	// ?sleeping erzwingt Schlafmodus, ?awake erzwingt Wachmodus
	// Seasons können per ?holidays, ?xmas, ?easter, ?halloween, ?newyear, ?oktoberfest erzwungen werden
	const urlParams = new URLSearchParams(window.location.search);

	// Season-Bilder liegen in images/seasons und werden über ein Mapping adressiert
	const seasonImgDir = 'images/seasons/';
	const seasonImages = {
		holidays: `${seasonImgDir}clay_frank_holidays.webp`,
		xmas: `${seasonImgDir}clay_frank_xmas.webp`,
		easter: `${seasonImgDir}clay_frank_easter.webp`,
		halloween: `${seasonImgDir}clay_frank_halloween.webp`,
		new_year: `${seasonImgDir}clay_frank_new_year.webp`,
		oktoberfest: `${seasonImgDir}clay_frank_oktoberfest.webp`
	};

	// Aus den möglichen Season-Query-Flags genau eine Season bestimmen (Priorität = Reihenfolge)
	// Hinweis: Query-Key "newyear" mappt auf season key "new_year"
	const forcedSeason =
		urlParams.has('holidays') ? 'holidays' :
		urlParams.has('xmas') ? 'xmas' :
		urlParams.has('easter') ? 'easter' :
		urlParams.has('halloween') ? 'halloween' :
		urlParams.has('newyear') ? 'new_year' :
		urlParams.has('oktoberfest') ? 'oktoberfest' :
		null;

	// Schlafmodus-Overrides (im Normalmodus relevant; im URL-Vorrang-Modus ebenfalls)
	const forceSleep = urlParams.has('sleeping');
	const forceAwake = urlParams.has('awake');

	// Datum um X Tage verschieben (liefert neues Date-Objekt)
	function addDays(date, days) {
		const d = new Date(date);
		d.setDate(d.getDate() + days);
		return d;
	}

	// Inklusive Range-Check (start und end zählen mit)
	function inRangeInclusive(now, start, end) {
		return now >= start && now <= end;
	}

	// Hilfsfunktion: Ostersonntag (Gregorianisch) berechnen (Meeus/Jones/Butcher)
	// Wir setzen bewusst 12:00 Uhr, um „Zeitkanten“ durch DST/Zeitzonen zu vermeiden
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
		const month = Math.floor((h + l - 7 * m + 114) / 31); // 3=March, 4=April
		const day = ((h + l - 7 * m + 114) % 31) + 1;
		return new Date(year, month - 1, day, 12, 0, 0, 0);
	}

	// Prüft Schlafmodus im Normalbetrieb
	function isSleepTime() {
		if (forceAwake) return false;
		if (forceSleep) return true;
		const hour = new Date().getHours();
		return hour >= 22 || hour < 6;
	}

	// holidays.json laden (liegt im Root: /holidays.json)
	// Format: { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }
	async function loadHolidaysRange() {
		try {
			const res = await fetch('/holidays.json', { cache: 'no-store' });
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

	// Prüft, ob Holiday-Range aktiv ist
	function isHolidayActive(range) {
		if (!range) return false;
		const now = new Date();
		return now >= range.from && now <= range.to;
	}

	// Initialisiert einen „Season-Mode“: nur ein Bild laden/zeigen, keine weitere Mechanik
	function initStaticImageMode(src) {
		const img = new Image();
		img.src = src;
		img.onload = function () {
			portrait.src = src;
		};
		portrait.src = src;
	}

	// Initialisiert den Normal-Mode: Preload, Sleep-Mode, Blink, Varianten, Interaktionen
	function initNormalMode() {
		// Highlight-Klasse kurz setzen (z.B. für Initial-Aufmerksamkeit)
		function showClickHint() {
			overlay.classList.add('highlight');
			if (!isSleepTime() && isIntro) {
				portrait.src = imgClickSign;
			}
			setTimeout(() => {
				overlay.classList.remove('highlight');
				if (!isSleepTime() && isIntro) {
					portrait.src = imgBase;
				}
				isIntro = false;
			}, 2000);
		}

		// ClickSign mit leichter Verzögerung zeigen
		setTimeout(showClickHint, 1000);
		
		// Standardbilder (Basis, Blinzeln, Schlafmodus)
		const imgBase = 'images/clay_frank.webp';
		const imgClickSign = 'images/clay_frank_holding_click_sign.webp';
		const imgClosedEyes = 'images/clay_frank_closed_eyes.webp';
		const imgSleeping = 'images/clay_frank_sleeping.webp';
		const imgSleepingOpenEyes = 'images/clay_frank_sleeping_open_eyes.webp';

		// Emotionale/Interaktions-Varianten
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

		// Statusflags für Logik und Interaktion
		let isIntro = true;
		let isShowingVariant = false;
		let isHolding = false;
		let blinkTimeout = null;
		let variantTimeout = null;

		// Preload: Erst Basisbild laden, dann alle anderen Bilder anstoßen
		const baseImg = new Image();
		baseImg.src = imgBase;
		baseImg.onload = function () {
			[
				imgClosedEyes,
				imgSleeping,
				imgSleepingOpenEyes,
				...imgVariants
			].forEach(src => {
				const img = new Image();
				img.src = src;
			});
		};

		// Setzt das Portrait in den korrekten Zustand (Schlafbild oder Standardbild)
		function updateSleepMode() {
			if (isHolding) return;

			if (isSleepTime()) {
				portrait.src = imgSleeping;
			} else if (!isShowingVariant) {
				portrait.src = imgBase;
			}
		}

		// Blinzeln-Loop
		function blink() {
			if (isIntro ||isSleepTime() || isShowingVariant || isHolding) {
				blinkTimeout = setTimeout(blink, 2000 + Math.random() * 2000);
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

		// Varianten-Loop
		function showRandomVariant() {
			if (isIntro || isSleepTime() || isHolding) {
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

		// Hold-Interaktion starten
		function startHold(e) {
			e.preventDefault();
			overlay.classList.add('highlight');

			if (isSleepTime()) {
				portrait.src = imgSleepingOpenEyes;
				isHolding = true;
				return;
			}

			isIntro = false;
			isHolding = true;

			if (!isShowingVariant) {
				isShowingVariant = true;
				const randomVariant = imgVariants[Math.floor(Math.random() * imgVariants.length)];
				portrait.src = randomVariant;
			}
		}

		// Hold-Interaktion beenden
		function endHold() {
			overlay.classList.remove('highlight');

			if (!isHolding) return;

			isHolding = false;
			isShowingVariant = false;

			if (isSleepTime()) {
				portrait.src = imgSleeping;
			} else {
				portrait.src = imgBase;
			}
		}

		// Initialzustand setzen und Loops starten
		updateSleepMode();
		setInterval(updateSleepMode, 60000);
		setTimeout(blink, 1000 + Math.random() * 2000);
		setTimeout(showRandomVariant, 3000 + Math.random() * 5000);

		// Interaktions-Events registrieren
		overlay.addEventListener('mousedown', startHold);
		overlay.addEventListener('mouseup', endHold);
		overlay.addEventListener('mouseleave', endHold);
		overlay.addEventListener('touchstart', startHold, { passive: false });
		overlay.addEventListener('touchend', endHold);
		overlay.addEventListener('touchcancel', endHold);

		return function cleanup() {
			clearTimeout(blinkTimeout);
			clearTimeout(variantTimeout);
		};
	}

	// 1) URL-Parameter haben IMMER Vorrang:
	//    - forcedSeason zeigt statisches Season-Bild
	//    - sleeping/awake erzwingen Normalmodus (kein Season-Check, kein holidays.json)
	if (forcedSeason) {
		initStaticImageMode(seasonImages[forcedSeason]);
		return;
	}
	if (forceAwake || forceSleep) {
		initNormalMode();
		return;
	}

	// 2) Season-Ermittlung (holidays.json hat Vorrang vor allen anderen Seasons)
	const holidayRange = await loadHolidaysRange();
	if (isHolidayActive(holidayRange)) {
		initStaticImageMode(seasonImages.holidays);
		return;
	}

	// 3) Normale Season-Ermittlung (ohne URL-Override)
	(function () {
		const now = new Date();
		const y = now.getFullYear();

		// Weihnachten: 15.12. - 27.12.
		if (inRangeInclusive(
			now,
			new Date(y, 11, 15, 0, 0, 0, 0),
			new Date(y, 11, 27, 23, 59, 59, 999)
		)) {
			initStaticImageMode(seasonImages.xmas);
			return;
		}

		// Oktoberfest: 15.09. - 10.10.
		if (inRangeInclusive(
			now,
			new Date(y, 8, 15, 0, 0, 0, 0),
			new Date(y, 9, 10, 23, 59, 59, 999)
		)) {
			initStaticImageMode(seasonImages.oktoberfest);
			return;
		}

		// Halloween: 25.10. - 01.11.
		if (inRangeInclusive(
			now,
			new Date(y, 9, 25, 0, 0, 0, 0),
			new Date(y, 10, 1, 23, 59, 59, 999)
		)) {
			initStaticImageMode(seasonImages.halloween);
			return;
		}

		// Neujahr: 31.12. - 05.01. (über Jahreswechsel)
		if (
			inRangeInclusive(
				now,
				new Date(y, 11, 31, 0, 0, 0, 0),
				new Date(y + 1, 0, 5, 23, 59, 59, 999)
			) ||
			inRangeInclusive(
				now,
				new Date(y - 1, 11, 31, 0, 0, 0, 0),
				new Date(y, 0, 5, 23, 59, 59, 999)
			)
		) {
			initStaticImageMode(seasonImages.new_year);
			return;
		}

		// Ostern: eine Woche vor Ostersonntag bis Ostermontag
		const easterSunday = easterSundayDate(y);
		const easterStart = addDays(easterSunday, -7);
		easterStart.setHours(0, 0, 0, 0);
		const easterEnd = addDays(easterSunday, 1);
		easterEnd.setHours(23, 59, 59, 999);

		if (inRangeInclusive(now, easterStart, easterEnd)) {
			initStaticImageMode(seasonImages.easter);
			return;
		}

		// 4) Normalzustand: keine Season aktiv -> Normalbetrieb starten
		initNormalMode();
	})();
})();