function Interval() {
    var self = this;
    this._interval = null;

    Object.defineProperty(this, 'isRunning', {
        get: function () {
            return self._interval !== null;
        }
    });
}

Interval.prototype.set = function (callback, timeout) {
    this._interval = setInterval(callback, timeout);
};

Interval.prototype.stop = function () {
    clearInterval(this._interval);
};