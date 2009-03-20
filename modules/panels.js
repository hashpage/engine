// require('engine')

(function($) {
    
    $.extend(PB, {
        /////////////////////////////////////////////////////////////////////////////////////////
        acceptGift: function() {
            location = PB.url(null, 'gift/accept/'+PB.pid+'?token='+PB.giftToken);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        declineGift: function() {
            location = PB.url(null, 'gift/decline/'+PB.pid+'?token='+PB.giftToken);
        },
        /////////////////////////////////////////////////////////////////////////////////////////
        presentGiftPanel: function(giftToken) {
            PB.giftToken = giftToken;
            var panel = $(PB.templates['panels-gift']);
            $('body').append(panel);
        }
     });
    
})(jQuery);