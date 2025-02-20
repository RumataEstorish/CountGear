/*global EditTimerVM, $, addPage, RepeatPage, List, EditTimerVM, tau, RepeatType, EditViewState, Input, model, KeyboardModes, LANG_JSON_DATA, Utils*/
/*jshint unused: false*/
/*jslint laxbreak: true*/

AddPage.PAGE_NAME = 'addPage';

function AddPage(timers) {
    var self = this;
    var selectedTimer = null;

    var repeatPage = new RepeatPage();
    this._page = $('#addPage');

    this._editTimerVM = new EditTimerVM(timers);
    var repeatSpan = $('#repeatSpan');
    var dateSpan = $('#dateSpan');
    var timeSpan = $('#timeSpan');
    var nameSpan = $('#nameSpan');
    var remindCheck = $('#remind');

    var setRepeatType = function (repeat) {
        switch (repeat.repeatType) {
            case RepeatType.NONE:
                repeatSpan.html(LANG_JSON_DATA.NO_REPEAT);
                break;
            case RepeatType.HOUR:
                repeatSpan.html(LANG_JSON_DATA.HOUR + ': ' + repeat.repeatCount);
                break;
            case RepeatType.DAY:
                repeatSpan.html(LANG_JSON_DATA.DAY + ': ' + repeat.repeatCount);
                break;
            case RepeatType.WEEK:
                repeatSpan.html(LANG_JSON_DATA.WEEK + ': ' + repeat.repeatCount);
                break;
            case  RepeatType.MONTH:
                repeatSpan.html(LANG_JSON_DATA.MONTH + ': ' + repeat.repeatCount);
                break;
            case RepeatType.YEAR:
                repeatSpan.html(LANG_JSON_DATA.YEAR + ': ' + repeat.repeatCount);
                break;
            case RepeatType.LAST_DAY_OF_MONTH:
                repeatSpan.html(LANG_JSON_DATA.LAST_DAY_OF_MONTH);
                break;
        }

    };

    Object.defineProperty(this, 'selectedTimer', {
            get: function () {
                return selectedTimer;
            },
            set: function (value) {
                selectedTimer = value;
            }
        }
    );

    this._page.on('pagebeforeshow', function () {
        if (selectedTimer) {
            $("#addPage h2").html(LANG_JSON_DATA.EDIT);
        } else {
            $('#addPage h2').html(LANG_JSON_DATA.ADD);
        }
    });

    self._editTimerVM.onStateChanged.progress(function (state) {
        switch (state.name) {
            case EditViewState.INITIALIZE:
                dateSpan.text(state.value.date);
                timeSpan.text(state.value.time);
                nameSpan.text(state.value.name);

                remindCheck.prop('disabled', !state.value.reminderAvailable);
                remindCheck.prop('checked', state.value.reminderEnabled);
                setRepeatType(state.value);
                tau.changePage(AddPage.PAGE_NAME.toJQueryId());
                break;
            case EditViewState.ON_EDIT_NAME:
                var input = new Input(model);
                input.open(state.value, "", KeyboardModes.SINGLE_LINE, function (txt) {
                    self._editTimerVM.setName(txt);
                }, function () {
                }, function (e) {
                    if (e === "Please, install TypeGear from store. It's free.") {
                        alert(LANG_JSON_DATA.NO_TYPEGEAR);
                    } else {
                        alert(e);
                    }
                });
                break;
            case EditViewState.ON_DATE:
                dateSpan.text(state.value);
                break;
            case EditViewState.ON_TIME:
                timeSpan.text(state.value);
                break;
            case EditViewState.ON_NAME:
                nameSpan.text(state.value);
                break;
            case EditViewState.ON_REMINDER_ENABLED:
                if (state.value === true) {
                    remindCheck.prop('disabled', false);
                } else {
                    remindCheck.prop('disabled', true);
                }
                break;
            case EditViewState.ON_REMINDER_CHECKED:
                remindCheck.prop('checked', state.value);
                break;
            case EditViewState.NAVIGATE_TO_REPEAT_TYPE:
                repeatPage.show(state.value.repeatType, state.value.repeatCount);
                break;
            case EditViewState.ON_REPEAT_TYPE:
                setRepeatType(state.value);
                break;
            case EditViewState.NOTIFY_REPEAT_FOR_FUTURE_TIMERS:
                alert(LANG_JSON_DATA.ONLY_FOR_FUTURE_TIMERS);
                break;
        }
    });

    repeatSpan.on('click', function () {
        self._editTimerVM.onRepeatClick();
    });

    remindCheck.on('click', function () {
        self._editTimerVM.onReminderClick(remindCheck.prop('checked'));
    });

    dateSpan.parent().on('click', function () {
        var dateInput = $('#dateInput');
        dateInput.one('change', function () {
            self._editTimerVM.setDate(dateInput.val());
        });

        // noinspection JSCheckFunctionSignatures
        dateInput.trigger('click');
    });

    $('#addOkBtn').on('click', function () {
        self._editTimerVM.confirmCreate();
        tau.changePage('#mainPage');
    });

    timeSpan.parent().on('click', function () {
        var timeInput = $('#timeInput');
        timeInput.one("change", function () {
            self._editTimerVM.setTime(timeInput.val());
        });
        // noinspection JSCheckFunctionSignatures
        timeInput.trigger("click");
    });

    nameSpan.parent().on('click', function () {
        self._editTimerVM.onEditNameClick();
    });

    repeatPage.onRepeatSet.progress(function (value) {
        self._editTimerVM.setRepeatType(value);
    });

    document.addEventListener('tizenhwkey', function (e) {
        if (e.keyName !== 'back') {
            return;
        }
        switch (Utils.getActivePage()) {
            case AddPage.PAGE_NAME:
                self._editTimerVM.setBackPressed();
                tau.changePage('#mainPage');
                break;
        }
    });
}

AddPage.prototype.generateDefaultTimer = function () {
    return this._editTimerVM.generateDefaultTimer();
};

AddPage.prototype.show = function () {
    this._editTimerVM.openEditPage(this.selectedTimer);
    tau.changePage(this._page);
};