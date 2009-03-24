// require('classes/service')

(function($) {

    HP.PresenceService = function(config) {
        $.extend(this, config);
        HP.PresenceService.superclass.constructor.call(this);
    };

    HP.extend(HP.PresenceService, HP.Service, {
        id: 'presence'
    });
    
})(jQuery);