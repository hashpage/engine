// require('classes/observable')

(function($) {

    PB.Widget = function(config) {
        $.extend(this, config);
        PB.Widget.superclass.constructor.call(this);
    };

    PB.extend(PB.Widget, PB.Observable, {
        /////////////////////////////////////////////////////////////////////////////////////////
        init: function(guid, el, info) {
            this.guid = guid;
            this.el = $(el);
            this.info = info;
            this.root = this.el.parents('.pb-widget').eq(0);
            this.defaultConfig = this.defaultConfig || {};
            this.config = $.extend({}, this.defaultConfig, PB.getWidgetConfig(this.guid));
            if (this.css)
                this.applyCSS(this.css);
            if (this.html)
                this.applyHTML(this.html);
            this.onInit();
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyCSS: function(css) {
            var style = $('<style>'+css+'</style>');
            $('head').append(style);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyHTML: function(html) {
            this.el.html(html);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        getConfig: function() {
            return this.config || this.defaultConfig;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        updateConfig: function(newConfig) {
            this.onConfigUpdate(newConfig);
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
        renderTemplate: function(el, data) {
            el.processTemplate(data);
            el.unbind("onload.pb").bind("onload.pb", function() {
                console.log("Content loaded", arguments);
            });
            PB.possibleLayoutChange(el, true, "widget render");
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
        onResume: function() {}
    });

})(jQuery);