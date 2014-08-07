var inputHandler;
function webGLStart() {
    var canvas = WONSZ.utility.getCanvas();
    inputHandler = new InputHandler(canvas);
    var gl = WONSZ.utility.initGl(canvas);

    var scene = arkanoid(gl);
    //var scene = test(gl, sscene);
    var renderer = new WONSZ.GameRenderer(gl);
    var scene2 = particleTest(gl, scene);


    WONSZ.utility.startGameLoop(gl, renderer, scene);
    
    function wait() {
        if (scene.return == false) {
            setTimeout(wait, 100);
        } else {
            WONSZ.utility.startGameLoop(gl, renderer, scene2);
        }
    }
    wait();
}

/*function test(gl, testScene) {
    var scene = new WONSZ.Scene();
    var plane = new WONSZ.Model({geometry: "Plane", model: "plane"});

    var plane = new Plane({position: [0, 0, 0], gl: gl, model: plane, color: [1, 0, 1, 1]})

    var camera = scene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0.0, 0.0, 0.0], movement: true, viewAngle: 45, moveRate: 0.05}));
    //var unit = plane.addTexture(gl, null, 512, 512);
    plane.addPreRenderScene(testScene, unit);

    scene.addObject(plane);
    return scene;
}*/

function particleTest(gl, arkanoid) {


    var frameBW = 512,
        frameBH = 256,
        slots = 2,
        pointSize = 2;

    var plane = new WONSZ.Model({geometry: "Plane", model: "plane"});
    var plane2 = new WONSZ.Model({geometry: "Plane", model: "plane"});
    var cos = new WONSZ.ParticleTexture({position: [0, 0, 0], gl: gl, model: plane2, shader: "particleTexturePShader", type: "physics", particleWidth: frameBW, particleHeight: frameBH, particleSlots: slots, pointSize: pointSize});
    var cos2 = new WONSZ.ParticleTexture({position: [0, 0, 0], gl: gl, model: plane, shader: "particleTextureRShader", type: "renderer", texObj: cos, particleWidth: frameBW, particleHeight: frameBH, particleSlots: slots, pointSize: pointSize});

    cos2.textures.push({});
    cos2.addTextureUnit(gl, null, frameBW * slots, frameBH, 1);//particle texture
    cos2.addTextureUnit(gl, null, gl.viewportWidth, gl.viewportHeight, 0);//arkanoid texture

    
    inputHandler.addOnClickEvent(function(){
        this.mouse.position.x = this.mouse.position.x * 2.0/gl.viewportWidth - 1.0;
        this.mouse.position.y = (this.mouse.position.y * (2.0/gl.viewportHeight) -1.0) * -1.0;        
    });
    
    
    var scene = new WONSZ.Scene();
    var scene2 = new WONSZ.Scene();

    var camera = scene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0, 0, 0], movement: true, viewAngle: 45, moveRate: 0.05}), frameBW * slots, frameBH);
    var camera2 = scene2.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0, 0, 0], movement: true, viewAngle: 45, moveRate: 0.05}));
    
    var debug = scene2.addObject(new WONSZ.Object3d({gl: gl, model: plane, position: [0,0,0], shader: "interfaceShader"}));
    debug.textures[0] = cos2.textures[1];
    debug.textures[0].width = frameBW * slots;
    debug.textures[0].height = frameBH;
    
    debug.scale([0.3, 0.3, 1.0]);
    debug.translate([-1.0, -1.0, 0.0]);
    
    cos2.addPreRenderScene({gl: gl, scene: scene, textureUnit: 1, depth: false});
    cos2.addPreRenderScene({gl: gl, scene: arkanoid, textureUnit: 0, depth: true, width: 1024, height: 512, renderingNum: 1});
    
    
    scene.addObject(cos);
    scene2.addObject(cos2);

    return scene2;
}

/*function cube(gl, testScene) {
    var scene = new WONSZ.Scene();

    var plane = new WONSZ.Model({geometry: "Plane", model: "plane"});

    var paletka = scene.addObject(new Plane({position: [0, 0, 0], gl: gl, model: plane, color: [1, 0, 1, 1]}));

    var cube = new WONSZ.Model({geometry: "Cube", model: "Cube"});
    var cubeTemp = new Cube({animation: true, position: [2, 0, -10.0], gl: gl, model: cube, color: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1]});
    var unit = cubeTemp.addTexture(gl, null, 512, 512);
    cubeTemp.addPreRenderScene(testScene, unit);
    scene.addAmbientLight([0.2, 0.2, 0.2]);

    scene.addObject(cubeTemp);
    scene.addPointLight(new WONSZ.PointLightStatic({location: [2.0, 2.0, -7.0], color: [0.7, 0.7, 0.7], minRange: 8.0, maxRange: 100.0}));
    var camera = scene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0.0, 0.0, 0.0], movement: true, viewAngle: 45, moveRate: 0.05}));

    return scene;
}*/

