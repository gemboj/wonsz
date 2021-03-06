WONSZ.Scene = function() {
    this.objects = {};

    this.cameras = [];

    this.pointLight = [];
    this.ambientLight = {};

    this.return = false;

    this.time = 0;

    this.preRenderScenes = [];
	
	this.gameover = null;
}

WONSZ.Scene.prototype.setGameover = function(gameover){
	this.gameover = gameover;
}

WONSZ.Scene.prototype.addObject = function(object) {
    if (object.preRenderScenes) {
        this.preRenderScenes = this.preRenderScenes.concat(object.preRenderScenes);
    }

    for (var i in this.objects) {
        if (i == object.shader) {
            this.objects[i].push(object);
            return object;
        }
    }
    this.objects[object.shader] = [object];

    return object;
};

WONSZ.Scene.prototype.removePointLight = function(light){
	this.pointLight.splice(this.pointLight.indexOf(light), 1);
}

WONSZ.Scene.prototype.removeObject = function(object) {
    var tab = this.objects[object.getShader()];
    var i = tab.indexOf(object);
    tab[i].destructor();
    tab.splice(i, 1);
};

WONSZ.Scene.prototype.addCamera = function(cameraObj, viewportWidth, viewportHeight) {
    this.cameras.push(cameraObj);

    if ((viewportWidth) && (viewportHeight)) {
        for (var i = 0; i < this.cameras.length; i++) {
            this.cameras[i].adjustView(i, this.cameras.length, viewportWidth, viewportHeight);
        }
    }
    else {
        for (var i = 0; i < this.cameras.length; i++) {
            this.cameras[i].adjustView(i, this.cameras.length, cameraObj.gl.viewportWidth, cameraObj.gl.viewportHeight);
        }
    }


    return cameraObj;
};

WONSZ.Scene.prototype.addPointLight = function(lightObj) {
    this.pointLight.push(lightObj);
    return lightObj;
};

WONSZ.Scene.prototype.addSnakeLight = function(lightObj) {
    this.snakeLight.push(lightObj);
    return lightObj;
};

WONSZ.Scene.prototype.addAmbientLight = function(color) {
    this.ambientLight.color = color;

};

WONSZ.Scene.prototype.getPointLightLocation = function(cameraMatrix, lightArray) {
    var tempTab = [];
    var tempVec3 = vec3.create();

    for (var i = 0; i < lightArray.length; i++) {
        if (lightArray[i].nonRelative) {
            vec3.set(lightArray[i].location, tempVec3);
        }
        else {
            mat4.multiplyVec3(cameraMatrix, lightArray[i].location, tempVec3);
        }

        tempTab.push(tempVec3[0], tempVec3[1], tempVec3[2]);
    }
    ;

    return tempTab;
};

WONSZ.Scene.prototype.getPointLightColor = function(lightArray) {
    var tempTab = [];
    for (var i = 0; i < lightArray.length; i++) {
        tempTab.push(lightArray[i].color[0], lightArray[i].color[1], lightArray[i].color[2]);
    }
    return tempTab;
};

WONSZ.Scene.prototype.getPointLightMinRange = function(lightArray) {
    var tempTab = [];
    for (var i = 0; i < lightArray.length; i++) {
        tempTab.push(lightArray[i].minRange);
    }
    return tempTab;
};

WONSZ.Scene.prototype.getPointLightMaxRange = function(lightArray) {
    var tempTab = [];
    for (var i = 0; i < lightArray.length; i++) {
        tempTab.push(lightArray[i].maxRange);
    }
    return tempTab;
};

WONSZ.Scene.prototype.update = function(gl, elapsed) {
    if(this.return == false){
        for (var i in this.preRenderScenes) {
            this.preRenderScenes[i].scene.update(gl, elapsed);
        }

        for (var shaderType in this.objects) {
            for (var i = 0; i < this.objects[shaderType].length; i++) {
                this.objects[shaderType][i].update(gl, elapsed, this);
            }
        }
        for (var i = 0; i < this.cameras.length; i++) {
            this.cameras[i].update(elapsed);
        }
        for (var i = 0; i < this.pointLight.length; i++) {
            this.pointLight[i].update();
        }
        this.time += elapsed;
    }
};

WONSZ.Scene.prototype.setupPlayer = function(i, object, light) {
    //this.camera = camera;
    //var object = camera.object;
    //this.light = light;
    if (i === 0) {
        object.keys = {left: 65, right: 68, up: 87, down: 83};//adws
        light.color = [0.5, 0.0, 0.0];
        object.color = [1.0, 1.0, 1.0, 1.0];
    }
    else if (i === 1) {
        object.keys = {left: 37, right: 39, up: 38, down: 40};//arrows
        light.color = [0.5, 0.5, 0.0];
        object.color = [1.0, 1.0, 1.0, 1.0];
    }
    else if (i === 2) {
        object.keys = {left: 74, right: 76, up: 73, down: 75};//jlik
        light.color = [0.0, 0.0, 1.0];
        object.color = [0.0, 0.0, 1.0, 1.0];
    }
    else if (i === 3) {
        object.keys = {left: 100, right: 102, up: 104, down: 101};//num 4685
        light.color = [1.0, 0.0, 1.0];
        object.color = [1.0, 0.0, 1.0, 1.0];
    }

};

/**
 * 
 * @param {int} Obligatory x
 * @param {int} Obligatory y
 * @param {float <-1, 1>} Optional frustum (position in frustum - from -1(near) to 1(far))
 * @returns {Array} point Point in 3d [x, y, z]
 */
WONSZ.Scene.prototype.point2DTo3D = function(input) {



    var mousePositionx = input.x;
    var mousePositiony = input.y;
    var frustumPosition = typeof input.frustum == "undefined" ? -1 : input.frustum;

    for (var i = 0; i < this.cameras.length; i++) {
        var viewPort = this.cameras[i].viewPort;
        if (((mousePositionx >= viewPort.x1) && (mousePositionx < viewPort.x2 + viewPort.x1)) && ((mousePositiony > viewPort.y1) && (mousePositiony < viewPort.y2 + viewPort.y1))) {
            var camera = this.cameras[i];
            break;
        }
    }

    var nmpx = 2 * ((mousePositionx - camera.viewPort.x1) / (camera.viewPort.x2)) - 1;
    var nmpy = -(2 * ((mousePositiony - camera.viewPort.y1) / (camera.viewPort.y2)) - 1);

    var pMatrix = camera.getPerspectiveMatrix();

    var invPersp = mat4.create();
    var point = [0, 0, 0, 0];
    var matTemp = mat4.create(), invMatTemp = mat4.create();
    mat4.multiply(pMatrix, camera.getCameraMatrix(), matTemp);
    mat4.inverse(matTemp, invMatTemp);

    mat4.multiplyVec4(invMatTemp, [nmpx, nmpy, frustumPosition, 1], point);

    point[3] = 1 / point[3];
    point[0] *= point[3];
    point[2] *= point[3];
    point[1] *= point[3];

    return {vec: [point[0], point[1], point[2]], camera: camera};

};