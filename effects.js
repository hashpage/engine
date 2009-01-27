/* require('lib/jquery/ui/effects.core') */

(function($) {

$.effects.morphWidget = function(o) {

    return this.queue(function() {

        // Create element
        var el = $(this);

        // Set options
        var mode = $.effects.setMode(el, o.options.mode || 'effect'); // Set Mode
        var target = $(o.options.to); // Find Target
        if (o.options.position) {
            var position = o.options.position;
        } else {
            var position = el.offset();
            position.height = el.outerHeight();
            position.width = el.outerWidth();
        }
        
        
        var transfer = $('<div class="ui-effects-transfer"></div>').appendTo(document.body);
        if(o.options.className) transfer.addClass(o.options.className);

        // Set target css
        transfer.addClass(o.options.className);
        transfer.css({
            top: position.top,
            left: position.left,
            height: position.height - parseInt(transfer.css('borderTopWidth')) - parseInt(transfer.css('borderBottomWidth')),
            width: position.width - parseInt(transfer.css('borderLeftWidth')) - parseInt(transfer.css('borderRightWidth')),
            position: 'absolute'
        });

        // Animation
        position = target.offset();
        animation = {
            top: position.top,
            left: position.left,
            height: target.outerHeight() - parseInt(transfer.css('borderTopWidth')) - parseInt(transfer.css('borderBottomWidth')),
            width: target.outerWidth() - parseInt(transfer.css('borderLeftWidth')) - parseInt(transfer.css('borderRightWidth'))
        };

        // Animate
        transfer.animate(animation, {
            duration: o.duration, 
            easing: o.options.easing, 
            complete: function() {
                transfer.remove(); // Remove div
                if(o.callback) o.callback.apply(el[0], arguments); // Callback
                el.dequeue();
            },
            queue: false
        });

    });

};

})(jQuery);
