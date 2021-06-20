var HM = {
        id: chrome.runtime.id,
        time: new Date().getTime(),
        clipboard_input: document.createElement('textarea')
    },
    PINNED_TABS = {},
    RECENTLY_CLOSED = [],
    CLIPBOARD_HISTORY = [],
    KEY_HISTORY = {},
    REGEX_PARTS = /\/[^/?#]+/g,
    REGEX_WWW = /^www\./;

document.body.appendChild(HM.clipboard_input);


/*--------------------------------------------------------------
# TABS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CACHE PINNED TABS
--------------------------------------------------------------*/

function cachePinnedTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0, l = tabs.length; i < l; i++) {
            var tab = tabs[i];

            if (tab.pinned === true) {
                PINNED_TABS[tab.id] = tab;
            }
        }
    });
}


/*--------------------------------------------------------------
# ADD TAB UPDATE LISTENER
--------------------------------------------------------------*/

function addTabUpdateListener() {
    chrome.tabs.onUpdated.addListener(function (id, changes, tab) {
        if (tab.pinned === true) {
            PINNED_TABS[id] = tab;
        }
    });
}


/*--------------------------------------------------------------
# ADD TAB REMOVE LISTENER
--------------------------------------------------------------*/

function addTabRemoveListener() {
    chrome.tabs.onRemoved.addListener(function (id) {
        var tab = PINNED_TABS[id];

        if (tab) {
            for (var i = 0, l = RECENTLY_CLOSED.length; i < l; i++) {
                if (RECENTLY_CLOSED[i][1] === tab.url) {
                    RECENTLY_CLOSED.splice(i, 1);

                    i--;
                    l--;
                }
            }

            RECENTLY_CLOSED.push([
                new Date().getTime(),
                tab.url,
                tab.title
            ]);

            RECENTLY_CLOSED = RECENTLY_CLOSED.sort(function (a, b) {
                return b[0] - a[0];
            });

            chrome.storage.local.set({
                recently_closed: RECENTLY_CLOSED.slice(0, 20)
            }, function () {
                delete PINNED_TABS[id];
            });
        }
    });
}


/*--------------------------------------------------------------
# MESSAGES
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
# INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get(function(items) {
    if (items.clipboard_history) {
        CLIPBOARD_HISTORY = items.clipboard_history;
    }

    if (items.key_history) {
        KEY_HISTORY = items.key_history;
    }

    if (items.recently_closed) {
        RECENTLY_CLOSED = items.recently_closed;
    }

    cachePinnedTabs();
    addTabUpdateListener();
    addTabRemoveListener();
});