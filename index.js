/*--------------------------------------------------------------
>>> HISTORY MANAGER
----------------------------------------------------------------
# Global variables
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var HM = {
        history: {},
        transitions: []
    },
    BOOKMARKS = {},
    LOADED = false,
    REGEX_PROTOCOL = /[^:]+/g,
    REGEX_DOMAIN = /[^/]+[/]+[^/]+/g,
    REGEX_PARTS = /\/[^/?#]+/g,
    SEARCH_ENGINE = {
        google: {
            name: 'Google',
            url: 'https://www.google.com/search?q=',
            favicon: 'https://www.google.com/favicon.ico'
        },
        duckduckgo: {
            name: 'DuckDuckGo',
            url: 'https://duckduckgo.com/?q=',
            favicon: 'https://duckduckgo.com/favicon.ico'
        },
        bing: {
            name: 'Bing',
            url: 'https://www.bing.com/search?q=',
            favicon: 'https://www.bing.com/favicon.ico'
        },
        ecosia: {
            name: 'Ecosia',
            url: 'https://www.ecosia.org/search?q=',
            favicon: 'https://www.ecosia.org/favicon.ico'
        }
    };


/*--------------------------------------------------------------
# DATABASE
--------------------------------------------------------------*/

var DB = {
    indexedDB: null,
    open: function (callback) {
        chrome.storage.local.get('database_version', function (items) {
            var request = indexedDB.open('history_manager', items.database_version);

            request.onupgradeneeded = function () {
                console.log('DB: upgradeneeded 1', this.result.version);

                DB.indexedDB = this.result;

                if (DB.indexedDB.version === 1) {
                    if (!DB.indexedDB.objectStoreNames.contains('domains')) {
                        var object = DB.indexedDB.createObjectStore('domains', {
                            keyPath: 'domain'
                        });

                        object.createIndex('typedCountIndex', 'typedCount');
                        object.createIndex('visitCountIndex', 'visitCount');
                        object.createIndex('domainIndex', 'domain');
                    }

                    if (!DB.indexedDB.objectStoreNames.contains('pages')) {
                        var object = DB.indexedDB.createObjectStore('pages', {
                            keyPath: 'id'
                        });

                        object.createIndex('visitCountIndex', 'visitCount');
                        object.createIndex('bookmarkedIndex', 'bookmarked');
                        object.createIndex('tagsIndex', 'tags');
                        object.createIndex('titleIndex', 'title');
                    }

                    if (!DB.indexedDB.objectStoreNames.contains('params')) {
                        var object = DB.indexedDB.createObjectStore('params', {
                            keyPath: 'domain'
                        });

                        object.createIndex('visitCountIndex', 'visitCount');
                        object.createIndex('domainIndex', 'domain');
                    }

                    if (!DB.indexedDB.objectStoreNames.contains('transitions')) {
                        var object = DB.indexedDB.createObjectStore('transitions', {
                            keyPath: 'transition'
                        });

                        object.createIndex('countIndex', 'count');
                        object.createIndex('transitionIndex', 'transition');
                    }
                }

                DB.indexedDB.onversionchange = function () {
                    console.log('DB: versionchange 1');

                    DB.indexedDB.close();

                    DB.open(callback);
                };
            };

            request.onsuccess = function () {
                console.log('DB: success 1');

                DB.indexedDB = this.result;

                callback();
            };

            request.onblocked = function () {
                console.log('DB: blocked 1');

                DB.open(callback);
            };
        });
    },
    get: function (object_store_name, callback, options) {
        var transaction = DB.indexedDB.transaction(object_store_name, 'readonly'),
            object_store = transaction.objectStore(object_store_name),
            limit = options.limit || 100,
            result = [],
            offset = false;

        if (options.index_name) {
            object_store = object_store.index(options.index_name);
        }

        object_store.openCursor(null, options.direction).onsuccess = function (event) {
            var cursor = event.target.result;

            if (options.offset && offset === false) {
                offset = true;

                cursor.advance(options.offset);
            } else if (cursor && result.length < limit) {
                result.push(cursor.value);

                cursor.continue();
            } else {
                callback(result, object_store_name);
            }
        };
    },
    getByKeys: function (keys, object_store_name, callback) {
        var transaction = DB.indexedDB.transaction(object_store_name, 'readonly'),
            object_store = transaction.objectStore(object_store_name),
            threads = 0,
            result = {};

        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];

            threads++;

            object_store.get(key).onsuccess = function (event) {
                threads--;

                if (event.target.result) {
                    result[event.target.result[event.target.source.keyPath]] = event.target.result;
                }

                if (threads === 0) {
                    callback(result);
                }
            };
        }
    },
    count: function (object_store_name, callback) {
        var transaction = DB.indexedDB.transaction(object_store_name, 'readonly'),
            object_store = transaction.objectStore(object_store_name);

        object_store.count().onsuccess = function (event) {
            callback(event.target.result);
        };
    },
    search: function (query, object_store_name, keys, callback) {
        var transaction = DB.indexedDB.transaction(object_store_name, 'readonly'),
            object_store = transaction.objectStore(object_store_name),
            result = [],
            is_regex = false;

        if (typeof query === 'object' && query.test) {
            is_regex = true;
        }

        object_store.openCursor().onsuccess = function (event) {
            var cursor = event.target.result,
                founded = false;

            if (cursor && result.length < 100) {
                for (var i = 0, l = keys.length; i < l; i++) {
                    if (founded === false) {
                        if (is_regex === false) {
                            if (cursor.value[keys[i]].indexOf(query) !== -1) {
                                result.push(cursor.value);

                                founded = true;
                            }
                        } else {
                            if (query.test(cursor.value[keys[i]]) === true) {
                                result.push(cursor.value);

                                founded = true;
                            }
                        }
                    }
                }

                cursor.continue();
            } else {
                callback(result, object_store_name);
            }
        };
    }
};


/*--------------------------------------------------------------
# HISTORY
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CACHE
--------------------------------------------------------------*/

