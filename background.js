/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# Global variables
# Sorting
# History
# Tabs
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var EXTENSION_ID = chrome.runtime.id,
    SEARCH = [],
    ALL = {
        BY_CATEGORY: [],
        BY_DOMAIN: [],
        BY_PAGE: [],
        BY_PARAM: [],
        BY_PARAM_PRE: {}
    },
    TOP = {
        BY_CATEGORY: [],
        BY_DOMAIN: [],
        BY_PAGE: [],
        BY_PARAM: []
    },
    RECENTLY_CLOSED = [],
    PINNED_TABS = {},
    PARAMS = {},
    WEBSITES = {},
    URL_PARTS_REGEX = /\/[^/?#]+/g,
    SEARCH_REGEX = new RegExp('[?&](' + SEARCH_PARAMS.join('|') + ')=([^&]+)');


/*--------------------------------------------------------------
# SORTING
--------------------------------------------------------------*/

function sort(array, index) {
    if (array[0]) {
        sorted = array.sort(function(a, b) {
            return b[index] - a[index];
        });
    }

    return array;
}


/*--------------------------------------------------------------
# HISTORY
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ON INSTALL
--------------------------------------------------------------*/

function cacheHistory() {
    var time = new Date().getTime(),
        start = time - 7776000000,
        end = time;

    GLOBAL_TIME = time;

    function cache(start, end) {
        chrome.history.search({
            endTime: end,
            maxResults: 0,
            startTime: start,
            text: ''
        }, function(items) {
            for (var i = 0, l = items.length; i < l; i++) {
                var item = items[i],
                    decoded_url = decodeURIComponent(item.url),
                    url_parts = decoded_url.match(URL_PARTS_REGEX);

                if (url_parts) {
                    var part = WEBSITES;

                    SEARCH.push([decoded_url, item.typedCount]);

                    for (var j = 0, k = url_parts.length; j < k; j++) {
                        var name = url_parts[j];

                        if (!part[name]) {
                            part[name] = {
                                d: 0
                            };
                        }

                        part = part[name];

                        if (j === 0) {
                            part.d += item.visitCount;
                        }

                        if (j + 1 === k) {
                            part.a = item.lastVisitTime;
                            part.b = item.title;
                            part.c = item.typedCount;
                            part.d = item.visitCount;
                        }
                    }

                    ALL.BY_PAGE.push([item.visitCount, item.title, decoded_url, 0, '']);

                    var params = decoded_url.match(SEARCH_REGEX);

                    if (params) {
                        var domain = url_parts[0];

                        var param = params[2];

                        if (!ALL.BY_PARAM_PRE[domain]) {
                            ALL.BY_PARAM_PRE[domain] = 0;
                        }

                        ALL.BY_PARAM_PRE[domain] += item.visitCount;

                        if (!PARAMS['q' + domain]) {
                            PARAMS['q' + domain] = {};
                        }

                        if (!PARAMS['q' + domain][param]) {
                            PARAMS['q' + domain][param] = {
                                url: decoded_url,
                                visitCount: item.visitCount
                            };
                        }
                    }
                }
            }

            if (start > 0) {
                end -= 7776000000;
                start -= 7776000000;

                if (start < 0) {
                    start = 0;
                }

                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    for (var i = 0, l = tabs.length; i < l; i++) {
                        var tab = tabs[i];

                        if (tab.url.indexOf(EXTENSION_ID) !== -1) {
                            chrome.tabs.sendMessage(tab.id, {progress: (100 - start / (GLOBAL_TIME / 100)).toFixed(2)});
                        }
                    }
                });

                setTimeout(function() {
                    cache(start, end);
                }, 200);
            } else {
                for (var key in WEBSITES) {
                    var item = WEBSITES[key];

                    ALL.BY_DOMAIN.push([key.substr(1), item.d]);
                }

                for (var key in ALL.BY_PARAM_PRE) {
                    var item = ALL.BY_PARAM_PRE[key];

                    ALL.BY_PARAM.push([item, key.substr(1)]);
                }

                TOP.BY_DOMAIN = sort(ALL.BY_DOMAIN, 1).slice(0, 100);
                TOP.BY_PAGE = sort(ALL.BY_PAGE, 0).slice(0, 100);
                TOP.BY_PARAM = sort(ALL.BY_PARAM, 0).slice(0, 100);
                SEARCH = sort(SEARCH, 1);

                TOP.l0 = ALL.BY_DOMAIN.length;
                TOP.l1 = ALL.BY_PAGE.length;
                TOP.l2 = ALL.BY_PARAM.length;

                chrome.storage.local.set(WEBSITES, function() {
                    chrome.storage.local.set(PARAMS, function() {
                        chrome.storage.local.set({
                            all: {
                                0: ALL.BY_DOMAIN,
                                1: ALL.BY_PAGE,
                                2: ALL.BY_PARAM
                            },
                            top: {
                                0: TOP.BY_DOMAIN,
                                1: TOP.BY_PAGE,
                                2: TOP.BY_PARAM,
                                l0: TOP.l0,
                                l1: TOP.l1,
                                l2: TOP.l2
                            },
                            for_search: SEARCH,
                            cached: true
                        }, function() {
                            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                                for (var i = 0, l = tabs.length; i < l; i++) {
                                    var tab = tabs[i];

                                    if (tab.url.indexOf(EXTENSION_ID) !== -1) {
                                        chrome.tabs.sendMessage(tab.id, {progress: 'loaded'});
                                    }
                                }
                            });
                        });
                    });
                });
            }
        });
    }

    cache(start, end);
}


/*--------------------------------------------------------------
# TABS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ON INSTALL
--------------------------------------------------------------*/

function cacheTabs() {
    chrome.tabs.query({}, function(tabs) {
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
    chrome.tabs.onUpdated.addListener(function(id, changes, tab) {
        if (tab.pinned === true) {
            PINNED_TABS[id] = tab;
        }
    });
}


/*--------------------------------------------------------------
# ADD TAB REMOVE LISTENER
--------------------------------------------------------------*/

function addTabRemoveListener() {
    chrome.tabs.onRemoved.addListener(function(id) {
        var tab = PINNED_TABS[id];

        if (tab) {
            RECENTLY_CLOSED.push(
                [
                new Date().toString(),
                tab.url,
                tab.title
                ]
                );

            chrome.storage.local.set({
                recently_closed: RECENTLY_CLOSED.slice(0, 20)
            }, function() {
                delete PINNED_TABS[id];
            });
        }
    });
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get('cached', function(items) {
        if (items.cached !== true) {
            cacheHistory();
            cacheTabs();
        }
    });
});

addTabUpdateListener();
addTabRemoveListener();