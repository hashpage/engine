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
// require('debug')

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
            PB.ready = true;
            if (!(parent && parent.PBS)) {
                PB.readyToGo();
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        enterMode: function(mode) {
            console.log('PB.enterMode', arguments);                                                 //#dbg
            if (this.mode==mode) return;
            console.log('  -- changing mode to ', mode);                                            //#dbg
            var body = $('body');
            body.removeClass('pb-'+this.mode+'-mode');
            body.addClass('pb-'+mode+'-mode');
            if (this.mode=='edit') this.leaveEditMode();
            this.mode = mode;
            if (this.mode=='edit') this.enterEditMode();
            this.notifyWidgets("onMode", mode);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        loadEditor: function(fn) {
            console.log('PB.loadEditor', arguments);                                                //#dbg
            if (PB.editorPresent) {
                console.log('  -- editor already present');                                         //#dbg
                if (fn) fn();
                return;
            }
            var notification = PB.showNotification('Loading editor', 'pb-notification-loader');
            if (!PB.callThisOnEditorLoad) PB.callThisOnEditorLoad=[];
            PB.callThisOnEditorLoad.push(function() {
                PB.hideNotification(notification);
                if (fn) fn();
            });
            if (PB.editorBeingLoaded) {
                console.log('  -- editor being loaded');                                            //#dbg
                return;
            }
            PB.editorBeingLoaded = true;
            var head = $('head');
            head.children('script').each(function() {
                var script = $(this);
                var url = script.attr('src');
                if (url && url.match(/pagebout\.js/)) {
                    var editorUrl = url.replace('pagebout.js', 'editor.js').replace('/engine/', '/editor/');
                    head.append('<script type="text/javascript" src="'+editorUrl+'"></script>');
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        showNotification: function(msg, klass) {
            if (!parent && !parent.PBS) return;
            return parent.PBS.showNotification(msg, klass);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        hideNotification: function(notification) {
            if (!parent && !parent.PBS) return;
            return parent.PBS.hideNotification(notification);
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
        getEngineId: function() {
            return $('html').attr('pagebout-engine');
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        readyToGo: function() {
            console.log("PB.readyToGo");                                                            //#dbg
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        activate: function() {
            console.log("PB.activate");                                                             //#dbg
            PB.widgetsVisibilityChanged();
            PB.visibleWidgetElements.loadWidgets();
        }
    });

})(jQuery);