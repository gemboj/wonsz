/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
function Plane(input) {
    this.gl = input.gl;
    
    this.shader = typeof input.shader == "undefined" ? "testShader" : input.shader;

    Object3d.call(this, input);
}
Plane.prototype = Object.create(Object3d.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.init = function(gl) {
    Object3d.prototype.init.call(this, gl);
}

Plane.prototype.draw = function(gl, shader) {
    gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
};