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
		var target = document.body
		console.log('widgetlist is');
		console.dir(widgetlist);
		console.log('nrfe is');
		console.dir(nrfe);
		var _nrfe = new nrfe(widgetlist, target, function()
		{
			console.log('gogogo');
		});
	});