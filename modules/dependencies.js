// require('engine')

(function($) {
    
     $.extend(PB, {
         dependencyManager: {},
         dependenciesGuard: 0,
         /////////////////////////////////////////////////////////////////////////////////////////
         pauseDependencyNotifications: function() {
             this.dependenciesGuard++;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         resumeDependencyNotifications: function() {
             this.dependenciesGuard--;
             if (this.layoutChangesGuard<0) {                                                       //#chk
                 console.error("Inconsitent pause/resume on layout changes");                       //#chk
             }                                                                                      //#chk
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         declareDependency: function(who, what) {
             if (typeof what != "string") {
                 what = '#'+$(what).attr("id");
             }
             if (!what) {                                                                           //#chk
                 console.error("Attempt to declare dependency on non-existing object", arguments);  //#chk
                 return;                                                                            //#chk
             }                                                                                      //#chk
             if (!this.dependencyManager[what]) this.dependencyManager[what] = [];
             if (!$.isArray(who)) who = [who];
             $.each(who, function(i, dependencyMaker){
                 if ($.inArray(dependencyMaker, PB.dependencyManager[what])==-1) {
                     PB.dependencyManager[what].push(dependencyMaker);
                     console.log("PB %o has declared dependency on %s", dependencyMaker, what);     //#dbg
                 }
             })
             return true;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         undeclareDependency: function(who, what) {
             if (typeof what != "string") {
                 what = '#'+$(what).attr("id");
             }
             if (!what) return;
             var records = this.dependencyManager[what];
             if (!records) return false;
             var index = $.inArray(who, records);
             if (index==-1) return false;
             records.splice(index, 1);
             return true;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         notifyDependants: function(what, kind, params) {
             // TODO: tady to bude chtit nejake cachovani a odfiltrovani duplicit
             if (this.dependenciesGuard) return; // dependencies are paused
             var args = $.makeArray(arguments);
             console.log("Notification: %s (%o)", kind, what, args.splice(2));                      //#dbg
             if (typeof what != "string") {
                 what = '#'+$(what).attr("id");
             }
             if (!what) return;
             var records = this.dependencyManager[what];
             if (!records) return;
             for (var i=0; i < records.length; i++) {
                 var record = records[i];
                 console.log("Notifying", record, arguments);                                       //#dbg
                 record.onDependencyChanged.apply(record, arguments);
             }
         }
     });
    
})(jQuery);