// require('engine')

(function($) {
    
     $.extend(HP, {
         services: {},
         /////////////////////////////////////////////////////////////////////////////////////////
         fetchUrl: function(params, success) {
             $.ajaxSetup({
                 cache: true,
                 jsonpgen: function() {
                     var hash = "x"+Math.abs(HP.crc32(params.url)).toString(16); // CRC32 should be quite fast, we don't need cryptographic power of SHA-1 here
                     while (window[hash]) hash += "x"; // prevents collision in window namespace (very unlikely)
                     return hash;
                 }
             });
             $.getJSON(HP.url("api", 'proxy?callback=?'), params, function(data) {
                 if (data.status==0) {
                     success(data.content);
                 }
                 // TODO: failing path
             });
             $.ajaxSetup({
                 cache: false, 
                 jsonpgen: null
             });
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         addService: function(service) {
             this.services[service.id] = service;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         removeService: function(serviceId) {
             this.services[serviceId];
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         runServices: function() {
             // make services array
             var services = [];
             for (var service in this.services){
                 this.services.hasOwnProperty(service);
                 services.push(this.services[service]);
             };

             // sort by priority
             services.sort(function(a,b) {
                return a.priority>b.priority; 
             });

             // start services
             var serviceNames = [];
             for (var i=0; i < services.length; i++) {
                 var service = services[i];
                 serviceNames.push(service.id);
                 service.start();
             }

             console.log("Started services %o", serviceNames);                                      //#dbg
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getService: function(serviceId) {
             return this.services[serviceId];
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         getServiceConfig: function(serviceId) {
             return this.serviceConfigs[serviceId];
         }
     });
    
})(jQuery);