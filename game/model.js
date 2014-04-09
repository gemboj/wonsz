function Model(input) {
    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.textureCoords = [];
    this.textures = [];
    this.texturesLoaded = [];
    this.boundingVolume;
    this.boundingParticles = [];
    this.boundingParticlesVelocities = [];



    var model = typeof input.model == "undefined" ? input.geometry : input.model;

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
    this.boundingVolume = new AABB({vertices: this.vertices});
}

Model.prototype.flat = function(xmlObject, rawTextureCoords, rawVertices, rawNormals, rawIndices, input, model) {
    var offset = 3;
    if (typeof input.textures != "undefined") {

        var x = xmlObject.querySelector("[id='" + input.geometry + "-mesh-map-0-array']").innerHTML;
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

        var loadComplete = function(i) {
            this.texturesLoaded[i] = true;
            console.log("loaded");
        }

        for (var i = 0; i < input.textures.length; i++) {
            this.textures[i] = new Image();
            this.texturesLoaded[i] = false;
            this.textures[i].src = "game/models/" + model + "/" + input.textures[i] + ".png";
            this.textures[i].onload = loadComplete.bind(this, i);
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

}

Model.prototype.getBoundingParticles = function(){
    
}

Model.prototype.getModel = function() {
    var model = {};
    model.vertices = this.vertices.slice();
    model.indices = this.indices.slice();
    model.normals = this.normals.slice();
    model.textureCoords = this.textureCoords.slice();
    model.textures = this.textures.slice();
    model.texturesLoaded = this.texturesLoaded;
    model.boundingVolume = this.boundingVolume.clone();
    return model;
}