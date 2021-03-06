WONSZ.GameRenderer = function (gl) {
    //this.pMatrix = mat4.create();
    this.oMatrix = mat4.create();
    this.mvMatrix = mat4.create();
    this.normalMatrix = mat3.create();
    //this.viewPorts = [];
    this.lastShader = null;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);


    var initShaders = WONSZ.utility.initShaders;

    this.basicShaderProgram = initShaders(gl, "basicFShader", "basicVShader",
            ["aVertexPosition", "aVertexNormal"],
            ["uPMatrix", "uMVMatrix", "uNMatrix", "uPointLightLocation", "uPointLightColor", "uAmbientLightColor", "uPointLightMinRange", "uPointLightMaxRange", "uColor"]);


    this.basicShaderTProgram = initShaders(gl, "basicFShaderT", "basicVShaderT",
            ["aVertexPosition", "aVertexNormal", "aTextureCoord"],
            ["uPMatrix", "uMVMatrix", "uNMatrix", "uPointLightLocation", "uPointLightColor", "uAmbientLightColor", "uPointLightMinRange", "uPointLightMaxRange", "uTexture[0]", "uShininess", "uPointLightNumber"]);


    this.snakeShaderProgram = initShaders(gl, "snakeFShader", "snakeVShader",
            ["aVertexPosition", "aVertexNormal"],
            ["uMiddleRing", "uPMatrix", "uMVMatrix", "uNMatrix", "uPointLightLocation", "uPointLightColor", "uAmbientLightColor", "uPointLightMinRange", "uPointLightMaxRange", "uColor", "uSnakeLightLocation", "uSnakeLightColor", "uSnakeLightMinRange", "uSnakeLightMaxRange"]);


    this.particleShaderProgram = initShaders(gl, "particleFShader", "particleVShader",
            ["aParticleVelocities", "aParticlePosition", "aParticleColor"],
            ["uPMatrix", "uMVMatrix", "uCurrentTime", "uMaxRange", "uLifeTime"]);

    this.testShaderProgram = initShaders(gl, "testFShader", "testVShader",
            ["aVertexPosition"],
            ["uViewPort", "uTime"]);

    //Render
    this.particleTextureRShaderProgram = initShaders(gl, "particleTextureRFShader", "particleTextureRVShader",
            ["aUVCoords"],
            ["uTexture", "uTexture2", "uWidth", "uHeight", "uPointSize"]);

    //Physics    
    this.particleTexturePShaderProgram = initShaders(gl, "particleTexturePFShader", "particleTexturePVShader",
            ["aVertexPosition"],
            ["uTexture", "uViewPort", "uMouseDown", "uMousePos", "uStop"]);

    this.interfaceShaderProgram = initShaders(gl, "interfaceFShader", "interfaceVShader",
            ["aVertexPosition", "aTextureCoords"],
            ["uTexture", "uViewPort", "uWidth", "uHeight", "uMVMatrix"]);
            
    this.debugShaderProgram = initShaders(gl, "debugFShader", "debugVShader",
            ["aVertexPosition"],
            ["uPMatrix", "uCameraMatrix", "uColor"]);
            
    if (!gl.getExtension('OES_texture_float'))
        alert('Float textures not supported');

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.DEPTH_TEST);
}

WONSZ.GameRenderer.prototype.renderToTexture = function(gl, scene, texture, frameBuffer) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.getTexture(), 0);

    this.drawFrame(gl, scene);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

WONSZ.GameRenderer.prototype.drawFrame = function(gl, scene) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i in scene.preRenderScenes) {
        var preRenderScene = scene.preRenderScenes[i];
        
        this.renderToTexture(gl, preRenderScene.scene, preRenderScene.object.textures[preRenderScene.textureUnit], preRenderScene.object.frameBuffers[preRenderScene.frameBufferUnit]);
        
        if(typeof preRenderScene.renderingNum != "undefined"){
            preRenderScene.renderingNum--;
            if(preRenderScene.renderingNum == 0){
                var index = scene.preRenderScenes.indexOf(preRenderScene);
                scene.preRenderScenes.splice(index, 1);
            }
        }
    }

    for (var j = 0; j < scene.cameras.length; j++) {
        var camera = scene.cameras[j];

        for (var shaderType in scene.objects) {
            if (this.lastShader != shaderType) {
                WONSZ.utility.getAULocations(gl, this[shaderType + "Program"]);
            }
            this.lastShader = shaderType;
            this[shaderType](gl, scene, shaderType, camera); //calls method 'shaderType' of this - renderer

        }
    }
};

