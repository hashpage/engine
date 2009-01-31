// require('classes/service')

(function($) {

    PB.BlogService = function(config) {
        $.extend(this, config);
        PB.BlogService.superclass.constructor.call(this);
    };

    PB.extend(PB.BlogService, PB.Service, {
        id: 'blog'
    });
    
})(jQuery);