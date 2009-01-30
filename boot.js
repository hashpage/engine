// require('engine')

(function($) {
    
    PB.run = function(options) {
        options = options || {}; // TODO: check and sanitize options
        $.extend(PB, options);

        $.now = function() {
            if (PB.nowValue) return PB.nowValue;
            return +new Date;
        };

        $('body').addClass('pb-view-mode');
        PB.applyStyle();

        PB.loader = new PB.Loader();
        PB.notifier = new PB.Notifier();

        // add known services
        PB.addService(new PB.ActivityService());
        PB.addService(new PB.BookmarkService());
        PB.addService(new PB.PhotoService());
        PB.addService(new PB.BioService());
        PB.addService(new PB.PresenceService());
        PB.addService(new PB.TweetService());
        PB.addService(new PB.BlogService());
        PB.addService(new PB.AlbumService());
        PB.addService(new PB.VideoService());

        PB.runServices();

        // common parameters for all API calls
        PB.commonParams = {
            pid: options.pid
        };
        PB.deserialize();
        PB.ready = true;
        PB.readyToGo();
    };
    
})(jQuery);