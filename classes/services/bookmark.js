// require('classes/service')

(function($) {

    PB.BookmarkService = function(config) {
        $.extend(this, config);
        PB.BookmarkService.superclass.constructor.call(this);
    };

    PB.extend(PB.BookmarkService, PB.Service, {
        id: 'bookmark'
    });
    
})(jQuery);