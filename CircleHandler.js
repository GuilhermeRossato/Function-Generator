function CircleHandler(parent) {
	this.parent = parent;
	if (this.parent instanceof CanvasController) {
		this.box = new GuiBox(0, 0, this.parent.width, this.parent.height);
		var holdThis = this;
		this.box.checkBounds = function(x, y) {
			//var at = + new Date();
			//var result = holdThis.selected||(holdThis.circles.some(function (obj) { return (obj.inside(x, y)) }));
			//console.log("distance = ",(+ new Date())-at);
			//return result;
			return holdThis.selected||(holdThis.circles.some(function (obj) { return (obj.inside(x, y)) }));
		}
		for(var i = 0;i<1000;i++)
			this.addCircle(new Circle(this.parent.width*Math.random(), this.parent.height*Math.random(), 10));
	} else
		console.error("Parent not CanvasController");
}

CircleHandler.prototype = {
	constructor:CircleHandler,
	circles:[],
	cursor:"pointer",
	selected:false,
	addCircle: function(obj) {
		if (obj instanceof Circle) {
			this.circles.push(obj);
		}
	},
	onMouseDown: function(btnId, x, y) {
		if ((btnId === 0) && this.box.checkBounds(x, y))
			this.selected = true;
	},
	onMouseMove: function(x, y) {
		return true;
	},
	onMouseUp: function(btnId, x, y) {
		if (this.selected===true)
			this.selected = false;
	},
	clear: function(ctx) {
		this.box.clear(ctx);
	},
	draw: function(ctx) {
		ctx.strokeStyle = "#444";
		ctx.beginPath();
		this.circles.forEach(function(obj) { obj.draw(ctx); });
		ctx.stroke();
	}
}
