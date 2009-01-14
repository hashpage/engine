// require('service')

(function($) {

    PB.TweetService = function(config) {
        $.extend(this, config);
        PB.TweetService.superclass.constructor.call(this);
    };

    PB.extend(PB.TweetService, PB.Service, {
        id: 'tweet'
    });
    
})(jQuery);