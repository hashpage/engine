(function($) {

    PB.Widget = function(config) {
        $.extend(this, config);
        PB.Widget.superclass.constructor.call(this);
    };

    PB.extend(PB.Widget, PB.Observable, {
        /////////////////////////////////////////////////////////////////////////////////////////
        init: function(guid, el) {
            this.guid = guid;
            this.el = $(el);
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
            this.el.before(style);
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
                console.error('missing template: %s', templateName);
                return false;
            }
            el.setTemplate(template, PB.stdlib.templates(), options);
            el.setParam('widget', this);
            el.setParam('self', "PB.getWidgetInstance('"+this.guid+"')");
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