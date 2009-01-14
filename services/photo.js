// require('service')

(function($) {

    PB.PhotoService = function(config) {
        $.extend(this, config);
        PB.PhotoService.superclass.constructor.call(this);
    };

    PB.extend(PB.PhotoService, PB.Service, {
        id: 'photo'
    });
    
})(jQuery);