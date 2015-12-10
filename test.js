requirejs.config(
{
	baseUrl: './bower_components',
	paths:
	{
		json: 'requirejs-plugins/src/json',
		text: 'requirejs-plugins/lib/text'
	}
});


// Start the main app logic.
requirejs(['../nrfe', 'json!nrfe-widgets/widgetlist.json'], function(nrfe, widgetlist)
	{
		var def = [];
		console.log('widgetlist is');
		console.dir(widgetlist);
		var _nrfe = new nrfe(widgetlist, def);
	});