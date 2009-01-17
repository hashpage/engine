// require('lib/firebugx')
// require('lib/sha1')
// require('lib/jquery/jquery')
// require('lib/jquery/ui/core')
// require('lib/jquery/ui/sortable')
// require('lib/jquery/ui/draggable')
// require('lib/jquery/ui/droppable')
// require('base')

(function($) {

    $.extend(PB, {
        serverMode: 0,
        visibleWidgets: [],
        templates: [],
        widgets: {},
        instances: {},
        services: {},
        instanceConfigs: {},
        dependencyManager: {},
        /////////////////////////////////////////////////////////////////////////////////////////
        applyStyle: function() {
            var style = $('<style>'+PB.css+'</style>');
            $('head').append(style);
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
            return "http://widgets.pagebout.local/"+name; // relative url specified
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
                console.log('No widget specified for ', widgetElement);
                return;
            }
            console.log("Initializing widget:", widgetName);
            var guid = PB.parseGuidFromId(widgetElement.attr("id"));
            if (!guid) {
                console.log('No guid specified for ', widgetElement);
                return;
            }
            var widgetClass = PB.getWidget(widgetName);
            if (!widgetClass) {
                console.log('Unable to resolve class specified for %s (%o)', widgetName, widgetElement);
                return;
            }
            var instance = new widgetClass();
            if (!instance) {
                console.log('Unable to instantiate widget specified for %s (%o)', widgetName, widgetElement);
                return;
            }
            var contentElement = el.find('div.pb-widget-body');
            if (contentElement.length!=1) {
                console.log('Bad widget markup structure for %s (%o)', widgetName, widgetElement);
                return;
            }
            var staticHtml = instance.staticHtml;
            if (staticHtml) {
                contentElement.attr('innerHTML', staticHtml);
            }
            instance.init(guid, contentElement);
            PB.instances[guid] = instance;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getWidgetInstance: function(guid_or_el) {
            if (typeof guid_or_el != "string") {
                guid_or_el = PB.parseGuidFromId($(guid_or_el).attr("id"));
                if (!guid_or_el) {
                    console.log('No guid specified for ', guid_or_el);
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
        possibleLayoutChange: function(id) {
            if (this.mode!="edit") return; // renormalize only in edit mode
            var el = id;
            if (!el) {
                el = $('.pagebout');
            } else {
                if (typeof el == "string") el = $(el);
                el = el.parentsAndMe('.pagebout');
            }
            console.log('layout-change', el.get(0));
            el.normalize().enlarge();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        notifyDependants: function(what, kind, params) {
            // TODO: tady to bude chtit nejake cachovani a odfiltrovani duplicit
            var args = $.makeArray(arguments);
            console.log("%s (%o)", kind, what, args.splice(2));
            if (typeof what != "string") {
                what = '#'+$(what).attr("id");
            }
            if (!what) return;
        
            if (kind=="widget.draggedin" || kind=="widget.draggedout" || kind=="widget.resized" ||
                kind=="widget.collapsed" || kind=="widget.expanded" || kind=="widget.changed" || 
                kind.match(/^container\.split/)) {
                this.possibleLayoutChange(what);
                this.refreshSelectedContainer();
            }
        
            var records = this.dependencyManager[what];
            if (!records) return;
            for (var i=0; i < records.length; i++) {
                var record = records[i];
                console.log("notifying %o", record, arguments);
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
        readyToGo: function() {
            console.log("Starting page");
            PB.widgetsVisibilityChanged();
        }
    });

})(jQuery);