/**
 * @argument {input} {} gl, collision, position, rotation
 * @argument {optional input} {} shader
 */
function SnakeTail(input) {
    this.positionMatrix = mat4.create();
    mat4.identity(this.positionMatrix);
    this.setPosition(input.position);
    mat4.rotate(this.positionMatrix, input.rotation, [0, 1, 0]);
    this.collision = input.collision;


    this.relativeHeadPositionMatrix = mat4.create();
    mat4.identity(this.relativeHeadPositionMatrix);
    this.absoluteHeadPositionMatrix = mat4.create();
    mat4.multiply(this.positionMatrix, this.relativeHeadPositionMatrix, this.absoluteHeadPositionMatrix);

    this.shader = typeof input.shader == "undefined" ? "basicShader" : input.shader;
    this.color = [0.0, 0.0, 1.0];
    this.moveRate = 0.2;
    this.radius = 0.1;
    this.numVertices = 20;
    this.elapsedTime = 0;
    this.rotateRate = 0.08;
    this.inverseRotation = false;

    this.collisionVec;
    this.collides = false;
    this.collisionBackBone = [input.position, input.position];
    this.lastCollision = this.collision.insertIntoGrid(this.collisionBackBone[this.collisionBackBone.length - 1], this.collisionBackBone[this.collisionBackBone.length - 1], this.radius);
    //this.backBoneQueue = [];

    this.keys = {left: 37, right: 39, up: 38, down: 40};

    this.basicTailVertices = this.setBasicVertices();
    this.basicTailNormals = this.setBasicNormals();

    this.tailVertices = [];
    this.tailNomals = [];
    this.tailIndexes = [];

    //this.snakeHead = new SnakeHead(gl, this.absoluteHeadPositionMatrix, this.numVertices, this.radius);

    this.initBuffers(input.gl, this.numVertices);
}

SnakeTail.prototype.draw = function(gl, shader) {
    gl.uniform4fv(shader.uniform.uColor, this.color);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(shader.attribute.aVertexPosition, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(shader.attribute.aVertexNormal, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays(gl.POINTS, 0, this.vertexPositionBuffer.numItems);
};

SnakeTail.prototype.update = function(gl, elapsed, scene) {
    if (!this.collides) {
        var tempVertexVec = [];
        var tempNormalVec = [];
        this.elapsedTime += elapsed;
        this.handleKeys(elapsed);

        if (this.elapsedTime / 1000 * this.moveRate > 0.1) {
            this.elapsedTime = 0;
        }
        else {
            this.removeLastStep();
            this.removeLastCollision();
        }
        
        this.collisionBackBone.push(this.getPositionVec());
        var backBoneLength = this.collisionBackBone.length;
        this.lastCollision = this.collision.insertIntoGrid(this.collisionBackBone[backBoneLength - 1], this.collisionBackBone[backBoneLength - 2], this.radius);

        mat4.translate(this.relativeHeadPositionMatrix, [0, 0, -elapsed / 1000 * this.moveRate]);
        for (var i = 0; i < this.numVertices; i++) {
            mat4.multiplyVec4(this.relativeHeadPositionMatrix, this.basicTailVertices[i], tempVertexVec);
            mat4.multiplyVec4(this.relativeHeadPositionMatrix, this.basicTailNormals[i], tempNormalVec);

            this.tailVertices.push(tempVertexVec[0],
                    tempVertexVec[1],
                    tempVertexVec[2]);

            this.tailNomals.push(tempNormalVec[0],
                    tempNormalVec[1],
                    tempNormalVec[2]);
        }
        var segmentsNum = this.tailVertices.length / 3 / this.numVertices - 2;


        if (this.inverseRotation) {
            var newIndex = this.numVertices - 1 + (segmentsNum * this.numVertices);
            this.tailIndexes.push(newIndex - this.numVertices + 1, newIndex, newIndex + 1, newIndex, newIndex + this.numVertices, newIndex + 1);
            for (var i = newIndex; i > newIndex - this.numVertices + 1; i--) {
                this.tailIndexes.push(i, i - 1, i + this.numVertices, i - 1, i + this.numVertices - 1, i + this.numVertices);
            }
            
        }
        else {
            var newIndex = segmentsNum * (this.numVertices);
            for (var i = newIndex; i < newIndex + this.numVertices - 1; i++) {
                this.tailIndexes.push(i, i + this.numVertices, i + 1, i + this.numVertices, i + this.numVertices + 1, i + 1);
            }
           
            this.tailIndexes.push(newIndex + this.numVertices - 1, newIndex + this.numVertices - 1 + this.numVertices, newIndex, newIndex + this.numVertices - 1 + this.numVertices, newIndex + this.numVertices, newIndex);
        }
        

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tailVertices), gl.STATIC_DRAW);
        this.vertexPositionBuffer.numItems = this.tailVertices.length / 3;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.tailIndexes), gl.STATIC_DRAW);
        this.indexBuffer.numItems = this.tailIndexes.length;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tailNomals), gl.STATIC_DRAW);
        this.normalBuffer.numItems = this.tailNomals.length / 3;

        mat4.multiply(this.positionMatrix, this.relativeHeadPositionMatrix, this.absoluteHeadPositionMatrix);

        this.checkCollision();
        if (this.collides) {
            var tempObj = scene.addObject(new ParticleEmitter({gl: gl, position: this.getPositionVec(), numParticles: 1000}));
            tempObj.shift(this.collisionVec);
        }
    }
    
    return 0;
};

SnakeTail.prototype.checkCollision = function() {
    var headPosition = this.getPositionVec();
    if (this.collisionVec = this.collision.checkCubeCollision(headPosition, this.radius)) {
        this.collides = true;
        //this.collisionVec = [0, 0, 0];
    }
    else if (this.collisionVec = this.collision.checkTailCollision(headPosition, this.radius, vec3.negate(this.getAbsoluteHeadDirection()))) {
        this.collides = true;
    }
};

