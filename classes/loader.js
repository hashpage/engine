// require('classes/observable')

(function($) {

    HP.Loader = function(config) {
        $.extend(this, config);
        this.addEvents(
            'success',
            'completed'
        );
        HP.Loader.superclass.constructor.call(this);
    };

    HP.extend(HP.Loader, HP.Observable, {
        requestedWidgets: {},
        pendingRequests: 0,
        /////////////////////////////////////////////////////////////////////////////////////////
        loadWidget: function(name, callback) {
            console.log('HP.loadWidget', arguments);                                                //#dbg
            // already loaded?
            if (HP.hasWidget(name)) { 
                console.log('  ... widget already loaded', arguments);                              //#dbg
                if (callback) callback();
                return; 
            }
            // load widget
            var url = HP.widgetUrl(name);
            if (this.requestedWidgets[url]) {
                console.log('  ... widget is already being loaded, callback queued', arguments);    //#dbg
                this.requestedWidgets[url].push(callback);
                return;
            }
            this.requestedWidgets[url] = [callback];
            this.pendingRequests++;
            var indexUrl = url+'/index.js?'+HP.cacheSeed;
            console.log('HP Requesting widget', indexUrl);                                          //#dbg
            var that = this;
            $.ajax({
                type: 'GET',
                url: indexUrl, 
                dataType: "script",
                cache: true,
                success: function() {
                    var callbacks = that.requestedWidgets[url];
                    for (var i=0; i < callbacks.length; i++) {
                        var callback = callbacks[i];
                        if (callback) callback();
                    }
                    delete that.requestedWidgets[url];
                    that.pendingRequests--;
                    that.fireEvent('success', that, url);
                    if (that.pendingRequests==0) {
                        that.fireEvent('completed', that);
                    }
                    if (that.pendingRequests<0) {                                                   //#chk
                        console.error('pending requests dropped under zero!');                      //#chk
                    }                                                                               //#chk
                }
            });
        }
    });

})(jQuery);