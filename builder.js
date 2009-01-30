// require('boot')

(function($) {
    PB.logBuilder = false;
    
    $.extend($.expr[":"], { 
        solid: function(el) {
            var el = $(el);
            if (el.hasClass("ui-sortable-helper")) return false;
            if (el.hasClass("pb-hidden")) return false;
            return el.is(':reallyvisible');
        }
    });
    
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.parseSpan = function() {
        var container = $(this.get(0));
        var classes = container.attr('className').split(' ');
        for (var i=0; i < classes.length; i++) {
            var klass = classes[i];
            var res = klass.match(/span-([0-9]+)/);
            if (res) {
                return parseInt(res[1], 10);
            }
        }
        return 24; // max blueprint column count
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    // data attrs are ugly, but according to HTML5 specs
    $.fn.dataAttrs = function() {
        var res = {};
        this.each(function() {
            var len = this.attributes.length;
            for (var i=0; i<len; i++) {
                var a = this.attributes.item(i);
                if (a.specified && a.name.match(/^data-/)) {
                    res[a.name.substring(5)] = a.value;
                }
            }
        });
        return res;
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.applyOpenContainerMask = function() {
        return this.each(function() {
            var el = $(this);
            var applied = el.children('.pb-open-container-mask');
            if (applied.length) return;
            var mask = $('<div class="pb-open-container-mask"></div>');
            el.prepend(mask);
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.removeOpenContainerMask = function() {
        return this.each(function() {
            var el = $(this);
            el.children('.pb-open-container-mask').remove();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateOpenContainers = function() {
        return this.each(function() {
            var el = $(this);
            if (el.children('.pb-widget:solid').length || el.children('.pb-widget-reordering-placeholder').length) el.removeClass("pb-empty"); else el.addClass("pb-empty");
            if (el.find('.pb-container').length) { // closed container
                if (!el.hasClass('pb-open-container')) return; // nothing to do
                if (el.hasClass('pb-container-reordering-area')) return; // HACK
                if (PB.destroySortable) PB.destroySortable(el); // TODO: cleanup
                el.removeClass('pb-open-container');
                el.removeOpenContainerMask();
            } else { // open container
                if (el.hasClass('pb-open-container')) return; // nothing to do
                el.addClass('pb-open-container');
                el.applyOpenContainerMask();
                if (PB.applySortable) PB.applySortable(el); // TODO: cleanup
                el.bind("mouseover.pb", function(e) {
                    var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
                    if (!reltg) return;
                    if (reltg.prefix=="xul") return; // firebug hack
                    var rt = $(reltg);
                    if (rt.parentsAndMe('.pb-widget').length==0 && rt.parentsAndMe('.pb-open-container-hovered').length>0) return;
                    $(this).hoverContainer(e);
                });
                el.bind("mouseout.pb", function(e) {
                    var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement;
                    if (!reltg) return;
                    try {
                        if (reltg.prefix=="xul") return; // firebug hack
                        if ($(reltg).parentsAndMe('.pb-open-container-hovered').length>0) return;
                    } catch (e) {} // nekdy na FF odjedu kurzorem na firebug a hazi to divne hlasky o access denied k reltagu
                    $(this).unhoverContainer(e);
                });
            }
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateLastContainers = function() {
        return this.each(function() {
            var el = $(this);
            var parent = $(this.parentNode);
            if (!this.parentNode || el.parseSpan() == parent.parseSpan() || el.nextAll('.pb-container:solid').length==0) {
                el.addClass('pb-last-container');
            } else {
                el.removeClass('pb-last-container');
            }
            el.children('.pb-container').updateLastContainers();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateLastWidgets = function() {
        var widgets = this.children('.pb-widget:solid');
        if (!widgets.length) return;
        widgets.removeClass('pb-last-widget');
        widgets.eq(widgets.length-1).addClass('pb-last-widget');
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateContainerState = function() {
        return this.each(function() {
            var el = $(this);
            el.updateLastContainers();
            el.updateOpenContainers();
            if (el.addDragBars) el.addDragBars(); // TODO: cleanup
            el.updateLastWidgets();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    PB.createContainer = function(data) {
        var id = data.id || PB.pickUniqueName();
        var span = " ";
        if (data.span) span += "span-"+data.span;
        var container = $('<div id="'+id+'" class="pb-container'+span+'"></div>');
        if (data.title) {
            container.attr('title', data.title);
        }
        return container;
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    PB.createWidget = function(data) {
        var id = data.id || PB.pickUniqueName();
        PB.setWidgetConfig(id, data.config||{});
        var info = PB.parseWidgetName(data.widget);
        var wclass = info.author+"-"+info.name;
        var widget = $('<div id="'+id+'" class="pb-widget pb-pinned '+wclass+'" widget="'+data.widget+'"></div>');
        var iconUrl = PB.widgetUrl(data.widget) + "/icon.png";
        var thumbUrl = PB.widgetUrl(data.widget) + "/thumbnail.png";
        var widgetTemplate = [];
        widgetTemplate.push('<div class="pb-widget-thumbnail">');
        widgetTemplate.push('<img width="64" height="48" src="'+thumbUrl+'" title="'+data.widget+'">');
        widgetTemplate.push('<div class="pb-widget-thumbnail-ident">');
        widgetTemplate.push('<div class="pb-widget-thumbnail-name">'+info.name+'</div>');
        widgetTemplate.push('<div class="pb-widget-thumbnail-author">'+info.author+'</div>');
        widgetTemplate.push('</div>');
        widgetTemplate.push('</div>');
        widgetTemplate.push('<div class="pb-widget-panel">');
        widgetTemplate.push('<div class="pb-widget-body"></div>');
        widgetTemplate.push('</div>');
        widget.html(widgetTemplate.join(''));
        widget.children('.pb-widget-thumbnail').dblclick(function(){
            PB.widgetAction(widget, 'expand');
        });
        widget.children('.pb-widget-panel').dblclick(function(){
            PB.widgetAction(widget, 'collapse');
        });
        if (data.state) {
            if (data.state=="expanded") {
                setTimeout(function() { // widget jeste neni v DOMu a nezafungovalo by memoize
                    widget.widgetAction("expand");
                }, 500);
            }
            if (data.state=="collapsed") {
                setTimeout(function() {
                    widget.widgetAction("collapse");
                }, 500);
            }
        }
        if (PB.logBuilder) console.log("Loading widget: ", data.widget);
        PB.loader.loadWidget(data.widget, function() {
            PB.initWidgetInstance(widget);
            PB.widgetsVisibilityChanged();
        });
        return widget;
    }; 
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.buildStructure = function() {
        function extractWidgetData(schema) {
            var data = {};
            data.widget = schema.attr('data-widget');
            data.id = schema.attr('data-id');
            data.state = schema.attr('data-state');
            data.config = {};
            var attrs = schema.dataAttrs();
            for (a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                    data.config[a] = attrs[a]; 
                }
            }
            return data;
        }
        function extractContainerData(schema, span) {
            var data = {};
            data.id = schema.attr('data-id');
            data.span = schema.attr('data-span') || span;
            data.title = schema.attr('data-title');
            data.config = {};
            return data;
        }
        function buildStructureWorker(schema, span) {
            var widget = schema.attr('data-widget');
            if (widget) {
                var data = extractWidgetData(schema);
                return PB.createWidget(data);
            } 
            
            // container
            var data = extractContainerData(schema, span);
            var container = PB.createContainer(data);
            
            schema.children().each(function() {
                var sub = $(this);
                var subResult = buildStructureWorker(sub, data.span);
                container.append(subResult);
            });
            
            return container;
        }
        /////////////////////////////////////////////////////////////////////////////////////////
        function sanitize(result) {
            result.children('.pb-widget').remove(); // kdyby dal nekdo widgety na root uroven
            if (result.children('.pb-container').length==0) {
                // musime mit alespon jeden container na root urovni
                var container = PB.createContainer({
                    id: "content"
                });
                container.appendTo(result);
            }
        }

        return this.each(function() {
            var el = $(this);
            var schema = el;
            var span = schema.parseSpan() || 24;
            var result = buildStructureWorker(schema, span);
            schema.empty();
            
            sanitize(result);
            
            el.addClass('pb-container');
            el.append(result.children());
            el.find('.pb-container').updateContainerState();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    function serializeContainer(el) {
        if (PB.logBuilder) console.log("Serializing container ", el.get(0));
        var result = $('<div></div>');
        var id = el.attr('id');
        var span = el.parseSpan();
        var title = el.attr('title');
        if (title) result.attr('data-title', title);
        if (span) result.attr('data-span', span);
        if (id) result.attr('data-id', id);
        return result;
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    function serializeWidget(el) {
        if (PB.logBuilder) console.log("Serializing widget ", el.get(0));
        var result = $('<div></div>');
        var widget = PB.getWidgetInstance(el);
        if (!widget) {
            console.error('Unable to retrieve widget instance', el);
            return result;
        }
        var config = widget.getConfig();
        for (var v in config) {
            if (config.hasOwnProperty(v)) {
                var value = config[v];
                var name = v;
                result.attr('data-'+name, value);
            }
        }
        return result;
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.serializeStructure = function() {
        var result = serializeContainer(this);
        if (this.hasClass('pb-open-container')) {
            this.children('.pb-widget').each(function() {
                var widget = serializeWidget($(this));
                widget.appendTo(result);
            });
        } else {
            this.children('.pb-container').each(function() {
                var container = $(this).serializeStructure();
                container.appendTo(result);
            });
        }
        return result;
    };

})(jQuery);