// require('engine')

(function($) {

     $.extend(HP, {
         visibleWidgetInstances: [],
         widgets: {},
         instances: {},
         instanceConfigs: {},
         instanceStates: {},
         /////////////////////////////////////////////////////////////////////////////////////////
         widgetUrl: function(name) {
             if (name.substring(0,4)=="http") return name; // absolute url specified
             if (!this.serverMode) return "http://widgets.hashpage.com/"+name; // relative url specified and in production
             if (this.serverMode==1) return "http://localhost:9876/widgets/"+name; // relative url specified and in development
             if (this.serverMode==2) return "http://widgets.hashpage.local/"+name; // relative url specified and in simulation
             console.error("Unknown serverMode");                                                   //#chk
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         parseGuidFromId: function(id) {
             return id;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         registerWidgetClass: function(selector, widget) {
             console.log('HP.registerWidgetClass', arguments);                                      //#dbg
             HP.widgets[selector] = widget;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         registerWidget: function(selector, widgetDef) {
             console.log('HP.registerWidget', arguments);                                           //#dbg
             var widget = function(config) {
                 widget.superclass.constructor.call(this);
             };
             HP.extend(widget, HP.Widget, widgetDef);
             widget.prototype.templates = {};
             widget.prototype.css = "";
             HP.registerWidgetClass(selector, widget);
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         hasWidget: function(name) {
             var selector = this.widgetUrl(name);
             return HP.widgets[selector];
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getWidget: function(name) {
             var selector = this.widgetUrl(name);
             var widget = HP.widgets[selector];
             if (!widget) {                                                                         //#chk
                 console.error('Unable to get widget', name);                                       //#chk
             }                                                                                      //#chk
             return widget;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         initWidgetInstance: function(el) {
             console.log('HP.initWidgetInstance', arguments);                                       //#dbg
             var widgetElement = $(el);
             var widgetName = widgetElement.attr("widget");
             if (!widgetName) {                                                                                  //#chk
                 console.error('No widget specified for ', widgetElement);                                       //#chk
                 return;                                                                                         //#chk
             }                                                                                                   //#chk
             console.log("Initializing widget:", widgetName);                                                    //#dbg
             var guid = HP.parseGuidFromId(widgetElement.attr("id"));
             if (!guid) {                                                                                        //#chk
                 console.error('No guid specified for ', widgetElement);                                         //#chk
                 return;                                                                                         //#chk
             }                                                                                                   //#chk
             var widgetClass = HP.getWidget(widgetName);
             if (!widgetClass) {                                                                                 //#chk
                 console.error('Unable to resolve class specified for %s (%o)', widgetName, widgetElement);      //#chk
                 return;                                                                                         //#chk
             }                                                                                                   //#chk
             var instance = new widgetClass();
             if (!instance) {                                                                                    //#chk
                 console.error('Unable to instantiate widget specified for %s (%o)', widgetName, widgetElement); //#chk
                 return;                                                                                         //#chk
             }                                                                                                   //#chk
             var contentElement = el.find('div.hp-widget-body');
             if (contentElement.length!=1) {                                                                     //#chk
                 console.error('Bad widget markup structure for %s (%o)', widgetName, widgetElement);            //#chk
                 return;                                                                                         //#chk
             }                                                                                                   //#chk
             var staticHtml = instance.staticHtml;
             if (staticHtml) {
                 contentElement.attr('innerHTML', staticHtml);
             }
             var info = this.parseWidgetName(widgetName);
             instance.init(guid, contentElement, info);
             HP.instances[guid] = instance;
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
         getWidgetGuid: function(el) {
             var guid = HP.parseGuidFromId($(el).attr("id"));
             if (!guid) {                                                                           //#chk
                 console.error('No guid specified for ', el);                                       //#chk
                 return;                                                                            //#chk
             }                                                                                      //#chk
             return guid;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getWidgetInstance: function(guid_or_el) {
             if (typeof guid_or_el != "string") {
                 guid_or_el = this.getWidgetGuid(guid_or_el);
             }
             return HP.instances[guid_or_el];
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         widgetsVisibilityChanged: function() {
             //if (HP.inWidgetsVisibilityChanged) return;
             HP.inWidgetsVisibilityChanged = true;
             console.log('HP.widgetsVisibilityChanged', arguments);                                 //#dbg
             var previouslyVisible = this.visibleWidgetInstances;
             var visibleElements = $('.hp-widget:reallyvisible');
             console.log('  visible:', visibleElements);                                            //#dbg
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
             this.visibleWidgetInstances = newlyVisible;
             this.visibleWidgetElements = visibleElements;
             HP.inWidgetsVisibilityChanged = false;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getWidgetConfig: function(widgetId) {
             return this.instanceConfigs[widgetId];
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         setWidgetConfig: function(widgetId, config) {
             return this.instanceConfigs[widgetId] = config;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getWidgetState: function(widgetId) {
             return this.instanceStates[widgetId];
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         setWidgetState: function(widgetId, state) {
             return this.instanceStates[widgetId] = state;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         serializeWidgetStates: function() {
             console.log('HP.serializeWidgetStates', arguments);                                    //#dbg
             var data = {};
             var widgets = $('.hp-widget');
             widgets.each(function() {
                 var guid = HP.getWidgetGuid(this);
                 var instance = HP.getWidgetInstance(guid);
                 if (!instance) {                                                                   //#chk
                     console.error('Unable to retrieve widget instance for guid=%o', guid);         //#chk
                     return;                                                                        //#chk
                 }                                                                                  //#chk
                 var state = instance.getState();
                 data[guid] = state;
             });
             console.log('  result:', data);                                                        //#dbg
             return data;
         },    
         /////////////////////////////////////////////////////////////////////////////////////////
         unserializeWidgetStates: function(data) {
             console.log('HP.unserializeWidgetStates', arguments);                                  //#dbg
             this.instanceStates = data;
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
