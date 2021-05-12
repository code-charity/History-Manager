/*--------------------------------------------------------------
>>> TABLE
--------------------------------------------------------------*/

function createTable(columns, data) {
	var table = document.createElement('div'),
		head = document.createElement('div'),
		body = document.createElement('div'),
		footer = document.createElement('div'),
		pagination = document.createElement('div');

	table.className = 'table';
	head.className = 'table__head';
	body.className = 'table__body';
	footer.className = 'table__footer';
	pagination.className = 'table__pagination';

	table.order = {
		by: 'asc',
		column: 0
	};
	table.data = data;
	table.pageIndex = 1;
	table.body = body;
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

	table.appendChild(head);
	table.appendChild(body);
	footer.appendChild(pagination);
	table.appendChild(footer);

	table.sort();
	table.update();

	return table;
}