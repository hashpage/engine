// require('lib/firebugx')
// require('lib/sha1')
// require('lib/jquery/jquery')
// require('lib/jquery/ui/ui.core')
// require('lib/jquery/ui/ui.sortable')
// require('lib/jquery/ui/ui.draggable')
// require('lib/jquery/ui/ui.droppable')
// require('base')

(function($) {

    $.extend(PB, {
        serverMode: 0,
        visibleWidgets: [],
        widgets: {},
        instances: {},
        services: {},
        instanceConfigs: {},
        dependencyManager: {},
        layoutChangesGuard: 0,
        dependenciesGuard: 0,
        mode: 'view',
        /////////////////////////////////////////////////////////////////////////////////////////
        enterMode: function(mode) {
            var body = $('body');
            body.removeClass('pb-'+this.mode+'-mode');
            body.addClass('pb-'+mode+'-mode');
            this.mode = mode;
            this.notifyWidgets("onMode", mode);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyStyle: function() {
            var style = $('<style>'+PB.css+'</style>');
            $('head').append(style);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        loadEditor: function(fn) {
            if (PB.editorPresent) {
                if (fn) fn();
                return;
            }
            var head = $('head');
            head.children('script').each(function() {
                var s = $(this);
                var url = s.attr('src');
                if (url && url.match(/pagebout\.js/)) {
                    PB.showNotification('Loading editor', 'pb-notification-loader');
                    PB.callThisOnEditorLoad = function() {
                        PB.hideNotification();
                        if (fn) fn();
                    };
                    var editorUrl = url.replace('pagebout.js', 'editor.js').replace('/engine/', '/editor/');
                    head.append('<script type="text/javascript" src="'+editorUrl+'"></script>');
                    return;
                }
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        showNotification: function(msg, klass) {
            klass = klass || '';
            var loader = '<img src="#{BASE_URL}/static/red-loader.gif" class="pb-loader"/>';
            $('body').append($('<div class="pb-notification '+klass+'"></div>').html(msg).append(loader));
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        hideNotification: function(msg, klass) {
            $('body').children('.pb-notification').fadeOut(2000, function() {
                $(this).remove();
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        nakedDomain: function() {
            var domain = document.domain;
            var a = domain.split(".");
            var naked = domain;
            if (a.length>2) naked = a[a.length-2]+"."+a[a.length-1];
            return naked;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        url: function(name, path) {
            var domain = this.nakedDomain();
            return "http://"+name+"."+domain+"/"+path;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        widgetUrl: function(name) {
            if (name.substring(0,4)=="http") return name; // absolute url specified
            if (!this.serverMode) return "http://widgets.pagebout.com/"+name; // relative url specified and in production
            if (this.serverMode==1) return "http://localhost:9876/widgets/"+name; // relative url specified and in development
            if (this.serverMode==2) return "http://widgets.pagebout.local/"+name; // relative url specified and in simulation
            console.error("Unknown serverMode");
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        parseGuidFromId: function(id) {
            return id;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        registerWidgetClass: function(selector, widget) {
            PB.widgets[selector] = widget;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        registerWidget: function(selector, widgetDef) {
            var widget = function(config) {
                widget.superclass.constructor.call(this);
            };
            PB.extend(widget, PB.Widget, widgetDef);
            widget.prototype.templates = {};
            widget.prototype.css = "";
            PB.registerWidgetClass(selector, widget);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getWidget: function(name) {
            var selector = this.widgetUrl(name);
            return PB.widgets[selector];
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        initWidgetInstance: function(el) {
            var widgetElement = $(el);
            var widgetName = widgetElement.attr("widget");
            if (!widgetName) {
                console.error('No widget specified for ', widgetElement);
                return;
            }
            console.log("Initializing widget:", widgetName);
            var guid = PB.parseGuidFromId(widgetElement.attr("id"));
            if (!guid) {
                console.error('No guid specified for ', widgetElement);
                return;
            }
            var widgetClass = PB.getWidget(widgetName);
            if (!widgetClass) {
                console.error('Unable to resolve class specified for %s (%o)', widgetName, widgetElement);
                return;
            }
            var instance = new widgetClass();
            if (!instance) {
                console.error('Unable to instantiate widget specified for %s (%o)', widgetName, widgetElement);
                return;
            }
            var contentElement = el.find('div.pb-widget-body');
            if (contentElement.length!=1) {
                console.error('Bad widget markup structure for %s (%o)', widgetName, widgetElement);
                return;
            }
            var staticHtml = instance.staticHtml;
            if (staticHtml) {
                contentElement.attr('innerHTML', staticHtml);
            }
            var info = this.parseWidgetName(widgetName);
            instance.init(guid, contentElement, info);
            PB.instances[guid] = instance;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        parseWidgetName: function(name) {
            var res = { version: 'master' };
            var parts = name.split("/");
            if (parts[parts.length-3]!="widgets") res.version = parts.pop(); // HACK for devel mode
            res.name = parts.pop();
            res.author = parts.pop();
            return res;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getWidgetInstance: function(guid_or_el) {
            if (typeof guid_or_el != "string") {
                guid_or_el = PB.parseGuidFromId($(guid_or_el).attr("id"));
                if (!guid_or_el) {
                    console.error('No guid specified for ', guid_or_el);
                    return;
                }
            }
            return PB.instances[guid_or_el];
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        deserialize: function() {
            var roots = $('.pagebout');
            roots.buildStructure();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        pauseDependencyNotifications: function() {
            this.dependenciesGuard++;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        resumeDependencyNotifications: function() {
            this.dependenciesGuard--;
            if (this.layoutChangesGuard<0) {
                console.error("Inconsitent pause/resume on layout changes");
                console.trace();
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        declareDependency: function(who, what) {
            if (typeof what != "string") {
                what = '#'+$(what).attr("id");
            }
            if (!what) return;
        
            if (!this.dependencyManager[what]) this.dependencyManager[what] = [];
            if ($.inArray(who, this.dependencyManager[what])==-1) {
                this.dependencyManager[what].push(who);
                console.log("Declared dependency %o -> %s", who, what);
            }
            return true;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        undeclareDependency: function(who, what) {
            if (typeof what != "string") {
                what = '#'+$(what).attr("id");
            }
            if (!what) return;
            var records = this.dependencyManager[what];
            if (!records) return false;
            var index = $.inArray(who, records);
            if (index==-1) return false;
            records.splice(index, 1);
            return true;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        pauseLayoutChanges: function() {
            this.layoutChangesGuard++;
            this.layoutChangesDirty = false;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        resumeLayoutChanges: function() {
            this.layoutChangesGuard--;
            if (this.layoutChangesGuard<0) {
                console.error("Inconsitent pause/resume on layout changes");
                console.trace();
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        possibleLayoutChange: function(id, noAnim, reason) {
            if (this.disableLayouting) return;
            if (this.layoutChangesGuard) {
                this.layoutChangesDirty = true;
                return; // changes are paused
            }
            if (this.mode!="edit") return; // renormalize only in edit mode
            var el = id;
            if (!el) {
                el = $('.pagebout');
            } else {
                if (typeof el == "string") el = $(el);
                el = el.parentsAndMe('.pagebout');
            }
            if (!reason) reason = ""; else reason = " ("+reason+")";
            var layoutingWorker = function() {
                if (noAnim) return el.normalize().enlarge(!noAnim);
                // case with animation
                PB.layoutingInProgress = true;
                PB.freezeTime();
                setTimeout(function() {
                    PB.layoutingInProgress = false;
                    if (PB.layoutQueued) {
                        var worker = PB.layoutQueued;
                        PB.layoutQueued = undefined;
                        worker();
                    }
                }, 500);
                el.normalize().enlarge(!noAnim);
                PB.unfreezeTime();
            }
            console.log('Layouting'+reason+(noAnim?"":" with animation"), el);
            if (PB.layoutingInProgress) {
                console.log(" --- queued because previous layouting is in progress");
                PB.layoutQueued = layoutingWorker;
                return;
            }
            layoutingWorker();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        notifyDependants: function(what, kind, params) {
            // TODO: tady to bude chtit nejake cachovani a odfiltrovani duplicit
            if (this.dependenciesGuard) return; // dependencies are paused
            var args = $.makeArray(arguments);
            console.log("Notification: %s (%o)", kind, what, args.splice(2));
            if (typeof what != "string") {
                what = '#'+$(what).attr("id");
            }
            if (!what) return;
            var records = this.dependencyManager[what];
            if (!records) return;
            for (var i=0; i < records.length; i++) {
                var record = records[i];
                console.log("Notifying %o", record, arguments);
                record.onDependencyChanged.apply(record, arguments);
            }
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        widgetsVisibilityChanged: function() {
            var previouslyVisible = this.visibleWidgets;
            var visibleElements = $('.pb-widget:reallyvisible');
            var newlyVisible = [];
            for (var i=0; i<visibleElements.length; i++) {
                var el = visibleElements.get(i);
                var instance = this.getWidgetInstance(el);
                if (instance) {
                    newlyVisible.push(instance);
                }
            }
            for (var i=0; i < previouslyVisible.length; i++) {
                var instance = previouslyVisible[i];
                if ($.inArray(instance, newlyVisible)) {
                    instance.hide();
                }
            };
            for (var i=0; i < newlyVisible.length; i++) {
                var instance = newlyVisible[i];
                if ($.inArray(instance, previouslyVisible)==-1) {
                    instance.show();
                }
            };
            this.visibleWidgets = newlyVisible;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        addService: function(service) {
            this.services[service.id] = service;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        removeService: function(serviceId) {
            this.services[serviceId];
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        runServices: function() {
            // make services array
            var services = [];
            for (var service in this.services){
                this.services.hasOwnProperty(service);
                services.push(this.services[service]);
            };
        
            // sort by priority
            services.sort(function(a,b) {
               return a.priority>b.priority; 
            });
        
            // start services
            var serviceNames = [];
            for (var i=0; i < services.length; i++) {
                var service = services[i];
                serviceNames.push(service.id);
                service.start();
            }
        
            console.log("Started services %o", serviceNames);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getService: function(serviceId) {
            return this.services[serviceId];
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getServiceConfig: function(serviceId) {
            return this.serviceConfigs[serviceId];
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getWidgetConfig: function(widgetId) {
            return this.instanceConfigs[widgetId] || {}; // TODO: config should exist always
        }, 
        /////////////////////////////////////////////////////////////////////////////////////////
        setWidgetConfig: function(widgetId, config) {
            return this.instanceConfigs[widgetId] = config;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        notifyWidgets: function() {
            var args = $.makeArray(arguments);
            var method = args.shift();
            $.each(this.instances, function(i, o) {
                o[method].apply(o, args);
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        widgetAction: function() {
            // no op
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        readyToGo: function() {
            console.log("Starting page");
            PB.widgetsVisibilityChanged();
        }
    });

})(jQuery);