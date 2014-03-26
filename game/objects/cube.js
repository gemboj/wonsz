/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
function Cube(input) {
    Object3d.call(this, input);

    this.rotation = 0;
    this.rotationSpeed = 75;
    this.animation = typeof input.animation == "undefined" ? false : input.animation;

    this.AABB = {
        left: -1,
        right: 1,
        top: 1,
        bottom: -1,
        far: -1,
        near: 1
    }
}

Cube.prototype = Object.create(Object3d.prototype);
Cube.prototype.constructor = Cube;

Cube.prototype.update = function(gl, elapsed, scene) {
    if (this.animation) {
        this.rotation = -(this.rotationSpeed * elapsed) / 1000.0;
        mat4.rotate(this.positionMatrix, degToRad(this.rotation), [1, 1, 1]);
    }
    return 0;
};


Cube.prototype.getAABB = function() {
    var AABB = {};
    var position = this.getPositionVec();
    AABB.min = [this.AABB.left + position[0], this.AABB.bottom + position[1], this.AABB.far + position[2]];
    AABB.max = [this.AABB.right + position[0], this.AABB.top + position[1], this.AABB.near + position[2]];
    return AABB;
};