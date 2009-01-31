// require('classes/service')

(function($) {

    PB.ActivityService = function(config) {
        $.extend(this, config);
        PB.ActivityService.superclass.constructor.call(this);
    };

    PB.extend(PB.ActivityService, PB.Service, {
        id: "activity"
    });
    
})(jQuery);