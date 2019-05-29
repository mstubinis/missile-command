"use strict";

var app = app || {};
app.Turret = function(x,y,keyboardButton){
	//Constants
	this.STARTING_AMMO = 20;
	
	this.keyboardButton = keyboardButton;
	this.x = x;
	this.y = y;
	this.active = true;
	this.width = 32;
	this.height = 32;
	this.rotation = 0;
	this.ammo = this.STARTING_AMMO;
	this.justFired = false;
	
	var image = new Image();
	var image1 = new Image();
	image.src = app.IMAGES['turretBase'];
	image1.src = app.IMAGES['turretGun'];
	this.image = image;
	this.imageGun = image1;	
}
app.Turret.prototype.reset = function(){
	this.ammo = this.STARTING_AMMO;
};
app.Turret.prototype.update = function(roundOverTimer,dt){
	if( app.keydown[this.keyboardButton] && roundOverTimer < 0.01){
		this.fire(this.dt);
	}else{
		this.justFired = false;
	}
};
app.Turret.prototype.fire = function(dt){
	//only fire if we have ammo and only once per mouse click
	if(this.ammo > 0 && this.justFired == false){
		var xOffset = (this.width/2+2) * Math.sin(this.rotation);
		var yOffset = (this.height/2+2) * Math.cos(this.rotation);
		
		//spawn the player missile and make it fire towards the mouse cursor
		if(app.mouse.y < this.y)
			app.game.playerMissiles.push(new app.Missile(this.x + xOffset,this.y - yOffset,app.mouse.x,app.mouse.y,300));
		else
			app.game.playerMissiles.push(new app.Missile(this.x + xOffset,this.y - yOffset,app.mouse.x,this.y,300));
		this.ammo--;
		createjs.Sound.play("missile_launch");
		this.justFired = true;
	}
};
//draw the turret
app.Turret.prototype.draw = function(ctx){
	ctx.save();
	
	//draw ammo text
	ctx.fillStyle="#FFFFFF";
	ctx.font="12px Verdana";
	ctx.fillText(String(this.ammo),this.x-ctx.measureText(String(this.ammo)).width/2,this.y+this.height/2+12);

	//draw base
	ctx.drawImage(this.image,this.x-this.width/2,this.y-this.height/2);
	
	//rotate the gun image so it faces the mouse cursor
	ctx.translate(this.x,this.y);
	if(app.mouse.y < this.y)
		this.rotation = Math.atan2(-(this.x-app.mouse.x),this.y - app.mouse.y);
	ctx.rotate(this.rotation);
	
	//draw gun image
	ctx.drawImage(this.imageGun,-this.width/2,-this.height/2);
	
	ctx.restore();
};