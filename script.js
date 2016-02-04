"use strict";

var cnvc;

var b = function (i,j,t) { return (i+(j-i)*t); };
var ib = function (i,j,b) { return ((i-j)==0)?i:((i-b)/(i-j)); };

window.addEventListener("load",function() {
	cnvc = new CanvasController(document.getElementById("canvasRecipient"),960,700);
	var cxt = cnvc.ctx;
	cnvc.addObject({
		clear: function() {
			ctx.clearRect(0,0,cnvc.width,cnvc.height);
		},
		draw: function() {
			
		}
	});
});
