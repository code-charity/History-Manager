/*var grid = createGrid(),
	row1 = grid.addRow(),
	row2 = grid.addRow(),
	row3 = grid.addRow();

/*row1.addCell().appendChild(document.createTextNode('#001'));
row1.addCell().appendChild(document.createTextNode('#002'));
row1.addCell().appendChild(document.createTextNode('#003'));

row2.addCell().appendChild(document.createTextNode('#004'));
row2.addCell().appendChild(document.createTextNode('#005'));

row3.addCell().appendChild(document.createTextNode('#006'));*/

var grid = createGrid(),
	item = grid.addItem();

function addNewItem(event) {
	event.stopPropagation();

	this.addItem().addEventListener('dblclick', addNewItem);
}

item.addEventListener('dblclick', addNewItem);

document.body.appendChild(grid);