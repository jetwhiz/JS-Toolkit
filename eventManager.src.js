"use strict";

// ADD EVENTS BUNDLE //
var EventManager = {
    
    /*
    *   Various ways of appending events onto targets (for those that don't support addEventListener)
    */
    addEvent : function( target, type, func ) {
        
        // fall back to 'document' object 
        if (target === "" || typeof target == 'undefined') {
            target = document;
        }
        
        
        // not yet set up ... so set this element up 
        if (target.eventListeners === "" || typeof target.eventListeners == 'undefined') {
            target.eventListeners = [];
        }
        if (target.eventListeners[ type ] === "" || typeof target.eventListeners[ type ] == 'undefined') {
            target.eventListeners[ type ] = [];
        }
        
        
        // ensure their event isn't already bound  (no duplicates) 
        for ( var i = 0; i < target.eventListeners[ type ].length; ++i ) {
            if ( func == target.eventListeners[ type ][ i ] ) {
                // their function is already in the list! don't bother continuing
                return true;
            }
        }
        
        
        // add their event to this type 
        target.eventListeners[ type ][ target.eventListeners[ type ].length ] = func;
        
        
        // delegate queue already attached to target, don't bother attaching again 
        if (target.eventListeners[ type ].length > 1) {
            return true;
        }
        
        
        // bind delegate queue to event on the given element 
        target[ type ] = function( tp ) {
            return function(e) { // localize 'type' to closure by wrapping and executing outside function 
                var ret = true;
                
                for ( var i = 0; i < target.eventListeners[ tp ].length; ++i ) {
                    target.listenFunc = target.eventListeners[ tp ][ i ]; // force the correct 'this' context 
                    ret = target.listenFunc( e ) && ret;
                }
                
                return ret;
            };
        }( type );
        
        return true;
    },



    /*
    *  A generic interface to attaching events (supports either addEventListener or addEvent) 
    */
    attachEvent : function( target, type, func ) {
        var typeEx="on" + type;
        
        if (target === "" || typeof target == 'undefined') {
            target = document;
        }
        
        if (target.addEventListener) {
            target.addEventListener(type, func, false);
        }
        //else if (target.attachEvent) {
        //    target.attachEvent(typeEx, func);
        //}
        else {
            EventManager.addEvent(target, typeEx, func);
        }
    },



    /*
    *  Shortcut to adding events onload to the window 
    */
    addLoadEvent : function(func) {
        EventManager.attachEvent( window, "load", func );
    },



    /*
    *  Attaches the given event on load and registers it so that it can be repeatedly called by attachRegisteredEvents
    */
    registerAttachEvent : function(func) {
        if (window.registeredEvents === "" || typeof window.registeredEvents == 'undefined') {
            window.registeredEvents = [];
        }
        
        // ensure their event isn't already registered  (no duplicates) 
        for ( var i = 0; i < window.registeredEvents.length; ++i ) {
            if ( func == window.registeredEvents[ i ] ) {
                // their function is already in the list! don't bother continuing
                return true;
            }
        }
        
        // register their event 
        window.registeredEvents[ window.registeredEvents.length ] = func;
        
        EventManager.addLoadEvent( func );
        
        return true;
    },
    
    
    /*
    *  Attaches all registered events (possibly starting at 'start' and below) on-the-fly 
    */
    attachRegisteredEvents : function( start ) {
        start = ( start ? start : document );
        
        if (window.registeredEvents === "" || typeof window.registeredEvents == 'undefined') {
            // no events to attach 
            return true;
        }
        
        for ( var i = 0; i < window.registeredEvents.length; ++i ) {
            // run the attach script 
            window.registeredEvents[ i ]( start );
        }
        
        return true;
    }

};
// *** //
