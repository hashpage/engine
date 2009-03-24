// require('classes/service')

(function($) {

    HP.FeedService = function(config) {
        $.extend(this, config);
        HP.FeedService.superclass.constructor.call(this);
    };

    HP.extend(HP.FeedService, HP.Service, {
        id: 'feed'
    });
    
})(jQuery);