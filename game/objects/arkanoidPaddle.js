WONSZ.ArkanoidPaddle = function(input) {
    WONSZ.Object3d.call(this, input);
    this.velX = 0.05;
    this.keys = {left: 37, right: 39, up: 38, down: 40};

}

WONSZ.ArkanoidPaddle.prototype = Object.create(WONSZ.Object3d.prototype);
WONSZ.ArkanoidPaddle.prototype.constructor = WONSZ.ArkanoidPaddle;

WONSZ.ArkanoidPaddle.prototype.update = function(gl, elapsed, scene) {
    this.handleKeys(elapsed);
    this.updatePositionInCollisionGrid();
    if (this.positionMatrix[12] < -5) {

        this.positionMatrix[12] = -5
    }
    if(this.positionMatrix[12] > 5){

       this.positionMatrix[12] = 5
    }
}

WONSZ.ArkanoidPaddle.prototype.handleKeys = function(elapsed) {
    if (inputHandler.keyboard.pressedKeys[this.keys.left]) {
       this.translate([-this.velX, 0, 0]);
    }
    if (inputHandler.keyboard.pressedKeys[this.keys.right]) {
        this.translate([this.velX, 0, 0]);
    }
}
