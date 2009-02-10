// require('engine')
// require('classes/observable')

(function($) {

    PB.Service = function(config) {
        $.extend(this, config);
        this.addEvents(
            'finish',
            'read',
            'datachanged',
            'complete',
            'failure'
        );
        this.baseUrl = PB.url("api", this.id);
        PB.Service.superclass.constructor.call(this);
    };

    PB.extend(PB.Service, PB.Observable, {
        id: 'unknown',
        data: [],
        /////////////////////////////////////////////////////////////////////////////////////////
        start: function() {
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        stop: function() {
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        filter: function(item, filter) {
            if (item.tags) {
                for (var i=0; i < filter.length; i++) {
                    var part = filter[i];
                    if (item.tags.indexOf(part)!=-1) return true;
                };
                return false;
            }
            return true;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        paramsToUrl: function(params, clean) {
            var url = "";
            var p = $.extend({}, params, PB.commonParams);
            if (clean) {
                if (p["pid"]) {
                    delete p.pid;
                }
            }
            var ep = PB.urlEncode(p);
            if (ep) url += "?"+ep;
            return url;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        decorateCallbackUrl: function(url) {
            if (url.indexOf('?')!=-1) return url + "&callback=?"; 
            return url + "?callback=?";
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        read: function(params, fn, scope) {
            var that = this;
            var args = arguments;
            if (this.fireEvent('read')!==false) {
                var cleanUrl = this.baseUrl + this.paramsToUrl(params, true);
                var url = this.decorateCallbackUrl(this.baseUrl + this.paramsToUrl(params));
                var completer = function(results) {
                    if (fn) fn.apply(scope||window, [results, params].concat(Array.prototype.slice.call(args, 3)));
                    that.complete(results);
                };
                if (PB.cachingService) {
                    var results = PB.cachingService.restore(cleanUrl);
                    if (!(results===undefined)) {
                        console.log('Cache hit: %s', cleanUrl);                                     //#dbg
                        completer(results);
                        return;
                    }
                    if (!PB.cachingService.start(cleanUrl, completer)) {
                        console.log('  ... read request joined pending request: %s', cleanUrl);     //#dbg
                        return;
                    }
                }
                scope.startLoadingIndicator();
                $.ajaxSetup({
                    cache: true,
                    jsonpgen: function() {
                        var hash = "x"+Math.abs(PB.crc32(this.url)).toString(16); // CRC32 should be quite fast, we don't need cryptographic power of SHA-1 here
                        while (window[hash]) hash += "x"; // prevents collision in window namespace (very unlikely)
                        return hash;
                    }
                });
                $.getJSON(url, function(data) {
                    scope.stopLoadingIndicator();
                    if (data.status=='ok') {
                        console.log("Received %s: %o", url, data);                                  //#dbg
                        results = data.results || [];
                        results.more = data.more || false;
                        if (PB.cachingService) {
                            PB.cachingService.finish(cleanUrl, results);
                        } else {
                            completer(results);
                        }
                    }
                });
                $.ajaxSetup({
                    cache: false, 
                    jsonpgen: null
                });
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        complete: function(data) {
            this.fireEvent('complete', this, data);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        failure: function() {
            this.fireEvent('failure', this);
        }
    });

})(jQuery);