WONSZ.GameRenderer.prototype.interfaceShader = function(gl, scene, shaderType, camera) {
    gl.enable(gl.BLEND);
    
    gl.useProgram(this.interfaceShaderProgram);

    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        gl.activeTexture(gl["TEXTURE0"]);
        gl.bindTexture(gl.TEXTURE_2D, object.textures[0].getTexture());
        gl.uniform1i(this.interfaceShaderProgram.uniform.uTexture, 0);

        gl.uniform2fv(this.interfaceShaderProgram.uniform.uViewPort, [camera.viewPort.x2, camera.viewPort.y2]);
        gl.uniform1f(this.interfaceShaderProgram.uniform.uWidth, object.textures[0].getWidth());
        gl.uniform1f(this.interfaceShaderProgram.uniform.uHeight, object.textures[0].getHeight());

        gl.bindBuffer(gl.ARRAY_BUFFER, object.textureCoordBuffer);
        gl.vertexAttribPointer(this.interfaceShaderProgram.attribute.aTextureCoords, object.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
        gl.vertexAttribPointer(this.interfaceShaderProgram.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(this.interfaceShaderProgram.uniform.uMVMatrix, false, object.positionMatrix);

        object.draw(gl, this.interfaceShaderProgram);
    }
    
    gl.disable(gl.BLEND);
};

WONSZ.GameRenderer.prototype.debugShader = function(gl, scene, shaderType, camera) {
    gl.useProgram(this.debugShaderProgram);
    //gl.enable(gl.DEPTH_TEST);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);

    var cameraMatrix = camera.getCameraMatrix();
    gl.uniformMatrix4fv(this.debugShaderProgram.uniform.uCameraMatrix, false, cameraMatrix);
    

    gl.uniformMatrix4fv(this.debugShaderProgram.uniform.uPMatrix, false, camera.getPerspectiveMatrix());


    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];
        
        object.draw(gl, this.debugShaderProgram);
    }
    //gl.disable(gl.DEPTH_TEST);
}

WONSZ.GameRenderer.prototype.particleTextureRShader = function(gl, scene, shaderType, camera) {
    gl.useProgram(this.particleTextureRShaderProgram);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, object.textures[1].getTexture());
        gl.uniform1i(this.particleTextureRShaderProgram.uniform.uTexture, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, object.textures[0].getTexture());
        gl.uniform1i(this.particleTextureRShaderProgram.uniform.uTexture2, 1);
        gl.uniform1f(this.particleTextureRShaderProgram.uniform.uPointSize, object.pointSize);
    
        gl.uniform1i(this.particleTextureRShaderProgram.uniform.uWidth, object.particleWidth);
        gl.uniform1i(this.particleTextureRShaderProgram.uniform.uHeight, object.particleHeight);
        gl.bindBuffer(gl.ARRAY_BUFFER, object.UVCoordsBuffer);
        gl.vertexAttribPointer(this.particleTextureRShaderProgram.attribute.aUVCoords, object.UVCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

        object.draw(gl, this.particleTextureRShaderProgram);
    }
}

