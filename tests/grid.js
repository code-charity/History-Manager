var grid = createGrid(),
	row1 = grid.addRow(),
	row2 = grid.addRow(),
	row3 = grid.addRow();

row1.addCell().textContent = '#001';
row1.addCell().textContent = '#002';
row1.addCell().textContent = '#003';

row2.addCell().textContent = '#004';
row2.addCell().textContent = '#005';

row3.addCell().textContent = '#006';

document.body.appendChild(grid);