(function () {
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
	// Seasons können per ?xmas, ?easter, ?halloween, ?newyear, ?oktoberfest erzwungen werden
	const urlParams = new URLSearchParams(window.location.search);

	// Season-Bilder liegen in images/seasons und werden über ein Mapping adressiert
	const seasonImgDir = 'images/seasons/';
	const seasonImages = {
		xmas: `${seasonImgDir}clay_frank_xmas.webp`,
		easter: `${seasonImgDir}clay_frank_easter.webp`,
		halloween: `${seasonImgDir}clay_frank_halloween.webp`,
		new_year: `${seasonImgDir}clay_frank_new_year.webp`,
		oktoberfest: `${seasonImgDir}clay_frank_oktoberfest.webp`
	};

	// Aus den möglichen Season-Query-Flags genau eine Season bestimmen (Priorität = Reihenfolge)
	// Hinweis: Query-Key "newyear" mappt auf season key "new_year"
	const forcedSeason =
		urlParams.has('xmas') ? 'xmas' :
		urlParams.has('easter') ? 'easter' :
		urlParams.has('halloween') ? 'halloween' :
		urlParams.has('newyear') ? 'new_year' :
		urlParams.has('oktoberfest') ? 'oktoberfest' :
		null;

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

	// Ermittelt, ob aktuell eine Season aktiv ist.
	// Wenn ja: key + src zurückgeben, sonst null.
	// Query-Parameter überschreiben die Logik, damit du bequem testen kannst.
	function getActiveSeason() {
		if (forcedSeason) {
			return { key: forcedSeason, src: seasonImages[forcedSeason] };
		}

		const now = new Date();
		const y = now.getFullYear();

		// Weihnachten: 15.12. - 27.12.
		if (inRangeInclusive(
			now,
			new Date(y, 11, 15, 0, 0, 0, 0),
			new Date(y, 11, 27, 23, 59, 59, 999)
		)) {
			return { key: 'xmas', src: seasonImages.xmas };
		}

		// Oktoberfest: 15.09. - 10.10. (bewusst vereinfachter Zeitraum)
		if (inRangeInclusive(
			now,
			new Date(y, 8, 15, 0, 0, 0, 0),
			new Date(y, 9, 10, 23, 59, 59, 999)
		)) {
			return { key: 'oktoberfest', src: seasonImages.oktoberfest };
		}

		// Halloween: 25.10. - 01.11. (bewusst erweiterter Zeitraum)
		if (inRangeInclusive(
			now,
			new Date(y, 9, 25, 0, 0, 0, 0),
			new Date(y, 10, 1, 23, 59, 59, 999)
		)) {
			return { key: 'halloween', src: seasonImages.halloween };
		}

		// Neujahr: 31.12. - 05.01. (über Jahreswechsel)
		// Zwei Checks, damit sowohl Dezember (Start im aktuellen Jahr) als auch Januar (Fortsetzung im neuen Jahr) abgedeckt sind
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
			return { key: 'new_year', src: seasonImages.new_year };
		}

		// Ostern: eine Woche vor Ostersonntag bis Ostermontag (inklusive)
		const easterSunday = easterSundayDate(y);
		const easterStart = addDays(easterSunday, -7);
		easterStart.setHours(0, 0, 0, 0);
		const easterEnd = addDays(easterSunday, 1);
		easterEnd.setHours(23, 59, 59, 999);

		if (inRangeInclusive(now, easterStart, easterEnd)) {
			return { key: 'easter', src: seasonImages.easter };
		}

		return null;
	}

	// Season wird zuerst ermittelt, damit wir im Season-Fall sofort aussteigen können
	const activeSeason = getActiveSeason();

	// Initialisiert den Season-Mode: nur Season-Bild laden, keine weitere Mechanik
	function initSeasonMode(season) {
		// Optional: Hold/Interaktion im Season-Mode komplett abschalten (Event-Listener werden gar nicht erst registriert)
		// Wir setzen trotzdem safe den src, sobald das Bild geladen ist.
		const img = new Image();
		img.src = season.src;
		img.onload = function () {
			portrait.src = season.src;
		};
		// Fallback: falls onload nicht feuert (z.B. aus Cache sehr schnell), src trotzdem setzen
		portrait.src = season.src;
	}

	// Initialisiert den Normal-Mode: Preload, Sleep-Mode, Blink, Varianten, Interaktionen
	function initNormalMode() {
		// Highlight-Klasse kurz setzen (z.B. für Initial-Aufmerksamkeit)
		function toggleHighlight() {
			overlay.classList.add('highlight');
			setTimeout(() => {
				overlay.classList.remove('highlight');
			}, 1000);
		}

		// Highlight direkt nach Init auslösen
		setTimeout(toggleHighlight, 0);

		// Standardbilder (Basis, Blinzeln, Schlafmodus)
		const imgBase = 'images/clay_frank.webp';
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
		let isShowingVariant = false;
		let isHolding = false;
		let blinkTimeout = null;
		let variantTimeout = null;

		// Schlafmodus-Overrides
		const forceSleep = urlParams.has('sleeping');
		const forceAwake = urlParams.has('awake');

		// Prüft, ob Schlafmodus aktiv ist (zwischen 22 und 6 Uhr oder per Parameter)
		function isSleepTime() {
			if (forceAwake) return false;
			if (forceSleep) return true;
			const hour = new Date().getHours();
			return hour >= 22 || hour < 6;
		}

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

		// Varianten-Loop
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

		// Hold-Interaktion starten
		function startHold(e) {
			e.preventDefault();
			overlay.classList.add('highlight');

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

		// Optional: Rückgabe einer Cleanup-Funktion (falls du später mal „unmount“ brauchst)
		return function cleanup() {
			clearTimeout(blinkTimeout);
			clearTimeout(variantTimeout);
		};
	}

	// Kontrollfluss: Season hat Vorrang und beendet die Initialisierung früh
	if (activeSeason) {
		initSeasonMode(activeSeason);
		return;
	}

	// Kein Season-Mode aktiv: kompletten Normalbetrieb starten
	initNormalMode();
})();
