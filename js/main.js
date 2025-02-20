/*global Interval, List, TimeUtils, EditViewState, AddPage, Feedback, EditTimerVM, PrefRepository, $, tau, Utils, TimersList, Timer, CountView, PostponeType, TimerState, LANG_JSON_DATA, pickText, ActionMenu, ToastMessage, createScroller, Log, RepeatType*/
/*jshint unused: false*/
/*jslint laxbreak: true*/

var START_MENU_ITEM_NAME = 'startMenuItem';
var STOP_MENU_ITEM_NAME = 'stopMenuItem';

var timers = new TimersList();
var selectedTimer = 0;
var model = null;
var contextMenu = null;
var mainMenu = null;
var prefs = new PrefRepository();
var interval = new Interval();
var feedback = new Feedback();
var list = null;

var addPage;

function populateTimersList() {

    list.empty();

    timers.timers.forEach(function (timer) {

        var item = createTimerItem(timer.id, timer);

        list.append(item);
    });
}

function saveTimers() {
    timers.save();
}

function selectActive(id) {
    selectedTimer = id;

    switch (timers.getTimerById(selectedTimer).state) {
        case TimerState.RUNNING:
            contextMenu.hideMenuItem(START_MENU_ITEM_NAME);
            contextMenu.showMenuItem(STOP_MENU_ITEM_NAME);
            break;
        default:
            contextMenu.hideMenuItem(STOP_MENU_ITEM_NAME);
            contextMenu.showMenuItem(START_MENU_ITEM_NAME);
            break;
    }

    contextMenu.show();
}


function startTimerClick() {
    var timerElement = $("#" + selectedTimer).children();
    timers.startTimer(selectedTimer);
    timerElement.css("color", "");
    timerElement.children().css("color", "");
}

function stopTimerClick() {
    var timerElement = $("#" + selectedTimer).children();
    timers.stopTimer(selectedTimer);
    timerElement.css("color", "gray");
    timerElement.children().css("color", "gray");
}

function removeTimerClick() {
    timers.removeTimerById(selectedTimer);
    $("#" + selectedTimer).remove();
    saveTimers();
}

function openMenuClick() {
    mainMenu.showMenuItem('daysMenu');
    mainMenu.showMenuItem('hoursMenu');
    mainMenu.showMenuItem('minutesMenu');

    switch (prefs.view) {
        case CountView.DAYS:
            mainMenu.hideMenuItem('daysMenu');
            break;
        case CountView.HOURS:
            mainMenu.hideMenuItem('hoursMenu');
            break;
        case CountView.MINUTES:
            mainMenu.hideMenuItem('minutesMenu');
            break;

    }
    mainMenu.show();
}


function addClick() {
    addPage.selectedTimer = null;
    addPage.show();
}

function editTimerClick() {
    addPage.selectedTimer = selectedTimer;
    addPage.show();
}


function createTimerItem(id, timer) {
    var t = timer.time;
    var timeValue = t.toDisplayDateTimeYear();
    var item;
    if (timer.name) {
        item = $('<li class="li-has-multiline li-has-2line-sub timer-li" data-id="' + id + '" id="' + id + '" onclick="selectActive(this.id)">' +
            timer.getDisplayTime(prefs.view) +
            '<span class="ui-li-sub-text li-text-sub">' + timer.name + '</span>' +
            '<span class="ui-li-sub-text li-text-sub">' + timeValue + '</span>' +
            '</li>');
    } else {
        item = $('<li class="li-has-multiline timer-li" id="' + id + '" onclick="selectActive(this.id)">' +
            '<label>' + timer.getDisplayTime(prefs.view) +
            '<span class="ui-li-sub-text li-text-sub">' + timeValue + '</span>' +
            '</label></li>');
    }
    if (timer.state === TimerState.STOPPED) {
        item.children().css('text-decoration', 'line-through');
    }
    return item;
}

function moveTimerUp() {
    timers.moveUp(selectedTimer);
    populateTimersList();
}

function moveTimerDown() {
    timers.moveDown(selectedTimer);
    populateTimersList();
}

