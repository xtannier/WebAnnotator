// See license.txt for terms of usage

// namespace. 
if (typeof webannotator == "undefined") {  
	var webannotator = {};  
};  

webannotator.options = {

	saveOptions: function () {
		var mainWindow = window.opener;
		var eventElement = mainWindow.content.document.getElementById("WA_data_element");
		// Get schema name and description
		var schemaName = document.getElementById("schemaname");
		if (schemaName.value == "") {
			alert("Schema name must not be an empty string!");
			return false;
		}
		eventElement.setAttribute("schemaname", schemaName.value);
		var schemaDesc = document.getElementById("schemadesc");
		eventElement.setAttribute("schemadesc", schemaDesc.value.replace(/\n/, " ").replace(/\t/, " "));

		var colorNodes = mainWindow.content.document.getElementsByTagName("WA-color");
		var i;
		for (i = 0 ; i < colorNodes.length ; i++) {
			var fgColor = document.getElementById("text1" + i).value;
			var bgColor = document.getElementById("text2" + i).value;
			var htmlColorElement = colorNodes[i];
			htmlColorElement.setAttribute("fg", fgColor);
			htmlColorElement.setAttribute("bg", bgColor);		
		}

		var evt = mainWindow.content.document.createEvent("Events");
		evt.initEvent("webannotator.optionsSet", true, false);
		eventElement.dispatchEvent(evt);
		//webannotator.main.receiveOptionsSet();
		return true;
	},


	searchOptions: function () {
		var mainWindow = window.opener;
		var eventElement = mainWindow.content.document.getElementById("WA_data_element");

		// Get DTD file name
		var dtd = eventElement.getAttribute("dtd");
		var dtdElement = document.getElementById("dtdfilename");
		dtdElement.value = dtd;
		var name = eventElement.getAttribute("schemaname");
		var schemaName = document.getElementById("schemaname");
		if (name == null) {
			schemaName.value = dtd;
		} else {
			schemaName.value = name;
		}
		var desc = eventElement.getAttribute("schemadesc");
		var schemaDesc = document.getElementById("schemadesc");
		schemaDesc.value = desc;

		var optionRows = document.getElementById("optionRows");
		// Remove all items 
		while (optionRows.hasChildNodes()) {
			optionRows.removeChild(optionRows.firstChild);
		}

		// Add header
		var row1 = document.createElement("row");
		var label1 = document.createElement("label");
		var label2 = document.createElement("label");
		label2.setAttribute("value", "Foreground color");
		label2.setAttribute("style", "text-align:center;");
		label2.setAttribute("class", "header");
		var label3 = document.createElement("label");
		label3.setAttribute("value", "Background color");
		label3.setAttribute("style", "text-align:center;");
		label3.setAttribute("class", "header");
		row1.appendChild(label1);
		row1.appendChild(label2);
		row1.appendChild(label3);
		optionRows.appendChild(row1);

		// Choose colors
		var colorNodes = mainWindow.content.document.getElementsByTagName("WA-color");
		var i;
		for (i = 0 ; i < colorNodes.length ; i++) {
			var child = colorNodes[i];
			var type = child.getAttribute("type");
			var fgColor = child.getAttribute("fg");
			var bgColor = child.getAttribute("bg");
			var row = document.createElement("row");

			var label = document.createElement("label");
			label.setAttribute("value", type);
			label.setAttribute("class", "header");
			label.setAttribute("id", "label" + i);
			label.setAttribute("style", "color:" + fgColor + ";background-color:" + bgColor + ";text-align:center;");

			var boxfg = document.createElement("box");
			var text1 = document.createElement("textbox");
			text1.setAttribute("maxlength", "7");
			text1.setAttribute("size", "7");
			text1.setAttribute("id", "text1" + i);
			text1.setAttribute("number", i);
			text1.setAttribute("value", fgColor);
			var picker1 = document.createElement("colorpicker");
			picker1.setAttribute("type", "button");
			picker1.setAttribute("id", "picker1" + i);
			picker1.setAttribute("number", i);
			picker1.setAttribute("color", fgColor);
			boxfg.appendChild(text1);
			boxfg.appendChild(picker1);

			var boxbg = document.createElement("box");
			var text2 = document.createElement("textbox");
			text2.setAttribute("maxlength", "7");
			text2.setAttribute("size", "7");
			text2.setAttribute("id", "text2" + i);
			text2.setAttribute("number", i);
			text2.setAttribute("value", bgColor);
			var picker2 = document.createElement("colorpicker");
			picker2.setAttribute("type", "button");
			picker2.setAttribute("id", "picker2" + i);
			picker2.setAttribute("number", i);
			picker2.setAttribute("color", bgColor);
			boxbg.appendChild(text2);
			boxbg.appendChild(picker2);

			row.appendChild(label);
			row.appendChild(boxfg);
			row.appendChild(boxbg);

			text1.addEventListener("input", function(e) {webannotator.options.updateRowFromTextBox(this.getAttribute('number'), this.value)});
			text2.addEventListener("input", function(e) {webannotator.options.updateRowFromTextBox(this.getAttribute('number'), this.value)});

			picker1.addEventListener("change", function(e) {webannotator.options.updateRowFromPicker(this.getAttribute('number'))});
			picker2.addEventListener("change", function(e) {webannotator.options.updateRowFromPicker(this.getAttribute('number'))});

			optionRows.appendChild(row);
		}
		// Add a last line with nothing
		// in order to enlarge the rows and move the scroll bar
		// to the right
		label1 = document.createElement("label");
		label2 = document.createElement("label");
		label3 = document.createElement("label");
		var label4 = document.createElement("label");
		label4.setAttribute("value", "     ");
		row = document.createElement("row");
		row.appendChild(label1);
		row.appendChild(label2);
		row.appendChild(label3);
		row.appendChild(label4);
		optionRows.appendChild(row);
		window.sizeToContent();
	},

	updateRowFromTextBox: function (id, value) {
		
		if (value.match(/^#[0-9ABCDEF][0-9ABCDEF][0-9ABCDEF][0-9ABCDEF][0-9ABCDEF][0-9ABCDEF]$/)) {
			var label = document.getElementById("label" + id);
			var text1 = document.getElementById("text1" + id);
			var picker1 = document.getElementById("picker1" + id);
			var text2 = document.getElementById("text2" + id);
			var picker2 = document.getElementById("picker2" + id);
			var mainWindow = window.opener;
			picker1.color = text1.value;

			picker2.color = text2.value;
			label.setAttribute("style", "color:" + picker1.getAttribute("color") + ";background-color:" + picker2.getAttribute("color") + ";");
		}
	},


	updateRowFromPicker: function (id) {
		var label = document.getElementById("label" + id);
		var text1 = document.getElementById("text1" + id);
		var picker1 = document.getElementById("picker1" + id);
		var text2 = document.getElementById("text2" + id);
		var picker2 = document.getElementById("picker2" + id);

		label.setAttribute("style", "color:" + picker1.getAttribute("color") + ";background-color:" + picker2.getAttribute("color") + ";");
		text1.value = picker1.getAttribute("color");
		text2.value = picker2.getAttribute("color");
		var mainWindow = window.opener;
	}
};
