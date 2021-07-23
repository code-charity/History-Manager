/*--------------------------------------------------------------
>>> SATUS
----------------------------------------------------------------
# Global variable
# Isset
# Camelize
# Merge
# Render
# elements
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var satus = {
    elements: {}
};


/*--------------------------------------------------------------
# ISSET
--------------------------------------------------------------*/

satus.isset = function (variable) {
    if (variable === null || variable === undefined) {
        return false;
    }

    return true;
};


/*--------------------------------------------------------------
# CAMELIZE
--------------------------------------------------------------*/

satus.camelize = function (string) {
    return string.split('-').map(function (element, index) {
        if (index === 0) {
            return element;
        }

        return element[0].toUpperCase() + element.slice(1);
    }).join('');
};


/*--------------------------------------------------------------
# EMPTY
--------------------------------------------------------------*/

satus.empty = function (element) {
    for (var i = element.children.length - 1; i > -1; i--) {
        element.children[i].remove();
    }
};


/*--------------------------------------------------------------
# SORT
--------------------------------------------------------------*/

satus.sort = function (index, order, array) {
    var type = typeof array[0][index];

    if (order === 'asc') {
        if (type === 'number') {
            sorted = array.sort(function (a, b) {
                return a[index] - b[index];
            });
        } else if (type === 'string') {
            sorted = array.sort(function (a, b) {
                return a[index].localeCompare(b[index]);
            });
        }
    } else {
        if (type === 'number') {
            sorted = array.sort(function (a, b) {
                return b[index] - a[index];
            });
        } else if (type === 'string') {
            sorted = array.sort(function (a, b) {
                return b[index].localeCompare(a[index]);
            });
        }
    }

    return sorted;
};


/*--------------------------------------------------------------
# PARSE
--------------------------------------------------------------*/

satus.parse = function (object, callback) {
    for (var key in object) {
        if (typeof object[key] === 'object') {
            satus.parse(object[key], callback);
        } else {
            callback(key, object[key]);
        }
    }
};


/*--------------------------------------------------------------
# MERGE
--------------------------------------------------------------*/

satus.merge = function (target, sources, excluded) {
    for (var key in sources) {
        if (sources.hasOwnProperty(key)) {
            if (excluded.indexOf(key) === -1) {
                if (typeof sources[key] === 'object') {
                    if (['grid', 'menu', 'modal', 'table', 'select'].indexOf(sources.element) === -1) {
                        if (sources[key].hasOwnProperty('element')) {
                            satus.render(sources[key], target);
                        } else {
                            if (typeof target[key] !== 'object') {
                                target[key] = {};
                            }

                            this.merge(target[key], sources[key], excluded);
                        }
                    }
                } else {
                    target[key] = sources[key];
                }
            }
        }
    }
};


/*--------------------------------------------------------------
# RENDER
--------------------------------------------------------------*/

satus.render = function (skeleton, container) {
    if (skeleton.hasOwnProperty('element')) {
        var excluded = ['element', 'class', 'click', 'text'],
            name = this.camelize(skeleton.element),
            element;

        if (satus.elements[name]) {
            element = satus.elements[name](skeleton);
        } else {
            element = document.createElement(name);
        }

        element.classList.add('satus-' + skeleton.element);

        if (skeleton.hasOwnProperty('class')) {
            element.className += ' ' + skeleton.class;
        }

        if (skeleton.hasOwnProperty('events')) {
            for (var key in skeleton.events) {
                var event = skeleton.events[key];

                element.addEventListener(event.type, event.listener, event.options);
            }
        }

        if (skeleton.hasOwnProperty('text')) {
            var node = document.createTextNode(satus.locale.get(skeleton.text));

            element.insertBefore(node, element.children[0]);
        }

        if (skeleton.hasOwnProperty('html')) {
            element.innerHTML = skeleton.html;
        }

        if (skeleton.hasOwnProperty('click')) {
            element.addEventListener('click', function () {
                satus.render(this.skeleton.click);
            });
        }

        if (skeleton.hasOwnProperty('storage')) {
            var value = satus.storage.get(skeleton.storage);

            if (satus.isset(value) === false) {
                if (satus.isset(skeleton.value)) {
                    value = skeleton.value;
                }
            }

            if (satus.isset(value)) {
                element.dataset.value = value;

                if (element.setValue) {
                    element.setValue(value);
                }
            }

            element.change = function (value) {
                var keys = this.skeleton.storage;

                this.dataset.value = value;

                if (satus.isset(keys)) {
                    satus.storage.set(keys, value);
                }
            };
        }

        satus.merge(element, skeleton, excluded);

        element.skeleton = skeleton;

        if (container) {
            container.appendChild(element);
        } else {
            document.body.appendChild(element);
        }

        if (element.hasOwnProperty('onrender')) {
            element.onrender();
        }

        return element;
    } else if (typeof skeleton === 'object') {
        for (var key in skeleton) {
            if (skeleton.hasOwnProperty(key)) {
                this.render(skeleton[key], container);
            }
        }
    }
};


