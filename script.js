/*--------------------------------------------------------------
>>> SCRIPT
----------------------------------------------------------------
# Global variables
# Time
# Search bar
# Table
    # Head
    # Body
# Initialization
--------------------------------------------------------------*/

console.time();

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var TIME = new Date().getTime(),
    BOOKMARKS = {},
    TAGS = {},
    ALL_LOADED = false,
    SEARCH = [],
    TABLE = {
        4: document.querySelector('.table[data-table-index="4"]'),
        0: document.querySelector('.table[data-table-index="0"]'),
        1: document.querySelector('.table[data-table-index="1"]'),
        2: document.querySelector('.table[data-table-index="2"]'),
        3: document.querySelector('.table[data-table-index="3"]'),
        5: document.querySelector('.table[data-table-index="5"]')
    },
    TABLE_BODY = {
        4: document.querySelector('.table[data-table-index="4"] .table__body'),
        0: document.querySelector('.table[data-table-index="0"] .table__body'),
        1: document.querySelector('.table[data-table-index="1"] .table__body'),
        2: document.querySelector('.table[data-table-index="2"] .table__body'),
        3: document.querySelector('.table[data-table-index="3"] .table__body'),
        5: document.querySelector('.table[data-table-index="5"] .table__body')
    },
    CATEGORIES = {},
    TOP_SITES = {},
    current_search_result = document.querySelector('.current-search-result'),
    search_results_element = document.querySelector('.search-results');

TABLE[0].data = {
    table: [],
    page: 1,
    column: 0,
    order_by: 'desc'
};

TABLE[1].data = {
    table: [],
    page: 1,
    column: 0,
    order_by: 'desc'
};

TABLE[2].data = {
    table: [],
    page: 1,
    column: 0,
    order_by: 'desc'
};

TABLE[4].data = {
    table: [],
    page: 1,
    column: 0,
    order_by: 'desc'
};

TABLE[5].data = {
    table: [],
    page: 1,
    column: 0,
    order_by: 'desc'
};


/*--------------------------------------------------------------
# TIME UPDATE
--------------------------------------------------------------*/

setInterval(function() {
    TIME += 60000;
}, 60000);


/*--------------------------------------------------------------
# SEARCH BAR
--------------------------------------------------------------*/

