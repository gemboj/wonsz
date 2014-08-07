/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
WONSZ.Cube = function(input) {
    WONSZ.Object3d.call(this, input);

    this.rotation = 0;
    this.rotationSpeed = 75;
    this.animation = typeof input.animation == "undefined" ? false : input.animation;
}

WONSZ.Cube.prototype = Object.create(WONSZ.Object3d.prototype);
WONSZ.Cube.prototype.constructor = WONSZ.Cube;

WONSZ.Cube.prototype.update = function(gl, elapsed, scene) {
    if (this.animation) {
        this.rotation = -(this.rotationSpeed * elapsed) / 1000.0;
        mat4.rotate(this.positionMatrix, degToRad(this.rotation), [1, 1, 1]);
    }
    return 0;
};