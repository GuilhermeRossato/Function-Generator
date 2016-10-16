if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => (typeof(value) !== "number" || isNaN(value) || value == 0 )?defaultValue:value;
}
if (typeof(b)!=="function") {
	b = function(i, j, t) {
		return (i + (j - i) * t);
	}, ib = function(i, j, b) {
		return ((i - j) == 0) ? i : ((i - b) / (i - j));
	}	
}
if (typeof(getBiggest)!=="function") {
	var getBiggest = function (arr) {
		return arr.reduce((a,b)=>(a>b?a:b));
	}
}

function GuiTree(x, y, width, height) {
	this.box = new GuiBox(x, y);
	this.box.width = defaultSet(width, 200);
	this.box.height = defaultSet(height, 200);
	this.roots = [];
}

function seta(ctx, pt1, pt2) {
	var angle = Math.atan2(pt2.y-pt1.y, pt2.x-pt1.x);
	var dist = Math.sqrt(Math.pow(pt2.y-pt1.y,2) + Math.pow(pt2.x-pt1.x,2))-8;
	ctx.beginPath();
	var destBefore = {x: pt1.x+dist*Math.cos(angle), y: pt1.y+dist*Math.sin(angle)}
	ctx.moveTo(pt1.x, pt1.y);
	ctx.lineTo(destBefore.x, destBefore.y);
	var dest = {x: pt1.x+(dist+8)*Math.cos(angle), y: pt1.y+(dist+8)*Math.sin(angle)}
	ctx.lineTo(dest.x+9*Math.cos(angle+Math.PI*0.85), dest.y+9*Math.sin(angle+Math.PI*0.85));
	ctx.lineTo(dest.x, dest.y);
	ctx.lineTo(dest.x+9*Math.cos(angle-Math.PI*0.85), dest.y+9*Math.sin(angle-Math.PI*0.85));
	ctx.lineTo(destBefore.x, destBefore.y);
	ctx.stroke();
}

GuiTree.prototype = {
	constructor: GuiTree,
	graphic: {
		roundness: 4,
		focusBorder: 2.5,
		bgColor:"#333333",
		borderColor:"#555555",
		focusColor:"#006FFF",
		textColor:"#EEE",
		font:"13px Arial",
		margin:5,
		blinks: true
		},
	addNode: function(args) {
		if (typeof args !== "undefined") {
			var self = this;
			if (!(args instanceof Array))
				args = [args];
			args.forEach(value => {
				var node = new Object();
				node.value = value;
				node.addNode = GuiTree.prototype.addNode;
				node.maxDepth = GuiTree.prototype.maxDepth;
				node.getDepth = GuiTree.prototype.getDepth;
				node.roots = [];
				node.parent = self;
				if (self.roots instanceof Array) {
					self.roots.push(node);
				} else {
					throw "Tree Exception: Node has no roots array";
				}
			});
			return self.roots[self.roots.length-1];
		}
	},
	maxDepth: function() {
		var results = [];
		this.roots.forEach((root) => results.push(root.maxDepth()));
		return (results.length > 0)?1+getBiggest(results):1;
	},
	getDepth: function(i) {
		if (i < 0) {
			return [];
		} else if (i == 0) {
			return [this];
		} else {
			var results = [];
			this.roots.forEach(root => root.getDepth(i-1).forEach(deep => {
				results.push(deep);
			}));
			return results;
		}
	},
	forceDraw: function() {
		if (typeof(CanvasController) !== "undefined" && this.parent instanceof CanvasController) {
			this.clear(this.parent.ctx);
			this.draw(this.parent.ctx);
		}
	},
	update: function() {
		if (typeof(CanvasController) !== "undefined" && this.parent instanceof CanvasController) {
			this.clear(this.parent.ctx);
			this.draw(this.parent.ctx);
		}
	},
	clear: function(ctx) {
		if (ctx instanceof CanvasRenderingContext2D)
			ctx.clearRect(this.box.left-2, this.box.top-2, this.box.width+4, this.box.height+4);
		else 
			console.error("First parameter is supposed to be instance of CanvasRenderingContext2D:",ctx);
	},
	draw: function(ctx) {
		if (ctx instanceof CanvasRenderingContext2D) {
			ctx.clearRect(this.box.left-2, this.box.top-2, this.box.width+4, this.box.height+4);
			ctx.lineWidth = 1;
			ctx.setLineDash([4, 4]);
			ctx.strokeStyle = "#000";
			ctx.strokeRect((this.box.left|0)+0.5, (this.box.top|0)+0.5, this.box.width, this.box.height);
			ctx.setLineDash([]);
			ctx.font = "16px Courier";
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.fillStyle = "#333";
			var maxDepth = this.maxDepth();
			var nodeList = [];
			var maxWidth = [];
			var i, j;
			for (i = 1;i<maxDepth;i++) {
				nodeList.push([]);
				var currentList = nodeList[nodeList.length-1];
				this.getDepth(i).forEach((obj) => {
					currentList.push(obj);
				});
				maxWidth.push(currentList.length);
			}
			maxWidth = (maxWidth.length > 0)?getBiggest(maxWidth):0;
			maxDepth --;
			var hStep = this.box.width/maxWidth;
			var vStep = this.box.height/maxDepth;
			ctx.save();
			ctx.translate(this.box.left,this.box.top);
			for (i=0;i<maxWidth;i++) {
				var left = i*hStep;
				var right = left+hStep;
				for (j=0;j<maxDepth;j++) {
					var top = j*vStep;
					var bottom = top+vStep;
					var strShow = "-";
					if (nodeList[j][i] instanceof Object) {
						strShow = nodeList[j][i].value;
						ctx.strokeRect(((left+right)/2-12|0)-0.5, ((top+bottom)/2-14|0)+0.5, 26, 28);
						if (j!=0) {
							var dx = -1, searchFor = nodeList[j][i].parent;
							nodeList[j-1].every((node,at) => {
								 if (node === searchFor) {
								 	dx = at;
								 	return false;
								}
								 return true;
							});
							if (dx != -1) {
								//nodeList[j-1][dx] == PARENT!
								ctx.beginPath();
								var pts = [
									[dx*hStep+hStep/2, (j-1)*vStep+vStep/2+5],
									[left+hStep/2, top+vStep/2-5]
								];
								var real = [
									{x:b(pts[0][0], pts[1][0], 0.13), y:b(pts[0][1], pts[1][1], 0.13)},
									{x:b(pts[0][0], pts[1][0], 0.86), y:b(pts[0][1], pts[1][1], 0.86)}
								];
								seta(ctx, real[0], real[1]);
							}
						}
					}
					ctx.fillText(strShow, (left+right)/2, (top+bottom)/2);
				}
			}
			ctx.restore();
		} else 
			console.error("First parameter is supposed to be instance of CanvasRenderingContext2D:",ctx);
	},
	checkBounds: function(x, y) {
		return this.box.checkBounds.call(this.box,x,y); 
	}
}
