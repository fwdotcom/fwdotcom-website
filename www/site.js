// Aktiviert dreimal die .highlight-Klasse im blink-container nach vollständigem Laden
window.addEventListener('DOMContentLoaded', function() {
	const blink = document.querySelector('.blink-container');
  	if (!blink) return;

  	let count = 0;
  	function toggleHighlight() {
		if (count >= 2) return;
		blink.classList.add('highlight');
		setTimeout(() => {
	  		blink.classList.remove('highlight');
	  		count++;
	  		if (count < 2) {
				setTimeout(toggleHighlight, 500);
	  		}
		}, 500);
  	}
  	setTimeout(toggleHighlight, 0);
});
