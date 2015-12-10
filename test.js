requirejs.config(
{
	baseUrl: './bower_components',
	paths:
	{
		json: 'requirejs-plugins/src/json',
		text: 'requirejs-plugins/lib/text',
		nrfe: '../nrfe'
	}
});


// Start the main app logic.
requirejs(['nrfe', 'json!nrfe-widgets/widgetlist.json'], function(nrfe, widgetlist)
	{
		var target = document.getElementById('content');
		var flows =
		[
			{
				"type": "tab",
				"id": "60efd3b0.9f102c",
				"label": "Sheet 1"
			},
			{
				"type": "tab",
				"id": "5edadb99.a12524",
				"label": "Sheet 2"
			},
			{
				"id": "192a5232.e6d5ae",
				"type": "page",
				"z": "60efd3b0.9f102c",
				"style": "background-color:#88f4ef",
				"name": "foo",
				"x": 120,
				"y": 55,
				"wires": [
					[

					]
				]
			}
		];
		var generator = new nrfe(widgetlist, function()
		{
			console.log('gogogo');
			generator.render(flows, target);
		});
	});