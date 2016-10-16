function Grid(cnvc) {
	this.box = new GuiBox(0,0,cnvc.width,cnvc.height);
}
Grid.prototype = {
	constructor: Grid,
	graphic: {
		marginPercent: 0.13,
		marginPx: 0,
		divisions: 5,
		exceedPercent: 0,
		exceedPx: 9,
		borderDash: [],
		gridDash: [6, 3],
		numberDistance: 4,
		textDistance: 4
	},
	mark: function(ctx, x, y) {
		ctx.save();
		ctx.strokeStyle = "#DD2222";
		ctx.beginPath();
		ctx.moveTo(x - 4, y);
		ctx.lineTo(x + 4, y);
		ctx.moveTo(x, y - 4);
		ctx.lineTo(x, y + 4);
		ctx.stroke();
		ctx.restore();
	},
	drawBox: function(ctx) {
		ctx.save();
		ctx.setLineDash(this.graphic.borderDash);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#ffffff";
		ctx.beginPath();
		ctx.moveTo((b(this.box.left, this.box.right, this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent) | 0) + 0.5);
		ctx.lineTo((b(this.box.left, this.box.right, 1 - this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent) | 0) + 0.5);
		ctx.lineTo((b(this.box.left, this.box.right, 1 - this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent) | 0) + 0.5);
		ctx.lineTo((b(this.box.left, this.box.right, this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent) | 0) + 0.5);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	},
	drawDivisions: function(ctx) {
		ctx.save();
		ctx.strokeStyle = "#ffffff";
		ctx.setLineDash(this.graphic.gridDash);
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		var step = (1 - this.graphic.marginPercent * 2) / this.graphic.divisions;
		for (var i = 0; i <= this.graphic.divisions; i++) {
			// Line tips (exceedPx and exceedPercent)
			ctx.moveTo((b(this.box.left, this.box.right, this.graphic.marginPercent + step * i) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent - this.graphic.exceedPercent) - this.graphic.exceedPx | 0) + 0.5);
			ctx.lineTo((b(this.box.left, this.box.right, this.graphic.marginPercent + step * i) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent) | 0) + 0.5);
			ctx.moveTo((b(this.box.left, this.box.right, this.graphic.marginPercent + step * i) | 0) + 0.5, (b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent + this.graphic.exceedPercent) + this.graphic.exceedPx | 0) + 0.5);
			ctx.lineTo((b(this.box.left, this.box.right, this.graphic.marginPercent + step * i) | 0) + 0.5, (b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent) | 0) + 0.5);
			ctx.moveTo((b(this.box.left, this.box.right, this.graphic.marginPercent - this.graphic.exceedPercent) - this.graphic.exceedPx | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent + step * i) | 0) + 0.5);
			ctx.lineTo((b(this.box.left, this.box.right, this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent + step * i) | 0) + 0.5);
			ctx.moveTo((b(this.box.left, this.box.right, 1 - this.graphic.marginPercent + this.graphic.exceedPercent) + this.graphic.exceedPx | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent + step * i) | 0) + 0.5);
			ctx.lineTo((b(this.box.left, this.box.right, 1 - this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent + step * i) | 0) + 0.5);
			if (i !== 0 && i !== this.graphic.divisions) {
				ctx.moveTo((b(this.box.left, this.box.right, this.graphic.marginPercent + step * i) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent) | 0) + 0.5);
				ctx.lineTo((b(this.box.left, this.box.right, this.graphic.marginPercent + step * i) | 0) + 0.5, (b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent) | 0) + 0.5);
				ctx.moveTo((b(this.box.left, this.box.right, this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent + step * i) | 0) + 0.5);
				ctx.lineTo((b(this.box.left, this.box.right, 1 - this.graphic.marginPercent) | 0) + 0.5, (b(this.box.top, this.box.bottom, this.graphic.marginPercent + step * i) | 0) + 0.5);
			}
		}
		ctx.stroke();
		ctx.restore();
	},
	drawText: function(ctx) {
		ctx.save();
		ctx.fillStyle = "#ffffff";
		ctx.font = '12px Calibri';
		ctx.fillText("0", b(this.box.left, this.box.right, this.graphic.marginPercent) - 7 - this.graphic.numberDistance, b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent) + 8 + this.graphic.numberDistance);
		ctx.fillText("1", b(this.box.left, this.box.right, 1 - this.graphic.marginPercent) + this.graphic.numberDistance, b(this.box.top, this.box.bottom, this.graphic.marginPercent) - 1 - this.graphic.numberDistance);
		ctx.fillText("in", b(this.box.left, this.box.right, 1 - this.graphic.marginPercent + this.graphic.exceedPercent) + this.graphic.exceedPx - 1 + this.graphic.textDistance, b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent) + 3);
		ctx.fillText("out", b(this.box.left, this.box.right, this.graphic.marginPercent) - 9, b(this.box.top, this.box.bottom, this.graphic.marginPercent - this.graphic.exceedPercent) - this.graphic.exceedPx - 1 - this.graphic.textDistance);
		ctx.restore();
	},
	draw: function(ctx) {
		this.drawBox(ctx);
		this.drawDivisions(ctx);
		this.drawText(ctx)
	},
	resize: function(width, height) {
		this.box.width = width;
		this.box.height = height;
	},
	translatePixelToGraph: function(inX, inY) {
		var x = (typeof (inX) === "object") ? inX.x : inX
		  , y = (typeof (inX) === "object") ? inX.y : inY;
		var realLeft = b(this.box.left, this.box.right, this.graphic.marginPercent)
		  , realRight = b(this.box.left, this.box.right, 1 - this.graphic.marginPercent)
		  , realTop = b(this.box.top, this.box.bottom, this.graphic.marginPercent)
		  , realBottom = b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent);
		
		return {
			x: b(0, 1, ib(realLeft, realRight, x)),
			y: b(0, 1, ib(realTop, realBottom, y))
		};
	},
	translateGraphToPixel: function(inX, inY) {
		var x = (typeof (inX) === "object") ? inX.x : inX
		  , y = (typeof (inX) === "object") ? inX.y : inY;
		var realLeft = b(this.box.left, this.box.right, this.graphic.marginPercent)
		  , realRight = b(this.box.left, this.box.right, 1 - this.graphic.marginPercent)
		  , realTop = b(this.box.top, this.box.bottom, this.graphic.marginPercent)
		  , realBottom = b(this.box.top, this.box.bottom, 1 - this.graphic.marginPercent);
		
		return {
			x: b(realLeft, realRight, ib(0, 1, x)),
			y: b(realTop, realBottom, ib(0, 1, y))
		};
	}
}