SnakeTail.prototype.initBuffers = function(gl, num) {
    var tempVertexVec = [];
    var tempNormalVec = [];
    var tempMatrix = mat4.create();
    mat4.identity(tempMatrix);

    for (var i = 0; i < num; i++) {
        mat4.multiplyVec4(tempMatrix, this.basicTailVertices[i], tempVertexVec);
        mat4.multiplyVec4(tempMatrix, this.basicTailNormals[i], tempNormalVec);

        this.tailVertices.push(tempVertexVec[0],
                tempVertexVec[1],
                tempVertexVec[2]);

        this.tailNomals.push(tempNormalVec[0],
                tempNormalVec[1],
                tempNormalVec[2]);
    }
    ;

    for (var i = 0; i < num; i++) {

        mat4.multiplyVec4(tempMatrix, this.basicTailVertices[i], tempVertexVec);
        mat4.multiplyVec4(tempMatrix, this.basicTailNormals[i], tempNormalVec);

        this.tailVertices.push(tempVertexVec[0],
                tempVertexVec[1],
                tempVertexVec[2]);

        this.tailNomals.push(tempNormalVec[0],
                tempNormalVec[1],
                tempNormalVec[2]);
    }
    var segmentsNum = 0;

    var newIndex = segmentsNum * (num);
    for (var i = newIndex; i < newIndex + num - 1; i++) {
        this.tailIndexes.push(i, i + num, i + 1, i + num, i + num + 1, i + 1);
    }
    ;
    this.tailIndexes.push(newIndex + num - 1, newIndex + num - 1 + num, newIndex, newIndex + num - 1 + num, newIndex + num, newIndex);


    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tailVertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = this.tailVertices.length / 3;

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.tailIndexes), gl.STATIC_DRAW);
    this.indexBuffer.itemSize = 1;
    this.indexBuffer.numItems = this.tailIndexes.length;

    this.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tailNomals), gl.STATIC_DRAW);
    this.normalBuffer.itemSize = 3;
    this.normalBuffer.numItems = this.tailNomals.length / 3;
};

SnakeTail.prototype.handleKeys = function(elapsed) {

    if (inputHandler.keyboard.pressedKeys[this.keys.up]) {
        mat4.rotate(this.relativeHeadPositionMatrix, -degToRad(this.rotateRate * elapsed), [1, 0, 0]);
    }
    else if (inputHandler.keyboard.pressedKeys[this.keys.down]) {
        mat4.rotate(this.relativeHeadPositionMatrix, degToRad(this.rotateRate * elapsed), [1, 0, 0]);
    }
    ;

    if (inputHandler.keyboard.pressedKeys[this.keys.left]) {
        mat4.rotate(this.relativeHeadPositionMatrix, degToRad(this.rotateRate * elapsed), [0, 0, 1]);
        this.inverseRotation = true;
    }
    else if (inputHandler.keyboard.pressedKeys[this.keys.right]) {
        mat4.rotate(this.relativeHeadPositionMatrix, -degToRad(this.rotateRate * elapsed), [0, 0, 1]);
        this.inverseRotation = false;
    }


};


SnakeTail.prototype.setBasicVertices = function() {
    var vertices = [];
    for (var i = 0; i < this.numVertices; i++) {
        vertices.push([Math.sin(Math.PI / (this.numVertices / 2) * i) * this.radius, Math.cos(Math.PI / (this.numVertices / 2) * i) * this.radius, 0, 1]);
    }
    ;
    return vertices;
};

SnakeTail.prototype.setBasicNormals = function() {
    var normals = [];
    for (var i = 0; i < this.numVertices; i++) {
        normals.push([Math.sin(Math.PI / (this.numVertices / 2) * i), Math.cos(Math.PI / (this.numVertices / 2) * i), 0, 0]);
    }
    ;
    return normals;
};

SnakeTail.prototype.setPosition = function(position) {
    mat4.translate(this.positionMatrix, position);
};

SnakeTail.prototype.removeLastStep = function() {
    this.tailVertices.splice(this.tailVertices.length - this.numVertices * 3, this.numVertices * 3);
    this.tailNomals.splice(this.tailNomals.length - this.numVertices * 3, this.numVertices * 3);
    this.tailIndexes.splice(this.tailIndexes.length - this.numVertices * 6, this.numVertices * 6);
};

SnakeTail.prototype.removeLastCollision = function() {
    this.collisionBackBone.splice(this.collisionBackBone.length-1, 1);
    for(var i = 0; i < this.lastCollision.length; i++){
        this.lastCollision[i][0].splice(this.lastCollision[i][0].indexOf(this.lastCollision[i][1]), 1);
    }
};

SnakeTail.prototype.getPositionMatrix = function() {
    //mat4.multiply(this.positionMatrix, this.relativeHeadPositionMatrix, this.absoluteHeadPositionMatrix);
    var tempMatrix = mat4.create();
    mat4.set(this.absoluteHeadPositionMatrix, tempMatrix);
    return tempMatrix;
};

SnakeTail.prototype.getPositionVec = function() {
    var tempVec = [this.absoluteHeadPositionMatrix[12], this.absoluteHeadPositionMatrix[13], this.absoluteHeadPositionMatrix[14]];
    return tempVec;
};

SnakeTail.prototype.getAbsoluteHeadDirection = function() {
    var tempVec = [this.absoluteHeadPositionMatrix[8], this.absoluteHeadPositionMatrix[9], this.absoluteHeadPositionMatrix[10]];
    return tempVec;
};