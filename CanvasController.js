/*	CanvasController.js - Created by GuilhermeRossato 01/2016
 *
 * Requires: Timestamper.js (Optional)
 *
 * Create the object when then the recipient you want the canvas in is loaded:
 *  = new CanvasController(document.getElementById("recipient"));
 * --------------------------------------------------------------------------------------------------------
 * Methods:
 * 	constructor(recipient[, width, height]);	Class Constructor ( new CanvasController(...) )
 *		recipient	(HTMLDivElement)	actual <div> element for the canvas to be put at
 * 		width		(number)			Size of the canvas element in pixels (default 960px)
 * 		height		(number)			Size of the canvas element in pixels (default 480 px)
 *
 *  .addObject(object)						Adds an object to the CanvasController
 * 		object		A new instance of the object to be created
 *
 *
 * 	.addEventListener(type, listener);			Sends a call to 'listener' before processing a specific event
 * 		type		(string): "mousemove", "mousedown", "mouseup", "mouseclick", "keydown", "keyup"
 * 		listener	(function): function to call when event happens
 * 		WARNING: listener MUST return logicly true value, otherwise the call will be aborted
 *		WARNING: useCapture	(from original addEventListener) IS NOT implemented and WILL be ignored
 * 		RETURN! if you return false in any event, that event WILL NOT be processed -> YOUR FUNCTION HAS TO RETURN TRUE BY DEFAULT!
 *
 * 	.removeEventListener(type, listener);		Removes a specific listener function from a specific event type
 * 		same as addEventListener
 *
 * 	.clearEventListener(type)					Clears all listener of an event type
 * 		type		Candidates: "mousemove", "mousedown", "mouseup", "mouseclick", "keydown", "keyup"
 *
 * --------------------------------------------------------------------------------------------------------
 * Constant Properties:
 *	.canvas;		instance of HTMLCanvasElement (HTML5)
 *	.ctx;			instanceof CanvasRenderingContext2D
 * --------------------------------------------------------------------------------------------------------
 * Normal Properties:
 * 	.mouse  {x, y, left, middle, right}		Object that holds some information about the mouse state
 * 		.x			Number, mouse's horizontal position in pixels relative to the canvas, 0 is left, canvas width is right
 * 		.y			Number, mouse's vertical position in pixels relative to the canvas, 0 is top, canvas height is bottom
 * 		.left		Boolean, whenever the left mouse button is being pressed
 * 		.middle		Boolean, whenever the middle mouse button is being pressed
 * 		.right		Boolean, whenever the right mouse button is being pressed
 *  .timestamper	Instance of Timestamper if it is declared, for usage see Timestamper.js
 *  .multiplier		Number, default 1.0, number in which deltas are multiplied before being sent to object's update/draw functions
 * --------------------------------------------------------------------------------------------------------
 * "Private" Properties: (AKA not-meant-for-you-to-use-or-change)
 *		.events;		Array with keys corresponding to event types (string) to help with event listeners.
 * 		.objects;		Array with objects to handle, send draw calls, etc
 * 			Each object can optionally contain the following functions: draw(delta), update(delta), onMouseMove(x, y), onMouseDown(x, y, button), onMouseUp(x, y, button),
 */

var eventCandidates = ["mousemove", "mousedown", "mouseup", "mouseclick", "keydown", "keyup"];

if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => ((typeof(value) !== "number" || isNaN(value) || value == 0)?defaultValue:value);
}

