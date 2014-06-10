/**
 * AABB
 * @argument {input} {} gl, position
 * @argument {optional input} {} shader, inverseNormals
 */
function Plane(input) {
    this.gl = input.gl;
    this.particleWidth = input.particleWidth;
    this.particleHeight = input.particleHeight;
    this.particleSlots = input.particleSlots;
    
    this.shader = typeof input.shader == "undefined" ? "testShader" : input.shader;
    this.tex = input.tex;
    this.texObj = input.texObj;
    Object3d.call(this, input);
}
Plane.prototype = Object.create(Object3d.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.init = function(gl) {
    Object3d.prototype.init.call(this, gl);
    var width = this.particleWidth,
            height = this.particleHeight,            
            slots = 2;
    this.particleCount = width * height;
    
    if (this.tex) {


        var UVCoords = new Float32Array(this.particleCount * slots * 2);

        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width * slots * 2; i += 2) {
                UVCoords[j * width * slots * 2 + i] = (i) / (width * slots * 2);
                UVCoords[j * width * slots * 2 + i + 1] = j / height;
            }
        }
        var x = this.gl.viewportWidth,
            y = this.gl.viewportHeight;
        
        var textureData = new Float32Array(this.particleCount * slots * 4);
        var pointSize = 1;
        for (var i = 0; i < this.particleCount * slots * 4; i += 4) {
            if ((i % (4 * slots)) == 0) {//pos
                  //korygowanie:     rozdzielczosci      wielkosci punktu;       pozycja kolejnego pixela    
                textureData[i] = (( (1-(x%2))/2) -      (1-(pointSize%2))/2 +   ((i/(4*slots))%width)*pointSize +  pointSize/2 -  ~~(width*pointSize/2) )* (1/(x/2));//Math.random() * 2 - 1;
                textureData[i + 1]=((-(1-(y%2))/2) -    (1-(pointSize%2))/2 - ~~((i/(4*slots))/width)*pointSize -  pointSize/2 +  ~~(height*pointSize/2))* (1/(y/2));//Math.random() * 2 - 1;
                textureData[i + 2] = 0;
                textureData[i + 3] = 1.0;
            }
            else {
                var modf = 0.0;
                textureData[i] = modf * (Math.random() - 0.5);
                textureData[i + 1] = modf * (Math.random() - 0.5);
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
        
        var temp = this.textures[1];
        this.textures[1] = this.texObj.textures[0];
        this.texObj.textures[0] = temp;
    }
    else{
        gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
};