EditViewState.INITIALIZE = 'INITIALIZE';
EditViewState.ON_NAME = 'ON_NAME';
EditViewState.ON_TIME = 'ON_TIME';
EditViewState.ON_DATE = 'ON_DATE';
EditViewState.ON_EDIT_NAME = 'ON_EDIT_NAME';
EditViewState.ON_REMINDER_ENABLED = 'ON_REMINDER_ENABLED';
EditViewState.ON_REMINDER_CHECKED = 'ON_REMINDER_CHECKED';
EditViewState.ON_REPEAT_TYPE = 'ON_REPEAT_TYPE';
EditViewState.NAVIGATE_TO_REPEAT_TYPE = 'NAVIGATE_REPEAT_TYPE';
EditViewState.NOTIFY_REPEAT_FOR_FUTURE_TIMERS = 'NOTIFY_REPEAT_FOR_FUTURE_TIMERS';

function EditViewState(name, value) {
    Object.defineProperties(this, {
        'name': {
            get: function () {
                return name;
            }
        },
        'value': {
            get: function () {
                return value;
            }
        }
    });
}