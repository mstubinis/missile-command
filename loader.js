// Images loaded using PreloadJS library: http://createjs.com/PreloadJS
// Sounds loaded and played using SoundJS library: http://createjs.com/SoundJS
"use strict";
var app = {};
app.KEYBOARD = {
	"KEY_LEFT": 37,
	"KEY_UP": 38,
	"KEY_RIGHT": 39,
	"KEY_DOWN": 40,
	"KEY_SPACE": 32,
	"KEY_A": 65,
	"KEY_S": 83,
	"KEY_D": 68,
	"KEY_BACKSPACE": 8,
};
app.keydown = [];
app.paused = false;
app.justClicked = false;
app.justTouched = false;
app.currentKey = undefined;
app.mouse = {
	x: 0, y: 0,
};
app.IMAGES = {
	title: "images/title.png",
	missile: "images/missile.png",
	turretBase: "images/turretBase.png",
	turretGun: "images/turretGun.png",
	city1: "images/city1.png",
	city1Dead: "images/city1Dead.png",
};
app.is_touch_device = function() {
	var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	var mq = function(query) {
		return window.matchMedia(query).matches;
	}
	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		return true;
	}
	// include the 'heartz' as a way to have a non matching MQ to help terminate the join https://git.io/vznFH
	var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	return mq(query);
}
window.onload = function(){
	//mouse event handlers
	document.onmousemove = function(e){
		app.mouse.x = e.pageX - e.target.offsetLeft;
		app.mouse.y = e.pageY - e.target.offsetTop;	
	}
	window.addEventListener("click",function(e){
		app.justClicked = true; 
	}, false);
	

	//focus event handlers
	window.onblur = function(e){ 
		app.paused = true; 
	}
	window.onfocus = function(e){ 
		app.paused = false; 
	}
	//keyboard event handlers
	window.addEventListener("keydown",function(e){
		app.currentKey = e.keyCode;
		app.keydown[e.keyCode] = true;
	});
	window.addEventListener("keyup",function(e){
		app.currentKey = undefined;
		app.keydown[e.keyCode] = false;
	});
	
	//touch screen event processor
    var body = document.getElementsByTagName('body')[0];

    var canvas_element = document.createElement('canvas');
    canvas_element.setAttribute('tabindex', '-1');
    canvas_element.setAttribute('id', 'canvas');
    canvas_element.setAttribute('style', 'display: block; background: #fff;');
	
	if(app.is_touch_device()){
		var canvas_event_element = document.createElement('div');
		canvas_event_element.setAttribute('tabindex', '0');
		canvas_event_element.setAttribute('id', 'canvasEventCatcher');
		canvas_event_element.setAttribute('style', 'position:absolute;top:0;left:0;z-index:5;outline:none;width:100%;height:600px;');
		
		canvas_event_element.addEventListener("touchstart",function(e){
			app.mouse.x = e.touches[0].clientX - e.target.offsetLeft;
			app.mouse.y = e.touches[0].clientY - e.target.offsetTop;
			
			app.justClicked = true;
			app.justTouched = true;
			app.game.fireTurretsFromTouchDevice();
		},false);
		canvas_event_element.addEventListener("touchmove",function(e){
			app.mouse.x = e.touches[0].clientX - e.target.offsetLeft;
			app.mouse.y = e.touches[0].clientY - e.target.offsetTop;
		},false);
		canvas_event_element.addEventListener("touchend",function(e){
			app.mouse.x = e.touches[0].clientX - e.target.offsetLeft;
			app.mouse.y = e.touches[0].clientY - e.target.offsetTop;
		},false);
		body.appendChild(canvas_event_element);
	}
	body.appendChild(canvas_element);
	
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	app.queue.loadManifest([
		{id: "title",           src: "images/title.png"},
		{id: "missile",         src: "images/missile.png"},
		{id: "turretBase",      src: "images/turretBase.png"},
		{id: "turretGun",       src: "images/turretGun.png"},
		{id: "city1",           src: "images/city1.png"},
		{id: "city1Dead",       src: "images/city1Dead.png"},
		
		{id: "missile_launch",  src: "sfx/missile_launch.wav"},
		{id: "explosion_1",     src: "sfx/explosion_1.wav"},
		{id: "explosion_2",     src: "sfx/explosion_2.wav"},
		{id: "explosion_3",     src: "sfx/explosion_3.wav"},
		{id: "explosion_city",  src: "sfx/explosion_city.wav"},
	]);
	createjs.Sound.setVolume(0.02);
	app.queue.on("complete", function(){});
	app.game.init();
	app.game.update();
}