function initSearchBar() {
    document.querySelector('header > input').addEventListener('focus', function() {
        if (this.value.length > 0) {
            search_results_element.style.display = 'block';
        }
    });

    document.querySelector('header > input').addEventListener('blur', function() {
        search_results_element.style.display = '';
    });

    document.querySelector('header > input').addEventListener('input', function(event) {
        var results = [],
            first = null,
            cursor_position = this.selectionStart;

        search_results_element.innerHTML = '';

        if (this.value.length > 0 && event.inputType !== 'deleteContentBackward') {
            /*for (var i = 0; i < TOP_SITES_length; i++) {
                var result = TOP_SITES[i];

                if (result.indexOf(this.value) === 0 && first === null) {
                    first = result;
                } else if (result.indexOf(this.value) !== -1) {
                    results.push(result);
                }
            }*/

            /*for (var key in BOOKMARKS) {
                if (key.indexOf(this.value) !== -1) {
                    results.push([key.match(/\/\/(.*)/)[1], 9999]);
                }
            }*/

            for (var i = 0, l = SEARCH.length; i < l; i++) {
                var item = SEARCH[i];

                if (item[0].indexOf(this.value) === 0) {
                    results.push(item);
                }
            }

            results = sort(results, 1);

            results = results.slice(0, 6);

            for (var i = 0, l = results.length; i < l; i++) {
                var item = document.createElement('div');

                item.innerText = results[i][0];
                item.style.backgroundImage = 'url(https://' + results[i][0].match(/[^/]+/)[0] + '/favicon.ico)';

                item.addEventListener('click', function() {
                    search_results_element.style.display = 'none';

                    window.open('https://' + this.innerText, '_self');
                });

                search_results_element.appendChild(item);
            }

            first = results[0][0];

            if (first) {
                search_results_element.children[0].className = 'selected';

                this.value = first;
                this.setSelectionRange(cursor_position, this.value.length);
            }

            if (this.value.length > 0) {
                search_results_element.style.display = 'block';
            } else {
                search_results_element.style.display = '';
            }
        }
    });

    document.querySelector('header > input').addEventListener('keydown', function(event) {
        var key = event.key;

        if (key === 'Enter') {
            window.open('https://' + this.value, '_self');
        } else if (key === 'ArrowUp') {
            var selected = search_results_element.querySelector('.selected'),
                elements = search_results_element.children;

            if (!selected) {
                elements[elements.length - 1].classList.add('selected');
            } else if (Array.prototype.indexOf.call(selected.parentNode.children, selected) === 0) {
                selected.classList.remove('selected');

                elements[elements.length - 1].classList.add('selected');
            } else {
                selected.classList.remove('selected');

                elements[Array.prototype.indexOf.call(selected.parentNode.children, selected) - 1].classList.add('selected');
            }

            this.value = search_results_element.querySelector('.selected').innerText;
        } else if (key === 'ArrowDown') {
            var selected = search_results_element.querySelector('.selected'),
                elements = search_results_element.children;

            if (!selected) {
                elements[0].classList.add('selected');
            } else if (Array.prototype.indexOf.call(selected.parentNode.children, selected) === elements.length - 1) {
                selected.classList.remove('selected');

                elements[0].classList.add('selected');
            } else {
                selected.classList.remove('selected');

                elements[Array.prototype.indexOf.call(selected.parentNode.children, selected) + 1].classList.add('selected');
            }

            this.value = search_results_element.querySelector('.selected').innerText;
        }
    });
}


/*--------------------------------------------------------------
# TABLE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# HEAD
--------------------------------------------------------------*/

function initTableHeaders() {
    var th = document.querySelectorAll('.table__head > div[data-column-index]');

    for (var i = 0, l = th.length; i < l; i++) {
        th[i].addEventListener('click', function() {
            var table = this.parentNode.parentNode,
                previous = table.querySelector('.table__head > div[data-order-by]');

            if (previous && this !== previous) {
                delete previous.dataset.orderBy;

                this.dataset.orderBy = 'asc';
            } else {
                this.dataset.orderBy = this.dataset.orderBy === 'asc' ? 'desc' : 'asc';
            }

            if (ALL_LOADED) {
                table.data.table = sort(table.data.table, this.dataset.columnIndex, this.dataset.orderBy);

                renderTable(Number(table.dataset.tableIndex));
            } else {
                var self = this;

                chrome.storage.local.get('all', function(items) {
                    ALL_LOADED = true;

                    for (var i = 0, l = items.all[1].length; i < l; i++) {
                        if (BOOKMARKS['https://' + items.all[1][i][2]]) {
                            items.all[1][i][3] = 1;
                        }

                        if (TAGS[items.all[1][i][2]]) {
                            items.all[1][i][4] = TAGS[items.all[1][i][2]];
                        }
                    }

                    TABLE[0].data.table = sort(items.all[0], TABLE[0].data.column, TABLE[0].data.order_by);
                    TABLE[1].data.table = sort(items.all[1], TABLE[1].data.column, TABLE[1].data.order_by);
                    TABLE[2].data.table = sort(items.all[2], TABLE[2].data.column, TABLE[2].data.order_by);

                    table.data.table = sort(table.data.table, self.dataset.columnIndex, self.dataset.orderBy);

                    renderTable(Number(table.dataset.tableIndex));
                });
            }
        });
    }
}

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


/*--------------------------------------------------------------
# BODY
--------------------------------------------------------------*/

