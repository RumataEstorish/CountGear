/*global Utils, Timer*/

TimersList.TIMERS_PREF = 'timers';

function TimersList() {
    var timers = JSON.parse(localStorage.getItem(TimersList.TIMERS_PREF));

    if (!timers) {
        timers = [];
    } else {

        for (var i = 0; i < timers.length; i++) {
            timers[i] = Timer.fromPlainObject(timers[i]);
        }
    }

    Object.defineProperties(this, {
        'timers': {
            get: function () {
                return timers;
            }
        }
    });
}

TimersList.prototype.moveUp = function (selectedTimer) {
    var index = this.getTimerIndexById(selectedTimer), temp = this.timers[index];
    if (index === 0) {
        return;
    }

    this.timers[index] = this.timers[index - 1];
    this.timers[index - 1] = temp;
    this.save();
};

TimersList.prototype.moveDown = function (selectedTimer) {
    var index = this.getTimerIndexById(selectedTimer), temp = this.timers[index];

    if (index === this.timers.length - 1) {
        return;
    }

    this.timers[index] = this.timers[index + 1];
    this.timers[index + 1] = temp;
    this.save();
};

TimersList.prototype.startTimer = function (id) {
    this.getTimerById(id).start();
    this.save();
};

TimersList.prototype.stopTimer = function (id) {
    this.getTimerById(id).stop();
    this.save();
};

TimersList.prototype.getTimerById = function (id) {
    var patchedId = Utils.tryParseInt(id, id);
    for (var i = 0; i < this.timers.length; i++) {
        if (this.timers[i].id === patchedId) {
            return this.timers[i];
        }
    }
};

TimersList.prototype.getTimerIndexById = function (id) {
    var patchedId = Utils.tryParseInt(id, id);
    for (var i = 0; i < this.timers.length; i++) {
        if (this.timers[i].id === patchedId) {
            return i;
        }
    }
};

TimersList.prototype.removeTimerById = function (id) {
    var patchedId = Utils.tryParseInt(id, id);
    for (var i = 0; i < this.timers.length; i++) {
        if (this.timers[i].id === patchedId) {
            this.timers.splice(i, 1);
            break;
        }
    }
};

TimersList.prototype.getTimerByAlarmId = function (alarmId) {
    for (var i = 0; i < this.timers.length; i++) {
        if (this.timers[i].alarmId === alarmId) {
            return this.timers[i];
        }
    }
};

TimersList.prototype.generateTimerId = function () {
    return Utils.generateUUID();
};

TimersList.prototype.add = function (timer) {
    timer.id = this.generateTimerId();
    timer.start();
    this.timers.push(timer);
    return timer;
};

TimersList.prototype.replace = function (oldTimer, newTimer) {
    var lastState = oldTimer.state;
    oldTimer.stop();
    this.removeTimerById(oldTimer.id);
    newTimer.id = oldTimer.id;
    newTimer.state = lastState;
    this.timers.push(newTimer);
    return newTimer;
};

TimersList.prototype.save = function () {
    var arr = [];
    this.timers.forEach(function (timer) {
        arr.push(timer.toPlainObject());
    });
    localStorage.setItem(TimersList.TIMERS_PREF, JSON.stringify(arr));
};

TimersList.prototype.postpone = function (timer, type) {
    timer.postpone(type);
    this.save();
};

TimersList.prototype.repeat = function (timer) {
    var isRepeat = timer.repeat();
    if (isRepeat === true) {
        this.save();
    }
    return isRepeat;
};
