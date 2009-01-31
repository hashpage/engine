// require('engine')

(function($) {
    
     $.extend(PB, {
         visibleWidgets: [],
         widgets: {},
         instances: {},
         instanceConfigs: {},
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
             // no op - re-implemented by editor
         }
     });
    
})(jQuery);