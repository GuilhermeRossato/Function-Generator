function CircleHandler(parent, grid) {
	if (!(this.parent instanceof CanvasController))
		this.parent = parent;
	if (this.parent instanceof CanvasController) {
		this.box = new GuiBox(0,0,this.parent.width,this.parent.height);
		var self = this;
		this.grid = grid;
		this.showPoints = true;
		this.maxCircles = 10;
		this.isDragging = false;
		this.loadFromCookies();
		this.applyMininumCircleTreshold(3);
		this.saveTimer = window.setInterval(()=>{
			self.saveToCookies.call(self)
		}
		, 5000);
	} else
		console.error("Parent not CanvasController");
}
CircleHandler.prototype = {
	constructor: CircleHandler,
	selected: false,
	putSortedPointsAt: function(obj) {
		this.sortedPointsTarget = obj;
	},
	updateSortedPoints: function() {
		if (typeof this.sortedPointsTarget !== "undefined") {
			this.sortedPointsTarget.points = this.circles.map((obj)=>{
				return {
					x: obj.pos.graph.x,
					y: 1 - obj.pos.graph.y
				}
			}
			);
			if (!this.sortedPointsTarget.interpolation)
				this.sortedPointsTarget.points.sort((left,right)=>(left.x > right.x));
		}
	},
	applyMininumCircleTreshold: function(mininumPoints) {
		for (var i = mininumPoints - this.circles.length - 1; i >= 0; i--) {
			var circle = new Circle(Math.random(),Math.random(),this.grid);
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
						circles[i] = new Circle(0,0,this.grid);
					circles[i].pos.graph[property] = value;
				}
			}
		}
		);
		this.circles = [];
		var maxCount = self.maxCircles;
		var gC = getCookie("pointCount", this.circles.length);
		if (gC) {
			maxCount = parseInt(gC);
		}
		for (i = 0; i < maxCount; i++) {
			if (circles[i]instanceof Circle && circles[i].pos.graph.x >= -1 && circles[i].pos.graph.x <= 2 && circles[i].pos.graph.y >= -1 && circles[i].pos.graph.y <= 2) {
				this.addCircle(circles[i]);
			}
		}
		this.updateSortedPoints();
	},
	getMiddleGraphPoint: function() {
		var sumX = 0
		  , sumY = 0;
		for (var i = 0; i < this.circles.length; i++) {
			sumX += this.circles[i].pos.graph.x;
			sumY += this.circles[i].pos.graph.y;
		}
		return {
			x: sumX / this.circles.length,
			y: sumY / this.circles.length
		};
	},
	canIntroduceCircle: function() {
		return ( this.circles.length < this.maxCircles)
	},
	canDeintroduceCircle: function() {
		return ( this.circles.length > 2)
	},
	introduceCircle: function() {
		if (this.circles.length < this.maxCircles) {
			this.updateSortedPoints();
			var midId, newPos;
			if (this.lastDeletedCircle) {
				midId = this.lastDeletedCircle.id;
				//console.log(this.lastDeletedCircle.pos.graph.y);
				newPos = {
					x: this.lastDeletedCircle.pos.graph.x,
					y: this.lastDeletedCircle.pos.graph.y
				}
			} else {
				midId = 1 + ((Math.random() * (this.circles.length - 1)) | 0);
				if (midId == 0) {
					newPos = {
						x: (this.circles[0].pos.graph.x + this.circles[1].pos.graph.x) / 2,
						y: (this.circles[0].pos.graph.y + this.circles[1].pos.graph.y) / 2
					}
				} else {
					newPos = {
						x: (this.circles[midId].pos.graph.x + this.circles[midId - 1].pos.graph.x) / 2,
						y: (this.circles[midId].pos.graph.y + this.circles[midId - 1].pos.graph.y) / 2
					}
				}
			}
			var nc = new Circle(newPos.x,newPos.y,this.grid);
			nc.parent = this;
			nc.updateCanvasPosition(this.grid);
			var checks = 0;
			var goingUp = 0;
			var didSomething = true;
			var denominator = (this.grid.graphic.divisions != -1) ? this.grid.graphic.divisions : 20;
			while (checks < 10 && didSomething) {
				didSomething = false;
				for (var i = 0; i < this.circles.length; i++) {
					if (this.circles[i].pos.graph.x == nc.pos.graph.x && this.circles[i].pos.graph.y == nc.pos.graph.y) {
						didSomething = true;
						if (!goingUp) {
							if (nc.pos.graph.y > 0) {
								nc.pos.graph.y -= 1 / (denominator);
								goingUp = 2;
							} else if (nc.pos.graph.y < 1) {
								nc.pos.graph.y += 1 / (denominator);
								goingUp = 1;
							}
						} else if (goingUp == 2) {
							nc.pos.graph.y -= 1 / (denominator);
						} else {
							nc.pos.graph.y += 1 / (denominator);
						}
						nc.updateCanvasPosition(this.grid);
					}
				}
			}
			if (nc.pos.graph.x > 1 || nc.pos.graph.y > 1 || nc.pos.graph.y < 0 || nc.pos.graph.x < 0) {
				nc.pos.graph.x = Math.random();
				nc.pos.graph.y = Math.random();
				nc.updateCanvasPosition(this.grid);
			}
			for (var i = 0; i < this.circles.length; i++) {
				if (this.circles[i].pos.graph.x == nc.pos.graph.x && this.circles[i].pos.graph.y == nc.pos.graph.y) {
					nc.pos.graph.x = Math.random();
					nc.pos.graph.y = Math.random();
					nc.updateCanvasPosition(this.grid);
				}
			}
			this.circles.splice(midId, 0, nc);
			this.lastAddedCircle = midId;
			this.lastDeletedCircle = undefined;
			setCookie("pointCount", this.circles.length);
			this.saveToCookies();
			this.updateSortedPoints();
			return true;
		}
		return false;
	},
	deintroduceCircle: function() {
		if (this.circles.length > 2) {
			this.updateSortedPoints();
			var midId;
			if (this.lastAddedCircle) {
				midId = this.lastAddedCircle;
			} else {
				midId = 1 + ((Math.random() * (this.circles.length - 2)) | 0);
			}
			if (this.lastDeletedCircle) {
				this.lastDeletedCircle.pos.graph.x = this.circles[midId].pos.graph.x;
				this.lastDeletedCircle.pos.graph.y = this.circles[midId].pos.graph.y;
			} else {
				this.lastDeletedCircle = new Circle(this.circles[midId].pos.graph.x,this.circles[midId].pos.graph.y,this.grid);
			}
			this.lastDeletedCircle.id = midId;
			this.circles.splice(midId, 1);
			this.lastAddedCircle = undefined;
			setCookie("pointCount", this.circles.length);
			this.saveToCookies();
			this.updateSortedPoints();
			return true;
		}
		return false;
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
		if ((btnId === 0) && this.circles.some((circle)=>circle.onMouseDown(x, y))) {
			this.selected = true;
		}
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
			this.updateSortedPoints();
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
			this.updateSortedPoints();
			this.selected = false;
		}
	},
	updateCanvasPosition: function(grid) {
		if (grid instanceof Grid)
			this.grid = grid;
		this.circles.forEach(function(circle) {
			circle.updateCanvasPosition(this.grid);
		});
	},
	draw: function(ctx) {
		ctx.save();
		if (this.showPoints) {
		ctx.strokeStyle = "#FFFFFF";
		ctx.fillStyle = "#999";
		ctx.lineWidth = 1;
		ctx.beginPath();
		this.circles.forEach((circle)=>{
			circle.draw.call(circle, ctx);
		}
		);
		ctx.fill();
		ctx.stroke();
		//ctx.fillStyle = "#fff";
		//ctx.textAlign = "center";
		//ctx.textBaseline = "middle";
		}
		/*this.circles.forEach((circle,i)=>{
			if (circle.available) {
				ctx.fillText(i.toString(), circle.pos.canvas.x, circle.pos.canvas.y);
			}
		}
		);*/
		ctx.restore();
	},
	resize: function(width, height) {
		var self = this;
		this.box.width = width;
		this.box.height = height;
		this.circles.forEach((circle)=>{
			circle.updateCanvasPosition.call(circle, self.grid);
		}
		);
	}
}
