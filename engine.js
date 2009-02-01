// require('lib/firebugx')
// require('lib/jquery/jquery')
// require('lib/jquery/ui/ui.core')
// require('lib/jquery/ui/ui.sortable')
// require('lib/jquery/ui/ui.draggable')
// require('lib/jquery/ui/ui.droppable')
// require('modules/base')
// require('modules/utils')
// require('modules/builder')
// require('modules/namer')
// require('modules/layouter')
// require('modules/services')
// require('modules/widgets')
// require('modules/dependencies')
// require('classes/observable')
// require('classes/loader')
// require('classes/notifier')
// require('classes/service')
// require('classes/widget')

(function($) {

    $.extend(PB, {
        mode: 'view',
        serverMode: 0,
        /////////////////////////////////////////////////////////////////////////////////////////
        run: function(options) {
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

            // create and run all known services
            for (var item in PB) { // look for all <some>Service classes in PB namespace
                if (PB.hasOwnProperty(item)) {
                    if (item.match(/.+Service$/) && PB[item].superclass) {
                        PB.addService(new PB[item]());
                    }
                }
            }
            PB.runServices();

            // common parameters for all API calls
            PB.commonParams = {
                pid: options.pid
            };
            PB.deserialize();
            PB.readyToGo();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        enterMode: function(mode) {
            var body = $('body');
            body.removeClass('pb-'+this.mode+'-mode');
            body.addClass('pb-'+mode+'-mode');
            this.mode = mode;
            this.notifyWidgets("onMode", mode);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        loadEditor: function(fn) {
            if (PB.editorPresent) {
                if (fn) fn();
                return;
            }
            var head = $('head');
            head.children('script').each(function() {
                var script = $(this);
                var url = script.attr('src');
                if (url && url.match(/pagebout\.js/)) {
                    PB.showNotification('Loading editor', 'pb-notification-loader');
                    PB.callThisOnEditorLoad = function() {
                        PB.hideNotification();
                        if (fn) fn();
                    };
                    var editorUrl = url.replace('pagebout.js', 'editor.js').replace('/engine/', '/editor/');
                    head.append('<script type="text/javascript" src="'+editorUrl+'"></script>');
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        showNotification: function(msg, klass) {
            klass = klass || '';
            var loader = '<img src="#{BASE_URL}/static/red-loader.gif" class="pb-loader"/>';
            $('body')
                .append($('<div class="pb-notification '+klass+'"></div>').html(msg).append(loader));
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        hideNotification: function(msg, klass) {
            $('body').children('.pb-notification').fadeOut(2000, function() {
                $(this).remove();
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        deserialize: function() {
            var roots = $('.pagebout');
            roots.buildStructure();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        containerAction: function() {
            // no op - re-implemented by editor
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        readyToGo: function() {
            console.log("Starting page");                                                           //#dbg
            PB.ready = true;
            PB.widgetsVisibilityChanged();
        }
    });

})(jQuery);