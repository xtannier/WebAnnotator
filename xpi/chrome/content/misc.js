// See license.txt for terms of usage

// namespace
if (typeof webannotator == "undefined") {  
	var webannotator = {};  
};  

// Next function is provided by Mozilla to builb safe DOM from XML
webannotator.namespaces = {  
    html: "http://www.w3.org/1999/xhtml",  
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"  
};  

webannotator.defaultNamespace = webannotator.namespaces.html;  

webannotator.misc = {

	jsonToDOM:function(xml, doc, nodes) {  
		function _namespace(name) {  
			var m = /^(?:(.*):)?(.*)$/.exec(name);  
			return [webannotator.namespaces[m[1]], m[2]];  
		}  
		
		function _tag(name, attr) {  
			if (webannotator.misc.isArray(name)) {  
				var frag = doc.createDocumentFragment();  
				Array.forEach(arguments, function (arg) {  
					if (!webannotator.misc.isArray(arg[0]))  
						frag.appendChild(_tag.apply(null, arg));  
					else  
						arg.forEach(function (arg) {  
							frag.appendChild(_tag.apply(null, name[i]));  
						});  
				});  
				return frag;  
			}  
			
			var args = Array.slice(arguments, 2);  
			var vals = _namespace(name);  
			var elem = doc.createElementNS(webannotator.defaultNamespace,  
										   vals[1]);  
			
			for (var key in attr) {  
				var val = attr[key];  
				if (nodes && key == "key")  
					nodes[val] = elem;  
				
				vals = _namespace(key);  
				if (typeof val == "function")  
					elem.addEventListener(key.replace(/^on/, ""), val, false);  
				else  {
					elem.setAttribute(vals[1], val);  
				}
			}  
			args.forEach(function(e) {  
				elem.appendChild(typeof e == "object" ? _tag.apply(null, e) :  
								 e instanceof Node    ? e : doc.createTextNode(e));  
			});  
			return elem;  
		}
		return _tag.apply(null, xml);  
	},

	//chk if an object is an array or not.
	isArray:function(obj) {
		//returns true is it is an array
		if (obj.constructor.toString().indexOf("Array") == -1)
			return false;
		else
			return true;
	},

	escapeHTML: function (str) {
		str.replace(/[&"<>]/g, function (m) "&" + ({ "&": "amp", '"': "quot", "<": "lt", ">": "gt" })[m] + ";");
	}
};

