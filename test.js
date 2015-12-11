requirejs.config(
{
	baseUrl: './bower_components',
	paths:
	{
		Mustache: 'mustache.js/mustache',
		json: 'requirejs-plugins/src/json',
		text: 'requirejs-plugins/lib/text',
		nrfe: '../nrfe'
	}
});


// Start the main app logic.
requirejs(['nrfe', 'json!nrfe-widgets/widgetlist.json', 'json!../flows.json'], function(nrfe, widgetlist, flows)
	{
		var target = document.getElementById('content');

		var generator = new nrfe(widgetlist, function()
		{
			console.log('gogogo');
			generator.render(flows, target);
		});
	});