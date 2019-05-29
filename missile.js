"use strict";
var app = app || {};

app.Missile = function(x,y,endX,endY,speed,target){
	this.target = target;
	this.x = x;
	this.y = y;
	this.startX = x;
	this.startY = y;
	this.endX = endX;
	this.endY = endY;
	this.active = true;
	this.width = 16;
	this.height = 16;
	
	this.points = 10;

	this.rotation = 0;
	this.speed = speed;
			
	this.exploding = false;
	this.explodeTimer = 0;
	this.explosionRadius = 0;
	
	var image = new Image();
	image.src = app.IMAGES['missile'];
	this.image = image;
	
	//calculate the missile velocity
	this.rotation = Math.atan2(-(this.x-this.endX),this.y-this.endY);
	this.vX = Math.sin(this.rotation) * this.speed;
	this.vY = -Math.cos(this.rotation) * this.speed;	
}
//handle the explosion logic
app.Missile.prototype.explode = function(){
	if(!this.exploding){
		this.exploding = true;
		var random = app.helper.getRandomInt(1,3);
		createjs.Sound.play("explosion_" + String(random));
	}
	if(this.target != undefined){
		var dist = app.helper.distance(this.target,this);
		if(dist <= 5){
			if(this.target.active){
				this.target.active = false;
				createjs.Sound.play("explosion_city");
			}
		}
	}
	this.endX = this.x;
	this.endY = this.y;
}
//handle the missile logic
app.Missile.prototype.update = function(dt){
	//explode
	var dist = app.helper.distance1(this.endX,this.endY,this.x,this.y);
	if(dist < 5){
		this.explode();
	}
	if(this.exploding){
		if(this.explodeTimer > 1.5){
			this.active = false;
		}
		this.explodeTimer += dt;
	}
	else{
		this.x += this.vX * dt;
		this.y += this.vY * dt;
	}
	//check for bounds
	if(this.target == undefined && this.y <= 10){
		this.active = false;
	}
	else if(this.target != undefined && this.y >= app.HEIGHT - 10){
		this.active = false;
	}
};
//draw the missile
app.Missile.prototype.draw = function(ctx){
	ctx.save();
	
	if(!this.exploding){//we are not exploding: draw the missile image
		//draw small red line to destination
		ctx.strokeStyle = "#FF0000";
		ctx.beginPath();
		ctx.moveTo(this.startX,this.startY);
		ctx.lineTo(this.x,this.y);
		ctx.stroke();
	
		//draw red target "X"
		if(this.target == undefined){
			ctx.beginPath();
			ctx.moveTo(this.endX - 3,this.endY - 3);
			ctx.lineTo(this.endX + 3,this.endY + 3);
			ctx.moveTo(this.endX - 3,this.endY + 3);
			ctx.lineTo(this.endX + 3,this.endY - 3);
			ctx.stroke();
		}
		//rotate the missile image
		ctx.translate(this.x,this.y);
		ctx.rotate(this.rotation);
		ctx.drawImage(this.image,-this.width/2,-this.height/2);
	}
	else{//we are exploding: draw the missile's explosion effect
		//prepare the explosion gradient
		var alpha = Math.max(0.05,Math.min(1,1 - (this.explodeTimer/1.5)));
		this.explosionRadius = this.explodeTimer*50;
		var gradient = ctx.createRadialGradient(this.endX,this.endY,1,this.endX,this.endY,this.explosionRadius);
		gradient.addColorStop(0,"rgba(255,0,0,"+alpha+")");
		gradient.addColorStop(1,"rgba(255,0,0,0)");
		
		//use the explosion gradient
		ctx.strokeStyle = gradient;
		ctx.fillStyle = gradient;
	
		//draw the explosion gradient
		ctx.beginPath();
		ctx.arc(this.endX,this.endY,this.explosionRadius,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
};