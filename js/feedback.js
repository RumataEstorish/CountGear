/*global Log, Interval*/

Feedback.VIBRATION_PATTERN = [1500, 250, 1500, 250, 1500];
Feedback.LOOP_INTERVAL = 5000;
Feedback.FEEDBACK_PATTERN = 'TIMER';
Feedback.VIBRATION = 'TYPE_VIBRATION';
Feedback.SOUND = 'TYPE_SOUND';

function Feedback() {
    this._interval = new Interval();
}

Feedback.prototype.play = function () {
    try {
        // noinspection JSUnresolvedVariable
        if (tizen.feedback && tizen.feedback.play && tizen.feedback.isPatternSupported &&
            (tizen.feedback.isPatternSupported(Feedback.FEEDBACK_PATTERN, Feedback.SOUND) ||
                tizen.feedback.isPatternSupported(Feedback.FEEDBACK_PATTERN, Feedback.VIBRATION))
        ) {
            if (tizen.feedback.isPatternSupported(Feedback.FEEDBACK_PATTERN, Feedback.SOUND)) {
                tizen.feedback.play(Feedback.FEEDBACK_PATTERN, Feedback.SOUND);
            }
            if (tizen.feedback.isPatternSupported(Feedback.FEEDBACK_PATTERN, Feedback.VIBRATION)) {
                tizen.feedback.play(Feedback.FEEDBACK_PATTERN, Feedback.VIBRATION);
            }

        } else {
            navigator.vibrate(Feedback.VIBRATION_PATTERN);
        }
    } catch (ignore) {
        navigator.vibrate(Feedback.VIBRATION_PATTERN);
    }
};

Feedback.prototype.playLoop = function () {

    var self = this;
    console.info('Play loop');

    this._interval.set(function () {
        Log.i('Feedback: loop');
        self.play();
    }, Feedback.LOOP_INTERVAL);
};

Feedback.prototype.stop = function () {
    Log.i('Feedback: stop');

    this._interval.stop();

    if (tizen.feedback && tizen.feedback.stop) {
        tizen.feedback.stop();
    }
};