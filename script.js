"use strict";
var cnvc, divTools, divHeight, divPoints;
function resize() {
	if (cnvc instanceof CanvasController) {
		const cnstMargin = 25;
		var cHeight;
		if (window.innerWidth <= 500) {
			cnvc.width = cHeight = (window.innerWidth * 0.9) - 15 - cnstMargin;
		} else if (window.innerWidth >= 800) {
			cnvc.width = cHeight = 610 - 122 - cnstMargin;
		} else {
			cnvc.width = cHeight = (window.innerWidth * 0.8) - 150 - cnstMargin;
		}
		cnvc.height = cHeight;
		divHeight.style.height = cHeight + "px";
		cnvc.objects.forEach(obj => { if (obj.resize instanceof Function) obj.resize.call(obj, cHeight, cHeight)});
		cnvc.redraw();
	}
}
window.addEventListener("load", function() {
	document.onselectionstart = (e) => {e.preventDefault; return false};
	divHeight = document.getElementById("canvasHeight");
	divTools = document.getElementById("tools");
	divPoints = document.getElementById("points");
	cnvc = new CanvasController(document.getElementById("canvasRecipient"),100,100);
	var grid = new Grid(cnvc)
	cnvc.addObject(grid);
	cnvc.addObject(new CircleHandler(cnvc, grid));
	resize();
	setInterval(()=>{cnvc.redraw();}, 250);
});
window.addEventListener("resize", resize);
