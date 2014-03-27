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

    if (posVec[0] < -5) {
        this.velX *= -1;
        this.positionMatrix[12] = -5
    }
    if(posVec[0] > 5){
        this.velX *= -1;
       this.positionMatrix[12] = 5
    }

    if (posVec[1] < -2) {
        this.velY *= -1;
        this.positionMatrix[13] = -2
    }
    if(posVec[1] > 4){
        this.velY *= -1;
        this.positionMatrix[13] = 4
    }

    this.computeBoundingVolume();
    var collisionObject = this.collision.checkBoundingVolumeCollision(this.model.boundingVolume);
    if (collisionObject) {
        if (collisionObject instanceof Cube) {
            scene.removeObject(collisionObject);
        }
        var tempVec = [];
        vec3.subtract(this.getPositionVec(), collisionObject.getPositionVec(), tempVec);
        vec3.normalize(tempVec);
        this.velY = tempVec[1] * this.speed;
        this.velX = tempVec[0] * this.speed;
        scene.addObject(new ParticleEmitter({gl: gl, position: this.getPositionVec(), numParticles: 1000, radius: 0.1}));
    }
}

function SqDistPointAABB(p, b) {
    var sqDist = 0;
    for (var i = 0; i < 2; i++) {
        var v = p[i];
        if (v < b[i].min)
            sqDist += (b[i].min - v) * (b[i].min - v);
        if (v > b[i].max)
            sqDist += (v - b[i].max) * (v - b[i].max);
    }
    return sqDist;
}