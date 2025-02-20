function HistoryState(active, value){
    Object.defineProperties(this, {
       'active': {
           get: function(){
               return active;
           }
       },
        'value': {
           get: function(){
               return value;
           }
        }
    });
}

HistoryState.prototype.toPlainObject = function(){
    return {
        active: this.active,
        value: this.value
    };
};

HistoryState.fromPlainObject = function(obj){
    return new HistoryState(obj.active, obj.value);
};