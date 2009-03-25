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
// require('modules/panels')
// require('classes/observable')
// require('classes/loader')
// require('classes/notifier')
// require('classes/service')
// require('classes/widget')
// require('debug')
//#dbg
(function($) {

    $.extend(HP, {
        mode: 'preview',
        serverMode: 0,
        /////////////////////////////////////////////////////////////////////////////////////////
        run: function(options) {
            console.log('HP.run', arguments);                                                          //#dbg
            HP.raw = !(parent && parent.HPS);
            options = options || {}; // TODO: check and sanitize options
            $.extend(HP, options);
            HP.urlParams = HP.parseUri(location).queryKey;

            $.now = function() {
                if (HP && HP.nowValue) return HP.nowValue;
                return +new Date;
            };

            $('body').addClass('hp-view-mode');
            HP.applyStyle();

            HP.loader = new HP.Loader();
            HP.notifier = new HP.Notifier();

            // create and run all known services
            for (var item in HP) { // look for all <some>Service classes in HP namespace
                if (HP.hasOwnProperty(item)) {
                    if (item.match(/.+Service$/) && HP[item].superclass) {
                        HP.addService(new HP[item]());
                    }
                }
            }
            HP.runServices();

            // common parameters for all API calls
            HP.commonParams = {
                pid: options.pid,
                seed: options.apiSeed
            };
            HP.deserialize();
            HP.ready = true;
            if (HP.raw) {
                HP.readyToGo();
                HP.activate();
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        enterMode: function(mode) {
            console.log('HP.enterMode', arguments);                                                 //#dbg
            if (this.mode==mode) return;
            console.log('  -- changing mode to ', mode);                                            //#dbg
            var body = $('body');
            body.removeClass('hp-'+this.mode+'-mode');
            body.addClass('hp-'+mode+'-mode');
            if (this.mode=='design' && this.leaveDesignMode) this.leaveDesignMode();
            this.mode = mode;
            if (this.mode=='design') this.enterDesignMode();
            this.notifyWidgets("onMode", mode);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        loadEditor: function(fn) {
            console.log('HP.loadEditor', arguments);                                                //#dbg
            if (HP.editorPresent) {
                console.log('  -- editor already present');                                         //#dbg
                if (fn) fn();
                return;
            }
            var notification = HP.showNotification('Loading editor', 'hp-notification-loader');
            if (!HP.callThisOnEditorLoad) HP.callThisOnEditorLoad=[];
            HP.callThisOnEditorLoad.push(function() {
                HP.hideNotification(notification);
                if (fn) fn();
            });
            if (HP.editorBeingLoaded) {
                console.log('  -- editor being loaded');                                            //#dbg
                return;
            }
            HP.editorBeingLoaded = true;
            var head = $('head');
            head.children('script').each(function() {
                var script = $(this);
                var url = script.attr('src');
                if (url && url.match(/hashpage\.js/)) {
                    var editorUrl = url.replace('hashpage.js', 'editor.js').replace('/engine/', '/editor/');
                    head.append($('<script type="text/javascript" src="'+editorUrl+'"/>'));
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        showNotification: function(msg, klass) {
            if (!parent && !parent.HPS) return;
            return parent.HPS.showNotification(msg, klass);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        hideNotification: function(notification) {
            if (!parent && !parent.HPS) return;
            return parent.HPS.hideNotification(notification);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        deserialize: function() {
            var roots = $('.hashpage');
            roots.buildStructure();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        parentNavigate: function() {
            this.notifier.fireEvent.apply(this.notifier, ['navigate'].concat($.makeArray(arguments)));
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        containerAction: function() {
            // no op - re-implemented by editor
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getEngineId: function() {
            return $('html').attr('hashpage-engine');
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        readyToGo: function() {
            console.log("HP.readyToGo");                                                            //#dbg
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        activate: function() {
            console.log("HP.activate");                                                             //#dbg
            var widgets = $('.hp-widget:solid');
            var counter = 0;
            widgets.loadWidgets(function() {
                counter++;
                if (counter==widgets.length) {
                    HP.widgetsVisibilityChanged();
                }
            });
            HP.possibleLayoutChange(null, 'activate');
            
            if (HP.urlParams['gift']) {
                HP.presentGiftPanel(HP.urlParams['gift']);
            } else {
                if (HP.raw) HP.presentHashPagePanel();
            }
        }
    });

})(jQuery);