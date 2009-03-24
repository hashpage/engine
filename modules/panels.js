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
        presentGiftPanel: function(giftToken) {
            HP.giftToken = giftToken;
            var panel = $(HP.templates['panels-gift']);
            $('body').append(panel);
        }
     });
    
})(jQuery);