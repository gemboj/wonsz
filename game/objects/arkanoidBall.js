function ArkanoidBall(input) {
    Object3d.call(this, input);

    this.speed = 0.3;

    var tempVec = [1, 1, 0];
    vec3.normalize(tempVec);
    this.velY = tempVec[1] * this.speed;
    this.velX = tempVec[0] * this.speed;
    this.keys = {left: 37, right: 39, up: 38, down: 40};
}

ArkanoidBall.prototype = Object.create(Object3d.prototype);
ArkanoidBall.prototype.constructor = ArkanoidBall;

ArkanoidBall.prototype.update = function(gl, elapsed, scene) {
    mat4.translate(this.positionMatrix, [this.velX, this.velY, 0]);
    var posVec = this.getPositionVec();


    this.computeBoundingVolume();
    var collisionObject = this.collision.checkBoundingVolumeCollision(this.model.boundingVolume);
    if (collisionObject) {
        if (collisionObject.special == "AAPlane") {
            if(collisionObject.side == 'bottom'){                
                scene.return = true;
            }
            
            this.velX *= collisionObject.vector[0] != 0 ? -1 : 1;
            this.velY *= collisionObject.vector[1] != 0 ? -1 : 1;
            
            

        }
        else {

            if (!(collisionObject instanceof ArkanoidPaddle)) {
                scene.removeObject(collisionObject);
            }

            var tempVec = [];
            vec3.subtract(this.getPositionVec(), collisionObject.getPositionVec(), tempVec);
            vec3.normalize(tempVec);
            this.velY = tempVec[1] * this.speed;
            this.velX = tempVec[0] * this.speed;
            scene.addObject(new ParticleEmitter({gl: gl, positionMatrix: collisionObject.getPositionMatrix(), 
                                                 numParticles: 1000, radius: 0.1, texture: collisionObject.textures[0],
                                                 particles: collisionObject.model.boundingParticles, 
                                                 velocities: collisionObject.model.boundingParticlesVelocities, 
                                                 colors: collisionObject.model.boundingParticlesColors}));
        }
    }
}