// require('engine')

(function($) {
    
     $.extend(PB, {
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