/*global PrefSource*/
/*jshint unused: false*/

function PrefRepository() {
    var prefs = new PrefSource();

    Object.defineProperties(this, {
            'view': {
                get: function () {
                    return prefs.view;
                },
                set: function (value) {
                    prefs.view = value;
                }
            }
        }
    );
}