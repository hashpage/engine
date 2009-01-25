// require('boot')

(function($) {
    PB.logBuilder = false;
    
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
    $.fn.updateOpenContainers = function() {
        return this.each(function() {
            var el = $(this);
            if (el.find('.pb-container').length>0) {
                if (el.hasClass('pb-container-reordering-area')) return; // HACK
                if (PB.destroySortable) PB.destroySortable(el); // TODO: cleanup
                el.removeClass('pb-open-container');
            } else {
                el.addClass('pb-open-container');
                if (PB.applySortable) PB.applySortable(el); // TODO: cleanup
            }
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateLastContainers = function() {
        return this.each(function() {
            var el = $(this);
            if (el.attr('widget')) return;
            var parent = $(this.parentNode);
            if (!this.parentNode || el.parseSpan() == parent.parseSpan() || el.nextAll('.pb-container').length==0) {
                el.addClass('last');
            } else {
                el.removeClass('last');
            }
            el.children('.pb-container').updateLastContainers();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateContainerState = function() {
        return this.each(function() {
            var el = $(this);
            el.updateLastContainers();
            el.updateOpenContainers();
            if (el.addDragBars) el.addDragBars(); // TODO: cleanup
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    PB.createContainer = function(data) {
        var id = data.id || PB.generateGuid();
        var span = " ";
        if (data.span) span += "span-"+data.span;
        var container = $('<div id="'+id+'" class="pb-container pb-open-container container'+span+'"></div>');
        if (data.title) {
            container.attr('title', data.title);
        }
        return container;
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    PB.createWidget = function(data) {
        var id = data.id || PB.generateGuid();
        PB.setWidgetConfig(id, data.config||{});
        var parts = data.widget.split("/");
        if (parts[parts.length-3]=="widgets")
            var wclass = parts[parts.length-2]+"-"+parts[parts.length-1]; // HACK for devel mode
        else
            var wclass = parts[parts.length-3]+"-"+parts[parts.length-2];
        var widget = $('<dl id="'+id+'" class="pb-widget sort pb-pinned '+wclass+'" widget="'+data.widget+'"></dl>');
        var iconUrl = PB.widgetUrl(data.widget) + "/icon.png";
        var thumbUrl = PB.widgetUrl(data.widget) + "/thumbnail.png";
        var widgetTemplate = [];
        widgetTemplate.push('<dt>');
        widgetTemplate.push('<div class="pb-widget-toolbar">');
        // widgetTemplate.push('<img class="pb-widget-icon" src="'+iconUrl+'" title="'+data.widget+'">');
        // widgetTemplate.push('<span class="pb-widget-title">'+data.widget+'</span>');
        // widgetTemplate.push('<a class="pb-action" href="javascript:void(0)" onclick="PB.widgetAction(this, \'collapse\')" title="collapse widget and show it\'s icon instead">iconize</a>');
        // widgetTemplate.push('<a class="pb-action" href="javascript:void(0)" onclick="PB.widgetAction(this, \'settings\')" title="open widget configuration">settings</a>');
        widgetTemplate.push('</div>');
        widgetTemplate.push('<div class="pb-widget-thumbnail">');
        widgetTemplate.push('<img width="64" height="48" src="'+thumbUrl+'" title="'+data.widget+'">');
        // widgetTemplate.push('<a class="pb-action" href="javascript:void(0)" onclick="PB.widgetAction(this, \'expand\')" title="expand widget with content">preview</a>');
        // widgetTemplate.push('<a class="pb-action" href="javascript:void(0)" onclick="PB.widgetAction(this, \'settings\')" title="open widget configuration">settings</a>');
        widgetTemplate.push('<div>'+wclass.split("-")[1]+'</div>');
        widgetTemplate.push('<div>'+wclass.split("-")[0]+'</div>');
        widgetTemplate.push('</div>');
        widgetTemplate.push('</dt>');
        widgetTemplate.push('<dd>');
        widgetTemplate.push('<div class="pb-widget-body"></div>');
        widgetTemplate.push('</dd>');
        widget.attr('innerHTML', widgetTemplate.join(''));
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