// See license.txt for terms of usage

// namespace
if (typeof webannotator == "undefined") {  
	var webannotator = {};  
};  

// File that contains all the names of the default files 
webannotator.fileSet = "webAnnotator.json";

// Elements from already loaded schemas
webannotator.schemasFileName = "elements.json";
webannotator.schemaConstraintsFileName = "elementConstraints.json";
webannotator.schemaColorsFileName = "elementColors.json";

// Path to chrome content
webannotator.contentPath = "chrome://webannotator/content/";

// Names of the schema files 
webannotator.schemas = [];

// Name of the DTD file 
webannotator.dtdFileName = "";

// Path of the extension
//webannotator.pathEX = "";

// List of elements parsed from the DTD
webannotator.elements = {};

// List of constraints (IMPLIED, REQUIRED, default value)
// parsed from the DTD
webannotator.elementConstraints = {};

// List of colors for each types
webannotator.colors = {};

// Is the panel visible or not ?
webannotator.panelOn = true;

// Max id from loaded annotation file
// (0 when new annotation)
webannotator.maxId;

// annotated elements
webannotator.annotationNames = {};
webannotator.annotationTexts = {};
webannotator.annotationAttributes = {};

// true if the WE menu in navigation bar has been created
// false otherwise
webannotator.buttonMenuCreated = false;
webannotator.textMenuCreated = false;

// true if an annotation session has begun
webannotator.session = false;

// true if modified (and must save before closing)
webannotator.modified = false;

// schema currently in use
webannotator.currentSchemaId;

// Elements and constraints corresponding to the current schema
webannotator.currentDtdElements = null;
webannotator.currentDtdElementConstraints = null;

// save done
//webannotator.saveDone = false;

// event triggered when saving is finished.
//webannotator.endSaveEvent;


// Get the WA profile directory
webannotator.dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);


// DTD patterns 
// Element
// example : <!ELEMENT food (#PCDATA)>
webannotator.elementPattern = /<!ELEMENT\s+([^ ]+)\s+(.*)>/;
// Attributes
// examples :   
// <!ATTLIST food type (fruit|grain|proteins|dairy|vegetable) #IMPLIED
//                taste (salty|sour|sweet|bitter|umami) #IMPLIED>
// <!ATTLIST food flavor (awful|bad|bland|good|delicious) "bland">
// <!ATTLIST food other CDATA >
webannotator.attributePattern = /<!ATTLIST\s+([^ ]+)\s+([^ ]+)\s+([^ ]+)\s*([^ ]+)?(.*)>/;
webannotator.nextAttributesPattern = /\s*([^ ]+)\s+\(([^\)]+)\)\s+([^ ]+)(.*)$/;
// Entities 
// example : 
// <!ENTITY callisto_task_version "1.0">
webannotator.entityPattern = /<!ENTITY\s+([^ ]+)\s+"([^"]+)"\s*>/;

// Initialize locale properties
webannotator.gWABundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
webannotator.bundle = webannotator.gWABundle.createBundle("chrome://webannotator/locale/wa.properties");

// Initialize preferences
webannotator.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

//webannotator.prefs.setCharPref("extensions.webannotator.lastsavefile", "");
//webannotator.prefs.setCharPref("extensions.webannotator.lastexportfile", "");
//webannotator.prefs.setCharPref("extensions.webannotator.lastsavedir", "");

// Add event listeners
document.addEventListener("webannotator.optionsSet", function(e) { webannotator.main.receiveOptionsSet(); return false;}, false);
document.addEventListener("webannotator.saveAndExport", function(e) { webannotator.main.receiveSaveAndExport(); return false;}, false);
document.addEventListener("webannotator.resetExtension", function(e) { webannotator.main.deactivate(); return false;}, false);

