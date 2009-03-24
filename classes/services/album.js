// require('classes/service')

(function($) {

    HP.AlbumService = function(config) {
        $.extend(this, config);
        HP.AlbumService.superclass.constructor.call(this);
    };

    HP.extend(HP.AlbumService, HP.Service, {
        id: 'album'
    });
    
})(jQuery);