HM.history.cache = function (items) {
    var pages_object_store = DB.indexedDB.transaction('pages', 'readwrite').objectStore('pages');

    for (var i = 0, l = items.length; i < l; i++) {
        var item = items[i];

        pages_object_store.add({
            'id': item.id,
            'lastVisitTime': item.lastVisitTime,
            'tags': '',
            'title': item.title,
            'typedCount': item.typedCount,
            'url': item.url,
            'visitCount': item.visitCount
        });
    }
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

HM.history.get = function (callback) {
    chrome.storage.local.get('history_start_time', function (items) {
        var end_time = new Date().getTime(),
            start_time = items.history_start_time || 0;

        chrome.storage.local.set({
            history_start_time: end_time
        }, function () {
            chrome.history.search({
                endTime: end_time,
                maxResults: 0,
                startTime: start_time,
                text: ''
            }, function (result) {
                callback(result);
            });
        });
    });
};


/*--------------------------------------------------------------
# BOOKMARKS
--------------------------------------------------------------*/

chrome.bookmarks.getTree(function (bookmarks) {
    var threads = 0;

    function parse(bookmarks) {
        threads++;

        for (var i = 0, l = bookmarks.length; i < l; i++) {
            var item = bookmarks[i];


            if (item.url) {
                BOOKMARKS[item.url] = item.id;
            }

            if (item.children) {
                parse(item.children);
            }
        }

        threads--;
    }

    parse(bookmarks);
});


/*--------------------------------------------------------------
# TABS
--------------------------------------------------------------*/

HM.tabs = document.createElement('div');

HM.tabs.removeEmptyWindows = function () {
    for (var i = 0, l = this.children.length; i < l; i++) {
        var list = this.children[i];

        if (list.children.length === 1) {
            list.remove();
        }
    }
};

HM.tabs.returnWindow = function (id) {
    for (var i = 0, l = this.children.length; i < l; i++) {
        if (this.children[i].dataset.id == id) {
            return this.children[i];
        }
    }

    var element = document.createElement('div'),
        button = document.createElement('button');

    element.className = 'tab-manager__window';
    element.dataset.id = id;

    button.className = 'satus-button tab-manager__window-button';
    button.textContent = this.children.length + 1;
    button.addEventListener('click', function () {
        this.parentNode.classList.toggle('collapsed');
    });

    element.appendChild(button);

    this.appendChild(element);

    return element;
};

HM.tabs.createTab = function (tab) {
    var list = HM.tabs.returnWindow(tab.windowId),
        item = document.createElement('div'),
        pin_button = document.createElement('button'),
        a = document.createElement('a');

    item.className = 'tab-manager__item';
    item.data = tab;
    item.addEventListener('mousedown', function (event) {
        if (event.button === 0 && event.target.nodeName !== 'BUTTON') {
            var button = this,
                parent = button.parentNode,
                index = Array.prototype.slice.call(parent.children).indexOf(button),
                rect = button.getBoundingClientRect(),
                offset_x = event.clientX - rect.left,
                offset_y = event.clientY - rect.top,
                selected,
                is_moved = false;

            event.preventDefault();
            event.stopPropagation();

            function mousemove(event) {
                var founded = false;

                if (is_moved === false) {
                    is_moved = true;

                    button.classList.add('active');
                    button.style.width = rect.width + 'px';

                    document.body.appendChild(button);
                }

                button.style.left = event.clientX - offset_x + 'px';
                button.style.top = event.clientY - offset_y + 'px';

                for (var i = 0, l = event.path.length - 2; i < l; i++) {
                    var element = event.path[i];

                    if (element.className.indexOf('tab-manager__item') !== -1 && button.dataset.pinned == element.dataset.pinned) {
                        if (selected !== element) {
                            if (selected) {
                                selected.classList.remove('selected--before');
                                selected.classList.remove('selected--after');
                            }

                            selected = element;
                        } else {
                            var selected_rect = selected.getBoundingClientRect();

                            if (event.clientY - selected_rect.top < selected_rect.height / 2) {
                                selected.classList.remove('selected--after');
                                selected.classList.add('selected--before');
                            } else {
                                selected.classList.remove('selected--before');
                                selected.classList.add('selected--after');
                            }
                        }

                        founded = true;
                    }
                }

                if (founded === false && selected) {
                    selected.classList.remove('selected--before');
                    selected.classList.remove('selected--after');

                    selected = null;
                }
            }

            function mouseup(event) {
                if (is_moved === true) {
                    var new_position = 0;

                    button.classList.remove('active');

                    if (selected) {
                        new_position = Array.prototype.slice.call(parent.children).indexOf(selected);

                        if (selected.classList.contains('selected--before')) {
                            parent.insertBefore(button, selected);

                            new_position--;
                        } else {
                            parent.insertBefore(button, selected.nextElementSibling);

                            new_position++;
                        }

                        selected.classList.remove('selected--before');
                        selected.classList.remove('selected--after');
                    } else {
                        parent.insertBefore(button, parent.children[index]);

                        new_position = Array.prototype.slice.call(parent.children).indexOf(button);
                    }

                    button.removeAttribute('style');

                    chrome.tabs.move(button.data.id, {
                        index: new_position
                    });
                }

                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup', mouseup);
            }

            window.addEventListener('mousemove', mousemove);
            window.addEventListener('mouseup', mouseup);
        }
    });

    pin_button.className = 'satus-button satus-button--pin';

    if (tab.pinned === true) {
        item.dataset.pinned = true;
    } else {
        item.dataset.pinned = false;
    }

    pin_button.addEventListener('click', function (event) {
        var item = this.parentNode,
            status = item.dataset.pinned != 'true';

        item.dataset.pinned = status;

        chrome.tabs.update(item.data.id, {
            pinned: status
        });

        event.preventDefault();
        event.stopPropagation();

        return false;
    });

    a.href = tab.url;
    a.textContent = tab.title;
    a.style.backgroundImage = 'url(chrome://favicon/' + tab.url + ')';

    item.appendChild(pin_button);
    item.appendChild(a);
    list.insertBefore(item, list.children[tab.index + 1]);
};

HM.tabs.returnTab = function (tab_id, window_id) {
    if (satus.isset(window_id)) {
        var list = HM.tabs.returnWindow(window_id);

        for (var i = 1, l = list.children.length; i < l; i++) {
            var item = list.children[i];

            if (item.data.id === tab_id) {
                return item;
            }
        }
    } else {
        for (var i = 0, l = this.children.length; i < l; i++) {
            var list = this.children[i];

            for (var j = 1, k = list.children.length; j < k; j++) {
                var item = list.children[j];

                if (item.data.id === tab_id) {
                    return item;
                }
            }
        }
    }
};

chrome.tabs.query({}, function (tabs) {
    for (var i = 0, l = tabs.length; i < l; i++) {
        var tab = tabs[i];

        HM.tabs.createTab(tab);
    }
});

chrome.tabs.onAttached.addListener(function (tab_id, attach_info) {
    var list = HM.tabs.returnWindow(attach_info.newWindowId),
        item = HM.tabs.returnTab(tab_id);

    list.insertBefore(item, list.children[attach_info.newPosition + 1]);

    HM.tabs.removeEmptyWindows();
});

chrome.tabs.onCreated.addListener(function (tab) {
    HM.tabs.createTab(tab);
});

chrome.tabs.onMoved.addListener(function (tab_id, move_info) {
    var list = HM.tabs.returnWindow(move_info.windowId),
        item = HM.tabs.returnTab(tab_id, move_info.windowId);

    list.insertBefore(item, list.children[move_info.toIndex + 1]);
});

chrome.tabs.onRemoved.addListener(function (tab_id, remove_info) {
    HM.tabs.returnTab(tab_id, remove_info.windowId).remove();

    HM.tabs.removeEmptyWindows();
});

chrome.tabs.onUpdated.addListener(function (tab_id, change_info, tab) {
    if (change_info.url || change_info.title) {
        var item = HM.tabs.returnTab(tab_id, tab.windowId),
            a = item.children[1];

        item.data = tab;

        a.href = tab.url;
        a.textContent = tab.title;
        a.style.backgroundImage = 'url(chrome://favicon/' + tab.url + ')';
    }
});


/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

var skeleton = {
        header: {
            element: 'header',

            section_left: {
                element: 'section'
            },
            section_center: {
                element: 'section',
                class: 'satus-section--search',

                search_results: {
                    element: 'div',
                    class: 'search-results'
                },
                search: {
                    element: 'input',
                    type: 'text',
                    class: 'search-field',
                    placeholder: 'Search Google or type a URL',
                    spellcheck: false,
                    autofocus: true,
                    onfocus: function () {
                        if (this.value.trim().length > 0) {
                            document.querySelector('.search-results').style.display = 'block';
                        }
                    },
                    onblur: function () {
                        document.querySelector('.search-results').style.display = '';
                    },
                    oninput: function () {
                        var self = this;
                        /*var search_results_element = document.querySelector('.search-results'),
                            value = this.value,
                            results = [],
                            pre_results = {},
                            first = null,
                            cursor_position = this.selectionStart,
                            SEARCH = [],
                            r = new RegExp('[^\w]' + value);

                        search_results_element.innerHTML = '';

                        if (value.length > 0 && event.inputType !== 'deleteContentBackward') {
                            for (var i = 0, l = SEARCH.length; i < l; i++) {
                                var item = SEARCH[i];

                                if (item[0].indexOf(value) === 0 && !pre_results[key]) {
                                    pre_results[item[0]] = item;
                                }
                            }

                            for (var key in BOOKMARKS) {
                                if (key.indexOf(value) === 0) {
                                    var start_with = key.match(/[^/]+\/\/(www\.)?/)[1],
                                        url = key.replace(start_with, '');

                                    if (!pre_results[key]) {
                                        pre_results[url] = [
                                            url,
                                            0,
                                            start_with
                                        ];
                                    }
                                }
                            }

                            for (var i = 0; i < Object.keys(TOP_SITES).length; i++) {
                                var key = TOP_SITES[i];

                                if (key.indexOf(value) === 0 && !pre_results[key]) {
                                    pre_results[key] = [
                                        key,
                                        0,
                                        'https://'
                                    ];
                                }
                            }

                            for (var key in pre_results) {
                                results.push(pre_results[key]);
                            }

                            if (results[0]) {
                                results = satus.sort(1, 'desc', results);

                                results = results.slice(0, 6);

                                for (var i = 0, l = results.length; i < l; i++) {
                                    var item = document.createElement('div');

                                    item.innerText = results[i][0];
                                    item.dataset.url = results[i][2] + results[i][0];
                                    item.style.backgroundImage = 'url(chrome://favicon/' + results[i][2] + results[i][0] + ')';

                                    item.addEventListener('click', function () {
                                        search_results_element.style.display = 'none';

                                        window.open(this.dataset.url, '_self');
                                    });

                                    search_results_element.appendChild(item);
                                }
                            }
                        }

                        if (results[0] && results[0][0]) {
                            search_results_element.children[0].className = 'selected';

                            this.value = results[0][0];

                            //this.textContent = first;
                            //this.setSelectionRange(cursor_position, this.value.length);
                        }

                        if (value.length === 0 || results.length === 0) {
                            search_results_element.style.display = '';
                        } else {
                            search_results_element.style.display = 'block';
                        }*/

                        var query = this.value.trim();

                        /*chrome.history.search({
                            endTime: new Date().getTime(),
                            maxResults: 0,
                            startTime: 0,
                            text: query
                        }, function (items) {
                            var results = items.sort(function(a, b) {
                                    var c = b.typedCount - a.typedCount;

                                    if (c !== 0) {
                                        return c;
                                    }

                                    var d = b.visitCount - a.visitCount;

                                    if (d !== 0) {
                                        return d;
                                    }

                                    return b.lastVisitTime - a.lastVisitTime;
                                });

                            var container = document.querySelector('.search-results');

                            satus.empty(container);

                            for (var i = 0, l = results.length; i < l; i++) {
                                var result = results[i],
                                    item = document.createElement('div');

                                item.innerText = result.url;
                                item.dataset.url = result.url;
                                item.style.backgroundImage = 'url(chrome://favicon/' + result.url + ')';

                                item.addEventListener('click', function () {
                                    window.open(this.dataset.url, '_self');
                                });

                                container.appendChild(item);
                            }

                            if (query.length === 0 || result.length === 0) {
                                container.style.display = '';
                            } else {
                                container.style.display = 'block';
                            }
                        });*/

                        DB.get('domains', function (items) {
                            var results = [];

                            for (var i = 0, l = items.length; i < l; i++) {
                                var item = items[i];

                                if (item.domain.indexOf(query) !== -1) {
                                    results.push({
                                        startWith: item.domain.indexOf(query) === 0 ? 1 : 0,
                                        url: item.url,
                                        domain: item.domain,
                                        typedCount: item.typedCount,
                                        visitCount: item.visitCount
                                    });
                                }
                            }

                            results = results.sort(function (a, b) {
                                return b.visitCount - a.visitCount;
                            }).slice(0, 10).sort(function (a, b) {
                                return a.domain.localeCompare(b.domain);
                            }).sort(function (a, b) {
                                return b.typedCount - a.typedCount || b.visitCount - a.visitCount;
                            }).sort(function (a, b) {
                                return b.startWith - a.startWith;
                            }).slice(0, 6);

                            var container = document.querySelector('.search-results');

                            satus.empty(container);

                            var item = document.createElement('div');

                            item.innerHTML = self.value + ' - <span style="opacity: .4;">Search ' + ((SEARCH_ENGINE[satus.storage.data['search-engine']] || {}).name || 'Google') + '</span>';
                            item.dataset.url = ((SEARCH_ENGINE[satus.storage.data['search-engine']] || {}).url || 'https://www.google.com/search?q=') + self.value;

                            item.addEventListener('click', function () {
                                window.open(this.dataset.url, '_self');
                            });

                            container.appendChild(item);

                            var item = document.createElement('div');

                            item.innerHTML = self.value + ' - <span style="opacity: .4;">Tables</span>';
                            item.dataset.value = self.value;

                            item.addEventListener('click', function () {
                                var tables = document.querySelectorAll('.satus-table');

                                for (var i = 0, l = tables.length; i < l; i++) {
                                    var table = tables[i];

                                    if (table.onsearch) {
                                        table.onsearch(this.dataset.value);
                                    }
                                }
                            });

                            container.appendChild(item);

                            var item = document.createElement('div');

                            item.innerHTML = '/' + self.value + '/ - <span style="opacity: .4;">Regex</span>';
                            item.dataset.value = self.value;

                            item.addEventListener('click', function () {
                                var tables = document.querySelectorAll('.satus-table');

                                for (var i = 0, l = tables.length; i < l; i++) {
                                    var table = tables[i];

                                    if (table.onsearch) {
                                        table.onsearch(new RegExp(this.dataset.value));
                                    }
                                }
                            });

                            container.appendChild(item);

                            for (var i = 0, l = results.length; i < l; i++) {
                                var result = results[i],
                                    item = document.createElement('div');

                                item.innerText = result.domain;
                                item.dataset.url = result.url;
                                item.style.backgroundImage = 'url(chrome://favicon/' + result.url + ')';

                                item.addEventListener('click', function () {
                                    window.open(this.dataset.url, '_self');
                                });

                                container.appendChild(item);
                            }

                            if (query.length === 0) {
                                container.style.display = '';
                            } else {
                                container.style.display = 'block';

                                if (container.children[0]) {
                                    container.children[0].classList.add('selected');
                                }
                            }
                        }, {
                            index_name: 'typedCountIndex',
                            direction: 'prev'
                        });
                    },
                    onkeydown: function (event) {
                        var key = event.key,
                            container = document.querySelector('.search-results');

                        if (key === 'Enter') {
                            var item = document.querySelector('.search-results .selected');

                            item.click();

                            container.style.display = '';
                        } else if (key === 'ArrowUp') {
                            var selected = container.querySelector('.selected'),
                                elements = container.children;

                            if (!selected) {
                                elements[elements.length - 1].classList.add('selected');
                            } else if (Array.prototype.indexOf.call(selected.parentNode.children, selected) === 0) {
                                selected.classList.remove('selected');

                                elements[elements.length - 1].classList.add('selected');
                            } else {
                                selected.classList.remove('selected');

                                elements[Array.prototype.indexOf.call(selected.parentNode.children, selected) - 1].classList.add('selected');
                            }

                            //this.value = container.querySelector('.selected').innerText;
                        } else if (key === 'ArrowDown') {
                            var selected = container.querySelector('.selected'),
                                elements = container.children;

                            if (!selected) {
                                elements[0].classList.add('selected');
                            } else if (Array.prototype.indexOf.call(selected.parentNode.children, selected) === elements.length - 1) {
                                selected.classList.remove('selected');

                                elements[0].classList.add('selected');
                            } else {
                                selected.classList.remove('selected');

                                elements[Array.prototype.indexOf.call(selected.parentNode.children, selected) + 1].classList.add('selected');
                            }

                            //this.value = container.querySelector('.selected').innerText;
                        }
                    }
                },
                options: {
                    element: 'button',
                    class: 'satus-button--search-options',
                    style: {
                        backgroundImage: 'url(https://www.google.com/favicon.ico)'
                    },
                    /*click: {
                        element: 'modal',
                        class: 'satus-modal--search-engine',
                        scrollbar: false,
                        onrender: function () {
                            var coordinates = document.querySelector('.satus-button--search-options').getBoundingClientRect(),
                                container = this.querySelector('.satus-modal__container');

                            container.style.left = coordinates.left + 'px';
                            container.style.top = coordinates.top + 'px';
                        },

                        menu: {
                            element: 'menu',

                            google: {
                                element: 'button',
                                text: 'Google',
                                dataset: {
                                    icon: 'https://www.google.com/',
                                    url: 'https://www.google.com/search?q='
                                }
                            },
                            youtube: {
                                element: 'button',
                                text: 'YouTube',
                                dataset: {
                                    icon: 'https://www.youtube.com/',
                                    url: 'https://www.youtube.com/results?search_query='
                                }
                            },
                            duckduckgo: {
                                element: 'button',
                                text: 'DuckDuckGo',
                                dataset: {
                                    icon: 'https://duckduckgo.com/',
                                    url: 'https://duckduckgo.com/?q='
                                }
                            },
                            bing: {
                                element: 'button',
                                text: 'Bing',
                                dataset: {
                                    icon: 'https://bing.com/',
                                    url: 'https://bing.com/search?q='
                                }
                            },
                            yahoo: {
                                element: 'button',
                                text: 'Yahoo!',
                                dataset: {
                                    icon: 'https://search.yahoo.com/',
                                    url: 'https://search.yahoo.com/search?p='
                                }
                            },
                            ecosia: {
                                element: 'button',
                                text: 'Ecosia',
                                dataset: {
                                    icon: 'https://www.ecosia.org/',
                                    url: 'https://www.ecosia.org/search?q='
                                }
                            },
                            history: {
                                element: 'button',
                                text: 'History'
                            }
                        }
                    }*/
                }
            },
            section_right: {
                element: 'section',
                class: 'satus-section--flex-end',

                button: {
                    element: 'button',
                    class: 'satus-button--more',
                    html: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24"><defs/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
                    click: {
                        element: 'modal',
                        class: 'satus-modal--more',

                        menu: {
                            element: 'menu',

                            dark_theme: {
                                element: 'switch',
                                text: 'darkTheme',
                                storage: 'dark-theme'
                            },
                            privacy_mode: {
                                element: 'switch',
                                text: 'privacyMode',
                                storage: 'privacy-mode'
                            },
                            search_autofocus_mode: {
                                element: 'switch',
                                text: 'searchAutofocusMode',
                                storage: 'search_autofocus',
                                value: true
                            }
                        }
                    }
                }
            }
        },
        sidebar: {
            element: 'sidebar',

            tables: {
                element: 'button',
                html: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/></svg>',
                class: 'satus-button--active',
                onclick: function () {
                    renderTables();

                    document.querySelector('.satus-sidebar .satus-button--active').classList.toggle('satus-button--active');

                    this.classList.add('satus-button--active');
                }
            },
            charts: {
                element: 'button',
                html: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/></svg>',
                onclick: function () {
                    document.querySelector('.satus-sidebar .satus-button--active').classList.toggle('satus-button--active');

                    this.classList.add('satus-button--active');

                    var main = document.querySelector('main'),
                        months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
                        week_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                        skeleton = {
                            grid: {
                                element: 'grid',
                                class: 'satus-grid--charts',
                                items: [{
                                        title_hours: {
                                            element: 'h1',
                                            text: 'byHour'
                                        },
                                        hours: {
                                            element: 'vertical-bars',
                                            labels: [],
                                            data: []
                                        }
                                    },
                                    {
                                        title_days: {
                                            element: 'h1',
                                            text: 'byDay'
                                        },
                                        days: {
                                            element: 'vertical-bars',
                                            labels: [],
                                            data: []
                                        }
                                    },
                                    {
                                        title_week: {
                                            element: 'h1',
                                            text: 'byWeek'
                                        },
                                        week: {
                                            element: 'vertical-bars',
                                            labels: [],
                                            data: []
                                        }
                                    },
                                    {
                                        title_months: {
                                            element: 'h1',
                                            text: 'byMonth'
                                        },
                                        months: {
                                            element: 'vertical-bars',
                                            labels: [],
                                            data: []
                                        }
                                    },
                                    {
                                        title_years: {
                                            element: 'h1',
                                            text: 'byYear'
                                        },
                                        years: {
                                            element: 'vertical-bars',
                                            labels: [],
                                            data: []
                                        }
                                    },
                                    {
                                        title_transitions: {
                                            element: 'h1',
                                            text: 'transitions'
                                        },
                                        transitions: {
                                            element: 'vertical-bars',
                                            labels: [],
                                            data: []
                                        }
                                    }
                                ]
                            }
                        };

                    var items = satus.storage.data.visits || {};

                    satus.empty(main);

                    var days_count = 0;

                    for (var year in items) {
                        var year_visits = 0;

                        for (var month in items[year]) {
                            var month_visits = 0;

                            for (var day in items[year][month]) {
                                var day_visits = 0;

                                for (var hour in items[year][month][day]) {
                                    var value = items[year][month][day][hour];

                                    year_visits += value;
                                    day_visits += value;
                                }

                                if (days_count < 30) {
                                    skeleton.grid.items[1].days.data.push(day_visits);
                                    skeleton.grid.items[1].days.labels.push(day);
                                }

                                days_count++;
                            }
                        }

                        skeleton.grid.items[4].years.data.push(year_visits);
                        skeleton.grid.items[4].years.labels.push(year);
                    }

                    var date = new Date(),
                        year = date.getFullYear(),
                        month = date.getMonth(),
                        week_day = date.getDay(),
                        day = date.getDate(),
                        hour = date.getHours();

                    for (var i = 0; i < 12; i++) {
                        if (items[year] && items[year][i]) {
                            var visits = 0;

                            for (var j in items[year][i]) {
                                for (var k in items[year][i][j]) {
                                    visits += items[year][i][j][k];
                                }
                            }

                            skeleton.grid.items[3].months.data.push(visits);
                        } else {
                            skeleton.grid.items[3].months.data.push(0);
                        }

                        skeleton.grid.items[3].months.labels.push(months[i]);
                    }

                    for (var i = 0; i < 24; i++) {
                        if (items[year] && items[year][month] && items[year][month][day] && items[year][month][day][i]) {
                            skeleton.grid.items[0].hours.data.push(items[year][month][day][i]);
                        } else {
                            skeleton.grid.items[0].hours.data.push(0);
                        }

                        skeleton.grid.items[0].hours.labels.push(i);
                    }

                    var date = new Date(date.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -7 : 0)));

                    for (var i = 0; i < 7; i++) {
                        date.setDate(date.getDate() + 1);

                        var year = date.getFullYear(),
                            month = date.getMonth(),
                            day = date.getDate();

                        if (items[year] && items[year][month] && items[year][month][day]) {
                            var visits = 0;

                            for (var hour in items[year][month][day]) {
                                visits += items[year][month][day][hour];
                            }

                            skeleton.grid.items[2].week.data.push(visits);
                        } else {
                            skeleton.grid.items[2].week.data.push(0);
                        }

                        skeleton.grid.items[2].week.labels.push(week_days[i]);
                    }

                    for (var key in HM.transitions) {
                        var item = HM.transitions[key];

                        skeleton.grid.items[5].transitions.labels.push(item.transition);
                        skeleton.grid.items[5].transitions.data.push(item.visitCount);
                    }

                    satus.render(skeleton, main);
                }
            },
            status: {
                element: 'button',
                html: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 5V4c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v1h-1v4c0 .55.45 1 1 1h1v7c0 1.1-.9 2-2 2s-2-.9-2-2V7c0-2.21-1.79-4-4-4S5 4.79 5 7v7H4c-.55 0-1 .45-1 1v4h1v1c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1h1v-4c0-.55-.45-1-1-1H7V7c0-1.1.9-2 2-2s2 .9 2 2v10c0 2.21 1.79 4 4 4s4-1.79 4-4v-7h1c.55 0 1-.45 1-1V5h-1z"/></svg>',
                onclick: function () {
                    var main = document.querySelector('main');

                    satus.empty(main);

                    var skeleton = {
                        element: 'grid',
                        items: [{
                            element: 'table',
                            class: 'satus-table--broken-links',
                            columns: [{
                                    label: 'visits',
                                    key: 'visitCount'
                                },
                                {
                                    label: 'domain',
                                    key: 'domain',
                                    intercept: function (cell, value, index, row) {
                                        var icon = document.createElement('div'),
                                            a = document.createElement('a'),
                                            link = row.data.url;

                                        icon.className = 'favicon';
                                        icon.style.background = 'url(chrome://favicon/' + link + ') no-repeat center';

                                        a.textContent = satus.locale.get(value);
                                        a.href = link;

                                        cell.appendChild(icon);
                                        cell.appendChild(a);
                                    }
                                },
                                {
                                    label: 'status',
                                    key: 'url',
                                    intercept: function (cell, value, index, row) {
                                        var xhr = new XMLHttpRequest();

                                        xhr.onreadystatechange = function () {
                                            cell.textContent = this.status;

                                            if (this.status === 200) {
                                                cell.style.color = '#0f0';
                                            } else if (this.status !== 0) {
                                                cell.style.color = '#f00';
                                            }
                                        };

                                        try {
                                            xhr.open('GET', row.data.url, true);
                                            xhr.send();
                                        } catch (error) {}
                                    }
                                }
                            ],
                            onpage: function () {
                                var table = this;

                                DB.get('domains', function (items) {
                                    table.data = items;

                                    table.update();
                                }, {
                                    index_name: table.order.key + 'Index',
                                    direction: table.order.by === 'asc' ? 'next' : 'prev',
                                    offset: table.pageIndex * 100 - 100
                                });
                            },
                            onsort: function () {
                                var table = this;

                                DB.get('domains', function (items) {
                                    table.data = items;

                                    table.update();
                                }, {
                                    index_name: table.order.key + 'Index',
                                    direction: table.order.by === 'asc' ? 'next' : 'prev',
                                    offset: table.pageIndex * 100 - 100
                                });
                            }
                        }]
                    };

                    DB.get('domains', function (items) {
                        DB.count('domains', function (count) {
                            skeleton.items[0].data = items;
                            skeleton.items[0].count = count;

                            satus.render(skeleton, main);

                            document.querySelector('.satus-table--broken-links').update();
                        });
                    }, {
                        index_name: 'visitCountIndex',
                        direction: 'prev'
                    });

                    document.querySelector('.satus-sidebar .satus-button--active').classList.toggle('satus-button--active');

                    this.classList.add('satus-button--active');
                }
            },
            storagee: {
                element: 'button',
                html: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
                onclick: function () {
                    var main = document.querySelector('main');

                    satus.empty(main);

                    var skeleton = {
                        element: 'grid',
                        class: 'satus-grid--data',
                        items: [
                            [{
                                    element: 'h1',
                                    text: 'browser.storage.local'
                                },
                                {
                                    element: 'div',
                                    onrender: function () {
                                        function parse(object, parent) {
                                            var ul = document.createElement('ul');

                                            ul.className = 'satus-tree';

                                            for (var key in object) {
                                                var li = document.createElement('li'),
                                                    button = document.createElement('button');

                                                li.className = 'satus-tree--item';

                                                button.className = 'satus-button';
                                                button.innerHTML = '<b>' + key + '</b>';
                                                button.object = object[key];

                                                if (typeof object[key] === 'object') {
                                                    button.className += ' satus-button--object';

                                                    button.addEventListener('click', function () {
                                                        this.classList.toggle('active');

                                                        if (this.classList.contains('active')) {
                                                            parse(this.object, this.parentNode);
                                                        } else {
                                                            this.nextElementSibling.remove();
                                                        }
                                                    });
                                                } else {
                                                    button.innerHTML += ': ' + object[key];
                                                }

                                                li.appendChild(button);
                                                ul.appendChild(li);
                                            }

                                            parent.appendChild(ul);
                                        }

                                        parse(satus.storage.data, this);
                                    }
                                }
                            ],
                            [{
                                    element: 'h1',
                                    text: 'IndexedDB'
                                },
                                {
                                    element: 'div',
                                    onrender: function () {
                                        function parse(object, parent) {
                                            var ul = document.createElement('ul');

                                            ul.className = 'satus-tree';

                                            for (var key in object) {
                                                var li = document.createElement('li'),
                                                    button = document.createElement('button');

                                                li.className = 'satus-tree--item';

                                                button.className = 'satus-button';
                                                button.innerHTML = '<b>' + key + '</b>';
                                                button.object = object[key];

                                                if (typeof object[key] === 'object') {
                                                    button.className += ' satus-button--object';

                                                    button.addEventListener('click', function () {
                                                        this.classList.toggle('active');

                                                        if (this.classList.contains('active')) {
                                                            parse(this.object, this.parentNode);
                                                        } else {
                                                            this.nextElementSibling.remove();
                                                        }
                                                    });
                                                } else {
                                                    button.innerHTML += ': ' + object[key];
                                                }

                                                li.appendChild(button);
                                                ul.appendChild(li);
                                            }

                                            parent.appendChild(ul);
                                        }

                                        var self = this,
                                            data = {},
                                            threads = 0;

                                        for (var i = 0, l = DB.indexedDB.objectStoreNames.length; i < l; i++) {
                                            DB.get(DB.indexedDB.objectStoreNames[i], function (items, object_store_name) {
                                                data[object_store_name] = items;

                                                threads--;

                                                if (threads === 0) {
                                                    parse(data, self);
                                                }
                                            }, {});

                                            threads++;
                                        }
                                    }
                                }
                            ]
                        ]
                    };

                    satus.render(skeleton, main);

                    document.querySelector('.satus-sidebar .satus-button--active').classList.toggle('satus-button--active');

                    this.classList.add('satus-button--active');
                }
            },
            bookmarks: {
                element: 'button',
                html: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"/</svg>',
                onclick: function () {
                    var main = document.querySelector('main');

                    satus.empty(main);

                    var skeleton = {
                        element: 'grid',
                        class: 'satus-grid--data',
                        items: [
                            [{
                                    element: 'h1',
                                    text: 'bookmarks'
                                },
                                {
                                    element: 'div',
                                    class: 'satus-div--bookmarks',
                                    onrender: function () {
                                        var self = this;

                                        function parse(object, parent) {
                                            var ul = document.createElement('ul');

                                            ul.className = 'satus-tree';

                                            for (var key in object) {
                                                if (typeof object[key] === 'object') {
                                                    if (object[key].children) {
                                                        var li = document.createElement('li');

                                                        li.className = 'satus-tree--item';

                                                        var button = document.createElement('button');

                                                        button.className = 'satus-button satus-button--object';
                                                        button.object = object[key];
                                                        button.textContent = object[key].title;

                                                        button.addEventListener('click', function () {
                                                            this.classList.toggle('active');

                                                            if (this.classList.contains('active')) {
                                                                parse(this.object, this.parentNode);
                                                            } else {
                                                                this.nextElementSibling.remove();
                                                            }
                                                        });

                                                        li.appendChild(button);
                                                        ul.appendChild(li);
                                                    } else if (object[key].url) {
                                                        var li = document.createElement('li');

                                                        li.className = 'satus-tree--item';
                                                        var a = document.createElement('a'),
                                                            img = document.createElement('img');

                                                        img.src = 'chrome://favicon/' + object[key].url;

                                                        a.href = object[key].url;
                                                        a.textContent = object[key].title || object[key].url;

                                                        li.appendChild(img);
                                                        li.appendChild(a);
                                                        ul.appendChild(li);
                                                    } else {
                                                        parse(object[key], ul);
                                                    }
                                                }
                                            }

                                            parent.appendChild(ul);
                                        }

                                        chrome.bookmarks.getTree(function (bookmarks) {
                                            parse(bookmarks[0].children, self);
                                        });
                                    }
                                }
                            ]
                        ]
                    };

                    satus.render(skeleton, main);

                    document.querySelector('.satus-sidebar .satus-button--active').classList.toggle('satus-button--active');

                    this.classList.add('satus-button--active');
                }
            },
            settings: {
                element: 'button',
                html: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46a.5.5 0 00-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.488.488 0 0014 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.566.566 0 00-.18-.03c-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46a.5.5 0 00.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
                onclick: function () {
                    var main = document.querySelector('main');

                    satus.empty(main);

                    var skeleton = {
                        grid: {
                            element: 'grid',
                            class: 'satus-grid--data',
                            items: [{
                                title: {
                                    element: 'h1',
                                    text: 'searchEngine'
                                },
                                search_engine: {
                                    element: 'select',
                                    storage: 'search-engine',
                                    options: [{
                                            text: 'Google',
                                            value: 'google',
                                            dataset: {
                                                url: 'https://www.google.com/search?q=%s'
                                            }
                                        },
                                        {
                                            text: 'DuckDuckGo',
                                            value: 'duckduckgo',
                                            dataset: {
                                                url: 'https://duckduckgo.com/?q=%s'
                                            }
                                        },
                                        {
                                            text: 'Bing',
                                            value: 'bing',
                                            dataset: {
                                                url: 'https://www.bing.com/search?q=%s'
                                            }
                                        },
                                        {
                                            text: 'Ecosia',
                                            value: 'ecosia',
                                            dataset: {
                                                url: 'https://www.ecosia.org/search?q=%s'
                                            }
                                        }
                                    ],
                                    onchange: function () {
                                        var favic = document.querySelector('.satus-button--search-options');

                                        if (favic && this.value) {
                                            favic.style.backgroundImage = 'url(' + SEARCH_ENGINE[this.value].favicon + ')';

                                            document.querySelector('.search-field').placeholder = 'Search ' + SEARCH_ENGINE[this.value].name + ' or type a URL';
                                        }
                                    }
                                }
                            }]
                        }
                    };

                    satus.render(skeleton, main);

                    document.querySelector('.satus-sidebar .satus-button--active').classList.toggle('satus-button--active');

                    this.classList.add('satus-button--active');
                }
            }
        },
        main: {
            element: 'main'
        },
        footer: {
            element: 'footer',

            storage_size: {
                element: 'span',
                class: 'satus-footer__storage-size'
            },
            indexeddb_size: {
                element: 'span',
                class: 'satus-footer__indexeddb-size'
            }
        }
    },
    tables = {
        element: 'grid',
        dataset: {
            edit: true
        },
        columns: [
            // CATEGORIES
            {
                element: 'table',
                class: 'satus-table--categories',
                columns: [{
                        label: 'visits',
                        key: 'visitCount',
                        sort: 'desc'
                    },
                    {
                        label: '',
                        key: 'path',
                        sort: false,
                        columns: [{
                                label: 'visits',
                                key: 'visitCount',
                                sort: 'desc'
                            },
                            {
                                key: 'path'
                            },
                            {
                                label: 'domain',
                                key: 'key',
                                intercept: function (cell, value, index, row) {
                                    var icon = document.createElement('div'),
                                        a = document.createElement('a'),
                                        link = 'https://' + value;

                                    icon.className = 'favicon';
                                    icon.style.background = 'url(chrome://favicon/' + link + ') no-repeat center';

                                    a.textContent = satus.locale.get(value);
                                    a.href = link;

                                    cell.appendChild(icon);
                                    cell.appendChild(a);
                                }
                            }
                        ]
                    },
                    {
                        label: 'category',
                        key: 'name',
                        intercept: function (cell, value, index) {
                            var icon = document.createElement('div'),
                                text = document.createTextNode(satus.locale.get(value));

                            icon.className = 'favicon';
                            icon.style.backgroundPosition = ((-24 * index + Math.floor(index / 4) * 96) - 1) + 'px ' + (Math.floor(index / 4) * -24 - 1) + 'px';

                            cell.appendChild(icon);
                            cell.appendChild(text);
                        }
                    }
                ]
            },

            // DOMAINS
            {
                element: 'table',
                class: 'satus-table--domains',
                db_object_name: 'domains',
                columns: [{
                        label: 'visits',
                        key: 'visitCount',
                        sort: 'desc'
                    },
                    {
                        label: '',
                        key: 'path',
                        sort: false,
                        columns: [{
                                label: 'visits',
                                key: 'visitCount',
                                sort: 'desc'
                            },
                            {
                                key: 'path'
                            },
                            {
                                label: 'domain',
                                key: 'key'
                            }
                        ]
                    },
                    {
                        label: 'domain',
                        key: 'domain',
                        intercept: function (cell, value, index, row) {
                            var icon = document.createElement('div'),
                                a = document.createElement('a'),
                                link = row.data.url;

                            icon.className = 'favicon';
                            icon.style.background = 'url(chrome://favicon/' + link + ') no-repeat center';

                            a.textContent = satus.locale.get(value);
                            a.href = link;

                            cell.appendChild(icon);
                            cell.appendChild(a);
                        }
                    }
                ],
                onpage: function () {
                    var table = this;

                    DB.get('domains', function (items) {
                        table.data = items;

                        table.update();
                    }, {
                        index_name: table.order.key + 'Index',
                        direction: table.order.by === 'asc' ? 'next' : 'prev',
                        offset: table.pageIndex * 100 - 100
                    });
                },
                onsort: function () {
                    var table = this;

                    DB.get('domains', function (items) {
                        table.data = items;

                        table.update();
                    }, {
                        index_name: table.order.key + 'Index',
                        direction: table.order.by === 'asc' ? 'next' : 'prev',
                        offset: table.pageIndex * 100 - 100
                    });
                },
                onsearch: function (query) {
                    var table = this;

                    DB.search(query, 'domains', ['url'], function (items) {
                        table.data = items;

                        table.update();
                    });
                }
            },

            // PAGES
            {
                element: 'table',
                class: 'satus-table--pages',
                db_object_name: 'pages',
                columns: [{
                        label: 'visits',
                        key: 'visitCount',
                        sort: 'desc',
                    },
                    {
                        label: 'title',
                        key: 'title',
                        intercept: function (cell, value, index, row) {
                            var icon = document.createElement('div'),
                                a = document.createElement('a'),
                                link = row.data.url,
                                domain = link.match(REGEX_DOMAIN);

                            icon.className = 'favicon';
                            icon.style.background = 'url(chrome://favicon/' + domain[0] + ') no-repeat center';

                            a.textContent = value;
                            a.href = link;

                            cell.appendChild(icon);
                            cell.appendChild(a);
                        }
                    },
                    {
                        label: '★',
                        key: 'visitCount',
                        sort: false,
                        intercept: function (cell, value, index, row) {
                            var button = document.createElement('button');

                            button.className = 'satus-button';
                            button.textContent = BOOKMARKS.hasOwnProperty(row.data.url) ? '★' : '☆';

                            button.addEventListener('click', function () {
                                if (this.textContent === '★') {
                                    this.textContent = '☆';

                                    chrome.bookmarks.remove(BOOKMARKS[this.parentNode.parentNode.data.url]);
                                } else {
                                    var self = this;

                                    this.textContent = '★';

                                    chrome.bookmarks.create({
                                        title: this.parentNode.parentNode.data.title,
                                        url: this.parentNode.parentNode.data.url,
                                        parentId: '1'
                                    }, function (item) {
                                        BOOKMARKS[self.parentNode.parentNode.data.url] = item.id;
                                    });
                                }
                            });

                            cell.appendChild(button);
                        }
                    },
                    {
                        label: 'tags',
                        key: 'tags',
                        intercept: function (cell, value, index) {
                            var input = document.createElement('input');

                            input.type = 'text';
                            input.className = 'satus-input';
                            input.value = value || '';

                            input.addEventListener('input', function () {
                                var transaction = DB.transaction('pages', 'readwrite'),
                                    pages_object = transaction.objectStore('pages');

                                this.parentNode.parentNode.data.tags = this.value;

                                pages_object.put(this.parentNode.parentNode.data);
                            });

                            cell.appendChild(input);
                        }
                    }
                ],
                onpage: function () {
                    var table = this;

                    DB.get('pages', function (items) {
                        table.data = items;

                        table.update();
                    }, {
                        index_name: table.order.key + 'Index',
                        direction: table.order.by === 'asc' ? 'next' : 'prev',
                        offset: table.pageIndex * 100 - 100
                    });
                },
                onsort: function () {
                    var table = this;

                    DB.get('pages', function (items) {
                        table.data = items;

                        table.update();
                    }, {
                        index_name: table.order.key + 'Index',
                        direction: table.order.by === 'asc' ? 'next' : 'prev',
                        offset: table.pageIndex * 100 - 100
                    });
                },
                onsearch: function (query) {
                    var table = this;

                    DB.search(query, 'pages', ['url', 'title'], function (items) {
                        table.data = items;

                        table.update();
                    });
                }
            },

            // PARAMS
            {
                element: 'table',
                class: 'satus-table--params',
                db_object_name: 'params',
                columns: [{
                        label: 'visits',
                        key: 'visitCount',
                        sort: 'desc'
                    },
                    {
                        label: '',
                        key: 'path',
                        sort: false,
                        columns: [{
                                label: 'visits',
                                key: 'visitCount',
                                sort: 'desc'
                            },
                            {
                                key: 'path'
                            },
                            {
                                label: 'domain',
                                key: 'key'
                            }
                        ]
                    },
                    {
                        label: 'domain',
                        key: 'domain',
                        intercept: function (cell, value, index, row) {
                            var link = row.data.url,
                                icon = document.createElement('div'),
                                a = document.createElement('a');

                            icon.className = 'favicon';
                            icon.style.background = 'url(chrome://favicon/' + link + ') no-repeat center';

                            a.textContent = satus.locale.get(value);
                            a.href = link;

                            cell.appendChild(icon);
                            cell.appendChild(a);
                        }
                    }
                ],
                onpage: function () {
                    var table = this;

                    DB.get('params', function (items) {
                        table.data = items;

                        table.update();
                    }, {
                        index_name: table.order.key + 'Index',
                        direction: table.order.by === 'asc' ? 'next' : 'prev',
                        offset: table.pageIndex * 100 - 100
                    });
                },
                onsort: function () {
                    var table = this;

                    DB.get('params', function (items) {
                        table.data = items;

                        table.update();
                    }, {
                        index_name: table.order.key + 'Index',
                        direction: table.order.by === 'asc' ? 'next' : 'prev',
                        offset: table.pageIndex * 100 - 100
                    });
                },
                onsearch: function (query) {
                    var table = this;

                    DB.search(query, 'params', ['url'], function (items) {
                        table.data = items;

                        table.update();
                    });
                }
            },

            [
                // PINNED TABS
                {
                    element: 'div',
                    class: 'satus-tab-manager',
                    onrender: function () {
                        this.appendChild(HM.tabs);
                    }
                },

                // RECENTLY CLOSED
                {
                    element: 'table',
                    class: 'satus-table--recently-closed',
                    columns: [{
                            label: 'timeAgo',
                            key: '0'
                        },
                        {
                            label: 'title',
                            key: '1',
                            intercept: function (cell, value, index, row) {
                                var link = row.data[2],
                                    icon = document.createElement('div'),
                                    a = document.createElement('a');

                                icon.className = 'favicon';
                                icon.style.background = 'url(chrome://favicon/' + link + ') no-repeat center';

                                a.textContent = satus.locale.get(value);
                                a.href = link;

                                cell.appendChild(icon);
                                cell.appendChild(a);
                            }
                        }
                    ]
                }
            ]
        ]
    };