webannotator.main = {
	
	/**
	 * A few string manipulation functions
	 */
	startsWith: function(str, pattern) {
		return (str.match("^"+pattern) !== null);
	},

	endsWith: function(str, pattern) {
		return (str.match(pattern + "$") !== null);
	},

	trim: function (str) { 
		return str.replace(/^\s+/g,'').replace(/\s+$/g,'');
	},

	// Remove DTD comments in schema definition files
	removeDTDComment: function (str){
		return str.replace(/<!--.*-->/g, '');
	},

	// Get the extension data directory
	getPathEx: function() {
		var dir = webannotator.dirService.get("ProfD", Components.interfaces.nsIFile);
        dir.append("webannotator");
		return dir;
	},

	/**
	 * Initialize the extension path
	 */
	setPathEX: function (){
		// Read the names of files
		webannotator.main.readSchemasFile();
		// Create elements in XUL button and menus
		setTimeout(function() {webannotator.main.createMenus(); }, 1000);

/*		var id = "WebAnnotator@limsi.fr";
		try {
			// Firefox 4 and later; Mozilla 2 and later
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.getAddonByID(id, function(addon) {
				var reg =new RegExp("/");
				webannotator.main.setPathEX2(addon.getResourceURI("wa.js").path.split("wa.js")[0].substring(1));
			});
		} catch (ex) {
			// Firefox 3.6 and before; Mozilla 1.9.2 and before
			var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager).getInstallLocation(id).getItemLocation(id);
			webannotator.main.setPathEX2(em.path);
		}*/
	},
	
	/**
	 * ACTIVATE THE EXTENSION
	 */
	activate: function() {	
		// if a schema has been selected
		if (webannotator.dtdFileName != "") {
			// Build annotations from WA spans in loaded document
			webannotator.main.buildAnnotations();
			webannotator.main.activateHTMLDocument();
		
			webannotator.session = true;

			// Add elements concerning colors		
			var colorNodes = content.document.getElementsByTagName("WA-color");
			// remove existing color items
			for (i = 0 ; i < colorNodes.length ; i++) {
				var htmlColorElement = colorNodes[i];
				htmlColorElement.parentNode.removeChild(htmlColorElement);
			}

			// Add color items
			var i = 0;
			var n;
			for (n in webannotator.elements[webannotator.dtdFileName]) {
				var htmlElement = content.document.createElement("WA-color");
				htmlElement.setAttribute("type", n);
				htmlElement.setAttribute("class", "WebAnnotator_" + n);
				var color = webannotator.htmlWA.getColor(webannotator.dtdFileName, n, i);
				htmlElement.setAttribute("fg", color[0]);
				htmlElement.setAttribute("bg", color[1]);
				htmlElement.setAttribute("id", "WA-color-" + i);
				content.document.documentElement.appendChild(htmlElement);
					i++;
			}
			// Show bottom panel
			webannotator.main.showWAPanel(true);
			// Activate menus
			webannotator.main.activateMenus();
			// Show already existing annotation (if any)
			webannotator.main.receiveShowAnnotations();
			// The page has not been modified yet
			webannotator.main.setModified(false);
		} 
		// If not schema has been selected (should not happen)
		else {
			webannotator.main.locale_alert("waChooseDTD");		
		}
	},

	/**
	 * Specify whether the current annotated page has been modified
	 * or not (allow to prevent for unsaved page quiting)
	 */
	setModified: function (value) {
		webannotator.modified = value;
		var dataElement = content.document.getElementById("WA_data_element");
		if (dataElement !== null) {
			dataElement.setAttribute("modified", value);
		}
	},

	/**
	 * Activate annotation session in the current HTML page
	 */
	activateHTMLDocument: function () {
		var head = content.document.getElementsByTagName("head")[0];
		var scriptPath;
		
		// Once the schema is selected, 
		// include the pre-defined corresponding CSS file in order
		// to visualize highlighted spans
		var link = content.document.createElement("link");
		link.setAttribute("id","custom_css");
		link.setAttribute("type","text/css");
		link.setAttribute("rel","stylesheet");
		link.setAttribute("href", webannotator.contentPath + "schemas/"+ webannotator.dtdFileName + ".css");
		head.appendChild(link);
		
		var body = content.document.body;
		
		// Add element for communication between HTML and XUL
		var dom = webannotator.misc.jsonToDOM(["WA_data_element", {id:"WA_data_element", "WA-maxid":""+webannotator.maxId},
										   ""], content.document);
		webannotator.main.setModified(false);
		content.document.documentElement.appendChild(dom);  
		// building the panels
		webannotator.main.buildPopups(webannotator.dtdFileName);
		
		// event listeners cannot be registered for the onbeforeunload event with 
		// the addEventListener and attachEvent methods 
		// (only Safari and Google Chrome support it).
		body.setAttribute("onbeforeunload",'var dataElement = document.getElementById("WA_data_element"); var modified = dataElement.getAttribute("modified"); var evt = document.createEvent("Events"); evt.initEvent("webannotator.resetExtension", true, true); dataElement.dispatchEvent(evt); modified = dataElement.getAttribute("modified"); if (modified == "true") {return ""; }');

		// All following tries did not work
//		window.addEventListener("beforeunload", webannotator.main.quit, false);
//		window.addEventListener("beforeunload", webannotator.main.quit, true);
//		body.addEventListener("beforeunload", webannotator.main.quit, false);
//		body.addEventListener("beforeunload", webannotator.main.quit, true);
//		body.setAttribute("onbeforeunload", function(e) {webannotator.main.quit(e)});
//		body.onbeforeunload = function(e) {webannotator.main.quit(e);};
		
		body.addEventListener("mouseup", webannotator.htmlWA.openMenu, false);
		body.addEventListener("mouseover", webannotator.htmlWA.firstLoad, false);
	},

	quit: function(e) {
		var e = e || window.event;  
		var dataElement = window.content.document.getElementById("WA_data_element"); 
		var modified = dataElement.getAttribute("modified"); 
		var evt = window.content.document.createEvent("Events"); 
		evt.initEvent("webannotator.resetExtension", true, true); 
		dataElement.dispatchEvent(evt); 
		modified = dataElement.getAttribute("modified"); 
		if (modified == "true") {e.returnValue=""; return "";}
	},

	/**
	 * Build annotation popup according to the selected schema
	 */
	buildPopups: function (dtdFileName) {
		var body = content.document.body;
		// main elements
		var dom = webannotator.misc.jsonToDOM(["div", {id:"webannotator-main-menu", style:"display:none;"},
								""], document);
		body.appendChild(dom);  

		// secondary elements
		dom = webannotator.misc.jsonToDOM(["div", {id:"webannotator-sec-menu", style:"display:none;"},
							""], document);
		body.appendChild(dom);  
		// edit popup
		dom = webannotator.misc.jsonToDOM(["div", {id:"webannotator-edit-menu", 
									style:"font-family:arial;z-index:5;position:absolute;display:none;background-color:white;",
									onmouseover:function(e) { webannotator.htmlWA.retainEditAnnotationMenu(); return false;},
									onmouseout:function(e) { webannotator.htmlWA.hideEditAnnotationMenu(); return false;}
								   },
							[
								["img", {onclick:function(e) { webannotator.popups.hide_popup("webannotator-edit-menu"); webannotator.main.receiveDeleteAnnotation(); return false;},
										 src:'chrome://webannotator/skin/suppr.png'}, ""],
								["img", {onclick:function(e) { webannotator.popups.hide_popup("webannotator-edit-menu"); webannotator.htmlWA.receiveWindowEditAnnotation(e); return false;},
										 src:'chrome://webannotator/skin/edit.png'}, ""]
							]
						   ], 
						   document);
		body.appendChild(dom);  
		webannotator.main.initVarMenu(dtdFileName);
		webannotator.isOpen = false;
	},
	
	/**
	 * Return the number of attributes in an object
	 */
	sizeObject: function (obj) { 
		var size = 0, key; 
		for (key in obj) { 
			if (obj.hasOwnProperty(key)) {
				size++; 
			}
		} 
		return size; 
	},
	
	/**
	 * Initialize the content of annotation popup menus
	 * according to the specified schema
	 */
	initVarMenu: function (dtdFileName) {
		var body = content.document.body;
		webannotator.currentDtdElements = webannotator.elements[dtdFileName];
		webannotator.currentDtdElementConstraints = webannotator.elementConstraints[dtdFileName];
		
		// Create div for selection of main user-defined classes 
		var mainMenuContent = "";
		var n;
		
		var elems = new Array();
		for (n in webannotator.currentDtdElements) {
			var _attributes = webannotator.currentDtdElements[n];
			/**/
			
			var attributeLength = webannotator.main.sizeObject(_attributes);
	
			var color = webannotator.htmlWA.getColor(dtdFileName, n, -1);		
		
			if(attributeLength == 0) {
				elems.push(["button", {id:'button_' + n,
									   number: n, 
									   onclick:function(e) {webannotator.htmlWA.action(this.getAttribute('number')); webannotator.popups.hide_popup("webannotator-main-menu");},
									   style:"color:" + color[0] + "; background-color:" + color[1] + ";",
									   class:'WebAnnotator_' + n}, n]);
			}
			
			else {
				elems.push(["button", {id:'button_' + n,
									   number: n, 
									   onclick:function(e) {webannotator.htmlWA.changeSecondaryMenu(this.getAttribute('number')); webannotator.popups.show_popup("webannotator-sec-menu", e); webannotator.popups.hide_popup("webannotator-main-menu");},
									   style:"color:" + color[0] + "; background-color:" + color[1] + ";",
									   class:'WebAnnotator_' + n}, n]);
			}
		}
		if (elems.length == 0) {
			elems = "";
		}
		var dom = webannotator.misc.jsonToDOM(["div", {id:"webannotator-main-menu", style:"font-family:arial;z-index:5;position:absolute;display:none;border:thin solid black;background-color:white;text-align:center;"},
								[
									["div", {id:"webannotator-main-menu-elems"}, elems],
									["div", {}, ["button", {href:"#", 
															onclick:function(e) {webannotator.popups.hide_popup('webannotator-main-menu'); webannotator.htmlWA.closeMenu();}
														   },
												 webannotator.bundle.GetStringFromName("waCancel")]
									]
								]
							   ], document);
		body.replaceChild(dom, content.document.getElementById("webannotator-main-menu"));
	},

	/**
	 * Activate XUL menus
	 */
	activateMenus: function () {
		document.getElementById("WebAnnotator_waOptions").collapsed = false;
		var activeMenu = document.getElementById("WebAnnotator_b_activeMenu");
		if (activeMenu != null) {
			activeMenu.setAttribute("label", webannotator.bundle.GetStringFromName("waDeactivate"));
			activeMenu.setAttribute("disabled", "false");
		}
		var exportMenu = document.getElementById("WebAnnotator_b_exportMenu");
		if (exportMenu != null) {
			exportMenu.setAttribute("disabled", "false");
		}
		
		activeMenu = document.getElementById("WebAnnotator_t_activeMenu");
		if (activeMenu != null) {
			activeMenu.setAttribute("label", webannotator.bundle.GetStringFromName("waDeactivate"));
			activeMenu.setAttribute("disabled", "false");
		}
		exportMenu = document.getElementById("WebAnnotator_t_exportMenu");
		if (exportMenu != null) {
			exportMenu.setAttribute("disabled", "false");		
		}
		
		var container = gBrowser.tabContainer;
		container.addEventListener("TabSelect", webannotator.main.tabSelect, false);
	},
	
	/**
	 * When an already annotated page is reloaded, 
	 * give appropriate colors to WA spans
	 */
	setSpanColorStyle: function (doc, value) {
		var spans = doc.getElementsByTagName("span");
		var i;
		for(i = 0; i < spans.length ; i++){
			if (spans[i].hasAttributes() && spans[i].getAttribute("WA-id") !== null) {
				var span = spans[i];
				if (value) {
					var type = span.getAttribute("wa-type");
					var color = webannotator.htmlWA.getColor(webannotator.dtdFileName, type, -1);
					if (color !== null) {
						span.setAttribute("style", "color:" + color[0] + "; background-color:" + color[1] + ";");
					}
				} else {
					span.setAttribute("style", "");
				}
			}
		}
	},
	
	/**
	 * When a new tab is selected (activate or deactivate WA session)
	 */
	tabSelect: function () {
		// If this tab contains a WA data element, activate button
		if (window.content.document.getElementById("WA_data_element")) {
			webannotator.main.intoFocus();
		} 
		// Else, deactivate button, unless no other tab has
		// a WA data element
		else {
			var num = gBrowser.mPanelContainer.childNodes.length;
			var found = false;
			var i;
			for (i = 0; i < num && !found ; i++) {
				var b = gBrowser.getBrowserAtIndex(i);
				if (b.contentDocument.getElementById("WA_data_element")) {
					found = true;
				}
			}
			if (found) {
				webannotator.main.outOfFocus();
			} else {
				webannotator.main.intoFocus();
			}
		}
	},
	
	/**
	 * When tab containing the annotated page is left
	 */
	outOfFocus: function () {
		webannotator.main.showWAPanel(false); 
		document.getElementById("WebAnnotator_waOptions").collapsed = true;
		// Disable button
		var button = document.getElementById("WebAnnotator_button");
		button.disabled = true;
		button.style.listStyleImage = "url('chrome://webannotator/skin/wa_small_disabled.png')";
		// Disable menu
		var menu = document.getElementById("WebAnnotator-menu");
		menu.disabled = true;
	},
	
	/**
	 * When tab containing the annotated page is selected
	 */
	intoFocus: function () {
		webannotator.main.showWAPanel(true); 
		document.getElementById("WebAnnotator_waOptions").collapsed = false;
		webannotator.main.enableAddOn();
	},

	/**
	 * Enable accesses to WA activation (button, menus)
	 */
	enableAddOn: function() {
		// Enable button
		var button = document.getElementById("WebAnnotator_button");
		button.disabled = false;
		button.style.listStyleImage = "url('chrome://webannotator/skin/wa_small_activated.png')";
		// Enable menu
		var menu = document.getElementById("WebAnnotator-menu");
		menu.disabled = false;
	},
	
	/**
	 * Deactivate the annotation session
	 */
	deactivate: function () {
		var r = true;
		if (webannotator.modified) {
			// Display the dialogue to confirm whether delete or not
			r = confirm(webannotator.bundle.GetStringFromName("waDeactivateConfirm"));
		}
		
		// Confirm 
		if (r == true) {
			webannotator.session = false;
			webannotator.main.showWAPanel(false);
			
			document.getElementById("WebAnnotator_waOptions").collapsed = true;
			webannotator.dtdFileName = "";
			webannotator.main.updateMenus(true, true);
			// Erase annotations
			webannotator.annotationNames = {};
			webannotator.annotationTexts = {};
			webannotator.annotationAttributes = {};
			var selectedIds = [];
			webannotator.main.updateTable(selectedIds, true);

			// event listeners cannot be registered for the onbeforeunload event with 
			// the addEventListener and attachEvent methods 
			// (only Safari and Google Chrome support it).
			content.document.body.setAttribute("onbeforeunload", "");

			content.document.body.removeEventListener("mouseup", webannotator.htmlWA.openMenu, false);

			var exportMenu = document.getElementById("WebAnnotator_b_exportMenu");
			if (exportMenu != null) {
				exportMenu.setAttribute("disabled", "true");
			}
			exportMenu = document.getElementById("WebAnnotator_t_exportMenu");
			if (exportMenu != null) {
				exportMenu.setAttribute("disabled", "true");
			}
			window.content.location.reload();
			webannotator.linksEnable = true;
			// remove all event listeners
			webannotator.main.setModified(false);
			var container = gBrowser.tabContainer;
			container.removeEventListener("TabSelect", webannotator.main.tabSelect, false);
			
			webannotator.main.enableAddOn(); 
			webannotator.noLoad = true;
		} else {
		}
	},
	
	/**
	 * Show or hide the bottom panel of the addon
	 */
	showWAPanel: function (show) {
		var waPanel = document.getElementById("WebAnnotator_waContentBox");
		var waSplitter = document.getElementById("WebAnnotator_waContentSplitter");
		waPanel.collapsed = !show;
		waSplitter.collapsed = !show;
	},
	
	
	/**
	 * Write the list of annotation schemas into file
	 */
	writeSchemasFile: function () {
		var file = webannotator.main.getPathEx();
		file.append(webannotator.fileSet);
		var jsonElements;
		var ostream;
		try {
			if (file.exists()) {
				file.remove(false);
			}
			file.create(file.NORMAL_FILE_TYPE, 0666);
			jsonElements = JSON.stringify(webannotator.schemas);  
			ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
			ostream.write(jsonElements, jsonElements.length);
			ostream.close();
		}
		catch (ex) {
			alert("ERROR: Failed to write file: " + file.leafName);
		}
	}, 
	

	/**
	 * Read the names of the annotation schemas files 
	 * that are stored in the system.
	 */
	readSchemasFile: function () {		
		var file = webannotator.main.getPathEx();
		file.append(webannotator.fileSet);
		var inputStream;
		var cstream;
		// if file exists
		if(file.exists() == true) {
		    inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
            cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);

            inputStream.init(file, 0x01, 0444, 0);
            cstream.init(inputStream, "UTF-8", 0, 0);

            // Load .
            var json = "";
            var data = {};
            while (cstream.readString(-1, data) != 0) {
                json += data.value;
			}

			if (json.length) {
				webannotator.schemas = JSON.parse(json);  
			}
			cstream.close();
			inputStream.close();
		}
		else {
			webannotator.main.writeSchemasFile();
			webannotator.main.createJSON();
			return;
		}
		
		// Load elements, element constraints and colors
		// Save elements
		file = webannotator.main.getPathEx();
		file.append(webannotator.schemasFileName);
		if (file.exists() == true) {
			inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
            cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);
			
            inputStream.init(file, 0x01, 0444, 0);
            cstream.init(inputStream, "UTF-8", 0, 0);
			
            // Load .
            var json = "";
            var data = {};
            while (cstream.readString(-1, data) != 0) {
                json += data.value;
			}

			if (json.length) {
				webannotator.elements = JSON.parse(json);  
			}
			cstream.close();
			inputStream.close();
		} else {
			webannotator.createJSON();
			return;
		}

		// Save element constraints
		file = webannotator.main.getPathEx();
		file.append(webannotator.schemaConstraintsFileName);
		if (file.exists() == true) {
			inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
            cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);
			
            inputStream.init(file, 0x01, 0444, 0);
            cstream.init(inputStream, "UTF-8", 0, 0);
			
            // Load .
            var json = "";
            var data = {};
            while (cstream.readString(-1, data) != 0) {
                json += data.value;
			}

			if (json.length) {
				webannotator.elementConstraints = JSON.parse(json);  
			}
			cstream.close();
			inputStream.close();
		} else {
			webannotator.createJSON();
			return;
		}
		
		// Save element colors
		file = webannotator.main.getPathEx();
		file.append(webannotator.schemaColorsFileName);
		if (file.exists() == true) {
			inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Components.interfaces.nsIFileInputStream);
            cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                .createInstance(Components.interfaces.nsIConverterInputStream);
			
            inputStream.init(file, 0x01, 0444, 0);
            cstream.init(inputStream, "UTF-8", 0, 0);
			
            // Load .
            var json = "";
            var data = {};
            while (cstream.readString(-1, data) != 0) {
                json += data.value;
			}

			if (json.length) {
				webannotator.colors = JSON.parse(json);  
			}
			cstream.close();
			inputStream.close();
		} else {
			webannotator.createJSON();
			return;
		}
	},
	

	/**
	 * Read the informations about the new annotation schema
	 * from a DTD and set sections : name and attributes (name + types)
	 */
	readDTDFile: function (file) {
		// open an input stream from file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
            createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);
		
		// read lines into an array
		var line = {}, strLine, lines = [], hasmore;
		var error = 0;
		var errorLine = null;
		do {
			hasmore = istream.readLine(line);
			strLine = webannotator.main.trim(line.value);
			// if the line is a new line (begins by "<!")
			// then adds to the array
			// else (continuation of previous line), concat with last element
			if (strLine.length > 0) {
				if (webannotator.main.startsWith(strLine,"<!")) {
					lines.push(strLine); 
				} else {
					if (lines.length == 0) {
						error = 1;
						errorLine = strLine;
					} else {
						lines[lines.length-1] += " " + strLine;
					}
				}
			}
		} while(hasmore);
		istream.close();
		
		if (error <= 0) {
			// Get the information of the file
			// Information about one section : name and list of attributes
			var _attributes;
			var _attributeConstraints;
			var _dtdElements = {};
			var _dtdElementConstraints = {};
			var i;
			for(i = 0; i< lines.length ; i++){
				strLine = lines[i];
				strLine = webannotator.main.removeDTDComment(strLine);
				if (strLine.length == 0) {
					continue;
				}
				// ELEMENT
				var match = webannotator.elementPattern.exec(strLine);
				if (match !== null) {
					_dtdElements[match[1]] = {}; 
					_dtdElementConstraints[match[1]] = {}; 
				} else {
					// ATTRIBUTE
					// match[1] = element name
					// match[2] = attribute name
					// match[3] = attribute values
					// match[4] = IMPLIED, REQUIRED or default value
					// match[5] = if defined, other attlist
					match = webannotator.attributePattern.exec(strLine);
					var nextAttributes;
					var elementName;
					if (match !== null) {
						if (_dtdElements[match[1]] == null) {
							alert("Element " + match[1] + " is not defined ! ");
							error = 1;
							errorLine = strLine;
						} else {
							elementName = match[1];
							_attributes = _dtdElements[elementName];
							_attributeConstraints = _dtdElementConstraints[elementName];
							
							// Get attribute values and trim each of them
							var attValue = match[3];
							
							// list of values
							if (webannotator.main.startsWith(attValue, "\\(")) {
								if (!webannotator.main.endsWith(attValue, "\\)")) {
									alert("Values " + attValue + " should end with ')'");
									error = 1;
									errorLine = strLine;
								} else {
									var attValues = attValue.substring(1, attValue.length-1).split("|");
									var j;
									for(j = 0; j < attValues.length; j++){
										attValues[j] = webannotator.main.trim(attValues[j]);
									}
									_attributes[match[2]] = attValues;
									_attributeConstraints[match[2]] = match[4];
								}
							}
							
							// CDATA
							else if (attValue == "CDATA") {
								_attributes[match[2]] = "CDATA";
								_attributeConstraints[match[2]] = "";
							}
							nextAttributes = match[5];
							while (error == 0 && nextAttributes.length > 0) {
								// Ici, 
								// match[1] = attribute name
								// match[2] = attribute values
								// match[3] = IMPLIED, REQUIRED or default value
								// match[4] = if defined, other attlist
								match = webannotator.nextAttributesPattern.exec(nextAttributes);
								if (match == null) {
									alert("Bad format in ATTLIST description !");
									error = 1;
									errorLine = strLine;
								} else {
									var attValues =  match[2].split("|");
									var j;
									for(j = 0; j < attValues.length; j++){
										attValues[j] = webannotator.main.trim(attValues[j]);
									}
									_attributes[match[1]] = attValues;
									_attributeConstraints[match[1]] = match[3];
									nextAttributes = match[4];
								}
							}
							_dtdElements[elementName] = _attributes;
							_dtdElementConstraints[elementName] = _attributeConstraints;
						}
					}
					else {
						// ENTITY 
						match = webannotator.entityPattern.exec(strLine);
						// if entity, do nothing
						if (match !== null) {
							continue;
						}
						// else (error)
						else {
							error = 1;
							errorLine = strLine;
							break;
						}
					}
				}
			}

			webannotator.elements[file.leafName] = _dtdElements;
			webannotator.elementConstraints[file.leafName] = _dtdElementConstraints;
		}
		if (error > 0) {
			alert("Error in file " + file.leafName + " at line \n\"" + errorLine + "\"");
		}
		return error;
	},
	
	/**
	 * Delete the schema file corresponding to specifed id
	 */
	deleteFile: function (id) {
		var schema = webannotator.schemas[id];
		var label = schema["name"];
		var fileName = schema["filename"];
		
		// if the schema is currently in use, cannot delete it
		if (webannotator.dtdFileName == fileName) {
			webannotator.main.locale_alert("waSchemaAlreadyUsed");
		}
		// else
		else {
			// Display the dialogue to confirm whether delete or not
			var r=confirm(webannotator.bundle.GetStringFromName("waDeleteConfirm") + " \"" + label + "\"?");
			
			// Confirm to delete
			if (r==true) {
				var file = webannotator.main.getPathEx();
				file.append(label + ".css");
				
				if (file.exists()){
					file.remove(false);	
				}
				
				// delete the name of the file in the files
				var i;
				for (i =0; i < webannotator.schemas.length ; i++){
					if (webannotator.schemas[i]["name"] == label){
						break;
					}		
				}
				
				webannotator.schemas.splice(i,1);
				
				// Remove file name from elements
				// and rewrite the elements javascript
				// initialisation file
				delete webannotator.elements[fileName];   
				delete webannotator.elementConstraints[fileName];
				if (typeof(webannotator.colors) != 'undefined' && webannotator.colors[fileName]) {
					delete webannotator.colors[fileName];
				}
				webannotator.main.createJSON();
				
				// Rewrite the file containing the list 
				// of annotation schemas
				webannotator.main.writeSchemasFile();
				
				// Display the message
				webannotator.main.locale_alert("waDeleteOk");
				webannotator.main.updateMenus(true, true);
			}
		}
	},
	
	/**
	 * Create XUL menus
	 */
	createMenus: function () {
		webannotator.main.updateMenus(!webannotator.buttonMenuCreated,
									  !webannotator.textMenuCreated);
	},
	
	/**
	 * Update XUL menus for activating or deleting annotation schemas
	 */
	updateMenus: function (updateButtonMenu, updateTextMenu){
		var b_menu1 = document.getElementById('WebAnnotator_b_chooseMenu');
		var b_menu2 = document.getElementById('WebAnnotator_b_deleteMenu');
		var t_menu1 = document.getElementById('WebAnnotator_t_chooseMenu');
		var t_menu2 = document.getElementById('WebAnnotator_t_deleteMenu');
		var b_activeMenu = document.getElementById("WebAnnotator_b_activeMenu");
		var t_activeMenu = document.getElementById("WebAnnotator_t_activeMenu");

		// else, if no schema file available
		if (webannotator.schemas.length == 0) {
			if (b_menu1 != null) {
				b_menu1.setAttribute("disabled", "true");
				b_menu2.setAttribute("disabled", "true");
				b_activeMenu.setAttribute("disabled", "true");	
			} 
			if (t_menu1 != null) {
				t_menu1.setAttribute("disabled", "true");
				t_menu2.setAttribute("disabled", "true");
				t_activeMenu.setAttribute("disabled", "true");
			}
		} 
		// if schema files are available, update menus
		// and enable them
		else {
			if (b_menu1 != null && updateButtonMenu) {
				b_menu1.setAttribute("disabled", "false");
				b_menu2.setAttribute("disabled", "false");
				var b_menuChooseNodes = document.getElementById('WebAnnotator_b_chooseMenu_pop');
				var b_menuDeleteNodes = document.getElementById('WebAnnotator_b_deleteMenu_pop');
				// Remove all items from menus
				while (b_menuChooseNodes.hasChildNodes()) {
					b_menuChooseNodes.removeChild(b_menuChooseNodes.firstChild);
				}
				while (b_menuDeleteNodes.hasChildNodes()) {
					b_menuDeleteNodes.removeChild(b_menuDeleteNodes.firstChild);
				}
				
				// Add the names of the files in the menu: choose DTD and delete DTD
				var lastUsedFound = 0;
				var i;
				for (i = 0 ; i < webannotator.schemas.length ; i++) {
					b_activeMenu.setAttribute("disabled", "false");
					var schema = webannotator.schemas[i];
					var menuitemChoose = b_menu1.appendItem(schema["name"], i);
					menuitemChoose.setAttribute("id", "WebAnnotator_b_chooseMenu" + i);
					menuitemChoose.setAttribute("number", i);
					menuitemChoose.addEventListener("command", function(e) {webannotator.main.chooseFile(this.getAttribute('number'), true)});
					var menuitemDelete = b_menu2.appendItem(schema["name"], i);
					menuitemDelete.setAttribute("id", "WebAnnotator_b_deleteMenu" + i);
					menuitemDelete.setAttribute("number", i);
					menuitemDelete.addEventListener("command", function(e) {webannotator.main.deleteFile(this.getAttribute('number'))});
					if (schema["lastused"] == 1 && !webannotator.session) {
						b_activeMenu.setAttribute("label", webannotator.bundle.GetStringFromName("waActivate") + " " + schema["name"]);
						b_activeMenu.setAttribute("number", i);
						b_activeMenu.addEventListener("command", webannotator.main.switchActivation);
						lastUsedFound = 1;
					}
				}
				if (!lastUsedFound && !webannotator.session) {
					b_activeMenu.setAttribute("disabled", "true");
				}

				webannotator.buttonMenuCreated = true;
			}

			if (t_menu1 != null && updateTextMenu) {
				t_menu1.setAttribute("disabled", "false");
				t_menu2.setAttribute("disabled", "false");
				var t_menuChooseNodes = document.getElementById('WebAnnotator_t_chooseMenu_pop');
				var t_menuDeleteNodes = document.getElementById('WebAnnotator_t_deleteMenu_pop');
				// Remove all items from menus
				while (t_menuChooseNodes.hasChildNodes()) {
					t_menuChooseNodes.removeChild(t_menuChooseNodes.firstChild);
				}
				while (t_menuDeleteNodes.hasChildNodes()) {
					t_menuDeleteNodes.removeChild(t_menuDeleteNodes.firstChild);
				}
				
				// Add the names of the files in the menu: choose DTD and delete DTD
				var lastUsedFound = 0;
				var i;
				for (i = 0 ; i < webannotator.schemas.length ; i++) {
					t_activeMenu.setAttribute("disabled", "false");
					var schema = webannotator.schemas[i];
					var menuitemChoose = t_menu1.appendItem(schema["name"], i);
					menuitemChoose.setAttribute("id", "WebAnnotator_t_chooseMenu" + i);
					menuitemChoose.setAttribute("number", i);
					menuitemChoose.addEventListener("command", function(e) {webannotator.main.chooseFile(this.getAttribute('number'), true)});
					var menuitemDelete = t_menu2.appendItem(schema["name"], i);
					menuitemDelete.setAttribute("id", "WebAnnotator_t_deleteMenu" + i);
					menuitemDelete.setAttribute("number", i);
					menuitemDelete.addEventListener("command", function(e) {webannotator.main.deleteFile(this.getAttribute('number'))});
					if (schema["lastused"] == 1 && !webannotator.session) {
						t_activeMenu.setAttribute("label", webannotator.bundle.GetStringFromName("waActivate") + " " + schema["name"]);
						t_activeMenu.setAttribute("number", i);
						t_activeMenu.addEventListener("command", webannotator.main.switchActivation);
						lastUsedFound = 1;
					}
				}
				if (!lastUsedFound && !webannotator.session) {
					t_activeMenu.setAttribute("disabled", "true");
				}

				webannotator.textMenuCreated = true;
			}
		}
		return true;
	},


	/**
	 * Activate or deactivate an annotation session
	 */
	switchActivation: function () {
		var id = this.getAttribute('number');
		if (webannotator.session) {
			webannotator.main.deactivate();
		} else {
			webannotator.main.chooseFile(id, false);
		}
	},

	/**
	 * Chooses the DTD file for strating an annotation session
	 */
	chooseFile: function (id, fromManualLoad) {
		// If not on a web page (for example, add-on page)
		if (typeof(window.content.document.body) == 'undefined') {
			webannotator.main.locale_alert("waNoAnnotation");
		}
		// if an annotation session has already started
		// refuse
		else if (webannotator.session && webannotator.modified) {
			webannotator.main.locale_alert("waCantLoadNewSchema");
		}
		// if an annotation session has already started 
		// and if the user loads manually another annotated 
		// file, do nothing
		else if (webannotator.session && fromManualLoad) {
		}
		else {
			var r = true;
			webannotator.currentSchemaId = id;
			var currentSchema = webannotator.schemas[id];
			for (i =0; i < webannotator.schemas.length ; i++){
				webannotator.schemas[i]["lastused"] = "0";
			}
			currentSchema["lastused"] = "1";
			webannotator.dtdFileName = currentSchema["filename"];

			webannotator.main.writeSchemasFile();
			webannotator.main.activate();			
			var element = window.content.document.getElementById("WA_data_element");
			element.setAttribute("schemaname", currentSchema["name"]);
			element.setAttribute("schemadesc", currentSchema["desc"]);
			element.setAttribute("dtd", webannotator.dtdFileName);
		}
	},

	/**
	 * Import a DTD file describing an annotation schema
	 */
	importFile: function () {
		// if an annotation session has already started
		// refuse
		if (webannotator.session) {
			webannotator.main.locale_alert("waCantImportNewSchema");
		}
		else {
			// File selection
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fileChooser = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fileChooser.init(window, webannotator.bundle.GetStringFromName("waImportSelection"), nsIFilePicker.modeOpen);
			fileChooser.appendFilter(webannotator.bundle.GetStringFromName("waImportDTDFiles"),"*.dtd; *.DTD");    
			var res = fileChooser.show();
			if (res == nsIFilePicker.returnOK){		
				var file = fileChooser.file;
				var label = file.leafName;
				
				var error = webannotator.main.readDTDFile(file);		
				
				var str;
				
				if(error <= 0) {
					var i = 0;
					var j;
					var flag = -1;
					
					for(i =0; i < webannotator.schemas.length ; i++){
						if(webannotator.schemas[i]["filename"] == label){
							flag = i;
							break;
						}		
					}
					
					var ok = true;
					if(flag >= 0) {
						ok = confirm(webannotator.bundle.GetStringFromName("waDuplicateImportConfirm1") + " " + label + " " + webannotator.bundle.GetStringFromName("waDuplicateImportConfirm2"));
					} 
					if (ok) {
						var oldDTDFileName = webannotator.dtdFileName;
						webannotator.dtdFileName = file.leafName;
						var newSchema;
						for (j=0; j < webannotator.schemas.length ; j++){
							webannotator.schemas[j]["lastused"] == "0";
						}
						// replace
						if (flag >= 0) {
							newSchema = webannotator.schemas[i];
							newSchema["filename"] = webannotator.dtdFileName;
							newSchema["name"] = file.leafName;
							newSchema["lastused"] = "1";
							webannotator.currentSchemaId = i;
							if (typeof(webannotator.colors) != 'undefined' && webannotator.colors[webannotator.dtdFileName]) {
								delete webannotator.colors[webannotator.dtdFileName];
							}
						} 
						// new
						else {
							newSchema = {};
							newSchema["filename"] = webannotator.dtdFileName;
							newSchema["name"] = file.leafName;
							newSchema["lastused"] = "1";
							webannotator.schemas.push(newSchema);
							webannotator.currentSchemaId = webannotator.schemas.length - 1;
						}
						webannotator.main.createJSON();
						webannotator.main.createCSS();
						webannotator.main.writeSchemasFile();
						webannotator.main.updateMenus(true, true);
						// If no session has not begun yet
						// propose to begin one
						if (!webannotator.session) {
							ok = confirm(webannotator.bundle.GetStringFromName("waDTDLoadedConfirm"));
							webannotator.main.activate();
							webannotator.main.options();
							if (!ok) {
								webannotator.main.deactivate();
							}

						}
						// if a session has already begun
						// just confirm
						else {
							webannotator.dtdFileName = oldDTDFileName;
							webannotator.main.locale_alert("waDTDLoaded");
						}
					}
				}
				else {
					alert("The format of the file " + file.leafName + " is not good!");
				}
			}
		}
	},


	/**
	 * Export the current annotated page ("export" is different from "save")
	 */
	exportFile: function (fileName) {
		var clone = window.content.document.cloneNode();
//		var del = [];
		var spansStartArray = [];
		var spansEndArray = [];
		var spansMiddleArray = [];
		var idArray = [];
		var i;
		var id;

		// Delete WA communication element in HTML page
		var element = clone.getElementById("WA_data_element");
		element.parentNode.removeChild(element);

		// Remove <wa-color>
		var colors = clone.getElementsByTagName("wa-color");
		for(i = 0; i < colors.length ; i++){
			colors[i].parentNode.removeChild(colors[i]);
		}

		clone.body.setAttribute("onbeforeunload", "");

		// Replace <span>
		var spans = clone.getElementsByTagName("span");
		// Find all WA-specific <span> tags
		for(i = 0; i < spans.length ; i++){
			if (spans[i].hasAttributes() && (spans[i].getAttribute("WA-id") !== null)) {
				var spansStart = spans[i];
				var spansEnd = spans[i];
				// Find the annotation id for this span
				id = spans[i].getAttribute("WA-id");
				var idExist = false;
				
				var j;
				// Find if this is the first span for this annotation id
				for(j = 0; j < idArray.length ; j++){
					if (idArray[j] == id) {
						idExist = true;
					}
				}
				// If this is the first span for this annotation id
				// add a start tag and find the last span to put the end tag
				if(!idExist) {
					idArray.push(id);
					for(j = i+1; j < spans.length ; j++){
						if(spans[j].hasAttributes() && spans[j].getAttribute("WA-id") !== null && spans[j].getAttribute("WA-id") == id) {
							if(spansEnd != spansStart){
								spansMiddleArray.push(spansEnd);
							}
							spansEnd = spans[j];
						}
					}
					spansStartArray.push(spansStart);
					spansEndArray.push(spansEnd);
				}
			}
		}
		
		// Insert start tags
		for(i = 0; i < spansStartArray.length ; i++) {
			id = spansStartArray[i].getAttribute("WA-id");
			var typeText = spansStartArray[i].getAttribute("wa-type");
			var subtypesText = spansStartArray[i].getAttribute("wa-subtypes");
			var waNode_start = webannotator.misc.jsonToDOM(["WA_Start", {"WA-id":id, type:typeText, subtypes:subtypesText}, ""], 
											clone);
			spansStartArray[i].parentNode.insertBefore(waNode_start,spansStartArray[i]);
		}
		// Insert end tags
		for(i = 0; i < spansEndArray.length ; i++) {
			id = spansEndArray[i].getAttribute("WA-id");
			var waNode_End = webannotator.misc.jsonToDOM(["WA_End", {"WA-id":id}, ""], 
										  clone);
			spansEndArray[i].parentNode.insertBefore(waNode_End, spansEndArray[i].nextSibling);
		}
		var haveSpanWA = true;
		// Remove all <span> tags (those were only for human reading, no need
		// in export mode)
		while(haveSpanWA) {
			haveSpanWA = false;
			spans = clone.getElementsByTagName("span");
			for(i = 0; i < spans.length ; i++)	{
				var span = spans[i];
				if (span.hasAttributes() && span.getAttribute("WA-id") !== null) {
					var parent = span.parentNode;

					// Copy content of span tag and put it before the span tag
					// then delete the span tag.
					// The span tag does not have any element inside, except other
					// WE-related spans.
					var span_children = span.childNodes;
					if (span_children.length > 0) {
						for (var span_child_index = 0 ; span_child_index < span_children.length ; span_child_index++) {
							span_child = span_children[span_child_index];
							parent.insertBefore(span_child.cloneNode(true),
												span);
						}
						parent.removeChild(span);
					}
					haveSpanWA = true;
					i = spans.length;
				}
			}
		}
		// Save the page
		webannotator.main.save(clone, fileName, null);
	},

	/**
	 * Show preferences/options menu
	 */
	options: function () {
		// Keep DTD file name
		var element = window.content.document.getElementById("WA_data_element");
		element.setAttribute("dtd", webannotator.dtdFileName);
		window.showModalDialog("chrome://webannotator/content/options.xul",1); 
	},


	/**
	 * Create a CSS file according to the sections of current DTD file
	 */
	createCSS: function (){
		var file = webannotator.main.getPathEx();
		file.append(webannotator.dtdFileName + ".css");
		// if file does not exist, create it
		if (file.exists()) {
			file.remove(false);
		}
		file.create(file.NORMAL_FILE_TYPE, 0666);
		try {
			// write data to file then close output stream
			var content = "";
			
			var i = 0;
			var n;
			var _local_colors = {};
			for (n in webannotator.elements[webannotator.dtdFileName]) {
				var twoColors = webannotator.htmlWA.getColor(webannotator.dtdFileName, n, i);
				_local_colors[n] = twoColors;
				var colorId1 = twoColors[0];
				var colorId2 = twoColors[1];
				content += ".WebAnnotator_"+ n +" {color: " + colorId1 +"; background-color: " + colorId2 +"; }\n";
				i++;
			}
			if (!webannotator.colors[webannotator.dtdFileName]) {
				webannotator.colors[webannotator.dtdFileName] = _local_colors;
			}
			
			var ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
			ostream.write(content, content.length);
			ostream.close();
		}
		catch (ex) {
			alert("ERROR: Failed to write file: " + file.path);
		}
	},


	/**
	 * Create a JS file according to the sections of current DTD file
	 */
	createJSON: function (){	
		var file;
		var jsonElements;
		var ostream;
		try {
			// Save elements
			file = webannotator.main.getPathEx();
			file.append(webannotator.schemasFileName);

			if (file.exists()) {
				file.remove(false);
			}
			file.create(file.NORMAL_FILE_TYPE, 0666);
		
			jsonElements = JSON.stringify(webannotator.elements);  

			ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
			ostream.write(jsonElements, jsonElements.length);
			ostream.close();

			// Save element constraints
			file = webannotator.main.getPathEx();
			file.append(webannotator.schemaConstraintsFileName);
		
			if (file.exists()) {
				file.remove(false);
			}
			file.create(file.NORMAL_FILE_TYPE, 0666);
			jsonElements = JSON.stringify(webannotator.elementConstraints);  
			ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
			ostream.write(jsonElements, jsonElements.length);
			ostream.close();

			// Save element colors
			file = webannotator.main.getPathEx();
			file.append(webannotator.schemaColorsFileName);
		
			if (file.exists()) {
				file.remove(false);
			}
			file.create(file.NORMAL_FILE_TYPE, 0666);
			jsonElements = JSON.stringify(webannotator.colors);  
			ostream = Components.classes["@mozilla.org/network/file-output-stream;1"].
				createInstance(Components.interfaces.nsIFileOutputStream);
			ostream.init(file, 2, 0x200, false);
			ostream.write(jsonElements, jsonElements.length);
			ostream.close();
		}
		catch (ex) {
			alert("ERROR: Failed to write file: " + file.path);
		}
	},

	/**
	 * Add a new annotation in the table of bottom panel
	 */
	receiveNewAnnotation: function (id, name, text, subtypes) {
		webannotator.annotationNames[id] = name;
		webannotator.annotationTexts[id] = text;
		webannotator.annotationAttributes[id] = subtypes;
		var selectedIds = [];
		var annotationId;
		for (annotationId in webannotator.annotationNames) {
			selectedIds.push(annotationId);
		}
		webannotator.main.updateTable(selectedIds, true);
		webannotator.main.setModified(true);
	},

	/**
	 * Update an existing annotation in the table of bottom panel
	 */
	receiveEditAnnotation: function (id, name, subtypes) {
		webannotator.annotationNames[id] = name;
		webannotator.annotationAttributes[id] = subtypes;
		var selectedIds = [];
		var annotationId;
		for (annotationId in webannotator.annotationNames) {
			selectedIds.push(annotationId);
		}
		webannotator.main.updateTable(selectedIds, true);
		webannotator.main.setModified(true);
	},

	/**
	 * Show only the specified annotation in the table of bottom panel
	 */
	receiveSelectAnnotation: function (id) {
		var selectedIds = [];
		selectedIds.push(id);
		webannotator.main.updateTable(selectedIds, true);
	},

	/**
	 * Show all annotations in the table of bottom panel
	 */
	receiveShowAnnotations: function () {
		var selectedIds = [];
		var annotationId;
		for (annotationId in webannotator.annotationNames) {
			selectedIds.push(annotationId);
		}
		webannotator.main.updateTable(selectedIds, true);
	},

	/**
	 * Remove an annotation in the table of bottom panel
	 */
	receiveDeleteAnnotation: function () {
		var xulTable = document.getElementById("WebAnnotator_tablecontent");
		var id = webannotator.htmlWA.getIdToEdit();

		// Display the dialogue to confirm whether delete or not
		var r = confirm(webannotator.bundle.GetStringFromName("waDeleteAnnotationConfirm") + id + "?");
		
		// Confirm to delete
		if (r == true) {
			delete webannotator.annotationNames[id];
			delete webannotator.annotationTexts[id];
			delete webannotator.annotationAttributes[id];	
			webannotator.main.deleteIdWebAnnotator(id);
		}
		webannotator.main.receiveShowAnnotations();
	},

	/**
	 * Update schema files and options when preferences are modified
	 */
	receiveOptionsSet: function () {	
		var eventElement = window.content.document.getElementById("WA_data_element");
		// Get DTD file name
		var dtd = eventElement.getAttribute("dtd");
		var name = eventElement.getAttribute("schemaname");
		var desc = eventElement.getAttribute("schemadesc");

		var colorElements = window.content.document.getElementsByTagName("WA-color");

		var i = 0;
		var n;
		for (n in webannotator.elements[dtd]) {
			var child = colorElements[i];
			var fgColor = child.getAttribute("fg");
			var bgColor = child.getAttribute("bg");
			webannotator.htmlWA.setColor(dtd, n, fgColor, bgColor);
			i++;
		}
		for(i = 0; i < webannotator.schemas.length ;i++){
			var schema = webannotator.schemas[i];
			if (schema["filename"] == dtd) {
				schema["name"] = name;
				schema["desc"] = desc;
				webannotator.schemas[i] = schema;
			}
		}
		webannotator.main.createCSS();
		webannotator.main.createJSON();
		webannotator.main.writeSchemasFile();

		webannotator.main.updateMenus(true, true);

		// Does not work if not adding a link before the following one !!??
		var head = window.content.document.getElementsByTagName("head")[0];
		//	var link = content.document.createElement("link");

		var link = webannotator.misc.jsonToDOM(["link", {}, ""], content.document);
		head.appendChild(link);

		var link2 = webannotator.misc.jsonToDOM(["link", {type:"text/css",
										   rel:"stylesheet",
										   href:"chrome://webannotator/content/schemas/"+ webannotator.dtdFileName + ".css"}, 
								  ""], content.document);
		head.appendChild(link2);
		webannotator.main.setSpanColorStyle(window.content.document, true);
		webannotator.main.initVarMenu(dtd);
	},
	
	/**
	 * Start save and export operation when validated
	 * by the XUL dialog box.
	 */
	receiveSaveAndExport: function () {
		var eventElement = content.document.getElementById('WA_data_element'); 
		var saveFileName = eventElement.getAttribute("save");
		var urisDirName = eventElement.getAttribute("exportDir");
		var keepColors = eventElement.getAttribute("keepColors");
		var activateLinks = eventElement.getAttribute("activateLinks");
		var exportFileName = eventElement.getAttribute("export");
		var quitAfterSave = eventElement.getAttribute("quitAfterSave");

		// Export page
		if (exportFileName !== null && exportFileName != "") {
			webannotator.main.exportFile(exportFileName);
		} 

		var saveClone = content.document.cloneNode();

		// Activate links
		if (activateLinks == "true") {
			webannotator.htmlWA.receiveWindowSwitchLinks(saveClone, true, true);
		} else {
			webannotator.htmlWA.receiveWindowSwitchLinks(saveClone, true, false);
		}
		
		// Activate colors
		webannotator.main.setSpanColorStyle(saveClone, (keepColors == "true"));

		// Delete WA communication element in HTML page
		var element = saveClone.getElementById("WA_data_element");
		element.parentNode.removeChild(element);

		// Delete popup elements
		element = saveClone.getElementById("webannotator-main-menu");
		element.parentNode.removeChild(element);
		element = saveClone.getElementById("webannotator-sec-menu");
		element.parentNode.removeChild(element);
		element = saveClone.getElementById("webannotator-edit-menu");
		element.parentNode.removeChild(element);

		saveClone.body.setAttribute("onbeforeunload", "");

		// Delete WA-specific scripts
		var head = saveClone.getElementsByTagName("head")[0];	
		var toDelete = [];
		var headChild;
		for (headChild in head.childNodes) {
			var child = head.childNodes[headChild];
			// javascripts
			if (child.nodeType == 1 && child.getAttribute("src") !== null) {
				if (child.getAttribute("src").substr(0, webannotator.contentPath.length) == webannotator.contentPath) {
					toDelete.push(child);
				}
			}
			// specific CSS
			if (child.nodeType == 1 && child.getAttribute("href") !== null) {
				if (child.getAttribute("href") == webannotator.contentPath + "schemas/"+ webannotator.dtdFileName + ".css") {
					toDelete.push(child);
				}
			}
			
		}
		var elemToDelete;
		for (elemToDelete in toDelete) {
			toDelete[elemToDelete].parentNode.removeChild(toDelete[elemToDelete]);
		}

		// Save current page
		webannotator.main.save(saveClone, saveFileName, urisDirName)
		webannotator.main.setModified(false);

		if (quitAfterSave == "true") {
			webannotator.main.deactivate();
		}
	},

	// /**
	//  * End of save & export operations
	//  */
	// endSave: function (saveFileName, exportFileName) {
	// 	if (!webannotator.saveDone) {
	// 		// Export page
	// 		if (exportFileName !== null && exportFileName != "") {
	// 			webannotator.main.exportFile(exportFileName);
	// 		} 
			
	// 		// Reload the saved file
	// 		webannotator.main.setModified(false);
	// 		webannotator.main.deactivate();

	// 		window.content.location = "file://" + saveFileName;
			
	// 		webannotator.main.locale_alert("waSavedOk");	
	// 		webannotator.main.chooseFile(webannotator.currentSchemaId, false);
	// 		webannotator.saveDone = true;
	// 	}
	// },

	/**
	 * Build annotations from WA spans in loaded document
	 */
	buildAnnotations: function () {
		var spans = window.content.document.getElementsByTagName("span");
		var id;
		var subtypes;
		var type;
		webannotator.maxId=0;

		var i;
		for(i = 0; i < spans.length ; i++){
			if (spans[i].hasAttributes() && spans[i].getAttribute("WA-id") !== null) {
				var span = spans[i];
				id = span.getAttribute("WA-id");
				webannotator.maxId=Math.max(parseInt(id), webannotator.maxId);
				subtypes = span.getAttribute("wa-subtypes");
				type = span.getAttribute("wa-type");
				
				// Add style information if exists
				var color = webannotator.htmlWA.getColor(webannotator.dtdFileName, type, -2);
				if (color !== null) {
					span.setAttribute("style", "color:" + color[0] + "; background-color:" + color[1] + ";");
				}
				
				// add event listener for showing and hiding 
				// edit menus
				span.addEventListener("mouseover", webannotator.main.showEdit);
				span.addEventListener("mouseout", webannotator.main.hideEdit);

				webannotator.annotationNames[id] = type;
				// getting text contained by annotations
				if(typeof(webannotator.annotationTexts[id]) == 'undefined') {
					webannotator.annotationTexts[id] = webannotator.main.getDeepText(span);
				} else {
					webannotator.annotationTexts[id] += webannotator.main.getDeepText(span);
				} 
				webannotator.annotationAttributes[id] = subtypes;
			}
		}
	},

	/**
	 * Get text contained by an element, by recursively 
	 * exploring child elements if any.
	 */
	getDeepText: function (elem) {
		var children = elem.childNodes;
		var text = "";
		for (var i = 0 ; i < children.length ; i++) {
			var child = children[i];
			if (child.nodeName == "#text") {
				text += child.nodeValue;
			} else {
				text += webannotator.main.getDeepText(child);
			}
		}
		return text;
	},


	/**
	 * Modify text in switch links button
	 */
	receiveSwitchLinks: function (status) {
		var button = document.getElementById("WebAnnotator_linkButton");
		if (status == "enable") {
			button.label = webannotator.bundle.GetStringFromName("waDisableLinks");
		} else if (status == "disable") {
			button.label = webannotator.bundle.GetStringFromName("waActivateLinks");
		}
	},


	/**
	 * Show or hide bottom panel
	 */
	switchPanel: function () {
		if (webannotator.panelOn) {
			webannotator.main.showWAPanel(false);
			webannotator.panelOn = false;
			document.getElementById("WebAnnotator_panelButton").label = webannotator.bundle.GetStringFromName("waShowPanel");
		} else {
			webannotator.main.showWAPanel(true);
			webannotator.panelOn = true;		
			document.getElementById("WebAnnotator_panelButton").label = webannotator.bundle.GetStringFromName("waHidePanel");
		}
	},


	/**
	 * Update table from bottom panel by showing specified
	 * annotation ids
	 */
	updateTable: function (selectedIds, updateList) {
		var xulTable = document.getElementById("WebAnnotator_tablecontent");
		// Remove all children
		while(xulTable.hasChildNodes()) {
			xulTable.removeChild(xulTable.firstChild);
		}
		// Annotation types, for menulist selection
		var types = [];
		types.push(webannotator.bundle.GetStringFromName("waAll"));
		// Put them back
		var annotationId;
		for (annotationId in selectedIds) {
			var treeitem = document.createElement("treeitem");
			var treerow = document.createElement("treerow");
			var treecell_suppr = document.createElement("treecell");
			treecell_suppr.setAttribute("src", "chrome://webannotator/skin/suppr.png");
			treerow.appendChild(treecell_suppr);
			var treecell_edit = document.createElement("treecell");
			treecell_edit.setAttribute("src", "chrome://webannotator/skin/edit.png");
			treerow.appendChild(treecell_edit);
			var treecell_id = document.createElement("treecell");
			treecell_id.setAttribute("label", selectedIds[annotationId]);
			treerow.appendChild(treecell_id);
			var treecell_name = document.createElement("treecell");
			var sectionName = webannotator.annotationNames[selectedIds[annotationId]];
			treecell_name.setAttribute("label", sectionName);
			treerow.appendChild(treecell_name);
			// Add to type list
			if (types.indexOf(sectionName) < 0) {
				types.push(sectionName);
			}
			var treecell_att = document.createElement("treecell");
			treecell_att.setAttribute("label", webannotator.annotationAttributes[selectedIds[annotationId]]);
			treerow.appendChild(treecell_att);
			var treecell_text = document.createElement("treecell");
			treecell_text.setAttribute("label", webannotator.annotationTexts[selectedIds[annotationId]]);
			treerow.appendChild(treecell_text);
			treerow.setAttribute('properties', 'statusredmoz');
			treeitem.appendChild(treerow);
			xulTable.appendChild(treeitem);
		}
		if (updateList) {
			// Add annotation types to menulist
			var menulist = document.getElementById("WebAnnotator_annotation_list");
			var menupopup = menulist.firstChild;
			// Remove all children
			while(menupopup.hasChildNodes()) {
				menupopup.removeChild(menupopup.firstChild);
			}
			// Add types
			var i;
			for (i=0; i < types.length; i++) {
				var item = document.createElement("menuitem");

				item.setAttribute("label", types[i]);
				item.setAttribute("value", i);
				menupopup.appendChild(item);
				if (i == 0) {
					menulist.selectedItem = item;
				}

			}
		}
	},

	/**
	 * Selection of annotation types in table from bottom panel
	 */
	selectMenuList: function (list) {
		if (list.firstChild.children.length > 1) {
			var type = list.selectedItem.label;
			var value = list.selectedItem.value;
			var selectedIds = [];
			var annotationId;
			// "All"
			if (value == 0) {
				for (annotationId in webannotator.annotationNames) {
					selectedIds.push(annotationId);
				}
			}
			// an annotation type
			else {
				for (annotationId in webannotator.annotationNames) {
					if (webannotator.annotationNames[annotationId] == type) {
						selectedIds.push(annotationId);
					}
				}			
			}
			webannotator.main.updateTable(selectedIds, false);
		}
	},

	/**
	 * When a row in the table from bottom panel is selected
	 */
	selectTree: function (tree) {
		var start = {};
		var end = {};
		var numRanges = tree.view.selection.getRangeCount();

		// remove all blinking elements
		webannotator.htmlWA.receiveWindowUnblinkAnnotation();

		var t;
		var v;
		for (t = 0; t < numRanges; t++){
			tree.view.selection.getRangeAt(t,start,end);
			for (v = start.value; v <= end.value; v++){
				var id = tree.view.getCellText(v, tree.columns.getColumnAt(2));
				// in any case, make the annotation blink
				webannotator.htmlWA.receiveWindowBlinkAnnotation(id, true);
			}
		}
	},


	/**
	 * When the table from bottom panel is clicked
	 */
	clickTree: function (tree, event) {
		var row = {}, column = {}, part = {};
		var boxobject = tree.boxObject;
		boxobject.QueryInterface(Components.interfaces.nsITreeBoxObject);
		boxobject.getCellAt(event.clientX, event.clientY, row, column, part);
		// remove all blinking elements
		webannotator.htmlWA.receiveWindowUnblinkAnnotation();

		// if click on list (and not on headers)
		if (column.value !== null) {
			var id = tree.view.getCellText(row.value, tree.columns.getColumnAt(2));
			// in any case, make the annotation blink
			webannotator.htmlWA.receiveWindowBlinkAnnotation(id, true);

			// Remove button
			if (column.value["id"] == "WebAnnotator_remove") {

				// Display the dialogue to confirm whether delete or not
				var r = confirm(webannotator.bundle.GetStringFromName("waDeleteAnnotationConfirm") + id + "?");
				
				//Confirm to delete
				if (r == true) {
					delete webannotator.annotationNames[id];
					delete webannotator.annotationTexts[id];
					delete webannotator.annotationAttributes[id];
					webannotator.main.deleteIdWebAnnotator(id);
				}
				webannotator.main.receiveShowAnnotations(event);
			} 
			// Edit button
			else if (column.value["id"] == "WebAnnotator_edit") {
				webannotator.htmlWA.setIdToEdit(id);
				webannotator.htmlWA.receiveWindowEditAnnotation(event);
			}
		}
	},

	/**
	 * Show the delete/edit small popup 
	 */
	showEdit: function (e) {
		webannotator.htmlWA.showEditAnnotationMenu(e, this.getAttribute('WA-id'));
	},

	/**
	 * Hide the delete/edit small popup 
	 */
	hideEdit: function (e) {
		webannotator.htmlWA.hideEditAnnotationMenu();
	},

	/** 
	 * Delete tag of underlined text with WA-id : id 
	 */
	deleteIdWebAnnotator: function (id) {
		var htmlDocument = content.document;
		var spans = htmlDocument.getElementsByTagName("span");
		var i;
		for(i = spans.length -1; i >= 0 ; i--) {
			if(spans[i].getAttribute("WA-id") == id) {
				spans[i].removeAttribute("class");
				spans[i].removeAttribute("WA-id");
				spans[i].removeAttribute("WA-type");
				spans[i].removeAttribute("id");
				spans[i].removeAttribute("wa-subtypes");
				spans[i].removeEventListener("mouseover", webannotator.main.showEdit);
				spans[i].removeEventListener("mouseout", webannotator.main.hideEdit);

				spans[i].removeAttribute("style");
			}
		}
	},


	/**
	 * Save function (save is different from export)
	 */
	save: function (doc, dest, urisDir) {
		try {
			// create component for file writing
			var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsIFile);
			file.initWithPath(dest);
			// if file does not exist, create it
			if (file.exists()) {
				file.remove(false);
			}
			file.create(file.NORMAL_FILE_TYPE, 0666);

			// create component for dir writing
			var dir = null;
			if (urisDir !== null && urisDir != "") {	
				dir = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsIFile);
				dir.initWithPath(urisDir);
				// if dir does not exist, create it
				if (!dir.exists()) {
					dir.create(dir.DIRECTORY_TYPE, 0700);
				}
			}

//			var persistListener = new webannotator.main.PersistProgressListener();
			var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
				.createInstance(Components.interfaces.nsIWebBrowserPersist);
			
			persist.persistFlags = persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
//			persistListener.saveFileName = dest;
//			if (exportFileName !== null) {
//				exportFileName = exportFileName.replace(/\\/g,"\\\\");
//			}
//			persistListener.exportFileName = exportFileName;
//			persist.progressListener = persistListener;
//			webannotator.saveDone = false;
//			var cleanDest = dest.replace(/\\/g,"\\\\");
//			webannotator.endSaveEvent = setTimeout(function() {webannotator.main.endSave(cleanDest, exportFileName)}, 1000);
//			persist.saveDocument(doc, file, dir, null, persist.ENCODE_FLAGS_RAW, null);
			persist.saveDocument(doc, file, dir, null, persist.ENCODE_FLAGS_RAW | persist.ENCODE_FLAGS_ENCODE_BASIC_ENTITIES, null);
		}
		catch(e) {
			alert("Exception in save function: " + e);
		}
	},

	locale_alert: function (messageId) {
		alert(webannotator.bundle.GetStringFromName(messageId));
	},

};


// Set extension file path and read annotation schemas file
document.onLoad = webannotator.main.setPathEX();

