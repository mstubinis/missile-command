"use strict";

var app = app || {};
app.helper = {};

app.helper.clamp = function(val, min, max){
	return Math.max(min, Math.min(max, val));
}
app.helper.getRandom = function(min, max){
	return Math.random() * (max - min) + min;
}
app.helper.getRandomInt = function(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
app.helper.clear = function(ctx,x,y,w,h){
	ctx.clearRect(x,y,w,h); 
}
app.helper.rect = function(ctx,x,y,w,h,col){
	ctx.save();
	ctx.fillStyle = col;
	ctx.fillRect(x,y,w,h);
	ctx.restore();
}
app.helper.backgroundGradient = function(ctx,w,h){
	ctx.save();
	var grad=ctx.createLinearGradient(0,0,0,h);
	grad.addColorStop(0,"#000000");
	grad.addColorStop(0.4,"#000000");
	grad.addColorStop(0.85,"#110020");
	grad.addColorStop(1,"#c33e09");
	
	ctx.fillStyle = grad;
	ctx.fillRect(0,0,w,h);
	ctx.restore();	
}
app.helper.distance = function(objectA,objectB){
	var distX = objectB.x - objectA.x;
	var distY = objectB.y - objectA.y;
	var dist = Math.sqrt((distX*distX)+(distY*distY));
	return dist;	
}
app.helper.distance1 = function(x1,y1,x2,y2){
	var distX = x2 - x1;
	var distY = y2 - y1;
	var dist = Math.sqrt((distX*distX)+(distY*distY));
	return dist;	
}