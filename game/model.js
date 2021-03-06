WONSZ.Model = function(input) {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.textureCoords = [];
    
    this.inverseNormals = input.inverseNormals || false;
    //this.boundingVolume;
    
    this.boundingParticles = [];
    this.boundingParticlesVelocities = [];
    this.boundingParticlesColors = [];



    var model = input.model || input.geometry;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', "game/models/" + model + "/" + input.geometry + ".dae", false);
    xmlhttp.send();
    var xmlObject = xmlhttp.responseXML;

    var rawVertices = [],
            rawIndices = [],
            rawNormals = [],
            rawTextureCoords = [];

    var x = xmlObject.querySelector("[id='" + input.geometry + "-mesh-positions-array']").innerHTML;
    rawVertices = x.split(" ");
    for (var i = 0; i < rawVertices.length; i++) {
        rawVertices[i] = +rawVertices[i];
    }

    x = xmlObject.getElementsByTagName("p")[0].innerHTML;
    rawIndices = x.split(" ");
    for (var i = 0; i < rawIndices.length; i++) {
        rawIndices[i] = +rawIndices[i];
    }

    x = xmlObject.querySelector("[id='" + input.geometry + "-mesh-normals-array']").innerHTML;
    rawNormals = x.split(" ");
    for (var i = 0; i < rawNormals.length; i++) {
        rawNormals[i] = +rawNormals[i];
    }

    //if (input.flat == true) {
    this.flat(xmlObject, rawTextureCoords, rawVertices, rawNormals, rawIndices, input, model);
    //}
    //if(input.smooth == true){
    //    this.smooth(xmlObject, rawTextureCoords, rawVertices, rawNormals, rawIndices, input, model);
    //}
    //this.boundingVolume = new AABB({vertices: this.vertices});
}

WONSZ.Model.prototype.flat = function(xmlObject, rawTextureCoords, rawVertices, rawNormals, rawIndices, input, model) {
    var offset = 3;
    var x = xmlObject.querySelector("[id='" + input.geometry + "-mesh-map-0-array']");
    if (x != null) {
        x = xmlObject.querySelector("[id='" + input.geometry + "-mesh-map-0-array']").innerHTML;

        
        rawTextureCoords = x.split(" ");
        for (var i = 0; i < rawTextureCoords.length; i++) {
            rawTextureCoords[i] = +rawTextureCoords[i];
        }

        for (var i = 0; i < rawIndices.length; i += offset) {
            this.vertices.push(rawVertices[3 * rawIndices[i]]);
            this.vertices.push(rawVertices[3 * rawIndices[i] + 1]);
            this.vertices.push(rawVertices[3 * rawIndices[i] + 2]);
            this.normals.push(rawNormals[3 * rawIndices[i + 1]]);
            this.normals.push(rawNormals[3 * rawIndices[i + 1] + 1]);
            this.normals.push(rawNormals[3 * rawIndices[i + 1] + 2]);

            this.textureCoords.push(rawTextureCoords[2 * rawIndices[i + 2]]);
            this.textureCoords.push(rawTextureCoords[2 * rawIndices[i + 2] + 1]);

            this.indices.push(i / offset);
        }    
    }
    else {
        if (xmlObject.querySelector("[id='" + input.geometry + "-mesh-map-0-array']") == null) {
            offset = 2;
            for (var i = 0; i < rawIndices.length; i += offset) {
                this.vertices.push(rawVertices[3 * rawIndices[i]]);
                this.vertices.push(rawVertices[3 * rawIndices[i] + 1]);
                this.vertices.push(rawVertices[3 * rawIndices[i] + 2]);
                this.normals.push(rawNormals[3 * rawIndices[i + 1]]);
                this.normals.push(rawNormals[3 * rawIndices[i + 1] + 1]);
                this.normals.push(rawNormals[3 * rawIndices[i + 1] + 2]);

                this.textureCoords.push(0);
                this.textureCoords.push(0);

                this.indices.push(i / offset);
            }
        }
        else {
            for (var i = 0; i < rawIndices.length; i += offset) {
                this.vertices.push(rawVertices[3 * rawIndices[i]]);
                this.vertices.push(rawVertices[3 * rawIndices[i] + 1]);
                this.vertices.push(rawVertices[3 * rawIndices[i] + 2]);
                this.normals.push(rawNormals[3 * rawIndices[i + 1]]);
                this.normals.push(rawNormals[3 * rawIndices[i + 1] + 1]);
                this.normals.push(rawNormals[3 * rawIndices[i + 1] + 2]);

                this.textureCoords.push(0);
                this.textureCoords.push(0);




                this.indices.push(i / offset);
            }
        }
    }
    
    for (var i = 0; i < this.indices.length; i+=3){        
        var a = [this.vertices[3*this.indices[i]], this.vertices[3*this.indices[i] +1], this.vertices[3*this.indices[i] +2]];
        var b = [this.vertices[3*this.indices[i+1]], this.vertices[3*this.indices[i+1] +1], this.vertices[3*this.indices[i+1] +2]];
        var c = [this.vertices[3*this.indices[i+2]], this.vertices[3*this.indices[i+2] +1], this.vertices[3*this.indices[i+2] +2]];
        var normal = [this.normals[3*this.indices[i]], this.normals[3*this.indices[i] +1], this.normals[3*this.indices[i] +2]]
        
        var aT = [this.textureCoords[2*this.indices[i]], this.textureCoords[2*this.indices[i] +1]],
            bT = [this.textureCoords[2*this.indices[i+1]], this.textureCoords[2*this.indices[i+1] +1]],
            cT = [this.textureCoords[2*this.indices[i+2]], this.textureCoords[2*this.indices[i+2] +1]];
        this.getBoundingParticles(a, b, c, aT, bT, cT);
    }
    
    if (this.inverseNormals) {
        for (var i = 0; i < this.normals.length; i++) {
            this.normals[i] *= -1;
        }
    }
}

