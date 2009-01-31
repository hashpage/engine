(function($) {

    $.extend(PB, {
        frozenTimeCounter: 0,
        /////////////////////////////////////////////////////////////////////////////////////////
        // class-based inheritancy system taken from ExtJS
        extend: function(){
            var c = Object.prototype.constructor;
            var inline = function(o) {
                for (var m in o) {
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
            for (var m in o) {
                p[m] = o[m];
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        freezeTime: function() {
            if (this.nowValue) {
                return this.frozenTimeCounter++;
            }
            this.nowValue = +new Date;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        stepTime: function() {
            if (!this.nowValue) {
                console.error("stepTime called before freezeTime");
                return;
            }
            this.nowValue++;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        unfreezeTime: function() {
            if (this.frozenTimeCounter) {
                this.frozenTimeCounter--;
                return;
            }
            delete this.nowValue;
        },
    });

})(jQuery);