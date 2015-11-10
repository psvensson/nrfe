var nrfe = function(target)
{
	this.target = target;
	this.version = "0.0.1";
}

var inst_table =
{
	'button': function(def, parent)
	{
		var node = document.createElement('button');
		node.innerHTML = def.text;
		if(def.handlers)
		{
			def.handlers.forEach(function(handler)
			{
				console.log('adding event handler '+handler.type+' for widget '+def.type);
				node.addEventListener(handler.type, handler.handler);
			})
		}
		parent.appendChild(node);
		return node;
	},
	'flexbox': function(def, parent)
	{
		var node = document.createElement('div');
		node.style = {container: 'flex', flexDirection: def.direction};
		parent.appendChild(node);
		return node;
	}
};

nrfe.prototype.parse = function(fedef)
{
	console.log('NRFE parsing front-end definition');
	console.dir(fedef);
	if(fedef)
	{
		fedef.forEach(function(widget_def)
		{
			this.parseWidget(widget_def, this.target)
		}.bind(this))
	}
};

nrfe.prototype.parseWidget = function(widget_def, parent)
{
	//console.log('NRFE parsing widget '+widget_def.type);
	var node = this.instantiateWidget(widget_def, parent);
	if(widget_def.children)
	{
		widget_def.children.forEach(function(widget_def_child)
		{
			this.parseWidget(widget_def_child, node);
		}.bind(this));
	}
};

nrfe.prototype.instantiateWidget = function(widget_def, parent)
{
	console.log('NRFE instantiating widget '+widget_def.type);
	return inst_table[widget_def.type](widget_def, parent);
};

//------------------------------------------------

//var definition =


//------------------------------------------------

var generator = new nrfe(window.document.body);
generator.parse(definition);