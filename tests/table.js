var data = [];

for (var i = 0; i < 1024; i++) {
	data.push([
		i,
		'column #' + i,
		'user #' + i,
		i * 1000
	]);
}

var table = createTable([
		{label: 'column #1'},
		{label: 'column #2'},
		{label: 'column #3'},
		{label: 'column #4'}
	], data);

document.body.appendChild(table);