function renderFirstTableItem(object, parent) {
    for (var key in object) {
        if (
            key !== 'a' &&
            key !== 'b' &&
            key !== 'c' &&
            key !== 'd'
        ) {
            var item = object[key],
                tr = document.createElement('div'),
                td1 = document.createElement('div'),
                td2 = document.createElement('div'),
                td3 = document.createElement('div'),
                a = document.createElement('a');

            tr.tree = item;
            tr.link = parent.link + key;
            td1.title = item.d;
            td1.innerText = item.d;

            var empty = true;

            for (var key2 in item) {
                if (key2.indexOf('/') !== -1) {
                    empty = false;
                }
            }

            if (empty === false) {
                var button = document.createElement('button');

                button.innerText = '+';

                button.addEventListener('click', function() {
                    var parent = this.parentNode.parentNode.parentNode,
                        item = this.parentNode.parentNode;

                    if (this.innerText === '+') {
                        var table = document.createElement('div');

                        table.className = 'table--inner';
                        table.link = item.link;

                        renderFirstTableItem(item.tree, table);

                        parent.insertBefore(table, item.nextElementSibling);

                        this.innerText = '-';
                    } else {
                        item.nextElementSibling.remove();

                        this.innerText = '+';
                    }
                });

                td2.appendChild(button);
            }

            a.href = parent.link + key;
            a.innerText = key;

            td3.appendChild(a);

            td1.className = 'col';
            td2.className = 'col';
            td3.className = 'col';

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            parent.appendChild(tr);
        }
    }
}