function processTimerAlarm(alarmId) {

    try {
        var timer = timers.getTimerByAlarmId(alarmId);
        if (!timer) {
            return;
        }

        if (!tizen.application.getCurrentApplication() || !tizen.application.getCurrentApplication().appInfo) {
            return;
        }

        var notificationDict = {
            vibration: true,
            appId: tizen.application.getCurrentApplication().appInfo.id
        };

        if (timer.repeatType.active !== RepeatType.NONE) {
            $('#alarmPostponeButton').hide();
        } else {
            $('#alarmPostponeButton').show();
        }

        var setPostpone = function (type) {
            timers.postpone(timer, type);
            tau.changePage('#mainPage');
        };
        $('#postponeTypeHour').one('click', function () {
            setPostpone(PostponeType.HOUR);
        });
        $('#postponeTypeDay').one('click', function () {
            setPostpone(PostponeType.DAY);
        });
        $('#postponeTypeWeek').one('click', function () {
            setPostpone(PostponeType.WEEK);
        });
        $('#postponeTypeMonth').one('click', function () {
            setPostpone(PostponeType.MONTH);
        });
        $('#postponeTypeYear').one('click', function () {
            setPostpone(PostponeType.YEAR);
        });

        if (!timer.name) {
            notificationDict.content = timer.time;
            $('#alarmName').html(timer.time);
        } else {
            notificationDict.content = timer.name;
            $('#alarmName').html(timer.name);
        }


        timers.repeat(timer);
        tau.changePage('#alarmPage');

        try {
            var notification = new tizen.StatusNotification("SIMPLE", "CountGear", notificationDict);
            tizen.notification.post(notification);
        } catch (e) {
            alert(e);
        }

    } catch (err) {
        alert(err);
    }
}

function postponeAlarm() {
    tau.changePage('#postponeTypePickPage');
}

function dismissAlarm() {
    tau.changePage('#mainPage');
}

function translateUi() {
    $("#addMenuItem").html(LANG_JSON_DATA.ADD);
    $('#viewMenuItem').prepend(LANG_JSON_DATA.VIEW);

    $('#nameSpan').parent().prepend(LANG_JSON_DATA.NAME);
    $('#timeLabel').prepend(LANG_JSON_DATA.TIME);
    $('#dateLabel').prepend(LANG_JSON_DATA.DATE);
    $('#repeatLabel').prepend(LANG_JSON_DATA.REPEAT);
    $('#timeSpan').parent().prepend(LANG_JSON_DATA.TIME);
    $('#dateSpan').parent().prepend(LANG_JSON_DATA.DATE);
    $("#remindLabel").prepend(LANG_JSON_DATA.REMIND_WHEN_DONE);
    $("#addOkBtn").html(LANG_JSON_DATA.OK);

    $("#timerNameInputHeader").html(LANG_JSON_DATA.NAME);
    $("#timerNameText").attr("placeholder", LANG_JSON_DATA.ENTER_NAME);
    $("#notificationMenuItem").prepend(LANG_JSON_DATA.NOTIFICATIONS);
    $('#alarmPage h2').html(LANG_JSON_DATA.TIME_IS_UP);
    $('#alarmDismissButton').html(LANG_JSON_DATA.OK);
    $('#alarmPostponeButton').html(LANG_JSON_DATA.POSTPONE);

    // Repeat pick type
    $('#repeatTypePickPage h2').html(LANG_JSON_DATA.REPEAT);
    $('#repeatTypeNone').prepend(LANG_JSON_DATA.NO_REPEAT);
    $('#repeatTypeHour').prepend(LANG_JSON_DATA.HOUR);
    $('#repeatTypeDay').prepend(LANG_JSON_DATA.DAY);
    $('#repeatTypeWeek').prepend(LANG_JSON_DATA.WEEK);
    $('#repeatTypeMonth').prepend(LANG_JSON_DATA.MONTH);
    $('#repeatTypeYear').prepend(LANG_JSON_DATA.YEAR);
    $('#repeatTypeLastDayOfMonth').prepend(LANG_JSON_DATA.LAST_DAY_OF_MONTH);

    // Postpone pick type
    $('#postponeTypePickPage h2').html(LANG_JSON_DATA.POSTPONE);
    $('#postponeTypeHour').prepend(LANG_JSON_DATA.HOUR);
    $('#postponeTypeDay').prepend(LANG_JSON_DATA.DAY);
    $('#postponeTypeWeek').prepend(LANG_JSON_DATA.WEEK);
    $('#postponeTypeMonth').prepend(LANG_JSON_DATA.MONTH);
    $('#postponeTypeYear').prepend(LANG_JSON_DATA.YEAR);

    // Repeat page
    //$('#repeatPage h2').html(LANG_JSON_DATA.REPEAT);
    $('#repeatCount').prepend(LANG_JSON_DATA.EVERY);
    $('#repeatType').prepend(LANG_JSON_DATA.REPEAT);

}

