(function($) {

    $.extend(PB, {
        /////////////////////////////////////////////////////////////////////////////////////////
        // class-based inheritancy system taken from ExtJS
        extend : function(){
            var c = Object.prototype.constructor;
            var inline = function(o){
                for(var m in o){
                    this[m] = o[m];
                }
            };
            return function(b, p, o) {
                if (typeof p == 'object') {
                    o = p;
                    p = b;
                    b = o.constructor != c ? o.constructor : function() { 
                        p.apply(this, arguments); 
                    };
                }
                var F = function(){};
                var pp = p.prototype;
                F.prototype = pp;
                var bp = b.prototype = new F();
                bp.constructor = b;
                b.superclass = pp;
                if (pp.constructor == c) {
                    pp.constructor = p;
                }
                b.override = function(o) {
                    PB.override(b, o);
                };
                bp.override = inline;
                PB.override(b, o);
                b.extend = function(o) { 
                    PB.extend(b, o);
                };
                return b;
            };
        }(),
        /////////////////////////////////////////////////////////////////////////////////////////
        override: function(klass, o) {
            if (!o) return; 
            var p = klass.prototype;
            for (var m in o){
                p[m] = o[m];
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        capitalize: function(s) {
            return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        escapeForJS: function(s) {
            s = s.replace(/\\/, "\\\\");
            return s;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        generateGuid: function() {
            var S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return S4()+S4();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        safeId: function(s) {
            return s.replace(/[a-zA-Z0-9]/g, "_");
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        urlEncode: function(o){
            if(!o){
                return "";
            }
            var params = [];
            for(var key in o){
                if (o.hasOwnProperty(key) && o[key]) params.push([key, o[key]]);
            }
            params.sort(function(a,b) {
                return b[0]<a[0]?1:-1;
            });
            var buf = [];
            for(var i=0; i<params.length; i++){
                var ov = params[i][1], k = encodeURIComponent(params[i][0]);
                var type = typeof ov;
                if(type == 'undefined'){
                    buf.push(k, "=&");
                }else if(type != "function" && type != "object"){
                    buf.push(k, "=", encodeURIComponent(ov), "&");
                }else if($.isArray(ov)){
                    if (ov.length) {
                        for(var i = 0, len = ov.length; i < len; i++) {
                            buf.push(k, "=", encodeURIComponent(ov[i] === undefined ? '' : ov[i]), "&");
                        }
                    } else {
                        buf.push(k, "=&");
                    }
                }
            }
            buf.pop();
            return buf.join("");
        }
    });

})(jQuery);