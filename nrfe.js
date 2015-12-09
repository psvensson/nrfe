var nrfe = function(target)
{
	this.target = target;
	this.version = "0.0.1";
	this.widgets = [];
	console.log = hyper.log;
}

var dump = function(o)
{
	for(var p in o)
	{
		console.log(p+' -> '+o[p]);
	}
}

//------------------------------------------------------------------------------- Parsing

nrfe.prototype.render = function(fedef)
{
	console.log('NRFE parsing front-end definition');
	console.dir(fedef);
	var page = undefined;
	if(fedef)
	{
		fedef.forEach(function(wdef)
		{

			if(wdef.type === 'page')
			{
				page = wdef;
			}

			this.widgets[wdef.id] = wdef
		}.bind(this));
		this.renderWidget(page, this.target);
	}
};

nrfe.prototype.renderWidget = function(widget_def, parentNode)
{
	//console.log('NRFE parsing widget '+widget_def.type);
	if(widget_def   )
	{
		var node = widget_def.node || this.instantiateWidget(widget_def, parentNode);
		widget_def.node = node;
		if(parentNode && widget_def.node)
		{
			//console.log('* * appending '+widget_def.type+' under '+parentNode);
			parentNode.appendChild(node);
		}
		if(widget_def.wires && !widget_def.wired)
		{
			widget_def.wired = true
			widget_def.wires.forEach(function(widget_def_child)
			{
				widget_def_child.forEach(function(childid)
				{
					this.renderWidget(this.widgets[childid], node);
				}.bind(this));
			}.bind(this));
		}
		if(node && widget_def.events && !widget_def.evented)
		{
			widget_def.evented = true;
			var events = widget_def.events.split(',');
			//var events = ['click','change','keypress','keyup','keydown', 'focus','blur'];
			events.forEach(function(handler)
			{
				//console.log('adding event handler '+handler+' for widget '+def.type);
				node.addEventListener(handler, function(e)
				{
					widget_def.out({payload:e})
				});
			});
		}
	}
};

nrfe.prototype.instantiateWidget = function(widget_def, parentNode)
{
	console.log('NRFE instantiating widget '+widget_def.type+', under parent node '+parentNode);
	//console.dir(widget_def)
	var nodeCreator = inst_table[widget_def.type];
	var node = undefined;
	if(nodeCreator)
	{
		node = nodeCreator(widget_def, parentNode);
		if(node)
		{
			node._def = widget_def;
		}
		//console.log('creator returns node '+node);
		widget_def.out = function(msg)
		{
			var wires = this.widgets[widget_def.id].wires;
			//console.log("out wires are..");
			//console.log(JSON.stringify(wires));
			wires.forEach(function(warr)
			{
				warr.forEach(function(wid)
				{
					//console.log('sending message to widget '+wid+' type '+widget_def.type);
					var w = this.widgets[wid];
					//console.log(JSON.stringify(w));
					w.in(msg);
				}.bind(this))
			}.bind(this))
		}.bind(this);
		if(!widget_def.in)
		{
			widget_def.in = function(msg)
			{
				console.log('-- no message handler defined for node '+widget_def.type+' ['+widget_def.id+']');
				console.dir(msg);
			};
		}
	}
	return node;
};
