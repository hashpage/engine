// require('engine')

(function($) {
    
    function urldecode( str ) {
        // Decodes URL-encoded string
        // 
        // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_urldecode/
        // +       version: 901.1411
        // +   original by: Philip Peterson
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: AJ
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Brett Zamir
        // %          note: info on what encoding functions to use from: http://xkr.us/articles/javascript/encode-compare/
        // *     example 1: urldecode('Kevin+van+Zonneveld%21');
        // *     returns 1: 'Kevin van Zonneveld!'
        // *     example 2: urldecode('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
        // *     returns 2: 'http://kevin.vanzonneveld.net/'
        // *     example 3: urldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a');
        // *     returns 3: 'http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'

        var histogram = {};
        var ret = str.toString();

        var replacer = function(search, replace, str) {
            var tmp_arr = [];
            tmp_arr = str.split(search);
            return tmp_arr.join(replace);
        };

        // The histogram is identical to the one in urlencode.
        histogram["'"]   = '%27';
        histogram['(']   = '%28';
        histogram[')']   = '%29';
        histogram['*']   = '%2A';
        histogram['~']   = '%7E';
        histogram['!']   = '%21';
        histogram['%20'] = '+';

        for (replace in histogram) {
            search = histogram[replace]; // Switch order when decoding
            ret = replacer(search, replace, ret); // Custom replace. No regexing   
        }

        // End with decodeURIComponent, which most resembles PHP's encoding functions
        ret = decodeURIComponent(ret);

        return ret;
    }

    /*!
        parseUri 1.2.1
        (c) 2007 Steven Levithan <stevenlevithan.com>
        MIT License
    */
    function parseUri(str) {
        var o   = parseUri.options,
            m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
            uri = {},
            i   = 14;

        while (i--) uri[o.key[i]] = m[i] || "";

        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = urldecode($2);
        });

        return uri;
    };

    parseUri.options = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
    
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
            if (!PB.css) return;                                                                                                 
            var style = $('<style>'+PB.css+'</style>');                                                                          
            $('head').append(style);                                                                                             
        },                                                                                                                       
        /////////////////////////////////////////////////////////////////////////////////////////                                
        nakedDomain: function() {                                                                                                
            if (!this.serverMode) return "hashpage.com"; // in production                                                        
            return "hashpage.local";                                                                                             
        },           
        /////////////////////////////////////////////////////////////////////////////////////////                                
        parseUri: function(url) {
            return parseUri(url);
        },                                                                                                         
        /////////////////////////////////////////////////////////////////////////////////////////                                
        url: function(name, path) {                                                                                              
            var domain = this.nakedDomain();
            var part = domain+"/"+path;                                                                                 
            if (name) return "http://"+name+"."+part;
            return "http://www."+part;
        },                                                                                                                       
        /////////////////////////////////////////////////////////////////////////////////////////                                
        urlEncode: function(o){                                                                                                  
            if(!o){                                                                                                              
                return "";                                                                                                       
            }                                                                                                                    
            var params = [];                                                                                                     
            for(var key in o){                                                                                                   
                if (o.hasOwnProperty(key) && o[key]!=null) params.push([key, o[key]]);                                           
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