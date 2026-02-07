// Aktiviert die .highlight-Klasse im blink-container nach vollständigem Laden einmalig

window.addEventListener('DOMContentLoaded', function() {
	// Das Element mit der Klasse .blink-container wird gesucht
	const blink = document.querySelector('.blink-container');
	if (!blink) return; // Falls nicht vorhanden, nichts tun

	// Funktion, die die Highlight-Klasse für 1 Sekunde setzt und dann wieder entfernt
	function toggleHighlight() {
		blink.classList.add('highlight'); // Highlight-Klasse hinzufügen
		setTimeout(() => {
			blink.classList.remove('highlight'); // Highlight-Klasse entfernen
		}, 1000);
	}

	// Startet die Animation direkt nach dem Laden der Seite
	setTimeout(toggleHighlight, 0);
});
