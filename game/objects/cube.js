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