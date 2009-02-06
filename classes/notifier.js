// require('classes/observable')

(function($) {

    PB.Notifier = function(config) {
        $.extend(this, config);
        this.addEvents(
            'widgets-enter-mixed',
            'show-widget-properties',
            'edit-action',
            'layouting-finished'
        );
        PB.Notifier.superclass.constructor.call(this);
    };

    PB.extend(PB.Notifier, PB.Observable, {
    });

})(jQuery);