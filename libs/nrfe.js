var nrfe = function(target)
{
	this.target = target;
	this.version = "0.0.1";
	this.widgets = [];
	console.log = hyper.log;
}

//------------------------------------------------------------------------------- Table o' widgets

var inst_table =
{
	'button': function(def, parent)
	{
		var node = document.createElement('button');
		def.node = node;

		node.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent";
		node.innerHTML = def.name;

		var events = ['click'];

		events.forEach(function(handler)
		{
			//console.log('adding event handler '+handler+' for widget '+def.type);
			node.addEventListener(handler, function(e)
			{
				def.out({payload:e})
			});
		});

		def.in = function(msg)
		{
			console.log('ohayoo - button got input message');
			console.dir(msg);
		};

		return node;
	},
	'flexbox': function(def, parent)
	{
		var node = document.createElement('div');
		node.style = {container: 'flex', flexDirection: def.direction};
		return node;
	},
	'event': function(def, parent)
	{

		def.in = function(msg)
		{
			var e = msg.payload;
			if(e && e.type == def.event)
			{
				def.out(msg);
			}
		};

	},
	'input': function(def, parent)
	{
		var node = document.createElement('input');
		node.className = "mdl-textfield__input";

		var events = ['click','change','keypress','keyup','keydown', 'focus','blur'];

		events.forEach(function(handler)
		{
			//console.log('adding event handler '+handler+' for widget '+def.type);
			node.addEventListener(handler, function(e)
			{
				def.out({payload:e})
			});
		});

		return node;
	},
	'page': function(def, parent)
	{
		var node = document.createElement('div');
		node.className="mdl-grid";
		node.style.background = def.background;
		node.style.flexDirection = def.direction || 'col';
		return node;
	},
	'section': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		return node;
	},
	'text': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));
		node.innerHTML = def.text;
		return node;
	},
	'image': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		var img = document.createElement('img');
		img.style.height='100px';
		img.style.width='100px';
		img.style.zIndex='1000';
		node.appendChild(img);
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log('settings img.src to '+def.image);
		img.src = def.image;
		console.log(JSON.stringify(def));
		return node;
	},
	'template': function(def, parent)
	{
		var node = document.createElement('div');
		//node.innerHTML = "fooz";
		def.in = function(msg)
		{
			//console.log('template got message');
			//console.dir(JSON.stringify(msg));
			//console.log('template is '+def.template);
			node.innerHTML = Mustache.render(def.template, msg)
		};
		console.log('---- creating template '+def.name);
		console.dir(node);
		return node;
	},
	'function': function(def, parent)
	{
		def.in = function(msg)
		{
			var func = new Function('msg', def.func);
			var rv = func(msg);
			def.out(rv);
		};

	},
	'bluetooth': function(def, parent)
	{
		def.in = function(msg)
		{
			if(def.scanning)
			{
				console.log('stopping scanning')
				evothings.ble.stopScan();
				def.scanning = false;
			}
			else
			{
				def.scanning = true;
				evothings.ble.startScan(function(r)
				{
					msg.payload = r
					def.out(msg);
				});
			}
		};

	},
	'picklist': function(def, parent)
	{
		var node = document.createElement('div');
		node.className = "mdl-cell mdl-cell--4-col mdl-cell--stretch";
		//node.style = "container: 'flex', flexDirection: "+def.direction;
		console.log(JSON.stringify(def));

		tdef = def.picklist.split(',');

		var table = document.createElement('table');
		table.className = "mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp";
		var thead = document.createElement('thead');
		table.appendChild(thead);
		var thtr = document.createElement('tr');
		thead.appendChild(thtr);
		tdef.forEach(function(colname)
		{
			var th = document.createElement('th');
			th.innerHTML = colname;
			thtr.appendChild(th);
		});
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		def.in = function(msg)
		{
			var tr = document.createElement('tr');
			tbody.appendChild(tr);
			tdef.forEach(function(colval)
			{
				var td = document.createElement('td');
				td.innerHTML = msg.payload[colval];
				tr.appendChild(td);
			});
		};

		//-----------------------
		node.appendChild(table);
		return node;
	}
};

//------------------------------------------------------------------------------- Parsing

nrfe.prototype.render = function(fedef)
{
	console.log('NRFE parsing front-end definition');
	console.dir(fedef);
	var page = undefined;
	if(fedef)
	{
		console.log('rendering fe def '+fedef);
		console.dir(fedef);
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
	if(widget_def)
	{
		var node = widget_def.node || this.instantiateWidget(widget_def, parentNode);
		widget_def.node = node;
		if(parentNode && widget_def.node && !widget_def.node.parentNode)
		{
			//console.log('* * appending '+widget_def.type+' under '+parentNode);
			parentNode.appendChild(node);
		}
		if(widget_def.wires)
		{
			widget_def.wires.forEach(function(widget_def_child)
			{
				widget_def_child.forEach(function(childid)
				{
					this.renderWidget(this.widgets[childid], node);
				}.bind(this));
			}.bind(this));
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
					//console.log('sending message to widget '+wid);
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


