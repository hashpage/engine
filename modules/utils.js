// require('engine')

(function($) {
    
     $.extend(PB, {
         crcTables: {},
         /////////////////////////////////////////////////////////////////////////////////////////
         capitalize: function(s) {
             return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         escapeForJS: function(s) {
             s = s.replace(/\\/, "\\\\");
             return s;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         generateGuid: function() {
             var S4 = function() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
             };
             return S4()+S4();
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         safeId: function(s) {
             return s.replace(/[a-zA-Z0-9]/g, "_");
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getCrc32Table: function(polynomial) {
             if (PB.crcTables[polynomial]) return PB.crcTables[polynomial];
             var term, table = [];
             for (var i = 0; i < 256; i++) {
                 term = i;
                 for (var j = 0; j < 8; j++) {
                     if (term & 1)
                         term = (term >>> 1) ^ polynomial;
                     else
                         term = term >>> 1;
                 }
                 table[i] = term;
             }
             PB.crcTables[polynomial] = table;
             return table;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         // returns the crc32 hash for a string as an integer (credit: Kris Kowal <http://cixar.com/~kris.kowal>)
         crc32: function(s, table) {
             table = table || PB.getCrc32Table(0xEDB88320); // IEEE802.3
             var crc = 0xFFFFFFFF;
             for (var i=0; i<s.length; i++) {
                 var x = s.charCodeAt(i);
                 crc = (crc >>> 8) ^ table[x ^ (crc & 0xFF)];
             }
             return ~crc;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         applyStyle: function() {
             var style = $('<style>'+PB.css+'</style>');
             $('head').append(style);
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         nakedDomain: function() {
             var domain = document.domain;
             var a = domain.split(".");
             var naked = domain;
             if (a.length>2) naked = a[a.length-2]+"."+a[a.length-1];
             return naked;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         url: function(name, path) {
             var domain = this.nakedDomain();
             return "http://"+name+"."+domain+"/"+path;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         urlEncode: function(o){
             if(!o){
                 return "";
             }
             var params = [];
             for(var key in o){
                 if (o.hasOwnProperty(key) && o[key]) params.push([key, o[key]]);
             }
             params.sort(function(a,b) {
                 return b[0]<a[0]?1:-1;
             });
             var buf = [];
             for(var i=0; i<params.length; i++){
                 var ov = params[i][1], k = encodeURIComponent(params[i][0]);
                 var type = typeof ov;
                 if(type == 'undefined'){
                     buf.push(k, "=&");
                 }else if(type != "function" && type != "object"){
                     buf.push(k, "=", encodeURIComponent(ov), "&");
                 }else if($.isArray(ov)){
                     if (ov.length) {
                         for(var i = 0, len = ov.length; i < len; i++) {
                             buf.push(k, "=", encodeURIComponent(ov[i] === undefined ? '' : ov[i]), "&");
                         }
                     } else {
                         buf.push(k, "=&");
                     }
                 }
             }
             buf.pop();
             return buf.join("");
         }
     });
    
})(jQuery);