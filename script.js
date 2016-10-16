"use strict";
var cnvc, divTools, divHeight, divPoints;
function resize() {
	if (cnvc instanceof CanvasController) {
		const cnstMargin = 25;
		var cHeight;
		if (window.innerWidth <= 500) {
			cnvc.canvas.width = cHeight = (window.innerWidth * 0.9) - 15 - cnstMargin;
		} else if (window.innerWidth >= 800) {
			cnvc.canvas.width = cHeight = 610 - 122 - cnstMargin;
		} else {
			cnvc.canvas.width = cHeight = (window.innerWidth * 0.8) - 150 - cnstMargin;
		}
		cnvc.canvas.height = cHeight;
		divHeight.style.height = cHeight + "px";
		cnvc.objects.forEach(obj => { if (obj.resize instanceof Function) obj.resize.call(obj, cHeight, cHeight)});
		cnvc.draw();
	}
}
window.addEventListener("load", function() {
	document.onselectionstart = (e) => {e.preventDefault; return false};
	divHeight = document.getElementById("canvasHeight");
	divTools = document.getElementById("tools");
	divPoints = document.getElementById("points");
	cnvc = new CanvasController(document.getElementById("canvasRecipient"));
	cnvc.addObject(new Grid(cnvc));
	cnvc.addObject(new CircleHandler(cnvc));
	resize();
	setInterval(()=>{cnvc.clear(); cnvc.draw();}, 250);
});
window.addEventListener("resize", resize);
