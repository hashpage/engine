// require('engine')

(function($) {
    
    $.extend(HP, {
        /////////////////////////////////////////////////////////////////////////////////////////
        acceptGift: function() {
            location = HP.url(null, 'gift/accept/'+HP.pid+'?token='+HP.giftToken);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        declineGift: function() {
            location = HP.url(null, 'gift/decline/'+HP.pid+'?token='+HP.giftToken);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        forkPage: function() {
            location = HP.url(null, 'fork/'+HP.pid);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        presentGiftPanel: function(giftToken) {
            HP.giftToken = giftToken;
            var panel = $(HP.templates['panels-gift']);
            $('body').append(panel);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        presentHashPagePanel: function() {
            var panel = $(HP.templates['panels-hash']);
            $('body').append(panel);
            $('#hp-hash-corner').bind('click', function() {
                $('#hp-hash-panel').toggle();
            });
        }
     });
    
})(jQuery);