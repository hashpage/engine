// require('observable')

(function($) {

    PB.Notifier = function(config) {
        $.extend(this, config);
        this.addEvents(
            'widgets-enter-mixed'
        );
        PB.Notifier.superclass.constructor.call(this);
    };

    PB.extend(PB.Notifier, PB.Observable, {
    });

})(jQuery);