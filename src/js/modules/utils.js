'use strict';

/*
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 utils.js

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 A set of utilities for front-end javascript development

*/


/*
	
 Class functions for DOM elements
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

// Has class
export let hasClass = (el, className) => {
	return new RegExp('(\\s|^)' + className + '(\\s|$)').test(el.className);
}


// Remove class
export let removeClass = (el, className) => {
	if (el.classList) {
		el.classList.remove(className);
	} else {
		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}
}


// Toggle class
export let toggleClass = (el, className) => {
	if (el.classList) {
		el.classList.toggle(className);
	} else {
		var classes = el.className.split(' ');
		var existingIndex = classes.indexOf(className);

		if (existingIndex >= 0) {
			classes.splice(existingIndex, 1);
		}
		else {
			classes.push(className);
		}

		el.className = classes.join(' ');
	}
}


/*
	
 Wrap DOM elements
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

// Wrap a single element
export let wrap = (el, wrapper) => {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

// Wrap a group of elements
export let wrapAll = (els, wrapper) => {
	els[0].parentNode.insertBefore(wrapper, els[0]);

	for(var i = 0; i < els.length; i++) {
		wrapper.appendChild(els[i]);
	}
}


/*
	
 Throttle and debounce
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

// Throttle
export let throttle = (func, delay) => {
	
	delay = delay || 42;
	
	let waiting = false,
		funcTimeoutId;
	
	return function() {
		if (!waiting) {
			waiting = true;
			clearTimeout(funcTimeoutId);
			funcTimeoutId = setTimeout(function() {
				func.call();
				waiting = false;
			}, delay);
		}
	};
}


/*
	
 Get information about elements
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

// Get x / y coordinates relative to document - set includeScroll to true to include browser scroll position
// Helper function to get an element's exact position
export let getPosition = (el, includeScroll) => {

	let xPos = 0,
		yPos = 0;

	while (el) {
		if (el.tagName == "BODY") {

			// deal with browser quirks with body/window/document and page scroll
			var xScroll = includeScroll ? (el.scrollLeft || document.documentElement.scrollLeft) : 0;
			var yScroll = includeScroll ? (el.scrollTop || document.documentElement.scrollTop) : 0;

			xPos += (el.offsetLeft - xScroll + el.clientLeft);
			yPos += (el.offsetTop - yScroll + el.clientTop);
		} else {

			// for all other non-BODY elements
			if(includeScroll) {
				xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
				yPos += (el.offsetTop - el.scrollTop + el.clientTop);
			} else {
				xPos += (el.offsetLeft + el.clientLeft);
				yPos += (el.offsetTop + el.clientTop);
			}
		}

		el = el.offsetParent;
	}
	
	return {
		x: xPos,
		y: yPos
	};
}


// Get browser width
export let browserWidth = () => {
	if (self.innerHeight) {
		return self.innerWidth;
	}

	if (document.documentElement && document.documentElement.clientWidth) {
		return document.documentElement.clientWidth;
	}

	if (document.body) {
		return document.body.clientWidth;
	}
}


// Get browser height
export let browserHeight = () => {
	if (self.innerHeight) {
		return self.innerHeight;
	}

	if (document.documentElement && document.documentElement.clientHeight) {
		return document.documentElement.clientHeight;
	}

	if (document.body) {
		return document.body.clientHeight;
	}
}


/*
	
 Convert collection of DOM elements to array
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

export let toArray = (obj) => {
	let array = [];
	
	// iterate backwards ensuring that length is an UInt32
	for (var i = obj.length >>> 0; i--;) { 
		array[i] = obj[i];
	}
	
	return array;
}


/*
	
 Traverse the DOM
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

// Get next sibling
export let next = (el) => {
	let nextSibling = el.nextSibling;
	while(nextSibling && nextSibling.nodeType != 1) {
		nextSibling = nextSibling.nextSibling
	}

	return nextSibling;
}


/*
	
 Iterative functions
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

// Iterate over array like set of elements
export let each = (els, callback) => {
	Array.prototype.forEach.call(els, callback);
}

// create a one-time event
export let once = (node, type, callback) => {

	// create event
	node.addEventListener(type, function(e) {
		// remove event
		e.target.removeEventListener(e.type, arguments.callee);
		// call handler
		return callback(e);
	});

}


// Serialize form input values to json object
// NOTE:
// could probably achieve this without serializing (i.e. straight to json)
// but its useful to have the serialize option so leaving for now
export let serializeToJson = (form) => {

	let field,
		s = [],
		jsonObj = {};

	// Encode all form fields
	if (typeof form == 'object' && form.nodeName == 'FORM') {
		let len = form.elements.length;
		for (var i = 0; i < len; i++) {
			field = form.elements[i];
			if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
				if (field.type == 'select-multiple') {
					for (var j = form.elements[i].options.length - 1; j >= 0; j--) {
						if(field.options[j].selected)
							s[s.length] = encodeURIComponent(field.name) + '=' + encodeURIComponent(field.options[j].value);
					}
				} else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
					s[s.length] = encodeURIComponent(field.name) + '=' + encodeURIComponent(field.value);
				}
			}
		}
	}

	s.forEach(function(el, i) {
		let split = el.split('=');

		// Decode then unencode to make sure we don't split string at wrong place by accident
		jsonObj[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
	});

	return jsonObj;
}


/*
	
 Get query parameter from url
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

*/

export let getQueryParam = (name) => {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
	results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
