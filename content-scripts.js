/*--------------------------------------------------------------
>>> CONTENT SCRIPTS
----------------------------------------------------------------
# Clipboard
# Keyboard
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CLIPBOARD
--------------------------------------------------------------*/

document.addEventListener('copy', function (event) {
	chrome.extension.sendMessage({
		type: 'clipboard',
		href: location.href
	});
});


/*--------------------------------------------------------------
# KEYBOARD
--------------------------------------------------------------*/

window.addEventListener('keypress', function (event) {
	if (event.key.length === 1) {
		chrome.extension.sendMessage({
			type: 'keypress',
			key: event.key,
			href: location.href
		});
	}
});