function initMenu() {
    contextMenu = new ActionMenu('menuPage', 'menuPopup', [{
        name: START_MENU_ITEM_NAME,
        title: LANG_JSON_DATA.START,
        image: 'images/start.png',
        onclick: startTimerClick
    }, {
        name: STOP_MENU_ITEM_NAME,
        title: LANG_JSON_DATA.STOP,
        image: 'images/stop.png',
        onclick: stopTimerClick
    }, {
        name: 'editTimerMenu',
        title: LANG_JSON_DATA.EDIT,
        image: 'images/edit.png',
        onclick: editTimerClick,
        noBack: true
    }, {
        name: 'removeTimerMenu',
        title: LANG_JSON_DATA.REMOVE,
        image: 'images/remove.png',
        onclick: removeTimerClick
    }, {
        name: 'moveTimerUpMenu',
        title: LANG_JSON_DATA.UP,
        image: 'images/up.png',
        onclick: moveTimerUp
    }, {
        name: 'moveTimerDownMenu',
        title: LANG_JSON_DATA.DOWN,
        image: 'images/down.png',
        onclick: moveTimerDown
    }]);

    mainMenu = new ActionMenu('menuPage', 'mainMenuPopup', [{
        name: 'addTimerMenu',
        title: LANG_JSON_DATA.ADD,
        image: 'images/add.png',
        noBack: true,
        onclick: addClick
    },
        {
            name: 'minutesMenu',
            title: LANG_JSON_DATA.SHOW_IN_MINUTES,
            image: 'images/minutes.png',
            onclick: function () {
                prefs.view = CountView.MINUTES;
            }
        },
        {
            name: 'hoursMenu',
            title: LANG_JSON_DATA.SHOW_IN_HOURS,
            image: 'images/hours.png',
            onclick: function () {
                prefs.view = CountView.HOURS;
            }
        },
        {
            name: 'daysMenu',
            title: LANG_JSON_DATA.SHOW_IN_DAYS,
            image: 'images/days.png',
            onclick: function () {
                prefs.view = CountView.DAYS;
            }
        }
    ]);
}

$(window).on("load", function () {
    var i = 0, data = null, alarms = [];

    Log.DEBUG = false;

    try {

        initMenu();

        addPage = new AddPage(timers);
        list = new List('#mainPage');

        var mainPage = $('#mainPage');

        mainPage.on('pageshow', function () {

            populateTimersList();

            interval.set(function () {
                timers.timers.forEach(function (timer) {
                    if (timer.state === TimerState.RUNNING) {
                        var item = list.getRootItemById(timer.id);
                        if (item) {
                            item.text(timer.getDisplayTime(prefs.view));
                        }

                        if (timers.repeat(timer) === true) {
                            var timerDateSpan;
                            var timeValue = timer.time.toDisplayDateTimeYear();
                            if (timer.name) {
                                timerDateSpan = list.getSecondSubByRootId(timer.id);
                            } else {
                                timerDateSpan = list.getFirstSubByRootId(timer.id);
                            }
                            timerDateSpan.text(timeValue);
                        }
                    }
                });
            }, 1000);
        });

        mainPage.on('pagebeforehide', function () {
            interval.stop();
        });

        var alarmPage = $('#alarmPage');

        alarmPage.on('pageshow', function () {
            tizen.power.turnScreenOn();
            feedback.playLoop();
        });
        alarmPage.on('pagebeforehide', function () {
            feedback.stop();
            if (alarms.length > 0) {
                processTimerAlarm(alarms.pop());
            }
        });

        try {
            tizen.systeminfo.getPropertyValue("BUILD", function (res) {
                model = res.model;
            }, function () {
            });
        } catch (ignored) {
        }

        translateUi();

        var timeInput = $('#timeInput').val();
        if (timeInput) {
            $('#timeSpan').html(timeInput);
        } else {
            $('#timeSpan').html('0:00');
        }

        if (timers.timers.length === 0) {
            addPage.generateDefaultTimer();
        }

        document.addEventListener('tizenhwkey', function (e) {
            if (e.keyName !== 'back') {
                return;
            }
            if (contextMenu.isOpened === true) {
                contextMenu.close();
                return;
            }
            if (mainMenu.isOpened === true) {
                mainMenu.close();
                return;
            }

            switch (Utils.getActivePage()) {
                case 'alarmPage':
                    dismissAlarm();
                    break;
                case 'repeatTypePickPage':
                case "timerNameInput":
                    addPage.show();
                    break;
                case 'postponeTypePickPage':
                case "menuPage":
                    tau.changePage("#mainPage");
                    break;
                case 'mainPage':
                    try {
                        tizen.application.getCurrentApplication().exit();
                    } catch (e) {
                        Log.e(e);
                    }
                    break;
            }
        });

        try {
            if (tizen.application && tizen.application.getCurrentApplication() &&
                tizen.application.getCurrentApplication().getRequestedAppControl() &&
                tizen.application.getCurrentApplication().getRequestedAppControl().appControl &&
                tizen.application.getCurrentApplication().getRequestedAppControl().appControl.operation !== "http://tizen.org/appcontrol/operation/default") {
                data = tizen.application.getCurrentApplication().getRequestedAppControl().appControl.data;
                if (data && data.length > 0) {
                    for (i = 0; i < data.length; i++) {
                        if (data[i].key === "http://tizen.org/appcontrol/data/alarm_id") {
                            alarms.push(data[i].value[0]);
                        }
                    }

                    if (alarms.length > 0) {
                        processTimerAlarm(alarms.pop());
                        return;
                    }
                }

            }
        } catch (e) {
            Log.e(e);
        }

        tau.changePage('#mainPage');

    } catch (e) {
        Log.e(e);
    }
});