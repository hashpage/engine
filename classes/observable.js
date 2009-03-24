// stripped down ExtJS Observable class, TODO: give them credit
(function($) {

    HP.Observable = function(){
        if(this.listeners){
            this.on(this.listeners);
            delete this.listeners;
        }
    };
    HP.Observable.prototype = {
        fireEvent : function(){
            if(this.eventsSuspended !== true){
                var ce = this.events[arguments[0].toLowerCase()];
                if(typeof ce == "object"){
                    return ce.fire.apply(ce, Array.prototype.slice.call(arguments, 1));
                }
            }
            return true;
        },

        // private
        filterOptRe : /^(?:scope|delay|buffer|single)$/,

        addListener : function(eventName, fn, scope, o){
            if(typeof eventName == "object"){
                o = eventName;
                for(var e in o){
                    if(this.filterOptRe.test(e)){
                        continue;
                    }
                    if(typeof o[e] == "function"){
                        // shared options
                        this.addListener(e, o[e], o.scope,  o);
                    }else{
                        // individual options
                        this.addListener(e, o[e].fn, o[e].scope, o[e]);
                    }
                }
                return;
            }
            o = (!o || typeof o == "boolean") ? {} : o;
            eventName = eventName.toLowerCase();
            var ce = this.events[eventName] || true;
            if(typeof ce == "boolean"){
                ce = new HP.Event(this, eventName);
                this.events[eventName] = ce;
            }
            ce.addListener(fn, scope, o);
        },

        removeListener : function(eventName, fn, scope){
            var ce = this.events[eventName.toLowerCase()];
            if(typeof ce == "object"){
                ce.removeListener(fn, scope);
            }
        },

        purgeListeners : function(){
            for(var evt in this.events){
                if(typeof this.events[evt] == "object"){
                     this.events[evt].clearListeners();
                }
            }
        },

        addEvents : function(o){
            if(!this.events){
                this.events = {};
            }
            if(typeof o == 'string'){
                for(var i = 0, a = arguments, v; v = a[i]; i++){
                    if(!this.events[a[i]]){
                        this.events[a[i]] = true;
                    }
                }
            }else{
                $.extendIf(this.events, o);
            }
        },

        hasListener : function(eventName){
            var e = this.events[eventName];
            return typeof e == "object" && e.listeners.length > 0;
        },

        suspendEvents : function(){
            this.eventsSuspended = true;
        },

        resumeEvents : function(){
            this.eventsSuspended = false;
        },

        getMethodEvent : function(method){
            if(!this.methodEvents){
                this.methodEvents = {};
            }
            var e = this.methodEvents[method];
            if(!e){
                e = {};
                this.methodEvents[method] = e;

                e.originalFn = this[method];
                e.methodName = method;
                e.before = [];
                e.after = [];


                var returnValue, v, cancel;
                var obj = this;

                var makeCall = function(fn, scope, args){
                    if((v = fn.apply(scope || obj, args)) !== undefined){
                        if(typeof v === 'object'){
                            if(v.returnValue !== undefined){
                                returnValue = v.returnValue;
                            }else{
                                returnValue = v;
                            }
                            if(v.cancel === true){
                                cancel = true;
                            }
                        }else if(v === false){
                            cancel = true;
                        }else {
                            returnValue = v;
                        }
                    }
                };

                this[method] = function(){
                    returnValue = v = undefined; cancel = false;
                    var args = Array.prototype.slice.call(arguments, 0);
                    for(var i = 0, len = e.before.length; i < len; i++){
                        makeCall(e.before[i].fn, e.before[i].scope, args);
                        if(cancel){
                            return returnValue;
                        }
                    }

                    if((v = e.originalFn.apply(obj, args)) !== undefined){
                        returnValue = v;
                    }

                    for(var i = 0, len = e.after.length; i < len; i++){
                        makeCall(e.after[i].fn, e.after[i].scope, args);
                        if(cancel){
                            return returnValue;
                        }
                    }
                    return returnValue;
                };
            }
            return e;
        },

        // adds an "interceptor" called before the original method
        beforeMethod : function(method, fn, scope){
            var e = this.getMethodEvent(method);
            e.before.push({fn: fn, scope: scope});
        },

        // adds a "sequence" called after the original method
        afterMethod : function(method, fn, scope){
            var e = this.getMethodEvent(method);
            e.after.push({fn: fn, scope: scope});
        },

        removeMethodListener : function(method, fn, scope){
            var e = this.getMethodEvent(method);
            for(var i = 0, len = e.before.length; i < len; i++){
                if(e.before[i].fn == fn && e.before[i].scope == scope){
                    e.before.splice(i, 1);
                    return;
                }
            }
            for(var i = 0, len = e.after.length; i < len; i++){
                if(e.after[i].fn == fn && e.after[i].scope == scope){
                    e.after.splice(i, 1);
                    return;
                }
            }
        }
    };
    HP.Observable.prototype.on = HP.Observable.prototype.addListener;
    HP.Observable.prototype.un = HP.Observable.prototype.removeListener;

    (function(){

        // var createBuffered = function(h, o, scope){
        //     var task = new HP.util.DelayedTask();
        //     return function(){
        //         task.delay(o.buffer, h, scope, Array.prototype.slice.call(arguments, 0));
        //     };
        // };

        var createSingle = function(h, e, fn, scope){
            return function(){
                e.removeListener(fn, scope);
                return h.apply(scope, arguments);
            };
        };

        var createDelayed = function(h, o, scope){
            return function(){
                var args = Array.prototype.slice.call(arguments, 0);
                setTimeout(function(){
                    h.apply(scope, args);
                }, o.delay || 10);
            };
        };

        HP.Event = function(obj, name){
            this.name = name;
            this.obj = obj;
            this.listeners = [];
        };

        HP.Event.prototype = {
            addListener : function(fn, scope, options){
                scope = scope || this.obj;
                if(!this.isListening(fn, scope)){
                    var l = this.createListener(fn, scope, options);
                    if(!this.firing){
                        this.listeners.push(l);
                    }else{ // if we are currently firing this event, don't disturb the listener loop
                        this.listeners = this.listeners.slice(0);
                        this.listeners.push(l);
                    }
                }
            },

            createListener : function(fn, scope, o){
                o = o || {};
                scope = scope || this.obj;
                var l = {fn: fn, scope: scope, options: o};
                var h = fn;
                if(o.delay){
                    h = createDelayed(h, o, scope);
                }
                if(o.single){
                    h = createSingle(h, this, fn, scope);
                }
                // if(o.buffer){
                //     h = createBuffered(h, o, scope);
                // }
                l.fireFn = h;
                return l;
            },

            findListener : function(fn, scope){
                scope = scope || this.obj;
                var ls = this.listeners;
                for(var i = 0, len = ls.length; i < len; i++){
                    var l = ls[i];
                    if(l.fn == fn && l.scope == scope){
                        return i;
                    }
                }
                return -1;
            },

            isListening : function(fn, scope){
                return this.findListener(fn, scope) != -1;
            },

            removeListener : function(fn, scope){
                var index;
                if((index = this.findListener(fn, scope)) != -1){
                    if(!this.firing){
                        this.listeners.splice(index, 1);
                    }else{
                        this.listeners = this.listeners.slice(0);
                        this.listeners.splice(index, 1);
                    }
                    return true;
                }
                return false;
            },

            clearListeners : function(){
                this.listeners = [];
            },

            fire : function(){
                var ls = this.listeners, scope, len = ls.length;
                if(len > 0){
                    this.firing = true;
                    var args = Array.prototype.slice.call(arguments, 0);
                    for(var i = 0; i < len; i++){
                        var l = ls[i];
                        if(l.fireFn.apply(l.scope||this.obj||window, arguments) === false){
                            this.firing = false;
                            return false;
                        }
                    }
                    this.firing = false;
                }
                return true;
            }
        };
    })();

})(jQuery);