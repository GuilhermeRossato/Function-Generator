function CircleHandler(parent) {
	if (!(this.parent instanceof CanvasController))
		this.parent = parent;
	if (this.parent instanceof CanvasController) {
		this.box = new GuiBox(0, 0, this.parent.width, this.parent.height);
		var holdThis = this;
		this.box.checkBounds = function(x, y) {
			return holdThis.selected||(holdThis.circles.some(function (obj) { return (obj.inside(x, y)) }));
		}
		
		this.circles = [];

		["x", "y"].forEach((property) => {
			var i, value;
			for (i = 0;i<5;i++) {
				value = parseInt(getCookie(property+i));
				if ((typeof(lastc) !== "number") || (isNaN(lastc))) {
					if (typeof this.circles[i] === "undefined") {
						this.circles[i] = new Circle();
					}
					this.circles[i][property] = value;
				}
			}
		});
		lastc = parseInt(getCookie("circleCount"));
		
		if ((typeof(lastc) !== "number") || (isNaN(lastc))) {
			lastc = 4;
			repeat.call(this, lastc, function(i) {
				//this.addCircle(new Circle(this.box.width*(i/lastc)+this.box.width*Math.random()*(1/lastc), this.box.height*Math.random(), 6));
			});
		}

		repeat.call(this, 0, function (i) {
			this.addCircle(new Circle(this.parent.width*Math.random(), this.parent.height*Math.random(), 10));
			return true;
		})

	} else
		console.error("Parent not CanvasController");
}

CircleHandler.prototype = {
	constructor:CircleHandler,
	cursor:"pointer",
	selected:false,
	addCircle: function(obj) {
		if (obj instanceof Circle) {
			this.circles.push(obj);
		} else
			throw "CLASS ERROR: Parameter must be instance of Circle";
	},
	onMouseDown: function(btnId, x, y) {
		if ((btnId === 0) && this.box.checkBounds(x, y))
			this.selected = true;
	},
	onMouseMove: function(x, y) {
		return false;
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
		ctx.lineWidth = 1;
		ctx.beginPath();
		this.circles.forEach(function(obj) { obj.draw.call(obj, ctx); });
		ctx.stroke();
	}
}
