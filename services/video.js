// require('service')

(function($) {

    PB.VideoService = function(config) {
        $.extend(this, config);
        PB.VideoService.superclass.constructor.call(this);
    };

    PB.extend(PB.VideoService, PB.Service, {
        id: 'video'
    });
    
})(jQuery);