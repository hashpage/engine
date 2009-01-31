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
             if (this.layoutChangesGuard<0) {
                 console.error("Inconsitent pause/resume on layout changes");
                 console.trace();
             }
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         declareDependency: function(who, what) {
             if (typeof what != "string") {
                 what = '#'+$(what).attr("id");
             }
             if (!what) return;

             if (!this.dependencyManager[what]) this.dependencyManager[what] = [];
             if ($.inArray(who, this.dependencyManager[what])==-1) {
                 this.dependencyManager[what].push(who);
                 console.log("Declared dependency %o -> %s", who, what);
             }
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
             console.log("Notification: %s (%o)", kind, what, args.splice(2));
             if (typeof what != "string") {
                 what = '#'+$(what).attr("id");
             }
             if (!what) return;
             var records = this.dependencyManager[what];
             if (!records) return;
             for (var i=0; i < records.length; i++) {
                 var record = records[i];
                 console.log("Notifying %o", record, arguments);
                 record.onDependencyChanged.apply(record, arguments);
             }
         }
     });
    
})(jQuery);