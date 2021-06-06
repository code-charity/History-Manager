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
    if (element) {
        for (var i = element.children.length - 1; i > -1; i--) {
            element.children[i].remove();
        }
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
            element.classList.add(skeleton.class.split(' '));
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
    grid.dataset.edit = false;

    grid.addItem = function (options) {
        var item = document.createElement('div'),
            left = document.createElement('div'),
            right = document.createElement('div'),
            center = document.createElement('div');

        item.className = 'satus-grid__item';
        left.className = 'satus-grid-item__left';
        right.className = 'satus-grid-item__right';
        center.className = 'satus-grid-item__center';

        if (typeof options !== 'object') {
            options = {};
        }

        //item.draggable = true;

        item.options = options;
        item.parent = this.parent || this;
        item.addItem = this.addItem;

        left.parent = item;
        right.parent = item;
        center.parent = item;


        /*// MOUSE OVER
        item.addEventListener('mouseover', function(event) {
            if (event.path[0] === this && this.parent.editing === true) {
                this.classList.add('grid__item--hover');
            }
        });

        item.addEventListener('mouseout', function(event) {
            if (event.path[0] === this && this.parent.editing === true) {
                this.classList.remove('grid__item--hover');
            }
        });


        // DRAG & DROP (CHILD)
        item.addEventListener('dragstart', function(event) {
            event.target.parent.dragChild = event.target;

            event.target.parent.classList.add('grid--drag');

            event.target.classList.add('grid__item--drag');
        });

        item.addEventListener('dragend', function(event) {
            var parent = this.parent.dragParent,
                child = this.parent.dragChild;

            if (parent && child) {
                if (parent.type === 'left') {
                    var target = parent.target;

                    target.parentNode.insertBefore(target.parent.dragChild, target);
                } else if (parent.type === 'center') {
                    var target = parent.target;

                    target.appendChild(target.parent.dragChild);
                } else if (parent.type === 'right') {
                    var target = parent.target;

                    target.parentNode.insertBefore(target.parent.dragChild, target.nextElementSibling);
                }
            }

            event.target.parent.classList.remove('grid--drag');

            delete this.parent.dragParent;
            delete this.parent.dragChild;
            
            event.target.classList.remove('grid__item--drag');
        });


        // DRAG & DROP (INSERT BEFORE PARENT)
        left.addEventListener('dragover', function(event) {
            var target = event.target.parentNode;

            if (target.classList.contains('grid__item--drag') === false) {
                target.classList.add('grid__item--dragover');

                target.dataset.dragOver = 'left';

                target.parent.dragParent = {
                    type: 'left',
                    target: target
                };
            }
        });

        left.addEventListener('dragleave', function(event) {
            var target = event.target.parentNode;

            delete target.dataset.dragOver;

            target.classList.remove('grid__item--dragover');
        });

        // DRAG & DROP (INSERT TO PARENT)
        center.addEventListener('dragover', function(event) {
            var target = event.target.parentNode;

            if (target.classList.contains('grid__item--drag') === false) {
                target.classList.add('grid__item--dragover');

                target.dataset.dragOver = 'center';

                target.parent.dragParent = {
                    type: 'center',
                    target: target
                };
            }
        });

        center.addEventListener('dragleave', function(event) {
            var target = event.target.parentNode;

            delete target.dataset.dragOver;

            target.classList.remove('grid__item--dragover');
        });

        // DRAG & DROP (INSERT AFTER PARENT)
        right.addEventListener('dragover', function(event) {
            var target = event.target.parentNode;

            if (target.classList.contains('grid__item--drag') === false) {
                target.classList.add('grid__item--dragover');

                target.dataset.dragOver = 'right';

                target.parent.dragParent = {
                    type: 'right',
                    target: target
                };
            }
        });

        right.addEventListener('dragleave', function(event) {
            var target = event.target.parentNode;

            delete target.dataset.dragOver;

            target.classList.remove('grid__item--dragover');
        });*/

        item.appendChild(left);
        item.appendChild(center);
        item.appendChild(right);

        this.appendChild(item);

        return item;
    }

    for (var i = 0, l = skeleton.items.length; i < l; i++) {
        var item = grid.addItem();

        satus.render(skeleton.items[i], item);
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
    table.selection = {
        element: selection,
        rows: {
            length: 0
        }
    };
    table.pagination = pagination;

    table.createRows = function(data, parent, columns) {
        for (var i = 0, l = data.length; i < l; i++) {
            var row = document.createElement('div'),
                is_filtered = true;

            row.className = 'satus-table__row';
            row.data = data[i];
            row.index = i;

            if (this.selection.rows[i] === data[i]) {
                row.classList.add('selected');
            }

            for (var j = 0, k = columns.length; j < k; j++) {
                var value = data[i][columns[j].key],
                    cell = document.createElement('div');

                if (typeof value === 'object') {
                    var button = document.createElement('button');

                    button.className = 'satus-button satus-button--tree';
                    button.textContent = '+';
                    button.rowIndex = i;
                    button.colIndex = j;
                    button.data = value;
                    button.table = this;
                    button.column = columns[j];
                    button.addEventListener('click', function () {
                        if (this.textContent === '+') {
                            var columns = this.column.columns,
                                container = document.createElement('div'),
                                rows = [];

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
            bookmark_button = document.createElement('button');

        undo_button.textContent = 'Undo selection';
        delete_button.textContent = 'Delete';
        bookmark_button.textContent = 'Bookmark';

        undo_button.addEventListener('click', function () {
            var table = this.parentNode.parentNode.parentNode,
                elements = table.querySelectorAll('.selected');

            for (var i = 0, l = elements.length; i < l; i++) {
                elements[i].classList.remove('selected');
            }

            removeSelectionBar(table);

            table.data.selection = {
                length: 0
            };
        });

        delete_button.addEventListener('click', function () {
            var table = this.parentNode.parentNode.parentNode,
                rows = table.selection.rows,
                elements = table.querySelectorAll('.selected');

            for (var i = elements.length - 1; i > 0; i--) {
                elements[i - 1].remove();
            }

            for (var key in rows) {
                if (key !== 'length') {
                    var row = rows[key];

                    delete table.data.splice(key, 1);
                    delete table.selection.rows[key];
                }
            }

            removeSelectionBar(table);

            table.selection = {
                length: 0
            };
        });

        bookmark_button.addEventListener('click', function () {
            var table = this.parentNode.parentNode.parentNode;

            for (var key in table.data.selection) {
                var element = elements[key];

                delete table.data.table[element.data.index];
                delete table.data.selection[element.data.index];

                chrome.bookmarks.create({
                    title: this.parentNode.children[1].innerText,
                    url: this.parentNode.children[2].children[0].href,
                    parentId: '1'
                }, function (item) {
                    self.bookmarkId = item.id;
                });
            }
        });

        bar.appendChild(undo_button);
        bar.appendChild(delete_button);
        bar.appendChild(bookmark_button);
    }

    function removeSelectionBar(table) {
        var elements = table.selection.element.children;

        for (var i = elements.length; i > 0; i--) {
            elements[i - 1].remove();
        }
    }

    table.addEventListener('mousedown', function (event) {
        if (
            event.button !== 0 || ['A', 'BUTTON', 'INPUT'].indexOf(event.target.nodeName) !== -1
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
                rows[i].classList.remove('selection');
            }

            rows.splice(1, rows.length);

            for (var i = 0, l = event.path.length; i < l; i++) {
                var item = event.path[i];

                if (item.className === 'satus-table__row') {
                    end_row = item;
                }
            }

            if (end_row && start_row !== end_row) {
                next_row = start_row;

                while (next_row !== end_row) {
                    if (start_mouse_y < event.clientY) {
                        next_row = next_row.nextElementSibling;
                    } else {
                        next_row = next_row.previousElementSibling;
                    }

                    rows.push(next_row);
                }
            }

            for (var i = 0, l = rows.length; i < l; i++) {
                rows[i].classList.add('selection');
            }
        }

        function mouseup() {
            for (var i = 0, l = rows.length; i < l; i++) {
                var row = rows[i];

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

            if (table.selection.rows.length === 0) {
                removeSelectionBar(table);
            } else {
                createSelectionBar(table);
            }

            window.removeEventListener('mousemove', mousemove);
            window.removeEventListener('mouseup', mouseup);
        }

        for (var i = 0, l = event.path.length; i < l; i++) {
            var item = event.path[i];

            if (item.className === 'satus-table__row') {
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

    select.addEventListener('change', function() {
        this.change(this.value);
    });

    select.setValue = function(value) {
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
            label = document.createElement('div');

        column.className = 'satus-vertical-bars__column';
        bar.className = 'satus-vertical-bars__bar';
        label.className = 'satus-vertical-bars__label';

        bar.dataset.value = skeleton.data[i];
        bar.title = skeleton.data[i];
        bar.style.height = skeleton.data[i] * 100 / max_value + '%';

        label.textContent = satus.locale.get(skeleton.labels[i]);

        column.appendChild(bar);
        column.appendChild(label);
        chart.appendChild(column);
    }

    return chart;
};