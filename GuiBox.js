/*	GuiBox.js - Created by GuilhermeRossato 01/2016
 * 
 *	 This class handles positioning of objects on a canvas controller, with anchor, alignment and other useful behaviours to control
 * 	It is supposed to be used as a property (usually called "box") of another class.
 * 
 * 	 Requires: CanvasController.js
 * 
 * Usage Example: A "Square" class has one instance of this class: 
 * Square.prototype.box = new GuiBox(x, y, width, height);
 * 
 * --------------------------------------------------------------------------------------------------------
 * Methods:
 * 	constructor([x, y, width, height]);		Class Constructor ( new GuiBox(...) )
 * 		x						Horizontal position in pixels [default 0 ]
 * 		y						Vertical position in pixels [ default 0 ]
 * 		width					Horizontal size of element [default 10 ]
 * 		height					Vertical size of element [ default 10 ]
 * 
 *	.checkBounds(x, y)			Returns true if the specified parameters are inside the button or not
 * 	.draw(ctx);					Placeholder function to draw a black box. first parameter must be a CanvasRenderingContext2D (ctx/context from a canvas)
 * 
 * --------------------------------------------------------------------------------------------------------
 * Public Properties: (Can be assigned, one change will affect others)
 *	.left		Horizontal Left
 *  .center		Horizontal Center
 *  .right		Horizontal Right
 *  .top		Vertical Top
 *  .middle		Vertical Middle
 *  .bottom		Vertical Bottom
 *  .width		If changed the left of the box will stay at the same place
 *  .height		If changed the top of the box will stay at the same place
 * --------------------------------------------------------------------------------------------------------
 * 	
 */
	
if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => ((typeof(value) !== "number" || isNaN(value) || value == 0)?defaultValue:value);
}

function GuiBox(x, y, width, height) {
	var local_left = defaultSet(x, 0),
		local_top = defaultSet(y, 0),
		local_width = defaultSet(width, 10),
		local_height = defaultSet(height, 10),
		local_right = local_left + local_width,
		local_bottom = local_top + local_height,
		local_center = (local_left+local_right)/2,
		local_middle = (local_top+local_bottom)/2;

	Object.defineProperty(this,"left",{
		configurable: false,
		enumerable: false,
		get: function() { return local_left; },
		set: function(value) {
			if (typeof(value) == "number") {
				if (local_left !== value) {
					local_right = (local_left = value) + local_width;
					local_center = (local_left + local_right)/2;
					if (this.onChange instanceof Function)
						this.onChange("left");
				}
			} else
				console.error("Object's position expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"center",{
		configurable: false,
		enumerable: false,
		get: function() { return local_center; },
		set: function(value) {
			if (typeof(value) == "number") {
				if (local_center !== value) {
					local_center = value;
					local_left = value-local_width/2;
					local_right = value+local_width/2;
					if (this.onChange instanceof Function)
						this.onChange("center");
				}
			} else
				console.error("Object's position expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"right",{
		configurable: false,
		enumerable: false,
		get: function() { return local_right; },
		set: function(value) {
			if (typeof(value) === "number") {
				if (local_right !== value) {
					local_right = value;
					local_left = value - local_width;
					local_center = (local_left + local_right)/2;
					if (this.onChange instanceof Function)
						this.onChange("right");
				}
			} else
				console.error("Object's position expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"top",{
		configurable: false,
		enumerable: false,
		get: function() { return local_top; },
		set: function(value) {
			if (typeof(value) === "number") {
				if (local_top !== value) {
					local_top = value;
					local_bottom = value + local_height;
					local_middle = (local_top + local_bottom)/2;
					if (this.onChange instanceof Function)
						this.onChange("top");
				}
			} else
				console.error("Object's position expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"middle",{
		configurable: false,
		enumerable: false,
		get: function() { return local_middle; },
		set: function(value) {
			if (typeof(value) === "number") {
				if (local_middle !== value) {
					local_middle = value;
					local_top = value-local_height/2;
					local_bottom = value+local_height/2;
					if (this.onChange instanceof Function)
						this.onChange("middle");
				}
			} else
				console.error("Object's position expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"bottom",{
		configurable: false,
		enumerable: false,
		get: function() { return local_bottom; },
		set: function(value) {
			if (typeof(value) == "number") {
				if (local_bottom !== value) {
					local_bottom = value;
					local_top = value - local_height;
					local_middle = (local_top + local_bottom)/2;
					if (this.onChange instanceof Function)
						this.onChange("bottom");
				}
			} else
				console.error("Object's position expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"width",{
		configurable: false,
		enumerable: false,
		get: function() { return local_width; },
		set: function(value) {
			if (typeof(value) == "number") {
				if (local_width !== value) {
					local_width = value;
					local_right = local_left + value;
					local_center = (local_left+local_right)/2;
					if (this.onChange instanceof Function)
						this.onChange("width");
				}
			} else
				console.error("Object's width expects number, got", typeof(value));
 		}
	});
	
	Object.defineProperty(this,"height",{
		configurable: false,
		enumerable: false,
		get: function() { return local_height; },
		set: function(value) {
			if (typeof(value) == "number") {
				if (local_height !== value) {
					local_height = value;
					local_bottom = local_top + value;
					local_middle = (local_top+local_bottom)/2;
					if (this.onChange instanceof Function)
						this.onChange("height");
				}
			} else
				console.error("Object's height expects number, got", typeof(value));
 		}
	});
}

GuiBox.prototype = {
	constructor: GuiBox,
	graphic: {},
	draw: function (ctx) { // Placeholder
		if (this instanceof GuiBox) {
			if (ctx instanceof CanvasRenderingContext2D) {
				ctx.fillStyle = "#000";
				ctx.beginPath();
				ctx.moveTo(this.left, this.top);
				ctx.lineTo(this.right, this.top);
				ctx.lineTo(this.right, this.bottom);
				ctx.lineTo(this.left, this.bottom);
				ctx.fill();
				return true;
			} else
				console.error("Function expected CanvasRenderingContext2D as first parameter, got",ctx);
		} else
			console.error("Function must run from an instance of GuiBox");
		return false;
	},
	checkBounds: function(x, y) {
		if (this instanceof GuiBox) {
			return ((x > this.left) && (x < this.right) && (y > this.top) && (y < this.bottom)); 
		} else
			console.error("Function must run from an instance of GuiBox");
		return false;
	}
}
