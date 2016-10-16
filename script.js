"use strict";
var cnvc;
var b = function(i, j, t) {
    return ( i + (j - i) * t) ;
}
  , ib = function(i, j, b) {
    return ((i - j) == 0) ? i : ((i - b) / (i - j));
}
  , repeat = function(n, f) {
    for (var i = 0; i < n; i++)
        f.call(this, i);
}
var tree;

function updateTree(text) {
  tree.roots = [];
  if (typeof text === "string") {
    depth = 0;
    parseIntoTree(tree, text);
  }
    /*tree.addNode([1, 3]);
    tree.roots[0].addNode([3,2]);
    tree.roots[1].addNode([7]);
    tree.roots[0].roots[0].addNode([4]);
    tree.roots[0].roots[0].addNode([9]);
    tree.roots[1].roots[0].addNode([12,13]);
    tree.roots[1].roots[0].roots[1].addNode([-1]);
    tree.roots[1].roots[0].roots[1].roots[0].addNode([0]);
    tree.roots[0].roots[0].roots[0].addNode([8,5]);*/
    cnvc.draw();
}

function resize() {
  if (cnvc instanceof CanvasController) {
    var constantRemoval = 25
    if (window.innerWidth <= 500)
      cnvc.canvas.width = (window.innerWidth*0.9)-15-constantRemoval;
    else if (window.innerWidth >= 800)
      cnvc.canvas.width = 610-124-constantRemoval;
    else
      cnvc.canvas.width = (window.innerWidth*0.8)-150-constantRemoval;
    var tools = document.getElementById("tools");
    var heighter = document.getElementById("canvasHeight");
    if (tools instanceof HTMLDivElement) {
      var height = cnvc.canvas.width;
      if (heighter instanceof HTMLDivElement)
        heighter.style.height = height+"px";
      cnvc.canvas.height = cnvc.canvas.width;
    }
    cnvc.draw();
  }
}

window.addEventListener("resize", resize);
window.addEventListener("load", function() {
    cnvc = new CanvasController(
    document.getElementById("canvasRecipient"),
    500,200
    );
    resize();
    cnvc.draw();
});
document.addEventListener('copy', function(e) {});
document.addEventListener('paste', function(ev) {
    cnvc.objects.every(function(obj) {
        if (obj instanceof GuiInput && obj.focus === true)
            return obj.paste.call(obj, ev.clipboardData.getData('text/plain')) && false;
        else
            return true;
    });
});
