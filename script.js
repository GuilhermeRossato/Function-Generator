'use strict';
var cnvc, divTools, divHeight, divPoints;
function setupButton(id, button) {
	if (button.value == "Finer Grid")
		button.disabled = !(cnvc.grid.canIncreaseGridDivision());
	else if (button.value == "Coarser Grid")
		button.disabled = !(cnvc.grid.canDecreaseGridDivision());
	else if (button.value == "Add Point")
		button.disabled = !(cnvc.chandler.canIntroduceCircle());
	else if (button.value == "Remove Point")
		button.disabled = !(cnvc.chandler.canDeintroduceCircle());
	else if (button.value == "Use Tendency") {
		var interpolation = (getCookie("interpolation")==='1');
		button.value = interpolation?"Use Tendency":"Use Interpolation";
		cnvc.bezier.interpolation = interpolation;
	}
}
function buttonPress(id, buttons) {
	var button = buttons[id];
	if (button.value == "Finer Grid") {
		let sidebtn = buttons.indexOf("Coarser Grid");
		if (sidebtn && sidebtn.disabled)
			sidebtn.disabled = false;
		if (cnvc.grid.increaseGridDivisions())
			cnvc.redraw();
		button.disabled = !(cnvc.grid.canIncreaseGridDivision());
	} else if (button.value == "Coarser Grid") {
		let sidebtn = buttons.indexOf("Finer Grid");
		if (sidebtn && sidebtn.disabled)
			sidebtn.disabled = false;
		if (cnvc.grid.decreaseGridDivisions())
			cnvc.redraw();
		button.disabled = !(cnvc.grid.canDecreaseGridDivision());
	} else if (button.value == "Add Point") {
		let sidebtn = buttons.indexOf("Remove Point");
		if (sidebtn && sidebtn.disabled)
			sidebtn.disabled = false;
		if (cnvc.chandler.introduceCircle())
		cnvc.redraw();
		button.disabled = !(cnvc.chandler.canIntroduceCircle());
	} else if (button.value == "Remove Point") {
		let sidebtn = buttons.indexOf("Add Point");
		if (sidebtn && sidebtn.disabled)
			sidebtn.disabled = false;
		if (cnvc.chandler.deintroduceCircle())
		cnvc.redraw();
		button.disabled = !(cnvc.chandler.canDeintroduceCircle());
	} else if (button.value == "Use Tendency") {
		cnvc.bezier.interpolation = false;
		cnvc.redraw();
		button.value = "Use Interpolation";
		setCookie("interpolation", 0);
	} else if (button.value == "Use Interpolation") {
		cnvc.bezier.interpolation = true;
		cnvc.redraw();
		button.value = "Use Tendency";
		setCookie("interpolation", 1);
	} else if (button.value == "Hide Points") {
		cnvc.chandler.showPoints = false;
		cnvc.redraw();
		button.value = "Show Points";
	} else if (button.value == "Show Points") {
		cnvc.chandler.showPoints = true;
		cnvc.redraw();
		button.value = "Hide Points";
	}
}
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
		divHeight.style.height = cHeight + 'px';
		cnvc.objects.forEach(obj=>{
			if (obj.resize instanceof Function)
				obj.resize.call(obj, cHeight, cHeight)
		}
		);
		cnvc.redraw();
	}
}
function createButtonEvents() {
	var buttons = [];
	document.getElementsByClassName('actions')[0].childNodes.forEach(function(obj) {
		if (obj instanceof HTMLInputElement) {
			buttons.push(obj);
		}
	});
	buttons.indexOf = ((str)=>{
		var found = -1;
		if (buttons.some((obj,i)=>{
			if (obj.value == str) {
				found = i;
				return true;
			}
			return false;
		}
		))
			return buttons[found];
		return undefined;
	}
	);
	buttons.forEach(function(btn, i) {
		setupButton(i, btn);
		btn.onclick = ()=>buttonPress(i, buttons);
	});
}
window.addEventListener('load', function() {
	document.onmousedown = document.onselectionstart = (e)=>{
		e.preventDefault();
		return false
	}
	divHeight = document.getElementById('canvasHeight');
	divTools = document.getElementById('tools');
	divPoints = document.getElementById('points');
	cnvc = new CanvasController(document.getElementById('canvasRecipient'),100,100);
	resize();
	var bezier = new BezierDrawer(cnvc);
	cnvc.bezier = bezier;
	cnvc.addObject(bezier);
	var grid = new Grid(cnvc);
	cnvc.grid = grid;
	cnvc.addObject(grid);
	var chandler = new CircleHandler(cnvc,grid);
	cnvc.chandler = chandler;
	cnvc.addObject(chandler);
	chandler.putSortedPointsAt(bezier);
	chandler.updateSortedPoints();
	setInterval(()=>{
		cnvc.redraw();
	}
	, 500);
	createButtonEvents();
});
window.addEventListener('resize', resize);