function renderTable(index, array) {
    TABLE_BODY[index].innerHTML = '';

    if (index === 0) {
        var array = TABLE[index].data.table;

        for (var i = 0 + (TABLE[index].data.page * 100 - 100), l = Math.min(TABLE[index].data.length, i + 100); i < l; i++) {
            var tr = document.createElement('div'),
                td1 = document.createElement('div'),
                td2 = document.createElement('div'),
                button = document.createElement('button'),
                td3 = document.createElement('div'),
                a = document.createElement('a');

            td1.title = array[i][1];
            td1.innerText = array[i][1];

            td3.style.backgroundImage = 'url(chrome://favicon/' + array[i][0] + ')';

            button.innerText = '+';

            button.addEventListener('click', function() {
                var parent = this.parentNode.parentNode.parentNode,
                    item = this.parentNode.parentNode;

                if (this.innerText === '+') {
                    if (!item.tree) {
                        chrome.storage.local.get(item.children[2].children[0].innerText, function(items) {
                            var table = document.createElement('div');

                            table.className = 'table--inner';

                            table.link = item.children[2].children[0].innerText;
                            item.tree = items[item.children[2].children[0].innerText];

                            renderFirstTableItem(item.tree, table);

                            parent.insertBefore(table, item.nextElementSibling);
                        });
                    } else {
                        var table = document.createElement('div');

                        table.className = 'table--inner';
                        table.link = item.children[2].children[0].innerText;

                        renderFirstTableItem(item.tree, table);

                        parent.insertBefore(table, item.nextElementSibling);
                    }

                    this.innerText = '-';
                } else {
                    item.nextElementSibling.remove();

                    this.innerText = '+';
                }
            });

            a.href = array[i][0];
            a.innerText = array[i][0];

            td2.appendChild(button);
            td3.appendChild(a);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            TABLE_BODY[index].appendChild(tr);
        }
    }

    if (index === 1) {
        var array = TABLE[1].data.table;

        for (var i = 0 + (TABLE[index].data.page * 100 - 100), l = Math.min(TABLE[index].data.length, i + 100); i < l; i++) {
            var tr = document.createElement('div'),
                td1 = document.createElement('div'),
                td2 = document.createElement('div'),
                td3 = document.createElement('div'),
                td4 = document.createElement('div'),
                td5 = document.createElement('div'),
                a = document.createElement('a'),
                input = document.createElement('input');

            input.type = 'text';

            td1.title = array[i][0];
            td1.innerText = array[i][0];
            td2.innerText = array[i][1];
            td2.title = array[i][1];

            td2.style.backgroundImage = 'url(chrome://favicon/' + array[i][2] + ')';

            if (BOOKMARKS[array[i][2]]) {
                td4.innerText = '★';

                td4.bookmarkId = BOOKMARKS[array[i][2]];
            } else {
                td4.innerText = '☆';
            }

            td4.addEventListener('click', function() {
                if (this.innerText === '★') {
                    this.innerText = '☆';

                    chrome.bookmarks.remove(this.bookmarkId);
                } else {
                    var self = this;
                    
                    this.innerText = '★';

                    chrome.bookmarks.create({
                        title: this.parentNode.children[1].innerText,
                        url: this.parentNode.children[2].children[0].href,
                        parentId: '1'
                    }, function (item) {
                        self.bookmarkId = item.id;
                    });
                }
            });

            if (TAGS[array[i][2]]) {
                input.value = TAGS[array[i][2]];
            }

            input.addEventListener('blur', function() {
                var url = this.parentNode.parentNode.children[2].children[0].innerText;

                if (this.value !== '') {
                    TAGS[url] = this.value;
                } else {
                    delete TAGS[url];
                }

                chrome.storage.local.set({
                    tags: TAGS
                });
            });

            a.href = array[i][2];
            a.innerText = array[i][2];

            td3.appendChild(a);
            td5.appendChild(input);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);

            TABLE_BODY[index].appendChild(tr);
        }
    }

    if (index === 2) {
        var array = TABLE[2].data.table;

        for (var i = 0 + (TABLE[index].data.page * 100 - 100), l = Math.min(TABLE[index].data.length, i + 100); i < l; i++) {
            var tr = document.createElement('div'),
                td1 = document.createElement('div'),
                td2 = document.createElement('div'),
                button = document.createElement('button'),
                td3 = document.createElement('div'),
                a = document.createElement('a');

            td1.title = array[i][0];
            td1.innerText = array[i][0];
            td3.style.backgroundImage = 'url(chrome://favicon/' + array[i][1] + ')';

            a.href = array[i][1];
            a.innerText = array[i][1];

            button.innerText = '+';

            button.addEventListener('click', function() {
                var parent = this.parentNode.parentNode.parentNode,
                    item = this.parentNode.parentNode;

                if (this.innerText === '+') {
                    var self = this;

                    chrome.storage.local.get('q' + item.children[2].children[0].innerText, function(items) {
                        var items = items['q' + item.children[2].children[0].innerText],
                            table = document.createElement('div');

                        table.className = 'table--inner';

                        for (var key in items) {
                            var tr = document.createElement('div'),
                                td1 = document.createElement('div'),
                                td2 = document.createElement('div'),
                                a = document.createElement('a');

                            td1.title = items[key].visitCount;
                            td1.innerText = items[key].visitCount;

                            a.href = items[key].url;
                            a.title = key;
                            a.innerText = key;

                            td2.appendChild(a);

                            tr.appendChild(td1);
                            tr.appendChild(td2);

                            table.appendChild(tr);
                        }

                        parent.insertBefore(table, item.nextElementSibling);

                        self.innerText = '-';
                    });
                } else {
                    item.nextElementSibling.remove();

                    this.innerText = '+';
                }
            });

            td2.appendChild(button);
            td3.appendChild(a);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            TABLE_BODY[index].appendChild(tr);
        }
    }

    if (index === 3) {
        for (var key in array) {
            var tabs = array[key],
                window_row = document.createElement('div'),
                table = document.createElement('div');

            window_row.className = 'table__row--window';
            table.className = 'table--inner';

            window_row.addEventListener('click', function() {
                this.classList.toggle('collapsed');
            });

            window_row.innerText = chrome.i18n.getMessage('window') + ' ' + key;

            table.dataset.id = key;

            for (var i = 0, l = tabs.length; i < l; i++) {
                var tab = tabs[i],
                    tr = document.createElement('div'),
                    td1 = document.createElement('div'),
                    td2 = document.createElement('div'),
                    button = document.createElement('button'),
                    a = document.createElement('a');

                tr.tabId = tab.id;
                tr.pinned = tab.pinned;

                if (tr.pinned) {
                    tr.classList.add('pinned');
                }

                button.addEventListener('click', function() {
                    var row = this.parentNode.parentNode,
                        pinned = !row.pinned;

                    row.pinned = pinned;

                    if (row.pinned) {
                        row.classList.add('pinned');
                    } else {
                        row.classList.remove('pinned');
                    }

                    chrome.tabs.update(row.tabId, {
                        pinned: pinned
                    });
                });

                td2.style.backgroundImage = 'url(' + tab.favIconUrl + ')';

                a.href = tab.url;
                a.innerText = tab.title;

                td1.appendChild(button);
                td2.appendChild(a);

                tr.appendChild(td1);
                tr.appendChild(td2);

                table.appendChild(tr);
            }

            TABLE_BODY[3].appendChild(window_row);
            TABLE_BODY[3].appendChild(table);
        }
    }

    if (index === 4) {
        var array = TABLE[index].data.table;

        for (var i = 0, l = array.length; i < l; i++) {
            var tr = document.createElement('div'),
                td1 = document.createElement('div'),
                td2 = document.createElement('div'),
                button = document.createElement('button'),
                td3 = document.createElement('div'),
                icon = document.createElement('div'),
                visits = 0;

            button.innerText = '+';
            button.data = array[i][2];

            td1.title = array[i][0];
            td1.innerText = array[i][0];

            button.addEventListener('click', function() {
                var parent = this.parentNode.parentNode.parentNode,
                    item = this.parentNode.parentNode;

                if (this.innerText === '+') {
                    if (!item.tree) {
                        var table = document.createElement('div');

                        table.className = 'table--inner';

                        for (var i = 0, l = this.data.length; i < l; i++) {
                            var tr = document.createElement('div'),
                                td1 = document.createElement('div'),
                                td3 = document.createElement('div'),
                                a = document.createElement('a');

                            td1.title = this.data[i][0];
                            td1.innerText = this.data[i][0];

                            a.href = this.data[i][1];
                            a.innerText = this.data[i][1];
                            
                            td3.style.backgroundImage = 'url(chrome://favicon/' + this.data[i][1] + ')';

                            td3.appendChild(a);

                            td1.className = 'col';
                            td3.className = 'col';

                            tr.appendChild(td1);
                            tr.appendChild(td3);

                            table.appendChild(tr);
                        }

                        parent.insertBefore(table, item.nextElementSibling);
                    } else {
                        var table = document.createElement('div');

                        table.className = 'table--inner';
                        table.link = item.children[2].children[0].innerText;

                        renderFirstTableItem(item.tree, table);

                        parent.insertBefore(table, item.nextElementSibling);
                    }

                    this.innerText = '-';
                } else {
                    item.nextElementSibling.remove();

                    this.innerText = '+';
                }
            });

            var name = chrome.i18n.getMessage(array[i][1]);

            td3.title = name;
            td3.innerText = name;

            icon.style.backgroundPosition = (-24 * i + Math.floor(i / 4) * 96) - 1 + 'px ' + (Math.floor(i / 4) * -24 - 1) + 'px';

            td2.appendChild(button);
            td3.appendChild(icon);

            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);

            TABLE_BODY[index].appendChild(tr);
        }
    }

    if (index === 5) {
        updateTableWithRecentlyClosed();
    }

    if (TABLE[index].data) {
        var pages = Math.ceil(TABLE[index].data.length / 100),
            current = TABLE[index].data.page;

        TABLE[index].children[2].innerHTML = '';

        if (pages > 1) {
            for (var i = 0; i < pages; i++) {
                var button = document.createElement('button');

                if (current > 4 && i > 0 && i < current - 2) {
                    i = current - 2;

                    var span = document.createElement('span');

                    span.innerText = '...';

                    TABLE[index].children[2].appendChild(span);
                }

                if (current < pages - 4 && i === current + 1) {
                    i = pages - 1;

                    var span = document.createElement('span');

                    span.innerText = '...';

                    TABLE[index].children[2].appendChild(span);
                }

                button.innerText = i + 1;

                if (current === i + 1) {
                    button.className = 'selected';
                }

                button.addEventListener('click', function() {
                    if (ALL_LOADED) {
                        var prev = this.parentNode.querySelector('.selected');

                        this.parentNode.parentNode.data.page = Number(this.innerText);

                        if (prev) {
                            prev.classList.remove('selected');
                        }

                        this.classList.add('selected');

                        renderTable(Number(this.parentNode.parentNode.dataset.tableIndex));
                    } else {
                        var self = this;

                        chrome.storage.local.get('all', function(items) {
                            ALL_LOADED = true;

                            for (var i = 0, l = items.all[1].length; i < l; i++) {
                                if (BOOKMARKS['https://' + items.all[1][i][2]]) {
                                    items.all[1][i][3] = 1;
                                }

                                if (TAGS[items.all[1][i][2]]) {
                                    items.all[1][i][4] = TAGS[items.all[1][i][2]];
                                }
                            }

                            TABLE[0].data.table = sort(items.all[0], TABLE[0].data.column, TABLE[0].data.order_by);
                            TABLE[1].data.table = sort(items.all[1], TABLE[1].data.column, TABLE[1].data.order_by);
                            TABLE[2].data.table = sort(items.all[2], TABLE[2].data.column, TABLE[2].data.order_by);

                            var prev = self.parentNode.querySelector('.selected');

                            self.parentNode.parentNode.data.page = Number(self.innerText);

                            if (prev) {
                                prev.classList.remove('selected');
                            }

                            self.classList.add('selected');

                            renderTable(Number(self.parentNode.parentNode.dataset.tableIndex));
                        });
                    }
                });

                TABLE[index].children[2].appendChild(button);
            }
        }
    }
}

