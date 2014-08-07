WONSZ.Collision = function(input) {
    this.sceneSize = [input.sceneSize[0], input.sceneSize[1], input.sceneSize[2]]; //srodek sceny na coord 0, 0, 0
    this.gridSize = [input.gridSize[0], input.gridSize[1], input.gridSize[2]];

    this.grid = this.initGrid();
}

WONSZ.Collision.prototype.convertAABBPlane = function(x, plane) {
    var gridCount = this.sceneSize[plane] / this.gridSize[plane];
    var coord = -this.sceneSize[plane] / 2 + gridCount;
    for (var i = 0; i <= this.gridSize[plane]; i++) {
        if (x <= coord) {
            return i;
        }
        coord += gridCount;
    }
}

WONSZ.Collision.prototype.convertPoint = function(x) {
    var gridCount = [];
    for (var i = 0; i < 3; i++) {
        gridCount.push(this.sceneSize[i] / this.gridSize[i]);
    }

    var coord = [];
    for (var i = 0; i < 3; i++) {
        coord.push(-this.sceneSize[i] / 2 + gridCount[i]);
    }

    var point = [];

    for (var j = 0; j < 3; j++) {
        for (var i = 0; i <= this.gridSize[j]; i++) {
            if (x[j] <= coord[j]) {
                point.push(i);
                break;
            }
            coord[j] += gridCount[j];
        }
    }
    return point;
}

WONSZ.Collision.prototype.insertObject = function(Obj) {
    var tempTab;
    if (typeof Obj.special == "undefined") {
        tempTab = this["check" + Obj.model.boundingVolume.constructor.name + "Grid"](Obj.model.boundingVolume);
    }
    else {
        tempTab = this["check" + Obj.special + "Grid"](Obj);
    }
    
    for (i = 0; i < tempTab.length; i++) {
        this.grid[tempTab[i][0]][tempTab[i][1]][tempTab[i][2]].push(Obj);
    }
    return tempTab;
}

WONSZ.Collision.prototype.updateObject = function(Obj) {
    this.deleteObject(Obj);
    this.insertObject(Obj);
}

WONSZ.Collision.prototype.deleteObject = function(Obj) {
    for (var i = 0; i < Obj.collisionGridCoords.length; i++) {
        var tempCoord = Obj.collisionGridCoords[i];
        var index = this.grid[tempCoord[0]][tempCoord[1]][tempCoord[2]].indexOf(Obj);
        this.grid[tempCoord[0]][tempCoord[1]][tempCoord[2]].splice(index, 1);
    }
}

WONSZ.Collision.prototype.checkAABBGrid = function(AABB) {
    var tempTab = [];
    var min = this.convertPoint(AABB.min);
    var max = this.convertPoint(AABB.max);
    for (var i = min[0]; i <= max[0]; i++) {
        for (var j = min[1]; j <= max[1]; j++) {
            for (var k = min[2]; k <= max[2]; k++) {
                tempTab.push([i, j, k]);
            }
        }
    }
    return tempTab;
}
//AAPlane: point, vector
WONSZ.Collision.prototype.checkAAPlaneGrid = function(AAPlane){
    var tempTab = [];
    var vector = AAPlane.vector;
    var point = this.convertPoint(AAPlane.point);
    
    var i = point[0] * Math.abs(vector[0]),
        i1 = vector[0] != 0 ? i+1 : this.gridSize[0],
        j = point[1] * Math.abs(vector[1]),
        j1 = vector[1] != 0 ? j+1 : this.gridSize[1],
        k = point[2] * Math.abs(vector[2]),
        k1 = vector[2] != 0 ? k+1 : this.gridSize[2];
        
    for(i = point[0] * Math.abs(vector[0]); i < i1; i++){
        for(j = point[1] * Math.abs(vector[1]); j < j1; j++){
            for(k = point[2] * Math.abs(vector[2]); k < k1; k++){
                tempTab.push([i, j, k]);
            }
        }
    }
    
    return tempTab;
}

WONSZ.Collision.prototype.checkAABBagainstAABB = function(AABB1, AABB2) {
    if (AABB1.max[0] < AABB2.min[0] || AABB1.min[0] > AABB2.max[0])
        return false;
    if (AABB1.max[1] < AABB2.min[1] || AABB1.min[1] > AABB2.max[1])
        return false;
    if (AABB1.max[2] < AABB2.min[2] || AABB1.min[2] > AABB2.max[2])
        return false;

    return true;
}

