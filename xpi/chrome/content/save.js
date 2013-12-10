// See license.txt for terms of usage

// namespace. 
if (typeof webannotator == "undefined") {  
	var webannotator = {};  
};  

webannotator.savefilemodified=false;
webannotator.exportfilemodified=false;

webannotator.save = {
	selection: function(id, dir) {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
		if (dir == false) {
			fp.init(window, webannotator.bundle.GetStringFromName("waSelectAFile"), nsIFilePicker.modeSave);
			fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
		} else {
			fp.init(window, webannotator.bundle.GetStringFromName("waSelectADic"), nsIFilePicker.modeGetFolder);
		}
		if (fp.show() == nsIFilePicker.returnCancel) {
			return;
		}
		var filePath = fp.file.path;
		document.getElementById(id).value = filePath;

		// update dir name if empty and if checkbox checked
		if (id == 'saveFileName') {
			var dirTextField = document.getElementById('linkedDirName');
			if (dirTextField.value == "" && 
				document.getElementById("save_cb").checked) {
				dirTextField.value = filePath + "_files";
			}
			// save file is modified
			webannotator.savefilemodified=true;
		}
		else if (id == 'exportFileName') {
			// export file is modified
			webannotator.exportfilemodified=true;
		}
	},

	validation: function () {
		var saveFileName = document.getElementById('saveFileName').value;
		var exportFileName = document.getElementById('exportFileName').value;
		// Save file name is required
		if (!saveFileName || saveFileName == "") {
			alert(webannotator.bundle.GetStringFromName("waSaveFileRequired"));
			return false;
		}

		// Save and export file names must be different
		if (saveFileName == exportFileName) {
			alert(webannotator.bundle.GetStringFromName("waSaveFilesDifferent"));
			return false;
		}

		// If save and/or file have not been modified, confirm
		// that they should be replaced
		if (!webannotator.savefilemodified) {
			if (!webannotator.exportfilemodified && exportFileName && exportFileName != "") {
				if (!confirm(webannotator.bundle.GetStringFromName("waSaveAndExportFileReplace"))) {
					return false;
				}
			}
			else if (!confirm(webannotator.bundle.GetStringFromName("waSaveFileReplace"))) {
				return false;
			}
		}
		else if (!webannotator.exportfilemodified && exportFileName && exportFileName != "") {
			if (!confirm(webannotator.bundle.GetStringFromName("waExportFileReplace"))) {
				return false;
			}
		}

		// Keep check box information in preferences
		var saveColors = document.getElementById("color_cb").checked;
		var activateLinks = document.getElementById("links_cb").checked;
		var urisToSave = document.getElementById("save_cb").checked;
		var quitAfterSave = document.getElementById("quit_cb").checked;

		webannotator.prefs.setBoolPref("extensions.webannotator.savecolors", saveColors);
		webannotator.prefs.setBoolPref("extensions.webannotator.activatelinks", activateLinks);
		webannotator.prefs.setBoolPref("extensions.webannotator.urisToSave", urisToSave);
		webannotator.prefs.setBoolPref("extensions.webannotator.quitAfterSave", quitAfterSave);

		// OK
		// first, save in the local file
		var saveFileName = document.getElementById('saveFileName').value;
		var exportFileName = document.getElementById('exportFileName').value;
		var exportDirName = document.getElementById('linkedDirName').value;
		var eventElement = window.opener.content.document.getElementById('WA_data_element'); 
		eventElement.setAttribute('save', saveFileName); 
		eventElement.setAttribute('export', exportFileName); 
		eventElement.setAttribute('exportDir', exportDirName); 
		eventElement.setAttribute('keepColors', saveColors); 
		eventElement.setAttribute('activateLinks', activateLinks); 
		eventElement.setAttribute('quitAfterSave', quitAfterSave); 

		webannotator.prefs.setCharPref("extensions.webannotator.lastsavefile", saveFileName);
		webannotator.prefs.setCharPref("extensions.webannotator.lastexportfile", exportFileName);
		webannotator.prefs.setCharPref("extensions.webannotator.lastsavedir", exportDirName);
 
		var evt = window.opener.content.document.createEvent('Events'); 
		evt.initEvent('webannotator.saveAndExport', true, true); 
		eventElement.dispatchEvent(evt);
		return true;
	},

	// on command for linked URIs checkbox 
	checkDir: function (checkBox) {
		// enable/disable fields
		var desc1 = document.getElementById("descDir1");
		var desc2 = document.getElementById("descDir2");
		var dirTextField = document.getElementById("linkedDirName");
		var dirButton = document.getElementById("linkedDirButton");

		if (checkBox.checked) {
			// Enable all fields
			desc1.disabled = false;    
			desc2.disabled = false;    
			dirTextField.disabled = false;    
			dirButton.disabled = false;
			// Suggest a dir name
			if (dirTextField.value == null || dirTextField.value == "") {
				var saveFileName = document.getElementById('saveFileName').value;
				if (saveFileName != null && saveFileName != "") {
					dirTextField.value = saveFileName + "_files";
				}
			}
		} else {
			// Disable all fields
			desc1.disabled = true;    
			desc2.disabled = true;    
			dirTextField.disabled = true;    
			dirButton.disabled = true;    
		}
	},

	// Pre-sets check boxes and file names with preferences information
	loadDefaults: function () {
		// Set fields as not modified
		webannotator.savefilemodified = false;
		webannotator.exportfilemodified = false;

		// Check boxes information come from preferences
		var saveColors = false;
		var activateLinks = true;
		var urisToSave = false;
		var quitAfterSave = false;
		try {
			saveColors = webannotator.prefs.getBoolPref("extensions.webannotator.savecolors");
			activateLinks = webannotator.prefs.getBoolPref("extensions.webannotator.activatelinks");
			urisToSave = webannotator.prefs.getBoolPref("extensions.webannotator.urisToSave");
			quitAfterSave = webannotator.prefs.getBoolPref("extensions.webannotator.quitAfterSave");
		} catch(ex) {
		}
		document.getElementById("color_cb").checked = saveColors;
		document.getElementById("links_cb").checked = activateLinks;
		document.getElementById("quit_cb").checked = quitAfterSave;
		var saveCB = document.getElementById("save_cb");
		saveCB.checked = urisToSave;

		// File names come from last file names
		var eventElement = window.opener.content.document.getElementById('WA_data_element'); 
		var saveFileName = null;
		var exportDirName = null;
		var exportFileName = null; 
		try {
			saveFileName = webannotator.prefs.getCharPref("extensions.webannotator.lastsavefile");  
			exportDirName = webannotator.prefs.getCharPref("extensions.webannotator.lastsavedir");
			exportFileName = webannotator.prefs.getCharPref("extensions.webannotator.lastexportfile");
		} catch(ex) {
		}

		if (saveFileName != null) {
			document.getElementById('saveFileName').value = saveFileName;
			if (exportFileName != null) {
				document.getElementById('exportFileName').value = exportFileName;
			}
			if (exportDirName != null) {
				document.getElementById('linkedDirName').value = exportDirName;
			}
		}
		webannotator.save.checkDir(saveCB);
	}
};