/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

satus.storage = {
    attributes: [],
    data: {}
};


/*--------------------------------------------------------------
# LOAD
--------------------------------------------------------------*/

satus.storage.load = function (keys, callback) {
    if (typeof keys === 'function') {
        callback = keys;

        keys = null;
    }

    chrome.storage.local.get(keys, function (items) {
        for (var key in items) {
            satus.storage.data[key] = items[key];
        }

        satus.parse(items, function (key, value) {
            satus.storage.attributes.map(function (element) {
                if (key === element) {
                    document.body.dataset[satus.camelize(key)] = value;
                }
            });
        });

        callback(items);
    });
};

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        var value = changes[key].newValue;

        satus.storage.data[key] = value;

        satus.parse(satus.storage.data, function (key, value) {
            satus.storage.attributes.map(function (element) {
                if (key === element) {
                    document.body.dataset[satus.camelize(key)] = value;
                }
            });
        });
    }
});


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.storage.get = function (keys) {
    var target = satus.storage.data;

    keys = keys.split('/').filter(function (value) {
        return value != '';
    });

    for (var i = 0, l = keys.length; i < l; i++) {
        if (target.hasOwnProperty(keys[i])) {
            target = target[keys[i]];
        } else {
            return undefined;
        }
    }

    return target;
};


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

satus.storage.set = function (keys, value) {
    var items = {},
        target = satus.storage.data;

    keys = keys.split('/').filter(function (value) {
        return value != '';
    });

    for (var i = 0, l = keys.length; i < l; i++) {
        var item = keys[i];

        if (i < l - 1) {

            if (target[item]) {
                target = target[item];
            } else {
                target[item] = {};

                target = target[item];
            }
        } else {
            target[item] = value;
        }
    }

    for (var key in satus.storage.data) {
        items[key] = satus.storage.data[key];
    }

    chrome.storage.local.set(items);
};


/*--------------------------------------------------------------
# LOCALE
--------------------------------------------------------------*/

satus.locale = {
    data: {}
};


/*--------------------------------------------------------------
# LOAD
--------------------------------------------------------------*/

