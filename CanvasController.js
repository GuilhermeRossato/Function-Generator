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

function CanvasController(recipient, width, height) {
	console.log("Canvas Controller Instance Created");
	if (recipient instanceof HTMLDivElement) {
		var local_width = width, local_height = height;
		if ( typeof(local_width) !== "number" || isNaN(local_width) || local_width == 0 )
			local_width = 960;
		if ( typeof(local_height) !== "number" || isNaN(local_height) || local_height == 0 )
			local_height = 480;
			
		Object.defineProperty(this,"width",{
			configurable: false,
			enumerable: false,
			get: function() { return (local_width) },
			set: function(value) { local_width = value; canvas.width = local_width; return value; }
		});
			
		Object.defineProperty(this,"height",{
			configurable: false,
			enumerable: false,
			get: function() { return (local_height) },
			set: function(value) { local_height = value; canvas.height = local_height; return value; }
		});
		
		Object.defineProperty(this,"canvas",{
			configurable: false,
			enumerable: false,
			value: document.createElement('canvas'),
			writable: false
		});
		this.canvas.setAttribute('id','canvas');
		this.canvas.width = local_width;
		this.canvas.height = local_height;
		this.canvas.oncontextmenu = function () { return false; };
		recipient.appendChild(this.canvas);
		console.log("Canvas appended to", recipient.id, "with size", local_width, local_height);
		
		Object.defineProperty(this,"ctx",{
			configurable: false,
			enumerable: false,
			value: this.canvas.getContext("2d"),
			writable: false
		});
		var holdThis = this;
		document.addEventListener("mousemove", function(ev) { CanvasController.prototype.onMouseMove.call(holdThis, ev); }, false);
		document.addEventListener("mousedown", function(ev) { CanvasController.prototype.onMouseDown.call(holdThis, ev); }, false);
		document.addEventListener("mouseup", function(ev) { CanvasController.prototype.onMouseUp.call(holdThis, ev); }, false);
		
	} else
		console.error("Canvas recipient:" , recipient, "should be a HTMLDivElement instance.");
}

CanvasController.prototype = {
	constructor: CanvasController,
	events: new Array(),
	objects: new Array(),
	mouse: {x:960/2, y:480/2, left:false, middle:false, right:false},
	multiplier: 1.0,
	
	onMouseMove: function (ev) {
		if (!(this.events["mousemove"] instanceof Array)||(this.events["mousemove"].every(obj => obj.call(this, ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop))))
			this.objects.forEach(obj => { if (obj instanceof Object && obj.onMouseMove instanceof Function) obj.onMouseMove.call(obj, ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop); });
			//console.log("Process Mouse Move");
	},
	onMouseDown: function (ev) {
		if (!(this.events["mousedown"] instanceof Array)||(this.events["mousedown"].every(obj => obj.call(this, ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop)))) {
			var btnCode = ev.button;
			switch (btnCode) {
				case 0: this.mouse.left = true; break;
				case 1: this.mouse.middle = true; break;
				case 2:	this.mouse.right = true; break;
				break;
			}
			this.objects.forEach(obj => { if (obj instanceof Object && obj.onMouseDown instanceof Function) obj.onMouseDown.call(obj, btnCode, ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop); });
		}
	},
	onMouseUp: function (ev) {
		if (!(this.events["mouseup"] instanceof Array)||(this.events["mouseup"].every(obj => obj.call(this, ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop)))) {
			var btnCode = ev.button;
			switch (btnCode) {
				case 0: this.mouse.left = false; break;
				case 1: this.mouse.middle = false; break;
				case 2:	this.mouse.right = false; break;
				break;
			}			
			this.objects.forEach(obj => { if (obj instanceof Object && obj.onMouseUp instanceof Function) obj.onMouseUp.call(obj, btnCode, ev.clientX - this.canvas.offsetLeft, ev.clientY - this.canvas.offsetTop); });
		}
	},
	addObject: function (btn) {
		if (this instanceof CanvasController) {
			this.objects.push(btn);
			return btn
		} else
			console.error("Function must run from an instance of GuiBox");
			
	},
	addEventListener: function (type, listener) {
		if (typeof(type) === "string") {
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
						// You should not add the same function to the same event, use a god damn loop or something!
				}
			} else
				console.error("No event of type \"" + type.toLowerCase() + "\" in CanvasController");
				//First parameter must be one from the "eventCandidates" variable (global constant)
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
			//First parameter must be one from the "eventCandidates" variable (global constant)
	},
	clearEventListener: function (type) {
		if ((typeof(type) === "string")&&(eventCandidates.indexOf(type.toLowerCase()) !== -1)) {
			this.events[type.toLowerCase()] = undefined;
		} else
			console.error("No event of type \"" + type.toLowerCase() + "\" in CanvasController");
			//First parameter must be one from the "eventCandidates" variable (global constant)
	}
}