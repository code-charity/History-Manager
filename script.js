/*--------------------------------------------------------------
>>> SCRIPT
----------------------------------------------------------------
# Global variables
# Time
# Search bar
# Table
    # Head
    # Body
# Selection
# Initialization
--------------------------------------------------------------*/

console.time();

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var TIME = new Date().getTime(),
    BOOKMARKS = {},
    TAGS = {},
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
    id: 'BY_DOMAIN',
    loaded: false,
    page: 1,
    column: 0,
    order_by: 'desc'
};

TABLE[1].data = {
    table: [],
    id: 'BY_PAGE',
    loaded: false,
    page: 1,
    column: 0,
    order_by: 'desc'
};

TABLE[2].data = {
    table: [],
    id: 'BY_PARAM',
    loaded: false,
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
    var input = document.querySelector('.search-field');

    input.change = function () {
        var selection = window.getSelection(),
            value = this.textContent;
        
        /*var ranges = [];

        // COPY SELECTION
        for (var i = 0, l = selection.rangeCount; i < l; i++) {
            var range = selection.getRangeAt(i);

            ranges.push({
                endContainer: range.endContainer,
                endOffset: range.endOffset,
                startContainer: range.startContainer,
                startOffset: range.startOffset
            });
        }*/

        for (var i = 0, l = this.childNodes.length; i < l; i++) {
            var child = this.childNodes[i];

            if (child.nodeType === Node.TEXT_NODE) {
                var match = child.textContent.match(/([^\s]+|[\s]+)/g);

                if (match) {
                    for (var j = 0, k = match.length; j < k; j++) {
                        var element = document.createElement('span'),
                            text = match[j].replace(/[\s\r\n\x0B\x0C\u0085\u2028\u2029]+/g, '');
                            
                        if (text !== '') {
                            element.textContent = text;
                        } else {
                            element.className = 'space';
                            element.innerHTML = '&nbsp;';
                        }

                        this.insertBefore(element, child);
                    }

                    child.remove();
                }
            } else if (child.tagName === 'SPAN') {
                var match = child.textContent.match(/([^\s]+|[\s]+)/g),
                    match2 = child.textContent.match(/[\s]+/g);

                if (match && match2) {
                    for (var j = 0, k = match.length; j < k; j++) {
                        var element = document.createElement('span'),
                            text = match[j].replace(/[\s\r\n\x0B\x0C\u0085\u2028\u2029]+/g, '');
                            
                        if (text !== '') {
                            element.textContent = text;
                        } else {
                            element.className = 'space';
                            element.innerHTML = '&nbsp;';
                        }

                        this.insertBefore(element, child);
                    }

                    child.remove();
                }
            }
        }

        var non_space = this.querySelectorAll('span:not(.space)');

        for (var i = 0, l = non_space.length; i < l; i++) {
            var element = non_space[i],
                a = (i + 1) / l;

            element.style.opacity = a;
            element.style.fontSize = a * 20 + 'px';
        }

        // CREATE SPANS
        /*var match = this.textContent.match(/([^\s]+|[\s]+)/g);

        if (match) {
            this.innerHTML = '';

            for (var i = 0, l = match.length; i < l; i++) {
                var element = document.createElement('span');
                    
                element.textContent = match[i].replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, '');
                
                var a = (i + 1) / l;

                element.style.opacity = a;
                element.style.fontSize = a * 20 + 'px';

                this.appendChild(element);
            }
        }*/

        // REPLACE SELECTION
        /*selection.removeAllRanges();

        var range = document.createRange(),
            element = this.children > 0 ? this.children[this.children.length - 1] : this;

            console.log(element, element.textContent.length - 1);

        range.setStart(element, element.textContent.length - 1);

        selection.addRange(range);*/

        /*for (var i = 0, l = ranges.length; i < l; i++) {
            var range = ranges[i],
                new_range = document.createRange();

            new_range.setStart(range.startContainer, range.startOffset);
            new_range.setEnd(range.endContainer, range.endOffset);

            selection.addRange(new_range);
        }*/

        var results = [],
            pre_results = {},
            first = null,
            cursor_position = this.selectionStart,
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

            for (var i = 0; i < TOP_SITES_length; i++) {
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
                results = sort(results, 1);

                results = results.slice(0, 6);

                for (var i = 0, l = results.length; i < l; i++) {
                    var item = document.createElement('div');

                    item.innerText = results[i][0];
                    item.dataset.url = results[i][2] + results[i][0];
                    item.style.backgroundImage = 'url(chrome://favicon/' + results[i][2] + results[i][0] + ')';

                    item.addEventListener('click', function() {
                        search_results_element.style.display = 'none';

                        window.open(this.dataset.url, '_self');
                    });

                    search_results_element.appendChild(item);
                }
            }
        }

        if (results[0] && results[0][0]) {
            search_results_element.children[0].className = 'selected';

            //this.textContent = first;
            //this.setSelectionRange(cursor_position, this.value.length);
        }

        if (value.length === 0 || results.length === 0) {
            search_results_element.style.display = '';
        } else {
            search_results_element.style.display = 'block';
        }
    };

    input.addEventListener('focus', function() {
        if (this.innerText.length > 0) {
            search_results_element.style.display = 'block';
        }
    });

    input.addEventListener('blur', function() {
        search_results_element.style.display = '';
    });

    input.addEventListener('input', function() {
        this.change();
    });

    input.addEventListener('keydown', function(event) {
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

    /*document.querySelector('header > input').addEventListener('input', function(event) {
        var results = [],
            pre_results = {},
            first = null,
            cursor_position = this.selectionStart,
            r = new RegExp('[^\w]' + this.value);

        search_results_element.innerHTML = '';

        if (this.value.length > 0 && event.inputType !== 'deleteContentBackward') {
            for (var i = 0, l = SEARCH.length; i < l; i++) {
                var item = SEARCH[i];

                if (item[0].indexOf(this.value) === 0 && !pre_results[key]) {
                    pre_results[item[0]] = item;
                }
            }

            for (var key in BOOKMARKS) {
                if (key.indexOf(this.value) === 0) {
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

            for (var i = 0; i < TOP_SITES_length; i++) {
                var key = TOP_SITES[i];

                if (key.indexOf(this.value) === 0 && !pre_results[key]) {
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

            results = sort(results, 1);

            results = results.slice(0, 6);

            for (var i = 0, l = results.length; i < l; i++) {
                var item = document.createElement('div');

                item.innerText = results[i][0];
                item.dataset.url = results[i][2] + results[i][0];
                item.style.backgroundImage = 'url(chrome://favicon/' + results[i][2] + results[i][0] + ')';

                item.addEventListener('click', function() {
                    search_results_element.style.display = 'none';

                    window.open(this.innerText, '_self');
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
    });*/
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

            if (table.data.loaded === true) {
                table.data.table = sort(table.data.table, this.dataset.columnIndex, this.dataset.orderBy);

                renderTable(Number(table.dataset.tableIndex));
            } else {
                var self = this,
                    id = table.data.id;

                chrome.storage.local.get(id, function(items) {
                    table.data.loaded = true;

                    if (id === 'BY_DOMAIN') {
                        TABLE[0].data.table = sort(items['BY_DOMAIN'], TABLE[0].data.column, TABLE[0].data.order_by);
                    } else if (id === 'BY_PAGE') {
                        for (var i = 0, l = items['BY_PAGE'].length; i < l; i++) {
                            if (BOOKMARKS['https://' + items['BY_PAGE'][i][2]]) {
                                items['BY_PAGE'][i][3] = 1;
                            }

                            if (TAGS[items['BY_PAGE'][i][2]]) {
                                items['BY_PAGE'][i][4] = TAGS[items['BY_PAGE'][i][2]];
                            }
                        }

                        TABLE[1].data.table = sort(items['BY_PAGE'], TABLE[1].data.column, TABLE[1].data.order_by);
                    } else if (id === 'BY_PARAM') {
                        TABLE[2].data.table = sort(items['BY_PARAM'], TABLE[2].data.column, TABLE[2].data.order_by);
                    }

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
    var sorted = [];

    for (var key in object) {
        if (key.indexOf('/') !== -1) {
            sorted.push([object[key].d, key, object[key]]);
        }
    }

    sorted = sort(sorted, 0);

    for (var i = 0, l = sorted.length; i < l; i++) {
        var item = sorted[i],
            key = item[1];

        if (
            key !== 'a' &&
            key !== 'b' &&
            key !== 'c' &&
            key !== 'd'
        ) {
            var tr = document.createElement('div'),
                td1 = document.createElement('div'),
                td2 = document.createElement('div'),
                td3 = document.createElement('div'),
                a = document.createElement('a');

            tr.tree = item[2];
            tr.link = parent.link + item[1];
            td1.title = item[0];
            td1.innerText = item[0];

            var empty = true;

            for (var key2 in item[2]) {
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

            a.href = parent.link + item[1];
            a.innerText = item[1];

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

                            console.log(item.tree);

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
                        console.log(items);
                        var items = items['q' + item.children[2].children[0].innerText],
                            table = document.createElement('div'),
                            sorted = [];

                        table.className = 'table--inner';

                        for (var key in items) {
                            sorted.push([items[key].visitCount, key, items[key].url]);
                        }

                        sorted = sort(sorted, 0);

                        for (var i = 0, l = sorted.length; i < l; i++) {
                            var element = sorted[i],
                                tr = document.createElement('div'),
                                td1 = document.createElement('div'),
                                td2 = document.createElement('div'),
                                a = document.createElement('a');

                            td1.title = element[0];
                            td1.innerText = element[0];

                            a.href = element[2];
                            a.title = element[1];
                            a.innerText = element[1];

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
                    item = this.parentNode.parentNode,
                    self = this;

                if (this.innerText === '+') {
                    var table = document.createElement('div');

                    table.className = 'table--inner';
                    
                    function create() {
                        for (var i = 0, l = self.data.length; i < l; i++) {
                            var tr = document.createElement('div'),
                                td1 = document.createElement('div'),
                                td3 = document.createElement('div'),
                                a = document.createElement('a'),
                                url = self.data[i][1],
                                replaced = false;

                            for (var j = 0, k = TABLE[0].data.table.length; j < k; j++) {
                                var url2 = TABLE[0].data.table[j][0];

                                if (url2.indexOf(url) !== -1) {
                                    url = url2;

                                    replaced = true;
                                }
                            }

                            if (replaced === false) {
                                url = 'https://' + url;
                                
                                td3.style.backgroundImage = 'url(' + url + '/favicon.ico)';
                            } else {
                                td3.style.backgroundImage = 'url(chrome://favicon/' + url + ')';
                            }

                            td1.title = self.data[i][0];
                            td1.innerText = self.data[i][0];

                            a.href = url;
                            a.innerText = url;
                            
                            td3.appendChild(a);

                            td1.className = 'col';
                            td3.className = 'col';

                            tr.appendChild(td1);
                            tr.appendChild(td3);

                            table.appendChild(tr);
                        }
                    }

                    if (TABLE[0].data.loaded) {
                        create();
                    } else {
                        var self = this;

                        chrome.storage.local.get('BY_DOMAIN', function(items) {
                            TABLE[0].data.loaded = true;

                            TABLE[0].data.table = sort(items['BY_DOMAIN'], TABLE[0].data.column, TABLE[0].data.order_by);

                            create();
                        });
                    }

                    parent.insertBefore(table, item.nextElementSibling);

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
                    if (TABLE[index].data.loaded) {
                        var prev = this.parentNode.querySelector('.selected');

                        this.parentNode.parentNode.data.page = Number(this.innerText);

                        if (prev) {
                            prev.classList.remove('selected');
                        }

                        this.classList.add('selected');

                        renderTable(Number(this.parentNode.parentNode.dataset.tableIndex));
                    } else {
                        var self = this,
                            id = TABLE[index].data.id;

                        chrome.storage.local.get(id, function(items) {
                            TABLE[index].data.loaded = true;

                            if (id === 'BY_DOMAIN') {
                                TABLE[0].data.table = sort(items['BY_DOMAIN'], TABLE[0].data.column, TABLE[0].data.order_by);
                            } else if (id === 'BY_PAGE') {
                                for (var i = 0, l = items['BY_PAGE'].length; i < l; i++) {
                                    if (BOOKMARKS['https://' + items['BY_PAGE'][i][2]]) {
                                        items['BY_PAGE'][i][3] = 1;
                                    }

                                    if (TAGS[items['BY_PAGE'][i][2]]) {
                                        items['BY_PAGE'][i][4] = TAGS[items['BY_PAGE'][i][2]];
                                    }
                                }

                                TABLE[1].data.table = sort(items['BY_PAGE'], TABLE[1].data.column, TABLE[1].data.order_by);
                            } else if (id === 'BY_PARAM') {
                                TABLE[2].data.table = sort(items['BY_PARAM'], TABLE[2].data.column, TABLE[2].data.order_by);
                            }

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

    chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
        var windows = TABLE_BODY[3].children;

        for (var i = 0, l = windows.length; i < l; i++) {
            for (var j = 0, k = windows[i].children.length; j < k; j++) {
                if (windows[i].children[j].tabId === tabId) {
                    windows[i].children[j].remove();
                }
            }
        }

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

        TABLE_BODY[3].querySelector('[data-id="' + attachInfo.newWindowId + '"]').insertBefore(row, TABLE_BODY[3].querySelector('[data-id="' + attachInfo.newWindowId + '"]').children[attachInfo.newPosition]);
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
# SELECTION
--------------------------------------------------------------*/

/*window.addEventListener('click', function(event) {
    for (var i = 0, l = event.path.length; i < l; i++) {
        if (
            event.path[i].className === 'table__body' ||
            event.path[i].className === 'table--inner'
        ) {
            var item = event.path[i - 1];

            if (item) {
                item.dataset.selected = true;
            }
        }
    }
});*/

/*window.addEventListener('mousedown', function(event) {
    function mousemove(event) {
        console.log(event);
    }

    function mouseup() {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
    }

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);
});*/

/*document.addEventListener('selectionchange', function(event) {
    var selection = document.getSelection();

    for (var i = 0, l = selection.rangeCount; i < l; i++) {
        var range = selection.getRangeAt(i),
            container = range.commonAncestorContainer;

        if (
            container.className === 'table__body' ||
            container.className === 'table--inner'
        ) {
            var start_row = range.startContainer,
                next_row = null,
                end_row = range.endContainer;

            while (
                start_row.parentNode.className !== 'table__body' &&
                start_row.parentNode.className !== 'table--inner'
            ) {
                start_row = start_row.parentNode;
            }

            while (
                end_row.parentNode.className !== 'table__body' &&
                end_row.parentNode.className !== 'table--inner'
            ) {
                end_row = end_row.parentNode;
            }

            start_row.dataset.selected = true;

            next_row = start_row.nextElementSibling;

            while (next_row !== end_row) {
                next_row.dataset.selected = true;

                next_row = next_row.nextElementSibling;
            }

            end_row.dataset.selected = true;
        }
    }
});

window.addEventListener('click', function(event) {
    for (var i = 0, l = event.path.length; i < l; i++) {
        if (
            event.path[i].className === 'table__body' ||
            event.path[i].className === 'table--inner'
        ) {
            var item = event.path[i - 1];

            if (item) {
                if (item.dataset.selected === 'true') {
                    delete item.dataset.selected;
                } else {
                    item.dataset.selected = true;
                }
            }
        }
    }
});*/

window.addEventListener('mousedown', function(event) {
    var table,
        rows = [],
        start_row,
        next_row,
        end_row,
        start_mouse_y = 0,
        end_mouse_y = 0;

    function mousemove(event) {
        for (var i = 0, l = rows.length; i < l; i++) {
            rows[i].classList.remove('selection');
        }

        rows = [start_row];

        for (var i = 0, l = event.path.length; i < l; i++) {
            var item = event.path[i];

            if (
                item.parentNode &&
                (
                    item.parentNode.className === 'table__body' ||
                    item.parentNode.className === 'table--inner'
                )
            ) {
                end_row = item;
            }
        }

        if (end_row) {
            next_row = start_row;

            while (next_row !== end_row) {
                if (start_mouse_y < event.clientY) {
                    next_row = next_row.nextElementSibling;
                } else {
                    next_row = next_row.previousElementSibling;
                }
                
                rows.push(next_row);
            }
        
            rows.push(end_row);
        }
        
        for (var i = 0, l = rows.length; i < l; i++) {
            rows[i].classList.add('selection');
        }

        end_row.classList.add('selection');
    }

    function mouseup() {
        for (var i = 0, l = rows.length; i < l; i++) {
            rows[i].classList.remove('selection');
            rows[i].classList.toggle('selected');
        }

        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
    }

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup);

    start_mouse_y = event.clientY;

    for (var i = 0, l = event.path.length; i < l; i++) {
        var item = event.path[i];

        if (item.className === 'table') {
            table = item;            
        }

        if (
            item.parentNode &&
            (
                item.parentNode.className === 'table__body' ||
                item.parentNode.className === 'table--inner'
            )
        ) {
            start_row = item;

            rows.push(start_row);

            event.preventDefault();
        }
    }
});


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

function init() {
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
}

window.addEventListener('load', function() {
    if (location.href.indexOf('?loaded') === -1) {
        location.replace(location.href + '?loaded');

        return false;
    }

    initSearchBar();

    chrome.storage.local.get('cached', function(items) {
        if (items.cached === true) {
            init();
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

                init();
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