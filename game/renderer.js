function GameRenderer(gl) {
    //this.pMatrix = mat4.create();
    this.oMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.normalMatrix = mat3.create();
    //this.viewPorts = [];

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    /*this.basicShader = initShaders(gl, "basicFShader", "basicVShader",
            ["aVertexPosition", "aVertexNormal"],
            ["uPMatrix", "uMVMatrix", "uNMatrix", "uPointLightLocation", "uPointLightColor", "uAmbientLightColor", "uPointLightMinRange", "uPointLightMaxRange", "uColor"]);

    this.basicShaderT = initShaders(gl, "basicFShaderT", "basicVShaderT",
            ["aVertexPosition", "aVertexNormal", "aTextureCoord"],
            ["uPMatrix", "uMVMatrix", "uNMatrix", "uPointLightLocation", "uPointLightColor", "uAmbientLightColor", "uPointLightMinRange", "uPointLightMaxRange", "uTexture[0]", "uShininess", "uPointLightNumber"]);

    this.snakeShader = initShaders(gl, "snakeFShader", "snakeVShader",
            ["aVertexPosition", "aVertexNormal"],
            ["uMiddleRing", "uPMatrix", "uMVMatrix", "uNMatrix", "uPointLightLocation", "uPointLightColor", "uAmbientLightColor", "uPointLightMinRange", "uPointLightMaxRange", "uColor", "uSnakeLightLocation", "uSnakeLightColor", "uSnakeLightMinRange", "uSnakeLightMaxRange"]);

    this.particleShader = initShaders(gl, "particleFShader", "particleVShader",
            ["aParticlePosition", "aParticleVelocities"],
            ["uPMatrix", "uMVMatrix", "uColor", "uCurrentTime", "uMaxRange", "uLifeTime"]);*/

    this.testShader = initShaders(gl, "testFShader", "testVShader",
            ["aVertexPosition"], ["uViewPort", "uTime"]);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.DEPTH_TEST);
}

GameRenderer.prototype.drawFrame = function(gl, scene) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var j = 0; j < scene.cameras.length; j++) {
        var camera = scene.cameras[j];

        for (var shaderType in scene.objects) {
            this[shaderType](gl, scene, shaderType, camera); //calls method 'shaderType' of this - renderer            
        }
    }
};

GameRenderer.prototype.drawParticleShader = function(gl, scene, shaderType, camera) {
    //gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();
    gl.useProgram(this.particleShader);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];
        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        gl.uniformMatrix4fv(this.particleShader.uniform.uPMatrix, false, camera.getPerspectiveMatrix());
        gl.uniformMatrix4fv(this.particleShader.uniform.uMVMatrix, false, this.mvMatrix);

        object.draw(gl, this.particleShader);
    }
    //gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
};

GameRenderer.prototype.drawTestShader = function(gl, scene, shaderType, camera) {

    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);

    gl.useProgram(this.testShader);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];
        
        gl.uniform2fv(this.testShader.uniform.uViewPort, [camera.viewPort.x2, camera.viewPort.y2]);
        gl.uniform1f(this.testShader.uniform.uTime, scene.time);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
        gl.vertexAttribPointer(this.testShader.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        object.draw(gl, this.testShader);
    }
};

GameRenderer.prototype.drawDebugShader = function() {

};

GameRenderer.prototype.drawBasicShader = function(gl, scene, shaderType, camera) {
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();

    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.FRONT);

    gl.useProgram(this.basicShader);

    var lightArray = scene.pointLight;
    gl.uniform3fv(this.basicShader.uniform.uPointLightLocation, scene.getPointLightLocation(cameraMatrix, lightArray));
    gl.uniform3fv(this.basicShader.uniform.uPointLightColor, scene.getPointLightColor(lightArray));
    gl.uniform1fv(this.basicShader.uniform.uPointLightMinRange, scene.getPointLightMinRange(lightArray));
    gl.uniform1fv(this.basicShader.uniform.uPointLightMaxRange, scene.getPointLightMaxRange(lightArray));

    if (typeof scene.ambientLight.color == 'undefined') {
        scene.ambientLight.color = [0.0, 0.0, 0.0];
    }
    ;
    gl.uniform3fv(this.basicShader.uniform.uAmbientLightColor, scene.ambientLight.color);
    gl.uniformMatrix4fv(this.basicShader.uniform.uPMatrix, false, camera.getPerspectiveMatrix());


    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.basicShader.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.basicShader.uniform.uNMatrix, false, this.normalMatrix);

        object.draw(gl, this.basicShader);
    }
};