function arkanoid(gl) {
    var collision = new WONSZ.Collision({sceneSize: [16, 10, 2], gridSize: [5, 3, 1]});
    var tex1 = new WONSZ.Texture({gl: gl, width: 512, height: 512});
    collision.insertObject({special: "AAPlane", vector: [-1, 0, 0], point: [5, 0, 0], side: 'right'});
    collision.insertObject({special: "AAPlane", vector: [1, 0, 0], point: [-5, 0, 0], side: 'left'});
    collision.insertObject({special: "AAPlane", vector: [0, -1, 0], point: [0, 4, 0], side: 'top'});
    collision.insertObject({special: "AAPlane", vector: [0, 1, 0], point: [0, -3, 0], side: 'bottom'});

    var scene = new WONSZ.Scene();
    var cube = new WONSZ.Model({geometry: "Cube", model: "Cube"});
    var kula = new WONSZ.Model({geometry: "sphere", model: "cos"});
    var cos = new WONSZ.Model({geometry: "pojazdSmoothT", model: "pojazd", textures: ["pojazd"]});
    var lives = new WONSZ.Model({geometry: "Plane", model: "plane", textures: ["lives"]});
    var livesNo = new WONSZ.Model({geometry: "Plane", model: "plane", textures: ["lives3", "lives2", "lives1"]})

    var cube1 = scene.addObject(new WONSZ.Cube({inverseNormals: true, position: [0, 0.5, -10.0], gl: gl, model: cube, color: [0.5, 0.5, 0.5, 1]}));
    cube1.scale([5, 3.5, 10]);

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 4; j++) {
            var cubeTemp = scene.addObject(new WONSZ.Cube({collision: collision, position: [i * 2 - 4, j * 0.4 + 2, -10.0], gl: gl, model: cube, color: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1]}));
            cubeTemp.scale([0.95, 0.15, 1]);
            cubeTemp.insertIntoCollision(collision);
        }
    }
    var cos2 = scene.addObject(new WONSZ.Object3d({collision: collision, position: [-3, 0, -10], gl: gl, model: cos, color: [0.2, 0.2, 1, 1]}));
    cos2.scale([0.3, 0.3, 0.3]);
    cos2.insertIntoCollision(collision);   

    var lives = scene.addObject(new WONSZ.Object3d({position: [0, 0, 0], gl: gl, model: lives, shader: "interfaceShader"}));
    lives.translate([-1, 1, 0]);
    //lives.scale([0.8, 0.8, 1.0]);
    
    var livesNo = scene.addObject(new WONSZ.Object3d({position: [0, 0, 0], gl: gl, model: livesNo, shader: "interfaceShader"}));
    livesNo.translate([-1, 0.7, 0]);
    //livesNo.scale([0.8, 0.8, 1.0]);
    livesNo.left = 1;
    
    var paletka = scene.addObject(new WONSZ.ArkanoidPaddle({collision: collision, position: [0, -2, -10.0], gl: gl, model: cube, color: [1, 1, 1, 1]}));
    paletka.scale([1.4, 0.05, 1]);
    paletka.insertIntoCollision(collision);

    var kulka = scene.addObject(new WONSZ.ArkanoidBall({position: [0, 0, -10.0], gl: gl, model: kula, color: [1, 1, 1, 1], collision: collision, lives: livesNo}));
    kulka.scale([0.3, 0.3, 0.3]);

    

    scene.addPointLight(new WONSZ.PointLightFollow({object: kulka, minRange: 0.5, maxRange: 1, color: [1, 0, 0]}));
    scene.addPointLight(new WONSZ.PointLightStatic({location: [2.0, 2.0, -7.0], color: [0.7, 0.7, 0.7], minRange: 8.0, maxRange: 100.0}));
    scene.addAmbientLight([0.2, 0.2, 0.2]);

    //var camera = scene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0.0, 0.0, 0.0], movement: true, viewAngle: 45, moveRate: 0.05}));
    var camera = scene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0.0, 0.0, 0.0], movement: true, viewAngle: 45, moveRate: 0.05}), 1024, 512);

    return scene;
}




function IntersectRayAABB(p, d, a) {
    var tmin = 0;
    var tmax = 100000;////////////////////////infinity

    for (var i = 0; i < 3; i++) {
        if (Math.abs(d[i]) < 0.1) {
            if (p[i] < a.min[i] || p[i] > a.max[i])
                return 0;
        }
        else {

            var ood = 1 / d[i];
            var t1 = (a.min[i] - p[i]) * ood;
            var t2 = (a.max[i] - p[i]) * ood;
            if (t1 > t2) {
                var temp = t1;
                t1 = t2;
                t2 = temp;
            }

            if (t1 > tmin)
                tmin = t1;
            if (t2 < tmax)
                tmax = t2;

            if (tmin > tmax)
                return 0;
        }
    }

    var q = [p[0] + d[0] * tmin, p[1] + d[1] * tmin, p[2] + d[2] * tmin];
    return q;
}