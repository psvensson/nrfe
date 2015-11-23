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
	'template': function(def, parent)
	{
		var node = document.createElement('div');
		node.innerHTML = "fooz";
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

//------------------------------------------------------------------------------- Definition

var definition =
	[
		{
			"type": "tab",
			"id": "cb6121bd.349ee",
			"label": "Sheet 1"
		},
		{
			"id": "11ad4194.ee52be",
			"type": "page",
			"background": "afaf",
			"x": 1046.8958587646484,
			"y": 172.88888549804688,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"1e4a38bc.e1b5c7",
					"44a92a1a.bb56d4"
				]
			]
		},
		{
			"id": "1e4a38bc.e1b5c7",
			"type": "section",
			"x": 1394.8959197998047,
			"y": 375.8888854980469,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"c259c8b8.3da638"
				]
			]
		},
		{
			"id": "44a92a1a.bb56d4",
			"type": "section",
			"x": 956.8957977294922,
			"y": 358.8888854980469,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"914d31e3.6eb2d",
					"b19e28bd.4e61d8",
					"556f9cdb.aa9064"
				]
			]
		},
		{
			"id": "914d31e3.6eb2d",
			"type": "input",
			"name": "",
			"x": 749.8957977294922,
			"y": 511.888916015625,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"3448e27f.cbb71e"
				]
			]
		},
		{
			"id": "b19e28bd.4e61d8",
			"type": "button",
			"name": "OK",
			"x": 1214.8959197998047,
			"y": 511.8888854980469,
			"z": "cb6121bd.349ee",
			"wires": [
				[],
				[
					"d6d24ce5.292db"
				]
			]
		},
		{
			"id": "d6d24ce5.292db",
			"type": "event",
			"name": "Event",
			"event": "click",
			"x": 1053.895980834961,
			"y": 676.8889465332031,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"ff7d73c8.00829"
				]
			]
		},
		{
			"id": "c259c8b8.3da638",
			"type": "template",
			"name": "Event handler output",
			"field": "payload",
			"format": "handlebars",
			"template": "Found Bluetooth device <b>{{payload.name}}</b> !",
			"x": 1468.8959197998047,
			"y": 679.8889465332031,
			"z": "cb6121bd.349ee",
			"wires": [
				[]
			]
		},
		{
			"id": "556f9cdb.aa9064",
			"type": "template",
			"name": "Input field output",
			"field": "payload",
			"format": "handlebars",
			"template": "This is the payload: {{payload.srcElement.value}} !",
			"x": 987.8958282470703,
			"y": 516.8888854980469,
			"z": "cb6121bd.349ee",
			"wires": [
				[]
			]
		},
		{
			"id": "3448e27f.cbb71e",
			"type": "event",
			"name": "Event",
			"event": "change",
			"x": 779.8958282470703,
			"y": 627.8888854980469,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"556f9cdb.aa9064"
				]
			]
		},
		{
			"id": "ff7d73c8.00829",
			"type": "bluetooth",
			"name": "bluetooth",
			"bluetooth": "click",
			"x": 1255.8958282470703,
			"y": 678.8888854980469,
			"z": "cb6121bd.349ee",
			"wires": [
				[
					"c259c8b8.3da638"
				]
			]
		}
	]




//------------------------------------------------

var generator = new nrfe(document.getElementById("content"));
generator.render(definition);