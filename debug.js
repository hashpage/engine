// require('lib/jquery/jquery')
// collection of development debug helpers and assertions

(function($) {

    /////////////////////////////////////////////////////////////////////////////////////////
    $.fn.assert = function(expectedLength) {                                                        //#chk
        if (this.length!=expectedLength) {                                                          //#chk
            console.error("jQuery length assertion", this, expectedLength);                         //#chk
            console.trace();                                                                        //#chk
        }                                                                                           //#chk
    };                                                                                              //#chk

})(jQuery);

