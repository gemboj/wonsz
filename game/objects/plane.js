/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
function Plane(input) {
    var gl = input.gl;
    Object3d.call(this, input);
    this.shader = typeof input.shader == "undefined" ? "testShader" : input.shader;


}
Plane.prototype = Object.create(Object3d.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.init = function(gl) {
    Object3d.prototype.init.call(this, gl);
    var width = 8,
        height = 8,
        count = width * height;
    var UVarray = new Uint8Array(count);

    for (var i = 0; i < count; i++) {
        UVarray[i] = 1;
    }

    var textureData = [];//new Float32Array(count * 4);

    for (var i = 0; i < count * 4; i += 4) {
        textureData.push(0.5);//i / (count * 4) * 255;
        textureData.push(0.5);
        textureData.push(0.5);
        textureData.push(0.5);
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, new Float32Array([0.5, 0.0, 0.0, 1.0]));
    gl.bindTexture(gl.TEXTURE_2D, null);

}

Plane.prototype.draw = function(gl, shader) {
    gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
};