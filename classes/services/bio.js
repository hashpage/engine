// require('classes/service')

(function($) {

    HP.BioService = function(config) {
        $.extend(this, config);
        HP.BioService.superclass.constructor.call(this);
    };

    HP.extend(HP.BioService, HP.Service, {
        id: 'bio'
    });
    
})(jQuery);