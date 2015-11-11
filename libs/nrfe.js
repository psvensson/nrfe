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

var definition =
[
	{"type":"tab","id":"4414fb4e.bbeb04","label":"Sheet 1"},
	{"id":"ca61f614.359e08","type":"input","z":"4414fb4e.bbeb04","name":"Some Input","x":447.8958282470703,"y":746.8888854980469,"wires":[[]]},
	{"id":"8e68bbf6.719748","type":"page","z":"4414fb4e.bbeb04","x":476.8958282470703,"y":423.8888854980469,"wires":[["d85d02b6.27a3","8d23e6ae.72dc18"]]},
	{"id":"d85d02b6.27a3","type":"section","z":"4414fb4e.bbeb04","x":447.8958282470703,"y":550.8888854980469,"wires":[["ca61f614.359e08"]]},
	{"id":"8d23e6ae.72dc18","type":"section","z":"4414fb4e.bbeb04","x":648.8957977294922,"y":547.8889465332031,"wires":[["72907ee5.8d6f8"]]},
	{"id":"72907ee5.8d6f8","type":"button","z":"4414fb4e.bbeb04","name":"OK","x":674.8958282470703,"y":749.8888854980469,"wires":[[],[]]}
]


//------------------------------------------------

var generator = new nrfe(window.document.body);
generator.parse(definition);