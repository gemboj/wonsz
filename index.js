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


    var frameBW = 1024,
        frameBH = 512,
        slots = 2,
        pointSize = 1;

    var plane = new WONSZ.Model({geometry: "Plane", model: "plane"});
    var plane2 = new WONSZ.Model({geometry: "Plane", model: "plane"});
    var cos = new WONSZ.ParticleTexture({position: [0, 0, 0], gl: gl, model: plane2, shader: "particleTexturePShader", type: "physics", particleWidth: frameBW, particleHeight: frameBH, particleSlots: slots, pointSize: pointSize});
    var cos2 = new WONSZ.ParticleTexture({position: [0, 0, 0], gl: gl, model: plane, shader: "particleTextureRShader", type: "renderer", particleWidth: frameBW, particleHeight: frameBH, particleSlots: slots, pointSize: pointSize, texObj: cos});

    
    cos2.addTexture(new WONSZ.Texture({gl: gl, src: null, width: frameBW * slots, height: frameBH, type: "FLOAT"}), 1);//particle texture
    cos2.addTexture(new WONSZ.Texture({gl: gl, src: null, width: gl.viewportWidth, height: gl.viewportHeight}), 0);//arkanoid texture
   /* cos2.addTextureUnit(gl, null, frameBW * slots, frameBH, 1);//particle texture
    cos2.addTextureUnit(gl, null, gl.viewportWidth, gl.viewportHeight, 0);//arkanoid texture*/

    
    inputHandler.addOnClickEvent(function(){
        this.mouse.position.x = this.mouse.position.x * 2.0/gl.viewportWidth - 1.0;
        this.mouse.position.y = (this.mouse.position.y * (2.0/gl.viewportHeight) -1.0) * -1.0;        
    });
    
    
    var scene = new WONSZ.Scene();
    var scene2 = new WONSZ.Scene();

    var camera = scene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0, 0, 0], movement: true, viewAngle: 45, moveRate: 0.05}), frameBW * slots, frameBH);
    var camera2 = scene2.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0, 0, 0], movement: true, viewAngle: 45, moveRate: 0.05}));
    

    
    /*var debug2 = scene2.addObject(new WONSZ.Object3d({gl: gl, model: plane, position: [0,0,1], shader: "interfaceShader"}));
    debug2.textures[0] = cos2.textures[0];   
    debug2.scale([0.2, 0.3, 1.0]);
    debug2.translate([-1, -1, 0.0]);*/
    
    cos2.addPreRenderScene({gl: gl, scene: scene, textureUnit: 1, depth: false});
    cos2.addPreRenderScene({gl: gl, scene: arkanoid, textureUnit: 0, depth: true, width: 1024, height: 512, renderingNum: 1});
    
    
    scene.addObject(cos);
    scene2.addObject(cos2);
    var debug = scene2.addObject(new WONSZ.Object3d({gl: gl, model: plane, position: [0,0,1], shader: "interfaceShader"}));
    debug.textures[0] = cos.textures[0];   
    debug.scale([0.3, 0.5, 1.0]);
    debug.translate([-1, -1, 0.0]);
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
    var collisionGrid = new WONSZ.CollisionGrid({sceneSize: [16, 10, 2], gridSize: [5, 3, 1]});
    collisionGrid.insertObject({special: "AAPlane", vector: [-1, 0, 0], point: [5, 0, 0], side: 'right'});
    collisionGrid.insertObject({special: "AAPlane", vector: [1, 0, 0], point: [-5, 0, 0], side: 'left'});
    collisionGrid.insertObject({special: "AAPlane", vector: [0, -1, 0], point: [0, 4, 0], side: 'top'});
    collisionGrid.insertObject({special: "AAPlane", vector: [0, 1, 0], point: [0, -3, 0], side: 'bottom'});

    var scene = new WONSZ.Scene(),
        cube = new WONSZ.Model({geometry: "Cube", model: "Cube", inverseNormals: true}),
            cubeAABB = new AABB(cube),
        kula = new WONSZ.Model({geometry: "ball", model: "arkanoid"}),
            kulaAABB = new AABB(kula),
        cos = new WONSZ.Model({geometry: "pojazdSmoothT", model: "pojazd"}),
            cosAABB = new AABB(cos),
        plane = new WONSZ.Model({geometry: "Plane", model: "plane"}),
        arkanoidBox = new WONSZ.Model({model: "arkanoid", geometry: "box"}),
            arkanoidBoxAABB = new AABB(arkanoidBox),
        arkanoidPaddle = new WONSZ.Model({geometry: "Cube", model: "Cube"}),
            arkanoidPaddleAABB = new AABB(arkanoidPaddle);

    var cubeScene = new WONSZ.Scene();
    cubeScene.addObject(new WONSZ.Object3d({position: [0,0,0], gl: gl, model: plane, shader: "testShader"}));
    cubeScene.addCamera(new WONSZ.CameraBasic({gl: gl, position: [0, 0, 0], movement: true, viewAngle: 45, moveRate: 0.05}));
    
    var cube1 = new WONSZ.Cube({position: [0, 0.5, -10.0], gl: gl, model: cube, color: [0.5, 0.5, 0.5, 1]});
    cube1.scale([5, 3.5, 10]);
    cube1.addTexture(new WONSZ.Texture({gl: gl, src: new Uint8Array([155,155,155, 255]), width: 1, height: 1}), 0);
    //cube1.addTexture(new WONSZ.Texture({gl: gl, src: null, width: 1024, height: 512}), 0);
    //cube1.addPreRenderScene({gl: gl, scene: cubeScene, textureUnit: 0, depth: false, renderingNum: 1});
    scene.addObject(cube1);
    
    
    
    for (var i = 0; i < 1; i++) {
        for (var j = 0; j < 1; j++) {
            var cubeTemp = scene.addObject(new WONSZ.Cube({collisionGrid: collisionGrid, position: [i * 2 - 4, j * 0.4 + 2, -10.0], gl: gl, model: arkanoidBox, color: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 0.5, 1]}));
            cubeTemp.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/arkanoid/box.png"}), 0);
            cubeTemp.scale([0.95, 0.15, 1]);
            cubeTemp.setBoundingVolume(arkanoidBoxAABB.clone());
            //cubeTemp.translate([5, 0, 0]);
            cubeTemp.insertIntoCollisionGrid(collisionGrid);
            
        }
    }
    var cos2 = scene.addObject(new WONSZ.Object3d({collisionGrid: collisionGrid, position: [-3, 0, -10], gl: gl, model: cos, color: [0.2, 0.2, 1, 1]}));
    cos2.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/pojazd/pojazd.png"}), 0);
    cos2.scale([0.3, 0.3, 0.3]);
    cos2.setBoundingVolume(cosAABB.clone());
    cos2.insertIntoCollisionGrid(collisionGrid);   
    
    var lives = scene.addObject(new WONSZ.Object3d({position: [0, 0, 0], gl: gl, model: plane, shader: "interfaceShader"}));
    lives.translate([-1, 1, 0]);
    lives.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/plane/lives.png"}), 0);
    lives.scale([0.8, 0.8, 1.0]);
    
    var livesNo = scene.addObject(new WONSZ.Object3d({position: [0, 0, 0], gl: gl, model: plane, shader: "interfaceShader"}));
    livesNo.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/plane/lives3.png"}), 0);
    livesNo.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/plane/lives2.png"}), 1);
    livesNo.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/plane/lives1.png"}), 2);
    livesNo.translate([-1, 0.7, 0]);
    livesNo.scale([0.8, 0.8, 1.0]);
    livesNo.left = 1;
    
    
    
    
    var whiteTex = new WONSZ.Texture({gl: gl, src: new Uint8Array([255, 255, 255, 255]), width: 1, height: 1});
    var paletka = scene.addObject(new WONSZ.ArkanoidPaddle({collisionGrid: collisionGrid, position: [0, -2, -10.0], gl: gl, model: arkanoidPaddle, color: [1, 1, 1, 1]}));
    paletka.addTexture(whiteTex, 0);
    paletka.scale([1.4, 0.05, 1]);
    paletka.setBoundingVolume(arkanoidPaddleAABB.clone());
    paletka.insertIntoCollisionGrid();
    


    var kulka = scene.addObject(new WONSZ.ArkanoidBall({position: [0, 0.5, -10.0], gl: gl, model: kula, color: [1, 1, 1, 1], collisionGrid: collisionGrid, lives: livesNo}));
    kulka.addTexture(new WONSZ.Texture({gl: gl, src: "game/models/arkanoid/ball.png"}), 0);
    //kulka.addTexture(whiteTex);
    kulka.scale([0.3, 0.3, 0.3]);
    kulka.setBoundingVolume(kulaAABB.clone());

    //scene.addObject(new WONSZ.DebugAABB({gl: gl, AABB: kulka.getBoundingVolume()}));

    scene.addPointLight(new WONSZ.PointLightFollow({object: kulka, minRange: 0.5, maxRange: 1, color: [0, 1, 0]}));
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