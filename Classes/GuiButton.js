/*	GuiButton.js - Created by GuilhermeRossato 01/2016
 * 
 *	 This class handles a button that cannot be displayed differently by different browsers,
 *	this is achieved by manually handling it in canvas, which decreases compatibility, unfortunately.
 * 
 * 	 Requires: CanvasController (mandatory)
 * 
 * Usage Example: Creates a GUI Button for the specific CanvasController, with text "Click me"
 * anchored on top left position [100,100]px with size [200,20]px
 *  = new GuiButton(canvasController, "Click me", 100, 100, 200, 20);
 * 
 * --------------------------------------------------------------------------------------------------------
 * Methods:
 * 	constructor(title[, px, py, width, height]);		Class Constructor ( new GuiButton(...) )
 * 		title					String containing the text to be displayed on the 
 * 		px						Horizontal position in pixels [default 20 ]
 * 		py						Vertical position in pixels [ default 20 ]
 * 		width					Horizontal size of element, zero for automatic size [ default 0 (stretch for text) ]
 * 		height					Vertical size of element [ default 20 ]
 * 
 *	.checkBounds(x, y)			Returns true or false depending whenever the specified parameters are inside the button or not
 * 	.draw(ctx);					Function that a CanvasController calls when it's supposed to draw the button, one parameter: CanvasRenderingContext2D (ctx)
 * 	.onMouseMove(x, y);
 * 	.onMouseDown(btnId, x, y);
 * 	.onMouseUp(btnId, x, y);
 * 
 * --------------------------------------------------------------------------------------------------------
 * Normal Properties:
 *	.px				Holds the horizontal position
 * 	.py				Holds the vertical position
 * 	.anchorX		String that indicates where horizontal position points to, candidates are: "left" (default), "middle", "right"
 * 	.anchorY		String that indicates where vertical position points to, candidates are: "top" (default), "middle", "bottom"
 * 	.isToggle		Boolean that makes button act as a toggle switch
 * 	.isDown			Boolean that tells the user whenever the button is being pressed (or toggled down, if it's the case)
 *  .onClickDown	Function that is fired when the button is pressed with left key
 * 	.onClick		Function that is fired when the left mouse button is released
 * 	.graphic
 * 		{roundness: 5,		 	Margin for Round Corners in pixels (0 = square)
 * 		 shadow: 3,				Shadow dropdown in pixels
 * 		 color:"#33495E",		Color for fillStyle of foreground
 * 		 shadowColor:"#222"		Color for fillStyle of shadow
 *		 overColor:"#2E4154"	Color for fillstyle when the mouse is over the button
 *		 textColor:"#EEE"		Color for fillText for the title of the button
 *		}
 * --------------------------------------------------------------------------------------------------------
 * "Private" Properties:
 * 	.state		Numeric value to hold what state is the button at (0,1,2,3 or 4,5,6,7)
 * 	
 */

// Flat UI Buttons concept and colors from: https://github.com/designmodo/Flat-UI

	
if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => (typeof(value) !== "number" || isNaN(value) || value == 0 )?defaultValue:value;
}
	
function GuiButton(text, x, y, width, height, ctx) {
	this.text = text;
	this.box = new GuiBox(x, y);
	if (ctx instanceof CanvasRenderingContext2D) {
		ctx.font = this.graphic.font;
		this.box.width = this.graphic.margin.left+this.graphic.margin.right+ctx.measureText(this.text).width;
	} else
		this.box.width = defaultSet(width+this.graphic.shadow,this.graphic.margin.left+this.graphic.margin.right+80);
	this.box.height = defaultSet(height,20)+this.graphic.shadow;
	Object.defineProperty(this,"boundingRect",{
		configurable: false,
		enumerable: false,
		get: function() { return this.box; },
		set: function(value) { console.error("boundingRect is unassignable"); }
	});
	Object.defineProperty(this,"isToggle",{
		configurable: false,
		enumerable: false,
		get: function() { return (state >= 3) },
		set: function(value) {
			if (value && (state < 3))
				state += 4;
			else if ((!value) && (state >= 3))
				state -= 4;
		}
	});
}

