function AABB(model) {
    if(!model){
        return;
    }
    
    
    
    this.min = [0, 0, 0];//AABB after transformations
    this.max = [0, 0, 0];
    
    this.minBase = [0, 0, 0];//Base AABB - not editable
    this.maxBase = [0, 0, 0];
    
    this.init(model.getVertices());

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
    var aabb = new AABB();
    aabb.min = this.min.slice();
    aabb.max = this.max.slice();
    aabb.minBase = this.minBase.slice();
    aabb.maxBase = this.maxBase.slice();
    return aabb;
}

AABB.prototype.computeBoundingVolume = function(matrix) {
    this.scale([matrix[0], matrix[5], matrix[10]]);
    this.translate([matrix[12], matrix[13], matrix[14]]);
}

AABB.prototype.getName = function(){
    return "AABB";
}