satus.render(skeleton);

function updateSearchComponent() {

}

function renderTables() {
    satus.empty(document.querySelector('main'));

    satus.render(tables, document.querySelector('.satus-main'));

    DB.get('domains', function (items) {
        var categories = [];

        for (var key in CATEGORIES) {
            var category = CATEGORIES[key],
                path = {};

            if (!category.visitCount) {
                category.visitCount = 0;
            }

            for (var link in category) {
                for (var key2 in items) {
                    var domain = items[key2].domain;

                    if (domain.indexOf(link) !== -1) {
                        category[link] = items[key2].visitCount;

                        category.visitCount += items[key2].visitCount;
                    }
                }

                path[link] = {
                    key: link,
                    visitCount: category[link]
                };
            }

            categories.push({
                name: key,
                path: path,
                visitCount: category.visitCount
            });
        }

        var table_pages = document.querySelector('.satus-table--categories');

        table_pages.data = categories.sort(function (a, b) {
            return b.visitCount - a.visitCount;
        });
        table_pages.count = categories.length;

        table_pages.update();

        DB.count('domains', function (count) {
            var table_pages = document.querySelector('.satus-table--domains');

            table_pages.data = items;
            table_pages.count = count;

            table_pages.update();
        });
    }, {
        index_name: 'visitCountIndex',
        direction: 'prev'
    });

    DB.get('pages', function (items) {
        DB.count('pages', function (count) {
            var table_pages = document.querySelector('.satus-table--pages');

            table_pages.data = items;
            table_pages.count = count;

            table_pages.update();
        });
    }, {
        index_name: 'visitCountIndex',
        direction: 'prev'
    });

    //getDBData('params', 'visitCountIndex', 'desc', 0, function (data, count) {
    DB.get('params', function (items) {
        DB.count('params', function (count) {
            var table_pages = document.querySelector('.satus-table--params');

            table_pages.data = items;
            table_pages.count = count;

            table_pages.update();
        });
    }, {
        index_name: 'visitCountIndex',
        direction: 'prev'
    });

    var table_recently_closed = document.querySelector('.satus-table--recently-closed');

    table_recently_closed.data = satus.storage.data.recently_closed || [];
    table_recently_closed.count = table_recently_closed.data.length;

    table_recently_closed.update();
}

