var HM = {
        id: chrome.runtime.id,
        time: new Date().getTime()
    },
    PINNED_TABS = {},
    RECENTLY_CLOSED = [];

/*--------------------------------------------------------------
# MESSAGES
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.type === 'linkCheck') {
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

cachePinnedTabs();
addTabUpdateListener();
addTabRemoveListener();