// require('classes/service')

(function($) {

    HP.PhotoService = function(config) {
        $.extend(this, config);
        HP.PhotoService.superclass.constructor.call(this);
    };

    HP.extend(HP.PhotoService, HP.Service, {
        id: 'photo'
    });
    
})(jQuery);