// require('classes/service')

(function($) {

    HP.VideoService = function(config) {
        $.extend(this, config);
        HP.VideoService.superclass.constructor.call(this);
    };

    HP.extend(HP.VideoService, HP.Service, {
        id: 'video'
    });
    
})(jQuery);