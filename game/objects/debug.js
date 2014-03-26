/**
 * @argument {input} {} gl, a, b
 * @argument {optional input} {} 
 */
function DebugLine(input) {
    this.positionMatrix = mat4.create();
    mat4.identity(this.positionMatrix);
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.gl = input.gl;
    this.a = input.a;
    this.b = input.b;
    this.shader = "drawParticleShader";

    this.initBuffers(this.gl);
}

DebugLine.prototype.draw = function(gl, shader) {    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(shader.attribute.aParticlePosition, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.uniform4fv(shader.uniform.uColor, this.color);

    gl.drawArrays(gl.LINES, 0, 2);
};

DebugLine.prototype.update = function() {

};

DebugLine.prototype.initBuffers = function(gl) {
    var vertices = [this.a[0], this.a[1], this.a[2], this.b[0], this.b[1], this.b[2]];

    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = vertices.length / 3;
};


/**
 * @argument {input} {} gl, object
 * @argument {optional input} {} 
 */
function DebugCross(input) {
    this.object = input.object;
    this.positionMatrix = this.object.getPositionMatrix();
    mat4.translate(this.positionMatrix, [0, 0.1, 0]);
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.gl = input.gl;
    
    this.shader = "drawParticleShader";

    this.initBuffers(this.gl);
}

DebugCross.prototype.draw = function(gl, shader) {    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(shader.attribute.aParticlePosition, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.uniform4fv(shader.uniform.uColor, this.color);

    gl.drawArrays(gl.LINES, 0, this.vertexPositionBuffer.numItems);
};

DebugCross.prototype.update = function() {
    this.positionMatrix = this.object.getPositionMatrix();
    mat4.translate(this.positionMatrix, [0, 0.1, 0]);
};

DebugCross.prototype.initBuffers = function(gl) {
    var vertices = [0,0,0, 0.1, 0, 0,
                    0,0,0, 0, 0.1, 0,
                    0,0,0, 0, 0, -0.1];

    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = vertices.length / 3;
};