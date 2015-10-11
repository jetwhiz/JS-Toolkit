"use strict";

var DragDropVars = {
    mouseOffset : null,
    isMouseDown : false,
    prevMouseState : false,

    dragContainerSets : [],
    curTarget : null,
    
    dragHoverBox : null,
    
    rootParent : null,
    rootSibling : null,
    
    themePlain : "",
    themeAlt : ""
};

var DragDrop = {
    
    
    init : function( themePlain, themeAlt ) {
        DragDropVars.themePlain = themePlain;
        DragDropVars.themeAlt = themeAlt;
        
        EventManager.attachEvent( document, 'mouseup', DragDrop.mouseUp );
        EventManager.attachEvent( document, 'mousemove', DragDrop.mouseMove );
        EventManager.attachEvent( document, 'touchmove', DragDrop.mouseMove );
    },
    
    
    
    addContainerSet : function( containers ) {
        
        // Each container set will be distinct - elements in different container sets cannot migrate 
        var dragSetIndex = DragDropVars.dragContainerSets.length;
        DragDropVars.dragContainerSets[dragSetIndex] = [];
        
        // Put each item in this container set (migrating from one to the other in this set is allowed) 
        for ( var i = 0; i < containers.length; ++i ) {
            var cObj = containers[i];
            
            // Add given container to this set 
            DragDropVars.dragContainerSets[dragSetIndex].push(cObj);
            
            // Each sub-element will be draggable, so mark who its container is for later reference
            for ( var j = 0; j < cObj.childNodes.length; ++j ) {
                
                // Only check elements 
                if (cObj.childNodes[j].nodeType !== 1) {continue;}
                
                EventManager.attachEvent( cObj.childNodes[j], 'mousedown', DragDrop.mouseDown );
                EventManager.attachEvent( cObj.childNodes[j], 'touchstart', DragDrop.mouseDown );
                cObj.childNodes[j].setAttribute('ContainerSetIndex', dragSetIndex);
            }
        }
    },
    
    
    
    getMouseOffset : function( tgt, e ) {
        if (!e) {e = window.event;} // IE
        
        var docPos = DragDrop.getElementPosition(tgt);
        var mousePos = DragDrop.getMouseCoords(e);
        return { 
            x : mousePos.x - docPos.x,
            y : mousePos.y - docPos.y
        };
    },
    
    
    
    getElementPosition : function( tgt ) {
        var left = 0;
        var top = 0;
        
        while (tgt.offsetParent) {
            left += tgt.offsetLeft;
            top += tgt.offsetTop;
            tgt = tgt.offsetParent;
        }
        
        left += tgt.offsetLeft;
        top += tgt.offsetTop;
        
        return {x : left, y : top};
    },
    
    
    
    getMouseCoords : function( e ) {
        if (e.pageX || e.pageY) {
            return { x : e.pageX, y : e.pageY };
        }
        return {
            x : e.clientX + document.body.scrollLeft + document.documentElement.clientLeft,
            y : e.clientY + document.body.scrollTop + document.documentElement.clientTop
        };
    },
    
    
    
    mouseMove : function( e ) {
        if (!e) {e = window.event;} // IE
		var target;
		
        if (e.target) {target = e.target;}
        else if (e.srcElement) {target = e.srcElement;} // IE
        
        // Crawl upwards through the DOM until we reach the containing drag child 
        var relTarg = target;
        while (
            relTarg !== null && 
            (
                relTarg.nodeType != 1 || 
                DragDrop.isNotDraggable(relTarg) &&
                relTarg.nodeName.toLowerCase() != 'body' && 
                relTarg.nodeName.toLowerCase() != 'html'
            )
        ) {
            relTarg = relTarg.parentNode;
        }
        if ( relTarg === null ) {return;}
        
        // Determine where the mouse is 
        var mousePos = DragDrop.getMouseCoords(e);
        
        // Get the container set (index) that this item belongs to 
        var dragObj = relTarg.getAttribute('ContainerSetIndex');
        
        
         // The user just started to drag an element
        if (
            dragObj !== null && 
            DragDropVars.isMouseDown && 
            !DragDropVars.prevMouseState
        ) {
            // The (draggable) mouse down target
            DragDropVars.curTarget = relTarg;
            
            // Remember our parent and (next) sibling (so we can jump home if needed) 
            DragDropVars.rootParent = DragDropVars.curTarget.parentNode;
            DragDropVars.rootSibling = DragDropVars.curTarget.nextElementSibling;
            
            // Record the mouse x and y offset for the element
            DragDropVars.mouseOffset = DragDrop.getMouseOffset(target, e);
            
            
            /* HoverBox functionality */
            // Clear out the dragHoverBox element (in case it has stuff in it from before) 
            for ( var i = 0; i < DragDropVars.dragHoverBox.childNodes.length; ++i ) {
                DragDropVars.dragHoverBox.removeChild(DragDropVars.dragHoverBox.childNodes[i]);
            }
            
            // Clone the current item and dump it into the dragHoverBox (so it follows their mouse) 
            DragDropVars.dragHoverBox.appendChild( DragDropVars.curTarget.cloneNode(true) );
            DragDropVars.dragHoverBox.style.display = 'block';
            
            // we cloned _everything_ about the item (including its ContainerSetIndex) ... so clear it 
            DragDropVars.dragHoverBox.firstElementChild.removeAttribute('ContainerSetIndex');
            
            
            // record the width/height of our drag item
            DragDropVars.curTarget.setAttribute('startWidth',  parseInt(DragDropVars.curTarget.offsetWidth, 10));
            DragDropVars.curTarget.setAttribute('startHeight', parseInt(DragDropVars.curTarget.offsetHeight, 10));
            DragDropVars.curTarget.setAttribute('startBGColor', DragDropVars.curTarget.style.backgroundColor);
            DragDropVars.curTarget.style.backgroundColor = '#dfffdf';
            
            
            // Record the sizes of all elements in the container set (to determine where to drop the element) 
            var dragConts = DragDropVars.dragContainerSets[dragObj];
            
            // loop through each possible drop container
            for ( var j = 0; j < dragConts.length; ++j ) {
                var pos = DragDrop.getElementPosition(dragConts[j]);
                
                // save the width, height and position of the main container 
                dragConts[j].setAttribute('startWidth',  parseInt(dragConts[j].offsetWidth, 10));
                dragConts[j].setAttribute('startHeight', parseInt(dragConts[j].offsetHeight, 10));
                dragConts[j].setAttribute('startLeft', pos.x);
                dragConts[j].setAttribute('startTop', pos.y);
                
                // loop through each (draggable) child element of each container
                for ( var k = 0; k < dragConts[j].childNodes.length; ++k ) {
                    var thisNode = dragConts[j].childNodes[k];
                    
                    if (
                            thisNode.nodeType !== 1 || 
                            thisNode == DragDropVars.curTarget || 
                            DragDrop.isNotDraggable(thisNode)
                        ) {
                            continue;
                    }
                    
                    pos = DragDrop.getElementPosition(thisNode);
                    
                    // save the width, height and position of each element
                    thisNode.setAttribute('startWidth',  parseInt(thisNode.offsetWidth, 10));
                    thisNode.setAttribute('startHeight', parseInt(thisNode.offsetHeight, 10));
                    thisNode.setAttribute('startLeft', pos.x);
                    thisNode.setAttribute('startTop', pos.y);
                }
            }
                
        }
        
        
        
        // We are currently dragging something
        if (DragDropVars.curTarget) {
            // move our helper div to wherever the mouse is (adjusted by mouseOffset)
            DragDropVars.dragHoverBox.style.top  = mousePos.y - DragDropVars.mouseOffset.y + 'px';
            DragDropVars.dragHoverBox.style.left = mousePos.x - DragDropVars.mouseOffset.x + 'px';

            var setIndex = DragDropVars.curTarget.getAttribute('ContainerSetIndex');
            var dragConts  = DragDropVars.dragContainerSets[setIndex];
            var activeContainer = null;
            
            var xPos = mousePos.x - DragDropVars.mouseOffset.x + (DragDropVars.curTarget.getAttribute('startWidth') /4);
            var yPos = mousePos.y - DragDropVars.mouseOffset.y + (DragDropVars.curTarget.getAttribute('startHeight') /4);
            
            
            // check each drop container to see if target is within boundaries of a container
            for ( var i = dragConts.length-1; i >= 0; --i ) {
                var leftBoundary = parseInt(dragConts[i].getAttribute('startLeft'), 10);
                var rightBoundary = leftBoundary + parseInt(dragConts[i].getAttribute('startWidth'), 10);
                
                var topBoundary = parseInt(dragConts[i].getAttribute('startTop'), 10);
                var bottomBoundary = topBoundary + parseInt(dragConts[i].getAttribute('startHeight'), 10);
                
                if ( leftBoundary < xPos && topBoundary < yPos &&
                    rightBoundary > xPos && bottomBoundary > yPos
                ) {
                    // target is inside of our container 
                    activeContainer = dragConts[i];
                    break;
                }
            }
            
            
            // target is in a container -- figure out where it should be placed 
            if ( activeContainer ) {
                // beforeNode will hold the first node AFTER where our div belongs
                var beforeNode = null;
                
                // loop through each (draggable) child node (skipping text nodes).
                for ( var i = activeContainer.childNodes.length-1; i >= 0; --i ) {
                    var currentNode = activeContainer.childNodes[i];
                    
                    if ( 
                        currentNode.nodeType != 1 ||
                        DragDrop.isNotDraggable(currentNode)
                    ) {
                        continue;
                    }
                    
                    var rightBoundary = parseInt(currentNode.getAttribute('startLeft'), 10) + 
                                                    parseInt(currentNode.getAttribute('startWidth'), 10);
                    var bottomBoundary = parseInt(currentNode.getAttribute('startTop'), 10) + 
                                                    parseInt(currentNode.getAttribute('startHeight'), 10);
                    
                    // if current item is below the item being dragged ... 
                    if (
                        DragDropVars.curTarget != currentNode && 
                        rightBoundary  > xPos && bottomBoundary > yPos
                    ) {
                        beforeNode = currentNode;
                    }
                }
                
                
                // put the element in its place 
                if (beforeNode) {
                    // the item being dragged belongs before another item
                    
                    if (beforeNode != DragDropVars.curTarget.nextElementSibling) {
                        activeContainer.insertBefore(DragDropVars.curTarget, beforeNode);
                    }
                }
                else {
                    // the item being dragged belongs at the "end" of the current container
                    
                    if (
                        DragDropVars.curTarget.nextElementSibling ||
                        DragDropVars.curTarget.parentNode != activeContainer
                    ) {
                        // find the last draggable child (don't allow dumping below undraggable things) 
                        var lastDragChild = null; 
                        
                        for ( var i = activeContainer.childNodes.length-1; i >= 0; --i ) {
                            if ( 
                                activeContainer.childNodes[i].nodeType != 1 ||
                                DragDrop.isNotDraggable(activeContainer.childNodes[i])
                            ) {
                                continue; // not a (draggable) element 
                            }
                            
                            lastDragChild = activeContainer.childNodes[i];
                            break; // we started at the end, so this is the last one! 
                        }
                        
                        if (lastDragChild && lastDragChild.nextSibling) {
                            // there is a non-draggable child at the end (we can insert AFTER lastDragChild) 
                            activeContainer.insertBefore(DragDropVars.curTarget, lastDragChild.nextSibling);
                        }
                        else {
                            // otherwise just dump it at the very end 
                            activeContainer.appendChild(DragDropVars.curTarget);
                        }
                    }
                }
                
            } // END we're dragging over an active container 
            
            else {
                // our drag item is not in a container, so dump it back into original spot 
                
                if (DragDropVars.rootSibling) {
                    // we remembered who it came before (just put it back) 
                    DragDropVars.rootParent.insertBefore(DragDropVars.curTarget, DragDropVars.rootSibling);
                }
                else {
                    // otherwise just dump it at the very end of the container 
                    DragDropVars.rootParent.appendChild(DragDropVars.curTarget);
                }
            }
        }
        
        
        // remember the current mouse state ( so we can compare later ) 
        DragDropVars.prevMouseState = DragDropVars.isMouseDown;
        
        // don't highlight junk on the page if/while we're dragging 
        if (DragDropVars.curTarget) {
            if (e.preventDefault) {e.preventDefault();}
            e.cancelBubble = true;
            return false;
        }
    },
    
    
    
    mouseUp : function(e) {
    
        // We dragged something 
        if (DragDropVars.curTarget) {
            // hide our helper object - it is no longer needed
            DragDropVars.dragHoverBox.style.display = 'none';
            
            // Clear out the dragHoverBox element 
            for ( var i = 0; i < DragDropVars.dragHoverBox.childNodes.length; ++i ) {
                DragDropVars.dragHoverBox.removeChild(DragDropVars.dragHoverBox.childNodes[i]);
            }
            
            // restore the original drag item's bg color 
            DragDropVars.curTarget.style.backgroundColor = DragDropVars.curTarget.getAttribute('startBGColor');
            
            // Redo the alternating color scheme (prettify) 
            DragDrop.recolorList( DragDropVars.curTarget.parentNode );
        }
        
        DragDropVars.curTarget  = null;
        DragDropVars.isMouseDown = false;
    },
    
    
    
    recolorList : function( tgt ) {
        var currentTheme = DragDropVars.themePlain;
        
        for ( var i = 0; i < tgt.childNodes.length; ++i ) {
            var thisNode = tgt.childNodes[i];
            
            if ( 
                thisNode.nodeType != 1 ||
                DragDrop.isNotDraggable(thisNode)
            ) {
                continue; // not a draggable element 
            }
            
            thisNode.className = thisNode.className.replace(DragDropVars.themePlain, currentTheme );
            thisNode.className = thisNode.className.replace(DragDropVars.themeAlt, currentTheme );
            
            if (currentTheme == DragDropVars.themePlain) {
                currentTheme = DragDropVars.themeAlt;
            }
            else {
                currentTheme = DragDropVars.themePlain;
            }
        }
    },
    
    
    
    mouseDown : function(e) {
        if (!e) {e = window.event;} // IE
        var target;
		
        if (e.target) {target = e.target;}
        else if (e.srcElement) {target = e.srcElement;} // IE
        
        // Crawl upwards through the DOM until we reach the containing drag child 
        while ( 
            DragDrop.isNotDraggable(target) && 
            target.nodeName.toLowerCase() != 'body' && 
            target.nodeName.toLowerCase() != 'html' 
        ) {
            target = target.parentNode;
        }
        
        // if we couldn't find a draggable child, then this is not a drag-event mousedown 
        if ( DragDrop.isNotDraggable(target) ) {return;}
        
        DragDropVars.isMouseDown = true;
        
        // kill off the default mousedown behavior (prevents selecting/moving stuff on the page) 
        //if (e.preventDefault) {e.preventDefault();}
        e.cancelBubble = true;
        return false;
    },
    
    
    
    isNotDraggable : function( tgt ) {
        return tgt.className.indexOf("jse_draggable") == -1;
    },
    
    
    
    serializeContainer : function( tgtContainer ) {
        var containerStruct = [];
        
		if (typeof json_parse != "function") {
			alert( "serializeContainer: json_parse is required for this operation!" );
            return null;
		}
		
        if ( tgtContainer.nodeType != 1 ) {
            alert( "serializeContainer: Invalid container given!" );
            return null;
        }
        
        for ( var i = 0; i < tgtContainer.childNodes.length; ++i ) {
            var dragChild = tgtContainer.childNodes[i];
            var struct = { data : null, children : [] };
            
            // We're only looking for jse_draggable elements 
            if ( dragChild.nodeType != 1 || dragChild.className.indexOf("jse_draggable") == -1 ) {
                continue;
            }
            
            // Dig through immediate children looking for its jse_data 
            for ( var j = 0; j < dragChild.childNodes.length; ++j ) {
                var cObj = dragChild.childNodes[j];
                
                // We're only looking for jse_data elements 
                if ( cObj.nodeType != 1 || cObj.className.indexOf("jse_data") == -1 ) {
                    continue;
                }
                
                var json = json_parse( cObj.innerHTML );
                
                struct.data = json;
                
                break; // we only care about the first one 
            }
            
            // Recurse into any nested containers (we only want the first level containers!) 
            // TODO: make this more efficient (stop recursing getElementsByClassName after first hit) 
            var nestedContainers = document.getElementsByClassName( "jse_dragContainer", null, dragChild );
            for ( var j = 0; j < nestedContainers.length; ++j ) {
                
                // Crawl upwards through the DOM until we reach the first container  
                var tmpSto = nestedContainers[j].parentNode;
                while ( 
                    tmpSto.className.indexOf("jse_dragContainer") == -1 && 
                    tmpSto.nodeName.toLowerCase() != 'body' && 
                    tmpSto.nodeName.toLowerCase() != 'html' 
                ) {
                    tmpSto = tmpSto.parentNode;
                }
                
                // We should've reached our parent container (tgtContainer) 
                //    unless we fetched too many levels deep
                if ( 
                    tmpSto.nodeType != 1 || 
                    tmpSto.className.indexOf("jse_dragContainer") == -1 || 
                    tmpSto != tgtContainer
                ) {
                    continue;
                }
                
                var serialedCont = DragDrop.serializeContainer( nestedContainers[j] );
                if ( serialedCont.length > 0 ) {
                    struct.children.push(serialedCont);
                }
            }
            
            containerStruct.push( struct );
        }
        
        return containerStruct;
    }
};


EventManager.addLoadEvent(
    function() {
        DragDrop.init( "moduleRowPlain", "moduleRowHighlight" );
        
        var containers = document.getElementsByClassName("jse_dragContainer");
        for ( var i = 0; i < containers.length; ++i ) {
            // isolate each container in its own set (no migration between containers) 
            DragDrop.addContainerSet([containers[i]]);
        }
        
        // Create our helper object that will show the item while dragging
        DragDropVars.dragHoverBox = document.createElement('div');
        DragDropVars.dragHoverBox.style.cssText = 'position:absolute;display:none;z-index:100;border:1px dashed #aaaaaa;';
        DragDropVars.dragHoverBox.className = 'genericDenseList moduleRow moduleRowPlain';
        document.body.appendChild(DragDropVars.dragHoverBox);
    }
);