WONSZ.Model.prototype.getVertices = function(){
    return this.vertices;
}

WONSZ.Model.prototype.getBoundingParticles = function(a, b, c, aT, bT, cT) {
    var ab = vec3.create(),
        ac = vec3.create(),
        abT = [],
        acT = [];

    var field = (1/4) * Math.sqrt(); 

    vec3.subtract(b, a, ab);
    vec3.subtract(c, a, ac);
    abT = [bT[0] - aT[0], bT[1] - aT[1]];
    acT = [cT[0] - aT[0], cT[1] - aT[1]];
    
    for (var j = 0; j < 100; j++) {
        var rand = Math.random(),
            rand2 = Math.random() * (1 - rand);

        var sab = vec3.create();
        vec3.scale(ab, rand, sab);

        var sac = vec3.create();
        vec3.scale(ac, rand2, sac);

        var sabT = [abT[0] * rand, abT[1] * rand];

        var sacT = [acT[0] * rand2, acT[1] * rand2];


        var p = vec3.create();
        vec3.add(a, sab, p);
        vec3.add(p, sac, p);
        this.boundingParticles.push(p[0], p[1], p[2]);
        
        var vec = vec3.create();
        vec3.subtract(p, [0,0,0], vec);
        vec3.normalize(vec);
        this.boundingParticlesVelocities.push(vec[0], vec[1], vec[2]);
        //this.boundingParticlesVelocities.push(0, 0, 0);
        
        var color = [aT[0] + sabT[0] + sacT[0], aT[1] + sabT[1] + sacT[1]];
        this.boundingParticlesColors.push(color[0], color[1]);
        
    }
}

/*WONSZ.Model.prototype.getModel = function() {
    var model = {};
    model.vertices = this.vertices.slice();
    model.indices = this.indices.slice();
    model.normals = this.normals.slice();
    model.textureCoords = this.textureCoords.slice();
    model.boundingVolume = this.boundingVolume.clone();
    model.boundingParticles = this.boundingParticles.slice();
    model.boundingParticlesVelocities = this.boundingParticlesVelocities.slice();
    model.boundingParticlesColors = this.boundingParticlesColors;
    return model;
}*/