GuiButton.prototype = {
	constructor: GuiButton,
	state: 0,
	isDown: false,
	graphic: {roundness: 5, shadow: 3, color:"#33495E", shadowColor:"#222", overColor:"#2E4154", textColor:"#EEE", margin:{left: 10, right:10}, font:"14px Arial"},
	
	onMouseMove: function (x, y) {
		var isInside = this.box.checkBounds(x, y);
		if ((this.state === 0 || this.state === 4) && isInside) {
			this.state = 1;
		} else if ((this.state === 1 || this.state === 5) && (!isInside)) {
			this.state = 0;
		}
	},
	onMouseDown: function (btnId, x, y) {
		if ((btnId === 0) && (this.state === 1) && this.box.checkBounds(x, y)) {
			this.state = 2;
			this.isDown = true;
			if (this.onClickDown instanceof Function)
				this.onClickDown(x-this.box.left, y-this.box.top);
		}
	},
	onMouseUp: function (btnId, x, y) {
		if (this instanceof GuiButton)
		{
			if (btnId === 0) {
				var isInside = this.box.checkBounds(x, y);
				if (this.state === 2) {
					if (isInside) {
						this.isDown = false;
						if (this.onClick instanceof Function)
							this.onClick(x-this.box.left, y-this.box.top);
					}
				}
				this.state = isInside?1:0;
			}
		} else
			console.error("Function must run from an instance of GuiButton");
	},
	clear: function(ctx) {
		ctx.clearRect(this.box.left-1, this.box.top-1, this.box.width+this.graphic.shadow+2, this.box.height+this.graphic.shadow+2);
	},
	draw: function(ctx) {
		if (this instanceof GuiButton) {
			if (ctx instanceof CanvasRenderingContext2D) {
				function dr(roundness) {
					ctx.beginPath();
					ctx.moveTo(this.box.left+roundness, this.box.top);
					ctx.lineTo(this.box.right-roundness, this.box.top);
					ctx.quadraticCurveTo(this.box.right, this.box.top, this.box.right, this.box.top+roundness);
					ctx.lineTo(this.box.right, this.box.bottom-roundness);
					ctx.quadraticCurveTo(this.box.right, this.box.bottom, this.box.right-roundness, this.box.bottom);
					ctx.lineTo(this.box.left+roundness, this.box.bottom);
					ctx.quadraticCurveTo(this.box.left, this.box.bottom, this.box.left, this.box.bottom-roundness);
					ctx.lineTo(this.box.left, this.box.top+roundness);
					ctx.quadraticCurveTo(this.box.left, this.box.top, this.box.left+roundness, this.box.top);
				}
				
				ctx.save();
				ctx.fillStyle = this.graphic.shadowColor;
				ctx.translate(this.graphic.shadow, this.graphic.shadow);
				dr.call(this, this.graphic.roundness*1.5);
				ctx.fill();
				
				if (this.state === 0 || this.state === 4) {
					ctx.translate(-this.graphic.shadow, -this.graphic.shadow);
					ctx.fillStyle = this.graphic.color;
				}
				else if (this.state === 1 || this.state === 5) {
					ctx.translate(-this.graphic.shadow, -this.graphic.shadow);
					ctx.fillStyle = this.graphic.overColor;
				} else {
					ctx.translate(-1, -1);
					ctx.fillStyle = this.graphic.overColor;
				}
				dr.call(this, this.graphic.roundness);
				ctx.fill();
				ctx.textAlign="center";
				ctx.textBaseline="middle";
				ctx.fillStyle = this.graphic.textColor;
				ctx.font = this.graphic.font;
				ctx.fillText(this.text, (this.box.left+this.box.right)/2, (this.box.top+this.box.bottom)/2);
				ctx.restore();
			} else 
				console.error("First parameter is supposed to be instance of CanvasRenderingContext2D:",ctx);
		} else
			console.error("Function must run from an instance of GuiButton");
	},
	autosize: function(ctx) {
		if (this instanceof GuiButton) {
			if (ctx instanceof CanvasRenderingContext2D)
				return (this.box.width = this.graphic.margin.left+this.graphic.margin.right+ctx.measureText(this.text).width);
			else
				return (this.box.width = this.graphic.margin.left+this.graphic.margin.right+text.length*4.71); // magic number = approximation
		} else
			console.error("Function must run from an instance of GuiButton");
	},
	checkBounds: function(x, y) {
		if (this instanceof GuiButton) {
			return ((x > this.box.left) && (x < this.box.right+this.graphic.shadow) && (y > this.box.top) && (y < this.box.bottom+this.graphic.shadow)); 
		} else
			console.error("Function must run from an instance of GuiButton");
	}
}
