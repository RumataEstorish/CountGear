/*global Log, CountView, TimerState, LANG_JSON_DATA, HistoryState, RepeatType, PostponeType*/

/**
 * Timer
 *
 * @param timerName -
 *            timer name
 * @param initTime -
 *            initial time
 * @param s -
 *            initial state
 */
function Timer(timerName, initTime, s) {
    var self = this;
    var name = timerName;
    var id = 0;
    var alarmId = null;
    var state = TimerState.RUNNING;
    var time = null;
    var remindSet = false;
    var repeatType = new HistoryState(RepeatType.NONE, RepeatType.NONE);
    var repeatCount = new HistoryState(1, 1);

    if (initTime instanceof tizen.TZDate) {
        time = initTime;
    } else {
        time = new tizen.TZDate(initTime);
    }

    Object.defineProperties(this, {
        'id': {
            get: function () {
                return id;
            },
            set: function (val) {
                id = val;
            }
        },
        'name': {
            get: function () {
                return name;
            },
            set: function (val) {
                name = val;
            }
        },
        'time': {
            get: function () {
                return time;
            },
            set: function (val) {
                time = val;
            }
        },
        'alarmId': {
            get: function () {
                return alarmId;
            },
            set: function (val) {
                alarmId = val;
            }
        },
        /**
         * User state of remind
         */
        'remindSet': {
            get: function () {
                return remindSet === true;
            },
            set: function (v) {
                remindSet = v;
            }
        },
        'repeatType': {
            get: function () {
                return repeatType;
            },
            set: function (value) {
                repeatType = value;
            }
        },
        'repeatCount': {
            get: function () {
                return repeatCount;
            },
            set: function (value) {
                repeatCount = value;
            }
        },
        'isInPast': {
            get: function () {
                if (self.time) {
                    return tizen.time.getCurrentDateTime().laterThan(self.time);
                }
                return true;
            }
        },
        'state': {
            get: function () {
                return state;
            },
            set: function (val) {
                state = parseInt(val, 0);
            }
        }
    });

    if (s || s === 0) {
        try {
            this.state = parseInt(s, 0);
        } catch (ignored) {
            this.state = TimerState.STOPPED;
        }
    }
}

Timer.prototype.setAlarm = function () {
    // Double check timer for future
    // noinspection JSCheckFunctionSignatures
    if (this.isInPast === true) {
        return;
    }

    var alarm = new tizen.AlarmAbsolute(this.time.toDateObject());
    var appControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/view");
    try {
        tizen.alarm.add(alarm, tizen.application.getCurrentApplication().appInfo.id, appControl);
    } catch (e) {
        Log.e('Alarm not set: ' + e);
    }
    this.alarmId = alarm.id;
};

Timer.prototype.clearAlarm = function () {
    if (this.alarmId || this.isInPast) {
        try {
            tizen.alarm.remove(this.alarmId);
        } catch (ignored) {
        }
    }
    this.alarmId = null;
};

/**
 * Start timer
 */
Timer.prototype.start = function () {
    this.state = TimerState.RUNNING;
    if (!this.alarmId && this.remindSet === true) {
        this.setAlarm();
    }
};

/**
 * Stop timer
 */
Timer.prototype.stop = function () {
    this.state = TimerState.STOPPED;
    this.clearAlarm();
};

/**
 * Get timer value for display
 */
Timer.prototype.getDisplayTime = function (view) {
    try {
        var timerDate = this.time;
        var today = tizen.time.getCurrentDateTime();
        var msDiff = Math.abs(today.difference(timerDate).length), sDiff, mDiff, hDiff = 0, dDiff = 0;

        sDiff = Math.floor(msDiff / 1000);
        mDiff = Math.floor(sDiff / 60);
        sDiff = sDiff - 60 * mDiff;
        switch (view) {
            case CountView.DAYS:
                hDiff = Math.floor(mDiff / 60);
                dDiff = Math.floor(hDiff / 24);
                mDiff = mDiff - 60 * hDiff;
                hDiff = hDiff - dDiff * 24;

                return dDiff + LANG_JSON_DATA.D + " " + hDiff + LANG_JSON_DATA.H + " " + mDiff + LANG_JSON_DATA.M + " " + sDiff + LANG_JSON_DATA.S;
            case CountView.HOURS:
                hDiff = Math.floor(mDiff / 60);
                mDiff = mDiff - 60 * hDiff;
                return hDiff + LANG_JSON_DATA.H + " " + mDiff + LANG_JSON_DATA.M + " " + sDiff + LANG_JSON_DATA.S;
            case CountView.MINUTES:
                return mDiff + LANG_JSON_DATA.M + " " + sDiff + LANG_JSON_DATA.S;
        }
    } catch (e) {
        alert(e);
    }
};

Timer.prototype.postpone = function (type, count) {
    if (this.isInPast !== true) {
        return false;
    }

    var postponeCount = 1;
    if (count) {
        postponeCount = count;
    }

    switch (type) {
        case PostponeType.HOUR:
            this.time = this.time.addDuration(new tizen.TimeDuration(postponeCount, 'HOURS'));
            break;
        case PostponeType.DAY:
            this.time = this.time.addDuration(new tizen.TimeDuration(postponeCount, 'DAYS'));
            break;
        case PostponeType.WEEK:
            this.time = this.time.addDuration(new tizen.TimeDuration(7 * postponeCount, 'DAYS'));
            break;
        case PostponeType.MONTH:
            this.time.setMonth(this.time.getMonth() + postponeCount);
            break;
        case PostponeType.YEAR:
            this.time.setFullYear(this.time.getFullYear() + postponeCount);
            break;
        case PostponeType.LAST_DAY_OF_MONTH:
            // TODO
            //this.time.setMonth()
            break;
    }

    this.clearAlarm();
    if (this.remindSet === true) {
        this.setAlarm();
    }
    return true;
};

Timer.prototype.repeat = function () {
    switch (this.repeatType.active) {
        case RepeatType.NONE:
            return false;
        case RepeatType.HOUR:
            return this.postpone(PostponeType.HOUR, this.repeatCount.active);
        case RepeatType.DAY:
            return this.postpone(PostponeType.DAY, this.repeatCount.active);
        case RepeatType.WEEK:
            return this.postpone(PostponeType.WEEK, this.repeatCount.active);
        case RepeatType.MONTH:
            return this.postpone(PostponeType.MONTH, this.repeatCount.active);
        case RepeatType.YEAR:
            return this.postpone(PostponeType.YEAR, this.repeatCount.active);
        case RepeatType.LAST_DAY_OF_MONTH:
            return this.postpone(PostponeType.LAST_DAY_OF_MONTH);
    }
};

Timer.prototype.toPlainObject = function () {
    return {
        id: this.id,
        time: this.time.toDateObject(),
        name: this.name,
        state: this.state,
        alarmId: this.alarmId,
        remindSet: this.remindSet,
        repeatCount: this.repeatCount.toPlainObject(),
        repeatType: this.repeatType.toPlainObject()
    };
};

Timer.fromPlainObject = function (timer) {
    var selectedTimer = timer.id;
    var alarmId = timer.alarmId;
    var res = new Timer(timer.name, new Date(timer.time), null, timer.state);
    res.id = selectedTimer;
    res.alarmId = alarmId;
    res.remindSet = timer.remindSet;
    res.state = timer.state;
    res.repeatCount = HistoryState.fromPlainObject(timer.repeatCount);
    res.repeatType = HistoryState.fromPlainObject(timer.repeatType);
    return res;
};