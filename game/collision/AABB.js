function AABB(input) {
    this.min = [0, 0, 0];
    this.max = [0, 0, 0];

    if (input["vertices"]) {
        this.init(input.vertices);
    }
    else {
        this.min = input.AABB.min.slice();
        this.max = input.AABB.max.slice();
    }
}

AABB.prototype.init = function(vertices) {
    for (var i = 0; i < vertices.length; i += 3) {
        for (var j = 0; j < 3; j++) {
            if (vertices[i + j] < this.min[j]) {
                this.min[j] = vertices[i + j];
            }
            else if (vertices[i + j] > this.max[j]) {
                this.max[j] = vertices[i + j];
            }
        }
    }
}

AABB.prototype.getScaled = function(arr) {
    var tempObj = {};
    tempObj.min = [];
    tempObj.max = [];
    for (var i = 0; i < arr.length; i++) {
        tempObj.min.push(arr[i] * this.min[i]);
        tempObj.max.push(arr[i] * this.max[i]);
    }
    return tempObj;
}



AABB.prototype.getTranslated = function(arr) {
    var tempObj = {};
    tempObj.min = [];
    tempObj.max = [];
    for (var i = 0; i < 3; i++) {
        tempObj.min.push(arr[i] + this.min[i]);
        tempObj.max.push(arr[i] + this.max[i]);
    }
    return tempObj;
}

AABB.prototype.clone = function(aabb) {
    return new AABB(aabb);
}

AABB.prototype.multiplyByMatrix = function(matrix) {
    var tempObj = new Object();
    tempObj = this.getScaled([matrix[0], matrix[5], matrix[10]]);
    tempObj = this.getTranslated([matrix[12], matrix[13], matrix[14]]);
    return tempObj;
}