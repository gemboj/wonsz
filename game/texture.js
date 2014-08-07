//gl, src, float (t/f), width, height

WONSZ.Texture = function(input){    
    this.texture = input.gl.createTexture();
    this.loaded = false;
    this.gl = input.gl;
    this.float = input.float;
    
    if(input.src){
        this.texture.image = new Image();
        this.texture.image.src = input.src;
        this.texture.image.onload = this.loadComplete.bind(this);   
    }
    else{
        this.texture.image = null;        
        this.width = input.width;
        this.height = input.height;
        this.loadComplete();
    }
}

WONSZ.Texture.prototype = {
    loadComplete: function(){
        var gl = this.gl;
        this.width = this.width || this.texture.image.width;
        this.height = this.height || this.texture.image.height;
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);            
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        
        if(this.float){
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, this.texture.image);
        }
        else{
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        this.loaded = true;
    },
    
    getWidth: function(){
        return this.width;
    },
    
    getHeight: function(){
        return this.height;
    },
    
    getTexture: function(){
        return this.texture;
    },
    
    isLoaded: function(){
        return this.loaded;
    },
    
    isFloat: function(){
        return this.float;
    },
    
    fillTexture: function(array){
        var gl = this.gl;
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);        
        if(this.float){
            gl.texImage2D(gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, array);
        }
        else{
            gl.texImage2D(gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, array);
        }        
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        return this;
    }
}