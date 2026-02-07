(function() {
	// Hauptfunktion für das Portrait-Handling
	const portrait = document.getElementById('frank-portrait');

	// Das Overlay-Element für Interaktionen (z.B. Klicks, Touch)
	// const overlay = document.querySelector('.portrait-overlay');
	const overlay = document.querySelector('.blink-container');

	// Kontextmenü und Draggen auf mobilen Geräten unterbinden
	overlay.addEventListener('contextmenu', function(e) { e.preventDefault(); }); // Rechtsklick verhindern
	overlay.addEventListener('dragstart', function(e) { e.preventDefault(); });   // Draggen verhindern

	// Bildpfade für verschiedene Portrait-Varianten
	const imgBase = 'images/clay_frank.webp'; // Standardbild
	const imgClosedEyes = 'images/clay_frank_closed_eyes.webp'; // Bild mit geschlossenen Augen
	const imgSleeping = 'images/clay_frank_sleeping.webp'; // Schlafendes Bild
	const imgSleepingOpenEyes = 'images/clay_frank_sleeping_open_eyes.webp'; // Schlafend mit offenen Augen
	const imgVariants = [ // Verschiedene emotionale Varianten
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

	// Bilder vorladen, damit Animationen flüssig laufen
	const baseImg = new Image();
	baseImg.src = imgBase;
	baseImg.onload = function() {
		[imgClosedEyes, imgSleeping, ...imgVariants].forEach(src => {
			const img = new Image();
			img.src = src;
		});
	};

	// Statusvariablen für Animation und Interaktion
	let isShowingVariant = false; // Zeigt gerade eine Variante
	let isHolding = false;        // Portrait wird gehalten (Maus oder Touch)
	let blinkTimeout = null;      // Timeout für Blinzeln
	let variantTimeout = null;    // Timeout für Variantenwechsel

	// Query-Parameter für Testzwecke (z.B. ?sleeping oder ?awake)
	const urlParams = new URLSearchParams(window.location.search);
	const forceSleep = urlParams.has('sleeping');
	const forceAwake = urlParams.has('awake');

	// Prüft, ob Schlafmodus aktiv ist (zwischen 22 und 6 Uhr oder per Parameter)
	function isSleepTime() {
		if (forceAwake) return false;
		if (forceSleep) return true;
		const hour = new Date().getHours();
		return hour >= 22 || hour < 6;
	}

	// Blinzeln-Animation: Portrait schließt kurz die Augen
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

	// Zeigt eine zufällige Portrait-Variante für kurze Zeit
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

	// Aktualisiert den Portrait-Modus (schlafend oder wach)
	function updateSleepMode() {
		if (isHolding) return;
		if (isSleepTime()) {
			portrait.src = imgSleeping;
		} else if (!isShowingVariant) {
			portrait.src = imgBase;
		}
	}

	// Initialisierung: Portrait-Modus setzen, Animationen starten
	updateSleepMode();
	setInterval(updateSleepMode, 60000); // Alle 60s prüfen, ob Schlafmodus
	setTimeout(blink, 1000 + Math.random() * 2000); // Blinzeln starten
	setTimeout(showRandomVariant, 3000 + Math.random() * 5000); // Varianten starten

	// Maus- oder Touch-Interaktion: Portrait wird gehalten
	function startHold(e) {
		e.preventDefault();
		overlay.classList.add('highlight'); // Highlight-Klasse hinzufügen
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

	// Portrait loslassen: Status zurücksetzen
	function endHold() {
		overlay.classList.remove('highlight'); // Highlight-Klasse entfernen
		if (!isHolding) return;
		isHolding = false;
		isShowingVariant = false;
		if (isSleepTime()) {
			portrait.src = imgSleeping;
		} else {
			portrait.src = imgBase;
		}
	}

	// Event-Listener für Maus und Touch
	overlay.addEventListener('mousedown', startHold);
	overlay.addEventListener('mouseup', endHold);
	overlay.addEventListener('mouseleave', endHold);
	overlay.addEventListener('touchstart', startHold, { passive: false });
	overlay.addEventListener('touchend', endHold);
	overlay.addEventListener('touchcancel', endHold);
})();
