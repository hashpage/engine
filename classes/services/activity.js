// require('classes/service')

(function($) {

    HP.ActivityService = function(config) {
        $.extend(this, config);
        HP.ActivityService.superclass.constructor.call(this);
    };

    HP.extend(HP.ActivityService, HP.Service, {
        id: "activity"
    });
    
})(jQuery);