function CanvasController(recipient, width, height) {
	if (recipient instanceof HTMLDivElement) {
		var local, holdThis;
		holdThis = this;

		Object.defineProperty(this,"canvas",{
			configurable: false,
			enumerable: false,
			value: document.createElement('canvas'),
			writable: false
		});
		this.canvas.setAttribute('id','canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		//this.canvas.oncontextmenu = function () { return false; };
		recipient.appendChild(this.canvas);

		local = {};
		["width", "height"].forEach(function(property, i) {
			local[property] = defaultSet(i===0?width:height, 960);
			Object.defineProperty(holdThis,property,{
				configurable: false,
				enumerable: false,
				get: function() { return local[property]; },
				set: function(value) {
					if (typeof value === "number") {
						local[property] = value|0;
						canvas[property] = local[property];
					}
					return local[property];
				}
			});
			holdThis.canvas[property] = local[property];
		});

		local["cursor"] = "default";
		Object.defineProperty(this.mouse,"cursor",{
			configurable: false,
			enumerable: false,
			get: function() { return local["cursor"]; },
			set: function(value) {
				if (value !== local["cursor"])
					if ((typeof(value)==="string")&&(["default", "move", "crosshair", "pointer", "no-drop", "text", "wait", "copy", "help"].indexOf(value.toLowerCase()) !== -1)) {
						local["cursor"] = value.toLowerCase();
						if (holdThis instanceof CanvasController)
							holdThis.canvas.style.cursor = local["cursor"];
						else
							console.error("Could not pull parent from mouse object",holdThis);
						//canvas.style.cursor = value;
					} else
						console.error("Invalid cursor icon (",value,")");
			}
		});

		console.log("Canvas appended to", recipient.id, "with size", local["width"], local["height"]);

		Object.defineProperty(this,"ctx",{
			configurable: false,
			enumerable: false,
			value: this.canvas.getContext("2d"),
			writable: false
		});

		this.draw = function() {
			var ctx = this.ctx;
			this.objects.forEach(function (obj) {
				if (obj instanceof Object) {
					if (obj.clear instanceof Function)
						obj.clear.call(obj, ctx);
					if (obj.draw instanceof Function)
						obj.draw.call(obj, ctx);
				}
			});
		}

		/*
		if (Timestamper) {
			this.timestamper = new Timestamper(700,delta => this.objects.forEach(function (obj) {
				if (obj instanceof Object) {
					if (obj.clear instanceof Function)
						obj.clear.call(obj, this.ctx);
					if (obj.update instanceof Function)
						obj.update.call(obj, delta*this.multiplier);
					if (obj.draw instanceof Function)
						obj.draw.call(obj, this.ctx, delta*this.multiplier);
				}
			}));
		}*/

		document.addEventListener("mousemove", function(ev) { CanvasController.prototype.onMouseMove.call(holdThis, ev); }, false);
		document.addEventListener("mousedown", function(ev) { CanvasController.prototype.onMouseDown.call(holdThis, ev); }, false);
		document.addEventListener("mouseup", function(ev) { CanvasController.prototype.onMouseUp.call(holdThis, ev); }, false);
		//document.addEventListener("keydown", function(ev) { CanvasController.prototype.onKeyDown.call(holdThis, ev); }, false);
		document.onkeydown = function(ev) {
			return (CanvasController.prototype.onKeyDown.call(holdThis, ev));
		}
		document.addEventListener("keyup", function(ev) { CanvasController.prototype.onKeyUp.call(holdThis, ev); }, false);
	} else
		console.error("Canvas recipient:" , recipient, "should be a HTMLDivElement instance.");
}

function getMousePosition(ev) {
	return (ev instanceof MouseEvent)?{x: ev.clientX - this.canvas.offsetLeft + window.scrollX, y: ev.clientY - this.canvas.offsetTop + window.scrollY}:undefined;
}

CanvasController.prototype = {
	constructor: CanvasController,
	events: new Array(),
	objects: new Array(),
	mouse: {x:960/2, y:480/2, left:false, middle:false, right:false},
	multiplier: 1.0,
	onMouseMove: function (ev) {
		var m = getMousePosition(ev), shouldDraw = false, shouldCursor = "default";
		if ((!(this.events["mousemove"] instanceof Array))||(this.events["mousemove"].every(function (obj) { obj.call(this, m.x, m.y); }))) {
			/*If there is no event OR every events return true*/
			this.objects.forEach(function (obj) {
				if (obj instanceof Object) {
					if (obj.onMouseMove instanceof Function) {
						if (obj.onMouseMove.call(obj, m.x, m.y))
							shouldDraw = true;
					}
					if ((typeof(obj.cursor)==="string") && (obj.box instanceof GuiBox) && (shouldCursor === "default") && (obj.box.checkBounds(m.x, m.y))) {
						shouldCursor = obj.cursor;
					}
				}
			});
			if (shouldDraw) {
				this.draw();
			}
			this.mouse.cursor = shouldCursor;
		}
	},
	onMouseDown: function (ev) {
		var m = getMousePosition(ev), shouldDraw = false;
		if (!(this.events["mousedown"] instanceof Array)||(this.events["mousedown"].every(function (obj) { obj.call(m.x, m.y); }))) {
			var btnCode = ev.button;
			switch (btnCode) {
				case 0: this.mouse.left = true; break;
				case 1: this.mouse.middle = true; break;
				case 2:	this.mouse.right = true; break;
				break;
			}
			this.objects.forEach(function (obj) {
				if ((obj instanceof Object) && (obj.onMouseDown instanceof Function))
					if (obj.onMouseDown.call(obj, btnCode, m.x, m.y))
						shouldDraw = true;
			});
			if (shouldDraw)
				this.draw();
		}
	},
	onMouseUp: function (ev) {
		var m = getMousePosition(ev), shouldDraw = false;
		if (!(this.events["mouseup"] instanceof Array)||(this.events["mouseup"].every(function (obj) { obj.call(this, m.x, m.y); } ))) {
			var btnCode = ev.button;
			switch (btnCode) {
				case 0: this.mouse.left = false; break;
				case 1: this.mouse.middle = false; break;
				case 2:	this.mouse.right = false; break;
				break;
			}
			this.objects.forEach(function (obj) {
				if (obj instanceof Object && obj.onMouseUp instanceof Function)
					if (obj.onMouseUp.call(obj, btnCode, m.x, m.y))
						shouldDraw = true;
			});
			if (shouldDraw)
				this.draw();
		}
	},
	onKeyUp: function (ev) {
		if (!(this.events["keyup"] instanceof Array)||(this.events["keyup"].every(function (obj) { obj.call(this, ev.keyCode, ev.ctrlKey, ev.shiftKey, ev.altKey, ev); }))) {
			this.objects.forEach(function (obj) { if (obj instanceof Object && obj.onKeyUp instanceof Function) obj.onKeyUp.call(obj, ev.keyCode, ev.ctrlKey, ev.shiftKey, ev.altKey, ev); });
		}
	},
	onKeyDown: function (ev) { // Returns true if key should be processed by browser
		if (!(this.events["keydown"] instanceof Array)||(this.events["keydown"].every(function (obj) { obj.call(this, ev.keyCode, ev.ctrlKey, ev.shiftKey, ev.altKey, ev); }))) {
			var shouldDraw = false;

			this.objects.forEach(function (obj) {
				if (obj instanceof Object && obj.onKeyDown instanceof Function)
					if (obj.onKeyDown.call(obj, ev.keyCode, ev.ctrlKey, ev.shiftKey, ev.altKey, ev)) {
						shouldDraw = true;
					}
				});
			if (shouldDraw) {
				this.draw();
				return false; // Was processed => make browser ignore input
			} else if ((ev.keyCode === 9) && (!ev.ctrlKey)) { // TAB
				var i, j;
				for (i=this.objects.length-1;((i>=0) && (this.objects[i] instanceof Object) && !(this.objects[i].focus));i--);
				if (i===-1) {
					return true;
				} else {
					j = i+1;
					while (i!==j) {
						if ((this.objects[j] instanceof Object) && (this.objects[j].focus===false)) {
							this.objects[i].focus = false;
							this.objects[j].focus = true;
							break;
						}
						if (j >= this.objects.length)
							j = 0;
						else
							j++;
					}
					return (i===j);
				}
			}
		}
		return true; // Wasn't processed => let the browser do something with it
	},
	addObject: function (obj) {
		if (this instanceof CanvasController) {
			obj.parent = this;
			this.objects.push(obj);
			return obj;
		} else
			console.error("Function must run from an instance of CanvasController");
	},
	addEventListener: function (type, listener) {
		if (typeof(type) === "string") {
			if (type[0] == 'o' && type[1] == 'n')
				type = type.substr(2);
			var id = eventCandidates.indexOf(type.toLowerCase());
			if (id !== -1) {
				if (this.events[type.toLowerCase()] === undefined) {
					this.events[type.toLowerCase()] = [listener]; // Create if it's empty
				} else {
					id = this.events[type.toLowerCase()].indexOf(listener);
					if (id === -1) {
						this.events[type.toLowerCase()].push(listener);
					} else
						console.error("Specified listener is already connected to the event of type \""+type.toLowerCase()+"\"");
				}
			} else
				console.error("No event of type \"" + type.toLowerCase() + "\" in CanvasController");
		} else
			console.error("First argument (",typeof(type),") is supposed to be a string");
	},
	removeEventListener: function (type, listener) {
		if ((typeof(type) === "string")&&(eventCandidates.indexOf(type.toLowerCase()) !== -1)) {
			if (this.events[type.toLowerCase()] instanceof Array) {
				var id = this.events[type.toLowerCase()].indexOf(listener);
				if (id !== -1) {
					delete this.events[type.toLowerCase()][id];
				}
			}
		} else
			console.error("No event of type \"" + type.toLowerCase() + "\" in CanvasController");
	},
	clearEventListener: function (type) {
		if ((typeof(type) === "string")&&(eventCandidates.indexOf(type.toLowerCase()) !== -1)) {
			this.events[type.toLowerCase()] = undefined;
		} else
			console.error("No event of type \"" + type.toLowerCase() + "\" in CanvasController");
	}
}