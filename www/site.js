// Aktiviert dreimal die .highlight-Klasse im blink-container nach vollständigem Laden
window.addEventListener('DOMContentLoaded', function() {
	const blink = document.querySelector('.blink-container');
  	if (!blink) return;

  	let count = 0;
  	function toggleHighlight() {
		if (count >= 3) return;
		blink.classList.add('highlight');
		setTimeout(() => {
	  		blink.classList.remove('highlight');
	  		count++;
	  		if (count < 3) {
				setTimeout(toggleHighlight, 500);
	  		}
		}, 500);
  	}
  	setTimeout(toggleHighlight, 0);
});
