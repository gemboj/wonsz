/**
 * @argument {input} {} gl, position, numParticles
 * @argument {optional input} {} 
 */
function ParticleEmitter(input) {
    this.positionMatrix = input.positionMatrix;

    this.shader = "drawParticleShader";
    this.num = input.numParticles;
    this.color = input.color;
    this.particles = input.particles;
    this.velocities = input.velocities;
    this.lifeTime = 2000;
    this.maxRange = 2;
    this.radius = typeof input.radius == "undefined" ? 0.001 : input.radius;
    this.remainingTime;
    this.initBuffers(input.gl);
}

ParticleEmitter.prototype.draw = function(gl, shader) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
    gl.vertexAttribPointer(shader.attribute.aParticlePosition, this.particlePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVelocitiesBuffer);
    gl.vertexAttribPointer(shader.attribute.aParticleVelocities, this.particleVelocitiesBuffer.itemSize, gl.FLOAT, false, 0, 0);


    gl.uniform4fv(shader.uniform.uColor, this.color);
    gl.uniform1f(shader.uniform.uCurrentTime, this.currentTime);
    gl.uniform1f(shader.uniform.uLifeTime, this.lifeTime);
    gl.uniform1f(shader.uniform.uMaxRange, this.maxRange);

    gl.drawArrays(gl.POINTS, 0, this.particles.length / 3);
};

ParticleEmitter.prototype.destructor = function() {

}

ParticleEmitter.prototype.initBuffers = function(gl) {
    /*for (var i = 0; i < this.num * 3; i += 3) {
        this.particles.push(0, 0, 0);
        var theta = Math.random() * Math.PI * 2;
        var fi = Math.random() * Math.PI * 2;
        this.velocities.push(Math.sin(theta) * Math.cos(fi), Math.cos(theta), Math.sin(theta) * Math.sin(fi));
    }*/
    
    
    this.currentTime = 0;    
    this.remainingTime = this.lifeTime;
    this.particlePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particlePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.particles), gl.STATIC_DRAW);
    this.particlePositionBuffer.itemSize = 3;
    this.particlePositionBuffer.numItems = this.particles.length / 3;

    this.particleVelocitiesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleVelocitiesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.velocities), gl.STATIC_DRAW);
    this.particleVelocitiesBuffer.itemSize = 3;
    this.particleVelocitiesBuffer.numItems = this.velocities.length / 3;
};

ParticleEmitter.prototype.update = function(gl, elapsed, scene) {

    this.currentTime += elapsed;
    if (this.currentTime  >= this.lifeTime) {
        scene.removeObject(this);
    }
};

ParticleEmitter.prototype.setPosition = function(position) {
    mat4.translate(this.positionMatrix, position);
};

ParticleEmitter.prototype.shift = function(shift) {
    mat4.translate(this.positionMatrix, shift);
};