function initTable4() {
    chrome.tabs.query({}, function(tabs) {
        var object = {};

        for (var i = 0, l = tabs.length; i < l; i++) {
            var tab = tabs[i];

            if (!object[tab.windowId]) {
                object[tab.windowId] = [];
            }

            object[tab.windowId].push(tab);
        }

        renderTable(3, object);
    });

    chrome.tabs.onCreated.addListener(function(tab) {
        var row = document.createElement('div'),
            col1 = document.createElement('div'),
            col2 = document.createElement('div'),
            button = document.createElement('button'),
            a = document.createElement('a');

        row.tabId = tab.id;
        row.pinned = tab.pinned;

        if (row.pinned) {
            row.classList.add('pinned');
        }

        button.addEventListener('click', function() {
            var row = this.parentNode.parentNode,
                pinned = !row.pinned;

            row.pinned = pinned;

            if (row.pinned) {
                row.classList.add('pinned');
            } else {
                row.classList.remove('pinned');
            }

            chrome.tabs.update(row.tabId, {
                pinned: pinned
            });
        });

        col1.appendChild(button);
        col2.appendChild(a);

        row.appendChild(col1);
        row.appendChild(col2);

        TABLE_BODY[3].querySelector('[data-id="' + tab.windowId + '"]').appendChild(row);
    });

    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        var rows = TABLE_BODY[3].querySelector('[data-id="' + removeInfo.windowId + '"]').children;

        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];

            if (row.tabId === tabId) {
                row.remove();

                return false;
            }
        }
    });

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        var rows = TABLE_BODY[3].querySelector('[data-id="' + tab.windowId + '"]').children;

        for (var i = 0, l = rows.length; i < l; i++) {
            var row = rows[i];

            if (row.tabId === tabId) {
                var a = row.children[1].children[0];

                row.pinned = tab.pinned;

                if (row.pinned) {
                    row.classList.add('pinned');
                } else {
                    row.classList.remove('pinned');
                }

                row.children[1].style.backgroundImage = 'url(' + tab.favIconUrl + ')';

                a.href = tab.url;
                a.innerText = tab.title;
            }
        }
    });

    chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
        var rows = TABLE_BODY[3].querySelector('[data-id="' + moveInfo.windowId + '"]').children;

        for (var i = 0, l = rows.length; i < l; i++) {
            var tab = rows[i];

            if (tab.tabId === tabId) {
                var row = document.createElement('div'),
                    col1 = document.createElement('div'),
                    col2 = document.createElement('div'),
                    button = document.createElement('button'),
                    a = document.createElement('a');

                row.tabId = tab.tabId;
                row.pinned = tab.pinned;

                if (row.pinned) {
                    row.classList.add('pinned');
                }

                col2.style.backgroundImage = tab.children[1].style.backgroundImage;

                button.addEventListener('click', function() {
                    var row = this.parentNode.parentNode,
                        pinned = !row.pinned;

                    row.pinned = pinned;

                    if (row.pinned) {
                        row.classList.add('pinned');
                    } else {
                        row.classList.remove('pinned');
                    }

                    chrome.tabs.update(row.tabId, {
                        pinned: pinned
                    });
                });

                a.href = tab.children[1].children[0].href;
                a.innerText = tab.children[1].children[0].innerText;

                col1.appendChild(button);
                col2.appendChild(a);

                row.appendChild(col1);
                row.appendChild(col2);

                tab.remove();

                TABLE_BODY[3].querySelector('[data-id="' + moveInfo.windowId + '"]').insertBefore(row, TABLE_BODY[3].querySelector('[data-id="' + moveInfo.windowId + '"]').children[moveInfo.toIndex]);
            }
        }
    });
}

