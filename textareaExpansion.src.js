
var TextareaExpansion = {

    /*
    *   Attach relevant events to all 'textarea-expand' members
    *   attachTextareaExpansion() : no return 
    */
    attachTextareaExpansion : function() {
        var minHeight = 35;
        var startHeight = 35;
        var startWidth = 350;
        var maxHeight = 200;
        
        var attachTextareas = document.getElementsByClassName("jse_textarea-expand");
        
        for (var i = 0; i < attachTextareas.length; ++i) {
            var target = attachTextareas[i];
            
            var closure = function(tgt) {
                return function (e) { // localize target for closure 
                    tgt.style.height = startHeight + 'px';
                    tgt.style.width = startWidth + 'px';
                    var newHeight = Math.max( Math.min( maxHeight, tgt.scrollHeight), minHeight);
                    tgt.style.height = newHeight + 'px';
                    
                    if (newHeight < maxHeight) {
                        tgt.style.overflowY = 'hidden';
                        tgt.style.width = startWidth + 'px';
                    }
                    else {
                        tgt.style.overflowY = 'scroll';
                        if (window.innerHeight) {
                            var scrollbarWidth = parseInt(tgt.style.width,10) - tgt.clientWidth;
                            tgt.style.width = (startWidth + scrollbarWidth) + 'px';
                        }
                    }
                };
            }( target );
            
            closure();
            
            EventManager.attachEvent(target, 'keyup', closure);
            EventManager.attachEvent(target, 'paste', closure);
        }
        
        return false;
    }
    
};



EventManager.registerAttachEvent(
    function() {
        TextareaExpansion.attachTextareaExpansion();
    }
);
