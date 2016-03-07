"use strict";

var cnvc;

var b = function (i,j,t) { return (i+(j-i)*t); };
var ib = function (i,j,b) { return ((i-j)==0)?i:((i-b)/(i-j)); };

window.addEventListener("load",function() {
	cnvc = new CanvasController(document.getElementById("canvasRecipient"),960,700);
	cnvc.addObject(new CircleHandler(cnvc));
});

		
document.addEventListener('copy', function(e) {
	//var plainData = "text to copy";
	//var htmlData = "<p>text to copy</p>";
	//var clipboard = e.clipboardData;
	//clipboard.setData('text/plain', plainData);
	//clipboard.setData('text/html', htmlData);
});
document.addEventListener('paste', function(ev) {
	cnvc.objects.forEach(obj => {
		if (obj instanceof GuiInput && obj.focus===true)
			obj.paste.call(obj, ev.clipboardData.getData('text/plain'));
	})
});