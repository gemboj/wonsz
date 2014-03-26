function Collision(input) {
    this.widthScene = input.sceneSize[0]; //srodek sceny na coord 0, 0, 0
    this.heightScene = input.sceneSize[1];
    this.depthScene = input.sceneSize[2];
    this.widthGrid = input.gridSize[0];
    this.heightGrid = input.gridSize[1];
    this.depthGrid = input.gridSize[2];
    this.grid = this.initGrid();
}

Collision.prototype.convertPlane = function(x, plane) {
    var gridCount = this[plane + "Scene"] / this[plane + "Grid"];
    var coord = -this[plane + "Scene"] / 2 + gridCount;
    for (var i = 0; i <= this[plane + "Grid"]; i++) {
        if (x <= coord) {
            return i;
        }
        coord += gridCount;
    }
}

Collision.prototype.insertObject = function(Obj){
    this.insertBoundingVolume(Obj, Obj.getBoundingVolume());
}

Collision.prototype.insertBoundingVolume = function(Obj, BV){
    this["insert" + BV.constructor.name](Obj, BV);
}

Collision.prototype.insertAABB = function(Obj, AABB) {

    for (var i = this.convertPlane(AABB.min[0], "width"); i <= this.convertPlane(AABB.max[0], "width"); i++) {
        for (var j = this.convertPlane(AABB.min[1], "height"); j <= this.convertPlane(AABB.max[1], "height"); j++) {
            for (var k = this.convertPlane(AABB.min[2], "depth"); k <= this.convertPlane(AABB.max[2], "depth"); k++) {
                this.grid[i][j][k].push({object: Obj, boundingVolume: AABB});
            }
        }
    }
}



Collision.prototype.checkTailCollision = function(location, radius, direction) {
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
Collision.prototype.sqDistPointSegment = function(a, b, c) {
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
Collision.prototype.clsPntOnSeg = function(a, b, c) {
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
Collision.prototype.vecPointPlane = function(Q, P, n) {
    var pq = [Q[0] - P[0], Q[1] - P[1], Q[2] - P[2]];
    var temp = vec3.dot(n, pq);
    return [-n[0] * temp, -n[1] * temp, -n[2] * temp];
};
Collision.prototype.checkCubeCollision = function(location, radius) {
    if (location[0] > (1 - radius)) {
        return this.vecPointPlane(location, [1, 0, 0], [-1, 0, 0]);
    }
    else if (location[0] < (-1 + radius)) {
        return this.vecPointPlane(location, [-1, 0, 0], [1, 0, 0]);
    }
    if (location[1] > (1 - radius)) {
        return this.vecPointPlane(location, [0, 1, 0], [0, -1, 0]);
    }
    else if (location[1] < (-1 + radius)) {
        return this.vecPointPlane(location, [0, -1, 0], [0, 1, 0]);
    }
    if (location[2] > (1 - radius)) {
        return this.vecPointPlane(location, [0, 0, 1], [0, 0, -1]);
    }
    else if (location[2] < (-1 + radius)) {
        return this.vecPointPlane(location, [0, 0, -1], [0, 0, 1]);
    }
    return false;
};
Collision.prototype.initGrid = function() {
    var tempGrid = [];
    for (var i = 0; i < this.widthGrid; i++) {
        tempGrid[i] = [];
        for (var j = 0; j < this.heightGrid; j++) {
            tempGrid[i][j] = [];
            for (var k = 0; k < this.depthGrid; k++) {
                tempGrid[i][j][k] = [];
            }
        }
    }

    return tempGrid;
};

