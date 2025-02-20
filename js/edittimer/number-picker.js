/*global $,tau, Utils */

/**
 * Constructor of class number picker
 * @param page - jquery or dom name
 * @param element - jquery or dom name
 * @constructor
 */
function NumberPicker(page, element) {
    var self = this;
    var widget = null;
    var jElement = $(element.toJQueryId());
    var onValue = $.Deferred();

    this._page = page.toJQueryId();
    var jPage = $(this._page);


    this._prevPage = null;
    this._initValue = null;
    this._maxValue = 30;

    Object.defineProperty(this, 'onValueChanged', {
        get: function () {
            return onValue.promise();
        }
    });

    jPage.one('pagebeforeshow', function () {
        jElement.prop('max', self._maxValue);
        widget = tau.widget.NumberPicker(jElement.get(0));
        if (self._initValue) {
            widget.value(self._initValue);
        }
    });

    jPage.one('pageshow', function () {
    });

    jElement.one('change', function (event) {
        onValue.notify(event.detail.value);
        tau.changePage(self._prevPage.toJQueryId());
    });


    jPage.one('pagebeforehide', function () {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    });

    document.addEventListener('tizenhwkey', function () {
        tau.changePage(self._prevPage.toJQueryId());
    });
}

NumberPicker.prototype.show = function (initValue, maxValue) {
    this._prevPage = Utils.getActivePage();
    this._initValue = initValue;
    this._maxValue = maxValue;

    tau.changePage(this._page);
};
