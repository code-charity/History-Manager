function createGrid() {
	var grid = document.createElement('div');

	grid.className = 'grid';

	grid.addRow = function () {
		var row = document.createElement('div');

		row.className = 'grid__row';

		row.addCell = function () {
			var cell = document.createElement('div');

			cell.className = 'grid__cell';

			cell.draggable = true;

			cell.addEventListener('dragstart', function() {
				this.dataset.dragging = true;
			});

			cell.addEventListener('dragend', function() {
				delete this.dataset.dragging;
			});

			cell.addEventListener('dragover', function(event) {
				var drag = document.querySelector('.grid__cell[data-dragging=true]'),
					x = event.layerX / (event.target.offsetWidth / 100),
					y = event.layerY / (event.target.offsetHeight / 100);

				if (!event.target.dataset.dragging) {
					if (x < 50) {
						this.parentNode.insertBefore(drag, this);
					} else {
						this.parentNode.insertBefore(drag, this.nextElementSibling);
					}
				}
			});

			cell.addEventListener('dragleave', function() {
				this.style.backgroundColor = '';
			});

			this.appendChild(cell);

			return cell;
		};

		this.appendChild(row);

		return row;
	};

	return grid;
}