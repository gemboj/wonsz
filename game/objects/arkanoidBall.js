WONSZ.ArkanoidBall = function(input) {
    WONSZ.Object3d.call(this, input);


    this.respawnTime = 2000;
	this.started = false;
    this.speed = 0.10;
    this.lives = input.lives;
    var tempVec = [Math.random()-0.5, Math.random(), 0, 0];
    vec3.normalize(tempVec);
    this.velY = tempVec[1] * this.speed;
    this.velX = tempVec[0] * this.speed;
    this.keys = {left: 37, right: 39, up: 38, down: 40};
	this.cubesTotal = input.cubesTotal;
	this.gameover = input.gameover;
}

WONSZ.ArkanoidBall.prototype = Object.create(WONSZ.Object3d.prototype);
WONSZ.ArkanoidBall.prototype.constructor = WONSZ.ArkanoidBall;

WONSZ.ArkanoidBall.prototype.start = function(){
	this.started = true;
}

WONSZ.ArkanoidBall.prototype.addFollowLight = function(kulkaLight){
	this.kulkaLight = kulkaLight;
}

WONSZ.ArkanoidBall.prototype.update = function(gl, elapsed, scene) {
	if(!this.started) return;
    //this.rotate(0.05, 0.05, 0.05);
    if(this.respawnTime > 0){
        this.respawnTime -= elapsed;
        return;
    };
    
    //mat4.translate(this.positionMatrix, [this.velX, this.velY, 0]);
    this.translate([this.velX, this.velY, 0]);
    var posVec = this.getPositionVec();


    this.computeBoundingVolume();
	this.updatePositionInCollisionGrid();
	var ballAabb = this.getBoundingVolume();
    var collisionObject = this.collisionGrid.checkBoundingVolumeCollision(this.getBoundingVolume());
    if (collisionObject) {
        if (collisionObject.special == "AAPlane") {
            if(collisionObject.side == 'bottom'){                
                this.lives.left--;
				
				var el = this.lives.textures[0];
                    this.lives.textures.shift();
                    this.lives.textures.push(el);
				
                if(this.lives.left == 0){
					scene.addObject(this.gameover);
					scene.removeObject(this);
					scene.removePointLight(this.kulkaLight);
					var particle = new WONSZ.ParticleEmitter({gl: gl, positionMatrix: this.getPositionMatrix(), 
                                                 numParticles: 1000, radius: 0.1, texture: this.textures[0],
                                                 particles: this.model.boundingParticles, 
                                                 velocities: this.model.boundingParticlesVelocities, 
                                                 colors: this.model.boundingParticlesColors});
                    //scene.return = true;
					scene.addObject(particle);
                }
                else{
                    
                    this.setPosition([0, 0, -10]);
                    
                    var tempVec = [Math.random()-0.5, Math.random(), 0];
                    vec3.normalize(tempVec);
                    this.velY = tempVec[1] * this.speed;
                    this.velX = tempVec[0] * this.speed;
                    this.respawnTime = 2000;
					return;
                }
                
            }
			
			switch(collisionObject.side){
				case "bottom":
					var bvXDiff = collisionObject.point[1] - ballAabb.min[1];
					var translateVec = [0, bvXDiff, 0];
					break;
				case "top":
					var bvXDiff = collisionObject.point[1] - ballAabb.max[1];
					var translateVec = [0, bvXDiff, 0];
					break;
				case "left":
					var bvXDiff = collisionObject.point[0] - ballAabb.min[0];
					var translateVec = [bvXDiff, 0, 0];
					break;
				case "right":
					var bvXDiff = collisionObject.point[0] - ballAabb.max[0];
					var translateVec = [bvXDiff, 0, 0];
					break;
			}
			
			this.translate(translateVec);
            
            this.velX *= collisionObject.vector[0] != 0 ? -1 : 1;
            this.velY *= collisionObject.vector[1] != 0 ? -1 : 1;
            
            

        }
        else {

            if (!(collisionObject instanceof WONSZ.ArkanoidPaddle)) {
                scene.removeObject(collisionObject);
				this.cubesTotal--;
				if(this.cubesTotal == 0){
					scene.return = true;
				}
				
				var particle = new WONSZ.ParticleEmitter({gl: gl, positionMatrix: collisionObject.getPositionMatrix(), 
                                                 numParticles: 1000, radius: 0.1, texture: collisionObject.textures[0],
                                                 particles: collisionObject.model.boundingParticles, 
                                                 velocities: collisionObject.model.boundingParticlesVelocities, 
                                                 colors: collisionObject.model.boundingParticlesColors});
												 
				scene.addObject(particle);
            }

            var tempVec = [];
            vec3.subtract(this.getPositionVec(), collisionObject.getPositionVec(), tempVec);
            vec3.normalize(tempVec);
            this.velY = tempVec[1] * this.speed;
            this.velX = tempVec[0] * this.speed;
            
            //particle.addTexture(new WONSZ.Texture({gl: gl, src: new Uint8Array([155,155,155, 255]), width: 1, height: 1}), 0);
            //scene.addObject(particle);
        }
    }
}