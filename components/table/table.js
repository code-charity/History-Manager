/*--------------------------------------------------------------
>>> TABLE
--------------------------------------------------------------*/

function createTable(columns, data) {
	var table = document.createElement('div'),
		head = document.createElement('div'),
		body = document.createElement('div'),
		footer = document.createElement('div'),
		selection = document.createElement('div'),
		pagination = document.createElement('div');

	table.className = 'table';
	head.className = 'table__head';
	body.className = 'table__body';
	footer.className = 'table__footer';
	selection.className = 'table__selection';
	pagination.className = 'table__pagination';

	table.order = {
		by: 'asc',
		column: 0
	};
	table.data = data;
	table.pageIndex = 1;
	table.body = body;
	table.selection = {
		element: selection,
		rows: {}
	};
	table.pagination = pagination;

	table.sort = function() {
		var index = this.order.column,
			data = this.data,
			type = typeof data[0][index];

		if (this.order.by === 'asc') {
			if (type === 'number') {
	            sorted = data.sort(function(a, b) {
	                return a[index] - b[index];
	            });
	        } else {
	            sorted = data.sort(function(a, b) {
	                return a[index].localeCompare(b[index]);
	            });
	        }
		} else {
			if (type === 'number') {
	            sorted = data.sort(function(a, b) {
	                return b[index] - a[index];
	            });
	        } else {
	            sorted = data.sort(function(a, b) {
	                return b[index].localeCompare(a[index]);
	            });
	        }
		}
	};

	table.update = function() {
		var body = this.body,
			pages = Math.ceil(this.data.length / 100);

		for (var i = body.children.length - 1; i > -1; i--) {
			body.children[i].remove();
		}

		for (var i = this.pagination.children.length - 1; i > -1; i--) {
			this.pagination.children[i].remove();
		}

		for (var i = this.pageIndex * 100 - 100, l = Math.min(this.data.length, i + 100); i < l; i++) {
			var row = document.createElement('div');

			row.data = this.data[i];
			row.index = i;

			for (var j = 0, k = this.data[i].length; j < k; j++) {
				var column = document.createElement('div');

				column.innerText = this.data[i][j];

				row.appendChild(column);
			}

			body.appendChild(row);
		}

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

            button.addEventListener('click', function() {
                var table = this.parentNode.parentNode.parentNode,
                	prev = this.parentNode.querySelector('.selected');

                table.pageIndex = Number(this.innerText);

                if (prev) {
                    prev.classList.remove('selected');
                }

                this.classList.add('selected');

                table.update();
            });

            this.pagination.appendChild(button);
		}
	};

	for (var i = 0, l = columns.length; i < l; i++) {
		var column = document.createElement('div');

		column.innerText = columns[i].label;

		column.addEventListener('click', function() {
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

			table.order.column = Array.prototype.indexOf.call(this.parentNode.children, this);

			this.dataset.order = table.order.by;

			table.sort();
			table.update();
		});

		column.addEventListener('selectstart', function(event) {
			event.preventDefault();
		});

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

	    undo_button.addEventListener('click', function() {
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

	    delete_button.addEventListener('click', function() {
	        var table = this.parentNode.parentNode.parentNode,
	            elements = table.querySelectorAll('.selected');

	        for (var i = elements.length - 1; i > 0; i--) {
	            var element = elements[i - 1];

	            delete table.data.table[element.data.index];
	            delete table.data.selection[element.data.index];

	            element.remove();
	        }

	        removeSelectionBar(table);

	        table.data.selection = {
	            length: 0
	        };
	    });

	    bookmark_button.addEventListener('click', function() {
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

	table.addEventListener('mousedown', function(event) {
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

	            if (item.parentNode && item.parentNode.className === 'table__body') {
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

	    window.addEventListener('mousemove', mousemove);
	    window.addEventListener('mouseup', mouseup);

	    start_mouse_y = event.clientY;

	    for (var i = 0, l = event.path.length; i < l; i++) {
	        var item = event.path[i];

	        if (item.parentNode && item.parentNode.className === 'table__body') {
	            start_row = item;

	            rows.push(start_row);

	            event.preventDefault();
	        }
	    }
	});

	table.appendChild(head);
	table.appendChild(body);
	footer.appendChild(selection);
	footer.appendChild(pagination);
	table.appendChild(footer);

	table.sort();
	table.update();

	return table;
}