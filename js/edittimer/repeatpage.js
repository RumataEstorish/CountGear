/*global tau, Utils, $, RepeatType, LANG_JSON_DATA, NumberPicker*/

RepeatPage.PAGE_NAME = 'repeatPage';
RepeatPage.PAGE = '#' + RepeatPage.PAGE_NAME;
RepeatPage.NO_NUMBER = '-';
RepeatPage.MAX_HOUR = 24;
RepeatPage.MAX_DAY = 31;
RepeatPage.MAX_WEEK = 4;
RepeatPage.MAX_MONTH = 12;
RepeatPage.MAX_YEAR = 100;

function RepeatPage() {

    var self = this;
    var repeatCountSpan = $('#repeatCountSpan');
    var _repeatType = RepeatType.NONE;
    var _repeatCount = 1;
    var _onRepeatSet = $.Deferred();

    this._lastPage = null;

    Object.defineProperties(this, {
        'repeatCount': {
            get: function () {
                return _repeatCount;
            },
            set: function (value) {
                _repeatCount = value;
                repeatCountSpan.text(value);
            }
        },
        'repeatType': {
            get: function () {
                return _repeatType;
            },
            set: function (value) {
                setRepeatType(value);
                _repeatType = value;
            }
        },
        'onRepeatSet': {
            get: function () {
                return _onRepeatSet.promise();
            }
        }
    });


    var setRepeatType = function (type) {
        if (self.repeatType === RepeatType.NONE && type !== RepeatType.NONE) {
            self.repeatCount = 1;
        } else if (type === RepeatType.NONE || type === RepeatType.LAST_DAY_OF_MONTH) {
            self.repeatCount = RepeatPage.NO_NUMBER;
        } else if (self.repeatType !== type) {
            self.repeatCount = 1;
        }

        setRepeatTypeSpan(type);

        tau.changePage(RepeatPage.PAGE);
    };

    var setRepeatTypeSpan = function (type) {
        var repeatSpan = $('#repeatTypeSpan');
        switch (type) {
            case RepeatType.NONE:
                $('#repeatTypeNone input').prop('checked', true);
                repeatSpan.text(LANG_JSON_DATA.NO_REPEAT);
                break;
            case RepeatType.HOUR:
                $('#repeatTypeHour input').prop('checked', true);
                repeatSpan.html(LANG_JSON_DATA.HOURLY);
                break;
            case RepeatType.DAY:
                $('#repeatTypeDay input').prop('checked', true);
                repeatSpan.html(LANG_JSON_DATA.DAILY);
                break;
            case RepeatType.WEEK:
                $('#repeatTypeWeek input').prop('checked', true);
                repeatSpan.html(LANG_JSON_DATA.WEEKLY);
                break;
            case RepeatType.MONTH:
                $('#repeatTypeMonth input').prop('checked', true);
                repeatSpan.html(LANG_JSON_DATA.MONTHLY);
                break;
            case RepeatType.YEAR:
                $('#repeatTypeYear input').prop('checked', true);
                repeatSpan.html(LANG_JSON_DATA.YEARLY);
                break;
            case RepeatType.LAST_DAY_OF_MONTH:
                $('#repeatTypeLastDayOfMonth input').prop('checked', true);
                repeatSpan.html(LANG_JSON_DATA.LAST_DAY_OF_MONTH);
                break;
        }
    };

    $('#repeatTypeNone').parent().on('click', function () {
        self.repeatType = RepeatType.NONE;
    });
    $('#repeatTypeHour').parent().on('click', function () {
        self.repeatType = RepeatType.HOUR;
    });
    $('#repeatTypeDay').parent().on('click', function () {
        self.repeatType = RepeatType.DAY;
    });
    $('#repeatTypeWeek').parent().on('click', function () {
        self.repeatType = RepeatType.WEEK;
    });
    $('#repeatTypeMonth').parent().on('click', function () {
        self.repeatType = RepeatType.MONTH;
    });
    $('#repeatTypeYear').parent().on('click', function () {
        self.repeatType = RepeatType.YEAR;
    });
    $('#repeatTypeLastDayOfMonth').parent().on('click', function () {
        self.repeatType = RepeatType.LAST_DAY_OF_MONTH;
    });

    $('#repeatCount').parent().on('click', function () {
        if (self.repeatType === RepeatType.NONE || self.repeatType === RepeatType.LAST_DAY_OF_MONTH) {
            return;
        }
        var numberPicker = new NumberPicker('number-picker-page', 'number-picker');

        numberPicker.onValueChanged.progress(function (value) {
            self.repeatCount = value;
        });

        var maxValue = 0;
        switch (self.repeatType) {
            case RepeatType.HOUR:
                maxValue = RepeatPage.MAX_HOUR;
                break;
            case RepeatType.DAY:
                maxValue = RepeatPage.MAX_DAY;
                break;
            case RepeatType.WEEK:
                maxValue = RepeatPage.MAX_WEEK;
                break;
            case RepeatType.MONTH:
                maxValue = RepeatPage.MAX_MONTH;
                break;
            case RepeatType.YEAR:
                maxValue = RepeatPage.MAX_YEAR;
                break;
        }

        numberPicker.show(1, maxValue);
    });

    $('#repeatType').on('click', function () {
        tau.changePage('#repeatTypePickPage');
    });

    $('#repeatOkButton').on('click', function () {
        _onRepeatSet.notify({
            repeatType: self.repeatType,
            repeatCount: self.repeatCount
        });
        tau.changePage(self._lastPage);
    });

    document.addEventListener('tizenhwkey', function (e) {
        if (e.keyName !== 'back') {
            return;
        }
        switch (Utils.getActivePage()) {
            case RepeatPage.PAGE_NAME:
                tau.changePage(self._lastPage);
                break;
        }
    });

}

RepeatPage.prototype.show = function (repeatType, repeatCount) {
    this.repeatCount = repeatCount;
    this.repeatType = repeatType;
    this._lastPage = Utils.getActivePage().toJQueryId();
    tau.changePage(RepeatPage.PAGE);
};