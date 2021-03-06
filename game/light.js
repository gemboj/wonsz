/**
 * @argument {input} {} location, color, minRange, maxRange
 * @argument {optional input} {} relative
 */
WONSZ.PointLightStatic = function(input) {
    this.location = input.location;
    this.color = input.color;
    this.minRange = input.minRange;
    this.maxRange = input.maxRange;
    this.relative = typeof input.relative == 'undefined' ? true : input.relative;
}

WONSZ.PointLightStatic.prototype.update = function() {

};

/**
 * @argument {input} {} object, minRange, maxRange
 * @argument {optional input} {} color
 */
WONSZ.PointLightFollow = function(input) {
    this.object = input.object;
    this.location;

    this.minRange = input.minRange;
    this.maxRange = input.maxRange;

    this.color = typeof input.color == "undefined" ? [1.0, 1.0, 1.0] : input.color;

    this.update();
}

WONSZ.PointLightFollow.prototype.update = function() {
    var tempMatrix = this.object.getPositionMatrix();
    this.location = [tempMatrix[12], tempMatrix[13], tempMatrix[14]];
};