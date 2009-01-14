// require('engine')
// require('observable')

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
            
                if (PB.cachingService) {
                    var results = PB.cachingService.restore(cleanUrl);
                    if (!(results===undefined)) {
                        console.log('Cache hit: %s', cleanUrl);
                        if (fn) fn.apply(scope||window, [results, params].concat(Array.prototype.slice.call(args, 3)));
                        that.complete(results);
                        return;
                    }
                }
                scope.startLoadingIndicator();
                $.ajaxSetup({cache: true, jsonpgen: function() {
                    return "x"+hex_sha1(this.url);
                }});
                $.getJSON(url, function(data) {
                    scope.stopLoadingIndicator();
                    if (data.status=='ok') {
                        console.log("Received %s: %o", url, data);
                        results = data.results || [];
                        results.more = data.more || false;
                        if (fn) fn.apply(scope||window, [results, params].concat(Array.prototype.slice.call(args, 3)));
                        if (PB.cachingService) {
                            PB.cachingService.store(cleanUrl, results);
                        }
                        that.complete(results);
                    }
                });
                $.ajaxSetup({cache: false, jsonpgen: null});
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