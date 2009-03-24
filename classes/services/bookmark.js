// require('classes/service')

(function($) {

    HP.BookmarkService = function(config) {
        $.extend(this, config);
        HP.BookmarkService.superclass.constructor.call(this);
    };

    HP.extend(HP.BookmarkService, HP.Service, {
        id: 'bookmark'
    });
    
})(jQuery);