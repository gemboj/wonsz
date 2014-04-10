function Object3d(input) {
    this.positionMatrix = mat4.create();
    mat4.identity(this.positionMatrix);
    this.color = typeof input.color == "undefined" ? [0, 0, 0, 0] : input.color;
    this.shader = typeof input.shader == "undefined" ? "drawBasicShaderT" : input.shader;
    this.model = input.model.getModel();
    this.shininess = typeof input.shininess == "undefined" ? 0 : input.shininess;
    this.textures = [];
    this.inverseNormals = typeof input.inverseNormals == "undefined" ? false : input.inverseNormals;
    this.setPositionMatrix(input.position);

    this.collisionGridCoords = [];
    this.collision = input.collision;
    this.init(input.gl);
}

Object3d.prototype.destructor = function(){
    this.collision.deleteObject(this);
}

Object3d.prototype.draw = function(gl, shader) {
    gl.drawElements(gl.TRIANGLES, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays(gl.POINTS, 0, this.vertexPositionBuffer.numItems);
};

Object3d.prototype.update = function(gl, elapsed, scene) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), gl.STATIC_DRAW);
}

Object3d.prototype.init = function(gl) {
    if (this.inverseNormals) {
        for (var i = 0; i < this.model.normals.length; i++) {
            this.model.normals[i] *= -1;
        }
    }


    for (var i = 0; i < this.model.textures.length; i++) {
        this.textures[i] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([this.color[0] * 255, this.color[1] *255, this.color[2]*255, this.color[3]*255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        if (this.model.textures.length > 0) {
            var wait = function(i) {
                if (!this.model.texturesLoaded[i]) {
                    console.log("loading");
                    setTimeout(wait.bind(this, i), 100);
                } else {
                    this.textures[i].image = this.model.textures[i];
                    gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                    /*gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);*/
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textures[i].image);
                    /*gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                     gl.bindTexture(gl.TEXTURE_2D, null);*/
                }
            }
            wait.bind(this, i)();
        }

    }
    if (this.model.textures.length == 0) {
        this.textures[0] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([this.color[0] * 255, this.color[1] *255, this.color[2]*255, this.color[3]*255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }


    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = this.model.vertices.length / 3;

    this.vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.model.indices), gl.STATIC_DRAW);
    this.vertexIndexBuffer.itemSize = 1;
    this.vertexIndexBuffer.numItems = this.model.indices.length;

    this.vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.normals), gl.STATIC_DRAW);
    this.vertexNormalBuffer.itemSize = 3;
    this.vertexNormalBuffer.numItems = this.model.normals.length / 3;

    this.textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.textureCoords), gl.STATIC_DRAW);
    this.textureCoordBuffer.itemSize = 2;
    this.textureCoordBuffer.numItems = this.model.textureCoords.length / 2;
};

Object3d.prototype.setPositionMatrix = function(position) {
    mat4.translate(this.positionMatrix, position);
};

Object3d.prototype.getPositionMatrix = function() {

    var tempMatrix = mat4.create();
    mat4.set(this.positionMatrix, tempMatrix);
    return tempMatrix;
};

Object3d.prototype.getPositionVec = function() {

    var tempVec = vec3.create();
    vec3.set([this.positionMatrix[12], this.positionMatrix[13], this.positionMatrix[14]], tempVec);
    return tempVec;
};

Object3d.prototype.scale = function(scale) {
    mat4.scale(this.positionMatrix, scale);
    
};

Object3d.prototype.rotate = function(angleX, angleY, angleZ) {
    mat4.rotate(this.positionMatrix, angleX, [1, 0, 0]);
    mat4.rotate(this.positionMatrix, angleY, [0, 1, 0]);
    mat4.rotate(this.positionMatrix, angleZ, [0, 0, 1]);
};

Object3d.prototype.translate = function(arr) {
    this.positionMatrix[12] += arr[0];
    this.positionMatrix[13] += arr[1];
    this.positionMatrix[14] += arr[2];
    
    //mat4.translate(this.positionMatrix, [arr[0] * (1/this.positionMatrix[0]), arr[1] * (1/this.positionMatrix[5]), arr[2] * (1/this.positionMatrix[10])]);
};

Object3d.prototype.computeBoundingVolume = function(){    
    this.model.boundingVolume.computeBoundingVolume(this.getPositionMatrix());
}

Object3d.prototype.insertIntoCollision = function(collsion){
    this.computeBoundingVolume();
    this.collisionGridCoords = collsion.insertObject(this);
    
}