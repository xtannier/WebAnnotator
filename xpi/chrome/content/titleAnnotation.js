// See license.txt for terms of usage

// namespace.
if (typeof webannotator == "undefined") {
    var webannotator = {};
}

webannotator.titleAnnotation = {
    on: false,

    togglePopup: function(){
        if (!webannotator.titleAnnotation.on){
            webannotator.titleAnnotation.showPopup();
        }
        else{
            webannotator.titleAnnotation.hidePopup();
        }
    },

    showPopup: function(){
        var popup = webannotator.titleAnnotation.getPopup();
        if (popup){
            popup.style.display = 'block';
            webannotator.titleAnnotation.activateToolbarButton();
        }
        webannotator.titleAnnotation.on = true;
    },

    hidePopup: function(){
        var popup = webannotator.titleAnnotation.getPopup();
        if (popup){
            popup.style.display = 'none';
        }
        webannotator.titleAnnotation.deactivateToolbarButton();
        webannotator.titleAnnotation.on = false;
    },

    getPopup: function(doc){
        doc = doc || content.document;

        var titlePopup = doc.getElementById("webannotator-title-edit-popup");
        if (titlePopup){ // already created
            return titlePopup;
        }

        var title = doc.getElementsByTagName('WA-title')[0];
        var waTitle = true;
        if (!title){
            waTitle = false;
            title = doc.getElementsByTagName('title')[0];
            if (!title){
                return;
            }
        }

        // There is no "close" element intentionally (to prevent users
        // from annotating it). Use toolbar button to toggle the popup.
        titlePopup = webannotator.misc.jsonToDOM([
            "div", {
                id: "webannotator-title-edit-popup",
                style: "font-family:arial;z-index:11000;position:fixed;color:#333;background:#fff;margin:0 auto;width:30%;left:0;right:0;top:10px;box-shadow:0 0 1em black;border:2px solid blue;padding:0.5em;display:none;"
            }, ""
        ], doc);

        if (waTitle){
            while(title.firstChild){
                titlePopup.appendChild(title.firstChild);
            }
            // remove all WA-title elements because the can't coexist with popup
            webannotator.titleAnnotation.removeWAtitleElems();
        } else{
            titlePopup.innerHTML = title.innerHTML;
        }

        doc.body.appendChild(titlePopup);

        return titlePopup;
    },

    activateToolbarButton: function(){
        document.getElementById('WebAnnotator_titleButton').classList.add('active');
    },

    deactivateToolbarButton: function(){
        document.getElementById('WebAnnotator_titleButton').classList.remove('active');
    },

    removeWAtitleElems: function(doc){
        doc = doc || content.document;
        var waTitleElems = doc.getElementsByTagName('WA-title');
        for (var i=0; i<waTitleElems.length; i++){
            var elem = waTitleElems[i];
            elem.parentNode.removeChild(elem);
        }
    },

    createWAtitleElemFromPopup: function(doc){
        // add WA-title element with title popup contents
        var popup = webannotator.titleAnnotation.getPopup(doc);
        if (popup){
            var htmlElement = doc.createElement("WA-title");

            htmlElement.innerHTML = popup.innerHTML;
            doc.documentElement.appendChild(htmlElement);

            // hide WA-title element only if "Keep colors" is unchecked
            // because it is nice to see colored annotated title in saved HTML
            if (webannotator.prefs.getBoolPref('savecolors')){
                htmlElement.setAttribute("style", "box-shadow:0 0 1em black;border:2px solid blue;padding:0.5em;");
            }
            else{
                htmlElement.setAttribute("style", "display:none;");
            }

            // remove popup because it can't coexist with WA-title element
            popup.parentNode.removeChild(popup);
        }
    }

};
