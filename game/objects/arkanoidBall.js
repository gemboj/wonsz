function ArkanoidBall(input) {
    Object3d.call(this, input);
    this.velY = 0.1;
    this.velX = 0.1;
    this.keys = {left: 37, right: 39, up: 38, down: 40};
}

ArkanoidBall.prototype = Object.create(Object3d.prototype);
ArkanoidBall.prototype.constructor = ArkanoidBall;

ArkanoidBall.prototype.update = function(gl, elapsed, scene) {
    mat4.translate(this.positionMatrix, [this.velX, this.velY, 0]);
    var posVec = this.getPositionVec();
   
    if ((posVec[0] < -5) || (posVec[0] > 5)) {
        this.velX *= -1;
    }

    if ((posVec[1] < -2) || (posVec[1] > 4)) {
        this.velY *= -1;
    }
    var objects = scene.objects["drawBasicShaderT"];
    for (var i = 0; i < objects.length; i++) {
        var tempObj = objects[i];
        if (tempObj instanceof ArkanoidPaddle) {
            if(SqDistPointAABB(posVec, tempObj.AABB) < 0.3*0.3){
                this.velY *= -1;
            }
        }
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