/*--------------------------------------------------------------
>>> BACKGROUND
----------------------------------------------------------------
# On installed
# On updated
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ONINSTALLED
--------------------------------------------------------------*/

var extension_id = chrome.runtime.id,
    storage = {},
    for_search = [],
    all = {
        0: [],
        1: [],
        2: []
    },
    qqqq = {},
    pre_all = {
        0: {},
        1: {},
        2: {}
    },
    top2 = {
        0: [],
        1: [],
        2: [],
        l0: 0,
        l1: 0,
        l2: 0
    },
    PINNED_TABS = {},
    SEARCH_REGEX = new RegExp('[?&](' + SEARCH_PARAMS.join('|') + ')=([^&]+)');

function sort(array, index, order_by) {
    if (order_by === 'asc') {
        if (typeof array[0][index] === 'number') {
            sorted = array.sort(function(a, b) {
                return a[index] - b[index];
            });
        } else {
            sorted = array.sort(function(a, b) {
                return a[index].localeCompare(b[index]);
            });
        }
    } else {
        if (typeof array[0][index] === 'number') {
            sorted = array.sort(function(a, b) {
                return b[index] - a[index];
            });
        } else {
            sorted = array.sort(function(a, b) {
                return b[index].localeCompare(a[index]);
            });
        }
    }

    return array;
}

function historyCache(start_time, end_time, step) {
    chrome.history.search({
        endTime: end_time,
        maxResults: 0,
        startTime: start_time,
        text: ''
    }, function(items) {
        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];

            var match = item.url.match(/\/[^/?#]+/g),
                without_proto = decodeURIComponent(item.url.match(/\/\/(.*)/)[1]);

            for_search.push([without_proto, item.typedCount]);

            if (match) {
                var current = storage;

                all[1].push([item.visitCount, item.title, without_proto, 0, '']);

                var q = without_proto.match(SEARCH_REGEX);

                if (q) {
                    q = decodeURIComponent(q[2]);

                    if (!pre_all[2][match[0]]) {
                        pre_all[2][match[0]] = 0;
                    }

                    pre_all[2][match[0]] += item.visitCount;

                    if (!qqqq['q' + match[0]]) {
                        qqqq['q' + match[0]] = {};
                    }

                    if (!qqqq['q' + match[0]][q]) {
                        qqqq['q' + match[0]][q] = {
                            url: without_proto,
                            visitCount: item.visitCount
                        };
                    }
                }

                for (var j = 0, k = match.length; j < k; j++) {
                    var string = decodeURIComponent(match[j]);

                    if (!current[string]) {
                        current[string] = {
                            d: 0
                        };
                    }

                    if (j === 0) {
                        current[string].d += item.visitCount;
                    }

                    current = current[string];

                    if (j + 1 === k) {
                        current.a = item.lastVisitTime;
                        current.b = item.title;
                        current.c = item.typedCount;
                        current.d = item.visitCount;
                    }
                }
            }
        }

        if (start_time > 0) {
            end_time -= step;
            start_time -= step;

            if (start_time < 0) {
                start_time = 0;
            }

            console.log('Caching: ' + (100 - start_time / (global_time / 100)).toFixed(2) + '%');

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                for (var i = 0, l = tabs.length; i < l; i++) {
                    if (tabs[i].url.indexOf(extension_id) !== -1) {
                        chrome.tabs.sendMessage(tabs[i].id, {progress: (100 - start_time / (global_time / 100)).toFixed(2)});
                    }
                }
            });

            setTimeout(function() {
                historyCache(start_time, end_time, step);
            }, 200);
        } else {
            for (var key in storage) {
                var item = storage[key];

                all[0].push([key.substr(1), item.d]);
            }

            for (var key in pre_all[2]) {
                var item = pre_all[2][key];

                all[2].push([item, key.substr(1)]);
            }

            top2[0] = sort(all[0], 1).slice(0, 100);
            top2[1] = sort(all[1], 0).slice(0, 100);
            top2[2] = sort(all[2], 0).slice(0, 100);
            for_search = sort(for_search, 1);

            top2.l0 = all[0].length;
            top2.l1 = all[1].length;
            top2.l2 = all[2].length;

            chrome.storage.local.set({
                all: all,
                top: top2,
                for_search: for_search,
                cached: true
            }, function() {
                chrome.storage.local.set(storage, function() {
                    chrome.storage.local.set(qqqq, function() {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            for (var i = 0, l = tabs.length; i < l; i++) {
                                if (tabs[i].url.indexOf(extension_id) !== -1) {
                                    chrome.tabs.sendMessage(tabs[i].id, {progress: 'loaded'});
                                }
                            }
                        });

                        console.log('Caching completed successfully');

                        console.log('Data size: ~' + (JSON.stringify({
                            all,
                            top2,
                            storage,
                            qqqq
                        }).length * 2 / 1000 / 1000).toFixed(2) + ' MB');
                    });
                });
            });
        }
    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get('cached', function(items) {
        if (items.cached !== true) {
            var time = new Date().getTime(),
                step = 7776000000;

            global_time = time;

            historyCache(time - step, time, step);
        }
    });
});

chrome.tabs.query({}, function(tabs) {
    for (var i = 0, l = tabs.length; i < l; i++) {
        var tab = tabs[i];

        if (tab.pinned === true) {
            PINNED_TABS[tab.id] = tab;
        }
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.pinned === true) {
        PINNED_TABS[tab.id] = tab;
    }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
    if (PINNED_TABS[tabId]) {
        chrome.storage.local.get('recently_closed', function(items) {
            var recently_closed = items.recently_closed || [],
                tab = PINNED_TABS[tabId];

            recently_closed.push([new Date().toString(), tab.url, tab.title]);

            chrome.storage.local.set({
                recently_closed: recently_closed.slice(0, 20)
            }, function() {
                delete PINNED_TABS[tabId];
            });
        });
    }
});

/*--------------------------------------------------------------
# ONUPDATED
--------------------------------------------------------------*/