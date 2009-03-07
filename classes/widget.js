// require('classes/observable')

(function($) {

    PB.Widget = function(config) {
        $.extend(this, config);
        PB.Widget.superclass.constructor.call(this);
    };
    
    PB.extend(PB.Widget, PB.Observable, {
        /////////////////////////////////////////////////////////////////////////////////////////
        init: function(guid, el, info) {
            console.log('PB.Widget.init', arguments);                                               //#dbg
            this.guid = guid;
            this.el = $(el);
            this.info = info;
            this.root = this.el.parents('.pb-widget').eq(0);
            this.defaultConfig = this.defaultConfig || {};
            this.defaultState = this.defaultState || {};
            this.config = $.extend({}, this.defaultConfig, PB.getWidgetConfig(this.guid));
            this.state = $.extend({}, this.defaultState, PB.getWidgetState(this.guid));
            this.applyCSS(this.css);
            this.applyHTML(this.html);
            this.onInit();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyCSS: function(css) {
            if (!css) return;
            console.log('PB.Widget.applyCSS', arguments);                                           //#dbg
            var style = $('<style>'+css+'</style>');
            $('head').append(style);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyHTML: function(html) {
            if (!html) return;
            console.log('PB.Widget.applyHTML', arguments);                                          //#dbg
            this.el.html(html);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getState: function() {
            return this.state || this.defaultState;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        updateState: function(newState) {
            console.log('PB.Widget.updateState', arguments);                                       //#dbg
            var oldState = $.extend({}, this.state);
            $.extend(this.state, newState);
            this.onStateUpdate(this.state, oldState);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getConfig: function() {
            return this.config || this.defaultConfig;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getConfigSchema: function() {
            return this.configSchema;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        updateConfig: function(newConfig) {
            console.log('PB.Widget.updateConfig', arguments);                                       //#dbg
            var oldConfig = $.extend({}, this.config);
            $.extend(this.config, newConfig);
            this.onConfigUpdate(this.config, oldConfig);
            var that = this;
            PB.editAction("changed configuration of widget #"+this.root.attr('id'), function(){
                that.updateConfig(oldConfig);
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        pause: function() {
            this.onPause();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        resume: function() {
            this.onResume();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        show: function() {
            if (!this.initialShowDone) {
                this.initialShowDone = true;
                this.onFirstShow();
            }
            this.onShow();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        hide: function() {
            this.onHide();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyTemplate: function(el, templateName, options) {
            console.log('PB.Widget.applyTemplate', arguments);                                      //#dbg
            var template = this.templates[templateName];
            if (!template) {
                console.error('Missing template: %s', templateName);
                return false;
            }
            el.setTemplate(template, PB.stdlib.getStdTemplates(), options);
            el.setParam('widget', this);
            el.setParam('self', "PB.getWidgetInstance('"+this.guid+"')");
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        handleNoData: function() {
            this.el.setTemplate(PB.templates['std-no-data']);
            this.el.processTemplate();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        renderTemplate: function(el, data) {
            console.log('PB.Widget.renderTemplate', arguments);                                     //#dbg
            el.processTemplate(data);
            el.find('img').unbind("load.pb").bind("load.pb", function() { // TODO: add more element with load event?
                PB.possibleLayoutChange(el, "widget content loaded", false);
            });
            PB.possibleLayoutChange(el, "widget render", false);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        startLoadingIndicator: function() {
            this.el.prepend($('<div class="pb-loading-indicator">&nbsp;</div>'));
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        stopLoadingIndicator: function() {
            this.el.children('.pb-loading-indicator').remove();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        // override these hooks if needed, TODO: more hooks to come
        onInit: function() {},
        onFirstShow: function() {},
        onShow: function() {},
        onHide: function() {},
        onBeforeRemove: function() {},
        onAfterRemove: function() {},
        onMode: function(newMode) {},
        onPause: function() {},
        onResume: function() {},
        onConfigUpdate: function() {}
    });

})(jQuery);