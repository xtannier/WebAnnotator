// See license.txt for terms of usage

// namespace. 
if (typeof webannotator == "undefined") {  
	var webannotator = {};  
};  

webannotator.hidden = {};
webannotator.distX = 5;
webannotator.distY = 10;
webannotator.userShiftX = 0;
webannotator.userShiftY = 0;

webannotator.popups = {

	show_popup: function (id, evt) {
		var popup = content.document.getElementById(id);
		// hide other popups
		for (popupid in webannotator.hidden) {
			if (webannotator.hidden[popupid]) {
				webannotator.popups.hide_popup(popupid);
			}
		}
		// show this one
		//	popup.style.display = "inline-block";
		popup.style.display = "block";
		//	popup.style.position = "absolute";
		webannotator.popups.position(popup, evt);
		webannotator.hidden[id] = false;
	},

	hide_popup: function (id) {
		var popup = content.document.getElementById(id);
		popup.style.display = "none";
		webannotator.hidden[id] = true;
	},

	changepopup: function (id, evt) {
		if (webannotator.hidden) {
			show(id, evt);
		} else {
			hide(id);
		}
	},

	position: function (popup, event) { 
		// Pull the window sizes from the page object.
		// In NS we size down the window a little as it includes scrollbars.
		//	var windowWidth = page.winW(), windowHeight = page.winH();
		//	if (!isIE||isOp) { wW-=16; wH-=16 }
		var evt = event||content.window.event;

		var windowWidth = (content.window.innerWidth) - 16;
		var windowHeight = (content.window.innerHeight) - 16;

		//var windowWidth = document.body.clientWidth - 16;
		//var windowHeight = document.body.clientHeight - 16;

		// Pull the compulsory information out of the tip array.
		//var t=tips[actTip], tipX=eval(t[0]), tipY=eval(t[1]), tipW=div.w(), tipH=div.h(), adjY = 1;
		var popupWidth = popup.offsetWidth;
		var popupHeight = popup.offsetHeight;

		var scroll = new Array((content.document.documentElement && content.document.documentElement.scrollLeft) || content.window.pageXOffset || self.pageXOffset || content.document.body.scrollLeft,(content.document.documentElement && content.document.documentElement.scrollTop) || content.window.pageYOffset || self.pageYOffset || content.document.body.scrollTop);;
		var scrollX = scroll[0] - content.document.body.clientLeft;
		var scrollY = scroll[1] - content.document.body.clientTop;

		var mouseX = evt.clientX;
		var mouseY = evt.clientY;
		var left = mouseX + scrollX + webannotator.distX + webannotator.userShiftX;
		var top = mouseY + scrollY + webannotator.distY + webannotator.userShiftY;

		if (left < 0) {
			left = 0;
		}
		else if (left - scrollX + popupWidth + webannotator.distX > windowWidth) {
			left = windowWidth + scrollX - popupWidth - webannotator.distX;
		}

		if (top < 0) {
			top = 0;
		}
		else if (top - scrollY + popupHeight + webannotator.distY > windowHeight) {
			top = windowHeight + scrollY - popupHeight -webannotator. distY;
		}
		
		//alert(windowHeight + " " + mouseY + " " + scrollY + " " + popupHeight + " " + distY + " -> " + top);
		
		popup.style.left = left + "px";
		popup.style.top = top + "px";
	}
};