satus.locale.load = async function (url, callback) {
    this.data = await (await fetch(url)).json();

    callback();
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

satus.locale.get = function (string) {
    if (this.data[string]) {
        return this.data[string].message;
    } else {
        return string;
    }
};


/*--------------------------------------------------------------
# ELEMENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# MENU
--------------------------------------------------------------*/

satus.elements.menu = function (skeleton) {
    var ul = document.createElement('ul');

    for (var key in skeleton) {
        if (typeof skeleton[key] === 'object' && skeleton[key].hasOwnProperty('element')) {
            var li = document.createElement('li');

            li.className = 'satus-menu__item';

            satus.render(skeleton[key], li);

            ul.appendChild(li);
        }
    }

    return ul;
};


/*--------------------------------------------------------------
# GRID
--------------------------------------------------------------*/

satus.elements.grid = function (skeleton) {
    var grid = document.createElement('div');

    grid.className = 'satus-grid';
    grid.dataset.edit = 'true';

    grid.addColumn = function (options) {
        var column = document.createElement('div'),
            before = document.createElement('div'),
            after = document.createElement('div');

        column.className = 'satus-grid__column';
        before.className = 'satus-grid-column__before';
        after.className = 'satus-grid-column__after';

        column.addItem = this.addItem;
        column.grid = this.grid || this;

        before.addEventListener('mouseover', function(event) {
            var item = this.parentNode;

            item.classList.add('satus-grid__column--hover-before');
        });

        before.addEventListener('mouseout', function(event) {
            var item = this.parentNode;

            item.classList.remove('satus-grid__column--hover-before');
        });

        before.addEventListener('mouseup', function(event) {
            var item = this.parentNode,
                column = item.grid.addColumn(),
                prev_column = item.grid.target.parentNode;

            item.classList.remove('satus-grid__column--hover-before');

            column.appendChild(item.grid.target);

            item.grid.insertBefore(column, item);

            if (prev_column.children.length === 2) {
                prev_column.remove();
            }
        });

        after.addEventListener('mouseover', function(event) {
            var item = this.parentNode;

            item.classList.add('satus-grid__column--hover-after');
        });

        after.addEventListener('mouseout', function(event) {
            var item = this.parentNode;

            item.classList.remove('satus-grid__column--hover-after');
        });

        after.addEventListener('mouseup', function(event) {
            var item = this.parentNode,
                column = item.grid.addColumn(),
                prev_column = item.grid.target.parentNode;

            item.classList.remove('satus-grid__column--hover-before');

            column.appendChild(item.grid.target);

            item.grid.insertBefore(column, item.nextElementSibling);

            if (prev_column.children.length === 2) {
                prev_column.remove();
            }
        });

        column.appendChild(before);
        column.appendChild(after);

        return column;
    };

    grid.addItem = function (options) {
        var item = document.createElement('div'),
            container = document.createElement('div'),
            before = document.createElement('div'),
            after = document.createElement('div');

        item.className = 'satus-grid__item';
        container.className = 'satus-grid__item-container';
        before.className = 'satus-grid-item__before';
        after.className = 'satus-grid-item__after';

        if (typeof options !== 'object') {
            options = {};
        }

        item.options = options;
        item.parent = this.parent || this;
        item.addItem = this.addItem;
        item.grid = this.grid || this;

        before.parent = item;
        after.parent = item;

        item.addEventListener('mousedown', function(event) {
            if (grid.dataset.edit !== 'true' || event.button !== 0) {
                return false;
            }

            var target = this,
                rect = this.getBoundingClientRect(),
                offset_x = event.clientX - rect.left,
                offset_y = event.clientY - rect.top,
                ghost = document.createElement('div');
            
            ghost.className = 'satus-grid__ghost';

            ghost.style.width = target.offsetWidth + 'px';
            ghost.style.height = target.offsetHeight + 'px';

            document.body.appendChild(ghost);

            this.classList.add('satus-grid__item--dragging');

            this.grid.target = this;
            this.grid.classList.add('satus-grid--dragging');

            function mousemove(event) {
                ghost.style.transform = 'translate(' + (event.clientX - offset_x) + 'px, ' + (event.clientY - offset_y) + 'px)';
            }
            
            function mouseup() {
                ghost.remove();

                target.classList.remove('satus-grid__item--dragging');

                target.grid.target = undefined;
                target.grid.classList.remove('satus-grid--dragging');

                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup', mouseup);
            }

            window.addEventListener('mousemove', mousemove, {passive: true});
            window.addEventListener('mouseup', mouseup, {passive: true});
            
            event.stopPropagation();
            event.preventDefault();

            return false;
        });

        before.addEventListener('mouseover', function(event) {
            var item = this.parentNode;
            
            if (item.grid.target && item.grid.target !== item) {
                item.classList.add('satus-grid__item--hover-before');
            }
        });

        before.addEventListener('mouseout', function(event) {
            var item = this.parentNode;

            item.classList.remove('satus-grid__item--hover-before');
        });

        before.addEventListener('mouseup', function(event) {
            var item = this.parentNode,
                column = item.grid.target.parentNode;

            item.classList.remove('satus-grid__item--hover-before');

            item.parentNode.insertBefore(item.grid.target, item);

            if (column.children.length === 2) {
                column.remove();
            }
        });

        after.addEventListener('mouseover', function(event) {
            var item = this.parentNode;
            
            if (item.grid.target && item.grid.target !== item) {
                item.classList.add('satus-grid__item--hover-after');
            }
        });

        after.addEventListener('mouseout', function(event) {
            var item = this.parentNode;

            item.classList.remove('satus-grid__item--hover-after');
        });

        after.addEventListener('mouseup', function(event) {
            var item = this.parentNode,
                column = item.grid.target.parentNode;

            item.classList.remove('satus-grid__item--hover-after');

            item.parentNode.insertBefore(item.grid.target, item.nextElementSibling);

            if (column.children.length === 2) {
                column.remove();
            }
        });

        item.appendChild(before);
        item.appendChild(after);
        item.appendChild(container);

        this.appendChild(item);

        return container;
    }

    for (var i = 0, l = skeleton.columns.length; i < l; i++) {
        var column = grid.addColumn();

        if (skeleton.columns[i].length) {
            for (var j = 0, k = skeleton.columns[i].length; j < k; j++) {
                satus.render(skeleton.columns[i][j], column.addItem());
            }
        } else {
            satus.render(skeleton.columns[i], column.addItem());
        }

        grid.appendChild(column);
    }

    return grid;
};


/*--------------------------------------------------------------
# TABLE
--------------------------------------------------------------*/

satus.elements.table = function (skeleton) {
    var table = document.createElement('div'),
        head = document.createElement('div'),
        body = document.createElement('div'),
        footer = document.createElement('div'),
        selection = document.createElement('div'),
        pagination = document.createElement('div');

    table.className = 'satus-table';
    head.className = 'satus-table__head';
    body.className = 'satus-table__body';
    footer.className = 'satus-table__footer';
    selection.className = 'satus-table__selection';
    pagination.className = 'satus-table__pagination';

    table.order = {
        by: 'asc',
        key: ''
    };
    table.columns = skeleton.columns;
    table.data = skeleton.data || [];
    table.count = table.data.length;
    table.pageIndex = 1;
    table.body = body;
    table.onsort = skeleton.onsort;
    table.onpage = skeleton.onpage;
    table.keyPath = skeleton.key_path;
    table.selection = {
        element: selection,
        rows: {
            length: 0
        }
    };
    table.pagination = pagination;

    body.thisTable = table;

    table.createRows = function (data, parent, columns) {
        for (var i = 0, l = data.length; i < l; i++) {
            var row = document.createElement('div'),
                is_filtered = true;

            row.className = 'satus-table__row';
            row.data = data[i];
            row.index = i;
            row.thisTable = parent.thisTable;

            if (this.selection.rows[i] === data[i]) {
                row.classList.add('selected');
            }

            for (var j = 0, k = columns.length; j < k; j++) {
                var value = data[i][columns[j].key],
                    cell = document.createElement('div');

                cell.dataset.keyPath = columns[j].key;

                if (typeof value === 'object') {
                    var button = document.createElement('button');

                    button.className = 'satus-button satus-button--tree';
                    button.textContent = '+';
                    button.rowIndex = i;
                    button.colIndex = j;
                    button.data = value;
                    button.table = this;
                    button.thisTable = row.thisTable;
                    button.column = columns[j];
                    button.addEventListener('click', function () {
                        if (this.textContent === '+') {
                            var columns = this.column.columns,
                                container = document.createElement('div'),
                                rows = [];

                            container.className = 'satus-table__inner-row';
                            container.thisTable = this.thisTable;

                            for (var key in this.data) {
                                var skip = false,
                                    item = this.data[key],
                                    row = {};

                                for (var i = 0, l = columns.length; i < l; i++) {
                                    if (this.column.key === columns[i].key) {
                                        columns[i] = this.column;
                                    }
                                }

                                for (var i = 0, l = columns.length; i < l; i++) {
                                    var column = columns[i];

                                    if (column.key === key) {
                                        skip = true;
                                    }

                                    row[column.key] = column.key === 'key' ? key : item[column.key];
                                }

                                if (skip === false) {
                                    rows.push(row);
                                }
                            }

                            if (rows[0][this.thisTable.order.key] === undefined) {
                                var order_key = 'key';
                            } else {
                                order_key = this.thisTable.order.key;
                            }

                            rows = satus.sort(order_key, this.thisTable.order.by, rows);

                            this.parentNode.parentNode.parentNode.insertBefore(container, this.parentNode.parentNode.nextElementSibling);

                            this.table.createRows(rows, container, columns);

                            this.textContent = '-';
                        } else {
                            this.textContent = '+';

                            this.parentNode.parentNode.nextElementSibling.remove();
                        }
                    });

                    cell.appendChild(button);
                } else if (satus.isset(value)) {
                    if (columns[j].filter && !value.match(columns[j].filter)) {
                        is_filtered = false;
                    }

                    if (typeof columns[j].intercept === 'function') {
                        columns[j].intercept(cell, value, i, row);
                    } else {
                        cell.innerText = value;
                    }
                }

                row.appendChild(cell);
            }

            if (is_filtered) {
                parent.appendChild(row);
            }
        }
    };

    table.update = function () {
        var body = this.body,
            pages = Math.ceil(this.count / 100);

        for (var i = body.children.length - 1; i > -1; i--) {
            body.children[i].remove();
        }

        for (var i = this.pagination.children.length - 1; i > -1; i--) {
            this.pagination.children[i].remove();
        }

        this.createRows(this.data, body, this.columns);

        if (pages > 1) {
            for (var i = 0; i < pages; i++) {
                var button = document.createElement('button');

                if (this.pageIndex > 4 && i > 0 && i < this.pageIndex - 2) {
                    i = this.pageIndex - 2;

                    var span = document.createElement('span');

                    span.innerText = '...';

                    this.pagination.appendChild(span);
                }

                if (this.pageIndex < pages - 4 && i === this.pageIndex + 1) {
                    i = pages - 1;

                    var span = document.createElement('span');

                    span.innerText = '...';

                    this.pagination.appendChild(span);
                }

                button.innerText = i + 1;

                if (this.pageIndex === i + 1) {
                    button.className = 'selected';
                }

                button.addEventListener('click', function () {
                    var table = this.parentNode.parentNode.parentNode,
                        prev = this.parentNode.querySelector('.selected');

                    table.pageIndex = Number(this.innerText);

                    if (prev) {
                        prev.classList.remove('selected');
                    }

                    this.classList.add('selected');

                    if (table.onpage) {
                        table.onpage(table.pageIndex * 100 - 100);
                    } else {
                        table.update();
                    }
                });

                this.pagination.appendChild(button);
            }
        }
    };

    for (var i = 0, l = skeleton.columns.length; i < l; i++) {
        var column = document.createElement('div'),
            sort = skeleton.columns[i].sort;

        column.key = skeleton.columns[i].key,
            column.innerText = satus.locale.get(skeleton.columns[i].label);

        if (sort !== false) {
            column.addEventListener('click', function () {
                var table = this.parentNode.parentNode,
                    columns = this.parentNode.children;

                for (var i = 0, l = columns.length; i < l; i++) {
                    delete columns[i].dataset.order;
                }

                if (table.order.by === 'asc') {
                    table.order.by = 'desc';
                } else {
                    table.order.by = 'asc';
                }

                table.order.key = this.key;

                this.dataset.order = table.order.by;

                if (table.onsort) {
                    table.onsort();
                } else {
                    table.data = satus.sort(table.order.key, table.order.by, table.data);

                    table.update();
                }
            });
        } else {
            column.style.cursor = 'default';
        }

        column.addEventListener('selectstart', function (event) {
            event.preventDefault();
        });

        if (sort === 'asc' || sort === 'desc') {
            table.order.by = sort;
            table.order.key = skeleton.columns[i].key;
            column.dataset.order = sort;
        }

        head.appendChild(column);
    }

    function createSelectionBar(table) {
        var bar = table.selection.element;

        if (bar.children.length > 0) {
            return;
        }

        var undo_button = document.createElement('button'),
            delete_button = document.createElement('button'),
            bookmark_button = document.createElement('button'),
            tag_input = document.createElement('input');

        tag_input.type = 'text';

        undo_button.className = 'satus-button';
        delete_button.className = 'satus-button';
        bookmark_button.className = 'satus-button';
        tag_input.className = 'satus-input';

        undo_button.textContent = 'Undo selection';
        delete_button.textContent = 'Delete';
        bookmark_button.textContent = 'Bookmark';
        tag_input.placeholder = 'Tags';

        undo_button.addEventListener('click', function () {
            var table = this.parentNode.parentNode.parentNode,
                elements = table.querySelectorAll('.selected');

            for (var i = 0, l = elements.length; i < l; i++) {
                elements[i].classList.remove('selected');
            }

            removeSelectionBar(table); 
        });

        delete_button.addEventListener('click', function () {
            var table = this.parentNode.parentNode.parentNode,
                rows = table.selection.rows,
                elements = table.querySelectorAll('.selected'),
                object_store = DB.indexedDB.transaction(table.skeleton.db_object_name, 'readwrite').objectStore(table.skeleton.db_object_name, 'readwrite');

            for (var i = elements.length - 1; i > 0; i--) {
                elements[i - 1].remove();
            }

            for (var key in rows) {
                if (key !== 'length') {
                    var row = rows[key];

                    object_store.delete(row[table.keyPath]);

                    delete table.data.splice(key, 1);
                    delete table.selection.rows[key];
                }
            }

            removeSelectionBar(table);
        });

        bookmark_button.addEventListener('click', function () {
            var table = this.parentNode.parentNode.parentNode,
                rows = table.selection.rows;

            for (var key in rows) {
                var row = rows[key];

                chrome.bookmarks.create({
                    title: row.url,
                    url: row.url,
                    parentId: '1'
                });
            }

            removeSelectionBar(table);
        });

        tag_input.addEventListener('input', function() {
            var table = this.parentNode.parentNode.parentNode,
                rows = table.selection.rows,
                elements = table.querySelectorAll('.selected'),
                object_store = DB.indexedDB.transaction(table.skeleton.db_object_name, 'readwrite').objectStore(table.skeleton.db_object_name, 'readwrite');

            for (var i = elements.length - 1; i > 0; i--) {
                var element = elements[i - 1].querySelector('[data-key-path=tags] input')
                    
                if (element) {
                    element.value = this.value;
                }
            }

            for (var key in rows) {
                if (key !== 'length') {
                    var row = rows[key];

                    row.tags = this.value;

                    object_store.put(row);
                }
            }
        });

        bar.appendChild(undo_button);
        bar.appendChild(delete_button);
        bar.appendChild(bookmark_button);
        bar.appendChild(tag_input);
    }

    function removeSelectionBar(table) {
        var elements = table.selection.element.children;

        for (var i = elements.length; i > 0; i--) {
            elements[i - 1].remove();
        }

        table.selection = {
            length: 0
        };
    }

    if (skeleton.select === true) {
        table.addEventListener('mousedown', function (event) {
            if (
                event.button !== 0 || 
                ['A', 'BUTTON', 'INPUT'].indexOf(event.target.nodeName) !== -1
            ) {
                return false;
            }

            var table = this,
                rows = [],
                start_row,
                next_row,
                end_row,
                start_mouse_y = 0,
                end_mouse_y = 0;

            function mousemove(event) {
                for (var i = 0, l = rows.length; i < l; i++) {
                    var row = rows[i];
                    
                    if (row) {
                        rows[i].classList.remove('selection');
                    }
                }

                rows.splice(1, rows.length);

                for (var i = 0, l = event.path.length - 2; i < l; i++) {
                    var item = event.path[i];

                    if (item.className && item.className.indexOf('satus-table__row') !== -1) {
                        end_row = item;
                    }
                }

                if (end_row && start_row !== end_row) {
                    next_row = start_row;

                    while (next_row && next_row !== end_row) {
                        if (start_mouse_y < event.clientY) {
                            next_row = next_row.nextElementSibling;
                        } else {
                            next_row = next_row.previousElementSibling;
                        }

                        rows.push(next_row);
                    }
                }

                for (var i = 0, l = rows.length; i < l; i++) {
                    var row = rows[i];
                    
                    if (row) {
                        row.classList.add('selection');
                    }
                }
            }

            function mouseup() {
                for (var i = 0, l = rows.length; i < l; i++) {
                    var row = rows[i];

                    if (row) {
                        row.classList.remove('selection');
                        row.classList.toggle('selected');

                        if (row.classList.contains('selected')) {
                            table.selection.rows[row.index] = row.data;

                            table.selection.rows.length++;
                        } else {
                            delete table.selection.rows[row.index];

                            table.selection.rows.length--;
                        }
                    }
                }

                if (table.selection.rows.length === 0) {
                    removeSelectionBar(table);
                } else {
                    createSelectionBar(table);
                }

                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup', mouseup);
            }

            for (var i = 0, l = event.path.length - 2; i < l; i++) {
                var item = event.path[i];

                if (item.className.indexOf('satus-table__row') !== -1) {
                    start_row = item;

                    rows.push(start_row);

                    event.preventDefault();
                }
            }

            if (start_row) {
                window.addEventListener('mousemove', mousemove);
                window.addEventListener('mouseup', mouseup);

                start_mouse_y = event.clientY;
            }
        });
    }

    table.appendChild(head);
    table.appendChild(body);
    footer.appendChild(selection);
    footer.appendChild(pagination);
    table.appendChild(footer);

    table.update();

    return table;
};


/*--------------------------------------------------------------
# SWITCH
--------------------------------------------------------------*/

satus.elements.switch = function (skeleton) {
    var element = document.createElement('button'),
        track = document.createElement('span');

    track.className = 'satus-switch__track';

    element.addEventListener('click', function () {
        this.change(this.dataset.value !== 'true');
    });

    element.appendChild(track);

    return element;
};


/*--------------------------------------------------------------
# MODAL
--------------------------------------------------------------*/

satus.elements.modal = function (skeleton) {
    var modal = document.createElement('div'),
        container = document.createElement('div');

    modal.addEventListener('click', function (event) {
        event.stopPropagation();

        if (this === event.target) {
            this.remove();
        }
    });

    container.className = 'satus-modal__container';

    for (var key in skeleton) {
        if (typeof skeleton[key] === 'object' && skeleton[key].hasOwnProperty('element')) {
            satus.render(skeleton[key], container);
        }
    }

    modal.appendChild(container);

    return modal;
};


/*--------------------------------------------------------------
# SELECT
--------------------------------------------------------------*/

satus.elements.select = function (skeleton) {
    var select = document.createElement('select');

    for (var i = 0, l = skeleton.options.length; i < l; i++) {
        skeleton.options[i].element = 'option';

        satus.render(skeleton.options[i], select);
    }

    select.addEventListener('change', function () {
        this.change(this.value);
    });

    select.setValue = function (value) {
        for (var i = 0, l = this.children.length; i < l; i++) {
            if (value === this.children[i].value) {
                this.children[i].selected = true;
            }
        }
    };

    return select;
};


/*--------------------------------------------------------------
# CHARTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# VERTICAL BARS
--------------------------------------------------------------*/

satus.elements.verticalBars = function (skeleton) {
    var chart = document.createElement('div'),
        max_value = Math.max.apply(null, skeleton.data);

    for (var i = 0, l = skeleton.data.length; i < l; i++) {
        var column = document.createElement('div'),
            bar = document.createElement('div'),
            value = document.createElement('div'),
            label = document.createElement('div');

        column.className = 'satus-vertical-bars__column';
        bar.className = 'satus-vertical-bars__bar';
        value.className = 'satus-vertical-bars__value';
        label.className = 'satus-vertical-bars__label';

        value.dataset.value = skeleton.data[i];
        value.title = skeleton.data[i];
        value.style.height = skeleton.data[i] * 100 / max_value + '%';

        label.textContent = satus.locale.get(skeleton.labels[i]);

        bar.appendChild(value);
        column.appendChild(bar);
        column.appendChild(label);
        chart.appendChild(column);
    }

    return chart;
};
