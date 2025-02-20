/*global CountView*/

PrefSource.VIEW_PREF = 'VIEW_PREF';

function PrefSource(){
    var view = localStorage.getItem(PrefSource.VIEW_PREF);

    if (!view) {
        view = CountView.MINUTES;
    } else {
        view = parseInt(view, 0);
    }

    Object.defineProperties(this, {
       'view':{
           get: function(){
               return view;
           },
           set: function (val) {
               view = val;
               localStorage.setItem(PrefSource.VIEW_PREF, val);
           }
       }
    });
}