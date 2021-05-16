function createGrid() {
	var grid = document.createElement('div');

	grid.className = 'grid';

	/*grid.addCell = function () {
		var cell = document.createElement('div'),
			before = document.createElement('div'),
			after = document.createElement('div');

		before.className = 'grid-cell__before';
		after.className = 'grid-cell__after';
		cell.className = 'grid__cell';

		cell.draggable = true;

		cell.addEventListener('dragstart', function() {
			this.dataset.dragging = true;
		});

		cell.addEventListener('dragend', function() {
			delete this.dataset.dragging;
		});

		before.addEventListener('dragover', function(event) {
			var drag = document.querySelector('.grid__cell[data-dragging=true]');

			if (!event.target.dataset.dragging) {
				this.parentNode.parentNode.insertBefore(drag, this.parentNode);
			}
		});

		after.addEventListener('dragover', function(event) {
			var drag = document.querySelector('.grid__cell[data-dragging=true]');

			if (!event.target.dataset.dragging) {
				this.parentNode.parentNode.insertBefore(drag, this.parentNode.nextElementSibling);
			}
		});

		cell.addEventListener('dragleave', function() {
			this.style.backgroundColor = '';
		});

		cell.appendChild(before);
		cell.appendChild(after);
		this.appendChild(cell);

		return cell;
	};

	grid.addColumn = function (options) {
		var row = document.createElement('div');

		if (typeof options !== 'object') {
			options = {};
		}

		if (options.before !== false) {
			var before = document.createElement('div');

			before.className = 'grid-row__before';

			before.addEventListener('dragover', function(event) {
				var drag = document.querySelector('.grid__cell[data-dragging=true]');

				if (!event.target.dataset.dragging) {
					this.parentNode.parentNode.insertBefore(drag, this.parentNode);
				}
			});

			row.appendChild(before);
		}

		if (options.after !== false) {
			var after = document.createElement('div');

			after.className = 'grid-row__after';

			after.addEventListener('dragover', function(event) {
				var drag = document.querySelector('.grid__cell[data-dragging=true]');

				if (!event.target.dataset.dragging) {
					this.parentNode.parentNode.insertBefore(drag, this.parentNode.nextElementSibling);
				}
			});

			row.appendChild(after);
		}

		row.className = 'grid__row';

		row.addCell = this.addCell;

		this.appendChild(row);

		return row;
	};

	grid.addRow = function (options) {
		var row = document.createElement('div');

		row.parent = this;

		if (typeof options !== 'object') {
			options = {};
		}

		if (options.before !== false) {
			var before = document.createElement('div');

			before.className = 'grid-row__before';

			before.addEventListener('dragover', function(event) {
				var drag = document.querySelector('.grid__cell[data-dragging=true]');

				if (!event.target.dataset.dragging) {
					this.parentNode.parentNode.insertBefore(drag, this.parentNode);
				}
			});

			row.appendChild(before);
		}

		if (options.after !== false) {
			var after = document.createElement('div');

			after.className = 'grid-row__after';

			after.addEventListener('dragover', function(event) {
				var drag = document.querySelector('.grid__cell[data-dragging=true]');

				if (!event.target.dataset.dragging) {
					this.parentNode.parentNode.insertBefore(drag, this.parentNode.nextElementSibling);
				}
			});

			row.appendChild(after);
		}

		row.className = 'grid__row';

		row.addColumn = this.addColumn;

		this.appendChild(row);

		return row;
	};*/

	grid.addItem = function(options) {
		var item = document.createElement('div'),
			//row = document.createElement('div'),
			left = document.createElement('div'),
			right = document.createElement('div'),
			//column = document.createElement('div'),
			//top = document.createElement('div'),
			center = document.createElement('div');
			//bottom = document.createElement('div'),

		item.className = 'grid__item';
		//row.className = 'grid-item__row';
		left.className = 'grid-item__left';
		right.className = 'grid-item__right';
		//column.className = 'grid-item__column';
		//top.className = 'grid-item__top';
		center.className = 'grid-item__center';
		//bottom.className = 'grid-item__bottom';

		if (typeof options !== 'object') {
			options = {};
		}

		item.draggable = true;

		item.options = options;
		item.parent = this.parent || this;
		item.addItem = this.addItem;

		//row.parent = item;
		left.parent = item;
		right.parent = item;
		//column.parent = item;
		//top.parent = item;
		center.parent = item;
		//bottom.parent = item;


		// MOUSE OVER
		item.addEventListener('mouseover', function(event) {
			var target = event.target.parentNode;

			if (target.classList.contains('grid__item')) {
				target.classList.add('grid__item--hover');
			}
		});

		item.addEventListener('mouseout', function(event) {
			var target = event.target.parentNode;

			if (target.classList.contains('grid__item')) {
				target.classList.remove('grid__item--hover');
			}
		});


		// DRAG & DROP (CHILD)
		item.addEventListener('dragstart', function(event) {
			event.target.parent.dragChild = event.target;

			event.target.classList.add('grid__item--drag');
		});

		item.addEventListener('dragend', function(event) {
			var parent = this.parent.dragParent,
				child = this.parent.dragChild;

			if (parent && child) {
			console.log(parent.type);
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
		});

		//item.appendChild(row);
		item.appendChild(left);
		item.appendChild(center);
		item.appendChild(right);
		/*row.appendChild(left);
		row.appendChild(column);
		row.appendChild(right);
		column.appendChild(top);
		column.appendChild(center);
		column.appendChild(bottom);*/
		
		/*if (this.classList.contains('grid__item')) {
			this.children[0].children[1].appendChild(item);
		} else {
			this.appendChild(item);
		}*/

		this.appendChild(item);

		return item;
	}

	return grid;
}