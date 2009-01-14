// require('service')

(function($) {

    PB.BioService = function(config) {
        $.extend(this, config);
        PB.BioService.superclass.constructor.call(this);
    };

    PB.extend(PB.BioService, PB.Service, {
        id: 'bio'
    });
    
})(jQuery);