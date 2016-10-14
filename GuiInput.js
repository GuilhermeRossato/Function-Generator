/*	GuiInput.js - Created by GuilhermeRossato 02/2016
 * 
 *	 This class handles an input box that cannot be displayed differently by different browsers,
 *	this is achieved by manually handling it in canvas, which decreases compatibility, but pays off in my eyes.
 * 
 * 	 Requires: GuiBox.js and CanvasController
 * 
 *	<Pending documentation>
 * 
 */

if (typeof(defaultSet)!=="function") {
	defaultSet = (value,defaultValue) => (typeof(value) !== "number" || isNaN(value) || value == 0 )?defaultValue:value;
}
if (typeof(b)!=="function") {
	b = function(i, j, t) {
		return (i + (j - i) * t);
	}, ib = function(i, j, b) {
		return ((i - j) == 0) ? i : ((i - b) / (i - j));
	}	
}

function GuiInput(x, y, width, height, isNumeric, limit) {
	var local_focus = false;
	var local_text = "";
	this.box = new GuiBox(x, y);
	this.box.width = defaultSet(width, 20);
	this.box.height = defaultSet(height, 20);
	this.limit = defaultSet(limit,b(b(7,21,ib(50,150,this.box.width)), b(21,77,ib(150,500,this.box.width)), ib(50,500,this.box.width) )|0 );
	this.numeric = (isNumeric)?true:false;
	this.replaceCommaDot = this.numeric;
	this.onChange = function() { return true; }
	this.readonly = false;
	Object.defineProperty(this,"text",{
		configurable: false,
		enumerable: false,
		get: function() { return local_text; },
		set: function(value) {
			if ((value !== local_text) && ((this.limit < 1) || ((typeof(value)=== "string") && (value.length < this.limit)))) {
				
				if ((this.onChange instanceof Function) && (this.onChange(value))) {
					this.pastText.push([local_text,(this.selectionEnd>this.selectionStart)?this.selectionEnd:this.selectionStart]);
					local_text = value;
					if (this.pastText.length > 100)
						this.pastText.shift();
					this.futureText = [];
					return true;
				}
			}
			return false;
		}
	});
	
	
	this.undo = function() {
		if (this instanceof GuiInput) {
			if (this.pastText.length > 0) {
				var t = this.pastText.pop();
				this.futureText.push([local_text,(this.selectionEnd>this.selectionStart)?this.selectionEnd:this.selectionStart]);
				local_text = t[0];
				this.selectionStart = (this.selectionEnd = t[1]);
			}
		}
	}
	
	this.redo = function() {
		if (this instanceof GuiInput) {
			if (this.futureText.length > 0) {
				
				this.pastText.push([local_text,(this.selectionEnd>this.selectionStart)?this.selectionEnd:this.selectionStart]);
				if (this.pastText.length > 100)
					this.pastText.shift();
					
				var t = this.futureText.pop();
				local_text = t[0];
				this.selectionStart = (this.selectionEnd = t[1]);
			}
		}
	}
	
	this.paste = function(clipboardText) {
		if (this.readonly) return;
		var t, i, valid, ch;
		if (this.numeric) {
			t = clipboardText;
			valid = 0;
			for (i=t.length;(i>=0)&&(valid<2);i--) {
				ch = t.charCodeAt(i);
				if (ch === 44 || ch === 46) // "." or ","
					valid += 1;
				if (ch === 12 && i !== 0) // "-"
					valid = 2;
				else if (ch < 48 && ch > 57)
					valid = 2;
			}
			if (valid >= 2)
				return false;
			else if (valid === 1 && t.indexOf(","))
				clipboardText = t.replace(",",".");
			else
				clipboardText = t;
		}
		t = this.text;
		if (this.selectionEnd < this.selectionStart)
			t = this.text.substring(0,this.selectionEnd) + clipboardText + t.substring(this.selectionStart);
		else
			t = this.text.substring(0,this.selectionStart) + clipboardText + t.substring(this.selectionEnd);
		this.text = t;
		this.selectionStart = this.selectionEnd = Math.min(this.text.length, this.selectionEnd+clipboardText.length);
		this.startTimer();
	}
	
	Object.defineProperty(this,"focus",{
		configurable: false,
		enumerable: false,
		get: function() { return local_focus; },
		set: function(value) {
			if (local_focus !== value) {
				if (value) {
					local_focus = (this.blinkState = true);
					this.startTimer();
					this.forceDraw();
				} else {
					local_focus = (this.blinkState = false);
					this.clearTimer();
					this.forceDraw();
				}
			}
			return value;
		}
	});
}