function parseBookmarks(callback) {
    chrome.bookmarks.getTree(function(bookmarks) {
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

            if (threads === 0) {
                callback();
            }
        }

        parse(bookmarks);
    });
}

function updateTableWithRecentlyClosed() {
    var array = TABLE[5].data.table;

    for (var i = 0, l = array.length; i < l; i++) {
        var row = document.createElement('div'),
            col1 = document.createElement('div'),
            col2 = document.createElement('div'),
            col3 = document.createElement('div'),
            a = document.createElement('a'),
            time_ago = (TIME - array[i][0]) / 3600000;

        if (time_ago < 1) {
            time_ago = Math.round(time_ago * 60) + ' minutes ago';
        } else {
            time_ago = Math.round(time_ago) + ' hours ago';
        }

        col1.title = time_ago;
        col1.innerText = time_ago;
        col2.style.backgroundImage = 'url(chrome://favicon/' + array[i][1] + ')';
        a.title = array[i][1];
        a.href = array[i][1];
        a.innerText = array[i][1];
        col3.title = array[i][2];
        col3.innerText = array[i][2];

        col2.appendChild(a);
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);

        TABLE_BODY[5].appendChild(row);
    }
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

window.addEventListener('load', function() {
    if (location.href.indexOf('?loaded') === -1) {
        location.replace(location.href + '?loaded');

        return false;
    }

    initSearchBar();

    chrome.storage.local.get('cached', function(items) {
        if (items.cached === true) {
            initTableHeaders();

            TOP_SITES_length = Object.keys(TOP_SITES).length;

            parseBookmarks(function() {
                chrome.storage.local.get(['top', 'tags', 'for_search', 'by_category'], function(items) {
                    TAGS = items.tags || {};
                    SEARCH = items.for_search || [];

                    TABLE[0].data.table = items.top[0];
                    TABLE[0].data.length = items.top.l0;
                    TABLE[1].data.table = items.top[1];
                    TABLE[1].data.length = items.top.l1;
                    TABLE[2].data.table = items.top[2];
                    TABLE[2].data.length = items.top.l2;
                    TABLE[4].data.table = items.by_category;

                    /*for (var key in CATEGORIES) {
                        for (var link in CATEGORIES[key]) {
                            for (var i = 0, l = TABLE[0].data.table.length; i < l; i++) {
                                if (TABLE[0].data.table[i][0].indexOf(link) !== -1) {
                                    CATEGORIES[key][link] = TABLE[0].data.table[i][1];
                                }
                            }
                        }
                    }

                    for (var key in CATEGORIES) {
                        TABLE[4].data.table.push([0, key]);
                    }*/

                    for (var i = 0, l = TABLE[1].data.table.length; i < l; i++) {
                        if (BOOKMARKS['https://' + TABLE[1].data.table[i][2]]) {
                            TABLE[1].data.table[i][3] = 1;
                        }

                        if (TAGS[TABLE[1].data.table[i][2]]) {
                            TABLE[1].data.table[i][4] = TAGS[TABLE[1].data.table[i][2]];
                        }
                    }

                    renderTable(0);
                    renderTable(1);
                    renderTable(2);
                    renderTable(4);

                    console.timeEnd(); 
                });
            });
        } else {
            for (var key in CATEGORIES) {
                for (var link in CATEGORIES[key]) {
                    for (var i = 0, l = TABLE[0].data.table.length; i < l; i++) {
                        if (TABLE[0].data.table[i][0].indexOf(link) !== -1) {
                            CATEGORIES[key][link] = TABLE[0].data.table[i][1];
                        }
                    }
                }
            }

            for (var key in CATEGORIES) {
                TABLE[4].data.table.push([0, key]);
            }
            renderTable(4);

            for (var i = 0; i < 3; i++) {
                TABLE_BODY[i].style.position = 'relative';
                TABLE_BODY[i].innerHTML = '<div class="caching-progress">0%</div>';
            }
        }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.progress) {
            if (request.progress === 'loaded') {
                TABLE_BODY[4].innerHTML = '';
                TABLE[4].data.table = [];

                for (var i = 0; i < 3; i++) {
                    TABLE_BODY[i].style.position = '';
                }

                parseBookmarks(function() {
                    chrome.storage.local.get(['top', 'tags', 'for_search', 'by_category'], function(items) {
                        TAGS = items.tags || {};
                        SEARCH = items.for_search || [];

                        TABLE[0].data.table = items.top[0];
                        TABLE[0].data.length = items.top.l0;
                        TABLE[1].data.table = items.top[1];
                        TABLE[1].data.length = items.top.l1;
                        TABLE[2].data.table = items.top[2];
                        TABLE[2].data.length = items.top.l2;
                        TABLE[4].data.table = items.by_category;

                        /*for (var key in CATEGORIES) {
                            for (var link in CATEGORIES[key]) {
                                for (var i = 0, l = TABLE[0].data.table.length; i < l; i++) {
                                    if (TABLE[0].data.table[i][0].indexOf(link) !== -1) {
                                        CATEGORIES[key][link] = TABLE[0].data.table[i][1];
                                    }
                                }
                            }
                        }

                        for (var key in CATEGORIES) {
                            TABLE[4].data.table.push([0, key]);
                        }*/

                        for (var i = 0, l = TABLE[1].data.table.length; i < l; i++) {
                            if (BOOKMARKS['https://' + TABLE[1].data.table[i][2]]) {
                                TABLE[1].data.table[i][3] = 1;
                            }

                            if (TAGS[TABLE[1].data.table[i][2]]) {
                                TABLE[1].data.table[i][4] = TAGS[TABLE[1].data.table[i][2]];
                            }
                        }

                        renderTable(0);
                        renderTable(1);
                        renderTable(2);
                        renderTable(4);

                        console.timeEnd(); 
                    });
                });
            } else {
                for (var i = 0; i < 3; i++) {
                    TABLE_BODY[i].innerHTML = '<div class="caching-progress">' + request.progress + '%</div>';
                }
            }
        }
    });

    chrome.storage.local.get('recently_closed', function(items) {
        if (items.recently_closed) {
            TABLE[5].data.table = items.recently_closed;
            updateTableWithRecentlyClosed();
        } else {

        }
    });

    initTable4();
});