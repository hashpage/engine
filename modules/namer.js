// require('engine')

(function($) {

    var names = ["mary","patricia","linda","barbara","elizabeth","jennifer","maria","susan","margaret","dorothy","lisa","diana","annie",
                 "nancy","karen","betty","helen","sandra","donna","carol","ruth","sharon","michelle","laura","sarah","kimberly","deborah",
                 "jessica","shirley","cynthia","angela","melissa","brenda","amy","anna","rebecca","virginia","kathleen","pamela","martha",
                 "debra","amanda","stephanie","carolyn","christine","marie","janet","catherine","frances","ann","joyce","diane","alice",
                 "julie","heather","teresa","doris","gloria","evelyn","jean","cheryl","mildred","katherine","joan","ashley","judith","rose",
                 "janice","kelly","nicole","judy","christina","kathy","theresa","beverly","denise","tammy","irene","jane","lori","rachel",
                 "marilyn","andrea","kathryn","louise","sara","anne","jacqueline","wanda","bonnie","julia","ruby","lois","tina","phyllis",
                 "norma","emily","paula"];
    
     $.extend(HP, {
         namerSeed: -1,
         
         /////////////////////////////////////////////////////////////////////////////////////////
         resetNamerSeed: function(seed) {
             if (!seed) seed = -1;
             this.namerSeed = seed;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         pickUniqueName: function() {
             if (!this.revertToGuids) {
                 this.namerSeed++;
                 var i = 0;
                 while (i<names.length) {
                     var candidate = names[(this.namerSeed+i) % names.length];
                     if (!$('#'+candidate).length) return candidate;
                     i++;
                 }
                 this.revertToGuids = true;
             }
             return this.generateGuid();
         }
     });
    
})(jQuery);
