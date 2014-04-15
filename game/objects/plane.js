/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
function Plane(input) {
    Object3d.call(this, input);
    this.shader = "drawTestShader"
}

Plane.prototype = Object.create(Object3d.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.draw = function(gl, shader) {
    gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
};