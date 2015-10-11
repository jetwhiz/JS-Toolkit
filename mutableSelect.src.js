
var MutableSelect = {
    
    mutableSelectEvent : function (e) {
        var target;
        if (!e) var e = window.event; // IE
        
        if (e.target) target = e.target;
        else if (e.srcElement) target = e.srcElement; // IE
        
        // Only when the empty value is selected ('new')
        if ( target.options[ target.selectedIndex ].value != '' ) {
            return;
        }
        
        var optVal = prompt( 'Please enter a new value: ', '' );
        if ( !optVal ) {
            return;
        }
        
        for ( var i = 0; i < target.options.length; ++i ){
            if ( target.options[ i ].value == optVal ) {
                alert( "The value '" + optVal + "' already exists!" );
                return;
            }
        }
        
        var newIndex = target.options.length;
        var oldOpt = target.options[ newIndex-1 ];
        var newOpt = new Option(optVal, optVal, false, true);
        
        target.options[ newIndex ] = newOpt;
        target.options[ newIndex-1 ] = newOpt;
        target.options[ newIndex ] = oldOpt;
    },
    
    /*
    *    Attach relevant events to all 'jse_mutableSelect' members
    *    attachMutableSelectEvents() : no return 
    */
    attachMutableSelectEvents : function() {
        var buttonset = document.getElementsByClassName("jse_mutableSelect");
        
        for (var i = 0; i < buttonset.length; ++i) {
            EventManager.attachEvent(
                buttonset[i],
                'change',
                MutableSelect.mutableSelectEvent
            );
        }
    }
    
};



EventManager.registerAttachEvent(
    function() {
        MutableSelect.attachMutableSelectEvents();
    }
);
