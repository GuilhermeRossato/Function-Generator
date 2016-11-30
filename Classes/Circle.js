if (typeof (defaultSet) !== "function") {
	defaultSet = (value,defaultValue)=>((typeof (value) !== "number" || isNaN(value) || value == 0) ? defaultValue : value);
}
function Circle(x, y, grid) {
	this.pos = {};
	this.normalizeGraphPosition(grid, defaultSet(x, 0), defaultSet(y, 0))
	this.radius = 8;
	this.available = true;
}
Circle.prototype = {
	constructor: Circle,
	onSelect: function() {
		this.focus = true;
	},
	normalizeGraphPosition: function(grid, x, y) {
		var divisions = grid.graphic.divisions;
		var graphPos;
		if (divisions == -1) {
			graphPos = {
				x: x,
				y: y
			}
		} else {
			graphPos = {
				x: Math.floor((x * divisions) + 0.5) / divisions,
				y: Math.floor((y * divisions) + 0.5) / divisions
			}
		}
		if (graphPos.x < -0.1)
			graphPos.x = -0.1;
		if (graphPos.y < -0.1)
			graphPos.y = -0.1;
		if (graphPos.x > 1.1)
			graphPos.x = 1.1;
		if (graphPos.y > 1.1)
			graphPos.y = 1.1;
		this.pos.graph = graphPos;
		this.pos.canvas = grid.translateGraphToPixel(graphPos.x, graphPos.y);
	},
	normalizeCanvasPosition: function(grid, x, y, offsetX, offsetY) {
		var graphPos = grid.translatePixelToGraph(x, y);
		this.normalizeGraphPosition(grid, graphPos.x, graphPos.y);
	},
	sqrDistTo: function(x, y) {
		return Math.pow((this.pos.canvas.x - x), 2) + Math.pow((this.pos.canvas.y - y), 2);
	},
	inside: function(x, y) {
		return ( (x > this.pos.canvas.x - this.radius) && (x < this.pos.canvas.x + this.radius) && (y > this.pos.canvas.y - this.radius) && (y < this.pos.canvas.y + this.radius) && (this.sqrDistTo(x, y)) <= Math.pow(this.radius, 2)) ;
	},
	onMouseDown(x, y) {
		if (this.parent.selected === false && this.inside(x, y)) {
			this.parent.selected = true;
			this.parent.selectedCircle = this;
			if (cnvc.grid.graphic.divisions == -1)
				this.offset = {
					x: x - this.pos.canvas.x,
					y: y - this.pos.canvas.y
				};
			else
				this.offset = {
					x: 0,
					y: 0
				};
			return true;
		}
		return false;
	},
	updateCanvasPosition(grid) {
		if (grid instanceof Grid)
			this.pos.canvas = grid.translateGraphToPixel(this.pos.graph);
		else
			throw "Invalid Grid: " + typeof (grid);
	},
	updateGraphPosition(grid) {
		if (grid instanceof Grid)
			this.pos.graph = grid.translatePixelToGraph(this.pos.canvas);
		else
			throw "Invalid Grid: " + typeof (grid);
	},
	draw: function(ctx) {
		ctx.moveTo(this.pos.canvas.x + this.radius, this.pos.canvas.y);
		ctx.arc(this.pos.canvas.x, this.pos.canvas.y, this.radius, 0, 2 * Math.PI);
	}
}
