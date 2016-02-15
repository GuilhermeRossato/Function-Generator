"use strict";

var cnvc;

var b = function (i,j,t) { return (i+(j-i)*t); };
var ib = function (i,j,b) { return ((i-j)==0)?i:((i-b)/(i-j)); };

window.addEventListener("load",function() {
	cnvc = new CanvasController(document.getElementById("canvasRecipient"),960,700);
	var ctx = cnvc.ctx;
	cnvc.addObject({
		clear: function() {
			ctx.clearRect(0,0,cnvc.width,cnvc.height);
		},
		draw: function() {
			
		}
	});
	cnvc.addObject(new GuiInput(10, 10, 90, 24, true));
	cnvc.addObject(new GuiInput(10, 50, 150, 24, false));
	cnvc.addObject(new GuiInput(10, 90, 130, 24, false));
	cnvc.draw();
});

		
document.addEventListener('copy', function(e) {
	var plainData = "COPY WORKED script.js";
	var htmlData = "<p>COPY WORKED script.js</p>";
	var clipboard = e.clipboardData;
	clipboard.setData('text/plain', plainData);
	clipboard.setData('text/html', htmlData);
	//onsole.log(ev.clipboardData.setData);
	//ev.clipboardData.setData('text/plain', "rekt");
});
document.addEventListener('paste', function(ev) {
	cnvc.objects.forEach(obj => { if (obj instanceof GuiInput && obj.focus===true) obj.paste.call(obj, ev.clipboardData.getData('text/plain')); }
});