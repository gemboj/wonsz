/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
function Plane(input) {
    var gl = input.gl;

    this.shader = typeof input.shader == "undefined" ? "testShader" : input.shader;
    this.tex = input.tex;
    this.texObj = input.texObj;
    Object3d.call(this, input);
}
Plane.prototype = Object.create(Object3d.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.init = function(gl) {
    Object3d.prototype.init.call(this, gl);
    var width = 4,
            height = width,            
            slots = 1;
    this.particleCount = width * height;
    
    if (this.tex) {


        var UVCoords = new Float32Array(this.particleCount * slots * 2);

        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width * slots * 2; i += 2) {
                UVCoords[j * width * slots * 2 + i] = (i) / (width * slots * 2);
                UVCoords[j * width * slots * 2 + i + 1] = j / height;
            }
        }
        var x = 1/1920,
            y = 1/961;
        
        var textureData = new Float32Array(this.particleCount * slots * 4);

        for (var i = 0; i < this.particleCount * slots * 4; i += 4) {
            if ((i % (4 * slots)) == 0) {//pos
                textureData[i] = x * (500 + i/8) ;//Math.random();
                textureData[i + 1] = y * (500);//Math.random();
                textureData[i + 2] = 0;
                textureData[i + 3] = 1;
            }
            else {
                textureData[i] = Math.random();
                textureData[i + 1] = Math.random();
                textureData[i + 2] = 0;
                textureData[i + 3] = 1;
            }

        }
        //gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width * slots, height, 0, gl.RGBA, gl.FLOAT, textureData);
        gl.bindTexture(gl.TEXTURE_2D, null);


    }
    var UVCoords = new Float32Array(this.particleCount * slots);

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width * slots; i += 2) {
            UVCoords[j * width * slots + i] = (i) / (width * slots);
            UVCoords[j * width * slots + i + 1] = j / height;
        }
    }

    this.UVCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.UVCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, UVCoords, gl.STATIC_DRAW);
    this.UVCoordsBuffer.itemSize = 2;
    this.UVCoordsBuffer.numItems = UVCoords.length / 2;
}

Plane.prototype.draw = function(gl, shader) {
    

    if (!this.tex) {
        gl.drawArrays(gl.POINTS, 0, this.particleCount);
        
        var temp = this.textures[0];
        this.textures[0] = this.texObj.textures[0];
        this.texObj.textures[0] = temp;
    }
    else{
        gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
};