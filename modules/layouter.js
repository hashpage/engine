// require('engine')

(function($) {

     $.extend(PB, {
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
                 el = $('.pagebout');
             } else {
                 if (typeof el == "string") el = $(el);
                 el = el.parentsAndMe('.pagebout');
             }

             var layoutingWorker = function(anim, info) {
                 PB.freezeTime();
                 if (anim) {
                     PB.layoutingInProgress = true;
                     setTimeout(function() {
                         PB.layoutingInProgress = false;
                         if (!PB.nextLayoutRequest) {
                             console.log('Layouting finished', el);                                                //#dbg
                             PB.notifier.fireEvent('layouting-finished', el, info);
                         }
                     }, 500);
                 }
                 console.log('Performing layout '+info+' engine['+PB.getEngineId()+']', el);                       //#dbg
                 el.layout(anim);
                 PB.unfreezeTime();
             };

             if (anim!==false) anim = true;
             this.layoutId++;
             var layoutId = this.layoutId;
             var requestInfo = "#"+layoutId+(reason?" ("+reason+")":"")+(anim?" anim":"")+(instant?" instant":"");
             console.log('Layouting request '+requestInfo, el);                                                    //#dbg

             if (instant) {
                 layoutingWorker(anim, requestInfo);
                 return;
             }

             if (!PB.nextLayoutRequest || anim || PB.nextLayoutRequest[0]==false) {
                 PB.nextLayoutRequest = [anim, requestInfo];
             } else {
                 console.log('  -- not accepted because animated requests have precence');                         //#dbg
             }

             var fn = function() {
                  if (layoutId!=PB.layoutId) { // layout expired
                      console.log(" --- expired layout request #"+layoutId);                                       //#dbg
                      return;
                  }
                  if (!PB.nextLayoutRequest) {                                                                     //#chk
                      console.error('missing PB.nextLayoutRequest');                                               //#chk
                      return;                                                                                      //#chk
                  }                                                                                                //#chk
                  if (PB.layoutingInProgress) {
                      console.log(" --- waiting because previous layouting is in progress");                       //#dbg
                      setTimeout(fn, 200);
                      return;
                  }
                  layoutingWorker(PB.nextLayoutRequest[0], PB.nextLayoutRequest[1]);
                  delete PB.nextLayoutRequest;
              };
             setTimeout(fn, 200);
         }
     });

})(jQuery);
