// require('classes/observable')

(function($) {

    HP.Notifier = function(config) {
        $.extend(this, config);
        this.addEvents(
            'widgets-enter-mixed',
            'show-widget-properties',
            'edit-action',
            'navigate',
            'layouting-finished'
        );
        HP.Notifier.superclass.constructor.call(this);
    };

    HP.extend(HP.Notifier, HP.Observable, {
    });

})(jQuery);