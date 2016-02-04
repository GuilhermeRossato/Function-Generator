/*	GuiInput.js - Created by GuilhermeRossato 02/2016
 * 
 *	 This class handles an input box that cannot be displayed differently by different browsers,
 *	this is achieved by manually handling it in canvas, which decreases compatibility, but pays off in my eyes.
 * 
 * 	 Requires: GuiBox.js and CanvasController
 * 
 *	<Pending documentation>
 * 
 */
	
if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => (typeof(value) !== "number" || isNaN(value) || value == 0 )?defaultValue:value;
}

function GuiInput(x, y, width, height, numbersOnly) {
	this.box = new GuiBox(x, y);
	this.box.width = defaultSet(width,20)+4;
	this.box.height = defaultSet(height,20)+4;
	
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

GuiInput.prototype = {
	constructor: GuiInput,
	focus: false,
	numeric: false,
	multiLine: false,
	graphic: {roundness: 2, focusBorder: 3, bgColor:"#33495E", focusColor:"#2E4154", textColor:"#EEE", font:"13px Arial", marginTop:5},
	onMouseDown: function (btnId, x, y) {
		if ((btnId === 0) && (this.state === 1) && this.box.checkBounds(x, y)) {
			this.state = 2;
			this.isDown = true;
			if (this.onClickDown instanceof Function)
				this.onClickDown(x-this.box.left, y-this.box.top);
		}
	},
	onMouseUp: function (btnId, x, y) {
		if (this instanceof GuiInput) {
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
		if (this instanceof GuiInput) {
			if (ctx instanceof CanvasRenderingContext2D) {
				var roundness = this.graphic.roundness;
				ctx.fillStyle = this.graphic.bgColor;
				ctx.strokeStyle = this.graphic.textColor;
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
				ctx.stroke();
				ctx.fill();
				ctx.fillStyle = this.graphic.textColor;
				
				ctx.textAlign="left";
				ctx.fillStyle = this.graphic.textColor;
				ctx.font = this.graphic.font;
				if (this.multiLine) {
					ctx.textBaseline="top";
					ctx.fillText(this.text, (this.box.left+this.box.right)/2, this.box.top+this.graphic.marginTop);
				} else {
					ctx.textBaseline="middle";
					ctx.fillText(this.text, (this.box.left+this.box.right)/2, (this.box.top+this.box.bottom)/2);
				}
				ctx.restore();
			} else 
				console.error("First parameter is supposed to be instance of CanvasRenderingContext2D:",ctx);
		} else
			console.error("Function must run from an instance of GuiInput");
	},
	autosize: function(ctx) {
		if (this instanceof GuiInput) {
			if (ctx instanceof CanvasRenderingContext2D)
				return (this.box.width = this.graphic.margin.left+this.graphic.margin.right+ctx.measureText(this.text).width);
			else
				return (this.box.width = this.graphic.margin.left+this.graphic.margin.right+text.length*4.71); // magic number = approximation
		} else
			console.error("Function must run from an instance of GuiInput");
	},
	checkBounds: function(x, y) {
		if (this instanceof GuiInput) {
			return ((x > this.box.left) && (x < this.box.right+this.graphic.shadow) && (y > this.box.top) && (y < this.box.bottom+this.graphic.shadow)); 
		} else
			console.error("Function must run from an instance of GuiInput");
	}
}
