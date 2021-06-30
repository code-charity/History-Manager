/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
1.0 Global variables
2.0 Tabs
3.0 Messages
4.0 Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
1.0 GLOBAL VARIABLES
--------------------------------------------------------------*/

var HM = {
		id: chrome.runtime.id,
		time: new Date().getTime(),
		clipboard_input: document.createElement('textarea')
	},
	TABS = {},
	RECENTLY_CLOSED = [],
	CLIPBOARD_HISTORY = [],
	KEY_HISTORY = {},
	VISIT_DURATION_HISTORY = {},
	REGEX_PARTS = /\/[^/?#]+/g,
	REGEX_WWW = /^www\./;

document.body.appendChild(HM.clipboard_input);


/*--------------------------------------------------------------
2.0 TABS
--------------------------------------------------------------*/

chrome.tabs.query({}, function (tabs) {
	var time = new Date().getTime();

	for (var i = 0, l = tabs.length; i < l; i++) {
		var tab = tabs[i];

		TABS[tab.id] = {
			time: time,
			url: tab.url,
			title: tab.title,
			pinned: tab.pinned
		};
	}
});

chrome.tabs.onCreated.addListener(function (tab) {
	TABS[tab.id] = {
		time: new Date().getTime()
	};
});

chrome.tabs.onUpdated.addListener(function (tab_id, change_info, tab) {
	if (change_info.url) {
		TABS[tab_id].url = tab.url;
	}

	if (change_info.title) {
		TABS[tab_id].title = tab.title;
	}

	if (change_info.pinned) {
		TABS[tab_id].pinned = tab.pinned;
	}
});

chrome.tabs.onRemoved.addListener(function (tab_id) {
	var tab = TABS[tab_id];

	if (tab.url) {
		var url = tab.url.match(REGEX_PARTS)[0].substr(1).replace(REGEX_WWW, '');

		if (!VISIT_DURATION_HISTORY[url]) {
			VISIT_DURATION_HISTORY[url] = 0;
		}

		VISIT_DURATION_HISTORY[url] += new Date().getTime() - TABS[tab_id].time;

		if (tab && tab.pinned === true) {
			for (var i = 0, l = RECENTLY_CLOSED.length; i < l; i++) {
				if (RECENTLY_CLOSED[i][1] === tab.url) {
					RECENTLY_CLOSED.splice(i, 1);

					i--;
					l--;
				}
			}

			RECENTLY_CLOSED.push([
				new Date().getTime(),
				tab.title,
				tab.url
			]);

			RECENTLY_CLOSED = RECENTLY_CLOSED.sort(function (a, b) {
				return b[0] - a[0];
			});

			chrome.storage.local.set({
				recently_closed: RECENTLY_CLOSED.slice(0, 20)
			});
		}

		delete TABS[tab_id];

		chrome.storage.local.set({
			visit_duration_history: VISIT_DURATION_HISTORY
		});
	}
});


/*--------------------------------------------------------------
3.0 MESSAGES
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender) {
	if (request.type === 'clipboard') {
		HM.clipboard_input.focus();

		document.execCommand('paste');

		CLIPBOARD_HISTORY.push({
			time: new Date().getTime(),
			string: HM.clipboard_input.value
		});

		chrome.storage.local.set({
			clipboard_history: CLIPBOARD_HISTORY
		});

		HM.clipboard_input.value = '';
	} else if (request.type === 'keypress') {
		var date = new Date(),
			site = request.href.match(REGEX_PARTS)[0].substr(1).replace(REGEX_WWW, ''),
			year = date.getFullYear(),
			month = date.getMonth(),
			day = date.getDate(),
			hours = date.getHours();

		if (!KEY_HISTORY[site]) {
			KEY_HISTORY[site] = {};
		}

		if (!KEY_HISTORY[site][year]) {
			KEY_HISTORY[site][year] = {};
		}

		if (!KEY_HISTORY[site][year][month]) {
			KEY_HISTORY[site][year][month] = {};
		}

		if (!KEY_HISTORY[site][year][month][day]) {
			KEY_HISTORY[site][year][month][day] = {};
		}

		if (!KEY_HISTORY[site][year][month][day][hours]) {
			KEY_HISTORY[site][year][month][day][hours] = '';
		}

		KEY_HISTORY[site][year][month][day][hours] += request.key;

		chrome.storage.local.set({
			key_history: KEY_HISTORY
		});
	} else if (request.type === 'linkCheck') {
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function () {
			cell.textContent = this.status;

			chrome.runtime.sendMessage({
				url: request.url,
				status: this.status
			});
		};

		try {
			xhr.open('GET', request.url, true);
			xhr.send();
		} catch (error) {}
	}
});


/*--------------------------------------------------------------
4.0 INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get(function (items) {
	if (items.clipboard_history) {
		CLIPBOARD_HISTORY = items.clipboard_history;
	}

	if (items.key_history) {
		KEY_HISTORY = items.key_history;
	}

	if (items.visit_duration_history) {
		VISIT_DURATION_HISTORY = items.visit_duration_history;
	}

	if (items.recently_closed) {
		RECENTLY_CLOSED = items.recently_closed;
	}
});
