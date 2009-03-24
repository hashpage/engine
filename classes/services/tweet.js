// require('classes/service')

(function($) {

    HP.TweetService = function(config) {
        $.extend(this, config);
        HP.TweetService.superclass.constructor.call(this);
    };

    HP.extend(HP.TweetService, HP.Service, {
        id: 'tweet'
    });
    
})(jQuery);