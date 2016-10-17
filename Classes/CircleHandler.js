function CircleHandler(parent, grid) {
	if (!(this.parent instanceof CanvasController))
		this.parent = parent;
	if (this.parent instanceof CanvasController) {
		this.box = new GuiBox(0,0,this.parent.width,this.parent.height);
		var self = this;
		this.grid = grid;
		this.maxCircles = 10;
		this.isDragging = false;
		this.loadFromCookies();
		this.applyMininumCircleTreshold(3);
		this.saveTimer = window.setInterval(() => {self.saveToCookies.call(self)}, 5000);
	} else
		console.error("Parent not CanvasController");
}
CircleHandler.prototype = {
	constructor: CircleHandler,
	selected: false,
	applyMininumCircleTreshold: function(mininumPoints) {
		for (var i = mininumPoints - this.circles.length - 1; i >= 0; i--) {
			var circle = new Circle(Math.random(),Math.random(), this.grid);
			this.addCircle(circle);
		}
	},
	addCircle: function(obj) {
		if (obj instanceof Circle) {
			obj.parent = this;
			obj.updateCanvasPosition(this.grid);
			this.circles.push(obj);
		} else
			throw "CLASS ERROR: Parameter must be instance of Circle";
	},
	loadFromCookies: function() {
		var circles = []
		  , self = this;
		["x", "y"].forEach((property)=>{
			var i, value;
			for (i = 0; i < self.maxCircles; i++) {
				value = getCookie(property + i);
				value = parseFloat(value);
				if ((typeof (lastc) !== "number") || (isNaN(lastc))) {
					if (typeof circles[i] === "undefined")
						circles[i] = new Circle(0, 0, this.grid);
					circles[i].pos.graph[property] = value;
				}
			}
		}
		);
		this.circles = [];
		for (i = self.maxCircles - 1; i >= 0; i--) {
			if (circles[i] instanceof Circle && circles[i].pos.graph.x >= -1 && circles[i].pos.graph.x <= 2 && circles[i].pos.graph.y >= -1 && circles[i].pos.graph.y <= 2) {
				this.addCircle(circles[i]);
				//this.circles.push(circles[i]);
			}
		}
	},
	saveToCookies: function() {
		this.circles.forEach((obj,i)=>{
			["x", "y"].forEach((property)=>{
				var value = obj.pos.graph[property];
				setCookie(property + i, value, 7);
			}
			);
		}
		);
	},
	onMouseDown: function(btnId, x, y) {
		if ((btnId === 0) && this.circles.some((circle)=>circle.onMouseDown(x, y)))
			this.selected = true;
	},
	onMouseMove: function(x, y) {
		//this.parent.icon = (this.selected) ? "pointer" : "pointer";
		this.cursor = "default";
		if (this.selected) {
			if (this.selectedCircle instanceof Circle) {
				this.cursor = "pointer";
				this.selectedCircle.normalizeCanvasPosition.call(this.selectedCircle, this.grid, x - this.selectedCircle.offset.x, y - this.selectedCircle.offset.y);
				//this.selectedCircle.updateGraphPosition(this.grid);
			}
			this.parent.redraw();
		} else {
			if (this.circles.some((circle)=>circle.inside(x, y))) {
				this.cursor = "pointer";
			}
		}
		return this.selected;
	},
	onMouseUp: function(btnId, x, y) {
		if (this.selected) {
			this.saveToCookies();
			this.selected = false;
		}
	},
	updateCanvasPosition: function(grid) {
		if (grid instanceof Grid)
			this.grid = grid;
		this.circles.forEach(function(circle) {
			if (circle.available) {
				circle.updateCanvasPosition(this.grid);
			}
		});
	},
	draw: function(ctx) {
		ctx.save();
		ctx.strokeStyle = "#FFFFFF";
		ctx.fillStyle = "#999";
		ctx.lineWidth = 1;
		ctx.beginPath();
		this.circles.forEach((circle)=>{
			if (circle.available) {
				circle.draw.call(circle, ctx);
			}
		}
		);
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	},
	resize: function(width, height) {
		var self = this;
		this.box.width = width;
		this.box.height = height;
		this.circles.forEach((circle)=>{
			if (circle.available) {
				circle.updateCanvasPosition.call(circle, self.grid);
			}
		}
		);
	}
}
