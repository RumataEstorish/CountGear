/*global $, Timer, EditViewState, HistoryState, RepeatType*/

function EditTimerVM(timers) {

    var self = this;

    this._onStateChanged = $.Deferred();

    // Fields
    this._editTimer = null;
    this._name = '';
    this._time = null;
    this._date = null;
    this._reminder = false;
    this._repeatType = RepeatType.NONE;
    this._repeatCount = 1;

    Object.defineProperties(this, {
        /**
         * View state
         */
        'onStateChanged': {
            get: function () {
                return self._onStateChanged.promise();
            }
        },

        'timers': {
            get: function () {
                return timers;
            }
        }
    });
}

EditTimerVM.prototype._checkReminderAvailable = function () {
    return tizen.time.getCurrentDateTime().earlierThan(this._getTimerDate());
};

EditTimerVM.prototype._getDateValues = function () {
    var d = this._date;
    if (!d) {
        d = tizen.time.getCurrentDateTime();
    }
    return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate()
    };
};

EditTimerVM.prototype._getTimeValues = function () {
    var t = this._time;
    if (t) {
        var split = t.split(':');
        return {
            hours: parseInt(split[0], 0),
            minutes: parseInt(split[1], 0)
        };
    }

    t = tizen.time.getCurrentDateTime();

    return {
        hours: t.getHours(),
        minutes: t.getMinutes()
    };
};

EditTimerVM.prototype._getTimerDate = function () {

    var d = this._getDateValues();
    var t = this._getTimeValues();

    var time = tizen.time.getCurrentDateTime();
    time.setFullYear(d.year);
    time.setMonth(d.month);
    time.setDate(d.day);
    time.setHours(t.hours);
    time.setMinutes(t.minutes);
    time.setSeconds(0);
    time.setMilliseconds(0);

    return time;
};

EditTimerVM.prototype.confirmCreate = function () {
    var timer = new Timer(this._name, this._getTimerDate());
    timer.remindSet = this._reminder;
    if (this._reminder && this._checkReminderAvailable()) {
        timer.setAlarm();
    }
    timer.repeatType = new HistoryState(this._repeatType, this._repeatType);
    timer.repeatCount = new HistoryState(this._repeatCount, this._repeatCount);

    if (this._editTimer) {
        this.timers.replace(this.timers.getTimerById(this._editTimer.id), timer);
    } else {
        this.timers.add(timer);
    }
    this.timers.save();
    this.setBackPressed();
};

EditTimerVM.prototype.generateDefaultTimer = function () {
    this.timers.add(new Timer($("#nameSpan").html(), this._getTimerDate()));
};

EditTimerVM.prototype.onReminderClick = function (checked) {
    this._reminder = checked;
};

EditTimerVM.prototype.onRepeatClick = function () {
    if (this._checkReminderAvailable() === false) {
        this._onStateChanged.notify(new EditViewState(EditViewState.NOTIFY_REPEAT_FOR_FUTURE_TIMERS));
    } else {
        this._onStateChanged.notify(new EditViewState(EditViewState.NAVIGATE_TO_REPEAT_TYPE, {repeatType: this._repeatType, repeatCount: this._repeatCount}));
    }
};

EditTimerVM.prototype.onEditNameClick = function () {
    if (this._editTimer && this._editTimer.name) {
        this._onStateChanged.notify(new EditViewState(EditViewState.ON_EDIT_NAME, this._editTimer.name));
    } else {
        this._onStateChanged.notify(new EditViewState(EditViewState.ON_EDIT_NAME, this._name));
    }
};

EditTimerVM.prototype.openEditPage = function (id) {
    var timer = this.timers.getTimerById(id);

    this._editTimer = timer;

    if (timer) {
        this._name = timer.name;
        if (timer.time) {
            this._time = timer.time.getHours() + ':' + timer.time.getMinutes();
        }
        this._date = timer.time;
        this._reminder = timer.remindSet;
        this._repeatCount = timer.repeatCount.value;
        this._repeatType = timer.repeatType.value;
    }

    var initialData = {};
    if (timer) {
        initialData.date = timer.time.toDisplayDateYear();
        initialData.time = timer.time.toDisplayTime();
        initialData.reminderAvailable = this._checkReminderAvailable();
    } else {
        var now = tizen.time.getCurrentDateTime();
        initialData.date = now.toDisplayDateYear();
        initialData.time = now.toDisplayTime();
        initialData.reminderAvailable = false;
    }

    initialData.name = this._name;
    initialData.reminderEnabled = this._reminder;
    initialData.repeatType = this._repeatType;
    initialData.repeatCount = this._repeatCount;

    this._onStateChanged.notify(new EditViewState(EditViewState.INITIALIZE, initialData));

};

EditTimerVM.prototype.setName = function (name) {
    this._name = name;
    this._onStateChanged.notify(new EditViewState(EditViewState.ON_NAME, name));
};


EditTimerVM.prototype.setTime = function (time) {
    this._time = time;
    this._onStateChanged.notify(new EditViewState(EditViewState.ON_TIME, this._getTimerDate().toDisplayTime()));
    this._onStateChanged.notify(new EditViewState(EditViewState.ON_REMINDER_ENABLED, this._checkReminderAvailable()));
};

EditTimerVM.prototype.setRepeatType = function (type) {
    this._repeatType = type.repeatType;
    this._repeatCount = type.repeatCount;
    this._onStateChanged.notify(new EditViewState(EditViewState.ON_REPEAT_TYPE, type));
};

EditTimerVM.prototype.setDate = function (date) {
    var d = date;
    if (!(date instanceof Date || date instanceof tizen.TZDate)) {
        d = new tizen.TZDate(new Date(date));
    }
    this._date = d;
    this._onStateChanged.notify(new EditViewState(EditViewState.ON_REMINDER_ENABLED, this._checkReminderAvailable()));
    this._onStateChanged.notify(new EditViewState(EditViewState.ON_DATE, d.toDisplayDateYear()));
};

EditTimerVM.prototype.setBackPressed = function () {
    this._time = '';
    this._editTimer = null;
    this._date = null;
    this._reminder = false;
    this._name = '';
    this._repeatType = RepeatType.NONE;
    this._repeatCount = 1;
};