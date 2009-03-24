// require('engine')

(function($) {

     $.extend(HP, {
         layoutChangesGuard: 0,
         layoutId: 0,
         /////////////////////////////////////////////////////////////////////////////////////////
         pauseLayoutChanges: function() {
             this.layoutChangesGuard++;
             this.layoutChangesDirty = false;
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         resumeLayoutChanges: function() {
             this.layoutChangesGuard--;
             if (this.layoutChangesGuard<0) {                                                                      //#chk
                 console.error("Inconsitent pause/resume on layout changes");                                      //#chk
             }                                                                                                     //#chk
         },
         /////////////////////////////////////////////////////////////////////////////////////////
         possibleLayoutChange: function(id, reason, anim, instant) {
             if (this.disableLayouting) return;
             if (this.layoutChangesGuard) {
                 this.layoutChangesDirty = true;
                 return; // changes are paused
             }
             if (this.mode!="design") return; // perform layouting in edit mode only
             var el = id;
             if (!el) {
                 el = $('.hashpage');
             } else {
                 if (typeof el == "string") el = $(el);
                 el = el.parentsAndMe('.hashpage');
             }

             var layoutingWorker = function(anim, info) {
                 HP.freezeTime();
                 if (anim) {
                     HP.layoutingInProgress = true;
                     setTimeout(function() {
                         HP.layoutingInProgress = false;
                         if (!HP.nextLayoutRequest) {
                             console.log('Layouting finished', el);                                                //#dbg
                             HP.notifier.fireEvent('layouting-finished', el, info);
                         }
                     }, 500);
                 }
                 console.log('Performing layout '+info+' engine['+HP.getEngineId()+']', el);                       //#dbg
                 el.layout(anim);
                 HP.unfreezeTime();
             };

             this.layoutId++;
             var layoutId = this.layoutId;
             var requestInfo = "#"+layoutId+(reason?" ("+reason+")":"")+(anim?" anim":"")+(instant?" instant":"");
             console.log('Layouting request '+requestInfo, el);                                                    //#dbg

             if (instant) {
                 layoutingWorker(anim, requestInfo);
                 return;
             }

             if (!HP.nextLayoutRequest || anim || HP.nextLayoutRequest[0]==false) {
                 HP.nextLayoutRequest = [anim, requestInfo];
             } else {
                 console.log('  -- not accepted because animated requests have precence');                         //#dbg
             }

             var fn = function() {
                  if (layoutId!=HP.layoutId) { // layout expired
                      console.log(" --- expired layout request #"+layoutId);                                       //#dbg
                      return;
                  }
                  if (!HP.nextLayoutRequest) {                                                                     //#chk
                      console.error('missing HP.nextLayoutRequest');                                               //#chk
                      return;                                                                                      //#chk
                  }                                                                                                //#chk
                  if (HP.layoutingInProgress) {
                      console.log(" --- waiting because previous layouting is in progress");                       //#dbg
                      setTimeout(fn, 200);
                      return;
                  }
                  layoutingWorker(HP.nextLayoutRequest[0], HP.nextLayoutRequest[1]);
                  delete HP.nextLayoutRequest;
              };
             setTimeout(fn, 200);
         }
     });

})(jQuery);
