WONSZ.ArkanoidBall = function(input) {
    WONSZ.Object3d.call(this, input);


    this.respawnTime = 2000;
    this.speed = 0.3;
    this.lives = input.lives;
    var tempVec = [1, 1, 0];
    vec3.normalize(tempVec);
    this.velY = tempVec[1] * this.speed;
    this.velX = tempVec[0] * this.speed;
    this.keys = {left: 37, right: 39, up: 38, down: 40};
}

WONSZ.ArkanoidBall.prototype = Object.create(WONSZ.Object3d.prototype);
WONSZ.ArkanoidBall.prototype.constructor = WONSZ.ArkanoidBall;

WONSZ.ArkanoidBall.prototype.update = function(gl, elapsed, scene) {
    if(this.respawnTime > 0){
        this.respawnTime -= elapsed;
        return;
    };
    
    mat4.translate(this.positionMatrix, [this.velX, this.velY, 0]);
    var posVec = this.getPositionVec();


    this.computeBoundingVolume();
    var collisionObject = this.collision.checkBoundingVolumeCollision(this.model.boundingVolume);
    if (collisionObject) {
        if (collisionObject.special == "AAPlane") {
            if(collisionObject.side == 'bottom'){                
                this.lives.left--;
                if(this.lives.left == 0){
                    scene.return = true;
                }
                else{
                    var el = this.lives.textures[0];
                    this.lives.textures.shift();
                    this.lives.textures.push(el);
                    this.setPosition([0, 0, -10]);
                    
                    var tempVec = [1, 1, 0];
                    vec3.normalize(tempVec);
                    this.velY = tempVec[1] * this.speed;
                    this.velX = tempVec[0] * this.speed;
                    this.respawnTime = 2000;
                   return;
                }
                
            }
            
            this.velX *= collisionObject.vector[0] != 0 ? -1 : 1;
            this.velY *= collisionObject.vector[1] != 0 ? -1 : 1;
            
            

        }
        else {

            if (!(collisionObject instanceof WONSZ.ArkanoidPaddle)) {
                scene.removeObject(collisionObject);
            }

            var tempVec = [];
            vec3.subtract(this.getPositionVec(), collisionObject.getPositionVec(), tempVec);
            vec3.normalize(tempVec);
            this.velY = tempVec[1] * this.speed;
            this.velX = tempVec[0] * this.speed;
            scene.addObject(new WONSZ.ParticleEmitter({gl: gl, positionMatrix: collisionObject.getPositionMatrix(), 
                                                 numParticles: 1000, radius: 0.1, texture: collisionObject.textures[0],
                                                 particles: collisionObject.model.boundingParticles, 
                                                 velocities: collisionObject.model.boundingParticlesVelocities, 
                                                 colors: collisionObject.model.boundingParticlesColors}));
        }
    }
}