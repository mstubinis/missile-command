"use strict";

app.game = {
	// CONSTANT properties
    WIDTH : 800, 
    HEIGHT: 600,
	
	ENEMY_MISSILE_SPEED: 45,                       //how fast the enemy missiles travel
	ENEMY_SPAWN_RATE: 60,			               //spawn rate of enemy SHIPS
	ENEMY_MISSILE_SPAWN_RATE: 60,	               //spawn rate of enemy MISSILES (NOT FROM THE SHIPS, THOSE ARE SEPARATE IN THE ENEMY CLASS)
	
	ENEMY_MISSILE_COUNT: 60,                       //total amount of missiles that need to be destroyed to advance a level
	ENEMY_MISSILE_SCORE: 10,	                   //how many points the enemy missiles give when destroyed
	TURRET_AMMO_SCORE: 10,                         //how many points each missile in a turret gives at the end of the round
	
	STATE_MAIN_MENU: "MAIN_MENU",
	STATE_MAIN_MENU_INSTRUCTIONS: "INSTRUCTIONS",
	STATE_GAME: "GAME",
	STATE_GAME_OVER: "OVER",
	
	titleImage: undefined,
    canvas: undefined,
    ctx: undefined,
	helper: undefined,
	
	gameState: "",
	lastGameState: "",

	buttonInstructions: undefined,
	buttonPlay: undefined,
	buttonPlayAgain: undefined,
	buttonBack: undefined,
	
	turrets: [],
	enemies: [],
	cities: [],
	playerMissiles: [],
	enemyMissiles: [],
	
	dt: 1/60.0,
	enemyMissileSpawnRate: 0,
	enemyMissileCount: 0,
	enemyMissileSpeed: 0,
	score: 0,
	bonusScoreCities: 0,
	bonusScoreAmmo: 0,
	level: 1,
	finalScoreTimer: 0,
	gameOverTimer: 0,
	finalScoreTimerEnd: 0,
	finalAddTimer: 0,
	finalCities: [],
	finalAmmo: 0,
	finalAmmoCount: 0,
	finalCitiesAmount: 0,
	finalCitiesCount: 0,
	app: undefined,
    
	init: function(){
		// declare properties
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		
		// set up some variables
		this.enemyMissileSpawnRate = this.ENEMY_MISSILE_SPAWN_RATE;
		this.gameState = this.STATE_MAIN_MENU;
		this.enemyMissileSpeed = this.ENEMY_MISSILE_SPEED;
		
		// title image
		this.titleImage = new Image();
		this.titleImage.src = app.IMAGES["title"];
		
		// set up buttons
		var font = "24px Verdana";
		this.buttonInstructions = new app.MenuButton(this.ctx,font,"Instructions",this.WIDTH/2,this.HEIGHT/2 + 70);
		this.buttonPlay         = new app.MenuButton(this.ctx,font,"Play",this.WIDTH/2,this.HEIGHT/2 + 150);
		this.buttonBack         = new app.MenuButton(this.ctx,font,"Back",100,this.HEIGHT-100);
		this.buttonPlayAgain    = new app.MenuButton(this.ctx,font,"Play Again",this.WIDTH/2,this.HEIGHT-240);
		
		// set up player turrets
		this.turrets.push(new app.Turret(this.WIDTH/2,  this.HEIGHT-50, app.KEYBOARD.KEY_S))//CENTER;
		this.turrets.push(new app.Turret(50,            this.HEIGHT-50, app.KEYBOARD.KEY_A))//LEFT;
		this.turrets.push(new app.Turret(this.WIDTH-50, this.HEIGHT-50, app.KEYBOARD.KEY_D))//RIGHT;
		
		//set up cities
		this.cities.push(new app.City("city1",120,this.HEIGHT - 40));
		this.cities.push(new app.City("city1",220,this.HEIGHT - 40));
		this.cities.push(new app.City("city1",320,this.HEIGHT - 40));
		this.cities.push(new app.City("city1",480,this.HEIGHT - 40));
		this.cities.push(new app.City("city1",580,this.HEIGHT - 40));
		this.cities.push(new app.City("city1",680,this.HEIGHT - 40));
		
	},
	// reset the game variables as if a new level is loaded
	resetGame: function(){
		this.enemyMissileCount = 0;
		this.finalScoreTimerEnd = 0;
		this.finalCitiesCount = 0;
		this.finalCitiesAmount = 0;
		this.finalCities = [];
		this.playerMissiles = [];
		this.enemyMissiles = [];
		this.finalAmmoCount = 0;
		this.finalAmmo = 0;
		
		//keep score from bonus
		var total = this.score + this.bonusScoreAmmo + this.bonusScoreCities;
		this.score = total;
		
		this.bonusScoreCities = 0;
		this.bonusScoreAmmo = 0;
		
		this.finalScoreTimer = 0;
		this.gameOverTimer = 0;
		for(var i = 0; i < this.turrets.length; i++){ this.turrets[i].reset(); }
		for(var i = 0; i < this.cities.length; i++){ this.cities[i].reset(); }
	},
	//advance 1 level further
	advanceLevel: function(){
		this.resetGame();

		this.level++;
		this.enemyMissileSpeed++;
		this.enemyMissileSpawnRate++;
	},
	fireTurretsFromTouchDevice: function(){
		var selected_turret = this.turrets[0];
		for(var i = 0; i < this.turrets.length; i++){
			var dist1 = app.helper.distance(selected_turret,app.mouse);
			var dist2 = app.helper.distance(this.turrets[i],app.mouse);
			
			if(dist2 < dist1){
				selected_turret = this.turrets[i];
			}
		}
		selected_turret.fire(app.game.dt);
	},
	updateGameSprites: function(){
		//move and handle sprites
		for(var i=0; i < this.playerMissiles.length; i++){
			this.playerMissiles[i].update(this.dt);
			this.checkMissileCollisions(this.playerMissiles[i]);
		}
		for(var i=0; i < this.enemyMissiles.length; i++){
			this.enemyMissiles[i].update(this.dt);
		}
		for(var i=0; i < this.turrets.length; i++){
			this.turrets[i].update(this.finalScoreTimer,this.dt);
		}
		//remove the non active elements from the arrays
		this.playerMissiles = this.playerMissiles.filter(function(missile){ return missile.active; });
		this.enemyMissiles = this.enemyMissiles.filter(function(missile){ return missile.active; });		
	},
	//update the round ending
	updateRoundOver: function(){
		//only update the round over after all enemy missiles have been destroyed
		if(this.enemyMissileCount >= this.ENEMY_MISSILE_COUNT && this.enemyMissiles.length == 0){
			//calculate how long adding up the points will take
			if(this.finalScoreTimer == 0){
				for(var i = 0; i < this.turrets.length; i++){
					this.finalAmmo += this.turrets[i].ammo;
				}
				for(var i = 0; i < this.cities.length; i++){
					if(this.cities[i].active == true){
						this.finalCities.push(this.cities[i]);
					}
				}
				this.finalCitiesAmount = this.finalCities.length;
				this.finalScoreTimerEnd = (0.1 * this.finalAmmo) + (0.5 * this.finalCities.length) + 8;
			}
			this.finalScoreTimer += this.dt;
			//advance the level, and start it
			if(this.finalScoreTimer >= this.finalScoreTimerEnd && this.finalScoreTimerEnd > 0){
				this.advanceLevel();
			}
		}
	},
	//spawns the missiles that come from the sky
	spawnRandomMissiles: function(){
		//check if any cities are alive
		var count = 0;
		for(var i = 0; i < this.cities.length; i++){
			if(this.cities[i].active == true){
				count++;
			}
		}
		//exit this method if all the cities have been destroyed
		if(count == 0){
			this.gameOverTimer += this.dt;
			if(this.gameOverTimer > 1.0){
				this.setGameState(this.STATE_GAME_OVER);
			}
			return; 
		}
		//only spawn missiles if there are enemy missiles left
		if(this.enemyMissileCount < this.ENEMY_MISSILE_COUNT){
			var chance = app.helper.getRandomInt(0,5000);
			if(chance <= this.enemyMissileSpawnRate){
				//randomly place the missile along the horizontal axis of the canvas
				var randomX = app.helper.getRandomInt(0,this.WIDTH);
				
				//pick a random city for the missile to target, then spawn the missile.
				var randomCity = this.cities[app.helper.getRandomInt(0,this.cities.length-1)];
				this.enemyMissiles.push(new app.Missile(randomX,5,randomCity.x,randomCity.y,this.enemyMissileSpeed,randomCity));
				this.enemyMissileCount++;
			}
		}
	},
	//check if player missile explosion collides with any enemy missiles
	checkMissileCollisions: function(playerMissile){
		//is the player missile actually exploding?
		if(playerMissile.exploding == true){
			for(var j = 0; j < this.enemyMissiles.length; j++){
				var dist = app.helper.distance(this.enemyMissiles[j],playerMissile);
				if(dist <= playerMissile.explosionRadius && this.enemyMissiles[j].exploding == false){
					this.enemyMissiles[j].explode();		
					this.score += this.ENEMY_MISSILE_SCORE;
				}
			}
		}
	},
	//draws the main menu state
	drawMenu: function(ctx){
		ctx.save();
	
		//clear and draw background
		ctx.fillStyle = "black";
		ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
		ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
		
		//draw title
		ctx.drawImage(this.titleImage,this.WIDTH/2-256,this.HEIGHT/2-128);
		
		//draw my name
		ctx.fillStyle="#FFFFFF";
		ctx.font = "22px Verdana";
		var text = "By Mike Tubinis"
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+270);

		//draw buttons
		this.buttonInstructions.draw(this.ctx);
		this.buttonPlay.draw(this.ctx);

		ctx.restore();
	},
	//draws the instructions for the game
	drawMenuInstructions: function(ctx){
		//clear and draw background
		ctx.fillStyle = "black";
		ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
		ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
		
		//draw instructions
		ctx.fillStyle = "white";
		ctx.font = "28px Verdana";
		var text = "Instructions:";
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+60);

		ctx.font = "18px Verdana";
		text = "Fire missiles at the location of the mouse cursor.";
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+120);
		text = "Try to hit the enemy missiles before they hit your cities!"
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+150);
		text = "Be careful as you only have a limited amount of ammo."
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+180);
		
		ctx.font = "28px Verdana";
		var text = "Controls:";
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+240);
		
		ctx.font = "18px Verdana";
		text = "A: Fire left turret    S: Fire center turret    D: Fire right turret";
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width+300);
		
		//draw back button
		this.buttonBack.draw(this.ctx);
	},
	//draws the round over elements (adding up the score)
	drawRoundOver: function(ctx){
		ctx.save();
		
		//draw background rectangle
		ctx.fillStyle = "#222222";
		ctx.lineWidth = 2;
		ctx.strokeStyle = "white";
		
		ctx.fillRect(this.WIDTH/2-200,this.HEIGHT/2-100,400,200);
		ctx.strokeRect(this.WIDTH/2-200,this.HEIGHT/2-100,400,200);
		
		//draw level complete!
		ctx.fillStyle = "white";
		ctx.font = "18px Verdana";
		var text = "Level " + String(this.level) + " complete!";
		ctx.fillText(text,this.WIDTH/2 - ctx.measureText(text).width/2,this.HEIGHT/2-100 + ctx.measureText("m").width+3);
		
		//visually add the bonus city and ammo scores
		if(this.finalScoreTimer > 1.0){
			if(this.finalAddTimer > 0.5 && this.finalCities.length > 0){
				this.bonusScoreCities += this.finalCities[this.finalCities.length-1].points;
				this.finalCities.splice(this.finalCities.length-1,1);
				this.finalAddTimer = 0;
				this.finalCitiesCount++;
			}
			if(this.finalAddTimer > (this.finalCitiesAmount * 0.5) + 0.1 && this.finalAmmo > 0){
				this.bonusScoreAmmo += this.TURRET_AMMO_SCORE;
				this.finalAmmo--;
				this.finalAddTimer = (this.finalCitiesAmount * 0.5);
				this.finalAmmoCount++;
			}
			this.finalAddTimer += this.dt;
		}
		
		//draw score
		text = "Score: " + String(this.score + this.bonusScoreCities + this.bonusScoreAmmo)
		ctx.fillText(text,this.WIDTH/2 - 190,this.HEIGHT/2-100 + (ctx.measureText("m").width+7)*3);
		if(this.finalCitiesCount > 0){
			text = String(this.finalCitiesCount) + " cities left ("+String(this.bonusScoreCities)+ " bonus points)";
			ctx.fillText(text,this.WIDTH/2 - 190,this.HEIGHT/2-100 + (ctx.measureText("m").width+7)*4);
		}
		if(this.finalAmmoCount > 0){
			text = String(this.finalAmmoCount) + " ammo left ("+String(this.bonusScoreAmmo)+ " bonus points)";
			ctx.fillText(text,this.WIDTH/2 - 190,this.HEIGHT/2-100 + (ctx.measureText("m").width+7)*5);
		}
		ctx.restore();
	},
	//draws the game over elements when the player loses, as well as the play again button
	drawGameOver: function(ctx){
		//clear and draw background
		ctx.fillStyle = "black";
		ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
		ctx.fillRect(0,0,this.WIDTH,this.HEIGHT);
		
		//draw game over text
		ctx.fillStyle = "white";
		ctx.font = "28px Verdana";
		var text = "Game Over!";
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width/2 + 250);
		
		text = "Your final score: " + String(this.score);
		ctx.fillText(text,this.WIDTH/2-ctx.measureText(text).width/2,ctx.measureText("m").width/2 + 300);

		//draw play again button
		this.buttonPlayAgain.draw(this.ctx);
	},
	//draws the sprites during the actual game play
	drawGame: function(ctx){
		//clear and draw background
		ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
		app.helper.backgroundGradient(ctx,this.WIDTH,this.HEIGHT);
		
		//draw cities
		for(var i=0; i < this.cities.length; i++){ this.cities[i].draw(ctx); }
		//draw turrets
		for(var i=0; i < this.turrets.length; i++){ this.turrets[i].draw(ctx); }
		//draw player missiles
		for(var i=0; i < this.playerMissiles.length; i++){ this.playerMissiles[i].draw(ctx); }
		//draw enemy missiles
		for(var i=0; i < this.enemyMissiles.length; i++){ this.enemyMissiles[i].draw(ctx); }
		
		
		//draw score
		ctx.save();

		ctx.fillStyle = "white";
		ctx.font = "18px Verdana";
		ctx.fillText("Score: " + String(this.score + this.bonusScoreCities + this.bonusScoreAmmo),10,ctx.measureText("m").width+2);
		
		//draw level
		ctx.fillText("Level: " + String(this.level),this.WIDTH/2-ctx.measureText("Level: " + String(this.level)).width/2,ctx.measureText("m").width+2);
		
		ctx.restore();
		
		//draw paused indicator
		if(app.paused == true && this.gameState == this.STATE_GAME){
			ctx.save();

			ctx.strokeStyle = "white";
			ctx.lineWidth="2";
			ctx.fillStyle = "white";
			var text = "PAUSED";
			
			//draw background rectangle
			ctx.beginPath();
			ctx.rect(this.WIDTH/2 - ctx.measureText(text).width/2 - 30,this.HEIGHT/2 - 30, ctx.measureText(text).width + 60, 45);
			ctx.stroke();
			
			//draw font
			ctx.font = "20px Verdana";
			ctx.fillText(text,this.WIDTH/2 - ctx.measureText(text).width/2,this.HEIGHT/2);
			
			ctx.restore();
		}
		//draw up the round ending
		if(this.finalScoreTimer > 0.01){
			this.drawRoundOver(ctx);
		}		
	},
	//sets the game's current state. A function is used here to keep track of the last game state, for the back button
	setGameState: function(state){
		this.lastGameState = this.gameState;
		this.gameState = state;
	},
	//update the elements of the main menu
	updateMenu: function(){
		//update instructions and play buttons
		this.buttonInstructions.update(this.dt,app.mouse.x,app.mouse.y);
		this.buttonPlay.update(this.dt,app.mouse.x,app.mouse.y);
		
		//if play button is clicked, move to the game state
		if(this.buttonPlay.isClickedOn() == true){
			this.setGameState(this.STATE_GAME);
		}
		//otherwise if instructions button is clicked, move to the instructions state
		else if(this.buttonInstructions.isClickedOn() == true){
			this.setGameState(this.STATE_MAIN_MENU_INSTRUCTIONS);
		}
	},
	//update the elements within the main menu's instructions section
	updateMenuInstructions: function(){
		//update back button
		this.buttonBack.update(this.dt,app.mouse.x,app.mouse.y);
		
		//if back button is clicked, go back to the last state
		if(this.buttonBack.isClickedOn() == true){
			this.setGameState(this.lastGameState);
		}
	},
	//update the elements when the player loses
	updateGameOver: function(){
		//update play again button
		this.buttonPlayAgain.update(this.dt,app.mouse.x,app.mouse.y);
		
		//reset the game variables as if level 1 was loaded
		if(this.buttonPlayAgain.isClickedOn() == true){
			this.resetGame();
			this.enemyMissileSpeed = this.ENEMY_MISSILE_SPEED;
			this.enemyMissileSpawnRate = this.ENEMY_MISSILE_SPAWN_RATE;
			this.score = 0;
			this.level = 1;
			this.setGameState(this.STATE_GAME);
		}
	},
	//main update method that calls the various update and draw functions
	update: function(){
		//UPDATE
		if(!app.paused){
			switch(this.gameState){
				case this.STATE_MAIN_MENU:
					this.updateMenu(); break;
				case this.STATE_MAIN_MENU_INSTRUCTIONS:
					this.updateMenuInstructions(); break;
				case this.STATE_GAME:
					this.updateGameSprites();
					this.spawnRandomMissiles();
					this.updateRoundOver(); break;
				case this.STATE_GAME_OVER:
					this.updateGameOver(); break;
			}
		}
		//DRAW
		switch(this.gameState){
			case this.STATE_MAIN_MENU:
				this.drawMenu(this.ctx); break;
			case this.STATE_MAIN_MENU_INSTRUCTIONS:
				this.drawMenuInstructions(this.ctx); break;
			case this.STATE_GAME:
				this.drawGame(this.ctx); break;
			case this.STATE_GAME_OVER:
				this.drawGameOver(this.ctx); break;
		}
		app.justClicked = false;
		app.justTouched = false;
		app.currentKey = undefined;
		requestAnimationFrame(this.update.bind(this));
	}
};