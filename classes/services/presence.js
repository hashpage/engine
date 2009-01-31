// require('classes/service')

(function($) {

    PB.PresenceService = function(config) {
        $.extend(this, config);
        PB.PresenceService.superclass.constructor.call(this);
    };

    PB.extend(PB.PresenceService, PB.Service, {
        id: 'presence'
    });
    
})(jQuery);