GuiInput.prototype = {
	constructor: GuiInput,
	numeric: false,
	multiLine: false,
	blinkState: false,
	acceptsTab: true,
	acceptsMail: true,
	limit:0,
	pastText: [],
	futureText: [],
	cursor: "text",
	graphic: {
		roundness: 4,
		focusBorder: 2.5,
		bgColor:"#333333",
		borderColor:"#555555",
		focusColor:"#006FFF",
		textColor:"#EEE",
		font:"13px Arial",
		margin:5,
		blinks: true},
	startTimer: function() {
		this.clearTimer();
		this.blinkState = true;
		var holdThis = this;
		this.timer = setInterval(function() { holdThis.update.call(holdThis); }, 500);
	},
	clearTimer: function() {
		if (typeof(this.timer) === "number") {
			clearTimeout(this.timer);
			this.timer = undefined;
		}			
	},
	forceDraw: function() {
		if (typeof(CanvasController) !== "undefined" && this.parent instanceof CanvasController) {
			this.clear(this.parent.ctx);
			this.draw(this.parent.ctx);
		}
	},
	onMouseDown: function (btnId, x, y) {
		if (this.readonly) return;
		if (typeof(CanvasController) !== "undefined" && this.parent instanceof CanvasController) {
			if (this.box.checkBounds(x, y)) {
				if (btnId === 0) {
					var ctx = this.parent.ctx, leftNow = 0, i;
					ctx.font = this.graphic.font;
					for (i=0;i<this.text.length;i++)
						if ((leftNow += ctx.measureText(this.text[i]).width)+this.graphic.margin > x-this.box.left+3)
							break;
					this.selectionStart = i;
					this.selectionEnd = i;
					this.focus = true;
				} else if (btnId === 2) {
					this.focus = true;
				}
			} else {
				this.focus = false;
			}
			return true;
		}
		return false;
	},
	onKeyDown: function(keyCode, ctrlKey, shiftKey, altKey, event) { // Returns true if key was processed by this function
		if (this.readonly) return false;
		if (this instanceof GuiInput && this.focus) {
			if (keyCode === 37) { // LEFT ARROW
				var dest = this.selectionEnd - 1;
				if (ctrlKey) {
					while ((this.text[dest-1] !== "." && this.text[dest-1] !== " " && this.text[dest-1] !== "@")&&(dest > 1))
						dest--;
					if (dest === 1 && this.text[0] !== '.' && this.text[0] !== ' ' && this.text[0] !== "@") // Bug fixed by exception
						dest--;
				}
				if (shiftKey) {
					this.selectionEnd = Math.max(0, dest);
				} else {
					if (this.selectionStart !== this.selectionEnd) {
						if (this.selectionEnd > this.selectionStart)
							this.selectionEnd = this.selectionStart;
						else
							this.selectionStart = this.selectionEnd;
					} else {
						this.selectionStart = (this.selectionEnd = Math.max(0, dest));
					}
				}
				this.startTimer();
				return true;
			} else if (keyCode === 39) { // RIGHT ARROW
				var dest = this.selectionEnd + 1;
				if (ctrlKey) {
					while ((this.text[dest] !== "." && this.text[dest] !== " " && this.text[dest] !== "@")&&(dest < this.text.length))
						dest++;
				}
				if (shiftKey) {
					this.selectionEnd = Math.min(this.text.length, dest);
				} else {
					if (this.selectionStart !== this.selectionEnd) {
						if (this.selectionEnd < this.selectionStart)
							this.selectionEnd = this.selectionStart;
						else
							this.selectionStart = this.selectionEnd;
					} else {
						this.selectionStart = (this.selectionEnd = Math.min(this.text.length, dest));
					}
				}
				this.startTimer();
				return true;
			} else if (keyCode === 36) { // HOME
				if (shiftKey) {
					this.selectionEnd = 0;
				} else {
					this.selectionStart = (this.selectionEnd = 0);
				}
				this.startTimer();
				return true;
			} else if (keyCode === 35) { // END
				if (shiftKey) {
					this.selectionEnd = this.text.length;
				} else {
					this.selectionStart = (this.selectionEnd = this.text.length);
				}
				this.startTimer();
				return true;
			} else if ((this.numeric) && (keyCode === 190 || keyCode === 194 || keyCode === 188 || keyCode === 110)) { // DOT / POINT / ZERO SEPARATOR
				var i, holdSelStart, holdSelEnd, t;
				t = this.text;
				i = t.indexOf('.');
				if (this.selectionEnd < this.selectionStart) {
					holdSelStart = this.selectionEnd;
					holdSelEnd = this.selectionStart;
				} else {
					holdSelStart = this.selectionStart;
					holdSelEnd = this.selectionEnd;
				}
				if (holdSelEnd === 0 && t.charCodeAt() === 45) {
					if (i!==-1)
						t = t.replace('.', '');
					if (this.text = "-." + t.substring(1))
						this.selectionStart = (this.selectionEnd = Math.min(holdSelEnd+2, t.length));
					this.startTimer();
					return true;
				} else if ((holdSelEnd !== i) && ((holdSelStart-i !== 1) || (holdSelStart !== holdSelEnd) || (holdSelEnd === 0))) {
					this.startTimer();
					if ((i === -1) || (holdSelStart <= i && holdSelEnd >= i)) { // Dot in selection
						if (this.text = t.substring(0,holdSelStart) + '.' + t.substring(holdSelEnd, t.length))
							this.selectionStart = (this.selectionEnd = Math.min(holdSelStart+1, this.text.length));
					} else if (holdSelEnd > i) { // Dot Before Cursor
						t = t.replace('.', '');
						if (this.text = t.substring(0,holdSelStart-1) + '.' + t.substring(holdSelEnd-1))
							this.selectionStart = (this.selectionEnd = Math.min(holdSelStart, this.text.length));
					} else if (holdSelEnd < i) { // Dot After Cursor
						t = t.replace('.', '');
						if (this.text = t.substring(0,holdSelStart) + '.' + t.substring(holdSelEnd))
							this.selectionStart = (this.selectionEnd = Math.min(holdSelStart+1, this.text.length));
					}
					this.startTimer();
					return true;
				} else if ((holdSelStart !== holdSelEnd) && (this.text.charCodeAt(holdSelEnd)===46)) {
					if (this.text = t.substring(0,holdSelStart) + '.' + t.substring(holdSelEnd+1))
						this.selectionStart = (this.selectionEnd = Math.min(holdSelStart+1,t.length));
					this.startTimer();
					return true;
				}
				return false
			} else if (keyCode == 46) { // DELETE
				var holdSelStart, holdSelEnd;
				if (this.selectionEnd === this.selectionStart) {
					this.text = this.text.substring(0,this.selectionStart) + this.text.substring(this.selectionStart+1);
				} else if (this.selectionEnd < this.selectionStart) {
					if (this.text = this.text.substring(0,this.selectionEnd) + this.text.substring(this.selectionStart))
						this.selectionStart = this.selectionEnd;
				} else {
					if (this.text = this.text.substring(0,this.selectionStart) + this.text.substring(this.selectionEnd))
						this.selectionEnd = this.selectionStart;
				}
				this.startTimer();
				return true;
			} else if (keyCode === 8) { // BACKSPACE
				var holdSelStart, holdSelEnd;
				if (this.selectionEnd === this.selectionStart) {
					this.text = this.text.substring(0,this.selectionStart-1) + this.text.substring(this.selectionStart);
					this.selectionStart = (this.selectionEnd = Math.max(0,this.selectionStart - 1))
				} else if (this.selectionEnd < this.selectionStart) {
					this.text = this.text.substring(0,this.selectionEnd) + this.text.substring(this.selectionStart);
					this.selectionStart = this.selectionEnd;
				} else {
					this.text = this.text.substring(0,this.selectionStart) + this.text.substring(this.selectionEnd);
					this.selectionEnd = this.selectionStart;
				}
				this.startTimer();
				return true;
			} else if (ctrlKey && keyCode === 89) {
				this.redo();
				this.startTimer();
				return true;
			} else if (ctrlKey && keyCode === 90) {
				this.undo();
				this.startTimer();
				return true;
			} else if (ctrlKey && keyCode === 65) { // Ctrl + A (ALL)
				this.selectionStart = 0;
				this.selectionEnd = this.text.length;
				return true;
			} else if ((!ctrlKey)&&(this.numeric)&&(keyCode === 189 || keyCode === 109 || keyCode === 107)) { // NEGATIVE MARK, MULTIPLICATION, DIVISION (BAR), SUM
				if (this.text[0] === '-') {
					this.text = this.text.substring(1);
					if (this.selectionStart > 0)
						this.selectionStart--;
					if (this.selectionEnd > 0)
						this.selectionEnd--;
				} else if (keyCode !== 107) {
					this.text = "-"+this.text;
					this.selectionStart++;
					this.selectionEnd++;
				}
				this.startTimer();
				return true;
			} else if ((!ctrlKey)&&(((!this.numeric)&&((keyCode === 193)||(keyCode === 191)||(keyCode === 109)||(keyCode === 106)||(keyCode === 107)||(keyCode === 111)||(keyCode === 189)||(keyCode === 190)||(keyCode === 194)||(keyCode === 188)||(keyCode === 110)||(keyCode === 32)||(keyCode === 50 && shiftKey && this.acceptsMail)||(keyCode === 9 && this.acceptsTab)||(keyCode >= 65 && keyCode <= 90)||(keyCode >= 96 && keyCode <= 105)||(keyCode >= 48 && keyCode <= 57))) ||  // TAB, a ~ z, A ~ Z, 0 ~ 9
			 	((this.numeric)&&((keyCode >= 96 && keyCode <= 105)||(keyCode >= 48 && keyCode <= 57))) )) // 0 ~ 9
			  {
			  	var holdSelStart, holdSelEnd;
			  	if (keyCode === 189 || keyCode === 109)
			  		addKey = 45;
			  	else if ((keyCode === 111)) // (Division) Bar
			  		addKey = 47;
			  	else if ((keyCode === 193)) // Same bar more functions
			  		addKey = shiftKey?63:47;
			  	else if ((keyCode === 106)) // Asterisk
			  		addKey = 42;
			  	else if ((keyCode === 107)) // Plus
			  		addKey = 43;
			  	else if ((keyCode === 191)) // : ;
			  		addKey = shiftKey?58:59;
			  	else if ((keyCode === 190)||(keyCode === 194)) // Dot
			  		addKey = 46;
			  	else if ((keyCode === 188)||(keyCode === 110)) // Comma
			  		addKey = (this.replaceCommaDot)?46:44;
			  	else if (keyCode === 50 && shiftKey && this.acceptsMail)
			  		addKey = 64;
			  	else if (keyCode >= 65 && keyCode <= 90)
			  		//addKey = keyCode+32;
			  		if ((typeof event.key === "string") && (event.key.charCodeAt() >= 65) && (event.key.charCodeAt() <= 90))
			  			addKey = keyCode;
			  		else
			  			addKey = keyCode+32;
			  	else if (keyCode >= 96 && keyCode <= 105)
			  		if (shiftKey && !this.numeric)
			  			addKey = [41, 33, 64, 35, 36, 37, 168, 38, 42, 40][keyCode-96];
			  		else
			  			addKey = keyCode-48;
			  	else if (keyCode >= 48 && keyCode <= 57 && (shiftKey && !this.numeric))
			  			addKey = [41, 33, 64, 35, 36, 37, 168, 38, 42, 40][keyCode-48];
			  	else
			  		addKey = keyCode;
			  		
				if (this.selectionEnd < this.selectionStart) {
					holdSelStart = this.selectionEnd;
					holdSelEnd = this.selectionStart;
				} else {
					holdSelStart = this.selectionStart;
					holdSelEnd = this.selectionEnd;
				}
				if (this.text = this.text.substring(0, holdSelStart) + String.fromCharCode(addKey) + this.text.substring(holdSelEnd, this.text.length)) {
					this.selectionStart = (this.selectionEnd = Math.min(holdSelStart + 1, this.text.length));
					this.startTimer();
				}
				return true;
			} else if (keyCode == 32)
				return true;
			//else if ([16,17,18,20].indexOf(keyCode) === -1) {
				//console.log("Unhandled",keyCode);
			//}
		}
		return false;
	},
	onMouseMove: function(x, y) {
		if (this.readonly) return false;
		if (this instanceof GuiInput) {
			if ((this.parent.mouse.left)&&(this.focus||(this.box.checkBounds(x, y)))&&(this.parent instanceof CanvasController)) {
				var ctx = this.parent.ctx, leftNow = 0, i;
				ctx.font = this.graphic.font;
				for (i=0;i<this.text.length;i++)
					if ((leftNow += ctx.measureText(this.text[i]).width)+this.graphic.margin > x-this.box.left+3)
						break;
				this.selectionEnd = i;
				return true;
			}
		} else
			console.error("Function must run from an instance of GuiButton");
		return false;
	},
	onMouseUp: function (btnId, x, y) {
		if (this.readonly) return false;
		if (this instanceof GuiInput) {
			if ((btnId === 0)&&(this.focus)&&(this.box.checkBounds(x, y))) {
				var ctx = this.parent.ctx, leftNow = 0, i;
				ctx.font = this.graphic.font;
				for (i=0;i<this.text.length;i++)
					if ((leftNow += ctx.measureText(this.text[i]).width)+this.graphic.margin > x-this.box.left+3)
						break;
				this.selectionEnd = i;
			}
		} else
			console.error("Function must run from an instance of GuiButton");
	},
	update: function() {
		if (this.readonly) return false;
		if (this.focus) {
			this.blinkState = !this.blinkState;
			if (typeof(CanvasController) !== "undefined" && this.parent instanceof CanvasController) {
				this.clear(this.parent.ctx);
				this.draw(this.parent.ctx);
			}
		}
	},
	clear: function(ctx) {
		if (this instanceof GuiInput)
			if (ctx instanceof CanvasRenderingContext2D)
				ctx.clearRect(this.box.left-2, this.box.top-2, this.box.width+4, this.box.height+4);
			else 
				console.error("First parameter is supposed to be instance of CanvasRenderingContext2D:",ctx);
		else
			console.error("Function must run from an instance of GuiInput");
	},
	draw: function(ctx) {
		if (this instanceof GuiInput) {
			if (ctx instanceof CanvasRenderingContext2D) {
				var roundness = this.graphic.roundness;
				var i, barBegin, barEnd, leftNow, holdSelStart, holdSelEnd;
				ctx.fillStyle = this.graphic.bgColor;
				if (this.focus) {
					ctx.strokeStyle = this.graphic.focusColor;
					ctx.lineWidth = this.graphic.focusBorder;
				} else {
					ctx.strokeStyle = this.graphic.borderColor;
					ctx.lineWidth = 1;
				}
				ctx.beginPath();
				ctx.moveTo(this.box.left+roundness, this.box.top);
				ctx.lineTo(this.box.right-roundness, this.box.top);
				ctx.quadraticCurveTo(this.box.right, this.box.top, this.box.right, this.box.top+roundness);
				ctx.lineTo(this.box.right, this.box.bottom-roundness);
				ctx.quadraticCurveTo(this.box.right, this.box.bottom, this.box.right-roundness, this.box.bottom);
				ctx.lineTo(this.box.left+roundness, this.box.bottom);
				ctx.quadraticCurveTo(this.box.left, this.box.bottom, this.box.left, this.box.bottom-roundness);
				ctx.lineTo(this.box.left, this.box.top+roundness);
				ctx.quadraticCurveTo(this.box.left, this.box.top, this.box.left+roundness, this.box.top);
				ctx.stroke();
				ctx.fill();
				
				ctx.textAlign="left";
				ctx.textBaseline="middle";
				ctx.font = this.graphic.font;
				
				ctx.strokeStyle = this.graphic.textColor;
				if ((!this.readonly)&&(this.focus)&&((this.graphic.blinks&&this.blinkState)||(this.selectionStart != this.selectionEnd))) {
					if (this.selectionEnd < this.selectionStart) {
						holdSelStart = this.selectionEnd;
						holdSelEnd = this.selectionStart;
					} else {
						holdSelStart = this.selectionStart;
						holdSelEnd = this.selectionEnd;
					}
					barBegin = 0;
					barEnd = 0;
					leftNow = 0;
					for (i=0;i<=this.text.length;i++) {
						if (holdSelStart === i)
							barBegin = leftNow;
						if (holdSelEnd === i) {
							barEnd = leftNow;
							break;
						}
						if (i < this.text.length)
							leftNow += ctx.measureText(this.text[i]).width;
					}
					if (this.selectionStart != this.selectionEnd) {
						ctx.lineWidth = 1;
					}
					ctx.beginPath();
					if (this.selectionEnd < this.selectionStart) {
						ctx.moveTo(this.box.left+this.graphic.margin+barBegin, this.box.top+this.graphic.margin-2);
						ctx.lineTo(this.box.left+this.graphic.margin+barBegin, this.box.bottom-this.graphic.margin+2);
					} else {
						ctx.moveTo(this.box.left+this.graphic.margin+barEnd, this.box.top+this.graphic.margin-2);
						ctx.lineTo(this.box.left+this.graphic.margin+barEnd, this.box.bottom-this.graphic.margin+2);
					}
					ctx.stroke();
					
					if (barBegin !== barEnd) {
						ctx.fillStyle = "rgba(255,255,255,0.3)";
						ctx.fillRect((this.box.left+this.graphic.margin+barBegin)|0,(this.box.top+this.graphic.margin-2)|0,(barEnd-barBegin)|0,(this.box.height-this.graphic.margin*2+4)|0);
					}
				}
				
				ctx.fillStyle = this.graphic.textColor;
				ctx.fillText(this.text, this.box.left+this.graphic.margin, ((this.box.top+this.box.bottom+2)/2)|0);
				
			} else 
				console.error("First parameter is supposed to be instance of CanvasRenderingContext2D:",ctx);
		} else
			console.error("Function must run from an instance of GuiInput");
	},
	checkBounds: function(x, y) {
		if (this instanceof GuiInput) {
			return this.box.checkBounds.call(this.box,x,y); 
		} else
			console.error("Function must run from an instance of GuiInput");
	}
}
