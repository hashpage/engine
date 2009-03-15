(function($) {

    PB.stdlib = {
        /////////////////////////////////////////////////////////////////////////////////////////
        getStdTemplates: function() {
            if (!PB._std_templates) {
                console.log('PB.getStdTemplates -- generating');                                    //#dbg
                var cache = {};
                var dynamicTemplates = {
                    '~': function(name) {
                        console.log('Template lookup', name, cache);                                //#dbg
                        var cached = cache[name];
                        if (cached) return cached;
                        var template = PB.templates['std-'+name];
                        if (!template) return;
                        var compiled = $.createTemplate(template, dynamicTemplates);
                        cache[name] = compiled;
                        return compiled;
                    }
                };
                PB._std_templates = dynamicTemplates;
            }
            return PB._std_templates;
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        activateInlineVideos: function(el) {
            var videos = el.find('.video');
            videos.each(function() {
                var container = $(this);
                var button = $('<div style="left: 48px; top: 33px; width:29px; height:29px;" class="playb"></div>').appendTo(container);
                var a = container.children('a');
                a.add(button);
                var movie = a.attr('play');
                var type = a.attr('type');
                a.fancybox({
                    frameWidth: 425, 
                    frameHeight: 350,
                    overlayShow: true,
                    content: '\
                    <div class="video-player">\
                        <object width="425" height="350">\
                            <param name="movie" value="'+movie+'&autoplay=1"></param>\
                            <param name="wmode" value="transparent"></param>\
                            <embed src="'+movie+'&autoplay=1" type="'+type+'" wmode="transparent" width="425" height="350"></embed>\
                        </object>\
                    </div>',
                    closeCallback: function() {
                        $('.video-player').hide().empty();
                        el.find('.playing').removeClass('playing');
                    },
                    startCallback: function() {
                        if (!container.hasClass('playing')) {
                            el.find('.playing').removeClass('playing');
                        }
                        container.toggleClass('playing');
                    }
                });
                button.bind("click", function(e) {
                    a.trigger('click');
                    return false;
                });
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyFancyBoxes: function(el) {
            el.find("a.picture-link").fancybox({
                overlayShow: true
            });
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        applyDynamicBehavior: function(el) {
            this.applyFancyBoxes(el);
            this.activateInlineVideos(el);
        }
    };

})(jQuery);