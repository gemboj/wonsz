var inputHandler;
function webGLStart() {
    var canvas = getCanvas();
    inputHandler = new InputHandler(canvas);
    var gl = initGl(canvas);
    
    var scene = arkanoid(gl);
    
    var renderer = new GameRenderer(gl);

    startGameLoop(gl, renderer, scene);
}

function arkanoid(gl){
    var collision = new Collision({sceneSize: [16, 10, 2], gridSize: [5, 3, 1]});
    
    
    var scene = new Scene();
    var cube = new Model({geometry: "Cube", model: "Cube"});
    var kula = new Model({geometry: "sphere", model: "cos"});
    
    for(var i = 0; i < 5; i++){
        for(var j = 0; j < 4; j++){
            var cubeTemp = scene.addObject(new Cube({collision: collision, position: [i*2 - 4, j*0.4 + 2, -10.0], gl: gl, model: cube, color: [Math.random()*155 + 100, Math.random()*155 + 100, Math.random()*155 + 100, 255]}));
            cubeTemp.scale([0.95, 0.15, 1]);
            cubeTemp.insertIntoCollisionObject(collision);
        }        
    }

    var paletka = scene.addObject(new ArkanoidPaddle({collision: collision, position: [0, -2, -10.0], gl: gl, model: cube, color: [255, 255, 255, 255]}));
    paletka.scale([1.4, 0.15, 1]);
    paletka.insertIntoCollisionObject(collision);
    
    var kulka = scene.addObject(new ArkanoidBall({position: [0, 0, -10.0], gl: gl, model: kula, color: [255, 255, 255, 255], collision: collision}));
    kulka.scale([0.3, 0.3, 0.3]);
    
    var cube = scene.addObject(new Cube({inverseNormals: true, position: [0, 0, -10.0], gl: gl, model: cube, color: [155, 155, 155, 255]}));
    cube.scale([7, 4, 10]);
    
    scene.addPointLight(new PointLightFollow({object: kulka, minRange: 0.5, maxRange: 1, color: [1, 0, 0]}));
    scene.addPointLight(new PointLightStatic({location: [2.0, 2.0, -7.0], color: [0.7, 0.7, 0.7], minRange: 8.0, maxRange: 100.0}));
    scene.addAmbientLight([0.2, 0.2, 0.2]);

    var camera = scene.addCamera(new CameraBasic({gl: gl, position: [0.0, 0.0, 0.0], movement: true, viewAngle: 45, moveRate: 0.05}));
    
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
;