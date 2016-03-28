"use strict";

var cnvc;

var b = function(i, j, t) {
	return (i + (j - i) * t);
}, ib = function(i, j, b) {
	return ((i - j) == 0) ? i : ((i - b) / (i - j));
}, repeat = function(n, f) {
	for (var i = 0; i < n; i++)
		f.call(this, i);
}

window.addEventListener("load", function() {
	cnvc = new CanvasController(document.getElementById("canvasRecipient"), Math.max(window.innerHeight-200,100)*(1.777)-150, Math.max(window.innerHeight-200,100));
	cnvc.addObject(new CircleHandler(cnvc));
	cnvc.draw();
});

document.addEventListener('copy', function(e) {
	//var plainData = "text to copy";
	//var htmlData = "<p>text to copy</p>";
	//var clipboard = e.clipboardData;
	//clipboard.setData('text/plain', plainData);
	//clipboard.setData('text/html', htmlData);
});
document.addEventListener('paste', function(ev) {
	cnvc.objects.forEach(function(obj) {
		if ( obj instanceof GuiInput && obj.focus === true)
			obj.paste.call(obj, ev.clipboardData.getData('text/plain'));
	});
});
