/**
 * @argument {input} {} gl, object
 * @argument {optional input} {} 
 */
function SnakeHead(input){
   this.positionMatrix = input.object.getPositionMatrix();
   mat4.rotate(this.positionMatrix, Math.PI, [1, 0, 0]);
   
   this.shader = "drawSnakeShader";
   this.tail = input.object;
   this.initBuffers(input.gl, input.object.numVertices, input.object.radius);
};

   SnakeHead.prototype.draw = function(gl, shader){
      gl.uniform4fv(shader.uniform.uColor, this.tail.color);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
      gl.vertexAttribPointer(shader.attribute.aVertexPosition, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
   
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.vertexAttribPointer(shader.attribute.aVertexNormal, this.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      
      gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
   };

   SnakeHead.prototype.initBuffers = function(gl, numVertices, radius){
      var vertices = [];
      var normals = [];
      var indexes = [];
      
      var quality = 6;
      
      for (var j = 0; j <= quality; j++){
         var fi = j * (Math.PI/quality);
         for (var i = 0; i < (Math.floor(numVertices/2) + 1); i++){
            var theta = i*((Math.PI*2)/numVertices);
             
            vertices.push(Math.sin(theta) * Math.cos(fi) * radius, Math.cos(theta) * radius, Math.sin(theta) * Math.sin(fi) * radius);
            normals.push(Math.sin(theta) * Math.cos(fi), Math.cos(theta), Math.sin(theta) * Math.sin(fi));
         };
      };
      
      for (var j = 0; j < (quality ); j++){
         for (var i = 0; i < Math.floor(numVertices/2); i++){
            indexes.push(i + j*(Math.floor(numVertices/2)+1), i + (Math.floor(numVertices/2) + 1) + j*(Math.floor(numVertices/2)+1), i+1+j*(Math.floor(numVertices/2)+1), i + (Math.floor(numVertices/2) + 1) + j*(Math.floor(numVertices/2)+1), i + (Math.floor(numVertices/2) + 1) + 1 + j*(Math.floor(numVertices/2)+1), i + 1 + j*(Math.floor(numVertices/2)+1));
         };
      };
      
      this.vertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      this.vertexPositionBuffer.itemSize = 3;
      this.vertexPositionBuffer.numItems = vertices.length/3;
      
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
      this.indexBuffer.itemSize = 1;
      this.indexBuffer.numItems = indexes.length;
      
      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
      this.normalBuffer.itemSize = 3;
      this.normalBuffer.numItems = normals.length/3;
   };
   
   SnakeHead.prototype.update = function(gl, elapsed, scene){
      this.positionMatrix = this.tail.getPositionMatrix();
      mat4.rotate(this.positionMatrix, Math.PI, [1, 0, 0]);
      
      return 0;
   };