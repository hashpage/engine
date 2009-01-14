// require('observable')

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
            // already loaded?
            if (PB.getWidget(name)) {
                callback();
                return; 
            }
            // load widget code
            var url = PB.widgetUrl(name);
            if (this.requestedWidgets[url]) return;
            this.requestedWidgets[url] = true;
            this.pendingRequests++;
            var that = this;
            var js_url = url+'/index.js';
            $.ajax({
                type: 'GET',
                url: js_url, 
                dataType: "script",
                //cache: true,
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