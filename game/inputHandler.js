function InputHandler(canvas){
    var that = this;
    this.keyboard = {};
    this.keyboard.pressedKeys = [];
    
    this.mouse = {};
    this.mouse.position = {};
    
    canvas.addEventListener("click", function(event) { that.handleMouseClick(event);}, false);
    document.addEventListener("keydown", function(event) { that.handleKeyDown(event);}, false);
    document.addEventListener("keyup", function(event) { that.handleKeyUp(event);}, false);
    
    this.mouse.onClickEvents = [];
};

InputHandler.prototype.handleKeyDown = function(event){
    this.keyboard.pressedKeys[event.keyCode] = true;    
};

InputHandler.prototype.handleKeyUp = function(event){
    this.keyboard.pressedKeys[event.keyCode] = false;    
};

InputHandler.prototype.handleMouseClick = function(event){
    this.mouse.position = {x: event.clientX, y: event.clientY};
    for(var i = 0; i<this.mouse.onClickEvents.length; i++){
        this.mouse.onClickEvents[i]();
    }

};

InputHandler.prototype.addOnClickEvent = function(func){
    this.mouse.onClickEvents.push(func);
}