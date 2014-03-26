/**
 * @argument {input} {} gl, 
 * @argument {optional input} {} viewAngle, minViewDist, maxViewDist
 */
function Camera(input) {
    this.cameraMatrix = mat4.create();
    mat4.identity(this.cameraMatrix);
    this.gl = input.gl;
    
    this.viewPort = {};
    this.perspectiveMatrix;// = input.perspectiveMatrix;
    this.viewAngle = typeof input.viewAngle == "undefined" ? 90 : input.viewAngle;
    this.minViewDist = typeof input.minViewDist == "undefined" ? 0.01 : input.minViewDist;
    this.maxViewDist = typeof input.maxViewDist == "undefined" ? 40 : input.maxViewDist;
}

Camera.prototype.getPositionVec = function(){
    var temp = [this.cameraMatrix[12], this.cameraMatrix[13], this.cameraMatrix[14]];
    return temp;
}

Camera.prototype.getCameraMatrix = function() {
    var inverseCamera = mat4.create();
    mat4.inverse(this.cameraMatrix, inverseCamera);
    return inverseCamera;
};

Camera.prototype.setCameraMatrix = function(matrix) {
    this.cameraMatrix = matrix;
};

Camera.prototype.rotateCameraMatrixX = function(angle){
    mat4.rotateX(this.cameraMatrix, angle);
};
Camera.prototype.rotateCameraMatrixY = function(angle){
    mat4.rotateY(this.cameraMatrix, angle);
};
Camera.prototype.rotateCameraMatrixZ = function(angle){
    mat4.rotateZ(this.cameraMatrix, angle);
};

Camera.prototype.setPerspectiveMatrix = function(matrix) {
    this.perspectiveMatrix = matrix;
};

Camera.prototype.getPerspectiveMatrix = function() {
    return this.perspectiveMatrix;
};

Camera.prototype.adjustView = function(i, maxi, width, height) {
    if (maxi === 1) {
        this.setViewPort({x1: 0, y1: 0, x2: width, y2: height});
    }
    else if (maxi === 2) {
        this.setViewPort({x1: i * width / 2, y1: 0, x2: width / 2, y2: height});
    }
    else if (maxi === 3) {
        this.setViewPort({x1: i * width / 3, y1: 0, x2: width / 3, y2: height});
    }
    else if (maxi === 4) {
        this.setViewPort({x1: (i % 2) * width / 2, y1: ((i < 2) ? 0 : 1) * height / 2, x2: width / 2, y2: height / 2});
    }
    
    var pMatrix = mat4.create();
    mat4.identity(pMatrix);
    mat4.perspective(this.viewAngle, this.viewPort.x2 / this.viewPort.y2, this.minViewDist, this.maxViewDist, pMatrix);
    this.setPerspectiveMatrix(pMatrix);
};

Camera.prototype.setViewPort = function(viewPort) {
    this.viewPort = viewPort;
};

Camera.prototype.getViewPort = function() {
    return this.viewPort;
};

Camera.prototype.update = function() {

};

/**
 * @argument {input} {} position
 * @argument {optional input} {} movement
 */
function CameraBasic(input) {
    Camera.call(this, input);

    this.rotateRate = 0.1;
    this.moveRate = typeof input.moveRate == "undefined" ? false : input.moveRate;
    this.movement = typeof input.movement == "undefined" ? false : input.movement;
    mat4.translate(this.cameraMatrix, input.position);
}
CameraBasic.prototype = Object.create(Camera.prototype);
CameraBasic.prototype.constructor = CameraBasic;

CameraBasic.prototype.update = function(elapsed) {
    Camera.prototype.update.call(this);

    if (this.movement) {
        if (inputHandler.keyboard.pressedKeys[73]) {
            mat4.rotate(this.cameraMatrix, -degToRad(this.rotateRate * elapsed), [1, 0, 0]);
        }
        else if (inputHandler.keyboard.pressedKeys[75]) {
            mat4.rotate(this.cameraMatrix, degToRad(this.rotateRate * elapsed), [1, 0, 0]);
        }

        if (inputHandler.keyboard.pressedKeys[85]) {
            mat4.rotate(this.cameraMatrix, degToRad(this.rotateRate * elapsed), [0, 1, 0]);

        }
        else if (inputHandler.keyboard.pressedKeys[79]) {
            mat4.rotate(this.cameraMatrix, -degToRad(this.rotateRate * elapsed), [0, 1, 0]);
        }


        if (inputHandler.keyboard.pressedKeys[74]) {
            mat4.rotate(this.cameraMatrix, degToRad(this.rotateRate * elapsed), [0, 0, 1]);
        }
        else if (inputHandler.keyboard.pressedKeys[76]) {
            mat4.rotate(this.cameraMatrix, -degToRad(this.rotateRate * elapsed), [0, 0, 1]);
        }

        if (inputHandler.keyboard.pressedKeys[72]) {
            mat4.translate(this.cameraMatrix, [0, 0, this.moveRate]);
        }
        else if (inputHandler.keyboard.pressedKeys[89]) {
            mat4.translate(this.cameraMatrix, [0, 0, -this.moveRate]);
        }
    }
};

/**
 * @param {object} input Obligatory: object,
 *                       Optional: 
 */
function CameraFollow(input) {
    Camera.call(this, input);

    this.object = input.object;
    this.cameraMatrix = input.object.getPositionMatrix();
    this.distance = 0.15;
    mat4.translate(this.cameraMatrix, [0.0, 0.0, this.distance]);
}

CameraFollow.prototype = Object.create(Camera.prototype);
CameraFollow.prototype.constructor = CameraFollow;

CameraFollow.prototype.update = function(elapsed) {
    Camera.prototype.update.call(this);

    this.cameraMatrix = this.object.getPositionMatrix();
    mat4.translate(this.cameraMatrix, [0.0, 0.0, this.distance]);
};