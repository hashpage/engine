// require('classes/observable')

(function($) {

    PB.Loader = function(config) {
        $.extend(this, config);
        this.addEvents(
            'success',
            'completed'
        );
        PB.Loader.superclass.constructor.call(this);
    };

    PB.extend(PB.Loader, PB.Observable, {
        requestedWidgets: {},
        pendingRequests: 0,
        /////////////////////////////////////////////////////////////////////////////////////////
        loadWidget: function(name, callback) {
            console.log('PB.loadWidget', arguments);                                                //#dbg
            if (PB.hasWidget(name)) { // already loaded?
                callback();
                return; 
            }
            // load widget
            var url = PB.widgetUrl(name);
            if (this.requestedWidgets[url]) return;
            this.requestedWidgets[url] = true;
            this.pendingRequests++;
            var that = this;
            var js_url = url+'/index.js?'+PB.cacheSeed;
            console.log('PB Requesting widget', js_url);                                            //#dbg
            $.ajax({
                type: 'GET',
                url: js_url, 
                dataType: "script",
                cache: true,
                success: function() {
                    callback();
                    that.pendingRequests--;
                    that.fireEvent('success', that, url);
                    if (that.pendingRequests==0) {
                        that.fireEvent('completed', that);
                    }
                }
            });
        }
    });

})(jQuery);