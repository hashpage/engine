// require('classes/observable')

(function($) {

    HP.Widget = function(config) {
        $.extend(this, config);
        HP.Widget.superclass.constructor.call(this);
    };
    
    HP.extend(HP.Widget, HP.Observable, {
        /////////////////////////////////////////////////////////////////////////////////////////
        init: function(guid, el, info) {
            console.log('HP.Widget.init', arguments);                                               //#dbg
            this.guid = guid;
            this.el = $(el);
            this.info = info;
            this.root = this.el.parents('.hp-widget').eq(0);
            this.defaultConfig = this.defaultConfig || {};
            this.defaultState = this.defaultState || {};
            this.config = $.extend({}, this.defaultConfig, HP.getWidgetConfig(this.guid));
            this.state = $.extend({}, this.defaultState, HP.getWidgetState(this.guid));
            this.applyCSS(this.css);
            this.applyHTML(this.html);
            this.onInit();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyCSS: function(css) {
            if (!css) return;
            console.log('HP.Widget.applyCSS', arguments);                                           //#dbg
            var style = $('<style>'+css+'</style>');
            $('head').append(style);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyHTML: function(html) {
            if (!html) return;
            console.log('HP.Widget.applyHTML', arguments);                                          //#dbg
            this.el.html(html);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getState: function() {
            return this.state || this.defaultState;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        updateState: function(newState) {
            console.log('HP.Widget.updateState', arguments);                                       //#dbg
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
            console.log('HP.Widget.updateConfig', arguments);                                       //#dbg
            var oldConfig = $.extend({}, this.config);
            $.extend(this.config, newConfig);
            this.onConfigUpdate(this.config, oldConfig);
            var that = this;
            HP.editAction("changed configuration of widget #"+this.root.attr('id'), function(){
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
            console.log('HP.Widget.applyTemplate', arguments);                                      //#dbg
            var template = this.templates[templateName];
            if (!template) {
                console.error('Missing template: %s', templateName);
                return false;
            }
            el.setTemplate(template, HP.stdlib.getStdTemplates(), options);
            el.setParam('widget', this);
            el.setParam('self', "HP.getWidgetInstance('"+this.guid+"')");
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        handleNoData: function() {
            this.el.setTemplate(HP.templates['std-no-data']);
            this.el.processTemplate();
            HP.possibleLayoutChange(this.el, "widget render (no data)");
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        renderTemplate: function(el, data) {
            console.log('HP.Widget.renderTemplate', arguments);                                     //#dbg
            el.processTemplate(data);
            el.find('img').unbind("load.pb").bind("load.pb", function() { // TODO: add more element with load event?
                HP.possibleLayoutChange(el, "widget content loaded");
            });
            HP.possibleLayoutChange(el, "widget render");
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        startLoadingIndicator: function() {
            this.el.prepend($('<div class="hp-loading-indicator">&nbsp;</div>'));
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        stopLoadingIndicator: function() {
            this.el.children('.hp-loading-indicator').remove();
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