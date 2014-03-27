function ArkanoidPaddle(input) {
    Object3d.call(this, input);
    this.velX = 0.05;
    this.keys = {left: 37, right: 39, up: 38, down: 40};

    this.AABB = [{min: -1.4, max: 1.4}, {min: -0.15, max: 0.15}]
}

ArkanoidPaddle.prototype = Object.create(Object3d.prototype);
ArkanoidPaddle.prototype.constructor = ArkanoidPaddle;

ArkanoidPaddle.prototype.update = function(gl, elapsed, scene) {
    this.handleKeys(elapsed);
    this.computeBoundingVolume();
    this.collision.updateObject(this);
    if (this.positionMatrix[12] < -5) {

        this.positionMatrix[12] = -5
    }
    if(this.positionMatrix[12] > 5){

       this.positionMatrix[12] = 5
    }
}

ArkanoidPaddle.prototype.handleKeys = function(elapsed) {
    if (inputHandler.keyboard.pressedKeys[this.keys.left]) {
        mat4.translate(this.positionMatrix, [-this.velX, 0, 0]);
    }
    if (inputHandler.keyboard.pressedKeys[this.keys.right]) {
        mat4.translate(this.positionMatrix, [this.velX, 0, 0]);
    }
}
