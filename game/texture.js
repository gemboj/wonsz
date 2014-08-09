//gl, src, float (t/f), width, height
/**
 * 
 * @param {type} inputsdfsdf sd
 * @returns {undefined} sdfsdfsdf
 */
WONSZ.Texture = function(input){  
    this.gl = input.gl;    
    this.type = input.type || "UNSIGNED_BYTE";
    this.filter = input.texParam || "NEAREST";
    
    this.init();    

    
    if(typeof input.src === "string"){
        this.image = new Image();
        this.width = 1;
        this.height = 1;
        this.fillTexture(input.color || new Uint8Array([255, 0, 0, 0]));        
        
        this.image.src = input.src;        
        this.image.onload = this.loadComplete.bind(this); 
    }
    else{
        this.image = input.src;        
        this.width = input.width;
        this.height = input.height;
        this.fillTexture(this.image);
    }
}

WONSZ.Texture.prototype = {
    init: function(){
        var gl = this.gl;
        
        this.texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);            
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this.filter]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.filter]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    },
    
    loadComplete: function(){
        this.width = this.image.width || this.width;
        this.height = this.image.height || this.height;
        this.fillTexture(this.image);        
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
    
    fillTexture: function(filler){
        var gl = this.gl;
        
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        if(filler instanceof Image){
           gl.texImage2D(gl.TEXTURE_2D, 0, this.gl.RGBA, gl.RGBA, gl[this.type], filler); 
        }
        else{
            gl.texImage2D(gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, gl.RGBA, gl[this.type], filler);
        }
        
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        return this;
    }
}