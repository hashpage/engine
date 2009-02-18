// require('boot')

(function($) {

    /////////////////////////////////////////////////////////////////////////////////////////
    $.extend($.expr[":"], { 
        solid: function(el) {
            var el = $(el);
            if (el.hasClass("ui-sortable-helper")) return false;
            if (el.hasClass("pb-hidden")) return false;
            if (el.hasClass("pb-widget-reordering-placeholder")) return false;
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
            if (applied.length || el.hasClass('pb-unselectable-container')) return;
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
            if (el.children('.pb-widget:solid').length || 
                el.children('.pb-widget-reordering-placeholder').length || 
                el.children('.pb-container:solid').length) 
                el.removeClass("pb-empty"); 
            else 
                el.addClass("pb-empty");
            if (el.find('.pb-container').length) { // closed container
                if (!el.hasClass('pb-open-container')) return; // nothing to do
                if (el.hasClass('pb-container-reordering-area')) return; // HACK
                if (PB.destroySortable && el.hasClass('ui-sortable')) PB.destroySortable(el);
                el.removeClass('pb-open-container');
                el.removeOpenContainerMask();
            } else { // open container
                if (PB.applySortable && !el.hasClass('ui-sortable')) PB.applySortable(el);
                if (el.hasClass('pb-open-container')) return; // nothing to do
                el.addClass('pb-open-container');
                el.applyOpenContainerMask();
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
    PB.widgetTemplate = function(title, thumbnail, name, author) {
        return '\
        <div class="pb-widget-thumbnail">\
          <img width="64" height="48" src="'+thumbnail+'" title="'+title+'">\
          <div class="pb-widget-thumbnail-ident">\
            <div class="pb-widget-thumbnail-name">'+name+'</div>\
            <div class="pb-widget-thumbnail-author">'+author+'</div>\
          </div>\
        </div>\
        <div class="pb-widget-panel">\
          <div class="pb-widget-body"></div>\
        </div>';
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    PB.createWidget = function(data) {
        var id = data.id || PB.pickUniqueName();
        PB.setWidgetConfig(id, data.config||{});
        var info = PB.parseWidgetName(data.widget);
        var wclass = info.author+"-"+info.name;
        var widget = $('<div id="'+id+'" class="pb-widget pb-mock pb-pinned '+wclass+'" widget="'+data.widget+'"></div>');
        var thumbUrl = PB.widgetUrl(data.widget) + "/thumbnail.png";
        widget.html(PB.widgetTemplate(data.widget, thumbUrl, info.name, info.author));
        if (data.state) {
            if (data.state=="expanded") {
                setTimeout(function() { // widget jeste neni v DOMu a nezafungovalo by memoize
                    widget.action("expand");
                }, 500);
            }
            if (data.state=="collapsed") {
                setTimeout(function() {
                    widget.action("collapse");
                }, 500);
            }
        }
        return widget;
    }; 
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.loadWidgets = function(fn) {
        return this.each(function(){
            var widget = $(this);
            if (widget.hasClass('pb-loaded')) return;
            var address = widget.attr('widget');
            console.log("Loading widget: ", address);                                               //#dbg
            PB.loader.loadWidget(address, function() {
                widget.removeClass('pb-mock').addClass('pb-loaded');
                PB.initWidgetInstance(widget);
                PB.widgetsVisibilityChanged();
                if (fn) fn();
            });
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.buildStructure = function() {
        function extractWidgetData(schema) {
            var data = {};
            var internal = ['widget', 'id', 'state'];
            data.widget = schema.attr('data-widget');
            data.id = schema.attr('data-id');
            data.state = schema.attr('data-state');
            data.config = {};
            var attrs = schema.dataAttrs();
            for (a in attrs) {
                if (attrs.hasOwnProperty(a)) {
                    if (internal.indexOf(a)==-1) {
                        data.config[a] = attrs[a]; 
                    }
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
        console.log("Serializing container ", el.get(0));                                           //#dbg
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
        console.log("Serializing widget ", el.get(0));                                              //#dbg
        var result = $('<div></div>');
        var widget = PB.getWidgetInstance(el);
        if (!widget) {                                                                              //#chk
            console.error('Unable to retrieve widget instance', el);                                //#chk
            return;                                                                                 //#chk
        }                                                                                           //#chk
        // serialize common params
        var id = el.attr('id');
        if (!id) {                                                                                  //#chk
            console.error('Unable to retrieve widget id');                                          //#chk
        }                                                                                           //#chk
        result.attr('data-id', id);
        var address = el.attr('widget');
        if (!address) {                                                                             //#chk
            console.error('Unable to retrieve widget address');                                     //#chk
        }                                                                                           //#chk
        result.attr('data-widget', address);
        var state = el.attr('state');
        if (state) result.attr('data-state', state);
        // serialize config params
        var config = widget.getConfig();
        for (var param in config) {
            if (!config.hasOwnProperty(param)) continue;
            result.attr('data-'+param, config[param]);
        }
        return result;
    }
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.serializeStructure = function() {
        var result = serializeContainer(this);
        // widgets should exits only in open containers
        this.children('.pb-widget').each(function() {
            var widget = serializeWidget($(this));
            if (widget) widget.appendTo(result);
        });
        this.children('.pb-container').each(function() {
            var container = $(this).serializeStructure();
            if (container) container.appendTo(result);
        });
        return result;
    };

})(jQuery);