WONSZ.Collision.prototype.checkAABBagainstAAPlane = function(AABB, AAPlane){
    for(var i = 0; i < 3; i++){
        if(AAPlane.vector[i]  == 1){
            if(AABB.min[i] > AAPlane.point[i]){
                return false;
            }
            break;
        }
        else if(AAPlane.vector[i]  == -1){
            if(AABB.max[i] < AAPlane.point[i]){
                return false;
            }
            break;
        }        
    }
    
    return true;
}

WONSZ.Collision.prototype.checkBoundingVolumeCollision = function(BV) {
    var inputBV = BV.constructor.name;
    var tempTab = this["check" + inputBV + "Grid"](BV);
    for (var i = 0; i < tempTab.length; i++) {
        var tempTab2 = this.grid[tempTab[i][0]][tempTab[i][1]][tempTab[i][2]];
        for (var j = 0; j < tempTab2.length; j++) {
            if (typeof tempTab2[j].special == "undefined") {
                var objBV = tempTab2[j].model.boundingVolume;
                var name = tempTab2[j].model.boundingVolume.constructor.name
            }
            else{
                var objBV = tempTab2[j];
                var name = tempTab2[j].special;
            }
            
            if (this["check" + inputBV + "against" + name](BV, objBV)) {
                return tempTab2[j];
            }

        }
    }
    return 0;
}

WONSZ.Collision.prototype.checkTailCollision = function(location, radius, direction) {
    var index1 = Math.floor((location[0] + 1) / 0.4);
    var index2 = Math.floor((location[1] + 1) / 0.4);
    var index3 = Math.floor((location[2] + 1) / 0.4);
    var arrayPoints = this.grid[index1][index2][index3];
    for (var i = 0; i < arrayPoints.length; i++) {
        var ca = [arrayPoints[i][0][0] - location[0], arrayPoints[i][0][1] - location[1], arrayPoints[i][0][2] - location[2]];
        var cb = [arrayPoints[i][1][0] - location[0], arrayPoints[i][1][1] - location[1], arrayPoints[i][1][2] - location[2]];
        if ((vec3.dot(direction, ca) <= 0) && (vec3.dot(direction, cb) <= 0)) {
            continue;
        }

        var dist = this.sqDistPointSegment(arrayPoints[i][0], arrayPoints[i][1], location);
        if (dist < (radius * radius * 4)) {
            var d = this.clsPntOnSeg(arrayPoints[i][0], arrayPoints[i][1], location);
            var cd2 = [(d[0] - location[0]) / 2, (d[1] - location[1]) / 2, (d[2] - location[2]) / 2];
            return cd2;
        }
    }
    return false;
};
WONSZ.Collision.prototype.sqDistPointSegment = function(a, b, c) {
    var ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
        ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]],
        bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
    var e = vec3.dot(ac, ab);
    if (e <= 0)
        return vec3.dot(ac, ac);
    var f = vec3.dot(ab, ab);
    if (e >= f)
        return vec3.dot(bc, bc);
    return vec3.dot(ac, ac) - e * e / f;
};
WONSZ.Collision.prototype.clsPntOnSeg = function(a, b, c) {
    var ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
        ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    var t = vec3.dot(ac, ab) / vec3.dot(ab, ab);
    if (t > 1)
        t = 1;
    if (t < 0)
        t = 0;
    return [a[0] + t * ab[0], a[1] + t * ab[1], a[2] + t * ab[2]];
};
/**
 * 
 * @param {vec3} Q
 * @param {vec3} P
 * @param {vec3} n describes plane P, unit length
 * @returns {vec3} Vector from Point Q to plane P
 */
WONSZ.Collision.prototype.vecPointPlane = function(Q, P, n) {
    var pq = [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]];
    var temp = vec3.dot(n, pq);
    return [-n[0] * temp, -n[1] * temp, -n[2] * temp];
};

WONSZ.Collision.prototype.initGrid = function() {
    var tempGrid = [];
    for (var i = 0; i < this.gridSize[0]; i++) {
        tempGrid[i] = [];
        for (var j = 0; j < this.gridSize[1]; j++) {
            tempGrid[i][j] = [];
            for (var k = 0; k < this.gridSize[2]; k++) {
                tempGrid[i][j][k] = [];
            }
        }
    }

    return tempGrid;
};

