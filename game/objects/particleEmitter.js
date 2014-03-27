/**
 * @argument {input} {} gl, position, numParticles
 * @argument {optional input} {} 
 */
function ParticleEmitter(input) {
    this.positionMatrix = mat4.create();
    mat4.identity(this.positionMatrix);
    this.setPosition(input.position);
    this.shader = "drawParticleShader";
    this.num = input.numParticles;
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.particles = [];
    this.velocities = [];
    this.lifeTime = 2000;
    this.radius = typeof input.radius == "undefined" ? 0.001 : input.radius;
    this.remainingTime;
    this.initBuffers(input.gl);
}

ParticleEmitter.prototype.draw = function(gl, shader) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
    gl.vertexAttribPointer(shader.attribute.aParticlePosition, this.particlePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.uniform4fv(shader.uniform.uColor, this.color);
    
    gl.drawArrays(gl.POINTS, 0, this.particles.length / 3);
};

ParticleEmitter.prototype.destructor = function(){
    
}

ParticleEmitter.prototype.initBuffers = function(gl) {
    for (var i = 0; i < this.num * 3; i += 3) {
        this.particles.push(0, 0, 0);
        var theta = Math.random() * Math.PI * 2;
        var fi = Math.random() * Math.PI * 2;
        this.velocities.push(Math.sin(theta) * Math.cos(fi) * this.radius, Math.cos(theta) * this.radius, Math.sin(theta) * Math.sin(fi)* this.radius);

    }
    this.remainingTime = this.lifeTime;
    this.particlePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles), gl.STATIC_DRAW);
    this.particlePositionBuffer.itemSize = 3;
    this.particlePositionBuffer.numItems = this.particles.length / 3;
};

ParticleEmitter.prototype.update = function(gl, elapsed, scene) {
    for (var i = 0; i < this.num * 3; i += 3) {
        this.particles[i / 3] += this.velocities[i / 3];
        this.particles[i / 3 + 1] += this.velocities[i / 3 + 1];
        this.particles[i / 3 + 2] += this.velocities[i / 3 + 2];
    }
    this.remainingTime -= elapsed;
    if (this.remainingTime <= 0) {
        scene.removeObject(this);
    }
    this.color[3] = this.remainingTime/this.lifeTime;
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles), gl.STATIC_DRAW);
};

ParticleEmitter.prototype.setPosition = function(position) {
    mat4.translate(this.positionMatrix, position);
};

ParticleEmitter.prototype.shift = function(shift){
    mat4.translate(this.positionMatrix, shift);
};