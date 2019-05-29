"use strict";
var app = app || {};
app.MenuButton = function(ctx,font,text,x,y){
	this.text = text;
	ctx.font = font;
	this.padding = 14;
	this.font = font;
	this.x = x;
	this.y = y;
	this.width = ctx.measureText(this.text).width;
	this.height = ctx.measureText("m").width;
	this.mouseOver = false;
}
//update the menu button logic
app.MenuButton.prototype.update = function(dt,mX,mY){
	if(mX < this.x-this.width/2-this.padding/2 || mX > this.x+this.width/2+this.padding/2 || mY < this.y-this.height/2-this.padding/2 || mY > this.y+this.height/2+this.padding/2)
	   this.mouseOver = false;
	else{
		this.mouseOver = true;
	}
};
//returns true if the mouse is over the button and the left mouse button is clicked
app.MenuButton.prototype.isClickedOn = function(){
	if(this.mouseOver == true && app.justClicked == true)
		return true;
	return false;
}
//draws the menu button
app.MenuButton.prototype.draw = function(ctx){
	ctx.save();
	
	//draw background rect
	if(this.mouseOver){
		ctx.fillStyle = "#FFFF00";
	}else{
		ctx.fillStyle = "#222222";
	}
	ctx.fillRect(this.x-this.width/2-this.padding/2,this.y-this.height/2-this.padding/2,this.width+this.padding,this.height+this.padding);
	
	//draw text
	ctx.font = this.font;
	if(this.mouseOver){
		ctx.fillStyle = "black";
	}else{
		ctx.fillStyle = "white";
	}
	ctx.fillText(this.text,this.x-this.width/2,this.y+this.height/2-2);
	
	ctx.restore();
};