// require('lib/jquery/jquery')
(function($) {

$.extend($.expr[ ":" ], { 
    reallyvisible : "!(jQuery(a).is(':hidden') || jQuery(a).parents(':hidden').length)" 
});

$.fn.parentsAndMe = function(exp) {
    var me = this.filter(exp);
    if (me.length>0) return me;
    return this.parents(exp);
};

$.fn.clap = function(c) {
    if (!c) {
        c = { selector: "***hide***" };
    }
    
    if (typeof c == "string") {
        c = { selector: c };
    }

    c = $.extend({
        selector: ":first"
    }, c);

    return this.each(function() {
        var el = $(this);
        el.children().hide();
        if (c.selector!="***hide***") el.find(c.selector).show();
    });
};

$.fn.formToHash = function() {
    var a = this.formToArray.apply(this, arguments);
    var s = {};
    for (var i=0; i < a.length; i++) {
        s[a[i].name] = a[i].value;
    }
    return s;
};

$.fn.hint = function() {
    return this.each(function() {
        // get jQuery version of 'this'
        var t = $(this);
        // get it once since it won't change
        var title = t.attr('title');
        // only apply logic if the element has the attribute
        if (title) {
            // on blur, set value to title attr if text is blank
            t.blur(function() {
                if (t.val() == '') {
                    t.val(title);
                    t.addClass('blur');
                }
            });
            // on focus, set value to blank if current value 
            // matches title attr
            t.focus(function() {
                if (t.val() == title) {
                    t.val('');
                    t.removeClass('blur');
                }
            });

            // clear the pre-defined text when form is submitted
            t.parents('form:first()').submit(function() {
                if (t.val() == title) {
                    t.val('');
                    t.removeClass('blur');
                }
            });

            // now change all inputs to title
            t.blur();
        }
    });
};

$.fn.state = function(state, title) {
    return this.each(function() {
        var e = $(this);
        e.removeClass(/^state-/);
        if (state) e.addClass("state-"+state);
        if (title) e.attr('title', title);
    });
};

$.fn.indicator = function(state, size) {
    if (!size) size = 16;
    if (!state) state = 'ok';
    var e = this.get(0);
    if (!e) return;
    e = $(e);
    var i = $('<img width="'+size+'" height="'+size+'" src="#{SYSTEM_URL}/static/jxlib/images/a_pixel.png"/>');
    e.append(i);
    var o = {
        state: function(state) {
            i.attr('className', 'indicator'+size+'-' + state);
            if (arguments[1]) {
                i.attr('title', arguments[1]);
            }
        },
        get: function() {
            return i;
        },
        remove: function() {
            i.remove();
        }
    };
    o.state(state);
    return o;
};

})(jQuery);