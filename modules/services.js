// require('engine')

(function($) {
    
     $.extend(PB, {
         services: {},
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

             console.log("Started services %o", serviceNames);
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