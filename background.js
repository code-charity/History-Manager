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
    BY_CATEGORY = [],
    BY_DOMAIN = [],
    BY_PAGE = [],
    BY_PARAM = [],
    BY_PARAM_PRE = {}
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
    PROTOCOL_REGEX = /[^/]+/g,
    PROTOCOL_WWW_REGEX = /[^/]+\/\/(www\.)?/,
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
                var item = items[i];
                
                try {
                    var decoded_url = decodeURIComponent(item.url);
                } catch (err) {
                    var decoded_url = item.url;
                }

                var url_parts = decoded_url.match(URL_PARTS_REGEX);

                if (url_parts) {
                    var part = WEBSITES;

                    for (var j = 0, k = url_parts.length; j < k; j++) {
                        var name = url_parts[j];

                        if (j === 0) {
                            var protocol = decoded_url.match(PROTOCOL_REGEX);

                            if (protocol) {
                                name = protocol[0] + '/' + name;                                
                            }
                        }

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

                    BY_PAGE.push([item.visitCount, item.title, decoded_url, 0, '']);

                    var params = decoded_url.match(SEARCH_REGEX);

                    if (params) {
                        var domain = url_parts[0];

                        var protocol = decoded_url.match(PROTOCOL_REGEX);

                        if (protocol) {
                            domain = protocol[0] + '/' + domain;
                        }

                        var param = params[2];

                        if (!BY_PARAM_PRE[domain]) {
                            BY_PARAM_PRE[domain] = 0;
                        }

                        BY_PARAM_PRE[domain] += item.visitCount;

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
                }, 100);
            } else {
                for (var key in WEBSITES) {
                    var item = WEBSITES[key];

                    for (var category in CATEGORIES) {
                        for (var website in CATEGORIES[category]) {
                            if (key.indexOf(website) !== -1) {
                                CATEGORIES[category][website] += item.d;
                            }
                        }
                    }

                    BY_DOMAIN.push([key, item.d]);

                    var start_with = key.match(PROTOCOL_WWW_REGEX)[0];

                    SEARCH.push([key.replace(start_with, ''), item.c || 0, start_with]);
                }

                for (var category in CATEGORIES) {
                    var array = [0, category, []];

                    for (var website in CATEGORIES[category]) {
                        array[0] += CATEGORIES[category][website];

                        array[2].push([CATEGORIES[category][website], website]);
                    }

                    array[2] = sort(array[2], 0);

                    BY_CATEGORY.push(array);
                }

                for (var key in BY_PARAM_PRE) {
                    var item = BY_PARAM_PRE[key];

                    BY_PARAM.push([item, key]);
                }

                BY_CATEGORY = sort(BY_CATEGORY, 0);
                TOP.BY_DOMAIN = sort(BY_DOMAIN, 1).slice(0, 100);
                TOP.BY_PAGE = sort(BY_PAGE, 0).slice(0, 100);
                TOP.BY_PARAM = sort(BY_PARAM, 0).slice(0, 100);
                SEARCH = sort(SEARCH, 1);

                TOP.l0 = BY_DOMAIN.length;
                TOP.l1 = BY_PAGE.length;
                TOP.l2 = BY_PARAM.length;

                chrome.storage.local.set(WEBSITES, function() {
                    chrome.storage.local.set(PARAMS, function() {
                        chrome.storage.local.set({
                            BY_DOMAIN,
                            BY_PAGE,
                            BY_PARAM,
                            top: {
                                0: TOP.BY_DOMAIN,
                                1: TOP.BY_PAGE,
                                2: TOP.BY_PARAM,
                                l0: TOP.l0,
                                l1: TOP.l1,
                                l2: TOP.l2
                            },
                            by_category: BY_CATEGORY,
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
# CACHE PINNED TABS
--------------------------------------------------------------*/

function cachePinnedTabs() {
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

            RECENTLY_CLOSED = sort(RECENTLY_CLOSED, 0);

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
        }
    });
});

cachePinnedTabs();

addTabUpdateListener();
addTabRemoveListener();