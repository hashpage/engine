// require('boot')

(function($) {

    /////////////////////////////////////////////////////////////////////////////////////////
    $.extend($.expr[":"], { 
        solid: function(el) {
            var el = $(el);
            if (el.hasClass("ui-sortable-helper")) return false;
            if (el.hasClass("hp-hidden")) return false;
            if (el.hasClass("hp-widget-reordering-placeholder")) return false;
            return true;
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
            var applied = el.children('.hp-open-container-mask');
            if (applied.length || el.hasClass('hp-unselectable-container')) return;
            var mask = $('<div class="hp-open-container-mask"></div>');
            el.prepend(mask);
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.removeOpenContainerMask = function() {
        return this.each(function() {
            var el = $(this);
            el.children('.hp-open-container-mask').remove();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateOpenContainers = function() {
        return this.each(function() {
            var el = $(this);
            if (el.children('.hp-widget:solid').length || el.children('.hp-container:solid').length) 
                el.removeClass("hp-empty"); 
            else 
                el.addClass("hp-empty");
            if (el.find('.hp-container').length) { // closed container
                if (!el.hasClass('hp-open-container')) return; // nothing to do
                if (el.hasClass('hp-container-reordering-area')) return; // HACK
                if (HP.destroySortable && el.hasClass('ui-sortable')) HP.destroySortable(el);
                el.removeClass('hp-open-container');
                el.removeOpenContainerMask();
            } else { // open container
                if (HP.applySortable && !el.hasClass('ui-sortable')) HP.applySortable(el);
                if (el.hasClass('hp-open-container')) return; // nothing to do
                el.addClass('hp-open-container');
                el.applyOpenContainerMask();
            }
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateLastContainers = function() {
        return this.each(function() {
            var el = $(this);
            var parent = $(this.parentNode);
            if (!this.parentNode || el.parseSpan() == parent.parseSpan() || el.nextAll('.hp-container:solid').length==0) {
                el.addClass('hp-last-container');
            } else {
                el.removeClass('hp-last-container');
            }
            el.children('.hp-container').updateLastContainers();
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.updateLastWidgets = function() {
        var widgets = this.children('.hp-widget:solid');
        if (!widgets.length) return;
        widgets.removeClass('hp-last-widget');
        widgets.eq(widgets.length-1).addClass('hp-last-widget');
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
    HP.createContainer = function(data) {
        var id = data.id || HP.pickUniqueName();
        var span = " ";
        if (data.span) span += "span-"+data.span;
        var container = $('<div id="'+id+'" class="hp-container'+span+'"></div>');
        if (data.title) {
            container.attr('title', data.title);
        }
        return container;
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    HP.widgetTemplate = function(title, thumbnail, name, author) {
        return '\
        <div class="hp-widget-thumbnail">\
          <div class="hp-widget-thumbnail-icon" style="background-image:url('+thumbnail+')" title="'+title+'"></div>\
          <div class="hp-widget-thumbnail-ident">\
            <div class="hp-widget-thumbnail-name">'+name+'</div>\
            <div class="hp-widget-thumbnail-author">'+author+'</div>\
          </div>\
        </div>\
        <div class="hp-widget-panel">\
          <div class="hp-widget-body"></div>\
        </div>';
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    HP.createWidget = function(data) {
        var id = data.id || HP.pickUniqueName();
        HP.setWidgetConfig(id, data.config||{});
        var info = HP.parseWidgetName(data.widget);
        var wclass = info.author+"-"+info.name;
        var widget = $('<div id="'+id+'" class="hp-widget hp-mock hp-pinned '+wclass+'" widget="'+data.widget+'"></div>');
        var thumbUrl = HP.widgetUrl(data.widget) + "/icon.png";
        widget.html(HP.widgetTemplate(data.widget, thumbUrl, info.name, info.author));
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
            if (widget.hasClass('hp-loaded')) return;
            var address = widget.attr('widget');
            console.log("Loading widget: ", address);                                               //#dbg
            HP.loader.loadWidget(address, function() {
                widget.removeClass('hp-mock').addClass('hp-loaded');
                HP.initWidgetInstance(widget);
                // HP.widgetsVisibilityChanged();
                if (fn) fn();
            });
        });
    };
    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.buildStructure = function() {
        var boundContainers = [];
        
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
                        if (a=='bindto') {
                            boundContainers.push(attrs[a]);
                        }
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
                return HP.createWidget(data);
            } 
            
            // container
            var data = extractContainerData(schema, span);
            var container = HP.createContainer(data);
            
            schema.children().each(function() {
                var sub = $(this);
                var subResult = buildStructureWorker(sub, data.span);
                container.append(subResult);
            });
            
            return container;
        }
        /////////////////////////////////////////////////////////////////////////////////////////
        function sanitize(result) {
            result.children('.hp-widget').remove(); // kdyby dal nekdo widgety na root uroven
            if (result.children('.hp-container').length==0) {
                // musime mit alespon jeden container na root urovni
                var container = HP.createContainer({
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
            
            // hide children in bound containers
            for (var i=0; i < boundContainers.length; i++) {
                var sel = '#'+boundContainers[i];
                $(sel).children().hide();
            }
            
            el.addClass('hp-container');
            el.append(result.children());
            el.find('.hp-container').updateContainerState();
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
        var widget = HP.getWidgetInstance(el);
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
        this.children('.hp-widget').each(function() {
            var widget = serializeWidget($(this));
            if (widget) widget.appendTo(result);
        });
        this.children('.hp-container').each(function() {
            var container = $(this).serializeStructure();
            if (container) container.appendTo(result);
        });
        return result;
    };

})(jQuery);