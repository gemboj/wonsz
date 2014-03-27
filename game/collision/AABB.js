function AABB(input) {
    this.min = [0, 0, 0];
    this.max = [0, 0, 0];
    
    this.minBase = [0, 0, 0];
    this.maxBase = [0, 0, 0];
    
    if (input["vertices"]) {
        this.init(input.vertices);
    }
    else {
        //clone
        this.minBase = input.AABB.minBase.slice();
        this.maxBase = input.AABB.maxBase.slice();
    }
}

AABB.prototype.init = function(vertices) {
    for (var i = 0; i < vertices.length; i += 3) {
        for (var j = 0; j < 3; j++) {
            if (vertices[i + j] < this.minBase[j]) {
                this.minBase[j] = vertices[i + j];
            }
            else if (vertices[i + j] > this.maxBase[j]) {
                this.maxBase[j] = vertices[i + j];
                
            }
        }
    }
}

AABB.prototype.scale = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        this.min[i] = this.minBase[i] * arr[i];
        this.max[i] = this.maxBase[i] * arr[i];
    }
}



AABB.prototype.translate = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        this.min[i] = this.min[i] + arr[i];
        this.max[i] = this.max[i] + arr[i];
    }
}

AABB.prototype.clone = function() {
    return new AABB({AABB: this});
}

AABB.prototype.computeBoundingVolume = function(matrix) {
    this.scale([matrix[0], matrix[5], matrix[10]]);
    this.translate([matrix[12], matrix[13], matrix[14]]);
}