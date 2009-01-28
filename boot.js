// require('engine')

jQuery(document).ready(function($){
    $.now = function() {
        if (PB.nowValue) return PB.nowValue;
        return +new Date;
    };
    
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
        pid: PB.pid
    };
    PB.deserialize();
    
    if (PB.e) {
        PB.bootstrapEditor();
    } 
    PB.ready = true;
    PB.readyToGo();
});