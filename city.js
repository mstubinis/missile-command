"use strict";
var app = app || {};

app.City = function(img,x,y){
	this.x = x;
	this.y = y;
	this.active = true;
	this.width = 64;
	this.height = 32;
	
	this.points = 250; //how many points the city awards the player if it is alive at the end of a round

	var image = new Image();
	var imageDead = new Image();
	image.src = app.IMAGES[img];
	imageDead.src = app.IMAGES[img + "Dead"]
	this.image = image;
	this.imageDead = imageDead;	
}
app.City.prototype.reset = function(){
	this.active = true;
}
app.City.prototype.draw = function(ctx){
	ctx.save();

	if(this.active == true){
		ctx.drawImage(this.image,this.x-this.width/2,this.y-this.height/2);
	}else{
		ctx.drawImage(this.imageDead,this.x-this.width/2,this.y-this.height/2);
	}
	
	ctx.restore();
};

