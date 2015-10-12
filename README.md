# JS-Toolkit
This toolit offers various ultra-lightweight JavaScript functions to help developers create web applications.  By virtue, all of these scripts should always remain less than 10 KB when minified.  


## Functionality

The package includes the following functionaity: 

* **EventManager** - Required for all other toolkit scripts *(minified < 2 KB)* 
* **Sortable** - Allow sorting of lists *(minified < 8 KB)* 
* **Textarea Expander** - Expands text area to fit user input *(minified < 1 KB)* 
* **Mutable Select** - Allow user modification of select box *(minified < 1 KB)* 
* **Richtext Textarea** - Applies rich text functionality to text area *(minified < 3 KB)* 

Demo page: https://jetwhiz.github.io/


## Usage

### Sortable

Simply use the special CSS class "jse_dragContainer" to denote the container object, and "jse_draggable" for each object you want draggable on the page.  There is no JS setup necessary!  It is not required to use &lt;ul>/&lt;ol> for drag-drop funcitonality -- this feature works with any block containers. 

```html
<ul class="jse_dragContainer">
	<li class="jse_draggable">Draggable #1</li>
	<li class="jse_draggable">Draggable #2</li>
	<li class="jse_draggable">Draggable #3</li>
</ul>
```

Note that sortable has a "serializeContainer" helper function that can be passed the container object for use with form submissions.  Use the special "jse_data" CSS class to denote JSON data storage for each draggable element.  It is recommended to apply the "display: none;" style to this data element so users cannot see it. 

```html
<ul class="jse_dragContainer" id="myContainer">
	<li class="jse_draggable">
	  Draggable #1
	  <div class='jse_data'>{ "ID" : 1 }</div>
	 </li>
	<li class="jse_draggable">
	  Draggable #2
	  <div class='jse_data'>{ "ID" : 2 }</div>
	</li>
	<li class="jse_draggable">
	  Draggable #3
	  <div class='jse_data'>{ "ID" : 3 }</div>
	</li>
</ul>
```

```js
var container = document.getElementById('myContainer');
var sorted = DragDrop.serializeContainer(container);
```

In this instance, the "sorted" variable will hold an array with the JSON objects { "ID" : 1 }, { "ID" : 2 }, and { "ID" : 3 } -- which denotes the order that the user put the elements in. 


### Textarea Expander

Simply use the special CSS class "jse_textarea-expand" to denote text areas that should be expandable. 

```html
<textarea class="jse_textarea-expand"></textarea>
```

### Mutable Select

Simply use the special CSS class "jse_mutableSelect" to denote select form elements that should be mutable. 

```html
<select class="jse_mutableSelect">
	<option value="A">A</option>
	<option value="B">B</option>
	<option value="C">C</option>
	<option value="">new</option>
</select>
```

When the user selects "new", they will be prompted for a name/value pair to add to the select box. 

### Richtext

Simply use the special CSS class "jse_richTextArea" to denote text areas that should have richtext functionality applied to them.  Note that this element should be contained within a &lt;form> element for proper functionality.  

```html
<form>
	<textarea class='jse_richTextArea'></textarea>
</form>
```
