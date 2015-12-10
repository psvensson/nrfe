requirejs.config(
{
	baseUrl: './bower_components'
});


// Start the main app logic.
requirejs(['../nrfe'], function(nrfe)
	{
		var _nrfe = new nrfe();
	});