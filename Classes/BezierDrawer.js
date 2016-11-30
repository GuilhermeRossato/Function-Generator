function BezierDrawer(cnvc) {
	this.box = new GuiBox(b(0, cnvc.width, this.graphic.marginPercent),b(0, cnvc.height, this.graphic.marginPercent),b(0, cnvc.width, 1 - this.graphic.marginPercent * 2),b(0, cnvc.height, 1 - this.graphic.marginPercent * 2));
	this.points = undefined;
	this.sampleSize = 100;
	this.interpolation = true;
}
BezierDrawer.prototype = {
	constructor: BezierDrawer,
	graphic: {
		marginPercent: 0.11
	},
	abstractFunction: function(x) {
		var p = this.points;
		var n, o;
		var M = [];
		if (this.interpolation) {
			for (n = 0; n < p.length - 1; n++) {
				M[n] = [];
				M[0][n] = b(p[n].y, p[n + 1].y, ib(p[n].x, p[n + 1].x, x));
			}
			for (o = 1; o < p.length - 1; o++)
				for (n = 0; n < p.length - 1 - o; n++)
					M[o][n] = b(M[o-1][n], M[o-1][n + 1], ib(p[n].x, p[n + 1 + o].x, x));
			return M[p.length-2][0];
		} else {
			for (n = 0; n < p.length - 1; n++) {
				M[n] = [];
				M[0][n] = b(p[n].y, p[n + 1].y, x);
			}
			for (o = 1; o < p.length - 1; o++)
				for (n = 0; n < p.length - 1 - o; n++)
					M[o][n] = b(M[o-1][n], M[o-1][n + 1], x);
			return M[p.length-2][0];
		}
		return b(p[0].y, p[1].y, ib(p[0].x, p[1].x, x));
	},
	drawSampleFunction: function(ctx, l, t, w, h) {
		ctx.moveTo(l, l + h * (1 - this.abstractFunction(0)));
		for (var i = 1; i <= this.sampleSize; i++) {
			var perc = i / this.sampleSize;
			ctx.lineTo(l + (w * perc), l + h * (1 - this.abstractFunction(perc)));
		}
	},
	drawSimpleConnection: function(ctx, l, t, w, h) {
		this.points.forEach((pt,i)=>{
			var ctxFunc = (i === 0) ? ctx.moveTo : ctx.lineTo;
			ctxFunc.call(ctx, l + pt.x * w, t + h - pt.y * h);
		}
		);
	},
	draw: function(ctx) {
		if (typeof this.points === "undefined") {
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(this.box.left, this.box.top, this.box.width, this.box.height);
		} else {
			var l = this.box.left
			  , t = this.box.top
			  , w = this.box.width
			  , h = this.box.height;
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#FFF";
			ctx.beginPath();
			this.drawSampleFunction(ctx, l, t, w, h);
			ctx.stroke();
			ctx.lineWidth = 0.1;
			ctx.beginPath();
			this.drawSimpleConnection(ctx, l, t, w, h);
			ctx.stroke();
		}
	},
	resize: function(width, height) {
		this.box.left = b(0, width, this.graphic.marginPercent);
		this.box.top = b(0, height, this.graphic.marginPercent);
		this.box.width = b(0, width, 1 - this.graphic.marginPercent * 2);
		this.box.height = b(0, height, 1 - this.graphic.marginPercent * 2)
	}
}
