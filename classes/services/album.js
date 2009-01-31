// require('classes/service')

(function($) {

    PB.AlbumService = function(config) {
        $.extend(this, config);
        PB.AlbumService.superclass.constructor.call(this);
    };

    PB.extend(PB.AlbumService, PB.Service, {
        id: 'album'
    });
    
})(jQuery);