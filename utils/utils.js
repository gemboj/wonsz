function startGameLoop(gl, renderer, scene) {
    var lastTime = 0;
    var elapsed;
    var requestId;
    function nextFrame(time) {
        if (scene.return) {
            window.cancelAnimationFrame(requestId);
            return;
        }
        else {
            requestId = window.requestAnimFrame(nextFrame);
        }
        elapsed = 16;//time - lastTime;         
        renderer.drawFrame(gl, scene);


        scene.update(gl, elapsed);

        lastTime = time;
    }
    window.requestAnimFrame(nextFrame);
}
;

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function getCanvas() {
    var canvas = document.getElementById("canvas");    
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    return canvas;
}

function initGl(canvas) {

    var gl;
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        console.log("Could not initialise WebGL");
    }
    return gl;

}
;

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function getShader(gl, id, txt) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', "shaders/" + txt + ".txt", false);
    xmlhttp.send();
    var str = xmlhttp.responseText;

    var shader;
    if (id == "shader-fs") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (id == "shader-vs") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(gl, fShader, vShader, attribs, uniforms) {
    var fragmentShader = getShader(gl, "shader-fs", fShader);
    var vertexShader = getShader(gl, "shader-vs", vShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    shaderProgram.uniformList = uniforms;
    shaderProgram.attribList = attribs;

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
    }

    return shaderProgram;
}

function getAULocations(gl, shaderProgram) {
    var attribs = shaderProgram.attribList,
        uniforms = shaderProgram.uniformList;
    
    if (attribs) {
        shaderProgram.attribute = {};
        for (var i in attribs) {
            var attrib = attribs[i];
            shaderProgram.attribute[attrib] = gl.getAttribLocation(shaderProgram, attrib);
            gl.enableVertexAttribArray(shaderProgram.attribute[attrib]);
        }
    }

    if (uniforms) {
        shaderProgram.uniform = {};
        for (var i in uniforms) {
            var uniformi = uniforms[i];
            shaderProgram.uniform[uniformi] = gl.getUniformLocation(shaderProgram, uniformi);
        }
    }
}

function mouseClick(mycanvas, evt, scene, gl) {
    var rect = mycanvas.getBoundingClientRect();

    mousePosition.x = (2 * (evt.clientX - rect.top) / 1303) - 1;///mycanvas.width;
    mousePosition.y = -((2 * (evt.clientY - rect.top) / 682) - 1);///mycanvas.height;    mousePosition.click = true;
    //alert(mousePosition.x+" " +mousePosition.y);
    var pMatrix = mat4.create();
    mat4.perspective(90, mycanvas.width / mycanvas.height, 0.15, 1.0, pMatrix);

    var invPersp = mat4.create();
    var point = [0, 0, 0, 0];
    var matTemp = mat4.create(), invMatTemp = mat4.create();
    mat4.multiply(pMatrix, scene.cameras[0].getMatrix(), matTemp);
    mat4.inverse(matTemp, invMatTemp);

    mat4.multiplyVec4(invMatTemp, [mousePosition.x, mousePosition.y, 1, 1], point);
    //vec3.scale(point,1/point[3]) ;
    point[3] = 1 / point[3];
    point[0] *= point[3];
    point[2] *= point[3];
    point[1] *= point[3];
    //alert(point[0] + " " + point[1] + " " + point[2]);
    scene.addObject(new ParticleEmitter({gl: gl, position: [point[0], point[1], point[2]], numParticles: 1000}));
    //alert(mousePosition.x+" " +mousePosition.y);
    //alert(mycanvas.width + " " + mycanvas.height);
}
;