WONSZ.GameRenderer.prototype.particleTexturePShader = function(gl, scene, shaderType, camera) {
    gl.useProgram(this[shaderType + "Program"]);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, object.textures[0].getTexture());
        gl.uniform1i(this.particleTexturePShaderProgram.uniform.uTexture, 0);

        gl.uniform2fv(this.particleTexturePShaderProgram.uniform.uViewPort, [camera.viewPort.x2, camera.viewPort.y2]);
        gl.uniform2fv(this.particleTexturePShaderProgram.uniform.uMousePos, [inputHandler.mouse.position.x, inputHandler.mouse.position.y]);
        gl.uniform1i(this.particleTexturePShaderProgram.uniform.uMouseDown, inputHandler.mouse.down);
        gl.uniform1i(this.particleTexturePShaderProgram.uniform.uStop, inputHandler.keyboard.pressedKeys[32]);
        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
        gl.vertexAttribPointer(this.particleTexturePShaderProgram.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        object.draw(gl, this.particleTexturePShaderProgram);
    }
}

WONSZ.GameRenderer.prototype.particleShader = function(gl, scene, shaderType, camera) {
    //gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();
    gl.useProgram(this.particleShaderProgram);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];
        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        gl.uniformMatrix4fv(this.particleShaderProgram.uniform.uPMatrix, false, camera.getPerspectiveMatrix());
        gl.uniformMatrix4fv(this.particleShaderProgram.uniform.uMVMatrix, false, this.mvMatrix);

        object.draw(gl, this.particleShaderProgram);
    }
    //gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
};

WONSZ.GameRenderer.prototype.testShader = function(gl, scene, shaderType, camera) {
    gl.useProgram(this.testShaderProgram);

    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    //gl.viewport(0, 0, 512, 512);

    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        gl.uniform2fv(this.testShaderProgram.uniform.uViewPort, [camera.viewPort.x2, camera.viewPort.y2]);
        gl.uniform1f(this.testShaderProgram.uniform.uTime, scene.time);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
        gl.vertexAttribPointer(this.testShaderProgram.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        object.draw(gl, this.testShaderProgram);
    }
};

WONSZ.GameRenderer.prototype.basicShader = function(gl, scene, shaderType, camera) {
    gl.useProgram(this.basicShaderProgram);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();

    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.FRONT);



    var lightArray = scene.pointLight;
    gl.uniform3fv(this.basicShaderProgram.uniform.uPointLightLocation, scene.getPointLightLocation(cameraMatrix, lightArray));
    gl.uniform3fv(this.basicShaderProgram.uniform.uPointLightColor, scene.getPointLightColor(lightArray));
    gl.uniform1fv(this.basicShaderProgram.uniform.uPointLightMinRange, scene.getPointLightMinRange(lightArray));
    gl.uniform1fv(this.basicShaderProgram.uniform.uPointLightMaxRange, scene.getPointLightMaxRange(lightArray));

    if (typeof scene.ambientLight.color == 'undefined') {
        scene.ambientLight.color = [0.0, 0.0, 0.0];
    }
    ;
    gl.uniform3fv(this.basicShaderProgram.uniform.uAmbientLightColor, scene.ambientLight.color);
    gl.uniformMatrix4fv(this.basicShaderProgram.uniform.uPMatrix, false, camera.getPerspectiveMatrix());


    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.basicShaderProgram.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.basicShaderProgram.uniform.uNMatrix, false, this.normalMatrix);

        object.draw(gl, this.basicShaderProgram);
    }
};

