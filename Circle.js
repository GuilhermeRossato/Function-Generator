if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => ((typeof(value) !== "number" || isNaN(value) || value == 0)?defaultValue:value);
}

function Circle(x, y, rad) {
	this.position = {x: defaultSet(x, 0), y:defaultSet(y, 0)};
	this.radius = defaultSet(rad, 10);
}

Circle.prototype = {
	constructor: Circle,
	position: {x:0, y:0},
	onSelect: function() {
		this.focus = true;
	},
	inside: function(x, y) {
		return (
		(x > this.position.x-this.radius) &&
		(x < this.position.x+this.radius) &&
		(y > this.position.y-this.radius) &&
		(y < this.position.y+this.radius) &&
		(Math.pow((this.position.x-x),2)+Math.pow((this.position.y-y),2) <= Math.pow(this.radius,2))
		);
	},
	draw: function(ctx, type) {
		if (!type) {
			ctx.moveTo(this.position.x + this.radius, this.position.y);
			ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		} else {

		}
	}
}
