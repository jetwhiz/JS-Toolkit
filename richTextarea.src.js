

// All of the available toolbar icons for the Rich Text input 
var RichTextAreaToolbar = {
    icons : [
        "imgs/icons/text_align_left.png", 
        "imgs/icons/text_align_center.png", 
        "imgs/icons/text_align_right.png", 
        "imgs/icons/text_align_justify.png", 
        "imgs/icons/text_bold.png", 
        "imgs/icons/text_underline.png", 
        "imgs/icons/text_italic.png",
        "imgs/icons/style_delete.png"
    ],
    actions : [
        "justifyleft",
        "justifycenter",
        "justifyright",
        "justifyfull",
        "bold",
        "underline",
        "italic",
        "removeFormat"
    ]
};



var RichTextArea = {
    
    // Turns toolbar button presses into Rich Text events 
    runCommand : function (target, command, option) {
        var doc = target.contentDocument || target.contentWindow.document;
        
        try {
            doc.execCommand(command, false, option);
        } catch (e) {
            alert( "RichTextArea.runCommand ERR: " + e );
        }
    },
    
    
    // When the containing form is submitted (non-AJAX), copy the rich text value into the (old) textarea 
    allRichTextAreasEvent : function (e) {
        var buttonset = document.getElementsByClassName("jse_richTextArea", null, this);
        
        for (var i = 0, j = buttonset.length; i < j; ++i) {
            if ( buttonset[i].doOnSubmit ) {
                buttonset[i].doOnSubmit( null );
            }
        }
    },
    
    // copy the rich text value into the (old) textarea (during submission) 
    richTextAreaEvent : function (e) {
        var relatedIFrame = this.relatedIFrame;
        
        if ( ! relatedIFrame || typeof relatedIFrame == 'undefined' ) {
            alert( "richTextAreaEvent ERR: Could not find my parent!" );
        }
        
        var doc = relatedIFrame.contentDocument || relatedIFrame.contentWindow.document;
        
        this.value = doc.body.innerHTML;
    },
    
    
    /*
    *    Attach relevant events to all 'jse_richTextArea' members
    *    attachRichTextAreaEvents() : no return 
    */
    attachRichTextAreaEvents : function() {
        var buttonset = document.getElementsByClassName("jse_richTextArea");
        
        for (var i = 0, j = buttonset.length; i < j; ++i) {
            
            if ( buttonset[i].relatedIFrame && typeof buttonset[i].relatedIFrame != 'undefined' ) {
                // This textarea has already been turned into a rich text field 
                continue;
            }
            
            var setFunc = function ( textarea ) {
                
                // Generate the iframe that will replace the old textarea 
                var iframe = document.createElement('iframe');
                textarea.parentNode.insertBefore(iframe, textarea);
                iframe.style.width = textarea.style.width;
                iframe.style.height = '250px';
                iframe.style.backgroundColor = '#ffffff';
                
                // hide the old textarea (we're using richtext now) 
                textarea.style.display = 'none';
                
                textarea.relatedIFrame = iframe; // so we can find our mate later on (doOnSubmit) 
                textarea.doOnSubmit = RichTextArea.richTextAreaEvent; // pseudo-submit function (for AJAX 'submit') 
                
                
                // Turn design mode 'on' and pull in the current value (as needed) 
                var x = null;
                if ( iframe.contentDocument ) {
                    x = function () { 
                        iframe.contentDocument.designMode = "on"; 
                        
                        // if we document.write here, Fx will put this event in the browser's history (breaks back button) 
                        iframe.contentDocument.body.innerHTML = textarea.value;
                    }
                }
                else {
                    x = function() {  
                        iframe.contentWindow.document.write( textarea.value ); // IE prefers writing to the window 
                        iframe.contentWindow.document.designMode = "on"; 
                    }
                }
                setTimeout( x, 100 ); // Fx needs a slight delay to hook things up correctly 
                
                
                // Generate the toolbar (above the iframe)
                var ulist = document.createElement('ul');
                ulist.className = 'inlineList genericDenseList';
                
                for ( var i = 0, j = RichTextAreaToolbar.icons.length; i < j; ++i ) {
                    var li = document.createElement('li');
                    var img = document.createElement('img');
                    img.src = RichTextAreaToolbar.icons[i];
                    img.title = RichTextAreaToolbar.actions[i];
                    img.setAttribute("style","cursor: pointer;");
                    
                    var func = function ( action ) { return function() {RichTextArea.runCommand( iframe, action );} }( RichTextAreaToolbar.actions[i] );
                    
                    EventManager.attachEvent(
                        img,
                        'click',
                        func
                    );
                    
                    li.appendChild( img );
                    ulist.appendChild( li );
                }
                
                // Insert the toolbar before the iframe 
                textarea.parentNode.insertBefore(ulist, iframe);
                
            };
            
            setFunc( buttonset[i] ); // forces closure variable to be localized 
            
            // In case form is submitted using primitive form submit (non-AJAX) 
            // AJAX forms do not trigger the submit event 
            EventManager.attachEvent(
                buttonset[i].form,
                'submit',
                RichTextArea.allRichTextAreasEvent
            );
        }
    }
    
};



EventManager.addLoadEvent(
    function() {
        RichTextArea.attachRichTextAreaEvents();
    }
);