function updateTabManager() {
    var container = document.querySelector('.satus-tab-manager'),
        tab_manager_skeleton = {
            head: {
                element: 'h1',
                class: 'satus-h1--title',
                text: 'Tabs'
            },
            body: {
                element: 'div'
            }
        },
        window_index = 0;

    if (container) {
        satus.empty(container);

        for (var i in TABS) {
            tab_manager_skeleton.body[i] = {
                element: 'div',
                class: 'satus-div--window' + (window_index === 0 ? ' active' : ''),

                title: {
                    element: 'button',
                    class: 'satus-button--window',
                    text: 'window',
                    onclick: function () {
                        this.parentNode.classList.toggle('active');
                    }
                }
            };

            for (var j in TABS[i]) {
                var tab = TABS[i][j];

                tab_manager_skeleton.body[i]['row-' + j] = {
                    element: 'div',
                    class: 'satus-tab-manager__row',
                    dataset: {
                        windowId: i,
                        index: j
                    },
                    events: {
                        mousedown: {
                            type: 'mousedown',
                            listener: function (event) {
                                if (event.button === 0) {
                                    var button = this,
                                        parent = button.parentNode,
                                        index = Array.prototype.slice.call(parent.children).indexOf(button),
                                        rect = button.getBoundingClientRect(),
                                        offset_x = event.clientX - rect.left,
                                        offset_y = event.clientY - rect.top,
                                        selected;

                                    button.classList.add('active');
                                    button.style.width = rect.width + 'px';

                                    event.preventDefault();
                                    event.stopPropagation();

                                    document.body.appendChild(button);

                                    function mousemove(event) {
                                        var founded = false;

                                        button.style.left = event.clientX - offset_x + 'px';
                                        button.style.top = event.clientY - offset_y + 'px';

                                        for (var i = 0, l = event.path.length - 2; i < l; i++) {
                                            var element = event.path[i];

                                            if (element.className.indexOf('satus-tab-manager__row') !== -1) {
                                                if (selected !== element) {
                                                    if (selected) {
                                                        selected.classList.remove('selected--before');
                                                        selected.classList.remove('selected--after');
                                                    }

                                                    selected = element;
                                                } else {
                                                    var selected_rect = selected.getBoundingClientRect();

                                                    if (event.clientY - selected_rect.top < selected_rect.height / 2) {
                                                        selected.classList.remove('selected--after');
                                                        selected.classList.add('selected--before');
                                                    } else {
                                                        selected.classList.remove('selected--before');
                                                        selected.classList.add('selected--after');
                                                    }
                                                }

                                                founded = true;
                                            }
                                        }

                                        if (founded === false && selected) {
                                            selected.classList.remove('selected--before');
                                            selected.classList.remove('selected--after');

                                            selected = null;
                                        }
                                    }

                                    function mouseup(event) {
                                        event.preventDefault();
                                        event.stopPropagation();

                                        button.classList.remove('active');

                                        if (selected) {
                                            selected.classList.remove('selected--before');
                                            selected.classList.remove('selected--after');
                                        }

                                        parent.insertBefore(button, selected || parent.children[index]);

                                        button.dataset.index = Array.prototype.slice.call(parent.children).indexOf(button);

                                        chrome.tabs.move(TABS[Number(button.dataset.windowId)][index - 1].id, {
                                            index: Number(button.dataset.index) - 1
                                        });

                                        window.removeEventListener('mousemove', mousemove);
                                        window.removeEventListener('mouseup', mouseup);

                                        return false;
                                    }

                                    window.addEventListener('mousemove', mousemove);
                                    window.addEventListener('mouseup', mouseup, true);

                                    return false;
                                }
                            },
                            options: true
                        }
                    },

                    pin: {
                        element: 'button',
                        dataset: {
                            pinned: tab.pinned,
                            id: tab.id
                        },
                        onclick: function () {
                            this.dataset.pinned = this.dataset.pinned != 'true';

                            chrome.tabs.update(Number(this.dataset.id), {
                                pinned: this.dataset.pinned == 'true'
                            });
                        }
                    },
                    favicon: {
                        element: 'div',
                        class: 'favicon',
                        style: {
                            background: 'url(chrome://favicon/' + tab.url.match(REGEX_DOMAIN)[0] + ') center center no-repeat'
                        }
                    },
                    title: {
                        element: 'a',
                        text: tab.title,
                        href: tab.url
                    }
                };
            }

            window_index++;
        }

        satus.render(tab_manager_skeleton, container);
    }
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

function updateHistoryData(items, transitions, domains, params) {
    var pages_object_store = DB.indexedDB.transaction('pages', 'readwrite').objectStore('pages'),
        visits = satus.storage.data.visits || {},
        threads = 0;

    for (var i = 0, l = items.length; i < l; i++) {
        var item = items[i],
            parts = item.url.match(REGEX_PARTS),
            link = parts[0].substr(1),
            domain = link.replace(/^www\./, '');

        if (!domains[domain]) {
            domains[domain] = {
                url: item.url.match(REGEX_PROTOCOL)[0] + '://' + link,
                typedCount: 0,
                visitCount: 0,
                path: {}
            };
        }

        var object = domains[domain].path;

        for (var j = 1, k = parts.length; j < k; j++) {
            var name = parts[j];

            if (!object[name]) {
                object[name] = {
                    visitCount: 0,
                    path: {}
                };
            }

            object.visitCount += item.visitCount;

            object = object[name].path;

            if (j + 1 === k) {
                object.lastVisitTime = item.lastVisitTime;
                object.title = item.title;
                object.typedCount = item.typedCount;
                object.visitCount = item.visitCount;
            }
        }

        domains[domain].typedCount += item.typedCount;
        domains[domain].visitCount += item.visitCount;

        pages_object_store.put({
            'id': item.id,
            'lastVisitTime': item.lastVisitTime,
            'tags': '',
            'title': item.title,
            'typedCount': item.typedCount,
            'url': item.url,
            'visitCount': item.visitCount
        });

        if (item.url.indexOf('?') !== -1) {
            try {
                var decoded_url = decodeURIComponent(item.url);
            } catch (err) {
                var decoded_url = item.url;
            }

            var param = decoded_url.match(REGEX_PARAMS);

            if (param) {
                var domain = parts[0].substr(1).replace(/^www\./, '');

                if (!params[domain]) {
                    params[domain] = {
                        domain: domain,
                        url: item.url.match(REGEX_PROTOCOL)[0] + '://' + domain,
                        visitCount: 0,
                        path: {}
                    };
                }

                params[domain].visitCount += item.visitCount;

                if (!params[domain].path[param[1]]) {
                    params[domain].path[param[1]] = {
                        visitCount: 0,
                        path: {}
                    };
                }

                params[domain].path[param[1]].visitCount += item.visitCount;

                if (!params[domain].path[param[1]].path[param[2]]) {
                    params[domain].path[param[1]].path[param[2]] = {
                        visitCount: 0,
                        path: {}
                    };
                }

                params[domain].path[param[1]].path[param[2]].visitCount += item.visitCount;
                params[domain].path[param[1]].path[param[2]].path[decoded_url] = item.visitCount;
            }
        }

        chrome.history.getVisits({
            url: item.url
        }, function (visitItems) {
            for (var i = 0, l = visitItems.length; i < l; i++) {
                var visitItem = visitItems[i],
                    date = new Date(visitItem.visitTime),
                    year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate(),
                    hours = date.getHours();

                if (!visits[year]) {
                    visits[year] = {};
                }

                if (!visits[year][month]) {
                    visits[year][month] = {};
                }

                if (!visits[year][month][day]) {
                    visits[year][month][day] = {};
                }

                if (!visits[year][month][day][hours]) {
                    visits[year][month][day][hours] = 0;
                }

                visits[year][month][day][hours]++;

                if (!HM.transitions[visitItem.transition]) {
                    HM.transitions[visitItem.transition] = {
                        transition: visitItem.transition,
                        visitCount: 0
                    };
                }

                HM.transitions[visitItem.transition].visitCount++;
            }

            threads--;

            if (threads === 0) {
                saveHistoryData(domains, params, transitions, visits);
            }
        });

        threads++;
    }
}

function saveHistoryData(domains, params, transitions, visits) {
    var domains_object_store = DB.indexedDB.transaction('domains', 'readwrite').objectStore('domains'),
        params_object_store = DB.indexedDB.transaction('params', 'readwrite').objectStore('params'),
        transitions_object_store = DB.indexedDB.transaction('transitions', 'readwrite').objectStore('transitions');

    for (var key in domains) {
        domains[key].domain = key;

        domains_object_store.put(domains[key]);
    }

    for (var key in params) {
        params_object_store.put(params[key]);
    }

    for (var key in HM.transitions) {
        transitions_object_store.put(HM.transitions[key]);
    }

    navigator.storage.estimate().then(function (result) {
        document.querySelector('.satus-footer__indexeddb-size').textContent = 'IndexedDB: ' + (result.usageDetails.indexedDB / 8e+6).toFixed(2) + ' MB';
    });

    chrome.storage.local.set({
        database_cached: true,
        visits: visits
    });

    renderTables();
}

satus.storage.load(function (items) {
    if (items.search_autofocus !== false && location.href.indexOf('?loaded') === -1) {
        location.replace(location.href + '?loaded');

        return false;
    }

    satus.locale.load('_locales/en/messages.json', function () {
        var main = document.querySelector('.satus-main');

        satus.storage.attributes = [
            'dark-theme',
            'privacy-mode'
        ];

        satus.render({
            element: 'div',
            class: 'satus-main--status',
            text: 'loadingBrowserHistory'
        }, main);

        DB.open(function () {
            HM.history.get(function (items) {
                if (items.length > 0) {
                    satus.empty(main);

                    satus.render({
                        element: 'div',
                        class: 'satus-main--status',
                        text: 'dataProcessing'
                    }, main);

                    DB.get('transitions', function (transitions) {
                        var keys = [];

                        HM.transitions = transitions || [];

                        for (var i = 0, l = items.length; i < l; i++) {
                            var parts = items[i].url.match(REGEX_PARTS),
                                link = parts[0].substr(1);

                            keys.push(link.replace(/^www\./, ''));
                        }

                        DB.getByKeys(keys, 'domains', function (domains) {
                            DB.getByKeys(keys, 'params', function (params) {
                                updateHistoryData(items, transitions, domains, params);
                            });
                        });

                        chrome.storage.local.set({
                            database_version: (satus.storage.data.database_version || 1) + 1
                        });
                    }, {});
                } else {
                    renderTables();
                }
            });
        });
    });
});


/*--------------------------------------------------------------
# MESSAGES
--------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (request, sender) {

});