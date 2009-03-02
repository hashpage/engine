// require('classes/service')

(function($) {

    PB.FeedService = function(config) {
        $.extend(this, config);
        PB.FeedService.superclass.constructor.call(this);
    };

    PB.extend(PB.FeedService, PB.Service, {
        id: 'feed'
    });
    
})(jQuery);