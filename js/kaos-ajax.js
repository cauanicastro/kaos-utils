/*
Kaos-Utils JS module ---
Created by Cauani Castro
2015-03-16
Last edited on:
2015-03-16
*/
var kUtils = new function(){
	function testAttribute(attr){
		var test = document.createElement("INPUT");
		if (attr in test)
			return true;
		else
			return false;
	}

	function addEventListener(el, eventName, handler) {
		if (el.addEventListener) {
			el.addEventListener(eventName, handler);
		} else {
			el.attachEvent('on' + eventName, function(){
				handler.call(el);
			});
		}
	}

	var assessPlaceholder = function(){
		if (!kUtils.havePlaceholder){
			addEventListener(document, eventName, handler);		
		}
	}

	function handlePlaceHolderIn(event){
		if (!!event.target.attributes["placeholder"]){
			if (event.target.innerHTML == event.target.attributes["placeholder"])
				event.target.innerHTML = "";
		}
	}
	function handlePlaceHolderOut(event){
		if (!!event.target.attributes["placeholder"]){
			if (event.target.innerHTML == "")
				event.target.innerHTML = event.target.attributes["placeholder"];
		}
	}
}
kUtils.assessPlaceholder();

var kForm = new function(form){
	var kvp = function(k, v){
	    this.key = k;
	    this.value = v;
	    var str = function(){
	    	return "'"+this.key+"':'"+this.value+"'";
	    }
	};

	function checkElement(obj){
		if (!obj.name)
			return {error:"Object is invalid", code:0};
		var required = !! obj.attributes["required"];
		var rslt = "";
		if (obj.tagName == "SELECT"){
			rslt = new kvp(obj.name, obj.value);
		}else if (obj.tagName == "TEXTAREA"){
			rslt = new kvp(obj.name, obj.value);
		}else if (obj.tagName == "INPUT"){
			var valid = true;
			switch (obj.attributes["type"]){
				case "text":
				case "tel":
				case "hidden":
				case "date":
				case "email":
				case "url":
				case "password":					
					break;
				case "number":
					if (!required && isNaN(obj.value))
						valid = false;
					break;				
				case "radio":
				case "checkbox":
					if (!obj.attributes["checked"])
						valid = false;
					break;
				default:
					valid = false;
			}
			if (!valid)
				return {error:"Invalid format for field " + obj.name + ".", code:1};
			rslt = new kvp(obj.name, obj.value);
		}
		if (required){
			if (rslt.value == "" || (obj.attributes["placeholder"] && rslt.value == obj.attributes["placeholder"]))
				return {error:"Field " + rslt.key + " is required.", code:2};
		}
		return rslt;
	}

	function getElements(){
		var formvalues = [];
		var formErrors = [];
		for (obj in document.getElementById(form).elements){
			rslt = checkElement(obj);
			if (rslt.error)
				formErrors.push("<p>"+rslt.error+"</p>");
			else
				formvalues.push(rslt.str());
		}
		if (rslt.error.length > 0)
			return {error:formErrors};
		return {values:formvalues};
	}

	this.elements = getElements();
}

var kAjax = new function(){
	function post(callback, callbackError, url, data, type){
		//type = 'application/x-www-form-urlencoded; charset=UTF-8'
		callback = callback || kMessage.sSuccess;
		callbackError = callbackError || kMessage.sError;
		var request = new XMLHttpRequest();
		request.open('POST', url, true);
		request.onreadystatechange = function() {
		  	if (this.readyState === 4) {
			    if (this.status >= 200 && this.status < 400) {	      
		      		callback(this.responseText);
			  	}else{
			  		callbackError(this.responseText);
			  	}
		  	}
		};
		request.setRequestHeader('Content-Type', type);
		request.send(data);
	}

	function request(callback, callbackError, url, data){
		callback = callback || kMessage.sSuccess;
		callbackError = callbackError || kMessage.sError;
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onreadystatechange = function() {
		  if (this.readyState === 4) {
		    if (this.status >= 200 && this.status < 400) {
		      callback(this.responseText);
		    } else {
		      callbackError(this.responseText);
		    }
		  }
		};
		request.send();
		request = null;
	}

	var formater = function(template, holder, data){
		//formater("<p class={%title%}>{%content%}</p>", ["title", "content"], ["foo", "bar"]);
		if (data.length != holder.length)
			return false;
		for (var i = 0; i < data.length; ++i){
			template = template.replace(new RegExp("{%" + content + "%}", "g"), d)
		}
		return template;
	}

	var submitForm = function(form, url, type, callback, callbackError){
		form = kForm(form).getElements();
		if (!form.values){
			if (callbackError === function)
				callbackError(form.values.error);
			else
				return false;
		}
		var data = form.values.join();
		post(callback, callbackError, url, data, type)
	}

	var addContent = function(data, url, type, callback, calbackError){

	}
}

var kMessage = new function(){
	//setting up base box and styling
	var bbox = document.createElement("P");
	bbox.id = 'kaosu_bbox';	bbox.style.width = 'auto'; bbox.style.height = 'auto'; bbox.style.zIndex = '99999'; bbox.style.position = 'fixed'; bbox.style.top = '0px'; bbox.style.left = '0'; bbox.style.right = '0'; bbox.style.margin = '0 auto'; bbox.style.padding = '5px 20px'; bbox.style.textAlign = 'center';
	//timer function
	function tmr(callback){setTimeout(callback, 3000);};
	//utils
	function existBox(box){return !! document.getElementById(box.id);}
	function removeBox(box){(function(x){x.parentNode.removeChild(x);})(document.getElementById(box.id));}
	function addBox(box, msg){
		if (existBox(box))
			removeBox(box);
		box.innerHTML = msg;
		document.body.appendChild(box);
		tmr(function(){removeBox(box)});
	}
	//functions
	this.sError = function(msg){
		var box = bbox;
		box.style.backgroundColor = '#FF6B6B'; box.style.color = '#FFF';
		addBox(box, msg);
	}
	this.sSuccess = function(msg){
		var box = bbox;
		box.style.backgroundColor = '#5E81C5'; box.style.color = '#FFF';
		addBox(box, msg);
	}
}