GameRenderer.prototype.drawBasicShaderT = function(gl, scene, shaderType, camera) {
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();

    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.FRONT);

    gl.useProgram(this.basicShaderT);

    var lightArray = scene.pointLight;
    gl.uniform3fv(this.basicShaderT.uniform.uPointLightLocation, scene.getPointLightLocation(cameraMatrix, lightArray));
    gl.uniform3fv(this.basicShaderT.uniform.uPointLightColor, scene.getPointLightColor(lightArray));
    gl.uniform1fv(this.basicShaderT.uniform.uPointLightMinRange, scene.getPointLightMinRange(lightArray));
    gl.uniform1fv(this.basicShaderT.uniform.uPointLightMaxRange, scene.getPointLightMaxRange(lightArray));
    gl.uniform1i(this.basicShaderT.uniform.uPointLightNumber, scene.pointLight.length);



    if (typeof scene.ambientLight.color == 'undefined') {
        scene.ambientLight.color = [0.0, 0.0, 0.0];
    }
    ;
    gl.uniform3fv(this.basicShaderT.uniform.uAmbientLightColor, scene.ambientLight.color);
    gl.uniformMatrix4fv(this.basicShaderT.uniform.uPMatrix, false, camera.getPerspectiveMatrix());


    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        gl.uniform1f(this.basicShaderT.uniform.uShininess, object.shininess);

        var textureUnits = [];

        for (var j = 0; j < object.textures.length; j++) {
            gl.activeTexture(gl["TEXTURE" + j]);
            gl.bindTexture(gl.TEXTURE_2D, object.textures[j]);
            textureUnits.push(j);
        }
        gl.uniform1iv(this.basicShaderT.uniform.uTexture, textureUnits);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.textureCoordBuffer);
        gl.vertexAttribPointer(this.basicShaderT.attribute.aTextureCoord, object.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
        gl.vertexAttribPointer(this.basicShaderT.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexNormalBuffer);
        gl.vertexAttribPointer(this.basicShaderT.attribute.aVertexNormal, object.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);

        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.basicShaderT.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.basicShaderT.uniform.uNMatrix, false, this.normalMatrix);

        object.draw(gl, this.basicShaderT);
    }
};


GameRenderer.prototype.drawSnakeShader = function(gl, scene, shaderType, camera) {
//ADD NORMAL POINT LIGHT FIRST, THEN SNAKE LIGHT    

    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();



    gl.useProgram(this.snakeShader);

    var lightArray = scene.pointLight;
    gl.uniform3fv(this.snakeShader.uniform.uPointLightLocation, scene.getPointLightLocation(cameraMatrix, lightArray));
    gl.uniform3fv(this.snakeShader.uniform.uPointLightColor, scene.getPointLightColor(lightArray));
    gl.uniform1fv(this.snakeShader.uniform.uPointLightMinRange, scene.getPointLightMinRange(lightArray));
    gl.uniform1fv(this.snakeShader.uniform.uPointLightMaxRange, scene.getPointLightMaxRange(lightArray));

    gl.uniform1f(this.snakeShader.uniform.uMiddleRing, typeof camera.middleRing === "undefined" ? 1.0 : 0.0/*camera.middleRing*/);

    gl.uniform3fv(this.snakeShader.uniform.uAmbientLightColor, scene.ambientLight.color);
    gl.uniformMatrix4fv(this.snakeShader.uniform.uPMatrix, false, camera.getPerspectiveMatrix());

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];
        if (object instanceof SnakeTail) {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.FRONT);
        }
        else {
            gl.disable(gl.CULL_FACE);
        }

        var currentViewPortHead;
        if ((object instanceof SnakeHead) && (object.tail == camera.object)) {
            currentViewPortHead = object;
            continue;
        }

        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.snakeShader.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.snakeShader.uniform.uNMatrix, false, this.normalMatrix);

        object.draw(gl, this.snakeShader);
    }
    if (typeof currentViewPortHead != "undefined") {
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);


        mat4.multiply(cameraMatrix, currentViewPortHead.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.snakeShader.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.snakeShader.uniform.uNMatrix, false, this.normalMatrix);
        currentViewPortHead.draw(gl, this.snakeShader);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }
};



function ViewPort(camera, x1, y1, x2, y2) {
    this.camera = camera;
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
}