WONSZ.GameRenderer.prototype.basicShaderT = function(gl, scene, shaderType, camera) {
    gl.useProgram(this.basicShaderTProgram);
    //gl.viewport(0, 0, 512, 512);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);

    var cameraMatrix = camera.getCameraMatrix();
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.BACK);



    var lightArray = scene.pointLight;
    gl.uniform3fv(this.basicShaderTProgram.uniform.uPointLightLocation, scene.getPointLightLocation(cameraMatrix, lightArray));
    gl.uniform3fv(this.basicShaderTProgram.uniform.uPointLightColor, scene.getPointLightColor(lightArray));
    gl.uniform1fv(this.basicShaderTProgram.uniform.uPointLightMinRange, scene.getPointLightMinRange(lightArray));
    gl.uniform1fv(this.basicShaderTProgram.uniform.uPointLightMaxRange, scene.getPointLightMaxRange(lightArray));
    gl.uniform1i(this.basicShaderTProgram.uniform.uPointLightNumber, scene.pointLight.length);



    if (typeof scene.ambientLight.color == 'undefined') {
        scene.ambientLight.color = [0.0, 0.0, 0.0];
    }
    ;
    gl.uniform3fv(this.basicShaderTProgram.uniform.uAmbientLightColor, scene.ambientLight.color);
    gl.uniformMatrix4fv(this.basicShaderTProgram.uniform.uPMatrix, false, camera.getPerspectiveMatrix());


    for (var i = 0; i < scene.objects[shaderType].length; i++) {
        var object = scene.objects[shaderType][i];

        gl.uniform1f(this.basicShaderTProgram.uniform.uShininess, object.shininess);

        var textureUnits = [];

        for (var j = 0; j < object.textures.length; j++) {
            gl.activeTexture(gl["TEXTURE" + j]);
            gl.bindTexture(gl.TEXTURE_2D, object.textures[j].getTexture());
            textureUnits.push(j);
        }
        gl.uniform1iv(this.basicShaderTProgram.uniform.uTexture, textureUnits);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.textureCoordBuffer);
        gl.vertexAttribPointer(this.basicShaderTProgram.attribute.aTextureCoord, object.textureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexPositionBuffer);
        gl.vertexAttribPointer(this.basicShaderTProgram.attribute.aVertexPosition, object.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, object.vertexNormalBuffer);
        gl.vertexAttribPointer(this.basicShaderTProgram.attribute.aVertexNormal, object.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.vertexIndexBuffer);

        mat4.multiply(cameraMatrix, object.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.basicShaderTProgram.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.basicShaderTProgram.uniform.uNMatrix, false, this.normalMatrix);

        object.draw(gl, this.basicShaderTProgram);
    }
};


WONSZ.GameRenderer.prototype.snakeShader = function(gl, scene, shaderType, camera) {
//ADD NORMAL POINT LIGHT FIRST, THEN SNAKE LIGHT    
    gl.useProgram(this.snakeShaderProgram);
    gl.viewport(camera.viewPort.x1, camera.viewPort.y1, camera.viewPort.x2, camera.viewPort.y2);
    var cameraMatrix = camera.getCameraMatrix();





    var lightArray = scene.pointLight;
    gl.uniform3fv(this.snakeShaderProgram.uniform.uPointLightLocation, scene.getPointLightLocation(cameraMatrix, lightArray));
    gl.uniform3fv(this.snakeShaderProgram.uniform.uPointLightColor, scene.getPointLightColor(lightArray));
    gl.uniform1fv(this.snakeShaderProgram.uniform.uPointLightMinRange, scene.getPointLightMinRange(lightArray));
    gl.uniform1fv(this.snakeShaderProgram.uniform.uPointLightMaxRange, scene.getPointLightMaxRange(lightArray));

    gl.uniform1f(this.snakeShaderProgram.uniform.uMiddleRing, typeof camera.middleRing === "undefined" ? 1.0 : 0.0/*camera.middleRing*/);

    gl.uniform3fv(this.snakeShaderProgram.uniform.uAmbientLightColor, scene.ambientLight.color);
    gl.uniformMatrix4fv(this.snakeShaderProgram.uniform.uPMatrix, false, camera.getPerspectiveMatrix());

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

        gl.uniformMatrix4fv(this.snakeShaderProgram.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.snakeShaderProgram.uniform.uNMatrix, false, this.normalMatrix);

        object.draw(gl, this.snakeShaderProgram);
    }
    if (typeof currentViewPortHead != "undefined") {
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);


        mat4.multiply(cameraMatrix, currentViewPortHead.positionMatrix, this.mvMatrix);
        mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
        mat3.transpose(this.normalMatrix);

        gl.uniformMatrix4fv(this.snakeShaderProgram.uniform.uMVMatrix, false, this.mvMatrix);
        gl.uniformMatrix3fv(this.snakeShaderProgram.uniform.uNMatrix, false, this.normalMatrix);
        currentViewPortHead.draw(gl, this.snakeShaderProgram);

        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }
};